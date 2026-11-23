import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// Helper: Seed default pipeline if none exists
const ensureDefaultPipeline = async () => {
  const count = await prisma.crmPipeline.count();
  if (count === 0) {
    const pipeline = await prisma.crmPipeline.create({
      data: {
        name: "งานติดตั้ง Solar Rooftop / Field Service",
        code: "SOLAR_DEFAULT",
        description: "ไปป์ไลน์เริ่มต้นสำหรับงานติดตั้งและสำรวจหน้างาน Solar / EV Charger",
        isDefault: true,
        stages: {
          create: [
            { name: "Lead ใหม่ (New Lead)", color: "#3b82f6", order: 1, isWon: false, isLost: false },
            { name: "นัดสำรวจหน้างาน (Site Survey)", color: "#8b5cf6", order: 2, isWon: false, isLost: false },
            { name: "เสนอราคา (Quotation / Proposal)", color: "#f59e0b", order: 3, isWon: false, isLost: false },
            { name: "ขออนุญาต & รอติดตั้ง (Permit & Schedule)", color: "#06b6d4", order: 4, isWon: false, isLost: false },
            { name: "ปิดการขายสำเร็จ (Won)", color: "#10b981", order: 5, isWon: true, isLost: false },
            { name: "ยกเลิก / ไม่ผ่าน (Lost)", color: "#ef4444", order: 6, isWon: false, isLost: true },
          ],
        },
      },
      include: { stages: { orderBy: { order: "asc" } } },
    });
    return pipeline;
  }
  return null;
};

// ----------------------------------------------------------------------
// Pipelines & Stages
// ----------------------------------------------------------------------

export const getPipelines = async (req: Request, res: Response) => {
  try {
    await ensureDefaultPipeline();
    const pipelines = await prisma.crmPipeline.findMany({
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: pipelines });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch pipelines" });
  }
};

export const createPipeline = async (req: Request, res: Response) => {
  try {
    const { name, code, description, isDefault, stages } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Name and Code are required" });
    }

    if (isDefault) {
      await prisma.crmPipeline.updateMany({ data: { isDefault: false } });
    }

    const newPipeline = await prisma.crmPipeline.create({
      data: {
        name,
        code: String(code).toUpperCase().trim(),
        description,
        isDefault: Boolean(isDefault),
        stages: stages && Array.isArray(stages) ? {
          create: stages.map((stg: any, index: number) => ({
            name: stg.name,
            color: stg.color || "#3b82f6",
            order: stg.order ?? index + 1,
            isWon: Boolean(stg.isWon),
            isLost: Boolean(stg.isLost),
          })),
        } : undefined,
      },
      include: { stages: { orderBy: { order: "asc" } } },
    });

    res.status(201).json({ success: true, data: newPipeline });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create pipeline" });
  }
};

// ----------------------------------------------------------------------
// Deals (Opportunities / Leads)
// ----------------------------------------------------------------------

export const getDeals = async (req: Request, res: Response) => {
  try {
    await ensureDefaultPipeline();
    const { pipelineId, stageId, search, customerId } = req.query;

    const where: any = {};
    if (pipelineId) where.pipelineId = String(pipelineId);
    if (stageId) where.stageId = String(stageId);
    if (customerId) where.customerId = String(customerId);

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { dealCode: { contains: String(search) } },
        { contactName: { contains: String(search) } },
        { contactPhone: { contains: String(search) } },
      ];
    }

    const deals = await prisma.crmDeal.findMany({
      where,
      include: {
        stage: true,
        pipeline: true,
        customer: true,
        project: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: deals });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch deals" });
  }
};

export const getDealById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const deal = await prisma.crmDeal.findUnique({
      where: { id },
      include: {
        stage: true,
        pipeline: true,
        customer: true,
        project: {
          include: {
            milestones: { orderBy: { order: "asc" } },
            serviceTickets: true,
          },
        },
      },
    });

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    res.json({ success: true, data: deal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch deal" });
  }
};

export const createDeal = async (req: Request, res: Response) => {
  try {
    const {
      title,
      pipelineId,
      stageId,
      customerId,
      contactName,
      contactPhone,
      contactEmail,
      siteAddress,
      gpsLocation,
      estimatedValue,
      probability,
      expectedClose,
      customData,
      notes,
      assignedTo,
    } = req.body;

    if (!title || !contactName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: "Title, Contact Name, and Phone are required",
      });
    }

    // Determine target pipeline & stage
    let finalPipelineId = pipelineId;
    let finalStageId = stageId;

    if (!finalPipelineId || !finalStageId) {
      const defaultPipeline = await prisma.crmPipeline.findFirst({
        where: { isDefault: true },
        include: { stages: { orderBy: { order: "asc" } } },
      }) || await prisma.crmPipeline.findFirst({
        include: { stages: { orderBy: { order: "asc" } } },
      });

      if (defaultPipeline && defaultPipeline.stages.length > 0) {
        finalPipelineId = defaultPipeline.id;
        finalStageId = defaultPipeline.stages[0].id;
      }
    }

    // Generate deal code
    const datePrefix = new Date().toISOString().slice(0, 7).replace("-", ""); // YYYYMM
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dealCode = `DL-${datePrefix}-${randomSuffix}`;

    const newDeal = await prisma.crmDeal.create({
      data: {
        title,
        dealCode,
        pipelineId: finalPipelineId,
        stageId: finalStageId,
        customerId: customerId || undefined,
        contactName,
        contactPhone,
        contactEmail: contactEmail || undefined,
        siteAddress: siteAddress || undefined,
        gpsLocation: gpsLocation || undefined,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : 0,
        probability: probability ? parseInt(probability) : 50,
        expectedClose: expectedClose ? new Date(expectedClose) : undefined,
        customData: typeof customData === "object" ? JSON.stringify(customData) : customData,
        notes: notes || undefined,
        assignedTo: assignedTo || undefined,
      },
      include: {
        stage: true,
        pipeline: true,
        customer: true,
      },
    });

    res.status(201).json({ success: true, data: newDeal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create deal" });
  }
};

export const updateDeal = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = { ...req.body };

    if (data.customData && typeof data.customData === "object") {
      data.customData = JSON.stringify(data.customData);
    }
    if (data.estimatedValue !== undefined) {
      data.estimatedValue = parseFloat(data.estimatedValue);
    }
    if (data.probability !== undefined) {
      data.probability = parseInt(data.probability);
    }
    if (data.expectedClose) {
      data.expectedClose = new Date(data.expectedClose);
    }

    const updatedDeal = await prisma.crmDeal.update({
      where: { id },
      data,
      include: {
        stage: true,
        pipeline: true,
        customer: true,
      },
    });

    res.json({ success: true, data: updatedDeal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update deal" });
  }
};

export const updateDealStage = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { stageId } = req.body;

    if (!stageId) {
      return res.status(400).json({ success: false, message: "stageId is required" });
    }

    const updatedDeal = await prisma.crmDeal.update({
      where: { id },
      data: { stageId },
      include: { stage: true },
    });

    res.json({ success: true, data: updatedDeal });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to move deal stage" });
  }
};

export const deleteDeal = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.crmDeal.delete({ where: { id } });
    res.json({ success: true, message: "Deal deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to delete deal" });
  }
};

// ----------------------------------------------------------------------
// Convert Deal -> Project & Customer
// ----------------------------------------------------------------------

export const convertDealToProject = async (req: Request, res: Response) => {
  try {
    const dealId = String(req.params.id);
    const deal = await prisma.crmDeal.findUnique({
      where: { id: dealId },
      include: { customer: true, project: true },
    });

    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    if (deal.project) {
      return res.status(400).json({
        success: false,
        message: "This deal has already been converted to a project",
        data: deal.project,
      });
    }

    // 1. Ensure or create Customer
    let customerId = deal.customerId;
    if (!customerId) {
      const codeSuffix = Math.floor(1000 + Math.random() * 9000);
      const newCustomer = await prisma.customer.create({
        data: {
          code: `CU-${codeSuffix}`,
          name: deal.contactName,
          phone: deal.contactPhone,
          email: deal.contactEmail,
          address: deal.siteAddress,
          status: "ACTIVE",
        },
      });
      customerId = newCustomer.id;

      // Update deal with customerId
      await prisma.crmDeal.update({
        where: { id: dealId },
        data: { customerId },
      });
    }

    // 2. Create Project
    const yearPrefix = new Date().getFullYear();
    const projSuffix = Math.floor(1000 + Math.random() * 9000);
    const projectCode = `PRJ-${yearPrefix}-${projSuffix}`;

    const project = await prisma.crmProject.create({
      data: {
        projectCode,
        name: deal.title,
        dealId: deal.id,
        customerId: customerId!,
        status: "IN_PROGRESS",
        projectDetails: deal.customData,
        milestones: {
          create: [
            { title: "ยื่นเอกสารขออนุญาตขนานไฟ (MEA / PEA)", order: 1, status: "PENDING" },
            { title: "จัดเตรียมอุปกรณ์และส่งมอบหน้างาน", order: 2, status: "PENDING" },
            { title: "ติดตั้งโครงสร้างและแผง/อุปกรณ์", order: 3, status: "PENDING" },
            { title: "ทดสอบระบบและเชื่อมต่ออินเวอร์เตอร์ (Commissioning)", order: 4, status: "PENDING" },
            { title: "การไฟฟ้าตรวจสอบและเปลี่ยนมิเตอร์ (COD)", order: 5, status: "PENDING" },
            { title: "ส่งมอบงานและเอกสารรับประกันแก่ลูกค้า", order: 6, status: "PENDING" },
          ],
        },
      },
      include: {
        milestones: { orderBy: { order: "asc" } },
        customer: true,
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to convert deal to project" });
  }
};

// ----------------------------------------------------------------------
// Projects & Milestones
// ----------------------------------------------------------------------

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { status, search, customerId } = req.query;
    const where: any = {};

    if (status && status !== "all") where.status = String(status);
    if (customerId) where.customerId = String(customerId);

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { projectCode: { contains: String(search) } },
        { customer: { name: { contains: String(search) } } },
      ];
    }

    const projects = await prisma.crmProject.findMany({
      where,
      include: {
        customer: true,
        deal: true,
        milestones: { orderBy: { order: "asc" } },
        serviceTickets: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch projects" });
  }
};

export const updateMilestone = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.milestoneId);
    const { status, completedAt, dueDate, title } = req.body;

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === "COMPLETED" && !completedAt) {
        data.completedAt = new Date();
      }
    }
    if (title) data.title = title;
    if (dueDate) data.dueDate = new Date(dueDate);

    const updated = await prisma.crmMilestone.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update milestone" });
  }
};

// ----------------------------------------------------------------------
// Field Service & Maintenance Tickets
// ----------------------------------------------------------------------

export const getServiceTickets = async (req: Request, res: Response) => {
  try {
    const { status, serviceType, priority, projectId, customerId } = req.query;
    const where: any = {};

    if (status && status !== "all") where.status = String(status);
    if (serviceType && serviceType !== "all") where.serviceType = String(serviceType);
    if (priority && priority !== "all") where.priority = String(priority);
    if (projectId) where.projectId = String(projectId);
    if (customerId) where.customerId = String(customerId);

    const tickets = await prisma.crmServiceTicket.findMany({
      where,
      include: {
        customer: true,
        project: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to fetch service tickets" });
  }
};

export const createServiceTicket = async (req: Request, res: Response) => {
  try {
    const {
      customerId,
      projectId,
      title,
      serviceType,
      priority,
      scheduledDate,
      technician,
      checklistData,
    } = req.body;

    if (!customerId || !title) {
      return res.status(400).json({ success: false, message: "Customer and Title are required" });
    }

    const yearPrefix = new Date().getFullYear();
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNo = `TCK-${yearPrefix}-${suffix}`;

    const ticket = await prisma.crmServiceTicket.create({
      data: {
        ticketNo,
        customerId,
        projectId: projectId || undefined,
        title,
        serviceType: serviceType || "GENERAL",
        priority: priority || "MEDIUM",
        status: "SCHEDULED",
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        technician: technician || undefined,
        checklistData: typeof checklistData === "object" ? JSON.stringify(checklistData) : checklistData,
      },
      include: {
        customer: true,
        project: true,
      },
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to create service ticket" });
  }
};

export const updateServiceTicket = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const data = { ...req.body };

    if (data.scheduledDate) data.scheduledDate = new Date(data.scheduledDate);
    if (data.checklistData && typeof data.checklistData === "object") {
      data.checklistData = JSON.stringify(data.checklistData);
    }

    const updated = await prisma.crmServiceTicket.update({
      where: { id },
      data,
      include: {
        customer: true,
        project: true,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Failed to update service ticket" });
  }
};
