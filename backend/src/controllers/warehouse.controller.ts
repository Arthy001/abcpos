import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/warehouses
export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { contactPerson: { contains: String(search) } },
        { phone: { contains: String(search) } },
      ];
    }

    const warehouses = await prisma.warehouse.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: warehouses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch warehouses" });
  }
};

// GET /api/warehouses/:id
export const getWarehouseById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    res.json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch warehouse" });
  }
};

// POST /api/warehouses
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, contactAvatar, phone, totalProducts, stock, qty, code, address, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Warehouse Name is required" });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        contactPerson: contactPerson || null,
        contactAvatar: contactAvatar || null,
        phone: phone || null,
        totalProducts: totalProducts ? Number(totalProducts) : 0,
        stock: stock ? Number(stock) : 0,
        qty: qty ? Number(qty) : 0,
        code: code || null,
        address: address || null,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create warehouse" });
  }
};

// PUT /api/warehouses/:id
export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, contactPerson, contactAvatar, phone, totalProducts, stock, qty, code, address, status } = req.body;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(contactAvatar !== undefined && { contactAvatar }),
        ...(phone !== undefined && { phone }),
        ...(totalProducts !== undefined && { totalProducts: Number(totalProducts) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(qty !== undefined && { qty: Number(qty) }),
        ...(code !== undefined && { code }),
        ...(address !== undefined && { address }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update warehouse" });
  }
};

import { logActivity } from "../services/audit.service.js";

// DELETE /api/warehouses/:id
export const deleteWarehouse = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });
    if (warehouse) {
      await logActivity({
        action: "DELETE",
        entityType: "WAREHOUSE",
        entityId: warehouse.id,
        entityName: warehouse.name,
        user: "Admin",
        data: warehouse,
      });
    }
    await prisma.warehouse.delete({ where: { id } });
    res.json({ success: true, message: "Warehouse deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete warehouse" });
  }
};
