import { NextResponse } from 'next/server';
import { parseExcelFile } from '@/utils/excelParser';
import { prisma } from '@/lib/db/prisma';
import { getServerSession } from 'next-auth/next';

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

function calcDaysOverdue(due?: Date | null) {
  if (!due) return 0;
  const days = Math.ceil((Date.now() - new Date(due).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { filename, data } = body as { filename?: string; data?: string };
    if (!data) return NextResponse.json({ error: 'No file data' }, { status: 400 });

    const buffer = Buffer.from(data, 'base64');
    const fileSize = buffer.byteLength;
    const maxSize = Number(process.env.MAX_FILE_SIZE || DEFAULT_MAX_SIZE);
    if (fileSize > maxSize) {
      return NextResponse.json({ error: `File too large. Max ${maxSize} bytes` }, { status: 413 });
    }

    const name = filename || `upload-${Date.now()}.xlsx`;
    const lower = name.toLowerCase();
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
      return NextResponse.json({ error: 'Invalid file type. Only .xlsx/.xls allowed' }, { status: 400 });
    }

    // Parse invoices from Excel
    const invoices = parseExcelFile(buffer);
    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ error: 'No invoices found in file' }, { status: 400 });
    }

    // Create an Upload record
    const upload = await prisma.upload.create({
      data: {
        fileName: name,
        originalFileName: name,
        fileSize,
        uploadedBy: session?.user ? ((session.user as any).id || (session.user as any).email || 'unknown') : 'test-user',
      },
    });

    // Collect unique customer codes from file
    const uniqueCustomers = new Map<string, { customerId: string; customerName: string; region: string; salesPerson: string }>();
    for (const inv of invoices) {
      if (!uniqueCustomers.has(inv.customerId)) {
        uniqueCustomers.set(inv.customerId, {
          customerId: inv.customerId,
          customerName: inv.customerName,
          region: inv.customerId ? inv.customerId.charAt(0) : '',
          salesPerson: inv.salesPerson || 'N/A',
        });
      }
    }

    const customerIds = Array.from(uniqueCustomers.keys()).filter(Boolean);

    // Find existing customers
  const existing = await prisma.customer.findMany({ where: { customerId: { in: customerIds } } });
  const existingMap = new Map(existing.map((c: any) => [c.customerId, c]));

    // Create new customers in bulk
    const customersToCreate = [] as any[];
    for (const [cid, info] of uniqueCustomers.entries()) {
      if (!existingMap.has(cid)) {
        customersToCreate.push({ 
          customerId: info.customerId, 
          customerName: info.customerName, 
          region: info.region,
          salesPerson: info.salesPerson,
        });
      }
    }
    if (customersToCreate.length > 0) {
      await prisma.customer.createMany({ data: customersToCreate, skipDuplicates: true });
    }

    // Refresh mapping of customerId -> internal id
    const allCustomers = await prisma.customer.findMany({ where: { customerId: { in: customerIds } } });
    const customerExternalToId = new Map<string, string>();
    for (const c of allCustomers) customerExternalToId.set(c.customerId, c.id);

    // Prepare invoice rows for bulk insert. Map external customerId -> internal id
    const invoiceRows = invoices.map((inv: any) => ({
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      outstandingAmount: inv.outstandingAmount,
      customerId: customerExternalToId.get(inv.customerId) || null,
      daysOverdue: calcDaysOverdue(inv.dueDate),
      agingBucket: inv.dueDate ? (function(d: any){ const days = Math.ceil((Date.now()-new Date(d).getTime())/(1000*60*60*24)); if(days<=0) return 'current'; if(days<=45) return '1-45'; if(days<=90) return '46-90'; return 'over90'; })(inv.dueDate) : 'current',
      uploadId: upload.id,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Attempt bulk insert. On failure (e.g., unique constraint), fall back to per-row insert and collect errors.
    let inserted = 0;
    const errors: Array<{ invoiceNumber?: string; index: number; error: string }> = [];
    try {
      // Remove rows where customerId mapping failed (shouldn't happen unless missing)
      const validRows = invoiceRows.filter((r): r is typeof invoiceRows[0] & { customerId: string } => r.customerId !== null);
      if (validRows.length > 0) {
        await prisma.invoice.createMany({ data: validRows, skipDuplicates: true });
        inserted = validRows.length;
      }
      // For rows with missing customerId, record errors
      invoiceRows.forEach((r, idx) => {
        if (!r.customerId) errors.push({ invoiceNumber: r.invoiceNumber, index: idx, error: 'Missing customer mapping' });
      });
    } catch (bulkErr: any) {
      console.warn('Bulk insert failed, falling back to per-row insert', bulkErr?.message || bulkErr);
      // fallback
      for (let i = 0; i < invoiceRows.length; i++) {
        const row = invoiceRows[i];
        try {
          if (!row.customerId) throw new Error('Missing customer mapping');
          await prisma.invoice.create({ data: row as any });
          inserted++;
        } catch (rowErr: any) {
          errors.push({ invoiceNumber: row.invoiceNumber, index: i, error: (rowErr?.message || String(rowErr)) });
        }
      }
    }

    // Update upload record with invoiceCount and mark completed
    await prisma.upload.update({ where: { id: upload.id }, data: { invoiceCount: inserted, processingStatus: errors.length ? 'completed' : 'completed' } });

    return NextResponse.json({ inserted, errors });
  } catch (err) {
    console.error('Upload error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
