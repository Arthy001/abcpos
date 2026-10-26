import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { recordStockMovement } from "../services/stock.service.js";

// ==========================================
// 🛠️ AUTO-SEED SAMPLE B2B DATA IF EMPTY
// ==========================================
export const seedB2bSampleData = async () => {
  try {
    const existingB2b = await prisma.customer.findFirst({
      where: { code: "B2B-001" },
    });

    if (!existingB2b) {
      // 1. Create B2B Wholesale Customers with Credit Limits
      const c1 = await prisma.customer.create({
        data: {
          code: "B2B-001",
          name: "หจก. พลาสติกไทยเจริญ (ยี่ปั๊วตลาดไท)",
          phone: "02-987-6543",
          email: "thaicharoen.plastic@gmail.com",
          address: "88/12 ตลาดไท อ.คลองหลวง จ.ปทุมธานี 12120",
          taxId: "0103558012345",
          branchNo: "00000",
          creditLimit: 250000.0,
          creditTermDays: 30,
          currentCreditUsed: 68000.0,
          status: "ACTIVE",
        },
      });

      const c2 = await prisma.customer.create({
        data: {
          code: "B2B-002",
          name: "บริษัท สยามแพ็คเกจจิ้ง แอนด์ เทรดดิ้ง จำกัด",
          phone: "02-456-7890",
          email: "procurement@siampackaging.co.th",
          address: "124/5 ถ.พระราม 2 แขวงแสมดำ เขตบางขุนเทียน กทม. 10150",
          taxId: "0105559098765",
          branchNo: "00001",
          creditLimit: 500000.0,
          creditTermDays: 60,
          currentCreditUsed: 136000.0,
          status: "ACTIVE",
        },
      });

      const c3 = await prisma.customer.create({
        data: {
          code: "B2B-003",
          name: "ร้าน มิตรภาพพลาสติก สาขาใหญ่ (สาย 4)",
          phone: "034-889-1122",
          email: "mittraphap.plastic@yahoo.com",
          address: "55 หมู่ 4 ต.กระทุ่มล้ม อ.สามพราน จ.นครปฐม 73220",
          taxId: "0102554033221",
          branchNo: "00000",
          creditLimit: 100000.0,
          creditTermDays: 15,
          currentCreditUsed: 0.0,
          status: "ACTIVE",
        },
      });

      // 2. Find sample finished plastic bag product
      const bagProduct = await prisma.product.findFirst({
        where: { sku: "FG-BAG-6X14" },
      });

      if (bagProduct) {
        // Create Sample Sales Order
        const orderDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3);

        const qty = 1000;
        const unitPrice = 68.0;
        const total = qty * unitPrice;

        await prisma.salesOrder.create({
          data: {
            orderNo: "SO-2026-0001",
            customerId: c1.id,
            customerName: c1.name,
            orderDate,
            deliveryDate,
            creditTermDays: 30,
            dueDate,
            subtotal: total,
            tax: 0.0,
            discount: 0.0,
            shippingFee: 0.0,
            total,
            status: "CONFIRMED",
            paymentStatus: "UNPAID",
            deliveryAddress: c1.address,
            salesPerson: "วิเชียร บริการดี (ฝ่ายขาย B2B)",
            notes: "ส่งมอบที่หน้าร้านตลาดไท ช่วงเวลา 04:00 - 07:00 น. นัดวางบิลสิ้นเดือน",
            items: {
              create: [
                {
                  productId: bagProduct.id,
                  productName: bagProduct.name,
                  sku: bagProduct.sku,
                  quantity: qty,
                  unit: "kg",
                  unitPrice,
                  discount: 0.0,
                  subtotal: total,
                },
              ],
            },
          },
        });
      }
    }
  } catch (err) {
    console.error("Error seeding B2B sample data:", err);
  }
};

// ==========================================
// 📋 B2B SALES ORDERS APIS
// ==========================================

export const getSalesOrders = async (req: Request, res: Response) => {
  try {
    await seedB2bSampleData();

    const orders = await prisma.salesOrder.findMany({
      include: {
        customer: {
          select: {
            id: true,
            code: true,
            name: true,
            phone: true,
            creditLimit: true,
            creditTermDays: true,
            currentCreditUsed: true,
            taxId: true,
          },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, stock: true } },
          },
        },
      },
      orderBy: { orderDate: "desc" },
    });

    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch sales orders" });
  }
};

export const getSalesOrderById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: "Sales Order not found" });
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch sales order details" });
  }
};

export const createSalesOrder = async (req: Request, res: Response) => {
  try {
    const {
      orderNo,
      customerId,
      deliveryDate,
      creditTermDays,
      items = [],
      discount = 0.0,
      tax = 0.0,
      shippingFee = 0.0,
      deliveryAddress,
      salesPerson = "Admin",
      notes,
    } = req.body;

    if (!orderNo || !customerId || items.length === 0) {
      return res.status(400).json({ success: false, error: "Missing required Sales Order fields or items" });
    }

    // Find customer & check credit limit
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    // Calculate subtotal & total
    let subtotal = 0;
    const itemsData = items.map((it: any) => {
      const q = Number(it.quantity) || 1;
      const price = Number(it.unitPrice) || 0;
      const d = Number(it.discount) || 0;
      const lineSubtotal = q * price - d;
      subtotal += lineSubtotal;
      return {
        productId: it.productId || null,
        productName: it.productName,
        sku: it.sku || null,
        quantity: q,
        unit: it.unit || "kg",
        unitPrice: price,
        discount: d,
        subtotal: lineSubtotal,
      };
    });

    const total = subtotal - Number(discount) + Number(tax) + Number(shippingFee);

    // Credit limit check
    const termDays = creditTermDays !== undefined ? Number(creditTermDays) : customer.creditTermDays;
    const availableCredit = customer.creditLimit - customer.currentCreditUsed;
    const isOverLimit = customer.creditLimit > 0 && total > availableCredit;

    // Calculate Due Date based on credit terms
    const orderDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + termDays);

    const salesOrder = await prisma.salesOrder.create({
      data: {
        orderNo,
        customerId,
        customerName: customer.name,
        orderDate,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        creditTermDays: termDays,
        dueDate,
        subtotal,
        discount: Number(discount),
        tax: Number(tax),
        shippingFee: Number(shippingFee),
        total,
        status: "CONFIRMED",
        paymentStatus: termDays === 0 ? "PAID" : "UNPAID",
        deliveryAddress: deliveryAddress || customer.address,
        salesPerson,
        notes,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // Update customer current credit used if credit term > 0
    if (termDays > 0) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { currentCreditUsed: { increment: total } },
      });
    }

    res.status(201).json({
      success: true,
      salesOrder,
      isOverLimit,
      availableCreditAfter: availableCredit - total,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create sales order" });
  }
};

export const updateSalesOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, paymentStatus } = req.body;

    const existing = await prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: "Sales Order not found" });
    }

    // If order was cancelled, revert customer credit
    if (status === "CANCELLED" && existing.status !== "CANCELLED") {
      if (existing.creditTermDays > 0 && existing.paymentStatus !== "PAID") {
        await prisma.customer.update({
          where: { id: existing.customerId },
          data: { currentCreditUsed: { decrement: existing.total } },
        });
      }
    }

    // If order completed, deduct product stock
    if (status === "COMPLETED" && existing.status !== "COMPLETED") {
      for (const item of existing.items) {
        if (item.productId) {
          const qtyToDeduct = Math.round(item.quantity);
          await recordStockMovement({
            productId: item.productId,
            type: "SALE_ISSUE",
            quantityDelta: -qtyToDeduct,
            referenceNo: existing.orderNo,
            notes: `ส่งมอบสินค้าตามใบสั่งขาย (${existing.orderNo} - ${existing.customerName})`,
          });
        }
      }
    }

    const updated = await prisma.salesOrder.update({
      where: { id },
      data: {
        status: status || existing.status,
        paymentStatus: paymentStatus || existing.paymentStatus,
      },
      include: { customer: true, items: true },
    });

    res.json({ success: true, salesOrder: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update sales order status" });
  }
};

export const deleteSalesOrder = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.salesOrder.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Sales Order not found" });
    }

    // Revert credit if unpaid
    if (existing.creditTermDays > 0 && existing.paymentStatus !== "PAID" && existing.status !== "CANCELLED") {
      await prisma.customer.update({
        where: { id: existing.customerId },
        data: { currentCreditUsed: { decrement: existing.total } },
      });
    }

    await prisma.salesOrder.delete({ where: { id } });
    res.json({ success: true, message: "Sales Order deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete sales order" });
  }
};

export const getCustomerCreditSummary = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: {
          where: { paymentStatus: { not: "PAID" } },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    const remainingCredit = Math.max(0, customer.creditLimit - customer.currentCreditUsed);
    const isOverLimit = customer.creditLimit > 0 && customer.currentCreditUsed > customer.creditLimit;

    res.json({
      success: true,
      credit: {
        creditLimit: customer.creditLimit,
        currentCreditUsed: customer.currentCreditUsed,
        remainingCredit,
        creditTermDays: customer.creditTermDays,
        isOverLimit,
        unpaidOrders: customer.salesOrders,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch customer credit summary" });
  }
};
