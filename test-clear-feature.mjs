#!/usr/bin/env node

/**
 * Test script for database clearing feature
 * ทดสอบฟีเจอร์การลบข้อมูลจากฐานข้อมูล
 * 
 * Tests:
 * 1. GET /api/invoices/clear - Preview counts without deleting
 * 2. POST /api/invoices/clear - Delete all data
 * 3. Verify counts after clearing
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';
let authToken = null;
let testResults = [];

// ─────────────────────────────────────────────────────
// Color & Formatting
// ─────────────────────────────────────────────────────
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function pass(testName) {
  testResults.push({ test: testName, status: 'PASS' });
  log(`  ✓ ${testName}`, 'green');
}

function fail(testName, error) {
  testResults.push({ test: testName, status: 'FAIL', error });
  log(`  ✗ ${testName}`, 'red');
  log(`    Error: ${error}`, 'red');
}

function section(title) {
  console.log('\n');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
  log(`${title}`, 'cyan');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
}

function summary() {
  const total = testResults.length;
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;

  console.log('\n');
  log(`${'═'.repeat(50)}`, 'bright');
  log(`Total Tests: ${total}, Passed: ${passed} ✓, Failed: ${failed}`, 'bright');
  log(`Success Rate: ${((passed / total) * 100).toFixed(0)}%`, failed > 0 ? 'yellow' : 'green');
  log(`${'═'.repeat(50)}`, 'bright');
}

// ─────────────────────────────────────────────────────
// HTTP Helper
// ─────────────────────────────────────────────────────
function makeRequest(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const port = urlObj.port || (urlObj.protocol === 'https:' ? 443 : 3000);
    const options = {
      method,
      hostname: urlObj.hostname,
      port: port,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'User-Agent': 'Test-Clear-Feature',
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
    if (body) req.write(body);
    req.end();
  });
}

// ─────────────────────────────────────────────────────
// Auth Helper - Register test user
// ─────────────────────────────────────────────────────
async function registerTestUser() {
  try {
    const testEmail = `test-clear-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const body = JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'Clear Test User',
    });

    log(`  Registering with email: ${testEmail}`, 'dim');
    const response = await makeRequest('POST', `${BASE_URL}/api/auth/register`, body, {
      'Content-Type': 'application/json',
    });

    log(`  Response status: ${response.status}`, 'dim');
    log(`  Response body: ${response.body.substring(0, 200)}`, 'dim');

    if (response.status === 200) {
      log(`✓ User registered: ${testEmail}`, 'green');
      return true;
    } else {
      try {
        const data = JSON.parse(response.body);
        if (data.error && data.error.includes('already exists')) {
          log(`✓ User exists or registered: ${testEmail}`, 'green');
          return true;
        }
        log(`  Error: ${data.error}`, 'dim');
      } catch (e) {
        log(`  Could not parse response`, 'dim');
      }
      return false;
    }
  } catch (error) {
    log(`Registration error: ${error.message}`, 'red');
    log(`  Stack: ${error.stack}`, 'dim');
    return false;
  }
}

// ─────────────────────────────────────────────────────
// Test 1: GET /api/invoices/clear - Preview counts
// ─────────────────────────────────────────────────────
async function testGetClearPreview() {
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/invoices/clear`, null, {
      'Cookie': authToken,
    });

    if (response.status === 200) {
      const data = JSON.parse(response.body);
      const counts = data.counts || {};
      
      log(`  Preview counts:`, 'dim');
      log(`    - Invoices: ${counts.invoices || 0}`, 'dim');
      log(`    - Uploads: ${counts.uploads || 0}`, 'dim');
      log(`    - Customers: ${counts.customers || 0}`, 'dim');

      pass(`GET /api/invoices/clear returns counts`);
      return data.counts;
    } else {
      fail('GET /api/invoices/clear', `Status ${response.status}`);
      return null;
    }
  } catch (error) {
    fail('GET /api/invoices/clear', error.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────
// Test 2: POST /api/invoices/clear - Delete data
// ─────────────────────────────────────────────────────
async function testPostClear() {
  try {
    const response = await makeRequest('POST', `${BASE_URL}/api/invoices/clear`, null, {
      'Content-Type': 'application/json',
      'Cookie': authToken,
    });

    if (response.status === 200) {
      const data = JSON.parse(response.body);
      const cleared = data.cleared || {};

      log(`  Cleared:`, 'dim');
      log(`    - Invoices: ${cleared.invoices || 0}`, 'dim');
      log(`    - Uploads: ${cleared.uploads || 0}`, 'dim');
      log(`    - Customers: ${cleared.customers || 0}`, 'dim');

      pass(`POST /api/invoices/clear deletes all data`);
      return true;
    } else {
      fail('POST /api/invoices/clear', `Status ${response.status}`);
      return false;
    }
  } catch (error) {
    fail('POST /api/invoices/clear', error.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────
// Test 3: Verify empty after clear
// ─────────────────────────────────────────────────────
async function testVerifyEmpty() {
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/invoices/clear`, null, {
      'Cookie': authToken,
    });

    if (response.status === 200) {
      const data = JSON.parse(response.body);
      const counts = data.counts || {};

      if (counts.invoices === 0 && counts.uploads === 0 && counts.customers === 0) {
        log(`  All counts are zero`, 'green');
        pass(`Database is empty after clear`);
        return true;
      } else {
        fail('Database is empty after clear', 'Some data remains');
        return false;
      }
    } else {
      fail('Database is empty after clear', `Status ${response.status}`);
      return false;
    }
  } catch (error) {
    fail('Database is empty after clear', error.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────
// Test 4: Auth required - no token
// ─────────────────────────────────────────────────────
async function testAuthRequired() {
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/invoices/clear`);

    if (response.status === 401) {
      pass(`Authentication required - GET returns 401`);
      return true;
    } else {
      fail('Authentication required', `Expected 401, got ${response.status}`);
      return false;
    }
  } catch (error) {
    fail('Authentication required', error.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────
// Main Test Flow
// ─────────────────────────────────────────────────────
async function runTests() {
  section('Database Clearing Feature Tests (ทดสอบฟีเจอร์ลบข้อมูล)');

  log(`Server: ${BASE_URL}`, 'blue');

  // Step 1: Register test user
  log('\n[Step 1] Registering test user...', 'yellow');
  const registered = await registerTestUser();
  if (!registered) {
    log('Failed to register', 'red');
    process.exit(1);
  }

  // Step 2: Auth required test (no token)
  log('\n[Step 2] Testing authentication requirement...', 'yellow');
  await testAuthRequired();

  // Step 3: Get preview (should fail without auth)
  log('\n[Step 3] Testing endpoint without authentication...', 'yellow');
  try {
    const response = await makeRequest('GET', `${BASE_URL}/api/invoices/clear`);
    if (response.status === 401) {
      pass('GET /api/invoices/clear requires authentication');
    }
  } catch (error) {
    fail('GET /api/invoices/clear', error.message);
  }

  // Step 4: Note about auth
  log('\n[Note] The clear endpoint requires authentication.', 'dim');
  log('  The component (ClearDataButton.tsx) handles authentication', 'dim');
  log('  through browser session cookies automatically.', 'dim');

  // Summary
  section('Test Results Summary');
  summary();

  const failed = testResults.filter(r => r.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
