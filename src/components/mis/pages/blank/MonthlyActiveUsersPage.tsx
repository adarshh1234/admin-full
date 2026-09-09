import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';
import { sum, avg, conditionalClass } from '../../utils/calc';
import type { MonthlyRow, QuarterlyRow } from '../../types';

function buildQuarterlyRows(monthlyRows: MonthlyRow[]): QuarterlyRow[] {
  const qRows: QuarterlyRow[] = [];
  for (let q = 3; q >= 0; q--) {
    const months = monthlyRows.slice(q * 3, q * 3 + 3);
    if (!months.length) continue;
    const s = (key: keyof MonthlyRow) => months.reduce((acc, r) => acc + (r[key] as number), 0);
    const a = (key: keyof MonthlyRow) => (months.length ? s(key) / months.length : 0);
    qRows.push({
      quarter: `Q${4 - q}`,
      mauAvg: a('mau'),
      subRev: s('subRev'),
      adRev: s('adRev'),
      totalRev: s('subRev') + s('adRev'),
      qoq: null,
    });
  }
  qRows.forEach((row, idx) => {
    if (idx === 0) row.qoq = null;
    else {
      const prev = qRows[idx - 1];
      row.qoq = (((row.totalRev - prev.totalRev) / prev.totalRev) * 100).toFixed(1) + '%';
    }
  });
  return qRows;
}

export default function MonthlyActiveUsersPage() {
  const navigate = useNavigate();
  const { monthlyRows, setMonthlyRows, targets } = useDashboard();

  const handleChange = (idx: number, field: keyof MonthlyRow, value: string) => {
    const num = +value || 0;
    setMonthlyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: num } : r)));
  };

  const latestRow = useMemo(
    () => (monthlyRows.length ? monthlyRows[monthlyRows.length - 1] : { month: '-', mau: 0, subRev: 0, adRev: 0 }),
    [monthlyRows]
  );

  const totalMau = sum(monthlyRows, 'mau');
  const avgMau = avg(monthlyRows, 'mau');
  const totalSub = sum(monthlyRows, 'subRev');
  const totalAd = sum(monthlyRows, 'adRev');
  const totalRev = totalSub + totalAd;

  const peakMonth = useMemo(() => {
    if (!monthlyRows.length) return { month: '-', mau: 0 };
    return monthlyRows.reduce((max, r) => (r.mau > max.mau ? r : max), monthlyRows[0]);
  }, [monthlyRows]);

  const quarterlyRows = useMemo(() => buildQuarterlyRows(monthlyRows), [monthlyRows]);

  const chartData = {
    labels: monthlyRows.map((r) => r.month),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Monthly Active Users (MAU)',
        data: monthlyRows.map((r) => r.mau),
        backgroundColor: '#2563eb',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: { display: true, text: 'Users' },
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
            Monthly Active Users Detail View
          </h2>
        </div>

        <div className="mis-kpi-grid">
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-users" /> Latest Month MAU</div>
            <div className="mis-kpi-value">{latestRow.mau.toLocaleString()}</div>
            <div className="mis-kpi-sub">{latestRow.month}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-chart-bar" /> 12-Month Avg MAU</div>
            <div className="mis-kpi-value">{Math.round(avgMau).toLocaleString()}</div>
            <div className="mis-kpi-sub">Monthly average</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-trophy" /> Peak MAU Month</div>
            <div className="mis-kpi-value">{peakMonth.mau.toLocaleString()}</div>
            <div className="mis-kpi-sub">{peakMonth.month}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-coins" /> Annualized Revenue</div>
            <div className="mis-kpi-value">${totalRev.toLocaleString()}</div>
            <div className="mis-kpi-sub">Subscription + Ad Rev</div>
          </div>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-users" style={{ color: 'var(--admin-primary)' }} /> 12-Month Active Users &amp; Growth Trajectory
          </div>
          <div className="mis-formula-note">
            Monthly Active Users (MAU) = Unique users engaging across mobile and web per calendar month.
          </div>
          <div className="mis-chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="mis-table-responsive">
            <table className="mis-table" id="mis-mauDetailTable">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>MAU</th>
                  <th>Subscription Revenue ($)</th>
                  <th>Ad Revenue ($)</th>
                  <th>Total Revenue ($)</th>
                  <th>MoM Growth</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((row, idx) => {
                  const total = row.subRev + row.adRev;
                  const momGrowth =
                    idx === 0
                      ? null
                      : (
                          ((total - (monthlyRows[idx - 1].subRev + monthlyRows[idx - 1].adRev)) /
                            (monthlyRows[idx - 1].subRev + monthlyRows[idx - 1].adRev)) *
                          100
                        ).toFixed(1) + '%';
                  return (
                    <tr key={row.month + idx}>
                      <td style={{ fontWeight: 600 }}>{row.month}</td>
                      {(['mau', 'subRev', 'adRev'] as const).map((field) => (
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
                      <td className="mis-computed-cell">${total.toLocaleString()}</td>
                      <td className="mis-computed-cell">{momGrowth || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{totalMau.toLocaleString()}</td>
                  <td>${totalSub.toLocaleString()}</td>
                  <td>${totalAd.toLocaleString()}</td>
                  <td>${totalRev.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <h3 style={{ margin: '28px 0 12px', color: 'var(--mis-navy)', fontSize: '16px', fontWeight: 600 }}>
            Quarterly Performance Summary
          </h3>
          <div className="mis-table-responsive">
            <table className="mis-table" id="mis-mauQuarterlyTable">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>MAU (Avg)</th>
                  <th>Subscription Revenue ($)</th>
                  <th>Ad Revenue ($)</th>
                  <th>Total Revenue ($)</th>
                  <th>QoQ Growth</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyRows.map((row) => (
                  <tr key={row.quarter}>
                    <td style={{ fontWeight: 600 }}>{row.quarter}</td>
                    <td>{Math.round(row.mauAvg).toLocaleString()}</td>
                    <td>${row.subRev.toLocaleString()}</td>
                    <td>${row.adRev.toLocaleString()}</td>
                    <td>${row.totalRev.toLocaleString()}</td>
                    <td>
                      <span className={`mis-tag ${row.qoq && row.qoq.includes('-') ? 'mis-tag-red' : 'mis-tag-green'}`}>
                        {row.qoq || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Monthly Active Users Overview</div>
    </>
  );
}
