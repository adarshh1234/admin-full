import type { NotificationItem } from '../../../types/panel';

interface BitrixNotificationsViewProps {
  notifications: NotificationItem[];
}

export function BitrixNotificationsView({ notifications }: BitrixNotificationsViewProps) {
  return (
    <div className="bitrix-content-view">
      <div className="bitrix-view-header">
        <div className="bitrix-view-title-wrap">
          <span className="bitrix-view-badge notify-badge">
            <i className="fas fa-bell" />
          </span>
          <div>
            <h2>Notifications &amp; Activity</h2>
            <p>Real-time events, pipeline triggers, and system logs</p>
          </div>
        </div>
      </div>

      <div className="bitrix-notification-timeline">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`bitrix-notification-item${n.unread ? ' unread' : ''}`}
          >
            <div className="bitrix-notif-icon">
              <i className={`fas ${n.icon}`} />
            </div>
            <div className="bitrix-notif-body">
              <div className="bitrix-notif-top">
                <span className="bitrix-notif-title">{n.title}</span>
                <span className="bitrix-notif-time">{n.time}</span>
              </div>
              <p className="bitrix-notif-desc">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
