import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { recordStockMovement } from "../services/stock.service.js";

// ==========================================
// 🛠️ SEED PLASTIC FACTORY SAMPLE DATA IF EMPTY
// ==========================================
export const seedPlasticFactoryData = async () => {
  try {
    const rawMaterialCheck = await prisma.product.findFirst({
      where: { sku: "RM-HDPE-01" },
    });

    if (!rawMaterialCheck) {
      // Find or create category "Raw Materials" and "Finished Goods"
      let rmCategory = await prisma.category.findFirst({ where: { slug: "raw-materials" } });
      if (!rmCategory) {
        rmCategory = await prisma.category.create({
          data: {
            name: "วัตถุดิบเม็ดพลาสติก (Raw Materials)",
            slug: "raw-materials",
            description: "เม็ดพลาสติก เม็ดสี และสารเติมแต่งสำหรับโรงงานเป่าถุง",
          },
        });
      }

      let fgCategory = await prisma.category.findFirst({ where: { slug: "plastic-bags" } });
      if (!fgCategory) {
        fgCategory = await prisma.category.create({
          data: {
            name: "ถุงพลาสติกสำเร็จรูป (Finished Bags)",
            slug: "plastic-bags",
            description: "ถุงหูหิ้ว ถุงขยะ ถุงร้อนสำเร็จรูปพร้อมจำหน่าย",
          },
        });
      }

      // Unit kg
      let kgUnit = await prisma.unit.findFirst({ where: { shortName: "kg" } });
      if (!kgUnit) {
        kgUnit = await prisma.unit.create({
          data: { name: "กิโลกรัม (Kilogram)", shortName: "kg" },
        });
      }

      // Default Warehouse
      let defaultWh = await prisma.warehouse.findFirst();

      // Create Raw Materials
      const rm1 = await prisma.product.create({
        data: {
          name: "เม็ดพลาสติก HDPE เกรดเป่า (Virgin Resin)",
          sku: "RM-HDPE-01",
          price: 50.0,
          costPrice: 43.5,
          stock: 5000,
          minStockAlert: 1000,
          categoryId: rmCategory.id,
          unitId: kgUnit.id,
          warehouseId: defaultWh?.id,
          description: "เม็ด HDPE บริสุทธิ์ เหนียวพิเศษ เหมาะสำหรับถุงหูหิ้วบางเหนียว",
        },
      });

      const rm2 = await prisma.product.create({
        data: {
          name: "Masterbatch เม็ดสีขาว (White Pigment Batch)",
          sku: "RM-MB-WHITE",
          price: 95.0,
          costPrice: 85.0,
          stock: 450,
          minStockAlert: 100,
          categoryId: rmCategory.id,
          unitId: kgUnit.id,
          warehouseId: defaultWh?.id,
          description: "หัวเชื้อสีขาว สำหรับผสมเป่าถุงหูหิ้วขาวนม",
        },
      });

      const rm3 = await prisma.product.create({
        data: {
          name: "แคลเซียมคอมพาวด์ (Calcium Filler)",
          sku: "RM-CA-FILL",
          price: 25.0,
          costPrice: 19.0,
          stock: 2000,
          minStockAlert: 500,
          categoryId: rmCategory.id,
          unitId: kgUnit.id,
          warehouseId: defaultWh?.id,
          description: "สารแคลเซียมช่วยเพิ่มความแข็งแรงและลดต้นทุนเม็ด",
        },
      });

      const rm4 = await prisma.product.create({
        data: {
          name: "เม็ดบดรีไซเคิล HDPE (Recycled Repellet)",
          sku: "RM-HDPE-RECY",
          price: 32.0,
          costPrice: 26.0,
          stock: 1200,
          minStockAlert: 300,
          categoryId: rmCategory.id,
          unitId: kgUnit.id,
          warehouseId: defaultWh?.id,
          description: "เม็ดบดจากเศษขี้กระบอกและเศษตัดปากถุง นำกลับมาหลอมเป่าใหม่",
        },
      });

      // Create Finished Products
      const fg1 = await prisma.product.create({
        data: {
          name: "ถุงหูหิ้ว HDPE 6x14 นิ้ว ตราดาว (มัด 1 กก.)",
          sku: "FG-BAG-6X14",
          barcode: "8850001006141",
          price: 68.0,
          costPrice: 44.5,
          stock: 350,
          minStockAlert: 50,
          categoryId: fgCategory.id,
          unitId: kgUnit.id,
          warehouseId: defaultWh?.id,
          description: "ถุงหูหิ้วเกรดเอ สีขาวนม เหนียว ไม่ขาดง่าย บรรจุ 1 กก./มัด",
        },
      });

      const fg2 = await prisma.product.create({
        data: {
          name: "ถุงหูหิ้ว HDPE 8x16 นิ้ว ตราดาว (มัด 1 กก.)",
          sku: "FG-BAG-8X16",
          barcode: "8850001008162",
          price: 68.0,
          costPrice: 44.5,
          stock: 220,
          minStockAlert: 50,
          categoryId: fgCategory.id,
          unitId: kgUnit.id,
          warehouseId: defaultWh?.id,
          description: "ถุงหูหิ้วขนาดกลาง สีขาวนม บรรจุ 1 กก./มัด",
        },
      });

      // Create Sample BOM
      const sampleBom = await prisma.billOfMaterial.create({
        data: {
          bomCode: "BOM-BAG-6X14",
          name: "สูตรถุงหูหิ้ว HDPE 6x14 นิ้ว ขาวนม (1 กก.)",
          finishedProductId: fg1.id,
          outputQty: 1.0,
          unit: "kg",
          laborCost: 2.0,
          overheadCost: 1.5,
          totalCost: 44.5,
          status: "ACTIVE",
          notes: "สูตรมาตรฐาน สัดส่วนเม็ดแท้ 90% + สีขาว 3% + แคลเซียม 7%",
          items: {
            create: [
              {
                rawMaterialId: rm1.id,
                quantity: 0.90,
                unit: "kg",
                wastePercent: 2.0,
                unitCost: rm1.costPrice,
                subtotal: 0.90 * rm1.costPrice,
              },
              {
                rawMaterialId: rm2.id,
                quantity: 0.03,
                unit: "kg",
                wastePercent: 1.0,
                unitCost: rm2.costPrice,
                subtotal: 0.03 * rm2.costPrice,
              },
              {
                rawMaterialId: rm3.id,
                quantity: 0.07,
                unit: "kg",
                wastePercent: 2.0,
                unitCost: rm3.costPrice,
                subtotal: 0.07 * rm3.costPrice,
              },
            ],
          },
        },
      });

      // Create Sample Work Order
      const sampleWo = await prisma.workOrder.create({
        data: {
          orderNo: "WO-2026-0001",
          bomId: sampleBom.id,
          finishedProductId: fg1.id,
          targetQty: 500,
          producedQty: 485,
          scrapQty: 15,
          unit: "kg",
          startDate: new Date(),
          status: "IN_PROGRESS",
          operator: "สมชาย มีฝีมือ (ช่างคุมเครื่องเป่า)",
          machineNo: "Extruder #2 (สายเป่า 6-12 นิ้ว)",
          warehouseId: defaultWh?.id,
          totalCost: 44.5 * 500,
          notes: "ผลิตตามคำสั่งซื้อลูกค้าส่งตลาดไท ส่งมอบภายใน 3 วัน",
          materials: {
            create: [
              {
                rawMaterialId: rm1.id,
                plannedQty: 450,
                actualQty: 455,
                unit: "kg",
                unitCost: rm1.costPrice,
                isDeducted: true,
              },
              {
                rawMaterialId: rm2.id,
                plannedQty: 15,
                actualQty: 15,
                unit: "kg",
                unitCost: rm2.costPrice,
                isDeducted: true,
              },
              {
                rawMaterialId: rm3.id,
                plannedQty: 35,
                actualQty: 35,
                unit: "kg",
                unitCost: rm3.costPrice,
                isDeducted: true,
              },
            ],
          },
        },
      });

      // Create Sample Scrap
      await prisma.productionScrap.create({
        data: {
          scrapNo: "SCRAP-2026-0001",
          workOrderId: sampleWo.id,
          scrapType: "EDGE_TRIM",
          materialName: "เศษตัดปากถุงและขอบฟิล์ม HDPE ขาวนม",
          weightKg: 15.0,
          targetRawMaterialId: rm4.id,
          isRecycled: false,
          notes: "รอเข้าเครื่องบดเม็ดรีไซเคิลรอบวันศุกร์",
        },
      });
    }
  } catch (err) {
    console.error("Error auto-seeding plastic factory data:", err);
  }
};

// ==========================================
// 📜 BILL OF MATERIALS (BOM) APIS
// ==========================================

export const getBOMs = async (req: Request, res: Response) => {
  try {
    await seedPlasticFactoryData();

    const boms = await prisma.billOfMaterial.findMany({
      include: {
        finishedProduct: {
          select: { id: true, name: true, sku: true, price: true, costPrice: true, image: true },
        },
        items: {
          include: {
            rawMaterial: {
              select: { id: true, name: true, sku: true, costPrice: true, stock: true },
            },
          },
        },
        _count: {
          select: { workOrders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, boms });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch BOMs" });
  }
};

export const getBOMById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const bom = await prisma.billOfMaterial.findUnique({
      where: { id },
      include: {
        finishedProduct: true,
        items: {
          include: { rawMaterial: true },
        },
        workOrders: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!bom) {
      return res.status(404).json({ success: false, error: "BOM not found" });
    }

    res.json({ success: true, bom });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch BOM details" });
  }
};

export const createBOM = async (req: Request, res: Response) => {
  try {
    const {
      bomCode,
      name,
      finishedProductId,
      outputQty = 1.0,
      unit = "kg",
      laborCost = 0.0,
      overheadCost = 0.0,
      status = "ACTIVE",
      notes,
      items = [],
    } = req.body;

    if (!bomCode || !name || !finishedProductId) {
      return res.status(400).json({ success: false, error: "Missing required BOM fields" });
    }

    // Calculate material cost
    let materialsSubtotal = 0;
    const itemsData = items.map((item: any) => {
      const qty = Number(item.quantity) || 0;
      const cost = Number(item.unitCost) || 0;
      const subtotal = qty * cost;
      materialsSubtotal += subtotal;
      return {
        rawMaterialId: item.rawMaterialId,
        quantity: qty,
        unit: item.unit || "kg",
        wastePercent: Number(item.wastePercent) || 0,
        unitCost: cost,
        subtotal,
      };
    });

    const totalCost = materialsSubtotal + Number(laborCost) + Number(overheadCost);

    const bom = await prisma.billOfMaterial.create({
      data: {
        bomCode,
        name,
        finishedProductId,
        outputQty: Number(outputQty),
        unit,
        laborCost: Number(laborCost),
        overheadCost: Number(overheadCost),
        totalCost,
        status,
        notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        finishedProduct: true,
        items: { include: { rawMaterial: true } },
      },
    });

    // Optionally update product cost price
    await prisma.product.update({
      where: { id: finishedProductId },
      data: { costPrice: totalCost / (Number(outputQty) || 1) },
    });

    res.status(201).json({ success: true, bom });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create BOM" });
  }
};

export const updateBOM = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      name,
      finishedProductId,
      outputQty,
      unit,
      laborCost,
      overheadCost,
      status,
      notes,
      items,
    } = req.body;

    const existing = await prisma.billOfMaterial.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "BOM not found" });
    }

    let totalCost = existing.totalCost;
    if (items && Array.isArray(items)) {
      // Delete old items and re-create
      await prisma.bomItem.deleteMany({ where: { bomId: id } });

      let materialsSubtotal = 0;
      const itemsData = items.map((item: any) => {
        const qty = Number(item.quantity) || 0;
        const cost = Number(item.unitCost) || 0;
        const subtotal = qty * cost;
        materialsSubtotal += subtotal;
        return {
          bomId: id,
          rawMaterialId: item.rawMaterialId,
          quantity: qty,
          unit: item.unit || "kg",
          wastePercent: Number(item.wastePercent) || 0,
          unitCost: cost,
          subtotal,
        };
      });

      await prisma.bomItem.createMany({ data: itemsData });

      const lCost = laborCost !== undefined ? Number(laborCost) : existing.laborCost;
      const oCost = overheadCost !== undefined ? Number(overheadCost) : existing.overheadCost;
      totalCost = materialsSubtotal + lCost + oCost;
    }

    const updated = await prisma.billOfMaterial.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        finishedProductId: finishedProductId ?? existing.finishedProductId,
        outputQty: outputQty !== undefined ? Number(outputQty) : existing.outputQty,
        unit: unit ?? existing.unit,
        laborCost: laborCost !== undefined ? Number(laborCost) : existing.laborCost,
        overheadCost: overheadCost !== undefined ? Number(overheadCost) : existing.overheadCost,
        totalCost,
        status: status ?? existing.status,
        notes: notes ?? existing.notes,
      },
      include: {
        finishedProduct: true,
        items: { include: { rawMaterial: true } },
      },
    });

    res.json({ success: true, bom: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update BOM" });
  }
};

export const deleteBOM = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.billOfMaterial.delete({ where: { id } });
    res.json({ success: true, message: "BOM deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete BOM" });
  }
};

// ==========================================
// 🏭 WORK ORDERS (คำสั่งผลิต) APIS
// ==========================================

export const getWorkOrders = async (req: Request, res: Response) => {
  try {
    await seedPlasticFactoryData();

    const workOrders = await prisma.workOrder.findMany({
      include: {
        finishedProduct: {
          select: { id: true, name: true, sku: true, image: true, stock: true },
        },
        bom: {
          select: { id: true, bomCode: true, name: true, totalCost: true },
        },
        warehouse: {
          select: { id: true, name: true },
        },
        materials: {
          include: {
            rawMaterial: { select: { id: true, name: true, sku: true, stock: true } },
          },
        },
        scraps: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, workOrders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch work orders" });
  }
};

export const createWorkOrder = async (req: Request, res: Response) => {
  try {
    const {
      orderNo,
      bomId,
      finishedProductId,
      targetQty,
      unit = "kg",
      startDate,
      operator = "Admin",
      machineNo = "Extruder #1",
      warehouseId,
      notes,
    } = req.body;

    if (!orderNo || !finishedProductId || !targetQty) {
      return res.status(400).json({ success: false, error: "Missing required Work Order fields" });
    }

    const tQty = Number(targetQty);

    // If BOM is provided, calculate planned materials
    let materialsCreate: any[] = [];
    let estimatedTotalCost = 0;

    if (bomId) {
      const bom = await prisma.billOfMaterial.findUnique({
        where: { id: bomId },
        include: { items: true },
      });

      if (bom) {
        const ratio = tQty / (bom.outputQty || 1);
        materialsCreate = bom.items.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          plannedQty: item.quantity * ratio,
          actualQty: item.quantity * ratio, // Initial guess
          unit: item.unit,
          unitCost: item.unitCost,
          isDeducted: false,
        }));
        estimatedTotalCost = bom.totalCost * ratio;
      }
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        orderNo,
        bomId: bomId || null,
        finishedProductId,
        targetQty: tQty,
        unit,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: "CONFIRMED",
        operator,
        machineNo,
        warehouseId: warehouseId || null,
        totalCost: estimatedTotalCost,
        notes,
        materials: {
          create: materialsCreate,
        },
      },
      include: {
        finishedProduct: true,
        bom: true,
        materials: { include: { rawMaterial: true } },
      },
    });

    res.status(201).json({ success: true, workOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create Work Order" });
  }
};

export const updateWorkOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, producedQty, scrapQty, actualMaterials } = req.body;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        materials: true,
        finishedProduct: true,
      },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, error: "Work Order not found" });
    }

    // Status transition handling
    if (status === "IN_PROGRESS" && workOrder.status !== "IN_PROGRESS") {
      // Deduct raw materials if not already deducted
      for (const mat of workOrder.materials) {
        if (!mat.isDeducted) {
          const qtyToDeduct = Math.round(mat.plannedQty);
          await recordStockMovement({
            productId: mat.rawMaterialId,
            warehouseId: workOrder.warehouseId || undefined,
            type: "INTERNAL_ISSUE",
            quantityDelta: -qtyToDeduct,
            referenceNo: workOrder.orderNo,
            notes: `เบิกวัตถุดิบเข้ากระบวนการผลิต (${workOrder.orderNo})`,
          });

          await prisma.workOrderMaterial.update({
            where: { id: mat.id },
            data: { isDeducted: true },
          });
        }
      }
    } else if (status === "COMPLETED" && workOrder.status !== "COMPLETED") {
      const finalProducedQty = producedQty !== undefined ? Number(producedQty) : workOrder.targetQty;
      const finalScrapQty = scrapQty !== undefined ? Number(scrapQty) : 0;

      // Increase finished goods stock
      const fgQtyToAdd = Math.round(finalProducedQty);
      await recordStockMovement({
        productId: workOrder.finishedProductId,
        warehouseId: workOrder.warehouseId || undefined,
        type: "ADJUSTMENT_PLUS",
        quantityDelta: fgQtyToAdd,
        referenceNo: workOrder.orderNo,
        notes: `รับสินค้าสำเร็จรูปจากการผลิตเสร็จสมบูรณ์ (${workOrder.orderNo})`,
      });

      // Update actual used materials if supplied
      if (actualMaterials && Array.isArray(actualMaterials)) {
        for (const act of actualMaterials) {
          await prisma.workOrderMaterial.update({
            where: { id: act.id },
            data: { actualQty: Number(act.actualQty) },
          });
        }
      }

      await prisma.workOrder.update({
        where: { id },
        data: {
          status: "COMPLETED",
          producedQty: finalProducedQty,
          scrapQty: finalScrapQty,
          endDate: new Date(),
        },
      });

      const updated = await prisma.workOrder.findUnique({
        where: { id },
        include: { finishedProduct: true, materials: true, scraps: true },
      });

      return res.json({ success: true, workOrder: updated });
    }

    const updated = await prisma.workOrder.update({
      where: { id },
      data: {
        status: status || workOrder.status,
        producedQty: producedQty !== undefined ? Number(producedQty) : workOrder.producedQty,
        scrapQty: scrapQty !== undefined ? Number(scrapQty) : workOrder.scrapQty,
      },
      include: { finishedProduct: true, materials: true },
    });

    res.json({ success: true, workOrder: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update Work Order status" });
  }
};

export const deleteWorkOrder = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.workOrder.delete({ where: { id } });
    res.json({ success: true, message: "Work Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete Work Order" });
  }
};

// ==========================================
// ♻️ PRODUCTION SCRAP & RECYCLING APIS
// ==========================================

export const getProductionScraps = async (req: Request, res: Response) => {
  try {
    await seedPlasticFactoryData();

    const scraps = await prisma.productionScrap.findMany({
      include: {
        workOrder: {
          select: { id: true, orderNo: true, status: true },
        },
        targetRawMaterial: {
          select: { id: true, name: true, sku: true, stock: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, scraps });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch scraps" });
  }
};

export const createProductionScrap = async (req: Request, res: Response) => {
  try {
    const {
      scrapNo,
      workOrderId,
      scrapType = "EDGE_TRIM",
      materialName,
      weightKg,
      targetRawMaterialId,
      notes,
    } = req.body;

    if (!scrapNo || !materialName || !weightKg) {
      return res.status(400).json({ success: false, error: "Missing required Scrap fields" });
    }

    const scrap = await prisma.productionScrap.create({
      data: {
        scrapNo,
        workOrderId: workOrderId || null,
        scrapType,
        materialName,
        weightKg: Number(weightKg),
        targetRawMaterialId: targetRawMaterialId || null,
        notes,
      },
      include: {
        workOrder: true,
        targetRawMaterial: true,
      },
    });

    res.status(201).json({ success: true, scrap });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create scrap record" });
  }
};

export const recycleProductionScrap = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const scrap = await prisma.productionScrap.findUnique({
      where: { id },
      include: { targetRawMaterial: true },
    });

    if (!scrap) {
      return res.status(404).json({ success: false, error: "Scrap record not found" });
    }

    if (scrap.isRecycled) {
      return res.status(400).json({ success: false, error: "Scrap already marked as recycled" });
    }

    if (!scrap.targetRawMaterialId) {
      return res.status(400).json({ success: false, error: "No target raw material specified for recycling" });
    }

    // Add weight to recycled raw material stock
    const qtyToAdd = Math.round(scrap.weightKg);
    await recordStockMovement({
      productId: scrap.targetRawMaterialId,
      type: "ADJUSTMENT_PLUS",
      quantityDelta: qtyToAdd,
      referenceNo: scrap.scrapNo,
      notes: `บดเศษและหลอมวนกลับเข้าสต็อก (${scrap.scrapNo} - ${scrap.materialName})`,
    });

    const updated = await prisma.productionScrap.update({
      where: { id },
      data: {
        isRecycled: true,
        recycledAt: new Date(),
      },
      include: { targetRawMaterial: true },
    });

    res.json({ success: true, scrap: updated, message: `Successfully recycled ${scrap.weightKg} kg into raw materials stock` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to recycle scrap" });
  }
};

export const deleteProductionScrap = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.productionScrap.delete({ where: { id } });
    res.json({ success: true, message: "Scrap record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete scrap" });
  }
};
