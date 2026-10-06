import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// 🎟️ COUPONS
// ==========================================

const DEFAULT_COUPONS = [
  { name: "Summer Mega Sale", code: "SUMMER20", type: "Percentage", discount: 20, limit: 200, validStart: "2026-06-01", validEnd: "2026-08-31", description: "Summer seasonal discount coupon", status: "Active" },
  { name: "New Customer Welcome", code: "WELCOME100", type: "Fixed Amount", discount: 100, limit: 500, validStart: "2026-01-01", validEnd: "2026-12-31", description: "First time customer 100 THB off", status: "Active" },
  { name: "Flash Friday Sale", code: "FLASH50", type: "Percentage", discount: 50, limit: 50, validStart: "2026-10-01", validEnd: "2026-10-31", description: "Exclusive Friday flash deals", status: "Active" },
];

export const getCoupons = async (req: Request, res: Response) => {
  try {
    const count = await prisma.coupon.count();
    if (count === 0) {
      await prisma.coupon.createMany({ data: DEFAULT_COUPONS });
    }
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

const DEFAULT_DISCOUNT_PLANS = [
  { name: "VIP Platinum Plan", planType: "Percentage", status: "Active" },
  { name: "Gold Member Plan", planType: "Percentage", status: "Active" },
  { name: "Weekend Special", planType: "Fixed", status: "Active" },
];

const DEFAULT_DISCOUNTS = [
  { name: "VIP Customer 15% Off", value: 15, planName: "VIP Platinum Plan", validity: "All Days", days: "Monday - Sunday", products: "All Products", status: "Active" },
  { name: "Gold Member 10% Off", value: 10, planName: "Gold Member Plan", validity: "All Days", days: "Monday - Sunday", products: "All Products", status: "Active" },
  { name: "Weekend Coffee Deal ฿20", value: 20, planName: "Weekend Special", validity: "Weekend", days: "Saturday - Sunday", products: "Beverages", status: "Active" },
];

export const getDiscounts = async (req: Request, res: Response) => {
  try {
    const count = await prisma.discount.count();
    if (count === 0) {
      await prisma.discount.createMany({ data: DEFAULT_DISCOUNTS });
    }
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
    const count = await prisma.discountPlan.count();
    if (count === 0) {
      await prisma.discountPlan.createMany({ data: DEFAULT_DISCOUNT_PLANS });
    }
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

const DEFAULT_GIFT_CARDS = [
  { code: "GC-849201", customerName: "Somchai Prasert", customerAvatar: "/assets/images/customer11.jpg", issuedDate: "2026-01-15", expiryDate: "2026-12-31", amount: 1000, balance: 750, status: "Active" },
  { code: "GC-592018", customerName: "Ananya Srisuk", customerAvatar: "/assets/images/customer12.jpg", issuedDate: "2026-03-01", expiryDate: "2027-02-28", amount: 2000, balance: 2000, status: "Active" },
  { code: "GC-194820", customerName: "Kittisak Wong", customerAvatar: "/assets/images/customer13.jpg", issuedDate: "2025-10-10", expiryDate: "2026-10-09", amount: 500, balance: 0, status: "Redeemed" },
];

export const getGiftCards = async (req: Request, res: Response) => {
  try {
    const count = await prisma.giftCard.count();
    if (count === 0) {
      await prisma.giftCard.createMany({ data: DEFAULT_GIFT_CARDS });
    }
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

export const verifyGiftCard = async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code || "").trim();
    if (!code) {
      return res.status(400).json({ success: false, message: "Gift card code is required" });
    }

    const card = await prisma.giftCard.findUnique({
      where: { code },
    });

    if (!card) {
      return res.status(404).json({ success: false, message: `Gift card '${code}' not found.` });
    }

    if (card.status !== "Active") {
      return res.status(400).json({ success: false, message: `Gift card '${code}' is inactive (Status: ${card.status}).` });
    }

    // Check expiry date
    const expiry = new Date(card.expiryDate);
    if (!isNaN(expiry.getTime()) && expiry < new Date()) {
      return res.status(400).json({ success: false, message: `Gift card '${code}' expired on ${card.expiryDate}.` });
    }

    if (card.balance <= 0) {
      return res.status(400).json({ success: false, message: `Gift card '${code}' has zero balance remaining.` });
    }

    res.json({
      success: true,
      giftCard: card,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to verify gift card" });
  }
};
