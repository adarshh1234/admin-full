import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type {
  DailyRow, WeeklyRow, MonthlyRow, AnnualRow, StaffMember, CRMDeal,
  DueItem, RecurringExpense, TaxLegalItem, MarketingChannel,
  SocialMediaPlatform, ExpansionMarket,
} from '../types';
import {
  genDailyRows, genWeeklyRows, genMonthlyRows, initialAnnualRows,
  initialStaffData, initialCrmDeals, initialDuesData, initialRecurringExpenses,
  initialTaxLegal, initialMarketingData, initialSocialMediaData, initialExpansionData,
  targets,
} from '../data/initialData';

interface DashboardState {
  dailyRows: DailyRow[];
  setDailyRows: React.Dispatch<React.SetStateAction<DailyRow[]>>;
  weeklyRows: WeeklyRow[];
  setWeeklyRows: React.Dispatch<React.SetStateAction<WeeklyRow[]>>;
  monthlyRows: MonthlyRow[];
  setMonthlyRows: React.Dispatch<React.SetStateAction<MonthlyRow[]>>;
  annualRows: AnnualRow[];
  setAnnualRows: React.Dispatch<React.SetStateAction<AnnualRow[]>>;
  staffData: StaffMember[];
  crmDeals: CRMDeal[];
  duesData: DueItem[];
  recurringExpenses: RecurringExpense[];
  taxLegal: TaxLegalItem[];
  marketingData: MarketingChannel[];
  socialMediaData: SocialMediaPlatform[];
  expansionData: ExpansionMarket[];
  targets: typeof targets;
}

const DashboardContext = createContext<DashboardState | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [dailyRows, setDailyRows] = useState<DailyRow[]>(() => genDailyRows());
  const [weeklyRows, setWeeklyRows] = useState<WeeklyRow[]>(() => genWeeklyRows());
  const [monthlyRows, setMonthlyRows] = useState<MonthlyRow[]>(() => genMonthlyRows());
  const [annualRows, setAnnualRows] = useState<AnnualRow[]>(() => initialAnnualRows);

  const [staffData] = useState<StaffMember[]>(() => initialStaffData);
  const [crmDeals] = useState<CRMDeal[]>(() => initialCrmDeals);
  const [duesData] = useState<DueItem[]>(() => initialDuesData);
  const [recurringExpenses] = useState<RecurringExpense[]>(() => initialRecurringExpenses);
  const [taxLegal] = useState<TaxLegalItem[]>(() => initialTaxLegal);
  const [marketingData] = useState<MarketingChannel[]>(() => initialMarketingData);
  const [socialMediaData] = useState<SocialMediaPlatform[]>(() => initialSocialMediaData);
  const [expansionData] = useState<ExpansionMarket[]>(() => initialExpansionData);

  const value = useMemo<DashboardState>(() => ({
    dailyRows, setDailyRows,
    weeklyRows, setWeeklyRows,
    monthlyRows, setMonthlyRows,
    annualRows, setAnnualRows,
    staffData, crmDeals, duesData, recurringExpenses, taxLegal,
    marketingData, socialMediaData, expansionData,
    targets,
  }), [dailyRows, weeklyRows, monthlyRows, annualRows, staffData, crmDeals, duesData, recurringExpenses, taxLegal, marketingData, socialMediaData, expansionData]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardState {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
