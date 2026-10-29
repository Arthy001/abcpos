import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

function formatNotificationTime(date: Date): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return "เมื่อสักครู่";
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ชม. ที่แล้ว`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} วันที่แล้ว`;
}

// Automatically sync latest real business data into AppNotification records
async function syncSystemNotifications() {
  try {
    const now = new Date();

    // 1. Low stock / Out of stock
    const lowStockProducts = await prisma.product.findMany({
      where: {
        OR: [{ stock: 0 }, { stock: { lte: 5 } }],
      },
      take: 6,
      orderBy: { stock: "asc" },
    });

    for (const p of lowStockProducts) {
      const isOut = p.stock === 0;
      await prisma.appNotification.upsert({
        where: { id: `notif-stock-${p.id}` },
        update: {
          type: isOut ? "DANGER" : "WARNING",
          title: isOut ? "สินค้าหมดสต็อก (Out of Stock)" : "สต็อกใกล้หมด (Low Stock Alert)",
          message: `${p.name} คงเหลือ ${p.stock} (เกณฑ์แจ้งเตือน: ${p.minStockAlert || 5})`,
          link: `/products/edit/${p.id}`,
          entityType: "PRODUCT",
          entityId: p.id,
        },
        create: {
          id: `notif-stock-${p.id}`,
          category: "STOCK",
          type: isOut ? "DANGER" : "WARNING",
          title: isOut ? "สินค้าหมดสต็อก (Out of Stock)" : "สต็อกใกล้หมด (Low Stock Alert)",
          message: `${p.name} คงเหลือ ${p.stock} (เกณฑ์แจ้งเตือน: ${p.minStockAlert || 5})`,
          link: `/products/edit/${p.id}`,
          entityType: "PRODUCT",
          entityId: p.id,
        },
      });
    }

    // 2. Batches (Expired / Expiring)
    const batches = await prisma.productExpiryBatch.findMany({
      where: {
        status: { in: ["ACTIVE", "EXPIRED"] },
      },
      include: { product: true },
      orderBy: { expiredDate: "asc" },
      take: 6,
    });

    const sixtyDaysLater = new Date();
    sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

    for (const b of batches) {
      const expDate = new Date(b.expiredDate);
      const isPast = expDate < now;
      const isNear = expDate <= sixtyDaysLater;

      if (isPast) {
        await prisma.appNotification.upsert({
          where: { id: `notif-exp-${b.id}` },
          update: {
            type: "DANGER",
            title: "สินค้าหมดอายุแล้ว (Expired)",
            message: `${b.product?.name || "สินค้า"} (Lot: ${b.batchNo || "N/A"}) หมดอายุเมื่อ ${expDate.toLocaleDateString("th-TH")}`,
            link: "/reports/products/expiry",
            entityType: "BATCH",
            entityId: b.id,
          },
          create: {
            id: `notif-exp-${b.id}`,
            category: "EXPIRY",
            type: "DANGER",
            title: "สินค้าหมดอายุแล้ว (Expired)",
            message: `${b.product?.name || "สินค้า"} (Lot: ${b.batchNo || "N/A"}) หมดอายุเมื่อ ${expDate.toLocaleDateString("th-TH")}`,
            link: "/reports/products/expiry",
            entityType: "BATCH",
            entityId: b.id,
          },
        });
      } else if (isNear) {
        const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        await prisma.appNotification.upsert({
          where: { id: `notif-exp-${b.id}` },
          update: {
            type: "WARNING",
            title: "สินค้าใกล้หมดอายุ (Expiring Soon)",
            message: `${b.product?.name || "สินค้า"} (Lot: ${b.batchNo || "N/A"}) จะหมดอายุในอีก ${daysLeft} วัน`,
            link: "/reports/products/expiry",
            entityType: "BATCH",
            entityId: b.id,
          },
          create: {
            id: `notif-exp-${b.id}`,
            category: "EXPIRY",
            type: "WARNING",
            title: "สินค้าใกล้หมดอายุ (Expiring Soon)",
            message: `${b.product?.name || "สินค้า"} (Lot: ${b.batchNo || "N/A"}) จะหมดอายุในอีก ${daysLeft} วัน`,
            link: "/reports/products/expiry",
            entityType: "BATCH",
            entityId: b.id,
          },
        });
      }
    }

    // 3. Manufacturing Work Orders
    const workOrders = await prisma.workOrder.findMany({
      orderBy: { updatedAt: "desc" },
      take: 2,
    });

    for (const wo of workOrders) {
      if (wo.status === "COMPLETED") {
        await prisma.appNotification.upsert({
          where: { id: `notif-wo-${wo.id}` },
          update: {
            type: "SUCCESS",
            title: "งานผลิตเสร็จสมบูรณ์ (Work Order Done)",
            message: `ใบสั่งผลิต ${wo.orderNo} ผลิตเสร็จ ${wo.producedQty} ${wo.unit} เรียบร้อยแล้ว`,
            link: "/manufacturing/work-orders",
            entityType: "WORK_ORDER",
            entityId: wo.id,
          },
          create: {
            id: `notif-wo-${wo.id}`,
            category: "MANUFACTURING",
            type: "SUCCESS",
            title: "งานผลิตเสร็จสมบูรณ์ (Work Order Done)",
            message: `ใบสั่งผลิต ${wo.orderNo} ผลิตเสร็จ ${wo.producedQty} ${wo.unit} เรียบร้อยแล้ว`,
            link: "/manufacturing/work-orders",
            entityType: "WORK_ORDER",
            entityId: wo.id,
          },
        });
      } else if (wo.status === "IN_PROGRESS") {
        await prisma.appNotification.upsert({
          where: { id: `notif-wo-${wo.id}` },
          update: {
            type: "INFO",
            title: "กำลังดำเนินการผลิต (In Progress)",
            message: `ใบสั่งผลิต ${wo.orderNo} กำลังเดินเครื่องผลิต (${wo.producedQty}/${wo.targetQty} ${wo.unit})`,
            link: "/manufacturing/work-orders",
            entityType: "WORK_ORDER",
            entityId: wo.id,
          },
          create: {
            id: `notif-wo-${wo.id}`,
            category: "MANUFACTURING",
            type: "INFO",
            title: "กำลังดำเนินการผลิต (In Progress)",
            message: `ใบสั่งผลิต ${wo.orderNo} กำลังเดินเครื่องผลิต (${wo.producedQty}/${wo.targetQty} ${wo.unit})`,
            link: "/manufacturing/work-orders",
            entityType: "WORK_ORDER",
            entityId: wo.id,
          },
        });
      }
    }

    // 4. Recent Sales
    const recentSales = await prisma.sale.findMany({
      where: { paymentStatus: "PAID" },
      orderBy: { createdAt: "desc" },
      take: 2,
    });

    for (const s of recentSales) {
      await prisma.appNotification.upsert({
        where: { id: `notif-sale-${s.id}` },
        update: {
          type: "SUCCESS",
          title: "ยอดชำระเงินสำเร็จ (Payment Received)",
          message: `${s.customerName} ชำระเงินบิล ${s.reference} ยอด ฿${s.grandTotal.toLocaleString()}`,
          link: "/sales",
          entityType: "SALE",
          entityId: s.id,
        },
        create: {
          id: `notif-sale-${s.id}`,
          category: "SALE",
          type: "SUCCESS",
          title: "ยอดชำระเงินสำเร็จ (Payment Received)",
          message: `${s.customerName} ชำระเงินบิล ${s.reference} ยอด ฿${s.grandTotal.toLocaleString()}`,
          link: "/sales",
          entityType: "SALE",
          entityId: s.id,
        },
      });
    }
  } catch (err) {
    console.warn("Notice: syncSystemNotifications encountered:", err);
  }
}

// GET /api/notifications?userId=...
export const getSystemNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || "default-user";

    // Synchronize latest alerts to database
    await syncSystemNotifications();

    // Query active notifications
    const allNotifications = await prisma.appNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    // Query read status for this specific user
    const userReads = await prisma.userNotificationRead.findMany({
      where: { userId },
    });
    const readMap = new Set(userReads.map((r) => r.notificationId));

    const notifications = allNotifications.map((n) => {
      const isRead = readMap.has(n.id);
      return {
        id: n.id,
        type: n.type.toLowerCase(),
        title: n.title,
        message: n.message,
        time: formatNotificationTime(n.createdAt),
        category: n.category,
        link: n.link || "/dashboard",
        isRead,
        entityType: n.entityType,
        entityId: n.entityId,
      };
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      data: {
        total: notifications.length,
        unreadCount,
        notifications,
      },
    });
  } catch (error: any) {
    console.error("Error fetching system notifications:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = String(req.body.userId || req.query.userId || "default-user");

    await prisma.userNotificationRead.upsert({
      where: {
        notificationId_userId: {
          notificationId: id,
          userId,
        },
      },
      create: {
        notificationId: id,
        userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    res.json({ success: true, message: "Marked as read" });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notifications/mark-all-read
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = String(req.body.userId || req.query.userId || "default-user");

    const all = await prisma.appNotification.findMany({
      select: { id: true },
    });

    for (const notif of all) {
      await prisma.userNotificationRead.upsert({
        where: {
          notificationId_userId: {
            notificationId: notif.id,
            userId,
          },
        },
        create: {
          notificationId: notif.id,
          userId,
        },
        update: {},
      });
    }

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
