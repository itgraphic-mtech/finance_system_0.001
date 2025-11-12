# ⚡ Quick Deploy Guide - Vercel + Neon

สำหรับการ Deploy ให้เร็ว โปรดทำตามขั้นตอนนี้ทีละขั้น

## 📌 ขั้นตอนสำคัญ 5 ข้อ

### 1️⃣ Push ไปที่ GitHub (ถ้ายังไม่ได้)

```bash
cd d:\WORK\MTECH\Finance_mtech

git init
git add .
git commit -m "initial commit: Finance MTECH System"
git branch -M main

# เปลี่ยน URL ให้เหมาะสม
git remote add origin https://github.com/YOUR_USERNAME/finance-mtech.git
git push -u origin main
```

### 2️⃣ สร้าง Database บน Neon

1. ไปที่ https://console.neon.tech
2. Sign Up หรือ Login
3. คลิก **"New Project"**
   - Project name: `finance-mtech`
   - Region: ประเทศไทย หรือใกล้ที่สุด
   - Version: Latest Postgres
4. **Copy Connection String** - บันทึกไว้ ⚠️

### 3️⃣ Deploy บน Vercel

1. ไปที่ https://vercel.com/dashboard
2. คลิก **"Add New..." → "Project"**
3. คลิก **"Import Git Repository"**
4. ค้นหา `finance-mtech` และ click
5. ตั้งค่า Environment Variables:

| Key | Value | หมายเหตุ |
|-----|-------|---------|
| `DATABASE_URL` | ก็อปจาก Neon | `postgresql://...?sslmode=require` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | สำคัญ! |
| `NEXTAUTH_URL` | `https://finance-mtech-YOUR_NAME.vercel.app` | Replace YOUR_NAME |

6. คลิก **"Deploy"** - รอให้เสร็จ ⏳

### 4️⃣ Setup Database

หลังจาก Deploy เสร็จ รันคำสั่งนี้ **1 ครั้ง** เท่านั้น:

```bash
# วิธีที่ 1: ใช้ Vercel CLI (แนะนำ)
npm i -g vercel
vercel login
vercel link
vercel env pull

# รัน Migration
npx prisma db push

# ตรวจสอบ Database
npx prisma studio
```

หรือ

```bash
# วิธีที่ 2: โดยตรง
set DATABASE_URL=postgresql://...
npx prisma db push
```

### 5️⃣ ทดสอบแอป

```
🌐 เข้าที่: https://finance-mtech-YOUR_NAME.vercel.app

📝 ลอง:
  - Login / Sign Up
  - Upload ไฟล์
  - ดู Reports
  - Check Dashboard
```

---

## 🚨 ปัญหาทั่วไป

| ปัญหา | สาเหตุ | แนวทางแก้ |
|------|--------|----------|
| ❌ Database not found | Migration ยังไม่รัน | รัน `npx prisma db push` |
| ❌ Auth failed | NEXTAUTH_SECRET หรือ URL ผิด | ตรวจสอบ Vercel Env Vars |
| ❌ 502 Error | Build error | ตรวจสอบ Build Logs ใน Vercel |
| ❌ Prisma error | `@prisma/client` ไม่ match | `npm install @prisma/client@latest` |

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Deploy](https://www.prisma.io/docs/orm/prisma-client/deployment)

---

## ✅ เสร็จ!

แอปของคุณสามารถเข้าถึงได้แล้ว 🎉

```
URL: https://finance-mtech-YOUR_NAME.vercel.app
Database: Neon PostgreSQL
Hosting: Vercel
```

---

**💡 Tip**: ทุกครั้งที่ Push code ไปที่ GitHub, Vercel จะ Auto Deploy
