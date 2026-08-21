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

## 📊 กลุ่มที่ 5: รายงานและการตั้งค่า (Reports & Settings)

- [ ] **22. Sales & Profit/Loss Report**
  - **Route**: `/reports/sales`, `/reports/profit-loss`
  - **Backend**: `GET /api/reports/sales-summary`
  - **สิ่งที่ต้องการ**: รายงานยอดขายและกำไรขั้นต้น แยกตามวัน/เดือน/ปี/พนักงาน
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **23. Inventory & Product Report**
  - **Route**: `/reports/inventory`, `/reports/products`
  - **Backend**: `GET /api/reports/inventory-summary`
  - **สิ่งที่ต้องการ**: รายงานมูลค่าสต็อกคงเหลือ และสินค้าขายดี/หมุนเวียนช้า
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **24. Store Settings & Tax**
  - **Route**: `/settings`, `/settings/tax`
  - **Backend**: `GET/PUT /api/settings`
  - **สิ่งที่ต้องการ**: ตั้งค่าข้อมูลร้านค้า, หัวบิลใบเสร็จ, อัตราภาษี VAT
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*
