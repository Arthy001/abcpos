import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// 🎟️ COUPONS
// ==========================================

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch coupons" });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const { name, code, type, discount, limit, validStart, validEnd, description, status } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        name,
        code: code.toUpperCase(),
        type: type || "Percentage",
        discount: Number(discount) || 0,
        limit: Number(limit) || 100,
        validStart,
        validEnd,
        description,
        status: status || "Active",
      },
    });
    res.status(201).json(coupon);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create coupon" });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, type, discount, limit, validStart, validEnd, description, status } = req.body;
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id as string },
      data: {
        name,
        code: code ? code.toUpperCase() : undefined,
        type,
        discount: discount !== undefined ? Number(discount) : undefined,
        limit: limit !== undefined ? Number(limit) : undefined,
        validStart,
        validEnd,
        description,
        status,
      },
    });
    res.json(coupon);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update coupon" });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to delete coupon" });
  }
};

// ==========================================
// 🏷️ DISCOUNTS & DISCOUNT PLANS
// ==========================================

export const getDiscounts = async (req: Request, res: Response) => {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(discounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch discounts" });
  }
};

export const createDiscount = async (req: Request, res: Response) => {
  try {
    const { name, value, planName, validity, days, products, status } = req.body;
    const discount = await prisma.discount.create({
      data: {
        name,
        value: Number(value) || 0,
        planName: planName || "Standard",
        validity: validity || "All Days",
        days: days || "Monday - Sunday",
        products: products || "All Products",
        status: status || "Active",
      },
    });
    res.status(201).json(discount);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create discount" });
  }
};

export const updateDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, value, planName, validity, days, products, status } = req.body;
    const discount = await prisma.discount.update({
      where: { id: req.params.id as string },
      data: {
        name,
        value: value !== undefined ? Number(value) : undefined,
        planName,
        validity,
        days,
        products,
        status,
      },
    });
    res.json(discount);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update discount" });
  }
};

export const deleteDiscount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.discount.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Discount deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to delete discount" });
  }
};

export const getDiscountPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.discountPlan.findMany({
      orderBy: { name: "asc" },
    });
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch discount plans" });
  }
};

export const createDiscountPlan = async (req: Request, res: Response) => {
  try {
    const { name, planType, status } = req.body;
    const plan = await prisma.discountPlan.create({
      data: {
        name,
        planType: planType || "Percentage",
        status: status || "Active",
      },
    });
    res.status(201).json(plan);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create discount plan" });
  }
};

// ==========================================
// 💳 GIFT CARDS
// ==========================================

export const getGiftCards = async (req: Request, res: Response) => {
  try {
    const cards = await prisma.giftCard.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(cards);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch gift cards" });
  }
};

export const createGiftCard = async (req: Request, res: Response) => {
  try {
    const { code, customerName, customerAvatar, issuedDate, expiryDate, amount, balance, status } = req.body;
    const card = await prisma.giftCard.create({
      data: {
        code: code || `GC-${Date.now().toString().slice(-6)}`,
        customerName: customerName || "Valued Customer",
        customerAvatar: customerAvatar || "/assets/images/customer11.jpg",
        issuedDate: issuedDate || new Date().toISOString().split("T")[0],
        expiryDate: expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
        amount: Number(amount) || 0,
        balance: balance !== undefined ? Number(balance) : Number(amount) || 0,
        status: status || "Active",
      },
    });
    res.status(201).json(card);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to create gift card" });
  }
};

export const updateGiftCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, customerName, customerAvatar, issuedDate, expiryDate, amount, balance, status } = req.body;
    const card = await prisma.giftCard.update({
      where: { id: req.params.id as string },
      data: {
        code,
        customerName,
        customerAvatar,
        issuedDate,
        expiryDate,
        amount: amount !== undefined ? Number(amount) : undefined,
        balance: balance !== undefined ? Number(balance) : undefined,
        status,
      },
    });
    res.json(card);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update gift card" });
  }
};

export const deleteGiftCard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.giftCard.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: "Gift card deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to delete gift card" });
  }
};
