import { useState } from 'react';
import type { FormEvent } from 'react';
import type {
  ChatMessage,
  NewsArticle,
  NoteItem,
  NotificationItem,
  PanelState,
  PanelTabType,
  TaskItem,
} from '../../types/panel';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { BitrixNavList } from './bitrix/BitrixNavList';
import { BitrixCalendarView } from './bitrix/BitrixCalendarView';
import { BitrixNotesView } from './bitrix/BitrixNotesView';
import { BitrixTasksView } from './bitrix/BitrixTasksView';
import { BitrixNotificationsView } from './bitrix/BitrixNotificationsView';
import { BitrixChatView } from './bitrix/BitrixChatView';
import { BitrixNewsView } from './bitrix/BitrixNewsView';
import { BitrixFavoritesView } from './bitrix/BitrixFavoritesView';

interface BitrixSlidePanelProps {
  panelState: PanelState;
  onClose: () => void;
  onSelectTab: (tab: PanelTabType, agent?: string) => void;
  onNavigateModule: (id: number) => void;
}


const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'chat-support': [
    {
      id: 1,
      sender: 'AI Support Assistant',
      avatar: '🤖',
      text: 'Hi Labeeb! How can I assist you with Curemaso ERP today?',
      time: '11:42 AM',
    },
    {
      id: 2,
      sender: 'Support Lead',
      avatar: '👩‍💼',
      text: 'We noticed you were configuring the CRM pipeline. Need help connecting webhooks?',
      time: '11:45 AM',
    },
  ],
  'chat-general': [
    {
      id: 1,
      sender: 'Sarah Jenkins',
      avatar: '👩',
      text: 'Good morning team! The Q3 sales demo starts at 2:00 PM.',
      time: '9:15 AM',
    },
    {
      id: 2,
      sender: 'Alex Rivera',
      avatar: '👨',
      text: 'Awesome, presentation slides are updated in the cloud.',
      time: '9:20 AM',
    },
  ],
  'chat-task': [
    {
      id: 1,
      sender: 'Task Bot',
      avatar: '⚡',
      text: 'Task #108 "Audit Compliance Data" has been marked in-review.',
      time: '10:00 AM',
    },
  ],
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    title: 'New Lead Generated',
    desc: 'Acme Corp accepted the proposal draft for $24,000.',
    time: '10m ago',
    icon: 'fa-user-check',
    unread: true,
  },
  {
    id: 2,
    title: 'System Health Optimal',
    desc: 'Automated nightly backup completed without warnings.',
    time: '1h ago',
    icon: 'fa-shield-alt',
    unread: true,
  },
  {
    id: 3,
    title: 'Meeting in 30 Mins',
    desc: 'Sync with Field Force executive regarding regional distribution.',
    time: '2h ago',
    icon: 'fa-calendar-check',
    unread: false,
  },
  {
    id: 4,
    title: 'AI Tele Caller Batch Done',
    desc: 'Processed 150 automated outbound feedback calls.',
    time: '4h ago',
    icon: 'fa-phone-volume',
    unread: false,
  },
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 1,
    title: 'Q3 Enterprise Strategy',
    content: 'Expand AI Tele Caller integration across Southeast regional clinics.',
    date: 'Aug 24, 2026',
    color: '#fef3c7',
  },
  {
    id: 2,
    title: 'Field Force Check-ins',
    content: 'Verify GPS geo-fencing radius calibration on mobile client v2.4.',
    date: 'Aug 23, 2026',
    color: '#dbeafe',
  },
  {
    id: 3,
    title: 'Compliance Checklist',
    content: 'Complete data residency audit report before Friday board review.',
    date: 'Aug 21, 2026',
    color: '#d1fae5',
  },
];

const INITIAL_TASKS: TaskItem[] = [
  { id: 1, title: 'Review Q3 Sales Pipeline conversion rates', due: 'Today, 5:00 PM', completed: false, priority: 'High' },
  { id: 2, title: 'Sync with Field Force regional managers', due: 'Tomorrow, 10:30 AM', completed: false, priority: 'Medium' },
  { id: 3, title: 'Verify automated database failover snapshot', due: 'Aug 26, 2026', completed: true, priority: 'Low' },
  { id: 4, title: 'Update Curemaso AI prompt templates for Tele Caller', due: 'Aug 27, 2026', completed: false, priority: 'High' },
];

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    title: 'Curemaso AI 2.4.1 Update Live',
    date: 'Aug 24, 2026',
    author: 'Product Engineering',
    content:
      'New Bitrix24-style slide navigation, enhanced omnichannel CRM synchronization, and real-time copilot capabilities are now deployed.',
    tag: 'Product Update',
  },
  {
    id: 2,
    title: 'Q3 Enterprise Targets Surpassed by 18%',
    date: 'Aug 22, 2026',
    author: 'Executive Team',
    content:
      'Thanks to our field force automation and AI lead scoring, client satisfaction scores reached 94% across all regional hubs.',
    tag: 'Company News',
  },
  {
    id: 3,
    title: 'New AI Tele Caller Capabilities Released',
    date: 'Aug 18, 2026',
    author: 'AI Research Lab',
    content:
      'Outbound and inbound sentiment tracking now integrated with live transcript summaries and automatic CRM task generation.',
    tag: 'Feature Spotlight',
  },
];

export function BitrixSlidePanel({
  panelState,
  onClose,
  onSelectTab,
  onNavigateModule,
}: BitrixSlidePanelProps) {
  const { isOpen, activeTab, selectedAgent } = panelState;

  const [searchFilter, setSearchFilter] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [notificationsList] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [favoritesList, setFavoritesList] = useState<number[]>([1, 10, 8, 4, 3, 11]);

  // Notes state
  const [notesList, setNotesList] = useState<NoteItem[]>(INITIAL_NOTES);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Tasks state
  const [tasksList, setTasksList] = useState<TaskItem[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!isOpen) return null;

  function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const currentKey = activeTab === 'ai-agent' ? 'chat-support' : activeTab;
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: 'You',
      avatar: '👤',
      text: chatInput.trim(),
      time: 'Just now',
      isMe: true,
    };
    setMessages((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] || []), newMsg],
    }));
    setChatInput('');

    // Auto AI reply
    setTimeout(() => {
      const aiReply: ChatMessage = {
        id: Date.now() + 1,
        sender: activeTab === 'ai-agent' ? selectedAgent || 'AI Assistant' : 'Curemaso AI',
        avatar: '🤖',
        text: `Understood. Processing "${newMsg.text}" with real-time ERP sync.`,
        time: 'Just now',
      };
      setMessages((prev) => ({
        ...prev,
        [currentKey]: [...(prev[currentKey] || []), aiReply],
      }));
    }, 600);
  }

  function toggleFavorite(id: number) {
    setFavoritesList((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function handleAddNote(e: FormEvent) {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const newNote: NoteItem = {
      id: Date.now(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      date: 'Just now',
      color: '#fef3c7',
    };
    setNotesList((prev) => [newNote, ...prev]);
    setNewNoteTitle('');
    setNewNoteContent('');
  }

  function handleDeleteNote(id: number) {
    setNotesList((prev) => prev.filter((n) => n.id !== id));
  }

  function handleAddTask(e: FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      due: 'Today',
      completed: false,
      priority: 'Medium',
    };
    setTasksList((prev) => [newTask, ...prev]);
    setNewTaskTitle('');
  }

  function toggleTaskComplete(id: number) {
    setTasksList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  const isChatTab =
    activeTab.startsWith('chat-') || activeTab === 'ai-agent';
  const chatKey = activeTab === 'ai-agent' ? 'chat-support' : activeTab;
  const currentChatMessages = messages[chatKey] || [];

  return (
    <div className="bitrix-panel-backdrop" onClick={onClose}>
      <div
        className="bitrix-slide-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Left Side: Navigation Feed & Search */}
        <div className="bitrix-panel-sidebar">
          <div className="bitrix-panel-sidebar-header">
            <Button
              className="bitrix-close-btn"
              onClick={onClose}
              title="Close panel (Esc)"
              type="button"
            >
              <i className="fas fa-times" />
            </Button>
            <div className="bitrix-search-input-wrap">
              <i className="fas fa-search" />
              <Input
                type="text"
                placeholder="Find chat or panel..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>


          <BitrixNavList
            activeTab={activeTab}
            selectedAgent={selectedAgent}
            notesCount={notesList.length}
            openTasksCount={tasksList.filter((t) => !t.completed).length}
            favoritesCount={favoritesList.length}
            onSelectTab={onSelectTab}
          />
        </div>

        {/* Right Side: Main Display Content */}
        <div className="bitrix-panel-main">
          {activeTab === 'calendar' && <BitrixCalendarView />}

          {activeTab === 'notes' && (
            <BitrixNotesView
              notesList={notesList}
              newNoteTitle={newNoteTitle}
              newNoteContent={newNoteContent}
              onTitleChange={setNewNoteTitle}
              onContentChange={setNewNoteContent}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeTab === 'tasks' && (
            <BitrixTasksView
              tasksList={tasksList}
              newTaskTitle={newTaskTitle}
              onTaskTitleChange={setNewTaskTitle}
              onAddTask={handleAddTask}
              onToggleTask={toggleTaskComplete}
            />
          )}

          {activeTab === 'notifications' && (
            <BitrixNotificationsView notifications={notificationsList} />
          )}

          {isChatTab && (
            <BitrixChatView
              activeTab={activeTab}
              selectedAgent={selectedAgent}
              messages={currentChatMessages}
              chatInput={chatInput}
              onChatInputChange={setChatInput}
              onSendMessage={handleSendMessage}
            />
          )}

          {activeTab === 'news' && <BitrixNewsView articles={NEWS_ARTICLES} />}

          {activeTab === 'favorites' && (
            <BitrixFavoritesView
              favoritesList={favoritesList}
              onToggleFavorite={toggleFavorite}
              onNavigateModule={onNavigateModule}
            />
          )}
        </div>
      </div>
    </div>
  );
}
