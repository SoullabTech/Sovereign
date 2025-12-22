'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

/**
 * REACT QUERY PROVIDER
 *
 * Provides QueryClient context for data fetching across the application.
 * Used by analytics dashboard and any components using useQuery/useMutation hooks.
 *
 * Configuration:
 * - defaultOptions.queries.staleTime: 60s (data considered fresh for 1 minute)
 * - defaultOptions.queries.refetchOnWindowFocus: false (prevent aggressive refetching)
 * - defaultOptions.queries.retry: 1 (single retry on failure)
 *
 * DevTools: Enabled in development only for debugging queries
 */

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create QueryClient in useState to ensure it's only created once per component lifecycle
  // This prevents client/server hydration mismatches in Next.js
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data fresh for 60 seconds
            staleTime: 60 * 1000,
            // Don't refetch when window regains focus (analytics data doesn't change that rapidly)
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // Throw errors to error boundaries
            throwOnError: false,
          },
          mutations: {
            // Throw mutation errors to error boundaries
            throwOnError: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
