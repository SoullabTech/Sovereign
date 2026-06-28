/**
 * Race a promise against a timeout. Rejects with a labeled Error on timeout
 * so failures name themselves in logs (e.g., "CapacitorHttp POST /x timed out after 30000ms")
 * instead of stalling the caller indefinitely.
 *
 * Used at native bridge boundaries (CapacitorHttp, AudioContext, SSE/streaming
 * fetches) to ensure a silently-stalled platform layer can never trap the UI
 * in "thinking" forever. Always rejects on timeout so the caller's catch/finally
 * runs and UI state releases.
 *
 * Note: A local copy of this helper currently exists in
 * components/OracleConversation.tsx. Deduplication is a separate concern from
 * the timeout-hardening cut; do not collapse them here.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = 'operation'
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
