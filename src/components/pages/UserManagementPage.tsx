import { useState } from 'react';
import { ModuleDetailPage } from './ModuleDetailPage';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

// Reused for the Account tab — same data the old Accounting module used
const ACCOUNT_MODULE = {
  id: 9,
  name: 'Account',
  category: 'core',
  icon: 'fa-coins',
};

type UMTab = 'user-management' | 'account';

// ---------------------------------------------------------------------------
// Sample users for the User Management tab
// ---------------------------------------------------------------------------
const SAMPLE_USERS = [
  { id: 1, name: 'labeeb.eee_candidate', email: 'labeeb@curemaso.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'priya.sharma', email: 'priya@curemaso.com', role: 'Manager', status: 'Active' },
  { id: 3, name: 'rahul.ops', email: 'rahul@curemaso.com', role: 'Operator', status: 'Inactive' },
  { id: 4, name: 'nisha.crm', email: 'nisha@curemaso.com', role: 'CRM Agent', status: 'Active' },
];

function UserManagementTab() {
  const [search, setSearch] = useState('');
  const filtered = SAMPLE_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <Input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, width: '100%' }}
          />
          <i
            className="fas fa-search"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8e9bb5', fontSize: 13 }}
          />
        </div>
        <Button variant="primary" style={{ marginLeft: 'auto' }}>
          <i className="fas fa-user-plus" /> Invite User
        </Button>
      </div>

      {/* Users table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8faff', borderBottom: '1.5px solid #e9edf4' }}>
              {['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#6b7a99',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr
                key={u.id}
                style={{ borderBottom: '1px solid #f0f3fa', transition: 'background 0.12s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8faff')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
              >
                <td style={{ padding: '11px 14px', fontWeight: 500, color: '#1a2540' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#2563eb1a',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: 12,
                      marginRight: 8,
                    }}
                  >
                    {u.name[0].toUpperCase()}
                  </span>
                  {u.name}
                </td>
                <td style={{ padding: '11px 14px', color: '#6b7a99' }}>{u.email}</td>
                <td style={{ padding: '11px 14px' }}>
                  <span
                    style={{
                      background: '#2563eb1a',
                      color: '#2563eb',
                      borderRadius: 20,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <span
                    style={{
                      background: u.status === 'Active' ? '#dcfce7' : '#f1f5f9',
                      color: u.status === 'Active' ? '#16a34a' : '#8e9bb5',
                      borderRadius: 20,
                      padding: '2px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {u.status}
                  </span>
                </td>
                <td style={{ padding: '11px 14px' }}>
                  <Button variant="outline" style={{ fontSize: 12, padding: '3px 10px', marginRight: 6 }}>
                    <i className="fas fa-edit" /> Edit
                  </Button>
                  <Button variant="outline" style={{ fontSize: 12, padding: '3px 10px', color: '#ef4444', borderColor: '#ef4444' }}>
                    <i className="fas fa-trash-alt" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px 14px', textAlign: 'center', color: '#8e9bb5' }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
interface UserManagementPageProps {
  initialTab?: UMTab;
}

export function UserManagementPage({ initialTab = 'user-management' }: UserManagementPageProps) {
  const [activeTab, setActiveTab] = useState<UMTab>(initialTab);

  return (
    <div>
      {/* Tab nav — same class as ErpDashboardPage / CRM / etc. */}
      <div className="tab-nav">
        <Button
          type="button"
          className={`tab-btn${activeTab === 'user-management' ? ' active' : ''}`}
          onClick={() => setActiveTab('user-management')}
        >
          <i className="fas fa-users-cog" /> User Management
        </Button>
        <Button
          type="button"
          className={`tab-btn${activeTab === 'account' ? ' active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <i className="fas fa-coins" /> Account
        </Button>
      </div>

      {/* Tab contents */}
      <div className={`tab-content${activeTab === 'user-management' ? ' active' : ''}`}>
        <UserManagementTab />
      </div>

      <div className={`tab-content${activeTab === 'account' ? ' active' : ''}`}>
        <ModuleDetailPage module={ACCOUNT_MODULE} />
      </div>
    </div>
  );
}
