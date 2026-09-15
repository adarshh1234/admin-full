import { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../../hooks/useToast';

type MarketingTab = 'refer-earn' | 'promotion';

interface ReferralItem {
  id: number;
  referrerName: string;
  referrerEmail: string;
  referredName: string;
  entityType: 'Doctor' | 'Clinic' | 'Hospital' | 'Patient';
  date: string;
  rewardAmount: string;
  status: 'Completed' | 'Pending' | 'Rewarded';
}

interface PromoItem {
  id: number;
  code: string;
  title: string;
  type: 'Percentage' | 'Flat Discount' | 'Trial';
  value: string;
  targetAudience: string;
  validUntil: string;
  usedCount: number;
  maxLimit: number;
  status: 'Active' | 'Scheduled' | 'Expired';
}

const SAMPLE_REFERRALS: ReferralItem[] = [
  {
    id: 1,
    referrerName: 'Dr. Aakash Verma',
    referrerEmail: 'aakash.v@curemaso.com',
    referredName: 'Apex Health Clinic (Dr. R. Sen)',
    entityType: 'Clinic',
    date: '2026-09-12',
    rewardAmount: '$150',
    status: 'Rewarded',
  },
  {
    id: 2,
    referrerName: 'Dr. Priya Sharma',
    referrerEmail: 'priya.s@curemaso.com',
    referredName: 'CarePlus Multi-Specialty',
    entityType: 'Hospital',
    date: '2026-09-10',
    rewardAmount: '$300',
    status: 'Completed',
  },
  {
    id: 3,
    referrerName: 'City Diagnostic Labs',
    referrerEmail: 'contact@citylabs.org',
    referredName: 'Dr. Meera Iyer (Cardiology)',
    entityType: 'Doctor',
    date: '2026-09-08',
    rewardAmount: '$100',
    status: 'Pending',
  },
  {
    id: 4,
    referrerName: 'Dr. Suresh Nair',
    referrerEmail: 'snair@healthfirst.in',
    referredName: 'Green Valley Wellness Centre',
    entityType: 'Clinic',
    date: '2026-09-05',
    rewardAmount: '$150',
    status: 'Rewarded',
  },
  {
    id: 5,
    referrerName: 'Labeeb EEE',
    referrerEmail: 'labeeb@curemaso.com',
    referredName: 'Metro Healthcare Group',
    entityType: 'Hospital',
    date: '2026-09-01',
    rewardAmount: '$500',
    status: 'Rewarded',
  },
];

const SAMPLE_PROMOTIONS: PromoItem[] = [
  {
    id: 1,
    code: 'CUREWELCOME25',
    title: 'New Clinic Onboarding Discount',
    type: 'Percentage',
    value: '25% OFF',
    targetAudience: 'New Clinic Accounts',
    validUntil: '30 Oct 2026',
    usedCount: 342,
    maxLimit: 500,
    status: 'Active',
  },
  {
    id: 2,
    code: 'DOCSPECIAL50',
    title: 'Specialist Module Flat Rebate',
    type: 'Flat Discount',
    value: '$50 Flat',
    targetAudience: 'Individual Doctors',
    validUntil: '15 Nov 2026',
    usedCount: 618,
    maxLimit: 1000,
    status: 'Active',
  },
  {
    id: 3,
    code: 'ENTERPRISE30',
    title: 'Hospital Enterprise Annual Pass',
    type: 'Percentage',
    value: '30% OFF',
    targetAudience: 'Hospitals & Networks',
    validUntil: '31 Dec 2026',
    usedCount: 89,
    maxLimit: 200,
    status: 'Active',
  },
  {
    id: 4,
    code: 'DIAGNOSTIC15',
    title: 'Diagnostics Lab Integration',
    type: 'Percentage',
    value: '15% OFF',
    targetAudience: 'Diagnostic Partners',
    validUntil: '01 Sep 2026',
    usedCount: 200,
    maxLimit: 200,
    status: 'Expired',
  },
  {
    id: 5,
    code: 'TELECONSULT10',
    title: 'Telemedicine Launch Promo',
    type: 'Percentage',
    value: '10% OFF',
    targetAudience: 'All Telehealth Users',
    validUntil: '20 Dec 2026',
    usedCount: 1450,
    maxLimit: 2500,
    status: 'Active',
  },
];

/* -------------------------------------------------------------------------
 * TAB 1: Refer & Earn Component
 * ------------------------------------------------------------------------- */
export function ReferAndEarnTab() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [referrals, setReferrals] = useState<ReferralItem[]>(SAMPLE_REFERRALS);

  const inviteCode = 'CUREMASO-REF-2026';
  const inviteUrl = 'https://curemaso.com/ref/invite?code=CUREMASO-REF-2026';

  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.referrerName.toLowerCase().includes(search.toLowerCase()) ||
      r.referredName.toLowerCase().includes(search.toLowerCase()) ||
      r.entityType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleCopyCode() {
    navigator.clipboard?.writeText(inviteCode);
    showToast(`Referral code "${inviteCode}" copied to clipboard!`, 'success');
  }

  function handleCopyLink() {
    navigator.clipboard?.writeText(inviteUrl);
    showToast('Referral invite link copied to clipboard!', 'success');
  }

  function handleApprove(id: number) {
    setReferrals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rewarded' } : r)),
    );
    showToast('Referral reward marked as paid!', 'success');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Banner / Invite Code Sharing */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)',
          color: '#fff',
          padding: '24px 28px',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              <i className="fas fa-gift" /> Refer &amp; Earn Program
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>
              Invite Doctors, Clinics &amp; Hospitals to Curemaso
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#e0e7ff', lineHeight: 1.5 }}>
              Earn up to 20% lifetime revenue share or flat $300 bonus for every new verified healthcare facility onboarded through your network.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: 12, color: '#1a2540', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7a99', marginBottom: 6 }}>
              Your Master Referral Code
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1, color: '#2563eb', fontFamily: 'monospace' }}>
                {inviteCode}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                style={{ borderColor: '#2563eb', color: '#2563eb' }}
                title="Copy Code"
              >
                <i className="fas fa-copy" /> Copy
              </Button>
            </div>
            <div style={{ marginTop: 10 }}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyLink}
                style={{ width: '100%', fontSize: 12 }}
              >
                <i className="fas fa-link" /> Copy Shareable Link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Total Referrals</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-users" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>2,845</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            <i className="fas fa-arrow-up" /> +18.4% from last month
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Successful Onboardings</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-check-circle" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>1,730</div>
          <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 4 }}>
            60.8% conversion rate
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Rewards Distributed</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-coins" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>$42,800</div>
          <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 4 }}>
            $5,400 pending release
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Active Advocates</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-user-shield" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>640</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            +42 new this week
          </div>
        </div>
      </div>

      {/* Program Reward Tiers */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2540', marginBottom: 14 }}>
          <i className="fas fa-layer-group" style={{ color: '#2563eb', marginRight: 8 }} />
          Advocate Reward Tiers
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div style={{ border: '1px solid #e9edf4', borderRadius: 10, padding: '14px 16px', background: '#f8faff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1e3a8a' }}>Tier 1: Standard</span>
              <span className="tag-blue" style={{ fontSize: 11 }}>1–5 Referrals</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb', margin: '8px 0 4px 0' }}>10% Bonus</div>
            <div style={{ fontSize: 12, color: '#6b7a99' }}>$100 flat bonus upon clinic signup verification.</div>
          </div>

          <div style={{ border: '1.5px solid #2563eb33', borderRadius: 10, padding: '14px 16px', background: '#eff6ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1e3a8a' }}>Tier 2: Silver Partner</span>
              <span style={{ background: '#2563eb', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>6–20 Referrals</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb', margin: '8px 0 4px 0' }}>15% Rev Share</div>
            <div style={{ fontSize: 12, color: '#6b7a99' }}>15% quarterly revenue share + priority account manager.</div>
          </div>

          <div style={{ border: '1px solid #fde68a', borderRadius: 10, padding: '14px 16px', background: '#fffbeb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>Tier 3: Gold Ambassador</span>
              <span style={{ background: '#d97706', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>20+ Referrals</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706', margin: '8px 0 4px 0' }}>20% Lifetime</div>
            <div style={{ fontSize: 12, color: '#78350f' }}>20% recurring lifetime payouts &amp; VIP conference access.</div>
          </div>
        </div>
      </div>

      {/* Referrals Activity Table */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2540', margin: 0 }}>
            Recent Referral Activity
          </h3>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Input
                type="text"
                placeholder="Search referrals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13, height: 36, width: '100%' }}
              />
              <i
                className="fas fa-search"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8e9bb5', fontSize: 12 }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: 13, height: 36, padding: '4px 10px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Rewarded">Rewarded</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '1.5px solid #e9edf4' }}>
                {['Referrer', 'Referred Entity', 'Category', 'Date', 'Reward', 'Status', 'Action'].map((h) => (
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
              {filteredReferrals.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: '1px solid #f0f3fa', transition: 'background 0.12s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8faff')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                >
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#1a2540' }}>{item.referrerName}</div>
                    <div style={{ fontSize: 11, color: '#8e9bb5' }}>{item.referrerEmail}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 500, color: '#2563eb' }}>
                    {item.referredName}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                      {item.entityType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#6b7a99', whiteSpace: 'nowrap' }}>
                    {item.date}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#16a34a' }}>
                    {item.rewardAmount}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        background:
                          item.status === 'Rewarded' ? '#dcfce7' : item.status === 'Completed' ? '#e0e7ff' : '#fef3c7',
                        color:
                          item.status === 'Rewarded' ? '#16a34a' : item.status === 'Completed' ? '#3730a3' : '#b45309',
                        borderRadius: 20,
                        padding: '2px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {item.status !== 'Rewarded' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                        onClick={() => handleApprove(item.id)}
                      >
                        <i className="fas fa-check" /> Pay Reward
                      </Button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#16a34a' }}>
                        <i className="fas fa-check-double" /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredReferrals.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '24px 14px', textAlign: 'center', color: '#8e9bb5' }}>
                    No referral records match your search.
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

/* -------------------------------------------------------------------------
 * TAB 2: Promotion Component
 * ------------------------------------------------------------------------- */
export function PromotionTab() {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [promotions, setPromotions] = useState<PromoItem[]>(SAMPLE_PROMOTIONS);

  const filteredPromos = promotions.filter((p) => {
    const matchesSearch =
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.targetAudience.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleCopyCode(code: string) {
    navigator.clipboard?.writeText(code);
    showToast(`Promo code "${code}" copied!`, 'success');
  }

  function handleToggleStatus(id: number) {
    setPromotions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === 'Active' ? 'Expired' : 'Active';
          showToast(`Promo "${p.code}" status changed to ${nextStatus}`, 'info');
          return { ...p, status: nextStatus };
        }
        return p;
      }),
    );
  }

  function handleCreatePromo() {
    const newCode = `OFFER${Math.floor(100 + Math.random() * 900)}`;
    const newPromo: PromoItem = {
      id: Date.now(),
      code: newCode,
      title: 'Special Flash Promo Campaign',
      type: 'Percentage',
      value: '20% OFF',
      targetAudience: 'All Healthcare Users',
      validUntil: '31 Dec 2026',
      usedCount: 0,
      maxLimit: 500,
      status: 'Active',
    };
    setPromotions([newPromo, ...promotions]);
    showToast(`Created new promo code "${newCode}"!`, 'success');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div
        className="panel"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)',
          color: '#fff',
          padding: '24px 28px',
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
              <i className="fas fa-tags" /> Promotional Campaign Manager
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', color: '#fff' }}>
              Promotions, Coupon Codes &amp; In-Platform Offers
            </h2>
            <p style={{ margin: 0, fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.5 }}>
              Create and manage promotional discount coupons, flash banners, onboarding rebates, and seasonal campaigns across the Curemaso platform.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleCreatePromo}
            style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <i className="fas fa-plus-circle" /> Create New Promotion
          </Button>
        </div>
      </div>

      {/* Promo KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Active Campaigns</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-bullhorn" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>
            {promotions.filter((p) => p.status === 'Active').length} Active
          </div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            Running in 12 regions
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Total Redemptions</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-ticket-alt" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>14,820</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            <i className="fas fa-arrow-up" /> +24% redemption velocity
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Discounts Provided</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-hand-holding-usd" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>$28,450</div>
          <div style={{ fontSize: 12, color: '#6b7a99', marginTop: 4 }}>
            Avg. $18 discount / order
          </div>
        </div>

        <div className="panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7a99' }}>Promo Revenue</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-chart-line" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a2540' }}>$248,900</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            8.7x ROI on promo spend
          </div>
        </div>
      </div>

      {/* Featured In-Platform Promotion Banners */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2540', marginBottom: 14 }}>
          <i className="fas fa-ad" style={{ color: '#2563eb', marginRight: 8 }} />
          Active In-Platform Promotion Slots
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="tag-blue" style={{ fontSize: 11, marginBottom: 6, display: 'inline-block' }}>Home Banner</span>
                <h4 style={{ margin: '4px 0', fontSize: 15, color: '#1e293b' }}>Monsoon Clinic Package (25% OFF)</h4>
              </div>
              <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>Live</span>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 12px 0' }}>
              Targeted to general practitioners &amp; outpatient clinics.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <span><strong>CTR:</strong> 4.8%</span>
              <span><strong>Conversions:</strong> 312 clinics</span>
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600, marginBottom: 6, display: 'inline-block' }}>Modal Popup</span>
                <h4 style={{ margin: '4px 0', fontSize: 15, color: '#1e293b' }}>Specialist Onboarding Wave</h4>
              </div>
              <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>Live</span>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 12px 0' }}>
              Shown to cardiologists, oncologists &amp; neurologists on first visit.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <span><strong>CTR:</strong> 6.2%</span>
              <span><strong>Conversions:</strong> 184 specialists</span>
            </div>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600, marginBottom: 6, display: 'inline-block' }}>Header Bar</span>
                <h4 style={{ margin: '4px 0', fontSize: 15, color: '#1e293b' }}>Enterprise Annual Pass Passkey</h4>
              </div>
              <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>Live</span>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 12px 0' }}>
              Hospital network tier upgrades with 30% discount code.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#334155', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <span><strong>CTR:</strong> 3.5%</span>
              <span><strong>Conversions:</strong> 42 hospitals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons & Promo Codes Manager Table */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a2540', margin: 0 }}>
            Promo Codes &amp; Discount Vouchers
          </h3>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 220 }}>
              <Input
                type="text"
                placeholder="Search promo codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 32, fontSize: 13, height: 36, width: '100%' }}
              />
              <i
                className="fas fa-search"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8e9bb5', fontSize: 12 }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', fontSize: 13, height: 36, padding: '4px 10px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faff', borderBottom: '1.5px solid #e9edf4' }}>
                {['Promo Code', 'Campaign Title', 'Discount', 'Audience', 'Redemptions', 'Valid Until', 'Status', 'Action'].map((h) => (
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
              {filteredPromos.map((p) => {
                const percentUsed = Math.min(100, Math.round((p.usedCount / p.maxLimit) * 100));
                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid #f0f3fa', transition: 'background 0.12s' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '#f8faff')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLTableRowElement).style.background = '')}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: '#2563eb',
                            background: '#eff6ff',
                            padding: '3px 8px',
                            borderRadius: 6,
                            border: '1px dashed #93c5fd',
                          }}
                        >
                          {p.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(p.code)}
                          style={{ padding: '2px 6px', color: '#6b7a99' }}
                          title="Copy Code"
                        >
                          <i className="fas fa-copy" />
                        </Button>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1a2540' }}>
                      {p.title}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 700, color: '#16a34a' }}>{p.value}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7a99' }}>
                      {p.targetAudience}
                    </td>
                    <td style={{ padding: '12px 14px', minWidth: 140 }}>
                      <div style={{ fontSize: 11, color: '#6b7a99', marginBottom: 4 }}>
                        {p.usedCount} / {p.maxLimit} ({percentUsed}%)
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${percentUsed}%`,
                            height: '100%',
                            background: percentUsed >= 90 ? '#ef4444' : '#2563eb',
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7a99', whiteSpace: 'nowrap' }}>
                      {p.validUntil}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          background:
                            p.status === 'Active' ? '#dcfce7' : p.status === 'Scheduled' ? '#e0e7ff' : '#f1f5f9',
                          color:
                            p.status === 'Active' ? '#16a34a' : p.status === 'Scheduled' ? '#3730a3' : '#8e9bb5',
                          borderRadius: 20,
                          padding: '2px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                        onClick={() => handleToggleStatus(p.id)}
                      >
                        {p.status === 'Active' ? 'Expire' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredPromos.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '24px 14px', textAlign: 'center', color: '#8e9bb5' }}>
                    No promo codes match your filter.
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

/* -------------------------------------------------------------------------
 * MAIN MARKETING PAGE WITH THE TWO TABS
 * ------------------------------------------------------------------------- */
export function MarketingPage() {
  const [activeTab, setActiveTab] = useState<MarketingTab>('refer-earn');

  return (
    <div>
      {/* Tab nav — matching ErpDashboardPage / UserManagementPage styling */}
      <div className="tab-nav" style={{ marginBottom: 20 }}>
        <Button
          type="button"
          className={`tab-btn${activeTab === 'refer-earn' ? ' active' : ''}`}
          onClick={() => setActiveTab('refer-earn')}
        >
          <i className="fas fa-gift" style={{ marginRight: 6 }} /> Refer &amp; Earn
        </Button>
        <Button
          type="button"
          className={`tab-btn${activeTab === 'promotion' ? ' active' : ''}`}
          onClick={() => setActiveTab('promotion')}
        >
          <i className="fas fa-tags" style={{ marginRight: 6 }} /> Promotion
        </Button>
      </div>

      {/* Tab contents */}
      <div className={`tab-content${activeTab === 'refer-earn' ? ' active' : ''}`}>
        {activeTab === 'refer-earn' && <ReferAndEarnTab />}
      </div>

      <div className={`tab-content${activeTab === 'promotion' ? ' active' : ''}`}>
        {activeTab === 'promotion' && <PromotionTab />}
      </div>
    </div>
  );
}

export default MarketingPage;
