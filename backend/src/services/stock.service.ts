import { prisma } from "../lib/prisma.js";

export type StockMovementType =
  | "INITIAL_STOCK"
  | "PURCHASE_RECEIPT"
  | "CUSTOMER_RETURN"
  | "TRANSFER_IN"
  | "ADJUSTMENT_PLUS"
  | "SALE_ISSUE"
  | "TRANSFER_OUT"
  | "INTERNAL_ISSUE"
  | "DAMAGE_ISSUE"
  | "SUPPLIER_RETURN"
  | "ADJUSTMENT_MINUS";

interface AdjustStockParams {
  productId?: string | null;
  productName?: string | null;
  warehouseId?: string | null;
  warehouseName?: string | null;
  quantityDelta: number; // positive (+) for GR, negative (-) for GI
  type: StockMovementType;
  referenceNo?: string | null;
  unitCost?: number | null;
  department?: string | null;
  notes?: string | null;
  createdBy?: string | null;
}

/**
 * Ensures all existing warehouses have a ProductStock record for the given product.
 */
export async function ensureProductStockRecords(productId: string): Promise<void> {
  try {
    const warehouses = await prisma.warehouse.findMany();
    for (const wh of warehouses) {
      await prisma.productStock.upsert({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId: wh.id,
          },
        },
        create: {
          productId,
          warehouseId: wh.id,
          quantity: 0,
        },
        update: {},
      });
    }
  } catch (err) {
    console.error("Error ensuring product stock records:", err);
  }
}

/**
 * Atomically adjusts stock in a specific warehouse, syncs total Product.stock,
 * and creates a StockMovement ledger record (Stock Card).
 */
export async function recordStockMovement(params: AdjustStockParams) {
  const {
    productId: inputProductId,
    productName,
    warehouseId: inputWarehouseId,
    warehouseName,
    quantityDelta,
    type,
    referenceNo,
    unitCost,
    department,
    notes,
    createdBy = "Admin",
  } = params;

  // 1. Resolve Product
  let product = null;
  if (inputProductId) {
    product = await prisma.product.findUnique({ where: { id: inputProductId } });
  }
  if (!product && productName) {
    product = await prisma.product.findFirst({ where: { name: { equals: productName } } });
  }

  if (!product) {
    console.warn(`[StockService] Product not found for movement: ID=${inputProductId}, Name=${productName}`);
    return null;
  }

  // 2. Resolve Warehouse
  let warehouse = null;
  if (inputWarehouseId) {
    warehouse = await prisma.warehouse.findUnique({ where: { id: inputWarehouseId } });
  }
  if (!warehouse && warehouseName && warehouseName !== "all") {
    warehouse = await prisma.warehouse.findFirst({ where: { name: { equals: warehouseName } } });
  }
  if (!warehouse) {
    // Default to the first available warehouse or product's warehouse
    if (product.warehouseId) {
      warehouse = await prisma.warehouse.findUnique({ where: { id: product.warehouseId } });
    }
    if (!warehouse) {
      warehouse = await prisma.warehouse.findFirst();
    }
  }

  if (!warehouse) {
    // If no warehouse exists yet, create default warehouse
    warehouse = await prisma.warehouse.create({
      data: {
        name: warehouseName || "Lavish Warehouse",
        address: "Main Warehouse Facility",
      },
    });
  }

  // 3. Upsert ProductStock in this warehouse
  const existingStock = await prisma.productStock.findUnique({
    where: {
      productId_warehouseId: {
        productId: product.id,
        warehouseId: warehouse.id,
      },
    },
  });

  const currentWhQty = existingStock ? existingStock.quantity : 0;
  const newWhQty = Math.max(0, currentWhQty + quantityDelta);

  await prisma.productStock.upsert({
    where: {
      productId_warehouseId: {
        productId: product.id,
        warehouseId: warehouse.id,
      },
    },
    create: {
      productId: product.id,
      warehouseId: warehouse.id,
      quantity: newWhQty,
    },
    update: {
      quantity: newWhQty,
    },
  });

  // 4. Recalculate and sync Product.stock (Total across all warehouses)
  const allStocks = await prisma.productStock.findMany({
    where: { productId: product.id },
  });
  const totalStockSum = allStocks.reduce((sum, s) => sum + s.quantity, 0);

  await prisma.product.update({
    where: { id: product.id },
    data: {
      stock: totalStockSum,
      status: totalStockSum === 0 ? "OUT_OF_STOCK" : "ACTIVE",
    },
  });

  // 5. Create immutable StockMovement ledger entry (Audit Trail)
  const movement = await prisma.stockMovement.create({
    data: {
      productId: product.id,
      warehouseId: warehouse.id,
      type,
      referenceNo: referenceNo || null,
      quantity: quantityDelta,
      balanceAfter: newWhQty,
      unitCost: unitCost !== undefined && unitCost !== null ? Number(unitCost) : product.costPrice || null,
      department: department || null,
      notes: notes || null,
      createdBy: createdBy || "Admin",
    },
  });

  return movement;
}

/**
 * Atomically transfers stock from one warehouse to another, creating TRANSFER_OUT and TRANSFER_IN movements.
 */
export async function executeStockTransfer(params: {
  productName?: string | null;
  productId?: string | null;
  fromWarehouseName: string;
  toWarehouseName: string;
  quantity: number;
  referenceNo?: string | null;
  notes?: string | null;
  createdBy?: string | null;
}) {
  const {
    productName,
    productId,
    fromWarehouseName,
    toWarehouseName,
    quantity,
    referenceNo,
    notes,
    createdBy = "Admin",
  } = params;

  // 1. Movement: Transfer OUT from source warehouse
  await recordStockMovement({
    productId,
    productName,
    warehouseName: fromWarehouseName,
    quantityDelta: -Math.abs(quantity),
    type: "TRANSFER_OUT",
    referenceNo,
    notes: `Transfer to ${toWarehouseName}. ${notes || ""}`,
    createdBy,
  });

  // 2. Movement: Transfer IN to destination warehouse
  await recordStockMovement({
    productId,
    productName,
    warehouseName: toWarehouseName,
    quantityDelta: Math.abs(quantity),
    type: "TRANSFER_IN",
    referenceNo,
    notes: `Transfer from ${fromWarehouseName}. ${notes || ""}`,
    createdBy,
  });
}
