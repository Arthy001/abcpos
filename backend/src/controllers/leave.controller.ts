import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// ==================== LEAVE TYPES ====================

// GET /api/leave-types
export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.name = { contains: String(search) };
    }

    const types = await prisma.leaveType.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: types });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch leave types" });
  }
};

// POST /api/leave-types
export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { name, quota, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Leave Type Name is required" });
    }

    const type = await prisma.leaveType.create({
      data: {
        name,
        quota: quota !== undefined ? Number(quota) : 5,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: type });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create leave type" });
  }
};

// PUT /api/leave-types/:id
export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, quota, status } = req.body;

    const type = await prisma.leaveType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(quota !== undefined && { quota: Number(quota) }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: type });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update leave type" });
  }
};

// DELETE /api/leave-types/:id
export const deleteLeaveType = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.leaveType.delete({ where: { id } });
    res.json({ success: true, message: "Leave type deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete leave type" });
  }
};

// ==================== LEAVES ====================

// GET /api/leaves
export const getLeaves = async (req: Request, res: Response) => {
  try {
    const { status, type, empCode, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (type && type !== "all") {
      where.leaveType = String(type);
    }
    if (empCode) {
      where.empCode = String(empCode);
    }
    if (search) {
      where.OR = [
        { empCode: { contains: String(search) } },
        { employeeName: { contains: String(search) } },
        { leaveType: { contains: String(search) } },
        { fromDate: { contains: String(search) } },
      ];
    }

    const leaves = await prisma.leave.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: leaves });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch leaves" });
  }
};

// POST /api/leaves
export const createLeave = async (req: Request, res: Response) => {
  try {
    const {
      empCode,
      employeeName,
      employeeRole,
      employeeAvatar,
      leaveType,
      fromDate,
      toDate,
      duration,
      appliedOn,
      shift,
      reason,
      status,
    } = req.body;

    if (!leaveType || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: "Leave Type and Dates are required" });
    }

    const leave = await prisma.leave.create({
      data: {
        empCode: empCode || "EMP001",
        employeeName: employeeName || "Carl Evans",
        employeeRole: employeeRole || "Staff",
        employeeAvatar: employeeAvatar || "/assets/images/customer11.jpg",
        leaveType,
        fromDate,
        toDate,
        duration: duration || "01 Day",
        appliedOn: appliedOn || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        shift: shift || "Regular",
        reason: reason || null,
        status: status ? String(status).toUpperCase() : "APPLIED",
      },
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create leave" });
  }
};

// PUT /api/leaves/:id
export const updateLeave = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      leaveType,
      fromDate,
      toDate,
      duration,
      status,
      reason,
    } = req.body;

    const leave = await prisma.leave.update({
      where: { id },
      data: {
        ...(leaveType && { leaveType }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
        ...(duration && { duration }),
        ...(status && { status: String(status).toUpperCase() }),
        ...(reason !== undefined && { reason }),
      },
    });

    res.json({ success: true, data: leave });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update leave" });
  }
};

// DELETE /api/leaves/:id
export const deleteLeave = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.leave.delete({ where: { id } });
    res.json({ success: true, message: "Leave deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete leave" });
  }
};
