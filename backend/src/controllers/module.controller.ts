import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

const DEFAULT_SYSTEM_MODULES = [
  {
    code: "CORE_POS",
    name: "จุดขายหน้าร้าน (Point of Sale - POS)",
    category: "Core Retail",
    description: "ระบบสแกนบาร์โค้ด คิดเงิน พิมพ์ใบเสร็จสลิป รับชำระผ่าน PromptPay QR และเปิด-ปิดกะแคชเชียร์",
    icon: "ShoppingBag",
    isEnabled: true,
    isCore: true,
    badge: "Essential",
    sortOrder: 1,
  },
  {
    code: "CORE_INVENTORY",
    name: "คลังสินค้าและสต็อก (Inventory & Stock)",
    category: "Core Retail",
    description: "จัดการรายการสินค้า บาร์โค้ด หมวดหมู่ การโอนย้ายข้ามคลัง ปรับยอดสต็อก และแจ้งเตือนสินค้าใกล้หมด",
    icon: "Package",
    isEnabled: true,
    isCore: true,
    badge: "Essential",
    sortOrder: 2,
  },
  {
    code: "FINANCE_ACCOUNTS",
    name: "การเงินและรายรับ-รายจ่าย (Finance & Accounts)",
    category: "Finance & Admin",
    description: "บันทึกรายรับ-รายจ่ายของร้าน สมุดบัญชีธนาคาร โอนย้ายเงิน และรายงานกระแสเงินสด/งบดุล",
    icon: "DollarSign",
    isEnabled: true,
    isCore: false,
    badge: "Popular",
    sortOrder: 3,
  },
  {
    code: "HRM_PAYROLL",
    name: "บริหารงานบุคคลและเงินเดือน (HRM & Payroll)",
    category: "Human Resources",
    description: "จัดการข้อมูลพนักงาน ตารางกะเข้างาน บันทึกเวลา ขาดลามาสาย และคำนวณสลิปเงินเดือน",
    icon: "Users",
    isEnabled: true,
    isCore: false,
    badge: "Standard",
    sortOrder: 4,
  },
  {
    code: "PROMO_LOYALTY",
    name: "โปรโมชั่นและบัตรของขวัญ (Promotions & Coupons)",
    category: "Sales & Marketing",
    description: "สร้างโค้ดคูปองส่วนลด แคมเปญลดราคาสินค้าตามช่วงเวลา และออกบัตรของขวัญ Gift Card",
    icon: "Tag",
    isEnabled: true,
    isCore: false,
    badge: "Add-on",
    sortOrder: 5,
  },
  {
    code: "B2B_WHOLESALE",
    name: "การค้าส่งและเครดิตเทอม (B2B Wholesale & Credit)",
    category: "Advanced Operations",
    description: "ระบบออกใบเสนอราคา ใบสั่งขาย (SO) การส่งของวางบิลเครดิต 30-60 วัน และคุมวงเงินสินเชื่อลูกหนี้",
    icon: "Truck",
    isEnabled: false,
    isCore: false,
    badge: "Enterprise",
    sortOrder: 6,
  },
  {
    code: "MANUFACTURING_MRP",
    name: "ฝ่ายผลิตและสูตรการผลิต (Manufacturing & Light MRP)",
    category: "Advanced Operations",
    description: "จัดการสูตรการผลิต (BOM) คำสั่งผลิต (Work Orders) ตัดเบิกวัตถุดิบ บันทึกเศษกาก (Scrap) และคิดต้นทุนจริง",
    icon: "Factory",
    isEnabled: false,
    isCore: false,
    badge: "Enterprise",
    sortOrder: 7,
  },
];

export const getSystemModules = async (req: Request, res: Response) => {
  try {
    const count = await prisma.systemModule.count();
    if (count === 0) {
      await prisma.systemModule.createMany({ data: DEFAULT_SYSTEM_MODULES });
    }
    const modules = await prisma.systemModule.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json({ success: true, modules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch system modules" });
  }
};

export const toggleSystemModule = async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code);
    const { isEnabled } = req.body;

    const existing = await prisma.systemModule.findUnique({ where: { code } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Module not found" });
    }

    if (existing.isCore && isEnabled === false) {
      return res.status(400).json({ success: false, error: "Core modules cannot be disabled" });
    }

    const updated = await prisma.systemModule.update({
      where: { code },
      data: { isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : !existing.isEnabled },
    });

    res.json({ success: true, module: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to toggle module status" });
  }
};

export const applyBusinessPreset = async (req: Request, res: Response) => {
  try {
    const { preset } = req.body; // "RETAIL_SME" | "WHOLESALE_TRADING" | "MANUFACTURING_FACTORY"

    if (preset === "RETAIL_SME") {
      // Scale 1: Simple SME (POS + Inventory + basic finance, disable factory & B2B)
      await prisma.systemModule.updateMany({
        where: { code: { in: ["CORE_POS", "CORE_INVENTORY", "FINANCE_ACCOUNTS", "PROMO_LOYALTY"] } },
        data: { isEnabled: true },
      });
      await prisma.systemModule.updateMany({
        where: { code: { in: ["B2B_WHOLESALE", "MANUFACTURING_MRP", "HRM_PAYROLL"] } },
        data: { isEnabled: false },
      });
    } else if (preset === "WHOLESALE_TRADING") {
      // Scale 2: Wholesale & B2B (Enable all except Manufacturing)
      await prisma.systemModule.updateMany({
        where: { code: { in: ["CORE_POS", "CORE_INVENTORY", "FINANCE_ACCOUNTS", "HRM_PAYROLL", "PROMO_LOYALTY", "B2B_WHOLESALE"] } },
        data: { isEnabled: true },
      });
      await prisma.systemModule.updateMany({
        where: { code: "MANUFACTURING_MRP" },
        data: { isEnabled: false },
      });
    } else if (preset === "MANUFACTURING_FACTORY") {
      // Scale 3: Full Factory / Light Manufacturing (Enable everything)
      await prisma.systemModule.updateMany({
        data: { isEnabled: true },
      });
    } else {
      return res.status(400).json({ success: false, error: "Unknown business preset" });
    }

    const modules = await prisma.systemModule.findMany({ orderBy: { sortOrder: "asc" } });
    res.json({ success: true, modules, message: `Successfully switched to ${preset} preset` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to apply preset" });
  }
};
