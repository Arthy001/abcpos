import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { recordStockMovement } from "../services/stock.service.js";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, customerId, discount = 0, tax = 0, paymentMethod = "CASH", cashierName = "Admin", notes, giftCardCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item." });
    }

    // Generate unique order number (e.g. dynamic prefix from settings + YYYYMMDD-XXXX)
    const prefixConfig = await prisma.prefixSettings.findFirst();
    const rawPrefix = prefixConfig?.posInvoice || prefixConfig?.salesOrder || "ORD-";
    const cleanPrefix = rawPrefix.replace(/\s+/g, "").replace(/-+$/, "") + "-";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `${cleanPrefix}${dateStr}-${randomSuffix}`;

    // Perform order creation & stock deduction
    let calculatedSubtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name} (Available: ${product.stock})`);
      }

      const itemSubtotal = product.price * item.quantity;
      calculatedSubtotal += itemSubtotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemSubtotal,
      });

      // Deduct ProductStock and record StockMovement (SALE_ISSUE)
      await recordStockMovement({
        productId: product.id,
        productName: product.name,
        warehouseId: product.warehouseId || null,
        quantityDelta: -item.quantity,
        type: "SALE_ISSUE",
        referenceNo: orderNumber,
        unitCost: product.costPrice || null,
        notes: `POS Quick Order ${orderNumber}`,
        createdBy: cashierName || "Admin",
      });
    }

    // Handle Gift Card Validation & Balance Deduction
    let giftCardInfo: any = null;
    const totalOrderAmount = Math.max(0, calculatedSubtotal - Number(discount) + Number(tax));

    if (paymentMethod === "GIFT_CARD" || giftCardCode) {
      const codeToUse = (giftCardCode || "").trim();
      if (!codeToUse) {
        return res.status(400).json({ success: false, message: "Gift card code is required for Gift Card payment." });
      }
      const card = await prisma.giftCard.findUnique({
        where: { code: codeToUse },
      });
      if (!card) {
        return res.status(404).json({ success: false, message: `Gift card '${codeToUse}' not found.` });
      }
      if (card.status !== "Active") {
        return res.status(400).json({ success: false, message: `Gift card '${codeToUse}' is not active (Status: ${card.status}).` });
      }
      const expiry = new Date(card.expiryDate);
      if (!isNaN(expiry.getTime()) && expiry < new Date()) {
        return res.status(400).json({ success: false, message: `Gift card '${codeToUse}' expired on ${card.expiryDate}.` });
      }
      if (card.balance <= 0) {
        return res.status(400).json({ success: false, message: `Gift card '${codeToUse}' has zero balance remaining.` });
      }

      const deduction = Math.min(card.balance, totalOrderAmount);
      const remainingBalance = Math.round((card.balance - deduction) * 100) / 100;

      await prisma.giftCard.update({
        where: { id: card.id },
        data: {
          balance: remainingBalance,
          status: remainingBalance <= 0 ? "Redeemed" : "Active",
        },
      });

      giftCardInfo = {
        code: card.code,
        customerName: card.customerName,
        deducted: deduction,
        remainingBalance,
      };
    }

    let finalNotes = notes || "";
    if (giftCardInfo) {
      const gcNote = `[Gift Card ${giftCardInfo.code} redeemed: ฿${giftCardInfo.deducted.toLocaleString()}, Bal: ฿${giftCardInfo.remainingBalance.toLocaleString()}]`;
      finalNotes = finalNotes ? `${finalNotes} ${gcNote}` : gcNote;
    }

    const activeShift = await prisma.posShift.findFirst({
      where: { status: "OPEN" },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerId || null,
        shiftId: activeShift?.id || null,
        subtotal: calculatedSubtotal,
        discount: Number(discount),
        tax: Number(tax),
        total: totalOrderAmount,
        paymentMethod,
        paymentStatus: "PAID",
        cashierName,
        notes: finalNotes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    res.status(201).json({ success: true, data: order, giftCard: giftCardInfo });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const voidOrder = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { reason, voidedBy = "Admin" } = req.body || {};
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.paymentStatus === "CANCELLED") {
      return res.status(400).json({ success: false, message: "Order is already cancelled/voided" });
    }

    // Restore stock for all items
    for (const item of (order as any).items || []) {
      if (item.productId) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          await recordStockMovement({
            productId: product.id,
            productName: product.name,
            warehouseId: product.warehouseId || null,
            quantityDelta: item.quantity,
            type: "CUSTOMER_RETURN",
            referenceNo: order.orderNumber,
            unitCost: product.costPrice || null,
            notes: `Void POS Order ${order.orderNumber}${reason ? ` (${reason})` : ""}`,
            createdBy: voidedBy || "Admin",
          });
        }
      }
    }

    // If order was paid via Gift Card, restore gift card balance
    if (order.paymentMethod === "GIFT_CARD" && order.notes) {
      const match = order.notes.match(/Gift Card\s+([A-Z0-9-]+)\s+redeemed:\s*฿?([\d,.]+)/i);
      if (match && match[1]) {
        const cardCode = match[1];
        const card = await prisma.giftCard.findUnique({ where: { code: cardCode } });
        if (card) {
          const restoredBalance = Math.min(card.amount, Math.round((card.balance + order.total) * 100) / 100);
          await prisma.giftCard.update({
            where: { id: card.id },
            data: {
              balance: restoredBalance,
              status: "Active",
            },
          });
        }
      }
    }

    const updatedNotes = order.notes
      ? `${order.notes} [VOIDED: ${reason || "Cancelled by cashier"} by ${voidedBy} on ${new Date().toLocaleString()}]`
      : `[VOIDED: ${reason || "Cancelled by cashier"} by ${voidedBy} on ${new Date().toLocaleString()}]`;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: "CANCELLED",
        notes: updatedNotes,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    res.json({
      success: true,
      data: updatedOrder,
      message: `Order ${order.orderNumber} successfully voided and inventory restored.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

