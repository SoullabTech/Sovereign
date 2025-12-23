/**
 * useSynthesis Hook - Journey Page Phase 2
 *
 * React Query hook for fetching cross-thread synthesis (✨ Aether Layer).
 *
 * Phase: 4.4-C Phase 2 (API Integration)
 * Created: December 23, 2024
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { assertValidResponse, SynthesisResponseSchema } from '../lib/schemas';
import type { SynthesisReport } from '../types';

export interface UseSynthesisOptions {
  threadIds: number[];
  seed?: number;
  enabled?: boolean;
}

export interface UseSynthesisResult {
  report: SynthesisReport | null;
  threadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch synthesis from /api/bardic/synthesis
 */
async function fetchSynthesis(threadIds: number[], seed: number) {
  if (threadIds.length === 0) {
    throw new Error('At least one thread ID is required for synthesis');
  }

  const url = `/api/bardic/synthesis?thread_ids=${threadIds.join(',')}&seed=${seed}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch synthesis: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate response schema
  return assertValidResponse(SynthesisResponseSchema, data);
}

/**
 * useSynthesis Hook
 *
 * @param options - Query options
 * @returns Synthesis report, loading state, and refetch function
 *
 * @example
 * ```tsx
 * const { report, isLoading } = useSynthesis({ threadIds: [1, 2, 3] });
 *
 * if (isLoading) return <Spinner />;
 * if (!report) return null;
 * return <SynthesisPanel report={report} />;
 * ```
 */
export function useSynthesis(options: UseSynthesisOptions): UseSynthesisResult {
  const { threadIds, seed = 42, enabled = true } = options;

  // Disable query if no thread IDs provided
  const shouldFetch = enabled && threadIds.length > 0;

  const query = useQuery({
    queryKey: ['synthesis', threadIds.sort().join(','), seed],
    queryFn: () => fetchSynthesis(threadIds, seed),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: shouldFetch,
  });

  return {
    report: query.data?.report || null,
    threadCount: query.data?.threadCount || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
