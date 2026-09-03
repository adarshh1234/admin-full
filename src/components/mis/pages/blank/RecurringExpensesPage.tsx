import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';

const PIE_COLORS = ['#2563eb', '#1d4ed8', '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'];

export default function RecurringExpensesPage() {
  const navigate = useNavigate();
  const { recurringExpenses } = useDashboard();

  const monthlyTotal = useMemo(() => recurringExpenses.reduce((acc, r) => acc + r.monthly, 0), [recurringExpenses]);
  const annualTotal = useMemo(() => recurringExpenses.reduce((acc, r) => acc + r.annual, 0), [recurringExpenses]);
  const largestExpense = useMemo(() => {
    if (!recurringExpenses.length) return { item: '-', monthly: 0 };
    return recurringExpenses.reduce((max, r) => (r.monthly > max.monthly ? r : max), recurringExpenses[0]);
  }, [recurringExpenses]);

  const categories = useMemo(() => {
    const cats: Record<string, number> = {};
    recurringExpenses.forEach((r) => { cats[r.category] = (cats[r.category] || 0) + r.monthly; });
    return cats;
  }, [recurringExpenses]);

  const chartData = {
    labels: Object.keys(categories),
    datasets: [{ data: Object.values(categories), backgroundColor: PIE_COLORS.slice(0, Object.keys(categories).length) }],
  };

  return (
    <>
      <div id="mis-dashboard-capture">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate('/')} className="mis-btn-action">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '20px', color: 'var(--admin-text-main)', margin: 0, fontWeight: 700 }}>
            Recurring Expenses Detail View
          </h2>
        </div>

        <div className="mis-kpi-grid">
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-calendar-alt" /> Monthly Total</div>
            <div className="mis-kpi-value">${monthlyTotal.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-calendar-check" /> Annual Total</div>
            <div className="mis-kpi-value">${annualTotal.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-money-bill-wave" /> Largest Item</div>
            <div className="mis-kpi-value">${largestExpense.monthly.toLocaleString()}</div>
            <div className="mis-kpi-sub">{largestExpense.item}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-list" /> Total Items</div>
            <div className="mis-kpi-value">{recurringExpenses.length}</div>
          </div>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-chart-pie" style={{ color: 'var(--admin-primary)' }} /> Category Distribution &amp; Schedule
          </div>
          <div className="mis-formula-note">Monthly Total = SUM(Monthly Amount). Annual Total = SUM(Annual Amount).</div>
          <div className="mis-chart-container"><Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          
          <div className="mis-table-responsive">
            <table className="mis-table">
              <thead><tr><th>Item</th><th>Category</th><th>Monthly Amount</th><th>Annual Amount</th><th>Next Due Date</th></tr></thead>
              <tbody>
                {recurringExpenses.map((r, i) => (
                  <tr key={r.item + i}>
                    <td style={{ fontWeight: 600 }}>{r.item}</td>
                    <td>{r.category}</td>
                    <td>${r.monthly.toLocaleString()}</td>
                    <td>${r.annual.toLocaleString()}</td>
                    <td>{r.nextDue}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td><td>{Object.keys(categories).length} Categories</td>
                  <td>${monthlyTotal.toLocaleString()}/month</td><td>${annualTotal.toLocaleString()}/year</td><td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Recurring Expenses Overview</div>
    </>
  );
}
