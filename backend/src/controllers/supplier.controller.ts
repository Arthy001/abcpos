import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/suppliers
export const getSuppliers = async (req: Request, res: Response) => {
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
        { email: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { country: { contains: String(search) } },
      ];
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: suppliers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch suppliers" });
  }
};

// GET /api/suppliers/:id
export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch supplier" });
  }
};

// POST /api/suppliers
export const createSupplier = async (req: Request, res: Response) => {
  try {
    const { name, code, image, email, phone, country, address, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Supplier Name is required" });
    }

    // Auto generate code if not provided
    let supplierCode = code;
    if (!supplierCode) {
      const count = await prisma.supplier.count();
      supplierCode = `SU${String(count + 1).padStart(3, "0")}`;
    }

    const supplier = await prisma.supplier.create({
      data: {
        code: supplierCode,
        name,
        image: image || null,
        email: email || null,
        phone: phone || null,
        country: country || null,
        address: address || null,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create supplier" });
  }
};

// PUT /api/suppliers/:id
export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, code, image, email, phone, country, address, status } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(image !== undefined && { image }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(country !== undefined && { country }),
        ...(address !== undefined && { address }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: supplier });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update supplier" });
  }
};

// DELETE /api/suppliers/:id
export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.supplier.delete({ where: { id } });
    res.json({ success: true, message: "Supplier deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete supplier" });
  }
};
