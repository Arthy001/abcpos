import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { logActivity } from "../services/audit.service.js";

// GET /api/units
export const getUnits = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { shortName: { contains: String(search) } },
      ];
    }

    const units = await prisma.unit.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(units);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch units" });
  }
};

// POST /api/units
export const createUnit = async (req: Request, res: Response) => {
  try {
    const { name, shortName, status } = req.body;

    if (!name || !shortName) {
      return res.status(400).json({ error: "Unit Name and Short Name are required" });
    }

    const trimmedShortName = String(shortName).trim();
    const trimmedName = String(name).trim();

    // 1. Pre-validation: ตรวจสอบข้อมูลซ้ำล่วงหน้า
    const existing = await prisma.unit.findUnique({
      where: { shortName: trimmedShortName },
    });

    if (existing) {
      return res.status(400).json({
        error: `Unit short name "${trimmedShortName}" already exists (currently used by: "${existing.name}"). Please choose a different short name.`,
      });
    }

    const unit = await prisma.unit.create({
      data: {
        name: trimmedName,
        shortName: trimmedShortName,
        status: status || "ACTIVE",
      },
    });

    await logActivity({
      action: "CREATE",
      entityType: "UNIT",
      entityId: unit.id,
      entityName: unit.name,
      data: { name: unit.name, shortName: unit.shortName, status: unit.status },
    });

    res.status(201).json(unit);
  } catch (error: any) {
    // 2. Prisma P2002 Unique Constraint Fallback
    if ((error as any).code === "P2002") {
      return res.status(400).json({
        error: `Unit short name "${req.body.shortName}" already exists. Please choose a different short name.`,
      });
    }
    res.status(500).json({ error: "Failed to save unit. Please try again." });
  }
};

// PUT /api/units/:id
export const updateUnit = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, shortName, status } = req.body;

    if (shortName) {
      const trimmedShortName = String(shortName).trim();
      const existing = await prisma.unit.findUnique({
        where: { shortName: trimmedShortName },
      });

      if (existing && existing.id !== id) {
        return res.status(400).json({
          error: `Unit short name "${trimmedShortName}" already exists (used by: "${existing.name}"). Please choose a different short name.`,
        });
      }
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(name && { name: String(name).trim() }),
        ...(shortName && { shortName: String(shortName).trim() }),
        ...(status && { status }),
      },
    });

    await logActivity({
      action: "UPDATE",
      entityType: "UNIT",
      entityId: unit.id,
      entityName: unit.name,
      data: { name: unit.name, shortName: unit.shortName, status: unit.status },
    });

    res.json(unit);
  } catch (error: any) {
    if ((error as any).code === "P2002") {
      return res.status(400).json({
        error: `Unit short name "${req.body.shortName}" already exists. Please choose a different short name.`,
      });
    }
    res.status(500).json({ error: "Failed to update unit. Please try again." });
  }
};

// DELETE /api/units/:id
export const deleteUnit = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const unit = await prisma.unit.findUnique({ where: { id } });
    if (unit) {
      await logActivity({
        action: "DELETE",
        entityType: "UNIT",
        entityId: id,
        entityName: unit.name,
        data: { name: unit.name, shortName: unit.shortName },
      });
    }

    await prisma.unit.delete({
      where: { id },
    });

    res.json({ message: "Unit deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Cannot delete this unit because products are still associated with it." });
  }
};
