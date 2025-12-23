/**
 * useThreads Hook - Journey Page Phase 2
 *
 * React Query hook for fetching narrative threads (💧 Water Layer).
 *
 * Phase: 4.4-C Phase 2 (API Integration)
 * Created: December 23, 2024
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { assertValidResponse, ThreadsResponseSchema } from '../lib/schemas';
import type { Thread } from '../types';

export interface UseThreadsOptions {
  count?: number;
  seed?: number;
  enabled?: boolean;
}

export interface UseThreadsResult {
  threads: Thread[];
  count: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch threads from /api/bardic/threads
 */
async function fetchThreads(count: number, seed: number) {
  const url = `/api/bardic/threads?count=${count}&seed=${seed}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch threads: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate response schema
  return assertValidResponse(ThreadsResponseSchema, data);
}

/**
 * useThreads Hook
 *
 * @param options - Query options
 * @returns Thread data, loading state, and refetch function
 *
 * @example
 * ```tsx
 * const { threads, isLoading } = useThreads({ count: 12 });
 *
 * if (isLoading) return <Spinner />;
 * return <ThreadList threads={threads} />;
 * ```
 */
export function useThreads(options: UseThreadsOptions = {}): UseThreadsResult {
  const { count = 12, seed = 42, enabled = true } = options;

  const query = useQuery({
    queryKey: ['threads', count, seed],
    queryFn: () => fetchThreads(count, seed),
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled,
  });

  return {
    threads: query.data?.threads || [],
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
