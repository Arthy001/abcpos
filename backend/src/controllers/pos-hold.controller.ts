import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/pos/hold-orders (List active held orders)
export const getHeldOrders = async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.query;

    const whereClause: any = {
      status: "HELD",
    };

    if (shiftId && typeof shiftId === "string") {
      whereClause.shiftId = shiftId;
    }

    const heldOrders = await prisma.posHeldOrder.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    // Parse cartData back to JSON for the frontend
    const parsedOrders = heldOrders.map((order) => {
      let items = [];
      try {
        items = JSON.parse(order.cartData);
      } catch (e) {
        items = [];
      }

      return {
        id: order.id,
        orderRef: order.orderRef,
        shiftId: order.shiftId,
        cashierName: order.cashierName,
        customerId: order.customerId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        items,
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        couponCode: order.couponCode,
        notes: order.notes,
        status: order.status,
        timestamp: order.createdAt.toISOString(),
      };
    });

    return res.json({
      success: true,
      data: parsedOrders,
      count: parsedOrders.length,
    });
  } catch (error: any) {
    console.error("Error fetching held orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch held orders",
      error: error.message,
    });
  }
};

// POST /api/pos/hold-orders (Create new held order)
export const createHeldOrder = async (req: Request, res: Response) => {
  try {
    const {
      shiftId,
      cashierName,
      customerId,
      customerName,
      customerPhone,
      items,
      subtotal,
      tax,
      discount,
      shipping,
      total,
      couponCode,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot hold an empty cart",
      });
    }

    // Auto-generate reference code e.g. #HLD-1031-1234
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const orderRef = `#HLD-${dateStr}-${randomSuffix}`;

    const heldOrder = await prisma.posHeldOrder.create({
      data: {
        orderRef,
        shiftId: shiftId || null,
        cashierName: cashierName || "Admin",
        customerId: customerId || null,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        cartData: JSON.stringify(items),
        subtotal: Number(subtotal) || 0,
        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
        shipping: Number(shipping) || 0,
        total: Number(total) || 0,
        couponCode: couponCode || null,
        notes: notes || null,
        status: "HELD",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order held successfully",
      data: {
        id: heldOrder.id,
        orderRef: heldOrder.orderRef,
        timestamp: heldOrder.createdAt.toISOString(),
        items,
        subtotal: heldOrder.subtotal,
        tax: heldOrder.tax,
        discount: heldOrder.discount,
        shipping: heldOrder.shipping,
        total: heldOrder.total,
        customerName: heldOrder.customerName,
      },
    });
  } catch (error: any) {
    console.error("Error creating held order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to hold order",
      error: error.message,
    });
  }
};

// PUT /api/pos/hold-orders/:id/resume (Resume a held order)
export const resumeHeldOrder = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);

    const existing = await prisma.posHeldOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Held order not found",
      });
    }

    // Mark as RESUMED
    const updated = await prisma.posHeldOrder.update({
      where: { id },
      data: {
        status: "RESUMED",
      },
    });

    let items = [];
    try {
      items = JSON.parse(updated.cartData);
    } catch (e) {
      items = [];
    }

    return res.json({
      success: true,
      message: "Held order resumed",
      data: {
        id: updated.id,
        orderRef: updated.orderRef,
        items,
        subtotal: updated.subtotal,
        tax: updated.tax,
        discount: updated.discount,
        shipping: updated.shipping,
        total: updated.total,
        customerId: updated.customerId,
        customerName: updated.customerName,
        customerPhone: updated.customerPhone,
        couponCode: updated.couponCode,
        notes: updated.notes,
        status: updated.status,
      },
    });
  } catch (error: any) {
    console.error("Error resuming held order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resume held order",
      error: error.message,
    });
  }
};

// DELETE /api/pos/hold-orders/:id (Cancel / Delete held order)
export const deleteHeldOrder = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);

    const existing = await prisma.posHeldOrder.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Held order not found",
      });
    }

    await prisma.posHeldOrder.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Held order discarded successfully",
    });
  } catch (error: any) {
    console.error("Error deleting held order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete held order",
      error: error.message,
    });
  }
};
