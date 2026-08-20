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

- [ ] **6. Brands & Units**
  - **Route**: `/brands`, `/units`
  - **Backend**: `GET/POST/PUT/DELETE /api/brands`, `/api/units`
  - **สิ่งที่ต้องการ**: ตารางจัดการแบรนด์สินค้า และหน่วยนับ (Pcs, Box, Kg, Set)
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **7. Print Barcode & QR Code**
  - **Route**: `/barcode/print`, `/qrcode/print`
  - **Backend**: Barcode generator logic
  - **สิ่งที่ต้องการ**: หน้าเลือกสินค้า, กำหนดจำนวนแถว/สติ๊กเกอร์ และสั่งพิมพ์บาร์โค้ด
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **8. Expired & Low Stock Products**
  - **Route**: `/inventory/expired`, `/inventory/low-stock`
  - **Backend**: `GET /api/products?lowStock=true`
  - **สิ่งที่ต้องการ**: ตารางแจ้งเตือนสินค้าใกล้หมดอายุ และสินค้าต่ำกว่าจุดสั่งซื้อ
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

---

## 📦 กลุ่มที่ 2: การจัดการคลังและสต็อก (Stock Management)

- [ ] **9. Manage Stock**
  - **Route**: `/stock/manage`
  - **Backend**: `GET /api/stock`
  - **สิ่งที่ต้องการ**: ตารางตรวจนับสินค้าคงคลังแยกตามสาขาและคลัง
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **10. Stock Adjustment**
  - **Route**: `/stock/adjustment`
  - **Backend**: `POST /api/stock/adjustments`
  - **สิ่งที่ต้องการ**: ฟอร์มปรับปรุงสต็อก (บวกเพิ่ม/ลดสต็อก กรณีชำรุด/สูญหาย)
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

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

- [ ] **18. Customers List**
  - **Route**: `/customers`
  - **Backend**: `GET/POST/PUT/DELETE /api/customers`
  - **สิ่งที่ต้องการ**: ตารางลูกค้า, เบอร์โทร, แต้มสะสม, ยอดซื้อสะสม
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **19. Suppliers List**
  - **Route**: `/suppliers`
  - **Backend**: `GET/POST/PUT/DELETE /api/suppliers`
  - **สิ่งที่ต้องการ**: รายชื่อคู่ค้า/ซัพพลายเออร์, ข้อมูลติดต่อ, เครดิตเทอม
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

- [ ] **20. Stores & Warehouses**
  - **Route**: `/stores`, `/warehouses`
  - **Backend**: `GET/POST /api/stores`, `/api/warehouses`
  - **สิ่งที่ต้องการ**: หน้าจัดการสาขา และคลังสินค้า
  - **สถานะ**: ⏳ *รอภาพแคปเจอร์*

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
