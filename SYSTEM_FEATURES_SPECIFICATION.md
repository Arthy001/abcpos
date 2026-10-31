# 📑 ABCPOS - System Architecture & Comprehensive Feature Specification

เอกสารสรุปภาพรวมโครงสร้างทางสถาปัตยกรรม (System Architecture), เทคโนโลยีที่ใช้ (Tech Stack), โครงสร้างฐานข้อมูล (Database Schema & Models), รายการฟีเจอร์และหน้าจอการทำงานทั้งหมด (Feature & Module Specifications) ของระบบ **ABCPOS** เพื่อใช้เป็นข้อมูลอ้างอิงในการตรวจสอบช่องว่าง (Gap Analysis) และวางแผนพัฒนาส่วนเพิ่มเติม

---

## 1. 🏗️ Tech Stack & ภาพรวมสถาปัตยกรรม (Architecture Overview)

### 1.1 Architecture Pattern
- **สถาปัตยกรรม**: Decoupled Monorepo (Client-Server Architecture)
- **Frontend**: Next.js App Router (React, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Zustand)
- **Backend API**: Node.js, Express, TypeScript, RESTful API Design
- **ORM & Database**: Prisma ORM v6 เชื่อมต่อกับ SQLite (Production-ready สำหรับ migration สู่ PostgreSQL/MySQL)
- **State Management**: Zustand สำหรับ POS Client State / App Global State
- **Authentication & Security**: JWT Authentication, Role-based Access Control (RBAC), Session Logging, Audit Trails

### 1.2 ไดเรกทอรีหลักของโปรเจกต์
```
abcpos/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # แหล่งรวม Data Models ทั้งหมด (~100 models, 1930+ lines)
│   │   └── dev.db              # SQLite Database
│   ├── src/
│   │   ├── controllers/        # Controllers จัดการ Business Logic (~38 controllers)
│   │   ├── middlewares/        # Auth, Validation, Error Handling, Incident Logging
│   │   ├── routes/             # REST API Endpoints (api.routes.ts, audit.route.ts)
│   │   ├── services/           # Helper Services
│   │   └── server.ts           # Entry point ของ Express Server
├── frontend/
│   ├── public/                 # Static Assets, Images, Icons
│   ├── src/
│   │   ├── app/                # Next.js App Router (50+ Route Pages)
│   │   ├── components/         # Reusable UI (Sidebar, Navbar, FeedbackModals, SearchableSelect, etc.)
│   │   ├── lib/                # API Client, Utilities, Print Helpers
│   │   ├── store/              # Zustand Store (Cart, POS Shift, Settings)
│   │   └── types/              # TypeScript Data Contracts & Interfaces
└── docs/ & root docs/          # คู่มือ, Checklist, Sample Data, Error Handling Guide
```

---

## 2. 🗄️ โครงสร้างฐานข้อมูล (Database Models Breakdown)

ระบบถูกออกแบบรองรับระบบค้าปลีก-ส่ง, การผลิต, บัญชีการเงิน และ HR รวมทั้งสิ้นกว่า **90+ Prisma Models** แบ่งกลุ่มได้ดังนี้:

### 2.1 Master Data Core
- `Product`, `ProductVariant`, `ProductExpiryBatch`: สินค้า, ตัวเลือกสินค้า (Variants เช่น สี/ไซส์), ล็อตวันหมดอายุ
- `Category`, `SubCategory`: หมวดหมู่และหมวดหมู่ย่อยสินค้า
- `Brand`, `Unit`, `Warranty`, `VariantAttribute`: แบรนด์, หน่วยนับ, การรับประกันสินค้า, คุณลักษณะสินค้า
- `Warehouse`, `Store`: คลังสินค้า, สาขา/หน้าร้าน
- `Supplier`, `Biller`: ซัพพลายเออร์, ผู้เปิดบิล/ผู้ออกใบเสร็จ

### 2.2 POS, Sales & Distribution
- `PosShift`, `PosShiftMovement`: ระบบกะแคชเชียร์, บันทึกเงินเปิด-ปิดกะ, เงินเข้า-ออกลิ้นชัก (Cash In/Out)
- `Sale`, `SaleItem`, `Invoice`, `SalesReturn`: การขายหน้าร้าน/ออนไลน์, รายการสินค้าขาย, ใบแจ้งหนี้, ใบลดหนี้/รับคืน
- `Quotation`: ใบเสนอราคา
- `Coupon`, `DiscountPlan`, `Discount`, `GiftCard`: คูปองส่วนลด, แผนโปรโมชั่น, บัตรของขวัญ

### 2.3 Purchases & Stock Control
- `Purchase`, `PurchaseItem`, `PurchaseReturn`: ใบสั่งซื้อสินค้าเข้า, รายการสินค้าสั่งซื้อ, ส่งคืนสินค้า
- `ProductStock`: ยอดสต็อกแยกตามสินค้าและคลังสินค้า (Multi-warehouse Stock)
- `StockMovement`: บัญชีคุมคลัง (Stock Card / Audit Ledger สำหรับ In/Out/Transfer/Adjustment)
- `StockTransfer`: การโอนย้ายสต็อกระหว่างคลังหรือสาขา
- `StockAdjustment`: การปรับปรุงยอดสต็อก (ชำรุด, สูญหาย, นับสต็อกประจำงวด)

### 2.4 B2B Enterprise & Thai Tax Accounting
- `SalesOrder`, `SalesOrderItem`: ใบสั่งขาย B2B (SO)
- `BillingNote`, `BillingNoteItem`: ใบวางบิล / ใบแจ้งยอดตามรอบเครดิต B2B
- `WithholdingTax`: ใบหักภาษี ณ ที่จ่าย (ภ.ง.ด. 3, ภ.ง.ด. 53 ตามมาตรฐานกรมสรรพากรไทย)
- `TaxInvoice`: ใบกำกับภาษีเต็มรูป / เอกสารภาษีขาย

### 2.5 Manufacturing & Production (MRP)
- `BillOfMaterial` (BOM), `BomItem`: โครงสร้างสูตรการผลิต / วัตถุดิบต้นทุน
- `WorkOrder`, `WorkOrderMaterial`: คำสั่งผลิตสินค้า, การเบิกใช้วัตถุดิบจริงในกระบวนการผลิต
- `MaterialRequisition`, `MaterialRequisitionItem`: ใบเบิกจ่ายวัตถุดิบเข้าไลน์ผลิต
- `ProductionScrap`: รายงานของเสีย/เศษซากจากการผลิต

### 2.6 Finance & Accounting
- `ExpenseCategory`, `Expense`: หมวดหมู่ค่าใช้จ่าย และบันทึกค่าใช้จ่าย
- `IncomeCategory`, `Income`: หมวดหมู่รายรับ และบันทึกรายรับอื่นๆ
- `BankAccount`, `MoneyTransfer`: บัญชีธนาคารบริษัท, การโอนย้ายเงินระหว่างบัญชี

### 2.7 HRM & Payroll
- `Department`, `Designation`, `Employee`: แผนก, ตำแหน่งงาน, ข้อมูลพนักงาน
- `Shift`, `Attendance`: กะการทำงานพนักงาน, บันทึกเวลาเข้า-ออกงาน
- `LeaveType`, `Leave`, `Holiday`: ประเภทการลา, การขออนุมัติลา, ปฏิทินวันหยุด
- `Payroll`: สลิปเงินเดือน, รายการหัก/เงินได้สุทธิ

### 2.8 System Security & Governance
- `SystemUser`, `Role`, `UserWarehouse`: ผู้ใช้งาน, บทบาทและสิทธิ์, กำหนดสิทธิ์การเข้าถึงรายคลัง
- `AuditLog`: ประวัติการทำงานและการตรวจสอบย้อนหลังของผู้ใช้
- `SystemIncidentLog`: บันทึกข้อผิดพลาดและ incident ของระบบอัตโนมัติ
- `AppNotification`, `UserNotificationRead`: ระบบแจ้งเตือนในระบบ (In-app notification)
- `DeleteAccountRequest`: รองรับคำขอลบบัญชีผู้ใช้ตามข้อกำหนด PDPA / GDPR

### 2.9 System Settings & Localizations (25+ Modules)
- `CompanySettings`, `LocalizationSettings`, `SystemLanguage`, `AppearanceSettings`, `PosSettings`, `PosPrinter`, `PrefixSettings`, `TaxRate`, `PaymentGateway`, `InvoiceSettings`, `EmailSettings`, `SmsSettings`, `OtpSettings`, `DigitalSignature`, `CustomField`, `SocialAuthSettings` ฯลฯ

---

## 3. 🖥️ รายละเอียดฟีเจอร์แยกตามโมดูล (Module & Feature Breakdown)

### โมดูลที่ 1: แดชบอร์ด & จุดขายหน้าร้าน (Dashboard & POS)
1. **Dashboard (`/`)**:
   - สรุปตัวเลข KPI: ยอดขายรวม, กำไรสุทธิ, ยอดซื้อสินค้าเข้า, ยอดใบแจ้งหนี้ค้างชำระ
   - แผนภูมิวิเคราะห์ยอดขายและกระแสเงินสด (Recharts Dynamic Visualization)
   - ตารางรายการธุรกรรมล่าสุด (Recent Transactions)
   - การ์ดแจ้งเตือนสินค้าใกล้หมดสต็อก และสินค้าใกล้หมดอายุ
2. **POS Terminal Screen (`/pos`)**:
   - หน้าขายแบบ Full-screen รองรับหน้าจอสัมผัส (Touchscreen Ready)
   - ค้นหาสินค้าด้วย Barcode Scanner ยิงบาร์โค้ดได้ทันที / ค้นหาตามชื่อสินค้า / กรองตามหมวดหมู่
   - ระบบจัดการตะกร้าสินค้า: ปรับจำนวน, ปรับราคาส่วนลดรายชิ้น/ทั้งบิล, กำหนดภาษี VAT 7%
   - จัดการลูกค้าหน้าร้าน (เลือกลูกค้าทั่วไป Walk-in หรือสมาชิกลูกค้า)
   - หน้าต่างชำระเงินหลายช่องทาง (Multi-tender Payment): เงินสด (Cash พร้อมคำนวณเงินทอนอัตโนมัติ), QR PromptPay, บัตรเครดิต/เดบิต, โอนเงินธนาคาร
   - ตัดสต็อกอัตโนมัติแบบ Real-time ตัดตามคลัง/สาขาที่แคชเชียร์ประจำอยู่
   - พิมพ์ใบเสร็จอย่างย่อ (80mm / 58mm Thermal Receipt Print)
   - การจัดการกะขาย (POS Shifts): เปิดกะระบุเงินทอนเริ่มต้น, บันทึกเงินเข้า-ออกระหว่างวัน (Cash-in / Cash-out), สรุปยอดปิดกะ (Close Shift & Reconcile)

---

### โมดูลที่ 2: ระบบจัดการสต็อกและคลังสินค้า (Inventory & Stock Management)
1. **Product Master Data (`/products`, `/products/add`, `/products/edit/[id]`)**:
   - ระบบจัดการสินค้าแบบ Simple Product และ Variant Product (ตัวเลือก สี/ขนาด/รุ่น)
   - ผูกข้อมูล Category, Sub-Category, Brand, Unit, Warehouse, Store, Warranty
   - กำหนด Alert Minimum Quantity สำหรับแจ้งเตือนสต็อกต่ำ
   - รองรับการอัปโหลดรูปภาพสินค้า
   - ส่งออกข้อมูลเป็น CSV และ PDF
2. **หมวดหมู่และข้อมูลเสริม (Master Attributes)**:
   - หมวดหมู่สินค้าหลัก (`/categories`) & หมวดหมู่ย่อย (`/sub-categories`)
   - แบรนด์สินค้า (`/brands`) & หน่วยนับ (`/units`)
   - เงื่อนไขการรับประกัน (`/warranties`)
   - คุณลักษณะสินค้า (`/variant-attributes`)
3. **การควบคุมและตรวจสอบสต็อก (Stock Operations)**:
   - **Manage Stock (`/stock/manage`)**: ดูยอดสต็อกแยกรายคลังและสาขา ปรับปรุงสต็อกด่วน
   - **Stock Adjustment (`/stock/adjustment`)**: บันทึกการเพิ่ม/ลดสต็อก พร้อมระบุเหตุผล (ชำรุด, สูญหาย, ปรับยอดประจำปี) และคำนวณต้นทุนปรับปรุง
   - **Stock Transfer (`/stock/transfer`)**: ใบโอนย้ายสต็อกระหว่างคลัง พร้อมสถานะ Pending, In-Transit, Completed, Cancelled
   - **Low Stock & Out of Stock Alerts (`/inventory/low-stock`)**: ระบบเฝ้าระวังสินค้าใกล้หมดและสินค้าหมด พร้อมปุ่มสั่งซื้อด่วน (Quick Reorder Budget)
   - **Expired Products (`/inventory/expired`)**: ตรวจสอบล็อตสินค้าที่หมดอายุ/ใกล้หมดอายุ พร้อมระบบตัดจำหน่าย (Write-off/Dispose)
   - **Barcode & QR Code Printing (`/barcode/print`, `/qrcode/print`)**: ออกแบบและพิมพ์สติ๊กเกอร์บาร์โค้ดสินค้า รองรับขนาดสติ๊กเกอร์หลากหลาย

---

### โมดูลที่ 3: ระบบจัดซื้อและการขาย (Purchases & Sales Orders)
1. **ระบบจัดซื้อ (Purchasing Module)**:
   - **Purchase Orders (`/purchases`)**: จัดการใบสั่งซื้อสินค้าเข้าจาก Supplier, ติดตามสถานะ Received, Pending, Ordered
   - **Purchase Returns (`/purchases/returns`)**: ระบบส่งคืนสินค้าไปยัง Supplier กรณีสินค้ามีตำหนิหรือชำรุด พร้อมปรับลดสต็อกอัตโนมัติ
   - **Supplier Management (`/suppliers`)**: จัดการข้อมูลผู้จัดจำหน่าย, ยอดเครดิตค้างจ่าย, ประวัติการส่งของ
2. **ระบบงานขาย (Sales & Invoicing Module)**:
   - **Sales List (`/sales`)**: ประวัติการขายทั้งหมด พร้อมดูสลิป, ใบเสร็จ, Export ข้อมูล
   - **Invoices (`/invoices`)**: ใบแจ้งหนี้การค้า, ติดตามยอดชำระ Paid, Partially Paid, Unpaid, Overdue
   - **Sales Returns (`/sales/returns`)**: การรับคืนสินค้าจากลูกค้า คืนเงินเข้าลิ้นชัก/ยอดเครดิต พร้อมดึงสต็อกกลับเข้าคลัง
   - **Quotations (`/quotations`)**: ระบบออกใบเสนอราคา พิมพ์ PDF ส่งลูกค้า และแปลงเป็นใบขาย (Convert to Order) ได้
   - **Customer Management (`/customers`)**: ทะเบียนลูกค้า, วงเงินเครดิต, ประวัติการซื้อสะสม

---

### โมดูลที่ 4: การค้าส่งและธุรกิจ B2B (B2B Commercial & Thai Tax Compliance)
1. **B2B Sales Orders (`/b2b/orders`)**:
   - การสั่งซื้อล็อตใหญ่สำหรับลูกค้าองค์กร/ร้านค้าตัวแทน
   - กำหนดเงื่อนไขการชำระเงิน (Credit Term: 15 วัน, 30 วัน, 60 วัน)
2. **Billing Note / ใบวางบิล (`/b2b/billing`)**:
   - รวบรวม Invoice หลายฉบับของลูกค้าเจ้าเดียวกันมาวางบิลรอบเดียวกัน
   - ออกใบวางบิลตามรูปแบบทางการค้า พิมพ์ส่งฝ่ายบัญชีลูกค้า
3. **AR Aging Analysis / รายงานวิเคราะห์อายุหนี้ (`/b2b/ar-aging`)**:
   - ติดตามหนี้ค้างชำระแบ่งตามช่วงเวลา (Current, 1-30 วัน, 31-60 วัน, 61-90 วัน, มากกว่า 90 วัน)
   - ป้องกันหนี้สูญสำหรับธุรกิจ B2B
4. **ภาษีหัก ณ ที่จ่าย / Withholding Tax (`/finance/withholding-tax`)**:
   - ออกหนังสือรับรองการหักภาษี ณ ที่จ่าย (มาตรา 50 ทวิ)
   - รองรับอัตรา 1% (ค่าขนส่ง), 2% (ค่าโฆษณา), 3% (ค่าบริการ/รับจ้างทำของ), 5% (ค่าเช่า)
   - สรุปยอดภาษีนำส่ง ภ.ง.ด. 3 และ ภ.ง.ด. 53
5. **ใบกำกับภาษีเต็มรูป / Tax Invoice (`/finance/tax-invoices`)**:
   - ออกใบกำกับภาษีตามประมวลรัษฎากรไทย ระบุเลขประจำตัวผู้เสียภาษี 13 หลัก, สาขาสำนักงานใหญ่/สาขาที่
   - ออกใบลดหนี้/ใบเพิ่มหนี้ (Credit/Debit Note)

---

### โมดูลที่ 5: การผลิตและการวางแผนวัตถุดิบ (Manufacturing & MRP)
1. **Bill of Materials - BOM (`/manufacturing/bom`)**:
   - โครงสร้างสูตรการผลิต กำหนดวัตถุดิบ (Raw Materials), ปริมาณการใช้, หน่วยนับ, ต้นทุนวัตถุดิบ และต้นทุนค่าแรง/โสหุ้ย
2. **Work Orders - คำสั่งผลิต (`/manufacturing/work-orders`)**:
   - วางแผนและสั่งผลิตสินค้าสำเร็จรูป ติดตามสถานะ Planned, In Progress, Completed
   - ดำเนินการตัดสต็อกวัตถุดิบอัตโนมัติเมื่อเริ่มผลิต และเพิ่มยอดสินค้าสำเร็จรูปเข้าคลังเมื่อผลิตเสร็จ
3. **Material Requisitions - ใบเบิกวัตถุดิบ (`/manufacturing/requisitions`)**:
   - ระบบเบิกวัตถุดิบจากคลังใหญ่เข้าสู่พื้นที่การผลิต (Production Line)
4. **MRP Planning (`/manufacturing/mrp-planning`)**:
   - คำนวณความต้องการวัตถุดิบจากยอดสั่งซื้อและยอดคำสั่งผลิตเทียบกับสต็อกคงเหลือปัจจุบัน
5. **Production Scrap - ของเสียจากการผลิต (`/manufacturing/scrap`)**:
   - บันทึกเศษซากหรือสินค้าเสียที่เกิดขึ้นในขั้นตอนการผลิต พร้อมเหตุผล เพื่อคำนวณสูญเสียต้นทุนจริง

---

### โมดูลที่ 6: การเงินและการบัญชี (Finance & Accounting)
1. **Expenses & Expense Categories (`/finance/expenses`, `/finance/expense-categories`)**:
   - บันทึกค่าใช้จ่ายดำเนินงานบริษัท พร้อมแนบสลิป/เอกสารประกอบ
2. **Income & Income Categories (`/finance/income`, `/finance/income-categories`)**:
   - บันทึกรายได้อื่นๆ ที่ไม่ได้เกิดจากการขายสินค้าหน้าร้าน
3. **Bank Accounts & Transfer (`/finance/bank-accounts`, `/finance/money-transfer`)**:
   - ผูกบัญชีธนาคารหลายบัญชี และบันทึกการโอนย้ายเงินระหว่างบัญชีธนาคาร
4. **งบและรายงานการเงิน (Financial Statements)**:
   - **Cash Flow (`/finance/cash-flow`)**: งบกระแสเงินสด วิเคราะห์เงินสดรับ-จ่าย
   - **Trial Balance (`/finance/trial-balance`)**: งบทดลองตรวจสอบยอดดุลเดบิต-เครดิต

---

### โมดูลที่ 7: การบริหารงานบุคคล (HRM & Payroll)
1. **Employee Directory (`/hrm/employees`)**: ประวัติพนักงาน, แผนก, ตำแหน่ง, เงินเดือนพื้นฐาน
2. **Departments & Designations (`/hrm/departments`, `/hrm/designations`)**: โครงสร้างแผนกและตำแหน่งงาน
3. **Attendance & Shifts (`/hrm/attendance`, `/hrm/shifts`)**: ตารางกะและบันทึกเวลาปฏิบัติงาน
4. **Leaves & Holidays (`/hrm/leaves`, `/hrm/leave-types`, `/hrm/holidays`)**: ระบบลางาน, คำนวณวันลาคงเหลือ, ปฏิทินวันหยุดบริษัท
5. **Payroll & Payslip (`/hrm/payroll/salary`, `/hrm/payroll/payslip`)**: คำนวณเงินเดือน, เงินได้-เงินหัก, สลิปเงินเดือนรูปแบบมาตรฐานพร้อมพิมพ์และส่งอีเมล

---

### โมดูลที่ 8: โปรโมชั่นและการตลาด (Promotions & Loyalty)
1. **Coupons (`/promo/coupons`)**: สร้างโค้ดส่วนลดแบบเปอร์เซ็นต์หรือยอดเงินคงที่ กำหนดวันเริ่มต้น-สิ้นสุด และจำนวนครั้งที่ใช้ได้
2. **Discount Plans (`/promo/discount-plan`)**: กำหนดแผนโปรโมชั่นพิเศษตามช่วงเวลา
3. **Gift Cards (`/promo/gift-cards`)**: บัตรของขวัญมูลค่าเงินสดสำหรับลูกค้าหน้าร้าน

---

### โมดูลที่ 9: รายงานและการวิเคราะห์ธุรกิจ (Comprehensive Reports)
ระบบมีหน้าจอรายงานวิเคราะห์กว่า 12 มิติ พร้อมฟังก์ชัน Date-range Filter, Category Filter, Export PDF/Excel:
- **Sales & Best Sellers Report (`/reports/sales`, `/reports/sales/best-seller`)**
- **Purchase Report (`/reports/purchases`)**
- **Inventory & Stock History Report (`/reports/inventory`, `/reports/inventory/stock-history`, `/reports/inventory/sold-stock`)**
- **Invoice Report (`/reports/invoices`)**
- **Customer & Supplier Reports (`/reports/customers`, `/reports/customers/due`, `/reports/suppliers`, `/reports/suppliers/due`)**
- **Product Expiry & Quantity Alert Reports (`/reports/products`, `/reports/products/expiry`, `/reports/products/quantity-alert`)**
- **Expense & Income Reports (`/reports/expenses`, `/reports/income`)**
- **Tax Reports (`/reports/tax`, `/reports/tax/sales`)**
- **Profit / Loss Report (`/reports/profit-loss`)**
- **Annual Report (`/reports/annual`)**

---

### โมดูลที่ 10: ความปลอดภัย การจัดการผู้ใช้ และการตั้งค่าระบบ (Admin, Security & Settings)
1. **User Management & RBAC (`/users`, `/roles-permissions`)**:
   - การจัดการสิทธิ์แบบ Granular Role Matrix (All, View, Create, Edit, Delete แยกตามโมดูล)
   - ผูกผู้ใช้กับสาขา/คลังสินค้า (Multi-store / Multi-warehouse Access Control)
2. **Audit Logs & Incident Handling (`/activity-logs`, backend incident logger)**:
   - บันทึกการเข้าใช้งาน, ประวัติการทำรายการสำคัญ (Audit Trail)
   - Incident Error Handling Plan ดักจับ Runtime Exception และบันทึกเข้า DB
3. **25 Sub-Settings Coverage (`/settings/*`)**:
   - **General**: Profile, Security (2FA, Device Session), Notifications, Connected Apps (Slack, Gmail, Dropbox, etc.)
   - **Website**: Company Info & Logos, Prefixes (เลขรันเอกสาร PO, SO, INV, RC ฯลฯ), Localization (Timezone, Date format), Language (รองรับภาษาไทย th และ en), Theme (Dark/Light/Color Accents)
   - **App & POS**: POS Receipt Printer, Invoice Templates, POS sound/payment toggles, Digital Signatures, Custom Fields
   - **Finance**: Payment Gateways (Stripe, Paypal, 2C2P, Omise), Bank Accounts, Tax Rates (VAT 7%), Multi-currency (THB, USD)

---

## 4. 📐 มาตรฐานการพัฒนาและข้อกำหนดของระบบ (System Constraints & Rules)

1. **Database & API Standard**:
   - ทุกหน้าเชื่อมต่อ API จริงกับฐานข้อมูล Prisma ไม่มี Mock Data
   - มีระบบ Validation ทั้งฝั่ง Frontend (Zod/Form State) และ Backend Middleware
2. **UI/UX Consistency**:
   - Dropdown ค้นหาใช้ `SearchableSelect` ทั้งหมด
   - Action Button ในตารางเรียงลำดับมาตรฐาน: **View (`Eye`)** -> **Edit (`Edit`)** -> **Delete (`Trash2`)**
   - มี Real-time Search, Multi-criteria Filters, Pagination ปรับ Page Size ได้ และ Export PDF/CSV
3. **Feedback Modals Flow**:
   - **Add Success**: Modal กึ่งกลางหน้าจอ ไอคอนเขียว มีปุ่ม `+ Add Another` และ `Done`
   - **Edit Success**: Modal กึ่งกลางหน้าจอ ไอคอนฟ้า/เขียว แจ้งชื่อรายการสำเร็จ พร้อมปุ่ม `OK`
   - **Delete Flow**: 2-Step Confirmation Modal (Step 1 ถามยืนยันไอคอนแดง -> Step 2 แจ้งสำเร็จไอคอนอำพัน)
   - **Error Handling**: Modal เครื่องหมายเตือนสีแดง แจ้งรายละเอียดปัญหา

---

## 5. 🎯 วัตถุประสงค์เพื่อนำไปประเมินต่อ (For AI Review & Gap Analysis)

ข้อมูลนี้สรุปฟังก์ชันของระบบที่พัฒนาแล้วอย่างครบถ้วน เพื่อให้คุณนำไปป้อนให้ AI หรือทีมพัฒนานำไปวิเคราะห์ต่อในประเด็น:
1. **ERP / Supply Chain Completeness**: ยังขาด Flow ใดของระบบบริหารคลังสินค้าหรือโรงงานหรือไม่ (เช่น Serial Number Tracking ระดับชิ้น, Lot Batch Recall, Consignment ฝากขาย)
2. **Thai Localization & Legal Accounting**: การเชื่อมต่อ E-Tax Invoice by Time Stamp / E-Tax Invoice by Email ของกรมสรรพากร, ระบบสลิปโอนเงินตรวจสอบยอดอัตโนมัติ (Slip Verification API)
3. **Omnichannel & Integrations**: การเชื่อมต่อ E-Commerce (Shopee, Lazada, TikTok Shop, WooCommerce), ระบบ Loyalty Points สะสมคะแนนสมาชิก
4. **Hardware Integrations**: การรองรับเครื่องชั่งน้ำหนักดิจิทัล (Weight Scales), จอแสดงผลฝั่งลูกค้า (Customer Display System - CDS), เครื่องพิมพ์สติ๊กเกอร์ความร้อนโดยตรงผ่าน WebUSB / Serial API
