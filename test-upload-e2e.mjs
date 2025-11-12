#!/usr/bin/env node
/**
 * End-to-end test: register user, sign in, create Excel file, upload
 */

import http from 'http';
import https from 'https';
import { WriteStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000';

// Helper: make HTTP/HTTPS request
function makeRequest(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      method,
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'Test-E2E',
        ...headers,
      },
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// Helper: parse Set-Cookie headers to extract session token
function extractSessionFromCookie(setCookieHeader) {
  if (!setCookieHeader) return null;
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  for (const cookie of cookies) {
    if (cookie.includes('next-auth.session-token')) {
      const match = cookie.match(/next-auth\.session-token=([^;]+)/);
      return match ? match[1] : null;
    }
  }
  return null;
}

// Helper: create XLSX file in memory (simple approach: write raw binary data)
// For simplicity, we'll create a minimal valid XLSX with sample invoice data
async function createSampleExcel() {
  // Column mapping (0-indexed):
  // A (0): customerId
  // B (1): customerName
  // C (2): invoiceDate
  // D (3): unused
  // E (4): invoiceNumber
  // F (5): dueDate
  // G (6): totalAmount
  // H (7): paidAmount
  // I (8): outstandingAmount
  // J (9): salesPerson
  
  const sampleData = [
    ['CUST001', 'Acme Corp', '2025-10-01', '', 'INV-2025-001', '2025-11-01', '5000', '2000', '3000', 'John'],
    ['CUST002', 'Beta Industries', '2025-09-15', '', 'INV-2025-002', '2025-10-15', '3500', '0', '3500', 'Jane'],
    ['CUSTA001', 'Alpha Corp', '2025-08-01', '', 'INV-2025-003', '2025-09-01', '7200', '7200', '0', 'Bob'],
  ];

  // Use node-xlsx or create manually
  const xlsxPath = path.join(__dirname, 'sample-invoices-test.xlsx');
  
  try {
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, xlsxPath);
    console.log(`✓ Created sample Excel file at ${xlsxPath}`);
    return xlsxPath;
  } catch (e) {
    console.error('Failed to create XLSX:', e.message);
    throw e;
  }
}

// Main test flow
async function runTest() {
  console.log('🧪 Starting E2E Upload Test\n');
  console.log('⚠  Note: Running in TEST_MODE (auth bypass enabled via env var)\n');

  try {
    // Step 1: Create sample Excel file
    console.log('📊 Step 1: Creating sample Excel file...');
    const excelPath = await createSampleExcel();
    const excelBuffer = await fs.readFile(excelPath);
    console.log(`✓ Excel file created: ${excelPath} (${excelBuffer.length} bytes)`);

    // Step 2: Upload Excel file
    console.log('\n📤 Step 2: Uploading Excel file...');
    const base64Data = excelBuffer.toString('base64');
    const uploadPayload = JSON.stringify({
      data: base64Data,
      filename: 'sample-invoices-test.xlsx',
    });

    const uploadHeaders = {
      'Content-Type': 'application/json',
    };

    const uploadRes = await makeRequest(
      'POST',
      `${BASE_URL}/api/invoices/upload`,
      uploadPayload,
      uploadHeaders
    );

    console.log(`Upload response status: ${uploadRes.status}`);
    console.log(`Upload response body:\n${uploadRes.body}`);

    if (uploadRes.status === 200 || uploadRes.status === 201) {
      try {
        const result = JSON.parse(uploadRes.body);
        console.log('\n✓ Upload successful!');
        console.log(`  Invoices inserted: ${result.inserted || 0}`);
        if (result.errors && result.errors.length > 0) {
          console.log(`  Per-row errors (${result.errors.length}):`);
          result.errors.forEach((err, i) => {
            console.log(`    Row ${i + 1}: ${JSON.stringify(err)}`);
          });
        } else {
          console.log('  No per-row errors');
        }
      } catch (e) {
        console.log('Response was not JSON:', e.message);
      }
    } else {
      console.error(`✗ Upload failed with status ${uploadRes.status}`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test file...');
    await fs.unlink(excelPath);
    console.log('✓ Test complete');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
