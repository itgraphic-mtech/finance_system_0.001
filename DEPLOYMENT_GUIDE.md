# คู่มือการ Deploy บน Vercel ด้วย Neon Database

## ขั้นตอนที่ 1: เตรียม GitHub Repository

### 1.1 สร้าง Repository ใหม่ บน GitHub
- ไปที่ https://github.com/new
- กำหนดชื่อ Repository เป็น `finance-mtech` (หรือชื่ออื่นที่ต้องการ)
- เลือก **Public** (ถ้าต้องการให้คนอื่นเห็น) หรือ **Private**
- คลิก "Create repository"

### 1.2 เตรียมโปรเจคและ Push ขึ้น GitHub
ในโฟลเดอร์โปรเจค รันคำสั่งเหล่านี้:

```bash
# เตรียม git
git init
git add .
git commit -m "initial commit"

# เพิ่ม remote URL (เปลี่ยน username และ repo-name)
git remote add origin https://github.com/YOUR_USERNAME/finance-mtech.git
git branch -M main
git push -u origin main
```

## ขั้นตอนที่ 2: สร้าง Database บน Neon

### 2.1 เข้า Neon Console
- ไปที่ https://console.neon.tech
- ลงชื่อเข้าใช้หรือสร้างบัญชีใหม่

### 2.2 สร้าง Project ใหม่
- คลิก "New Project"
- ตั้งชื่อ Project (เช่น `finance-mtech`)
- เลือก Region (ควรเลือก Region ใกล้ที่สุด)
- เลือก Postgres Version (แนะนำ Latest)
- คลิก "Create Project"

### 2.3 สำรองก็ Connection String
- ไปที่หน้า "Connection" ของ Project
- คัดลอก Connection String (ขึ้นต้นด้วย `postgresql://`)
- เก็บไว้ใช้ในขั้นตอนถัดไป

### 2.3 ตั้งค่า Password (ถ้ามี)
- ที่ฝั่ง "Database" ให้ตั้ง Password สำหรับ Database user
- อัปเดต Connection String ให้มี password ที่ถูกต้อง

## ขั้นตอนที่ 3: เตรียม Environment Variables

### 3.1 สร้างไฟล์ `.env.local` (สำหรับ Local Development)
```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3.2 สร้าง Secret Key สำหรับ NextAuth
รันคำสั่งนี้เพื่อสร้าง Secret:
```bash
openssl rand -base64 32
```
หรือใช้ Online Tool: https://generate-random.org/

## ขั้นตอนที่ 4: Deploy บน Vercel

### 4.1 เข้า Vercel Dashboard
- ไปที่ https://vercel.com
- ลงชื่อเข้าใช้หรือสร้างบัญชี GitHub

### 4.2 Import Project จาก GitHub
- คลิก "Add New..." > "Project"
- คลิก "Import Git Repository"
- ค้นหา Repository `finance-mtech`
- คลิก "Import"

### 4.3 ตั้งค่า Environment Variables
หลังจาก Import แล้ว ให้เพิ่ม Environment Variables:
- คลิก "Environment Variables"
- เพิ่ม Variables ดังต่อไปนี้:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Connection String จาก Neon |
| `NEXTAUTH_SECRET` | Secret Key ที่สร้างไว้ |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` |

### 4.4 Deploy
- คลิก "Deploy"
- รอให้ Vercel build และ deploy เสร็จ
- เมื่อเสร็จจะได้ URL เช่น `https://finance-mtech.vercel.app`

## ขั้นตอนที่ 5: Setup Database บน Vercel

### 5.1 รัน Prisma Migrations
เมื่อ Vercel deploy เสร็จแล้ว ต้องสร้าง Database Schema:

**วิธีที่ 1: ใช้ Vercel CLI (แนะนำ)**
```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# ลงชื่อเข้าใช้
vercel login

# เข้าไปโปรเจค
vercel link

# รัน Migration บนปัจจุบัน Production
vercel env pull
npx prisma migrate deploy
```

**วิธีที่ 2: ใช้ Neon CLI โดยตรง**
```bash
# คัดลอก DATABASE_URL ของ Production
export DATABASE_URL="postgresql://..."

# รัน Prisma Push
npx prisma db push
```

### 5.2 ตรวจสอบ Database
- ไปที่ Neon Console
- ตรวจสอบว่า Tables ถูกสร้างแล้ว

## ขั้นตอนที่ 6: ทดสอบแอปพลิเคชัน

### 6.1 เข้าแอปพลิเคชัน
- ไปที่ URL ของ Vercel เช่น `https://finance-mtech.vercel.app`
- ลองเข้าสู่ระบบ

### 6.2 ตรวจสอบความสามารถ
- ✅ Login/Signup ได้ไหม
- ✅ Upload ไฟล์ได้ไหม
- ✅ ดูรายงานได้ไหม
- ✅ Database บันทึกข้อมูลได้ไหม

## ขั้นตอนที่ 7: Setup Custom Domain (ไม่บังคับ)

### 7.1 ตั้งค่า Domain ใน Vercel
- ไปที่ Vercel Project Settings
- คลิก "Domains"
- เพิ่ม Custom Domain
- ตามขั้นตอน DNS Configuration

### 7.2 อัปเดต NEXTAUTH_URL
แก้ไข Environment Variables ใน Vercel:
```
NEXTAUTH_URL = https://your-custom-domain.com
```

## ปัญหาทั่วไปและแนวทางแก้ไข

### ❌ Error: Database connection failed
**สาเหตุ**: Connection String ไม่ถูกต้องหรือ IP ไม่ได้ Whitelist
**แนวทางแก้ไข**:
- ตรวจสอบ Connection String ว่าถูกต้อง
- ใน Neon Console ไปที่ "Network" และ Whitelist IP ของ Vercel

### ❌ Error: Tables not found
**สาเหตุ**: ยังไม่ได้รัน Prisma Migrations
**แนวทางแก้ไข**:
```bash
npx prisma migrate deploy
npx prisma db push
```

### ❌ Error: Auth failed
**สาเหตุ**: NEXTAUTH_SECRET หรือ NEXTAUTH_URL ไม่ถูกต้อง
**แนวทางแก้ไข**:
- ตรวจสอบ Environment Variables ใน Vercel
- สร้าง NEXTAUTH_SECRET ใหม่

### ❌ Error: 502 Bad Gateway
**สาเหตุ**: Build failed หรือ Application error
**แนวทางแก้ไช**:
- ตรวจสอบ Build Logs ใน Vercel
- ตรวจสอบ Application Logs
- ลองรัน `npm run build` locally ก่อน

## คำสั่งที่มีประโยชน์

```bash
# ตรวจสอบ Build locally
npm run build

# ดู Logs จาก Vercel
vercel logs

# Connect ถึง Database บน Neon
vercel env pull
npx prisma studio

# Seed Database ด้วยข้อมูลตัวอย่าง (ถ้ามี seed script)
DATABASE_URL="postgresql://..." npm run db:seed
```

## Resources ที่มีประโยชน์

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/orm/prisma-client/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)

## Support

หากมีปัญหา:
1. ตรวจสอบ Logs ใน Vercel และ Neon
2. ลองรัน Locally ก่อนเพื่อ Debug
3. เข้าคำถามใน Community: [Vercel Discussions](https://github.com/vercel/vercel/discussions)

---
**Updated**: November 12, 2025
