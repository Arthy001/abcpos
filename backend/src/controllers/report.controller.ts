import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// Helper to aggregate sales report from actual products, POS orders, and ERP sales
const computeRealSalesReport = async (query: {
  store?: any;
  product?: any;
  search?: any;
  category?: any;
  startDate?: any;
  endDate?: any;
}) => {
  const { store, product, search, category, startDate, endDate } = query;

  // 1. Fetch all products with their relations
  const products = await prisma.product.findMany({
    include: {
      category: true,
      brand: true,
      store: true,
    },
    orderBy: { name: "asc" },
  });

  // 2. Build date filters for orders and sales if provided
  const orderWhere: any = { paymentStatus: { not: "CANCELLED" } };
  const saleWhere: any = { status: { not: "CANCELLED" } };

  if (startDate || endDate) {
    const createdAtFilter: any = {};
    if (startDate) createdAtFilter.gte = new Date(String(startDate));
    if (endDate) {
      const endD = new Date(String(endDate));
      endD.setHours(23, 59, 59, 999);
      createdAtFilter.lte = endD;
    }
    orderWhere.createdAt = createdAtFilter;
    saleWhere.createdAt = createdAtFilter;
  }

  if (store && store !== "All" && store !== "all") {
    saleWhere.storeName = String(store);
  }

  // 3. Fetch orders & sales
  const [orders, sales] = await Promise.all([
    prisma.order.findMany({
      where: orderWhere,
      include: { items: true },
    }),
    prisma.sale.findMany({
      where: saleWhere,
      include: { items: true },
    }),
  ]);

  // 4. Map aggregated quantities and amounts per productId
  const soldMap = new Map<string, { soldQty: number; soldAmount: number }>();

  // Aggregate POS Orders
  for (const order of orders) {
    for (const item of order.items) {
      if (!item.productId) continue;
      const current = soldMap.get(item.productId) || { soldQty: 0, soldAmount: 0 };
      current.soldQty += item.quantity;
      current.soldAmount += item.subtotal || item.quantity * item.unitPrice;
      soldMap.set(item.productId, current);
    }
  }

  // Aggregate ERP Sales
  for (const sale of sales) {
    for (const item of sale.items) {
      if (!item.productId) continue;
      const current = soldMap.get(item.productId) || { soldQty: 0, soldAmount: 0 };
      current.soldQty += item.quantity;
      current.soldAmount += item.total || item.subtotal || item.quantity * item.unitPrice;
      soldMap.set(item.productId, current);
    }
  }

  // 5. Build report items
  let reportItems = products.map((p) => {
    const stats = soldMap.get(p.id) || { soldQty: 0, soldAmount: 0 };
    const costPrice = p.costPrice || 0;
    const costAmount = stats.soldQty * costPrice;
    const profitAmount = stats.soldAmount - costAmount;
    const profitMargin = stats.soldAmount > 0 ? Math.round((profitAmount / stats.soldAmount) * 1000) / 10 : 0;

    return {
      id: p.id,
      sku: p.sku,
      productName: p.name,
      productImage: p.image || "/assets/images/product-01.jpg",
      brand: p.brand?.name || "General",
      category: p.category?.name || "General",
      soldQty: stats.soldQty,
      soldAmount: Math.round(stats.soldAmount * 100) / 100,
      costAmount: Math.round(costAmount * 100) / 100,
      profitAmount: Math.round(profitAmount * 100) / 100,
      profitMargin,
      instockQty: p.stock,
      store: p.store?.name || "Electro Mart",
    };
  });

  // Apply filters
  if (store && store !== "All" && store !== "all") {
    reportItems = reportItems.filter((item) => item.store === String(store));
  }
  if (category && category !== "All" && category !== "all") {
    reportItems = reportItems.filter((item) => item.category === String(category));
  }
  if (product && product !== "All" && product !== "all") {
    reportItems = reportItems.filter((item) => item.productName.toLowerCase().includes(String(product).toLowerCase()));
  }
  if (search) {
    const s = String(search).toLowerCase();
    reportItems = reportItems.filter(
      (item) =>
        item.sku.toLowerCase().includes(s) ||
        item.productName.toLowerCase().includes(s) ||
        item.brand.toLowerCase().includes(s) ||
        item.category.toLowerCase().includes(s)
    );
  }

  // Summary Metrics
  const totalSalesRevenue = reportItems.reduce((acc, cur) => acc + cur.soldAmount, 0);
  const totalCost = reportItems.reduce((acc, cur) => acc + (cur.costAmount || 0), 0);
  const totalProfit = totalSalesRevenue - totalCost;
  const totalSoldQty = reportItems.reduce((acc, cur) => acc + cur.soldQty, 0);

  // Paid, Unpaid, Overdue from sales & orders
  const totalPaid = orders.reduce((sum, o) => sum + (o.total || 0), 0) + sales.reduce((sum, s) => sum + (s.paid || 0), 0);
  const totalUnpaid = sales.reduce((sum, s) => sum + (s.due || 0), 0);
  const overdue = sales.filter((s) => s.paymentStatus === "OVERDUE").reduce((sum, s) => sum + (s.due || 0), 0);

  const summary = {
    totalAmount: `฿${Math.round(totalSalesRevenue).toLocaleString()}`,
    totalPaid: `฿${Math.round(totalPaid).toLocaleString()}`,
    totalUnpaid: `฿${Math.round(totalUnpaid).toLocaleString()}`,
    overdue: `฿${Math.round(overdue).toLocaleString()}`,
    totalCost: `฿${Math.round(totalCost).toLocaleString()}`,
    totalProfit: `฿${Math.round(totalProfit).toLocaleString()}`,
    totalSoldQty,
    numeric: {
      totalAmount: Math.round(totalSalesRevenue * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalUnpaid: Math.round(totalUnpaid * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
    },
  };

  return { reportItems, summary };
};

// GET /api/reports/sales
export const getSalesReport = async (req: Request, res: Response) => {
  try {
    const { reportItems, summary } = await computeRealSalesReport(req.query);

    res.json({
      success: true,
      summary,
      items: reportItems,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch sales report" });
  }
};

// GET /api/reports/bestsellers
export const getBestsellerReport = async (req: Request, res: Response) => {
  try {
    const { reportItems } = await computeRealSalesReport(req.query);

    // Sort by soldQty descending
    const items = [...reportItems].sort((a, b) => b.soldQty - a.soldQty);

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch bestseller report" });
  }
};

// GET /api/reports/purchases
export const getPurchaseReport = async (req: Request, res: Response) => {
  try {
    const { store, product, search } = req.query;

    const where: any = {};
    if (store && store !== "All") {
      where.store = String(store);
    }
    if (product && product !== "All") {
      where.productName = { contains: String(product) };
    }
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
        { category: { contains: String(search) } },
      ];
    }

    const items = await prisma.purchaseReportItem.findMany({
      where,
      orderBy: { sku: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch purchase report" });
  }
};

// GET /api/reports/inventory
export const getInventoryReport = async (req: Request, res: Response) => {
  try {
    const { store, product, category, search } = req.query;

    const where: any = {};
    if (store && store !== "All") where.store = String(store);
    if (product && product !== "All") where.productName = { contains: String(product) };
    if (category && category !== "All") where.category = { contains: String(category) };
    if (search) {
      where.OR = [
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
        { category: { contains: String(search) } },
      ];
    }

    const items = await prisma.inventoryReportItem.findMany({
      where,
      orderBy: { sku: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch inventory report" });
  }
};

// GET /api/reports/stock-history
export const getStockHistoryReport = async (req: Request, res: Response) => {
  try {
    const { store, product, category, search } = req.query;

    const where: any = {};
    if (store && store !== "All") where.store = String(store);
    if (product && product !== "All") where.productName = { contains: String(product) };
    if (category && category !== "All") where.category = { contains: String(category) };
    if (search) {
      where.OR = [
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
      ];
    }

    const items = await prisma.stockHistoryItem.findMany({
      where,
      orderBy: { sku: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch stock history report" });
  }
};

// GET /api/reports/sold-stock
export const getSoldStockReport = async (req: Request, res: Response) => {
  try {
    const { store, product, category, search } = req.query;

    const where: any = {};
    if (store && store !== "All") where.store = String(store);
    if (product && product !== "All") where.productName = { contains: String(product) };
    if (category && category !== "All") where.category = { contains: String(category) };
    if (search) {
      where.OR = [
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
      ];
    }

    const items = await prisma.soldStockItem.findMany({
      where,
      orderBy: { sku: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch sold stock report" });
  }
};

// GET /api/reports/invoices
export const getInvoiceReport = async (req: Request, res: Response) => {
  try {
    const { customer, status, search } = req.query;

    const where: any = {};
    if (customer && customer !== "All") where.customer = { contains: String(customer) };
    if (status && status !== "All") where.status = String(status).toUpperCase();
    if (search) {
      where.OR = [
        { invoiceNo: { contains: String(search) } },
        { customer: { contains: String(search) } },
      ];
    }

    const items = await prisma.invoiceReportItem.findMany({
      where,
      orderBy: { invoiceNo: "asc" },
    });

    const summary = {
      totalAmount: "$4,56,000",
      totalPaid: "$2,56,42",
      totalUnpaid: "$1,52,45",
      overdue: "$2,56,12",
    };

    res.json({
      success: true,
      summary,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch invoice report" });
  }
};

// GET /api/reports/suppliers
export const getSupplierReport = async (req: Request, res: Response) => {
  try {
    const { supplier, status, paymentMethod, search } = req.query;

    const where: any = {};
    if (supplier && supplier !== "All") where.supplierName = { contains: String(supplier) };
    if (status && status !== "All") where.status = String(status).toUpperCase();
    if (paymentMethod && paymentMethod !== "All") where.paymentMethod = String(paymentMethod);
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { supplierId: { contains: String(search) } },
        { supplierName: { contains: String(search) } },
      ];
    }

    const items = await prisma.supplierReportItem.findMany({
      where,
      orderBy: { supplierId: "asc" },
    });

    res.json({
      success: true,
      total: "$33268.53",
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch supplier report" });
  }
};

// GET /api/reports/suppliers/due
export const getSupplierDueReport = async (req: Request, res: Response) => {
  try {
    const { supplier, status, reference, search } = req.query;

    const where: any = {};
    if (supplier && supplier !== "All") where.supplierName = { contains: String(supplier) };
    if (status && status !== "All") where.status = String(status).toUpperCase();
    if (reference) where.reference = { contains: String(reference) };
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { supplierId: { contains: String(search) } },
        { supplierName: { contains: String(search) } },
      ];
    }

    const items = await prisma.supplierDueReportItem.findMany({
      where,
      orderBy: { supplierId: "asc" },
    });

    res.json({
      success: true,
      totalAmount: 33268,
      paid: "$33268.53",
      due: "$0.0",
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch supplier due report" });
  }
};

// GET /api/reports/customers
export const getCustomerReport = async (req: Request, res: Response) => {
  try {
    const { customer, paymentMethod, status, search } = req.query;

    const where: any = {};
    if (customer && customer !== "All") where.customerName = { contains: String(customer) };
    if (paymentMethod && paymentMethod !== "All") where.paymentMethod = String(paymentMethod);
    if (status && status !== "All") where.status = String(status).toUpperCase();
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { customerCode: { contains: String(search) } },
        { customerName: { contains: String(search) } },
      ];
    }

    const items = await prisma.customerReportItem.findMany({
      where,
      orderBy: { customerCode: "asc" },
    });

    res.json({
      success: true,
      total: "$33268.53",
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch customer report" });
  }
};

// GET /api/reports/customers/due
export const getCustomerDueReport = async (req: Request, res: Response) => {
  try {
    const { customer, paymentMethod, status, search } = req.query;

    const where: any = {};
    if (customer && customer !== "All") where.customerName = { contains: String(customer) };
    if (paymentMethod && paymentMethod !== "All") where.paymentMethod = String(paymentMethod);
    if (status && status !== "All") where.status = String(status).toUpperCase();
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { customerCode: { contains: String(search) } },
        { customerName: { contains: String(search) } },
      ];
    }

    const items = await prisma.customerDueReportItem.findMany({
      where,
      orderBy: { customerCode: "asc" },
    });

    res.json({
      success: true,
      totalAmount: 33268,
      paid: "$33268.53",
      due: "$0.0",
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch customer due report" });
  }
};

// GET /api/reports/products
export const getProductReport = async (req: Request, res: Response) => {
  try {
    const { store, category, brand, product, search } = req.query;

    const where: any = {};
    if (store && store !== "All") where.store = String(store);
    if (category && category !== "All") where.category = { contains: String(category) };
    if (brand && brand !== "All") where.brand = { contains: String(brand) };
    if (product && product !== "All") where.productName = { contains: String(product) };
    if (search) {
      where.OR = [
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
      ];
    }

    const items = await prisma.productReportItem.findMany({
      where,
      orderBy: { sku: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch product report" });
  }
};

// GET /api/reports/products/expiry
export const getProductExpiryReport = async (req: Request, res: Response) => {
  try {
    const { store, category, brand, product, search } = req.query;

    const where: any = {};
    if (store && store !== "All") where.store = String(store);
    if (category && category !== "All") where.category = { contains: String(category) };
    if (brand && brand !== "All") where.brand = { contains: String(brand) };
    if (product && product !== "All") where.productName = { contains: String(product) };
    if (search) {
      where.OR = [
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
      ];
    }

    const items = await prisma.productExpiryReportItem.findMany({
      where,
      orderBy: { sku: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch product expiry report" });
  }
};

// GET /api/reports/products/quantity-alert
export const getProductQuantityAlertReport = async (req: Request, res: Response) => {
  try {
    const { store, category, brand, product, search } = req.query;

    const where: any = {};
    if (store && store !== "All") where.store = String(store);
    if (category && category !== "All") where.category = { contains: String(category) };
    if (brand && brand !== "All") where.brand = { contains: String(brand) };
    if (product && product !== "All") where.productName = { contains: String(product) };
    if (search) {
      where.OR = [
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
      ];
    }

    const items = await prisma.productQuantityAlertItem.findMany({
      where,
      orderBy: { sku: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch product quantity alert report" });
  }
};

// GET /api/reports/expenses
export const getExpenseReport = async (req: Request, res: Response) => {
  try {
    const { category, paymentMethod, status, search } = req.query;

    const where: any = {};
    if (category && category !== "All") where.category = { contains: String(category) };
    if (paymentMethod && paymentMethod !== "All") where.paymentMethod = String(paymentMethod);
    if (status && status !== "All") where.status = String(status).toUpperCase();
    if (search) {
      where.OR = [
        { expenseName: { contains: String(search) } },
        { category: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const items = await prisma.expenseReportItem.findMany({
      where,
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch expense report" });
  }
};

// GET /api/reports/income
export const getIncomeReport = async (req: Request, res: Response) => {
  try {
    const { category, paymentMethod, status, search } = req.query;

    const where: any = {};
    if (category && category !== "All") where.category = { contains: String(category) };
    if (paymentMethod && paymentMethod !== "All") where.paymentMethod = String(paymentMethod);
    if (status && status !== "All") where.status = String(status).toUpperCase();
    if (search) {
      where.OR = [
        { incomeName: { contains: String(search) } },
        { category: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const items = await prisma.incomeReportItem.findMany({
      where,
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch income report" });
  }
};

// GET /api/reports/tax/purchase
export const getPurchaseTaxReport = async (req: Request, res: Response) => {
  try {
    const { store, supplier, paymentMethod, search } = req.query;

    const where: any = {};
    if (store && store !== "All") where.store = String(store);
    if (supplier && supplier !== "All") where.supplier = { contains: String(supplier) };
    if (paymentMethod && paymentMethod !== "All") where.paymentMethod = String(paymentMethod);
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { supplier: { contains: String(search) } },
        { store: { contains: String(search) } },
      ];
    }

    const items = await prisma.purchaseTaxReportItem.findMany({
      where,
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch purchase tax report" });
  }
};

// GET /api/reports/tax/sales
export const getSalesTaxReport = async (req: Request, res: Response) => {
  try {
    const { store, customer, paymentMethod, search } = req.query;

    const where: any = {};
    if (store && store !== "All") where.store = String(store);
    if (customer && customer !== "All") where.customer = { contains: String(customer) };
    if (paymentMethod && paymentMethod !== "All") where.paymentMethod = String(paymentMethod);
    if (search) {
      where.OR = [
        { reference: { contains: String(search) } },
        { customer: { contains: String(search) } },
        { store: { contains: String(search) } },
      ];
    }

    const items = await prisma.salesTaxReportItem.findMany({
      where,
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch sales tax report" });
  }
};

// GET /api/reports/profit-loss
export const getProfitLossReport = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year) || 2026;

    // Fetch all non-cancelled real records
    const [orders, sales, purchases, expenses, incomes, payrolls] = await Promise.all([
      prisma.order.findMany({ where: { paymentStatus: { not: "CANCELLED" } } }),
      prisma.sale.findMany({ where: { status: { not: "CANCELLED" } } }),
      prisma.purchase.findMany({ where: { status: { not: "CANCELLED" } } }),
      prisma.expense.findMany({ where: { status: { not: "Pending" } } }),
      prisma.income.findMany({ where: { status: { not: "Pending" } } }),
      prisma.payroll.findMany({ where: { status: "PAID" } }),
    ]);

    // Helper to sum for a specific month (0 to 11)
    const sumForMonth = (records: any[], monthIndex: number, amountGetter: (r: any) => number, dateGetter?: (r: any) => Date | string) => {
      const monthStart = new Date(year, monthIndex, 1);
      const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

      return records
        .filter((r) => {
          const rawDate = dateGetter ? dateGetter(r) : r.createdAt;
          if (!rawDate) return false;
          const d = new Date(rawDate);
          if (isNaN(d.getTime())) return false;
          return d >= monthStart && d <= monthEnd;
        })
        .reduce((sum, r) => sum + (amountGetter(r) || 0), 0);
    };

    // Calculate month metrics for all 12 months (0 = Jan, 9 = Oct)
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    const salesRev = months.map(
      (m) =>
        sumForMonth(orders, m, (o) => o.total) +
        sumForMonth(sales, m, (s) => s.grandTotal)
    );

    const otherInc = months.map((m) =>
      sumForMonth(incomes, m, (i) => i.amount, (i) => i.date || i.createdAt)
    );

    const cogsExp = months.map((m) =>
      sumForMonth(purchases, m, (p) => p.total)
    );

    const operExp = months.map((m) =>
      sumForMonth(expenses, m, (e) => e.amount, (e) => e.date || e.createdAt)
    );

    const payExp = months.map((m) =>
      sumForMonth(payrolls, m, (p) => p.salary)
    );

    const buildRow = (id: string, type: "INCOME" | "EXPENSE", itemKey: string, dataArr: number[]) => ({
      id,
      type,
      itemKey,
      jan2026: Math.round(dataArr[0] * 100) / 100,
      feb2026: Math.round(dataArr[1] * 100) / 100,
      mar2026: Math.round(dataArr[2] * 100) / 100,
      apr2026: Math.round(dataArr[3] * 100) / 100,
      may2026: Math.round(dataArr[4] * 100) / 100,
      jun2026: Math.round(dataArr[5] * 100) / 100,
      jul2026: Math.round(dataArr[6] * 100) / 100,
      aug2026: Math.round(dataArr[7] * 100) / 100,
      sep2026: Math.round(dataArr[8] * 100) / 100,
      oct2026: Math.round(dataArr[9] * 100) / 100,
      nov2026: Math.round(dataArr[10] * 100) / 100,
      dec2026: Math.round(dataArr[11] * 100) / 100,
    });

    const items = [
      buildRow("inc-1", "INCOME", "Sales Revenue", salesRev),
      buildRow("inc-2", "INCOME", "Other Income & Services", otherInc),
      buildRow("exp-1", "EXPENSE", "Cost of Goods Sold (Purchases)", cogsExp),
      buildRow("exp-2", "EXPENSE", "Operating Expenses", operExp),
      buildRow("exp-3", "EXPENSE", "Salaries & Payroll", payExp),
    ];

    res.json({
      success: true,
      year,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch profit loss report" });
  }
};

// GET /api/reports/annual
export const getAnnualReport = async (req: Request, res: Response) => {
  try {
    const { year, store } = req.query;
    const where: any = {};
    if (year) where.year = Number(year);
    if (store && store !== "All Stores") where.store = String(store);

    const items = await prisma.annualReportItem.findMany({
      where,
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch annual report" });
  }
};
