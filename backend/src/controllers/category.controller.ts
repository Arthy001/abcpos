import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// ==================== CATEGORIES ====================

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && status !== "all") {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { slug: { contains: String(search) } },
      ];
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true, subCategories: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, status = "ACTIVE" } = req.body;
    const finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description,
        status,
      },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, slug, description, status } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        status,
      },
    });
    res.json({ success: true, data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { logActivity } from "../services/audit.service.js";

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });
    if (category) {
      await logActivity({
        action: "DELETE",
        entityType: "CATEGORY",
        entityId: category.id,
        entityName: category.name,
        user: "Admin",
        data: category,
      });
    }
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SUB CATEGORIES ====================

export const getSubCategories = async (req: Request, res: Response) => {
  try {
    const { categoryId, status, search } = req.query;
    const where: any = {};

    if (categoryId && categoryId !== "all") {
      where.categoryId = String(categoryId);
    }
    if (status && status !== "all") {
      where.status = String(status);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { code: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const subCategories = await prisma.subCategory.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: subCategories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, code, description, image, status = "ACTIVE", categoryId } = req.body;
    const finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const subCategory = await prisma.subCategory.create({
      data: {
        name,
        slug: finalSlug,
        code,
        description,
        image,
        status,
        categoryId,
      },
      include: {
        category: true,
      },
    });
    res.status(201).json({ success: true, data: subCategory });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, slug, code, description, image, status, categoryId } = req.body;

    const subCategory = await prisma.subCategory.update({
      where: { id },
      data: {
        name,
        slug,
        code,
        description,
        image,
        status,
        categoryId,
      },
      include: {
        category: true,
      },
    });
    res.json({ success: true, data: subCategory });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSubCategory = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const subCategory = await prisma.subCategory.findUnique({ where: { id } });
    if (subCategory) {
      await logActivity({
        action: "DELETE",
        entityType: "SUBCATEGORY",
        entityId: subCategory.id,
        entityName: subCategory.name,
        user: "Admin",
        data: subCategory,
      });
    }
    await prisma.subCategory.delete({ where: { id } });
    res.json({ success: true, message: "Sub Category deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
