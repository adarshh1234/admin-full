import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function MISModal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="mis-modal-overlay" onClick={onClose}>
      <div className="mis-modal-content" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="mis-modal-header">
            <h3>{title}</h3>
            <button className="mis-modal-close" onClick={onClose}>×</button>
          </div>
        )}
        <div className="mis-modal-body">{children}</div>
      </div>
    </div>
  );
}
