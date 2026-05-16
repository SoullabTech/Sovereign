/**
 * lib/supervision/promptContinuityState.ts
 *
 * Phase A.2 — continuity-state reset (2026-05-16).
 *
 * Per-session one-shot flag: "skip Whisper previousTail prompt for the
 * next chunk." Set when a chunk is rejected as silence-hallucination.
 * Consumed exactly once on the next chunk arrival.
 *
 * Rationale (Kelly, 2026-05-16): silence resets conversational continuity.
 * `getLastChunkTail` is a pure DB read with no awareness of intervening
 * silence; this in-memory layer adds that awareness without a migration.
 *
 * Architecture (matches segmentGate.ts):
 *   Module-scope Set keyed by sessionId. Process restart loses flags,
 *   which is fine: at worst one extra chunk gets the prior tail, and the
 *   next silence-hallucination event re-arms the flag immediately.
 *
 * Scope (Kelly, 2026-05-16):
 *   - silence-hallucination only (narrow).
 *   - whisper-no-text is NOT marked, pending evidence of fragmentation
 *     after no-text chunks. Widen deliberately based on telemetry, not
 *     by default.
 *
 * Telemetry: existing `whisperPromptUsed` field in the gate telemetry log
 * is sufficient to verify post-patch behavior. Expected shape after a
 * silence-hallucination rejection:
 *   chunk N    → silence-hallucination, whisperPromptUsed: true   (this chunk)
 *   chunk N+1  → real speech,           whisperPromptUsed: false  (flag consumed)
 *   chunk N+2  → real speech,           whisperPromptUsed: true   (continuity resumed)
 */

const sessionsToSkipPrompt = new Set<string>();

/**
 * Mark this session to skip the Whisper previousTail prompt on the NEXT
 * chunk. Called from the silence-hallucination branch of the transcript
 * stream handler.
 */
export function markSilenceHallucination(sessionId: string): void {
  sessionsToSkipPrompt.add(sessionId);
}

/**
 * Read-and-consume the skip-prompt flag for this session.
 *
 * Returns true exactly once after each `markSilenceHallucination`, then
 * false until the next mark. One-shot semantics: the flag exists only to
 * reset continuity across a single silence boundary.
 */
export function consumeSkipPromptFlag(sessionId: string): boolean {
  return sessionsToSkipPrompt.delete(sessionId);
}

/** Test/diagnostic helper — never use in request paths. */
export function _peekSkipPromptFlag(sessionId: string): boolean {
  return sessionsToSkipPrompt.has(sessionId);
}

/** Test helper — clears all flags. */
export function _resetAllSkipPromptFlags(): void {
  sessionsToSkipPrompt.clear();
}
