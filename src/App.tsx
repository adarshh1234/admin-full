import { lazy, Suspense } from 'react';
import { Layout } from './components/layout/Layout';
import { ToastContainer } from './components/common/ToastContainer';
import { Loader } from './components/common/Loader';
import { ToastProvider } from './context/ToastContext';
import { useToast } from './hooks/useToast';
import { useErpNavigation } from './hooks/useErpNavigation';

const ErpDashboardPage = lazy(() =>
  import('./components/pages/ErpDashboardPage').then((m) => ({ default: m.ErpDashboardPage })),
);
const ProfilePage = lazy(() =>
  import('./components/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const CalendarPage = lazy(() =>
  import('./components/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })),
);
const ReportsPage = lazy(() =>
  import('./components/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);
const SettingsPage = lazy(() =>
  import('./components/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const ModuleDetailPage = lazy(() =>
  import('./components/pages/ModuleDetailPage').then((m) => ({ default: m.ModuleDetailPage })),
);
const CuremasoApp = lazy(() =>
  import('./components/curemaso/CuremasoApp').then((m) => ({ default: m.CuremasoApp })),
);
const UserManagementPage = lazy(() =>
  import('./components/pages/UserManagementPage').then((m) => ({ default: m.UserManagementPage })),
);



function AppShell() {
  const {
    activeModuleId,
    activeModule,
    specialModules,
    filteredNonSpecialModules,
    searchQuery,
    setSearchQuery,
    navigateTo,
  } = useErpNavigation(1);

  const { showToast } = useToast();

  function handleGlobalAction() {
    showToast('New action item created.', 'success');
  }

  function renderPageContent() {
    switch (activeModuleId) {
      case 1:
        return <ErpDashboardPage onNavigateModule={navigateTo} />;
      case 2:
        return <ProfilePage />;
      case 3:
        return <CalendarPage />;
      case 4:
        return <ReportsPage onNavigateDashboard={() => navigateTo(1)} />;
      case 5:
        return <SettingsPage />;
      case 9:
        return <UserManagementPage />;
      case 10:
        return <CuremasoApp />;
      default:
        return <ModuleDetailPage key={activeModule.id} module={activeModule} />;
    }
  }

  return (
    <Layout
      activeModuleId={activeModuleId}
      specialModules={specialModules}
      filteredModules={filteredNonSpecialModules}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelectModule={navigateTo}
      onGlobalAction={handleGlobalAction}
    >
      <div className="page active" key={activeModuleId}>
        <Suspense fallback={<Loader label="Loading module…" />}>
          {renderPageContent()}
        </Suspense>
      </div>

    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
      <ToastContainer />
    </ToastProvider>
  );
}
