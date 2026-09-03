import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { useDashboard } from '../../context/DashboardContext';

function duesTag(status: string): string {
  if (status === 'Paid') return 'mis-tag-green';
  if (status === 'Overdue') return 'mis-tag-red';
  return 'mis-tag-amber';
}

export default function OverdueDuesPage() {
  const navigate = useNavigate();
  const { duesData } = useDashboard();

  const overdueItems = useMemo(() => duesData.filter((d) => d.status === 'Overdue'), [duesData]);
  const pendingItems = useMemo(() => duesData.filter((d) => d.status === 'Pending'), [duesData]);
  const totalOverdue = useMemo(() => overdueItems.reduce((acc, d) => acc + d.amount, 0), [overdueItems]);
  const overdueCount = overdueItems.length;
  const highestOverdue = useMemo(() => (overdueItems.length ? Math.max(...overdueItems.map((d) => d.amount)) : 0), [overdueItems]);
  const totalPending = useMemo(() => pendingItems.reduce((acc, d) => acc + d.amount, 0), [pendingItems]);

  const statusSummary = useMemo(() => {
    const statuses = ['Overdue', 'Pending', 'Paid'];
    return statuses.map((s) => ({ status: s, total: duesData.filter((d) => d.status === s).reduce((acc, d) => acc + d.amount, 0) }));
  }, [duesData]);

  const chartData = {
    labels: statusSummary.map((s) => s.status),
    datasets: [{ label: 'Amount ($)', data: statusSummary.map((s) => s.total), backgroundColor: ['#dc2626', '#d97706', '#16a34a'] }],
  };

  return (
    <>
      <div id="mis-dashboard-capture">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" onClick={() => navigate('/')} className="mis-btn-action">
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '20px', color: 'var(--admin-text-main)', margin: 0, fontWeight: 700 }}>
            Overdue Dues Detail View
          </h2>
        </div>

        <div className="mis-kpi-grid">
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-exclamation-triangle" style={{ color: '#dc2626' }} /> Total Overdue</div>
            <div className="mis-kpi-value" style={{ color: '#dc2626' }}>${totalOverdue.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-list-ol" /> Overdue Items</div>
            <div className="mis-kpi-value">{overdueCount}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-arrow-up" /> Highest Amount</div>
            <div className="mis-kpi-value">${highestOverdue.toLocaleString()}</div>
          </div>
          <div className="mis-kpi-card">
            <div className="mis-kpi-label"><i className="fas fa-clock" /> Pending Amount</div>
            <div className="mis-kpi-value">${totalPending.toLocaleString()}</div>
          </div>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--admin-primary)' }} /> Accounts Payable Overview
          </div>
          <div className="mis-formula-note">Overdue Dues = Payable amounts past due date. Total Dues = Overdue + Pending + Paid.</div>
          <div className="mis-chart-container"><Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          
          <div className="mis-table-responsive">
            <table className="mis-table">
              <thead><tr><th>Vendor</th><th>Description</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {duesData.map((d, i) => (
                  <tr key={d.vendor + i}>
                    <td style={{ fontWeight: 600 }}>{d.vendor}</td>
                    <td>{d.desc}</td>
                    <td>${d.amount.toLocaleString()}</td>
                    <td>{d.due}</td>
                    <td><span className={`mis-tag ${duesTag(d.status)}`}>{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>All Dues: ${duesData.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}</td>
                  <td>Overdue: ${totalOverdue.toLocaleString()}</td>
                  <td colSpan={2}>Pending: ${totalPending.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Overdue Dues Overview</div>
    </>
  );
}
