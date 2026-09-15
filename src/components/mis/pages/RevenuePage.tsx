import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

interface RevenueStream {
  stream: string;
  category: string;
  monthlyRev: number;
  annualRev: number;
  contribution: number;
  growthYoY: number;
  status: 'Accelerating' | 'Stable' | 'High Margin';
}

const REVENUE_STREAMS: RevenueStream[] = [
  {
    stream: 'Clinic ERP & Telehealth SaaS Subscriptions',
    category: 'Recurring SaaS',
    monthlyRev: 145000,
    annualRev: 1740000,
    contribution: 42.5,
    growthYoY: 34.2,
    status: 'Accelerating',
  },
  {
    stream: 'Doctor AI Copilot Add-On Licenses',
    category: 'AI Software',
    monthlyRev: 68000,
    annualRev: 816000,
    contribution: 19.9,
    growthYoY: 58.0,
    status: 'Accelerating',
  },
  {
    stream: 'Hospital Enterprise Integration & Custom Modules',
    category: 'Enterprise Contract',
    monthlyRev: 55000,
    annualRev: 660000,
    contribution: 16.1,
    growthYoY: 18.5,
    status: 'High Margin',
  },
  {
    stream: 'In-Platform Diagnostics & Lab Transaction Cuts',
    category: 'Marketplace Take Rate',
    monthlyRev: 45000,
    annualRev: 540000,
    contribution: 13.2,
    growthYoY: 28.4,
    status: 'Stable',
  },
  {
    stream: 'Pharmaceutical & B2B Sponsored Ad Placements',
    category: 'Ad Platform',
    monthlyRev: 28000,
    annualRev: 336000,
    contribution: 8.3,
    growthYoY: 22.1,
    status: 'Stable',
  },
];

export default function RevenuePage() {
  const { monthlyRows } = useDashboard();

  const totalMonthlyRev = useMemo(
    () => REVENUE_STREAMS.reduce((acc, s) => acc + s.monthlyRev, 0),
    [],
  );
  const totalAnnualRev = useMemo(
    () => REVENUE_STREAMS.reduce((acc, s) => acc + s.annualRev, 0),
    [],
  );

  const chartData = {
    labels: monthlyRows.map((m) => m.month),
    datasets: [
      {
        label: 'Gross Revenue ($)',
        data: monthlyRows.map((m) => (m.subRev || 0) + (m.adRev || 0)),
        borderColor: '#2F5597',
        backgroundColor: 'rgba(47, 85, 151, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Net Margin ($)',
        data: monthlyRows.map((m) => Math.round(((m.subRev || 0) + (m.adRev || 0)) * 0.42)),
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { autoSkip: false } } },
  };

  return (
    <section id="tab-revenue" className="mis-tab-panel">
      <div className="mis-section-title">Revenue Analytics &amp; Growth Streams</div>
      <div className="mis-section-desc">
        Revenue diversification breakdown, MRR &amp; ARR trajectory, stream-wise yield, and annualized growth dynamics.
      </div>
      <div className="mis-formula-note">
        ARR = MRR × 12 · ARPU = Total Revenue / Active Paid Entities · YoY Growth = (Current Rev − Prior Rev) / Prior Rev × 100.
      </div>

      <div className="mis-chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Diversified Revenue Stream Portfolio</h3>
        <table className="mis-table" id="mis-revenueTable">
          <thead>
            <tr>
              <th>Revenue Stream</th>
              <th>Stream Classification</th>
              <th>Monthly Revenue (MRR)</th>
              <th>Annual Run Rate (ARR)</th>
              <th>Contribution %</th>
              <th>YoY Growth</th>
              <th>Growth Velocity</th>
            </tr>
          </thead>
          <tbody>
            {REVENUE_STREAMS.map((s) => (
              <tr key={s.stream}>
                <td style={{ fontWeight: 600 }}>{s.stream}</td>
                <td>
                  <span className="mis-tag mis-tag-blue">{s.category}</span>
                </td>
                <td style={{ color: '#2E7D32', fontWeight: 600 }}>${s.monthlyRev.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: '#1F3864' }}>${s.annualRev.toLocaleString()}</td>
                <td>{s.contribution}%</td>
                <td style={{ color: '#2E7D32', fontWeight: 600 }}>+{s.growthYoY}%</td>
                <td>
                  <span className="mis-tag mis-tag-green">{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total Enterprise Run Rate</td>
              <td>—</td>
              <td style={{ color: '#2E7D32', fontWeight: 700 }}>${totalMonthlyRev.toLocaleString()}</td>
              <td style={{ color: '#1F3864', fontWeight: 700 }}>${totalAnnualRev.toLocaleString()}</td>
              <td>100.0%</td>
              <td style={{ color: '#2E7D32', fontWeight: 700 }}>+33.4% Blended</td>
              <td>
                <span className="mis-tag mis-tag-green">Hyper-Growth</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Annualized Revenue Velocity</h3>
          <p><strong>Current Monthly Run Rate (MRR):</strong> ${totalMonthlyRev.toLocaleString()}</p>
          <p><strong>Annualized Run Rate (ARR):</strong> ${totalAnnualRev.toLocaleString()}</p>
          <p><strong>Top Revenue Driver:</strong> SaaS Subscriptions (${(totalMonthlyRev * 0.425).toLocaleString()} / mo)</p>
          <p><strong>Average Revenue Per Unit (ARPU):</strong> $482 / clinic / mo</p>
        </div>
        <div className="mis-internal-box">
          <h3>Unit Economics &amp; Retention</h3>
          <p><strong>Net Revenue Retention (NRR):</strong> 118.4%</p>
          <p><strong>Gross Profit Margin:</strong> 76.2% on core software</p>
          <p><strong>Customer Lifetime Value (LTV):</strong> $14,600</p>
          <p><strong>LTV to CAC Ratio:</strong> 5.8x (Excellent efficiency)</p>
        </div>
      </div>
    </section>
  );
}
