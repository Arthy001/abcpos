import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrdersCount = await prisma.order.count();
    const totalSalesCount = await prisma.sale.count();
    const totalProductsCount = await prisma.product.count();

    // Fetch all non-cancelled orders & sales for total revenue calculation
    const orders = await prisma.order.findMany({
      where: { paymentStatus: { not: "CANCELLED" } },
      select: { total: true, subtotal: true, discount: true, tax: true, createdAt: true },
    });

    const sales = await prisma.sale.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { grandTotal: true, subtotal: true, discount: true, tax: true, createdAt: true },
    });

    const totalOrdersRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalSales = Math.round((totalOrdersRevenue + totalSalesRevenue) * 100) / 100;

    // Today's statistics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= startOfToday);
    const todaySalesItems = sales.filter((s) => new Date(s.createdAt) >= startOfToday);
    const todaySales = Math.round((todayOrders.reduce((sum, o) => sum + (o.total || 0), 0) + todaySalesItems.reduce((sum, s) => sum + (s.grandTotal || 0), 0)) * 100) / 100;
    const todayOrdersCount = todayOrders.length + todaySalesItems.length;

    // Products with low stock (<= 5)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: 5,
        },
      },
      include: { category: true },
      orderBy: { stock: "asc" },
      take: 6,
    });
    const lowStockCount = await prisma.product.count({
      where: {
        stock: {
          lte: 5,
        },
      },
    });

    // Recent 6 transactions (from orders)
    const recentOrders = await prisma.order.findMany({
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    // Top selling products based on actual OrderItem quantities sold
    const topOrderItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 6,
    });

    const topProductIds = topOrderItems.map((item) => item.productId).filter((id): id is string => Boolean(id));

    let topSellingProducts: any[] = [];
    if (topProductIds.length > 0) {
      const productsMap = new Map();
      const fetchedProducts = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        include: { category: true },
      });
      fetchedProducts.forEach((p) => productsMap.set(p.id, p));

      topSellingProducts = topOrderItems
        .map((item) => {
          const product = productsMap.get(item.productId);
          if (!product) return null;
          return {
            ...product,
            totalSold: item._sum.quantity || 0,
          };
        })
        .filter(Boolean);
    }

    // If topSellingProducts has fewer than 5 items, fill with best products by stock
    if (topSellingProducts.length < 5) {
      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { notIn: topSellingProducts.map((p) => p.id) },
        },
        include: { category: true },
        orderBy: { stock: "desc" },
        take: 5 - topSellingProducts.length,
      });
      topSellingProducts.push(...fallbackProducts.map((p) => ({ ...p, totalSold: 0 })));
    }

    // Monthly chart data (Real aggregated data for past 7 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const chartData = [];

    // Also fetch purchases for monthly comparison
    const purchases = await prisma.purchase.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      // Sum orders & sales in this month
      const monthOrdersSum = orders
        .filter((o) => {
          const cd = new Date(o.createdAt);
          return cd >= monthStart && cd <= monthEnd;
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const monthSalesSum = sales
        .filter((s) => {
          const cd = new Date(s.createdAt);
          return cd >= monthStart && cd <= monthEnd;
        })
        .reduce((sum, s) => sum + (s.grandTotal || 0), 0);

      const monthPurchasesSum = purchases
        .filter((p) => {
          const cd = new Date(p.createdAt);
          return cd >= monthStart && cd <= monthEnd;
        })
        .reduce((sum, p) => sum + (p.total || 0), 0);

      chartData.push({
        month: months[monthIndex],
        sales: Math.round(monthOrdersSum + monthSalesSum),
        purchase: Math.round(monthPurchasesSum),
      });
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalOrders: totalOrdersCount + totalSalesCount,
          totalProducts: totalProductsCount,
          lowStockCount,
          todaySales,
          todayOrders: todayOrdersCount,
        },
        chartData,
        recentOrders,
        lowStockProducts,
        topSellingProducts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
