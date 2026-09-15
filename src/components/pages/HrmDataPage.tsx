import { useState, useMemo } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../hooks/useToast';

interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  designation: string;
  workMode: 'Onsite' | 'Hybrid' | 'Remote';
  status: 'Active' | 'On Leave' | 'Probation';
  joinDate: string;
  rating: number;
  salary: number;
}

const INITIAL_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'EMP-1001',
    name: 'Dr. Sarah Mitchell',
    email: 'sarah.m@curemaso.com',
    avatar: 'SM',
    department: 'Clinical Ops',
    designation: 'Chief Medical Director',
    workMode: 'Onsite',
    status: 'Active',
    joinDate: '2023-04-15',
    rating: 4.9,
    salary: 18500,
  },
  {
    id: 'EMP-1002',
    name: 'Labeeb EEE',
    email: 'labeeb@curemaso.com',
    avatar: 'LE',
    department: 'Engineering',
    designation: 'Principal Systems Architect',
    workMode: 'Hybrid',
    status: 'Active',
    joinDate: '2022-11-01',
    rating: 5.0,
    salary: 16200,
  },
  {
    id: 'EMP-1003',
    name: 'Priya Sharma',
    email: 'priya.s@curemaso.com',
    avatar: 'PS',
    department: 'Human Resources',
    designation: 'Head of Talent & Culture',
    workMode: 'Hybrid',
    status: 'Active',
    joinDate: '2024-01-10',
    rating: 4.8,
    salary: 12500,
  },
  {
    id: 'EMP-1004',
    name: 'Alexander Vance',
    email: 'alex.v@curemaso.com',
    avatar: 'AV',
    department: 'Sales & Growth',
    designation: 'VP Enterprise Partnerships',
    workMode: 'Remote',
    status: 'Active',
    joinDate: '2023-08-20',
    rating: 4.7,
    salary: 14800,
  },
  {
    id: 'EMP-1005',
    name: 'Nisha Verma',
    email: 'nisha.v@curemaso.com',
    avatar: 'NV',
    department: 'Product',
    designation: 'Senior Product Manager',
    workMode: 'Hybrid',
    status: 'On Leave',
    joinDate: '2024-03-05',
    rating: 4.9,
    salary: 13200,
  },
  {
    id: 'EMP-1006',
    name: 'David Chen',
    email: 'david.c@curemaso.com',
    avatar: 'DC',
    department: 'Engineering',
    designation: 'Lead DevOps Engineer',
    workMode: 'Remote',
    status: 'Active',
    joinDate: '2023-09-12',
    rating: 4.8,
    salary: 14000,
  },
  {
    id: 'EMP-1007',
    name: 'Elena Rostova',
    email: 'elena.r@curemaso.com',
    avatar: 'ER',
    department: 'Finance & Accounts',
    designation: 'Financial Controller',
    workMode: 'Onsite',
    status: 'Active',
    joinDate: '2023-02-18',
    rating: 4.6,
    salary: 13800,
  },
  {
    id: 'EMP-1008',
    name: 'Rahul Deshmukh',
    email: 'rahul.d@curemaso.com',
    avatar: 'RD',
    department: 'Customer Care',
    designation: 'Support Team Lead',
    workMode: 'Hybrid',
    status: 'Probation',
    joinDate: '2026-07-01',
    rating: 4.5,
    salary: 8500,
  },
];

export function HrmDataPage() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<EmployeeRecord[]>(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState('All');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.id.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation.toLowerCase().includes(search.toLowerCase());
      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
      const matchesWorkMode = selectedWorkMode === 'All' || emp.workMode === selectedWorkMode;
      return matchesSearch && matchesDept && matchesStatus && matchesWorkMode;
    });
  }, [employees, search, selectedDept, selectedStatus, selectedWorkMode]);

  const totalSalaryMonthly = useMemo(() => {
    return employees.reduce((acc, e) => acc + e.salary, 0);
  }, [employees]);

  const activeCount = useMemo(() => {
    return employees.filter((e) => e.status === 'Active').length;
  }, [employees]);

  function handleExportDirectory() {
    showToast('Exporting HRM employee directory as CSV…', 'info');
  }

  function handleAddEmployee() {
    const nextId = `EMP-${1000 + employees.length + 1}`;
    const newEmp: EmployeeRecord = {
      id: nextId,
      name: 'New Healthcare Specialist',
      email: `specialist.${employees.length + 1}@curemaso.com`,
      avatar: 'NH',
      department: 'Clinical Ops',
      designation: 'Specialist Associate',
      workMode: 'Hybrid',
      status: 'Probation',
      joinDate: new Date().toISOString().split('T')[0],
      rating: 5.0,
      salary: 11000,
    };
    setEmployees([newEmp, ...employees]);
    showToast(`Added new employee record (${nextId})`, 'success');
  }

  function handleDelete(id: string) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast(`Employee record ${id} archived.`, 'error');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner Header */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, #0b1a33 0%, #1e3a8a 60%, #2563eb 100%)',
          color: '#fff',
          padding: '24px 28px',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(30, 58, 138, 0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 640 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.15)',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              <i className="fas fa-id-badge" /> Human Resource Management Data
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>
              Workforce Intelligence &amp; Master Employee Records
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#e0e7ff', lineHeight: 1.5 }}>
              Centralized employee database, department rosters, payroll bandwidth, attendance logs, and staff compliance metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button
              variant="outline"
              onClick={handleExportDirectory}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderColor: 'rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <i className="fas fa-download" style={{ marginRight: 6 }} /> Export Directory
            </Button>
            <Button
              variant="primary"
              onClick={handleAddEmployee}
              style={{
                background: '#ffffff',
                color: '#1e3a8a',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              <i className="fas fa-user-plus" style={{ marginRight: 6 }} /> Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Total Headcount</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-users" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>{employees.length} Staff</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            <i className="fas fa-check" /> {activeCount} Currently Active
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Active Departments</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-sitemap" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>6 Divisions</div>
          <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 4 }}>
            Clinical, Tech, Growth, HR &amp; Ops
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Monthly Payroll CTC</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-wallet" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>
            ${totalSalaryMonthly.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 4 }}>
            Avg. ${(totalSalaryMonthly / (employees.length || 1)).toFixed(0)} / employee
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Attendance Rate</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-calendar-check" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>97.8%</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            <i className="fas fa-arrow-up" /> +1.2% this quarter
          </div>
        </div>
      </div>

      {/* Main HRM Records Panel */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        {/* Filters Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2540', margin: 0 }}>
            <i className="fas fa-table" style={{ color: '#2563eb', marginRight: 8 }} />
            Employee Records Directory ({filteredEmployees.length})
          </h3>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 220 }}>
              <Input
                type="text"
                placeholder="Search staff, ID, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13, height: 36, width: '100%' }}
              />
              <i
                className="fas fa-search"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8e9bb5', fontSize: 12 }}
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: 13, height: 36, padding: '4px 10px' }}
            >
              <option value="All">All Departments</option>
              <option value="Clinical Ops">Clinical Ops</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales & Growth">Sales &amp; Growth</option>
              <option value="Product">Product</option>
              <option value="Finance & Accounts">Finance &amp; Accounts</option>
              <option value="Customer Care">Customer Care</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: 13, height: 36, padding: '4px 10px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
            </select>

            {/* Work Mode Filter */}
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: 13, height: 36, padding: '4px 10px' }}
            >
              <option value="All">All Work Modes</option>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '1.5px solid #e9edf4' }}>
                {['Emp ID', 'Employee Name', 'Department', 'Designation', 'Work Mode', 'Join Date', 'Rating', 'Salary / Mo', 'Status', 'Actions'].map((h) => (
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
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  style={{ borderBottom: '1px solid #f0f3fa', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8faff')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                >
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>
                    {emp.id}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        {emp.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#1a2540' }}>{emp.name}</div>
                        <div style={{ fontSize: 11, color: '#8e9bb5' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 500, color: '#334155' }}>
                    {emp.department}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#475569' }}>
                    {emp.designation}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        background: emp.workMode === 'Remote' ? '#f3e8ff' : emp.workMode === 'Hybrid' ? '#eff6ff' : '#f1f5f9',
                        color: emp.workMode === 'Remote' ? '#7e22ce' : emp.workMode === 'Hybrid' ? '#1d4ed8' : '#334155',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {emp.workMode}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#6b7a99', whiteSpace: 'nowrap' }}>
                    {emp.joinDate}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontWeight: 700, color: '#d97706' }}>
                      <i className="fas fa-star" style={{ fontSize: 11, marginRight: 3 }} />
                      {emp.rating}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#16a34a' }}>
                    ${emp.salary.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        background:
                          emp.status === 'Active' ? '#dcfce7' : emp.status === 'On Leave' ? '#fef3c7' : '#e0e7ff',
                        color:
                          emp.status === 'Active' ? '#16a34a' : emp.status === 'On Leave' ? '#b45309' : '#3730a3',
                        borderRadius: 20,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ fontSize: 11, padding: '3px 8px', marginRight: 6 }}
                      onClick={() => showToast(`Viewing profile for ${emp.name}`, 'info')}
                    >
                      <i className="fas fa-eye" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ fontSize: 11, padding: '3px 8px', color: '#ef4444', borderColor: '#ef4444' }}
                      onClick={() => handleDelete(emp.id)}
                    >
                      <i className="fas fa-archive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ padding: '28px 14px', textAlign: 'center', color: '#8e9bb5' }}>
                    No employee records match your search filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HrmDataPage;
