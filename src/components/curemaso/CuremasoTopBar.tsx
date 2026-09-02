import { forwardRef } from 'react';
import { formatCurrentDate } from '../../utils/formatDate';
import type { GlobalActionConfig } from '../../types/navigation';
import { Button } from '../common/Button';

interface CuremasoTopBarProps {
  pageTitle: string;
  globalAction: GlobalActionConfig;
  onHamburgerClick: () => void;
  onGlobalAction: () => void;
}

export const CuremasoTopBar = forwardRef<HTMLButtonElement, CuremasoTopBarProps>(function CuremasoTopBar(
  { pageTitle, globalAction, onHamburgerClick, onGlobalAction },
  hamburgerRef,
) {
  return (
    <div className="topbar crm-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Button className="hamburger" id="crmHamburgerBtn" ref={hamburgerRef} onClick={onHamburgerClick}>
          <i className="fas fa-bars" />
        </Button>
        <div className="greeting">
          <h1 id="crmPageTitle">{pageTitle}</h1>
          <p id="crmPageSubtitle">
            AI-powered CRM &amp; ERP · <span id="crmCurrentDate">{formatCurrentDate()}</span>
          </p>
        </div>
      </div>
      <div className="actions">
        <div className="notif">
          <i className="fas fa-bell" />
          <span className="badge">4</span>
        </div>
        <Button variant="primary" id="crmGlobalActionBtn" onClick={onGlobalAction}>
          <i className={globalAction.icon} /> {globalAction.label}
        </Button>
      </div>
    </div>
  );
});

