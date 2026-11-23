import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCrmData() {
  console.log("🌱 Starting CRM & Field Service Seed Data...");

  // 1. Ensure Default Pipeline & Stages
  let pipeline = await prisma.crmPipeline.findFirst({
    where: { code: "SOLAR_DEFAULT" },
    include: { stages: { orderBy: { order: "asc" } } },
  });

  if (!pipeline) {
    pipeline = await prisma.crmPipeline.create({
      data: {
        name: "งานติดตั้ง Solar Rooftop / Field Service",
        code: "SOLAR_DEFAULT",
        description: "ไปป์ไลน์หลักสำหรับงานสำรวจ ออกแบบ ขออนุญาต และติดตั้ง Solar Cell",
        isDefault: true,
        stages: {
          create: [
            { name: "Lead ใหม่ (New Lead)", color: "#3b82f6", order: 1, isWon: false, isLost: false },
            { name: "นัดสำรวจหน้างาน (Site Survey)", color: "#8b5cf6", order: 2, isWon: false, isLost: false },
            { name: "เสนอราคา (Quotation)", color: "#f59e0b", order: 3, isWon: false, isLost: false },
            { name: "ขออนุญาต & รอติดตั้ง (Permit & Schedule)", color: "#06b6d4", order: 4, isWon: false, isLost: false },
            { name: "ปิดการขายสำเร็จ (Won)", color: "#10b981", order: 5, isWon: true, isLost: false },
            { name: "ยกเลิก / ไม่ผ่าน (Lost)", color: "#ef4444", order: 6, isWon: false, isLost: true },
          ],
        },
      },
      include: { stages: { orderBy: { order: "asc" } } },
    });
  }

  const stages = pipeline.stages;
  const stageNew = stages.find((s) => s.order === 1) || stages[0];
  const stageSurvey = stages.find((s) => s.order === 2) || stages[1];
  const stageQuoted = stages.find((s) => s.order === 3) || stages[2];
  const stagePermit = stages.find((s) => s.order === 4) || stages[3];
  const stageWon = stages.find((s) => s.isWon) || stages[4];

  // 2. Ensure Customers for CRM
  let custSomchai = await prisma.customer.findFirst({ where: { name: "คุณสมชาย เจริญกิจพาณิชย์" } });
  if (!custSomchai) {
    custSomchai = await prisma.customer.create({
      data: {
        code: "CU-SOL-001",
        name: "คุณสมชาย เจริญกิจพาณิชย์",
        phone: "081-888-2345",
        email: "somchai.c@gmail.com",
        address: "88/12 หมู่บ้านนันทวัน ถ.ราชพฤกษ์ ต.บางกร่าง อ.เมือง จ.นนทบุรี 11000",
        status: "ACTIVE",
      },
    });
  }

  let custWichai = await prisma.customer.findFirst({ where: { name: "คุณวิชัย ธนโชควิริยะ (โรงพิมพ์ไทยสยาม)" } });
  if (!custWichai) {
    custWichai = await prisma.customer.create({
      data: {
        code: "CU-SOL-002",
        name: "คุณวิชัย ธนโชควิริยะ (โรงพิมพ์ไทยสยาม)",
        phone: "089-777-1234",
        email: "wichai.thaiprint@gmail.com",
        address: "245 ถนนพระราม 2 ต.มหาชัย อ.เมือง จ.สมุทรสาคร 74000",
        status: "ACTIVE",
      },
    });
  }

  let custAnan = await prisma.customer.findFirst({ where: { name: "คุณอนันต์ ปรีชาเลิศ" } });
  if (!custAnan) {
    custAnan = await prisma.customer.create({
      data: {
        code: "CU-SOL-003",
        name: "คุณอนันต์ ปรีชาเลิศ",
        phone: "086-555-9876",
        email: "anan.preecha@outlook.com",
        address: "54/2 หมู่บ้านมัณฑนา บางนา กม.7 ต.บางแก้ว อ.บางพลี จ.สมุทรปราการ",
        status: "ACTIVE",
      },
    });
  }

  // 3. Seed Sample Deals across Stages
  const sampleDeals = [
    {
      title: "ติดตั้ง Solar Rooftop 5.5 kWp - บ้านคุณอนันต์ (บางนา)",
      dealCode: "DL-202611-1001",
      pipelineId: pipeline.id,
      stageId: stageNew.id,
      customerId: custAnan.id,
      contactName: custAnan.name,
      contactPhone: custAnan.phone || "086-555-9876",
      contactEmail: custAnan.email,
      siteAddress: custAnan.address,
      estimatedValue: 179000,
      probability: 30,
      notes: "ลูกค้าทักมาทาง Facebook สนใจลดค่าไฟแอร์ช่วงกลางวัน",
      customData: JSON.stringify({
        preset: "SOLAR",
        kwpTarget: 5.5,
        avgElectricityBill: 4800,
        roofType: "CPAC",
        meterPhase: "1-Phase (1 เฟส)",
        meterProvider: "MEA (นครหลวง)",
      }),
    },
    {
      title: "ติดตั้ง Solar Rooftop 10 kWp - บ้านคุณพงษ์ศักดิ์ (พุทธมณฑล)",
      dealCode: "DL-202611-1002",
      pipelineId: pipeline.id,
      stageId: stageSurvey.id,
      contactName: "คุณพงษ์ศักดิ์ รัตนวิเชียร",
      contactPhone: "082-456-7890",
      contactEmail: "pongsak.r@gmail.com",
      siteAddress: "12/5 พุทธมณฑล สาย 4 ศาลายา นครปฐม",
      estimatedValue: 289000,
      probability: 50,
      notes: "นัดทีมวิศวกรเข้าสำรวจทิศทางแดดและพื้นที่หลังคาวันศุกร์นี้ 10:00 น.",
      customData: JSON.stringify({
        preset: "SOLAR",
        kwpTarget: 10.0,
        avgElectricityBill: 9200,
        roofType: "MetalSheet",
        meterPhase: "3-Phase (3 เฟส)",
        meterProvider: "PEA (ภูมิภาค)",
      }),
    },
    {
      title: "โครงการ Solar Factory 30 kWp - โรงพิมพ์ไทยสยาม",
      dealCode: "DL-202611-1003",
      pipelineId: pipeline.id,
      stageId: stageQuoted.id,
      customerId: custWichai.id,
      contactName: custWichai.name,
      contactPhone: custWichai.phone || "089-777-1234",
      contactEmail: custWichai.email,
      siteAddress: custWichai.address,
      estimatedValue: 780000,
      probability: 75,
      notes: "ส่งใบเสนอราคาและรายงานคำนวณระยะเวลาคืนทุน (Payback Period 3.8 ปี) ให้ฝ่ายการเงินพิจารณาแล้ว",
      customData: JSON.stringify({
        preset: "SOLAR",
        kwpTarget: 30.0,
        avgElectricityBill: 34000,
        roofType: "MetalSheet",
        meterPhase: "3-Phase (3 เฟส)",
        meterProvider: "PEA (ภูมิภาค)",
      }),
    },
    {
      title: "ติดตั้ง Solar Rooftop 15 kWp - คุณสมชาย (นนทบุรี)",
      dealCode: "DL-202611-1004",
      pipelineId: pipeline.id,
      stageId: stageWon.id,
      customerId: custSomchai.id,
      contactName: custSomchai.name,
      contactPhone: custSomchai.phone || "081-888-2345",
      contactEmail: custSomchai.email,
      siteAddress: custSomchai.address,
      estimatedValue: 395000,
      probability: 100,
      notes: "ลูกค้าเซ็นสัญญาและชำระมัดจำงวดแรก 30% เรียบร้อยแล้ว",
      customData: JSON.stringify({
        preset: "SOLAR",
        kwpTarget: 15.0,
        avgElectricityBill: 16500,
        roofType: "CPAC",
        meterPhase: "3-Phase (3 เฟส)",
        meterProvider: "MEA (นครหลวง)",
      }),
    },
  ];

  for (const d of sampleDeals) {
    const existing = await prisma.crmDeal.findUnique({ where: { dealCode: d.dealCode } });
    if (!existing) {
      await prisma.crmDeal.create({ data: d });
    }
  }

  // 4. Seed Solar Project (From Won Deal)
  const wonDeal = await prisma.crmDeal.findUnique({ where: { dealCode: "DL-202611-1004" } });
  if (wonDeal) {
    let project = await prisma.crmProject.findUnique({ where: { projectCode: "PRJ-2026-001" } });
    if (!project) {
      project = await prisma.crmProject.create({
        data: {
          projectCode: "PRJ-2026-001",
          name: wonDeal.title,
          dealId: wonDeal.id,
          customerId: custSomchai.id,
          status: "IN_PROGRESS",
          projectDetails: wonDeal.customData,
          milestones: {
            create: [
              { title: "ยื่นเอกสารขออนุญาตขนานไฟกับการไฟฟ้านครหลวง (MEA)", order: 1, status: "COMPLETED", completedAt: new Date() },
              { title: "จัดเตรียมอุปกรณ์ Inverter Huawei & แผง Tier 1 ส่งมอบหน้างาน", order: 2, status: "COMPLETED", completedAt: new Date() },
              { title: "ติดตั้งโครงสร้างและวางแผงโซลาร์เซลล์ 15 kWp", order: 3, status: "IN_PROGRESS" },
              { title: "ทดสอบระบบและเชื่อมต่ออินเวอร์เตอร์ (Commissioning)", order: 4, status: "PENDING" },
              { title: "การไฟฟ้าเข้าตรวจสอบระบบและเปลี่ยนมิเตอร์ไฟฟ้า (COD)", order: 5, status: "PENDING" },
              { title: "ส่งมอบงานและเอกสารคู่มือรับประกันแก่ลูกค้า", order: 6, status: "PENDING" },
            ],
          },
        },
      });
    }

    // 5. Seed Field Service & Maintenance Tickets
    const sampleTickets = [
      {
        ticketNo: "TCK-2026-001",
        projectId: project.id,
        customerId: custSomchai.id,
        title: "ล้างแผงโซลาร์เซลล์ประจำรอบ 6 เดือน (หลังคา CPAC 15 kWp)",
        serviceType: "PREVENTIVE_MAINTENANCE",
        priority: "MEDIUM",
        status: "SCHEDULED",
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // อีก 7 วัน
        technician: "ทีมช่างเทคนิค O&M สาย 1 (ช่างเอก & ช่างก้อง)",
      },
      {
        ticketNo: "TCK-2026-002",
        projectId: project.id,
        customerId: custSomchai.id,
        title: "ตรวจเช็คค่าความต้านทานฉนวนและประสิทธิภาพอินเวอร์เตอร์รายปี",
        serviceType: "PREVENTIVE_MAINTENANCE",
        priority: "LOW",
        status: "OPEN",
        scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // อีก 30 วัน
        technician: "วิศวกรผู้เชี่ยวชาญระบบไฟฟ้า",
      },
      {
        ticketNo: "TCK-2026-003",
        customerId: custWichai.id,
        title: "ตรวจสอบสัญญาณแจ้งเตือน Inverter Alarm - โรงพิมพ์ไทยสยาม",
        serviceType: "EMERGENCY_REPAIR",
        priority: "HIGH",
        status: "RESOLVED",
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 วันที่แล้ว
        technician: "ช่างสมหมาย (ทีมบริการด่วน)",
      },
    ];

    for (const t of sampleTickets) {
      const existingTicket = await prisma.crmServiceTicket.findUnique({ where: { ticketNo: t.ticketNo } });
      if (!existingTicket) {
        await prisma.crmServiceTicket.create({
          data: {
            ticketNo: t.ticketNo,
            projectId: t.projectId || undefined,
            customerId: t.customerId,
            title: t.title,
            serviceType: t.serviceType,
            priority: t.priority,
            status: t.status,
            scheduledDate: t.scheduledDate,
            technician: t.technician,
          },
        });
      }
    }
  }

  console.log("✅ Successfully seeded CRM Deals, Projects, Milestones & Service Tickets!");
}

// Execute if run directly
if (process.argv[1]?.includes("seed-crm")) {
  seedCrmData()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
