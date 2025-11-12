import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db/prisma';

/**
 * DELETE /api/invoices/clear
 * ลบข้อมูล invoices และ uploads ทั้งหมด
 * ใช้สำหรับการทดสอบเท่านั้น (dev/test mode)
 * ต้องมี authentication
 */
export async function POST() {
  try {
    // ตรวจสอบการ authenticate
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 });
    }

    // รับข้อมูลก่อนลบ
    const invoiceCount = await prisma.invoice.count();
    const uploadCount = await prisma.upload.count();
    const customerCount = await prisma.customer.count();

    // ลบ invoices ทั้งหมด (จะลบ uploads อัตโนมัติถ้ามี relation cascade)
    await prisma.invoice.deleteMany({});

    // ลบ uploads ทั้งหมด
    await prisma.upload.deleteMany({});

    // ลบ customers ทั้งหมด (ถ้าไม่มี invoice ที่อ้างอิง)
    await prisma.customer.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'ลบข้อมูลสำเร็จ',
      cleared: {
        invoices: invoiceCount,
        uploads: uploadCount,
        customers: customerCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Clear data error:', err);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบข้อมูล', details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/invoices/clear
 * ดูข้อมูลก่อนลบ (ไม่ลบจริง)
 */
export async function GET() {
  try {
    // ตรวจสอบการ authenticate
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'ต้องเข้าสู่ระบบก่อน' }, { status: 401 });
    }

    // นับข้อมูล
    const invoiceCount = await prisma.invoice.count();
    const uploadCount = await prisma.upload.count();
    const customerCount = await prisma.customer.count();

    return NextResponse.json({
      success: true,
      counts: {
        invoices: invoiceCount,
        uploads: uploadCount,
        customers: customerCount,
      },
    });
  } catch (err) {
    console.error('Get clear data count error:', err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}
