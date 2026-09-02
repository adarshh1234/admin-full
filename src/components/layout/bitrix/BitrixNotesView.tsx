import type { FormEvent } from 'react';
import type { NoteItem } from '../../../types/panel';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';

interface BitrixNotesViewProps {
  notesList: NoteItem[];
  newNoteTitle: string;
  newNoteContent: string;
  onTitleChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onAddNote: (e: FormEvent) => void;
  onDeleteNote: (id: number) => void;
}

export function BitrixNotesView({
  notesList,
  newNoteTitle,
  newNoteContent,
  onTitleChange,
  onContentChange,
  onAddNote,
  onDeleteNote,
}: BitrixNotesViewProps) {
  return (
    <div className="bitrix-content-view">
      <div className="bitrix-view-header">
        <div className="bitrix-view-title-wrap">
          <span className="bitrix-view-badge notes-badge">
            <i className="fas fa-sticky-note" />
          </span>
          <div>
            <h2>Notes &amp; Scratchpad</h2>
            <p>Quick notes, important links, and team ideas</p>
          </div>
        </div>
      </div>

      <form
        onSubmit={onAddNote}
        style={{
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          background: '#f8faff',
          padding: 16,
          borderRadius: 12,
          border: '1px solid #e9edf4',
        }}
      >
        <Input
          type="text"
          placeholder="Note title..."
          value={newNoteTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13.5,
            outline: 'none',
          }}
        />
        <textarea
          placeholder="Note content..."
          value={newNoteContent}
          onChange={(e) => onContentChange(e.target.value)}
          rows={2}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 13.5,
            outline: 'none',
            resize: 'vertical',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="primary"
            style={{ padding: '8px 18px', fontSize: 13 }}
          >
            <i className="fas fa-plus" /> Add Note
          </Button>
        </div>
      </form>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}
      >
        {notesList.map((note) => (
          <div
            key={note.id}
            style={{
              background: note.color,
              borderRadius: 12,
              padding: 16,
              border: '1px solid rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 8,
              }}
            >
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                {note.title}
              </h4>
              <Button
                type="button"
                onClick={() => onDeleteNote(note.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 2,
                }}
                title="Delete note"
              >
                <i className="fas fa-trash-alt" />
              </Button>
            </div>
            <p
              style={{
                margin: '0 0 12px',
                fontSize: 13,
                color: '#334155',
                lineHeight: 1.4,
                flex: 1,
              }}
            >
              {note.content}
            </p>
            <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'flex-end' }}>
              {note.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

