import { useEffect, useState } from 'react';

interface AsyncDataState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: string | null;
}

/**
 * Runs `fetcher` on mount (and whenever `deps` change) and tracks
 * loading/error/data state. Used by page-level hooks that pull from the
 * service layer.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  errorMessage = 'Something went wrong while loading this data.',
): AsyncDataState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetcher()
      .then((result) => {
        if (isMounted) {
          setData(result);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) setError(errorMessage);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading, error };
}

