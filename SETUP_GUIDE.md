# Finance AR System - Setup Guide

## ✅ Project Successfully Scaffolded

A complete Next.js + Prisma + PostgreSQL web application has been created for **Invoice and Accounts Receivable (AR) Report Management**.

### Tech Stack Installed

- **Next.js 16** - React framework with App Router
- **TypeScript 5.9** - Type safety
- **Tailwind CSS 4** - Styling
- **Prisma 6** - ORM for database
- **PostgreSQL** - Database (via Neon)
- **NextAuth.js** - Authentication
- **XLSX** - Excel file parsing
- **Zod** - Data validation
- **bcryptjs** - Password hashing
- **ESLint** - Code linting

### Project Structure

```
📦 finance-mtech/
├── 📂 src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/       # React components
│   ├── lib/
│   │   ├── db/          # Database utilities
│   │   │   └── prisma.ts
│   │   └── auth/        # Authentication
│   ├── api/             # API routes
│   ├── hooks/           # Custom hooks
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   └── utils/           # Utilities
│       └── excelParser.ts
├── 📂 prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── 📂 public/           # Static files
├── .env.example         # Example environment
├── .env.local          # Local development env
├── eslint.config.js    # ESLint configuration
├── next.config.ts      # Next.js configuration
├── tailwind.config.ts  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
├── postcss.config.js   # PostCSS configuration
├── package.json        # Dependencies
└── README.md          # Documentation
```

## 🗄️ Database Schema

The Prisma schema includes:

### Models

1. **User** - System users with authentication
   - Email, password hash, name, role

2. **Customer** - Customer/debtor information
   - Customer ID, name, region, sales person

3. **Invoice** - Invoice records with AR tracking
   - Invoice number, dates, amounts
   - Days overdue, aging bucket status

4. **Upload** - File upload tracking
   - Original filename, size, processing status

5. **ReportConfig** - Report type configurations
   - Report types (45 days, 90 days, over 90 days)

## 📋 Excel File Format

The system expects Excel files with these columns:

| Column | Header | Type |
|--------|--------|------|
| A | รหัสลูกค้า | String (Customer ID) |
| B | ชื่อลูกหนี้/ลูกค้า | String |
| C | วันที่ | Date |
| D | CD | String (unused) |
| E | เลขที่ใบกำกับ | String (Invoice #) |
| F | ครบกำหนด | Date (Due Date) |
| G | รวมเป็นเงิน | Number (Total) |
| H | ชำระเงินแล้ว | Number (Paid) |
| I | ยอดคงเหลือสุทธิ | Number (Outstanding) |
| J | พนักงานขาย | String (Sales Person) |

## 🚀 Quick Start

### 1. Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Set Up Environment

Edit `.env.local` with your database credentials:

```env
# For local PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/finance_mtech"

# For Neon (recommended for production)
DATABASE_URL="postgresql://user:password@neon.tech:5432/database?sslmode=require"

# NextAuth configuration
NEXTAUTH_SECRET="generate-a-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Database

```bash
# Push schema to database
npm run db:push

# Or use migrations
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Building
npm run build            # Build for production
npm start               # Start production server

# Database
npm run db:push         # Push schema changes to database
npm run db:migrate      # Create and run migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio GUI

# Code Quality
npm run lint            # Run ESLint
```

## 🔑 Key Features Implemented

✅ **Project Structure** - Organized directories for components, hooks, types, utilities
✅ **Database Schema** - Complete models for users, customers, invoices, uploads
✅ **Excel Parser** - Utility to parse Excel files and map data
✅ **Tailwind CSS** - Styling framework with utilities
✅ **TypeScript** - Full type safety throughout
✅ **Configuration** - All config files set up (Prisma, Next.js, ESLint, etc.)

## 🎯 Next Steps

The following features need to be implemented (see todo list):

1. **Authentication Pages**
   - Login page (`src/app/auth/login/page.tsx`)
   - Signup page (`src/app/auth/signup/page.tsx`)
   - NextAuth configuration

2. **Dashboard**
   - Invoice list view
   - Search and filter by customer
   - Regional grouping

3. **File Upload**
   - Excel file upload form
   - Data validation
   - Database population

4. **AR Reports**
   - Report generation for 45 days, 90 days, over 90 days
   - Regional grouping with color coding
   - Dropdown expansion for details
   - Grand totals and summaries

5. **Data Management**
   - Clear all invoices button
   - Delete specific invoices
   - Edit customer information

6. **Export Features**
   - Export reports as Excel
   - Print functionality

7. **Deployment**
   - Neon database setup
   - Vercel deployment
   - Environment variables configuration

## 🗝️ NextAuth Setup (TODO)

Example configuration for NextAuth:

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verify credentials against database
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
  }
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

## 🔒 Environment Variables Explained

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `NEXTAUTH_SECRET` - Secret key for NextAuth (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Application URL for NextAuth
- `MAX_FILE_SIZE` - Maximum Excel file size in bytes (default: 10MB)

## 🐛 Troubleshooting

### "No DATABASE_URL" Error
- Make sure `.env.local` file exists
- Verify DATABASE_URL is set correctly

### Prisma Schema Issues
- Run `npm run db:push` to update schema
- Check PostgreSQL connection

### Build Errors
- Delete `.next` folder: `rm -r .next`
- Reinstall dependencies: `npm install`
- Run `npm run build` again

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Neon PostgreSQL](https://neon.tech/)
- [Vercel Deployment](https://vercel.com/)

## 📧 Support

For issues or feature requests, check the README.md or create an issue in the repository.

---

**Last Updated:** November 12, 2025
**Status:** ✅ Project Scaffolding Complete
