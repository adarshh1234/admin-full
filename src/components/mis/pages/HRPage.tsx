import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useDashboard } from '../context/DashboardContext';

const DOUGHNUT_COLORS = ['#1F3864', '#2F5597', '#44546A', '#7B93BC', '#A1B4D4', '#C7D3E8', '#E2E8F0'];

function statusTag(status: string): string {
  if (status === 'Active') return 'mis-tag-green';
  if (status === 'On Leave') return 'mis-tag-amber';
  return 'mis-tag-red';
}

export default function HRPage() {
  const { staffData } = useDashboard();

  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    staffData.forEach((e) => { counts[e.dept] = (counts[e.dept] || 0) + 1; });
    return counts;
  }, [staffData]);

  const assignmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    staffData.forEach((e) => { counts[e.assignment] = (counts[e.assignment] || 0) + 1; });
    return counts;
  }, [staffData]);

  const chartData = {
    labels: Object.keys(deptCounts),
    datasets: [{ data: Object.values(deptCounts), backgroundColor: DOUGHNUT_COLORS }],
  };

  const active = staffData.filter((e) => e.status === 'Active').length;
  const onLeave = staffData.filter((e) => e.status === 'On Leave').length;
  const totalSalary = staffData.reduce((acc, e) => acc + e.salary, 0);

  return (
    <section id="tab-hr" className="mis-tab-panel">
      <div className="mis-section-title">HR &amp; Staff — Internal Workforce</div>
      <div className="mis-section-desc">Staff headcount, department distribution, assignments, and operational capacity.</div>
      <div className="mis-formula-note">Total Staff = COUNT(Staff List) · Department-wise breakdown = COUNTIF(Department). Active assignments reflect current project load.</div>
      <div className="mis-chart-container"><Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
      <div className="mis-table-responsive">
        <table className="mis-table" id="mis-hrTable">
          <thead>
            <tr><th>Employee ID</th><th>Name</th><th>Department</th><th>Role</th><th>Status</th><th>Assignment</th><th>Join Date</th><th>Salary ($)</th></tr>
          </thead>
          <tbody>
            {staffData.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td>{emp.dept}</td>
                <td>{emp.role}</td>
                <td><span className={`mis-tag ${statusTag(emp.status)}`}>{emp.status}</span></td>
                <td>{emp.assignment}</td>
                <td>{emp.join}</td>
                <td>${emp.salary.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td>Total</td><td colSpan={6}>{staffData.length} employees</td><td>${totalSalary.toLocaleString()}</td></tr>
          </tfoot>
        </table>
      </div>
      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Staff Summary</h3>
          <div>
            <p><strong>Total Staff:</strong> {staffData.length}</p>
            <p><strong>Active:</strong> {active}</p>
            <p><strong>On Leave:</strong> {onLeave}</p>
            <p><strong>Departments:</strong><br />{Object.entries(deptCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}</p>
          </div>
        </div>
        <div className="mis-internal-box">
          <h3>Assignment Status</h3>
          <div>
            {Object.entries(assignmentCounts).map(([k, v]) => (
              <span className="mis-tag mis-tag-blue" key={k} style={{ marginRight: 6, marginBottom: 6, display: 'inline-block' }}>{k}: {v}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
