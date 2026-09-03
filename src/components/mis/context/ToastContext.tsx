import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type MISToastType = 'info' | 'success' | 'error' | 'warning';

export interface MISToastMessage {
  id: string;
  message: string;
  type: MISToastType;
}

interface MISToastContextState {
  toasts: MISToastMessage[];
  showToast: (message: string, type?: MISToastType) => void;
  removeToast: (id: string) => void;
}

const MISToastContext = createContext<MISToastContextState | null>(null);

export function MISToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<MISToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: MISToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <MISToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </MISToastContext.Provider>
  );
}

export function useMISToast() {
  const ctx = useContext(MISToastContext);
  if (!ctx) {
    throw new Error('useMISToast must be used within MISToastProvider');
  }
  return ctx;
}
