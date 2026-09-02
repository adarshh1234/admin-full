import { forwardRef } from 'react';
import { Button } from '../common/Button';

interface TopBarProps {
  onHamburgerClick: () => void;
  onGlobalAction: () => void;
}

export const TopBar = forwardRef<HTMLButtonElement, TopBarProps>(function TopBar(
  { onHamburgerClick, onGlobalAction },
  hamburgerRef,
) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Button className="hamburger" id="hamburgerBtn" ref={hamburgerRef} onClick={onHamburgerClick}>
          <i className="fas fa-bars" />
        </Button>
        <div className="greeting">
          <h1 id="pageTitle">
            Welcome back, <span>labeeb.eee_candidate</span>
          </h1>
          <p id="pageSubtitle">
            <i className="fas fa-shield-alt" style={{ color: '#2563eb', marginRight: 6 }} /> ERP · Full Module Navigation
          </p>
        </div>
      </div>

      <div className="actions">
        <Button variant="primary" id="globalActionBtn" onClick={onGlobalAction}>
          <i className="fas fa-plus" /> New
        </Button>
        <div className="topbar-user-avatar" title="labeeb.eee_candidate">
          <i className="fas fa-user" />
        </div>
      </div>
    </div>
  );
});

