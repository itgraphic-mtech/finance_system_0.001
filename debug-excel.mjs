import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const sampleData = [
  ['CUST001', 'Acme Corp', '2025-10-01', '', 'INV-2025-001', '2025-11-01', '5000', '2000', '3000', 'John'],
  ['CUST002', 'Beta Industries', '2025-09-15', '', 'INV-2025-002', '2025-10-15', '3500', '0', '3500', 'Jane'],
];

const ws = XLSX.utils.aoa_to_sheet(sampleData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
XLSX.writeFile(wb, 'test-manual.xlsx');

console.log('✓ Created test-manual.xlsx');

// Now read it back to debug
const wb2 = XLSX.readFile('test-manual.xlsx');
const ws2 = wb2.Sheets[wb2.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws2, { header: 1 });

console.log('\nParsed rows (with header: 1):', rows.length);
console.log('First row:', JSON.stringify(rows[0], null, 2));
console.log('Second row:', JSON.stringify(rows[1], null, 2));

// Test what the parser expects
console.log('\n--- Testing parser expectations ---');
const row = rows[0];
console.log('Column 0 (customerId):', row[0]);
console.log('Column 1 (customerName):', row[1]);
console.log('Column 2 (invoiceDate):', row[2]);
console.log('Column 3 (unused):', row[3]);
console.log('Column 4 (invoiceNumber):', row[4]);
console.log('Column 5 (dueDate):', row[5]);
console.log('Column 6 (totalAmount):', row[6]);
console.log('Column 7 (paidAmount):', row[7]);
console.log('Column 8 (outstandingAmount):', row[8]);
console.log('Column 9 (salesPerson):', row[9]);
