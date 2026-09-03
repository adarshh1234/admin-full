import type {
  DailyRow, AnnualRow, StaffMember, CRMDeal, DueItem, RecurringExpense,
  MarketingChannel, AISuggestion, AIIssue, AISummaryRow,
} from '../types';

export interface AIAnalysisInput {
  dailyRows: DailyRow[];
  recurringExpenses: RecurringExpense[];
  duesData: DueItem[];
  crmDeals: CRMDeal[];
  annualRows: AnnualRow[];
  staffData: StaffMember[];
  marketingData: MarketingChannel[];
}

export interface AIAnalysisResult {
  suggestions: AISuggestion[];
  issues: AIIssue[];
  summaryRows: AISummaryRow[];
}

export function generateAIAnalysis(input: AIAnalysisInput): AIAnalysisResult {
  const { dailyRows, recurringExpenses, duesData, crmDeals, annualRows, staffData, marketingData } = input;
  const suggestions: AISuggestion[] = [];
  const issues: AIIssue[] = [];
  const summaryRows: AISummaryRow[] = [];

  void dailyRows.reduce((acc, r) => acc + r.revenue, 0);
  void recurringExpenses.reduce((acc, r) => acc + r.monthly, 0);

  const overdueDues = duesData.filter((d) => d.status === 'Overdue').reduce((acc, d) => acc + d.amount, 0);
  const openDeals = crmDeals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
  const pipelineValue = openDeals.reduce((acc, d) => acc + d.value * d.probability, 0);
  const lastAnnual = annualRows[annualRows.length - 1];
  const cac = lastAnnual.marketingSpend / lastAnnual.newCustomers;
  const margin = ((lastAnnual.revenue - lastAnnual.opex) / lastAnnual.revenue) * 100;
  const staffActive = staffData.filter((e) => e.status === 'Active').length;
  const totalStaff = staffData.length;
  const utilization = (staffActive / totalStaff) * 100;

  const totalMktSpend = marketingData.reduce((acc, m) => acc + m.spend, 0);
  const totalMktRev = marketingData.reduce((acc, m) => acc + m.revenue, 0);
  const overallMktRoi = Number((((totalMktRev - totalMktSpend) / totalMktSpend) * 100).toFixed(1));

  if (cac > 80) {
    suggestions.push({ id: 'sug-cac', text: `Reduce Customer Acquisition Cost (CAC). Currently $${cac.toFixed(0)} vs target $80. Optimize marketing mix by shifting budget to organic and referral channels.`, type: 'cac' });
  } else {
    suggestions.push({ id: 'sug-cac', text: `Maintain CAC efficiency. Current CAC is $${cac.toFixed(0)} which is within acceptable range. Continue investing in high-converting channels.`, type: 'cac-good' });
  }

  if (overdueDues > 10000) {
    issues.push({ id: 'iss-overdue', text: `High overdue payables: $${overdueDues.toLocaleString()}. Prioritize collections to maintain cash flow and vendor relations.`, severity: 'high' });
    suggestions.push({ id: 'sug-overdue', text: 'Implement automated payment reminders and negotiate extended terms to reduce overdue obligations.', type: 'overdue' });
  } else if (overdueDues > 0) {
    issues.push({ id: 'iss-overdue', text: `Overdue payables of $${overdueDues.toLocaleString()} need attention.`, severity: 'medium' });
  }

  if (pipelineValue < 500000) {
    issues.push({ id: 'iss-pipeline', text: `CRM pipeline value only $${Math.round(pipelineValue).toLocaleString()}. Increase sales outreach and lead generation to achieve revenue targets.`, severity: 'high' });
    suggestions.push({ id: 'sug-pipeline', text: 'Launch targeted employer acquisition campaigns and expand inside sales capacity.', type: 'pipeline' });
  } else {
    suggestions.push({ id: 'sug-pipeline', text: `Healthy pipeline value at $${Math.round(pipelineValue).toLocaleString()}. Continue nurturing existing opportunities.`, type: 'pipeline-good' });
  }

  if (margin < 20) {
    issues.push({ id: 'iss-margin', text: `Net profit margin of ${margin.toFixed(1)}% is below target. Review operating costs and optimize spending.`, severity: 'high' });
    suggestions.push({ id: 'sug-margin', text: 'Conduct zero-based budgeting review and renegotiate vendor contracts to improve margins.', type: 'margin' });
  } else {
    suggestions.push({ id: 'sug-margin', text: `Net profit margin at ${margin.toFixed(1)}% is strong. Maintain cost discipline while scaling revenue.`, type: 'margin-good' });
  }

  if (utilization < 90) {
    issues.push({ id: 'iss-staff', text: `Staff utilization at ${utilization.toFixed(0)}% indicates possible overstaffing or inefficiency. Review workload distribution.`, severity: 'medium' });
    suggestions.push({ id: 'sug-staff', text: 'Consider cross-training or reallocating resources to high-impact projects.', type: 'staff' });
  }

  if (overallMktRoi < 100) {
    issues.push({ id: 'iss-marketing', text: `Marketing ROI is ${overallMktRoi}%, below 100% target. Reallocate budget from low-performing channels.`, severity: 'high' });
    suggestions.push({ id: 'sug-marketing', text: 'Shift budget from underperforming channels to SEO, Referral, and high-ROI social media.', type: 'marketing' });
  }

  let extraCount = 1;
  while (suggestions.length < 3) {
    suggestions.push({ id: `sug-general-${extraCount++}`, text: 'Continue monitoring key metrics and refine operational strategies quarterly.', type: 'general' });
  }

  summaryRows.push({ metric: 'Customer Acquisition Cost (CAC)', value: `$${cac.toFixed(1)}`, threshold: '$80', status: cac > 80 ? '⚠️ Above Target' : '✅ On Track' });
  summaryRows.push({ metric: 'Overdue Payables', value: `$${overdueDues.toLocaleString()}`, threshold: '$10,000', status: overdueDues > 10000 ? '⚠️ Above Threshold' : '✅ OK' });
  summaryRows.push({ metric: 'CRM Pipeline Value', value: `$${Math.round(pipelineValue).toLocaleString()}`, threshold: '$500,000', status: pipelineValue < 500000 ? '⚠️ Below Target' : '✅ Healthy' });
  summaryRows.push({ metric: 'Net Profit Margin', value: `${margin.toFixed(1)}%`, threshold: '20%', status: margin < 20 ? '⚠️ Below Target' : '✅ On Track' });
  summaryRows.push({ metric: 'Staff Utilization', value: `${utilization.toFixed(0)}%`, threshold: '90%', status: utilization < 90 ? '⚠️ Below Target' : '✅ Optimal' });
  summaryRows.push({ metric: 'Marketing ROI', value: `${overallMktRoi}%`, threshold: '100%', status: overallMktRoi < 100 ? '⚠️ Below Target' : '✅ On Track' });

  return { suggestions, issues, summaryRows };
}
