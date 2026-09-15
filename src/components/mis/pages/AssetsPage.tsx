import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';

const DOUGHNUT_COLORS = ['#1F3864', '#2F5597', '#44546A', '#7B93BC', '#A1B4D4', '#2E7D32'];

interface CorporateAsset {
  tag: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchaseValue: number;
  depreciatedValue: number;
  location: string;
  status: 'In Use' | 'Optimal' | 'Maintenance' | 'Active';
}

const ASSET_RECORDS: CorporateAsset[] = [
  {
    tag: 'AST-CLINIC-01',
    name: 'Diagnostic AI Cloud Server Clusters',
    category: 'IT Infrastructure',
    purchaseDate: '2023-05-10',
    purchaseValue: 240000,
    depreciatedValue: 185000,
    location: 'US-East AWS & On-prem',
    status: 'Optimal',
  },
  {
    tag: 'AST-MED-02',
    name: 'Teleconsultation Terminal Kits (120 Units)',
    category: 'Medical Hardware',
    purchaseDate: '2024-01-15',
    purchaseValue: 180000,
    depreciatedValue: 152000,
    location: 'Partner Clinics',
    status: 'In Use',
  },
  {
    tag: 'AST-PAT-03',
    name: 'Proprietary Triage AI Algorithm Patents',
    category: 'Healthcare IP',
    purchaseDate: '2022-09-01',
    purchaseValue: 350000,
    depreciatedValue: 320000,
    location: 'USPTO / Global Registry',
    status: 'Active',
  },
  {
    tag: 'AST-SOFT-04',
    name: 'Enterprise EHR & HIPAA Database Architecture',
    category: 'Digital Assets',
    purchaseDate: '2023-11-20',
    purchaseValue: 210000,
    depreciatedValue: 178000,
    location: 'Cloud Multi-Region',
    status: 'Optimal',
  },
  {
    tag: 'AST-FAC-05',
    name: 'Central Diagnostic & Operations Facility',
    category: 'Real Estate / Facility',
    purchaseDate: '2022-03-12',
    purchaseValue: 650000,
    depreciatedValue: 610000,
    location: 'HQ Medical Center',
    status: 'In Use',
  },
  {
    tag: 'AST-EQUIP-06',
    name: 'Field Diagnostic Mobility Vans (3 Fleet)',
    category: 'Medical Hardware',
    purchaseDate: '2024-06-18',
    purchaseValue: 145000,
    depreciatedValue: 138000,
    location: 'Metro Operations',
    status: 'Maintenance',
  },
];

export default function AssetsPage() {
  const categorySummary = useMemo(() => {
    const map: Record<string, number> = {};
    ASSET_RECORDS.forEach((a) => {
      map[a.category] = (map[a.category] || 0) + a.depreciatedValue;
    });
    return map;
  }, []);

  const totalPurchaseValue = useMemo(
    () => ASSET_RECORDS.reduce((acc, a) => acc + a.purchaseValue, 0),
    [],
  );
  const totalDepreciatedValue = useMemo(
    () => ASSET_RECORDS.reduce((acc, a) => acc + a.depreciatedValue, 0),
    [],
  );
  const totalDepreciation = totalPurchaseValue - totalDepreciatedValue;

  const chartData = {
    labels: Object.keys(categorySummary),
    datasets: [{ data: Object.values(categorySummary), backgroundColor: DOUGHNUT_COLORS }],
  };

  return (
    <section id="tab-assets" className="mis-tab-panel">
      <div className="mis-section-title">Corporate Assets &amp; Capital Inventory</div>
      <div className="mis-section-desc">
        Comprehensive registry of IT infrastructure, healthcare IP, medical hardware, physical facilities, and asset depreciation.
      </div>
      <div className="mis-formula-note">
        Net Asset Book Value = Acquisition Cost − Accumulated Depreciation · Current Ratio = Current Assets / Current Liabilities.
      </div>

      <div className="mis-chart-container">
        <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      <div className="mis-table-responsive">
        <h3 style={{ color: 'var(--mis-navy)', marginBottom: 10 }}>Master Corporate Asset Register</h3>
        <table className="mis-table" id="mis-assetsTable">
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Acquisition</th>
              <th>Purchase Cost ($)</th>
              <th>Book Value ($)</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ASSET_RECORDS.map((a) => (
              <tr key={a.tag}>
                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{a.tag}</td>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td>{a.category}</td>
                <td>{a.purchaseDate}</td>
                <td>${a.purchaseValue.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: '#1F3864' }}>${a.depreciatedValue.toLocaleString()}</td>
                <td>{a.location}</td>
                <td>
                  <span
                    className={`mis-tag ${
                      a.status === 'Optimal' || a.status === 'Active'
                        ? 'mis-tag-green'
                        : a.status === 'Maintenance'
                        ? 'mis-tag-amber'
                        : 'mis-tag-blue'
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total Assets</td>
              <td colSpan={3}>6 Major Capital Assets</td>
              <td style={{ color: '#6b7a99' }}>${totalPurchaseValue.toLocaleString()}</td>
              <td style={{ fontWeight: 700, color: '#2E7D32' }}>${totalDepreciatedValue.toLocaleString()}</td>
              <td colSpan={2}>Accumulated Deprec.: ${totalDepreciation.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mis-internal-grid">
        <div className="mis-internal-box">
          <h3>Balance Sheet Asset Metrics</h3>
          <p><strong>Gross Capital Investment:</strong> ${totalPurchaseValue.toLocaleString()}</p>
          <p><strong>Current Net Book Value:</strong> ${totalDepreciatedValue.toLocaleString()}</p>
          <p><strong>Total Accumulated Depreciation:</strong> ${totalDepreciation.toLocaleString()} (10.9%)</p>
          <p><strong>Healthcare IP Valuation:</strong> $320,000 (Proprietary Triage AI)</p>
        </div>
        <div className="mis-internal-box">
          <h3>Asset Health &amp; Upkeep</h3>
          <p><strong>Active Operational Assets:</strong> 94.4% of total inventory</p>
          <p><strong>Scheduled Maintenance Cycle:</strong> Fleet Vans Q4 2026</p>
          <p><strong>Cloud Infra Uptime SLA:</strong> 99.98% High Availability</p>
          <p><strong>Insurance Coverage:</strong> 100% Capital Assets Insured</p>
        </div>
      </div>
    </section>
  );
}
