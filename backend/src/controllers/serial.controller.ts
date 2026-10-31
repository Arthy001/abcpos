import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// GET /api/products/:id/serial-numbers (List serial numbers of a product)
export const getProductSerialNumbers = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const productId = Array.isArray(rawId) ? rawId[0] : (rawId as string);
    const { status, search } = req.query;

    const where: any = { productId };
    if (status && status !== "all") {
      where.status = String(status).toUpperCase();
    }
    if (search) {
      where.serialNo = { contains: String(search) };
    }

    const serialNumbers = await prisma.productSerialNumber.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      success: true,
      data: serialNumbers,
      count: serialNumbers.length,
    });
  } catch (error: any) {
    console.error("Error fetching product serial numbers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch serial numbers",
      error: error.message,
    });
  }
};

// POST /api/products/:id/serial-numbers (Add single or bulk serial numbers)
export const addProductSerialNumbers = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const productId = Array.isArray(rawId) ? rawId[0] : (rawId as string);
    const { serialNumbers = [], warrantyMonths = 12, notes } = req.body;

    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one serial number is required",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Sanitize and trim
    const cleanSerials = serialNumbers
      .map((s: string) => String(s).trim())
      .filter((s: string) => s.length > 0);

    // Check duplicates against existing DB
    const existing = await prisma.productSerialNumber.findMany({
      where: {
        serialNo: { in: cleanSerials },
      },
    });

    if (existing.length > 0) {
      const dupes = existing.map((e) => e.serialNo).join(", ");
      return res.status(400).json({
        success: false,
        message: `The following Serial Numbers already exist in the system: ${dupes}`,
      });
    }

    // Insert serial records
    const createdRecords = await prisma.$transaction(
      cleanSerials.map((sn: string) =>
        prisma.productSerialNumber.create({
          data: {
            serialNo: sn,
            productId,
            status: "AVAILABLE",
            warrantyMonths: Number(warrantyMonths) || 12,
            notes: notes || null,
          },
        })
      )
    );

    // Make sure trackingType is set to SERIAL
    if (product.trackingType !== "SERIAL") {
      await prisma.product.update({
        where: { id: productId },
        data: { trackingType: "SERIAL" },
      });
    }

    return res.status(201).json({
      success: true,
      message: `Successfully registered ${createdRecords.length} Serial Numbers.`,
      data: createdRecords,
    });
  } catch (error: any) {
    console.error("Error adding serial numbers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add serial numbers",
      error: error.message,
    });
  }
};

// GET /api/serial-numbers/lookup (Lookup S/N for POS scanner)
export const lookupSerialNumber = async (req: Request, res: Response) => {
  try {
    const { sn } = req.query;

    if (!sn || typeof sn !== "string") {
      return res.status(400).json({
        success: false,
        message: "Serial number parameter (sn) is required",
      });
    }

    const record = await prisma.productSerialNumber.findUnique({
      where: { serialNo: sn.trim() },
      include: {
        product: true,
      },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: `Serial Number "${sn}" not found in system.`,
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    console.error("Error looking up serial number:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to lookup serial number",
      error: error.message,
    });
  }
};

// POST /api/serial-numbers/sell (Attach S/N to sale order and mark SOLD)
export const assignSerialNumbersToSale = async (req: Request, res: Response) => {
  try {
    const { serialNumbers = [], saleRef, customerId, customerName } = req.body;

    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No serial numbers provided",
      });
    }

    const now = new Date();

    for (const sn of serialNumbers) {
      const existing = await prisma.productSerialNumber.findUnique({
        where: { serialNo: String(sn).trim() },
      });

      if (existing) {
        // Calculate warranty expiry date
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + (existing.warrantyMonths || 12));

        await prisma.productSerialNumber.update({
          where: { serialNo: String(sn).trim() },
          data: {
            status: "SOLD",
            saleRef: saleRef || null,
            saleDate: now,
            customerId: customerId || null,
            customerName: customerName || null,
            warrantyExpiry: expiry,
          },
        });
      }
    }

    return res.json({
      success: true,
      message: `Assigned ${serialNumbers.length} serial numbers to sale ${saleRef}`,
    });
  } catch (error: any) {
    console.error("Error assigning serial numbers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to assign serial numbers to sale",
      error: error.message,
    });
  }
};
