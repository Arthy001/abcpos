import { prisma } from "../lib/prisma.js";

export interface LogActivityParams {
  action: "DELETE" | "UPDATE" | "CREATE" | "RESTORE";
  entityType:
    | "CATEGORY"
    | "SUBCATEGORY"
    | "BRAND"
    | "UNIT"
    | "WAREHOUSE"
    | "STORE"
    | "WARRANTY"
    | "VARIANT"
    | "PRODUCT";
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
