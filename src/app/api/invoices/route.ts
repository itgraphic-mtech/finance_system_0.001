import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getRegionName } from "@/utils/regionMapping";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = req.nextUrl;
    const search = url.searchParams.get("search") || "";
    const region = url.searchParams.get("region") || "all";
    const salesPerson = url.searchParams.get("salesPerson") || "all";
    const sortBy = url.searchParams.get("sortBy") || "dueDate";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("perPage") || "20", 10);

    // Build where clause (search across invoice and related customer)
    const where: any = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { customer: { customerId: { contains: search, mode: "insensitive" } } },
        { customer: { customerName: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (region && region !== "all") {
      // Region filter might come as region name (Thai), need to get all codes for that name
      // Get all region codes that map to this region name
      const allCodes = Object.entries({
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
      })
        .filter(([_, name]) => name === region)
        .map(([code, _]) => code);

      if (allCodes.length > 0) {
        where.customer = where.customer || {};
        where.customer.region = { in: allCodes };
      }
    }
    
    if (salesPerson && salesPerson !== "all") {
      where.customer = where.customer || {};
      where.customer.salesPerson = salesPerson;
    }

    // Determine order
  const orderBy: any = {};
  if (sortBy === "outstanding") orderBy.outstandingAmount = "desc";
  else if (sortBy === "daysOverdue") orderBy.daysOverdue = "desc";
  else orderBy.dueDate = "asc";

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { customer: true },
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.invoice.count({ where }),
    ]);

    const totalOutstanding = await prisma.invoice.aggregate({
      _sum: { outstandingAmount: true },
      where,
    });

    const allCustomers = await prisma.customer.findMany({ select: { region: true, salesPerson: true } });
    // Group regions by their Thai names to avoid duplicates
    const regionSet = new Set<string>();
    const salesPersonSet = new Set<string>();
    allCustomers.forEach((c: any) => {
      if (c.region) {
        const regionName = getRegionName(c.region);
        regionSet.add(regionName);
      }
      if (c.salesPerson) {
        salesPersonSet.add(c.salesPerson);
      }
    });
    const regions = Array.from(regionSet).sort((a, b) => a.localeCompare(b, 'th'));
    const salesPersons = Array.from(salesPersonSet).sort();

    const formatted = invoices.map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customer?.customerId || "",
      customerName: inv.customer?.customerName || inv.customerName || "",
      region: inv.customer?.region || "",
      salesPerson: inv.customer?.salesPerson || "",
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      outstandingAmount: inv.outstandingAmount,
      daysOverdue: inv.daysOverdue,
      agingBucket: inv.agingBucket,
    }));

    return NextResponse.json({
      invoices: formatted,
      meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
      stats: {
        totalInvoices: total,
        totalOutstanding: totalOutstanding._sum?.outstandingAmount || 0,
        overdueInvoices: await prisma.invoice.count({ where: { ...where, daysOverdue: { gt: 0 } } }),
        regions: regions,
        salesPersons: salesPersons,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
