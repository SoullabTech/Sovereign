/**
 * Trace ID generation for request correlation.
 *
 * Every oracle request gets a unique trace ID that propagates
 * through memory retrieval, LLM calls, and storage — so any
 * log line can be tied back to its originating request.
 */

export function generateTraceId(): string {
  return `maia_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
}
