# คู่มือการ Deploy และอัปเดตระบบด้วยตนเอง (Manual Deployment Guide)

เอกสารนี้รวบรวมคำสั่งทั้งหมดสำหรับผู้ดูแลระบบ เพื่อใช้ในการอัปเดตโค้ด, ตรวจสอบสถานะ หรือแก้ไขระบบในอนาคต

---

## 1. การเชื่อมต่อเข้าสู่เซิร์ฟเวอร์ (SSH Connection)

เชื่อมต่อจากเครื่องคอมพิวเตอร์ของคุณไปยัง Oracle Cloud VM:

```powershell
ssh -i "secrets/ssh-key-2026-11-03.key" ubuntu@161.118.255.231
```

---

## 2. ขั้นตอนการอัปเดต Frontend (เมื่อมีการแก้โค้ดหน้าบ้าน)

หากมีการแก้ไขโค้ดฝั่งหน้าบ้านในโฟลเดอร์ `frontend/`:

### วิธีที่ 1: คัดลอกไฟล์ขึ้นเซิร์ฟเวอร์โดยตรงจากเครื่อง Local (PowerShell)
```powershell
# 1. ส่งไฟล์ src และ public ขึ้นเซิร์ฟเวอร์
scp -i "secrets/ssh-key-2026-11-03.key" -r frontend/src frontend/public ubuntu@161.118.255.231:~/abcpos/frontend/

# 2. SSH เข้าไปสั่ง Build และ Restart PM2
ssh -i "secrets/ssh-key-2026-11-03.key" ubuntu@161.118.255.231 "cd ~/abcpos/frontend && npm run build && pm2 restart abcpos-frontend"
```

### วิธีที่ 2: ดำเนินการบนเซิร์ฟเวอร์ (กรณีใช้ Git Pull)
```bash
cd ~/abcpos/frontend
git pull
npm install
npm run build
pm2 restart abcpos-frontend
```

---

## 3. ขั้นตอนการอัปเดต Backend API (เมื่อมีการแก้โค้ดหลังบ้าน)

หากมีการแก้ไขโค้ด Controller, Route, Service หรือ Schema ใน `backend/`:

### วิธีที่ 1: คัดลอกไฟล์ขึ้นเซิร์ฟเวอร์โดยตรงจากเครื่อง Local (PowerShell)
```powershell
# 1. ส่งโค้ด backend ขึ้นไป
scp -i "secrets/ssh-key-2026-11-03.key" -r backend/src backend/prisma ubuntu@161.118.255.231:~/abcpos/backend/

# 2. SSH เข้าไปสั่ง Rebuild Docker Container
ssh -i "secrets/ssh-key-2026-11-03.key" ubuntu@161.118.255.231 "cd ~/abcpos && sudo docker compose up -d --build abcpos-api"
```

### กรณีมีการเปลี่ยน Database Schema (`schema.prisma`):
หลังจาก Rebuild ให้สั่งรัน sync ฐานข้อมูล:
```bash
sudo docker exec abcpos-api npx prisma db push
```

---

## 4. คำสั่งตรวจสอบสถานะและการทำงานของระบบ (Monitoring & Troubleshooting)

### ตรวจสอบ Frontend (PM2):
```bash
# ดูสถานะ Process
pm2 status

# ดู Logs หน้าบ้านแบบเรียลไทม์
pm2 logs abcpos-frontend

# รีสตาร์ท Frontend
pm2 restart abcpos-frontend
```

### ตรวจสอบ Backend & Database (Docker):
```bash
# ดูคอนเทนเนอร์ที่กำลังรัน
sudo docker ps

# ดู Logs ของ Backend API
sudo docker logs -f abcpos-api

# ดู Logs ของ PostgreSQL Database
sudo docker logs -f abcpos-db

# รีสตาร์ทคอนเทนเนอร์ทั้งหมด
cd ~/abcpos
sudo docker compose restart
```

### ตรวจสอบ Nginx Web Server:
```bash
# ตรวจสอบความถูกต้องของไฟล์คอนฟิก
sudo nginx -t

# รีโหลด Nginx โดยระบบไม่สะดุด
sudo systemctl reload nginx

# ดู Logs ข้อผิดพลาด
sudo tail -f /var/log/nginx/error.log
```

---

## 5. การสำรองข้อมูลฐานข้อมูล (Database Backup)

คำสั่ง Export ข้อมูลทั้งหมดจาก PostgreSQL ออกมาเป็นไฟล์ `.sql`:
```bash
sudo docker exec -t abcpos-db pg_dump -U abcpos_user -d abcpos_prod > ~/backup_$(date +%Y%m%d_%H%M%S).sql
```
