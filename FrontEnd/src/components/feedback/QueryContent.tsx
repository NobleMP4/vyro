import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { ErrorState } from './ErrorState';

interface QueryContentProps<T> {
  query: UseQueryResult<T>;
  /** Skeleton matching the final layout. */
  loading: ReactNode;
  /** Shown when `isEmpty(data)` — never leave a blank screen. */
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  errorTitle?: string;
  children: (data: T) => ReactNode;
}

/**
 * The four UX states of any data screen — loading, error (with retry), empty,
 * success — handled the same way everywhere.
 */
export function QueryContent<T>({
  query,
  loading,
  empty,
  isEmpty,
  errorTitle,
  children,
}: QueryContentProps<T>) {
  if (query.isPending) return <>{loading}</>;
  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        title={errorTitle}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    );
  }
  if (empty && isEmpty?.(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
}
