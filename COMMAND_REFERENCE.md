# Command Cheat Sheet

## Quick Commands

### Start Development
```bash
npm run dev
# Opens at http://localhost:3000
```

### Build & Deploy
```bash
npm run build
npm start
```

### Database
```bash
npm run db:push      # Apply schema changes
npm run db:migrate   # Create migrations
npm run db:studio    # GUI database browser
npm run db:seed      # Add sample data
```

### Code Quality
```bash
npm run lint         # Check code
```

## Database Connection Strings

### Local PostgreSQL
```
postgresql://postgres:password@localhost:5432/finance_mtech
```

### Neon PostgreSQL
```
postgresql://username:password@neon.tech:5432/database?sslmode=require
```

## Environment Variables

```env
DATABASE_URL="your-connection-string"
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
MAX_FILE_SIZE="10485760"
```

## File Locations

- Home Page: `src/app/page.tsx`
- Database: `prisma/schema.prisma`
- Excel Parser: `src/utils/excelParser.ts`
- Styles: `src/app/globals.css`
- Types: `src/types/index.ts`

## Generate NextAuth Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Useful URLs

- Dev Server: http://localhost:3000
- Prisma Studio: http://localhost:5555
- Neon Console: https://console.neon.tech
- Vercel Dashboard: https://vercel.com/dashboard

## Common Tasks

### Create new component
```bash
# Create file: src/components/MyComponent.tsx
```

### Create new API route
```bash
# Create file: src/app/api/route-name/route.ts
```

### Add database model
```bash
# Edit: prisma/schema.prisma
# Run: npm run db:push
```

### Check TypeScript errors
```bash
npx tsc --noEmit
```

## File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `InvoiceTable.tsx`)
- Pages: `page.tsx` in route directory
- API routes: `route.ts` in route directory
- Utilities: `camelCase.ts` (e.g., `excelParser.ts`)
- Types: Keep in `types/` directory
- Styles: `globals.css` or component-scoped

## Important Directories

```
src/
├── app/          # Pages and layout
├── components/   # React components
├── lib/          # Utilities and database
├── api/          # API routes
├── hooks/        # Custom React hooks
├── types/        # TypeScript types
└── utils/        # Helper functions
```

## Documentation Index

- `GETTING_STARTED.md` - Start here!
- `SETUP_GUIDE.md` - Installation details
- `IMPLEMENTATION_CHECKLIST.md` - What to build
- `PROJECT_STATUS.md` - Technical details
- `QUICK_REFERENCE.md` - This file
- `README.md` - Project overview

## Excel Column Mapping

```
A = รหัสลูกค้า (Customer ID)
B = ชื่อลูกหนี้/ลูกค้า (Customer Name)
C = วันที่ (Date)
D = CD (unused)
E = เลขที่ใบกำกับ (Invoice #)
F = ครบกำหนด (Due Date)
G = รวมเป็นเงิน (Total)
H = ชำระเงินแล้ว (Paid)
I = ยอดคงเหลือสุทธิ (Outstanding)
J = พนักงานขาย (Sales Person)
```

## Region Mapping

```
R = ใต้
N = เหนือ
Q = อีสานบน
P = อีสานล่าง
M = ตะวันออก
O = กลาง
A-G = กรุงเทพและปริมณทล
```

## Excluded Customer IDs

- "."
- "1"
- "8JB001"

## Color Scheme

```javascript
ใต้: #f4cccc / #ea9999
เหนือ: #d9ead3 / #b6d7a8
อีสานบน: #fff2cc / #ffe599
อีสานล่าง: #fce5cd / #f9cb9c
ตะวันออก: #c9daf8 / #a4c2f4
กลาง: #d9d2e9 / #b4a7d6
กรุงเทพฯ: #ead1dc / #d5a6bd
ลูกค้าบริษัท: #cfe2f3 / #b9c9e5
```

## Report Types

1. All Invoices (ทั้งหมด)
2. 45 Days (ครบกำหนด 45 วัน)
3. 90 Days (ครบกำหนด 90 วัน)
4. Over 90 Days (เกิน 90 วัน)

---

**Ready to code? Start with `npm run dev`! 🚀**
