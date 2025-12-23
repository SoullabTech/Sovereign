/**
 * useSymbols Hook - Journey Page Phase 2
 *
 * React Query hook for fetching archetypal symbols (🌬️ Air Layer).
 *
 * Phase: 4.4-C Phase 2 (API Integration)
 * Created: December 23, 2024
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { assertValidResponse, SymbolsResponseSchema } from '../lib/schemas';
import type { Symbol } from '../types';

export interface UseSymbolsOptions {
  count?: number;
  seed?: number;
  minFrequency?: number;
  enabled?: boolean;
}

export interface UseSymbolsResult {
  symbols: Symbol[];
  count: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Fetch symbols from /api/bardic/symbols
 */
async function fetchSymbols(count: number, seed: number, minFrequency?: number) {
  let url = `/api/bardic/symbols?count=${count}&seed=${seed}`;
  if (minFrequency !== undefined) {
    url += `&minFrequency=${minFrequency}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch symbols: ${response.statusText}`);
  }

  const data = await response.json();

  // Validate response schema
  return assertValidResponse(SymbolsResponseSchema, data);
}

/**
 * useSymbols Hook
 *
 * @param options - Query options
 * @returns Symbol data, loading state, and refetch function
 *
 * @example
 * ```tsx
 * const { symbols, isLoading } = useSymbols({ minFrequency: 3 });
 *
 * if (isLoading) return <Spinner />;
 * return <SymbolCloud symbols={symbols} />;
 * ```
 */
export function useSymbols(options: UseSymbolsOptions = {}): UseSymbolsResult {
  const { count = 12, seed = 42, minFrequency, enabled = true } = options;

  const query = useQuery({
    queryKey: ['symbols', count, seed, minFrequency],
    queryFn: () => fetchSymbols(count, seed, minFrequency),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });

  return {
    symbols: query.data?.symbols || [],
    count: query.data?.count || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
