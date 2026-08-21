import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/payroll
export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { empCode: { contains: String(search) } },
        { employeeName: { contains: String(search) } },
        { email: { contains: String(search) } },
        { employeeRole: { contains: String(search) } },
      ];
    }

    const list = await prisma.payroll.findMany({
      where,
      orderBy: { empCode: "asc" },
    });

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch payroll records" });
  }
};

// GET /api/payroll/:id
export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const item = await prisma.payroll.findUnique({
      where: { id },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Payroll record not found" });
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch payroll record" });
  }
};

// POST /api/payroll
export const createPayroll = async (req: Request, res: Response) => {
  try {
    const {
      empCode,
      employeeName,
      employeeRole,
      employeeAvatar,
      email,
      salary,
      basicSalary,
      hra,
      conveyance,
      medical,
      bonus,
      pf,
      professionalTax,
      tds,
      loans,
      payPeriod,
      location,
      status,
    } = req.body;

    if (!employeeName) {
      return res.status(400).json({ success: false, message: "Employee Name is required" });
    }

    const item = await prisma.payroll.create({
      data: {
        empCode: empCode || "EMP001",
        employeeName,
        employeeRole: employeeRole || "Staff",
        employeeAvatar: employeeAvatar || "/assets/images/customer11.jpg",
        email: email || `${employeeName.toLowerCase().replace(/\s+/g, "")}@example.com`,
        salary: salary ? Number(salary) : 30000,
        basicSalary: basicSalary ? Number(basicSalary) : salary ? Number(salary) : 30000,
        hra: hra ? Number(hra) : 0,
        conveyance: conveyance ? Number(conveyance) : 0,
        medical: medical ? Number(medical) : 0,
        bonus: bonus ? Number(bonus) : 0,
        pf: pf ? Number(pf) : 0,
        professionalTax: professionalTax ? Number(professionalTax) : 0,
        tds: tds ? Number(tds) : 0,
        loans: loans ? Number(loans) : 0,
        payPeriod: payPeriod || "Jan 2026",
        location: location || "USA",
        status: status ? String(status).toUpperCase() : "PAID",
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create payroll record" });
  }
};

// PUT /api/payroll/:id
export const updatePayroll = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      salary,
      basicSalary,
      hra,
      conveyance,
      medical,
      bonus,
      pf,
      professionalTax,
      tds,
      loans,
      status,
    } = req.body;

    const item = await prisma.payroll.update({
      where: { id },
      data: {
        ...(salary !== undefined && { salary: Number(salary) }),
        ...(basicSalary !== undefined && { basicSalary: Number(basicSalary) }),
        ...(hra !== undefined && { hra: Number(hra) }),
        ...(conveyance !== undefined && { conveyance: Number(conveyance) }),
        ...(medical !== undefined && { medical: Number(medical) }),
        ...(bonus !== undefined && { bonus: Number(bonus) }),
        ...(pf !== undefined && { pf: Number(pf) }),
        ...(professionalTax !== undefined && { professionalTax: Number(professionalTax) }),
        ...(tds !== undefined && { tds: Number(tds) }),
        ...(loans !== undefined && { loans: Number(loans) }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update payroll record" });
  }
};

// DELETE /api/payroll/:id
export const deletePayroll = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.payroll.delete({ where: { id } });
    res.json({ success: true, message: "Payroll record deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete payroll record" });
  }
};
