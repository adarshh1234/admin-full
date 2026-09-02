import type { FormEvent } from 'react';
import type { ChatMessage, PanelTabType } from '../../../types/panel';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';


interface BitrixChatViewProps {
  activeTab: PanelTabType;
  selectedAgent?: string;
  messages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (val: string) => void;
  onSendMessage: (e: FormEvent) => void;
}

export function BitrixChatView({
  activeTab,
  selectedAgent,
  messages,
  chatInput,
  onChatInputChange,
  onSendMessage,
}: BitrixChatViewProps) {
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'chat-support':
        return {
          badgeClass: 'support-badge',
          icon: 'fa-headset',
          title: 'Support Desk · Helpdesk Team',
          subtitle: 'Direct line to technical team and enterprise support',
        };
      case 'chat-general':
        return {
          badgeClass: 'general-badge',
          icon: 'fa-comments',
          title: 'General Company Chat',
          subtitle: 'All-hands workspace and cross-department discussions',
        };
      case 'chat-task':
        return {
          badgeClass: 'task-badge',
          icon: 'fa-tasks',
          title: 'Project & Task Threads',
          subtitle: 'Real-time synchronization for sprint goals and tickets',
        };
      case 'ai-agent':
      default:
        return {
          badgeClass: 'ai-badge',
          icon: 'fa-brain',
          title: `${selectedAgent || 'AI Agent'} · Enterprise Copilot`,
          subtitle: 'Autonomous ERP workflow agent with multi-modal tools',
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <div className="bitrix-content-view bitrix-chat-view-layout">
      <div className="bitrix-view-header">
        <div className="bitrix-view-title-wrap">
          <span className={`bitrix-view-badge ${info.badgeClass}`}>
            <i className={`fas ${info.icon}`} />
          </span>
          <div>
            <h2>{info.title}</h2>
            <p>{info.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="bitrix-chat-window">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bitrix-chat-bubble-row${msg.isMe ? ' me' : ''}`}
          >
            <div className="bitrix-bubble-avatar">{msg.avatar}</div>
            <div className="bitrix-bubble-content">
              <div className="bitrix-bubble-meta">
                <span className="bitrix-bubble-sender">{msg.sender}</span>
                <span className="bitrix-bubble-time">{msg.time}</span>
              </div>
              <div className="bitrix-bubble-text">{msg.text}</div>
            </div>
          </div>
        ))}
      </div>

      <form className="bitrix-chat-input-bar" onSubmit={onSendMessage}>
        <Input
          type="text"
          placeholder={
            activeTab === 'ai-agent'
              ? `Ask ${selectedAgent || 'AI Assistant'} anything...`
              : 'Type your message...'
          }
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
        />
        <Button type="submit" className="bitrix-send-btn">
          <i className="fas fa-paper-plane" />
        </Button>
      </form>
    </div>
  );
}

