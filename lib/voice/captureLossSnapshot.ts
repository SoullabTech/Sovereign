/**
 * What was true at the moment capture was declared dead.
 *
 * WHY THIS EXISTS
 * ---------------
 * `micLiveness.ts` decides *that* capture died. It cannot say *what* died,
 * because it only measures the absence of recognition events. On 2026-08-28,
 * on verified build 847485d41, that ambiguity cost hours: the telemetry showed
 *
 *   onstart ✓   onaudiostart ✓   onspeechstart ✓
 *   onresult ✗  onerror ✗        onend ✗          — for fifteen seconds
 *
 * and nothing in the record could distinguish between two very different
 * failures that produce exactly that signature:
 *
 *   A. The recognition pipeline is a zombie. Audio is still arriving; Chrome's
 *      speech service simply stops returning results and reports nothing.
 *   B. The input stopped delivering audio. The track still reads `live`, but
 *      the device emits silence after the leading edge of speech.
 *
 * ⭐ THE MISSING WITNESS. The component already runs an `AnalyserNode` on the
 * raw `MediaStream`, entirely independent of Chrome's speech service. If that
 * analyser still sees voice energy while recognition has gone quiet, the audio
 * is fine and the recognizer is dead (A). If the analyser has fallen silent
 * too, the audio itself stopped (B). One number settles what inference could
 * not.
 *
 * ⛔ NAMING HONESTY. The existing reason code `NO_AUDIO_FRAMES` claims more
 * than the detector measures — it observes no *recognition events*, not the
 * absence of audio frames. The code is kept for continuity, and this snapshot
 * is what makes the stronger claim checkable rather than assumed.
 *
 * Pure and side-effect free: no React, no DOM, no timers. The caller reads the
 * live objects; this module only decides what the readings mean.
 *
 * ⛔ Carries no transcript content, ever. Counts, states, ages and levels only.
 */

/** Which handler last fired, and when. 0 means "never fired this instance". */
export interface RecognitionHandlerTimestamps {
  onstart: number;
  onaudiostart: number;
  onspeechstart: number;
  onresult: number;
  onerror: number;
  onend: number;
}

export interface CaptureLossSnapshotInput {
  now: number;
  /** How long `micLiveness` had seen silence when it returned its verdict. */
  silentForMs: number;

  recognition: {
    generation: number;
    /** `WebSpeechRecognitionSession.state` at loss time. */
    sessionState: string;
    shouldRecreate: boolean;
    handlerAt: RecognitionHandlerTimestamps;
  };

  /** Null when the stream was already gone — itself a finding. */
  track: {
    readyState: string;
    enabled: boolean;
    muted: boolean;
    label: string;
  } | null;

  /**
   * The independent witness. Sourced from the component's AnalyserNode, which
   * never passes through Chrome's speech service.
   */
  localAudio: {
    /** AudioContext.state — Safari reports `interrupted` here. */
    contextState: string;
    /** Most recent normalized level, 0..1. */
    level: number;
    /** When the analyser loop last wrote a level. Staleness = loop stopped. */
    lastLevelUpdateAt: number;
    /** When local energy last exceeded the VAD threshold. 0 if never. */
    lastAboveThresholdAt: number;
    /** Highest level seen in the recent window, if tracked. */
    peakRecent: number;
    threshold: number;
  };

  capture: {
    micState: string;
    /** HANDS_FREE vs PUSH_TO_TALK — the two modes fail differently. */
    listeningMode: string;
    isListening: boolean;
    isRecording: boolean;
    restartInFlight: boolean;
  };
}

/**
 * What the local analyser says about the silent window.
 *
 * This is the whole point of the snapshot: it is the one field that separates
 * a dead recognizer from dead audio.
 */
export type LocalAudioVerdict =
  /** Voice energy was present while recognition was silent → the recognizer died. */
  | 'voice_present'
  /** Local audio was also silent → the input stopped delivering. */
  | 'silent'
  /** The analyser loop itself stopped writing, so it witnessed nothing. */
  | 'analyser_stalled'
  /** No analyser was running — cannot discriminate. */
  | 'unavailable';

/**
 * How stale a level reading may be before the analyser is considered stopped
 * rather than quiet. The loop writes on every animation frame (~16ms), so two
 * seconds of no write is a stopped loop, not a silent room.
 */
export const ANALYSER_STALE_MS = 2_000;

/**
 * Rolling window the caller resets `peakRecent` over.
 *
 * A session-lifetime peak would answer the wrong question: at loss time we
 * need to know whether there was energy *just now*, not whether the room was
 * ever loud. Kept alongside the staleness constant so the two windows are read
 * together rather than drifting apart in separate files.
 */
export const ANALYSER_PEAK_WINDOW_MS = 2_000;

export interface CaptureLossSnapshot {
  localAudioVerdict: LocalAudioVerdict;
  silentForMs: number;

  recognitionGeneration: number;
  recognitionState: string;
  recognitionShouldRecreate: boolean;
  /** Age in ms of each handler at loss time; -1 means it never fired. */
  msSinceOnStart: number;
  msSinceOnAudioStart: number;
  msSinceOnSpeechStart: number;
  msSinceOnResult: number;
  msSinceOnError: number;
  msSinceOnEnd: number;

  trackPresent: boolean;
  trackReadyState: string | null;
  trackEnabled: boolean | null;
  trackMuted: boolean | null;
  trackLabel: string | null;

  audioContextState: string;
  audioLevel: number;
  audioLevelAgeMs: number;
  msSinceAboveThreshold: number;
  audioPeakRecent: number;
  audioThreshold: number;

  micState: string;
  listeningMode: string;
  isListening: boolean;
  isRecording: boolean;
  restartInFlight: boolean;
}

/** Age of a timestamp, or -1 when the event never happened. */
function ageOf(now: number, at: number): number {
  if (!at || at <= 0) return -1;
  const age = now - at;
  return age >= 0 ? age : 0;
}

/**
 * Decide what the local analyser witnessed during the silent window.
 *
 * ⭐ The comparison that matters: was local voice energy seen *inside* the
 * window recognition spent silent? Energy from before the window began proves
 * nothing — the member may simply have stopped talking.
 */
export function assessLocalAudio(
  input: Pick<CaptureLossSnapshotInput, 'now' | 'silentForMs' | 'localAudio'>,
): LocalAudioVerdict {
  const { now, silentForMs, localAudio } = input;

  if (!localAudio.lastLevelUpdateAt) return 'unavailable';
  if (now - localAudio.lastLevelUpdateAt > ANALYSER_STALE_MS) return 'analyser_stalled';

  const windowStart = now - Math.max(silentForMs, 0);
  if (localAudio.lastAboveThresholdAt >= windowStart) return 'voice_present';

  return 'silent';
}

/**
 * Build the flat, JSON-safe record attached to `voice_capture_lost`.
 *
 * Flat by design: every field is greppable from a single log line without a
 * parser, which is how this telemetry is actually read in practice.
 */
export function buildCaptureLossSnapshot(
  input: CaptureLossSnapshotInput,
): CaptureLossSnapshot {
  const { now, recognition, track, localAudio, capture } = input;
  const h = recognition.handlerAt;

  return {
    localAudioVerdict: assessLocalAudio(input),
    silentForMs: Math.max(input.silentForMs, 0),

    recognitionGeneration: recognition.generation,
    recognitionState: recognition.sessionState,
    recognitionShouldRecreate: recognition.shouldRecreate,
    msSinceOnStart: ageOf(now, h.onstart),
    msSinceOnAudioStart: ageOf(now, h.onaudiostart),
    msSinceOnSpeechStart: ageOf(now, h.onspeechstart),
    msSinceOnResult: ageOf(now, h.onresult),
    msSinceOnError: ageOf(now, h.onerror),
    msSinceOnEnd: ageOf(now, h.onend),

    trackPresent: track != null,
    trackReadyState: track?.readyState ?? null,
    trackEnabled: track?.enabled ?? null,
    trackMuted: track?.muted ?? null,
    trackLabel: track?.label ?? null,

    audioContextState: localAudio.contextState,
    audioLevel: Number(localAudio.level.toFixed(3)),
    audioLevelAgeMs: ageOf(now, localAudio.lastLevelUpdateAt),
    msSinceAboveThreshold: ageOf(now, localAudio.lastAboveThresholdAt),
    audioPeakRecent: Number(localAudio.peakRecent.toFixed(3)),
    audioThreshold: Number(localAudio.threshold.toFixed(3)),

    micState: capture.micState,
    listeningMode: capture.listeningMode,
    isListening: capture.isListening,
    isRecording: capture.isRecording,
    restartInFlight: capture.restartInFlight,
  };
}
