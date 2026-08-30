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
 * here, and the utterance bounds above are untouched.
 *
 * 2500 ms because an AudioContext resume and a first analyser poll are
 * sub-second on every surface measured so far: generous enough that a slow
 * device is not called a failure, short enough that a member is not left in
 * front of a lie.
 */
const ADMISSION_DEADLINE_MS = 2500;

/**
 * ⭐ PLATFORM-D02A-01 — THE RATIFIED CAPTURE MILESTONES.
 *
 * `/maia` declared LISTENING the instant `getUserMedia` resolved — before the
 * recorder existed, before the analyser existed, before one sample was
 * admitted. The claim was therefore true through a suspended AudioContext, a
 * muted or ended track, a route that 410s, and a recording that never stopped.
 * One word for every failure, distinguishing none of them.
 *
 * These name the stages a capture actually passes through, so a walk can say
 * where it stopped instead of showing one word for all of it.
 *
 *   recorder_created    MediaRecorder constructed on this stream
 *   audio_admitted      ⭐ the graph is RUNNING and nothing says the track is
 *                       dead — the first evidence audio is arriving. This, and
 *                       nothing earlier, may ground "listening".
 *   speech_detected     a poll crossed SILENCE_RMS_THRESHOLD
 *   capture_stopped     with the reason it ended
 *
 * ⛔ Each fires AT MOST ONCE except `capture_stopped`. They are observations,
 * never instructions: no branch in this module reads a milestone back.
 */
export type CaptureMilestone =
  | 'recorder_created'
  | 'audio_admitted'
  | 'speech_detected'
  | 'capture_stopped';

/**
 * What a recording produced, and how it ended.
 *
 * ⛔ `stopReason` used to be computed and then discarded (`void stopReason`),
 * so a capture that never heard was indistinguishable from a short silence —
 * the caller posted an unheard blob to Whisper and reported an empty
 * transcript. The reason is carried now because it is the difference between
 * "you said nothing" and "we never heard you".
 */
interface CaptureOutcome {
  blob: Blob;
  stopReason: 'silence' | 'max' | 'error' | 'aborted' | 'no_admission';
}

export interface FallbackResult {
  ok: boolean;
  transcript?: string;
  reason?:
    | 'recording_unsupported'  // MediaRecorder not available / no supported mime
    | 'recording_error'         // MediaRecorder threw mid-recording
    | 'empty_blob'              // recording produced no bytes
    | 'no_audio_admitted'       // PLATFORM-D02A-01: the apparatus never heard —
                                // graph never RUNNING, or the track reported
                                // dead throughout. NOT the member being quiet.
    | 'transcribe_http_error'   // /api/voice/transcribe-simple non-2xx
    | 'transcribe_disabled'     // 410 from the route (env gate off)
    | 'aborted'                 // the caller revoked this capture's authority
    | 'empty_transcript'        // Whisper returned blank text
    | 'unknown';
  durationMs?: number;
  bytes?: number;
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
   * PLATFORM-D02A-01 — capture stage reports, for a surface that must not claim
   * to be listening before audio is admitted.
   *
   * ⛔ OPTIONAL, AND OBSERVATIONS ONLY. A caller that passes nothing behaves
   * exactly as before; nothing in this module branches on a milestone.
   */
  onMilestone?: (stage: CaptureMilestone, detail?: Record<string, unknown>) => void;
  /**
   * Override the admission deadline. Tests only — production takes the
   * constant, so the bound cannot drift per call site.
   */
  admissionDeadlineMs?: number;
}

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

  // ── Record ────────────────────────────────────────────────────────────
  let outcome: CaptureOutcome;
  try {
    outcome = await recordWithSilenceDetection(stream, mimeType, {
      maxMs,
      silenceHoldoffMs,
      minMs,
      signal,
      ...(options.onMilestone ? { onMilestone: options.onMilestone } : {}),
      admissionDeadlineMs: options.admissionDeadlineMs ?? ADMISSION_DEADLINE_MS,
    });
  } catch (err: unknown) {
    const name = err instanceof Error ? err.name : 'unknown';
    logVoiceEvent('voice_fallback_failed', {
      reason: 'recording_error',
      errorName: String(name).slice(0, 60),
    });
    return { ok: false, reason: 'recording_error' };
  }

  const { blob } = outcome;
  const durationMs = Date.now() - startedAt;

  // ⛔ THE GATE THIS UNIT EXISTS FOR. Recording is over; the network request has
  // not happened yet. If authority was revoked at any point up to here, the
  // member's audio does not leave the device. Checked BEFORE the empty-blob
  // branch so an abort is reported as an abort rather than as a recording
  // failure.
  if (aborted()) return abortResult(durationMs, blob.size);

  // ⛔ PLATFORM-D02A-01 — NEVER HEARD, SAID PLAINLY.
  //
  // Audio was never demonstrably admitted for the whole deadline. Posting this
  // to Whisper returns an empty transcript and the member is told they said
  // nothing — blaming them for an apparatus that was not listening. Distinct
  // from `empty_blob`, which is a real recording that happens to be quiet.
  //
  // ⛔ KEYED ON THE DEADLINE HAVING FIRED, not on a flag. Admission is observed
  // on a 100 ms poll, so a capture that ends before its first tick has proved
  // nothing either way; reading a bare flag would accuse a perfectly good short
  // recording — and one the member ABORTED — of never being heard.
  if (outcome.stopReason === 'no_admission') {
    logVoiceEvent('voice_fallback_failed', {
      reason: 'no_audio_admitted', durationMs, bytes: blob.size,
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
    maxMs: number; silenceHoldoffMs: number; minMs: number; signal?: AbortSignal;
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
    let stopReason: CaptureOutcome['stopReason'] = 'silence';

    const stop = (reason: CaptureOutcome['stopReason']) => {
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
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => stop('error');
    recorder.onstop = () => {
      opts.signal?.removeEventListener('abort', onAbort);
      cleanup();
      const blob = new Blob(chunks, { type: mimeType });
      milestone('capture_stopped', { reason: stopReason, bytes: blob.size });
      resolve({ blob, stopReason });
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
    const checkSilence = () => {
      if (stopped) return;
      analyser.getFloatTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
      const rms = Math.sqrt(sumSq / buf.length);
      const now = Date.now();
      // ⭐ PLATFORM-D02A-01 — ADMISSION, and it is what may ground "listening".
      //
      // The context RUNNING proves the graph is pulling samples from this
      // stream. `getUserMedia` resolving proves nothing of the kind, which is
      // why the surface could say LISTENING through a suspended context, a
      // muted microphone and an ended track alike.
      //
      // ⛔ THE POSITIVE REQUIREMENT IS THE GRAPH; track health only
      // DISQUALIFIES on explicit evidence of deadness. Demanding
      // `readyState === 'live'` would refuse admission in any environment that
      // simply does not populate the property — turning a missing field into a
      // silent "MAIA cannot hear you", the same lie in the other direction.
      const liveTrack = stream.getAudioTracks()[0];
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
      // runs to its utterance ceiling having never heard anything, and the
      // member watches a word that was never true. Bounded by admission alone:
      // once audio IS admitted this can no longer fire, so it can never cut an
      // utterance short.
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
      recorder.start();
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}
