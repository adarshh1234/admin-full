import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';
import { sum, conditionalClass } from '../utils/calc';
import type { MonthlyRow, QuarterlyRow } from '../types';

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

export default function MonthlyPage() {
  const { monthlyRows, setMonthlyRows, targets } = useDashboard();

  const handleChange = (idx: number, field: keyof MonthlyRow, value: string) => {
    const num = +value || 0;
    setMonthlyRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: num } : r)));
  };

  const quarterlyRows = useMemo(() => buildQuarterlyRows(monthlyRows), [monthlyRows]);

  const chartData = {
    labels: monthlyRows.map((r) => r.month),
    datasets: [
      { label: 'Subscription Revenue', data: monthlyRows.map((r) => r.subRev), backgroundColor: '#1F3864' },
      { label: 'Ad Revenue', data: monthlyRows.map((r) => r.adRev), backgroundColor: '#7B93BC' },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  const totalMau = sum(monthlyRows, 'mau');
  const totalSub = sum(monthlyRows, 'subRev');
  const totalAd = sum(monthlyRows, 'adRev');
  const totalRev = totalSub + totalAd;

  return (
    <section id="tab-monthly" className="mis-tab-panel">
      <div className="mis-section-title">Monthly &amp; Quarterly — Monetization Dashboard</div>
      <div className="mis-section-desc">Revenue stream breakdown and QoQ growth automation for executive review.</div>
      <div className="mis-formula-note">Total Revenue = Subscription Revenue + Ad Revenue · QoQ Growth = (Current Quarter - Previous Quarter) / Previous Quarter.</div>
      <div className="mis-chart-container"><Bar data={chartData} options={chartOptions} /></div>
      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-monthlyTable">
          <thead>
            <tr><th>Month</th><th>MAU</th><th>Subscription Revenue ($)</th><th>Ad Revenue ($)</th><th>Total Revenue ($)</th><th>MoM Growth</th></tr>
          </thead>
          <tbody>
            {monthlyRows.map((row, idx) => {
              const total = row.subRev + row.adRev;
              const momGrowth = idx === 0 ? null : (((total - (monthlyRows[idx - 1].subRev + monthlyRows[idx - 1].adRev)) / (monthlyRows[idx - 1].subRev + monthlyRows[idx - 1].adRev)) * 100).toFixed(1) + '%';
              return (
                <tr key={row.month + idx}>
                  <td>{row.month}</td>
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
      <h3 style={{ margin: '28px 0 12px', color: 'var(--mis-navy)' }}>Quarterly Summary — QoQ Growth</h3>
      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-quarterlyTable">
          <thead>
            <tr><th>Quarter</th><th>MAU (avg)</th><th>Subscription Revenue ($)</th><th>Ad Revenue ($)</th><th>Total Revenue ($)</th><th>QoQ Growth</th></tr>
          </thead>
          <tbody>
            {quarterlyRows.map((row) => (
              <tr key={row.quarter}>
                <td>{row.quarter}</td>
                <td>{Math.round(row.mauAvg).toLocaleString()}</td>
                <td>${row.subRev.toLocaleString()}</td>
                <td>${row.adRev.toLocaleString()}</td>
                <td>${row.totalRev.toLocaleString()}</td>
                <td className={row.qoq && row.qoq.includes('-') ? 'mis-below-target' : 'mis-above-target'}>{row.qoq || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
