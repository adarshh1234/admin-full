import { useNavigate } from 'react-router-dom';
import { mockOpenPositions } from '../../data/userData';

export default function OpenPositionsPage() {
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
            Open Positions Detail View
          </h2>
        </div>

        <div className="mis-panel">
          <div className="mis-section-title">
            <i className="fas fa-briefcase" style={{ color: 'var(--admin-primary)' }} /> Active Open Positions
          </div>
          <div className="mis-section-desc">Current job requisitions across engineering, design, and operations.</div>
          <div className="mis-table-responsive">
            <table className="mis-table">
              <thead>
                <tr>
                  <th>S.No</th><th>Date</th><th>Job Title</th><th>Department</th>
                  <th>Location</th><th>Employment Type</th><th>Experience</th><th>Openings</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockOpenPositions.map((row) => (
                  <tr key={row.sNo}>
                    <td>{row.sNo}</td>
                    <td>{row.date}</td>
                    <td style={{ fontWeight: 600 }}>{row.jobTitle}</td>
                    <td>{row.department}</td>
                    <td>{row.location}</td>
                    <td><span className="mis-tag mis-tag-blue">{row.employmentType}</span></td>
                    <td>{row.experience}</td>
                    <td style={{ fontWeight: 600 }}>{row.openings}</td>
                    <td><span className={`mis-tag ${row.status === 'Open' ? 'mis-tag-green' : 'mis-tag-red'}`}>{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mis-footer">Master MIS Workbook • Open Positions Overview</div>
    </>
  );
}
