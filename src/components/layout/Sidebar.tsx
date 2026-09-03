import { forwardRef, useState } from 'react';
import type { ModuleItem } from '../../types/module';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface SidebarProps {
  activeModuleId: number;
  specialModules: ModuleItem[];
  filteredModules: ModuleItem[];
  searchQuery: string;
  isOpen: boolean;
  isCollapsed: boolean;
  isHoverExpanded: boolean;
  onSearchChange: (query: string) => void;
  onSelectModule: (id: number) => void;
  onToggleCollapse: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    activeModuleId,
    specialModules,
    filteredModules,
    searchQuery,
    isOpen,
    isCollapsed,
    isHoverExpanded,
    onSearchChange,
    onSelectModule,
    onToggleCollapse,
    onMouseEnter,
    onMouseLeave,
  },
  ref,
) {
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const collapsed = isCollapsed && !isHoverExpanded;

  return (
    <div className={`sidebar-wrapper${isOpen ? ' open' : ''}${isCollapsed ? ' collapsed' : ''}`}>
      <aside
        className={`sidebar${isOpen ? ' open' : ''}${isCollapsed ? ' collapsed' : ''}${isHoverExpanded ? ' hover-expanded' : ''}`}
        id="sidebar"
        ref={ref}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => {
          onMouseLeave();
          setUserMenuOpen(false);
        }}
      >
        <div className="logo">
          <span className="logo-text">E.</span>
          <small>ERP</small>
          <Button
            className="collapse-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <i className="fas fa-bars" />
          </Button>
        </div>

        <div className="sidebar-divider" />

        <div className="search-box">
          <Input
            type="text"
            id="sidebarSearch"
            placeholder={collapsed ? '' : 'Filter modules...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            title={collapsed ? 'Search modules' : undefined}
          />
          <i className="fas fa-search" />
        </div>

        <div className="sidebar-divider" />

        <nav className="menu-list" id="menuList">
          {/* Special Pages */}
          {specialModules.map((item) => (
            <a
              key={item.id}
              href="#"
              className={`menu-item${item.id === activeModuleId ? ' active' : ''}`}
              title={collapsed ? item.name : undefined}
              onClick={(e) => {
                e.preventDefault();
                onSelectModule(item.id);
              }}
            >
              <i className={`fas ${item.icon || 'fa-circle'}`} />
              <span className="menu-label">{item.name}</span>
            </a>
          ))}

          {/* Filtered Non-special Modules */}
          {filteredModules.length === 0 ? (
            !collapsed && (
              <div style={{ padding: '12px 14px', fontSize: 13, color: '#8e9bb5' }}>No modules found</div>
            )
          ) : (
            filteredModules.map((item) => (
              <a
                key={item.id}
                href="#"
                className={`menu-item${item.id === activeModuleId ? ' active' : ''}`}
                title={collapsed ? item.name : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectModule(item.id);
                }}
              >
                <i className={`fas ${item.icon || 'fa-circle'}`} />
                <span className="menu-label">{item.name}</span>
              </a>
            ))
          )}
        </nav>

        <div className="user-card">
          <div className="avatar">L</div>
          {!collapsed && (
            <>
              <div className="info">
                <div className="name" title="labeeb.eee_candidate">
                  labeeb.eee_candidate
                </div>
                <div className="role">ERP · Full Navigation</div>
              </div>
              <Button
                type="button"
                className="user-card-menu-btn"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                title="Account options"
              >
                <i className="fas fa-ellipsis-v" />
              </Button>

              {userMenuOpen && (
                <div className="user-card-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">labeeb.eee_candidate</div>
                    <div className="user-dropdown-email">labeeb@curemaso.com</div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <Button
                    type="button"
                    className="user-dropdown-item signout-btn"
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (window.confirm('Are you sure you want to sign out?')) {
                        window.location.reload();
                      }
                    }}
                  >
                    <i className="fas fa-sign-out-alt" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
});

