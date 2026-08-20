# ABC POS & Inventory Management System 🛍️🚀

ระบบ POS (ขายหน้าร้าน) และ Inventory Management Dashboard ถอดแบบ UI & Features จากเทมเพลต **Dreams POS** โดยแยกสถาปัตยกรรม **Frontend** และ **Backend** อย่างชัดเจน

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
abcpos/
├── frontend/                     # Next.js 15 (App Router + TypeScript + Tailwind CSS)
│   ├── public/assets/            # Assets และรูปภาพจาก template
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # 📊 Dashboard Overview & Sales Charts
│       │   ├── pos/page.tsx      # 🛒 POS Terminal Screen (ขายหน้าร้าน + คูปอง + ใบเสร็จ)
│       │   ├── products/page.tsx # 📦 Product Catalog & Stock Levels
│       │   └── orders/page.tsx   # 🧾 Sales Orders & Receipt History
│       ├── components/layout/    # Header, Sidebar, AppLayout
│       ├── lib/api.ts            # Client API Service
│       ├── store/useCartStore.ts # Zustand Cart State
│       └── types/index.ts        # TypeScript Interfaces
│
├── backend/                      # Node.js + Express + TypeScript + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma         # Database Models (Product, Category, Order, Customer)
│   │   ├── seed.ts               # ข้อมูลสินค้าและหมวดหมู่เริ่มต้น
│   │   └── dev.db                # SQLite Database (ไม่ต้องลงเซิร์ฟเวอร์เพิ่ม)
│   └── src/
│       ├── controllers/          # Product, Order, Category, Dashboard Controllers
│       ├── routes/api.routes.ts  # RESTful Endpoints (/api/...)
│       ├── lib/prisma.ts         # Prisma Client Singleton
│       └── server.ts             # Express App Server (Port 5000)
│
└── documentation/                # Template ต้นแบบ (Dreams POS)
```

---

## ⚡ วิธีเริ่มรันระบบ (How to Run)

### 1. รันฝั่ง Backend (API & Database)
เปิด Terminal ที่ 1:
```bash
cd backend
npm run dev
```
> เซิร์ฟเวอร์ API จะทำงานที่: `http://localhost:5000` (ทดสอบเช็คสถานะได้ที่ `http://localhost:5000/api/health`)

### 2. รันฝั่ง Frontend (Web UI & POS)
เปิด Terminal ที่ 2:
```bash
cd frontend
npm run dev
```
> เข้าใช้งานหน้าเว็บได้ที่: `http://localhost:3000`

---

## 🔄 วิธีสลับ Database ไปใช้ PostgreSQL บน Cloud (เช่น Supabase / Neon / Railway)

1. เปิดไฟล์ `backend/prisma/schema.prisma` แก้ไขบรรทัด datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. ใส่ Connection String ของ Cloud ในไฟล์ `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@cloud-host:5432/posdb"
   ```
3. สั่งคำสั่ง Sync ขึ้น Cloud:
   ```bash
   cd backend
   npx prisma db push
   npm run prisma:seed
   ```
*(โค้ด Controller และ Frontend ทั้งหมดไม่ต้องแก้ไขเลย)*

---

## 🛠 ฟังก์ชันที่มีพร้อมใช้งานในระบบ
- **Dashboard Overview**: สรุปยอดขายรวม, จำนวนบิล, สินค้าในสต็อก, กราฟยอดขายรายเดือน (Recharts), รายการขายล่าสุด และแจ้งเตือนสินค้าใกล้หมด
- **Interactive POS Screen**: ค้นหาสินค้า, แยกตามหมวดหมู่, ยิงบาร์โค้ด, ตะกร้าสินค้าคำนวณเงินสด/ส่วนลด/ภาษี VAT 7%, ชำระเงิน (Cash คำนวณเงินทอน, PromptPay QR, Card) และตัดสต็อกสินค้าใน Database ทันที
- **Product Inventory**: ตารางแสดงรายการสินค้า, SKU, Barcode, สต็อกคงเหลือ, สถานะ Active/Out of stock
- **Orders History**: ประวัติการขายทั้งหมด พร้อมหน้าต่างแสดงใบเสร็จและสั่งพิมพ์ (Print Receipt)
