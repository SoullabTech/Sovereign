/**
 * Pure transcript-accumulation contract for continuous voice mode.
 *
 * Extracted from `components/voice/ContinuousConversation.tsx` (web/Web Speech
 * path only) so the "hearing half" regression can be locked in WITHOUT a live
 * SpeechRecognition harness. The component builds its recognition object inside
 * a closure and is heavily coupled to Capacitor + the VoiceFeedbackPrevention
 * singleton, so the decision logic is hoisted here where it can be exercised as
 * plain data.
 *
 * THE BUG (iOS Safari PWA, reported 2026-06-05, Andrea tester):
 *   On iOS Safari `recognition.continuous = true` is effectively IGNORED, so the
 *   browser fires `onend` after every phrase. To stay listening within the SAME
 *   user turn the component auto-restarts recognition — but the restart's
 *   `onstart` used to unconditionally run `accumulatedTranscript = ""`, wiping
 *   the first half of the sentence. The user was "only heard half."
 *
 * THE FIX (the contract these helpers encode):
 *   A `continuationRestartRef` flag is set true in the `onend` auto-restart
 *   success branch, immediately before `.start()`. The next `onstart` CONSUMES
 *   the flag and PRESERVES the buffer (continuation = same turn). A genuinely new
 *   turn (no pending continuation) still wipes. `processAccumulatedTranscript`
 *   (turn submitted) and `stopListening` (manual stop) clear buffer + flag.
 *
 * `appendFinal` and `shouldPreserveTranscriptOnStart` are imported directly by
 * the component, so a regression in either breaks the component AND these tests.
 * `transcriptTurnReducer` composes those same leaves into a faithful model of the
 * buffer/flag lifecycle for sequence-level assertions.
 */

/**
 * `onresult`: accumulate a final transcript across recognition restarts within
 * one turn. Mirrors the component's
 *   `if (accumulated) accumulated += ' ' + final.trim(); else accumulated = final.trim();`
 * block exactly — truthiness guard on the existing buffer, single-space join,
 * trim on the incoming final.
 */
export function appendFinal(accumulated: string, finalText: string): string {
  const finalTrimmed = finalText.trim();
  return accumulated ? `${accumulated} ${finalTrimmed}` : finalTrimmed;
}

/**
 * `onstart`: decide whether to PRESERVE the accumulated buffer rather than wipe
 * it. True ONLY when this start was triggered by the `onend` auto-restart of the
 * same turn (a continuation). A genuinely new turn returns false → the caller
 * wipes the buffer. This is the single line that fixes "hearing half."
 */
export function shouldPreserveTranscriptOnStart(continuationPending: boolean): boolean {
  return continuationPending === true;
}

/** Buffer + flag state for one continuous-mode turn. */
export interface TurnState {
  /** Finals accumulated so far this turn. */
  accumulated: string;
  /**
   * True when an `onend` auto-restart is pending and the NEXT start must preserve
   * the buffer instead of wiping it (iOS Safari fires `onend` mid-utterance).
   */
  continuationPending: boolean;
}

export type TurnEvent =
  /** `recognition.onstart` — fresh turn unless a continuation is pending. */
  | { type: 'start' }
  /** `recognition.onresult` with `isFinal` — a final phrase arrived. */
  | { type: 'final'; text: string }
  /** `onend` auto-restart success branch — marks the upcoming start as a continuation. */
  | { type: 'restart' }
  /** `processAccumulatedTranscript` — the turn was sent to the parent. */
  | { type: 'submit' }
  /** `stopListening` — user/manual stop ended the turn. */
  | { type: 'stop' };

export const initialTurnState: TurnState = Object.freeze({
  accumulated: '',
  continuationPending: false,
});

/**
 * Faithful model of the buffer/flag lifecycle in ContinuousConversation.tsx
 * (web path). Built on the SAME leaves the component uses, so a divergence here
 * is a real divergence there.
 *
 * Lifecycle mirror:
 *  - `start`   → onstart: preserve on continuation (consuming the flag), else wipe.
 *  - `final`   → onresult: appendFinal into the buffer.
 *  - `restart` → onend auto-restart: set continuationPending so the next start preserves.
 *  - `submit`  → processAccumulatedTranscript: buffer cleared, flag reset.
 *  - `stop`    → stopListening: buffer cleared, flag reset (belt-and-suspenders).
 */
export function transcriptTurnReducer(state: TurnState, event: TurnEvent): TurnState {
  switch (event.type) {
    case 'start':
      return shouldPreserveTranscriptOnStart(state.continuationPending)
        ? { accumulated: state.accumulated, continuationPending: false }
        : { accumulated: '', continuationPending: false };
    case 'final':
      return { ...state, accumulated: appendFinal(state.accumulated, event.text) };
    case 'restart':
      return { ...state, continuationPending: true };
    case 'submit':
    case 'stop':
      return { accumulated: '', continuationPending: false };
    default:
      return state;
  }
}

/** Fold a sequence of events over `initialTurnState` (or a supplied seed). */
export function runTurnEvents(events: TurnEvent[], seed: TurnState = initialTurnState): TurnState {
  return events.reduce(transcriptTurnReducer, seed);
}
