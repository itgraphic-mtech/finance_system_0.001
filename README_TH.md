# Finance MTECH - Invoice and Accounts Receivable Management System

ระบบจัดการใบแจ้งหนี้และรายงานบัญชีลูกหนี้ (Accounts Receivable)

## 🎯 ฟีเจอร์หลัก

- 📊 **Dashboard** - ภาพรวมข้อมูลใบแจ้งหนี้และลูกหนี้
- 📈 **Reports** - รายงานบัญชีลูกหนี้จำแนกตามเขต และพนักงานขาย
- 📤 **Upload** - อัพโหลดไฟล์ Excel เพื่อนำเข้าข้อมูล
- 👤 **Authentication** - ระบบการเข้าสู่ระบบและลงทะเบียนผู้ใช้
- 🔍 **Search & Filter** - ค้นหาและกรองข้อมูลตามหลายเกณฑ์
- 🗑️ **Data Management** - ลบและจัดการข้อมูล

## 🚀 เทคโนโลยีที่ใช้

### Frontend
- **Next.js 16** - React Framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **React** - UI Components

### Backend
- **Next.js API Routes** - Backend API
- **NextAuth.js** - Authentication
- **Prisma ORM** - Database ORM

### Database
- **PostgreSQL (Neon)** - Production Database
- **Prisma** - Database Client

### Tools
- **XLSX** - Excel file parsing
- **bcryptjs** - Password hashing

## 📋 Requirements

- Node.js 18+
- npm หรือ yarn
- PostgreSQL Database (Neon)
- GitHub Account
- Vercel Account (สำหรับ Deployment)

## 🔧 Installation

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/finance-mtech.git
cd finance-mtech
```

### 2. Install Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local`:
```bash
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Setup Database
```bash
# สร้าง Schema
npx prisma db push

# หรือถ้ามี migration files
npx prisma migrate deploy

# (Optional) Seed ข้อมูลตัวอย่าง
npm run db:seed
```

### 5. รัน Development Server
```bash
npm run dev
```

เข้าเว็บไซต์ที่ http://localhost:3000

## 📖 Usage

### ต้องการ Deploy?
ดูรายละเอียดใน [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### ข้อมูลเข้าสู่ระบบตัวอย่าง (หลังจาก seed)
```
Email: user@example.com
Password: password123
```

## 🏗️ Project Structure

```
finance-mtech/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API Routes
│   │   ├── auth/        # Authentication Pages
│   │   ├── dashboard/   # Dashboard Page
│   │   ├── reports/     # Reports Page
│   │   └── upload/      # Upload Page
│   ├── components/       # React Components
│   ├── lib/             # Utility Functions & DB
│   ├── hooks/           # Custom React Hooks
│   └── types/           # TypeScript Types
├── prisma/
│   ├── schema.prisma    # Database Schema
│   └── seed.ts          # Seed Script
├── public/              # Static Files
└── package.json         # Dependencies
```

## 🗄️ Database Schema

### Users
- `id` - User ID
- `email` - Email address
- `password` - Hashed password
- `name` - User name
- `role` - User role (user, admin)

### Customers
- `id` - Customer ID
- `customerId` - Customer code (e.g., R001)
- `customerName` - Customer name (Thai)
- `region` - Region code
- `salesPerson` - Sales person name

### Invoices
- `id` - Invoice ID
- `invoiceNumber` - Invoice number (unique)
- `customerId` - Related customer
- `invoiceDate` - Invoice date
- `dueDate` - Due date
- `totalAmount` - Total amount
- `paidAmount` - Paid amount
- `outstandingAmount` - Outstanding amount
- `daysOverdue` - Days overdue
- `agingBucket` - Aging category
- `status` - Invoice status

### Uploads
- `id` - Upload ID
- `fileName` - File name
- `originalFileName` - Original file name
- `fileSize` - File size
- `uploadedBy` - User who uploaded
- `invoiceCount` - Number of invoices
- `processingStatus` - Processing status

## 🔐 Authentication

ระบบใช้ **NextAuth.js** สำหรับการเข้าสู่ระบบ:
- ลงทะเบียน: `/auth/signup`
- เข้าสู่ระบบ: `/auth/login`
- ออกจากระบบ: Auto-logout ตามการหมดอายุ Session

## 📊 API Endpoints

### Invoices
- `GET /api/invoices` - ดึงข้อมูลใบแจ้งหนี้
- `POST /api/invoices/upload` - อัพโหลดไฟล์
- `DELETE /api/invoices/clear` - ลบข้อมูล

### Reports
- `GET /api/reports` - ดึงรายงาน AR

### Auth
- `POST /api/auth/register` - ลงทะเบียน
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

## 🐛 Troubleshooting

### Database Connection Error
```bash
# ตรวจสอบ Connection String
echo $DATABASE_URL

# ทดสอบ Connection
npx prisma db execute --stdin < check.sql
```

### Build Error
```bash
# ลบ cache และลองใหม่
rm -rf .next
npm run build
```

### Auth Issues
- ตรวจสอบ `NEXTAUTH_SECRET` ไม่ว่าง
- ตรวจสอบ `NEXTAUTH_URL` ถูกต้อง
- ลบ Cookies แล้วลองใหม่

## 📝 Available Scripts

```bash
# Development
npm run dev           # Run dev server

# Production
npm run build         # Build application
npm start             # Start production server

# Database
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio

# Code Quality
npm run lint          # Run ESLint
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code ไปที่ GitHub
2. Import project ใน Vercel
3. ตั้งค่า Environment Variables
4. Deploy

ดูรายละเอียดเต็ม: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📄 License

ISC

## 👨‍💻 Contributing

ยินดีรับ Pull Requests ค่ะ

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ Issues ที่มีอยู่
2. สร้าง Issue ใหม่พร้อมรายละเอียด
3. ติดต่อผู้พัฒนา

---

**Created**: November 2025  
**Version**: 1.0.0
