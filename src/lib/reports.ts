/**
 * AR Report Generation Library
 * Generates reports grouped by region with aging bucket analysis
 */

import { prisma } from '@/lib/db/prisma';
import { getRegionName } from '@/utils/regionMapping';

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  daysOverdue: number;
  agingBucket: string;
  status: string;
  customer: {
    id: string;
    customerId: string;
    customerName: string;
    region: string;
    salesPerson: string;
  };
}

export interface AgingBucketSummary {
  bucket: string;
  count: number;
  totalOutstanding: number;
  percentage: number;
}

export interface RegionGroup {
  region: string;
  invoices: InvoiceRecord[];
  summary: {
    totalInvoices: number;
    totalOutstanding: number;
    agingBuckets: AgingBucketSummary[];
    avgDaysOverdue: number;
  };
}

export interface ArReport {
  reportDate: Date;
  reportType: string;
  totalInvoices: number;
  totalOutstanding: number;
  regions: RegionGroup[];
  overallSummary: {
    totalInvoices: number;
    totalOutstanding: number;
    avgDaysOverdue: number;
    agingBuckets: AgingBucketSummary[];
  };
}

/**
 * Generate AR report with optional aging filter
 * @param reportType: 'all' | '45days' | '90days' | 'over90days'
 * @returns ArReport grouped by region with aging analysis
 */
export async function generateArReport(reportType: 'all' | '45days' | '90days' | 'over90days' = 'all'): Promise<ArReport> {
  // Build filter based on report type
  let agingFilter: { agingBucket?: { in: string[] } } = {};
  
  switch (reportType) {
    case '45days':
      agingFilter = { agingBucket: { in: ['current', '1-45'] } };
      break;
    case '90days':
      agingFilter = { agingBucket: { in: ['1-45', '46-90'] } };
      break;
    case 'over90days':
      agingFilter = { agingBucket: { in: ['over90'] } };
      break;
    case 'all':
    default:
      // No filter, return all
      break;
  }

  // Fetch all invoices matching filter with customer details
  const invoices = await prisma.invoice.findMany({
    where: agingFilter as any,
    include: {
      customer: true,
    },
    orderBy: [{ customer: { region: 'asc' } }, { dueDate: 'asc' }],
  });

  // Group by region name (Thai name), not by region code
  const regionMap = new Map<string, InvoiceRecord[]>();
  for (const invoice of invoices) {
    const regionCode = invoice.customer?.region || 'Unknown';
    // Convert region code to Thai name for grouping
    const regionName = getRegionName(regionCode);
    
    if (!regionMap.has(regionName)) {
      regionMap.set(regionName, []);
    }
    // Convert Decimal fields to numbers
    const invoiceRecord: InvoiceRecord = {
      ...invoice,
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      outstandingAmount: Number(invoice.outstandingAmount),
    } as InvoiceRecord;
    regionMap.get(regionName)!.push(invoiceRecord);
  }

  // Calculate summaries for each region
  const regions: RegionGroup[] = [];
  let grandTotalInvoices = 0;
  let grandTotalOutstanding = 0;
  let grandTotalDaysOverdue = 0;

  for (const [region, regionInvoices] of regionMap) {
    const summary = calculateRegionSummary(regionInvoices);
    regions.push({
      region,
      invoices: regionInvoices,
      summary,
    });

    grandTotalInvoices += summary.totalInvoices;
    grandTotalOutstanding += summary.totalOutstanding;
    grandTotalDaysOverdue += summary.avgDaysOverdue * summary.totalInvoices;
  }

  // Calculate overall aging buckets
  const convertedInvoices = invoices.map((invoice) => ({
    ...invoice,
    totalAmount: Number(invoice.totalAmount),
    paidAmount: Number(invoice.paidAmount),
    outstandingAmount: Number(invoice.outstandingAmount),
  } as InvoiceRecord));
  
  const overallAgingBuckets = calculateAgingBuckets(convertedInvoices);
  const overallAvgDaysOverdue =
    grandTotalInvoices > 0 ? Math.round(grandTotalDaysOverdue / grandTotalInvoices) : 0;

  return {
    reportDate: new Date(),
    reportType,
    totalInvoices: grandTotalInvoices,
    totalOutstanding: grandTotalOutstanding,
    regions: regions.sort((a, b) => getRegionName(a.region).localeCompare(getRegionName(b.region), 'th')),
    overallSummary: {
      totalInvoices: grandTotalInvoices,
      totalOutstanding: grandTotalOutstanding,
      avgDaysOverdue: overallAvgDaysOverdue,
      agingBuckets: overallAgingBuckets,
    },
  };
}

/**
 * Calculate summary stats for a region
 */
function calculateRegionSummary(invoices: InvoiceRecord[]) {
  const totalOutstanding = invoices.reduce((sum, inv) => sum + Number(inv.outstandingAmount), 0);
  const avgDaysOverdue =
    invoices.length > 0
      ? Math.round(invoices.reduce((sum, inv) => sum + inv.daysOverdue, 0) / invoices.length)
      : 0;

  const agingBuckets = calculateAgingBuckets(invoices);

  return {
    totalInvoices: invoices.length,
    totalOutstanding,
    agingBuckets,
    avgDaysOverdue,
  };
}

/**
 * Calculate aging bucket distribution
 */
function calculateAgingBuckets(invoices: InvoiceRecord[]): AgingBucketSummary[] {
  const bucketMap = new Map<string, { count: number; total: number }>();

  // Initialize buckets
  ['current', '1-45', '46-90', 'over90'].forEach((bucket) => {
    bucketMap.set(bucket, { count: 0, total: 0 });
  });

  // Aggregate by bucket
  for (const invoice of invoices) {
    const bucket = invoice.agingBucket || 'current';
    const existing = bucketMap.get(bucket) || { count: 0, total: 0 };
    existing.count++;
    existing.total += Number(invoice.outstandingAmount);
    bucketMap.set(bucket, existing);
  }

  // Calculate percentages
  const totalOutstanding = Array.from(bucketMap.values()).reduce((sum, b) => sum + b.total, 0);

  return [
    { 
      bucket: 'current', 
      count: bucketMap.get('current')!.count, 
      totalOutstanding: bucketMap.get('current')!.total,
      percentage: calculatePercentage(bucketMap.get('current')!.total, totalOutstanding) 
    },
    { 
      bucket: '1-45', 
      count: bucketMap.get('1-45')!.count, 
      totalOutstanding: bucketMap.get('1-45')!.total,
      percentage: calculatePercentage(bucketMap.get('1-45')!.total, totalOutstanding) 
    },
    { 
      bucket: '46-90', 
      count: bucketMap.get('46-90')!.count, 
      totalOutstanding: bucketMap.get('46-90')!.total,
      percentage: calculatePercentage(bucketMap.get('46-90')!.total, totalOutstanding) 
    },
    { 
      bucket: 'over90', 
      count: bucketMap.get('over90')!.count, 
      totalOutstanding: bucketMap.get('over90')!.total,
      percentage: calculatePercentage(bucketMap.get('over90')!.total, totalOutstanding) 
    },
  ].filter((b) => b.count > 0);
}

function calculatePercentage(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

/**
 * Get display labels for aging buckets
 */
export function getAgingBucketLabel(bucket: string): string {
  const labels: Record<string, string> = {
    current: 'Current (Not Due)',
    '1-45': '1-45 Days Overdue',
    '46-90': '46-90 Days Overdue',
    over90: '90+ Days Overdue',
  };
  return labels[bucket] || bucket;
}

/**
 * Get color for aging bucket
 */
export function getAgingBucketColor(bucket: string): string {
  const colors: Record<string, string> = {
    current: '#10b981', // green
    '1-45': '#f59e0b', // amber
    '46-90': '#ef6464', // red
    over90: '#dc2626', // dark red
  };
  return colors[bucket] || '#6b7280';
}
