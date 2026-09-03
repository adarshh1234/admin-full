import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';
import { sum, avg, conditionalClass } from '../utils/calc';
import type { WeeklyRow } from '../types';

export default function WeeklyPage() {
  const { weeklyRows, setWeeklyRows, targets } = useDashboard();

  const handleChange = (idx: number, field: keyof WeeklyRow, value: string) => {
    const num = +value || 0;
    setWeeklyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: num } : r)));
  };

  const chartData = {
    labels: weeklyRows.map((r) => r.week),
    datasets: [
      { label: 'WAU', data: weeklyRows.map((r) => r.wau), backgroundColor: '#2F5597' },
      { label: 'Applications', data: weeklyRows.map((r) => r.applications), backgroundColor: '#44546A' },
    ],
  };

  return (
    <section id="tab-weekly" className="mis-tab-panel">
      <div className="mis-section-title">Weekly Summary — Marketplace Balance Sheet</div>
      <div className="mis-section-desc">Assess structural supply-demand balance and weekly engagement metrics.</div>
      <div className="mis-formula-note">Formulas: WAU is captured weekly · CVs Uploaded feeds matchmaking algorithm · Applications measure core conversion.</div>
      <div className="mis-chart-container"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-weeklyTable">
          <thead>
            <tr><th>Week</th><th>WAU</th><th>CVs Uploaded</th><th>Employer Registrations</th><th>Job Applications Submitted</th></tr>
          </thead>
          <tbody>
            {weeklyRows.map((row, idx) => (
              <tr key={row.week}>
                <td>{row.week}</td>
                {(['wau', 'cvs', 'employers', 'applications'] as const).map((field) => (
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
              <td>{sum(weeklyRows, 'wau').toLocaleString()}<br /><small className="mis-text-muted">avg {avg(weeklyRows, 'wau').toFixed(0)}</small></td>
              <td>{sum(weeklyRows, 'cvs').toLocaleString()}<br /><small className="mis-text-muted">avg {avg(weeklyRows, 'cvs').toFixed(0)}</small></td>
              <td>{sum(weeklyRows, 'employers').toLocaleString()}<br /><small className="mis-text-muted">avg {avg(weeklyRows, 'employers').toFixed(0)}</small></td>
              <td>{sum(weeklyRows, 'applications').toLocaleString()}<br /><small className="mis-text-muted">avg {avg(weeklyRows, 'applications').toFixed(0)}</small></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
