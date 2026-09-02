import { Suspense } from 'react';
import { StatsRow } from '../layout/StatsRow';
import { PAGE_COMPONENTS } from '../pages';
import { Loader } from '../common/Loader';
import { Button } from '../common/Button';
import { useNavigation } from '../../hooks/useNavigation';
import { NAV_SECTIONS } from '../../data/navigationData';

export function CuremasoApp() {
  const { activePage, navigateTo } = useNavigation('dashboard');

  const ActivePageComponent = PAGE_COMPONENTS[activePage];

  // All 10 CRM tabs in exact order
  const crmTabs = NAV_SECTIONS.flatMap((section) => section.items);

  return (
    <div className="crm-app-container">
      {/* Horizontal CRM Tab Navigation Bar */}
      <div className="tab-nav crm-tab-nav">
        {crmTabs.map((item) => {
          const isActive = activePage === item.pageId;
          return (
            <Button
              key={item.pageId}
              type="button"
              className={`tab-btn${isActive ? ' active' : ''}`}
              onClick={() => navigateTo(item.pageId)}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#eef2ff',
                    color: isActive ? '#fff' : '#2563eb',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Button>
          );
        })}
      </div>


      <StatsRow />

      <Suspense fallback={<Loader label="Loading page…" />}>
        <div className="page active" key={activePage} style={{ marginTop: 24 }}>
          <ActivePageComponent />
        </div>
      </Suspense>
    </div>
  );
}

export default CuremasoApp;
