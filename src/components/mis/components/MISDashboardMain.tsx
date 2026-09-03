import { useState, lazy, Suspense, type ComponentType } from 'react';
import '../chartSetup';
import MISHeader from './Header';
import MISKPICards from './KPICards';
import MISTabs from './Tabs';
import MISLoader from './ui/Loader';

const DailyPage = lazy(() => import('../pages/DailyPage'));
const WeeklyPage = lazy(() => import('../pages/WeeklyPage'));
const MonthlyPage = lazy(() => import('../pages/MonthlyPage'));
const AnnualPage = lazy(() => import('../pages/AnnualPage'));
const HRPage = lazy(() => import('../pages/HRPage'));
const CRMPage = lazy(() => import('../pages/CRMPage'));
const AccountsPage = lazy(() => import('../pages/AccountsPage'));
const MarketingPage = lazy(() => import('../pages/MarketingPage'));
const ExpansionPage = lazy(() => import('../pages/ExpansionPage'));
const AIPage = lazy(() => import('../pages/AIPage'));

const PANEL_MAP: Record<string, ComponentType> = {
  'tab-daily': DailyPage,
  'tab-weekly': WeeklyPage,
  'tab-monthly': MonthlyPage,
  'tab-annual': AnnualPage,
  'tab-hr': HRPage,
  'tab-crm': CRMPage,
  'tab-accounts': AccountsPage,
  'tab-marketing': MarketingPage,
  'tab-expansion': ExpansionPage,
  'tab-ai': AIPage,
};

export default function MISDashboardMain() {
  const [activeTab, setActiveTab] = useState('tab-daily');
  const ActivePanel = PANEL_MAP[activeTab];

  return (
    <>
      <MISHeader />
      <div id="mis-dashboard-capture">
        <MISKPICards />
        <MISTabs active={activeTab} onChange={setActiveTab} />
        <div className="mis-panel">
          <Suspense fallback={<MISLoader label="Loading section..." />}>
            <ActivePanel />
          </Suspense>
        </div>
      </div>
      <div className="mis-footer">
        Master MIS Analytics Module • Real-time calculations &amp; executive insights
      </div>
    </>
  );
}
