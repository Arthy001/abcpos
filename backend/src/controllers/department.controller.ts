import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/departments
export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { headName: { contains: String(search) } },
      ];
    }

    const departments = await prisma.department.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: departments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch departments" });
  }
};

// POST /api/departments
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, headName, headAvatar, totalMembers, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Department Name is required" });
    }

    const department = await prisma.department.create({
      data: {
        name,
        headName: headName || null,
        headAvatar: headAvatar || null,
        totalMembers: totalMembers ? Number(totalMembers) : 0,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: department });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create department" });
  }
};

// PUT /api/departments/:id
export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, headName, headAvatar, totalMembers, status } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(headName !== undefined && { headName }),
        ...(headAvatar !== undefined && { headAvatar }),
        ...(totalMembers !== undefined && { totalMembers: Number(totalMembers) }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: department });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update department" });
  }
};

// DELETE /api/departments/:id
export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.department.delete({ where: { id } });
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete department" });
  }
};
