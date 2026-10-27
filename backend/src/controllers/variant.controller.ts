import { Request, Response } from "express";
import { logActivity } from "../services/audit.service.js";
import { prisma } from "../lib/prisma.js";

// GET /api/variant-attributes
export const getVariantAttributes = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { values: { contains: String(search) } },
      ];
    }

    const variants = await prisma.variantAttribute.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(variants);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch variant attributes" });
  }
};

// POST /api/variant-attributes
export const createVariantAttribute = async (req: Request, res: Response) => {
  try {
    const { name, values, status } = req.body;

    if (!name || !values) {
      return res.status(400).json({ error: "Variant Name and Values are required" });
    }

    const variant = await prisma.variantAttribute.create({
      data: {
        name,
        values,
        status: status || "ACTIVE",
      },
    });

    await logActivity({
      action: "CREATE",
      entityType: "VARIANT",
      entityId: variant.id,
      entityName: variant.name,
      user: "Admin",
      data: variant,
    });
    res.status(201).json(variant);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create variant attribute" });
  }
};

// PUT /api/variant-attributes/:id
export const updateVariantAttribute = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, values, status } = req.body;

    const variant = await prisma.variantAttribute.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(values && { values }),
        ...(status && { status }),
      },
    });

    await logActivity({
      action: "UPDATE",
      entityType: "VARIANT",
      entityId: variant.id,
      entityName: variant.name,
      user: "Admin",
      data: variant,
    });
    res.json(variant);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update variant attribute" });
  }
};


// DELETE /api/variant-attributes/:id
export const deleteVariantAttribute = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const variant = await prisma.variantAttribute.findUnique({ where: { id } });
    if (variant) {
      await logActivity({
        action: "DELETE",
        entityType: "VARIANT",
        entityId: variant.id,
        entityName: variant.name,
        user: "Admin",
        data: variant,
      });
    }
    await prisma.variantAttribute.delete({ where: { id } });
    res.json({ success: true, message: "Variant attribute deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete variant attribute" });
  }
};
