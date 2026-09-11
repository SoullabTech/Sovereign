/**
 * TURN ACCUMULATOR — turn-close authority off the recognizer boundary.
 *
 * IOS-CONVERSATION-RUNTIME-01 · Repair Two (founder-authorized 2026-09-11,
 * lane doc E19). Witnessed defect (E16.1): the native recognizer delivered a
 * 537-character partial, then — inside the same task, with no stop event —
 * its next partial was `And`. The web layer replaced its buffer with each
 * partial, so everything before `And` was discarded and only the tail was
 * sent. The member's turn was closed by the recognizer's segmenting, not by
 * the member's pause.
 *
 * This module holds the turn as `committed` segments plus the `live` partial.
 * A partial that no longer contains the start of the previous one is treated
 * as a new segment: the previous live text is committed, not thrown away.
 * Pure functions, no timers, no I/O — the silence timers in
 * `ContinuousConversation.tsx` remain the ONLY turn-close authority and their
 * values are untouched.
 *
 * What this does NOT claim (E19 boundary): nothing here touches the
 * post-TTS restart storm, the alternating route configuration, or the
 * post-conflict digital-zero input. Those are a separate defect.
 */

export interface TurnAccumulatorState {
  /** Segments the recognizer has moved past; never rewritten by later partials. */
  readonly committed: readonly string[];
  /** The recognizer's current partial for the current segment. */
  readonly live: string;
}

export function emptyTurnAccumulator(): TurnAccumulatorState {
  return { committed: [], live: '' };
}

function words(s: string): string[] {
  return s.trim().split(/\s+/).filter(Boolean);
}

/**
 * A recognizer revision keeps the leading words and stays roughly the same
 * length (it may drop or change a trailing word). A segment reset drops most
 * of the text and starts from a different word. The rule is deliberately
 * conservative: it only fires when the new partial is at most half the
 * previous one's word count AND its first word differs, so an ordinary
 * shortening revision ("so that that's" → "so that's") is never a reset.
 */
export function isSegmentReset(prev: string, next: string): boolean {
  const p = words(prev);
  const n = words(next);
  if (p.length < 3 || n.length === 0) return false;
  if (n.length * 2 > p.length) return false;
  return p[0].toLowerCase() !== n[0].toLowerCase();
}

/** Fold one recognizer partial into the turn. Returns a new state; never mutates. */
export function acceptPartial(state: TurnAccumulatorState, partial: string): TurnAccumulatorState {
  const next = partial.trim();
  if (!next) return state;
  if (isSegmentReset(state.live, next)) {
    return { committed: [...state.committed, state.live.trim()], live: next };
  }
  return { committed: state.committed, live: next };
}

/** The member's turn as it stands: every committed segment, then the live one. */
export function composeTurnText(state: TurnAccumulatorState): string {
  return [...state.committed, state.live]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(' ');
}
