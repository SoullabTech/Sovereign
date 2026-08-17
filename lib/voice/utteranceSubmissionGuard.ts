/**
 * Utterance identity — the admission boundary for spoken turns.
 *
 * WHY IDENTITY AND NOT TEXT
 * -------------------------
 * The obvious repair for the production double-send was to compare transcripts
 * more leniently: iOS re-emits its final hypothesis capitalized and punctuated
 * ("what is alive" → "What is alive?"), so an exact compare let the second copy
 * through. Normalizing the comparison does close that hole — and opens a worse
 * one. A member who deliberately says the same sentence twice is authoring two
 * turns, and any text-plus-time window silently discards the second. A guard
 * that drops real speech is a worse failure than the duplicate it prevents,
 * because it is invisible to the only person who could correct it.
 *
 * So identity is the LISTENING EPISODE, not the words:
 *
 *   listening begins        → mint utterance id A
 *   "what is alive"         ─┐
 *   "What is alive"          ├─ all carry A → exactly one submission
 *   "What is alive?"        ─┘
 *   listening begins again  → mint utterance id B
 *   "What is alive?"         → carries B → a legitimate second turn
 *
 * Every recognition callback inside one episode reuses that episode's id, so
 * revisions collapse and repeats survive. The id then travels with the turn as
 * the exchange id, which makes the database's existing
 * UNIQUE (exchange_id, seq) constraint the real second line of defence rather
 * than the inert one it has been. Text plays no part in the decision.
 */

export type SubmissionRefusal = 'empty' | 'utterance_already_submitted';

export type SubmissionDecision =
  | { admitted: true; utteranceId: string }
  | { admitted: false; reason: SubmissionRefusal };

export interface UtteranceGuardState {
  /** Id of the listening episode currently in progress, if any. */
  currentUtteranceId: string | null;
  /** Id of the episode already submitted, so a second attempt is refused. */
  submittedUtteranceId: string | null;
}

export function createUtteranceGuardState(): UtteranceGuardState {
  return { currentUtteranceId: null, submittedUtteranceId: null };
}

export function mintUtteranceId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `utt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * A new listening episode has begun — called on the authoritative native
 * `listeningState: started`, and on web SpeechRecognition `onstart` for a
 * genuinely new turn (NOT for a continuation restart, which is the same
 * utterance continuing mid-sentence on iOS Safari).
 *
 * Returns the id so callers can log or thread it.
 */
export function beginUtterance(state: UtteranceGuardState, id?: string): string {
  const next = id ?? mintUtteranceId();
  state.currentUtteranceId = next;
  return next;
}

/**
 * The admission decision. Refuses a second submission of the SAME episode
 * regardless of how the transcript was worded or how much time passed; admits
 * any new episode regardless of whether the words are identical.
 */
export function trySubmitUtterance(
  state: UtteranceGuardState,
  text: string
): SubmissionDecision {
  if (!text || !text.trim()) {
    return { admitted: false, reason: 'empty' };
  }

  // Defensive: a transcript arriving with no episode open (e.g. a path that
  // submits before any `started` was observed) still gets an identity, so it
  // can be deduplicated downstream rather than travelling anonymously.
  if (!state.currentUtteranceId) {
    state.currentUtteranceId = mintUtteranceId();
  }

  if (state.submittedUtteranceId === state.currentUtteranceId) {
    return { admitted: false, reason: 'utterance_already_submitted' };
  }

  state.submittedUtteranceId = state.currentUtteranceId;
  return { admitted: true, utteranceId: state.currentUtteranceId };
}
