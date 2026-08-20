import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/brands
export const getBrands = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status);
    }
    if (search) {
      where.name = { contains: String(search) };
    }

    const brands = await prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(brands);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch brands" });
  }
};

// POST /api/brands
export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, slug, image, status } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Brand Name is required" });
    }

    const brandSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const brand = await prisma.brand.create({
      data: {
        name,
        slug: brandSlug,
        image: image || null,
        status: status || "ACTIVE",
      },
    });

    res.status(201).json(brand);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create brand" });
  }
};

// PUT /api/brands/:id
export const updateBrand = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, slug, image, status } = req.body;

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(image !== undefined && { image }),
        ...(status && { status }),
      },
    });

    res.json(brand);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update brand" });
  }
};

// DELETE /api/brands/:id
export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.brand.delete({ where: { id } });
    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete brand" });
  }
};
