import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/designations
export const getDesignations = async (req: Request, res: Response) => {
  try {
    const { status, department, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (department && department !== "all") {
      where.department = String(department);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { department: { contains: String(search) } },
      ];
    }

    const designations = await prisma.designation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: designations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch designations" });
  }
};

// POST /api/designations
export const createDesignation = async (req: Request, res: Response) => {
  try {
    const { name, department, totalMembers, status } = req.body;

    if (!name || !department) {
      return res.status(400).json({ success: false, message: "Designation Name and Department are required" });
    }

    const designation = await prisma.designation.create({
      data: {
        name,
        department,
        totalMembers: totalMembers ? Number(totalMembers) : 0,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: designation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create designation" });
  }
};

// PUT /api/designations/:id
export const updateDesignation = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, department, totalMembers, status } = req.body;

    const designation = await prisma.designation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(department && { department }),
        ...(totalMembers !== undefined && { totalMembers: Number(totalMembers) }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: designation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update designation" });
  }
};

// DELETE /api/designations/:id
export const deleteDesignation = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.designation.delete({ where: { id } });
    res.json({ success: true, message: "Designation deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete designation" });
  }
};
