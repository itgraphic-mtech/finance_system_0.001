# Finance AR System - Implementation Checklist

## Phase 1: ✅ Project Setup (COMPLETE)

- [x] Next.js TypeScript project scaffolding
- [x] Install all dependencies (React, Next.js, Prisma, Tailwind, NextAuth, XLSX, etc.)
- [x] Database schema design with 5 models
- [x] Configuration files (TypeScript, Next.js, Tailwind, ESLint)
- [x] Environment setup (.env.local, .env.example)
- [x] Excel parser utility with region mapping
- [x] Basic UI structure and home page
- [x] Documentation (README.md, SETUP_GUIDE.md, GETTING_STARTED.md)

## Phase 2: 🔐 Authentication (PENDING)

- [ ] Create `src/app/auth/login/page.tsx`
  - Email/password input form
  - Form validation with Zod
  - Error handling and display
  - Link to signup page

- [ ] Create `src/app/auth/signup/page.tsx`
  - New user registration form
  - Password confirmation
  - Email validation
  - Redirect to login on success

- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`
  - NextAuth configuration
  - CredentialsProvider setup
  - User lookup from database
  - Password verification with bcryptjs
  - Session management

- [ ] Create `src/components/NavBar.tsx`
  - Navigation menu
  - User profile dropdown
  - Logout functionality

- [ ] Create `src/middleware.ts` (optional)
  - Protected route checks
  - Redirect unauthenticated users

**Estimated Time**: 2-3 hours

## Phase 3: 📊 Dashboard (PENDING)

- [ ] Create `src/app/dashboard/page.tsx`
  - Welcome message
  - Statistics cards (total invoices, outstanding, regions)
  - Quick action buttons

- [ ] Create `src/components/InvoiceTable.tsx`
  - Display invoice list with columns:
    - Customer ID
    - Customer Name
    - Invoice #
    - Due Date
    - Outstanding Amount
    - Status
    - Days Overdue
  - Sorting by columns
  - Pagination (50 items per page)

- [ ] Create `src/app/invoices/page.tsx`
  - Comprehensive invoice list view
  - Filter by status, region, date range
  - Search by customer name or ID
  - Inline editing (optional)

**Estimated Time**: 3-4 hours

## Phase 4: 📤 File Upload (PENDING)

- [ ] Create `src/app/upload/page.tsx`
  - Drag-and-drop file upload
  - File type validation (xlsx only)
  - File size validation (max 10MB)
  - Progress indicator

- [ ] Create `src/api/invoices/upload/route.ts` (POST endpoint)
  - Receive file from client
  - Parse Excel with excelParser.ts
  - Validate data rows
  - Database transaction for bulk insert
  - Return success/error with count of records

- [ ] Create `src/components/UploadForm.tsx`
  - File input with drag-drop
  - Loading state during upload
  - Success/error messages
  - Result summary

- [ ] Error handling:
  - Invalid file format
  - Missing required columns
  - Duplicate invoice numbers
  - Invalid data types

**Estimated Time**: 3-4 hours

## Phase 5: 📈 AR Report Generation (PENDING)

- [ ] Create `src/lib/reports.ts`
  - Report generation functions:
    - `generateAllInvoicesReport()`
    - `generateWithin45DaysReport()`
    - `generateWithin90DaysReport()`
    - `generateOver90DaysReport()`
  - Group by region
  - Sort by customer ID and name
  - Calculate grand totals

- [ ] Create `src/app/reports/page.tsx`
  - Report type selection (dropdown)
  - Report display with:
    - Report header with date
    - Expandable regional sections
    - Color-coded regions (matching AppScripts)
    - Customer grouping with sub-rows
    - Grand total row

- [ ] Create `src/components/ReportView.tsx`
  - Dropdown/accordion for regional groups
  - Table display for invoice details
  - Summary totals
  - Color coding based on region

- [ ] Color mapping (from AppScripts):
  ```javascript
  ใต้: light="#f4cccc", medium="#ea9999"
  เหนือ: light="#d9ead3", medium="#b6d7a8"
  อีสานบน: light="#fff2cc", medium="#ffe599"
  อีสานล่าง: light="#fce5cd", medium="#f9cb9c"
  ตะวันออก: light="#c9daf8", medium="#a4c2f4"
  กลาง: light="#d9d2e9", medium="#b4a7d6"
  กรุงเทพฯ: light="#ead1dc", medium="#d5a6bd"
  ลูกค้าบริษัท: light="#cfe2f3", medium="#b9c9e5"
  ```

**Estimated Time**: 4-5 hours

## Phase 6: 🗑️ Data Management (PENDING)

- [ ] Create `src/api/invoices/clear/route.ts` (DELETE endpoint)
  - Authenticate user (admin only)
  - Confirmation check
  - Delete all invoices and related uploads
  - Log action to database
  - Return success status

- [ ] Add `src/components/ClearDataButton.tsx`
  - Confirmation dialog before clearing
  - Show count of records to delete
  - Show last upload date
  - Warning message in Thai

- [ ] Create clearing confirmation modal
  - Display warning message
  - Show statistics
  - Cancel/Confirm buttons

**Estimated Time**: 1-2 hours

## Phase 7: 📤 Export Functionality (PENDING)

- [ ] Create export as Excel
  - `src/lib/excelExport.ts`
  - Generate Excel from report data
  - Format with headers and colors
  - Multiple sheets by region

- [ ] Create export as PDF (optional)
  - Use react-pdf or jsPDF
  - Format report for PDF
  - Include charts/summaries

- [ ] Add export buttons to report view
  - Excel button
  - PDF button (optional)

**Estimated Time**: 2-3 hours

## Phase 8: 🧪 Testing & Deployment (PENDING)

- [ ] Testing
  - [ ] Test login/signup flow
  - [ ] Test file upload with various Excel formats
  - [ ] Test report generation for all types
  - [ ] Test data clearing confirmation
  - [ ] Test export functionality
  - [ ] Test responsive design on mobile

- [ ] Database Setup
  - [ ] Create Neon PostgreSQL project
  - [ ] Copy connection string
  - [ ] Run database migrations
  - [ ] Seed sample data (optional)

- [ ] Environment Configuration
  - [ ] Set NEXTAUTH_SECRET
  - [ ] Configure DATABASE_URL for Neon
  - [ ] Set NEXTAUTH_URL to production domain

- [ ] Vercel Deployment
  - [ ] Connect GitHub repository to Vercel
  - [ ] Configure environment variables
  - [ ] Set up custom domain (optional)
  - [ ] Enable auto-deployments
  - [ ] Test production deployment

**Estimated Time**: 3-4 hours

## Total Estimated Time: 20-25 hours

## Development Order Recommendation

1. **Complete Phase 2** (Authentication) - Core functionality required
2. **Complete Phase 4** (Upload) - Data source dependency
3. **Complete Phase 5** (Reports) - Main feature
4. **Complete Phase 3** (Dashboard) - User experience
5. **Complete Phase 6** (Data Mgmt) - Support feature
6. **Complete Phase 7** (Export) - Enhancement
7. **Complete Phase 8** (Testing & Deploy) - Release

## Technology Notes

- **Database**: PostgreSQL on Neon
- **Authentication**: NextAuth.js with credentials
- **File Processing**: XLSX library for Excel
- **Styling**: Tailwind CSS with custom components
- **Validation**: Zod for form validation
- **Type Safety**: Full TypeScript implementation

## Known Constraints

1. Customer ID first character determines region (R, N, Q, P, M, O, A-G)
2. Excel file expected column order (A-J)
3. Excluded customer IDs: ".", "1", "8JB001"
4. Aging buckets: 1-45 days, 46-90 days, 90+ days
5. Max file size: 10MB (configured in .env)

## Success Criteria

✅ All phases complete  
✅ No TypeScript errors  
✅ All features functioning as per spec  
✅ Deployment to Vercel successful  
✅ Report output matches AppScripts format  
✅ UI responsive on mobile/tablet/desktop  
✅ User can upload, view, and export data  
✅ Database clearing protected with confirmation  

---

**Project Status**: Phase 1 Complete ✅  
**Next Phase**: Phase 2 - Authentication  
**Last Updated**: November 12, 2025
