export interface DailyRow {
  date: string;
  dau: number;
  signups: number;
  subs: number;
  postings: number;
  revenue: number;
}

export interface WeeklyRow {
  week: string;
  wau: number;
  cvs: number;
  employers: number;
  applications: number;
}

export interface MonthlyRow {
  month: string;
  mau: number;
  subRev: number;
  adRev: number;
}

export interface QuarterlyRow {
  quarter: string;
  mauAvg: number;
  subRev: number;
  adRev: number;
  totalRev: number;
  qoq: string | null;
}

export interface AnnualRow {
  year: string;
  registrations: number;
  marketingSpend: number;
  newCustomers: number;
  revenue: number;
  opex: number;
}

export interface StaffMember {
  id: string;
  name: string;
  dept: string;
  role: string;
  status: 'Active' | 'On Leave' | string;
  assignment: string;
  join: string;
  salary: number;
}

export interface CRMDeal {
  id: string;
  company: string;
  contact: string;
  value: number;
  stage: string;
  probability: number;
  close: string;
}

export interface DueItem {
  vendor: string;
  desc: string;
  amount: number;
  due: string;
  status: 'Pending' | 'Overdue' | 'Paid' | string;
}

export interface RecurringExpense {
  item: string;
  category: string;
  monthly: number;
  annual: number;
  nextDue: string;
}

export interface TaxLegalItem {
  desc: string;
  amount: number;
  due: string;
  status: string;
}

export interface MarketingChannel {
  channel: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
}

export interface SocialMediaPlatform {
  platform: string;
  followers: number;
  engagement: number;
  posts: number;
  leads: number;
  revenue: number;
}

export interface ExpansionMarket {
  market: string;
  region: string;
  currentUsers: number;
  currentRevenue: number;
  potentialRevenue: number;
  growth: string;
  platformCost: number;
  staffingCost: number;
  officeCost: number;
  marketingCost: number;
  operationsCost: number;
  legalCost: number;
}

export interface Targets {
  dau: number;
  signups: number;
  subs: number;
  postings: number;
  revenue: number;
  wau: number;
  cvs: number;
  employers: number;
  applications: number;
  mau: number;
  subRev: number;
  adRev: number;
  registrations: number;
  marketingSpend: number;
  newCustomers: number;
  opex: number;
}

export interface AISuggestion {
  id: string;
  text: string;
  type: string;
}

export interface AIIssue {
  id: string;
  text: string;
  severity: 'high' | 'medium';
}

export interface AISummaryRow {
  metric: string;
  value: string;
  threshold: string;
  status: string;
}

export interface Candidate {
  sNo: number;
  date: string;
  customerName: string;
  emailId: string;
  whatsAppNumber: string;
  expFresher: 'Fresher' | 'Experienced';
  subscription: 'Free' | 'Premium';
  location: string;
}

export interface CompanyRecruiter {
  sNo: number;
  date: string;
  companyName: string;
  name: string;
  location: string;
  nameOfRep: string;
  emailId: string;
  mobileNo: string;
  url: string;
  subscription: 'Free' | 'Premium';
}

export interface InstitutionRecruiter {
  sNo: number;
  date: string;
  institutionName: string;
  name: string;
  location: string;
  nameOfRep: string;
  emailId: string;
  mobileNo: string;
  url: string;
  subscription: 'Free' | 'Premium';
}

export interface StartupRecruiter {
  sNo: number;
  date: string;
  startupName: string;
  name: string;
  location: string;
  nameOfRep: string;
  emailId: string;
  mobileNo: string;
  url: string;
  subscription: 'Free' | 'Premium';
}

export interface TotalStaffDetail {
  sNo: number;
  date: string;
  employeeName: string;
  emailId: string;
  mobileNo: string;
  designation: string;
  department: string;
  location: string;
  employmentType: 'Full Time' | 'Part Time' | 'Intern' | 'Contract';
  status: 'Active' | 'Inactive';
}

export interface OpenPositionDetail {
  sNo: number;
  date: string;
  jobTitle: string;
  department: string;
  location: string;
  employmentType: 'Full Time' | 'Part Time' | 'Internship' | 'Contract';
  experience: string;
  openings: number;
  status: 'Open' | 'Closed';
}
