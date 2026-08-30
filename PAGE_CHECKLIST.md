# 📋 ABC POS & Inventory Management - Page Development Checklist

ไฟล์นี้ใช้สำหรับติดตามสถานะการพัฒนาหน้าจอ (UI Frontend) และระบบหลังบ้าน (Backend API / Database Schema) ตามภาพแคปเจอร์ของเทมเพลต **Dreams POS**

---

## 🌟 กลุ่มที่ 1: หน้าหลักและสินค้า (Core & Inventory) — *Priority 1*

- [x] **1. Dashboard Overview**
  - **Route**: `/`
  - **Backend**: `GET /api/dashboard/stats`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Stats, กราฟ Recharts, รายการขายล่าสุด, แจ้งเตือนสต็อก)
  
- [x] **2. POS Terminal Screen**
  - **Route**: `/pos`
  - **Backend**: `POST /api/orders`, `GET /api/products`, `GET /api/categories`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ยิงบาร์โค้ด, ตะกร้า, ส่วนลด, VAT 7%, ชำระเงินสด/QR/บัตร, ตัดสต็อกจริง, พิมพ์ใบเสร็จ)

- [x] **3. Products List (Inventory)**
  - **Route**: `/products`
  - **Backend**: `GET /api/products`, `DELETE /api/products/:id`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางสินค้า, ค้นหา, กรองหมวดหมู่, สถานะ Active/Out of Stock)

- [x] **4. Create Product (Add Product)**
  - **Route**: `/products/add`
  - **Backend**: `POST /api/products`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ถอดแบบตรงตามภาพ Dreams POS: ข้อมูลสินค้า, ราคา/สต็อก, อัปโหลดรูป, Custom fields)

- [x] **5. Category & Sub Category**
  - **Route**: `/categories`, `/sub-categories`
  - **Backend**: `GET/POST/PUT/DELETE /api/categories`, `GET/POST/PUT/DELETE /api/sub-categories`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางหมวดหมู่และหมวดหมู่ย่อย, รหัส CTxxx, Export PDF/Excel, Search, Filter, Modal เพิ่ม/แก้ไข, จัดการสต็อก)

- [x] **4. Low Stocks & Out of Stocks**
  - **Route**: `/inventory/low-stock`
  - **Backend**: `GET /api/products`, `GET /api/warehouses`, `GET /api/stores`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (แท็บ Low Stocks / Out of Stocks, สวิตช์ Notify, Filter คลังสินค้า/สาขา/หมวดหมู่, ตารางแจ้งเตือนจุดสั่งซื้อ Qty Alert, ปุ่ม Send Email)

- [x] **5. Category & Sub Category**
  - **Route**: `/categories`, `/sub-categories`
  - **Backend**: `GET/POST/PUT/DELETE /api/categories`, `GET/POST/PUT/DELETE /api/sub-categories`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางหมวดหมู่และหมวดหมู่ย่อย, รหัส CTxxx, Export PDF/Excel, Search, Filter, Modal เพิ่ม/แก้ไข, จัดการสต็อก)

- [x] **6. Brands & Units**
  - **Route**: `/brands`, `/units`
  - **Backend**: `GET/POST/PUT/DELETE /api/brands`, `GET/POST/PUT/DELETE /api/units`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางจัดการแบรนด์และหน่วยนับ, Modal สร้าง/แก้ไข, ความสัมพันธ์กับสินค้า, Export PDF/Excel)

- [x] **7. Expired Products**
  - **Route**: `/inventory/expired`
  - **Backend**: `GET /api/products` (Manufactured Date & Expired Date tracking)
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางสินค้าหมดอายุ, วันที่ผลิต, วันหมดอายุ, Filter สินค้าและ Sort By Last 7 Days, Export PDF/Excel)

- [x] **8. Warranties**
  - **Route**: `/warranties`
  - **Backend**: `GET/POST/PUT/DELETE /api/warranties`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางจัดการการรับประกัน, ชื่อ, รายละเอียด, ระยะเวลา, Modal เพิ่ม/แก้ไข)

- [x] **9. Variant Attributes**
  - **Route**: `/variant-attributes`
  - **Backend**: `GET/POST/PUT/DELETE /api/variant-attributes`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางจัดการคุณลักษณะสินค้า เช่น Size, Color, Capacity, Values, Modal เพิ่ม/แก้ไข)

- [x] **10. Print Barcode & Print QR Code**
  - **Route**: `/barcode/print`, `/qrcode/print`
  - **Backend**: Barcode & QR Code generators
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (หน้าเลือก Warehouse/Store, ค้นหาสินค้า, กำหนดจำนวนแถวสติ๊กเกอร์ `[-] qty [+]`, เลือกขนาดกระดาษ, สวิตช์เปิดปิด Store Name/Price/Ref Number, ปุ่ม Generate, Reset และ Print)

- [ ] **8. Expired & Low Stock Products**
  - **Route**: `/inventory/expired`, `/inventory/low-stock`
  - **Backend**: `GET /api/products?lowStock=true`
  - **สิ่งที่ต้องการ**: ตารางแจ้งเตือนสินค้าใกล้หมดอายุ และสินค้าต่ำกว่าจุดสั่งซื้อ
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

---

## 📦 กลุ่มที่ 2: การจัดการคลังและสต็อก (Stock Management)


- [ ] **11. Stock Transfer**
  - **Route**: `/stock/transfer`
  - **Backend**: `POST /api/stock/transfers`
  - **สิ่งที่ต้องการ**: ฟอร์มและตารางโอนย้ายสินค้าระหว่างสาขา/คลัง
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

---

## 🛒 กลุ่มที่ 3: ระบบการขายและการจัดซื้อ (Sales & Purchases)

- [x] **12. Sales Orders & Receipts History**
  - **Route**: `/orders`
  - **Backend**: `GET /api/orders`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ประวัติรายการขายย้อนหลัง, Modal ดูใบเสร็จ, พิมพ์ซ้ำ)

- [ ] **13. Sales List & Invoices**
  - **Route**: `/sales`, `/invoices`
  - **Backend**: `GET /api/invoices`
  - **สิ่งที่ต้องการ**: ตารางใบแจ้งหนี้/ใบเสร็จรับเงินเต็มรูปแบบ และดาวน์โหลด PDF
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **14. Sales Return**
  - **Route**: `/sales/returns`
  - **Backend**: `POST /api/sales/returns`
  - **สิ่งที่ต้องการ**: ฟอร์มรับคืนสินค้าหน้าร้าน, คืนเงิน และเพิ่มสต็อกกลับคืนคลัง
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **15. Quotation (ใบเสนอราคา)**
  - **Route**: `/quotations`
  - **Backend**: `GET/POST /api/quotations`
  - **สิ่งที่ต้องการ**: หน้าสร้างใบเสนอราคา และแปลงเป็นบิลขาย
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **16. Purchases & Purchase Orders (PO)**
  - **Route**: `/purchases`, `/purchases/orders`
  - **Backend**: `GET/POST /api/purchases`
  - **สิ่งที่ต้องการ**: บันทึกสั่งซื้อสินค้าจากซัพพลายเออร์ และการรับสินค้าเข้าสต็อก
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **17. Promo (Coupons & Discounts)**
  - **Route**: `/promo/coupons`, `/promo/discounts`
  - **Backend**: `GET/POST /api/coupons`
  - **สิ่งที่ต้องการ**: หน้าสร้างโค้ดส่วนลด, คูปองโปรโมชั่น และวันหมดอายุ
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

---

## 👥 กลุ่มที่ 4: ลูกค้า คู่ค้า และการเงิน (Peoples & Finance)

- [x] **18. Customers List**
  - **Route**: `/customers`
  - **Backend**: `GET/POST/PUT/DELETE /api/customers`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางลูกค้าตรงตามภาพ Dreams POS: รหัส CUxxx, รูป Avatar, ชื่อ, Email, เบอร์โทร, ประเทศ, สถานะ Active/Inactive, Action ดู/แก้ไข/ลบ, ค้นหา, Filter, Export PDF/Excel, Modal เพิ่ม/แก้ไขลูกค้า และดูข้อมูลส่วนตัว)

- [x] **19. Suppliers List**
  - **Route**: `/suppliers`
  - **Backend**: `GET/POST/PUT/DELETE /api/suppliers`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางซัพพลายเออร์ตรงตามภาพ: รหัส SUxxx, รูปสินค้า/ร้าน, ชื่อ, Email, Phone, Country, สถานะ Active/Inactive, Action ดู/แก้ไข/ลบ, Export PDF/Excel, Search, Filter, Modal เพิ่ม/แก้ไข/ดูโปรไฟล์)

- [x] **20. Stores & Warehouses**
  - **Route**: `/stores`, `/warehouses`
  - **Backend**: `GET/POST/PUT/DELETE /api/stores`, `GET/POST/PUT/DELETE /api/warehouses`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (หน้าร้านค้า: Store, User Name, Email, Phone, Status, Print/Export, Modal จัดการสาขา | หน้าคลังสินค้า: Warehouse, Contact Person + Avatar, Phone, Total Products, Stock, Qty, Created On, Status, Export/Print, Modal จัดการคลัง)

- [x] **21. Billers**
  - **Route**: `/billers`
  - **Backend**: `GET/POST/PUT/DELETE /api/billers`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางผู้ออกบิล: รหัส BIxxx, รูป Avatar, ชื่อ, Company Name, Email, Phone, Country, สถานะ Active/Inactive, Action ดู/แก้ไข/ลบ, Export PDF/Excel, Search, Filter, Modal เพิ่ม/แก้ไข/ดูรายละเอียด)

- [ ] **21. Expenses & Income (รายรับ-รายจ่าย)**
  - **Route**: `/finance/expenses`, `/finance/income`
  - **Backend**: `GET/POST /api/finance/transactions`
  - **สิ่งที่ต้องการ**: บันทึกค่าใช้จ่ายร้าน (ค่าน้ำ, ค่าไฟ, ค่าเช่า) และหมวดหมู่ค่าใช้จ่าย
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

---

## 👔 กลุ่มที่ 5: การจัดการทรัพยากรบุคคล (HRM)

- [x] **22. Employees List**
  - **Route**: `/hrm/employees`
  - **Backend**: `GET/POST/PUT/DELETE /api/employees`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (การ์ดสถิติ 4 ใบ: Total, Active, Inactive, New Joiners | สลับมุมมอง Grid Cards & List Table | ข้อมูลพนักงาน รหัส EMP ID, รูป Avatar, ชื่อ, ตำแหน่ง, แผนก, วันเริ่มงาน | Search, Filter, Export PDF/Excel, Modal เพิ่ม/แก้ไข/ดูโปรไฟล์)

- [x] **23. Departments**
  - **Route**: `/hrm/departments`
  - **Backend**: `GET/POST/PUT/DELETE /api/departments`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (สลับมุมมอง Grid Cards & List Table | จุดสถานะสีเขียว, ชื่อแผนก, หัวหน้าแผนก + รูป Avatar, สรุปจำนวนสมาชิก Total Members, Avatar Stack | Export PDF/Excel, Search, Filter, Modal เพิ่ม/แก้ไขแผนก)

- [x] **24. Designation**
  - **Route**: `/hrm/designations`
  - **Backend**: `GET/POST/PUT/DELETE /api/designations`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางตำแหน่งงาน: Designation, แผนก Department, Members Avatar Stack, Total Members, วันที่สร้าง Created On, สถานะ Active/Inactive, Action แก้ไข/ลบ | Search, Filter แผนก/สถานะ, Export PDF/Excel, Modal จัดการตำแหน่ง)

- [x] **25. Shifts & Schedules**
  - **Route**: `/hrm/shifts`
  - **Backend**: `GET/POST/PUT/DELETE /api/shifts`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางกะการทำงาน: Shift Name, ช่วงเวลา Timing, วันหยุดประจำสัปดาห์ Week off, วันที่สร้าง Created On, สถานะ Active/Inactive, Action แก้ไข/ลบ | Search, Filter สถานะ, Export PDF/Excel, Modal เพิ่ม/แก้ไขกะ)

- [x] **26. Attendance (Employee & Admin)**
  - **Route**: `/hrm/attendance/employee`, `/hrm/attendance/admin`
  - **Backend**: `GET/POST/PUT/DELETE /api/attendance`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ฝั่งพนักงาน: กล่องเวลาปัจจุบัน Current Time พร้อมปุ่ม Clock In/Out และ Break, สรุป 6 การ์ดรายเดือน, ตารางบันทึกเวลาพร้อม Multi-color Progress Bar | ฝั่งผู้ดูแล Admin: ตารางสรุปเวลาของพนักงานทุกคน Employee + Avatar + Role, Status, Clock In, Clock Out, Production, Break, Overtime, Total Hours | Search, Date Picker, Filter Status, Export PDF/Excel)

- [x] **27. Leaves (Admin, Employee & Leave Type)**
  - **Route**: `/hrm/leaves/admin`, `/hrm/leaves/employee`, `/hrm/leaves/types`
  - **Backend**: `GET/POST/PUT/DELETE /api/leaves`, `GET/POST/PUT/DELETE /api/leave-types`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Leave Type: จัดการประเภทการลาและโควตาต่อปี | Admin Leaves: ตารางคำขอลาของพนักงานทุกคน ID, Employee + Avatar, Type, From/To Date, Days/Hours, Applied On, Shift, Status, Action แก้ไข/ลบ | Employee Leaves: ประวัติการลาของตนเอง พร้อมปุ่ม Cancel/Info, Modal ขอลา Apply Leave)

- [x] **28. Holidays**
  - **Route**: `/hrm/holidays`
  - **Backend**: `GET/POST/PUT/DELETE /api/holidays`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางวันหยุด: Type/ชื่อวันหยุด, Date วันที่, Description คำอธิบาย, Status Active/Inactive, Action แก้ไข/ลบ | Search, Filter Status, Export PDF/Excel, Modal เพิ่ม/แก้ไขวันหยุด)

- [x] **29. Payroll (Employee Salary & Payslip)**
  - **Route**: `/hrm/payroll/salary`, `/hrm/payroll/payslip`
  - **Backend**: `GET/POST/PUT/DELETE /api/payroll`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Employee Salary: ตารางเงินเดือนพนักงาน ID, Employee + Avatar, Email, Salary, Status Paid/UnPaid, Action ดูสลิปเงินเดือน View Payslip, ดาวน์โหลด, แก้ไข, ลบ | Payslip: ใบสลิปเงินเดือนแบบละเอียดแจกแจง Earnings vs Deductions, คำนวณ Net Salary พร้อมตัวสะกด Inwords, ปุ่ม Send Email, Download, Print Barcode, เลือกพนักงาน)

---

## 📊 กลุ่มที่ 6: รายงานและการตั้งค่า (Reports & Settings)

- [x] **22. Sales Report & Best Seller Report**
  - **Route**: `/reports/sales`, `/reports/sales/best-seller`
  - **Backend**: `GET /api/reports/sales`, `GET /api/reports/bestsellers`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Sales Report: 4 สรุปสถิติ Total Amount, Total Paid, Total Unpaid, Overdue พร้อมกล่องกรอง Choose Date, Store, Products, ปุ่ม Generate Report | ตารางสินค้า: SKU, Product Name + รูป, Brand, Category, Sold Qty, Sold Amount, Instock Qty, Export PDF/Excel/Print | Bestseller Products Report: สรุปสินค้ายอดนิยมเรียงตามจำนวนที่ขายได้)

- [x] **23. Purchase Report**
  - **Route**: `/reports/purchases`
  - **Backend**: `GET /api/reports/purchases`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (กล่องกรอง Choose Date, Store, Products, ปุ่ม Generate Report | ตารางรายงานการซื้อ: Reference PO, SKU, Due Date, Product Name + รูปภาพ, Category, Instock Qty, Purchase Qty, Purchase Amount, Export PDF/Excel/Print)

- [x] **24. Inventory Report (3 Submenus: Inventory Report, Stock History, Sold Stock)**
  - **Route**: `/reports/inventory`, `/reports/inventory/stock-history`, `/reports/inventory/sold-stock`
  - **Backend**: `GET /api/reports/inventory`, `GET /api/reports/stock-history`, `GET /api/reports/sold-stock`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Tab Switcher สลับ 3 หน้ารายงานด้านบน | Inventory Report: ตารางสรุปสต็อกสินค้า SKU, Category, Unit, Instock Qty, Min Stock Alert, Stock Value | Stock History: ตารางประวัติสต็อก Initial Qty, Added Qty, Sold Qty, Defective Qty, Final Qty | Sold Stock: ตารางสินค้าที่ขายออก Unit, Qty, Tax Value, Total ยอดรวม | กล่องกรอง Choose Date, Category, Products, Export PDF/Excel/Print)

- [x] **25. Invoice Report**
  - **Route**: `/reports/invoices`
  - **Backend**: `GET /api/reports/invoices`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (4 สรุปสถิติ Total Amount, Total Paid, Total Unpaid, Overdue พร้อมกล่องกรอง Choose Date, Customer, Status, ปุ่ม Generate Report | ตารางใบแจ้งหนี้: Checkbox, Invoice No, Customer, Due Date, Amount, Paid, Amount Due, Status Paid/Unpaid, Export PDF/Excel/Print)

- [x] **26. Supplier Report (2 Submenus: Supplier Report, Supplier Due Report)**
  - **Route**: `/reports/suppliers`, `/reports/suppliers/due`
  - **Backend**: `GET /api/reports/suppliers`, `GET /api/reports/suppliers/due`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Tab Switcher สลับ Supplier Report / Supplier Due ด้านบน | Supplier Report: ตารางสรุปการซื้อจากซัพพลายเออร์ Reference, ID, Supplier, Total Items, Amount, Payment Method, Status Received/Pending/Ordered, สรุปรวม Total $33268.53 | Supplier Due: ตารางค้างชำระ Reference, ID, Supplier, Total Amount, Paid, Due, Status Paid/Overdue/Unpaid, สรุปรวม Total 33268 $33268.53 $0.0 | กล่องกรอง Choose Date, Supplier, Status/Payment Status, Payment Method/Reference, Export PDF/Excel/Print)

- [x] **27. Customer Report (2 Submenus: Customer Report, Customer Due Report)**
  - **Route**: `/reports/customers`, `/reports/customers/due`
  - **Backend**: `GET /api/reports/customers`, `GET /api/reports/customers/due`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Tab Switcher สลับ Customer Report / Customer Due ด้านบน | Customer Report: ตารางสรุปยอดขายลูกค้า Reference, Code, Customer + Avatar, Total Orders, Amount, Payment Method, Status Completed, สรุปรวม Total $33268.53 | Customer Due: ตารางค้างชำระลูกค้า Reference, Code, Customer, Total Amount, Paid, Due, Status Paid/Overdue/Unpaid/Completed, สรุปรวม Total 33268 $33268.53 $0.0 | กล่องกรอง Choose Date, Customer, Payment Method, Status/Payment Status, Export PDF/Excel/Print)

- [x] **28. Product Report (3 Submenus: Product Report, Product Expiry Report, Product Quantity Alert)**
  - **Route**: `/reports/products`, `/reports/products/expiry`, `/reports/products/quantity-alert`
  - **Backend**: `GET /api/reports/products`, `GET /api/reports/products/expiry`, `GET /api/reports/products/quantity-alert`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Tab Switcher สลับ 3 หน้ารายงานด้านบน | Product Report: ตารางรายงานสินค้า SKU, Product Name, Category, Brand, Qty, Price, Total Ordered, Revenue | Product Expiry Report: ตารางวันหมดอายุ SKU, Serial No, Product Name, Manufactured Date, Expired Date | Product Quantity Alert: ตารางเตือนสต็อก SKU, Serial No, Product Name, Total Quantity, Alert Quantity | กล่องกรอง Choose Date, Store, Category, Brand, Product, Export PDF/Excel/Print)

- [x] **29. Expense Report**
  - **Route**: `/reports/expenses`
  - **Backend**: `GET /api/reports/expenses`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (กล่องกรอง Choose Date, Expense Category, Payment Method, Status Approved/Pending, ปุ่ม Generate Report | ตารางรายงานค่าใช้จ่าย: Expense Name, Category, Description, Date, Amount, Status Approved/Pending, Export PDF/Excel/Print)

- [x] **30. Income Report**
  - **Route**: `/reports/income`
  - **Backend**: `GET /api/reports/income`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (กล่องกรอง Choose Date, Income Category, Payment Method, Status Received/Pending, ปุ่ม Generate Report | ตารางรายงานรายรับ: Income Name, Category, Description, Date, Amount, Status Received/Pending, Export PDF/Excel/Print)

- [x] **31. Tax Report (2 Submenus: Purchase Tax, Sales Tax)**
  - **Route**: `/reports/tax`, `/reports/tax/sales`
  - **Backend**: `GET /api/reports/tax/purchase`, `GET /api/reports/tax/sales`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Tab Switcher สลับ Purchase tax / Sales Tax ด้านบน | Purchase Tax: ตารางภาษีซื้อ Reference, Supplier, Date, Store, Amount, Payment Method, Discount, Tax Amount | Sales Tax: ตารางภาษีขาย Reference, Customer, Date, Store, Amount, Payment Method, Discount, Tax Amount | กล่องกรอง Choose Date, Store, Supplier/Customer, Payment Method, Export PDF/Excel/Print)

- [x] **32. Profit / Loss Report**
  - **Route**: `/reports/profit-loss`
  - **Backend**: `GET /api/reports/profit-loss`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (กล่องกรอง Date Range, ปุ่ม Generate Report | ตารางเปรียบเทียบ 6 เดือน Jan 2026 - Jun 2026 แยก 2 หมวด: Income [Sales, Service, Purchase Return, Gross Profit] และ Expenses [Sales, Purrchase, Sales Return, Total Expense, Net Profit])

- [x] **33. Annual Report**
  - **Route**: `/reports/annual`
  - **Backend**: `GET /api/reports/annual`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (กล่องกรอง Date [2026], Store [All Stores], ปุ่ม Generate Report | ตารางรายงานประจำปีแยก 12 เดือน January - December เทียบ Jan 2026, Feb 2026, Mar 2026, Apr 2026 พร้อมแถวสรุปผลรวม Total $8,000)

---

## 👤 กลุ่มที่ 7: การจัดการผู้ใช้งานและสิทธิ์ (User Management)

- [x] **34. Users List (จัดการผู้ใช้งาน)**
  - **Route**: `/users`
  - **Backend**: `GET/POST/PUT/DELETE /api/users`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางจัดการผู้ใช้งาน: Checkbox, User Name + Avatar รูปโปรไฟล์, เบอร์โทร Phone, อีเมล Email, บทบาท Role, สถานะ Active/Inactive, Action ดูโปรไฟล์/แก้ไข/ลบ, Export PDF/Excel, Search, Filter สถานะ, Modal เพิ่มผู้ใช้ Add User, Modal แก้ไข Edit User, Modal ดูโปรไฟล์ View Profile, Modal ลบ Delete User)

- [x] **35. Roles & Permissions (จัดการบทบาทและกำหนดสิทธิ์)**
  - **Route**: `/roles-permissions`
  - **Backend**: `GET/POST/PUT/DELETE /api/roles`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางจัดการบทบาท: Checkbox, Role Name, Created Date, Status Active/Inactive, Action ปุ่มโล่จัดการสิทธิ์ Permission Matrix Dialog / ปุ่มแก้ไข / ปุ่มลบ, Modal เพิ่ม Add Role, Modal แก้ไข Edit Role, Modal จัดการสิทธิ์กำหนด All/View/Create/Edit/Delete แยกตามโมดูลอย่างละเอียด, Export PDF/Excel, Search, Filter สถานะ)

- [x] **36. Delete Account Request (คำขอลบบัญชี)**
  - **Route**: `/delete-account-requests`
  - **Backend**: `GET/POST/DELETE /api/delete-account-requests`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (ตารางคำขอลบบัญชี: Checkbox, User Name + Avatar, วันที่ส่งคำขอ Requisition Date, วันที่ขอลบ Delete Request Date, Action ปุ่มลบ Trash, Modal ยืนยันการลบบัญชี, Search, Export PDF/Excel/Print, Pagination)

---

## ⚙️ กลุ่มที่ 8: การตั้งค่า (Settings)

- [x] **37. General Settings (4 Sub Menus: Profile, Security, Notifications, Connected Apps)**
  - **Route**: `/settings/profile`, `/settings/security`, `/settings/notifications`, `/settings/connected-apps`
  - **Backend**: `GET/PUT /api/settings/profile`, `GET/PUT /api/settings/security`, `GET/PUT /api/settings/notifications`, `GET/PUT /api/settings/connected-apps`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (Left Sidebar การตั้งค่าแบ่งหมวด General Settings, Website Settings, App Settings, System Settings, Financial Settings, Other Settings | 1. **Profile**: อัปโหลดรูปโปรไฟล์, Basic Info: First/Last Name, User Name, Phone, Email, Address Info: Address, Country, State, City, Postal Code, ปุ่ม Cancel/Save Changes | 2. **Security**: Password [Change Password], Two-Factor Auth [Toggle], Google Auth [Connected Badge & Toggle], Phone/Email Verification [Verified Check, ปุ่ม Change/Remove], Device Management, Account Activity, Deactivate Account, Delete Account | 3. **Notifications**: สวิตช์เปิดปิด Mobile Push, Desktop, Email, MSMS Notifications, ตารางช่องทางแจ้งเตือน Matrix: Payment, Transaction, Email Verification, OTP, Activity, Account | 4. **Connected Apps**: การ์ดเชื่อมต่อ 6 แอป Calendar [Google 31], Figma, Dropbox, Slack, Github, Gmail พร้อม Badge Connected และ Switch เปิดปิด)

- [x] **38. Website Settings (8 Sub Menus: System Settings, Company Settings, Localization, Prefixes, Preference, Appearance, Social Authentication, Language)**
  - **Route**: `/settings/system`, `/settings/company`, `/settings/localization`, `/settings/prefixes`, `/settings/preference`, `/settings/appearance`, `/settings/social-auth`, `/settings/language`
  - **Backend**: `GET/PUT /api/settings`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (1. **System Settings**: การ์ดเชื่อมต่อ 4 รายการ Google Captcha, Google Analytics, Google Adsense, Google Map พร้อมปุ่ม View Integration และ Switch Toggle | 2. **Company Settings**: Company Info [Name, Email, Phone, Fax, Website], Company Images [Icon, Favicon, Logo, Dark Logo] พร้อมปุ่ม Upload และพรีวิว, Address Info [Address, Country, State, City, Postal Code] | 3. **Localization**: Basic Info [Language, Language Switcher, Timezone, Date Format, Time Format, Financial Year, Starting Month], Currency Settings [Currency, Symbol, Position, Decimal/Thousand Separators], Country Restrictions, File Settings [Allowed File Types, Max File Size] | 4. **Prefixes**: ช่องกรอก 15 คำนำหน้า [SKU, SUP, PU, PR, SA, SR, CT, EX, ST, SA, SO, PINV, EST, TRN, EMP] | 5. **Preference**: สวิตช์เปิดปิดฟีเจอร์ระบบ 11 รายการ [Maintenance Mode, Coupon, Offers, MultiLanguage, Multicurrency, SMS, Stores, Warehouses, Barcode, QR Code, HRMS] | 6. **Appearance**: ธีมเว็บไซต์ Light/Dark/Auto พร้อมภาพม็อคอัพ, สี Accent [Orange, Purple, Blue, Brown], Expand Sidebar Switch, Sidebar Size [Small 85px/Medium/Large], Font Family [Nunito, Inter, Prompt, Poppins] | 7. **Social Authentication**: การ์ดเข้าสู่ระบบด้วยโซเชียล [Facebook, Twitter, LinkedIn, Google] พร้อม Badge Connected/Not Connected และปุ่ม View Integration/Connect Now | 8. **Language**: ตารางจัดการภาษาเฉพาะ **English (en)** และ **ไทย (th)** พร้อม Flag, RTL, Default, Total, Done, Progress %, Status Toggle, ค้นหา, Dropdown เลือกภาษา, ปุ่ม Add Translation, ปุ่ม Import Sample)

- [x] **39. App Settings (6 Sub Menus: Invoice Settings, Invoice Templates, Printer, POS, Signatures, Custom Fields)**
  - **Route**: `/settings/invoice-settings`, `/settings/invoice-templates`, `/settings/printer`, `/settings/pos-settings`, `/settings/signatures`, `/settings/custom-fields`
  - **Backend**: `GET/PUT /api/settings`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (1. **Invoice Settings**: อัปโหลดโลโก้ใบแจ้งหนี้, คำนำหน้า Invoice Prefix [INV -], กำหนดวันชำระ Invoice Due [5 Days], สวิตช์เปิดปิด Round Off [Round Off Up], สวิตช์แสดงข้อมูลบริษัท Show Company Details, ช่องข้อความ Invoice Header Terms / Footer Terms | 2. **Invoice Templates**: แท็บสลับหมวด Invoices, Purchases, Receipts พร้อมการ์ดแสดงเทมเพลตตัวอย่าง General Invoice 1-5 และปุ่มติดดาว Bookmark | 3. **Printer**: ตารางเครื่องพิมพ์ [HP Printer, Epson], ประเภทการเชื่อมต่อ Connection Type, IP Address, Port, ปุ่ม Add New Printer, ปุ่มแก้ไข/ลบ | 4. **POS Settings**: ตัวเลือก POS Printer, ตัวเลือกช่องทางชำระเงิน Checkboxes [COD, Cheque, Card, Paypal, Bank Transfer, Cash], สวิตช์เปิดปิดเสียง Enable Sound Effect | 5. **Signatures**: ตารางลายเซ็น [Allen, Raymond, Ralph, Steven], ตัวอย่างลายเซ็นกราฟิก, ป้ายสถานะ Active, ปุ่มกำหนดค่าเริ่มต้น Star, ปุ่ม Add Signature, ปุ่มแก้ไข/ลบ | 6. **Custom Fields**: ตารางจัดการฟิลด์กำหนดเองตามโมดูล Products, Customers, Orders, Suppliers พร้อมประเภทฟิลด์, ช่อง Required, สวิตช์เปิดปิด Status, ปุ่ม Add Custom Field, ปุ่มแก้ไข/ลบ)

- [x] **40. System Settings (3 Sub Menus: Email, SMS Gateway, OTP)**
  - **Route**: `/settings/email`, `/settings/sms`, `/settings/otp`
  - **Backend**: `GET/PUT /api/settings`
  - **สถานะ**: ✅ สร้างโครงสร้างเมนูและหน้าเพจพร้อมรองรับเรียบร้อย (1. **Email Settings**: เมนูตั้งค่าอีเมล SMTP / PHP Mailer / SendGrid | 2. **SMS Gateway**: เมนูตั้งค่า SMS Gateway Twilio / Nexmo / ThaiSMS | 3. **OTP Settings**: เมนูตั้งค่าระบบยืนยันรหัส OTP และความยาวรหัส/เวลาหมดอายุ)

- [x] **41. Financial Settings (4 Sub Menus: Payment Gateway, Bank Accounts, Tax Rates, Currencies)**
  - **Route**: `/settings/payment-gateway`, `/settings/bank-accounts`, `/settings/tax-rates`, `/settings/currencies`
  - **Backend**: `GET/PUT /api/settings`
  - **สถานะ**: ✅ เสร็จสมบูรณ์ (1. **Payment Gateway**: โครงสร้างหน้าสำหรับเชื่อมต่อ Stripe / PayPal / 2C2P / Omise | 2. **Bank Accounts**: โครงสร้างหน้าสำหรับจัดการบัญชีธนาคารบริษัท | 3. **Tax Rates**: ตารางจัดการอัตราภาษี VAT 10%, CGST 8%, SGST 10%, ปุ่ม Add New Tax Rate, ปุ่มแก้ไข/ลบ | 4. **Currencies**: ตารางจัดการสกุลเงินเฉพาะ **Thai Baht (THB ฿)** และ **US Dollar (USD $)**, Exchange Rate, Created On, ปุ่ม Add New Currency, ปุ่มแก้ไข/ลบ)

- [ ] **42. Other Settings / System Settings Additional**
  - **Route**: `/settings/others`
  - **Backend**: `GET/PUT /api/settings`
  - **สิ่งที่ต้องการ**: การตั้งค่าอื่นๆ เพิ่มเติม
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*
