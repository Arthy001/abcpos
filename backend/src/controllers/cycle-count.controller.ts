import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { recordStockMovement } from "../services/stock.service.js";

// GET /api/cycle-counts (List all cycle counts)
export const getCycleCounts = async (req: Request, res: Response) => {
  try {
    const { warehouseId, status } = req.query;

    const whereClause: any = {};
    if (warehouseId && typeof warehouseId === "string" && warehouseId !== "all") {
      whereClause.warehouseId = warehouseId;
    }
    if (status && typeof status === "string" && status !== "all") {
      whereClause.status = status;
    }

    const cycleCounts = await prisma.cycleCount.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: cycleCounts,
    });
  } catch (error: any) {
    console.error("Error fetching cycle counts:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cycle counts",
      error: error.message,
    });
  }
};

// GET /api/cycle-counts/:id (Get details with items)
export const getCycleCountById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);

    const cycleCount = await prisma.cycleCount.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { productName: "asc" },
        },
      },
    });

    if (!cycleCount) {
      return res.status(404).json({
        success: false,
        message: "Cycle count not found",
      });
    }

    return res.json({
      success: true,
      data: cycleCount,
    });
  } catch (error: any) {
    console.error("Error fetching cycle count by id:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch cycle count",
      error: error.message,
    });
  }
};

// POST /api/cycle-counts (Create new Cycle Count)
export const createCycleCount = async (req: Request, res: Response) => {
  try {
    const {
      warehouseId,
      countType = "FULL",
      categoryId,
      assignedTo,
      notes,
    } = req.body;

    if (!warehouseId) {
      return res.status(400).json({
        success: false,
        message: "Warehouse ID is required",
      });
    }

    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found",
      });
    }

    // Build Product Filter based on Warehouse and optional Category
    const productWhere: any = {
      status: "ACTIVE",
    };

    let categoryName: string | null = null;
    if (categoryId && categoryId !== "all") {
      productWhere.categoryId = categoryId;
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      if (cat) categoryName = cat.name;
    }

    // Fetch Products
    const products = await prisma.product.findMany({
      where: productWhere,
      include: {
        stocks: {
          where: { warehouseId },
        },
      },
    });

    if (products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No active products found matching the criteria",
      });
    }

    // Auto-generate reference code e.g. CC-20261031-001
    const countDateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const countNumber = `CC-${countDateStr}-${randomSuffix}`;

    // Prepare items with system quantity snapshot
    const countItemsData = products.map((prod) => {
      const stockRec = prod.stocks.find((s) => s.warehouseId === warehouseId);
      const systemQty = stockRec ? stockRec.quantity : 0;

      return {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        systemQty,
        countedQty: null, // Pending count
        variance: null,
        unitCost: prod.costPrice || 0,
        varianceCost: null,
        status: "PENDING",
      };
    });

    const newCycleCount = await prisma.cycleCount.create({
      data: {
        countNumber,
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        countType,
        categoryFilter: categoryName,
        status: "IN_PROGRESS",
        assignedTo: assignedTo || "Warehouse Auditor",
        notes: notes || null,
        totalItems: countItemsData.length,
        matchedItems: 0,
        discrepancies: 0,
        totalVarianceCost: 0,
        items: {
          create: countItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Cycle count ${newCycleCount.countNumber} generated with ${countItemsData.length} items to count.`,
      data: newCycleCount,
    });
  } catch (error: any) {
    console.error("Error creating cycle count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create cycle count",
      error: error.message,
    });
  }
};

// PUT /api/cycle-counts/:id/items (Batch update counted quantities)
export const updateCycleCountItems = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);
    const { items } = req.body; // Array of { id, countedQty, notes }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Items array is required",
      });
    }

    const cycleCount = await prisma.cycleCount.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!cycleCount) {
      return res.status(404).json({
        success: false,
        message: "Cycle count not found",
      });
    }

    if (cycleCount.status === "COMPLETED" || cycleCount.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: `Cannot edit cycle count in ${cycleCount.status} status`,
      });
    }

    // Process each item
    for (const item of items) {
      if (item.countedQty === undefined || item.countedQty === null) continue;

      const targetItem = cycleCount.items.find((i) => i.id === item.id);
      if (!targetItem) continue;

      const countedQty = Number(item.countedQty);
      const variance = countedQty - targetItem.systemQty;
      const varianceCost = variance * targetItem.unitCost;

      await prisma.cycleCountItem.update({
        where: { id: item.id },
        data: {
          countedQty,
          variance,
          varianceCost,
          status: "COUNTED",
          notes: item.notes !== undefined ? item.notes : targetItem.notes,
        },
      });
    }

    // Re-evaluate aggregate stats
    const updatedItems = await prisma.cycleCountItem.findMany({
      where: { cycleCountId: id },
    });

    let matched = 0;
    let discrepancies = 0;
    let totalVarianceCost = 0;

    for (const it of updatedItems) {
      if (it.countedQty !== null) {
        if (it.variance === 0) {
          matched++;
        } else {
          discrepancies++;
          totalVarianceCost += it.varianceCost || 0;
        }
      }
    }

    const updatedCycleCount = await prisma.cycleCount.update({
      where: { id },
      data: {
        matchedItems: matched,
        discrepancies,
        totalVarianceCost,
      },
      include: {
        items: {
          orderBy: { productName: "asc" },
        },
      },
    });

    return res.json({
      success: true,
      message: "Count records saved successfully",
      data: updatedCycleCount,
    });
  } catch (error: any) {
    console.error("Error updating cycle count items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update count records",
      error: error.message,
    });
  }
};

// POST /api/cycle-counts/:id/reconcile (Approve and generate Stock Adjustments)
export const reconcileCycleCount = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);
    const { approvedBy, autoAdjust = true } = req.body;

    const cycleCount = await prisma.cycleCount.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!cycleCount) {
      return res.status(404).json({
        success: false,
        message: "Cycle count not found",
      });
    }

    if (cycleCount.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Cycle count is already completed and reconciled",
      });
    }

    let adjustmentCount = 0;

    // Apply adjustments for items with discrepancies if autoAdjust is true
    if (autoAdjust) {
      const discrepancyItems = cycleCount.items.filter(
        (it) => it.countedQty !== null && it.variance !== null && it.variance !== 0
      );

      for (const item of discrepancyItems) {
        const variance = item.variance!;
        const adjustmentType = variance > 0 ? "Addition" : "Subtraction";
        const absQty = Math.abs(variance);

        // Record stock movement using standard service
        await recordStockMovement({
          productId: item.productId,
          warehouseId: cycleCount.warehouseId,
          type: variance > 0 ? "ADJUSTMENT_PLUS" : "ADJUSTMENT_MINUS",
          referenceNo: cycleCount.countNumber,
          quantityDelta: variance,
          unitCost: item.unitCost,
          notes: `Cycle Count Reconcile: ${cycleCount.countNumber} (${adjustmentType} of ${absQty})`,
          createdBy: approvedBy || "Stock Auditor",
        });

        // Also record a StockAdjustment record for reporting history
        await prisma.stockAdjustment.create({
          data: {
            warehouse: cycleCount.warehouseName,
            store: "Central Store",
            productName: item.productName,
            date: new Date(),
            personName: approvedBy || "Auditor",
            qty: absQty,
            type: adjustmentType,
          },
        });

        // Mark item as ADJUSTED
        await prisma.cycleCountItem.update({
          where: { id: item.id },
          data: { status: "ADJUSTED" },
        });

        adjustmentCount++;
      }
    }

    // Mark Cycle Count as COMPLETED
    const completed = await prisma.cycleCount.update({
      where: { id },
      data: {
        status: "COMPLETED",
        approvedBy: approvedBy || "Admin",
        completedAt: new Date(),
      },
      include: { items: true },
    });

    return res.json({
      success: true,
      message: `Cycle count approved! Reconciled and adjusted ${adjustmentCount} item discrepancies.`,
      data: completed,
      adjustmentsMade: adjustmentCount,
    });
  } catch (error: any) {
    console.error("Error reconciling cycle count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reconcile cycle count",
      error: error.message,
    });
  }
};

// DELETE /api/cycle-counts/:id (Cancel or delete)
export const deleteCycleCount = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);

    const existing = await prisma.cycleCount.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Cycle count not found",
      });
    }

    await prisma.cycleCount.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Cycle count deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting cycle count:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete cycle count",
      error: error.message,
    });
  }
};
