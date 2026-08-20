import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { categoryId, search, status } = req.query;

    const where: any = {};
    if (categoryId && categoryId !== "all") {
      where.categoryId = String(categoryId);
    }
    if (status) {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { sku: { contains: String(search) } },
        { barcode: { contains: String(search) } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, sku, barcode, description, price, costPrice, stock, minStockAlert, categoryId, image } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        barcode,
        description,
        price: Number(price),
        costPrice: Number(costPrice || 0),
        stock: Number(stock || 0),
        minStockAlert: Number(minStockAlert || 5),
        categoryId,
        image,
        status: Number(stock) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
      },
      include: { category: true },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, sku, barcode, description, price, costPrice, stock, minStockAlert, categoryId, image, status } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        barcode,
        description,
        ...(price !== undefined && { price: Number(price) }),
        ...(costPrice !== undefined && { costPrice: Number(costPrice) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(minStockAlert !== undefined && { minStockAlert: Number(minStockAlert) }),
        categoryId,
        image,
        status,
      },
      include: { category: true },
    });

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
