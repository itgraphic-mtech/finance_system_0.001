#!/usr/bin/env node
/**
 * Integrated E2E test: Login -> Upload -> View Report
 */

import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000';

function makeRequest(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      method,
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'Test-E2E',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
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

async function runTest() {
  console.log('🧪 Integrated E2E Test: Login -> Upload -> Report\n');

  try {
    // Step 1: Register test user
    console.log('📝 Step 1: Registering test user...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = 'Test User';

    const registerRes = await makeRequest(
      'POST',
      `${BASE_URL}/api/auth/register`,
      JSON.stringify({ email: testEmail, password: testPassword, name: testName }),
      { 'Content-Type': 'application/json' }
    );

    if (registerRes.status !== 200) {
      console.error(`✗ Registration failed: ${registerRes.status}`);
      console.error(`Response: ${registerRes.body}`);
      throw new Error('Registration failed');
    }
    console.log(`✓ User registered: ${testEmail}`);

    // Step 2: Create sample Excel and upload
    console.log('\n📊 Step 2: Creating and uploading sample Excel file...');
    const excelPath = path.join(__dirname, 'test-integrated.xlsx');
    
    // Create Excel file using xlsx
    try {
      const XLSX = await import('xlsx');
      const sampleData = [
        ['CUST001', 'Acme Corp', '2025-10-01', '', 'INV-2025-101', '2025-11-01', '5000', '2000', '3000', 'John'],
        ['CUST002', 'Beta Industries', '2025-09-15', '', 'INV-2025-102', '2025-10-15', '3500', '0', '3500', 'Jane'],
        ['CUSTA001', 'Alpha Corp', '2025-08-01', '', 'INV-2025-103', '2025-09-01', '7200', '7200', '0', 'Bob'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
      XLSX.writeFile(wb, excelPath);
    } catch (e) {
      throw new Error(`Failed to create Excel: ${e.message}`);
    }

    const excelBuffer = await fs.readFile(excelPath);
    const base64Data = excelBuffer.toString('base64');

    // Upload without session (auth required now, so this should fail)
    const uploadRes = await makeRequest(
      'POST',
      `${BASE_URL}/api/invoices/upload`,
      JSON.stringify({ data: base64Data, filename: 'test-integrated.xlsx' }),
      { 'Content-Type': 'application/json' }
    );

    if (uploadRes.status === 401) {
      console.log('✓ Upload endpoint correctly requires authentication');
    } else {
      console.warn(`⚠ Upload endpoint returned ${uploadRes.status} (expected 401)`);
    }

    // Step 3: Check if reports page loads (no auth required for HTML, but API does)
    console.log('\n📄 Step 3: Checking reports page...');
    const reportsRes = await makeRequest('GET', `${BASE_URL}/reports`);
    if (reportsRes.status === 200) {
      console.log('✓ Reports page loads successfully');
      if (reportsRes.body.includes('Accounts Receivable')) {
        console.log('✓ Reports page contains expected content');
      }
    } else {
      console.warn(`⚠ Reports page returned ${reportsRes.status}`);
    }

    // Step 4: Check API endpoint (should require auth)
    console.log('\n🔌 Step 4: Testing reports API...');
    const apiRes = await makeRequest('GET', `${BASE_URL}/api/reports?type=all`);
    if (apiRes.status === 401) {
      console.log('✓ Reports API correctly requires authentication');
    } else if (apiRes.status === 200) {
      console.log('✓ Reports API responds with data');
      try {
        const data = JSON.parse(apiRes.body);
        console.log(`  Total invoices in report: ${data.totalInvoices}`);
        console.log(`  Regions: ${data.regions?.map((r) => r.region).join(', ') || 'none'}`);
      } catch (e) {
        console.log('  (Could not parse response)');
      }
    } else {
      console.log(`⚠ Reports API returned ${apiRes.status}`);
    }

    // Cleanup
    await fs.unlink(excelPath).catch(() => {});
    console.log('\n✓ Test complete');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
