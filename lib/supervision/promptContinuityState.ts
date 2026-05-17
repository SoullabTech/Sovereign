/**
 * lib/supervision/promptContinuityState.ts
 *
 * Phase A.2 — continuity-state reset (2026-05-16, widened 2026-05-17).
 *
 * Per-session one-shot flag: "skip Whisper previousTail prompt for the
 * next chunk." Set when a chunk represents an absence of new participation
 * — either silence-hallucination OR whisper-no-text. Consumed exactly once
 * on the next chunk arrival.
 *
 * Rationale (Kelly, 2026-05-16): silence resets conversational continuity.
 * `getLastChunkTail` is a pure DB read with no awareness of intervening
 * silence; this in-memory layer adds that awareness without a migration.
 *
 * Architecture (matches segmentGate.ts):
 *   Module-scope Set keyed by sessionId. Process restart loses flags,
 *   which is fine: at worst one extra chunk gets the prior tail, and the
 *   next continuity-break event re-arms the flag immediately.
 *
 * Scope (Phase A.2 QA, 2026-05-17 — widened based on telemetry):
 *   - silence-hallucination: set flag.
 *   - whisper-no-text: set flag.
 *   Both events signal absence of new participation, and should reset the
 *   prompt continuity. Telemetry from session f35719bf (sentence 5→6
 *   transition) showed prompt-continuity bleed when only whisper-no-text
 *   chunks intervened between two real utterances: previousTail
 *   "...sentence number five..." biased Whisper to transcribe a spoken
 *   "question" as "sentence" on the next real chunk.
 *
 * Telemetry: existing `whisperPromptUsed` field in the gate telemetry log
 * is sufficient to verify post-patch behavior. Expected shape after a
 * continuity-break rejection:
 *   chunk N    → silence-hallucination or whisper-no-text, promptUsed: true
 *   chunk N+1  → real speech,                              promptUsed: false  (flag consumed)
 *   chunk N+2  → real speech,                              promptUsed: true   (continuity resumed)
 */

const sessionsToSkipPrompt = new Set<string>();

/**
 * Mark this session to skip the Whisper previousTail prompt on the NEXT
 * chunk. Called when a chunk represents absence of new participation —
 * silence-hallucination rejection OR whisper-no-text.
 */
export function markContinuityBreak(sessionId: string): void {
  sessionsToSkipPrompt.add(sessionId);
}

/**
 * Read-and-consume the skip-prompt flag for this session.
 *
 * Returns true exactly once after each `markContinuityBreak`, then
 * false until the next mark. One-shot semantics: the flag exists only to
 * reset continuity across a single silence/no-text boundary.
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
