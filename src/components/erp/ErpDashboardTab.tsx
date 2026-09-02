import { ALL_MODULES } from '../../data/modulesData';

interface ErpDashboardTabProps {
  onNavigateModule: (id: number) => void;
}

export function ErpDashboardTab({ onNavigateModule }: ErpDashboardTabProps) {
  const quickModules = ALL_MODULES.slice(0, 8);

  return (
    <div>
      {/* Stats Row */}
      <div className="stats">
        <div className="card">
          <div className="label">
            <i className="fas fa-cubes" /> Modules
          </div>
          <div className="value">46</div>
          <div className="sub">
            <span className="up">
              <i className="fas fa-arrow-up" /> +2
            </span>
          </div>
        </div>
        <div className="card">
          <div className="label">
            <i className="fas fa-users" /> Active Users
          </div>
          <div className="value">1,284</div>
          <div className="sub">
            <span className="up">
              <i className="fas fa-arrow-up" /> +12%
            </span>
          </div>
        </div>
        <div className="card">
          <div className="label">
            <i className="fas fa-tasks" /> Tasks
          </div>
          <div className="value">347</div>
          <div className="sub">
            <span className="up">89 done</span>
          </div>
        </div>
        <div className="card">
          <div className="label">
            <i className="fas fa-calendar-check" /> Meetings
          </div>
          <div className="value">18</div>
          <div className="sub">
            <span className="down">
              <i className="fas fa-arrow-down" /> 3 today
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="panel">
        <div className="panel-head">
          <h3>
            <i className="fas fa-rocket" style={{ color: '#2563eb', marginRight: 8 }} /> Quick Access
          </h3>
        </div>
        <div className="modules-grid">
          {quickModules.map((m) => (
            <div key={m.id} className="module-card" onClick={() => onNavigateModule(m.id)}>
              <div className="icon">
                <i className={`fas ${m.icon}`} />
              </div>
              <div className="info">
                <div className="name">{m.name}</div>
                <div className="desc">{m.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="panel">
        <div className="panel-head">
          <h3>
            <i className="far fa-clock" style={{ color: '#2563eb', marginRight: 8 }} /> Recent Activity
          </h3>
          <span className="text-muted" style={{ fontSize: 13 }}>
            Last 7 days
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="flex-between flex-center" style={{ padding: '8px 0', borderBottom: '1px solid #f0f4fe' }}>
            <span>
              <i className="fas fa-check-circle" style={{ color: '#16a34a', marginRight: 8 }} /> Module "CRM" updated
            </span>
            <span className="text-muted" style={{ fontSize: 13 }}>
              2h ago
            </span>
          </div>
          <div className="flex-between flex-center" style={{ padding: '8px 0', borderBottom: '1px solid #f0f4fe' }}>
            <span>
              <i className="fas fa-user-plus" style={{ color: '#2563eb', marginRight: 8 }} /> New user onboarded
            </span>
            <span className="text-muted" style={{ fontSize: 13 }}>
              4h ago
            </span>
          </div>
          <div className="flex-between flex-center" style={{ padding: '8px 0' }}>
            <span>
              <i className="fas fa-file-invoice" style={{ color: '#f59e0b', marginRight: 8 }} /> Report #045 generated
            </span>
            <span className="text-muted" style={{ fontSize: 13 }}>
              6h ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
