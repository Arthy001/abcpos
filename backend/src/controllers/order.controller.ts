import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

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

    // Perform order creation & stock deduction inside a Prisma Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      let calculatedSubtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name} (Available: ${product.stock})`);
        }

        const itemSubtotal = product.price * item.quantity;
        calculatedSubtotal += itemSubtotal;

        // Deduct product stock
        const newStock = product.stock - item.quantity;
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: newStock,
            status: newStock <= 0 ? "OUT_OF_STOCK" : "ACTIVE",
          },
        });

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal: itemSubtotal,
        });
      }

      const total = calculatedSubtotal - Number(discount) + Number(tax);

      const order = await tx.order.create({
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

      return order;
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
