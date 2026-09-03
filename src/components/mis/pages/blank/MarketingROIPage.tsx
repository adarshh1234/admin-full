import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';

export default function MarketingROIPage() {
  const navigate = useNavigate();
  const { marketingData } = useDashboard();

  const totalSpend = useMemo(() => marketingData.reduce((acc, m) => acc + m.spend, 0), [marketingData]);
  const totalRevenue = useMemo(() => marketingData.reduce((acc, m) => acc + m.revenue, 0), [marketingData]);
  const totalConversions = useMemo(() => marketingData.reduce((acc, m) => acc + m.conversions, 0), [marketingData]);
  const totalLeads = useMemo(() => marketingData.reduce((acc, m) => acc + m.leads, 0), [marketingData]);
  const overallRoi = totalSpend ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1) : '0.0';

  const channelsWithMetrics = useMemo(() => marketingData.map((m) => ({
    ...m,
    cpl: m.leads ? m.spend / m.leads : 0,
    convRate: m.leads ? (m.conversions / m.leads) * 100 : 0,
    roi: m.spend ? ((m.revenue - m.spend) / m.spend) * 100 : 0,
  })), [marketingData]);

  const sortedByRoi = useMemo(() => [...channelsWithMetrics].sort((a, b) => b.roi - a.roi), [channelsWithMetrics]);
  const bestChannel = sortedByRoi[0];
  const lowestChannel = sortedByRoi[sortedByRoi.length - 1];

  const roiChartData = {
    labels: marketingData.map((m) => m.channel),
    datasets: [{ label: 'ROI (%)', data: channelsWithMetrics.map((m) => Number(m.roi.toFixed(1))), backgroundColor: '#16a34a' }],
  };

  const spendVsRevChartData = {
    labels: marketingData.map((m) => m.channel),
    datasets: [
      { label: 'Spend ($)', data: marketingData.map((m) => m.spend), backgroundColor: '#2563eb' },
      { label: 'Revenue ($)', data: marketingData.map((m) => m.revenue), backgroundColor: '#16a34a' },
    ],
  };

  return (
    <>
      <div id="mis-dashboard-capture">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate('/')} className="mis-btn-action">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '20px', color: 'var(--admin-text-main)', margin: 0, fontWeight: 700 }}>
            Marketing ROI Detail View
          </h2>
        </div>

        <div className="mis-kpi-grid">
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-chart-line" /> Overall ROI</div>
            <div className="mis-kpi-value">{overallRoi}%</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-credit-card" /> Total Spend</div>
            <div className="mis-kpi-value">${totalSpend.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-coins" /> Total Revenue</div>
            <div className="mis-kpi-value">${totalRevenue.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-check-circle" /> Conversions</div>
            <div className="mis-kpi-value">{totalConversions.toLocaleString()}</div>
          </div>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-bullhorn" style={{ color: 'var(--admin-primary)' }} /> Marketing Performance Breakdown
          </div>
          <div className="mis-formula-note">ROI = (Revenue - Spend) / Spend × 100 · Cost per Lead = Spend / Leads · Conversion Rate = Conversions / Leads × 100</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--admin-text-main)', marginBottom: '8px' }}>ROI by Channel (%)</h3>
              <div className="mis-chart-container" style={{ height: '220px' }}><Bar data={roiChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--admin-text-main)', marginBottom: '8px' }}>Spend vs Revenue ($)</h3>
              <div className="mis-chart-container" style={{ height: '220px' }}><Bar data={spendVsRevChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
          </div>

          <div className="mis-table-responsive">
            <table className="mis-table">
              <thead>
                <tr><th>Channel</th><th>Spend</th><th>Impressions</th><th>Clicks</th><th>Leads</th><th>Conversions</th><th>Revenue</th><th>Cost/Lead</th><th>Conversion Rate</th><th>ROI</th></tr>
              </thead>
              <tbody>
                {channelsWithMetrics.map((m) => (
                  <tr key={m.channel}>
                    <td style={{ fontWeight: 600 }}>{m.channel}</td>
                    <td>${m.spend.toLocaleString()}</td>
                    <td>{m.impressions.toLocaleString()}</td>
                    <td>{m.clicks.toLocaleString()}</td>
                    <td>{m.leads.toLocaleString()}</td>
                    <td>{m.conversions.toLocaleString()}</td>
                    <td>${m.revenue.toLocaleString()}</td>
                    <td>${m.cpl.toFixed(2)}</td>
                    <td>{m.convRate.toFixed(1)}%</td>
                    <td><span className={`mis-tag ${m.roi >= 100 ? 'mis-tag-green' : m.roi >= 0 ? 'mis-tag-amber' : 'mis-tag-red'}`}>{m.roi.toFixed(1)}%</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td><td>${totalSpend.toLocaleString()}</td><td>-</td><td>-</td>
                  <td>{totalLeads.toLocaleString()}</td><td>{totalConversions.toLocaleString()}</td>
                  <td>${totalRevenue.toLocaleString()}</td><td>-</td><td>-</td><td>{overallRoi}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mis-internal-grid">
            <div className="mis-internal-box">
              <h3>🏆 Best Performing Channel</h3>
              {bestChannel && (
                <div>
                  <p><strong>Channel:</strong> {bestChannel.channel}</p>
                  <p><strong>ROI:</strong> <span className="mis-tag mis-tag-green">{bestChannel.roi.toFixed(1)}%</span></p>
                  <p><strong>Revenue:</strong> ${bestChannel.revenue.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="mis-internal-box">
              <h3>📉 Lowest Performing Channel</h3>
              {lowestChannel && (
                <div>
                  <p><strong>Channel:</strong> {lowestChannel.channel}</p>
                  <p><strong>ROI:</strong> <span className="mis-tag mis-tag-amber">{lowestChannel.roi.toFixed(1)}%</span></p>
                  <p><strong>Revenue:</strong> ${lowestChannel.revenue.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Marketing ROI Overview</div>
    </>
  );
}
