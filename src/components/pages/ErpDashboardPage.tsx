import { useState } from 'react';
import { Button } from '../common/Button';
import { ErpDashboardTab } from '../erp/ErpDashboardTab';
import { ErpProfileTab } from '../erp/ErpProfileTab';
import { ErpReportsTab } from '../erp/ErpReportsTab';
import { ErpSettingsTab } from '../erp/ErpSettingsTab';
import { ErpAllModulesTab } from '../erp/ErpAllModulesTab';

interface ErpDashboardPageProps {
  onNavigateModule: (id: number) => void;
}

type TabType = 'dashboard' | 'profile' | 'modules' | 'reports' | 'settings';

export function ErpDashboardPage({ onNavigateModule }: ErpDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <div>
      {/* ===== SUB-TAB NAVIGATION ===== */}
      <div className="tab-nav">
        <Button
          type="button"
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-th-large" /> Dashboard
        </Button>
        <Button
          type="button"
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user" /> Profile
        </Button>
        <Button
          type="button"
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-chart-pie" /> Reports
        </Button>
        <Button
          type="button"
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <i className="fas fa-cog" /> Settings
        </Button>
        <Button
          type="button"
          className={`tab-btn ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          <i className="fas fa-cubes" /> All Modules
        </Button>
      </div>


      {/* TAB CONTENTS */}
      <div className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''}`}>
        <ErpDashboardTab onNavigateModule={onNavigateModule} />
      </div>

      <div className={`tab-content ${activeTab === 'profile' ? 'active' : ''}`}>
        <ErpProfileTab />
      </div>

      <div className={`tab-content ${activeTab === 'reports' ? 'active' : ''}`}>
        <ErpReportsTab onNavigateDashboard={() => setActiveTab('dashboard')} />
      </div>

      <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
        <ErpSettingsTab />
      </div>

      <div className={`tab-content ${activeTab === 'modules' ? 'active' : ''}`}>
        <ErpAllModulesTab onNavigateModule={onNavigateModule} />
      </div>
    </div>
  );
}
