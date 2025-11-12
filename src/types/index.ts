export interface InvoiceData {
  customerId: string;
  customerName: string;
  invoiceDate: Date;
  invoiceNumber: string;
  dueDate: Date;
  outstandingAmount: number;
  totalAmount: number;
  paidAmount: number;
  salesPerson: string;
}

export interface ReportFilterParams {
  dayLimit?: number;
  dayLimitCondition?: '<=' | '>';
  region?: string;
}

export interface AgingReport {
  region: string;
  customers: CustomerGroup[];
  grandTotal: number;
}

export interface CustomerGroup {
  customerId: string;
  customerName: string;
  invoices: InvoiceData[];
  total: number;
  daysOverdue: number;
}
