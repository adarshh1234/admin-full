import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

interface InvestmentCategory {
  initiative: string;
  category: 'Marketing' | 'Tech & AI' | 'Expansion' | 'Clinical Network';
  capitalDeployed: number;
  grossRevenue: number;
  netProfit: number;
  roiPercent: number;
  paybackMonths: number;
  status: 'High Yield' | 'Target Met' | 'Scaling';
}

const INITIATIVE_DATA: InvestmentCategory[] = [
  {
    initiative: 'Global Telehealth Copilot AI',
    category: 'Tech & AI',
    capitalDeployed: 120000,
    grossRevenue: 480000,
    netProfit: 360000,
    roiPercent: 300.0,
    paybackMonths: 4.2,
    status: 'High Yield',
  },
  {
    initiative: 'Digital Ads & Google Ads Campaign',
    category: 'Marketing',
    capitalDeployed: 85000,
    grossRevenue: 272000,
    netProfit: 187000,
    roiPercent: 220.0,
    paybackMonths: 5.5,
    status: 'High Yield',
  },
  {
    initiative: 'South East Asia Clinic Network Expansion',
    category: 'Expansion',
    capitalDeployed: 150000,
    grossRevenue: 345000,
    netProfit: 195000,
    roiPercent: 130.0,
    paybackMonths: 7.8,
    status: 'Scaling',
  },
  {
    initiative: 'Automated Billing & Insurance Claims Engine',
    category: 'Tech & AI',
    capitalDeployed: 60000,
    grossRevenue: 198000,
    netProfit: 138000,
    roiPercent: 230.0,
    paybackMonths: 4.8,
    status: 'High Yield',
  },
  {
    initiative: 'Doctor Advocate & Referral Loyalty Tiers',
    category: 'Marketing',
    capitalDeployed: 42000,
    grossRevenue: 155400,
    netProfit: 113400,
    roiPercent: 270.0,
    paybackMonths: 3.9,
    status: 'High Yield',
  },
  {
    initiative: 'Tier-2 Hospital ERP Integrations',
    category: 'Clinical Network',
    capitalDeployed: 95000,
    grossRevenue: 209000,
    netProfit: 114000,
    roiPercent: 120.0,
    paybackMonths: 8.4,
    status: 'Target Met',
  },
];

export default function RoisPage() {
  const { marketingData } = useDashboard();

  const totalDeployed = useMemo(
    () => INITIATIVE_DATA.reduce((acc, i) => acc + i.capitalDeployed, 0),
    [],
  );
  const totalRevenue = useMemo(
    () => INITIATIVE_DATA.reduce((acc, i) => acc + i.grossRevenue, 0),
    [],
  );
  const totalNetProfit = useMemo(
    () => INITIATIVE_DATA.reduce((acc, i) => acc + i.netProfit, 0),
    [],
  );
  const overallPortfolioRoi = useMemo(
    () => (((totalRevenue - totalDeployed) / totalDeployed) * 100).toFixed(1),
    [totalRevenue, totalDeployed],
  );

  const chartData = {
    labels: INITIATIVE_DATA.map((i) => i.initiative),
    datasets: [
      { label: 'Capital Deployed ($)', data: INITIATIVE_DATA.map((i) => i.capitalDeployed), backgroundColor: '#7B93BC' },
      { label: 'Net Profit ($)', data: INITIATIVE_DATA.map((i) => i.netProfit), backgroundColor: '#2E7D32' },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { ticks: { autoSkip: false } } },
  };

  return (
    <section id="tab-rois" className="mis-tab-panel">
      <div className="mis-section-title">Returns on Investment (ROIs) &amp; Capital Efficiency</div>
      <div className="mis-section-desc">
        Portfolio return benchmarks across Technology, Digital Marketing, Regional Market Expansion, and Clinic Networks.
      </div>
      <div className="mis-formula-note">
        ROI (%) = (Net Return − Capital Invested) / Capital Invested × 100 · Payback Period = Capital / (Annual Net Profit / 12).
      </div>

      <div className="mis-chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Investment Portfolio ROI Matrix</h3>
        <table className="mis-table" id="mis-roisTable">
          <thead>
            <tr>
              <th>Initiative</th>
              <th>Category</th>
              <th>Capital Deployed ($)</th>
              <th>Gross Revenue ($)</th>
              <th>Net Profit ($)</th>
              <th>ROI (%)</th>
              <th>Payback (Months)</th>
              <th>Yield Status</th>
            </tr>
          </thead>
          <tbody>
            {INITIATIVE_DATA.map((item) => (
              <tr key={item.initiative}>
                <td style={{ fontWeight: 600 }}>{item.initiative}</td>
                <td>
                  <span className="mis-tag mis-tag-blue">{item.category}</span>
                </td>
                <td>${item.capitalDeployed.toLocaleString()}</td>
                <td style={{ color: '#2E7D32', fontWeight: 600 }}>${item.grossRevenue.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: '#1F3864' }}>${item.netProfit.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: '#2E7D32' }}>+{item.roiPercent.toFixed(1)}%</td>
                <td>{item.paybackMonths} mo</td>
                <td>
                  <span className="mis-tag mis-tag-green">{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Portfolio Total</td>
              <td>—</td>
              <td>${totalDeployed.toLocaleString()}</td>
              <td style={{ color: '#2E7D32' }}>${totalRevenue.toLocaleString()}</td>
              <td style={{ fontWeight: 700 }}>${totalNetProfit.toLocaleString()}</td>
              <td style={{ fontWeight: 700, color: '#2E7D32' }}>+{overallPortfolioRoi}%</td>
              <td>5.1 mo avg</td>
              <td>
                <span className="mis-tag mis-tag-green">Exceptional Yield</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Capital Efficiency Summary</h3>
          <p><strong>Total Capital Deployed:</strong> ${totalDeployed.toLocaleString()}</p>
          <p><strong>Net Generated Profit:</strong> ${totalNetProfit.toLocaleString()}</p>
          <p><strong>Blended Portfolio ROI:</strong> +{overallPortfolioRoi}%</p>
          <p><strong>Highest Yield Vertical:</strong> Tech &amp; AI (300% ROI on Telehealth Copilot)</p>
        </div>
        <div className="mis-internal-box">
          <h3>Channel Growth Correlation</h3>
          <p><strong>Marketing Return Multiplier:</strong> 3.2x Average</p>
          <p><strong>Organic Referral Share:</strong> 38% of total client acquisition</p>
          <p><strong>Active Channels Monitored:</strong> {marketingData.length} channels</p>
          <p><strong>Risk Adjusted Yield:</strong> 94.2% Success Benchmark</p>
        </div>
      </div>
    </section>
  );
}
