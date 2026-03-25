/**
 * MEMORY TOOL METRICS — A/B telemetry for memory tool pilot
 *
 * Logs structured JSON for both paths (direct-injection vs memory-tool)
 * so we can compare token cost, latency, and retrieval behavior.
 *
 * Go/No-Go criteria (after 48h):
 * - GO:       read rate > 50%, token delta net negative, latency p50 < +500ms
 * - ROLLBACK: read rate < 30%, latency p50 > +1s, fallback injection > 70%
 * - HOLD:     mixed metrics — keep running, do not expand
 */

export interface MemoryToolMetrics {
  tag: 'memory-tool-pilot';
  memberId: string;
  path: 'memory-tool' | 'direct-injection';

  // Memory tool specific
  toolRounds?: number;
  memoryPathsRead?: string[];
  fallbackInjected?: boolean;

  // Availability
  wisdomAvailable: boolean;
  councilAvailable: boolean;

  // Token accounting
  totalInputTokens?: number;
  totalOutputTokens?: number;

  // Comparison baseline (chars that direct-injection would have added to system prompt)
  directInjectionChars: number;

  // Latency
  latencyMs: number;
}

/**
 * Log memory tool pilot metrics as structured JSON.
 * Both paths (memory-tool and direct-injection) log here for A/B comparison.
 */
export function logMemoryToolMetrics(metrics: MemoryToolMetrics): void {
  console.log(JSON.stringify(metrics));
}

/**
 * Build a one-line summary from full wisdom/council text.
 * Used for the determinism fallback when Claude skips memory reads.
 * Returns first sentence (up to 200 chars) or empty string.
 */
export function buildOneLiner(text: string | null | undefined): string {
  if (!text || text.trim().length === 0) return '';
  // Strip section markers
  const clean = text
    .replace(/\[.*?\]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  // First sentence or first 200 chars
  const firstSentence = clean.match(/^[^.!?]+[.!?]/);
  if (firstSentence && firstSentence[0].length <= 200) {
    return firstSentence[0].trim();
  }
  return clean.slice(0, 200).trim() + '...';
}
