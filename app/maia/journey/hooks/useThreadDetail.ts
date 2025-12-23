/**
 * useThreadDetail Hook - Journey Page Phase 4
 *
 * Fetches detailed thread data including narrative, reflection,
 * motifs, insights, and biofield correlations.
 *
 * Phase: 4.4-C Phase 4 (Interaction & Narrative Integration)
 * Created: December 23, 2024
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { Thread, Motif, Insight } from '../types';

// ============================================================================
// Extended Thread Detail Type
// ============================================================================

export interface ThreadDetail extends Thread {
  /** Full narrative text */
  narrative: string;

  /** User reflection on this thread */
  reflection: string;

  /** Emerging patterns/motifs */
  motifs: Motif[];

  /** Related insights */
  relatedInsights: Insight[];

  /** Related thread IDs */
  relatedThreadIds: number[];

  /** Biofield correlation data (if available) */
  biofieldData?: {
    hrvCoherence: number;
    voiceAffect: number;
    breathRate: number;
  };
}

// ============================================================================
// Hook Configuration
// ============================================================================

export interface UseThreadDetailOptions {
  /** Enable/disable the query */
  enabled?: boolean;

  /** Stale time in milliseconds */
  staleTime?: number;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useThreadDetail Hook
 *
 * Fetches detailed thread data from the API.
 *
 * @param threadId - Thread ID to fetch
 * @param options - Query configuration
 * @returns Thread detail data and query state
 *
 * @example
 * ```tsx
 * const { threadDetail, isLoading, error } = useThreadDetail(threadId);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error />;
 *
 * return <div>{threadDetail.narrative}</div>;
 * ```
 */
export function useThreadDetail(
  threadId: number | null,
  options: UseThreadDetailOptions = {}
) {
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;

  const query = useQuery({
    queryKey: ['threadDetail', threadId],
    queryFn: async () => {
      if (!threadId) return null;

      const response = await fetch(`/api/bardic/threads/${threadId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch thread detail: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch thread detail');
      }

      return data.thread as ThreadDetail;
    },
    enabled: enabled && threadId !== null,
    staleTime,
    retry: 2,
  });

  return {
    threadDetail: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
