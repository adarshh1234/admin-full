import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type {
  DailyRow, WeeklyRow, MonthlyRow, AnnualRow, StaffMember, CRMDeal,
  DueItem, RecurringExpense, TaxLegalItem, MarketingChannel,
  SocialMediaPlatform, ExpansionMarket,
} from '../types';

export async function exportPDF(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 0;
  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save('letgetin_MIS_Dashboard.pdf');
}

export interface ExportExcelData {
  dailyRows: DailyRow[];
  weeklyRows: WeeklyRow[];
  monthlyRows: MonthlyRow[];
  annualRows: AnnualRow[];
  staffData: StaffMember[];
  crmDeals: CRMDeal[];
  duesData: DueItem[];
  recurringExpenses: RecurringExpense[];
  taxLegal: TaxLegalItem[];
  marketingData: MarketingChannel[];
  socialMediaData: SocialMediaPlatform[];
  expansionData: ExpansionMarket[];
}

export function exportExcel(data: ExportExcelData): void {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.dailyRows), 'Daily');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.weeklyRows), 'Weekly');

  const monthlySheetData = data.monthlyRows.map((r) => ({ ...r, totalRevenue: r.subRev + r.adRev }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(monthlySheetData), 'Monthly');

  const annualSheetData = data.annualRows.map((r) => ({
    ...r,
    cac: r.marketingSpend / r.newCustomers,
    margin: ((r.revenue - r.opex) / r.revenue) * 100,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(annualSheetData), 'Annual');

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.staffData), 'HR');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.crmDeals), 'CRM');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.duesData), 'Dues');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.recurringExpenses), 'Recurring');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.taxLegal), 'TaxLegal');

  const marketingSheetData = data.marketingData.map((m) => ({
    ...m,
    cpl: m.spend / m.leads,
    convRate: (m.conversions / m.leads) * 100,
    roi: ((m.revenue - m.spend) / m.spend) * 100,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(marketingSheetData), 'Marketing');

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.socialMediaData), 'SocialMedia');

  const expansionSheetData = data.expansionData.map((e) => {
    const totalCost = e.platformCost + e.staffingCost + e.officeCost + e.marketingCost + e.operationsCost + e.legalCost;
    const forecastRevenue = e.currentRevenue + e.potentialRevenue;
    return { ...e, totalCost, forecastRevenue, roi: ((forecastRevenue - totalCost) / totalCost) * 100 };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expansionSheetData), 'Expansion');

  XLSX.writeFile(wb, 'letgetin_MIS_Data.xlsx');
}
