import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { recordStockMovement, ensureProductStockRecords } from "../services/stock.service.js";
import { logActivity } from "../services/audit.service.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, brandId, unitId, warehouseId, storeId, search, status, lowStock } = req.query;

    const andConditions: any[] = [];

    if (categoryId && categoryId !== "all") {
      andConditions.push({ categoryId: String(categoryId) });
    }
    if (brandId && brandId !== "all") {
      andConditions.push({ brandId: String(brandId) });
    }
    if (unitId && unitId !== "all") {
      andConditions.push({ unitId: String(unitId) });
    }
    if (warehouseId && warehouseId !== "all") {
      const whIds = String(warehouseId)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (whIds.length > 1) {
        andConditions.push({
          OR: [
            { warehouseId: { in: whIds } },
            { stocks: { some: { warehouseId: { in: whIds } } } },
          ],
        });
      } else if (whIds.length === 1) {
        andConditions.push({
          OR: [
            { warehouseId: whIds[0] },
            { stocks: { some: { warehouseId: whIds[0] } } },
          ],
        });
      }
    }
    if (storeId && storeId !== "all") {
      andConditions.push({ storeId: String(storeId) });
    }
    if (status && status !== "all") {
      andConditions.push({ status: String(status) });
    }
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: String(search) } },
          { sku: { contains: String(search) } },
          { barcode: { contains: String(search) } },
        ],
      });
    }

    const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

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
        variants: true,
        expiryBatches: {
          orderBy: { expiredDate: "asc" },
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
        variants: true,
        expiryBatches: {
          orderBy: { expiredDate: "asc" },
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
      productType = "SINGLE",
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
      variants = [],
      expiryBatches = [],
    } = req.body;

    if (!name || !sku) {
      return res.status(400).json({ success: false, message: "Product name and SKU are required" });
    }

    // Check parent SKU duplicate
    const existingSku = await prisma.product.findUnique({
      where: { sku: String(sku) },
    });
    if (existingSku) {
      return res.status(400).json({ success: false, message: `Product with SKU '${sku}' already exists` });
    }

    const isVariable = productType === "VARIABLE" && Array.isArray(variants) && variants.length > 0;

    // Check variant SKUs if variable
    if (isVariable) {
      const variantSkus = variants.map((v: any) => String(v.sku).trim());
      const skuSet = new Set(variantSkus);
      if (skuSet.size !== variantSkus.length) {
        return res.status(400).json({ success: false, message: "Duplicate SKU found among variants" });
      }

      const existingVariant = await prisma.productVariant.findFirst({
        where: { sku: { in: variantSkus } },
      });
      if (existingVariant) {
        return res.status(400).json({ success: false, message: `Variant SKU '${existingVariant.sku}' already exists` });
      }

      const existingProd = await prisma.product.findFirst({
        where: { sku: { in: variantSkus } },
      });
      if (existingProd) {
        return res.status(400).json({ success: false, message: `Product SKU '${existingProd.sku}' already exists` });
      }
    }

    const validBatches = Array.isArray(expiryBatches)
      ? expiryBatches.filter((b: any) => b && b.expiredDate)
      : [];

    let finalExpiryDate = expiredDate ? new Date(expiredDate) : null;
    let finalMfgDate = manufacturedDate ? new Date(manufacturedDate) : null;

    if (validBatches.length > 0) {
      validBatches.sort((a, b) => new Date(a.expiredDate).getTime() - new Date(b.expiredDate).getTime());
      finalExpiryDate = new Date(validBatches[0].expiredDate);
      if (validBatches[0].manufacturedDate) {
        finalMfgDate = new Date(validBatches[0].manufacturedDate);
      }
    }

    const batchStockSum = validBatches.reduce((acc: number, b: any) => acc + (Number(b.quantity) || 0), 0);

    const totalStock = isVariable
      ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
      : (validBatches.length > 0 && batchStockSum > 0 ? batchStockSum : Number(stock || 0));

    const minVariantPrice = isVariable
      ? Math.min(...variants.map((v: any) => Number(v.price) || 0))
      : Number(price || 0);

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode: barcode || null,
        description: description || null,
        productType: isVariable ? "VARIABLE" : "SINGLE",
        price: Number(price || minVariantPrice || 0),
        costPrice: Number(costPrice || (isVariable ? variants[0]?.costPrice : 0) || 0),
        stock: totalStock,
        minStockAlert: Number(minStockAlert || 5),
        categoryId: categoryId || null,
        brandId: brandId || null,
        unitId: unitId || null,
        warehouseId: warehouseId || null,
        storeId: storeId || null,
        image: image || null,
        status: status || (totalStock > 0 ? "ACTIVE" : "OUT_OF_STOCK"),
        manufacturedDate: finalMfgDate,
        expiredDate: finalExpiryDate,
        ...(validBatches.length > 0 && {
          expiryBatches: {
            create: validBatches.map((b: any) => ({
              batchNo: b.batchNo ? String(b.batchNo).trim() : null,
              manufacturedDate: b.manufacturedDate ? new Date(b.manufacturedDate) : null,
              expiredDate: new Date(b.expiredDate),
              quantity: Number(b.quantity) || 0,
              initialQuantity: Number(b.quantity) || 0,
              costPrice: b.costPrice !== undefined && b.costPrice !== null ? Number(b.costPrice) : null,
              notes: b.notes ? String(b.notes).trim() : null,
              status: Number(b.quantity) > 0 ? "ACTIVE" : "DEPLETED",
            })),
          },
        }),
        ...(isVariable && {
          variants: {
            create: variants.map((v: any) => ({
              sku: String(v.sku).trim(),
              barcode: v.barcode ? String(v.barcode).trim() : null,
              name: String(v.name).trim(),
              attributes: typeof v.attributes === "string" ? v.attributes : JSON.stringify(v.attributes || {}),
              price: Number(v.price || 0),
              costPrice: Number(v.costPrice || 0),
              stock: Number(v.stock || 0),
              minStockAlert: Number(v.minStockAlert || 5),
              image: v.image || null,
              status: Number(v.stock) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
            })),
          },
        }),
      },
      include: {
        category: true,
        brand: true,
        unit: true,
        warehouse: true,
        store: true,
        stocks: true,
        variants: true,
        expiryBatches: {
          orderBy: { expiredDate: "asc" },
        },
      },
    });

    // Populate ProductStock and StockMovement ledger
    if (totalStock > 0) {
      await recordStockMovement({
        productId: product.id,
        warehouseId: warehouseId || null,
        quantityDelta: totalStock,
        type: "INITIAL_STOCK",
        unitCost: Number(costPrice || 0),
        notes: "Initial product stock opening balance",
      });
    } else {
      await ensureProductStockRecords(product.id);
    }

    await logActivity({
      action: "CREATE",
      entityType: "PRODUCT",
      entityId: product.id,
      entityName: product.name,
      data: { name: product.name, sku: product.sku, price: product.price, costPrice: product.costPrice, stock: product.stock },
    });
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
      expiryBatches,
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

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { expiryBatches: true },
    });
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Process Master Data Correction for Expiry Batches (Dates, Lot, Notes editable, stock intact)
    let updatedEarliestExp: Date | null = expiredDate ? new Date(expiredDate) : existingProduct.expiredDate;
    let updatedEarliestMfg: Date | null = manufacturedDate ? new Date(manufacturedDate) : existingProduct.manufacturedDate;

    if (Array.isArray(expiryBatches)) {
      for (const batch of expiryBatches) {
        if (batch.id && !batch.id.startsWith("new-")) {
          // Existing Batch: Update Dates, Lot, Notes only (Stock is preserved according to ERP standard)
          await prisma.productExpiryBatch.update({
            where: { id: batch.id },
            data: {
              ...(batch.batchNo !== undefined && { batchNo: batch.batchNo ? String(batch.batchNo).trim() : null }),
              ...(batch.manufacturedDate !== undefined && {
                manufacturedDate: batch.manufacturedDate ? new Date(batch.manufacturedDate) : null,
              }),
              ...(batch.expiredDate && { expiredDate: new Date(batch.expiredDate) }),
              ...(batch.notes !== undefined && { notes: batch.notes ? String(batch.notes).trim() : null }),
            },
          });
        } else if (batch.expiredDate) {
          // Newly added batch from Edit
          await prisma.productExpiryBatch.create({
            data: {
              productId: id,
              batchNo: batch.batchNo ? String(batch.batchNo).trim() : null,
              manufacturedDate: batch.manufacturedDate ? new Date(batch.manufacturedDate) : null,
              expiredDate: new Date(batch.expiredDate),
              quantity: Number(batch.quantity) || 0,
              initialQuantity: Number(batch.quantity) || 0,
              costPrice: batch.costPrice !== undefined ? Number(batch.costPrice) : null,
              notes: batch.notes ? String(batch.notes).trim() : null,
              status: Number(batch.quantity) > 0 ? "ACTIVE" : "DEPLETED",
            },
          });
        }
      }

      // Re-query active batches to update product's main earliest dates
      const currentBatches = await prisma.productExpiryBatch.findMany({
        where: { productId: id, status: "ACTIVE" },
        orderBy: { expiredDate: "asc" },
      });

      if (currentBatches.length > 0) {
        updatedEarliestExp = currentBatches[0].expiredDate;
        if (currentBatches[0].manufacturedDate) {
          updatedEarliestMfg = currentBatches[0].manufacturedDate;
        }
      }
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
        manufacturedDate: updatedEarliestMfg,
        expiredDate: updatedEarliestExp,
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
        variants: true,
        expiryBatches: {
          orderBy: { expiredDate: "asc" },
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

    await logActivity({
      action: "UPDATE",
      entityType: "PRODUCT",
      entityId: product.id,
      entityName: product.name,
      user: "Admin",
      data: {
        name: product.name,
        sku: product.sku,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        status: product.status,
      },
    });

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
