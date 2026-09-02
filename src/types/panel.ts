export type PanelTabType =
  | 'notifications'
  | 'chat-support'
  | 'chat-general'
  | 'chat-task'
  | 'news'
  | 'favorites'
  | 'ai-agent'
  | 'calendar'
  | 'notes'
  | 'tasks';

export interface PanelState {
  isOpen: boolean;
  activeTab: PanelTabType;
  selectedAgent?: string;
}

export interface ChatMessage {
  id: number;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  isMe?: boolean;
}

export interface NoteItem {
  id: number;
  title: string;
  content: string;
  date: string;
  color: string;
}

export interface TaskItem {
  id: number;
  title: string;
  due: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export interface NotificationItem {
  id: number;
  title: string;
  desc: string;
  time: string;
  icon: string;
  unread: boolean;
}

export interface NewsArticle {
  id: number;
  title: string;
  date: string;
  author: string;
  content: string;
  tag: string;
}

