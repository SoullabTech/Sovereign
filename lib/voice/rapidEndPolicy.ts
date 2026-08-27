/**
 * VOICE-ABORT-01 — when is a short recognition epoch a loop, and when is it
 * just Tuesday?
 *
 * Production, 2026-08-27. A member's conversation died like this:
 *
 *   MAIA stops speaking
 *     → the mic restarts immediately (correct)
 *     → Chrome invalidates the new instance ~302ms later
 *     → onend fires with an epoch age of 302ms
 *     → "possible infinite abort loop" → capture loss → MicState ERROR
 *
 * One abort. The microphone never came back, and the member kept talking to a
 * system that had stopped listening. The guard was not wrong that rapid ends
 * matter; it was wrong that ONE of them is a loop.
 *
 * Restarting the mic the instant MAIA stops speaking is exactly the condition
 * that produces a benign rapid abort, so the most normal moment in a
 * conversation was the one most likely to end it.
 *
 * The restart guard elsewhere in the same file already encoded the right idea
 * — it tolerates ten rapid restarts before declaring a loop. This policy gives
 * the abort path the same shape, with a tighter threshold because a true abort
 * loop burns instances faster than a restart loop does.
 *
 * Pure and dependency-free so the rule can be tested directly rather than
 * inferred from the shape of a React event handler.
 */

/** An epoch shorter than this ended before it could plausibly do any work. */
export const RAPID_END_WINDOW_MS = 500;

/** Consecutive rapid ends that constitute a genuine loop. Three, not one. */
export const RAPID_END_LOOP_THRESHOLD = 3;

export type RapidEndDecision =
  /** Epoch survived the window. Ordinary end; the run (if any) is broken. */
  | 'not_rapid'
  /** Rapid, but not yet a loop. Recreate the instance and keep listening. */
  | 'recover'
  /** A run of rapid ends. Stop, tell the member, salvage unsent audio. */
  | 'abort_loop';

export interface RapidEndInput {
  /** How long the recognition epoch lasted, in ms. */
  epochAgeMs: number;
  /** Consecutive rapid ends seen BEFORE this one. */
  consecutiveRapidEnds: number;
}

export interface RapidEndOutcome {
  decision: RapidEndDecision;
  /** The counter to carry forward. Callers must store this, not increment themselves. */
  nextCount: number;
}

/**
 * Classify one recognition end.
 *
 * A surviving epoch resets the run: whatever caused an earlier rapid end did
 * not persist, and without the reset unrelated aborts minutes apart would
 * accumulate into a loop that never happened.
 */
export function classifyRecognitionEnd({
  epochAgeMs,
  consecutiveRapidEnds,
}: RapidEndInput): RapidEndOutcome {
  if (epochAgeMs >= RAPID_END_WINDOW_MS) {
    return { decision: 'not_rapid', nextCount: 0 };
  }

  const nextCount = consecutiveRapidEnds + 1;
  return {
    decision: nextCount >= RAPID_END_LOOP_THRESHOLD ? 'abort_loop' : 'recover',
    nextCount,
  };
}
