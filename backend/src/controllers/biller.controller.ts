import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/billers
export const getBillers = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { code: { contains: String(search) } },
        { companyName: { contains: String(search) } },
        { email: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { country: { contains: String(search) } },
      ];
    }

    const billers = await prisma.biller.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: billers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch billers" });
  }
};

// GET /api/billers/:id
export const getBillerById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const biller = await prisma.biller.findUnique({
      where: { id },
    });

    if (!biller) {
      return res.status(404).json({ success: false, message: "Biller not found" });
    }

    res.json({ success: true, data: biller });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch biller" });
  }
};

// POST /api/billers
export const createBiller = async (req: Request, res: Response) => {
  try {
    const { name, code, avatar, companyName, email, phone, country, address, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Biller Name is required" });
    }

    // Auto generate code if not provided
    let billerCode = code;
    if (!billerCode) {
      const count = await prisma.biller.count();
      billerCode = `BI${String(count + 1).padStart(3, "0")}`;
    }

    const biller = await prisma.biller.create({
      data: {
        code: billerCode,
        name,
        avatar: avatar || null,
        companyName: companyName || null,
        email: email || null,
        phone: phone || null,
        country: country || null,
        address: address || null,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: biller });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create biller" });
  }
};

// PUT /api/billers/:id
export const updateBiller = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, code, avatar, companyName, email, phone, country, address, status } = req.body;

    const biller = await prisma.biller.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(avatar !== undefined && { avatar }),
        ...(companyName !== undefined && { companyName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(country !== undefined && { country }),
        ...(address !== undefined && { address }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: biller });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update biller" });
  }
};

// DELETE /api/billers/:id
export const deleteBiller = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.biller.delete({ where: { id } });
    res.json({ success: true, message: "Biller deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete biller" });
  }
};
