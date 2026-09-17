/**
 * DESKTOP-SOVEREIGN-STT-INTERIM-01 — first-party provisional transcription.
 *
 * Desktop records to Soullab's Whisper route rather than browser speech. The
 * final one-shot result is authoritative, but without provisional reads the
 * member sees nothing while speaking. This module re-transcribes the growing
 * MediaRecorder prefix and emits DISPLAY-ONLY text.
 *
 * A provisional result must never become a member turn, persistence, memory,
 * or conversation state. Recording end or capture revocation closes delivery.
 */

import { logVoiceEvent } from './voiceDiagnostics';
import { readTranscript } from './transcribeResponse';
import { apiFetch } from '@/lib/http/apiBase';

const DEFAULT_PARTIAL_INTERVAL_MS = 900;
const MIN_PREFIX_BYTES = 2000;
// Long turns freeze only the provisional display. Final capture stays complete.
const MAX_PARTIAL_PREFIX_BYTES = 200_000;

export interface RollingPartialOptions {
  mimeType: string;
  onPartial: (text: string) => void;
  intervalMs?: number;
  signal?: AbortSignal;
}

export interface RollingPartialTranscriber {
  offerPrefix(prefix: Blob): void;
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
  let nextSeq = 1;
  let lastDeliveredSeq = 0;
  let attempts = 0;
  let delivered = 0;
  let failures = 0;
  let frozenForSize = false;

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
      formData.append(
        'file',
        new File([prefix], `provisional-prefix.${ext}`, { type: mimeType }),
      );
      formData.append('provisional', 'true');

      const response = await apiFetch('/api/voice/transcribe-simple', {
        method: 'POST',
        body: formData,
        ...(signal ? { signal } : {}),
      });
      if (!response.ok) {
        failures += 1;
        return;
      }

      const text = readTranscript(await response.json());
      // Final authority, revocation, and monotonic delivery all win races.
      if (revoked() || seq <= lastDeliveredSeq || !text) return;

      lastDeliveredSeq = seq;
      delivered += 1;
      onPartial(text);
    } catch {
      if (!revoked()) failures += 1;
    } finally {
      inFlight = false;
    }
  }

  return {
    offerPrefix(prefix: Blob): void {
      if (revoked() || inFlight) return;
      if (prefix.size < MIN_PREFIX_BYTES) return;
      if (prefix.size > MAX_PARTIAL_PREFIX_BYTES) {
        frozenForSize = true;
        return;
      }

      const now = Date.now();
      if (now - lastDispatchAt < intervalMs) return;
      lastDispatchAt = now;
      inFlight = true;
      void dispatch(prefix, nextSeq++);
    },

    close(): void {
      if (closed) return;
      closed = true;
      logVoiceEvent('voice_partial_summary', {
        attempts,
        delivered,
        failures,
        frozenForSize,
      });
    },
  };
}
