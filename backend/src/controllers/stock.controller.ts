import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// ==================== STOCK TRANSFERS ====================
export const getStockTransfers = async (req: Request, res: Response) => {
  try {
    const { fromWarehouse, toWarehouse, search } = req.query;

    const where: any = {};
    if (fromWarehouse && fromWarehouse !== "all") {
      where.fromWarehouse = String(fromWarehouse);
    }
    if (toWarehouse && toWarehouse !== "all") {
      where.toWarehouse = String(toWarehouse);
    }
    if (search) {
      where.OR = [
        { refNumber: { contains: String(search) } },
        { fromWarehouse: { contains: String(search) } },
        { toWarehouse: { contains: String(search) } },
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

export const createStockTransfer = async (req: Request, res: Response) => {
  try {
    const { fromWarehouse, toWarehouse, noOfProducts, quantityTransferred, refNumber, date, notes } = req.body;

    if (!fromWarehouse || !toWarehouse) {
      return res.status(400).json({ error: "From Warehouse and To Warehouse are required" });
    }

    const transfer = await prisma.stockTransfer.create({
      data: {
        fromWarehouse,
        toWarehouse,
        noOfProducts: Number(noOfProducts) || 1,
        quantityTransferred: Number(quantityTransferred) || 1,
        refNumber: refNumber || `#${Math.floor(100000 + Math.random() * 900000)}`,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
    });

    res.status(201).json(transfer);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create stock transfer" });
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
    const { warehouse, search } = req.query;

    const where: any = {};
    if (warehouse && warehouse !== "all") {
      where.warehouse = String(warehouse);
    }
    if (search) {
      where.OR = [
        { productName: { contains: String(search) } },
        { warehouse: { contains: String(search) } },
        { store: { contains: String(search) } },
        { personName: { contains: String(search) } },
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

export const createStockAdjustment = async (req: Request, res: Response) => {
  try {
    const { warehouse, store, productName, productImage, date, personName, personAvatar, qty, type, notes } = req.body;

    if (!warehouse || !store || !productName) {
      return res.status(400).json({ error: "Warehouse, Store, and Product Name are required" });
    }

    const adjustment = await prisma.stockAdjustment.create({
      data: {
        warehouse,
        store,
        productName,
        productImage: productImage || null,
        date: date ? new Date(date) : new Date(),
        personName: personName || "James Kirwin",
        personAvatar: personAvatar || null,
        qty: Number(qty) || 0,
        type: type || "ADDITION",
        notes: notes || null,
      },
    });

    res.status(201).json(adjustment);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create stock adjustment" });
  }
};

export const deleteStockAdjustment = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.stockAdjustment.delete({ where: { id } });
    res.json({ success: true, message: "Stock adjustment deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete stock adjustment" });
  }
};
