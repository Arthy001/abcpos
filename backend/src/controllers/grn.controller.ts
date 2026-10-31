import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { recordStockMovement } from "../services/stock.service.js";

// GET /api/grn (List all Goods Receipt Notes)
export const getGoodsReceiptNotes = async (req: Request, res: Response) => {
  try {
    const { purchaseId, workOrderId, type, search } = req.query;

    const where: any = {};
    if (purchaseId && typeof purchaseId === "string") {
      where.purchaseId = purchaseId;
    }
    if (workOrderId && typeof workOrderId === "string") {
      where.workOrderId = workOrderId;
    }
    if (type && typeof type === "string") {
      where.type = type.toUpperCase();
    }
    if (search && typeof search === "string") {
      where.OR = [
        { grnNumber: { contains: search } },
        { purchaseRef: { contains: search } },
        { supplierName: { contains: search } },
        { warehouseName: { contains: search } },
      ];
    }

    const notes = await prisma.goodsReceiptNote.findMany({
      where,
      include: {
        items: true,
        purchase: {
          select: { id: true, reference: true, status: true, total: true },
        },
        workOrder: {
          select: {
            id: true,
            orderNo: true,
            status: true,
            targetQty: true,
            producedQty: true,
            finishedProduct: { select: { id: true, name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: notes,
      count: notes.length,
    });
  } catch (error: any) {
    console.error("Error fetching goods receipt notes:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch goods receipt notes",
      error: error.message,
    });
  }
};

// GET /api/grn/:id (Get details of single GRN)
export const getGoodsReceiptNoteById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : (rawId as string);

    const note = await prisma.goodsReceiptNote.findUnique({
      where: { id },
      include: {
        items: true,
        purchase: {
          include: { items: true },
        },
        workOrder: {
          include: {
            finishedProduct: true,
            materials: { include: { rawMaterial: true } },
          },
        },
      },
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Goods Receipt Note not found",
      });
    }

    return res.json({
      success: true,
      data: note,
    });
  } catch (error: any) {
    console.error("Error fetching goods receipt note by id:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch goods receipt note",
      error: error.message,
    });
  }
};

// POST /api/purchases/:id/receive (Create GRN from PO & ingest stock partially/fully)
export const receivePurchaseGoods = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const purchaseId = Array.isArray(rawId) ? rawId[0] : (rawId as string);
    const { items = [], receivedBy = "Admin", notes, warehouseName } = req.body;

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true },
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found",
      });
    }

    if (purchase.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot receive goods for a CANCELLED purchase order",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No goods reception items provided",
      });
    }

    // Auto-generate reference e.g. GRN-20261031-102
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const grnNumber = `GRN-${dateStr}-${randomSuffix}`;

    let totalRec = 0;
    let totalRej = 0;

    const grnItemsData: any[] = [];
    const targetWhName = warehouseName || purchase.warehouseName || "Lavish Warehouse";

    // Process each item to receive
    for (const itemInput of items) {
      const { purchaseItemId, receivedQty = 0, rejectedQty = 0, rejectReason, itemNotes } = itemInput;
      const poItem = purchase.items.find((p) => p.id === purchaseItemId);

      if (!poItem) continue;

      const rec = Math.max(0, Number(receivedQty) || 0);
      const rej = Math.max(0, Number(rejectedQty) || 0);

      totalRec += rec;
      totalRej += rej;

      grnItemsData.push({
        productId: poItem.productId,
        productName: poItem.productName,
        sku: poItem.sku,
        orderedQty: poItem.quantity,
        receivedQty: rec,
        rejectedQty: rej,
        rejectReason: rejectReason || null,
        unitCost: poItem.unitCost,
        notes: itemNotes || null,
      });

      // 1. Ingest actual received stock into warehouse
      if (rec > 0) {
        await recordStockMovement({
          productId: poItem.productId || undefined,
          productName: poItem.productName,
          warehouseName: targetWhName,
          quantityDelta: rec,
          type: "PURCHASE_RECEIPT",
          referenceNo: grnNumber,
          unitCost: poItem.unitCost,
          notes: `Goods Receipt from ${purchase.supplierName} (PO: ${purchase.reference})`,
          createdBy: receivedBy,
        });

        // 2. Update Moving Average Cost on Product
        if (poItem.productId && poItem.unitCost) {
          const prod = await prisma.product.findUnique({ where: { id: poItem.productId } });
          if (prod) {
            const currentStock = Math.max(0, prod.stock);
            const currentCost = prod.averageCost || prod.costPrice || poItem.unitCost;
            const totalQty = currentStock + rec;
            const newAvgCost = totalQty > 0
              ? (currentStock * currentCost + rec * poItem.unitCost) / totalQty
              : poItem.unitCost;

            await prisma.product.update({
              where: { id: poItem.productId },
              data: {
                lastPurchaseCost: poItem.unitCost,
                averageCost: Math.round(newAvgCost * 100) / 100,
                costPrice: Math.round(newAvgCost * 100) / 100,
              },
            }).catch(() => null);
          }
        }

        // 3. Update cumulative receivedQty on PurchaseItem
        await prisma.purchaseItem.update({
          where: { id: poItem.id },
          data: {
            receivedQty: { increment: rec },
          },
        });
      }
    }

    // 4. Create GoodsReceiptNote document
    const createdGRN = await prisma.goodsReceiptNote.create({
      data: {
        grnNumber,
        type: "PO",
        purchaseId: purchase.id,
        purchaseRef: purchase.reference,
        supplierName: purchase.supplierName,
        warehouseName: targetWhName,
        receivedBy,
        totalReceived: totalRec,
        totalRejected: totalRej,
        notes: notes || null,
        status: "COMPLETED",
        items: {
          create: grnItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 5. Check if PO is now fully received or partially received
    const updatedPoItems = await prisma.purchaseItem.findMany({
      where: { purchaseId: purchase.id },
    });

    const isAllReceived = updatedPoItems.every((it) => it.receivedQty >= it.quantity);
    const newStatus = isAllReceived ? "RECEIVED" : "PARTIAL_RECEIVED";

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: newStatus,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Goods Receipt ${createdGRN.grnNumber} created! Ingested ${totalRec} items into stock. PO is now ${newStatus}.`,
      data: createdGRN,
      purchaseStatus: newStatus,
    });
  } catch (error: any) {
    console.error("Error receiving purchase goods:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to receive goods",
      error: error.message,
    });
  }
};

// POST /api/manufacturing/work-orders/:id/receive (Create FGRN from Work Order & ingest finished goods into stock)
export const receiveWorkOrderGoods = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const workOrderId = Array.isArray(rawId) ? rawId[0] : (rawId as string);
    const {
      receivedQty = 0,
      rejectedQty = 0,
      rejectReason,
      warehouseName,
      receivedBy = "Admin",
      notes,
    } = req.body;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        finishedProduct: true,
        warehouse: true,
      },
    });

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: "Work Order not found",
      });
    }

    if (workOrder.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot receive goods for a CANCELLED Work Order",
      });
    }

    const recQty = Math.max(0, Number(receivedQty) || 0);
    const rejQty = Math.max(0, Number(rejectedQty) || 0);

    if (recQty === 0 && rejQty === 0) {
      return res.status(400).json({
        success: false,
        message: "Please specify received or rejected quantity greater than 0",
      });
    }

    const targetWhName = warehouseName || workOrder.warehouse?.name || "Lavish Warehouse";

    // Auto-generate reference e.g. FGRN-20261031-105
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const grnNumber = `FGRN-${dateStr}-${randomSuffix}`;

    // 1. Ingest finished product into warehouse
    if (recQty > 0) {
      await recordStockMovement({
        productId: workOrder.finishedProductId,
        productName: workOrder.finishedProduct?.name || "Finished Goods",
        warehouseName: targetWhName,
        quantityDelta: recQty,
        type: "ADJUSTMENT_PLUS",
        referenceNo: grnNumber,
        notes: `Finished Goods Receipt from Work Order: ${workOrder.orderNo}`,
        createdBy: receivedBy,
      });
    }

    // 2. Record scrap if any
    if (rejQty > 0) {
      const scrapNo = `SCRAP-${Date.now().toString().slice(-6)}`;
      await prisma.productionScrap.create({
        data: {
          scrapNo,
          workOrderId: workOrder.id,
          scrapType: "REJECT_ROLL",
          materialName: workOrder.finishedProduct?.name || "Finished Goods Defect",
          weightKg: rejQty,
          notes: rejectReason ? `${rejectReason} - ${notes || ""}` : notes || "Scrapped at warehouse receiving",
        },
      });
    }

    // 3. Update Work Order producedQty, scrapQty, and status
    const newProducedQty = workOrder.producedQty + recQty;
    const newScrapQty = workOrder.scrapQty + rejQty;
    const isCompleted = (newProducedQty + newScrapQty) >= workOrder.targetQty;
    const newStatus = isCompleted ? "COMPLETED" : "IN_PROGRESS";

    await prisma.workOrder.update({
      where: { id: workOrder.id },
      data: {
        producedQty: newProducedQty,
        scrapQty: newScrapQty,
        status: newStatus,
      },
    });

    const unitCost = workOrder.totalCost && workOrder.targetQty > 0
      ? workOrder.totalCost / workOrder.targetQty
      : 0;

    // 4. Create GoodsReceiptNote document
    const createdGRN = await prisma.goodsReceiptNote.create({
      data: {
        grnNumber,
        type: "WORK_ORDER",
        workOrderId: workOrder.id,
        purchaseRef: workOrder.orderNo,
        supplierName: "ฝ่ายผลิตภายใน (Internal Production)",
        warehouseName: targetWhName,
        receivedBy,
        totalReceived: recQty,
        totalRejected: rejQty,
        notes: notes || null,
        status: "COMPLETED",
        items: {
          create: [
            {
              productId: workOrder.finishedProductId,
              productName: workOrder.finishedProduct?.name || "Finished Goods",
              sku: workOrder.finishedProduct?.sku || "FG-SKU",
              orderedQty: Math.round(workOrder.targetQty),
              receivedQty: recQty,
              rejectedQty: rejQty,
              rejectReason: rejectReason || null,
              unitCost,
              notes: notes || null,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Finished Goods Receipt ${createdGRN.grnNumber} created! Ingested ${recQty} units into stock. Work Order is now ${newStatus}.`,
      data: createdGRN,
      workOrderStatus: newStatus,
    });
  } catch (error: any) {
    console.error("Error receiving work order goods:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to receive work order goods",
      error: error.message,
    });
  }
};
