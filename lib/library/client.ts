// frontend: lib/library/client.ts
// Client-side API helpers for Library Intelligence

export interface LibraryStats {
  sources: number;
  chunks: number;
  distillates: number;
  total_tokens: number;
  sources_by_status: Record<string, number>;
}

export interface JeevesResponse {
  success: boolean;
  synthesis: string;
  provenance: string[];
  facets_resonating: string[];
  sources_consulted: number;
  model_used: string;
  processing_time_ms: number;
  total_time_ms: number;
  error?: string;
  detail?: string;
}

export interface LibraryStatsResponse {
  success: boolean;
  stats: LibraryStats;
  jeeves: {
    available: boolean;
    message: string;
  };
  error?: string;
}

/**
 * Fetch library statistics
 */
export async function getLibraryStats(): Promise<LibraryStatsResponse> {
  const response = await fetch('/api/library/stats');

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch stats' }));
    throw new Error(error.error || 'Failed to fetch library stats');
  }

  return response.json();
}

/**
 * Ask Jeeves for deep synthesis across the library
 */
export async function askJeeves(
  query: string,
  maxSources: number = 6,
  mode: 'quick' | 'deep' = 'deep'
): Promise<JeevesResponse> {
  const response = await fetch('/api/library/ask-jeeves', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      maxSources,
      // Mode maps to how we handle unavailable Kimi
      // For now, both use Kimi when available
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      synthesis: '',
      provenance: [],
      facets_resonating: [],
      sources_consulted: 0,
      model_used: '',
      processing_time_ms: 0,
      total_time_ms: 0,
      error: data.error || 'Request failed',
      detail: data.detail,
    };
  }

  return {
    success: true,
    ...data,
  };
}

/**
 * Format token count for display
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    return `${(tokens / 1_000).toFixed(0)}K`;
  }
  return tokens.toString();
}

/**
 * Format processing time for display
 */
export function formatTime(ms: number): string {
  if (ms >= 60000) {
    return `${(ms / 60000).toFixed(1)}m`;
  }
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${ms}ms`;
}
