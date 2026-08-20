import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/warehouses
export const getWarehouses = async (req: Request, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(warehouses);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch warehouses" });
  }
};

// GET /api/stores
export const getStores = async (req: Request, res: Response) => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(stores);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch stores" });
  }
};
