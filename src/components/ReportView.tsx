'use client';

import { useState } from 'react';
import { ArReport, getAgingBucketLabel, getAgingBucketColor } from '@/lib/reports';

interface ReportViewProps {
  report: ArReport;
  onExport?: () => void;
}

export function ReportView({ report, onExport }: ReportViewProps) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

  const toggleRegion = (region: string) => {
    const newSet = new Set(expandedRegions);
    if (newSet.has(region)) {
      newSet.delete(region);
    } else {
      newSet.add(region);
    }
    setExpandedRegions(newSet);
  };

  const toggleCustomer = (customerId: string) => {
    const newSet = new Set(expandedCustomers);
    if (newSet.has(customerId)) {
      newSet.delete(customerId);
    } else {
      newSet.add(customerId);
    }
    setExpandedCustomers(newSet);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Report Header */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
          Accounts Receivable Report
        </h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>
              Generated: {formatDate(new Date(report.reportDate))}
            </p>
            <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>
              Report Type: <strong>{report.reportType === 'all' ? 'All Invoices' : report.reportType}</strong>
            </p>
          </div>
          {onExport && (
            <button
              onClick={onExport}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Export
            </button>
          )}
        </div>
      </div>

      {/* Overall Summary */}
      <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>
            TOTAL INVOICES
          </p>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
            {report.overallSummary.totalInvoices}
          </p>
        </div>
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>
            TOTAL OUTSTANDING
          </p>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
            {formatCurrency(report.overallSummary.totalOutstanding)}
          </p>
        </div>
        <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '6px' }}>
          <p style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '13px', fontWeight: '600' }}>
            AVG DAYS OVERDUE
          </p>
          <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
            {report.overallSummary.avgDaysOverdue}
          </p>
        </div>
      </div>

      {/* Aging Buckets Summary */}
      <div style={{ marginBottom: '30px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '20px' }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          Aging Distribution
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          {report.overallSummary.agingBuckets.map((bucket) => (
            <div key={bucket.bucket} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
              <div
                style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: getAgingBucketColor(bucket.bucket),
                  borderRadius: '2px',
                  marginBottom: '8px',
                }}
              />
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280' }}>
                {getAgingBucketLabel(bucket.bucket)}
              </p>
              <p style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: 'bold' }}>
                {bucket.count} invoices
              </p>
              <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                {formatCurrency(bucket.totalOutstanding)} ({bucket.percentage}%)
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Regional Details */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
          By Region
        </h2>
        {report.regions.map((region) => (
          <div key={region.region} style={{ marginBottom: '15px', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            {/* Region Header */}
            <button
              onClick={() => toggleRegion(region.region)}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#f9fafb',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: expandedRegions.has(region.region) ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: '600' }}>
                  {region.region}
                </h3>
                <p style={{ margin: '0', fontSize: '12px', color: '#6b7280' }}>
                  {region.summary.totalInvoices} invoices • {formatCurrency(region.summary.totalOutstanding)} outstanding
                </p>
              </div>
              <span style={{ fontSize: '18px', color: '#9ca3af' }}>
                {expandedRegions.has(region.region) ? '−' : '+'}
              </span>
            </button>

            {/* Region Details (Expanded) */}
            {expandedRegions.has(region.region) && (
              <div style={{ padding: '15px', backgroundColor: '#fff' }}>
                {/* Region Stats */}
                <div style={{ marginBottom: '15px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>
                      INVOICES
                    </p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                      {region.summary.totalInvoices}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>
                      OUTSTANDING
                    </p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold', color: '#dc2626' }}>
                      {formatCurrency(region.summary.totalOutstanding)}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>
                      AVG DAYS
                    </p>
                    <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
                      {region.summary.avgDaysOverdue}
                    </p>
                  </div>
                </div>

                {/* Aging Buckets for Region */}
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    AGING BREAKDOWN
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {region.summary.agingBuckets.map((bucket) => (
                      <div key={bucket.bucket} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#6b7280' }}>
                            {getAgingBucketLabel(bucket.bucket)}
                          </p>
                          <div
                            style={{
                              width: '100%',
                              height: '8px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${bucket.percentage}%`,
                                height: '100%',
                                backgroundColor: getAgingBucketColor(bucket.bucket),
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                        </div>
                        <div style={{ minWidth: '80px', textAlign: 'right' }}>
                          <p style={{ margin: '0', fontSize: '12px', fontWeight: '600' }}>
                            {bucket.percentage}%
                          </p>
                          <p style={{ margin: '0', fontSize: '11px', color: '#6b7280' }}>
                            {bucket.count}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoices Table - Grouped by Customer with Dropdowns */}
                <div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                    INVOICES
                  </p>
                  <div style={{ overflowX: 'auto' }}>
                    {/* Group invoices by customer */}
                    {(() => {
                      const customerMap = new Map<string, typeof region.invoices>();
                      region.invoices.forEach((inv) => {
                        const customerId = inv.customer.id;
                        if (!customerMap.has(customerId)) {
                          customerMap.set(customerId, []);
                        }
                        customerMap.get(customerId)!.push(inv);
                      });

                      return Array.from(customerMap.entries()).map(([customerId, customerInvoices]) => {
                        const customer = customerInvoices[0].customer;
                        const customerTotal = customerInvoices.reduce(
                          (sum, inv) => sum + Number(inv.totalAmount),
                          0
                        );
                        const customerOutstanding = customerInvoices.reduce(
                          (sum, inv) => sum + Number(inv.outstandingAmount),
                          0
                        );
                        const isExpanded = expandedCustomers.has(customerId);

                        return (
                          <div
                            key={customerId}
                            style={{
                              marginBottom: '12px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            {/* Customer Header - Clickable Dropdown */}
                            <button
                              onClick={() => toggleCustomer(customerId)}
                              style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: isExpanded ? '#f3f4f6' : '#f9fafb',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
                                transition: 'background-color 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                (e.target as HTMLElement).style.backgroundColor = '#efefef';
                              }}
                              onMouseLeave={(e) => {
                                (e.target as HTMLElement).style.backgroundColor = isExpanded ? '#f3f4f6' : '#f9fafb';
                              }}
                            >
                              <div style={{ textAlign: 'left', flex: 1 }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600' }}>
                                  {customer.customerName}
                                </p>
                                <p style={{ margin: '0', fontSize: '11px', color: '#6b7280' }}>
                                  {customer.customerId} • {customerInvoices.length} invoice{customerInvoices.length !== 1 ? 's' : ''} • Total: {formatCurrency(customerTotal)} • Outstanding: {formatCurrency(customerOutstanding)}
                                </p>
                              </div>
                              <span style={{ fontSize: '16px', color: '#9ca3af', marginLeft: '10px' }}>
                                {isExpanded ? '−' : '+'}
                              </span>
                            </button>

                            {/* Customer Invoices Table - Collapsible */}
                            {isExpanded && (
                              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#6b7280', fontSize: '10px' }}>
                                      Invoice #
                                    </th>
                                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '600', color: '#6b7280', fontSize: '10px' }}>
                                      Date
                                    </th>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '600', color: '#6b7280', fontSize: '10px' }}>
                                      Sales Person
                                    </th>
                                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: '#6b7280', fontSize: '10px' }}>
                                      Total
                                    </th>
                                    <th style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600', color: '#6b7280', fontSize: '10px' }}>
                                      Outstanding
                                    </th>
                                    <th style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '600', color: '#6b7280', fontSize: '10px' }}>
                                      Days Overdue
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {customerInvoices.map((inv) => (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                      <td style={{ padding: '8px 12px' }}>
                                        <strong style={{ fontSize: '11px' }}>{inv.invoiceNumber}</strong>
                                      </td>
                                      <td style={{ padding: '8px 12px', textAlign: 'center', fontSize: '10px' }}>
                                        {formatDate(inv.invoiceDate)}
                                      </td>
                                      <td style={{ padding: '8px 12px', fontSize: '10px' }}>
                                        {inv.customer.salesPerson}
                                      </td>
                                      <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px' }}>
                                        {formatCurrency(Number(inv.totalAmount))}
                                      </td>
                                      <td
                                        style={{
                                          padding: '8px 12px',
                                          textAlign: 'right',
                                          color: Number(inv.outstandingAmount) > 0 ? '#dc2626' : '#10b981',
                                          fontWeight: 'bold',
                                          fontSize: '11px',
                                        }}
                                      >
                                        {formatCurrency(Number(inv.outstandingAmount))}
                                      </td>
                                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                        <span
                                          style={{
                                            padding: '3px 8px',
                                            backgroundColor: getAgingBucketColor(inv.agingBucket),
                                            color: 'white',
                                            borderRadius: '3px',
                                            fontSize: '10px',
                                            fontWeight: '600',
                                          }}
                                        >
                                          {inv.daysOverdue}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
