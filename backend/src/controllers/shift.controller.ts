import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/shifts
export const getShifts = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { timing: { contains: String(search) } },
        { weekOff: { contains: String(search) } },
      ];
    }

    const shifts = await prisma.shift.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: shifts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch shifts" });
  }
};

// POST /api/shifts
export const createShift = async (req: Request, res: Response) => {
  try {
    const { name, timing, weekOff, status } = req.body;

    if (!name || !timing) {
      return res.status(400).json({ success: false, message: "Shift Name and Timing are required" });
    }

    const shift = await prisma.shift.create({
      data: {
        name,
        timing,
        weekOff: weekOff || "Sunday",
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: shift });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create shift" });
  }
};

// PUT /api/shifts/:id
export const updateShift = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, timing, weekOff, status } = req.body;

    const shift = await prisma.shift.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(timing && { timing }),
        ...(weekOff !== undefined && { weekOff }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: shift });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update shift" });
  }
};

// DELETE /api/shifts/:id
export const deleteShift = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.shift.delete({ where: { id } });
    res.json({ success: true, message: "Shift deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete shift" });
  }
};
