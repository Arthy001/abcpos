# 📋 ABCPOS — Feature Implementation Plan (แผนพัฒนาฟีเจอร์เพิ่มเติม)

> เอกสารฉบับนี้สรุปรายละเอียดฟีเจอร์ทั้งหมดที่ต้องพัฒนาเพิ่มเติม จัดลำดับตามความสำคัญ  
> อ้างอิงจากการวิเคราะห์ codebase จริงของระบบ ABCPOS ทั้ง Frontend และ Backend  
> **กลุ่มเป้าหมาย**: ร้านค้าปลีก-ค้าส่งขนาดกลางในประเทศไทย (Thai Retail & Wholesale SME)

---

## 📑 สารบัญ

- [Phase 1 🔴 High Priority](#phase-1--high-priority)
  - [1.1 Hold & Resume Bills (ระบบพักบิล)](#11-hold--resume-bills-ระบบพักบิล)
  - [1.2 Stock Reservation (ระบบจองสต็อก)](#12-stock-reservation-ระบบจองสต็อก)
  - [1.3 Serial Number Tracking (ระบบติดตามซีเรียล)](#13-serial-number-tracking-ระบบติดตามซีเรียลนัมเบอร์)
- [Phase 2 🟠 Medium Priority](#phase-2--medium-priority)
  - [2.1 Costing Methods (ระบบคำนวณต้นทุนสินค้า)](#21-costing-methods-ระบบคำนวณต้นทุนสินค้า)
  - [2.2 GRN — Goods Receipt Note (ใบตรวจรับสินค้า)](#22-grn--goods-receipt-note-ใบตรวจรับสินค้า)
  - [2.3 Cycle Count / Stock Take (ระบบนับสต็อกประจำงวด)](#23-cycle-count--stock-take-ระบบนับสต็อกประจำงวด)
- [Phase 3 🟡 Low Priority](#phase-3--low-priority)
- [Phase 4 ⚪ ไม่แนะนำทำเอง](#phase-4--ไม่แนะนำทำเอง)
- [Appendix: Database Change Summary](#appendix-database-change-summary)

---

# Phase 1 🔴 High Priority

---

## 1.1 Hold & Resume Bills (ระบบพักบิล)

### 📌 สถานะปัจจุบันใน Codebase

> [!IMPORTANT]
> ฟีเจอร์นี้ **มีอยู่แล้วบางส่วน** ในหน้า POS (`frontend/src/app/pos/page.tsx` บรรทัด 704-740)  
> แต่ทำงานแบบ **Client-side เท่านั้น** (เก็บใน React `useState`) — **ถ้ารีเฟรชหน้าจอ บิลที่พักไว้จะหายทั้งหมด**

**โค้ดปัจจุบันที่มี:**
- Interface `HeldOrder` มีฟิลด์: `id, orderRef, items (PosCartItem[]), customer, timestamp, subtotal, tax, discount, shipping, coupon, appliedCoupon`
- ฟังก์ชัน `holdCurrentOrder()`: สร้าง `HeldOrder` object ด้วย ID = `HOLD-{timestamp}` และ Ref = `#HLD{random}` แล้วเก็บใน state array
- ฟังก์ชัน `resumeOrder()`: ดึงข้อมูลจาก `heldOrders` กลับมาใส่ในตะกร้า
- **ยังไม่มี**: การบันทึกลง DB, API endpoint, Prisma model

### 🎯 เป้าหมาย
พักบิลแล้วไม่หายเมื่อรีเฟรชหน้า / เปลี่ยนแคชเชียร์ / ปิดเปิดเบราว์เซอร์ และรองรับหลายเครื่องเห็นบิลพักร่วมกัน

### 🗄️ Database — Prisma Model ใหม่

```prisma
model PosHeldOrder {
  id              String   @id @default(uuid())
  orderRef        String   @unique        // e.g. "#HLD001"
  shiftId         String?                 // ผูกกับกะที่พักบิล
  shift           PosShift? @relation(fields: [shiftId], references: [id])
  cashierName     String                  // ชื่อแคชเชียร์ที่พัก
  customerId      String?                 // ลูกค้าที่ผูกไว้ (ถ้ามี)
  customerName    String?
  cartData        String                  // JSON string ของ PosCartItem[]
  subtotal        Float    @default(0)
  tax             Float    @default(0)
  discount        Float    @default(0)
  shipping        Float    @default(0)
  couponCode      String?                 // โค้ดคูปองที่ใช้อยู่
  notes           String?                 // หมายเหตุ
  status          String   @default("HELD")  // HELD, RESUMED, EXPIRED
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

> [!NOTE]
> ใช้ `cartData` เป็น JSON string เก็บรายการสินค้าทั้งหมด แทนการสร้างตาราง `PosHeldOrderItem` แยก  
> เหตุผล: บิลที่พักไว้ยังไม่ใช่ Order จริง ไม่ต้องการ query แยกรายรายการ เมื่อ Resume กลับมาก็ parse JSON กลับเป็น cart items ได้เลย

### 🔌 API Endpoints ใหม่

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/api/pos/hold-orders` | สร้างบิลพักใหม่ (บันทึกตะกร้าปัจจุบันลง DB) |
| `GET` | `/api/pos/hold-orders` | ดึงรายการบิลพักทั้งหมดที่ยัง status = HELD |
| `GET` | `/api/pos/hold-orders/:id` | ดึงรายละเอียดบิลพักชิ้นเดียว |
| `PUT` | `/api/pos/hold-orders/:id/resume` | เรียกบิลพักกลับมา (เปลี่ยน status → RESUMED) |
| `DELETE` | `/api/pos/hold-orders/:id` | ยกเลิก/ลบบิลพักที่ไม่ต้องการ |

### 🖥️ Frontend — การแก้ไขหน้า POS

**ไฟล์ที่ต้องแก้**: `frontend/src/app/pos/page.tsx`

**เปลี่ยนแปลง:**
1. **ฟังก์ชัน `holdCurrentOrder()`**: เปลี่ยนจากเก็บ useState → เรียก `POST /api/pos/hold-orders`
2. **ฟังก์ชัน `resumeOrder()`**: เปลี่ยนจากอ่าน useState → เรียก `PUT /api/pos/hold-orders/:id/resume`
3. **โหลดรายการบิลพัก**: เรียก `GET /api/pos/hold-orders` ตอนเปิดหน้า POS (แทนที่จะอ่านจาก state ว่างๆ)
4. **แสดง Badge จำนวนบิลพัก**: บน icon ปุ่ม Held Orders ให้แสดงตัวเลข (เช่น "3")
5. **เพิ่มปุ่มลบบิลพัก**: ในรายการ Held Orders List ให้มีปุ่ม `X` สำหรับยกเลิกบิลพัก

**ไฟล์ใหม่ที่ต้องสร้าง:**
- `frontend/src/lib/api/pos-hold.ts` — API client functions
- `backend/src/controllers/pos-hold.controller.ts` — Controller logic

### ⚡ ผลกระทบต่อระบบเดิม

| ส่วนที่ | ผลกระทบ |
|---------|---------|
| ตาราง DB เดิม | ❌ ไม่แก้ไข (เพิ่ม Model ใหม่เท่านั้น) |
| Stock / สต็อก | ❌ ไม่กระทบ (บิลพักไม่ตัดสต็อก) |
| Order Flow เดิม | ❌ ไม่กระทบ (ยังคง flow ชำระเงินเดิม 100%) |
| หน้า POS | ✅ แก้ไขแค่ 2 ฟังก์ชัน (hold/resume) |

---

## 1.2 Stock Reservation (ระบบจองสต็อก)

### 📌 สถานะปัจจุบันใน Codebase

> [!IMPORTANT]
> **มีฟิลด์ `reservedQuantity` อยู่แล้วในตาราง `ProductStock`** (schema.prisma บรรทัด 1121-1136)  
> แต่ **ไม่มีโค้ดใดๆ ในระบบที่ใช้งานฟิลด์นี้เลย** — ค่าเป็น 0 ตลอด

**โค้ดปัจจุบัน:**
```prisma
model ProductStock {
  id               String    @id @default(uuid())
  productId        String
  warehouseId      String
  quantity         Int       @default(0)
  reservedQuantity Int       @default(0)    // ← มีอยู่แล้ว! แต่ไม่ได้ใช้
  minAlert         Int       @default(5)
  // ...
  @@unique([productId, warehouseId])
}
```

**พฤติกรรมปัจจุบัน:**
- B2B Sales Order สถานะ `CONFIRMED` → **ไม่ตัดสต็อกใดๆ ไม่จองสต็อก**
- B2B Sales Order สถานะ `COMPLETED` → **ตัดสต็อกจริงทีเดียว** ผ่าน `recordStockMovement()` type `SALE_ISSUE`
- หน้า POS ตรวจสอบ `product.stock < item.quantity` → ไม่ได้เช็ค reserved
- **ช่องโหว่**: ระหว่าง CONFIRMED กับ COMPLETED → POS หน้าร้านอาจขายสินค้าชิ้นเดียวกันจนหมด

### 🎯 เป้าหมาย
ทำเป็น **Toggle เปิด/ปิดใน Settings** — เมื่อเปิด ระบบจะจองสต็อกอัตโนมัติเมื่อสร้าง B2B Sales Order สถานะ CONFIRMED

### 🗄️ Database — การแก้ไข

**1. เพิ่มฟิลด์ใน `PreferenceSettings`:**
```prisma
model PreferenceSettings {
  // ... ฟิลด์เดิมทั้งหมดยังอยู่ ...
  enableStockReservation  Boolean @default(false)  // ← เพิ่มใหม่
}
```

**2. ตาราง `ProductStock` — ไม่ต้องแก้** เพราะมี `reservedQuantity` อยู่แล้ว

**3. เพิ่ม Model ใหม่เพื่อบันทึกประวัติการจอง:**
```prisma
model StockReservation {
  id              String   @id @default(uuid())
  productId       String
  warehouseId     String?
  quantity        Int                                  // จำนวนที่จอง
  sourceType      String                               // SALES_ORDER, WORK_ORDER (อนาคต)
  sourceId        String                               // ID ของ SalesOrder หรือ WorkOrder
  sourceRef       String                               // เลขที่อ้างอิง e.g. "SO-2026-0001"
  status          String   @default("ACTIVE")          // ACTIVE, RELEASED, CANCELLED
  reservedBy      String?                              // ชื่อผู้จอง
  reservedAt      DateTime @default(now())
  releasedAt      DateTime?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 🔌 API — การแก้ไข (ไม่เพิ่ม endpoint ใหม่)

**ไฟล์ที่ต้องแก้**: `backend/src/controllers/b2b.controller.ts`

**แก้ไขฟังก์ชัน `createSalesOrder()` (บรรทัด ~184-343):**
```
เมื่อสร้าง Sales Order สถานะ CONFIRMED:
1. ตรวจสอบ settings.enableStockReservation
2. ถ้าเปิด → สำหรับแต่ละ item:
   a. เช็ค availableQty = ProductStock.quantity - ProductStock.reservedQuantity
   b. ถ้า availableQty < orderQty → Reject พร้อม Error "สต็อกไม่เพียงพอสำหรับจอง"
   c. ถ้าพอ → เพิ่ม ProductStock.reservedQuantity += orderQty
   d. สร้าง StockReservation record (status: ACTIVE)
3. ถ้าปิด → ทำงานเหมือนเดิมทุกประการ (ไม่มีอะไรเปลี่ยน)
```

**แก้ไขฟังก์ชัน `updateSalesOrderStatus()` (บรรทัด ~345+):**
```
เมื่อเปลี่ยนสถานะเป็น COMPLETED:
  → ลด ProductStock.reservedQuantity -= orderQty
  → ตัดสต็อกจริง ProductStock.quantity -= orderQty (เหมือนเดิม)
  → อัปเดต StockReservation status → RELEASED

เมื่อเปลี่ยนสถานะเป็น CANCELLED:
  → ลด ProductStock.reservedQuantity -= orderQty
  → ไม่ตัดสต็อกจริง (เหมือนเดิม)
  → อัปเดต StockReservation status → CANCELLED
```

**แก้ไขหน้า POS** (`pos/page.tsx`):
```
ตรงที่เช็คสต็อก เปลี่ยนจาก:
  product.stock < item.quantity
เป็น:
  (product.stock - product.reservedStock) < item.quantity
```

### 🖥️ Frontend — การแก้ไข

| ไฟล์ | การแก้ไข |
|------|---------|
| `settings/preference/page.tsx` | เพิ่ม Toggle Switch "Enable Stock Reservation" |
| `app/pos/page.tsx` | เปลี่ยนเงื่อนไขเช็คสต็อก (1 บรรทัด) |
| `app/b2b/orders/page.tsx` | แสดงคอลัมน์ "Reserved" (ถ้าเปิดฟีเจอร์) |
| `app/products/page.tsx` (Optional) | แสดง Available Qty vs On-Hand Qty |

### ⚡ ผลกระทบต่อระบบเดิม

| ส่วนที่ | ผลกระทบ |
|---------|---------|
| ตาราง `ProductStock` | ❌ ไม่แก้โครงสร้าง (ใช้ฟิลด์ `reservedQuantity` ที่มีอยู่แล้ว) |
| ตาราง `PreferenceSettings` | ✅ เพิ่ม 1 ฟิลด์ Boolean (ค่าเริ่มต้น false ไม่กระทบข้อมูลเดิม) |
| POS Flow เดิม | ✅ แก้เงื่อนไขเช็คสต็อก 1 จุด |
| B2B Controller | ✅ เพิ่ม logic จอง/ปลดจอง |
| **เมื่อ Toggle ปิด (ค่าเริ่มต้น)** | **❌ ระบบทำงานเหมือนเดิม 100%** |

---

## 1.3 Serial Number Tracking (ระบบติดตามซีเรียลนัมเบอร์)

### 📌 สถานะปัจจุบันใน Codebase
**ไม่มีฟีเจอร์นี้เลยในระบบปัจจุบัน** — ไม่มี model, ไม่มี field, ไม่มี UI

### 🎯 เป้าหมาย
ทำเป็น **เปิด/ปิดรายสินค้า** (เหมือน SAP / Odoo / ERPNext) — สินค้าที่ไม่ต้องการ Serial จะไม่ได้รับผลกระทบใดๆ

### 🗄️ Database — Prisma Model ใหม่ + แก้ไขเล็กน้อย

**1. เพิ่มฟิลด์ในตาราง `Product`:**
```prisma
model Product {
  // ... ฟิลด์เดิมทั้งหมดยังอยู่ ...
  trackingType    String   @default("NONE")  // NONE, SERIAL, BATCH
  serialNumbers   ProductSerialNumber[]       // relation ใหม่
}
```

> [!NOTE]
> ใช้ `trackingType` แทน `hasSerialNumber` boolean เพื่อรองรับอนาคต:  
> - `NONE` = สินค้าทั่วไป (ค่าเริ่มต้น — ไม่กระทบสินค้าเดิมทั้งหมด)  
> - `SERIAL` = ติดตามรายชิ้นด้วย Serial Number  
> - `BATCH` = ติดตามราย Lot/Batch (อนาคต — ปรับปรุงจาก ProductExpiryBatch เดิม)

**2. สร้างตารางใหม่ `ProductSerialNumber`:**
```prisma
model ProductSerialNumber {
  id              String    @id @default(uuid())
  serialNo        String    @unique           // หมายเลข S/N (ไม่ซ้ำกันทั้งระบบ)
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  warehouseId     String?
  status          String    @default("AVAILABLE")
                  // AVAILABLE    = พร้อมขาย อยู่ในคลัง
                  // RESERVED     = ถูกจอง (อนาคต ผูกกับ Stock Reservation)
                  // SOLD         = ขายออกไปแล้ว
                  // DEFECTIVE    = ชำรุด / เสีย
                  // IN_WARRANTY  = อยู่ระหว่างเคลมประกัน
                  // RETURNED     = ลูกค้าส่งคืน
  // --- Traceability (ตรวจสอบย้อนกลับ) ---
  purchaseRef     String?                     // เลขที่ใบสั่งซื้อที่รับเข้า
  purchaseDate    DateTime?                   // วันที่รับเข้าคลัง
  saleRef         String?                     // เลขที่ใบขายที่ขายออก
  saleDate        DateTime?                   // วันที่ขายออก
  customerId      String?                     // ลูกค้าที่ซื้อไป (สำหรับเคลมประกัน)
  customerName    String?
  warrantyExpiry  DateTime?                   // วันหมดประกันของชิ้นนี้
  // ---
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### 🔌 API Endpoints ใหม่

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `GET` | `/api/products/:id/serial-numbers` | ดูรายการ S/N ทั้งหมดของสินค้า |
| `POST` | `/api/products/:id/serial-numbers` | เพิ่ม S/N ทีละตัว หรือ Bulk Import |
| `PUT` | `/api/serial-numbers/:id` | แก้ไขสถานะ / ข้อมูล S/N |
| `GET` | `/api/serial-numbers/lookup?sn=XXX` | ค้นหา S/N (ใช้ตอนสแกนหน้า POS) |
| `GET` | `/api/serial-numbers/warranty-check?sn=XXX` | เช็คสถานะประกัน |

### 🖥️ Frontend — การแก้ไข

**ไฟล์ที่ต้องแก้:**

| ไฟล์ | การแก้ไข |
|------|---------|
| `products/add/page.tsx` | เพิ่มตัวเลือก "Tracking Type" (None / Serial Number) ในฟอร์มเพิ่มสินค้า |
| `products/edit/[id]/page.tsx` | เพิ่มตัวเลือก "Tracking Type" + แท็บแสดง S/N List |
| `app/pos/page.tsx` | เมื่อสแกนสินค้าที่ `trackingType == "SERIAL"` → แสดง Modal ให้สแกน/กรอก S/N |

**ไฟล์ใหม่:**
| ไฟล์ | คำอธิบาย |
|------|---------|
| `backend/src/controllers/serial.controller.ts` | Controller จัดการ S/N |
| `frontend/src/lib/api/serial.ts` | API client functions |

**การทำงานของ POS เมื่อเจอสินค้า Serialized:**
```
1. แคชเชียร์สแกนบาร์โค้ดสินค้า
2. ระบบตรวจสอบ product.trackingType
3. ถ้า "NONE" → เพิ่มเข้าตะกร้าตามปกติ (เหมือนเดิม 100%)
4. ถ้า "SERIAL" → แสดง Modal:
   ┌──────────────────────────────────────┐
   │  🔢 Scan Serial Number              │
   │  ┌────────────────────────────┐      │
   │  │ สแกนหรือกรอก S/N...        │      │
   │  └────────────────────────────┘      │
   │  Product: iPhone 16 Pro Max          │
   │  SKU: IP16PM-256                     │
   │                                      │
   │  [Cancel]              [Confirm]     │
   └──────────────────────────────────────┘
5. ระบบเรียก GET /api/serial-numbers/lookup?sn=XXX
6. ตรวจสอบ: S/N ตรงกับ Product? สถานะ AVAILABLE?
7. ถ้า Valid → เพิ่มเข้าตะกร้าพร้อมแนบ serialNumberId
8. เมื่อชำระเงิน → อัปเดต S/N status → SOLD + ผูก saleRef, customerId
```

### ⚡ ผลกระทบต่อระบบเดิม

| ส่วนที่ | ผลกระทบ |
|---------|---------|
| ตาราง `Product` | ✅ เพิ่ม 1 ฟิลด์ `trackingType @default("NONE")` — สินค้าเดิมทั้งหมดจะเป็น "NONE" อัตโนมัติ |
| POS Flow เดิม | ✅ เพิ่มเงื่อนไข if สินค้า SERIAL → แสดง Modal (สินค้าปกติไม่กระทบ) |
| Order/Sale Flow | ✅ ถ้ามี S/N → บันทึกเพิ่ม (ถ้าไม่มีทำงานเหมือนเดิม) |
| Purchase Flow | ✅ ถ้ารับของที่มี S/N → ให้กรอก S/N ตอน Receive (Optional) |
| **สินค้าเดิมที่มีอยู่แล้ว** | **❌ ไม่ได้รับผลกระทบใดๆ เลย** |

---

# Phase 2 🟠 Medium Priority

---

## 2.1 Costing Methods (ระบบคำนวณต้นทุนสินค้า)

### 📌 สถานะปัจจุบันใน Codebase
- ตาราง `Product` มีฟิลด์ `costPrice` เก็บต้นทุนคงที่ (Fixed Cost) ค่าเดียว
- Manufacturing BOM คำนวณ `totalCost = materialsSubtotal + laborCost + overheadCost` แล้วอัปเดต `product.costPrice = totalCost / outputQty`
- **ไม่มี**: การคำนวณต้นทุนเฉลี่ยเคลื่อนที่ (Moving Average), FIFO, ต้นทุนมาตรฐาน (Standard Cost) เทียบต้นทุนจริง (Actual Cost)
- เมื่อสั่งซื้อเข้า (`Purchase`) หลายครั้งหลายราคา → `costPrice` ไม่ถูกอัปเดต ทำให้ Gross Profit ไม่แม่นยำ

### 🎯 เป้าหมาย
เพิ่มการคำนวณต้นทุนอัตโนมัติเมื่อมีการรับสินค้าเข้า (Purchase Receive) โดยให้เลือกวิธีคำนวณได้

### 🗄️ Database — การแก้ไข

**1. เพิ่มฟิลด์ใน `CompanySettings` หรือ `PreferenceSettings`:**
```prisma
costingMethod   String   @default("MOVING_AVERAGE")  // MOVING_AVERAGE, FIFO, MANUAL
```

**2. เพิ่มฟิลด์ใน `Product` (Optional):**
```prisma
model Product {
  // ... ฟิลด์เดิม ...
  lastPurchaseCost  Float?   // ต้นทุนซื้อเข้าครั้งล่าสุด
  averageCost       Float?   // ต้นทุนเฉลี่ยถ่วงน้ำหนัก (Moving Average)
}
```

### 📐 สูตรคำนวณ

**Moving Average (ต้นทุนเฉลี่ยเคลื่อนที่):**
```
เมื่อรับสินค้าเข้า (Purchase Receive):

averageCost ใหม่ = (สต็อกเดิม × averageCost เดิม + จำนวนรับใหม่ × ราคาซื้อใหม่)
                   ÷ (สต็อกเดิม + จำนวนรับใหม่)

ตัวอย่าง:
  สต็อกเดิม 100 ชิ้น @ ต้นทุน 50 บาท → มูลค่ารวม 5,000 บาท
  ซื้อเข้าใหม่ 50 ชิ้น @ ต้นทุน 60 บาท → มูลค่ารวม 3,000 บาท
  averageCost ใหม่ = (5,000 + 3,000) ÷ (100 + 50) = 53.33 บาท/ชิ้น
```

### 🔌 API — การแก้ไข

**ไฟล์ที่ต้องแก้**: `backend/src/controllers/purchase.controller.ts`

**แก้ไขฟังก์ชัน `createPurchase()` — ตรงจุดที่ status = RECEIVED:**
```
หลังจาก recordStockMovement() เสร็จ:
1. อ่านค่า settings.costingMethod
2. ถ้า MOVING_AVERAGE → คำนวณ averageCost ใหม่ แล้วอัปเดต product.costPrice + product.averageCost
3. ถ้า MANUAL → ไม่ทำอะไร (ให้ผู้ใช้แก้ costPrice เอง)
4. อัปเดต product.lastPurchaseCost = unitCost จากใบ PO
```

### ⚡ ผลกระทบต่อระบบเดิม

| ส่วนที่ | ผลกระทบ |
|---------|---------|
| ตาราง `Product` | ✅ เพิ่ม 2 ฟิลด์ optional (ไม่กระทบข้อมูลเดิม) |
| Purchase Flow | ✅ เพิ่ม logic คำนวณต้นทุนหลังรับของ |
| รายงาน Profit/Loss | ✅ จะแม่นยำขึ้นเพราะใช้ต้นทุนเฉลี่ย |
| ราคาขายสินค้า | ❌ ไม่กระทบ (ราคาขายกำหนดแยกจากต้นทุน) |

---

## 2.2 GRN — Goods Receipt Note (ใบตรวจรับสินค้า)

### 📌 สถานะปัจจุบันใน Codebase
- ใบสั่งซื้อ (`Purchase`) มีสถานะ `RECEIVED, PENDING, ORDERED, CANCELLED`
- **เมื่อสร้าง Purchase ที่ status = RECEIVED → ระบบตัดสต็อกเข้าทันทีทั้งหมด 100%**
- ฟิลด์ `receivedQty` มีอยู่ใน `PurchaseItem` แต่ **ไม่ได้ใช้งาน** — ไม่รองรับการรับของบางส่วน (Partial Receiving)
- **ปัญหา**: ในชีวิตจริง Supplier อาจส่งของไม่ครบ / ส่งมาหลายรอบ / ส่งของผิด → ระบบปัจจุบันไม่สามารถบันทึกกรณีเหล่านี้ได้

### 🎯 เป้าหมาย
เพิ่มระบบตรวจรับสินค้าแยกจากใบ PO เพื่อรองรับการรับของบางส่วน (Partial Receiving) และบันทึกสินค้าชำรุด/ไม่ตรงสเปก

### 🗄️ Database — Prisma Model ใหม่

```prisma
model GoodsReceiptNote {
  id              String   @id @default(uuid())
  grnNumber       String   @unique           // e.g. "GRN-2026-0001"
  purchaseId      String                     // ผูกกับใบ PO
  purchase        Purchase @relation(fields: [purchaseId], references: [id])
  warehouseId     String                     // คลังที่รับของเข้า
  receivedDate    DateTime @default(now())   // วันที่ตรวจรับจริง
  receivedBy      String?                    // ผู้ตรวจรับ
  status          String   @default("DRAFT") // DRAFT, CONFIRMED, CANCELLED
  notes           String?                    // หมายเหตุ เช่น "กล่องบุบ 2 ใบ"
  items           GrnItem[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model GrnItem {
  id              String   @id @default(uuid())
  grnId           String
  grn             GoodsReceiptNote @relation(fields: [grnId], references: [id], onDelete: Cascade)
  productId       String
  productName     String
  sku             String?
  orderedQty      Int                        // จำนวนที่สั่ง (จาก PO)
  receivedQty     Int                        // จำนวนที่รับจริง
  rejectedQty     Int      @default(0)       // จำนวนที่ตีกลับ (ชำรุด/ผิดสเปก)
  unitCost        Float                      // ต้นทุนต่อหน่วย
  rejectReason    String?                    // เหตุผลที่ตีกลับ
  notes           String?
  createdAt       DateTime @default(now())
}
```

### 🔌 API Endpoints ใหม่

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/api/grn` | สร้างใบตรวจรับสินค้า (จากใบ PO) |
| `GET` | `/api/grn` | รายการใบตรวจรับทั้งหมด |
| `GET` | `/api/grn/:id` | รายละเอียดใบตรวจรับ |
| `PUT` | `/api/grn/:id/confirm` | ยืนยันการตรวจรับ → ตัดสต็อกเข้าตาม receivedQty |
| `GET` | `/api/purchases/:id/grn-history` | ประวัติการตรวจรับทั้งหมดของ PO ฉบับนั้น |

### 📐 Flow การทำงาน
```
Purchase Order (PO) สถานะ ORDERED
  │
  ├── Supplier ส่งของมา รอบที่ 1 (ได้ 70 จาก 100 ชิ้น)
  │   └── สร้าง GRN-001: receivedQty=70, rejectedQty=2
  │       └── Confirm → ตัดสต็อกเข้า 70 ชิ้น
  │       └── PO status → PARTIAL_RECEIVED (สถานะใหม่)
  │
  ├── Supplier ส่งของมา รอบที่ 2 (ได้อีก 28 ชิ้น)
  │   └── สร้าง GRN-002: receivedQty=28, rejectedQty=0
  │       └── Confirm → ตัดสต็อกเข้า 28 ชิ้น
  │       └── PO status → RECEIVED (ครบแล้ว)
  │
  └── สรุป: สั่ง 100, ได้ 98, ตีกลับ 2
```

**แก้ไขตาราง `Purchase` — เพิ่มสถานะ:**
```
status ปัจจุบัน:  RECEIVED, PENDING, ORDERED, CANCELLED
เพิ่มสถานะใหม่:   PARTIAL_RECEIVED  (รับของบางส่วนแล้ว)
```

### 🖥️ Frontend — หน้าจอใหม่

| หน้าจอ | คำอธิบาย |
|--------|---------|
| `/purchases/[id]/receive` (ใหม่) | หน้าสร้างใบตรวจรับจากใบ PO (แสดงรายการสินค้าจาก PO ให้กรอกจำนวนรับจริง/ตีกลับ) |
| `/purchases` (แก้ไข) | เพิ่มปุ่ม "Receive" ในแต่ละ row ของ PO status ORDERED/PARTIAL_RECEIVED |
| `/grn` (ใหม่ — Optional) | หน้ารวมรายการ GRN ทั้งหมด เพื่อตรวจสอบประวัติ |

### ⚡ ผลกระทบต่อระบบเดิม

| ส่วนที่ | ผลกระทบ |
|---------|---------|
| ตาราง `Purchase` | ✅ เพิ่ม status ใหม่ "PARTIAL_RECEIVED" + relation ไป GRN |
| Purchase Flow เดิม | ✅ เพิ่มเส้นทาง "Receive" แทนการ auto-receive ทั้งหมด |
| สต็อก | ✅ เปลี่ยนจุดตัดสต็อกเข้าจาก "ตอนสร้าง PO" → "ตอน Confirm GRN" |
| Costing | ✅ ทำงานร่วมกับ Moving Average ได้ (คำนวณต้นทุนตอน GRN Confirm) |

> [!WARNING]
> GRN เป็นฟีเจอร์ที่ **เปลี่ยนจุดตัดสต็อกเข้า** — ต้องออกแบบอย่างระมัดระวังเพื่อไม่ให้ PO เดิมที่สร้างไว้แล้วมีปัญหา  
> **แนะนำ**: ใบ PO เก่าที่ status = RECEIVED อยู่แล้ว ให้คงสถานะเดิม ไม่บังคับสร้าง GRN ย้อนหลัง  
> ให้ GRN Flow ใช้กับ PO ใหม่ที่สร้างหลังจากเปิดใช้ฟีเจอร์เท่านั้น

---

## 2.3 Cycle Count / Stock Take (ระบบนับสต็อกประจำงวด)

### 📌 สถานะปัจจุบันใน Codebase
- มี `Stock Adjustment` (ปรับปรุงยอดสต็อก) แต่เป็นการ "ปรับ" โดยตรง ไม่ใช่ "ใบคำสั่งนับ"
- **ไม่มี**: ใบสั่งนับ (Count Sheet), การเปรียบเทียบยอดนับกับยอดในระบบ, การสร้าง Adjustment อัตโนมัติจากผลนับ

### 🎯 เป้าหมาย
สร้างระบบ "ใบสั่งนับ" ที่สามารถกำหนดให้พนักงานไปนับสต็อกทีละโซน/หมวดหมู่ แล้วบันทึกผลเปรียบเทียบกับยอดในระบบ

### 🗄️ Database — Prisma Model ใหม่

```prisma
model CycleCount {
  id              String   @id @default(uuid())
  countNumber     String   @unique              // e.g. "CC-2026-0001"
  warehouseId     String                        // คลังที่นับ
  countDate       DateTime @default(now())      // วันที่นับ
  countType       String   @default("FULL")     // FULL (นับทั้งคลัง), PARTIAL (นับบางหมวด), RANDOM (สุ่มนับ)
  status          String   @default("DRAFT")    // DRAFT, IN_PROGRESS, COMPLETED, CANCELLED
  assignedTo      String?                       // ผู้ได้รับมอบหมาย
  approvedBy      String?                       // ผู้อนุมัติผลนับ
  totalItems      Int      @default(0)          // จำนวนรายการทั้งหมด
  matchedItems    Int      @default(0)          // จำนวนรายการที่ตรงกัน
  discrepancies   Int      @default(0)          // จำนวนรายการที่ไม่ตรง
  notes           String?
  completedAt     DateTime?
  items           CycleCountItem[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model CycleCountItem {
  id              String   @id @default(uuid())
  cycleCountId    String
  cycleCount      CycleCount @relation(fields: [cycleCountId], references: [id], onDelete: Cascade)
  productId       String
  productName     String
  sku             String?
  systemQty       Int                           // ยอดในระบบ ณ วันที่สร้างใบนับ
  countedQty      Int?                          // ยอดนับจริง (null = ยังไม่ได้นับ)
  variance        Int?                          // ผลต่าง (countedQty - systemQty)
  varianceCost    Float?                        // มูลค่าผลต่าง (variance × costPrice)
  status          String   @default("PENDING")  // PENDING, COUNTED, ADJUSTED
  adjustmentId    String?                       // ผูกกับ StockAdjustment ที่สร้างจากผลนับ (ถ้ามี)
  notes           String?
  createdAt       DateTime @default(now())
}
```

### 📐 Flow การทำงาน

```
1. สร้างใบนับ (Create Cycle Count)
   → เลือกคลัง + เลือกประเภท (Full / เฉพาะหมวด / สุ่ม)
   → ระบบดึงรายการสินค้าทั้งหมดในคลังนั้นมาเป็น CycleCountItem
   → บันทึก systemQty ณ วันที่สร้าง (Snapshot)

2. นับสต็อก (Record Count)
   → พนักงานเดินนับในคลัง → กรอกยอด countedQty ของแต่ละรายการ
   → ระบบคำนวณ variance อัตโนมัติ

3. ตรวจสอบ & อนุมัติ (Review & Approve)
   → หัวหน้าตรวจดูผลนับ → ดูรายการที่ยอดไม่ตรง (Discrepancies)
   → อนุมัติสร้าง Stock Adjustment อัตโนมัติสำหรับรายการที่ต่าง
   → StockAdjustment จะปรับยอดสต็อกจริงในระบบ

4. สรุปผล (Summary)
   → สรุปมูลค่าผลต่าง → Export PDF รายงานผลการนับสต็อก
```

### 🔌 API Endpoints ใหม่

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/api/cycle-counts` | สร้างใบนับสต็อก (ดึงสินค้าในคลังเข้ามาเป็นรายการ) |
| `GET` | `/api/cycle-counts` | รายการใบนับทั้งหมด |
| `GET` | `/api/cycle-counts/:id` | รายละเอียดใบนับ + items |
| `PUT` | `/api/cycle-counts/:id/items` | บันทึกยอดนับจริง (Batch update countedQty) |
| `PUT` | `/api/cycle-counts/:id/approve` | อนุมัติผลนับ → สร้าง Stock Adjustment อัตโนมัติ |

### 🖥️ Frontend — หน้าจอใหม่

| Route | คำอธิบาย |
|-------|---------|
| `/stock/cycle-count` (ใหม่) | รายการใบนับทั้งหมด พร้อม Create / View / Export |
| `/stock/cycle-count/[id]` (ใหม่) | หน้ากรอกยอดนับ (ตาราง: สินค้า / ยอดระบบ / ยอดนับจริง / ผลต่าง) |

### ⚡ ผลกระทบต่อระบบเดิม

| ส่วนที่ | ผลกระทบ |
|---------|---------|
| ตาราง DB เดิม | ❌ ไม่แก้ไข (เพิ่ม Model ใหม่ 2 ตาราง) |
| Stock Adjustment เดิม | ❌ ไม่กระทบ (Cycle Count สร้าง Adjustment ผ่าน API เดิม) |
| Sidebar Menu | ✅ เพิ่มเมนู "Cycle Count" ใต้ Stock Management |

---

# Phase 3 🟡 Low Priority

> [!NOTE]
> ฟีเจอร์ในกลุ่มนี้ทำเมื่อพร้อมขยายธุรกิจ ยังไม่ต้องรีบ — สรุปไว้เป็นหัวข้อเพื่อวางแผนล่วงหน้า

### 3.1 Offline Mode (โหมดออฟไลน์สำหรับ POS)
- **ขอบเขต**: ให้หน้าจอ POS ทำงานต่อได้เมื่อเน็ตหลุด โดยแคชข้อมูลสินค้าใน IndexedDB / Service Worker
- **ความซับซ้อน**: สูง — ต้องออกแบบ Conflict Resolution เมื่อ Sync กลับมา
- **ผลกระทบ**: ต้องแก้ POS page ค่อนข้างมาก + เพิ่ม Service Worker
- **แนะนำ**: ทำเมื่อจะ deploy ระบบเป็น Cloud-based (ปัจจุบันใช้ SQLite local จึงยังไม่เร่งด่วน)

### 3.2 Lot Recall (การเรียกคืนสินค้าตาม Lot)
- **ขอบเขต**: เมื่อพบปัญหาสินค้าล็อตใดล็อตหนึ่ง → ค้นหาลูกค้าที่ซื้อสินค้าล็อตนั้นไป → แจ้งเตือน / เรียกคืน
- **ความซับซ้อน**: กลาง — ต้องผูก Batch กับ Order/SaleItem
- **ผลกระทบ**: เพิ่ม Model ใหม่ + แก้ Sale flow เล็กน้อย
- **แนะนำ**: จำเป็นเฉพาะธุรกิจอาหาร/ยา/เคมีภัณฑ์

### 3.3 Purchase Requisition (PR) Approval Flow
- **ขอบเขต**: ใบขอซื้อ (PR) → ผู้จัดการอนุมัติ → แปลงเป็นใบสั่งซื้อ (PO)
- **ความซับซ้อน**: กลาง — ต้องเพิ่ม Approval Workflow Engine
- **ผลกระทบ**: เพิ่ม Model ใหม่ + แก้ Purchase flow
- **แนะนำ**: จำเป็นเฉพาะองค์กรขนาดกลาง-ใหญ่ที่มีหลายแผนก

### 3.4 WMS — Bin/Location Management & Picking
- **ขอบเขต**: กำหนดตำแหน่งจัดเก็บ (โซน/แถว/ชั้น/ช่อง) ให้สินค้าแต่ละชิ้น + ใบสั่งหยิบ (Picking List)
- **ความซับซ้อน**: สูงมาก — เปลี่ยนระบบจาก Inventory → WMS เต็มรูปแบบ
- **ผลกระทบ**: เพิ่มหลาย Model + แก้ Stock flow ทั้งหมด
- **แนะนำ**: จำเป็นเฉพาะศูนย์กระจายสินค้า (Distribution Center) เท่านั้น

---

# Phase 4 ⚪ ไม่แนะนำทำเอง

### 4.1 General Ledger (GL) — Double-entry Bookkeeping
- **เหตุผลที่ไม่แนะนำ**: การสร้าง GL เต็มรูปแบบจะเปลี่ยนระบบจาก POS/ERP เป็น Accounting Software ซึ่งมีกฎระเบียบบัญชีซับซ้อนมาก (มาตรฐาน TFRS/IFRS, ปิดงบรายเดือน/ปี)
- **ทางเลือกที่ดีกว่า**: ทำ **API Export** ส่งข้อมูลธุรกรรมไปยังซอฟต์แวร์บัญชีที่ได้รับการรับรอง เช่น:
  - 🇹🇭 **PEAK** (peakaccount.com) — ซอฟต์แวร์บัญชีออนไลน์ไทย มี API
  - 🇹🇭 **FlowAccount** — ซอฟต์แวร์บัญชีไทย
  - 🌍 **QuickBooks** — ซอฟต์แวร์บัญชีสากล มี API ครบ
  - 🌍 **Xero** — ซอฟต์แวร์บัญชีออสเตรเลีย API เปิดกว้าง
- **ขอบเขตที่ ABCPOS ควรทำ**: หน้า Settings เพิ่ม "Accounting Integration" สำหรับเชื่อมต่อ API Key ของซอฟต์แวร์บัญชี + ปุ่ม Sync/Export ข้อมูลธุรกรรมอัตโนมัติ

---

# Appendix: Database Change Summary

## ตารางสรุปการเปลี่ยนแปลง Database ทั้งหมด

### ตารางเดิมที่ต้องแก้ไข (แค่เพิ่มฟิลด์)

| ตาราง | ฟิลด์ที่เพิ่ม | ค่าเริ่มต้น | กระทบข้อมูลเดิม? |
|-------|-------------|------------|:---:|
| `PreferenceSettings` | `enableStockReservation` | `false` | ❌ ไม่ |
| `CompanySettings` | `costingMethod` | `"MOVING_AVERAGE"` | ❌ ไม่ |
| `Product` | `trackingType` | `"NONE"` | ❌ ไม่ |
| `Product` | `lastPurchaseCost` | `null` (optional) | ❌ ไม่ |
| `Product` | `averageCost` | `null` (optional) | ❌ ไม่ |
| `Purchase` | เพิ่ม status `"PARTIAL_RECEIVED"` | — | ❌ ไม่ |

### ตารางใหม่ที่ต้องสร้าง

| Phase | ตารางใหม่ | จำนวนฟิลด์โดยประมาณ |
|:-----:|----------|:---:|
| 🔴 1.1 | `PosHeldOrder` | ~14 |
| 🔴 1.2 | `StockReservation` | ~13 |
| 🔴 1.3 | `ProductSerialNumber` | ~15 |
| 🟠 2.2 | `GoodsReceiptNote` + `GrnItem` | ~12 + ~10 |
| 🟠 2.3 | `CycleCount` + `CycleCountItem` | ~14 + ~11 |

### สรุปภาพรวม

| หมวด | จำนวน |
|------|:-----:|
| ตารางเดิมที่แก้ไข (เพิ่มฟิลด์) | 3 ตาราง (Product, PreferenceSettings, CompanySettings) |
| ตารางใหม่ที่สร้าง | 7 ตาราง |
| ฟิลด์เดิมที่ลบ/เปลี่ยน Type | 0 |
| API Endpoint ใหม่ | ~15 endpoints |
| หน้าจอใหม่ | ~4 หน้า |
| หน้าจอเดิมที่แก้ไข | ~6 หน้า |

> [!TIP]
> **Zero Breaking Changes**: ทุกการเปลี่ยนแปลงเป็นแบบ Additive — เพิ่มตารางใหม่ หรือเพิ่มฟิลด์ที่มีค่าเริ่มต้น  
> ไม่มีการลบหรือเปลี่ยน Type ของฟิลด์เดิมใดๆ ระบบเดิมจะทำงานได้ปกติ 100% ตลอดการพัฒนา
