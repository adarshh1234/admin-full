import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

export default function MarketingPage() {
  const { marketingData, socialMediaData } = useDashboard();

  const chartData = {
    labels: marketingData.map((m) => m.channel),
    datasets: [
      { label: 'Spend', data: marketingData.map((m) => m.spend), backgroundColor: '#2F5597' },
      { label: 'Revenue', data: marketingData.map((m) => m.revenue), backgroundColor: '#2E7D32' },
    ],
  };
  const chartOptions = { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { autoSkip: false } } } };

  const totalSpend = marketingData.reduce((acc, m) => acc + m.spend, 0);
  const totalLeads = marketingData.reduce((acc, m) => acc + m.leads, 0);
  const totalConv = marketingData.reduce((acc, m) => acc + m.conversions, 0);
  const totalRev = marketingData.reduce((acc, m) => acc + m.revenue, 0);
  const overallRoi = totalSpend ? (((totalRev - totalSpend) / totalSpend) * 100).toFixed(1) : '0.0';

  const totalFollowers = socialMediaData.reduce((acc, s) => acc + s.followers, 0);
  const totalSocialLeads = socialMediaData.reduce((acc, s) => acc + s.leads, 0);
  const totalSocialRev = socialMediaData.reduce((acc, s) => acc + s.revenue, 0);

  const leadSources = [...marketingData].sort((a, b) => b.leads - a.leads);

  return (
    <section id="tab-marketing" className="mis-tab-panel">
      <div className="mis-section-title">Marketing &amp; Leads — Digital Performance</div>
      <div className="mis-section-desc">Channel-wise spend, leads, conversions, revenue, and ROI for global digital marketing.</div>
      <div className="mis-formula-note">ROI = (Revenue − Spend) / Spend × 100 · Cost per Lead = Spend / Leads · Conversion Rate = Conversions / Leads.</div>
      <div className="mis-chart-container"><Bar data={chartData} options={chartOptions} /></div>

      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-marketingTable">
          <thead>
            <tr>
              <th>Channel</th><th>Spend ($)</th><th>Impressions</th><th>Clicks</th><th>Leads</th>
              <th>Conversions</th><th>Revenue ($)</th><th>Cost/Lead ($)</th><th>Conv. Rate</th><th>ROI (%)</th>
            </tr>
          </thead>
          <tbody>
            {marketingData.map((m) => {
              const cpl = (m.spend / m.leads).toFixed(2);
              const convRate = ((m.conversions / m.leads) * 100).toFixed(1);
              const roi = (((m.revenue - m.spend) / m.spend) * 100).toFixed(1);
              return (
                <tr key={m.channel}>
                  <td>{m.channel}</td>
                  <td>${m.spend.toLocaleString()}</td>
                  <td>{m.impressions.toLocaleString()}</td>
                  <td>{m.clicks.toLocaleString()}</td>
                  <td>{m.leads.toLocaleString()}</td>
                  <td>{m.conversions.toLocaleString()}</td>
                  <td>${m.revenue.toLocaleString()}</td>
                  <td>${cpl}</td>
                  <td>{convRate}%</td>
                  <td>{roi}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td>${totalSpend.toLocaleString()}</td>
              <td></td><td></td>
              <td>{totalLeads.toLocaleString()}</td>
              <td>{totalConv.toLocaleString()}</td>
              <td>${totalRev.toLocaleString()}</td>
              <td>—</td><td>—</td>
              <td>{overallRoi}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Social Media Metrics (Global)</h3>
        <table className="mis-table" id="mis-socialTable">
          <thead><tr><th>Platform</th><th>Followers</th><th>Engagement</th><th>Posts / Week</th><th>Leads from SM</th><th>Revenue from SM ($)</th></tr></thead>
          <tbody>
            {socialMediaData.map((s) => (
              <tr key={s.platform}>
                <td>{s.platform}</td>
                <td>{s.followers.toLocaleString()}</td>
                <td>{s.engagement}%</td>
                <td>{s.posts}</td>
                <td>{s.leads}</td>
                <td>${s.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td>Total</td><td>{totalFollowers.toLocaleString()}</td><td></td><td></td><td>{totalSocialLeads}</td><td>${totalSocialRev.toLocaleString()}</td></tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Lead Sources Summary</h3>
          <div>{leadSources.map((m) => <p key={m.channel}><strong>{m.channel}:</strong> {m.leads}</p>)}</div>
        </div>
        <div className="mis-internal-box">
          <h3>Channel Performance</h3>
          <div>
            {marketingData.map((m) => {
              const roi = (((m.revenue - m.spend) / m.spend) * 100).toFixed(1);
              return <p key={m.channel}><strong>{m.channel}:</strong> {roi}% ROI</p>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
