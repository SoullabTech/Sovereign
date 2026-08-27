/**
 * Utterance-tail liveness for the CONTINUOUS conversation path.
 *
 * WHY A SECOND CALL SITE, NOT A SECOND WITNESS
 * --------------------------------------------
 * V5 (PR #1099) instruments `lib/hooks/useVoiceInput.ts` — the composer mic
 * behind `ModernTextInput`. This module serves the SAME witness on the other
 * capture path: `components/voice/ContinuousConversation.tsx`.
 *
 * That second path is not optional coverage. `voice_transcribe_result` — the
 * 174 result events in the production trace `r03jxcim` that opened this lane —
 * is emitted only by `ContinuousConversation`. The trace we are trying to
 * explain came from the path V5 does not reach.
 *
 * So this module deliberately reuses V5's EVENT NAMES and FIELD NAMES
 * (`voice_result_interim`, `interimCharCount`, `turnCommitId`, …). One
 * vocabulary across both paths means a trace names the mechanism regardless of
 * which mic produced it. A second vocabulary would have made an analyst decide
 * which family they were reading before they could read anything — the
 * opposite of what a witness is for.
 *
 * THE SIX ORDERINGS (V5's frame, restated because this path must answer the
 * same question):
 *   A. capture actually dies              (covered by micLiveness)
 *   B. recognition ends prematurely
 *   C. interim speech never becomes final
 *   D. the silence timer fires while fresh interim speech exists
 *   E. the turn commits before the trailing result arrives
 *   F. a trailing result arrives AFTER commit and is discarded
 *
 * WHAT MAKES C AND D LIVE HERE
 * ----------------------------
 * In `ContinuousConversation`, only FINAL results are appended to
 * `accumulatedTranscript`. Interim results are forwarded to the UI and
 * discarded. The silence timer is re-armed on EVERY result of either kind, so
 * for it to fire, ~12s must pass with no result at all — and if the last
 * result in that window was an interim the recognizer never finalized, that
 * material is in no buffer and is sent nowhere.
 *
 * That is a plausible mechanism, not a proven one. Nothing here acts on it.
 * `tailAtRisk` is an observation computed from timestamps; no caller branches
 * on it. If the traces establish C or D, the repair is a separate unit on a
 * separate canonical boundary.
 *
 * No transcript content appears here or in anything derived from it — only
 * character counts and elapsed milliseconds. `interimCharCount` says recognized
 * material grew or shrank, never which words were lost.
 */

/** Why the turn-commit path was entered. Mirrors V5's commit framing. */
export type UtteranceSendTrigger =
  | 'silence_timer'   // the silence threshold elapsed with no further results
  | 'vad'             // adaptive VAD judged the utterance naturally complete
  | 'other';          // any other call site (manual submit, teardown, etc.)

export interface TailSnapshotInput {
  /** Current wall-clock ms. */
  now: number;
  /** ms timestamp of the most recent INTERIM result; 0 if none this session. */
  lastInterimAt: number;
  /** ms timestamp of the most recent FINAL result; 0 if none this session. */
  lastFinalAt: number;
  /**
   * Length of the interim material observed since the last final.
   * Reset to 0 when a final arrives (the final is assumed to subsume it).
   */
  lastInterimChars: number;
  /** Length of the accumulated finals — i.e. what would actually be committed. */
  finalChars: number;
}

export interface TailSnapshot {
  /** V5 field name: outstanding interim material at this instant. */
  interimCharCount: number;
  /** V5 field name: committable material at this instant. */
  finalCharCount: number;
  /** ms since the last interim result, or -1 if there has never been one. */
  msSinceLastInterim: number;
  /** ms since the last final result, or -1 if there has never been one. */
  msSinceLastFinal: number;
  /**
   * True when an interim result arrived and NO final has arrived since it.
   * The recognizer previewed something it never committed — ordering C.
   */
  interimOutstanding: boolean;
  /**
   * True when material is outstanding AND non-empty — i.e. committing now
   * leaves observed speech behind. Ordering D at a timer boundary.
   *
   * Observational only. Nothing in the codebase branches on this value.
   */
  tailAtRisk: boolean;
}

function elapsed(now: number, at: number): number {
  if (!at || at <= 0) return -1;
  const delta = now - at;
  return delta < 0 ? 0 : delta;
}

/**
 * Read the tail state at an instant. Pure: same input, same output, no clock
 * access, no side effects.
 */
export function readTailSnapshot(input: TailSnapshotInput): TailSnapshot {
  const { now, lastInterimAt, lastFinalAt } = input;

  const interimCharCount = Math.max(0, input.lastInterimChars || 0);
  const finalCharCount = Math.max(0, input.finalChars || 0);

  // Outstanding means: we saw an interim, and no final has landed after it.
  // A session that has only ever produced interims (lastFinalAt === 0) counts
  // — that is the worst case, not an exempt one.
  const interimOutstanding = lastInterimAt > 0 && lastInterimAt > lastFinalAt;

  return {
    interimCharCount,
    finalCharCount,
    msSinceLastInterim: elapsed(now, lastInterimAt),
    msSinceLastFinal: elapsed(now, lastFinalAt),
    interimOutstanding,
    tailAtRisk: interimOutstanding && interimCharCount > 0,
  };
}

/**
 * Minimum gap between high-frequency telemetry emissions (interim results and
 * timer arming).
 *
 * Interim results arrive at roughly speech rate — the `r03jxcim` session
 * produced 174 result events. Emitting one line per interim would flood
 * `docker logs` and bury the boundary events that matter. The throttle applies
 * to EMISSION only; the underlying timestamps and counts are updated on every
 * result, so the snapshot read at a commit boundary is always exact rather
 * than throttle-quantized.
 */
export const HIGH_FREQUENCY_TELEMETRY_MIN_INTERVAL_MS = 2_000;

/** Whether a throttled telemetry line should be emitted now. */
export function shouldEmitThrottled(
  now: number,
  lastEmitAt: number,
  minIntervalMs: number = HIGH_FREQUENCY_TELEMETRY_MIN_INTERVAL_MS,
): boolean {
  if (!lastEmitAt || lastEmitAt <= 0) return true;
  return now - lastEmitAt >= minIntervalMs;
}

/**
 * How much of a previous epoch's unfinalized tail reappeared at the head of the
 * next epoch's first final.
 *
 * WHY LENGTHS ALONE ARE NOT ENOUGH
 * --------------------------------
 * Comparing `precedingEpochTailChars` against the next final's length only asks
 * "is there enough material here to have contained the tail?" Two unrelated
 * utterances of similar length answer yes. That would let a genuinely LOST tail
 * masquerade as re-delivered and suppress a repair that is actually needed.
 *
 * So we measure the actual suffix→prefix overlap: the longest suffix of the
 * tail that is also a prefix of the new result. High ratio = Safari re-spoke
 * the tail after restart (salvage would double-count it). Near zero = the tail
 * is gone (salvage is justified).
 *
 * PRIVACY
 * -------
 * Both strings stay in memory. This function returns COUNTS ONLY — callers emit
 * `overlapChars` and `overlapRatio`, never the words. The tail text lives in a
 * ref for the duration of one restart seam, the same class of in-memory holding
 * as `accumulatedTranscript`, and is never persisted or logged.
 */
export interface TailOverlap {
  /** Characters of the tail that reappeared at the head of the new result. */
  overlapChars: number;
  /** overlapChars / tail length, 0..1. -1 when there was no tail to compare. */
  overlapRatio: number;
}

/** Lowercase, trim, collapse internal whitespace — recognizers vary on spacing. */
function normalize(text: string): string {
  return (text || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function measureTailOverlap(tail: string, next: string): TailOverlap {
  const a = normalize(tail);
  const b = normalize(next);
  if (!a.length || !b.length) {
    return { overlapChars: 0, overlapRatio: a.length ? 0 : -1 };
  }
  // Longest suffix of `a` that is a prefix of `b`. Tails are short (a phrase),
  // so the straightforward scan is cheaper than building a failure table.
  const max = Math.min(a.length, b.length);
  for (let k = max; k > 0; k--) {
    if (a.slice(a.length - k) === b.slice(0, k)) {
      return { overlapChars: k, overlapRatio: Number((k / a.length).toFixed(3)) };
    }
  }
  return { overlapChars: 0, overlapRatio: 0 };
}
