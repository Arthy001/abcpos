import { prisma } from "../lib/prisma.js";

export interface LogActivityParams {
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "LOGIN" | "LOGOUT" | "LOGIN_FAILED";
  entityType:
    | "CATEGORY"
    | "SUBCATEGORY"
    | "BRAND"
    | "UNIT"
    | "WAREHOUSE"
    | "STORE"
    | "WARRANTY"
    | "VARIANT"
    | "PRODUCT"
    | "CUSTOMER"
    | "SUPPLIER"
    | "PURCHASE"
    | "SALE"
    | "EXPENSE"
    | "INCOME"
    | "AUTH_SESSION"
    | "USER";
  entityId: string;
  entityName: string;
  user?: string;
  data: any;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const dataString =
      typeof params.data === "string"
        ? params.data
        : JSON.stringify(params.data);

    return await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        user: params.user || "Admin",
        data: dataString,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    return null;
  }
}
