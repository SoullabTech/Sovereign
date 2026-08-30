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

import { logVoiceEvent } from './voiceDiagnostics';
import { readTranscript } from './transcribeResponse';
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

export interface FallbackResult {
  ok: boolean;
  transcript?: string;
  reason?:
    | 'recording_unsupported'  // MediaRecorder not available / no supported mime
    | 'recording_error'         // MediaRecorder threw mid-recording
    | 'empty_blob'              // recording produced no bytes
    | 'transcribe_http_error'   // /api/voice/transcribe-simple non-2xx
    | 'transcribe_disabled'     // 410 from the route (env gate off)
    | 'aborted'                 // the caller revoked this capture's authority
    | 'empty_transcript'        // Whisper returned blank text
    | 'no_speech_detected'      // capture ended having never heard the member
    | 'unknown';
  durationMs?: number;
  bytes?: number;
}

interface RunOptions {
  maxMs?: number;
  silenceHoldoffMs?: number;
  minMs?: number;
  /**
   * DESKTOP-LISTENING-PRESENCE-01 — live loudness from the analyser this unit
   * ALREADY runs for silence detection. No second AudioContext, no second
   * stream, no network.
   *
   * ⛔ WHY IT EXISTS. Sovereign STT is batch: the member sees nothing until
   * they stop talking, and cannot tell being heard from being broken. They
   * said so mid-utterance, on the record: "I'm not very confident this is
   * working." This is evidence of hearing, not transcript text — the true
   * live transcript is a separate streaming-STT unit and must not be faked
   * by polling a batch endpoint.
   *
   * `level` is normalised 0..1 for display; `speaking` is whether this sample
   * crossed the speech threshold.
   */
  onLevel?: (level: number, speaking: boolean) => void;
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
  let blob: Blob;
  let heardSpeech = false;
  try {
    const captured = await recordWithSilenceDetection(stream, mimeType, {
      maxMs,
      silenceHoldoffMs,
      minMs,
      signal,
      ...(options.onLevel ? { onLevel: options.onLevel } : {}),
    });
    blob = captured.blob;
    heardSpeech = captured.heardSpeech;
  } catch (err: unknown) {
    const name = err instanceof Error ? err.name : 'unknown';
    logVoiceEvent('voice_fallback_failed', {
      reason: 'recording_error',
      errorName: String(name).slice(0, 60),
    });
    return { ok: false, reason: 'recording_error' };
  }

  const durationMs = Date.now() - startedAt;

  // ⛔ THE GATE THIS UNIT EXISTS FOR. Recording is over; the network request has
  // not happened yet. If authority was revoked at any point up to here, the
  // member's audio does not leave the device. Checked BEFORE the empty-blob
  // branch so an abort is reported as an abort rather than as a recording
  // failure.
  if (aborted()) return abortResult(durationMs, blob.size);

  if (blob.size === 0) {
    logVoiceEvent('voice_fallback_failed', { reason: 'empty_blob', durationMs });
    return { ok: false, reason: 'empty_blob', durationMs };
  }

  // ⭐ THE ANTI-GHOST BOUNDARY. A capture whose analyser never once crossed the
  // speech threshold heard no member. Room tone is not a turn, so it is not
  // submitted — no request, no transcript, no member bubble, no conversation
  // mutation.
  //
  // ⛔ THIS IS WHERE THE GUARD BELONGS. The device witness of 2026-08-30 saw a
  // mic that opened uninvited record 1.5s of silence, which Whisper rendered as
  // "You"; that ghost turn was answered and DISPLACED the member's real
  // exchange. The first repair prevented it upstream, by refusing to reopen the
  // microphone after a response that made no sound — but that conflated MAIA's
  // speaker working with the member's consent still existing, and so ended
  // every hands-free conversation after one turn. Consent belongs upstream;
  // "was anyone actually speaking" belongs HERE, where the audio is.
  //
  // ⛔ AND IT IS NOT THE CAPTURE FLOOR. That rule says waiting before the
  // member speaks is not silence after speech, so the recorder keeps listening.
  // This one says: if the whole capture went by and nobody ever spoke, do not
  // invent a turn out of it. Together they let a member take as long as they
  // like to begin, without the silence becoming words.
  if (!heardSpeech) {
    logVoiceEvent('voice_fallback_failed', {
      reason: 'no_speech_detected',
      durationMs,
      bytes: blob.size,
    });
    return { ok: false, reason: 'no_speech_detected', durationMs, bytes: blob.size };
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
    onLevel?: (level: number, speaking: boolean) => void;
  },
): Promise<{ blob: Blob; heardSpeech: boolean }> {
  return new Promise<{ blob: Blob; heardSpeech: boolean }>((resolve, reject) => {
    const chunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType });
    } catch (err) {
      reject(err);
      return;
    }

    let stopped = false;
    let stopReason: 'silence' | 'max' | 'error' | 'aborted' = 'silence';

    const stop = (reason: 'silence' | 'max' | 'error' | 'aborted') => {
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
      // log only stopReason and counts — no content
      // (transcribe_sent will fire next with bytes; no need for a duplicate event here)
      void stopReason;
      // `lastLoudAt` is null only if no sample ever crossed the speech
      // threshold — the analyser heard the room, never the member. Reported so
      // the caller can decline to turn silence into a turn.
      resolve({ blob, heardSpeech: lastLoudAt !== null });
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

    // ⭐ THE SILENCE CLOCK DOES NOT START UNTIL THE MEMBER DOES.
    //
    // ⛔ THE DEFECT, device-witnessed 2026-08-30. `lastLoudAt` was seeded with
    // the recording's own start time, so the holdoff ran from the moment the
    // microphone opened rather than from the end of speech. A member who tapped
    // and then took a breath had the recorder close itself at ~1.5s — the
    // "tried to listen but quickly clicked off" report — and an auto-armed mic
    // that nobody spoke into recorded 1.5s of room tone, which Whisper
    // hallucinated into a 3-character turn ("You"). Both symptoms, one cause.
    //
    // `null` means "not heard yet". Until the analyser reads one sample above
    // threshold the silence branch cannot fire at all; the member has as long
    // as they need to begin, bounded only by `maxMs`, which remains the safety
    // ceiling it was always meant to be — never a turn boundary.
    let lastLoudAt: number | null = null;
    const startedAt = Date.now();
    const checkSilence = () => {
      if (stopped) return;
      analyser.getFloatTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) sumSq += buf[i] * buf[i];
      const rms = Math.sqrt(sumSq / buf.length);
      const now = Date.now();
      const speaking = rms >= SILENCE_RMS_THRESHOLD;
      if (speaking) lastLoudAt = now;
      // Presence, from the analyser already running for silence detection.
      // Scaled so ordinary speech fills the indicator without clipping every
      // sample to 1; the threshold itself sits well inside the range.
      opts.onLevel?.(Math.min(1, rms / 0.15), speaking);
      const elapsed = now - startedAt;
      if (elapsed >= opts.maxMs) {
        stop('max');
        return;
      }
      // Nothing has been heard yet — there is no silence to hold off from.
      // Waiting is not a finished turn.
      if (lastLoudAt === null) return;
      const silenceFor = now - lastLoudAt;
      if (elapsed >= opts.minMs && silenceFor >= opts.silenceHoldoffMs) {
        stop('silence');
        return;
      }
    };
    // ⭐ SAMPLE ONCE IMMEDIATELY. The interval below ticks every 100ms, so a
    // capture shorter than one tick would reach the anti-ghost gate having
    // never sampled the analyser and be judged "nobody spoke" — discarding a
    // real, if brief, utterance. The first reading costs nothing and makes the
    // speech evidence start when the capture does.
    checkSilence();
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
