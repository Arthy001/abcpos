import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/warranties
export const getWarranties = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const warranties = await prisma.warranty.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(warranties);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch warranties" });
  }
};

// POST /api/warranties
export const createWarranty = async (req: Request, res: Response) => {
  try {
    const { name, description, duration, status } = req.body;

    if (!name || !duration) {
      return res.status(400).json({ error: "Warranty Name and Duration are required" });
    }

    const warranty = await prisma.warranty.create({
      data: {
        name,
        description: description || null,
        duration,
        status: status || "ACTIVE",
      },
    });

    res.status(201).json(warranty);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create warranty" });
  }
};

// PUT /api/warranties/:id
export const updateWarranty = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, description, duration, status } = req.body;

    const warranty = await prisma.warranty.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(duration && { duration }),
        ...(status && { status }),
      },
    });

    res.json(warranty);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update warranty" });
  }
};

import { logActivity } from "../services/audit.service.js";

// DELETE /api/warranties/:id
export const deleteWarranty = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const warranty = await prisma.warranty.findUnique({ where: { id } });
    if (warranty) {
      await logActivity({
        action: "DELETE",
        entityType: "WARRANTY",
        entityId: warranty.id,
        entityName: warranty.name,
        user: "Admin",
        data: warranty,
      });
    }
    await prisma.warranty.delete({ where: { id } });
    res.json({ success: true, message: "Warranty deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete warranty" });
  }
};
