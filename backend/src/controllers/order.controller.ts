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
    const { items, customerId, discount = 0, tax = 0, paymentMethod = "CASH", cashierName = "Admin", notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item." });
    }

    // Generate unique order number (e.g. ORD-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

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

    const total = calculatedSubtotal - Number(discount) + Number(tax);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customerId || null,
        subtotal: calculatedSubtotal,
        discount: Number(discount),
        tax: Number(tax),
        total: Math.max(0, total),
        paymentMethod,
        paymentStatus: "PAID",
        cashierName,
        notes,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
