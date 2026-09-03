import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

function stageTag(stage: string): string {
  if (stage.includes('Won')) return 'mis-tag-green';
  if (stage.includes('Lost')) return 'mis-tag-red';
  return 'mis-tag-amber';
}

export default function CRMPage() {
  const { crmDeals } = useDashboard();

  const stages = useMemo(() => [...new Set(crmDeals.map((d) => d.stage))], [crmDeals]);
  const chartData = {
    labels: stages,
    datasets: [{ label: 'Deal Count', data: stages.map((s) => crmDeals.filter((d) => d.stage === s).length), backgroundColor: '#2F5597' }],
  };

  const totalValue = crmDeals.reduce((acc, d) => acc + d.value, 0);
  const weightedValueAll = crmDeals.reduce((acc, d) => acc + d.value * d.probability, 0);

  const openDeals = crmDeals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
  const won = crmDeals.filter((d) => d.stage === 'Closed Won').length;
  const lost = crmDeals.filter((d) => d.stage === 'Closed Lost').length;
  const winRate = won + lost > 0 ? ((won / (won + lost)) * 100).toFixed(0) : '0';
  const pipelineValue = openDeals.reduce((acc, d) => acc + d.value, 0);
  const weightedValue = openDeals.reduce((acc, d) => acc + d.value * d.probability, 0);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    crmDeals.forEach((d) => { counts[d.stage] = (counts[d.stage] || 0) + 1; });
    return counts;
  }, [crmDeals]);

  return (
    <section id="tab-crm" className="mis-tab-panel">
      <div className="mis-section-title">CRM &amp; Sales Pipeline</div>
      <div className="mis-section-desc">Leads, opportunities, and conversion metrics for employer acquisition and partnerships.</div>
      <div className="mis-formula-note">Pipeline Value = SUM(Deal Value × Probability). Win Rate = Closed Won ÷ Total Closed Deals.</div>
      <div className="mis-chart-container"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-crmTable">
          <thead>
            <tr><th>Deal ID</th><th>Company</th><th>Contact</th><th>Value ($)</th><th>Stage</th><th>Probability</th><th>Expected Close</th></tr>
          </thead>
          <tbody>
            {crmDeals.map((deal) => (
              <tr key={deal.id}>
                <td>{deal.id}</td>
                <td>{deal.company}</td>
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
              <td>Total</td><td colSpan={3}>Pipeline Value</td><td>${totalValue.toLocaleString()}</td>
              <td colSpan={2}>Weighted: ${weightedValueAll.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Pipeline Summary</h3>
          <div>
            <p><strong>Open Deals:</strong> {openDeals.length}</p>
            <p><strong>Pipeline Value:</strong> ${pipelineValue.toLocaleString()}</p>
            <p><strong>Weighted Value:</strong> ${weightedValue.toLocaleString()}</p>
            <p><strong>Win Rate:</strong> {winRate}%</p>
          </div>
        </div>
        <div className="mis-internal-box">
          <h3>Stage-wise Breakdown</h3>
          <div>
            {Object.entries(stageCounts).map(([k, v]) => (
              <span className="mis-tag mis-tag-blue" key={k} style={{ marginRight: 6, marginBottom: 6, display: 'inline-block' }}>{k}: {v}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
