import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// 📑 1. WITHHOLDING TAX (หัก ณ ที่จ่าย - ภ.ง.ด. 3, 53)
// ==========================================

const DEFAULT_WHT_RECORDS = [
  {
    whtNumber: "WHT-202610-001",
    formType: "PND53",
    payerName: "ABC POS Retail Co., Ltd.",
    payerTaxId: "010556209999",
    payerAddress: "88/9 Sukhumvit Road, Khlong Toei, Bangkok 10110",
    payeeType: "COMPANY",
    payeeName: "Fast Freight Logistics Co., Ltd.",
    payeeTaxId: "0105558012345",
    payeeBranch: "00000",
    payeeAddress: "123 Rama 3 Rd, Yan Nawa, Bangkok 10120",
    incomeType: "TRANSPORT",
    description: "ค่าขนส่งเม็ดพลาสติกและบรรจุภัณฑ์ ประจำเดือน",
    baseAmount: 15000,
    taxRate: 1.0,
    taxAmount: 150,
    netPaid: 14850,
    paymentMethod: "TRANSFER",
    status: "ISSUED",
    notes: "หัก ณ ที่จ่าย 1% ค่าขนส่ง",
  },
  {
    whtNumber: "WHT-202610-002",
    formType: "PND53",
    payerName: "ABC POS Retail Co., Ltd.",
    payerTaxId: "010556209999",
    payerAddress: "88/9 Sukhumvit Road, Khlong Toei, Bangkok 10110",
    payeeType: "COMPANY",
    payeeName: "Siam Cloud IT Solutions Co., Ltd.",
    payeeTaxId: "0105561088771",
    payeeBranch: "00000",
    payeeAddress: "456 Asoke Towers, Sukhumvit 21, Bangkok 10110",
    incomeType: "SERVICE",
    description: "ค่าบริการบำรุงรักษาระบบคลาวด์และเซิร์ฟเวอร์",
    baseAmount: 20000,
    taxRate: 3.0,
    taxAmount: 600,
    netPaid: 19400,
    paymentMethod: "TRANSFER",
    status: "ISSUED",
    notes: "หัก ณ ที่จ่าย 3% ค่าบริการ",
  },
  {
    whtNumber: "WHT-202610-003",
    formType: "PND3",
    payerName: "ABC POS Retail Co., Ltd.",
    payerTaxId: "010556209999",
    payerAddress: "88/9 Sukhumvit Road, Khlong Toei, Bangkok 10110",
    payeeType: "INDIVIDUAL",
    payeeName: "นาย สมศักดิ์ มีสุข",
    payeeTaxId: "3100500123456",
    payeeBranch: "00000",
    payeeAddress: "77 ซอยอุดมสุข 15 บางนา กรุงเทพฯ 10260",
    incomeType: "RENT",
    description: "ค่าเช่าโกดังพักสินค้าและวัตถุดิบชั่วคราว",
    baseAmount: 30000,
    taxRate: 5.0,
    taxAmount: 1500,
    netPaid: 28500,
    paymentMethod: "TRANSFER",
    status: "ISSUED",
    notes: "หัก ณ ที่จ่าย 5% ค่าเช่าสถานที่",
  },
];

export const getWithholdingTaxes = async (req: Request, res: Response) => {
  try {
    const count = await prisma.withholdingTax.count();
    if (count === 0) {
      await prisma.withholdingTax.createMany({ data: DEFAULT_WHT_RECORDS });
    }

    const { formType, incomeType, status, search } = req.query;
    const where: any = {};

    if (formType && formType !== "all" && formType !== "All") where.formType = String(formType);
    if (incomeType && incomeType !== "all" && incomeType !== "All") where.incomeType = String(incomeType);
    if (status && status !== "all" && status !== "All") where.status = String(status);
    if (search) {
      where.OR = [
        { whtNumber: { contains: String(search) } },
        { payeeName: { contains: String(search) } },
        { payeeTaxId: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const records = await prisma.withholdingTax.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch Withholding Tax records" });
  }
};

export const createWithholdingTax = async (req: Request, res: Response) => {
  try {
    const {
      formType = "PND53",
      payerName,
      payerTaxId,
      payerAddress,
      payeeType = "COMPANY",
      payeeName,
      payeeTaxId,
      payeeBranch = "00000",
      payeeAddress,
      incomeType = "SERVICE",
      description,
      baseAmount,
      taxRate = 3.0,
      paymentMethod = "TRANSFER",
      notes,
    } = req.body;

    if (!payeeName || !description || Number(baseAmount) <= 0) {
      return res.status(400).json({ success: false, error: "Missing required payee or base amount" });
    }

    const base = Number(baseAmount);
    const rate = Number(taxRate);
    const tax = Math.round((base * rate) / 100 * 100) / 100;
    const net = Math.round((base - tax) * 100) / 100;

    // Generate Running Number
    const count = await prisma.withholdingTax.count();
    const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
    const whtNumber = `WHT-${dateStr}-${String(count + 1).padStart(3, "0")}`;

    const record = await prisma.withholdingTax.create({
      data: {
        whtNumber,
        formType,
        payerName: payerName || "ABC POS Retail Co., Ltd.",
        payerTaxId: payerTaxId || "010556209999",
        payerAddress: payerAddress || "88/9 Sukhumvit Road, Khlong Toei, Bangkok 10110",
        payeeType,
        payeeName,
        payeeTaxId,
        payeeBranch,
        payeeAddress,
        incomeType,
        description,
        baseAmount: base,
        taxRate: rate,
        taxAmount: tax,
        netPaid: net,
        paymentMethod,
        status: "ISSUED",
        notes,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create Withholding Tax record" });
  }
};

export const updateWithholdingTax = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      formType,
      payeeType,
      payeeName,
      payeeTaxId,
      payeeBranch,
      payeeAddress,
      incomeType,
      description,
      baseAmount,
      taxRate,
      paymentMethod,
      status,
      notes,
    } = req.body;

    const existing = await prisma.withholdingTax.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    const base = baseAmount !== undefined ? Number(baseAmount) : existing.baseAmount;
    const rate = taxRate !== undefined ? Number(taxRate) : existing.taxRate;
    const tax = Math.round((base * rate) / 100 * 100) / 100;
    const net = Math.round((base - tax) * 100) / 100;

    const updated = await prisma.withholdingTax.update({
      where: { id },
      data: {
        formType: formType ?? existing.formType,
        payeeType: payeeType ?? existing.payeeType,
        payeeName: payeeName ?? existing.payeeName,
        payeeTaxId: payeeTaxId ?? existing.payeeTaxId,
        payeeBranch: payeeBranch ?? existing.payeeBranch,
        payeeAddress: payeeAddress ?? existing.payeeAddress,
        incomeType: incomeType ?? existing.incomeType,
        description: description ?? existing.description,
        baseAmount: base,
        taxRate: rate,
        taxAmount: tax,
        netPaid: net,
        paymentMethod: paymentMethod ?? existing.paymentMethod,
        status: status ?? existing.status,
        notes: notes ?? existing.notes,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update Withholding Tax record" });
  }
};

export const deleteWithholdingTax = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.withholdingTax.delete({ where: { id } });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete Withholding Tax record" });
  }
};

// ==========================================
// 🧾 2. FULL TAX INVOICE (ใบกำกับภาษีเต็มรูป / ใบเสร็จรับเงิน)
// ==========================================

const DEFAULT_TAX_INVOICES = [
  {
    invoiceNumber: "TAX-202610-0001",
    saleReference: "SO-202610-001",
    customerName: "บริษัท บรรจุภัณฑ์ไทยแลนด์ จำกัด",
    taxId: "0105559098765",
    branch: "00000",
    address: "99/1 ถนนเพชรเกษม แขวงหนองค้างพลู เขตหนองแขม กรุงเทพฯ 10160",
    phone: "02-888-9999",
    subtotal: 15600.0,
    vatRate: 7.0,
    vatAmount: 1092.0,
    grandTotal: 16692.0,
    paymentMethod: "TRANSFER",
    status: "ISSUED",
    issuedBy: "Admin",
    notes: "สั่งซื้อถุงพลาสติกหูหิ้ว HDPE 50,000 ใบ",
  },
  {
    invoiceNumber: "TAX-202610-0002",
    saleReference: "SL-849201",
    customerName: "บจก. ยูนิเวอร์แซล มาร์เก็ตติ้ง",
    taxId: "0105557011223",
    branch: "00001",
    address: "555/8 ซอยลาดพร้าว 101 คลองจั่น บางกะปิ กรุงเทพฯ 10240",
    phone: "02-777-6655",
    subtotal: 8500.0,
    vatRate: 7.0,
    vatAmount: 595.0,
    grandTotal: 9095.0,
    paymentMethod: "CREDIT_CARD",
    status: "ISSUED",
    issuedBy: "Cashier 01",
    notes: "ซื้อหน้าร้าน ออกใบกำกับภาษีเต็มรูป",
  },
];

export const getTaxInvoices = async (req: Request, res: Response) => {
  try {
    const count = await prisma.taxInvoice.count();
    if (count === 0) {
      await prisma.taxInvoice.createMany({ data: DEFAULT_TAX_INVOICES });
    }

    const { status, search } = req.query;
    const where: any = {};

    if (status && status !== "all" && status !== "All") where.status = String(status);
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: String(search) } },
        { customerName: { contains: String(search) } },
        { taxId: { contains: String(search) } },
        { saleReference: { contains: String(search) } },
      ];
    }

    const records = await prisma.taxInvoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: records });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch Tax Invoices" });
  }
};

export const createTaxInvoice = async (req: Request, res: Response) => {
  try {
    const {
      saleReference,
      customerName,
      taxId,
      branch = "00000",
      address,
      phone,
      subtotal,
      vatRate = 7.0,
      paymentMethod = "TRANSFER",
      issuedBy = "Admin",
      notes,
    } = req.body;

    if (!customerName || !taxId || Number(subtotal) <= 0) {
      return res.status(400).json({ success: false, error: "Missing required customer name, tax ID, or subtotal" });
    }

    const sub = Number(subtotal);
    const rate = Number(vatRate);
    const vat = Math.round((sub * rate) / 100 * 100) / 100;
    const grand = Math.round((sub + vat) * 100) / 100;

    const count = await prisma.taxInvoice.count();
    const dateStr = new Date().toISOString().slice(0, 7).replace("-", "");
    const invoiceNumber = `TAX-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    const record = await prisma.taxInvoice.create({
      data: {
        invoiceNumber,
        saleReference,
        customerName,
        taxId,
        branch,
        address: address || "กรุงเทพมหานคร",
        phone,
        subtotal: sub,
        vatRate: rate,
        vatAmount: vat,
        grandTotal: grand,
        paymentMethod,
        status: "ISSUED",
        issuedBy,
        notes,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create Tax Invoice" });
  }
};

export const updateTaxInvoice = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      customerName,
      taxId,
      branch,
      address,
      phone,
      subtotal,
      vatRate,
      paymentMethod,
      status,
      notes,
    } = req.body;

    const existing = await prisma.taxInvoice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Tax invoice not found" });
    }

    const sub = subtotal !== undefined ? Number(subtotal) : existing.subtotal;
    const rate = vatRate !== undefined ? Number(vatRate) : existing.vatRate;
    const vat = Math.round((sub * rate) / 100 * 100) / 100;
    const grand = Math.round((sub + vat) * 100) / 100;

    const updated = await prisma.taxInvoice.update({
      where: { id },
      data: {
        customerName: customerName ?? existing.customerName,
        taxId: taxId ?? existing.taxId,
        branch: branch ?? existing.branch,
        address: address ?? existing.address,
        phone: phone ?? existing.phone,
        subtotal: sub,
        vatRate: rate,
        vatAmount: vat,
        grandTotal: grand,
        paymentMethod: paymentMethod ?? existing.paymentMethod,
        status: status ?? existing.status,
        notes: notes ?? existing.notes,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update Tax Invoice" });
  }
};

export const deleteTaxInvoice = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.taxInvoice.delete({ where: { id } });
    res.json({ success: true, message: "Tax Invoice deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete Tax Invoice" });
  }
};

// ==========================================
// 📦 3. ACCOUNTANT EXPORT HUB (รายงานสรุปส่งสำนักงานบัญชี)
// ==========================================

export const getAccountantExportPackage = async (req: Request, res: Response) => {
  try {
    const { period = new Date().toISOString().slice(0, 7) } = req.query; // YYYY-MM

    // 1. Sales & Output VAT
    const [sales, taxInvoices] = await Promise.all([
      prisma.sale.findMany({
        where: { status: { not: "CANCELLED" } },
        orderBy: { date: "desc" },
      }),
      prisma.taxInvoice.findMany({
        where: { status: "ISSUED" },
        orderBy: { date: "desc" },
      }),
    ]);

    const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
    const totalOutputVat = sales.reduce((sum, s) => sum + (s.tax || 0), 0);

    // 2. Purchases & Input VAT
    const purchases = await prisma.purchase.findMany({
      where: { status: { not: "CANCELLED" } },
      orderBy: { date: "desc" },
    });
    const totalPurchaseCost = purchases.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalInputVat = purchases.reduce((sum, p) => sum + (p.tax || 0), 0);

    // Net VAT Payable to Revenue Dept
    const netVatPayable = totalOutputVat - totalInputVat;

    // 3. Withholding Tax Summary
    const whtRecords = await prisma.withholdingTax.findMany({
      where: { status: "ISSUED" },
      orderBy: { date: "desc" },
    });
    const totalWhtBase = whtRecords.reduce((sum, w) => sum + (w.baseAmount || 0), 0);
    const totalWhtDeducted = whtRecords.reduce((sum, w) => sum + (w.taxAmount || 0), 0);

    // 4. Ending Inventory Valuation (มูลค่าสินค้าและวัตถุดิบคงเหลือ)
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    const totalInventoryValue = products.reduce((sum, p) => {
      const unitCost = p.costPrice > 0 ? p.costPrice : p.price * 0.7;
      return sum + (p.stock > 0 ? p.stock * unitCost : 0);
    }, 0);

    // 5. Cash & Bank Balances
    const bankAccounts = await prisma.bankAccount.findMany();
    const totalBankBalance = bankAccounts.reduce((sum, b) => sum + (b.balance || 0), 0);

    // 6. Accounts Receivable & Accounts Payable
    const accountsReceivable = sales.reduce((sum, s) => {
      const due = s.due ?? (s.grandTotal - (s.paid || 0));
      return sum + (due > 0 ? due : 0);
    }, 0);

    const accountsPayable = purchases.reduce((sum, p) => {
      const due = p.due ?? (p.total - (p.paid || 0));
      return sum + (due > 0 ? due : 0);
    }, 0);

    res.json({
      success: true,
      data: {
        period,
        company: {
          name: "ABC POS Retail Co., Ltd.",
          taxId: "010556209999",
          branch: "00000",
        },
        summary: {
          totalSalesRevenue,
          totalOutputVat,
          totalPurchaseCost,
          totalInputVat,
          netVatPayable,
          totalWhtBase,
          totalWhtDeducted,
          totalInventoryValue,
          totalBankBalance,
          accountsReceivable,
          accountsPayable,
        },
        salesVatItems: sales.map(s => ({
          date: s.date,
          reference: s.reference,
          customer: s.customerName,
          subtotal: s.subtotal,
          tax: s.tax,
          total: s.grandTotal,
        })),
        purchaseVatItems: purchases.map(p => ({
          date: p.date,
          reference: p.reference,
          supplier: p.supplierName,
          subtotal: (p.total || 0) - (p.tax || 0),
          tax: p.tax,
          total: p.total,
        })),
        withholdingTaxItems: whtRecords,
        inventoryValuation: products.map(p => ({
          code: p.sku || p.id,
          name: p.name,
          category: p.category?.name || "General",
          stock: p.stock,
          unitCost: p.costPrice > 0 ? p.costPrice : p.price * 0.7,
          totalValue: (p.stock || 0) * (p.costPrice > 0 ? p.costPrice : p.price * 0.7),
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to generate accountant export package" });
  }
};
