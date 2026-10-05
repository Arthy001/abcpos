import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/pos-shifts/current
export const getCurrentShift = async (req: Request, res: Response) => {
  try {
    const shift = await prisma.posShift.findFirst({
      where: { status: "OPEN" },
      include: {
        movements: {
          orderBy: { createdTime: "desc" },
        },
      },
      orderBy: { openedAt: "desc" },
    });

    if (!shift) {
      return res.json({
        success: true,
        hasActiveShift: false,
        shift: null,
      });
    }

    // Calculate real-time order statistics since shift was opened
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: { not: "CANCELLED" },
        createdAt: { gte: shift.openedAt },
      },
    });

    let totalCashSales = 0;
    let totalPromptPaySales = 0;
    let totalCardSales = 0;

    for (const o of orders) {
      if (o.paymentMethod === "CASH") totalCashSales += o.total;
      else if (o.paymentMethod === "PROMPTPAY") totalPromptPaySales += o.total;
      else if (o.paymentMethod === "CREDIT_CARD") totalCardSales += o.total;
    }

    const totalSales = totalCashSales + totalPromptPaySales + totalCardSales;
    const orderCount = orders.length;

    const cashIn = shift.movements
      .filter((m) => m.type === "PAY_IN")
      .reduce((sum, m) => sum + m.amount, 0);

    const cashOut = shift.movements
      .filter((m) => m.type === "PAY_OUT")
      .reduce((sum, m) => sum + m.amount, 0);

    const expectedCash = shift.openingFloat + totalCashSales + cashIn - cashOut;

    res.json({
      success: true,
      hasActiveShift: true,
      shift,
      liveMetrics: {
        orderCount,
        totalCashSales: Math.round(totalCashSales * 100) / 100,
        totalPromptPaySales: Math.round(totalPromptPaySales * 100) / 100,
        totalCardSales: Math.round(totalCardSales * 100) / 100,
        totalSales: Math.round(totalSales * 100) / 100,
        cashIn: Math.round(cashIn * 100) / 100,
        cashOut: Math.round(cashOut * 100) / 100,
        expectedCash: Math.round(expectedCash * 100) / 100,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/pos-shifts/open
export const openShift = async (req: Request, res: Response) => {
  try {
    const { cashierName = "Admin", openingFloat = 0, storeName = "Electro Mart", notes } = req.body;

    // Check if an open shift already exists
    const existing = await prisma.posShift.findFirst({
      where: { status: "OPEN" },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An active shift (${existing.shiftNumber}) is already opened by ${existing.cashierName}. Please close it first.`,
      });
    }

    const prefixConfig = await prisma.prefixSettings.findFirst();
    const rawShiftPrefix = prefixConfig?.shift || "SFT-";
    const cleanShiftPrefix = rawShiftPrefix.replace(/\s+/g, "").replace(/-+$/, "") + "-";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const shiftNumber = `${cleanShiftPrefix}${dateStr}-${randomSuffix}`;

    const newShift = await prisma.posShift.create({
      data: {
        shiftNumber,
        cashierName,
        storeName,
        openingFloat: Number(openingFloat) || 0,
        status: "OPEN",
        openedAt: new Date(),
        notes,
      },
      include: {
        movements: true,
      },
    });

    res.status(201).json({
      success: true,
      data: newShift,
      message: `Shift #${newShift.shiftNumber} successfully opened with opening cash ฿${newShift.openingFloat.toLocaleString()}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/pos-shifts/movement (Pay In / Pay Out)
export const recordShiftMovement = async (req: Request, res: Response) => {
  try {
    const { shiftId, type, amount, reason } = req.body;

    if (!shiftId || !type || !amount) {
      return res.status(400).json({ success: false, message: "shiftId, type (PAY_IN/PAY_OUT), and amount are required." });
    }

    const shift = await prisma.posShift.findUnique({ where: { id: shiftId } });
    if (!shift || shift.status !== "OPEN") {
      return res.status(400).json({ success: false, message: "Shift not found or already closed." });
    }

    const movement = await prisma.posShiftMovement.create({
      data: {
        shiftId,
        type: String(type).toUpperCase(),
        amount: Number(amount),
        reason: reason || null,
      },
    });

    // Update shift cashIn or cashOut
    if (movement.type === "PAY_IN") {
      await prisma.posShift.update({
        where: { id: shiftId },
        data: { cashIn: { increment: movement.amount } },
      });
    } else {
      await prisma.posShift.update({
        where: { id: shiftId },
        data: { cashOut: { increment: movement.amount } },
      });
    }

    res.status(201).json({ success: true, data: movement });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/pos-shifts/close
export const closeShift = async (req: Request, res: Response) => {
  try {
    const { shiftId, closingCashCounted, notes } = req.body;

    if (!shiftId) {
      return res.status(400).json({ success: false, message: "shiftId is required." });
    }

    const shift = await prisma.posShift.findUnique({
      where: { id: shiftId },
      include: { movements: true },
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found." });
    }

    if (shift.status === "CLOSED") {
      return res.status(400).json({ success: false, message: "Shift is already closed." });
    }

    const closedAt = new Date();

    // Query all orders placed during this shift window
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: { not: "CANCELLED" },
        createdAt: { gte: shift.openedAt, lte: closedAt },
      },
    });

    let totalCashSales = 0;
    let totalPromptPaySales = 0;
    let totalCardSales = 0;

    for (const o of orders) {
      if (o.paymentMethod === "CASH") totalCashSales += o.total;
      else if (o.paymentMethod === "PROMPTPAY") totalPromptPaySales += o.total;
      else if (o.paymentMethod === "CREDIT_CARD") totalCardSales += o.total;
    }

    const totalSales = totalCashSales + totalPromptPaySales + totalCardSales;
    const orderCount = orders.length;

    const cashIn = shift.movements
      .filter((m) => m.type === "PAY_IN")
      .reduce((sum, m) => sum + m.amount, 0);

    const cashOut = shift.movements
      .filter((m) => m.type === "PAY_OUT")
      .reduce((sum, m) => sum + m.amount, 0);

    const expectedCash = shift.openingFloat + totalCashSales + cashIn - cashOut;
    const countedCash = Number(closingCashCounted || 0);
    const cashVariance = Math.round((countedCash - expectedCash) * 100) / 100;

    // Link orders to this shift
    await prisma.order.updateMany({
      where: {
        createdAt: { gte: shift.openedAt, lte: closedAt },
      },
      data: {
        shiftId: shift.id,
      },
    });

    // Update shift to CLOSED
    const closedShift = await prisma.posShift.update({
      where: { id: shiftId },
      data: {
        status: "CLOSED",
        closedAt,
        closingCashCounted: countedCash,
        expectedCash: Math.round(expectedCash * 100) / 100,
        cashVariance,
        totalCashSales: Math.round(totalCashSales * 100) / 100,
        totalPromptPaySales: Math.round(totalPromptPaySales * 100) / 100,
        totalCardSales: Math.round(totalCardSales * 100) / 100,
        totalSales: Math.round(totalSales * 100) / 100,
        orderCount,
        notes: notes || shift.notes,
      },
      include: {
        movements: true,
      },
    });

    res.json({
      success: true,
      data: closedShift,
      message: `Shift #${closedShift.shiftNumber} successfully closed. Variance: ฿${cashVariance >= 0 ? "+" : ""}${cashVariance.toLocaleString()}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/pos-shifts
export const getShiftsHistory = async (req: Request, res: Response) => {
  try {
    const { status, cashierName, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (cashierName && cashierName !== "all") {
      where.cashierName = String(cashierName);
    }
    if (search) {
      where.OR = [
        { shiftNumber: { contains: String(search) } },
        { cashierName: { contains: String(search) } },
        { notes: { contains: String(search) } },
      ];
    }

    const shifts = await prisma.posShift.findMany({
      where,
      include: {
        movements: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { openedAt: "desc" },
      take: 50,
    });

    res.json({ success: true, data: shifts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/pos-shifts/:id
export const getShiftById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const shift = await prisma.posShift.findUnique({
      where: { id },
      include: {
        movements: {
          orderBy: { createdTime: "desc" },
        },
        orders: {
          include: {
            items: true,
            customer: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!shift) {
      return res.status(404).json({ success: false, message: "Shift not found" });
    }

    res.json({ success: true, data: shift });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
