'use client';

import { getRegionName } from '@/utils/regionMapping';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  region: string;
  salesPerson: string;
  invoiceDate: string;
  dueDate: string;
  outstandingAmount: number;
  daysOverdue: number;
  agingBucket: string;
}

export default function InvoiceTable({
  invoices,
}: {
  invoices: Invoice[];
}) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No invoices found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-center">วันที่เอกสาร</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Invoice Number</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Customer ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Customer Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Sales Person</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Region</th>
            <th className="border border-gray-300 px-4 py-2 text-center">วันครบกำหนด</th>
            <th className="border border-gray-300 px-4 py-2 text-right">Outstanding Amount</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Days Overdue</th>
            <th className="border border-gray-300 px-4 py-2 text-center">Aging Bucket</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2 text-center">
                {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : '-'}
              </td>
              <td className="border border-gray-300 px-4 py-2">{inv.invoiceNumber}</td>
              <td className="border border-gray-300 px-4 py-2">{inv.customerId}</td>
              <td className="border border-gray-300 px-4 py-2">{inv.customerName}</td>
              <td className="border border-gray-300 px-4 py-2">{inv.salesPerson}</td>
              <td className="border border-gray-300 px-4 py-2">{getRegionName(inv.region)}</td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : '-'}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                ฿{inv.outstandingAmount.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <span
                  className={`px-2 py-1 rounded ${
                    inv.daysOverdue > 90
                      ? 'bg-red-200 text-red-800'
                      : inv.daysOverdue > 30
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  {inv.daysOverdue}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">{inv.agingBucket}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
