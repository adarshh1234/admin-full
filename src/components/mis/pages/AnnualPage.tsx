import { Line } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';
import { sum } from '../utils/calc';
import type { AnnualRow } from '../types';

function conditionalAnnualClass(field: string, value: number, target: number): string {
  if (!target) return '';
  if (field === 'marketingSpend' || field === 'opex') {
    if (value > target * 1.1) return 'mis-below-target';
    if (value <= target) return 'mis-above-target';
    return '';
  }
  if (value < target * 0.9) return 'mis-below-target';
  if (value >= target) return 'mis-above-target';
  return '';
}

export default function AnnualPage() {
  const { annualRows, setAnnualRows, targets } = useDashboard();

  const handleChange = (idx: number, field: keyof AnnualRow, value: string) => {
    const num = +value || 0;
    setAnnualRows((rows) => rows.map((r, i) => (i === idx ? { ...r, [field]: num } : r)));
  };

  const chartData = {
    labels: annualRows.map((r) => r.year),
    datasets: [
      { label: 'Net Profit Margin (%)', data: annualRows.map((r) => Number((((r.revenue - r.opex) / r.revenue) * 100).toFixed(1))), borderColor: '#2E7D32', yAxisID: 'y', tension: 0.3 },
      { label: 'CAC ($)', data: annualRows.map((r) => Number((r.marketingSpend / r.newCustomers).toFixed(1))), borderColor: '#C62828', yAxisID: 'y1', tension: 0.3 },
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

  const totalReg = sum(annualRows, 'registrations');
  const totalMkt = sum(annualRows, 'marketingSpend');
  const totalNew = sum(annualRows, 'newCustomers');
  const totalRev = sum(annualRows, 'revenue');
  const totalOpex = sum(annualRows, 'opex');
  const avgCac = totalNew ? (totalMkt / totalNew).toFixed(1) : '0.0';
  const avgMargin = totalRev ? (((totalRev - totalOpex) / totalRev) * 100).toFixed(1) : '0.0';

  return (
    <section id="tab-annual" className="mis-tab-panel">
      <div className="mis-section-title">Annual Overview — Long-Term Runway</div>
      <div className="mis-section-desc">Unit economics, CAC efficiency, and profitability margin over multi-year horizon.</div>
      <div className="mis-formula-note">CAC = Marketing Spend ÷ New Customers · Net Profit Margin = (Revenue − Operating Costs) ÷ Revenue.</div>
      <div className="mis-chart-container"><Line data={chartData} options={chartOptions} /></div>
      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-annualTable">
          <thead>
            <tr><th>Year</th><th>Total Registrations (M)</th><th>Marketing Spend ($)</th><th>New Customers</th><th>Revenue ($)</th><th>Operating Costs ($)</th><th>CAC ($)</th><th>Net Profit Margin (%)</th></tr>
          </thead>
          <tbody>
            {annualRows.map((row, idx) => {
              const cac = (row.marketingSpend / row.newCustomers).toFixed(1);
              const margin = (((row.revenue - row.opex) / row.revenue) * 100).toFixed(1);
              return (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  {(['registrations', 'marketingSpend', 'newCustomers', 'revenue', 'opex'] as const).map((field) => (
                    <td key={field}>
                      <input
                        type="number"
                        step="any"
                        className={conditionalAnnualClass(field, row[field], targets[field as keyof typeof targets] || 0)}
                        value={row[field]}
                        onChange={(e) => handleChange(idx, field, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="mis-computed-cell">${cac}</td>
                  <td className="mis-computed-cell">{margin}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total / Average</td>
              <td>{totalReg.toFixed(1)}M</td>
              <td>${totalMkt.toLocaleString()}</td>
              <td>{totalNew.toLocaleString()}</td>
              <td>${totalRev.toLocaleString()}</td>
              <td>${totalOpex.toLocaleString()}</td>
              <td>${avgCac}</td>
              <td>{avgMargin}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
