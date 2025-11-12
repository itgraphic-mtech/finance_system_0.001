"use client";
import { useState } from "react";
import NavBar from "@/components/NavBar";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const b64 = Buffer.from(arrayBuffer).toString('base64');
      const res = await fetch('/api/invoices/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, data: b64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setMessage(`Imported ${data.inserted || 0} invoices`);
    } catch (err: any) {
      setMessage(err.message || 'Upload error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Upload Excel</h1>
        <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <div style={{ marginTop: '1rem' }}>
          <button className="btn-primary" onClick={handleUpload} disabled={!file || loading}>
            {loading ? 'Uploading...' : 'Upload and Import'}
          </button>
        </div>
        {message && <div style={{ marginTop: '1rem' }}>{message}</div>}
      </div>
    </>
  );
}
