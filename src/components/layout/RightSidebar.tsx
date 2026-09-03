import { useState } from 'react';
import type { PanelTabType } from '../../types/panel';
import { Button } from '../common/Button';

interface RightSidebarProps {
  onOpenPanel: (tab: PanelTabType, agent?: string) => void;
  activePanelTab?: PanelTabType;
  isPanelOpen?: boolean;
}

const AI_SUBMENU = [
  { name: 'AI Receptionist', icon: 'fa-user-tie' },
  { name: 'AI Tele Caller', icon: 'fa-phone-alt' },
  { name: 'AI Call Centre', icon: 'fa-headset' },
  { name: 'AI Customer Care', icon: 'fa-hands-helping' },
  { name: 'AI Support', icon: 'fa-life-ring' },
  { name: 'AI Personal Assist', icon: 'fa-robot' },
  { name: 'My Twin Employee', icon: 'fa-user-friends' },
  { name: 'AI Tech Support', icon: 'fa-laptop-code' },
];

const CHAT_SUBMENU = [
  { id: 'chat-support' as PanelTabType, name: 'Support', icon: 'fa-headset' },
  { id: 'chat-general' as PanelTabType, name: 'General', icon: 'fa-comments' },
  { id: 'chat-task' as PanelTabType, name: 'Task', icon: 'fa-tasks' },
];

export function RightSidebar({ onOpenPanel, activePanelTab, isPanelOpen }: RightSidebarProps) {
  const [aiDropdownOpen, setAiDropdownOpen] = useState<boolean>(false);
  const [chatDropdownOpen, setChatDropdownOpen] = useState<boolean>(false);

  return (
    <aside className="right-sidebar" id="rightSidebar" aria-label="Right Sidebar Navigation">
      {/* 1. AI DROPDOWN SECTION */}
      <div className="rs-section">
        <Button
          type="button"
          className={`rs-header-btn ${aiDropdownOpen ? 'open' : ''}`}
          onClick={() => setAiDropdownOpen((prev) => !prev)}
          title="Toggle AI Submenu"
        >
          <div className="ai-header-badge">
            <i className="fas fa-brain" />
          </div>
          <i className={`fas fa-chevron-${aiDropdownOpen ? 'up' : 'down'} rs-chevron`} />
        </Button>

        {aiDropdownOpen && (
          <div className="rs-submenu ai-submenu">
            {AI_SUBMENU.map((item) => (
              <Button
                key={item.name}
                type="button"
                className={`rs-item-btn${
                  isPanelOpen && activePanelTab === 'ai-agent' ? ' active' : ''
                }`}
                title={item.name}
                onClick={() => onOpenPanel('ai-agent', item.name)}
              >
                <i className={`fas ${item.icon}`} />
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="right-sidebar-divider" />

      {/* 2. NOTIFICATIONS */}
      <Button
        type="button"
        className={`rs-item-btn notify-btn${
          isPanelOpen && activePanelTab === 'notifications' ? ' active' : ''
        }`}
        title="Notifications"
        onClick={() => onOpenPanel('notifications')}
      >
        <i className="fas fa-bell" />
        <span className="rs-badge-dot">4</span>
      </Button>

      {/* 3. CHAT WITH EXPANDABLE SUBMENU */}
      <div className="rs-section">
        <Button
          type="button"
          className={`rs-item-btn chat-main-btn${
            isPanelOpen && activePanelTab?.startsWith('chat-') ? ' active' : ''
          }`}
          title="Chat & Channels"
          onClick={() => {
            setChatDropdownOpen((prev) => !prev);
            onOpenPanel('chat-support');
          }}
        >
          <i className="fas fa-comment-dots" />
        </Button>

        {chatDropdownOpen && (
          <div className="rs-submenu chat-submenu">
            {CHAT_SUBMENU.map((chat) => (
              <Button
                key={chat.id}
                type="button"
                className={`rs-item-btn sub-btn${
                  isPanelOpen && activePanelTab === chat.id ? ' active' : ''
                }`}
                title={`Chat: ${chat.name}`}
                onClick={() => onOpenPanel(chat.id)}
              >
                <i className={`fas ${chat.icon}`} />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* 4. NEWS */}
      <Button
        type="button"
        className={`rs-item-btn${isPanelOpen && activePanelTab === 'news' ? ' active' : ''}`}
        title="Company News"
        onClick={() => onOpenPanel('news')}
      >
        <i className="fas fa-newspaper" />
      </Button>

      {/* 5. FAVORITES */}
      <Button
        type="button"
        className={`rs-item-btn${isPanelOpen && activePanelTab === 'favorites' ? ' active' : ''}`}
        title="Favorites"
        onClick={() => onOpenPanel('favorites')}
      >
        <i className="fas fa-star" />
      </Button>

      {/* 6. CALENDAR */}
      <Button
        type="button"
        className={`rs-item-btn${isPanelOpen && activePanelTab === 'calendar' ? ' active' : ''}`}
        title="Calendar"
        onClick={() => onOpenPanel('calendar')}
      >
        <i className="fas fa-calendar-alt" />
      </Button>

      {/* 7. NOTES */}
      <Button
        type="button"
        className={`rs-item-btn${isPanelOpen && activePanelTab === 'notes' ? ' active' : ''}`}
        title="Notes"
        onClick={() => onOpenPanel('notes')}
      >
        <i className="fas fa-sticky-note" />
      </Button>

      {/* 8. TASKS / TO-DO */}
      <Button
        type="button"
        className={`rs-item-btn${isPanelOpen && activePanelTab === 'tasks' ? ' active' : ''}`}
        title="Tasks / To-Do"
        onClick={() => onOpenPanel('tasks')}
      >
        <i className="fas fa-check-square" />
      </Button>


      <div className="right-sidebar-footer">
        <span className="ai-live-dot" title="Suite Online" />
      </div>
    </aside>
  );
}
