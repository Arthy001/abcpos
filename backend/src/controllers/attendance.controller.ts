import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/attendance
export const getAttendanceRecords = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { date: { contains: String(search) } },
        { employeeName: { contains: String(search) } },
        { status: { contains: String(search) } },
      ];
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const totalWorkingDays = 31;
    const absentDays = 5;
    const presentDays = 28;
    const halfDays = 2;
    const lateDays = 1;
    const holidays = 2;

    res.json({
      success: true,
      data: records,
      summary: {
        totalWorkingDays,
        absentDays,
        presentDays,
        halfDays,
        lateDays,
        holidays,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch attendance records" });
  }
};

// POST /api/attendance
export const createAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const { date, status, clockIn, clockOut, production, breakTime, overtime, totalHours, progress } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    const record = await prisma.attendance.create({
      data: {
        date,
        status: status ? String(status).toUpperCase() : "PRESENT",
        clockIn: clockIn || "-",
        clockOut: clockOut || "-",
        production: production || "-",
        breakTime: breakTime || "-",
        overtime: overtime || "-",
        totalHours: totalHours || "-",
        progress: progress !== undefined ? Number(progress) : 80,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create attendance record" });
  }
};

// PUT /api/attendance/:id
export const updateAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { date, status, clockIn, clockOut, production, breakTime, overtime, totalHours, progress } = req.body;

    const record = await prisma.attendance.update({
      where: { id },
      data: {
        ...(date && { date }),
        ...(status && { status: String(status).toUpperCase() }),
        ...(clockIn !== undefined && { clockIn }),
        ...(clockOut !== undefined && { clockOut }),
        ...(production !== undefined && { production }),
        ...(breakTime !== undefined && { breakTime }),
        ...(overtime !== undefined && { overtime }),
        ...(totalHours !== undefined && { totalHours }),
        ...(progress !== undefined && { progress: Number(progress) }),
      },
    });

    res.json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update attendance record" });
  }
};

// DELETE /api/attendance/:id
export const deleteAttendanceRecord = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.attendance.delete({ where: { id } });
    res.json({ success: true, message: "Attendance record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete attendance record" });
  }
};
