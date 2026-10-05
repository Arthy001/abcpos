import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// ==================== PROFILE SETTINGS ====================
export const getProfileSettings = async (req: Request, res: Response) => {
  try {
    let profile = await prisma.userProfileSettings.findFirst();
    if (!profile) {
      profile = await prisma.userProfileSettings.create({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1 (555) 234-5678",
          userName: "johndoe_admin",
          address: "4517 Washington Ave.",
          city: "Manchester",
          country: "United States",
          postalCode: "39401",
          bio: "Senior Store Operations Manager & Lead POS Administrator",
          avatar: "/assets/images/customer11.jpg",
        },
      });
    }
    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch profile settings" });
  }
};

export const updateProfileSettings = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.userProfileSettings.findFirst();
    if (!existing) {
      const created = await prisma.userProfileSettings.create({ data: req.body });
      return res.json({ success: true, profile: created });
    }
    const updated = await prisma.userProfileSettings.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json({ success: true, profile: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update profile settings" });
  }
};

// ==================== SECURITY SETTINGS ====================
export const getSecuritySettings = async (req: Request, res: Response) => {
  try {
    let security = await prisma.userSecuritySettings.findFirst();
    if (!security) {
      security = await prisma.userSecuritySettings.create({
        data: {
          twoFactorEnabled: true,
          twoFactorMethod: "Authenticator App (Google Authenticator)",
          passwordLastChanged: "25 days ago",
          loginAlerts: true,
        },
      });
    }
    const sessionLogs = await prisma.userSessionLog.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, security, sessionLogs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch security settings" });
  }
};

export const updateSecuritySettings = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.userSecuritySettings.findFirst();
    if (!existing) {
      const created = await prisma.userSecuritySettings.create({ data: req.body });
      return res.json({ success: true, security: created });
    }
    const updated = await prisma.userSecuritySettings.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json({ success: true, security: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update security settings" });
  }
};

export const terminateSessionLog = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.userSessionLog.delete({ where: { id } });
    res.json({ success: true, message: "Session terminated successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to terminate session" });
  }
};

// ==================== NOTIFICATION SETTINGS ====================
export const getNotificationSettings = async (req: Request, res: Response) => {
  try {
    let notifications = await prisma.userNotificationSettings.findFirst();
    if (!notifications) {
      notifications = await prisma.userNotificationSettings.create({
        data: {
          emailAlerts: true,
          pushAlerts: true,
          smsAlerts: false,
          lowStockAlerts: true,
          newOrderAlerts: true,
          invoicesAlerts: true,
          paymentAlerts: true,
          weeklyReports: true,
        },
      });
    }
    res.json({ success: true, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch notification settings" });
  }
};

export const updateNotificationSettings = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.userNotificationSettings.findFirst();
    if (!existing) {
      const created = await prisma.userNotificationSettings.create({ data: req.body });
      return res.json({ success: true, notifications: created });
    }
    const updated = await prisma.userNotificationSettings.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json({ success: true, notifications: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update notification settings" });
  }
};

// ==================== CONNECTED APPS ====================
export const getConnectedApps = async (req: Request, res: Response) => {
  try {
    const apps = await prisma.connectedAppItem.findMany({
      orderBy: { id: "asc" },
    });
    res.json({ success: true, apps });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch connected apps" });
  }
};

export const toggleConnectedApp = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, connectedAccount } = req.body;
    const updated = await prisma.connectedAppItem.update({
      where: { id },
      data: {
        status,
        connectedAccount: status === "CONNECTED" ? (connectedAccount || "user@connected.com") : null,
        connectedDate: status === "CONNECTED" ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null,
      },
    });
    res.json({ success: true, app: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to toggle connected app" });
  }
};

// ==================== COMPANY SETTINGS ====================
export const getCompanySettings = async (req: Request, res: Response) => {
  try {
    let company = await prisma.companySettings.findFirst();
    if (!company) {
      company = await prisma.companySettings.create({
        data: {
          companyName: "ABC POS Retail Co., Ltd.",
          email: "contact@abcpos.com",
          phone: "+66 2 123 4567",
          fax: "+66 2 123 4568",
          website: "https://abcpos.com",
          address: "88/9 Sukhumvit Road, Khlong Toei",
          country: "Thailand",
          state: "Bangkok",
          city: "Bangkok",
          postalCode: "10110",
          taxId: "010556209999",
        },
      });
    }
    res.json({ success: true, company });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch company settings" });
  }
};

export const updateCompanySettings = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.companySettings.findFirst();
    if (!existing) {
      const created = await prisma.companySettings.create({ data: req.body });
      return res.json({ success: true, company: created });
    }
    const updated = await prisma.companySettings.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json({ success: true, company: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update company settings" });
  }
};

// ==================== PREFIX SETTINGS ====================
export const getPrefixSettings = async (req: Request, res: Response) => {
  try {
    let prefixes = await prisma.prefixSettings.findFirst();
    if (!prefixes) {
      prefixes = await prisma.prefixSettings.create({
        data: {
          productSku: "SKU - ",
          supplier: "SUP - ",
          purchase: "PU - ",
          purchaseReturn: "PR - ",
          sales: "SA - ",
          salesReturn: "SR - ",
          customer: "CT - ",
          expense: "EX - ",
          stockTransfer: "ST - ",
          stockAdjustment: "SA - ",
          salesOrder: "SO - ",
          posInvoice: "PINV - ",
          estimation: "EST - ",
          transaction: "TRN - ",
          employee: "EMP - ",
          shift: "SFT - ",
        },
      });
    }
    res.json({ success: true, prefixes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch prefix settings" });
  }
};

export const updatePrefixSettings = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.prefixSettings.findFirst();
    if (!existing) {
      const created = await prisma.prefixSettings.create({ data: req.body });
      return res.json({ success: true, prefixes: created });
    }
    const updated = await prisma.prefixSettings.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json({ success: true, prefixes: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update prefix settings" });
  }
};

// ==================== POS SETTINGS ====================
export const getPosSettings = async (req: Request, res: Response) => {
  try {
    let posSettings = await prisma.posSettings.findFirst();
    if (!posSettings) {
      posSettings = await prisma.posSettings.create({
        data: {
          posPrinter: "HP Printer",
          paperSize: "80mm",
          soundEffect: true,
          autoPrintReceipt: true,
          cod: true,
          cheque: false,
          card: true,
          paypal: true,
          bankTransfer: true,
          cash: true,
          promptpay: true,
          quickCashAmounts: "20,50,100,500,1000",
        },
      });
    }
    res.json({ success: true, posSettings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch POS settings" });
  }
};

export const updatePosSettings = async (req: Request, res: Response) => {
  try {
    const existing = await prisma.posSettings.findFirst();
    if (!existing) {
      const created = await prisma.posSettings.create({ data: req.body });
      return res.json({ success: true, posSettings: created });
    }
    const updated = await prisma.posSettings.update({
      where: { id: existing.id },
      data: req.body,
    });
    res.json({ success: true, posSettings: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update POS settings" });
  }
};

