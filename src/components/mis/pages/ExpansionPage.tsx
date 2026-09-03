import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

function priorityTag(priority: string): string {
  if (priority === 'High') return 'mis-tag-green';
  if (priority === 'Medium') return 'mis-tag-amber';
  return 'mis-tag-red';
}

export default function ExpansionPage() {
  const { expansionData } = useDashboard();

  const chartData = {
    labels: expansionData.map((e) => e.market),
    datasets: [{ label: 'Forecasted Revenue', data: expansionData.map((e) => e.currentRevenue + e.potentialRevenue), backgroundColor: '#1F3864' }],
  };

  const totalCostAll = expansionData.reduce((acc, e) => acc + e.platformCost + e.staffingCost + e.officeCost + e.marketingCost + e.operationsCost + e.legalCost, 0);
  const totalForecast = expansionData.reduce((acc, e) => acc + e.currentRevenue + e.potentialRevenue, 0);

  const topMarkets = [...expansionData].sort((a, b) => (b.currentRevenue + b.potentialRevenue) - (a.currentRevenue + a.potentialRevenue)).slice(0, 3);

  const costCategories: { key: keyof typeof expansionData[0]; label: string }[] = [
    { key: 'platformCost', label: 'Platform' },
    { key: 'staffingCost', label: 'Staffing' },
    { key: 'officeCost', label: 'Office' },
    { key: 'marketingCost', label: 'Marketing' },
    { key: 'operationsCost', label: 'Operations' },
    { key: 'legalCost', label: 'Legal' },
  ];

  return (
    <section id="tab-expansion" className="mis-tab-panel">
      <div className="mis-section-title">Market Expansion Analysis — Worldwide Potential</div>
      <div className="mis-section-desc">Country/state-level analysis with current revenue, potential, expansion costs, and forecasted ROI.</div>
      <div className="mis-formula-note">Forecasted Revenue = Current Revenue + Potential Revenue · Expansion ROI = (Forecasted Revenue − Expansion Cost) / Expansion Cost.</div>
      <div className="mis-chart-container"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>

      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-expansionTable">
          <thead>
            <tr>
              <th>Market</th><th>Region</th><th>Current Users</th><th>Current Revenue ($)</th><th>Potential Revenue ($)</th>
              <th>Growth Potential</th><th>Platform Cost ($)</th><th>Staffing Cost ($)</th><th>Office Cost ($)</th>
              <th>Marketing Cost ($)</th><th>Operations Cost ($)</th><th>Legal Cost ($)</th>
              <th>Total Expansion Cost ($)</th><th>Forecasted Revenue ($)</th><th>Expected ROI (%)</th><th>Priority</th>
            </tr>
          </thead>
          <tbody>
            {expansionData.map((e) => {
              const totalCost = e.platformCost + e.staffingCost + e.officeCost + e.marketingCost + e.operationsCost + e.legalCost;
              const forecastRevenue = e.currentRevenue + e.potentialRevenue;
              const roi = ((forecastRevenue - totalCost) / totalCost) * 100;
              const priority = roi > 200 ? 'High' : roi > 100 ? 'Medium' : 'Low';
              return (
                <tr key={e.market}>
                  <td>{e.market}</td>
                  <td>{e.region}</td>
                  <td>{e.currentUsers.toLocaleString()}</td>
                  <td>${e.currentRevenue.toLocaleString()}</td>
                  <td>${e.potentialRevenue.toLocaleString()}</td>
                  <td>{e.growth}</td>
                  <td>${e.platformCost.toLocaleString()}</td>
                  <td>${e.staffingCost.toLocaleString()}</td>
                  <td>${e.officeCost.toLocaleString()}</td>
                  <td>${e.marketingCost.toLocaleString()}</td>
                  <td>${e.operationsCost.toLocaleString()}</td>
                  <td>${e.legalCost.toLocaleString()}</td>
                  <td><strong>${totalCost.toLocaleString()}</strong></td>
                  <td>${forecastRevenue.toLocaleString()}</td>
                  <td>{roi.toFixed(1)}%</td>
                  <td><span className={`mis-tag ${priorityTag(priority)}`}>{priority}</span></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td colSpan={11}>Total Expansion Cost: ${totalCostAll.toLocaleString()}</td>
              <td>${totalForecast.toLocaleString()}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Top High-Potential Markets</h3>
          <div>{topMarkets.map((m) => <p key={m.market}><strong>{m.market}:</strong> Potential Revenue ${(m.currentRevenue + m.potentialRevenue).toLocaleString()}</p>)}</div>
        </div>
        <div className="mis-internal-box">
          <h3>Expansion Cost Breakdown</h3>
          <table style={{ width: '100%', fontSize: 12 }}>
            <tbody>
              {costCategories.map((c) => {
                const total = expansionData.reduce((acc, e) => acc + (e[c.key] as number), 0);
                return (
                  <tr key={c.key}>
                    <td>{c.label}</td>
                    <td style={{ textAlign: 'right' }}>${total.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
