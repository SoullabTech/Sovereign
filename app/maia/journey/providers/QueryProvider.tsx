/**
 * TanStack Query Provider - Journey Page Phase 2
 *
 * Provides QueryClient context for all data-fetching hooks.
 *
 * Phase: 4.4-C Phase 2 (API Integration)
 * Created: December 23, 2024
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Query Provider Component
 *
 * Wraps the app with TanStack Query context.
 *
 * @example
 * ```tsx
 * <QueryProvider>
 *   <JourneyPage />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient instance (using useState to ensure it's created only once)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: Data considered fresh for this duration
            staleTime: 2 * 60 * 1000, // 2 minutes default

            // Cache time: How long inactive data stays in cache
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)

            // Retry configuration
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch configuration
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React Query Devtools: Install @tanstack/react-query-devtools to enable */}
    </QueryClientProvider>
  );
}
