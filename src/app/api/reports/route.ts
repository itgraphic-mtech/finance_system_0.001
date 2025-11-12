import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { generateArReport } from '@/lib/reports';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get report type from query params
    const url = new URL(req.url);
    const reportType = (url.searchParams.get('type') || 'all') as
      | 'all'
      | '45days'
      | '90days'
      | 'over90days';

    // Generate the report
    const report = await generateArReport(reportType);

    return NextResponse.json(report);
  } catch (err) {
    console.error('Report generation error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
