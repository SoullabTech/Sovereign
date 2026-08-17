/**
 * Utterance submission guard — the single admission boundary for spoken turns.
 *
 * WHY THIS EXISTS
 * ---------------
 * `ContinuousConversation.tsx` has five independent paths that can submit an
 * accumulated transcript:
 *
 *   1. web SpeechRecognition silence timer  -> processAccumulatedTranscript()
 *   2. native partialResults 2500ms silence timeout
 *   3. native audioLevel 1500ms silence timeout
 *   4. native `listeningState: stopped`
 *   5. manual stopListening()
 *
 * Only path 1 consulted the old `lastSentRef` dedup, and only path 1 updated
 * it. Paths 2-5 called `onTranscript` directly, so the dedup was structurally
 * blind to them: it could neither see nor record a native submission. The
 * 2000ms window was never the problem — the guard was not on those paths at
 * all. Widening the window would not have fixed it.
 *
 * THE RACE THIS CLOSES
 * --------------------
 * A silence timeout submits and calls stop(). Before the `stopped` event
 * arrives, iOS SFSpeechRecognizer emits one more partial carrying the same
 * hypothesis, which re-populates the accumulation buffer. The `stopped`
 * handler then finds a non-empty buffer and submits the same words a second
 * time. Same utterance, two sends, no concurrency — which is why a
 * same-tick/concurrency latch never caught it.
 *
 * THE GUARD IS SEMANTIC, NOT A TIMEOUT
 * ------------------------------------
 * Admission is keyed to utterance lifecycle rather than elapsed time:
 *
 *   - submitting an utterance CONSUMES it (disarms)
 *   - a fresh recognition session (`listeningState: started`) ARMS the next one
 *   - speech content that differs from what was already sent ARMS the next one
 *
 * So a trailing echo of text we already sent is refused, while a person saying
 * the same sentence again later is admitted — because a restart or new speech
 * content re-arms in between. A time window cannot make that distinction; this
 * is the reason the guard is not one.
 */

export type SubmissionDecision =
  | { admitted: true }
  | { admitted: false; reason: 'empty' | 'duplicate_utterance' };

export interface UtteranceGuardState {
  /** Normalized text of the most recently admitted submission. */
  lastAdmitted: string;
  /** Whether a new utterance may currently be admitted. */
  armed: boolean;
}

/**
 * Normalization used for identity comparison.
 *
 * Case, whitespace AND terminal punctuation are all discarded, because iOS
 * revises its final hypothesis as recognition winds down: the same sentence is
 * emitted first as a bare partial and then re-emitted capitalized and
 * punctuated. "what is alive" and "What is alive?" are one utterance, and any
 * comparison that treats them as two will let the duplicate through.
 */
export function normalizeUtterance(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"“”‘’…]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when two transcripts are the same utterance under normalization. */
export function isSameUtterance(a: string, b: string): boolean {
  const na = normalizeUtterance(a);
  return na.length > 0 && na === normalizeUtterance(b);
}

export function createUtteranceGuardState(): UtteranceGuardState {
  return { lastAdmitted: '', armed: true };
}

/**
 * A genuinely new utterance may begin — called on authoritative native
 * `listeningState: started`, and on web SpeechRecognition `onstart`.
 *
 * This is the signal that makes repeating the same sentence possible: the
 * recognizer opened a new session, so identical words are a new turn rather
 * than an echo of the turn we just sent.
 */
export function beginUtterance(state: UtteranceGuardState): void {
  state.armed = true;
}

/**
 * Speech content observed from the recognizer (partial or final).
 *
 * Arms only when the content differs from what was last admitted. A trailing
 * partial that merely repeats the submitted hypothesis must NOT arm — that
 * repetition is precisely the echo this guard exists to refuse.
 */
export function noteSpeechContent(state: UtteranceGuardState, text: string): void {
  const normalized = normalizeUtterance(text);
  if (!normalized) return;
  if (normalized !== state.lastAdmitted) {
    state.armed = true;
  }
}

/**
 * The admission decision. Every utterance submission path must call this and
 * submit only when `admitted` is true.
 */
export function trySubmitUtterance(
  state: UtteranceGuardState,
  text: string
): SubmissionDecision {
  const normalized = normalizeUtterance(text);

  if (!normalized) {
    return { admitted: false, reason: 'empty' };
  }

  if (!state.armed && normalized === state.lastAdmitted) {
    return { admitted: false, reason: 'duplicate_utterance' };
  }

  state.lastAdmitted = normalized;
  state.armed = false;
  return { admitted: true };
}
