import * as XLSX from 'xlsx';
import { InvoiceData } from '@/types';

const REGION_MAP: Record<string, string> = {
  'R': 'ใต้',
  'N': 'เหนือ',
  'Q': 'อีสานบน',
  'P': 'อีสานล่าง',
  'M': 'ตะวันออก',
  'O': 'กลาง',
  'A': 'กรุงเทพและปริมณทล',
  'B': 'กรุงเทพและปริมณทล',
  'C': 'กรุงเทพและปริมณทล',
  'D': 'กรุงเทพและปริมณทล',
  'E': 'กรุงเทพและปริมณทล',
  'F': 'กรุงเทพและปริมณทล',
  'G': 'กรุงเทพและปริมณทล',
};

const DEFAULT_REGION = 'ลูกค้าบริษัท';
const EXCLUDED_CUSTOMER_IDS = ['.', '1', '8JB001'];

export function parseExcelFile(buffer: Buffer): InvoiceData[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

  const invoices: InvoiceData[] = [];

  for (const row of rows) {
    // Column mapping: A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8, J=9
    const customerId = String(row[0] || '').trim();
    const customerName = String(row[1] || '').trim();
    const invoiceDate = parseDate(row[2]);
    const invoiceNumber = String(row[4] || '').trim();
    const dueDate = parseDate(row[5]);
    const totalAmount = parseNumber(row[6]);
    const paidAmount = parseNumber(row[7]);
    const outstandingAmount = parseNumber(row[8]);
    const salesPerson = String(row[9] || '').trim();

    // Validation
    if (!customerId || EXCLUDED_CUSTOMER_IDS.includes(customerId)) {
      continue;
    }

    if (!invoiceNumber || !invoiceDate || !dueDate) {
      continue;
    }

    invoices.push({
      customerId,
      customerName,
      invoiceDate,
      invoiceNumber,
      dueDate,
      outstandingAmount,
      totalAmount,
      paidAmount,
      salesPerson,
    });
  }

  return invoices;
}

function parseDate(value: any): Date | null {
  if (!value) return null;
  
  let dateObj: Date | null = null;
  
  if (typeof value === 'number') {
    // Excel date serial number
    const excelDate = new Date((value - 25569) * 86400 * 1000);
    dateObj = excelDate;
  } else if (typeof value === 'string') {
    // Try to parse string date
    dateObj = new Date(value);
  }

  return dateObj && !isNaN(dateObj.getTime()) ? dateObj : null;
}

function parseNumber(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return !isNaN(num) ? num : 0;
  }
  return 0;
}

export function getRegion(customerId: string): string {
  const firstChar = customerId.charAt(0).toUpperCase();
  return REGION_MAP[firstChar] || DEFAULT_REGION;
}

export function calculateDaysOverdue(dueDate: Date, today: Date = new Date()): number {
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  
  const diffTime = todayDateOnly.getTime() - dueDateOnly.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getAgingBucket(daysOverdue: number): string {
  if (daysOverdue <= 0) return 'current';
  if (daysOverdue <= 45) return '1-45';
  if (daysOverdue <= 90) return '46-90';
  return 'over90';
}
