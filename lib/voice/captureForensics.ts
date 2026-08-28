/**
 * Capture-loss forensics — making the next silent death self-identifying.
 *
 * WHY THIS EXISTS
 * ---------------
 * `micLiveness.ts` can already tell that capture died. It cannot tell WHY,
 * and the production trace we have says the same thing every time:
 *
 *   onstart       fired
 *   onaudiostart  fired
 *   onspeechstart fired
 *   onresult      never
 *   onerror       never          ← and onerror IS wired to telemetry, so this
 *   onend         never            absence is evidence, not a gap in coverage
 *   ~15s later    voice_capture_lost  cause=silent_death  NO_AUDIO_FRAMES
 *
 * Every remaining hypothesis fits that trace equally well. The one witness
 * that separates them is already running and was never read: the component
 * holds its own `AnalyserNode` bound directly to the same `MediaStream` the
 * recognizer is using. If the analyser is still seeing voice energy while
 * recognition has gone quiet, the audio is arriving and the recognition
 * pipeline is the corpse. If the analyser is equally silent, the failure is
 * upstream of both — the stream, the device, or the AudioContext.
 *
 * This module turns that comparison into a single reported field.
 *
 * DESIGN POSITION
 * ---------------
 * Observation only. Nothing in the app branches on anything computed here;
 * `buildCaptureForensics` is called at the moment of loss and its output goes
 * to telemetry and nowhere else. That is deliberate: we do not yet know the
 * mechanism, and a repair built on a guess would be indistinguishable from a
 * repair built on evidence once it shipped.
 *
 * NAMING follows "observable state before interpreted meaning". A witness is
 * called `analyser_hearing_voice`, not `recognition_zombie` — the first is
 * what was measured, the second is what we would conclude from it. The
 * adjudication table lives in the comment on `CaptureSilenceWitness`, where a
 * reader can disagree with it without the code having already assumed it.
 *
 * PRIVACY: the input type admits only numbers, booleans, and short opaque
 * identifiers. There is no field a transcript could be placed in, so no
 * caller can accidentally emit one.
 *
 * Pure and framework-agnostic (no React, no DOM) so the classification can be
 * exercised in tests without a browser or a dying microphone.
 */

/**
 * The analyser loop runs on `requestAnimationFrame` (~60fps when the tab is
 * foregrounded, throttled to ~1fps or stopped entirely when it is not). Two
 * seconds without a tick means the loop is not running at animation rate —
 * either it exited, or the page is throttled.
 */
export const ANALYSER_STALL_MS = 2_000;

/**
 * How recently the analyser must have crossed the voice threshold for us to
 * say audio was still arriving. Generous: the member may genuinely have been
 * quiet for a stretch before noticing the mic was dead.
 */
export const ANALYSER_VOICE_RECENT_MS = 20_000;

/**
 * Floor below which a windowed peak is indistinguishable from a dead stream.
 * A live mic in a quiet room still floors around 0.01–0.05 of normalized
 * level; a torn-down or silenced stream reads a flat zero.
 */
export const ANALYSER_SILENT_PEAK = 0.02;

/** Rolling window over which the analyser's peak level is retained. */
export const ANALYSER_PEAK_WINDOW_MS = 5_000;

/**
 * What was observed at the moment capture was declared dead.
 *
 * ADJUDICATION TABLE — how each witness should be acted on. This is the
 * decision the next reproduction is meant to settle; it is written here so
 * the reading is fixed BEFORE the data arrives rather than fitted to it.
 *
 *   analyser_hearing_voice
 *     Audio is reaching the page and carries voice energy, while recognition
 *     emitted nothing. The stream is fine; the recognition pipeline is the
 *     corpse. → build a service/zombie repair (fresh instance on the same
 *     stream), NOT a device or permission repair.
 *
 *   analyser_alive_no_voice
 *     The analyser loop is ticking but the samples are flat. Audio frames are
 *     being delivered as silence. → investigate the MediaStream / input
 *     routing / OS-level mute, not the recognition object.
 *
 *   analyser_stalled
 *     The analyser loop itself is not running at animation rate. Either it
 *     exited (a listening/speaking state transition stopped it) or the page
 *     is backgrounded and rAF is throttled. → read `pageHidden` alongside
 *     this; a hidden page makes the whole silent-death reading suspect and
 *     points at a foregrounding/visibility repair rather than a mic repair.
 *
 *   track_not_delivering
 *     The audio track is absent, ended, disabled, or muted. → the existing
 *     track-loss path should have caught this; if it did not, the gap is in
 *     the track listeners, not in recognition.
 *
 *   audio_context_not_running
 *     The AudioContext left `running` (Safari's `interrupted`, or suspended).
 *     → an audio-session repair. The analyser reading below it is unreliable
 *     and must not be used to argue about recognition.
 *
 *   no_analyser
 *     No local audio witness was attached, so nothing can be adjudicated from
 *     this event. → fix the witness before drawing any conclusion.
 *
 *   indeterminate
 *     Insufficient signal. Explicitly NOT a diagnosis.
 */
export type CaptureSilenceWitness =
  | 'analyser_hearing_voice'
  | 'analyser_alive_no_voice'
  | 'analyser_stalled'
  | 'track_not_delivering'
  | 'audio_context_not_running'
  | 'no_analyser'
  | 'indeterminate';

/**
 * Structural state at the moment of loss.
 *
 * Timestamps are epoch milliseconds, with `0` meaning "never happened". They
 * are converted to ages by `buildCaptureForensics` so the emitted record is
 * readable without knowing when the session started.
 */
export interface CaptureForensicsInput {
  now: number;

  // ── recognition lifecycle ───────────────────────────────────────────────
  /** Lifecycle generation of the recognition instance (see webSpeechLifecycle). */
  generation: number;
  /** Session state as the lifecycle owner sees it. */
  sessionState: string;
  /** Is the instance already flagged for rebuild? */
  shouldRecreate: boolean;
  /** True between `.start()` and `onend`. */
  recognitionActive: boolean;
  /** Has `onaudiostart` fired for the armed instance? */
  audioOpened: boolean;
  onStartAt: number;
  onAudioStartAt: number;
  onSpeechStartAt: number;
  onResultAt: number;
  onErrorAt: number;
  onEndAt: number;

  // ── the audio track ─────────────────────────────────────────────────────
  /** How many audio tracks the live stream holds. 0 = no stream, or no audio. */
  trackCount: number;
  /** `live` | `ended` | null when there is no track. */
  trackReadyState: string | null;
  trackEnabled: boolean | null;
  trackMuted: boolean | null;
  /** Truncated device id — identity only, never a device label (labels carry names). */
  trackDeviceIdPrefix: string | null;

  // ── the local audio witness ─────────────────────────────────────────────
  analyserPresent: boolean;
  /** `running` | `suspended` | `interrupted` | `closed` | null. */
  audioContextState: string | null;
  /** Is the rAF level loop believed to be running? */
  analyserLoopRunning: boolean;
  /** Most recent normalized level (0–1). */
  analyserLevel: number;
  /** When the loop last completed a tick. */
  analyserLastTickAt: number;
  /** When the level last crossed the VAD threshold. */
  analyserLastVoiceAt: number;
  /** Peak level within the current rolling window. */
  analyserPeakCurrent: number;
  /** Peak level of the preceding window — survives a window boundary at loss. */
  analyserPeakPrevious: number;
  /** Ticks counted since the loop started. Distinguishes "never ran" from "stopped". */
  analyserTicks: number;

  // ── capture / component state ───────────────────────────────────────────
  /** As computed by the liveness verdict that triggered this loss. */
  silentForMs: number;
  micState: string;
  listeningMode: string;
  isListening: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  restartInFlight: boolean;
  /** Was the document hidden at the moment of loss? */
  pageHidden: boolean;
  /** When visibility last changed. 0 if never observed. */
  lastVisibilityChangeAt: number;
}

/** Emitted metadata: flat scalars only, matching the telemetry contract. */
export type CaptureForensics = Record<string, string | number | boolean | null>;

/**
 * Age of a timestamp in ms, or -1 when the event never happened.
 *
 * -1 rather than null so an analyst can sort and filter numerically without
 * the "never" case silently becoming zero — which would read as "just now",
 * the exact opposite of the truth.
 */
export function msSince(now: number, at: number): number {
  if (!at || at <= 0) return -1;
  const delta = now - at;
  return delta < 0 ? 0 : delta;
}

/** The higher of the current and preceding analyser windows. */
function recentPeak(input: CaptureForensicsInput): number {
  return Math.max(input.analyserPeakCurrent, input.analyserPeakPrevious);
}

/**
 * Classify what the local audio witness saw while recognition was silent.
 *
 * Precedence is deliberate and runs from "the reading below is unreliable" to
 * "the reading below is the answer": a dead track or a stopped AudioContext
 * invalidates any analyser conclusion, so those are reported first even
 * though a stalled analyser is also true in those states.
 */
export function classifyCaptureSilence(input: CaptureForensicsInput): CaptureSilenceWitness {
  if (
    input.trackCount === 0 ||
    input.trackReadyState === 'ended' ||
    input.trackMuted === true ||
    input.trackEnabled === false
  ) {
    return 'track_not_delivering';
  }

  if (input.audioContextState !== null && input.audioContextState !== 'running') {
    return 'audio_context_not_running';
  }

  if (!input.analyserPresent) return 'no_analyser';

  const tickAge = msSince(input.now, input.analyserLastTickAt);
  if (tickAge < 0 || tickAge >= ANALYSER_STALL_MS) return 'analyser_stalled';

  const voiceAge = msSince(input.now, input.analyserLastVoiceAt);
  const heardVoice = voiceAge >= 0 && voiceAge <= ANALYSER_VOICE_RECENT_MS;
  if (heardVoice || recentPeak(input) > ANALYSER_SILENT_PEAK) {
    return 'analyser_hearing_voice';
  }

  return 'analyser_alive_no_voice';
}

/** Round a 0–1 level to three places so telemetry stays readable. */
function level(value: number): number {
  if (!Number.isFinite(value)) return -1;
  return Math.round(value * 1000) / 1000;
}

/**
 * Build the forensic record attached to `voice_capture_lost`.
 *
 * Total and side-effect free. Key names are kept short and flat because the
 * telemetry receiver drops keys longer than 64 characters and does not
 * traverse nested objects.
 */
export function buildCaptureForensics(input: CaptureForensicsInput): CaptureForensics {
  const { now } = input;

  return {
    witness: classifyCaptureSilence(input),

    // recognition lifecycle — which boundary was the last one to speak
    generation: input.generation,
    sessionState: input.sessionState,
    shouldRecreate: input.shouldRecreate,
    recognitionActive: input.recognitionActive,
    audioOpened: input.audioOpened,
    msSinceOnStart: msSince(now, input.onStartAt),
    msSinceAudioStart: msSince(now, input.onAudioStartAt),
    msSinceSpeechStart: msSince(now, input.onSpeechStartAt),
    msSinceResult: msSince(now, input.onResultAt),
    msSinceError: msSince(now, input.onErrorAt),
    msSinceEnd: msSince(now, input.onEndAt),

    // the audio track
    trackCount: input.trackCount,
    trackReadyState: input.trackReadyState,
    trackEnabled: input.trackEnabled,
    trackMuted: input.trackMuted,
    trackDeviceId: input.trackDeviceIdPrefix,

    // the local audio witness
    analyserPresent: input.analyserPresent,
    analyserLoopRunning: input.analyserLoopRunning,
    audioContextState: input.audioContextState,
    analyserLevel: level(input.analyserLevel),
    analyserPeak: level(input.analyserPeakCurrent),
    analyserPeakPrev: level(input.analyserPeakPrevious),
    analyserTicks: input.analyserTicks,
    msSinceAnalyserTick: msSince(now, input.analyserLastTickAt),
    msSinceAnalyserVoice: msSince(now, input.analyserLastVoiceAt),

    // capture / component state
    silentForMs: Math.max(0, Math.round(input.silentForMs)),
    micState: input.micState,
    listeningMode: input.listeningMode,
    isListening: input.isListening,
    isRecording: input.isRecording,
    isSpeaking: input.isSpeaking,
    isProcessing: input.isProcessing,
    restartInFlight: input.restartInFlight,
    pageHidden: input.pageHidden,
    msSinceVisibilityChange: msSince(now, input.lastVisibilityChangeAt),
  };
}
