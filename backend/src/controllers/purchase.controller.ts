import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { recordStockMovement } from "../services/stock.service.js";

// ==================== PURCHASES ====================
export const getPurchases = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus, supplierName, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = String(paymentStatus).toUpperCase();
    }
    if (supplierName && supplierName !== "all") {
      where.supplierName = String(supplierName);
    }
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { supplierName: { contains: String(search) } },
        { warehouseName: { contains: String(search) } },
        { storeName: { contains: String(search) } },
        { notes: { contains: String(search) } },
      ];
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch purchases" });
  }
};

export const getPurchaseById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    res.json(purchase);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch purchase details" });
  }
};

export const createPurchase = async (req: Request, res: Response) => {
  try {
    const {
      reference,
      supplierId,
      supplierName,
      supplierImage,
      warehouseName,
      storeName,
      date,
      status = "RECEIVED",
      paymentStatus = "PAID",
      subtotal = 0,
      tax = 0,
      discount = 0,
      shipping = 0,
      total = 0,
      paid = 0,
      due = 0,
      notes,
      items = [],
    } = req.body;

    if (!supplierName) {
      return res.status(400).json({ error: "Supplier Name is required" });
    }

    const refNo = reference || `PT${Math.floor(100 + Math.random() * 900)}`;
    const normalizedStatus = String(status).toUpperCase();
    const normalizedPaymentStatus = String(paymentStatus).toUpperCase();

    // Create Purchase and nested items
    const purchase = await prisma.purchase.create({
      data: {
        reference: refNo,
        supplierId: supplierId || null,
        supplierName,
        supplierImage: supplierImage || null,
        warehouseName: warehouseName || "Lavish Warehouse",
        storeName: storeName || "Electro Mart",
        date: date ? new Date(date) : new Date(),
        status: normalizedStatus,
        paymentStatus: normalizedPaymentStatus,
        subtotal: Number(subtotal) || 0,
        tax: Number(tax) || 0,
        discount: Number(discount) || 0,
        shipping: Number(shipping) || 0,
        total: Number(total) || 0,
        paid: Number(paid) || 0,
        due: Number(due) || 0,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            productName: item.productName || "Product Item",
            productImage: item.productImage || "/assets/images/product-01.jpg",
            sku: item.sku || "SKU001",
            quantity: Number(item.quantity) || 1,
            receivedQty: Number(item.receivedQty || item.quantity) || 1,
            unitCost: Number(item.unitCost) || 0,
            subtotal: Number(item.subtotal) || 0,
            tax: Number(item.tax) || 0,
            discount: Number(item.discount) || 0,
            total: Number(item.total) || 0,
          })),
        },
      },
      include: { items: true },
    });

    // If status is RECEIVED, add stock to products
    // Auto Stock Ingest when PO status is RECEIVED
    if (normalizedStatus === "RECEIVED" && items.length > 0) {
      for (const item of items) {
        await recordStockMovement({
          productId: item.productId,
          productName: item.productName,
          warehouseName: warehouseName || "Lavish Warehouse",
          quantityDelta: Number(item.quantity) || 0,
          type: "PURCHASE_RECEIPT",
          referenceNo: refNo,
          unitCost: item.unitCost ? Number(item.unitCost) : null,
          notes: `Purchase Receipt from ${supplierName}`,
        });
      }
    }

    res.status(201).json(purchase);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create purchase" });
  }
};

export const updatePurchase = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      reference,
      supplierId,
      supplierName,
      supplierImage,
      warehouseName,
      storeName,
      date,
      status,
      paymentStatus,
      subtotal,
      tax,
      discount,
      shipping,
      total,
      paid,
      due,
      notes,
    } = req.body;

    const existing = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const oldStatus = existing.status;
    const newStatus = status ? String(status).toUpperCase() : oldStatus;

    const purchase = await prisma.purchase.update({
      where: { id },
      data: {
        reference: reference !== undefined ? reference : existing.reference,
        supplierId: supplierId !== undefined ? supplierId : existing.supplierId,
        supplierName: supplierName !== undefined ? supplierName : existing.supplierName,
        supplierImage: supplierImage !== undefined ? supplierImage : existing.supplierImage,
        warehouseName: warehouseName !== undefined ? warehouseName : existing.warehouseName,
        storeName: storeName !== undefined ? storeName : existing.storeName,
        date: date ? new Date(date) : existing.date,
        status: newStatus,
        paymentStatus: paymentStatus ? String(paymentStatus).toUpperCase() : existing.paymentStatus,
        subtotal: subtotal !== undefined ? Number(subtotal) : existing.subtotal,
        tax: tax !== undefined ? Number(tax) : existing.tax,
        discount: discount !== undefined ? Number(discount) : existing.discount,
        shipping: shipping !== undefined ? Number(shipping) : existing.shipping,
        total: total !== undefined ? Number(total) : existing.total,
        paid: paid !== undefined ? Number(paid) : existing.paid,
        due: due !== undefined ? Number(due) : existing.due,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: { items: true },
    });

    // Check status transition for Stock Sync
    if (oldStatus !== "RECEIVED" && newStatus === "RECEIVED") {
      // Add stock
      for (const item of existing.items) {
        await recordStockMovement({
          productId: item.productId,
          productName: item.productName,
          warehouseName: warehouseName || existing.warehouseName || "Lavish Warehouse",
          quantityDelta: item.quantity,
          type: "PURCHASE_RECEIPT",
          referenceNo: existing.reference,
          unitCost: item.unitCost,
          notes: `Purchase updated to RECEIVED`,
        });
      }
    } else if (oldStatus === "RECEIVED" && (newStatus === "CANCELLED" || newStatus === "PENDING")) {
      // Revert stock
      for (const item of existing.items) {
        await recordStockMovement({
          productId: item.productId,
          productName: item.productName,
          warehouseName: warehouseName || existing.warehouseName || "Lavish Warehouse",
          quantityDelta: -item.quantity,
          type: "SUPPLIER_RETURN",
          referenceNo: existing.reference,
          notes: `Purchase status changed from RECEIVED to ${newStatus}`,
        });
      }
    }

    res.json(purchase);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update purchase" });
  }
};

export const deletePurchase = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });

    if (existing) {
      // Revert stock if it was received
      if (existing.status === "RECEIVED") {
        for (const item of existing.items) {
          const prod = await prisma.product.findFirst({
            where: { OR: [{ id: item.productId || "" }, { sku: item.sku || "" }, { name: item.productName }] },
          });
          if (prod) {
            const revStock = Math.max(0, prod.stock - item.quantity);
            await prisma.product.update({
              where: { id: prod.id },
              data: {
                stock: revStock,
                status: revStock === 0 ? "OUT_OF_STOCK" : prod.status,
              },
            });
          }
        }
      }

      await prisma.purchase.delete({ where: { id } });
    }

    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete purchase" });
  }
};

// ==================== PURCHASE ORDERS (ITEM BREAKDOWN) ====================
export const getPurchaseOrders = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { productName: { contains: String(search) } },
        { sku: { contains: String(search) } },
      ];
    }

    const items = await prisma.purchaseItem.findMany({
      where,
      include: { purchase: true },
      orderBy: { createdAt: "desc" },
    });

    // Also enrich with live product in-stock count
    const enriched = await Promise.all(
      items.map(async (item) => {
        let instockQty = 20;
        if (item.productId) {
          const p = await prisma.product.findUnique({ where: { id: item.productId } });
          if (p) instockQty = p.stock;
        } else if (item.productName) {
          const p = await prisma.product.findFirst({ where: { name: item.productName } });
          if (p) instockQty = p.stock;
        }

        return {
          id: item.id,
          product: item.productName,
          productImage: item.productImage || "/assets/images/product-01.jpg",
          purchasedAmount: `$${item.total.toFixed(2)}`,
          purchasedQty: item.quantity,
          instockQty,
          sku: item.sku || "N/A",
          supplier: item.purchase?.supplierName || "N/A",
          date: item.purchase?.date || item.createdAt,
          status: item.purchase?.status || "RECEIVED",
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch purchase orders" });
  }
};

// ==================== PURCHASE RETURNS ====================
export const getPurchaseReturns = async (req: Request, res: Response) => {
  try {
    const { status, paymentStatus, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = String(paymentStatus).toUpperCase();
    }
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { supplierName: { contains: String(search) } },
        { productName: { contains: String(search) } },
        { notes: { contains: String(search) } },
      ];
    }

    const returns = await prisma.purchaseReturn.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(returns);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch purchase returns" });
  }
};

export const getPurchaseReturnById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const returnItem = await prisma.purchaseReturn.findUnique({ where: { id } });
    if (!returnItem) return res.status(404).json({ error: "Purchase return not found" });
    res.json(returnItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch purchase return" });
  }
};

export const createPurchaseReturn = async (req: Request, res: Response) => {
  try {
    const {
      reference,
      purchaseReference,
      supplierName,
      supplierImage,
      warehouseName,
      productName,
      productImage,
      quantity = 1,
      date,
      status = "COMPLETED",
      totalAmount = 0,
      paidAmount = 0,
      dueAmount = 0,
      paymentStatus = "PAID",
      notes,
    } = req.body;

    if (!supplierName) {
      return res.status(400).json({ error: "Supplier Name is required" });
    }

    const refNo = reference || `PR${Math.floor(100 + Math.random() * 900)}`;

    const returnItem = await prisma.purchaseReturn.create({
      data: {
        reference: refNo,
        purchaseReference: purchaseReference || null,
        supplierName,
        supplierImage: supplierImage || null,
        warehouseName: warehouseName || "Lavish Warehouse",
        productName: productName || null,
        productImage: productImage || null,
        quantity: Number(quantity) || 1,
        date: date ? new Date(date) : new Date(),
        status: String(status).toUpperCase(),
        totalAmount: Number(totalAmount) || 0,
        paidAmount: Number(paidAmount) || 0,
        dueAmount: Number(dueAmount) || 0,
        paymentStatus: String(paymentStatus).toUpperCase(),
        notes: notes || null,
      },
    });

    // Deduct stock if status is COMPLETED
    if (String(status).toUpperCase() === "COMPLETED" && productName) {
      await recordStockMovement({
        productName,
        warehouseName: warehouseName || "Lavish Warehouse",
        quantityDelta: -(Number(quantity) || 1),
        type: "SUPPLIER_RETURN",
        referenceNo: refNo,
        notes: notes || `Purchase Return to ${supplierName}`,
      });
    }

    res.status(201).json(returnItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create purchase return" });
  }
};

export const updatePurchaseReturn = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      reference,
      purchaseReference,
      supplierName,
      supplierImage,
      warehouseName,
      productName,
      productImage,
      quantity,
      date,
      status,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      notes,
    } = req.body;

    const existing = await prisma.purchaseReturn.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Purchase return not found" });

    const returnItem = await prisma.purchaseReturn.update({
      where: { id },
      data: {
        reference: reference !== undefined ? reference : existing.reference,
        purchaseReference: purchaseReference !== undefined ? purchaseReference : existing.purchaseReference,
        supplierName: supplierName !== undefined ? supplierName : existing.supplierName,
        supplierImage: supplierImage !== undefined ? supplierImage : existing.supplierImage,
        warehouseName: warehouseName !== undefined ? warehouseName : existing.warehouseName,
        productName: productName !== undefined ? productName : existing.productName,
        productImage: productImage !== undefined ? productImage : existing.productImage,
        quantity: quantity !== undefined ? Number(quantity) : existing.quantity,
        date: date ? new Date(date) : existing.date,
        status: status !== undefined ? String(status).toUpperCase() : existing.status,
        totalAmount: totalAmount !== undefined ? Number(totalAmount) : existing.totalAmount,
        paidAmount: paidAmount !== undefined ? Number(paidAmount) : existing.paidAmount,
        dueAmount: dueAmount !== undefined ? Number(dueAmount) : existing.dueAmount,
        paymentStatus: paymentStatus !== undefined ? String(paymentStatus).toUpperCase() : existing.paymentStatus,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    res.json(returnItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update purchase return" });
  }
};

export const deletePurchaseReturn = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.purchaseReturn.delete({ where: { id } });
    res.json({ success: true, message: "Purchase return deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete purchase return" });
  }
};