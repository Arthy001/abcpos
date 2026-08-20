import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

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

    const unit = await prisma.unit.create({
      data: {
        name,
        shortName,
        status: status || "ACTIVE",
      },
    });

    res.status(201).json(unit);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create unit" });
  }
};

// PUT /api/units/:id
export const updateUnit = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, shortName, status } = req.body;

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(shortName && { shortName }),
        ...(status && { status }),
      },
    });

    res.json(unit);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update unit" });
  }
};

// DELETE /api/units/:id
export const deleteUnit = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.unit.delete({ where: { id } });
    res.json({ success: true, message: "Unit deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete unit" });
  }
};
