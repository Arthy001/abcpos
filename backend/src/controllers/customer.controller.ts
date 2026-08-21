import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/customers
export const getCustomers = async (req: Request, res: Response) => {
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

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch customers" });
  }
};

// GET /api/customers/:id
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch customer" });
  }
};

// POST /api/customers
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, code, phone, email, avatar, country, city, address, points, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Customer Name is required" });
    }

    // Auto generate code if not provided
    let customerCode = code;
    if (!customerCode) {
      const count = await prisma.customer.count();
      customerCode = `CU${String(count + 1).padStart(3, "0")}`;
    }

    const customer = await prisma.customer.create({
      data: {
        code: customerCode,
        name,
        phone: phone || null,
        email: email || null,
        avatar: avatar || null,
        country: country || null,
        city: city || null,
        address: address || null,
        points: points ? Number(points) : 0,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create customer" });
  }
};

// PUT /api/customers/:id
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, code, phone, email, avatar, country, city, address, points, status } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(avatar !== undefined && { avatar }),
        ...(country !== undefined && { country }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(points !== undefined && { points: Number(points) }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update customer" });
  }
};

// DELETE /api/customers/:id
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.customer.delete({ where: { id } });
    res.json({ success: true, message: "Customer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete customer" });
  }
};
