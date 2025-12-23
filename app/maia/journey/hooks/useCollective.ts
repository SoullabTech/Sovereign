/**
 * useCollective Hook - Journey Page Phase 2
 *
 * React Query hook for fetching collective coherence (✨ Aether Layer).
 *
 * Phase: 4.4-C Phase 2 (API Integration)
 * Created: December 23, 2024
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { assertValidResponse, CollectiveCoherenceResponseSchema } from '../lib/schemas';
import type { CollectiveCoherence } from '../types';

export interface UseCollectiveOptions {
  seed?: number;
  enabled?: boolean;
  refetchInterval?: number; // milliseconds
}

export interface UseCollectiveResult {
  coherence: CollectiveCoherence | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch collective coherence from /api/collective/coherence
 */
async function fetchCollectiveCoherence(seed?: number) {
  let url = '/api/collective/coherence';
  if (seed !== undefined) {
    url += `?seed=${seed}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch collective coherence: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate response schema
  return assertValidResponse(CollectiveCoherenceResponseSchema, data);
}

/**
 * useCollective Hook
 *
 * @param options - Query options
 * @returns Collective coherence data, loading state, and refetch function
 *
 * @example
 * ```tsx
 * const { coherence, isLoading } = useCollective({ refetchInterval: 60000 });
 *
 * if (isLoading) return <Spinner />;
 * if (!coherence) return null;
 * return <CoherenceMeter coherence={coherence} />;
 * ```
 */
export function useCollective(options: UseCollectiveOptions = {}): UseCollectiveResult {
  const { seed, enabled = true, refetchInterval } = options;

  const query = useQuery({
    queryKey: seed !== undefined ? ['collective', seed] : ['collective'],
    queryFn: () => fetchCollectiveCoherence(seed),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval, // Optional auto-refetch
    enabled,
  });

  return {
    coherence: query.data?.coherence || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
