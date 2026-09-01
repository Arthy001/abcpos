import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { logActivity } from "../services/audit.service.js";

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
      include: {
        products: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const enhanced = stores.map((st) => ({
      ...st,
      totalProducts: st.products?.length || 0,
      stock: st.products?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0,
    }));

    res.json({ success: true, data: enhanced });
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
      include: {
        products: true,
      },
    });

    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    const enhanced = {
      ...store,
      totalProducts: store.products?.length || 0,
      stock: store.products?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0,
    };

    res.json({ success: true, data: enhanced });
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
        code: code || `STR-${Math.floor(100 + Math.random() * 900)}`,
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
    const store = await prisma.store.findUnique({ where: { id } });
    if (store) {
      await logActivity({
        action: "DELETE",
        entityType: "STORE",
        entityId: store.id,
        entityName: store.name,
        user: "Admin",
        data: store,
      });
    }
    await prisma.store.delete({ where: { id } });
    res.json({ success: true, message: "Store deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete store" });
  }
};
