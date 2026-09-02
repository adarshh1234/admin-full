import type { FormEvent } from 'react';
import type { TaskItem } from '../../../types/panel';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';

interface BitrixTasksViewProps {
  tasksList: TaskItem[];
  newTaskTitle: string;
  onTaskTitleChange: (val: string) => void;
  onAddTask: (e: FormEvent) => void;
  onToggleTask: (id: number) => void;
}

export function BitrixTasksView({
  tasksList,
  newTaskTitle,
  onTaskTitleChange,
  onAddTask,
  onToggleTask,
}: BitrixTasksViewProps) {
  return (
    <div className="bitrix-content-view">
      <div className="bitrix-view-header">
        <div className="bitrix-view-title-wrap">
          <span className="bitrix-view-badge task-badge">
            <i className="fas fa-check-square" />
          </span>
          <div>
            <h2>Tasks &amp; To-Do</h2>
            <p>Task automation, operational checklists, and milestones</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={onAddTask}
        style={{
          marginBottom: 20,
          display: 'flex',
          gap: 10,
          background: '#f8faff',
          padding: 14,
          borderRadius: 12,
          border: '1px solid #e9edf4',
        }}
      >
        <Input
          type="text"
          placeholder="New task description..."
          value={newTaskTitle}
          onChange={(e) => onTaskTitleChange(e.target.value)}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13.5,
            outline: 'none',
          }}
        />
        <Button
          type="submit"
          variant="primary"
          style={{ padding: '8px 18px', fontSize: 13 }}
        >
          <i className="fas fa-plus" /> Add Task
        </Button>
      </form>


      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasksList.map((task) => (
          <div
            key={task.id}
            onClick={() => onToggleTask(task.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 10,
              background: task.completed ? '#f8fafc' : '#ffffff',
              border: '1px solid',
              borderColor: task.completed ? '#e2e8f0' : '#dbeafe',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i
                className={`far ${task.completed ? 'fa-check-circle' : 'fa-circle'}`}
                style={{
                  fontSize: 18,
                  color: task.completed ? '#16a34a' : '#94a3b8',
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: task.completed ? '#94a3b8' : '#1e293b',
                  textDecoration: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.title}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>{task.due}</span>
              <span
                className={`bitrix-badge-pill ${
                  task.priority === 'High'
                    ? 'red'
                    : task.priority === 'Medium'
                      ? 'blue'
                      : 'green'
                }`}
              >
                {task.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
