# 📋 Checklist ก่อน Deploy

ตรวจสอบให้แน่ใจว่าเสร็จทั้งหมดก่อน Push ไปที่ GitHub

## ✅ เตรียมโปรเจค Local

- [ ] ลบไฟล์ที่ไม่จำเป็น (.env.local, node_modules ฯลฯ)
- [ ] ตรวจสอบ `.env.example` มีตัวแปรทั้งหมด
- [ ] ลองรัน `npm run build` สำเร็จ
- [ ] ทดสอบ dev server `npm run dev` ทำงานปกติ

## ✅ Git Preparation

- [ ] สร้าง GitHub Repository ใหม่
- [ ] ตั้งค่า `.gitignore` ให้ถูกต้อง
- [ ] Commit code ครั้งแรก
- [ ] Push ไปที่ GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/finance-mtech.git
git branch -M main
git push -u origin main
```

## ✅ Database Setup (Neon)

- [ ] สร้าง Account ที่ https://neon.tech
- [ ] สร้าง Project ใน Neon
- [ ] Copy Connection String
- [ ] ทำให้ Password ถูกต้อง (ถ้ามี)
- [ ] บันทึก Connection String ไว้ 📝

## ✅ Vercel Deployment

- [ ] สร้าง Account ที่ https://vercel.com (ลิงก์ GitHub)
- [ ] Create Secret Keys:
  - [ ] `NEXTAUTH_SECRET` = `openssl rand -base64 32`
  - [ ] `DATABASE_URL` = Neon Connection String
  - [ ] `NEXTAUTH_URL` = https://finance-mtech-YOUR_NAME.vercel.app

## ✅ Post-Deployment

- [ ] Database Migration รันสำเร็จ
  ```bash
  npx prisma db push
  ```

- [ ] ทดสอบแอป:
  - [ ] Sign Up สำเร็จ
  - [ ] Login สำเร็จ
  - [ ] Upload ไฟล์สำเร็จ
  - [ ] ดู Dashboard สำเร็จ
  - [ ] ดู Reports สำเร็จ

- [ ] ตรวจสอบ Database:
  - [ ] Tables ถูกสร้าง
  - [ ] ข้อมูลบันทึกได้

## ✅ Final Checks

- [ ] `.env` ไม่ได้ Commit (เพราะ `.gitignore`)
- [ ] `node_modules` ไม่ได้ Commit
- [ ] README อัปเดตแล้ว
- [ ] Documentation เสร็จแล้ว
- [ ] No console errors ใน browser
- [ ] No build warnings

## 📝 Environment Variables ตัวอย่าง

```
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
NEXTAUTH_SECRET=YOUR_SECRET_KEY_HERE
NEXTAUTH_URL=https://finance-mtech-xyz.vercel.app
MAX_FILE_SIZE=10485760
```

## 🔗 Links ที่ต้องการ

- GitHub Repository: https://github.com/YOUR_USERNAME/finance-mtech
- Vercel Project: https://vercel.com/dashboard/...
- Neon Database: https://console.neon.tech
- Live App: https://finance-mtech-xxx.vercel.app

---

## 🆘 ถ้ามีปัญหา

1. ตรวจสอบ Build Logs ใน Vercel
2. ตรวจสอบ Database Connection บน Neon Console
3. ลองรัน Migrations ใหม่
4. ลบ Vercel cache และ redeploy

---

**Last Updated**: November 12, 2025
