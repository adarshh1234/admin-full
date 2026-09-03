import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';

function marginTag(margin: number): string {
  if (margin >= 25) return 'mis-tag-green';
  if (margin >= 15) return 'mis-tag-amber';
  return 'mis-tag-red';
}

export default function NetProfitMarginPage() {
  const navigate = useNavigate();
  const { annualRows } = useDashboard();

  const latestRow = useMemo(
    () => (annualRows.length ? annualRows[annualRows.length - 1] : { year: '-', revenue: 0, opex: 0 }),
    [annualRows]
  );

  const latestRevenue = latestRow.revenue;
  const latestOpex = latestRow.opex;
  const latestProfit = latestRevenue - latestOpex;
  const latestMargin = latestRevenue ? ((latestProfit / latestRevenue) * 100).toFixed(1) : '0.0';

  const chartData = {
    labels: annualRows.map((r) => r.year),
    datasets: [{
      label: 'Net Profit Margin (%)',
      data: annualRows.map((r) => Number((((r.revenue - r.opex) / r.revenue) * 100).toFixed(1))),
      borderColor: '#16a34a', backgroundColor: 'rgba(22, 163, 74, 0.08)', fill: true, tension: 0.3,
    }],
  };
  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    scales: { y: { ticks: { callback: (value: number | string) => `${value}%` } } },
  };

  const totalRevenue = annualRows.reduce((acc, r) => acc + r.revenue, 0);
  const totalOpex = annualRows.reduce((acc, r) => acc + r.opex, 0);
  const totalProfit = totalRevenue - totalOpex;
  const overallMargin = totalRevenue ? (((totalRevenue - totalOpex) / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <>
      <div id="mis-dashboard-capture">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate('/')} className="mis-btn-action">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '20px', color: 'var(--admin-text-main)', margin: 0, fontWeight: 700 }}>
            Net Profit Margin Detail View
          </h2>
        </div>

        <div className="mis-kpi-grid">
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-dollar-sign" /> Latest Revenue</div>
            <div className="mis-kpi-value">${latestRevenue.toLocaleString()}</div>
            <div className="mis-kpi-sub">{latestRow.year}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-receipt" /> Latest OPEX</div>
            <div className="mis-kpi-value">${latestOpex.toLocaleString()}</div>
            <div className="mis-kpi-sub">{latestRow.year}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-wallet" /> Net Profit</div>
            <div className="mis-kpi-value">${latestProfit.toLocaleString()}</div>
            <div className="mis-kpi-sub">{latestRow.year}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-percentage" style={{ color: '#16a34a' }} /> Margin</div>
            <div className="mis-kpi-value" style={{ color: '#16a34a' }}>{latestMargin}%</div>
            <div className="mis-kpi-sub">{latestRow.year}</div>
          </div>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-chart-line" style={{ color: 'var(--admin-primary)' }} /> Multi-Year Profit Margin Trend
          </div>
          <div className="mis-formula-note">Net Profit Margin (%) = (Revenue - OPEX) / Revenue × 100</div>
          <div className="mis-chart-container"><Line data={chartData} options={chartOptions} /></div>
          
          <div className="mis-table-responsive">
            <table className="mis-table">
              <thead><tr><th>Year</th><th>Revenue ($)</th><th>OPEX ($)</th><th>Net Profit ($)</th><th>Net Profit Margin (%)</th></tr></thead>
              <tbody>
                {annualRows.map((row) => {
                  const profit = row.revenue - row.opex;
                  const marginVal = row.revenue ? (profit / row.revenue) * 100 : 0;
                  return (
                    <tr key={row.year}>
                      <td style={{ fontWeight: 600 }}>{row.year}</td>
                      <td>${row.revenue.toLocaleString()}</td>
                      <td>${row.opex.toLocaleString()}</td>
                      <td>${profit.toLocaleString()}</td>
                      <td><span className={`mis-tag ${marginTag(marginVal)}`}>{marginVal.toFixed(1)}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Overall Total / Avg</td>
                  <td>${totalRevenue.toLocaleString()}</td>
                  <td>${totalOpex.toLocaleString()}</td>
                  <td>${totalProfit.toLocaleString()}</td>
                  <td>{overallMargin}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Net Profit Margin Overview</div>
    </>
  );
}
