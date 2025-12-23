/**
 * useInsights Hook - Journey Page Phase 2
 *
 * React Query hook for fetching semantic insights (🌬️ Air Layer).
 *
 * Phase: 4.4-C Phase 2 (API Integration)
 * Created: December 23, 2024
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { assertValidResponse, InsightsResponseSchema } from '../lib/schemas';
import type { Insight } from '../types';

export interface UseInsightsOptions {
  count?: number;
  seed?: number;
  type?: 'pattern' | 'reflection' | 'question';
  enabled?: boolean;
}

export interface UseInsightsResult {
  insights: Insight[];
  count: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch insights from /api/bardic/insights
 */
async function fetchInsights(count: number, seed: number, type?: string) {
  let url = `/api/bardic/insights?count=${count}&seed=${seed}`;
  if (type) {
    url += `&type=${type}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch insights: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate response schema
  return assertValidResponse(InsightsResponseSchema, data);
}

/**
 * useInsights Hook
 *
 * @param options - Query options
 * @returns Insight data, loading state, and refetch function
 *
 * @example
 * ```tsx
 * const { insights, isLoading } = useInsights({ type: 'pattern' });
 *
 * if (isLoading) return <Spinner />;
 * return <InsightList insights={insights} />;
 * ```
 */
export function useInsights(options: UseInsightsOptions = {}): UseInsightsResult {
  const { count = 15, seed = 42, type, enabled = true } = options;

  const query = useQuery({
    queryKey: ['insights', count, seed, type],
    queryFn: () => fetchInsights(count, seed, type),
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled,
  });

  return {
    insights: query.data?.insights || [],
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
