import type { PanelTabType } from '../../../types/panel';

interface BitrixNavListProps {
  activeTab: PanelTabType;
  selectedAgent?: string;
  notesCount: number;
  openTasksCount: number;
  favoritesCount: number;
  onSelectTab: (tab: PanelTabType, agent?: string) => void;
}

export function BitrixNavList({
  activeTab,
  selectedAgent,
  notesCount,
  openTasksCount,
  favoritesCount,
  onSelectTab,
}: BitrixNavListProps) {
  return (
    <div className="bitrix-feed-list">
      {/* Calendar */}
      <div
        className={`bitrix-feed-item${activeTab === 'calendar' ? ' active' : ''}`}
        onClick={() => onSelectTab('calendar')}
      >
        <div className="bitrix-feed-icon-box calendar-box">
          <i className="fas fa-calendar-alt" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">Calendar</span>
            <span className="bitrix-badge-pill blue">3</span>
          </div>
          <span className="bitrix-feed-sub">Schedule &amp; Meetings</span>
        </div>
      </div>

      {/* Notes */}
      <div
        className={`bitrix-feed-item${activeTab === 'notes' ? ' active' : ''}`}
        onClick={() => onSelectTab('notes')}
      >
        <div className="bitrix-feed-icon-box notes-box">
          <i className="fas fa-sticky-note" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">Notes</span>
            <span className="bitrix-fav-count">{notesCount}</span>
          </div>
          <span className="bitrix-feed-sub">Scratchpad &amp; Files</span>
        </div>
      </div>

      {/* Tasks / To-Do */}
      <div
        className={`bitrix-feed-item${activeTab === 'tasks' ? ' active' : ''}`}
        onClick={() => onSelectTab('tasks')}
      >
        <div className="bitrix-feed-icon-box task-box">
          <i className="fas fa-check-square" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">Tasks &amp; To-Do</span>
            <span className="bitrix-badge-pill green">{openTasksCount}</span>
          </div>
          <span className="bitrix-feed-sub">Workflows &amp; Actions</span>
        </div>
      </div>

      {/* Notifications Item */}
      <div
        className={`bitrix-feed-item${activeTab === 'notifications' ? ' active' : ''}`}
        onClick={() => onSelectTab('notifications')}
      >
        <div className="bitrix-feed-icon-box notify-box">
          <i className="fas fa-bell" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">Notifications</span>
            <span className="bitrix-badge-pill">4</span>
          </div>
          <span className="bitrix-feed-sub">System &amp; CRM alerts</span>
        </div>
      </div>

      {/* Chat: Support */}
      <div
        className={`bitrix-feed-item${activeTab === 'chat-support' ? ' active' : ''}`}
        onClick={() => onSelectTab('chat-support')}
      >
        <div className="bitrix-feed-icon-box support-box">
          <i className="fas fa-headset" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">Support Chat</span>
            <span className="bitrix-badge-pill green">1</span>
          </div>
          <span className="bitrix-feed-sub">AI Assistant &amp; Help</span>
        </div>
      </div>

      {/* Chat: General */}
      <div
        className={`bitrix-feed-item${activeTab === 'chat-general' ? ' active' : ''}`}
        onClick={() => onSelectTab('chat-general')}
      >
        <div className="bitrix-feed-icon-box general-box">
          <i className="fas fa-comments" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">General Chat</span>
            <span className="bitrix-feed-time">9:20 AM</span>
          </div>
          <span className="bitrix-feed-sub">Company discussion</span>
        </div>
      </div>

      {/* Chat: Task */}
      <div
        className={`bitrix-feed-item${activeTab === 'chat-task' ? ' active' : ''}`}
        onClick={() => onSelectTab('chat-task')}
      >
        <div className="bitrix-feed-icon-box task-box">
          <i className="fas fa-tasks" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">Task Chat</span>
            <span className="bitrix-feed-time">10:00 AM</span>
          </div>
          <span className="bitrix-feed-sub">Project threads</span>
        </div>
      </div>

      {/* News */}
      <div
        className={`bitrix-feed-item${activeTab === 'news' ? ' active' : ''}`}
        onClick={() => onSelectTab('news')}
      >
        <div className="bitrix-feed-icon-box news-box">
          <i className="fas fa-newspaper" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">Company News</span>
          </div>
          <span className="bitrix-feed-sub">Bulletin &amp; Announcements</span>
        </div>
      </div>

      {/* Favorites */}
      <div
        className={`bitrix-feed-item${activeTab === 'favorites' ? ' active' : ''}`}
        onClick={() => onSelectTab('favorites')}
      >
        <div className="bitrix-feed-icon-box star-box">
          <i className="fas fa-star" />
        </div>
        <div className="bitrix-feed-info">
          <div className="bitrix-feed-title-row">
            <span className="bitrix-feed-title">Favorites</span>
            <span className="bitrix-fav-count">{favoritesCount}</span>
          </div>
          <span className="bitrix-feed-sub">Pinned shortcuts</span>
        </div>
      </div>

      {/* AI Agent Item */}
      {activeTab === 'ai-agent' && (
        <div
          className="bitrix-feed-item active"
          onClick={() => onSelectTab('ai-agent', selectedAgent)}
        >
          <div className="bitrix-feed-icon-box ai-box">
            <i className="fas fa-brain" />
          </div>
          <div className="bitrix-feed-info">
            <div className="bitrix-feed-title-row">
              <span className="bitrix-feed-title">{selectedAgent || 'AI Agent'}</span>
              <span className="bitrix-badge-pill purple">AI</span>
            </div>
            <span className="bitrix-feed-sub">Active Agent Workspace</span>
          </div>
        </div>
      )}
    </div>
  );
}
