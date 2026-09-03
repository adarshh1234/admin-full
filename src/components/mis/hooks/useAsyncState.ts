import { useState, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | string | null;
  isEmpty: boolean;
}

export function useAsyncState<T>(initialData: T | null = null) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    isEmpty: Array.isArray(initialData) ? initialData.length === 0 : !initialData,
  });

  const runAsync = useCallback(async (promise: Promise<T>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await promise;
      const isEmpty = Array.isArray(data) ? data.length === 0 : !data;
      setState({ data, loading: false, error: null, isEmpty });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : String(err);
      setState((prev) => ({ ...prev, loading: false, error }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: initialData, loading: false, error: null, isEmpty: true });
  }, [initialData]);

  return { ...state, runAsync, reset, setState };
}
