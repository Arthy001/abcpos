import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HRM data (Employees, Attendance, Leaves, Holidays, Payroll)...");

  // 1. Ensure Leave Types
  console.log("Creating Leave Types...");
  const leaveTypesData = [
    { name: "Sick Leave (ลาป่วย)", quota: 30, status: "ACTIVE" },
    { name: "Casual / Personal Leave (ลากิจ)", quota: 7, status: "ACTIVE" },
    { name: "Annual Vacation Leave (ลาพักร้อน)", quota: 10, status: "ACTIVE" },
    { name: "Maternity Leave (ลาคลอด)", quota: 98, status: "ACTIVE" },
    { name: "Military Leave (ลารับราชการทหาร)", quota: 60, status: "ACTIVE" },
  ];

  for (const lt of leaveTypesData) {
    const existing = await prisma.leaveType.findFirst({ where: { name: lt.name } });
    if (!existing) {
      await prisma.leaveType.create({ data: lt });
    }
  }

  // 2. Ensure Holidays (Thai Public Holidays 2026)
  console.log("Creating Holidays...");
  const holidaysData = [
    { name: "วันขึ้นปีใหม่ (New Year's Day)", date: "01 Jan 2026", description: "วันหยุดต้อนรับปีใหม่ 2569", status: "ACTIVE" },
    { name: "วันมาฆบูชา (Makha Bucha Day)", date: "03 Mar 2026", description: "วันสำคัญทางพุทธศาสนา", status: "ACTIVE" },
    { name: "วันจักรี (Chakri Memorial Day)", date: "06 Apr 2026", description: "วันพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช", status: "ACTIVE" },
    { name: "วันสงกรานต์ (Songkran Festival)", date: "13 Apr 2026", description: "วันสงกรานต์ วันปีใหม่ไทย", status: "ACTIVE" },
    { name: "วันสงกรานต์ (Songkran Festival)", date: "14 Apr 2026", description: "วันครอบครัว", status: "ACTIVE" },
    { name: "วันสงกรานต์ (Songkran Festival)", date: "15 Apr 2026", description: "วันผู้สูงอายุแห่งชาติ", status: "ACTIVE" },
    { name: "วันแรงงานแห่งชาติ (National Labour Day)", date: "01 May 2026", description: "วันหยุดผู้ใช้แรงงาน", status: "ACTIVE" },
    { name: "วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว", date: "28 Jul 2026", description: "วันเฉลิมพระชนมพรรษา ร.10", status: "ACTIVE" },
    { name: "วันแม่แห่งชาติ (Mother's Day)", date: "12 Aug 2026", description: "วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสิริกิติ์ฯ", status: "ACTIVE" },
    { name: "วันพ่อแห่งชาติ (Father's Day)", date: "05 Dec 2026", description: "วันคล้ายวันพระบรมราชสมภพ ร.9", status: "ACTIVE" },
  ];

  for (const h of holidaysData) {
    const existing = await prisma.holiday.findFirst({ where: { name: h.name, date: h.date } });
    if (!existing) {
      await prisma.holiday.create({ data: h });
    }
  }

  // 3. Add more employees to make realistic organization (8 total employees)
  console.log("Expanding Employees...");
  const additionalEmployees = [
    {
      empId: "EMP-005",
      name: "ประเสริฐ ตรวจสอบ",
      avatar: "/assets/images/customer01.jpg",
      role: "เจ้าหน้าที่ตรวจคุณภาพ (QC Inspector)",
      department: "ฝ่ายควบคุมคุณภาพ (QA/QC)",
      email: "prasert.t@siampolypack.com",
      phone: "+66 82 111 2233",
      joinedDate: "15 Jul 2024",
      status: "ACTIVE",
    },
    {
      empId: "EMP-006",
      name: "นิตยา ช่างตัด",
      avatar: "/assets/images/customer02.jpg",
      role: "ช่างคุมเครื่องตัดพลาสติก (Sealing Operator)",
      department: "ฝ่ายผลิตและเครื่องจักร (Production & Extrusion)",
      email: "nittaya.s@siampolypack.com",
      phone: "+66 83 444 5566",
      joinedDate: "01 Sep 2024",
      status: "ACTIVE",
    },
    {
      empId: "EMP-007",
      name: "ศิริพร การเงิน",
      avatar: "/assets/images/customer03.jpg",
      role: "เจ้าหน้าที่บัญชีและการเงิน (Accountant)",
      department: "ฝ่ายบัญชีและการเงิน (Accounting & Finance)",
      email: "siriporn.k@siampolypack.com",
      phone: "+66 85 777 8899",
      joinedDate: "10 Oct 2024",
      status: "ACTIVE",
    },
    {
      empId: "EMP-008",
      name: "อนันต์ ขับรถ",
      avatar: "/assets/images/customer04.jpg",
      role: "พนักงานขับรถส่งสินค้า (Delivery Driver)",
      department: "ฝ่ายคลังสินค้าและจัดส่ง (Warehouse & Logistics)",
      email: "anan.k@siampolypack.com",
      phone: "+66 87 999 0011",
      joinedDate: "01 Dec 2024",
      status: "ACTIVE",
    },
  ];

  for (const emp of additionalEmployees) {
    const existing = await prisma.employee.findUnique({ where: { empId: emp.empId } });
    if (!existing) {
      await prisma.employee.create({ data: emp });
    }
  }

  const allEmployees = await prisma.employee.findMany();

  // 4. Seed Attendance Records for all employees across the past 7 work days
  console.log("Seeding Attendance Records...");
  await prisma.attendance.deleteMany(); // Clear to build fresh structured record history

  const sampleDates = [
    "24 Oct 2026",
    "25 Oct 2026",
    "26 Oct 2026",
    "27 Oct 2026",
    "28 Oct 2026",
    "29 Oct 2026",
    "30 Oct 2026",
  ];

  for (const emp of allEmployees) {
    for (let i = 0; i < sampleDates.length; i++) {
      const dateStr = sampleDates[i];
      let status = "PRESENT";
      let clockIn = "08:00 AM";
      let clockOut = "05:00 PM";
      let totalHours = "09:00 hrs";
      let overtime = "00:00 hrs";
      let progress = 100;

      // Add realistic variations
      if (emp.empId === "EMP-002" && i === 2) {
        status = "LATE";
        clockIn = "08:42 AM";
        clockOut = "05:00 PM";
        totalHours = "08:18 hrs";
        progress = 90;
      } else if (emp.empId === "EMP-003" && i === 4) {
        status = "HALF_DAY";
        clockIn = "08:00 AM";
        clockOut = "12:00 PM";
        totalHours = "04:00 hrs";
        progress = 50;
      } else if (emp.empId === "EMP-006" && i === 5) {
        status = "ABSENT";
        clockIn = "-";
        clockOut = "-";
        totalHours = "00:00 hrs";
        progress = 0;
      } else if (emp.empId === "EMP-001" || emp.empId === "EMP-004") {
        // High overtime workers
        if (i % 2 === 0) {
          overtime = "02:00 hrs";
          clockOut = "07:00 PM";
          totalHours = "11:00 hrs";
        }
      }

      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          employeeName: emp.name,
          employeeRole: emp.role,
          employeeAvatar: emp.avatar,
          date: dateStr,
          status,
          clockIn,
          clockOut,
          production: "95%",
          breakTime: "01:00 hr",
          overtime,
          totalHours,
          progress,
        },
      });
    }
  }

  // 5. Seed Leaves
  console.log("Seeding Leaves Requests...");
  await prisma.leave.deleteMany();

  const leavesData = [
    {
      empCode: "EMP-002",
      employeeName: "วิชัย เป่าฟิล์ม",
      employeeRole: "หัวหน้าช่างเป่าฟิล์ม (Lead Extruder)",
      employeeAvatar: "/assets/images/customer01.jpg",
      leaveType: "Sick Leave (ลาป่วย)",
      fromDate: "26 Oct 2026",
      toDate: "26 Oct 2026",
      duration: "01 Day",
      appliedOn: "25 Oct 2026",
      shift: "เช้า (Morning Shift)",
      reason: "ไข้หวัด พบแพทย์ที่คลินิก มีใบรับรองแพทย์",
      status: "APPROVED",
    },
    {
      empCode: "EMP-003",
      employeeName: "กานดา การค้า",
      employeeRole: "เจ้าหน้าที่ขายโครงการ B2B (Key Account Sales)",
      employeeAvatar: "/assets/images/customer02.jpg",
      leaveType: "Casual / Personal Leave (ลากิจ)",
      fromDate: "28 Oct 2026",
      toDate: "28 Oct 2026",
      duration: "04 hrs (ครึ่งวันบ่าย)",
      appliedOn: "27 Oct 2026",
      shift: "เช้า (Morning Shift)",
      reason: "ต่ออายุใบอนุญาตขับขี่ที่สำนักงานขนส่ง",
      status: "APPROVED",
    },
    {
      empCode: "EMP-006",
      employeeName: "นิตยา ช่างตัด",
      employeeRole: "ช่างคุมเครื่องตัดพลาสติก (Sealing Operator)",
      employeeAvatar: "/assets/images/customer02.jpg",
      leaveType: "Sick Leave (ลาป่วย)",
      fromDate: "29 Oct 2026",
      toDate: "30 Oct 2026",
      duration: "02 Days",
      appliedOn: "29 Oct 2026",
      shift: "เช้า (Morning Shift)",
      reason: "ปวดท้องเฉียบพลันพักฟื้น",
      status: "APPROVED",
    },
    {
      empCode: "EMP-005",
      employeeName: "ประเสริฐ ตรวจสอบ",
      employeeRole: "เจ้าหน้าที่ตรวจคุณภาพ (QC Inspector)",
      employeeAvatar: "/assets/images/customer01.jpg",
      leaveType: "Annual Vacation Leave (ลาพักร้อน)",
      fromDate: "10 Nov 2026",
      toDate: "12 Nov 2026",
      duration: "03 Days",
      appliedOn: "30 Oct 2026",
      shift: "เช้า (Morning Shift)",
      reason: "ท่องเที่ยวพักผ่อนประจำปีกับครอบครัว",
      status: "APPLIED",
    },
  ];

  for (const l of leavesData) {
    await prisma.leave.create({ data: l });
  }

  // 6. Seed Payroll (Salary Records) for all employees for October 2026
  console.log("Seeding Payroll & Payslips...");
  await prisma.payroll.deleteMany();

  const salaryProfiles: Record<string, { base: number; hra: number; conveyance: number; bonus: number; role: string }> = {
    "EMP-001": { base: 65000, hra: 5000, conveyance: 3000, bonus: 10000, role: "ผู้จัดการโรงงาน (Plant Manager)" },
    "EMP-002": { base: 35000, hra: 3000, conveyance: 2000, bonus: 3000, role: "หัวหน้าช่างเป่าฟิล์ม (Lead Extruder)" },
    "EMP-003": { base: 32000, hra: 2500, conveyance: 4000, bonus: 8000, role: "เจ้าหน้าที่ขายโครงการ B2B (Key Account Sales)" },
    "EMP-004": { base: 30000, hra: 2000, conveyance: 2000, bonus: 2000, role: "หัวหน้าคลังสินค้า (Warehouse Supervisor)" },
    "EMP-005": { base: 26000, hra: 2000, conveyance: 1500, bonus: 1500, role: "เจ้าหน้าที่ตรวจคุณภาพ (QC Inspector)" },
    "EMP-006": { base: 22000, hra: 1500, conveyance: 1500, bonus: 1000, role: "ช่างคุมเครื่องตัดพลาสติก (Sealing Operator)" },
    "EMP-007": { base: 28000, hra: 2000, conveyance: 2000, bonus: 2000, role: "เจ้าหน้าที่บัญชีและการเงิน (Accountant)" },
    "EMP-008": { base: 20000, hra: 1500, conveyance: 3000, bonus: 2500, role: "พนักงานขับรถส่งสินค้า (Delivery Driver)" },
  };

  for (const emp of allEmployees) {
    const profile = salaryProfiles[emp.empId || ""] || {
      base: 25000,
      hra: 2000,
      conveyance: 1500,
      bonus: 1000,
      role: emp.role || "Staff",
    };

    const grossEarnings = profile.base + profile.hra + profile.conveyance + profile.bonus;
    const socialSecurity = Math.min(750, profile.base * 0.05); // Max 750 THB
    const providentFund = profile.base * 0.03; // 3%
    const withholdingTax = profile.base > 30000 ? (profile.base - 30000) * 0.05 : 0;
    const totalDeductions = socialSecurity + providentFund + withholdingTax;
    const netSalary = grossEarnings - totalDeductions;

    await prisma.payroll.create({
      data: {
        empCode: emp.empId || "EMP-000",
        employeeName: emp.name,
        employeeRole: profile.role,
        employeeAvatar: emp.avatar,
        email: emp.email || "staff@siampolypack.com",
        salary: netSalary,
        basicSalary: profile.base,
        hra: profile.hra,
        conveyance: profile.conveyance,
        medical: 1000,
        bonus: profile.bonus,
        pf: providentFund,
        professionalTax: socialSecurity,
        tds: withholdingTax,
        loans: 0,
        payPeriod: "Oct 2026",
        location: "Bangkok Head Office & Samut Sakhon Plant",
        status: "PAID",
      },
    });
  }

  console.log("✅ HRM Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ HRM Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
