import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/holidays
export const getHolidays = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
        { date: { contains: String(search) } },
      ];
    }

    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: holidays });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch holidays" });
  }
};

// POST /api/holidays
export const createHoliday = async (req: Request, res: Response) => {
  try {
    const { name, date, description, status } = req.body;

    if (!name || !date) {
      return res.status(400).json({ success: false, message: "Holiday Name and Date are required" });
    }

    const holiday = await prisma.holiday.create({
      data: {
        name,
        date,
        description: description || null,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: holiday });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create holiday" });
  }
};

// PUT /api/holidays/:id
export const updateHoliday = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, date, description, status } = req.body;

    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(date && { date }),
        ...(description !== undefined && { description }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: holiday });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update holiday" });
  }
};

// DELETE /api/holidays/:id
export const deleteHoliday = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.holiday.delete({ where: { id } });
    res.json({ success: true, message: "Holiday deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete holiday" });
  }
};
