# ABCPOS Development Rules & Guidelines

These rules are strictly enforced across all conversations, new chats, and subagents in this workspace.

---

## 1. Git Commit Policy (CRITICAL)
- **ห้ามทำการ `git commit` ด้วยตัวเองเด็ดขาด** ไม่ว่ากรณีใดๆ
- ต้องรอจนกว่าผู้ใช้งานจะพิมพ์คำสั่ง "commit" หรือสั่งให้ commit อย่างชัดเจนเท่านั้น จึงจะสามารถรันคำสั่ง `git commit` ได้

---

## 2. UI / UX & Master Data Table Standards
ทุกหน้าตารางหลักและหน้าจัดการข้อมูล Master Data ทั้งหมด (เช่น Categories, Sub-Categories, Brands, Units, Warehouses, Stores, Warranties, Variant Attributes, Customers, Suppliers ฯลฯ) ต้องปฏิบัติตามมาตรฐานต่อไปนี้:

1. **Full Real API Integration**:
   - เชื่อมต่อ API และฐานข้อมูลจริง (Prisma / SQLite) เสมอ ไม่ใช้ข้อมูล Mock จำลอง

2. **Dropdowns & Selection**:
   - ใช้ `SearchableSelect` สำหรับ dropdown ทุกตัว
   - ในแบบฟอร์ม (Form Modals) ตัวเลือกแรกเริ่มต้นต้องเป็น "Select..." (หรือระบุ placeholder ที่เหมาะสม)
   - ในแถบค้นหา (Filter Bar) ให้แสดงตัวเลือก "All..." หรือ "Status: All"

3. **Action Buttons Order**:
   - เรียงปุ่มการทำงานในแต่ละแถวเสมอ: **View (`Eye`)** -> **Edit (`Edit`)** -> **Delete (`Trash2`)**

4. **Table Capabilities**:
   - มีฟังก์ชันค้นหาแบบ Real-time Search
   - มี Filter คัดกรองสถานะ (Status / Foreign Keys)
   - มีระบบ Pagination พร้อมตัวเลือกจำนวนแถวต่อหน้า (Page Size)
   - รองรับการ Export ข้อมูลทั้ง PDF (`window.print()`) และ CSV

---

## 3. Alert / Feedback Modal Standard (Add, Edit, Delete, Error)
เมื่อทำการเพิ่ม, แก้ไข, หรือลบข้อมูล ให้ใช้ **Feedback Modal** สไตล์โมเดิร์นกึ่งกลางหน้าจอเสมอ:

1. **Add Success Modal**:
   - ไอคอน: ประกายสีเขียว (`Sparkles` ในโทน Emerald `bg-emerald-50 text-emerald-600`)
   - หัวข้อ: "[Entity] Created!"
   - ข้อความ: แจ้งชื่อรายการที่เพิ่มสำเร็จ
   - ปุ่ม: มี 2 ปุ่มเสมอ -> **`+ Add Another`** (เปิดฟอร์มเพิ่มรายการต่อไปทันที) และ **`Done`** (ปิด modal)

2. **Edit Success Modal**:
   - ไอคอน: ติ๊กถูกสีฟ้า/เขียว (`CheckCircle2` ในโทน Blue `bg-blue-50 text-blue-600`)
   - หัวข้อ: "[Entity] Updated!"
   - ข้อความ: แจ้งชื่อรายการที่บันทึกข้อมูลสำเร็จ
   - ปุ่ม: **`OK`**

3. **Delete Flow**:
   - **Step 1 (Confirmation Modal)**: ไอคอนถังขยะสีแดง (`Trash2` โทน Rose `bg-rose-50 text-rose-500`) ถามยืนยันชื่อรายการก่อนลบ พร้อมปุ่ม **`Cancel`** และ **`Delete`**
   - **Step 2 (Success Modal)**: ไอคอนแจ้งเตือนสำเร็จสีเหลืองอำพัน (`Trash2` โทน Amber `bg-amber-50 text-amber-600`) แจ้งว่าลบรายการสำเร็จ พร้อมปุ่ม **`OK`**

4. **Error / Validation Modal**:
   - ไอคอน: เครื่องหมายเตือนสีแดง (`AlertTriangle` ในโทน Rose `bg-rose-50 text-rose-600`)
   - หัวข้อ: "Operation Failed" / "Missing Information"
   - ข้อความ: แสดงรายละเอียดข้อผิดพลาด
   - ปุ่ม: **`OK`**
