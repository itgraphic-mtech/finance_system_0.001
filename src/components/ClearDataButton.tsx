'use client';

import { useState } from 'react';

interface ClearCounts {
  invoices: number;
  uploads: number;
  customers: number;
}

export function ClearDataButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<ClearCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleOpenDialog = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/invoices/clear');
      if (!response.ok) {
        throw new Error('ไม่สามารถดึงข้อมูลได้');
      }
      const data = await response.json();
      setCounts(data.counts);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmClear = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/invoices/clear', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถลบข้อมูลได้');
      }

      await response.json();
      setSuccess(true);
      setIsOpen(false);
      setCounts(null);

      // ซ่อนข้อความสำเร็จหลังจาก 3 วินาที
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setCounts(null);
    setError(null);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        {success && (
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded border border-green-300">
            ✓ ลบข้อมูลสำเร็จแล้ว
          </div>
        )}

        {error && (
          <div className="px-4 py-2 bg-red-100 text-red-800 rounded border border-red-300">
            ✗ {error}
          </div>
        )}

        <button
          onClick={handleOpenDialog}
          disabled={loading}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded font-medium transition-colors"
        >
          {loading ? 'กำลังโหลด...' : 'ลบข้อมูลทั้งหมด'}
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                ยืนยันการลบข้อมูล
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                การกระทำนี้ไม่สามารถยกเลิกได้
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {counts && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">จำนวน Invoices:</span>
                    <span className="font-semibold text-gray-900">
                      {counts.invoices} รายการ
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">จำนวน Uploads:</span>
                    <span className="font-semibold text-gray-900">
                      {counts.uploads} ไฟล์
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700">จำนวน Customers:</span>
                    <span className="font-semibold text-gray-900">
                      {counts.customers} ราย
                    </span>
                  </div>
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">
                      ⚠️ ข้อมูลทั้งหมดด้านบนจะถูกลบออกจากฐานข้อมูล
                      กรุณาสำรองข้อมูลก่อนดำเนินการ
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 rounded font-medium transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmClear}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded font-medium transition-colors"
              >
                {loading ? 'กำลังลบ...' : 'ลบข้อมูลทั้งหมด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
