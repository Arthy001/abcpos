import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/incidents
export const getSystemIncidents = async (req: Request, res: Response) => {
  try {
    const { search, errorType, resolved, page = "1", limit = "20" } = req.query;

    const where: any = {};
    if (errorType && errorType !== "all") {
      where.errorType = String(errorType);
    }
    if (resolved !== undefined && resolved !== "all") {
      where.resolved = resolved === "true";
    }
    if (search) {
      where.OR = [
        { incidentCode: { contains: String(search) } },
        { endpoint: { contains: String(search) } },
        { messageTh: { contains: String(search) } },
        { messageEn: { contains: String(search) } },
        { targetField: { contains: String(search) } },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const take = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * take;

    const [total, incidents] = await Promise.all([
      prisma.systemIncidentLog.count({ where }),
      prisma.systemIncidentLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take,
      }),
    ]);

    res.json({
      success: true,
      data: incidents,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch incident logs" });
  }
};

// GET /api/incidents/:code
export const getSystemIncidentByCode = async (req: Request, res: Response) => {
  try {
    const code = String(req.params.code);
    const incident = await prisma.systemIncidentLog.findUnique({
      where: { incidentCode: code },
    });

    if (!incident) {
      return res.status(404).json({ success: false, error: "Incident not found" });
    }

    res.json({ success: true, data: incident });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch incident" });
  }
};

// PATCH /api/incidents/:id/resolve
export const markIncidentResolved = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const incident = await prisma.systemIncidentLog.update({
      where: { id },
      data: { resolved: true },
    });

    res.json({ success: true, data: incident });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to resolve incident" });
  }
};
