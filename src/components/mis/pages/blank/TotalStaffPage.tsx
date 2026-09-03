import { useNavigate } from 'react-router-dom';
import { mockTotalStaff } from '../../data/userData';

export default function TotalStaffPage() {
  const navigate = useNavigate();

  return (
    <>
      <div id="mis-dashboard-capture">
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mis-btn-action"
          >
            <i className="fas fa-arrow-left" /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: '20px', color: 'var(--admin-text-main)', margin: 0, fontWeight: 700 }}>
            Total Staff Detail View
          </h2>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-id-badge" style={{ color: 'var(--admin-primary)' }} /> Total Staff Roster
          </div>
          <div className="mis-section-desc">Active employees, designations, and departmental breakdown.</div>
          <div className="mis-table-responsive">
            <table className="mis-table">
              <thead>
                <tr>
                  <th>S.No</th><th>Date</th><th>Employee Name</th><th>Email ID</th>
                  <th>Mobile No</th><th>Designation</th><th>Department</th>
                  <th>Location</th><th>Employment Type</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTotalStaff.map((row) => (
                  <tr key={row.sNo}>
                    <td>{row.sNo}</td>
                    <td>{row.date}</td>
                    <td style={{ fontWeight: 600 }}>{row.employeeName}</td>
                    <td><a href={`mailto:${row.emailId}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{row.emailId}</a></td>
                    <td>{row.mobileNo}</td>
                    <td>{row.designation}</td>
                    <td>{row.department}</td>
                    <td>{row.location}</td>
                    <td><span className="mis-tag mis-tag-blue">{row.employmentType}</span></td>
                    <td><span className={`mis-tag ${row.status === 'Active' ? 'mis-tag-green' : 'mis-tag-red'}`}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Total Staff Overview</div>
    </>
  );
}
