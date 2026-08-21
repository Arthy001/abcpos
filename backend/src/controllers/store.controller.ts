import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/stores
export const getStores = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { userName: { contains: String(search) } },
        { email: { contains: String(search) } },
        { phone: { contains: String(search) } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: stores });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch stores" });
  }
};

// GET /api/stores/:id
export const getStoreById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const store = await prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    res.json({ success: true, data: store });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch store" });
  }
};

// POST /api/stores
export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, userName, email, phone, code, address, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Store Name is required" });
    }

    const store = await prisma.store.create({
      data: {
        name,
        userName: userName || null,
        email: email || null,
        phone: phone || null,
        code: code || null,
        address: address || null,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    res.status(201).json({ success: true, data: store });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create store" });
  }
};

// PUT /api/stores/:id
export const updateStore = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, userName, email, phone, code, address, status } = req.body;

    const store = await prisma.store.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(userName !== undefined && { userName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(code !== undefined && { code }),
        ...(address !== undefined && { address }),
        ...(status && { status: String(status).toUpperCase() }),
      },
    });

    res.json({ success: true, data: store });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update store" });
  }
};

// DELETE /api/stores/:id
export const deleteStore = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.store.delete({ where: { id } });
    res.json({ success: true, message: "Store deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete store" });
  }
};
