import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';

function priorityTag(priority: string): string {
  if (priority === 'High') return 'mis-tag-green';
  if (priority === 'Medium') return 'mis-tag-amber';
  return 'mis-tag-red';
}

export default function HighPotentialMarketsPage() {
  const navigate = useNavigate();
  const { expansionData } = useDashboard();

  const marketsCalculated = useMemo(() => expansionData.map((e) => {
    const totalCost = e.platformCost + e.staffingCost + e.officeCost + e.marketingCost + e.operationsCost + e.legalCost;
    const forecastedRevenue = e.currentRevenue + e.potentialRevenue;
    const roi = totalCost ? ((forecastedRevenue - totalCost) / totalCost) * 100 : 0;
    const priority = roi > 200 ? 'High' : roi > 100 ? 'Medium' : 'Low';
    return { ...e, totalCost, forecastedRevenue, roi, priority };
  }), [expansionData]);

  const highPotentialCount = useMemo(() => marketsCalculated.filter((m) => m.priority === 'High').length, [marketsCalculated]);
  const highestPotentialRev = useMemo(() => (marketsCalculated.length ? Math.max(...marketsCalculated.map((m) => m.potentialRevenue)) : 0), [marketsCalculated]);
  const bestRoi = useMemo(() => (marketsCalculated.length ? Math.max(...marketsCalculated.map((m) => m.roi)) : 0), [marketsCalculated]);
  const totalExpansionCost = useMemo(() => marketsCalculated.reduce((acc, m) => acc + m.totalCost, 0), [marketsCalculated]);
  const topHighPotentialMarkets = useMemo(() => [...marketsCalculated].sort((a, b) => b.roi - a.roi).slice(0, 3), [marketsCalculated]);
  const expansionOpportunities = useMemo(() => marketsCalculated.filter((m) => m.priority === 'High' || m.priority === 'Medium'), [marketsCalculated]);

  const forecastChartData = {
    labels: marketsCalculated.map((m) => m.market),
    datasets: [{ label: 'Forecasted Revenue ($)', data: marketsCalculated.map((m) => m.forecastedRevenue), backgroundColor: '#2563eb' }],
  };
  const roiChartData = {
    labels: marketsCalculated.map((m) => m.market),
    datasets: [{ label: 'Expansion ROI (%)', data: marketsCalculated.map((m) => Number(m.roi.toFixed(1))), backgroundColor: '#16a34a' }],
  };

  return (
    <>
      <div id="mis-dashboard-capture">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate('/')} className="mis-btn-action">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '20px', color: 'var(--admin-text-main)', margin: 0, fontWeight: 700 }}>
            High Potential Markets Detail View
          </h2>
        </div>

        <div className="mis-kpi-grid">
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-globe" /> High Potential</div>
            <div className="mis-kpi-value">{highPotentialCount}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-arrow-up" /> Highest Revenue</div>
            <div className="mis-kpi-value">${highestPotentialRev.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-chart-line" /> Best ROI</div>
            <div className="mis-kpi-value">{bestRoi.toFixed(1)}%</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-coins" /> Expansion Cost</div>
            <div className="mis-kpi-value">${totalExpansionCost.toLocaleString()}</div>
          </div>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-globe-americas" style={{ color: 'var(--admin-primary)' }} /> Global Market Expansion Analysis
          </div>
          <div className="mis-section-desc">
            Country/state-level analysis with current revenue, potential, expansion costs, forecasted revenue, and priority tiering.
          </div>
          <div className="mis-formula-note">
            Total Cost = SUM(Platform, Staffing, Office, Marketing, Operations, Legal Costs) · Forecasted Revenue = Current Revenue + Potential Revenue · ROI = (Forecasted Revenue - Total Cost) / Total Cost × 100 · Priority: &gt;200% High, &gt;100% Medium, otherwise Low.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--admin-text-main)', marginBottom: '8px' }}>Forecasted Revenue by Market ($)</h3>
              <div className="mis-chart-container" style={{ height: '220px' }}><Bar data={forecastChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', color: 'var(--admin-text-main)', marginBottom: '8px' }}>Expansion ROI by Market (%)</h3>
              <div className="mis-chart-container" style={{ height: '220px' }}><Bar data={roiChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
            </div>
          </div>

          <div className="mis-table-responsive">
            <table className="mis-table">
              <thead>
                <tr><th>Market</th><th>Region</th><th>Current Users</th><th>Current Revenue</th><th>Potential Revenue</th><th>Growth</th><th>Expansion Cost</th><th>Forecasted Revenue</th><th>ROI</th><th>Priority</th></tr>
              </thead>
              <tbody>
                {marketsCalculated.map((m) => (
                  <tr key={m.market}>
                    <td style={{ fontWeight: 600 }}>{m.market}</td>
                    <td>{m.region}</td>
                    <td>{m.currentUsers.toLocaleString()}</td>
                    <td>${m.currentRevenue.toLocaleString()}</td>
                    <td>${m.potentialRevenue.toLocaleString()}</td>
                    <td>{m.growth}</td>
                    <td>${m.totalCost.toLocaleString()}</td>
                    <td>${m.forecastedRevenue.toLocaleString()}</td>
                    <td>{m.roi.toFixed(1)}%</td>
                    <td><span className={`mis-tag ${priorityTag(m.priority)}`}>{m.priority}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td><td colSpan={5}>Total Expansion Cost: ${totalExpansionCost.toLocaleString()}</td>
                  <td>${totalExpansionCost.toLocaleString()}</td>
                  <td>${marketsCalculated.reduce((acc, m) => acc + m.forecastedRevenue, 0).toLocaleString()}</td>
                  <td colSpan={2}>-</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mis-internal-grid">
            <div className="mis-internal-box">
              <h3>🔍 Top High-Potential Markets</h3>
              <div>
                {topHighPotentialMarkets.map((m) => (
                  <div key={m.market} style={{ marginBottom: 8, padding: 8, background: '#eef2ff', borderRadius: 8, fontSize: 13 }}>
                    💡 <strong>{m.market}</strong> ({m.region}): Forecasted Revenue ${m.forecastedRevenue.toLocaleString()} (ROI: {m.roi.toFixed(1)}%)
                  </div>
                ))}
              </div>
            </div>
            <div className="mis-internal-box">
              <h3>💡 Expansion Opportunities</h3>
              <div>
                {expansionOpportunities.map((m) => (
                  <div key={m.market} style={{ marginBottom: 8, padding: 8, background: m.priority === 'High' ? '#d1fae5' : '#fef3c7', borderRadius: 8, fontSize: 13 }}>
                    🚀 <strong>{m.market}</strong>: Growth Potential {m.growth} · Est. Revenue ${m.potentialRevenue.toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • High Potential Markets Overview</div>
    </>
  );
}
