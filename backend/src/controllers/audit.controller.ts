import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { logActivity } from "../services/audit.service";

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, entityType, search } = req.query;

    const where: any = {};

    if (action && action !== "all") {
      where.action = String(action);
    }

    if (entityType && entityType !== "all") {
      where.entityType = String(entityType);
    }

    if (search && typeof search === "string" && search.trim()) {
      const term = search.trim();
      where.OR = [
        { entityName: { contains: term } },
        { user: { contains: term } },
        { data: { contains: term } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(logs);
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

export const restoreFromAuditLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const log = await prisma.auditLog.findUnique({ where: { id } });

    if (!log) {
      res.status(404).json({ error: "Audit log not found" });
      return;
    }

    if (log.action !== "DELETE") {
      res.status(400).json({ error: "This item has already been restored." });
      return;
    }

    const rawData = JSON.parse(log.data);
    let restoredItem: any = null;

    // Helper to generate unique slug if needed
    const ensureUniqueSlug = (slug: string) => {
      const random = Math.floor(1000 + Math.random() * 9000);
      return `${slug}-${random}`;
    };

    switch (log.entityType) {
      case "CATEGORY": {
        let slug = rawData.slug || rawData.name.toLowerCase().replace(/\s+/g, "-");
        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) slug = ensureUniqueSlug(slug);

        restoredItem = await prisma.category.create({
          data: {
            name: rawData.name,
            slug,
            description: rawData.description || null,
            status: rawData.status || "ACTIVE",
          },
        });
        break;
      }

      case "SUBCATEGORY": {
        let slug = rawData.slug || rawData.name.toLowerCase().replace(/\s+/g, "-");
        const existing = await prisma.subCategory.findUnique({ where: { slug } });
        if (existing) slug = ensureUniqueSlug(slug);

        // Ensure category still exists or fallback to first available
        let categoryId = rawData.categoryId;
        if (categoryId) {
          const cat = await prisma.category.findUnique({ where: { id: categoryId } });
          if (!cat) {
            const firstCat = await prisma.category.findFirst();
            categoryId = firstCat ? firstCat.id : null;
          }
        }

        if (!categoryId) {
          res.status(400).json({ error: "Cannot restore sub-category because no parent category exists." });
          return;
        }

        restoredItem = await prisma.subCategory.create({
          data: {
            name: rawData.name,
            slug,
            code: rawData.code || null,
            description: rawData.description || null,
            image: rawData.image || null,
            status: rawData.status || "ACTIVE",
            categoryId,
          },
        });
        break;
      }

      case "BRAND": {
        let slug = rawData.slug || rawData.name.toLowerCase().replace(/\s+/g, "-");
        const existing = await prisma.brand.findUnique({ where: { slug } });
        if (existing) slug = ensureUniqueSlug(slug);

        restoredItem = await prisma.brand.create({
          data: {
            name: rawData.name,
            slug,
            image: rawData.image || null,
            status: rawData.status || "ACTIVE",
          },
        });
        break;
      }

      case "UNIT": {
        let shortName = rawData.shortName;
        const existing = await prisma.unit.findUnique({ where: { shortName } });
        if (existing) shortName = `${shortName}-${Math.floor(100 + Math.random() * 900)}`;

        restoredItem = await prisma.unit.create({
          data: {
            name: rawData.name,
            shortName,
            status: rawData.status || "ACTIVE",
          },
        });
        break;
      }

      case "WAREHOUSE": {
        restoredItem = await prisma.warehouse.create({
          data: {
            name: rawData.name,
            contactPerson: rawData.contactPerson || null,
            contactAvatar: rawData.contactAvatar || null,
            phone: rawData.phone || null,
            totalProducts: rawData.totalProducts || 0,
            stock: rawData.stock || 0,
            qty: rawData.qty || 0,
            code: rawData.code || null,
            address: rawData.address || null,
            status: rawData.status || "ACTIVE",
          },
        });
        break;
      }

      case "STORE": {
        restoredItem = await prisma.store.create({
          data: {
            name: rawData.name,
            userName: rawData.userName || null,
            email: rawData.email || null,
            phone: rawData.phone || null,
            code: rawData.code || null,
            address: rawData.address || null,
            status: rawData.status || "ACTIVE",
          },
        });
        break;
      }

      case "WARRANTY": {
        restoredItem = await prisma.warranty.create({
          data: {
            name: rawData.name,
            description: rawData.description || null,
            duration: rawData.duration || "1 Year",
            status: rawData.status || "ACTIVE",
          },
        });
        break;
      }

      case "VARIANT": {
        restoredItem = await prisma.variantAttribute.create({
          data: {
            name: rawData.name,
            values: rawData.values || "",
            status: rawData.status || "ACTIVE",
          },
        });
        break;
      }

      case "PRODUCT": {
        let existingProduct: any = null;
        if (log.entityId) {
          existingProduct = await prisma.product.findUnique({ where: { id: log.entityId } });
        }
        if (!existingProduct && rawData.sku) {
          existingProduct = await prisma.product.findUnique({ where: { sku: rawData.sku } });
        }

        if (existingProduct) {
          restoredItem = await prisma.product.update({
            where: { id: existingProduct.id },
            data: { status: "ACTIVE" },
          });
        } else {
          let sku = rawData.sku;
          let slug = rawData.slug || rawData.name.toLowerCase().replace(/\s+/g, "-");

          restoredItem = await prisma.product.create({
            data: {
              name: rawData.name,
              slug,
              sku,
              barcode: rawData.barcode || null,
              description: rawData.description || null,
              price: Number(rawData.price || 0),
              costPrice: Number(rawData.costPrice || 0),
              stock: Number(rawData.stock || 0),
              minStockAlert: Number(rawData.minStockAlert || 5),
              categoryId: rawData.categoryId || null,
              brandId: rawData.brandId || null,
              unitId: rawData.unitId || null,
              warehouseId: rawData.warehouseId || null,
              storeId: rawData.storeId || null,
              image: rawData.image || null,
              status: "ACTIVE",
              manufacturedDate: rawData.manufacturedDate || null,
              expiredDate: rawData.expiredDate || null,
            },
          });
        }
        break;
      }

      default:
        res.status(400).json({ error: `Unsupported entity type: ${log.entityType}` });
        return;
    }

    // Mark the current audit log as RESTORED so it cannot be restored again
    await prisma.auditLog.update({
      where: { id: log.id },
      data: {
        action: "RESTORED",
      },
    });

    res.json({
      message: `Successfully restored ${log.entityType} "${log.entityName}"`,
      item: restoredItem,
    });
  } catch (error: any) {
    console.error("Error restoring from audit log:", error);
    res.status(500).json({ error: error.message || "Failed to restore item" });
  }
};

export const deleteAuditLog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.auditLog.delete({ where: { id } });
    res.json({ message: "Audit log deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting audit log:", error);
    res.status(500).json({ error: "Failed to delete audit log" });
  }
};
