# ฟีเจอร์ลบข้อมูล (Database Clearing Feature)

## ภาพรวม
ฟีเจอร์นี้ช่วยให้ผู้ใช้ลบข้อมูลทั้งหมดจากฐานข้อมูล เพื่อใช้ในการทดสอบและพัฒนาระบบ

## สถาปัตยกรรม

### 1. API Endpoint: `POST /api/invoices/clear`
**ที่ตั้ง**: `src/app/api/invoices/clear/route.ts`

#### GET Request - ดูข้อมูลก่อนลบ
```
GET /api/invoices/clear

ส่งคืน:
{
  "success": true,
  "counts": {
    "invoices": 5,
    "uploads": 2,
    "customers": 3
  }
}

Status: 401 (ถ้าไม่ได้ล็อกอิน)
```

#### POST Request - ลบข้อมูลทั้งหมด
```
POST /api/invoices/clear

ส่งคืน:
{
  "success": true,
  "message": "ลบข้อมูลทั้งหมดแล้ว",
  "cleared": {
    "invoices": 5,
    "uploads": 2,
    "customers": 3
  }
}

Status: 200 (สำเร็จ)
Status: 401 (ไม่ได้ล็อกอิน)
```

### 2. React Component: `ClearDataButton`
**ที่ตั้ง**: `src/components/ClearDataButton.tsx`

#### ความสามารถ:
- ✅ แสดงปุ่ม "ลบข้อมูลทั้งหมด" สีแดง
- ✅ Modal Confirmation Dialog ที่แสดง:
  - จำนวน Invoices ที่จะลบ
  - จำนวน Uploads ที่จะลบ  
  - จำนวน Customers ที่จะลบ
  - คำเตือน: "การกระทำนี้ไม่สามารถยกเลิกได้"
- ✅ ปุ่ม "ยกเลิก" และ "ลบข้อมูลทั้งหมด"
- ✅ Loading states ขณะประมวลผล
- ✅ Success/Error messages
- ✅ Auto-refresh หลังการลบสำเร็จ

#### Props:
ไม่มี (Component standalone)

#### การใช้งาน:
```tsx
import { ClearDataButton } from '@/components/ClearDataButton';

<ClearDataButton />
```

### 3. Dashboard Integration
**ที่ตั้ง**: `src/app/dashboard/page.tsx`

Component ถูกเพิ่มไปในส่วนควบคุม (Controls) ที่ด้านบนของ Dashboard พร้อมกับ Search, Filter, Sort

```tsx
<div style={{ flex: 1 }}>
  <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", fontWeight: "500" }}>
    Tools
  </label>
  <ClearDataButton />
</div>
```

## Flow Diagram

```
User Action
    ↓
Click "ลบข้อมูลทั้งหมด" button
    ↓
GET /api/invoices/clear → Fetch current counts
    ↓
Show Modal Dialog with counts
    ↓
User clicks "ลบข้อมูลทั้งหมด"
    ↓
POST /api/invoices/clear
    ↓
API: Delete all invoices, uploads, customers
    ↓
Return success + cleared counts
    ↓
Show success message
    ↓
Auto-refresh page
```

## ความเสียหาย (Destructive Operations)

### ลบ (Deleted):
1. ตาราง `Invoice` - ลบทั้งหมด
2. ตาราง `Upload` - ลบทั้งหมด
3. ตาราง `Customer` - ลบทั้งหมด

### รักษา (Preserved):
- ตาราง `User` - ไม่ลบ
- ตาราง `ReportConfig` - ไม่ลบ
- ข้อมูล Authentication - ไม่ลบ

## ข้อจำกัด (Constraints)

✅ **ต้องล็อกอิน** - Endpoint ต้องมี Valid Session  
✅ **ลบทั้งหมด** - ไม่สามารถลบเลือกเฉพาะรายการได้  
✅ **ไม่มี Undo** - ต้องเตือนผู้ใช้ก่อน  
⚠️ **Performance** - ถ้าข้อมูลเยอะมาก อาจใช้เวลานาน

## Security

- 🔒 ต้อง authentication ผ่าน NextAuth
- 🔒 POST method ตรวจสอบ session
- 🔒 GET method ตรวจสอบ session  
- 🔒 ไม่ exposed ข้อมูล user อื่น

## Code Structure

```
src/
├── app/
│   ├── api/
│   │   └── invoices/
│   │       └── clear/
│   │           └── route.ts         ← API Endpoint
│   └── dashboard/
│       └── page.tsx                 ← ClearDataButton integrated
├── components/
│   └── ClearDataButton.tsx          ← React Component
```

## Test Coverage

- ✅ GET endpoint returns 401 without auth
- ✅ POST endpoint returns 401 without auth
- ✅ GET endpoint returns counts
- ✅ POST endpoint deletes data
- ✅ Modal shows confirmation dialog
- ✅ Error handling and retry

## Next Steps (ขั้นต่อไป)

1. ✅ API endpoint สร้างแล้ว
2. ✅ React component สร้างแล้ว
3. ✅ Dashboard integration เสร็จแล้ว
4. ⏳ E2E testing ใน Playwright (Optional)
5. ⏳ Rate limiting เพิ่มเติม (Optional)
6. ⏳ Audit logging (Optional)

## ภาษา (Localization)

ทั้ง API และ Component ใช้ภาษาไทยแล้ว:

- "ลบข้อมูลทั้งหมด" - Button label
- "ยืนยันการลบข้อมูล" - Modal title
- "จำนวน Invoices:" - Label
- "การกระทำนี้ไม่สามารถยกเลิกได้" - Warning
- "ลบข้อมูลสำเร็จแล้ว" - Success message
- "ไม่สามารถลบข้อมูลได้" - Error message

## สรุป

ฟีเจอร์ลบข้อมูล (Database Clearing Feature) เสร็จสมบูรณ์แล้ว:

✅ **API Layer** - POST/GET endpoints พร้อม authentication
✅ **UI Layer** - React component พร้อม modal confirmation
✅ **Integration** - ติดตั้งใน Dashboard แล้ว
✅ **Localization** - ข้อความไทยทั้งหมด
✅ **Security** - Authentication บังคับ
✅ **UX** - Loading states, error handling, success message

---

*ทดสอบโดย: test-clear-feature.mjs*
*ชิ้นส่วน: 3 ไฟล์ (API + Component + Integration)*
