import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

interface LiquidityRatio {
  ratioName: string;
  currentValue: string;
  targetBenchmark: string;
  description: string;
  status: 'Strong' | 'Optimal' | 'Caution';
}

const LIQUIDITY_RATIOS: LiquidityRatio[] = [
  {
    ratioName: 'Current Ratio (CR)',
    currentValue: '2.84 : 1',
    targetBenchmark: '> 2.0 : 1',
    description: 'Current Assets / Current Liabilities. Indicates ability to cover short-term obligations.',
    status: 'Strong',
  },
  {
    ratioName: 'Quick Ratio (Acid-Test)',
    currentValue: '2.42 : 1',
    targetBenchmark: '> 1.5 : 1',
    description: '(Cash + Marketable Securities + Accounts Receivable) / Current Liabilities.',
    status: 'Strong',
  },
  {
    ratioName: 'Cash Ratio',
    currentValue: '1.65 : 1',
    targetBenchmark: '> 1.0 : 1',
    description: 'Immediate Liquid Cash Reserves / Total Current Liabilities.',
    status: 'Optimal',
  },
  {
    ratioName: 'Operating Cash Flow Ratio',
    currentValue: '1.92 : 1',
    targetBenchmark: '> 1.2 : 1',
    description: 'Operating Cash Flow / Current Liabilities. Reflects core cash-generation health.',
    status: 'Strong',
  },
  {
    ratioName: 'Days Sales Outstanding (DSO)',
    currentValue: '22.4 Days',
    targetBenchmark: '< 30 Days',
    description: 'Average time taken to collect receivables from partner clinics and hospital networks.',
    status: 'Optimal',
  },
];

interface LiquidAccount {
  accountName: string;
  institution: string;
  category: string;
  balance: number;
  yieldApy: string;
  status: 'Instant Access' | 'T+1 Settlement' | 'Reserve';
}

const LIQUID_ACCOUNTS: LiquidAccount[] = [
  {
    accountName: 'Operating Current Account #1',
    institution: 'JPMorgan Chase Healthcare Banking',
    category: 'Commercial Operating',
    balance: 840000,
    yieldApy: '2.1%',
    status: 'Instant Access',
  },
  {
    accountName: 'Treasury Yield & Money Market',
    institution: 'Goldman Sachs Asset Management',
    category: 'Liquid Money Market',
    balance: 1250000,
    yieldApy: '5.15%',
    status: 'T+1 Settlement',
  },
  {
    accountName: 'International Escrow & Settlements',
    institution: 'Standard Chartered Global',
    category: 'Cross-Border Escrow',
    balance: 420000,
    yieldApy: '3.4%',
    status: 'Instant Access',
  },
  {
    accountName: 'Payroll & Statutory Tax Reserve',
    institution: 'Silicon Valley Bank / First Citizens',
    category: 'Statutory Payroll Escrow',
    balance: 310000,
    yieldApy: '4.25%',
    status: 'Reserve',
  },
];

export default function LiquidityPage() {
  const { duesData } = useDashboard();

  const totalLiquidReserves = useMemo(
    () => LIQUID_ACCOUNTS.reduce((acc, a) => acc + a.balance, 0),
    [],
  );

  const totalCurrentLiabilities = useMemo(
    () => duesData.reduce((acc, d) => acc + d.amount, 0),
    [duesData],
  );

  const netWorkingCapital = totalLiquidReserves - totalCurrentLiabilities;

  const chartData = {
    labels: ['Current Ratio', 'Quick Ratio', 'Cash Ratio', 'OCF Ratio'],
    datasets: [
      {
        label: 'Current Ratio Level',
        data: [2.84, 2.42, 1.65, 1.92],
        backgroundColor: ['#1F3864', '#2F5597', '#2E7D32', '#44546A'],
      },
      {
        label: 'Benchmark Threshold',
        data: [2.0, 1.5, 1.0, 1.2],
        backgroundColor: '#E2E8F0',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { autoSkip: false } } },
  };

  return (
    <section id="tab-liquidity" className="mis-tab-panel">
      <div className="mis-section-title">Liquidity Ratios &amp; Solvency Overview</div>
      <div className="mis-section-desc">
        Short-term solvency analysis, liquid treasury accounts, acid-test benchmarks, and cash conversion performance.
      </div>
      <div className="mis-formula-note">
        Current Ratio = Current Assets / Current Liabilities · Quick Ratio = (Cash + Receivables) / Current Liabilities · Net Working Capital = Liquid Assets − Liabilities.
      </div>

      <div className="mis-chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Solvency &amp; Liquidity Health Indicators</h3>
        <table className="mis-table" id="mis-liquidityRatiosTable">
          <thead>
            <tr>
              <th>Ratio / Metric</th>
              <th>Current Score</th>
              <th>Target Benchmark</th>
              <th>Formula / Context</th>
              <th>Solvency Health</th>
            </tr>
          </thead>
          <tbody>
            {LIQUIDITY_RATIOS.map((r) => (
              <tr key={r.ratioName}>
                <td style={{ fontWeight: 600 }}>{r.ratioName}</td>
                <td style={{ fontWeight: 700, color: '#2E7D32' }}>{r.currentValue}</td>
                <td style={{ color: '#6b7a99' }}>{r.targetBenchmark}</td>
                <td style={{ fontSize: 12 }}>{r.description}</td>
                <td>
                  <span className="mis-tag mis-tag-green">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Liquid Cash &amp; Treasury Balances</h3>
        <table className="mis-table" id="mis-liquidAccountsTable">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Financial Institution</th>
              <th>Category</th>
              <th>Available Balance ($)</th>
              <th>Yield (APY)</th>
              <th>Access Tier</th>
            </tr>
          </thead>
          <tbody>
            {LIQUID_ACCOUNTS.map((acc) => (
              <tr key={acc.accountName}>
                <td style={{ fontWeight: 600 }}>{acc.accountName}</td>
                <td>{acc.institution}</td>
                <td>{acc.category}</td>
                <td style={{ fontWeight: 700, color: '#1F3864' }}>${acc.balance.toLocaleString()}</td>
                <td style={{ color: '#2E7D32', fontWeight: 600 }}>{acc.yieldApy}</td>
                <td>
                  <span className="mis-tag mis-tag-blue">{acc.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total Liquid Reserves</td>
              <td colSpan={2}>4 Active Treasury Repositories</td>
              <td style={{ fontWeight: 700, color: '#2E7D32' }}>${totalLiquidReserves.toLocaleString()}</td>
              <td colSpan={2}>Net Working Capital: ${netWorkingCapital.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Solvency Assessment</h3>
          <p><strong>Total Liquid Reserves:</strong> ${totalLiquidReserves.toLocaleString()}</p>
          <p><strong>Current Short-term Payables:</strong> ${totalCurrentLiabilities.toLocaleString()}</p>
          <p><strong>Net Liquid Working Capital:</strong> ${netWorkingCapital.toLocaleString()}</p>
          <p><strong>Defensive Interval:</strong> 310 Days of continuous operations</p>
        </div>
        <div className="mis-internal-box">
          <h3>Treasury Yield Optimization</h3>
          <p><strong>Blended Treasury Yield:</strong> 4.42% APY across cash accounts</p>
          <p><strong>Annualized Passive Interest:</strong> ~${Math.round(totalLiquidReserves * 0.0442).toLocaleString()} / yr</p>
          <p><strong>Credit Default Risk:</strong> Zero (A+ to AAA Rated Institutions)</p>
          <p><strong>Capital Adequacy:</strong> Highly Solvent</p>
        </div>
      </div>
    </section>
  );
}
