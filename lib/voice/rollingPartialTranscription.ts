/**
 * DESKTOP-SOVEREIGN-STT-INTERIM-01 — sovereign provisional transcription.
 *
 * ⛔ THE DEFECT THIS ANSWERS. The Desktop sovereign transport is one-shot: it
 * records an utterance, waits for silence, POSTs the finished blob to local
 * Whisper, and only then produces text. Nothing appears while the member is
 * speaking, so `DESKTOP-SOVEREIGN-STT-01` bought a sovereign transcript at the
 * cost of the *"I can see that she is hearing me"* layer the old
 * browser-recognition experience had. That is a parity regression, not a
 * capture failure — capture lifecycle S4–S9 is green.
 *
 * ⛔ WHAT THIS IS NOT. It is NOT browser `SpeechRecognition`. Reintroducing it
 * for partial words would hand member audio back to a network-dependent,
 * browser-managed recognition service — precisely what the sovereign Desktop
 * ruling forbids (`docs/ops/MAIA-D01_NATIVE_VOICE_DESKTOP_WITNESS_2026-08-25.md`
 * §XII). Every byte here goes to the same first-party `/api/voice/transcribe-simple`
 * → local maia-whisper as the final transcript does. Same route, same gate,
 * same container.
 *
 * ── HOW ────────────────────────────────────────────────────────────────────
 * While `MediaRecorder` records with a timeslice, each `dataavailable` grows
 * the chunk list. Chunk 0 carries the container header, so `chunks[0..n]`
 * concatenated is always a *decodable prefix* of the utterance-so-far. We
 * transcribe that growing prefix. Whisper re-reads the whole prefix each time,
 * so later audio can REPLACE earlier provisional words rather than only append
 * to them — which is what makes this read as recognition rather than as a
 * ticker.
 *
 * ── THE LOAD-BEARING CONSTRAINT ────────────────────────────────────────────
 * ⛔⛔ A member turn is born ONCE. Nothing this module produces may become a
 * MAIA turn. It has exactly one output — a callback carrying provisional text
 * for display — and no path to `onTranscript`, to persistence, to memory, or
 * to the conversation record. `/api/voice/transcribe-simple` writes nothing to
 * any store (verified 2026-08-29: the route has no DB access at all), so a
 * provisional POST leaves no trace beyond the request log.
 *
 * ── REVOCATION ─────────────────────────────────────────────────────────────
 * ⛔ Partials INHERIT the capture's revocation; they do not route around it.
 * The same `AbortSignal` that `DESKTOP-SOVEREIGN-STT-LIFECYCLE-01` (11bd40e3)
 * gave the one-shot capture governs this stream too: it stops dispatch, aborts
 * the in-flight upload, and blocks delivery of a result that arrives late. A
 * capture the member walked away from cannot show text either.
 */

import { logVoiceEvent } from './voiceDiagnostics';
import { readTranscript } from './transcribeResponse';
import { apiFetch } from '@/lib/http/apiBase';

/** Minimum wall-clock between provisional requests. */
const DEFAULT_PARTIAL_INTERVAL_MS = 900;

/**
 * Below this, a prefix is header + noise. Transcribing it wastes a Whisper
 * call and tends to return hallucinated filler on near-silence.
 */
const MIN_PREFIX_BYTES = 2000;

export interface RollingPartialOptions {
  mimeType: string;
  /** Provisional text for DISPLAY ONLY. Never a turn. */
  onPartial: (text: string) => void;
  intervalMs?: number;
  signal?: AbortSignal;
}

export interface RollingPartialTranscriber {
  /**
   * Offer the audio captured so far. Fire-and-forget: throttled, deduplicated
   * against an in-flight request, and silently dropped when not eligible.
   */
  offerPrefix(prefix: Blob): void;
  /**
   * Stop delivering. Called the moment recording ends — from then on the FINAL
   * transcript is the only authority, and a partial still in flight must not
   * overwrite it.
   */
  close(): void;
}

export function createRollingPartialTranscriber(
  options: RollingPartialOptions,
): RollingPartialTranscriber {
  const { mimeType, onPartial, signal } = options;
  const intervalMs = options.intervalMs ?? DEFAULT_PARTIAL_INTERVAL_MS;

  let closed = false;
  let inFlight = false;
  let lastDispatchAt = 0;
  /** Monotonic issue order, so a slow result cannot overwrite a newer one. */
  let nextSeq = 1;
  let lastDeliveredSeq = 0;

  let attempts = 0;
  let delivered = 0;
  let failures = 0;

  const revoked = (): boolean => closed || signal?.aborted === true;

  const ext = mimeType.includes('webm') ? 'webm'
    : mimeType.includes('mp4') ? 'm4a'
    : mimeType.includes('wav') ? 'wav'
    : mimeType.includes('ogg') ? 'ogg'
    : 'webm';

  async function dispatch(prefix: Blob, seq: number): Promise<void> {
    attempts += 1;
    try {
      const formData = new FormData();
      formData.append('file', new File([prefix], `provisional-prefix.${ext}`, { type: mimeType }));
      // Marks the request as display-only for anyone reading the route's logs.
      // The route ignores unknown fields; this claims nothing about server
      // behaviour, it only makes the intent legible at the boundary.
      formData.append('provisional', 'true');

      const response = await apiFetch('/api/voice/transcribe-simple', {
        method: 'POST',
        body: formData,
        // Revocation cancels the upload itself, not merely its result.
        ...(signal ? { signal } : {}),
      });

      if (!response.ok) {
        failures += 1;
        return;
      }

      const text = readTranscript(await response.json());

      // ⛔ THE DELIVERY GATE. Three ways this result has lost the right to be
      // shown: authority was revoked, recording ended (the final transcript now
      // owns the text), or a NEWER partial already landed. Silence in all three.
      if (revoked()) return;
      if (seq <= lastDeliveredSeq) return;
      if (!text) return;

      lastDeliveredSeq = seq;
      delivered += 1;
      onPartial(text);
    } catch {
      // A revoked fetch is this module working, not a transport failure. Either
      // way a provisional request is never worth surfacing to the member.
      if (!revoked()) failures += 1;
    } finally {
      inFlight = false;
    }
  }

  return {
    offerPrefix(prefix: Blob): void {
      if (revoked()) return;
      if (inFlight) return;                       // newer audio will supersede
      if (prefix.size < MIN_PREFIX_BYTES) return;
      const now = Date.now();
      if (now - lastDispatchAt < intervalMs) return;

      lastDispatchAt = now;
      inFlight = true;
      void dispatch(prefix, nextSeq++);
    },

    close(): void {
      if (closed) return;
      closed = true;
      // Counts only — no transcript content, no lengths that could reconstruct it.
      logVoiceEvent('voice_partial_summary', { attempts, delivered, failures });
    },
  };
}
