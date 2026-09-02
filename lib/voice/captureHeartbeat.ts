/**
 * "Is the microphone still hearing me?" — answered from evidence, not from a
 * flag the UI set when it asked for the mic.
 *
 * THE GAP THIS CLOSES
 * -------------------
 * `VoiceInteractionBar` renders `listening` whenever `isListening` is true.
 * That state says the app REQUESTED capture and believes it succeeded. It does
 * not say audio is still arriving. When capture dies underneath — an iOS route
 * change, an interruption that never resolved, a recognition task that stopped
 * and never re-armed — the green dot keeps pulsing and the member keeps
 * talking into a microphone that stopped listening minutes ago. They only find
 * out when nothing comes back.
 *
 * The honest signal is already flowing: both capture paths call
 * `onAudioLevelChange` continuously while audio frames are being delivered (the
 * web analyser loop per animation frame, the native plugin per audio buffer).
 * When those calls STOP, capture has stopped. Not "the member went quiet" —
 * silence still produces frames, at a low level. No frames means no pipeline.
 *
 * So this module answers exactly one question, from one input: how long since
 * the last audio frame. It makes no claim about why, and it must never be used
 * to assert that capture is HEALTHY — a live frame counter says the pipeline is
 * delivering, not that the recognizer is producing text.
 */

/**
 * How long without an audio frame before the microphone is reported as not
 * responding, while the app still believes it is listening.
 *
 * Floor: iOS restarts recognition tasks routinely, and frames pause for the
 * length of that gap. The hands-free re-arm backoff runs 800ms → 1500ms →
 * 2500ms, so anything at or under ~2.5s would flag an ordinary restart as a
 * failure — crying wolf on healthy operation, which is how an indicator earns
 * being ignored.
 *
 * Ceiling: the member is speaking into it. A stall they discover after ten
 * seconds has already cost them a paragraph.
 */
export const CAPTURE_STALL_MS = 3_500;

export interface CaptureHeartbeatInput {
  /** Current wall-clock ms. */
  now: number;
  /** ms timestamp of the most recent audio frame; 0 if none this session. */
  lastFrameAt: number;
  /** Does the app currently believe it is capturing? */
  listening: boolean;
  /**
   * ms timestamp capture was last (re)armed. Frames legitimately lag the arm
   * by a beat while the audio session spins up, and reporting a stall in that
   * window would flag every single start.
   */
  armedAt: number;
}

/**
 * True when the app believes it is listening but audio frames have stopped
 * arriving. False in every other case, INCLUDING "we don't know yet" — an
 * indicator that fires on missing evidence is worse than none.
 */
export function isCaptureStalled(input: CaptureHeartbeatInput): boolean {
  if (!input.listening) return false;

  // Never armed, or armed within the grace window: not yet answerable.
  if (input.armedAt <= 0) return false;
  if (input.now - input.armedAt < CAPTURE_STALL_MS) return false;

  // Armed long enough for frames to have appeared, and none ever did — that is
  // a stall, and the most important one to surface: capture that never started.
  if (input.lastFrameAt <= 0) return true;

  return input.now - input.lastFrameAt >= CAPTURE_STALL_MS;
}
