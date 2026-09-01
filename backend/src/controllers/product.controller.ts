import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { recordStockMovement, ensureProductStockRecords } from "../services/stock.service.js";
import { logActivity } from "../services/audit.service.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, brandId, unitId, warehouseId, storeId, search, status, lowStock } = req.query;

    const where: any = {};
    if (categoryId && categoryId !== "all") {
      where.categoryId = String(categoryId);
    }
    if (brandId && brandId !== "all") {
      where.brandId = String(brandId);
    }
    if (unitId && unitId !== "all") {
      where.unitId = String(unitId);
    }
    if (warehouseId && warehouseId !== "all") {
      where.warehouseId = String(warehouseId);
    }
    if (storeId && storeId !== "all") {
      where.storeId = String(storeId);
    }
    if (status && status !== "all") {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { sku: { contains: String(search) } },
        { barcode: { contains: String(search) } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        unit: true,
        warehouse: true,
        store: true,
        stocks: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Auto ensure ProductStock snapshot exists for any legacy products
    for (const p of products) {
      if (!p.stocks || p.stocks.length === 0) {
        if (p.warehouseId && p.stock > 0) {
          await recordStockMovement({
            productId: p.id,
            warehouseId: p.warehouseId,
            quantityDelta: p.stock,
            type: "INITIAL_STOCK",
            notes: "Initial stock snapshot initialization",
          });
        } else {
          await ensureProductStockRecords(p.id);
        }
      }
    }

    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        unit: true,
        warehouse: true,
        store: true,
        stocks: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      sku,
      barcode,
      description,
      price,
      costPrice,
      stock,
      minStockAlert,
      categoryId,
      brandId,
      unitId,
      warehouseId,
      storeId,
      image,
      status,
      manufacturedDate,
      expiredDate,
    } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ success: false, message: "Product name and SKU are required" });
    }

    // Check SKU duplicate
    const existingSku = await prisma.product.findUnique({
      where: { sku: String(sku) },
    });
    if (existingSku) {
      return res.status(400).json({ success: false, message: `Product with SKU '${sku}' already exists` });
    }

    const initStock = Number(stock || 0);

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        description: description || null,
        price: Number(price || 0),
        costPrice: Number(costPrice || 0),
        stock: initStock,
        minStockAlert: Number(minStockAlert || 5),
        categoryId: categoryId || null,
        brandId: brandId || null,
        unitId: unitId || null,
        warehouseId: warehouseId || null,
        storeId: storeId || null,
        image: image || null,
        status: status || (initStock > 0 ? "ACTIVE" : "OUT_OF_STOCK"),
        manufacturedDate: manufacturedDate ? new Date(manufacturedDate) : null,
        expiredDate: expiredDate ? new Date(expiredDate) : null,
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        warehouse: true,
        store: true,
        stocks: true,
      },
    });

    // Populate ProductStock and StockMovement ledger
    if (initStock > 0) {
      await recordStockMovement({
        productId: product.id,
        warehouseId: warehouseId || null,
        quantityDelta: initStock,
        type: "INITIAL_STOCK",
        unitCost: Number(costPrice || 0),
        notes: "Initial product stock opening balance",
      });
    } else {
      await ensureProductStockRecords(product.id);
    }

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      name,
      sku,
      barcode,
      description,
      price,
      costPrice,
      stock,
      minStockAlert,
      categoryId,
      brandId,
      unitId,
      warehouseId,
      storeId,
      image,
      status,
      manufacturedDate,
      expiredDate,
    } = req.body;

    // Check SKU duplicate if changed
    if (sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: String(sku),
          NOT: { id },
        },
      });
      if (existingSku) {
        return res.status(400).json({ success: false, message: `Product with SKU '${sku}' already exists` });
      }
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(barcode !== undefined && { barcode: barcode || null }),
        ...(description !== undefined && { description: description || null }),
        ...(price !== undefined && { price: Number(price) }),
        ...(costPrice !== undefined && { costPrice: Number(costPrice) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(minStockAlert !== undefined && { minStockAlert: Number(minStockAlert) }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(brandId !== undefined && { brandId: brandId || null }),
        ...(unitId !== undefined && { unitId: unitId || null }),
        ...(warehouseId !== undefined && { warehouseId: warehouseId || null }),
        ...(storeId !== undefined && { storeId: storeId || null }),
        ...(image !== undefined && { image: image || null }),
        ...(status !== undefined && { status }),
        ...(manufacturedDate !== undefined && {
          manufacturedDate: manufacturedDate ? new Date(manufacturedDate) : null,
        }),
        ...(expiredDate !== undefined && {
          expiredDate: expiredDate ? new Date(expiredDate) : null,
        }),
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        warehouse: true,
        store: true,
        stocks: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    // If direct stock adjustment occurred
    if (stock !== undefined && Number(stock) !== existingProduct.stock) {
      const delta = Number(stock) - existingProduct.stock;
      await recordStockMovement({
        productId: product.id,
        warehouseId: warehouseId || existingProduct.warehouseId || null,
        quantityDelta: delta,
        type: delta > 0 ? "ADJUSTMENT_PLUS" : "ADJUSTMENT_MINUS",
        notes: `Product stock manually updated from ${existingProduct.stock} to ${stock}`,
      });
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (existing) {
      await logActivity({
        action: "DELETE",
        entityType: "PRODUCT",
        entityId: existing.id,
        entityName: existing.name,
        user: "Admin",
        data: existing,
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    res.json({ success: true, message: "Product status set to Inactive successfully", data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const bulkDeleteProducts = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No product IDs provided" });
    }

    const productsToLog = await prisma.product.findMany({
      where: { id: { in: ids } },
    });

    for (const p of productsToLog) {
      await logActivity({
        action: "DELETE",
        entityType: "PRODUCT",
        entityId: p.id,
        entityName: p.name,
        user: "Admin",
        data: p,
      });
    }

    const result = await prisma.product.updateMany({
      where: {
        id: { in: ids },
      },
      data: { status: "INACTIVE" },
    });

    res.json({ success: true, message: `Successfully updated ${result.count} products to Inactive`, count: result.count });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
