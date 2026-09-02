/**
 * Who is allowed to end a member's turn, and on what evidence.
 *
 * THE GOVERNING RULE
 * ------------------
 * **Only evidence of MEMBER silence may end the member's turn. Absence of audio
 * because the recognizer is restarting is not silence.**
 *
 * Both native turn-end clocks measure an ABSENCE — 2.5s with no partial words,
 * 1.5s below the audio floor. Neither can tell "the member stopped talking"
 * from "the microphone stopped listening", and on iOS the microphone stops
 * constantly: Apple's per-task audio ceiling, `isFinal` on any pause,
 * `kAFAssistantErrorDomain` faults, the plugin's own cleanup between `start()`
 * calls. Those gaps run 800ms to 2500ms — squarely inside both thresholds.
 *
 * So a clock armed by the last word before a task died kept counting through
 * the gap and committed the turn mid-sentence. Sealing the transcript preserves
 * the WORDS across a restart; this preserves the TURN. Both are needed: keeping
 * every word of a sentence that was cut in half and answered as two is not a
 * repair.
 *
 * WHAT IS DELIBERATELY NOT HERE
 * -----------------------------
 * The 1.5s/2.5s thresholds themselves. How patient MAIA should be with a real
 * human pause is a turn-taking question, not a transport one, and folding it in
 * would leave the device witness unable to separate *"iOS task turnover cut the
 * utterance"* from *"the threshold is too eager for contemplative speech"*.
 * Those are two different findings and they need two different tests.
 *
 * No transcript content passes through this module.
 */

/** What the recognizer's own lifecycle events last reported. */
export type NativeRecognizerStatus = 'started' | 'stopped';

export interface ResumeEvidence {
  /** Is turn-timing currently suspended? */
  suspended: boolean;
  /**
   * The recognizer's confirmed state, from its `listeningState` event — NOT
   * from `start()` having resolved. A resolved promise is not a live mic.
   */
  nativeStatus: NativeRecognizerStatus;
}

/**
 * May turn-timing resume?
 *
 * Two conditions, both required, and the caller supplies the second by only
 * calling this from a real capture event (a partial, or an audio frame):
 * recognition confirmed live AND something actually arriving. Either alone is
 * insufficient — a straggling frame from the task that just died would
 * otherwise lift the suspension inside the very gap it exists to cover.
 */
export function mayResumeSilenceClock(input: ResumeEvidence): boolean {
  return input.suspended && input.nativeStatus === 'started';
}

/** May a turn-end clock be armed right now? */
export function mayArmSilenceClock(input: { suspended: boolean }): boolean {
  return !input.suspended;
}

/**
 * How many times the turn-close may be extended while the member is audibly
 * speaking but recognition has produced nothing. See `shouldDeferTurnClose`.
 */
export const MAX_TURN_CLOSE_DEFERRALS = 4;

export interface TurnCloseInput {
  /** Current wall-clock ms. */
  now: number;
  /** The recognizer's confirmed state. */
  nativeStatus: NativeRecognizerStatus;
  /** ms timestamp of the last audio frame above the speech floor; 0 if none. */
  lastHighAudioAt: number;
  /** How many times this close has already been extended. */
  deferrals: number;
}

/**
 * Window within which recent loud audio still counts as "the member is
 * speaking right now". Matches the existing `hasRecentSpeech` window in the
 * audio-level path so the two agree about what recent means.
 */
export const AUDIBLE_SPEECH_WINDOW_MS = 2_000;

/**
 * Should the fallback turn-close be extended rather than fired?
 *
 * Yes when capture is confirmed live and the member is audibly still speaking:
 * recognition simply has not produced the restarted task's first partial yet,
 * and closing on that lag would end a sentence mid-breath.
 *
 * Bounded, because the opposite failure is worse in a different way: if audio
 * stays live while recognition produces nothing at all, extending forever would
 * hold the member's words hostage to a recognizer that is not working. Past the
 * cap the turn closes and the words go — the recoverable failure. A working
 * recognizer never reaches this path, because its partials cancel the close
 * outright.
 */
export function shouldDeferTurnClose(input: TurnCloseInput): boolean {
  if (input.deferrals >= MAX_TURN_CLOSE_DEFERRALS) return false;
  if (input.nativeStatus !== 'started') return false;
  if (input.lastHighAudioAt <= 0) return false;
  return input.now - input.lastHighAudioAt < AUDIBLE_SPEECH_WINDOW_MS;
}
