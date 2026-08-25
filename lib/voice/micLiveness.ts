/**
 * Microphone capture liveness — detecting the silent death of voice input.
 *
 * WHY THIS EXISTS
 * ---------------
 * `webSpeechLifecycle.ts` fixes the case where recognition *tells us* it
 * failed (onerror/onend) — we discard the object and rebuild. This module
 * covers the failure that says nothing at all:
 *
 *   The mic button still reads "Listening". MAIA is still on screen. But the
 *   capture path died minutes ago, and neither the member nor MAIA was told.
 *
 * Observed in the field (Johnny, macOS Safari, 2026-08-25): a five-to-ten
 * minute voice conversation ends without an event. No error, no state change,
 * no transcript. The member keeps speaking into a dead mic, discovers it by
 * *noticing the screen*, and everything said in the interval is gone.
 *
 * There are three distinct mechanisms, and only the first was handled before:
 *
 *  1. RECOGNITION SAID SO — onerror / onend fired. Handled by
 *     `webSpeechLifecycle.ts`.
 *
 *  2. RECOGNITION WENT QUIET — the instance is nominally alive (onstart fired,
 *     no onend, no onerror) but no audio or result event has arrived for a long
 *     time. This is the zombie described in `webSpeechLifecycle.ts`, seen from
 *     the outside: nothing to react to, only an absence to measure. Only a
 *     watchdog can see it.
 *
 *  3. THE TRACK WAS TAKEN — another application (Zoom is the reproducible
 *     case), an OS input switch, or a hardware change takes the audio input.
 *     The `MediaStreamTrack` goes `muted` or `ended`. Critically, this fires NO
 *     `devicechange` event: the device list did not change, the track simply
 *     stopped delivering audio. The recognition object notices nothing, so
 *     path 1 never triggers, and the member is left talking to a corpse.
 *
 * DESIGN POSITION
 * ---------------
 * Another application interrupting the microphone is legitimate — Zoom is
 * allowed to take the mic. What is NOT legitimate is MAIA failing to notice.
 * A trigger outside our control does not make the silence outside our
 * responsibility. Every one of these paths must resolve to the same three
 * guarantees, which this module exists to make computable:
 *
 *   - DETECT within seconds, not minutes.
 *   - TELL the member plainly, in the surface they are looking at.
 *   - PRESERVE what was already transcribed. Nothing spoken is discarded
 *     because the capture layer failed.
 *
 * Pure and framework-agnostic (no React, no DOM, no Capacitor) so the decision
 * logic is unit-testable in isolation from timers and component state.
 *
 * SCOPE: the web (`webkitSpeechRecognition`) path. The native Capacitor speech
 * path has its own ARMING watchdog and is unaffected.
 */

/**
 * How long the capture path may produce NO event of any kind — no `onstart`,
 * `onaudiostart`, `onspeechstart`, or `onresult` — while the UI claims to be
 * listening, before we call it dead.
 *
 * Calibration: a healthy Web Speech session emits `onaudiostart` within
 * milliseconds of `onstart`, and even during a completely silent stretch the
 * browser's own ~5-8s no-speech timeout produces an onend→restart→onstart
 * cycle that re-stamps activity. Fifteen seconds of true silence across every
 * event channel is not a quiet member; it is a broken pipeline.
 */
export const CAPTURE_SILENT_DEATH_MS = 15_000;

/** Heartbeat tick. Detection latency budget is ≤2s, so we sample every second. */
export const CAPTURE_HEARTBEAT_MS = 1_000;

/**
 * After `onstart` confirms the instance is live, `onaudiostart` should follow
 * almost immediately. If audio never opens, the instance is stillborn — the
 * mic button lit up over nothing. Shorter than the general window because this
 * is a definite, fast-detectable failure rather than a fade.
 */
export const CAPTURE_ARMING_SILENT_MS = 5_000;

/**
 * A `mute` on the audio track is not instantly fatal — browsers emit brief,
 * self-correcting mutes around device negotiation. A mute that persists past
 * this window is another process holding the input (the Zoom case).
 */
export const TRACK_MUTE_GRACE_MS = 1_500;

/** Why capture stopped. Drives both the member-facing wording and telemetry. */
export type CaptureLossCause =
  /** No event of any kind for CAPTURE_SILENT_DEATH_MS. The zombie. */
  | 'silent_death'
  /** onstart fired but audio never opened. */
  | 'never_armed'
  /** The audio track ended — device removed, or stream torn down under us. */
  | 'track_ended'
  /** The audio track went muted and stayed muted — another app holds the mic. */
  | 'track_muted'
  /** Recognition restart loop tripped its ceiling. */
  | 'restart_loop'
  /** Recognition kept aborting immediately after start. */
  | 'abort_loop'
  /** No speech and no MAIA audio for long enough that we stood down. */
  | 'inactivity'
  /** The AudioContext left `running` — Safari reports `interrupted` here. */
  | 'audio_context_interrupted'
  /** Input device list changed underneath a live session. */
  | 'device_changed'
  /** Microphone permission was revoked mid-session. */
  | 'permission_lost';

/**
 * Canonical reason codes for telemetry and bug reports.
 *
 * Deliberately covers ONLY failures this path can actually observe. Codes for a
 * recorder, a transcription socket, or a server ACK are omitted because the web
 * path has none of those (see conversationContinuityBuffer.ts): the browser
 * performs transcription internally and returns text. Emitting codes that can
 * never fire would read as diagnostic coverage we do not have.
 */
export const CAPTURE_REASON_CODES: Record<CaptureLossCause, string> = {
  track_ended: 'MIC_TRACK_ENDED',
  track_muted: 'MIC_TRACK_MUTED',
  permission_lost: 'MIC_PERMISSION_LOST',
  device_changed: 'MIC_DEVICE_CHANGED',
  audio_context_interrupted: 'AUDIO_CONTEXT_INTERRUPTED',
  silent_death: 'NO_AUDIO_FRAMES',
  never_armed: 'CAPTURE_NEVER_ARMED',
  restart_loop: 'RECOGNITION_RESTART_LOOP',
  abort_loop: 'RECOGNITION_ABORT_LOOP',
  inactivity: 'LISTENING_STOOD_DOWN',
};

export interface CaptureLivenessInput {
  now: number;
  /** Timestamp of the most recent event from the recognition instance. */
  lastActivityAt: number;
  /** Timestamp of the most recent `onstart`. 0 if never started. */
  armedAt: number;
  /** Has `onaudiostart` fired for the current instance? */
  audioOpened: boolean;
  /**
   * Is the watchdog even applicable right now? False while MAIA speaks, while
   * a turn is processing, or while a restart is in flight — recognition is
   * legitimately torn down in those windows and silence means nothing.
   */
  applicable: boolean;
}

export interface CaptureLivenessVerdict {
  dead: boolean;
  cause?: CaptureLossCause;
  /** How long capture had been silent when the verdict was reached. */
  silentForMs: number;
}

/**
 * Decide whether the capture path has silently died.
 *
 * Total and side-effect free: given the same input it always returns the same
 * verdict, so the thresholds above can be exercised directly in tests without
 * simulating a browser or advancing real time.
 */
export function assessCaptureLiveness(input: CaptureLivenessInput): CaptureLivenessVerdict {
  const { now, lastActivityAt, armedAt, audioOpened, applicable } = input;

  // Not listening, or in a window where teardown is expected: silence is
  // meaningless here, and a false positive would interrupt a working session.
  if (!applicable) return { dead: false, silentForMs: 0 };

  // Never started: there is nothing to be dead. The start path owns this.
  if (armedAt <= 0) return { dead: false, silentForMs: 0 };

  const silentForMs = now - Math.max(lastActivityAt, armedAt);
  if (silentForMs < 0) return { dead: false, silentForMs: 0 };

  // Stillborn instance: onstart fired, audio never opened.
  if (!audioOpened && now - armedAt >= CAPTURE_ARMING_SILENT_MS) {
    return { dead: true, cause: 'never_armed', silentForMs: now - armedAt };
  }

  if (silentForMs >= CAPTURE_SILENT_DEATH_MS) {
    return { dead: true, cause: 'silent_death', silentForMs };
  }

  return { dead: false, silentForMs };
}

/**
 * Member-facing wording for a capture loss.
 *
 * One place, so the language stays honest and consistent wherever it surfaces.
 * The rules these strings follow:
 *
 *  - Name what happened. Never "something went wrong".
 *  - Never imply the member did something wrong; the capture layer failed.
 *  - Never claim to know more than we do. We can observe that the track was
 *    taken; we cannot observe *which* application took it, so we do not guess.
 *  - Always state the recovery action, because there always is one.
 *  - Say plainly that nothing spoken was lost, since that is the member's
 *    first fear and, once salvage is wired, it is true.
 */
export function describeCaptureLoss(
  cause: CaptureLossCause,
  opts?: { transcriptPreserved?: boolean },
): string {
  const preserved = opts?.transcriptPreserved
    ? " What you'd already said is saved in the message box."
    : '';

  switch (cause) {
    case 'track_muted':
      return (
        'Your microphone was taken by another app, so MAIA stopped hearing you. ' +
        'Close or mute the other app, then tap the mic to pick up where you left off.' +
        preserved
      );
    case 'track_ended':
      return (
        'Your microphone disconnected, so MAIA stopped hearing you. ' +
        'Tap the mic to reconnect.' + preserved
      );
    case 'silent_death':
      return (
        'MAIA stopped receiving audio and did not recover on its own. ' +
        'Tap the mic to start listening again.' + preserved
      );
    case 'never_armed':
      return (
        'The microphone never opened. Tap the mic to try again — if it keeps ' +
        'happening, check that this site still has microphone permission.' + preserved
      );
    case 'restart_loop':
    case 'abort_loop':
      return (
        'Voice input kept dropping, so MAIA stopped retrying. ' +
        'Tap the mic to try again.' + preserved
      );
    case 'audio_context_interrupted':
      return (
        'Your audio was interrupted, so MAIA stopped hearing you. ' +
        'Tap the mic to resume.' + preserved
      );
    case 'device_changed':
      return (
        'Your audio device changed, so MAIA stopped hearing you. ' +
        'Tap the mic to reconnect.' + preserved
      );
    case 'permission_lost':
      return (
        'Microphone permission was withdrawn, so MAIA stopped hearing you. ' +
        'Re-allow the mic for this site, then tap to resume.' + preserved
      );
    case 'inactivity':
      return 'MAIA stopped listening after a long quiet stretch. Tap the mic when you want to keep going.' + preserved;
    default:
      return 'Voice input stopped. Tap the mic to start listening again.' + preserved;
  }
}

/**
 * Is this loss worth interrupting the member for?
 *
 * `inactivity` is an expected stand-down after a long silence — worth showing
 * in the mic's own status line, not worth a toast over the conversation. Every
 * other cause means capture broke while the member believed it was working,
 * and that always warrants an interruption.
 */
export function isCaptureLossUnexpected(cause: CaptureLossCause): boolean {
  return cause !== 'inactivity';
}
