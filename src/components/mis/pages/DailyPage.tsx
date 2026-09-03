import { Line } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';
import { sum, avg, conditionalClass } from '../utils/calc';
import type { DailyRow } from '../types';

export default function DailyPage() {
  const { dailyRows, setDailyRows, targets } = useDashboard();

  const handleChange = (idx: number, field: keyof DailyRow, value: string) => {
    const num = +value || 0;
    setDailyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: num } : r)));
  };

  const chartData = {
    labels: dailyRows.map((r) => r.date),
    datasets: [
      { label: 'DAU', data: dailyRows.map((r) => r.dau), borderColor: '#1F3864', yAxisID: 'y', tension: 0.3 },
      { label: 'Revenue ($)', data: dailyRows.map((r) => r.revenue), borderColor: '#2E7D32', yAxisID: 'y1', tension: 0.3 },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { type: 'linear' as const, position: 'left' as const },
      y1: { type: 'linear' as const, position: 'right' as const, grid: { drawOnChartArea: false } },
    },
  };

  return (
    <section id="tab-daily" className="mis-tab-panel">
      <div className="mis-section-title">Daily Tracking — Operations Sheet</div>
      <div className="mis-section-desc">Monitor immediate marketplace activity, traffic, and daily revenue. Editable cells drive live formulas.</div>
      <div className="mis-formula-note">Formulas: Totals = SUM(range) · Averages = AVERAGE(range) · Conditional formatting highlights values below 90% of target.</div>
      <div className="mis-chart-container"><Line data={chartData} options={chartOptions} /></div>
      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-dailyTable">
          <thead>
            <tr><th>Date</th><th>DAU</th><th>New Job Seeker Signups</th><th>Premium Subscriptions Sold</th><th>Job Postings Created</th><th>Daily Revenue ($)</th></tr>
          </thead>
          <tbody>
            {dailyRows.map((row, idx) => (
              <tr key={row.date + idx}>
                <td>{row.date}</td>
                {(['dau', 'signups', 'subs', 'postings', 'revenue'] as const).map((field) => (
                  <td key={field}>
                    <input
                      type="number"
                      step="any"
                      className={conditionalClass(field, row[field], targets)}
                      value={row[field]}
                      onChange={(e) => handleChange(idx, field, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total / Average</td>
              <td>{sum(dailyRows, 'dau').toLocaleString()}<br /><small className="mis-text-muted">avg {avg(dailyRows, 'dau').toFixed(0)}</small></td>
              <td>{sum(dailyRows, 'signups').toLocaleString()}<br /><small className="mis-text-muted">avg {avg(dailyRows, 'signups').toFixed(0)}</small></td>
              <td>{sum(dailyRows, 'subs').toLocaleString()}<br /><small className="mis-text-muted">avg {avg(dailyRows, 'subs').toFixed(0)}</small></td>
              <td>{sum(dailyRows, 'postings').toLocaleString()}<br /><small className="mis-text-muted">avg {avg(dailyRows, 'postings').toFixed(0)}</small></td>
              <td>${sum(dailyRows, 'revenue').toLocaleString()}<br /><small className="mis-text-muted">avg ${avg(dailyRows, 'revenue').toFixed(0)}</small></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
