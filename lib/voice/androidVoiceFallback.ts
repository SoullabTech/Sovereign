/**
 * Android Chrome voice fallback — one-shot MediaRecorder + local Whisper.
 *
 * Built for the failure mode observed in Tara's trace (2026-05-14): on
 * Android Chrome, `voice_audio_started` fires but `voice_speech_started`
 * never does — the Web Speech API's VAD silently fails to recognize speech.
 * When that pattern hits the bounded-recovery threshold (see Stage 2 /
 * PR #337), instead of going straight to text fallback, try this path first:
 *
 *   1. record from the existing mic stream via MediaRecorder
 *   2. stop on silence (or hard max duration)
 *   3. POST to /api/voice/transcribe-simple → local maia-whisper
 *   4. return the transcript so the parent can feed it to MAIA as if it
 *      came from Web Speech API
 *
 * Sovereignty: this path keeps audio first-party. Web Speech API on Android
 * Chrome sends audio to Google's speech servers; this module sends audio to
 * our own maia-whisper container (local Faster-Whisper, OpenAI-compatible).
 * Gated server-side by ALLOW_AUDIO_TRANSCRIPTION=true (narrower than the
 * broad ALLOW_AUDIO_UPLOADS flag — accessibility/recovery scope only).
 *
 * No transcript content is emitted via telemetry — only byte counts,
 * durations, mime types, error names. Observable state first.
 */

import { readTranscript } from './transcribeResponse';
import { logVoiceEvent } from './voiceDiagnostics';
import { createRollingPartialTranscriber } from './rollingPartialTranscription';
import { apiFetch } from '@/lib/http/apiBase';

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus', // Android Chrome default
  'audio/webm',
  'audio/ogg;codecs=opus',  // Firefox / Zen native container
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
] as const;

const DEFAULT_MAX_RECORDING_MS = 8000;
const DEFAULT_SILENCE_HOLDOFF_MS = 1500;
const DEFAULT_MIN_RECORDING_MS = 800; // don't stop before the user can speak
const SILENCE_RMS_THRESHOLD = 0.012; // empirical; mic noise floor sits ~0.005

/**
 * PLATFORM-D02A-01 — how long capture may claim nothing before it says so.
 *
 * ⛔ NOT A VAD VALUE AND NOT AN UTTERANCE BOUND. It measures only the distance
 * between "the microphone handle resolved" and "audio is demonstrably being
 * admitted from it". Nothing about speech, silence, or turn length is decided
 * here, and the utterance limits (8 s / DESKTOP_MAX_UTTERANCE_MS) are untouched.
 *
 * 2500 ms because an AudioContext resume and a first analyser poll are
 * sub-second operations on every surface we have measured; this is generous
 * enough that a slow device is not called a failure, and short enough that a
 * member is not left in front of a lie.
 */
const ADMISSION_DEADLINE_MS = 2500;

/**
 * ⭐ PLATFORM-D02A-01 — THE RATIFIED CAPTURE MILESTONES.
 *
 * The census (docs/ops/DESKTOP_PLATFORM_CONVERSATION_01_CENSUS.md) found the
 * surface declaring LISTENING when `getUserMedia` resolved — before the
 * recorder existed, before the analyser existed, before one sample was
 * admitted. The claim was therefore true in every downstream failure and could
 * distinguish none of them.
 *
 * These name the stages a capture actually passes through, so a walk can say
 * where it stopped instead of showing one word for all of it.
 *
 *   recorder_created    MediaRecorder constructed on this stream
 *   audio_admitted      ⭐ the graph is RUNNING and the track is live and
 *                       unmuted — the first evidence that audio is arriving.
 *                       This, and nothing earlier, may ground "listening".
 *   first_audio_chunk   the recorder produced encoded bytes (timesliced
 *                       callers only; a one-shot caller sees this at stop)
 *   speech_detected     a poll crossed SILENCE_RMS_THRESHOLD
 *   capture_stopped     with the reason it ended
 *
 * ⛔ Each fires AT MOST ONCE except `capture_stopped`. They are observations,
 * never instructions: no branch in this module reads a milestone back.
 */
/**
 * What a recording produced, and how it ended.
 *
 * ⛔ `stopReason` used to be computed and then thrown away (`void stopReason`),
 * so `no_admission` would have been indistinguishable from a short silence —
 * the caller would have posted an unheard blob to Whisper and reported an empty
 * transcript. The reason is carried now because it is the difference between
 * "you said nothing" and "we never heard you".
 */
interface CaptureOutcome {
  blob: Blob;
  stopReason: 'silence' | 'max' | 'error' | 'aborted' | 'no_admission';
  admitted: boolean;
}

export type CaptureMilestone =
  | 'recorder_created'
  | 'audio_admitted'
  | 'first_audio_chunk'
  | 'speech_detected'
  | 'capture_stopped';

export interface FallbackResult {
  ok: boolean;
  transcript?: string;
  reason?:
    | 'recording_unsupported'  // MediaRecorder not available / no supported mime
    | 'recording_error'         // MediaRecorder threw mid-recording
    | 'empty_blob'              // recording produced no bytes
    | 'no_audio_admitted'       // PLATFORM-D02A-01: the apparatus never heard —
                                // graph never RUNNING, or the track was ended or
                                // muted throughout. NOT the member being quiet.
    | 'transcribe_http_error'   // /api/voice/transcribe-simple non-2xx
    | 'transcribe_disabled'     // 410 from the route (env gate off)
    | 'aborted'                 // the caller revoked this capture's authority
    | 'empty_transcript'        // Whisper returned blank text
    | 'unknown';
  durationMs?: number;
  bytes?: number;
}

/**
 * DESKTOP-VOICE-DEVICE-CALIBRATION-HARNESS-01 — bounded measurements from one
 * real capture, for the local calibration surface only.
 *
 * ⛔ BOUNDED BY CONSTRUCTION. Two integers, two floats and four booleans. There
 * is deliberately NO per-poll RMS history, no waveform, no activity timeline and
 * no segment timestamps: a per-poll trace would be an amplitude silhouette of
 * the member's room, and the calibration question does not need one.
 *
 * ⛔ `crossingCount` IS NOT MILLISECONDS. It counts SCHEDULED OBSERVATIONS whose
 * sampled window crossed the threshold. The analyser reads 1024 samples — about
 * 21.33 ms at 48 kHz — once every 100 ms, so it observes roughly 21% of the
 * capture's wall clock. `crossingCount × 100` is not voiced duration and must
 * never be described as such.
 */
export interface CaptureCalibration {
  durationMs: number;
  /** Analyser polls attempted. */
  scheduledPolls: number;
  /** Polls where context was running, track live and unmuted, and the read succeeded. */
  trustedPolls: number;
  /** Trusted polls whose sampled window crossed SILENCE_RMS_THRESHOLD. */
  crossingCount: number;
  rmsMax: number;
  rmsMean: number;
  /** Apparatus faults observed at any poll — any of these invalidates the trial. */
  contextTrustBroken: boolean;
  trackEnded: boolean;
  trackMuted: boolean;
  analyserErrors: number;
}

interface RunOptions {
  maxMs?: number;
  silenceHoldoffMs?: number;
  minMs?: number;
  /**
   * DESKTOP-SOVEREIGN-STT-LIFECYCLE-01 — revoke this capture's authority.
   *
   * ⛔ OPTIONAL BY DESIGN. Callers that pass nothing (the Android-Chrome
   * recovery, the Firefox/Zen branch) behave exactly as before — this unit adds
   * cancellation, it does not require it.
   *
   * ⛔ WHY THIS MODULE NEEDED IT. Its own contract said stream lifecycle belongs
   * to the caller, and it had no way to be told to stop. So a capture whose
   * member had already left `/maia` would finish recording and go on to POST
   * their audio to `/api/voice/transcribe-simple` — transcribing speech from a
   * surface nobody was looking at any more. Attention the member cannot see is
   * not attention they consented to.
   */
  signal?: AbortSignal;
  /**
   * DESKTOP-SOVEREIGN-STT-INTERIM-01 — provisional text while recording.
   *
   * ⛔ OPTIONAL BY DESIGN. Callers that pass nothing (the Android-Chrome
   * recovery, the Firefox/Zen branch) record exactly as before — no timeslice,
   * no extra requests, one transcript. Only a caller that asks for provisional
   * text pays for it.
   *
   * ⛔⛔ DISPLAY ONLY. What arrives here is a re-reading of the utterance so
   * far and may be replaced word-for-word by the next one. It must never be
   * treated as the member's turn: the RESOLVED value of this function is the
   * single final transcript, and it is the only thing that may commit.
   */
  onPartial?: (text: string) => void;
  /** Minimum wall-clock between provisional requests. */
  partialIntervalMs?: number;
  /**
   * PLATFORM-D02A-01 — capture stage reports, for a surface that must not
   * claim to be listening before audio is admitted.
   *
   * ⛔ OPTIONAL, AND OBSERVATIONS ONLY. A caller that passes nothing behaves
   * exactly as before. Nothing in this module branches on a milestone.
   */
  onMilestone?: (stage: CaptureMilestone, detail?: Record<string, unknown>) => void;
  /**
   * Override the admission deadline. Tests only — production takes the
   * constant, so the bound cannot drift per call site.
   */
  admissionDeadlineMs?: number;
  /**
   * DESKTOP-VOICE-DEVICE-CALIBRATION-HARNESS-01 — local diagnostic only.
   *
   * ⛔ INERT UNLESS SUPPLIED. Absent — which is every production caller — this
   * module behaves exactly as before: nothing is measured, nothing is read that
   * was not read already, and the upload proceeds normally.
   *
   * ⛔ `stopBeforeUpload` IS MANDATORY WHEN MEASURING. The calibration walk ends
   * before transcription: the member's audio is recorded, measured and dropped
   * without leaving the device. There is no variant of this option that
   * measures and also uploads.
   *
   * ⛔ THE ONE DIVERGENCE, stated rather than hidden: when this option is
   * supplied the analyser read is wrapped in try/catch so a failing apparatus
   * can be COUNTED. Production is deliberately left unwrapped, because catching
   * there would let the stop comparisons run after a throw and change stop
   * timing. The divergence therefore only occurs in trials that a thrown read
   * has already marked invalid.
   */
  calibration?: {
    onMeasure: (m: CaptureCalibration) => void;
    stopBeforeUpload: true;
  };
}

/**
 * How often MediaRecorder flushes a chunk when provisional text is requested.
 * Each flush yields a decodable prefix; the transcriber throttles separately,
 * so a small timeslice only improves how fresh the offered prefix is.
 */
const PARTIAL_TIMESLICE_MS = 400;

function pickMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const t of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return null;
}

/**
 * Run a one-shot record-then-transcribe cycle against the given stream.
 * Returns once we either have a transcript, or have decided the path
 * cannot deliver one — never throws. Caller decides what to do with
 * the result (feed to MAIA, or fall through to text fallback).
 */
export async function recordAndTranscribe(
  stream: MediaStream,
  options: RunOptions = {}
): Promise<FallbackResult> {
  const signal = options.signal;
  const aborted = (): boolean => signal?.aborted === true;
  /** Uniform, silent exit. A revoked capture is not a failure to report loudly. */
  const abortResult = (durationMs?: number, bytes?: number): FallbackResult => {
    // The telemetry payload accepts no undefined values; omit what we do not have
    // rather than widening its type for an abort path.
    logVoiceEvent('voice_fallback_failed', {
      reason: 'aborted',
      ...(durationMs === undefined ? {} : { durationMs }),
      ...(bytes === undefined ? {} : { bytes }),
    });
    return { ok: false, reason: 'aborted', durationMs, bytes };
  };

  if (aborted()) return abortResult();

  const maxMs = options.maxMs ?? DEFAULT_MAX_RECORDING_MS;
  const silenceHoldoffMs = options.silenceHoldoffMs ?? DEFAULT_SILENCE_HOLDOFF_MS;
  const minMs = options.minMs ?? DEFAULT_MIN_RECORDING_MS;

  const mimeType = pickMimeType();
  if (!mimeType) {
    logVoiceEvent('voice_fallback_failed', { reason: 'recording_unsupported' });
    return { ok: false, reason: 'recording_unsupported' };
  }

  const startedAt = Date.now();
  logVoiceEvent('voice_fallback_recording_started', { mimeType, maxMs });

  // ⛔ Built only when a caller asked for provisional text, and handed the SAME
  // signal as the capture — partials inherit revocation, they do not route
  // around it.
  const partial = options.onPartial
    ? createRollingPartialTranscriber({
        mimeType,
        onPartial: options.onPartial,
        ...(options.partialIntervalMs === undefined ? {} : { intervalMs: options.partialIntervalMs }),
        ...(signal ? { signal } : {}),
      })
    : null;

  // ⛔ Calibration only; undefined for every production caller.
  const measure = options.calibration
    ? {
        scheduledPolls: 0,
        trustedPolls: 0,
        crossingCount: 0,
        rmsMax: 0,
        rmsMean: 0,
        contextTrustBroken: false,
        trackEnded: false,
        trackMuted: false,
        analyserErrors: 0,
      }
    : undefined;

  // ── Record ────────────────────────────────────────────────────────────
  let outcome: CaptureOutcome;
  try {
    outcome = await recordWithSilenceDetection(stream, mimeType, {
      maxMs,
      silenceHoldoffMs,
      minMs,
      signal,
      ...(partial
        ? {
            timesliceMs: PARTIAL_TIMESLICE_MS,
            onPrefix: (prefix: Blob) => partial.offerPrefix(prefix),
          }
        : {}),
      ...(measure ? { measure } : {}),
      ...(options.onMilestone ? { onMilestone: options.onMilestone } : {}),
      admissionDeadlineMs: options.admissionDeadlineMs ?? ADMISSION_DEADLINE_MS,
    });
  } catch (err: unknown) {
    // ⛔ Recording is over on every exit path. From here the final transcript is
    // the only authority; a provisional result still in flight must not land.
    partial?.close();
    const name = err instanceof Error ? err.name : 'unknown';
    logVoiceEvent('voice_fallback_failed', {
      reason: 'recording_error',
      errorName: String(name).slice(0, 60),
    });
    return { ok: false, reason: 'recording_error' };
  }
  partial?.close();

  const { blob } = outcome;
  const durationMs = Date.now() - startedAt;

  // ⛔ THE GATE THIS UNIT EXISTS FOR. Recording is over; the network request has
  // not happened yet. If authority was revoked at any point up to here, the
  // member's audio does not leave the device. Checked BEFORE the empty-blob
  // branch so an abort is reported as an abort rather than as a recording
  // failure.
  if (aborted()) return abortResult(durationMs, blob.size);

  // ⛔ CALIBRATION EXIT. The walk ends here: the capture was recorded and
  // measured, and the audio is dropped without leaving the device. Placed
  // BEFORE the empty-blob branch so a silent trial still yields its
  // measurement — silence is precisely one of the classes being calibrated.
  if (options.calibration) {
    options.calibration.onMeasure({ ...measure!, durationMs });
    return { ok: false, reason: 'aborted', durationMs, bytes: blob.size };
  }

  // ⛔ PLATFORM-D02A-01 — NEVER HEARD, SAID PLAINLY.
  //
  // Audio was never demonstrably admitted: the graph never reached `running`,
  // or the track was ended or muted throughout. Posting this to Whisper would
  // return an empty transcript and the member would be told they said nothing —
  // blaming them for an apparatus that was not listening. Distinct from
  // `empty_blob`, which is a real recording that happens to be quiet.
  //
  // Placed AFTER the calibration exit so a trial still yields its measurement.
  // ⛔ KEYED ON THE DEADLINE HAVING FIRED, NOT ON THE FLAG.
  //
  // Admission is observed on the analyser poll, which ticks every 100 ms — so a
  // capture that ends before its first tick has an unset flag and has proved
  // nothing either way. Reading the bare flag reported `no_audio_admitted` for
  // a capture the member ABORTED, and for any short recording that was
  // perfectly fine. Found by sovereignCaptureLifecycle T3/T7/T8, which are
  // exactly the callers that pass no signal or stop immediately.
  //
  // `stopReason === 'no_admission'` is the precise claim: we polled for the
  // whole deadline and never once saw a running graph with a live track. Every
  // other ending keeps its own more specific reason.
  if (outcome.stopReason === 'no_admission') {
    logVoiceEvent('voice_fallback_failed', {
      reason: 'no_audio_admitted',
      durationMs,
      bytes: blob.size,
    });
    return { ok: false, reason: 'no_audio_admitted', durationMs, bytes: blob.size };
  }

  if (blob.size === 0) {
    logVoiceEvent('voice_fallback_failed', { reason: 'empty_blob', durationMs });
    return { ok: false, reason: 'empty_blob', durationMs };
  }

  // ── Transcribe ───────────────────────────────────────────────────────
  const ext = mimeType.includes('webm') ? 'webm'
    : mimeType.includes('mp4') ? 'm4a'
    : mimeType.includes('wav') ? 'wav'
    : mimeType.includes('ogg') ? 'ogg'
    : 'webm';
  const file = new File([blob], `fallback-recording.${ext}`, { type: mimeType });
  const formData = new FormData();
  formData.append('file', file);

  logVoiceEvent('voice_fallback_transcribe_sent', {
    mimeType,
    bytes: blob.size,
    durationMs,
  });

  let response: Response;
  try {
    // apiFetch handles native x-member-id headers; web uses cookies.
    // We deliberately do NOT set Content-Type — FormData sets it with the
    // multipart boundary (the route rejects manually-set Content-Type).
    response = await apiFetch('/api/voice/transcribe-simple', {
      method: 'POST',
      body: formData,
      // Aborting mid-flight cancels the upload itself, not merely its result.
      ...(signal ? { signal } : {}),
    });
  } catch (err: unknown) {
    const name = err instanceof Error ? err.name : 'unknown';
    // An aborted fetch is not a transport failure — it is this unit working.
    if (aborted() || name === 'AbortError') return abortResult(durationMs, blob.size);
    logVoiceEvent('voice_fallback_failed', {
      reason: 'transcribe_http_error',
      errorName: String(name).slice(0, 60),
      durationMs,
      bytes: blob.size,
    });
    return { ok: false, reason: 'transcribe_http_error', durationMs, bytes: blob.size };
  }

  // Revoked while the request was in flight and the response still arrived:
  // the transcript is real, and it is not ours to deliver.
  if (aborted()) return abortResult(durationMs, blob.size);

  if (response.status === 410) {
    // Server-side gate is off; the env var ALLOW_AUDIO_TRANSCRIPTION was
    // not enabled. Surfaces as a distinct failure so ops can see this is
    // a configuration issue, not a code issue.
    logVoiceEvent('voice_fallback_failed', {
      reason: 'transcribe_disabled',
      status: 410,
      durationMs,
      bytes: blob.size,
    });
    return { ok: false, reason: 'transcribe_disabled', durationMs, bytes: blob.size };
  }

  if (!response.ok) {
    logVoiceEvent('voice_fallback_failed', {
      reason: 'transcribe_http_error',
      status: response.status,
      durationMs,
      bytes: blob.size,
    });
    return { ok: false, reason: 'transcribe_http_error', durationMs, bytes: blob.size };
  }

  let transcript = '';
  try {
    // ⛔ VOICE-TRANSCRIBE-RESPONSE-SHAPE-01. The comment that stood here said
    // the route "returns a `text` field", and that was simply wrong:
    // /api/voice/transcribe-simple returns { success, transcription, ... }
    // (transcribe-simple/route.ts:158). So this accepted two shapes, neither of
    // which its own endpoint sends, and every successful transcription was read
    // as blank and discarded as `empty_transcript`.
    transcript = readTranscript(await response.json());
  } catch {
    transcript = '';
  }

  if (!transcript) {
    logVoiceEvent('voice_fallback_failed', {
      reason: 'empty_transcript',
      durationMs,
      bytes: blob.size,
    });
    return { ok: false, reason: 'empty_transcript', durationMs, bytes: blob.size };
  }

  // Observable telemetry only — length, not content.
  logVoiceEvent('voice_fallback_transcribe_result', {
    transcriptLength: transcript.length,
    durationMs,
    bytes: blob.size,
    mimeType,
  });
  return { ok: true, transcript, durationMs, bytes: blob.size };
}

/**
 * Record until either:
 *   - silenceHoldoffMs of continuous silence (after at least minMs of audio), OR
 *   - hard max duration maxMs.
 *
 * Uses Web Audio API analyser on the same MediaStream — does NOT clone the
 * stream, does NOT touch its tracks. Caller owns stream lifecycle.
 */
async function recordWithSilenceDetection(
  stream: MediaStream,
  mimeType: string,
  opts: {
    maxMs: number;
    silenceHoldoffMs: number;
    minMs: number;
    signal?: AbortSignal;
    /**
     * DESKTOP-SOVEREIGN-STT-INTERIM-01 — when set, the recorder flushes chunks
     * on this cadence so a decodable prefix exists mid-utterance. Absent, the
     * recorder runs exactly as it always has (a single chunk at stop).
     */
    timesliceMs?: number;
    /**
     * The utterance so far, as a self-contained blob. Chunk 0 carries the
     * container header, so every concatenation of chunks[0..n] decodes.
     */
    onPrefix?: (prefix: Blob) => void;
    /** Calibration only. Absent in production; see RunOptions.calibration. */
    measure?: Omit<CaptureCalibration, 'durationMs'>;
    /** PLATFORM-D02A-01 — capture stage reports. Observations only. */
    onMilestone?: (stage: CaptureMilestone, detail?: Record<string, unknown>) => void;
    /** PLATFORM-D02A-01 — how long admission may fail to occur before it is named. */
    admissionDeadlineMs: number;
  },
): Promise<CaptureOutcome> {
  return new Promise<CaptureOutcome>((resolve, reject) => {
    const chunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch (err) {
      reject(err);
      return;
    }

    // ⛔ AT MOST ONCE, except `capture_stopped`. A stage that could report twice
    // would let a surface re-enter a state it had already left.
    const seen = new Set<CaptureMilestone>();
    const milestone = (stage: CaptureMilestone, detail?: Record<string, unknown>) => {
      if (stage !== 'capture_stopped') {
        if (seen.has(stage)) return;
        seen.add(stage);
      }
      logVoiceEvent('voice_capture_milestone', { stage, ...(detail || {}) });
      try { opts.onMilestone?.(stage, detail); }
      catch { /* an observer must never break the capture it is observing */ }
    };
    milestone('recorder_created', { mimeType });

    let stopped = false;
    let stopReason: 'silence' | 'max' | 'error' | 'aborted' | 'no_admission' = 'silence';

    const stop = (reason: 'silence' | 'max' | 'error' | 'aborted' | 'no_admission') => {
      if (stopped) return;
      stopped = true;
      stopReason = reason;
      try {
        if (recorder.state !== 'inactive') recorder.stop();
      } catch {
        // ignore — onstop will still fire if recording was active
      }
    };

    // ⛔ DESKTOP-SOVEREIGN-STT-LIFECYCLE-01 — stop RECORDING on revocation, not
    // merely discard the result afterwards. Without this, leaving `/maia`
    // mid-sentence would leave the recorder running for the remainder of its
    // window with the member's microphone open behind another screen.
    const onAbort = () => stop('aborted');
    if (opts.signal) {
      if (opts.signal.aborted) {
        // Already revoked before the first frame: stop immediately, and let
        // onstop resolve with whatever (nothing) was captured.
        queueMicrotask(() => stop('aborted'));
      } else {
        opts.signal.addEventListener('abort', onAbort, { once: true });
      }
    }

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
        milestone('first_audio_chunk', { bytes: e.data.size });
      }
      // ⛔ The last chunk must never open a provisional request that would race
      // the final transcript. Two independent guards, because recording can end
      // two ways: our own stop() sets `stopped` before calling recorder.stop(),
      // and a recorder that ends on its own (the capture's tracks stopped under
      // it) leaves state !== 'recording' when the flush arrives.
      if (!stopped && recorder.state === 'recording' && opts.onPrefix && chunks.length > 0) {
        try {
          opts.onPrefix(new Blob(chunks, { type: mimeType }));
        } catch {
          // Provisional display must never be able to break the recording.
        }
      }
    };
    recorder.onerror = () => stop('error');
    recorder.onstop = () => {
      opts.signal?.removeEventListener('abort', onAbort);
      cleanup();
      const blob = new Blob(chunks, { type: mimeType });
      // log only stopReason and counts — no content
      // (transcribe_sent will fire next with bytes; no need for a duplicate event here)
      milestone('capture_stopped', {
        reason: stopReason,
        admitted: admittedAt !== null,
        bytes: blob.size,
      });
      resolve({ blob, stopReason, admitted: admittedAt !== null });
    };

    // ── Silence detection via Web Audio API analyser ───────────────────
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioCtx();
    // 🦊 Firefox / Zen create the context `suspended` under the autoplay policy
    // even inside a user-gesture chain (the awaits before us can drop the
    // activation). A suspended context feeds the analyser pure silence → the VAD
    // sees false-silence and stops at ~1.5s → "listening but doesn't hear".
    // Resume so silence detection reads real levels. Non-blocking: minMs (800ms)
    // covers the resume latency before any silence-stop can fire. The
    // MediaRecorder itself captures audio regardless of context state.
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => { /* fall back to max-duration stop */ });
    }
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const buf = new Float32Array(analyser.fftSize);

    let lastLoudAt = Date.now();
    /** When audio was first demonstrably admitted. Null until it is. */
    let admittedAt: number | null = null;
    const startedAt = Date.now();
    const m = opts.measure;
    let rmsSum = 0;
    const checkSilence = () => {
      if (stopped) return;
      if (m) {
        // ⛔ CALIBRATION ONLY. Apparatus facts read at the poll — the context
        // state production reads once at setup and never again, and the track
        // facts ContinuousConversation watches but the recorder cannot see.
        // Reads only; nothing here influences the stop comparisons below.
        m.scheduledPolls++;
        if (audioCtx.state !== 'running') m.contextTrustBroken = true;
        const tr = stream.getAudioTracks()[0];
        if (tr) {
          if (tr.readyState !== 'live') m.trackEnded = true;
          if (tr.muted) m.trackMuted = true;
        }
        try {
          analyser.getFloatTimeDomainData(buf);
        } catch {
          // Production leaves this unwrapped on purpose: catching there would
          // let the stop comparisons run after a throw and change stop timing.
          m.analyserErrors++;
          return;
        }
      } else {
        analyser.getFloatTimeDomainData(buf);
      }
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
      const rms = Math.sqrt(sumSq / buf.length);
      const now = Date.now();
      if (m) {
        const trusted =
          audioCtx.state === 'running' && !m.trackEnded && !m.trackMuted;
        if (trusted) {
          m.trustedPolls++;
          if (rms >= SILENCE_RMS_THRESHOLD) m.crossingCount++;
        }
        if (rms > m.rmsMax) m.rmsMax = rms;
        rmsSum += rms;
        m.rmsMean = rmsSum / m.scheduledPolls;
      }
      // ⭐ PLATFORM-D02A-01 — ADMISSION, and it is what may ground "listening".
      //
      // The context RUNNING proves the graph is pulling samples from this
      // stream; the track live and unmuted proves the device is delivering
      // them. `getUserMedia` resolving proves neither, which is exactly why the
      // surface could say LISTENING through a suspended context, a muted
      // microphone and an ended track alike.
      //
      // ⛔ Read here rather than inside the calibration block: this is a
      // production fact now, not a measurement. The calibration block keeps its
      // own copy of the same reading because it counts polls, which this does
      // not.
      const liveTrack = stream.getAudioTracks()[0];
      // ⛔ THE POSITIVE REQUIREMENT IS THE GRAPH, and track health only
      // DISQUALIFIES on explicit evidence of deadness. Demanding
      // `readyState === 'live'` would refuse admission in any environment that
      // simply does not populate the property — turning a missing field into a
      // silent "MAIA cannot hear you", which is the same class of lie in the
      // opposite direction.
      const admitted =
        audioCtx.state === 'running' &&
        !!liveTrack &&
        liveTrack.readyState !== 'ended' &&
        liveTrack.muted !== true;
      if (admitted) {
        admittedAt = admittedAt ?? now;
        milestone('audio_admitted', { afterMs: now - startedAt });
      }
      if (rms >= SILENCE_RMS_THRESHOLD) {
        lastLoudAt = now;
        milestone('speech_detected', { afterMs: now - startedAt });
      }
      const elapsed = now - startedAt;
      const silenceFor = now - lastLoudAt;

      // ⛔ NEVER ADMITTED — SAY SO, DO NOT WAIT IT OUT. Without this the capture
      // runs to its utterance ceiling (8 s, or 120 s on Desktop) having never
      // heard anything, and the member watches a word that was never true. The
      // deadline is bounded by admission alone: once audio IS admitted this can
      // no longer fire, so it can never cut an utterance short.
      if (admittedAt === null && elapsed >= opts.admissionDeadlineMs) {
        stop('no_admission');
        return;
      }

      if (elapsed >= opts.maxMs) {
        stop('max');
        return;
      }
      if (elapsed >= opts.minMs && silenceFor >= opts.silenceHoldoffMs) {
        stop('silence');
        return;
      }
    };
    const silenceTimer = setInterval(checkSilence, 100);
    const hardTimer = setTimeout(() => stop('max'), opts.maxMs + 200);

    const cleanup = () => {
      clearInterval(silenceTimer);
      clearTimeout(hardTimer);
      try { source.disconnect(); } catch { /* noop */ }
      try { audioCtx.close(); } catch { /* noop */ }
    };

    try {
      // A timeslice changes only WHEN bytes are handed over, never what is
      // captured: the concatenated chunks are byte-identical to the single blob
      // the no-timeslice path produces.
      if (opts.timesliceMs) recorder.start(opts.timesliceMs);
      else recorder.start();
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}
