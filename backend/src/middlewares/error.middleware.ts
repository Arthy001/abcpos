import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Translation Dictionary for Fields (พจนานุกรมชื่อฟิลด์ภาษาไทย/อังกฤษ)
const FIELD_LABELS: Record<string, { th: string; en: string }> = {
  shortName: { th: "ชื่อย่อหน่วยนับ", en: "Unit short name" },
  name: { th: "ชื่อ", en: "Name" },
  barcode: { th: "รหัสบาร์โค้ด", en: "Barcode" },
  sku: { th: "รหัสสินค้า (SKU)", en: "SKU" },
  slug: { th: "Slug URL", en: "Slug URL" },
  taxId: { th: "เลขประจำตัวผู้เสียภาษี", en: "Tax ID" },
  code: { th: "รหัส", en: "Code" },
  orderNumber: { th: "เลขที่คำสั่งซื้อ", en: "Order number" },
  invoiceNo: { th: "เลขที่ใบแจ้งหนี้", en: "Invoice number" },
  invoiceNumber: { th: "เลขที่ใบกำกับภาษี", en: "Tax invoice number" },
  reference: { th: "เลขที่อ้างอิง", en: "Reference number" },
  accountNumber: { th: "เลขที่บัญชีธนาคาร", en: "Bank account number" },
  email: { th: "อีเมล", en: "Email" },
  phone: { th: "เบอร์โทรศัพท์", en: "Phone number" },
  whtNumber: { th: "เลขที่หนังสือรับรองหัก ณ ที่จ่าย", en: "Withholding tax certificate number" },
  bomNumber: { th: "เลขที่สูตรการผลิต (BOM)", en: "BOM number" },
  woNumber: { th: "เลขที่คำสั่งผลิต (Work Order)", en: "Work order number" },
};

function generateIncidentCode(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INC-${dateStr}-${randomStr}`;
}

export async function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const incidentCode = generateIncidentCode();
  const locale = (req.headers["accept-language"]?.includes("en") ? "en" : "th") as "th" | "en";

  let statusCode = 400;
  let errorType = "VALIDATION";
  let targetField: string | null = null;
  let messageTh = "ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  let messageEn = "The submitted data is invalid. Please check and try again.";
  const prismaCode: string | null = err?.code || null;

  // 1. Handle Prisma P2002: Unique Constraint Violation (ข้อมูลซ้ำ)
  if (err?.code === "P2002") {
    errorType = "DUPLICATE";
    statusCode = 400;
    const target = Array.isArray(err.meta?.target)
      ? err.meta.target[0]
      : typeof err.meta?.target === "string"
      ? err.meta.target
      : "field";

    targetField = target;
    const label = FIELD_LABELS[target] || { th: target, en: target };

    messageTh = `ข้อมูล "${label.th}" มีอยู่ในระบบแล้ว กรุณาระบุข้อมูลใหม่`;
    messageEn = `${label.en} already exists in the system. Please choose a different value.`;
  }
  // 2. Handle Prisma P2003: Foreign Key Constraint (ลบไม่ได้เพราะถูกใช้อยู่)
  else if (err?.code === "P2003") {
    errorType = "FOREIGN_KEY";
    statusCode = 400;
    messageTh = "ไม่สามารถลบหรือแก้ไขรายการนี้ได้ เนื่องจากมีข้อมูลอื่นในระบบกำลังใช้งานอยู่";
    messageEn = "Cannot delete or modify this item because it is currently linked to other records.";
  }
  // 3. Handle Prisma P2025: Record Not Found
  else if (err?.code === "P2025") {
    errorType = "NOT_FOUND";
    statusCode = 404;
    messageTh = "ไม่พบข้อมูลรายการที่ระบุ หรือข้อมูลอาจถูกลบไปแล้ว";
    messageEn = "The requested record was not found or has already been deleted.";
  }
  // 4. Custom App Error with message
  else if (err.message && !err.message.includes("prisma") && !err.message.includes("invocation")) {
    statusCode = err.statusCode || 400;
    messageTh = err.message;
    messageEn = err.message;
  }
  // 5. General / Unexpected Internal Crash
  else {
    errorType = "INTERNAL";
    statusCode = 500;
    messageTh = "ระบบขัดข้องชั่วคราว กรุณาแจ้งผู้ดูแลระบบพร้อมระบุรหัสอ้างอิง";
    messageEn = "An internal server error occurred. Please contact support with the reference code.";
  }

  // Asynchronously log incident to Database
  try {
    const payloadStr = req.body ? JSON.stringify(req.body).slice(0, 2000) : null;
    const stackStr = err.stack ? String(err.stack).slice(0, 4000) : null;

    await prisma.systemIncidentLog.create({
      data: {
        incidentCode,
        endpoint: req.originalUrl || req.url,
        method: req.method,
        userIp: req.ip || req.socket.remoteAddress || "127.0.0.1",
        locale,
        statusCode,
        errorType,
        prismaCode,
        targetField,
        messageTh,
        messageEn,
        payload: payloadStr,
        stackTrace: stackStr,
      },
    });
  } catch (logErr) {
    console.error("Failed to save incident log:", logErr);
  }

  // Selected message according to user request locale
  const selectedMessage = locale === "en" ? messageEn : messageTh;

  return res.status(statusCode).json({
    success: false,
    incidentCode,
    error: {
      type: errorType,
      targetField,
      message: selectedMessage,
      messageTh,
      messageEn,
    },
  });
}
