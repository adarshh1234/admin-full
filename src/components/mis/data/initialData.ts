import type {
  DailyRow, WeeklyRow, MonthlyRow, AnnualRow, StaffMember, CRMDeal,
  DueItem, RecurringExpense, TaxLegalItem, MarketingChannel,
  SocialMediaPlatform, ExpansionMarket, Targets
} from '../types';

const today = new Date();

export function genDailyRows(): DailyRow[] {
  const rows: DailyRow[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const idx = 29 - i;
    rows.push({
      date: d.toISOString().slice(0, 10),
      dau: 42000 + idx * 280 + (idx % 5) * 170,
      signups: 880 + idx * 14 + (idx % 3) * 42,
      subs: 210 + idx * 5 + (idx % 2) * 16,
      postings: 370 + idx * 8 + (idx % 4) * 27,
      revenue: 14800 + idx * 260 + (idx % 7) * 890,
    });
  }
  return rows;
}

export function genWeeklyRows(): WeeklyRow[] {
  const rows: WeeklyRow[] = [];
  for (let i = 11; i >= 0; i--) {
    const idx = 11 - i;
    rows.push({
      week: `W${idx + 1}`,
      wau: 118000 + idx * 8200 + (idx % 3) * 5100,
      cvs: 4900 + idx * 310 + (idx % 4) * 180,
      employers: 290 + idx * 16 + (idx % 2) * 22,
      applications: 24800 + idx * 1500 + (idx % 5) * 950,
    });
  }
  return rows;
}

export function genMonthlyRows(): MonthlyRow[] {
  const monthLabels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthLabels.push(d.toLocaleString('en-US', { month: 'short', year: 'numeric' }));
  }
  return monthLabels.map((label, idx) => ({
    month: label,
    mau: 345000 + idx * 12500 + (idx % 3) * 7800,
    subRev: 91000 + idx * 3200 + (idx % 4) * 4800,
    adRev: 68000 + idx * 2600 + (idx % 2) * 4100,
  }));
}

export const initialAnnualRows: AnnualRow[] = [
  { year: '2022', registrations: 2.5, marketingSpend: 5000000, newCustomers: 50000, revenue: 18000000, opex: 14000000 },
  { year: '2023', registrations: 3.8, marketingSpend: 6500000, newCustomers: 72000, revenue: 26000000, opex: 19000000 },
  { year: '2024', registrations: 5.2, marketingSpend: 8000000, newCustomers: 98000, revenue: 38000000, opex: 26000000 },
  { year: '2025', registrations: 6.9, marketingSpend: 9500000, newCustomers: 135000, revenue: 55000000, opex: 36000000 },
  { year: '2026', registrations: 8.1, marketingSpend: 10500000, newCustomers: 160000, revenue: 68000000, opex: 43000000 },
];

export const initialStaffData: StaffMember[] = [
  { id: 'EMP001', name: 'Amit Sharma', dept: 'Marketing', role: 'Marketing Manager', status: 'Active', assignment: 'Campaign Launch', join: '2023-05-12', salary: 85000 },
  { id: 'EMP002', name: 'Priya Patel', dept: 'Operations', role: 'Ops Specialist', status: 'Active', assignment: 'Partner Onboarding', join: '2023-08-01', salary: 62000 },
  { id: 'EMP003', name: 'Rohan Gupta', dept: 'Product', role: 'Product Manager', status: 'Active', assignment: 'AI Matching', join: '2022-11-20', salary: 105000 },
  { id: 'EMP004', name: 'Sneha Iyer', dept: 'Sales', role: 'Enterprise Sales', status: 'Active', assignment: 'Key Accounts', join: '2023-02-14', salary: 78000 },
  { id: 'EMP005', name: 'Vikram Singh', dept: 'HR', role: 'HR Business Partner', status: 'On Leave', assignment: 'Recruitment Drive', join: '2021-09-30', salary: 70000 },
  { id: 'EMP006', name: 'Kavita Rao', dept: 'Finance', role: 'Finance Analyst', status: 'Active', assignment: 'Budgeting', join: '2023-06-05', salary: 66000 },
  { id: 'EMP007', name: 'Arjun Nair', dept: 'Admin', role: 'Office Manager', status: 'Active', assignment: 'Facilities', join: '2022-04-18', salary: 58000 },
  { id: 'EMP008', name: 'Divya Menon', dept: 'Marketing', role: 'Content Specialist', status: 'Active', assignment: 'SEO Content', join: '2023-10-02', salary: 55000 },
  { id: 'EMP009', name: 'Rahul Verma', dept: 'Operations', role: 'Quality Analyst', status: 'Active', assignment: 'Verification', join: '2023-12-11', salary: 60000 },
  { id: 'EMP010', name: 'Neha Kulkarni', dept: 'Sales', role: 'Inside Sales Rep', status: 'Active', assignment: 'SMB Accounts', join: '2024-01-22', salary: 52000 },
  { id: 'EMP011', name: 'Suresh Kumar', dept: 'Product', role: 'UX Designer', status: 'Active', assignment: 'Mobile App', join: '2022-08-15', salary: 95000 },
  { id: 'EMP012', name: 'Ananya Das', dept: 'HR', role: 'Recruiter', status: 'Active', assignment: 'Talent Pipeline', join: '2023-03-07', salary: 61000 },
];

export const initialCrmDeals: CRMDeal[] = [
  { id: 'DL001', company: 'TechNova Ltd', contact: 'Rohit Mehta', value: 120000, stage: 'Proposal', probability: 0.6, close: '2026-08-30' },
  { id: 'DL002', company: 'GlobalSoft', contact: 'Sarah Chen', value: 85000, stage: 'Negotiation', probability: 0.8, close: '2026-07-15' },
  { id: 'DL003', company: 'InnoWorks', contact: 'David Kim', value: 45000, stage: 'Qualified', probability: 0.4, close: '2026-09-01' },
  { id: 'DL004', company: 'BrightPath', contact: 'Emily Johnson', value: 150000, stage: 'Proposal', probability: 0.6, close: '2026-08-20' },
  { id: 'DL005', company: 'NexaCorp', contact: 'Carlos Ruiz', value: 95000, stage: 'Closed Won', probability: 1.0, close: '2026-05-30' },
  { id: 'DL006', company: 'Skyline Ltd', contact: 'Anna Petrova', value: 30000, stage: 'Lead', probability: 0.1, close: '2026-07-30' },
  { id: 'DL007', company: 'Vertex Solutions', contact: 'Michael Brown', value: 110000, stage: 'Closed Lost', probability: 0.0, close: '2026-06-10' },
  { id: 'DL008', company: 'Crest Technologies', contact: 'Lina Gomez', value: 70000, stage: 'Qualified', probability: 0.4, close: '2026-08-10' },
  { id: 'DL009', company: 'BlueWave Inc', contact: 'Tom Wilson', value: 60000, stage: 'Negotiation', probability: 0.8, close: '2026-07-20' },
  { id: 'DL010', company: 'Prime Systems', contact: 'Grace Lee', value: 40000, stage: 'Proposal', probability: 0.6, close: '2026-09-05' },
];

export const initialDuesData: DueItem[] = [
  { vendor: 'AWS', desc: 'Cloud Hosting', amount: 12500, due: '2026-08-01', status: 'Pending' },
  { vendor: 'Google Ads', desc: 'Marketing Spend', amount: 8900, due: '2026-07-25', status: 'Pending' },
  { vendor: 'Zoho', desc: 'CRM Subscription', amount: 3400, due: '2026-08-05', status: 'Pending' },
  { vendor: 'Office Rent', desc: 'Premises Lease', amount: 18000, due: '2026-08-01', status: 'Overdue' },
  { vendor: 'Payroll', desc: 'Staff Salaries', amount: 45000, due: '2026-07-31', status: 'Pending' },
  { vendor: 'Legal Counsel', desc: 'Contract Review', amount: 5200, due: '2026-07-28', status: 'Paid' },
];

export const initialRecurringExpenses: RecurringExpense[] = [
  { item: 'Office Rent', category: 'Facilities', monthly: 18000, annual: 216000, nextDue: '2026-08-01' },
  { item: 'AWS Cloud', category: 'Infrastructure', monthly: 12500, annual: 150000, nextDue: '2026-08-01' },
  { item: 'Google Ads', category: 'Marketing', monthly: 8900, annual: 106800, nextDue: '2026-07-25' },
  { item: 'CRM Software', category: 'Technology', monthly: 3400, annual: 40800, nextDue: '2026-08-05' },
  { item: 'Staff Salaries', category: 'HR', monthly: 45000, annual: 540000, nextDue: '2026-07-31' },
  { item: 'Internet & Utilities', category: 'Facilities', monthly: 1200, annual: 14400, nextDue: '2026-08-02' },
  { item: 'Legal Retainer', category: 'Legal', monthly: 2500, annual: 30000, nextDue: '2026-08-10' },
];

export const initialTaxLegal: TaxLegalItem[] = [
  { desc: 'GST Filing Q1', amount: 15000, due: '2026-08-15', status: 'Pending' },
  { desc: 'TDS Deduction', amount: 8200, due: '2026-08-07', status: 'Pending' },
  { desc: 'Income Tax Advance', amount: 25000, due: '2026-09-15', status: 'Upcoming' },
  { desc: 'Legal Dispute Settlement', amount: 10000, due: '2026-08-20', status: 'Pending' },
];

export const initialMarketingData: MarketingChannel[] = [
  { channel: 'Google Ads', spend: 25000, impressions: 1200000, clicks: 48000, leads: 3200, conversions: 400, revenue: 55000 },
  { channel: 'Facebook Ads', spend: 18000, impressions: 900000, clicks: 36000, leads: 2400, conversions: 300, revenue: 40000 },
  { channel: 'LinkedIn Ads', spend: 22000, impressions: 600000, clicks: 24000, leads: 1600, conversions: 200, revenue: 48000 },
  { channel: 'Instagram Ads', spend: 15000, impressions: 750000, clicks: 30000, leads: 2000, conversions: 250, revenue: 33000 },
  { channel: 'Twitter Ads', spend: 8000, impressions: 300000, clicks: 12000, leads: 800, conversions: 100, revenue: 15000 },
  { channel: 'Email Marketing', spend: 4000, impressions: 800000, clicks: 16000, leads: 1200, conversions: 180, revenue: 22000 },
  { channel: 'SEO / Organic', spend: 6000, impressions: 1500000, clicks: 60000, leads: 4000, conversions: 500, revenue: 65000 },
  { channel: 'Referral Program', spend: 3000, impressions: 200000, clicks: 8000, leads: 600, conversions: 90, revenue: 12000 },
];

export const initialSocialMediaData: SocialMediaPlatform[] = [
  { platform: 'LinkedIn', followers: 250000, engagement: 4.5, posts: 5, leads: 900, revenue: 30000 },
  { platform: 'Facebook', followers: 180000, engagement: 3.8, posts: 7, leads: 700, revenue: 22000 },
  { platform: 'Instagram', followers: 120000, engagement: 5.2, posts: 10, leads: 600, revenue: 18000 },
  { platform: 'Twitter', followers: 80000, engagement: 2.9, posts: 15, leads: 400, revenue: 11000 },
  { platform: 'YouTube', followers: 45000, engagement: 6.1, posts: 2, leads: 300, revenue: 9000 },
];

export const initialExpansionData: ExpansionMarket[] = [
  { market: 'USA', region: 'North America', currentUsers: 250000, currentRevenue: 2500000, potentialRevenue: 5000000, growth: 'High', platformCost: 300000, staffingCost: 600000, officeCost: 200000, marketingCost: 500000, operationsCost: 300000, legalCost: 150000 },
  { market: 'UK', region: 'Europe', currentUsers: 120000, currentRevenue: 1200000, potentialRevenue: 2600000, growth: 'High', platformCost: 150000, staffingCost: 300000, officeCost: 150000, marketingCost: 250000, operationsCost: 200000, legalCost: 100000 },
  { market: 'Germany', region: 'Europe', currentUsers: 80000, currentRevenue: 800000, potentialRevenue: 1800000, growth: 'High', platformCost: 120000, staffingCost: 250000, officeCost: 120000, marketingCost: 200000, operationsCost: 150000, legalCost: 80000 },
  { market: 'India (other states)', region: 'Asia', currentUsers: 500000, currentRevenue: 1800000, potentialRevenue: 4000000, growth: 'Very High', platformCost: 100000, staffingCost: 150000, officeCost: 80000, marketingCost: 150000, operationsCost: 100000, legalCost: 50000 },
  { market: 'Australia', region: 'Oceania', currentUsers: 60000, currentRevenue: 600000, potentialRevenue: 1400000, growth: 'Medium', platformCost: 100000, staffingCost: 200000, officeCost: 100000, marketingCost: 150000, operationsCost: 120000, legalCost: 60000 },
  { market: 'Singapore', region: 'Asia', currentUsers: 50000, currentRevenue: 500000, potentialRevenue: 1200000, growth: 'High', platformCost: 80000, staffingCost: 180000, officeCost: 90000, marketingCost: 120000, operationsCost: 100000, legalCost: 50000 },
  { market: 'UAE', region: 'Middle East', currentUsers: 45000, currentRevenue: 450000, potentialRevenue: 1100000, growth: 'High', platformCost: 90000, staffingCost: 170000, officeCost: 80000, marketingCost: 110000, operationsCost: 90000, legalCost: 45000 },
  { market: 'Canada', region: 'North America', currentUsers: 90000, currentRevenue: 900000, potentialRevenue: 2000000, growth: 'Medium', platformCost: 110000, staffingCost: 220000, officeCost: 110000, marketingCost: 180000, operationsCost: 130000, legalCost: 70000 },
];

export const targets: Targets = {
  dau: 50000, signups: 1000, subs: 250, postings: 400, revenue: 20000,
  wau: 180000, cvs: 7000, employers: 400, applications: 35000,
  mau: 450000, subRev: 120000, adRev: 90000,
  registrations: 7.0, marketingSpend: 10000000, newCustomers: 150000, opex: 40000000,
};
