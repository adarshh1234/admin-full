import { Button } from '../../common/Button';

export function BitrixCalendarView() {
  return (
    <div className="bitrix-content-view">
      <div className="bitrix-view-header">
        <div className="bitrix-view-title-wrap">
          <span className="bitrix-view-badge calendar-badge">
            <i className="fas fa-calendar-alt" />
          </span>
          <div>
            <h2>Calendar · Schedule</h2>
            <p>Meetings, executive appointments, and action plan</p>
          </div>
        </div>
        <Button type="button" className="bitrix-header-action-btn">
          <i className="fas fa-plus" /> New Event
        </Button>
      </div>


      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ background: '#f8faff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>Today</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0b1a33', marginTop: 4 }}>
            <i className="fas fa-circle" style={{ color: '#2563eb', fontSize: 10, marginRight: 6 }} /> 3 appointments
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>This Week</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0b1a33', marginTop: 4 }}>
            <i className="fas fa-calendar-week" style={{ color: '#2563eb', marginRight: 6 }} /> 12 meetings
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>Upcoming</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0b1a33', marginTop: 4 }}>
            <i className="fas fa-clock" style={{ color: '#2563eb', marginRight: 6 }} /> Board review · Aug 26
          </div>
        </div>
        <div style={{ background: '#f8faff', borderRadius: 12, padding: '14px 16px', border: '1px solid #e9edf4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: '#6b7a8f' }}>Action Plan</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0b1a33', marginTop: 4 }}>
            <i className="fas fa-list-check" style={{ color: '#2563eb', marginRight: 6 }} /> 5 items pending
          </div>
        </div>
      </div>

      <div style={{ padding: 20, background: '#f8faff', borderRadius: 14, border: '1px solid #e9edf4' }}>
        <span style={{ fontWeight: 700, color: '#0b1a33', fontSize: 15 }}>📅 Scheduled Appointments</span>
        <ul style={{ marginTop: 14, listStyle: 'none', fontSize: 13.5 }}>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #e9edf4', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 600, color: '#2563eb' }}>10:00 AM</span>
            <span>Strategy sync with Marketing team</span>
          </li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #e9edf4', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 600, color: '#2563eb' }}>02:00 PM</span>
            <span>Demo for Geniuspie enterprise client</span>
          </li>
          <li style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 600, color: '#2563eb' }}>04:30 PM</span>
            <span>Legal review &amp; M&amp;A documentation</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
