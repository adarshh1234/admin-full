import { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../hooks/useToast';
import { AcmasoModule } from '../acmaso/AcmasoModule';

type UMTab = 'user-management' | 'candidates' | 'bulk-candidates' | 'hrms' | 'account';
type CandidateSubTab = 'fresher' | 'experienced';

// ---------------------------------------------------------------------------
// Sample data for existing User Management tab
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
// CANDIDATES TAB (Fresher & Experienced sub-tabs)
// ---------------------------------------------------------------------------
interface FresherCandidate {
  id: string;
  name: string;
  email: string;
  degree: string;
  college: string;
  year: number;
  cgpa: string;
  appliedRole: string;
  status: 'Applied' | 'Interview' | 'Shortlisted' | 'Offered';
}

interface ExperiencedCandidate {
  id: string;
  name: string;
  email: string;
  currentCompany: string;
  currentRole: string;
  experienceYears: number;
  expectedCtc: string;
  noticePeriod: string;
  appliedRole: string;
  status: 'Tech Round' | 'Shortlisted' | 'HR Round' | 'Offered';
}

const SAMPLE_FRESHERS: FresherCandidate[] = [
  {
    id: 'FSH-101',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@gmail.com',
    degree: 'B.Tech Healthcare Tech',
    college: 'IIT Kharagpur',
    year: 2026,
    cgpa: '8.9 / 10',
    appliedRole: 'Junior Clinical Informatics Engineer',
    status: 'Interview',
  },
  {
    id: 'FSH-102',
    name: 'Rohan Gupta',
    email: 'rohan.g@yahoo.com',
    degree: 'MBBS / General Medicine',
    college: 'AIIMS New Delhi',
    year: 2025,
    cgpa: 'Gold Medalist',
    appliedRole: 'Teleconsultation Resident',
    status: 'Shortlisted',
  },
  {
    id: 'FSH-103',
    name: 'Sneha Patel',
    email: 'sneha.p@outlook.com',
    degree: 'B.Pharm',
    college: 'Manipal College of Pharma',
    year: 2026,
    cgpa: '8.4 / 10',
    appliedRole: 'Pharmacovigilance Associate',
    status: 'Offered',
  },
  {
    id: 'FSH-104',
    name: 'Karthik Raja',
    email: 'karthik.r@gmail.com',
    degree: 'B.E. Computer Science',
    college: 'NIT Trichy',
    year: 2026,
    cgpa: '9.1 / 10',
    appliedRole: 'Frontend Developer',
    status: 'Applied',
  },
];

const SAMPLE_EXPERIENCED: ExperiencedCandidate[] = [
  {
    id: 'EXP-201',
    name: 'Dr. Vikramaditya Roy',
    email: 'v.roy@mednetwork.org',
    currentCompany: 'Apollo Health City',
    currentRole: 'Senior Consultant - Cardiology',
    experienceYears: 7.5,
    expectedCtc: '$120,000 / yr',
    noticePeriod: '30 Days',
    appliedRole: 'Head of Digital Cardiology Ops',
    status: 'HR Round',
  },
  {
    id: 'EXP-202',
    name: 'Meenakshi Sundaram',
    email: 'meenakshi.s@techmed.io',
    currentCompany: 'Cerner Health',
    currentRole: 'Lead EHR Systems Architect',
    experienceYears: 5.0,
    expectedCtc: '$95,000 / yr',
    noticePeriod: 'Immediate',
    appliedRole: 'Principal Health Tech Architect',
    status: 'Tech Round',
  },
  {
    id: 'EXP-203',
    name: 'Rajesh Menon',
    email: 'rajesh.menon@fortis.com',
    currentCompany: 'Fortis Hospitals Group',
    currentRole: 'Regional Hospital Operations Manager',
    experienceYears: 9.2,
    expectedCtc: '$110,000 / yr',
    noticePeriod: '15 Days',
    appliedRole: 'VP Hospital Partnerships',
    status: 'Offered',
  },
  {
    id: 'EXP-204',
    name: 'Pooja Kashyap',
    email: 'pooja.k@medpulse.in',
    currentCompany: 'MedPulse Diagnostics',
    currentRole: 'Senior Quality Assurance Specialist',
    experienceYears: 3.8,
    expectedCtc: '$65,000 / yr',
    noticePeriod: '30 Days',
    appliedRole: 'Clinical QA Lead',
    status: 'Shortlisted',
  },
];

function CandidatesTab() {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<CandidateSubTab>('fresher');
  const [search, setSearch] = useState('');

  const filteredFreshers = SAMPLE_FRESHERS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.college.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedRole.toLowerCase().includes(search.toLowerCase()) ||
      c.degree.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredExperienced = SAMPLE_EXPERIENCED.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.currentCompany.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedRole.toLowerCase().includes(search.toLowerCase()) ||
      c.currentRole.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Sub-tab Navigation for Fresher & Experienced */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
          <Button
            type="button"
            className={`tab-btn${subTab === 'fresher' ? ' active' : ''}`}
            onClick={() => {
              setSubTab('fresher');
              setSearch('');
            }}
            style={{
              padding: '7px 16px',
              fontSize: 13,
              borderRadius: 8,
              background: subTab === 'fresher' ? '#ffffff' : 'transparent',
              boxShadow: subTab === 'fresher' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              fontWeight: subTab === 'fresher' ? 700 : 500,
              color: subTab === 'fresher' ? '#2563eb' : '#64748b',
            }}
          >
            <i className="fas fa-graduation-cap" style={{ marginRight: 6 }} /> Fresher Candidates ({SAMPLE_FRESHERS.length})
          </Button>
          <Button
            type="button"
            className={`tab-btn${subTab === 'experienced' ? ' active' : ''}`}
            onClick={() => {
              setSubTab('experienced');
              setSearch('');
            }}
            style={{
              padding: '7px 16px',
              fontSize: 13,
              borderRadius: 8,
              background: subTab === 'experienced' ? '#ffffff' : 'transparent',
              boxShadow: subTab === 'experienced' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              fontWeight: subTab === 'experienced' ? 700 : 500,
              color: subTab === 'experienced' ? '#2563eb' : '#64748b',
            }}
          >
            <i className="fas fa-briefcase" style={{ marginRight: 6 }} /> Experienced Talent ({SAMPLE_EXPERIENCED.length})
          </Button>
        </div>

        <div style={{ position: 'relative', width: 260 }}>
          <Input
            type="text"
            placeholder={subTab === 'fresher' ? 'Search freshers...' : 'Search experienced...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 32, fontSize: 13, height: 36, width: '100%' }}
          />
          <i
            className="fas fa-search"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8e9bb5', fontSize: 12 }}
          />
        </div>
      </div>

      {/* Sub-tab 1: Fresher Content */}
      {subTab === 'fresher' && (
        <div className="panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a2540' }}>
                Campus &amp; Entry-Level Graduate Pool
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7a99' }}>
                Screening candidates graduating in 2025–2026 across healthcare, medical technology, informatics and software engineering.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast('Exporting fresher shortlist as CSV…', 'info')}
            >
              <i className="fas fa-download" style={{ marginRight: 4 }} /> Export
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8faff', borderBottom: '1.5px solid #e9edf4' }}>
                  {['Candidate', 'Degree & Institution', 'Batch', 'CGPA / Score', 'Applied Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7a99', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFreshers.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid #f0f3fa', transition: 'background 0.12s' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8faff')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1a2540' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#8e9bb5' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 500, color: '#2563eb' }}>{c.degree}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{c.college}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7a99' }}>{c.year}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#059669' }}>{c.cgpa}</td>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>{c.appliedRole}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: c.status === 'Offered' ? '#dcfce7' : c.status === 'Shortlisted' ? '#eff6ff' : c.status === 'Interview' ? '#fef3c7' : '#f1f5f9',
                          color: c.status === 'Offered' ? '#16a34a' : c.status === 'Shortlisted' ? '#1d4ed8' : c.status === 'Interview' ? '#b45309' : '#64748b',
                          borderRadius: 20,
                          padding: '2px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ fontSize: 11, padding: '3px 8px', marginRight: 6 }}
                        onClick={() => showToast(`Reviewing resume of ${c.name}`, 'info')}
                      >
                        <i className="fas fa-file-alt" /> Resume
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                        onClick={() => showToast(`Shortlisted ${c.name} for technical test`, 'success')}
                      >
                        <i className="fas fa-check" /> Shortlist
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Experienced Content */}
      {subTab === 'experienced' && (
        <div className="panel" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a2540' }}>
                Lateral &amp; Senior Medical / Tech Professionals
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7a99' }}>
                Experienced doctors, healthcare directors, systems architects, and clinical operations executives.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showToast('Exporting lateral candidates report…', 'info')}
            >
              <i className="fas fa-download" style={{ marginRight: 4 }} /> Export
            </Button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8faff', borderBottom: '1.5px solid #e9edf4' }}>
                  {['Candidate', 'Current Role & Company', 'Experience', 'Expected CTC', 'Notice Period', 'Target Role', 'Stage', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7a99', fontSize: 12, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredExperienced.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid #f0f3fa', transition: 'background 0.12s' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8faff')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 600, color: '#1a2540' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#8e9bb5' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 500, color: '#1a2540' }}>{c.currentRole}</div>
                      <div style={{ fontSize: 11, color: '#2563eb' }}>{c.currentCompany}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>
                      {c.experienceYears} yrs
                    </td>
                    <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 600 }}>{c.expectedCtc}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ background: c.noticePeriod === 'Immediate' ? '#dcfce7' : '#f1f5f9', color: c.noticePeriod === 'Immediate' ? '#16a34a' : '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                        {c.noticePeriod}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#334155' }}>{c.appliedRole}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background: c.status === 'Offered' ? '#dcfce7' : c.status === 'Shortlisted' ? '#eff6ff' : '#fef3c7',
                          color: c.status === 'Offered' ? '#16a34a' : c.status === 'Shortlisted' ? '#1d4ed8' : '#b45309',
                          borderRadius: 20,
                          padding: '2px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ fontSize: 11, padding: '3px 8px', marginRight: 6 }}
                        onClick={() => showToast(`Scheduling executive interview with ${c.name}`, 'info')}
                      >
                        <i className="fas fa-calendar-alt" /> Interview
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                        onClick={() => showToast(`Offer letter generated for ${c.name}`, 'success')}
                      >
                        <i className="fas fa-paper-plane" /> Offer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BULK CANDIDATES TAB
// ---------------------------------------------------------------------------
interface BulkBatch {
  id: string;
  batchName: string;
  source: string;
  totalResumes: number;
  parsedCount: number;
  date: string;
  status: 'Completed' | 'Processing' | 'Pending';
}

const SAMPLE_BATCHES: BulkBatch[] = [
  {
    id: 'BATCH-801',
    batchName: 'Campus Drive 2026 AIIMS & IITs',
    source: 'Campus Placement Portal',
    totalResumes: 450,
    parsedCount: 450,
    date: '2026-09-12',
    status: 'Completed',
  },
  {
    id: 'BATCH-802',
    batchName: 'LinkedIn Telemedicine Specialists Export',
    source: 'LinkedIn Talent Solutions',
    totalResumes: 180,
    parsedCount: 165,
    date: '2026-09-10',
    status: 'Completed',
  },
  {
    id: 'BATCH-803',
    batchName: 'MedRecruit Agency Fall Batch',
    source: 'External Agency ZIP',
    totalResumes: 320,
    parsedCount: 210,
    date: '2026-09-14',
    status: 'Processing',
  },
];

function BulkCandidatesTab() {
  const { showToast } = useToast();
  const [batches, setBatches] = useState<BulkBatch[]>(SAMPLE_BATCHES);

  function handleUploadZip() {
    const newBatch: BulkBatch = {
      id: `BATCH-${800 + batches.length + 1}`,
      batchName: `Bulk Upload Batch #${batches.length + 1}`,
      source: 'Direct ZIP Upload',
      totalResumes: 125,
      parsedCount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'Processing',
    };
    setBatches([newBatch, ...batches]);
    showToast('Bulk resume archive uploaded! Parsing in background…', 'success');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Upload Zone */}
      <div
        className="panel"
        style={{
          border: '2px dashed #93c5fd',
          background: '#f8faff',
          borderRadius: 14,
          padding: '36px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 14 }}>
          <i className="fas fa-cloud-upload-alt" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a2540', margin: '0 0 6px 0' }}>
          Bulk Candidate Ingestion &amp; Resume Parsing
        </h3>
        <p style={{ fontSize: 13.5, color: '#64748b', maxWidth: 540, margin: '0 auto 18px auto', lineHeight: 1.5 }}>
          Upload CSV spreadsheet, Excel sheet (.xlsx), or ZIP folder containing candidate resumes. AI will extract qualifications, experience, and contact information automatically.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={handleUploadZip} style={{ fontSize: 13, padding: '10px 20px' }}>
            <i className="fas fa-folder-open" style={{ marginRight: 6 }} /> Upload Resumes (ZIP / CSV)
          </Button>
          <Button
            variant="outline"
            onClick={() => showToast('Sample candidate ingestion template downloaded.', 'info')}
            style={{ fontSize: 13 }}
          >
            <i className="fas fa-file-excel" style={{ marginRight: 6 }} /> Download CSV Template
          </Button>
        </div>
      </div>

      {/* Batch History */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2540', marginBottom: 16 }}>
          <i className="fas fa-history" style={{ color: '#2563eb', marginRight: 8 }} />
          Recent Ingestion Batches
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '1.5px solid #e9edf4' }}>
                {['Batch ID', 'Batch Name', 'Source', 'Resumes', 'Parsed', 'Upload Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7a99', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => (
                <tr
                  key={b.id}
                  style={{ borderBottom: '1px solid #f0f3fa', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8faff')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                >
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{b.id}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1a2540' }}>{b.batchName}</td>
                  <td style={{ padding: '12px 14px', color: '#64748b' }}>{b.source}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#334155' }}>{b.totalResumes} files</td>
                  <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: 600 }}>{b.parsedCount} extracted</td>
                  <td style={{ padding: '12px 14px', color: '#6b7a99' }}>{b.date}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        background: b.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                        color: b.status === 'Completed' ? '#16a34a' : '#b45309',
                        borderRadius: 20,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ fontSize: 11, padding: '3px 8px' }}
                      onClick={() => showToast(`Viewing parsed profiles for ${b.batchName}`, 'info')}
                    >
                      <i className="fas fa-list" /> View Records
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HRMS TAB
// ---------------------------------------------------------------------------
function HrmsTab() {
  const { showToast } = useToast();

  const HR_STATS = [
    { title: 'Total Employees', value: '248 Active', icon: 'fa-users', color: '#2563eb', bg: '#eff6ff' },
    { title: 'On Leave Today', value: '6 Members', icon: 'fa-calendar-minus', color: '#d97706', bg: '#fef3c7' },
    { title: 'Open Requisitions', value: '14 Positions', icon: 'fa-user-plus', color: '#16a34a', bg: '#f0fdf4' },
    { title: 'Payroll Bandwidth', value: '$1.42M / mo', icon: 'fa-wallet', color: '#9333ea', bg: '#faf5ff' },
  ];

  const LEAVE_REQUESTS = [
    { id: 1, name: 'Dr. Sarah Mitchell', dept: 'Clinical Ops', type: 'Annual Leave', dates: '18 Sep – 22 Sep (5 Days)', reason: 'Medical Conference Speaker' },
    { id: 2, name: 'David Chen', dept: 'Engineering', type: 'Casual Leave', dates: '16 Sep (1 Day)', reason: 'Personal Appointment' },
    { id: 3, name: 'Nisha Verma', dept: 'Product', type: 'Medical Leave', dates: '12 Sep – 15 Sep (4 Days)', reason: 'Recovery' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        {HR_STATS.map((s) => (
          <div key={s.title} className="panel" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>{s.title}</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${s.icon}`} />
              </div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1a2540' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Leave Approvals and Roster */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2540', margin: 0 }}>
            <i className="fas fa-calendar-check" style={{ color: '#2563eb', marginRight: 8 }} />
            Pending Leave &amp; Attendance Requests
          </h3>
          <span className="tag-blue" style={{ fontSize: 11 }}>3 Pending Review</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '1.5px solid #e9edf4' }}>
                {['Staff Member', 'Department', 'Leave Type', 'Dates & Duration', 'Reason', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#6b7a99', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEAVE_REQUESTS.map((req) => (
                <tr
                  key={req.id}
                  style={{ borderBottom: '1px solid #f0f3fa', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8faff')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1a2540' }}>{req.name}</td>
                  <td style={{ padding: '12px 14px', color: '#2563eb', fontWeight: 500 }}>{req.dept}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {req.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#334155' }}>{req.dates}</td>
                  <td style={{ padding: '12px 14px', color: '#64748b' }}>{req.reason}</td>
                  <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ fontSize: 11, padding: '3px 10px', marginRight: 6 }}
                      onClick={() => showToast(`Approved leave request for ${req.name}`, 'success')}
                    >
                      <i className="fas fa-check" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ fontSize: 11, padding: '3px 10px', color: '#ef4444', borderColor: '#ef4444' }}
                      onClick={() => showToast(`Declined leave request for ${req.name}`, 'error')}
                    >
                      <i className="fas fa-times" /> Decline
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN USER MANAGEMENT PAGE WITH TABS
// ---------------------------------------------------------------------------
interface UserManagementPageProps {
  initialTab?: UMTab;
}

export function UserManagementPage({ initialTab = 'user-management' }: UserManagementPageProps) {
  const [activeTab, setActiveTab] = useState<UMTab>(initialTab);

  return (
    <div>
      {/* Tab navigation */}
      <div className="tab-nav" style={{ marginBottom: 20 }}>
        <Button
          type="button"
          className={`tab-btn${activeTab === 'user-management' ? ' active' : ''}`}
          onClick={() => setActiveTab('user-management')}
        >
          <i className="fas fa-users-cog" style={{ marginRight: 6 }} /> User Management
        </Button>
        <Button
          type="button"
          className={`tab-btn${activeTab === 'candidates' ? ' active' : ''}`}
          onClick={() => setActiveTab('candidates')}
        >
          <i className="fas fa-user-graduate" style={{ marginRight: 6 }} /> Candidates
        </Button>
        <Button
          type="button"
          className={`tab-btn${activeTab === 'bulk-candidates' ? ' active' : ''}`}
          onClick={() => setActiveTab('bulk-candidates')}
        >
          <i className="fas fa-layer-group" style={{ marginRight: 6 }} /> Bulk Candidates
        </Button>
        <Button
          type="button"
          className={`tab-btn${activeTab === 'hrms' ? ' active' : ''}`}
          onClick={() => setActiveTab('hrms')}
        >
          <i className="fas fa-sitemap" style={{ marginRight: 6 }} /> HRMS
        </Button>
        <Button
          type="button"
          className={`tab-btn${activeTab === 'account' ? ' active' : ''}`}
          onClick={() => setActiveTab('account')}
        >
          <i className="fas fa-coins" style={{ marginRight: 6 }} /> Acmaso
        </Button>
      </div>

      {/* Tab contents */}
      <div className={`tab-content${activeTab === 'user-management' ? ' active' : ''}`}>
        {activeTab === 'user-management' && <UserManagementTab />}
      </div>

      <div className={`tab-content${activeTab === 'candidates' ? ' active' : ''}`}>
        {activeTab === 'candidates' && <CandidatesTab />}
      </div>

      <div className={`tab-content${activeTab === 'bulk-candidates' ? ' active' : ''}`}>
        {activeTab === 'bulk-candidates' && <BulkCandidatesTab />}
      </div>

      <div className={`tab-content${activeTab === 'hrms' ? ' active' : ''}`}>
        {activeTab === 'hrms' && <HrmsTab />}
      </div>

      <div className={`tab-content${activeTab === 'account' ? ' active' : ''}`}>
        {activeTab === 'account' && <AcmasoModule />}
      </div>
    </div>
  );
}

export default UserManagementPage;
