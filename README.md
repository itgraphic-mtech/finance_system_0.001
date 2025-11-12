# Finance AR System

Invoice and Accounts Receivable Report Management System built with Next.js, Prisma, and PostgreSQL.

## Features

- 🔐 **User Authentication** - Secure login with NextAuth
- 📊 **Excel Import** - Upload and parse Excel files with invoice data
- 📈 **AR Reports** - Generate aging reports (45 days, 90 days, over 90 days)
- 🗂️ **Regional Grouping** - Organize invoices by region with color coding
- 📋 **Data Management** - View and manage customer invoices
- 🗑️ **Database Clearing** - Clear all data with a single click
- 🚀 **Vercel Ready** - Optimized for deployment on Vercel

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM (supports Neon)
- **Authentication**: NextAuth.js
- **File Processing**: XLSX for Excel parsing

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- PostgreSQL database or Neon account

## Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env.local` with your database connection:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/finance_mtech"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

For Neon PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@neon.tech:5432/database?sslmode=require"
```

### 3. Database Setup

Generate Prisma client and push schema:

```bash
npm run db:push
```

Or use migrations:

```bash
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── lib/
│   ├── auth/        # Authentication logic
│   └── db/          # Database utilities
├── api/             # API routes
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
└── utils/           # Utility functions

prisma/
├── schema.prisma    # Database schema
└── migrations/      # Database migrations
```

## Database Schema

### Models

- **User** - System users for authentication
- **Customer** - Customer/debtor information
- **Invoice** - Invoice details with aging information
- **Upload** - File upload tracking
- **ReportConfig** - Report type configurations

## API Routes

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices/upload` - Upload Excel file
- `DELETE /api/invoices` - Clear all data

### Reports
- `GET /api/reports` - Get report configurations
- `POST /api/reports/generate` - Generate aging report

## Excel File Format

Expected columns in uploaded Excel file:

| Column | Header (Thai) | Type |
|--------|---------------|------|
| A | รหัสลูกค้า | String |
| B | ชื่อลูกหนี้/ลูกค้า | String |
| C | วันที่ | Date |
| D | CD | String (unused) |
| E | เลขที่ใบกำกับ | String |
| F | ครบกำหนด | Date |
| G | รวมเป็นเงิน | Number |
| H | ชำระเงินแล้ว | Number |
| I | ยอดคงเหลือสุทธิ | Number |
| J | พนักงานขาย | String |

## Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

```bash
vercel deploy
```

### Database Setup on Neon

1. Create a project on [Neon](https://neon.tech)
2. Copy connection string to `DATABASE_URL`
3. Run migrations: `npm run db:migrate`

## Development

### Prisma Studio

View and edit database directly:

```bash
npm run db:studio
```

### TypeScript

The project uses strict TypeScript. Run type checking:

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Features to Implement

- [ ] Login page and authentication
- [ ] Dashboard with invoice list
- [ ] Excel file upload functionality
- [ ] AR report generation (45/90/over90 days)
- [ ] Regional grouping and color coding
- [ ] Dropdown report expansion
- [ ] Database clearing functionality
- [ ] Export report functionality
- [ ] User management
- [ ] Audit logging

## License

ISC

## Support

For issues and feature requests, please create an issue in the repository.
