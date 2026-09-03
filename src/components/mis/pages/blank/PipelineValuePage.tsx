import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';

function stageTag(stage: string): string {
  if (stage.includes('Won')) return 'mis-tag-green';
  if (stage.includes('Lost')) return 'mis-tag-red';
  return 'mis-tag-amber';
}

export default function PipelineValuePage() {
  const navigate = useNavigate();
  const { crmDeals } = useDashboard();

  const totalValue = crmDeals.reduce((acc, d) => acc + d.value, 0);
  const openDeals = crmDeals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
  const avgValue = crmDeals.length ? Math.round(totalValue / crmDeals.length) : 0;
  const won = crmDeals.filter((d) => d.stage === 'Closed Won').length;
  const lost = crmDeals.filter((d) => d.stage === 'Closed Lost').length;
  const winRate = won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(0) : '0';

  const stages = useMemo(() => [...new Set(crmDeals.map((d) => d.stage))], [crmDeals]);
  const stageValues = useMemo(() => stages.map((stage) => crmDeals.filter((d) => d.stage === stage).reduce((acc, d) => acc + d.value, 0)), [stages, crmDeals]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, { count: number; total: number }> = {};
    crmDeals.forEach((d) => {
      if (!counts[d.stage]) counts[d.stage] = { count: 0, total: 0 };
      counts[d.stage].count += 1;
      counts[d.stage].total += d.value;
    });
    return counts;
  }, [crmDeals]);

  const chartData = {
    labels: stages,
    datasets: [{ label: 'Pipeline Value ($)', data: stageValues, backgroundColor: '#2563eb' }],
  };

  return (
    <>
      <div id="mis-dashboard-capture">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate('/')} className="mis-btn-action">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '20px', color: 'var(--admin-text-main)', margin: 0, fontWeight: 700 }}>
            Pipeline Value Detail View
          </h2>
        </div>

        <div className="mis-kpi-grid">
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-funnel-dollar" /> Total Pipeline</div>
            <div className="mis-kpi-value">${totalValue.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-folder-open" /> Open Deals</div>
            <div className="mis-kpi-value">{openDeals.length}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-calculator" /> Avg Deal Value</div>
            <div className="mis-kpi-value">${avgValue.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-trophy" /> Win Rate</div>
            <div className="mis-kpi-value">{winRate}%</div>
          </div>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-chart-bar" style={{ color: 'var(--admin-primary)' }} /> Pipeline Distribution by Stage
          </div>
          <div className="mis-formula-note">Pipeline Value = SUM(Deal Value). Win Rate = Closed Won ÷ Total Closed Deals.</div>
          <div className="mis-chart-container"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          
          <div className="mis-table-responsive">
            <table className="mis-table">
              <thead>
                <tr><th>Deal ID</th><th>Company</th><th>Contact</th><th>Value</th><th>Stage</th><th>Probability</th><th>Expected Close</th></tr>
              </thead>
              <tbody>
                {crmDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td>{deal.id}</td>
                    <td style={{ fontWeight: 600 }}>{deal.company}</td>
                    <td>{deal.contact}</td>
                    <td>${deal.value.toLocaleString()}</td>
                    <td><span className={`mis-tag ${stageTag(deal.stage)}`}>{deal.stage}</span></td>
                    <td>{Math.round(deal.probability * 100)}%</td>
                    <td>{deal.close}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td><td colSpan={2}>All Deals Value</td><td>${totalValue.toLocaleString()}</td>
                  <td colSpan={3}>Open Deals Value: ${openDeals.reduce((acc, d) => acc + d.value, 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mis-internal-grid">
            <div className="mis-internal-box">
              <h3>Stage Breakdown</h3>
              <div>
                {Object.entries(stageCounts).map(([stage, info]) => (
                  <p key={stage}><strong>{stage}:</strong> {info.count} deals (${info.total.toLocaleString()})</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Pipeline Value Overview</div>
    </>
  );
}
