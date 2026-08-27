// MAIA Desktop — transcription transport.
//
// MAIA-D01. Pure of Electron; `fetchImpl` is injected so the retry, failure and
// boundary behaviour can be proven without a network or a microphone.
//
// The backend is the SAME self-hosted whisper the web path already uses
// (`maia-whisper`, reached through the app's own /api/voice/transcribe-simple).
// D01 introduces no transcription service of its own — MAIA-D00 §5.4 witnessed
// that this substrate already exists, and the scope ruling forbids creating a
// parallel MAIA backend.
//
// ⛔ Web Speech API is not reachable from here by construction: this module
// speaks HTTP to our own route and has no recognition object at all.
//
// ── FAILURE IS A BOUNDARY, NOT A HOLE ───────────────────────────────────────
// When transcription fails after its retries, this module does NOT swallow the
// audio. It reports the failure and returns `ok:false`, so the caller closes the
// epoch through the one path that must account for unfinished material. A
// transcription failure that quietly returned empty text would satisfy every
// type signature and lose the member's words — which is the whole defect class
// this unit exists to make impossible.

'use strict';

const DEFAULTS = Object.freeze({
  maxAttempts: 3,
  // Backoff is returned to the caller rather than slept on here: a pure module
  // does not own time.
  backoffMs: [0, 400, 1200],
  timeoutMs: 30000,
});

/**
 * @param {object} deps
 * @param {(url: string, init: object) => Promise<any>} deps.fetchImpl
 * @param {{emit: (e: string, m?: object) => void}} deps.diagnostics
 * @param {string} [deps.endpoint]
 * @param {(ms: number) => Promise<void>} [deps.sleep]
 * @param {object} [deps.config]
 */
function createTranscriptionClient({ fetchImpl, diagnostics, endpoint, sleep, config } = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('transcription requires fetchImpl');
  if (!diagnostics || typeof diagnostics.emit !== 'function') throw new Error('transcription requires diagnostics');
  const cfg = { ...DEFAULTS, ...(config || {}) };
  const url = endpoint || '/api/voice/transcribe-simple';
  const wait = sleep || (async () => {});

  /**
   * Send one audio segment.
   * @returns {Promise<{ok: boolean, text: string|null, attempts: number, errorName: string|null}>}
   */
  async function send(segment, meta = {}) {
    const bytes = segment && segment.byteLength != null ? segment.byteLength
      : (segment && segment.length != null ? segment.length : 0);
    diagnostics.emit('voice_transcribe_sent', { bytes, epochId: meta.epochId ?? null });

    let lastErrorName = null;
    for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
      if (attempt > 1) await wait(cfg.backoffMs[attempt - 1] ?? 1200);
      try {
        const res = await fetchImpl(url, {
          method: 'POST',
          headers: meta.headers || {},
          body: segment,
          timeoutMs: cfg.timeoutMs,
        });
        if (!res || res.ok !== true) {
          lastErrorName = `http_${res && res.status != null ? res.status : 'unknown'}`;
          continue;
        }
        const data = typeof res.json === 'function' ? await res.json() : res.body;
        const text = data && typeof data.text === 'string' ? data.text : '';
        // An EMPTY result is a legitimate answer ("no speech in this segment"),
        // not a failure. Reported as a result so the two stay distinguishable.
        diagnostics.emit('voice_transcribe_result', { chars: text.trim().length, attempts: attempt });
        return { ok: true, text, attempts: attempt, errorName: null };
      } catch (e) {
        lastErrorName = (e && e.name) || 'Error';
      }
    }

    diagnostics.emit('voice_transcribe_error', {
      errorName: lastErrorName || 'Error', attempts: cfg.maxAttempts,
    });
    return { ok: false, text: null, attempts: cfg.maxAttempts, errorName: lastErrorName };
  }

  return { send, endpoint: url, config: cfg };
}

module.exports = { createTranscriptionClient, DEFAULTS };
