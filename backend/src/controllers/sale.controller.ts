import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { recordStockMovement } from "../services/stock.service.js";

const prisma = new PrismaClient();

// Seed initial sales, returns, and quotations if empty
const seedSalesDataIfEmpty = async () => {
  try {
    const saleCount = await prisma.sale.count();
    if (saleCount === 0) {
      const sampleSales = [
        {
          reference: "SL001",
          customerName: "Carl Evans",
          customerAvatar: "/assets/images/avatar-01.jpg",
          billerName: "Admin",
          storeName: "Electro Mart",
          warehouseName: "Lavish Warehouse",
          status: "COMPLETED",
          paymentStatus: "PAID",
          paymentMethod: "CASH",
          subtotal: 934.58,
          tax: 65.42,
          discount: 0,
          shipping: 0,
          grandTotal: 1000.0,
          paid: 1000.0,
          due: 0.0,
          notes: "Walk-in purchase",
          items: {
            create: [
              {
                productName: "Lenovo IdeaPad 3",
                productImage: "/assets/images/product-01.jpg",
                sku: "SKU-LENOVO-01",
                quantity: 1,
                unitPrice: 1000.0,
                subtotal: 1000.0,
                total: 1000.0,
              },
            ],
          },
          invoices: {
            create: [
              {
                invoiceNo: "INV001",
                customerName: "Carl Evans",
                customerAvatar: "/assets/images/avatar-01.jpg",
                amount: 1000.0,
                paid: 1000.0,
                amountDue: 0.0,
                status: "PAID",
              },
            ],
          },
        },
        {
          reference: "SL002",
          customerName: "Minerva Ramirez",
          customerAvatar: "/assets/images/avatar-02.jpg",
          billerName: "Admin",
          storeName: "Electro Mart",
          warehouseName: "Lavish Warehouse",
          status: "PENDING",
          paymentStatus: "UNPAID",
          paymentMethod: "BANK_TRANSFER",
          subtotal: 1401.87,
          tax: 98.13,
          discount: 0,
          shipping: 0,
          grandTotal: 1500.0,
          paid: 0.0,
          due: 1500.0,
          notes: "Awaiting wire transfer confirmation",
          items: {
            create: [
              {
                productName: "Beats Pro Headphone",
                productImage: "/assets/images/product-03.jpg",
                sku: "SKU-BEATS-03",
                quantity: 1,
                unitPrice: 1500.0,
                subtotal: 1500.0,
                total: 1500.0,
              },
            ],
          },
          invoices: {
            create: [
              {
                invoiceNo: "INV002",
                customerName: "Minerva Ramirez",
                customerAvatar: "/assets/images/avatar-02.jpg",
                amount: 1500.0,
                paid: 0.0,
                amountDue: 1500.0,
                status: "UNPAID",
              },
            ],
          },
        },
        {
          reference: "SL003",
          customerName: "Anthony Lewis",
          customerAvatar: "/assets/images/avatar-03.jpg",
          billerName: "Admin",
          storeName: "Electro Mart",
          warehouseName: "Lavish Warehouse",
          status: "COMPLETED",
          paymentStatus: "OVERDUE",
          paymentMethod: "CREDIT_CARD",
          subtotal: 1869.16,
          tax: 130.84,
          discount: 0,
          shipping: 0,
          grandTotal: 2000.0,
          paid: 1000.0,
          due: 1000.0,
          notes: "Split payment agreement",
          items: {
            create: [
              {
                productName: "Apple Series 5 Watch",
                productImage: "/assets/images/product-05.jpg",
                sku: "SKU-APPLE-05",
                quantity: 1,
                unitPrice: 2000.0,
                subtotal: 2000.0,
                total: 2000.0,
              },
            ],
          },
          invoices: {
            create: [
              {
                invoiceNo: "INV003",
                customerName: "Anthony Lewis",
                customerAvatar: "/assets/images/avatar-03.jpg",
                amount: 2000.0,
                paid: 1000.0,
                amountDue: 1000.0,
                status: "OVERDUE",
              },
            ],
          },
        },
        {
          reference: "SL004",
          customerName: "Brenda Cox",
          customerAvatar: "/assets/images/avatar-04.jpg",
          billerName: "Admin",
          storeName: "Electro Mart",
          warehouseName: "Lavish Warehouse",
          status: "COMPLETED",
          paymentStatus: "PAID",
          paymentMethod: "PROMPTPAY",
          subtotal: 747.66,
          tax: 52.34,
          discount: 0,
          shipping: 0,
          grandTotal: 800.0,
          paid: 800.0,
          due: 0.0,
          notes: "PromptPay QR code payment",
          items: {
            create: [
              {
                productName: "Amazon Echo Dot",
                productImage: "/assets/images/product-06.jpg",
                sku: "SKU-ECHO-06",
                quantity: 1,
                unitPrice: 800.0,
                subtotal: 800.0,
                total: 800.0,
              },
            ],
          },
          invoices: {
            create: [
              {
                invoiceNo: "INV004",
                customerName: "Brenda Cox",
                customerAvatar: "/assets/images/avatar-04.jpg",
                amount: 800.0,
                paid: 800.0,
                amountDue: 0.0,
                status: "PAID",
              },
            ],
          },
        },
        {
          reference: "SL005",
          customerName: "Mark Philips",
          customerAvatar: "/assets/images/avatar-05.jpg",
          billerName: "Admin",
          storeName: "Electro Mart",
          warehouseName: "Lavish Warehouse",
          status: "COMPLETED",
          paymentStatus: "PAID",
          paymentMethod: "CASH",
          subtotal: 1214.95,
          tax: 85.05,
          discount: 0,
          shipping: 0,
          grandTotal: 1300.0,
          paid: 1300.0,
          due: 0.0,
          notes: "Regular customer",
          items: {
            create: [
              {
                productName: "Red Premium Satchel",
                productImage: "/assets/images/product-08.jpg",
                sku: "SKU-BAG-08",
                quantity: 1,
                unitPrice: 1300.0,
                subtotal: 1300.0,
                total: 1300.0,
              },
            ],
          },
          invoices: {
            create: [
              {
                invoiceNo: "INV005",
                customerName: "Mark Philips",
                customerAvatar: "/assets/images/avatar-05.jpg",
                amount: 1300.0,
                paid: 1300.0,
                amountDue: 0.0,
                status: "PAID",
              },
            ],
          },
        },
      ];

      for (const sale of sampleSales) {
        await prisma.sale.create({
          data: sale,
        });
      }
    }

    const returnCount = await prisma.salesReturn.count();
    if (returnCount === 0) {
      const sampleReturns = [
        {
          reference: "SR001",
          saleReference: "SL001",
          customerName: "Carl Evans",
          customerAvatar: "/assets/images/avatar-01.jpg",
          productName: "Lenovo IdeaPad 3",
          productImage: "/assets/images/product-01.jpg",
          quantity: 1,
          status: "RECEIVED",
          totalAmount: 1000.0,
          paidAmount: 1000.0,
          dueAmount: 0.0,
          paymentStatus: "PAID",
          notes: "Customer decided to change screen size",
        },
        {
          reference: "SR002",
          saleReference: "SL002",
          customerName: "Minerva Ramirez",
          customerAvatar: "/assets/images/avatar-02.jpg",
          productName: "Beats Pro Headphone",
          productImage: "/assets/images/product-03.jpg",
          quantity: 1,
          status: "PENDING",
          totalAmount: 1500.0,
          paidAmount: 0.0,
          dueAmount: 1500.0,
          paymentStatus: "UNPAID",
          notes: "Defective audio on right earcup",
        },
        {
          reference: "SR003",
          saleReference: "SL003",
          customerName: "Anthony Lewis",
          customerAvatar: "/assets/images/avatar-03.jpg",
          productName: "Apple Series 5 Watch",
          productImage: "/assets/images/product-05.jpg",
          quantity: 1,
          status: "RECEIVED",
          totalAmount: 2000.0,
          paidAmount: 1000.0,
          dueAmount: 1000.0,
          paymentStatus: "OVERDUE",
          notes: "Exchanged for Series 7",
        },
        {
          reference: "SR004",
          saleReference: "SL004",
          customerName: "Brenda Cox",
          customerAvatar: "/assets/images/avatar-04.jpg",
          productName: "Amazon Echo Dot",
          productImage: "/assets/images/product-06.jpg",
          quantity: 1,
          status: "RECEIVED",
          totalAmount: 800.0,
          paidAmount: 800.0,
          dueAmount: 0.0,
          paymentStatus: "PAID",
          notes: "Color mismatch with home interior",
        },
      ];

      for (const ret of sampleReturns) {
        await prisma.salesReturn.create({
          data: ret,
        });
      }
    }

    const quotationCount = await prisma.quotation.count();
    if (quotationCount === 0) {
      const sampleQuotations = [
        {
          reference: "QT001",
          customerName: "Carl Evans",
          customerAvatar: "/assets/images/avatar-01.jpg",
          productName: "Lenovo 3rd Generation",
          productImage: "/assets/images/product-01.jpg",
          quantity: 1,
          unitPrice: 550.0,
          total: 550.0,
          status: "SENT",
          notes: "Corporate quotation valid for 15 days",
        },
        {
          reference: "QT002",
          customerName: "Minerva Ramirez",
          customerAvatar: "/assets/images/avatar-02.jpg",
          productName: "Bold V3.2 Wireless Speaker",
          productImage: "/assets/images/product-03.jpg",
          quantity: 1,
          unitPrice: 430.0,
          total: 430.0,
          status: "SENT",
          notes: "Includes 1 year extended warranty",
        },
        {
          reference: "QT003",
          customerName: "Anthony Lewis",
          customerAvatar: "/assets/images/avatar-03.jpg",
          productName: "Nike Jordan Shoes Edition",
          productImage: "/assets/images/product-04.jpg",
          quantity: 1,
          unitPrice: 620.0,
          total: 620.0,
          status: "ORDERED",
          notes: "Special preorder quotation",
        },
        {
          reference: "QT004",
          customerName: "Brenda Cox",
          customerAvatar: "/assets/images/avatar-04.jpg",
          productName: "Apple Series 5 Watch Pro",
          productImage: "/assets/images/product-05.jpg",
          quantity: 1,
          unitPrice: 780.0,
          total: 780.0,
          status: "PENDING",
          notes: "Discount applied for student card",
        },
      ];

      for (const qt of sampleQuotations) {
        await prisma.quotation.create({
          data: qt,
        });
      }
    }
  } catch (err) {
    console.error("Error seeding sales data:", err);
  }
};

// ==========================================
// 1. SALES CONTROLLER
// ==========================================
export const getSales = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedSalesDataIfEmpty();
    const { status, paymentStatus, search } = req.query;

    const where: any = {};

    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = String(paymentStatus).toUpperCase();
    }
    if (search && String(search).trim() !== "") {
      const q = String(search).trim();
      where.OR = [
        { reference: { contains: q } },
        { customerName: { contains: q } },
        { billerName: { contains: q } },
        { storeName: { contains: q } },
        { notes: { contains: q } },
      ];
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: true,
        invoices: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch sales" });
  }
};

export const getSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        invoices: true,
      },
    });
    if (!sale) {
      res.status(404).json({ error: "Sale not found" });
      return;
    }
    res.json(sale);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch sale" });
  }
};

export const createSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      reference,
      customerId,
      customerName,
      customerAvatar,
      billerName,
      storeName,
      warehouseName,
      date,
      status = "COMPLETED",
      paymentStatus = "PAID",
      paymentMethod = "CASH",
      subtotal = 0,
      tax = 0,
      discount = 0,
      shipping = 0,
      grandTotal = 0,
      paid = 0,
      due = 0,
      notes,
      items = [],
    } = req.body;

    const ref = reference || `SL${Math.floor(100 + Math.random() * 900)}`;

    const newSale = await prisma.sale.create({
      data: {
        reference: ref,
        customerId,
        customerName: customerName || "Walk-in Customer",
        customerAvatar: customerAvatar || "/assets/images/avatar-01.jpg",
        billerName: billerName || "Admin",
        storeName: storeName || "Electro Mart",
        warehouseName: warehouseName || "Lavish Warehouse",
        date: date ? new Date(date) : new Date(),
        status,
        paymentStatus,
        paymentMethod,
        subtotal: Number(subtotal),
        tax: Number(tax),
        discount: Number(discount),
        shipping: Number(shipping),
        grandTotal: Number(grandTotal),
        paid: Number(paid),
        due: Number(due),
        notes,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            productName: item.productName || "Product",
            productImage: item.productImage || "/assets/images/product-01.jpg",
            sku: item.sku || null,
            quantity: Number(item.quantity || 1),
            unitPrice: Number(item.unitPrice || 0),
            tax: Number(item.tax || 0),
            discount: Number(item.discount || 0),
            subtotal: Number(item.subtotal || 0),
            total: Number(item.total || 0),
          })),
        },
        invoices: {
          create: [
            {
              invoiceNo: `INV${Math.floor(100 + Math.random() * 900)}`,
              customerName: customerName || "Walk-in Customer",
              customerAvatar: customerAvatar || "/assets/images/avatar-01.jpg",
              amount: Number(grandTotal),
              paid: Number(paid),
              amountDue: Number(due),
              status: paymentStatus,
              notes,
            },
          ],
        },
      },
      include: {
        items: true,
        invoices: true,
      },
    });

    // Auto Deduct Product Stock & Log Goods Issue (SALE_ISSUE) when sold
    if (status === "COMPLETED") {
      for (const item of items) {
        await recordStockMovement({
          productId: item.productId,
          productName: item.productName,
          warehouseName: warehouseName || "Lavish Warehouse",
          quantityDelta: -(Number(item.quantity) || 1),
          type: "SALE_ISSUE",
          referenceNo: ref,
          unitCost: item.unitPrice ? Number(item.unitPrice) : null,
          notes: `POS/Sales Issue - Order ${ref}`,
          createdBy: billerName || "Admin",
        });
      }
    }

    res.status(201).json(newSale);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create sale" });
  }
};

export const updateSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const {
      customerName,
      customerAvatar,
      billerName,
      storeName,
      warehouseName,
      status,
      paymentStatus,
      paymentMethod,
      grandTotal,
      paid,
      due,
      notes,
    } = req.body;

    const updated = await prisma.sale.update({
      where: { id },
      data: {
        customerName,
        customerAvatar,
        billerName,
        storeName,
        warehouseName,
        status,
        paymentStatus,
        paymentMethod,
        grandTotal: grandTotal !== undefined ? Number(grandTotal) : undefined,
        paid: paid !== undefined ? Number(paid) : undefined,
        due: due !== undefined ? Number(due) : undefined,
        notes,
      },
      include: {
        items: true,
        invoices: true,
      },
    });

    // Sync Invoice status
    if (paymentStatus) {
      await prisma.invoice.updateMany({
        where: { saleId: id },
        data: {
          status: paymentStatus,
          paid: paid !== undefined ? Number(paid) : undefined,
          amountDue: due !== undefined ? Number(due) : undefined,
        },
      });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update sale" });
  }
};

export const deleteSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.sale.delete({
      where: { id },
    });
    res.json({ message: "Sale deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete sale" });
  }
};

// ==========================================
// 2. INVOICES CONTROLLER
// ==========================================
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedSalesDataIfEmpty();
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search && String(search).trim() !== "") {
      const q = String(search).trim();
      where.OR = [
        { invoiceNo: { contains: q } },
        { customerName: { contains: q } },
        { notes: { contains: q } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        sale: {
          include: {
            items: true,
          },
        },
      },
      orderBy: {
        issueDate: "desc",
      },
    });

    res.json(invoices);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch invoices" });
  }
};

export const updateInvoicePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { paid, status } = req.body;

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      res.status(404).json({ error: "Invoice not found" });
      return;
    }

    const newPaid = Number(paid);
    const newDue = Math.max(0, invoice.amount - newPaid);
    const newStatus = status || (newDue === 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : "UNPAID");

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        paid: newPaid,
        amountDue: newDue,
        status: newStatus,
      },
      include: {
        sale: true,
      },
    });

    // Update parent sale if linked
    if (invoice.saleId) {
      await prisma.sale.update({
        where: { id: invoice.saleId },
        data: {
          paid: newPaid,
          due: newDue,
          paymentStatus: newStatus,
        },
      });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update invoice payment" });
  }
};

// ==========================================
// 3. SALES RETURNS CONTROLLER
// ==========================================
export const getSalesReturns = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedSalesDataIfEmpty();
    const { status, paymentStatus, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (paymentStatus && paymentStatus !== "all") {
      where.paymentStatus = String(paymentStatus).toUpperCase();
    }
    if (search && String(search).trim() !== "") {
      const q = String(search).trim();
      where.OR = [
        { reference: { contains: q } },
        { saleReference: { contains: q } },
        { customerName: { contains: q } },
        { productName: { contains: q } },
        { notes: { contains: q } },
      ];
    }

    const returns = await prisma.salesReturn.findMany({
      where,
      orderBy: {
        date: "desc",
      },
    });

    res.json(returns);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch sales returns" });
  }
};

export const createSalesReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      reference,
      saleReference,
      customerId,
      customerName,
      customerAvatar,
      warehouseName,
      productId,
      productName,
      productImage,
      quantity = 1,
      date,
      status = "RECEIVED",
      totalAmount = 0,
      paidAmount = 0,
      dueAmount = 0,
      paymentStatus = "PAID",
      notes,
    } = req.body;

    const ref = reference || `SR${Math.floor(100 + Math.random() * 900)}`;

    const newReturn = await prisma.salesReturn.create({
      data: {
        reference: ref,
        saleReference,
        customerId,
        customerName: customerName || "Walk-in Customer",
        customerAvatar: customerAvatar || "/assets/images/avatar-01.jpg",
        warehouseName: warehouseName || "Lavish Warehouse",
        productId,
        productName: productName || "Returned Product",
        productImage: productImage || "/assets/images/product-01.jpg",
        quantity: Number(quantity),
        date: date ? new Date(date) : new Date(),
        status,
        totalAmount: Number(totalAmount),
        paidAmount: Number(paidAmount),
        dueAmount: Number(dueAmount),
        paymentStatus,
        notes,
      },
    });

    // Auto Ingest product stock back into inventory when returned
    if (status === "RECEIVED") {
      await recordStockMovement({
        productId,
        productName,
        warehouseName: warehouseName || "Lavish Warehouse",
        quantityDelta: Number(quantity) || 1,
        type: "CUSTOMER_RETURN",
        referenceNo: ref,
        notes: `Sales Return ${ref} (Original: ${saleReference || "N/A"}) - ${notes || ""}`,
        createdBy: "Admin",
      });
    }

    res.status(201).json(newReturn);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create sales return" });
  }
};

export const updateSalesReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const {
      customerName,
      warehouseName,
      productName,
      quantity,
      status,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      notes,
    } = req.body;

    const updated = await prisma.salesReturn.update({
      where: { id },
      data: {
        customerName,
        warehouseName,
        productName,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        status,
        totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
        paidAmount: paidAmount !== undefined ? Number(paidAmount) : undefined,
        dueAmount: dueAmount !== undefined ? Number(dueAmount) : undefined,
        paymentStatus,
        notes,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update sales return" });
  }
};

export const deleteSalesReturn = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.salesReturn.delete({
      where: { id },
    });
    res.json({ message: "Sales return deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete sales return" });
  }
};

// ==========================================
// 4. QUOTATIONS CONTROLLER
// ==========================================
export const getQuotations = async (req: Request, res: Response): Promise<void> => {
  try {
    await seedSalesDataIfEmpty();
    const { status, search } = req.query;

    const where: any = {};
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search && String(search).trim() !== "") {
      const q = String(search).trim();
      where.OR = [
        { reference: { contains: q } },
        { customerName: { contains: q } },
        { productName: { contains: q } },
        { notes: { contains: q } },
      ];
    }

    const quotations = await prisma.quotation.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(quotations);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch quotations" });
  }
};

export const createQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      reference,
      customerId,
      customerName,
      customerAvatar,
      productId,
      productName,
      productImage,
      quantity = 1,
      unitPrice = 0,
      tax = 0,
      discount = 0,
      total = 0,
      status = "SENT",
      validUntil,
      notes,
    } = req.body;

    const ref = reference || `QT${Math.floor(100 + Math.random() * 900)}`;

    const newQuotation = await prisma.quotation.create({
      data: {
        reference: ref,
        customerId,
        customerName: customerName || "General Customer",
        customerAvatar: customerAvatar || "/assets/images/avatar-01.jpg",
        productId,
        productName: productName || "Quoted Product",
        productImage: productImage || "/assets/images/product-01.jpg",
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        tax: Number(tax),
        discount: Number(discount),
        total: Number(total),
        status,
        validUntil: validUntil ? new Date(validUntil) : null,
        notes,
      },
    });

    res.status(201).json(newQuotation);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create quotation" });
  }
};

export const updateQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const {
      customerName,
      productName,
      quantity,
      unitPrice,
      total,
      status,
      notes,
    } = req.body;

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        customerName,
        productName,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        unitPrice: unitPrice !== undefined ? Number(unitPrice) : undefined,
        total: total !== undefined ? Number(total) : undefined,
        status,
        notes,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update quotation" });
  }
};

export const deleteQuotation = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.quotation.delete({
      where: { id },
    });
    res.json({ message: "Quotation deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete quotation" });
  }
};

export const convertQuotationToSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const quotation = await prisma.quotation.findUnique({ where: { id } });
    if (!quotation) {
      res.status(404).json({ error: "Quotation not found" });
      return;
    }

    const saleRef = `SL${Math.floor(100 + Math.random() * 900)}`;

    const newSale = await prisma.sale.create({
      data: {
        reference: saleRef,
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        customerAvatar: quotation.customerAvatar,
        billerName: "Admin",
        storeName: "Electro Mart",
        warehouseName: "Lavish Warehouse",
        status: "COMPLETED",
        paymentStatus: "PAID",
        paymentMethod: "CASH",
        subtotal: quotation.total,
        tax: 0,
        discount: 0,
        shipping: 0,
        grandTotal: quotation.total,
        paid: quotation.total,
        due: 0,
        notes: `Converted from Quotation Ref: ${quotation.reference}. ${quotation.notes || ""}`,
        items: {
          create: [
            {
              productId: quotation.productId,
              productName: quotation.productName,
              productImage: quotation.productImage,
              quantity: quotation.quantity,
              unitPrice: quotation.unitPrice,
              subtotal: quotation.total,
              total: quotation.total,
            },
          ],
        },
        invoices: {
          create: [
            {
              invoiceNo: `INV${Math.floor(100 + Math.random() * 900)}`,
              customerName: quotation.customerName,
              customerAvatar: quotation.customerAvatar,
              amount: quotation.total,
              paid: quotation.total,
              amountDue: 0,
              status: "PAID",
              notes: `Generated from Quotation ${quotation.reference}`,
            },
          ],
        },
      },
      include: {
        items: true,
        invoices: true,
      },
    });

    // Mark quotation as ORDERED and link convertedSaleId
    await prisma.quotation.update({
      where: { id },
      data: {
        status: "ORDERED",
        convertedSaleId: newSale.id,
      },
    });

    // Deduct stock & log SALE_ISSUE
    await recordStockMovement({
      productId: quotation.productId,
      productName: quotation.productName,
      warehouseName: "Lavish Warehouse",
      quantityDelta: -(Number(quotation.quantity) || 1),
      type: "SALE_ISSUE",
      referenceNo: saleRef,
      unitCost: quotation.unitPrice,
      notes: `Converted from Quotation ${quotation.reference}`,
      createdBy: "Admin",
    });

    res.status(201).json({
      message: `Quotation ${quotation.reference} successfully converted to Sale ${saleRef}!`,
      sale: newSale,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to convert quotation to sale" });
  }
};
