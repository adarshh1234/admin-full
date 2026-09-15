import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

interface BankAccountRecord {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  status: 'Active' | 'Primary' | 'Escrow' | 'Restricted';
}

interface ChequeRecord {
  chequeNo: string;
  payee: string;
  bankAccount: string;
  amount: number;
  date: string;
  type: 'Issued' | 'Upcoming';
  status: 'Cleared' | 'In Clearing' | 'Scheduled' | 'Pending Approval';
}

const BANK_ACCOUNTS: BankAccountRecord[] = [
  {
    id: 'BA-01',
    name: 'Curemaso Core Operating Account',
    bank: 'JPMorgan Chase Bank',
    accountNumber: '•••• 8492',
    accountType: 'Commercial Checking',
    balance: 840000,
    status: 'Primary',
  },
  {
    id: 'BA-02',
    name: 'Strategic Treasury & Liquid Yield',
    bank: 'Goldman Sachs Asset Management',
    accountNumber: '•••• 3128',
    accountType: 'Money Market Reserve (5.15% APY)',
    balance: 1250000,
    status: 'Active',
  },
  {
    id: 'BA-03',
    name: 'International Escrow & Multi-Currency',
    bank: 'Standard Chartered Global',
    accountNumber: '•••• 9041',
    accountType: 'Escrow & Settlements',
    balance: 420000,
    status: 'Escrow',
  },
  {
    id: 'BA-04',
    name: 'Statutory Payroll & Tax Escrow',
    bank: 'Silicon Valley Bank / First Citizens',
    accountNumber: '•••• 6714',
    accountType: 'Statutory Payroll Checking',
    balance: 310000,
    status: 'Restricted',
  },
  {
    id: 'BA-05',
    name: 'APAC Regional Healthcare Operating',
    bank: 'HDFC Enterprise Bank',
    accountNumber: '•••• 5520',
    accountType: 'Corporate Current Account',
    balance: 630000,
    status: 'Active',
  },
];

const CHEQUES_ISSUED: ChequeRecord[] = [
  {
    chequeNo: 'CHQ-99201',
    payee: 'AWS Cloud & Diagnostic GPU Cluster',
    bankAccount: 'JPMorgan Chase (•••• 8492)',
    amount: 14200,
    date: '2026-09-11',
    type: 'Issued',
    status: 'Cleared',
  },
  {
    chequeNo: 'CHQ-99202',
    payee: 'Apollo Diagnostic Lab Test Kits & Consumables',
    bankAccount: 'JPMorgan Chase (•••• 8492)',
    amount: 28500,
    date: '2026-09-12',
    type: 'Issued',
    status: 'In Clearing',
  },
  {
    chequeNo: 'CHQ-99203',
    payee: 'MedEquip Express Mobility Vans Fleet Maintenance',
    bankAccount: 'HDFC Enterprise (•••• 5520)',
    amount: 9400,
    date: '2026-09-13',
    type: 'Issued',
    status: 'In Clearing',
  },
  {
    chequeNo: 'CHQ-99204',
    payee: 'Global Clinical Compliance & Legal Retainer',
    bankAccount: 'Standard Chartered (•••• 9041)',
    amount: 18000,
    date: '2026-09-14',
    type: 'Issued',
    status: 'Cleared',
  },
];

const UPCOMING_CHEQUES: ChequeRecord[] = [
  {
    chequeNo: 'CHQ-99205',
    payee: 'Q3 Enterprise EHR Security Audit Partners',
    bankAccount: 'JPMorgan Chase (•••• 8492)',
    amount: 22000,
    date: '2026-09-18',
    type: 'Upcoming',
    status: 'Scheduled',
  },
  {
    chequeNo: 'CHQ-99206',
    payee: 'Regional Hospital Network Integration CapEx',
    bankAccount: 'Goldman Sachs (•••• 3128)',
    amount: 65000,
    date: '2026-09-24',
    type: 'Upcoming',
    status: 'Pending Approval',
  },
  {
    chequeNo: 'CHQ-99207',
    payee: 'Quarterly Staff Incentive & Doctor Advocate Bonus',
    bankAccount: 'SVB / First Citizens (•••• 6714)',
    amount: 42800,
    date: '2026-09-30',
    type: 'Upcoming',
    status: 'Scheduled',
  },
];

export default function CashFlowPage() {
  const { monthlyRows, duesData, recurringExpenses } = useDashboard();
  const [chequeView, setChequeView] = useState<'issued' | 'upcoming'>('issued');

  const totalMonthlyRecurring = useMemo(
    () => recurringExpenses.reduce((acc, r) => acc + r.monthly, 0),
    [recurringExpenses],
  );

  const pendingDuesTotal = useMemo(
    () => duesData.filter((d) => d.status !== 'Paid').reduce((acc, d) => acc + d.amount, 0),
    [duesData],
  );

  // Core Monthly Cash Flow Calculations
  const cashFlowData = useMemo(() => {
    return monthlyRows.map((m) => {
      const inflow = (m.subRev || 0) + (m.adRev || 0);
      const outflow = (inflow * 0.45) + (totalMonthlyRecurring * 0.5);
      const netCash = inflow - outflow;
      return {
        month: m.month,
        inflow,
        outflow,
        netCash,
        burnRate: outflow > inflow ? outflow - inflow : 0,
        margin: inflow > 0 ? ((netCash / inflow) * 100).toFixed(1) : '0.0',
      };
    });
  }, [monthlyRows, totalMonthlyRecurring]);

  const totalInflows = cashFlowData.reduce((acc, c) => acc + c.inflow, 0);
  const totalOutflows = cashFlowData.reduce((acc, c) => acc + c.outflow, 0);
  const totalNetCash = totalInflows - totalOutflows;

  // 1. Total Collections data (Daily, Weekly, Monthly, Quarterly)
  const totalCollections = [
    {
      period: 'Daily',
      amount: 14850,
      icon: 'fa-calendar-day',
      growth: '+12.4%',
      description: 'Gross collections received within the last 24 hours (vs yesterday $13,210)',
      badgeClass: 'mis-tag-green',
      bgColor: '#f0fdf4',
      borderColor: '#dcfce7',
      textColor: '#166534',
    },
    {
      period: 'Weekly',
      amount: 94200,
      icon: 'fa-calendar-week',
      growth: '+18.1%',
      description: 'Total collections over the trailing 7-day cycle (vs prior week $79,750)',
      badgeClass: 'mis-tag-green',
      bgColor: '#f0fdf4',
      borderColor: '#dcfce7',
      textColor: '#166534',
    },
    {
      period: 'Monthly',
      amount: 382400,
      icon: 'fa-calendar-alt',
      growth: '+22.5%',
      description: 'Total collections for the current 30-day period (vs prior month $312,100)',
      badgeClass: 'mis-tag-green',
      bgColor: '#f0fdf4',
      borderColor: '#dcfce7',
      textColor: '#166534',
    },
    {
      period: 'Quarterly',
      amount: 1146800,
      icon: 'fa-chart-pie',
      growth: '+28.0%',
      description: 'Consolidated collections across the 90-day quarter (vs prior quarter $896,000)',
      badgeClass: 'mis-tag-green',
      bgColor: '#f0fdf4',
      borderColor: '#dcfce7',
      textColor: '#166534',
    },
  ];

  // 2. Total Expenses data (Daily, Weekly, Monthly, Quarterly)
  const totalExpenses = [
    {
      period: 'Daily',
      amount: 6420,
      icon: 'fa-calendar-day',
      burnRate: '43.2% ratio',
      description: 'Daily operational burn and immediate vendor settlement disbursements',
      badgeClass: 'mis-tag-red',
      bgColor: '#fef2f2',
      borderColor: '#fee2e2',
      textColor: '#991b1b',
    },
    {
      period: 'Weekly',
      amount: 41800,
      icon: 'fa-calendar-week',
      burnRate: '44.3% ratio',
      description: 'Weekly commitments, contractor remuneration, and recurring services',
      badgeClass: 'mis-tag-red',
      bgColor: '#fef2f2',
      borderColor: '#fee2e2',
      textColor: '#991b1b',
    },
    {
      period: 'Monthly',
      amount: 168500,
      icon: 'fa-calendar-alt',
      burnRate: '44.0% ratio',
      description: 'Fixed payroll, clinic facility leases, diagnostic EMIs, and SaaS licenses',
      badgeClass: 'mis-tag-red',
      bgColor: '#fef2f2',
      borderColor: '#fee2e2',
      textColor: '#991b1b',
    },
    {
      period: 'Quarterly',
      amount: 505200,
      icon: 'fa-chart-pie',
      burnRate: '44.0% ratio',
      description: 'Quarterly total operating CapEx, statutory compliance, and infrastructure',
      badgeClass: 'mis-tag-red',
      bgColor: '#fef2f2',
      borderColor: '#fee2e2',
      textColor: '#991b1b',
    },
  ];

  // Upcoming Expenses data across four separate timeframe categories
  const upcomingExpensesList = [
    {
      period: 'Daily',
      timeframeLabel: 'Upcoming expenses within the next 24–48 hours',
      category: 'Vendor Settlements, Emergency Cloud Scaling & Clinic Batch Payouts',
      amount: 8640,
      itemsCount: '4 Urgent Batches',
      priority: 'Immediate (24–48h)',
      icon: 'fa-clock',
      badgeClass: 'mis-tag-red',
      bgColor: '#fef2f2',
      borderColor: '#fee2e2',
      textColor: '#991b1b',
    },
    {
      period: 'Weekly',
      timeframeLabel: 'Upcoming expenses within the next 7 days',
      category: 'Contractor Remuneration, Ad Platform Replenishment & Software Subscriptions',
      amount: 38200,
      itemsCount: '12 Line Items',
      priority: 'Within 7 Days',
      icon: 'fa-calendar-week',
      badgeClass: 'mis-tag-amber',
      bgColor: '#fffbeb',
      borderColor: '#fef3c7',
      textColor: '#92400e',
    },
    {
      period: 'Monthly',
      timeframeLabel: 'Upcoming expenses within the next 30 days',
      category: 'Medical Staff Payroll, Diagnostic Facility Leases & Medical Equipment EMIs',
      amount: 154800,
      itemsCount: '28 Invoices',
      priority: 'Within 30 Days',
      icon: 'fa-calendar-alt',
      badgeClass: 'mis-tag-blue',
      bgColor: '#eff6ff',
      borderColor: '#dbeafe',
      textColor: '#1e40af',
    },
    {
      period: 'Quarterly',
      timeframeLabel: 'Upcoming expenses within the next 90 days',
      category: 'Annual Hospital EHR Integrations, Clinical Trial Compliance & Statutory Taxes',
      amount: 442000,
      itemsCount: '9 Strategic CapEx',
      priority: 'Within 90 Days',
      icon: 'fa-chart-pie',
      badgeClass: 'mis-tag-green',
      bgColor: '#f0fdf4',
      borderColor: '#dcfce7',
      textColor: '#166534',
    },
  ];

  // Cash in Bank Accounts across Horizons
  const cashInBankHorizons = [
    {
      horizon: 'Daily Instant Cash',
      subtext: 'Immediately available in operating checking accounts',
      amount: 1150000,
      liquidity: '100% Liquid',
      coverage: '38 Days OpEx',
      barColor: '#2563eb',
    },
    {
      horizon: 'Weekly Accessible',
      subtext: 'High yield treasury & overnight institutional liquidity',
      amount: 1820000,
      liquidity: 'T+1 Settlement',
      coverage: '60 Days OpEx',
      barColor: '#16a34a',
    },
    {
      horizon: 'Monthly Operating Reserve',
      subtext: 'Combined commercial checking, regional & payroll reserves',
      amount: 2640000,
      liquidity: 'Instant / Working Capital',
      coverage: '88 Days OpEx',
      barColor: '#d97706',
    },
    {
      horizon: 'Quarterly Strategic Treasury',
      subtext: 'Total consolidated bank balance & cross-border escrows',
      amount: 3450000,
      liquidity: 'Full Consolidated Balance',
      coverage: '115 Days OpEx',
      barColor: '#7c3aed',
    },
  ];

  const totalBankBalance = useMemo(
    () => BANK_ACCOUNTS.reduce((acc, b) => acc + b.balance, 0),
    [],
  );

  const totalChequesIssued = useMemo(
    () => CHEQUES_ISSUED.reduce((acc, c) => acc + c.amount, 0),
    [],
  );

  const totalUpcomingCheques = useMemo(
    () => UPCOMING_CHEQUES.reduce((acc, c) => acc + c.amount, 0),
    [],
  );

  const chartData = {
    labels: cashFlowData.map((c) => c.month),
    datasets: [
      { label: 'Cash Inflow ($)', data: cashFlowData.map((c) => c.inflow), backgroundColor: '#2E7D32' },
      { label: 'Cash Outflow ($)', data: cashFlowData.map((c) => c.outflow), backgroundColor: '#C62828' },
      { label: 'Net Cash Flow ($)', data: cashFlowData.map((c) => c.netCash), backgroundColor: '#2F5597' },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { autoSkip: false } } },
  };

  return (
    <section id="tab-cashflow" className="mis-tab-panel">
      <div className="mis-section-title">Cash Flow &amp; Treasury Operations</div>
      <div className="mis-section-desc">
        Comprehensive analysis of operating inflows, capital disbursements, monthly cash burn/surplus, and liquidity runways.
      </div>
      <div className="mis-formula-note">
        Net Cash Flow = Cash Inflows − Cash Outflows · Operating Margin = (Net Cash Flow / Inflow) × 100 · Runway = Liquid Cash / Monthly Burn.
      </div>

      {/* Main Bar Chart */}
      <div className="mis-chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* =========================================================================
       * SECTION 1: Total Collections (4 Separate Cards)
       * ========================================================================= */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ color: 'var(--mis-navy)', margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-hand-holding-usd" style={{ color: '#16a34a' }} />
              Total Collections
            </h3>
            <div style={{ fontSize: 12, color: '#6b7a99' }}>
              Consolidated gross revenue received across daily, weekly, monthly, and quarterly billing cycles.
            </div>
          </div>
          <span className="mis-tag mis-tag-green" style={{ fontSize: 12 }}>
            Quarterly Total: <strong>${totalCollections[3].amount.toLocaleString()}</strong>
          </span>
        </div>

        {/* 4 Distinct Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
          {totalCollections.map((item) => (
            <div
              key={item.period}
              className="mis-internal-box"
              style={{
                background: item.bgColor,
                border: `1px solid ${item.borderColor}`,
                borderRadius: 12,
                padding: '16px 18px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: item.textColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className={`fas ${item.icon}`} /> {item.period}
                </span>
                <span className={`mis-tag ${item.badgeClass}`} style={{ fontSize: 11 }}>
                  {item.growth}
                </span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: item.textColor, margin: '6px 0 4px 0' }}>
                ${item.amount.toLocaleString()}
              </div>

              <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4, marginTop: 4 }}>
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
       * SECTION 2: Total Expenses (4 Separate Cards)
       * ========================================================================= */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ color: 'var(--mis-navy)', margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-receipt" style={{ color: '#dc2626' }} />
              Total Expenses
            </h3>
            <div style={{ fontSize: 12, color: '#6b7a99' }}>
              Operational disbursements, vendor payouts, and capital expenditures across tracking intervals.
            </div>
          </div>
          <span className="mis-tag mis-tag-red" style={{ fontSize: 12 }}>
            Quarterly Total: <strong>${totalExpenses[3].amount.toLocaleString()}</strong>
          </span>
        </div>

        {/* 4 Distinct Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
          {totalExpenses.map((item) => (
            <div
              key={item.period}
              className="mis-internal-box"
              style={{
                background: item.bgColor,
                border: `1px solid ${item.borderColor}`,
                borderRadius: 12,
                padding: '16px 18px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: item.textColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className={`fas ${item.icon}`} /> {item.period}
                </span>
                <span className={`mis-tag ${item.badgeClass}`} style={{ fontSize: 11 }}>
                  {item.burnRate}
                </span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: item.textColor, margin: '6px 0 4px 0' }}>
                ${item.amount.toLocaleString()}
              </div>

              <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4, marginTop: 4 }}>
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
       * SECTION: Upcoming Expenses
       * ========================================================================= */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ color: 'var(--mis-navy)', margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="fas fa-file-invoice-dollar" style={{ color: '#d97706' }} />
              Upcoming Expenses
            </h3>
            <div style={{ fontSize: 12, color: '#6b7a99' }}>
              Forward projected commitments categorized into Daily (24–48h), Weekly (7d), Monthly (30d), and Quarterly (90d) horizons.
            </div>
          </div>
          <span className="mis-tag mis-tag-amber" style={{ fontSize: 12 }}>
            Next 90-Day Total: <strong>${upcomingExpensesList.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}</strong>
          </span>
        </div>

        {/* 4 Distinct Timeframe Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
          {upcomingExpensesList.map((exp) => (
            <div
              key={exp.period}
              className="mis-internal-box"
              style={{
                background: exp.bgColor,
                border: `1px solid ${exp.borderColor}`,
                borderRadius: 12,
                padding: '16px 18px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: exp.textColor, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className={`fas ${exp.icon}`} /> {exp.period}
                </span>
                <span className={`mis-tag ${exp.badgeClass}`} style={{ fontSize: 11 }}>
                  {exp.itemsCount}
                </span>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: exp.textColor, margin: '6px 0 4px 0' }}>
                ${exp.amount.toLocaleString()}
              </div>

              <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4, marginTop: 4 }}>
                {exp.timeframeLabel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
       * SECTION: Cash in Bank Accounts (Daily, Weekly, Monthly, Quarterly)
       * ========================================================================= */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ color: 'var(--mis-navy)', margin: 0, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-vault" style={{ color: '#16a34a' }} />
            Cash in Bank Accounts
          </h3>
          <span className="mis-tag mis-tag-blue" style={{ fontSize: 12 }}>
            Total Liquid Depth: ${totalBankBalance.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {cashInBankHorizons.map((h) => (
            <div
              key={h.horizon}
              className="mis-internal-box"
              style={{
                background: '#ffffff',
                border: '1px solid #e9edf4',
                borderRadius: 12,
                padding: '16px 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1F3864' }}>{h.horizon}</div>
                  <div style={{ fontSize: 11, color: '#8e9bb5', marginTop: 2 }}>{h.subtext}</div>
                </div>
              </div>

              <div style={{ fontSize: 22, fontWeight: 800, color: '#1a2540', margin: '8px 0' }}>
                ${h.amount.toLocaleString()}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7a99', borderTop: '1px solid #f1f5f9', paddingTop: 6 }}>
                <span><strong>Access:</strong> {h.liquidity}</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{h.coverage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
       * SECTION: Bank Accounts & Cheque Ledger
       * ========================================================================= */}
      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ color: 'var(--mis-navy)', margin: 0, fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-university" style={{ color: '#2563eb' }} />
            Bank Accounts &amp; Cheque Ledger
          </h3>
          <span style={{ fontSize: 12, color: '#6b7a99' }}>
            5 Connected Institutional Accounts
          </span>
        </div>

        {/* 4a: Master Bank Accounts Table */}
        <div className="mis-table-responsive" style={{ marginBottom: 20 }}>
          <h4 style={{ color: 'var(--mis-navy)', margin: '0 0 8px 0', fontSize: 14, fontWeight: 700 }}>
            Active Corporate Bank Accounts
          </h4>
          <table className="mis-table" id="mis-bankAccountsTable">
            <thead>
              <tr>
                <th>Account ID</th>
                <th>Account Designation</th>
                <th>Banking Institution</th>
                <th>Account Number</th>
                <th>Account Classification</th>
                <th>Live Balance ($)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {BANK_ACCOUNTS.map((acc) => (
                <tr key={acc.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{acc.id}</td>
                  <td style={{ fontWeight: 600, color: '#1F3864' }}>{acc.name}</td>
                  <td>{acc.bank}</td>
                  <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{acc.accountNumber}</td>
                  <td>{acc.accountType}</td>
                  <td style={{ fontWeight: 700, color: '#2E7D32' }}>${acc.balance.toLocaleString()}</td>
                  <td>
                    <span
                      className={`mis-tag ${
                        acc.status === 'Primary'
                          ? 'mis-tag-green'
                          : acc.status === 'Escrow'
                          ? 'mis-tag-blue'
                          : acc.status === 'Restricted'
                          ? 'mis-tag-amber'
                          : 'mis-tag-blue'
                      }`}
                    >
                      {acc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total Bank Balance</td>
                <td colSpan={4}>Consolidated Liquid Working Capital</td>
                <td style={{ fontWeight: 800, color: '#2E7D32' }}>${totalBankBalance.toLocaleString()}</td>
                <td>
                  <span className="mis-tag mis-tag-green">Audited &amp; Active</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 4b: Cheques Ledger (Issued & Upcoming) */}
        <div className="mis-table-responsive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
            <h4 style={{ color: 'var(--mis-navy)', margin: 0, fontSize: 14, fontWeight: 700 }}>
              Cheque Register &amp; Clearance Tracking
            </h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`mis-tab-btn${chequeView === 'issued' ? ' mis-tab-btn-active' : ''}`}
                onClick={() => setChequeView('issued')}
                style={{ padding: '4px 12px', fontSize: 12 }}
              >
                <i className="fas fa-money-check" style={{ marginRight: 4 }} /> Cheques Issued ({CHEQUES_ISSUED.length})
              </button>
              <button
                type="button"
                className={`mis-tab-btn${chequeView === 'upcoming' ? ' mis-tab-btn-active' : ''}`}
                onClick={() => setChequeView('upcoming')}
                style={{ padding: '4px 12px', fontSize: 12 }}
              >
                <i className="fas fa-clock" style={{ marginRight: 4 }} /> Upcoming Cheques ({UPCOMING_CHEQUES.length})
              </button>
            </div>
          </div>

          <table className="mis-table" id="mis-chequesTable">
            <thead>
              <tr>
                <th>Cheque No.</th>
                <th>Beneficiary / Payee</th>
                <th>Account Drawn On</th>
                <th>Amount ($)</th>
                <th>{chequeView === 'issued' ? 'Issue Date' : 'Scheduled Release Date'}</th>
                <th>Clearance Status</th>
              </tr>
            </thead>
            <tbody>
              {(chequeView === 'issued' ? CHEQUES_ISSUED : UPCOMING_CHEQUES).map((chq) => (
                <tr key={chq.chequeNo}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{chq.chequeNo}</td>
                  <td style={{ fontWeight: 600, color: '#1a2540' }}>{chq.payee}</td>
                  <td style={{ color: '#64748b' }}>{chq.bankAccount}</td>
                  <td style={{ fontWeight: 700, color: '#C62828' }}>${chq.amount.toLocaleString()}</td>
                  <td style={{ color: '#334155' }}>{chq.date}</td>
                  <td>
                    <span
                      className={`mis-tag ${
                        chq.status === 'Cleared'
                          ? 'mis-tag-green'
                          : chq.status === 'In Clearing' || chq.status === 'Scheduled'
                          ? 'mis-tag-blue'
                          : 'mis-tag-amber'
                      }`}
                    >
                      {chq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total {chequeView === 'issued' ? 'Cheques Issued' : 'Upcoming Cheques'}</td>
                <td colSpan={2}>
                  {chequeView === 'issued' ? 'Issued and dispatched disbursements' : 'Scheduled post-dated disbursements'}
                </td>
                <td style={{ fontWeight: 800, color: '#C62828' }}>
                  ${(chequeView === 'issued' ? totalChequesIssued : totalUpcomingCheques).toLocaleString()}
                </td>
                <td colSpan={2}>
                  <span className="mis-tag mis-tag-blue">Reconciled</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* =========================================================================
       * Existing Monthly Cash Flow Statement & Summary Highlights
       * ========================================================================= */}
      <div className="mis-table-responsive" style={{ marginTop: 24 }}>
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Monthly Cash Flow Statement</h3>
        <table className="mis-table" id="mis-cashflowTable">
          <thead>
            <tr>
              <th>Period</th>
              <th>Inflow ($)</th>
              <th>Outflow ($)</th>
              <th>Net Cash ($)</th>
              <th>Cash Burn ($)</th>
              <th>Net Margin</th>
              <th>Liquidity Status</th>
            </tr>
          </thead>
          <tbody>
            {cashFlowData.map((c) => (
              <tr key={c.month}>
                <td style={{ fontWeight: 600 }}>{c.month}</td>
                <td style={{ color: '#2E7D32', fontWeight: 600 }}>${c.inflow.toLocaleString()}</td>
                <td style={{ color: '#C62828' }}>${Math.round(c.outflow).toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: c.netCash >= 0 ? '#1F3864' : '#C62828' }}>
                  ${Math.round(c.netCash).toLocaleString()}
                </td>
                <td>${Math.round(c.burnRate).toLocaleString()}</td>
                <td>{c.margin}%</td>
                <td>
                  <span className={`mis-tag ${c.netCash >= 0 ? 'mis-tag-green' : 'mis-tag-red'}`}>
                    {c.netCash >= 0 ? 'Surplus' : 'Deficit'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total YTD</td>
              <td style={{ color: '#2E7D32' }}>${totalInflows.toLocaleString()}</td>
              <td style={{ color: '#C62828' }}>${Math.round(totalOutflows).toLocaleString()}</td>
              <td style={{ color: '#1F3864', fontWeight: 700 }}>${Math.round(totalNetCash).toLocaleString()}</td>
              <td colSpan={2}>Pending Payables: ${pendingDuesTotal.toLocaleString()}</td>
              <td>
                <span className="mis-tag mis-tag-green">Positive Runway</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Treasury &amp; Runway Highlights</h3>
          <p><strong>Total Inflows YTD:</strong> ${totalInflows.toLocaleString()}</p>
          <p><strong>Total Outflows YTD:</strong> ${Math.round(totalOutflows).toLocaleString()}</p>
          <p><strong>Net Operating Surplus:</strong> ${Math.round(totalNetCash).toLocaleString()}</p>
          <p><strong>Estimated Runway:</strong> 28.5 Months at current operating velocity</p>
        </div>
        <div className="mis-internal-box">
          <h3>Working Capital Insights</h3>
          <p><strong>Monthly Recurring Inflow Target:</strong> $250,000</p>
          <p><strong>Fixed Operating Cost Baseline:</strong> ${Math.round(totalMonthlyRecurring).toLocaleString()} / mo</p>
          <p><strong>Short-term Payable Obligations:</strong> ${pendingDuesTotal.toLocaleString()}</p>
          <p><strong>Cash Conversion Cycle:</strong> 18.2 Days (Healthy)</p>
        </div>
      </div>
    </section>
  );
}
