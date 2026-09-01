import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { logActivity } from "../services/audit.service.js";

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
      include: {
        productStocks: true,
        products: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute real-time stock balances and product counts per warehouse
    const enhancedWarehouses = warehouses.map((wh) => {
      const activeStocks = wh.productStocks || [];
      const distinctProductsCount = activeStocks.filter((ps) => ps.quantity > 0).length || wh.products?.length || 0;
      const totalStockQty = activeStocks.reduce((sum, ps) => sum + ps.quantity, 0) || wh.stock || 0;

      return {
        ...wh,
        totalProducts: distinctProductsCount,
        stock: totalStockQty,
        qty: totalStockQty,
      };
    });

    res.json({ success: true, data: enhancedWarehouses });
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
        productStocks: {
          include: {
            product: true,
          },
        },
        products: true,
      },
    });

    if (!warehouse) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    const activeStocks = warehouse.productStocks || [];
    const distinctProductsCount = activeStocks.filter((ps) => ps.quantity > 0).length || warehouse.products?.length || 0;
    const totalStockQty = activeStocks.reduce((sum, ps) => sum + ps.quantity, 0) || warehouse.stock || 0;

    const enhanced = {
      ...warehouse,
      totalProducts: distinctProductsCount,
      stock: totalStockQty,
      qty: totalStockQty,
    };

    res.json({ success: true, data: enhanced });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch warehouse" });
  }
};

// POST /api/warehouses
export const createWarehouse = async (req: Request, res: Response) => {
  try {
    const { name, contactPerson, contactAvatar, phone, code, address, status } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Warehouse Name is required" });
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        contactPerson: contactPerson || null,
        contactAvatar: contactAvatar || null,
        phone: phone || null,
        totalProducts: 0,
        stock: 0,
        qty: 0,
        code: code || `WH-${Math.floor(100 + Math.random() * 900)}`,
        address: address || null,
        status: status ? String(status).toUpperCase() : "ACTIVE",
      },
    });

    // Auto-create ProductStock rows for all existing products in this new warehouse
    const allProducts = await prisma.product.findMany();
    for (const prod of allProducts) {
      await prisma.productStock.create({
        data: {
          productId: prod.id,
          warehouseId: warehouse.id,
          quantity: 0,
          minAlert: prod.minStockAlert || 5,
        },
      });
    }

    res.status(201).json({ success: true, data: warehouse });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create warehouse" });
  }
};

// PUT /api/warehouses/:id
export const updateWarehouse = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, contactPerson, contactAvatar, phone, code, address, status } = req.body;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(contactAvatar !== undefined && { contactAvatar }),
        ...(phone !== undefined && { phone }),
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
