'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { ReportView } from '@/components/ReportView';
import { ArReport } from '@/lib/reports';

type ReportType = 'all' | '45days' | '90days' | 'over90days';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'all', label: 'All Invoices' },
  { value: '45days', label: 'Current & 1-45 Days' },
  { value: '90days', label: '1-90 Days Overdue' },
  { value: 'over90days', label: '90+ Days Overdue' },
];

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>('all');
  const [report, setReport] = useState<ArReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Load report on component mount and when report type changes
  useEffect(() => {
    if (status === 'authenticated') {
      loadReport();
    }
  }, [reportType, status]);

  async function loadReport() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/reports?type=${reportType}`);
      if (!response.ok) {
        throw new Error('Failed to load report');
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!report) return;
    
    try {
      // For now, just log - will implement export in next step
      console.log('Exporting report:', report);
      alert('Export functionality coming soon!');
    } catch (err) {
      alert('Export failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Redirect in progress
  }

  return (
    <>
      <NavBar />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>Reports</h1>
            <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
              Accounts Receivable Analysis
            </p>
          </div>
        </div>

      {/* Controls */}
      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Report Type:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              disabled={loading}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                backgroundColor: 'white',
              }}
            >
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {loading && <span style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #fecaca',
            }}
          >
            {error}
          </div>
        )}

        {report && !loading && <ReportView report={report} onExport={handleExport} />}

        {!report && !loading && !error && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
            <p>No invoices found for this report type.</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
