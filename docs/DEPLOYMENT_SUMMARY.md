# เอกสารสรุปภาพรวมสถาปัตยกรรมและการนำโปรเจกต์ขึ้นระบบ (Deployment Architecture)

เอกสารนี้สรุปขั้นตอนทั้งหมดที่ดำเนินการในการย้ายระบบ **ABC POS / Prime ERP** จากการทดสอบบนเครื่อง Local ด้วย SQLite ไปสู่สถาปัตยกรรมระดับ Production บน **Oracle Cloud Infrastructure (OCI)** ร่วมกับ **Cloudflare (Worker, DNS, SSL & Anti-DDoS)** พร้อมฐานข้อมูล **PostgreSQL 16 บน Docker**

---

## 1. ข้อมูลระบบและสถาปัตยกรรม (System Overview)

| ส่วนประกอบ | ระบบ/เทคโนโลยีที่ใช้งาน | รายละเอียดและตำแหน่งที่ตั้ง |
| :--- | :--- | :--- |
| **โดเมนหลัก (Domain)** | Cloudflare DNS | `primenexttech.solutions` (จัดการ DNS & SSL ที่ Cloudflare) |
| **ระบบ ERP & POS (Production URL)** | Cloudflare Worker Custom Domain | `https://erp.primenexttech.solutions` |
| **Cloudflare Worker Gateway** | Cloudflare Workers (`primeerp`) | รับทราฟฟิกหน้าบ้าน, ป้องกัน DDoS, ทำ Reverse Proxy ขาเข้า |
| **Cloud Compute (Host VM)** | Oracle Cloud Always Free (ARM Ampere A1) | Ubuntu 24.04 aarch64 (1 OCPU, 6 GB RAM, IP: `161.118.255.231`) |
| **Reverse Proxy (On Server)** | Nginx | รับทราฟฟิก Port 80 และแยกเส้นทาง `/api/` (Backend) กับ `/` (Frontend) |
| **Frontend Web App** | Next.js 15 (React 19) App Router | รันเป็น Production Service ด้วย **PM2** ที่ Port `3000` |
| **Backend API Server** | Express.js + Prisma ORM (Node.js 22) | รันเป็น Docker Container: `abcpos-api` ที่ Port `5000` (Localhost only) |
| **Database** | PostgreSQL 16 (Alpine) | รันเป็น Docker Container: `abcpos-db` (Docker Volume: `abcpos_pgdata`) |

---

## 2. ไดอะแกรมการทำงานของระบบ (Data & Traffic Flow)

```mermaid
flowchart TD
    User([ผู้ใช้งาน / เครื่อง POS ทั่วโลก]) -->|HTTPS: erp.primenexttech.solutions| CF_Edge[Cloudflare Edge Network / WAF / SSL]
    
    CF_Edge -->|Reverse Proxy / Worker: primeerp| Oracle_VM[Oracle Cloud VM: 161.118.255.231]
    
    subgraph Oracle VM Architecture
        Nginx[Nginx Reverse Proxy - Port 80]
        
        subgraph Frontend Layer
            NextJS[Next.js 15 App - PM2 Service\nLocal Port 3000]
        end
        
        subgraph Backend & Database Layer (Docker Network)
            API[Express API - Docker: abcpos-api\nLocal Port 5000]
            DB[(PostgreSQL 16 - Docker: abcpos-db\nInternal Port 5432)]
        end
        
        Oracle_VM --> Nginx
        Nginx -->|เส้นทางเว็บทั่วไป /| NextJS
        Nginx -->|เส้นทาง API /api/| API
        API --> DB
    end
```

---

## 3. สรุปสิ่งที่ดำเนินการไปแล้ว (Work Accomplished)

1. **ย้ายระบบฐานข้อมูลสู่ PostgreSQL (Database Migration)**:
   - ปรับแต่ง `backend/prisma/schema.prisma` จาก `sqlite` เป็น `postgresql`
   - รันคอนเทนเนอร์ PostgreSQL 16 บน Docker พร้อมทำ Persistent Volume
   - ทำการ `prisma db push` สร้าง Schema ทุกตาราง
   - รัน `prisma:seed` นำเข้า Master Data, บัญชีผู้ใช้, สต็อกสินค้าเม็ดพลาสติกและถุงพลาสติก 28 รายการ พร้อมข้อมูลธุรกรรมย้อนหลัง 7 เดือน
2. **ปรับแต่ง Backend สำหรับ Production (Containerization)**:
   - สร้าง Multi-stage `backend/Dockerfile` สำหรับรัน Node.js 22 บน Ubuntu ARM
   - สร้าง `docker-compose.prod.yml` ผูก Backend และ Database ไว้ใน Private Network (ผูก Port เข้า `127.0.0.1` เพื่อความปลอดภัย ไม่เปิดสู่ภายนอก)
3. **จัดเตรียมและตั้งค่าเซิร์ฟเวอร์ Oracle Cloud (OCI VM Setup)**:
   - สั่งติดตั้ง Docker, Docker Compose, Node.js 22, PM2 และ Nginx
   - ติดตั้ง iptables และไฟร์วอลล์ให้รับการเชื่อมต่อที่ปลอดภัย
   - คอนฟิก Nginx ให้ทำหน้าที่แยก Route ระหว่าง Frontend (`:3000`) และ API (`:5000`)
4. **Deploy Frontend ด้วย PM2**:
   - อัปเดต `NEXT_PUBLIC_API_URL`
   - สั่ง `npm run build` และใช้ PM2 จัดการ Process ให้รันอัตโนมัติ 24/7 แม้เครื่องจะรีบูต
5. **เชื่อมต่อ Domain & SSL ผ่าน Cloudflare**:
   - ย้าย Nameservers ของโดเมน `primenexttech.solutions` เข้าสู่ Cloudflare
   - สร้าง Cloudflare Worker Gateway (`primeerp`)
   - ผูก Custom Domain ถาวร: `https://erp.primenexttech.solutions`
