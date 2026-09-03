import type { ReactNode } from 'react';
import MISLoader from './Loader';

interface AsyncStateWrapperProps<T> {
  loading: boolean;
  error: Error | string | null;
  isEmpty?: boolean;
  data?: T | null;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export default function AsyncStateWrapper<T>({
  loading,
  error,
  isEmpty,
  emptyMessage = 'No data available.',
  onRetry,
  children,
}: AsyncStateWrapperProps<T>) {
  if (loading) {
    return <MISLoader label="Loading data..." />;
  }

  if (error) {
    const errorText = typeof error === 'string' ? error : error.message || 'An error occurred';
    return (
      <div className="mis-async-error-state">
        <p className="error-title">⚠️ Unable to load data</p>
        <p className="error-desc">{errorText}</p>
        {onRetry && (
          <button className="mis-tab-btn" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="mis-async-empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
