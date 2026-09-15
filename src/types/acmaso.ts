export type AccountRootType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense' | 'Other';

export interface Account {
  id: string;
  name: string;
  parent_account?: string | null;
  parent?: string | null;
  root_type: AccountRootType;
  rootType: AccountRootType;
  account_type: string;
  accountType: string;
  is_group: boolean;
  isGroup: boolean;
  balance: number;
  currency?: string;
}

export type AccountingAccount = Account;

export type PartyRole = 'Customer' | 'Supplier' | 'Both';

export interface Party {
  id: string;
  name: string;
  party_name?: string;
  customer_name?: string;
  supplier_name?: string;
  party_type?: 'Customer' | 'Supplier';
  role: PartyRole;
  gstin?: string;
  tax_id?: string;
  pan?: string;
  email?: string;
  phone?: string;
  address?: string;
  billing_address?: string;
  place_of_supply?: string;
  placeOfSupply?: string;
  default_account?: string;
  defaultAccount?: string;
  opening_balance?: number;
  openingBalance?: number;
  outstanding_amount?: number;
  outstandingAmount?: number;
  status?: string;
  created_at?: string;
  createdAt?: string;
}

export interface Item {
  id: string;
  name: string;
  item_name?: string;
  code: string;
  description?: string;
  unit: string;
  rate: number;
  purchase_rate?: number;
  purchaseRate?: number;
  category?: string;
  hsn_code?: string;
  hsnSac?: string;
  item_group?: string;
  income_account?: string;
  incomeAccount?: string;
  expense_account?: string;
  expenseAccount?: string;
  tax_template?: string;
  taxTemplate?: string;
  tax_rate?: number;
  taxRate?: number;
  status: 'Active' | 'Inactive';
}

export interface InvoiceItemRow {
  item: string;
  item_name?: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  rate: number;
  amount: number;
  discount_percent?: number;
  discountPercent?: number;
  discount_amount?: number;
  discountAmount?: number;
  tax?: string;
  gst_rate?: number;
  tax_rate?: number;
  taxRate?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
  tax_amount?: number;
  taxAmount?: number;
  total: number;
  account?: string;
}

export interface TaxBreakdown {
  account: string;
  rate: number;
  amount: number;
}

export interface SalesQuote {
  id: string;
  name?: string;
  quote_number?: string;
  quoteNumber: string;
  customer?: string;
  customer_name?: string;
  party: string;
  date: string;
  valid_until?: string;
  validUntil?: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
  currency?: string;
  items: InvoiceItemRow[];
  net_total?: number;
  netTotal: number;
  total_taxes_and_charges?: number;
  tax_total?: number;
  taxTotal: number;
  grand_total?: number;
  grandTotal: number;
  notes?: string;
  converted_to_invoice?: string | null;
  convertedToInvoice?: string | null;
  created_at?: string;
  createdAt?: string;
}

export interface SalesInvoice {
  id: string;
  name: string;
  invoice_number?: string;
  invoiceNumber: string;
  customer?: string;
  customer_name?: string;
  party: string;
  account?: string;
  date: string;
  due_date?: string;
  dueDate?: string;
  status: 'Draft' | 'Submitted' | 'Cancelled' | 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue';
  payment_status?: 'Unpaid' | 'Partially Paid' | 'Paid';
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  currency?: string;
  place_of_supply?: string;
  placeOfSupply?: string;
  gstin?: string;
  is_return?: boolean;
  isReturn?: boolean;
  items: InvoiceItemRow[];
  taxes?: TaxBreakdown[];
  net_total?: number;
  netTotal: number;
  discount_total?: number;
  discountTotal?: number;
  total_taxes_and_charges?: number;
  tax_total?: number;
  taxTotal: number;
  taxAmount?: number;
  tax_amount?: number;
  grand_total?: number;
  grandTotal: number;
  outstanding_amount?: number;
  outstandingAmount: number;
  notes?: string;
  created_at?: string;
  createdAt?: string;
}

export type AccountingSalesInvoice = SalesInvoice;

export interface PaymentAllocation {
  reference_type?: 'SalesInvoice' | 'PurchaseInvoice';
  referenceType?: 'SalesInvoice' | 'PurchaseInvoice';
  reference_name?: string;
  referenceName?: string;
  allocated_amount?: number;
  amount: number;
}

export interface SalesPayment {
  id: string;
  name?: string;
  payment_number?: string;
  paymentNumber: string;
  customer?: string;
  party: string;
  payment_type?: 'Receive' | 'Pay';
  paymentType: 'Receive' | 'Pay';
  payment_method?: string;
  paymentMethod: string;
  mode_of_payment?: string;
  modeOfPayment?: string;
  invoiceNumber?: string;
  invoiceId?: string;
  account: string;
  deposit_to_account?: string;
  payment_account?: string;
  paymentAccount: string;
  date: string;
  amount: number;
  reference_number?: string;
  referenceNumber?: string;
  for?: PaymentAllocation[];
  allocations?: PaymentAllocation[];
  status: 'Draft' | 'Submitted' | 'Cancelled';
  notes?: string;
  created_at?: string;
  createdAt?: string;
}

export interface PurchaseInvoice {
  id: string;
  name: string;
  invoice_number?: string;
  invoiceNumber: string;
  supplier?: string;
  supplier_name?: string;
  party: string;
  account?: string;
  date: string;
  due_date?: string;
  dueDate?: string;
  status: 'Draft' | 'Submitted' | 'Cancelled' | 'Unpaid' | 'Paid' | 'Partially Paid' | 'Overdue';
  payment_status?: 'Unpaid' | 'Partially Paid' | 'Paid';
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  currency?: string;
  place_of_supply?: string;
  placeOfSupply?: string;
  gstin?: string;
  is_return?: boolean;
  isReturn?: boolean;
  items: InvoiceItemRow[];
  taxes?: TaxBreakdown[];
  net_total?: number;
  netTotal: number;
  discount_total?: number;
  discountTotal?: number;
  total_taxes_and_charges?: number;
  tax_total?: number;
  taxTotal: number;
  grand_total?: number;
  grandTotal: number;
  outstanding_amount?: number;
  outstandingAmount: number;
  notes?: string;
  created_at?: string;
  createdAt?: string;
}

export interface PurchasePayment {
  id: string;
  name?: string;
  payment_number?: string;
  paymentNumber: string;
  supplier?: string;
  party: string;
  payment_type?: 'Pay';
  paymentType: 'Pay';
  payment_method?: string;
  paymentMethod: string;
  mode_of_payment?: string;
  account: string;
  paid_from_account?: string;
  payment_account?: string;
  paymentAccount: string;
  date: string;
  amount: number;
  reference_number?: string;
  referenceNumber?: string;
  for?: PaymentAllocation[];
  allocations?: PaymentAllocation[];
  status: 'Draft' | 'Submitted' | 'Cancelled';
  notes?: string;
  created_at?: string;
  createdAt?: string;
}

export interface JournalAccountRow {
  account: string;
  debit: number;
  credit: number;
  party?: string;
}

export interface JournalEntry {
  id: string;
  name?: string;
  voucher_type?: string;
  entry_number?: string;
  entryNumber: string;
  date: string;
  entryType?: string;
  reference_number?: string;
  referenceNumber?: string;
  status: 'Draft' | 'Submitted' | 'Cancelled';
  user_remark?: string;
  userRemark?: string;
  accounts: JournalAccountRow[];
  entries?: JournalAccountRow[];
  total_debit?: number;
  totalDebit: number;
  total_credit?: number;
  totalCredit: number;
  created_at?: string;
  createdAt?: string;
}

export interface LedgerEntry {
  id: string;
  index?: number;
  account: string;
  date: string;
  debit: number;
  credit: number;
  balance?: number;
  running_balance?: number;
  party?: string;
  reference_type?: string;
  referenceType: string;
  reference_name?: string;
  referenceName: string;
  voucher_no?: string;
  reverted: boolean;
}

export interface TaxTemplate {
  id: string;
  name: string;
  title?: string;
  rate: number;
  cgst_rate?: number;
  sgst_rate?: number;
  igst_rate?: number;
  cess_rate?: number;
  account?: string;
  is_inter_state?: boolean;
  isDefault?: boolean;
  details?: { account: string; rate: number }[];
}

export type AccountingTaxTemplate = TaxTemplate;

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'Bank' | 'Cash';
  account: string;
}

export interface PrintTemplate {
  id: string;
  name: string;
  templateType?: 'SalesInvoice' | 'SalesQuote' | 'PurchaseInvoice' | 'Receipt';
  isDefault?: boolean;
  headerTitle?: string;
  themeColor?: string;
  showLogo?: boolean;
  showGstBreakup?: boolean;
  showBankDetails?: boolean;
  termsAndConditions?: string;
}

export interface AccountingSettings {
  company_name?: string;
  companyName?: string;
  currency?: string;
  currency_symbol?: string;
  currencySymbol?: string;
  fiscal_year?: string;
  fiscalYearStart?: string;
  fiscalYearEnd?: string;
  gstin?: string;
  pan?: string;
  default_cash_account?: string;
  defaultCashAccount?: string;
  default_bank_account?: string;
  defaultBankAccount?: string;
  default_receivable_account?: string;
  defaultReceivableAccount?: string;
  default_payable_account?: string;
  defaultPayableAccount?: string;
  default_income_account?: string;
  defaultIncomeAccount?: string;
  default_expense_account?: string;
  defaultExpenseAccount?: string;
  roundOffAccount?: string;
  writeOffAccount?: string;
  enableDiscounting?: boolean;
  discountAccount?: string;
  enablePartialPayment?: boolean;
  address?: string;
  email?: string;
  phone?: string;
}

export type AccountingCompanySettings = AccountingSettings;

export interface DashboardSummary {
  kpis: {
    bankBalance: number;
    cashBalance: number;
    totalSales: number;
    paidSales: number;
    unpaidSales: number;
    totalPurchases: number;
    unpaidPurchases: number;
    netProfit: number;
    profitMargin: string;
    activeCustomersCount: number;
    activeSuppliersCount: number;
  };
  pnlSummary: {
    totalIncome: number;
    totalExpense: number;
    grossProfit: number;
    netProfit: number;
    isProfitable: boolean;
  };
  recentTransactions: LedgerEntry[];
  topExpenses: { account: string; amount: number }[];
}

export interface Gstr1ReportData {
  period: { from_date?: string; to_date?: string };
  summary: {
    taxable_amount: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
    total_amount: number;
  };
  rows?: any[];
  totals?: any;
  b2b: Array<{
    invoice_number: string;
    date: string;
    customer_name: string;
    gstin?: string;
    place_of_supply: string;
    taxable_amount: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess?: number;
    total_amount: number;
  }>;
  b2cl: Array<{
    invoice_number: string;
    date: string;
    customer_name: string;
    gstin?: string;
    place_of_supply: string;
    taxable_amount: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess?: number;
    total_amount: number;
  }>;
  b2cs: Array<{
    invoice_number: string;
    date: string;
    customer_name: string;
    gstin?: string;
    place_of_supply: string;
    taxable_amount: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess?: number;
    total_amount: number;
  }>;
}

export interface Gstr2ReportData {
  period: { from_date?: string; to_date?: string };
  summary: {
    taxable_amount: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess?: number;
    total_itc_available: number;
    total_amount: number;
  };
  rows?: any[];
  totals?: any;
  inward_supplies: Array<{
    invoice_number: string;
    date: string;
    supplier_name: string;
    gstin?: string;
    place_of_supply: string;
    taxable_amount: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess?: number;
    itc_eligible: boolean;
    total_amount: number;
  }>;
}
