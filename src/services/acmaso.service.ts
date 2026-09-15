import type {
  Account,
  Party,
  Item,
  SalesQuote,
  SalesInvoice,
  SalesPayment,
  PurchaseInvoice,
  PurchasePayment,
  JournalEntry,
  LedgerEntry,
  TaxTemplate,
  PaymentMethod,
  PrintTemplate,
  AccountingSettings,
  DashboardSummary,
  Gstr1ReportData,
  Gstr2ReportData
} from '../types/acmaso';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

const HEADERS = {
  'Content-Type': 'application/json',
  'x-admin-key': 'admin',
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}/api/acmaso${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...HEADERS,
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `API Error: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err: any) {
    console.error(`Acmaso API Request Failed (${endpoint}):`, err);
    throw err;
  }
}

export const acmasoService = {
  // --- Dashboard ---
  getDashboard: () => apiRequest<DashboardSummary>('/dashboard'),

  // --- Chart of Accounts ---
  getAccounts: () => apiRequest<Account[]>('/accounts'),
  createAccount: (data: Partial<Account>) =>
    apiRequest<Account>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id: string, data: Partial<Account>) =>
    apiRequest<Account>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/accounts/${id}`, { method: 'DELETE' }),

  // --- Parties ---
  getParties: (role?: string) =>
    apiRequest<Party[]>(`/parties${role ? `?role=${role}` : ''}`),
  createParty: (data: Partial<Party>) =>
    apiRequest<Party>('/parties', { method: 'POST', body: JSON.stringify(data) }),
  updateParty: (id: string, data: Partial<Party>) =>
    apiRequest<Party>(`/parties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteParty: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/parties/${id}`, { method: 'DELETE' }),

  // --- Items ---
  getItems: () => apiRequest<Item[]>('/items'),
  createItem: (data: Partial<Item>) =>
    apiRequest<Item>('/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id: string, data: Partial<Item>) =>
    apiRequest<Item>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/items/${id}`, { method: 'DELETE' }),

  // --- Sales Quotes ---
  getSalesQuotes: () => apiRequest<SalesQuote[]>('/sales-quotes'),
  createSalesQuote: (data: Partial<SalesQuote>) =>
    apiRequest<SalesQuote>('/sales-quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateSalesQuote: (id: string, data: Partial<SalesQuote>) =>
    apiRequest<SalesQuote>(`/sales-quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  convertQuoteToInvoice: (id: string) =>
    apiRequest<{ data: SalesInvoice; quote: SalesQuote }>(`/sales-quotes/${id}/convert`, { method: 'POST' }),
  deleteSalesQuote: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/sales-quotes/${id}`, { method: 'DELETE' }),

  // --- Sales Invoices ---
  getSalesInvoices: () => apiRequest<SalesInvoice[]>('/sales-invoices'),
  createSalesInvoice: (data: Partial<SalesInvoice>) =>
    apiRequest<SalesInvoice>('/sales-invoices', { method: 'POST', body: JSON.stringify(data) }),
  updateSalesInvoice: (id: string, data: Partial<SalesInvoice>) =>
    apiRequest<SalesInvoice>(`/sales-invoices/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelSalesInvoice: (id: string) =>
    apiRequest<{ data: SalesInvoice; message: string }>(`/sales-invoices/${id}/cancel`, { method: 'POST' }),
  deleteSalesInvoice: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/sales-invoices/${id}`, { method: 'DELETE' }),

  // --- Sales Payments ---
  getSalesPayments: () => apiRequest<SalesPayment[]>('/sales-payments'),
  createSalesPayment: (data: Partial<SalesPayment>) =>
    apiRequest<SalesPayment>('/sales-payments', { method: 'POST', body: JSON.stringify(data) }),
  deleteSalesPayment: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/sales-payments/${id}`, { method: 'DELETE' }),

  // --- Purchase Invoices ---
  getPurchaseInvoices: () => apiRequest<PurchaseInvoice[]>('/purchase-invoices'),
  createPurchaseInvoice: (data: Partial<PurchaseInvoice>) =>
    apiRequest<PurchaseInvoice>('/purchase-invoices', { method: 'POST', body: JSON.stringify(data) }),
  cancelPurchaseInvoice: (id: string) =>
    apiRequest<{ data: PurchaseInvoice; message: string }>(`/purchase-invoices/${id}/cancel`, { method: 'POST' }),
  deletePurchaseInvoice: (id: string) =>
    apiRequest<{ success: boolean; message: string }>(`/purchase-invoices/${id}`, { method: 'DELETE' }),

  // --- Purchase Payments ---
  getPurchasePayments: () => apiRequest<PurchasePayment[]>('/purchase-payments'),
  createPurchasePayment: (data: Partial<PurchasePayment>) =>
    apiRequest<PurchasePayment>('/purchase-payments', { method: 'POST', body: JSON.stringify(data) }),

  // --- Journal Entries ---
  getJournalEntries: () => apiRequest<JournalEntry[]>('/journal-entries'),
  createJournalEntry: (data: Partial<JournalEntry>) =>
    apiRequest<JournalEntry>('/journal-entries', { method: 'POST', body: JSON.stringify(data) }),
  cancelJournalEntry: (id: string) =>
    apiRequest<{ data: JournalEntry; message: string }>(`/journal-entries/${id}/cancel`, { method: 'POST' }),

  // --- General Ledger & Reports ---
  getGeneralLedger: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<{ rows: LedgerEntry[]; summary: any }>(`/reports/general-ledger?${query}`);
  },
  getTrialBalance: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<{ rows: any[]; totals: any }>(`/reports/trial-balance?${query}`);
  },
  getProfitAndLoss: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<{ income: any; directExpenses: any; indirectExpenses: any; summary: any }>(
      `/reports/profit-and-loss?${query}`
    );
  },
  getBalanceSheet: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest<{ assets: any; liabilities: any; equity: any; summary: any }>(
      `/reports/balance-sheet?${query}`
    );
  },

  // --- GST Reports ---
  getGstr1: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    const raw: any = await apiRequest(`/gst/gstr1?${query}`);
    const res = raw?.data || raw || {};
    const totals = res.totals || {};
    const summary = res.summary || {
      taxable_amount: Number(totals.totalTaxableValue ?? totals.taxable_amount ?? 0),
      igst: Number(totals.totalIgst ?? totals.igst ?? 0),
      cgst: Number(totals.totalCgst ?? totals.cgst ?? 0),
      sgst: Number(totals.totalSgst ?? totals.sgst ?? 0),
      cess: Number(totals.totalCess ?? totals.cess ?? 0),
      total_amount: Number(totals.totalInvoiceValue ?? totals.total_amount ?? 0),
    };
    const rows = Array.isArray(res.rows) ? res.rows : [];
    const b2b = Array.isArray(res.b2b) ? res.b2b : rows.filter((r: any) => r.type === 'B2B');
    const b2cl = Array.isArray(res.b2cl) ? res.b2cl : rows.filter((r: any) => r.type === 'B2CL');
    const b2cs = Array.isArray(res.b2cs) ? res.b2cs : rows.filter((r: any) => r.type === 'B2CS');

    return {
      success: true,
      data: {
        period: res.period || {},
        summary,
        b2b,
        b2cl,
        b2cs,
        rows,
        totals,
      } as Gstr1ReportData,
    };
  },
  getGstr2: async (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    const raw: any = await apiRequest(`/gst/gstr2?${query}`);
    const res = raw?.data || raw || {};
    const totals = res.totals || {};
    const summary = res.summary || {
      taxable_amount: Number(totals.totalTaxableValue ?? totals.taxable_amount ?? 0),
      igst: Number(totals.totalIgst ?? totals.igst ?? 0),
      cgst: Number(totals.totalCgst ?? totals.cgst ?? 0),
      sgst: Number(totals.totalSgst ?? totals.sgst ?? 0),
      cess: Number(totals.totalCess ?? totals.cess ?? 0),
      total_itc_available: Number(totals.totalItcAvailable ?? totals.total_itc_available ?? totals.totalTax ?? 0),
      total_amount: Number(totals.totalInvoiceValue ?? totals.total_amount ?? 0),
    };
    const inward_supplies = Array.isArray(res.inward_supplies)
      ? res.inward_supplies
      : Array.isArray(res.rows)
      ? res.rows
      : [];

    return {
      success: true,
      data: {
        period: res.period || {},
        summary,
        inward_supplies,
        rows: res.rows || [],
        totals,
      } as Gstr2ReportData,
    };
  },

  // --- Tax Templates & Payment Methods ---
  getTaxes: () => apiRequest<TaxTemplate[]>('/tax-templates').then(data => ({ success: true, data })),
  getTaxTemplates: () => apiRequest<TaxTemplate[]>('/tax-templates'),
  createTax: (data: Partial<TaxTemplate>) =>
    apiRequest<TaxTemplate>('/tax-templates', { method: 'POST', body: JSON.stringify(data) }).then(data => ({ success: true, data })),
  createTaxTemplate: (data: Partial<TaxTemplate>) =>
    apiRequest<TaxTemplate>('/tax-templates', { method: 'POST', body: JSON.stringify(data) }),
  getPaymentMethods: () => apiRequest<PaymentMethod[]>('/payment-methods'),

  // --- Print Templates ---
  getPrintTemplates: () => apiRequest<PrintTemplate[]>('/print-templates'),
  updatePrintTemplate: (id: string, data: Partial<PrintTemplate>) =>
    apiRequest<PrintTemplate>(`/print-templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // --- Settings & Import ---
  getSettings: () => apiRequest<AccountingSettings>('/settings').then(data => ({ success: true, data })),
  updateSettings: (data: Partial<AccountingSettings>) =>
    apiRequest<AccountingSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }).then(data => ({ success: true, data })),
  resetData: () => apiRequest<any>('/reset', { method: 'POST' }).then(data => ({ success: true, data })),
  importData: ({ entity, csv_data }: { entity: string; csv_data: string }) =>
    apiRequest<any>('/import', { method: 'POST', body: JSON.stringify({ entity, csv_data }) }).then(data => ({ success: true, data })),
  importCsv: (targetType: string, csvText: string) =>
    apiRequest<any>('/import', { method: 'POST', body: JSON.stringify({ targetType, csvText }) }),
};

export const acmasoApi = {
  ...acmasoService,
  getAccounts: async () => ({ success: true, data: await acmasoService.getAccounts() }),
  createAccount: async (data: Partial<Account>) => ({ success: true, data: await acmasoService.createAccount(data) }),
};
