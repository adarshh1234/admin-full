import { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

const PIE_COLORS = ['#1F3864', '#2F5597', '#44546A', '#7B93BC', '#A1B4D4', '#C7D3E8'];

function duesTag(status: string): string {
  if (status === 'Paid') return 'mis-tag-green';
  if (status === 'Overdue') return 'mis-tag-red';
  return 'mis-tag-amber';
}
function taxTag(status: string): string {
  if (status === 'Paid') return 'mis-tag-green';
  if (status === 'Pending') return 'mis-tag-amber';
  return 'mis-tag-blue';
}

export default function AccountsPage() {
  const { duesData, recurringExpenses, taxLegal } = useDashboard();

  const categories = useMemo(() => {
    const cats: Record<string, number> = {};
    recurringExpenses.forEach((r) => { cats[r.category] = (cats[r.category] || 0) + r.monthly; });
    return cats;
  }, [recurringExpenses]);

  const chartData = {
    labels: Object.keys(categories),
    datasets: [{ data: Object.values(categories), backgroundColor: PIE_COLORS }],
  };

  const totalDues = duesData.reduce((acc, d) => acc + d.amount, 0);
  const overdueDues = duesData.filter((d) => d.status === 'Overdue').reduce((acc, d) => acc + d.amount, 0);
  const totalMonthlyRecurring = recurringExpenses.reduce((acc, r) => acc + r.monthly, 0);
  const totalAnnualRecurring = recurringExpenses.reduce((acc, r) => acc + r.annual, 0);
  const totalTax = taxLegal.reduce((acc, t) => acc + t.amount, 0);

  return (
    <section id="tab-accounts" className="mis-tab-panel">
      <div className="mis-section-title">Accounts &amp; Finance — Income, Dues, Expenses</div>
      <div className="mis-section-desc">Cash inflow, upcoming payables, recurring costs, and tax/legal obligations.</div>
      <div className="mis-formula-note">Net Cash = Total Income − Total Expenses. Overdue = Dues with Due Date &lt; Today and Status ≠ Paid.</div>
      <div className="mis-chart-container"><Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Upcoming Payment Dues</h3>
        <table className="mis-table" id="mis-duesTable">
          <thead><tr><th>Vendor</th><th>Description</th><th>Amount ($)</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {duesData.map((d, i) => (
              <tr key={d.vendor + i}>
                <td>{d.vendor}</td>
                <td>{d.desc}</td>
                <td>${d.amount.toLocaleString()}</td>
                <td>{d.due}</td>
                <td><span className={`mis-tag ${duesTag(d.status)}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td>Total</td><td colSpan={2}>${totalDues.toLocaleString()}</td><td colSpan={2}>Overdue: ${overdueDues.toLocaleString()}</td></tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Monthly Recurring Expenses</h3>
        <table className="mis-table" id="mis-recurringTable">
          <thead><tr><th>Item</th><th>Category</th><th>Monthly Amount ($)</th><th>Annual Amount ($)</th><th>Next Due Date</th></tr></thead>
          <tbody>
            {recurringExpenses.map((r, i) => (
              <tr key={r.item + i}>
                <td>{r.item}</td>
                <td>{r.category}</td>
                <td>${r.monthly.toLocaleString()}</td>
                <td>${r.annual.toLocaleString()}</td>
                <td>{r.nextDue}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td>Total</td><td colSpan={2}>${totalMonthlyRecurring.toLocaleString()}/month</td><td>${totalAnnualRecurring.toLocaleString()}/year</td><td></td></tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Tax &amp; Legal Obligations</h3>
        <table className="mis-table" id="mis-taxTable">
          <thead><tr><th>Description</th><th>Amount ($)</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {taxLegal.map((t, i) => (
              <tr key={t.desc + i}>
                <td>{t.desc}</td>
                <td>${t.amount.toLocaleString()}</td>
                <td>{t.due}</td>
                <td><span className={`mis-tag ${taxTag(t.status)}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td>Total</td><td>${totalTax.toLocaleString()}</td><td colSpan={2}></td></tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
