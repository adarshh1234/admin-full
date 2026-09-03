/**
 * MISModule.tsx
 *
 * Integration entry point for the MIS Dashboard within the Admin app.
 * - Wraps all MIS content in an isolated MemoryRouter so MIS routing
 *   never interferes with the Admin app's routing.
 * - DashboardProvider provides MIS data context.
 * - MISToastProvider provides MIS-specific toast notifications,
 *   completely separate from the Admin toast context.
 * - All MIS CSS classes are scoped inside `.mis-module` via mis.css.
 */

import { Suspense, lazy } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DashboardProvider } from '../context/DashboardContext';
import { MISToastProvider } from '../context/ToastContext';
import MISToast from './ui/Toast';
import MISLoader from './ui/Loader';
import '../../../components/mis/mis.css';

const MISDashboardMain = lazy(() => import('./MISDashboardMain'));
const TotalStaffPage = lazy(() => import('../pages/blank/TotalStaffPage'));
const OpenPositionsPage = lazy(() => import('../pages/blank/OpenPositionsPage'));
const PipelineValuePage = lazy(() => import('../pages/blank/PipelineValuePage'));
const OverdueDuesPage = lazy(() => import('../pages/blank/OverdueDuesPage'));
const NetProfitMarginPage = lazy(() => import('../pages/blank/NetProfitMarginPage'));
const RecurringExpensesPage = lazy(() => import('../pages/blank/RecurringExpensesPage'));
const MarketingROIPage = lazy(() => import('../pages/blank/MarketingROIPage'));
const HighPotentialMarketsPage = lazy(() => import('../pages/blank/HighPotentialMarketsPage'));

export default function MISModule() {
  return (
    <DashboardProvider>
      <MISToastProvider>
        <div className="mis-module">
          <MemoryRouter>
            <Suspense fallback={<MISLoader label="Loading MIS..." />}>
              <Routes>
                <Route path="/" element={<MISDashboardMain />} />
                <Route path="/total-staff" element={<TotalStaffPage />} />
                <Route path="/open-positions" element={<OpenPositionsPage />} />
                <Route path="/pipeline-value" element={<PipelineValuePage />} />
                <Route path="/overdue-dues" element={<OverdueDuesPage />} />
                <Route path="/net-profit-margin" element={<NetProfitMarginPage />} />
                <Route path="/recurring-expenses" element={<RecurringExpensesPage />} />
                <Route path="/marketing-roi" element={<MarketingROIPage />} />
                <Route path="/high-potential-markets" element={<HighPotentialMarketsPage />} />
                {/* KPI cards for DAU/MAU navigate to these routes: redirect back to root */}
                <Route path="/daily-active-users" element={<MISDashboardMain />} />
                <Route path="/monthly-active-users" element={<MISDashboardMain />} />
              </Routes>
            </Suspense>
          </MemoryRouter>
          <MISToast />
        </div>
      </MISToastProvider>
    </DashboardProvider>
  );
}
