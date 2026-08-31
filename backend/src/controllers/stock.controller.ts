import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// ==================== STOCK TRANSFERS ====================
export const getStockTransfers = async (req: Request, res: Response) => {
  try {
    const { fromWarehouse, toWarehouse, status, search } = req.query;

    const where: any = {};
    if (fromWarehouse && fromWarehouse !== "all") {
      where.fromWarehouse = String(fromWarehouse);
    }
    if (toWarehouse && toWarehouse !== "all") {
      where.toWarehouse = String(toWarehouse);
    }
    if (status && status !== "all") {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { refNumber: { contains: String(search) } },
        { fromWarehouse: { contains: String(search) } },
        { toWarehouse: { contains: String(search) } },
        { notes: { contains: String(search) } },
      ];
    }

    const transfers = await prisma.stockTransfer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(transfers);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stock transfers" });
  }
};

export const getStockTransferById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      return res.status(404).json({ error: "Stock transfer not found" });
    }

    res.json(transfer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stock transfer details" });
  }
};

export const createStockTransfer = async (req: Request, res: Response) => {
  try {
    const {
      fromWarehouse,
      toWarehouse,
      noOfProducts,
      quantityTransferred,
      refNumber,
      date,
      status,
      notes,
    } = req.body;

    if (!fromWarehouse || !toWarehouse) {
      return res.status(400).json({ error: "From Warehouse and To Warehouse are required" });
    }

    const transfer = await prisma.stockTransfer.create({
      data: {
        fromWarehouse,
        toWarehouse,
        noOfProducts: Number(noOfProducts) || 1,
        quantityTransferred: Number(quantityTransferred) || 1,
        refNumber: refNumber || `#TR-${Math.floor(100000 + Math.random() * 900000)}`,
        date: date ? new Date(date) : new Date(),
        status: status || "COMPLETED",
        notes: notes || null,
      },
    });

    res.status(201).json(transfer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create stock transfer" });
  }
};

export const updateStockTransfer = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      fromWarehouse,
      toWarehouse,
      noOfProducts,
      quantityTransferred,
      refNumber,
      date,
      status,
      notes,
    } = req.body;

    const existing = await prisma.stockTransfer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Stock transfer not found" });
    }

    const transfer = await prisma.stockTransfer.update({
      where: { id },
      data: {
        fromWarehouse: fromWarehouse !== undefined ? fromWarehouse : existing.fromWarehouse,
        toWarehouse: toWarehouse !== undefined ? toWarehouse : existing.toWarehouse,
        noOfProducts: noOfProducts !== undefined ? Number(noOfProducts) : existing.noOfProducts,
        quantityTransferred: quantityTransferred !== undefined ? Number(quantityTransferred) : existing.quantityTransferred,
        refNumber: refNumber !== undefined ? refNumber : existing.refNumber,
        date: date ? new Date(date) : existing.date,
        status: status !== undefined ? status : existing.status,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    res.json(transfer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update stock transfer" });
  }
};

export const deleteStockTransfer = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.stockTransfer.delete({ where: { id } });
    res.json({ success: true, message: "Stock transfer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete stock transfer" });
  }
};

// ==================== STOCK ADJUSTMENTS ====================
export const getStockAdjustments = async (req: Request, res: Response) => {
  try {
    const { warehouse, store, type, search } = req.query;

    const where: any = {};
    if (warehouse && warehouse !== "all") {
      where.warehouse = String(warehouse);
    }
    if (store && store !== "all") {
      where.store = String(store);
    }
    if (type && type !== "all") {
      where.type = String(type);
    }
    if (search) {
      where.OR = [
        { productName: { contains: String(search) } },
        { warehouse: { contains: String(search) } },
        { store: { contains: String(search) } },
        { personName: { contains: String(search) } },
        { notes: { contains: String(search) } },
      ];
    }

    const adjustments = await prisma.stockAdjustment.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(adjustments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stock adjustments" });
  }
};

export const getStockAdjustmentById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const adjustment = await prisma.stockAdjustment.findUnique({
      where: { id },
    });

    if (!adjustment) {
      return res.status(404).json({ error: "Stock adjustment not found" });
    }

    res.json(adjustment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stock adjustment details" });
  }
};

export const createStockAdjustment = async (req: Request, res: Response) => {
  try {
    const {
      warehouse,
      store,
      productName,
      productImage,
      date,
      personName,
      personAvatar,
      qty,
      type,
      notes,
    } = req.body;

    if (!warehouse || !store || !productName) {
      return res.status(400).json({ error: "Warehouse, Store, and Product Name are required" });
    }

    const adjustmentQty = Number(qty) || 0;
    const adjustmentType = type === "SUBTRACTION" ? "SUBTRACTION" : "ADDITION";

    // Create adjustment record
    const adjustment = await prisma.stockAdjustment.create({
      data: {
        warehouse,
        store,
        productName,
        productImage: productImage || null,
        date: date ? new Date(date) : new Date(),
        personName: personName || "James Kirwin",
        personAvatar: personAvatar || "/assets/images/customer11.jpg",
        qty: adjustmentQty,
        type: adjustmentType,
        notes: notes || null,
      },
    });

    // Sync with Product stock in database if found
    const matchingProduct = await prisma.product.findFirst({
      where: { name: { equals: productName } },
    });

    if (matchingProduct) {
      const stockChange = adjustmentType === "ADDITION" ? adjustmentQty : -adjustmentQty;
      const newStock = Math.max(0, matchingProduct.stock + stockChange);
      await prisma.product.update({
        where: { id: matchingProduct.id },
        data: {
          stock: newStock,
          status: newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE",
        },
      });
    }

    res.status(201).json(adjustment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create stock adjustment" });
  }
};

export const updateStockAdjustment = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      warehouse,
      store,
      productName,
      productImage,
      date,
      personName,
      personAvatar,
      qty,
      type,
      notes,
    } = req.body;

    const existing = await prisma.stockAdjustment.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Stock adjustment not found" });
    }

    const oldQty = existing.qty;
    const oldType = existing.type;
    const newQty = qty !== undefined ? Number(qty) : oldQty;
    const newType = type !== undefined ? type : oldType;

    const adjustment = await prisma.stockAdjustment.update({
      where: { id },
      data: {
        warehouse: warehouse !== undefined ? warehouse : existing.warehouse,
        store: store !== undefined ? store : existing.store,
        productName: productName !== undefined ? productName : existing.productName,
        productImage: productImage !== undefined ? productImage : existing.productImage,
        date: date ? new Date(date) : existing.date,
        personName: personName !== undefined ? personName : existing.personName,
        personAvatar: personAvatar !== undefined ? personAvatar : existing.personAvatar,
        qty: newQty,
        type: newType,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    // Reconcile Product stock delta if applicable
    const targetProdName = productName || existing.productName;
    const matchingProduct = await prisma.product.findFirst({
      where: { name: { equals: targetProdName } },
    });

    if (matchingProduct) {
      const oldNet = oldType === "ADDITION" ? oldQty : -oldQty;
      const newNet = newType === "ADDITION" ? newQty : -newQty;
      const delta = newNet - oldNet;
      const newStock = Math.max(0, matchingProduct.stock + delta);
      await prisma.product.update({
        where: { id: matchingProduct.id },
        data: {
          stock: newStock,
          status: newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE",
        },
      });
    }

    res.json(adjustment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update stock adjustment" });
  }
};

export const deleteStockAdjustment = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.stockAdjustment.findUnique({ where: { id } });

    if (existing) {
      // Revert product stock
      const matchingProduct = await prisma.product.findFirst({
        where: { name: { equals: existing.productName } },
      });

      if (matchingProduct) {
        const revertDelta = existing.type === "ADDITION" ? -existing.qty : existing.qty;
        const revertedStock = Math.max(0, matchingProduct.stock + revertDelta);
        await prisma.product.update({
          where: { id: matchingProduct.id },
          data: {
            stock: revertedStock,
            status: revertedStock === 0 ? "OUT_OF_STOCK" : "ACTIVE",
          },
        });
      }

      await prisma.stockAdjustment.delete({ where: { id } });
    }

    res.json({ success: true, message: "Stock adjustment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete stock adjustment" });
  }
};
