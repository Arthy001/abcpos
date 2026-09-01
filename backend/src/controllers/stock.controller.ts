import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { recordStockMovement, executeStockTransfer, StockMovementType } from "../services/stock.service.js";

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
      status = "COMPLETED",
      notes,
    } = req.body;

    if (!fromWarehouse || !toWarehouse) {
      return res.status(400).json({ error: "From Warehouse and To Warehouse are required" });
    }

    const ref = refNumber || `#TR-${Math.floor(100000 + Math.random() * 900000)}`;
    const qty = Number(quantityTransferred) || 1;

    const transfer = await prisma.stockTransfer.create({
      data: {
        fromWarehouse,
        toWarehouse,
        noOfProducts: Number(noOfProducts) || 1,
        quantityTransferred: qty,
        refNumber: ref,
        date: date ? new Date(date) : new Date(),
        status,
        notes: notes || null,
      },
    });

    // Execute Multi-Warehouse Stock Transfer & Ledger
    if (status === "COMPLETED") {
      const sampleProduct = await prisma.product.findFirst({
        where: { warehouse: { name: fromWarehouse } },
      }) || await prisma.product.findFirst();

      await executeStockTransfer({
        productId: sampleProduct?.id,
        productName: sampleProduct?.name,
        fromWarehouseName: fromWarehouse,
        toWarehouseName: toWarehouse,
        quantity: qty,
        referenceNo: ref,
        notes,
      });
    }

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

// ==================== STOCK ADJUSTMENTS & GOODS ISSUE ====================
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
        personName: personName || "Admin",
        personAvatar: personAvatar || "/assets/images/avatar-01.jpg",
        qty: adjustmentQty,
        type: adjustmentType,
        notes: notes || null,
      },
    });

    // Record in ProductStock and StockMovement Ledger
    const movementType: StockMovementType = adjustmentType === "ADDITION" ? "ADJUSTMENT_PLUS" : "ADJUSTMENT_MINUS";
    const delta = adjustmentType === "ADDITION" ? adjustmentQty : -adjustmentQty;

    await recordStockMovement({
      productName,
      warehouseName: warehouse,
      quantityDelta: delta,
      type: movementType,
      referenceNo: `ADJ-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: notes || `Stock Adjustment (${adjustmentType})`,
      createdBy: personName || "Admin",
    });

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

    // Reconcile ProductStock delta
    const targetProdName = productName || existing.productName;
    const targetWarehouse = warehouse || existing.warehouse;
    const oldNet = oldType === "ADDITION" ? oldQty : -oldQty;
    const newNet = newType === "ADDITION" ? newQty : -newQty;
    const delta = newNet - oldNet;

    if (delta !== 0) {
      await recordStockMovement({
        productName: targetProdName,
        warehouseName: targetWarehouse,
        quantityDelta: delta,
        type: delta > 0 ? "ADJUSTMENT_PLUS" : "ADJUSTMENT_MINUS",
        notes: `Adjustment updated from ${oldQty} to ${newQty}`,
        createdBy: personName || "Admin",
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
      // Revert product stock movement
      const revertDelta = existing.type === "ADDITION" ? -existing.qty : existing.qty;
      await recordStockMovement({
        productName: existing.productName,
        warehouseName: existing.warehouse,
        quantityDelta: revertDelta,
        type: existing.type === "ADDITION" ? "ADJUSTMENT_MINUS" : "ADJUSTMENT_PLUS",
        notes: `Reverting deleted adjustment ${existing.id}`,
      });

      await prisma.stockAdjustment.delete({ where: { id } });
    }

    res.json({ success: true, message: "Stock adjustment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete stock adjustment" });
  }
};

// ==================== STOCK MOVEMENTS (STOCK CARD AUDIT TRAIL) ====================
export const getStockMovements = async (req: Request, res: Response) => {
  try {
    const { productId, warehouseId, type, search } = req.query;

    const where: any = {};
    if (productId && productId !== "all") {
      where.productId = String(productId);
    }
    if (warehouseId && warehouseId !== "all") {
      where.warehouseId = String(warehouseId);
    }
    if (type && type !== "all") {
      where.type = String(type);
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { referenceNo: { contains: q } },
        { notes: { contains: q } },
        { department: { contains: q } },
        { product: { name: { contains: q } } },
        { warehouse: { name: { contains: q } } },
      ];
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100, // safety limit
    });

    res.json(movements);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stock movements" });
  }
};
