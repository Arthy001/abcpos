import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/reports/sales
export const getSalesReport = async (req: Request, res: Response) => {
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
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
        { brand: { contains: String(search) } },
        { category: { contains: String(search) } },
      ];
    }

    const items = await prisma.salesReportItem.findMany({
      where,
      orderBy: { sku: "asc" },
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
    res.status(500).json({ success: false, error: error.message || "Failed to fetch sales report" });
  }
};

// GET /api/reports/bestsellers
export const getBestsellerReport = async (req: Request, res: Response) => {
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
        { sku: { contains: String(search) } },
        { productName: { contains: String(search) } },
        { brand: { contains: String(search) } },
        { category: { contains: String(search) } },
      ];
    }

    const items = await prisma.salesReportItem.findMany({
      where,
      orderBy: { soldQty: "desc" },
    });

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
    const items = await prisma.profitLossReportItem.findMany({
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
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
