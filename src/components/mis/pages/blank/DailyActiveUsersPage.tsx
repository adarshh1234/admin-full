import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import { sum, avg, conditionalClass } from '../../utils/calc';
import type { DailyRow } from '../../types';

export default function DailyActiveUsersPage() {
  const navigate = useNavigate();
  const { dailyRows, setDailyRows, targets } = useDashboard();

  const handleChange = (idx: number, field: keyof DailyRow, value: string) => {
    const num = +value || 0;
    setDailyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: num } : r)));
  };

  const latestRow = useMemo(
    () => (dailyRows.length ? dailyRows[dailyRows.length - 1] : { date: '-', dau: 0, signups: 0, subs: 0, postings: 0, revenue: 0 }),
    [dailyRows]
  );

  const totalDau = sum(dailyRows, 'dau');
  const avgDau = avg(dailyRows, 'dau');
  const totalSignups = sum(dailyRows, 'signups');
  const totalRevenue = sum(dailyRows, 'revenue');

  const peakDay = useMemo(() => {
    if (!dailyRows.length) return { date: '-', dau: 0 };
    return dailyRows.reduce((max, r) => (r.dau > max.dau ? r : max), dailyRows[0]);
  }, [dailyRows]);

  const lowestDay = useMemo(() => {
    if (!dailyRows.length) return { date: '-', dau: 0 };
    return dailyRows.reduce((min, r) => (r.dau < min.dau ? r : min), dailyRows[0]);
  }, [dailyRows]);

  const chartData = {
    labels: dailyRows.map((r) => r.date),
    datasets: [
      {
        label: 'Daily Active Users (DAU)',
        data: dailyRows.map((r) => r.dau),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        yAxisID: 'y',
        tension: 0.3,
      },
      {
        label: 'Signups',
        data: dailyRows.map((r) => r.signups),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
        fill: false,
        yAxisID: 'y1',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: { display: true, text: 'DAU Count' },
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'New Signups' },
      },
    },
  };

  return (
    <>
      <div id="mis-dashboard-capture">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate('/')} className="mis-btn-action">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '20px', color: 'var(--admin-text-main)', margin: 0, fontWeight: 700 }}>
            Daily Active Users Detail View
          </h2>
        </div>

        <div className="mis-kpi-grid">
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-chart-line" /> Latest Day DAU</div>
            <div className="mis-kpi-value">{latestRow.dau.toLocaleString()}</div>
            <div className="mis-kpi-sub">{latestRow.date}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-users" /> 30-Day Avg DAU</div>
            <div className="mis-kpi-value">{Math.round(avgDau).toLocaleString()}</div>
            <div className="mis-kpi-sub">Daily average</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-fire" /> Peak DAU Record</div>
            <div className="mis-kpi-value">{peakDay.dau.toLocaleString()}</div>
            <div className="mis-kpi-sub">{peakDay.date}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-user-plus" /> 30-Day Total Signups</div>
            <div className="mis-kpi-value">{totalSignups.toLocaleString()}</div>
            <div className="mis-kpi-sub">${totalRevenue.toLocaleString()} Total Rev</div>
          </div>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-chart-line" style={{ color: 'var(--admin-primary)' }} /> 30-Day Daily Active Users &amp; Conversion Trend
          </div>
          <div className="mis-formula-note">
            Daily Active Users (DAU) = Unique active user sessions recorded in a 24-hour cycle. Live edits update calculations and charts automatically.
          </div>
          <div className="mis-chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="mis-table-responsive">
            <table className="mis-table" id="mis-dauDetailTable">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>DAU</th>
                  <th>New Job Seeker Signups</th>
                  <th>Premium Subscriptions</th>
                  <th>Job Postings Created</th>
                  <th>Daily Revenue ($)</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((row, idx) => (
                  <tr key={row.date + idx}>
                    <td style={{ fontWeight: 600 }}>{row.date}</td>
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
                  <td>
                    {totalDau.toLocaleString()}
                    <br />
                    <small className="mis-text-muted">avg {avgDau.toFixed(0)}</small>
                  </td>
                  <td>
                    {totalSignups.toLocaleString()}
                    <br />
                    <small className="mis-text-muted">avg {avg(dailyRows, 'signups').toFixed(0)}</small>
                  </td>
                  <td>
                    {sum(dailyRows, 'subs').toLocaleString()}
                    <br />
                    <small className="mis-text-muted">avg {avg(dailyRows, 'subs').toFixed(0)}</small>
                  </td>
                  <td>
                    {sum(dailyRows, 'postings').toLocaleString()}
                    <br />
                    <small className="mis-text-muted">avg {avg(dailyRows, 'postings').toFixed(0)}</small>
                  </td>
                  <td>
                    ${totalRevenue.toLocaleString()}
                    <br />
                    <small className="mis-text-muted">avg ${avg(dailyRows, 'revenue').toFixed(0)}</small>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mis-internal-grid">
            <div className="mis-internal-box">
              <h3>🚀 Peak Activity Highlight</h3>
              <div>
                <p><strong>Peak Date:</strong> {peakDay.date}</p>
                <p><strong>Max Active Users:</strong> <span className="mis-tag mis-tag-green">{peakDay.dau.toLocaleString()} DAU</span></p>
                <p><strong>Signups on Peak:</strong> {dailyRows.find((r) => r.date === peakDay.date)?.signups.toLocaleString() || '-'}</p>
              </div>
            </div>
            <div className="mis-internal-box">
              <h3>📉 Baseline Activity</h3>
              <div>
                <p><strong>Lowest Date:</strong> {lowestDay.date}</p>
                <p><strong>Baseline Active Users:</strong> <span className="mis-tag mis-tag-amber">{lowestDay.dau.toLocaleString()} DAU</span></p>
                <p><strong>30-Day Avg Volume:</strong> {Math.round(avgDau).toLocaleString()} DAU/day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Daily Active Users Overview</div>
    </>
  );
}
