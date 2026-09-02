/**
 * Segment-aware accumulation for iOS native `partialResults`.
 *
 * THE DEFECT THIS EXISTS TO CLOSE
 * -------------------------------
 * The patched `@capacitor-community/speech-recognition` plugin emits
 * `partialResults` carrying `result.bestTranscription.formattedString` — the
 * full text of the CURRENT `SFSpeechRecognitionTask`, and nothing older.
 *
 * `ContinuousConversation` consumed that with a straight assignment:
 *
 *     accumulatedTranscript.current = transcript;   // REPLACE
 *
 * That is correct only while one recognition task runs for the whole utterance.
 * It does not. iOS ends and re-opens recognition tasks constantly — Apple's
 * per-task audio ceiling, `isFinal` on a pause, a `kAFAssistantErrorDomain`
 * fault, the plugin's own `cleanup()` between `start()` calls — and each new
 * task's partials begin at the empty string. The assignment then overwrote
 * every word spoken before the boundary with the few words spoken after it.
 *
 * From the member's chair that is exactly the reported symptom: MAIA "takes a
 * third of what I said and starts over from there", answering only the tail,
 * with no sign that anything was dropped. It worsens through a long session
 * because task turnover accelerates as the recognizer is pushed.
 *
 * WHY THE FIX LIVES HERE AND NOT IN SWIFT
 * ---------------------------------------
 * Segmentation is iOS's prerogative, not a bug to suppress. Fighting it in the
 * plugin means holding recognizer state across restarts in a layer that gets
 * torn down on every audio interruption. The durable repair is to stop assuming
 * partials are monotonic across the whole utterance and make the JS side
 * segment-aware: a boundary becomes a JOIN, never a RESET.
 *
 * WHAT THIS MODULE PROMISES
 * -------------------------
 * Precisely: once iOS has recognized words and handed them to us as a partial,
 * a later recognizer restart cannot delete them. It does not promise that no
 * spoken thought is captured — audio the recognizer never turned into text was
 * never in our custody (same boundary `conversationContinuityBuffer` names).
 *
 * TWO AUTHORITIES, DELIBERATELY SEPARATE
 * --------------------------------------
 *  1. `sealSegment` — called when the caller KNOWS a recognition task ended
 *     (`listeningState: stopped`, or before arming a new `start()`). This is
 *     evidence, not inference, and it is the primary mechanism.
 *  2. The prefix heuristic in `applyPartial` — a secondary net for the resets
 *     that happen WITHIN a task, where no lifecycle event is emitted at all.
 *
 * The heuristic is deliberately asymmetric. A false boundary costs a slightly
 * clumsy join in text the member can still read and edit. A false continuation
 * costs the member their words with no trace. We bias toward keeping speech.
 *
 * PRIVACY: this module holds recognized text in memory for the duration of one
 * utterance. It performs no I/O, logs nothing, and persists nothing. Callers
 * that log must log lengths, never content.
 */

/** Accumulator state for a single in-progress utterance. */
export interface NativePartialState {
  /** Text from recognition segments already sealed in this utterance. */
  committed: string;
  /** Live partial for the segment the recognizer is currently producing. */
  segment: string;
}

/** Outcome of folding one partial into the accumulator. */
export interface NativePartialResult {
  /** The next accumulator state. Never the same object as the input. */
  state: NativePartialState;
  /** Full utterance text so far — what the caller should display and dispatch. */
  text: string;
  /**
   * True when this partial was judged to start a NEW recognition segment, i.e.
   * the previous segment was sealed rather than replaced. Observation for
   * telemetry; no behavior in this module branches on it.
   */
  boundary: boolean;
}

/**
 * Below this length a segment carries too little signal for the prefix test to
 * mean anything — "I" vs "Uh" share no prefix but are not a boundary worth
 * committing. Treat such a segment as still forming and let it be replaced.
 */
const MIN_SEGMENT_CHARS_FOR_BOUNDARY = 3;

/** Whitespace-normalized, case-folded words. Punctuation is left intact: iOS
 *  revises punctuation freely, so it is stripped only for comparison. */
function words(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Count of leading words shared by two texts. */
function commonPrefixWordCount(a: string[], b: string[]): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i++;
  return i;
}

/** A fresh, empty accumulator. */
export function createNativePartialState(): NativePartialState {
  return { committed: '', segment: '' };
}

/** The full utterance text represented by a state. */
export function joinNativeTranscript(state: NativePartialState): string {
  if (!state.committed) return state.segment.trim();
  if (!state.segment) return state.committed.trim();
  return `${state.committed.trim()} ${state.segment.trim()}`.trim();
}

/**
 * Seal the live segment into the committed body.
 *
 * Call this at every point where the caller has EVIDENCE that the recognition
 * task ended — `listeningState: stopped`, and immediately before arming a new
 * `SpeechRecognition.start()`. After sealing, the next partial cannot overwrite
 * anything spoken before it, whatever words it happens to open with.
 *
 * Idempotent: sealing an already-sealed state is a no-op, and a segment that is
 * already the tail of `committed` is not appended twice (the plugin can replay
 * a final partial across the stop boundary).
 */
export function sealNativeSegment(state: NativePartialState): NativePartialState {
  const segment = state.segment.trim();
  if (!segment) return { committed: state.committed, segment: '' };

  const committed = state.committed.trim();
  if (!committed) return { committed: segment, segment: '' };

  // Replay guard: iOS may hand the same text back as the last partial of the
  // old task and the first partial of the new one.
  if (committed === segment || committed.endsWith(segment)) {
    return { committed, segment: '' };
  }

  return { committed: `${committed} ${segment}`, segment: '' };
}

/**
 * Fold one raw `partialResults` transcript into the accumulator.
 *
 * `next` is the recognizer's full text for the CURRENT task — not a delta.
 *
 * Continuation (the common case): `next` extends or revises the live segment,
 * evidenced by a shared leading word. The segment is replaced by `next`, so the
 * recognizer keeps full authority to revise its own segment.
 *
 * Boundary: `next` shares no leading word with a segment substantial enough for
 * that to mean something. The recognizer restarted without telling us; seal the
 * old segment and open a new one on `next`.
 */
export function applyNativePartial(
  state: NativePartialState,
  next: string
): NativePartialResult {
  const incoming = next.trim();

  // An empty partial says nothing; it is not evidence of a boundary and must
  // never clear held text.
  if (!incoming) {
    const held = { committed: state.committed, segment: state.segment };
    return { state: held, text: joinNativeTranscript(held), boundary: false };
  }

  const segment = state.segment.trim();

  if (segment.length < MIN_SEGMENT_CHARS_FOR_BOUNDARY) {
    const grown = { committed: state.committed, segment: incoming };
    return { state: grown, text: joinNativeTranscript(grown), boundary: false };
  }

  const shared = commonPrefixWordCount(words(segment), words(incoming));
  if (shared > 0) {
    const grown = { committed: state.committed, segment: incoming };
    return { state: grown, text: joinNativeTranscript(grown), boundary: false };
  }

  const sealed = sealNativeSegment(state);
  const opened = { committed: sealed.committed, segment: incoming };
  return { state: opened, text: joinNativeTranscript(opened), boundary: true };
}
