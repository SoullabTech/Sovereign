// MAIA Desktop — the turn.
//
// DESKTOP-CONVERSATION-01. Orchestrates one spoken turn end to end:
//
//   WAV → /api/voice/transcribe-simple → transcript
//       → /api/sovereign/app/maia/list  → MAIA's words + audio
//
// ⛔ Reuses the LIVE routes. No Desktop-specific MAIA logic, no parallel
// backend, no second conversation store. `sessionId` is the same continuity key
// the other surfaces use, so a Desktop turn is a turn in the member's existing
// MAIA — which is the whole point of the programme (§VII).
//
// ⭐ MAIA's audio comes back on the SAME call (`includeAudio: true` →
// `audio.audioBase64`), so there is no separate TTS round trip and no second
// place for the voice to diverge from the words.
//
// ⛔ We do NOT reach for /api/voice/openai-tts. If the server's local voice is
// not enabled, that is surfaced as a plain fact — the openai-tts disposition is
// an unresolved canon conflict (MAIA-D00 §5.4) and Desktop will not quietly
// resolve it by using cloud TTS.

'use strict';

const { encodeWav } = require('./voice/wav');

const TRANSCRIBE_PATH = '/api/voice/transcribe-simple';
const MAIA_PATH = '/api/sovereign/app/maia/list';

/**
 * Human-readable meaning for the failures this path actually produces, so the
 * surface never shows a bare status code to someone who just spoke.
 */
function explain(status, body) {
  if (status === 401) return 'Session expired — please sign in again.';
  if (status === 410) return 'Audio transcription is disabled on the server (ALLOW_AUDIO_TRANSCRIPTION).';
  if (status === 413) return 'That was too long to send in one piece.';
  if (status === 415) return 'The audio was not accepted as a file upload.';
  if (status === 404) return 'That endpoint is not available on this server.';
  return (body && body.error) || `Request failed (${status}).`;
}

function createConversation({ session, diagnostics, sessionId }) {
  let convId = sessionId;

  async function transcribe(samples, sampleRate) {
    const wav = encodeWav(samples, sampleRate);
    diagnostics.emit('voice_transcribe_sent', { bytes: wav.byteLength });

    const form = new FormData();
    // Content-Type is deliberately NOT set — the route rejects a manually set
    // one, and fetch must be left to write the multipart boundary itself.
    form.append('file', new Blob([wav], { type: 'audio/wav' }), 'utterance.wav');

    const out = await session.authedFetch(TRANSCRIBE_PATH, { method: 'POST', body: form });
    if (!out.ok) {
      let body = null;
      try { body = out.res ? await out.res.json() : null; } catch { /* not JSON */ }
      const message = out.error || explain(out.status, body);
      diagnostics.emit('voice_transcribe_error', { errorName: `http_${out.status || 0}` });
      return { ok: false, error: message };
    }

    const data = await out.res.json();
    const text = (data && data.transcription) || '';
    diagnostics.emit('voice_transcribe_result', { chars: text.trim().length });
    return { ok: true, text };
  }

  async function ask(message) {
    const out = await session.authedFetch(MAIA_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: convId,
        message,
        includeAudio: true,
      }),
    });
    if (!out.ok) {
      let body = null;
      try { body = out.res ? await out.res.json() : null; } catch { /* not JSON */ }
      return { ok: false, error: out.error || explain(out.status, body) };
    }

    const data = await out.res.json();
    const text = (data && data.message) || '';
    const audio = data && data.audio && data.audio.audioBase64
      ? { base64: data.audio.audioBase64, format: data.audio.format || 'mp3' }
      : null;
    // `chars` only. MAIA's words go to the surface, never to telemetry.
    diagnostics.emit('voice_turn_committed', { chars: text.length, finals: 1 });
    return { ok: true, text, audio };
  }

  return { transcribe, ask, conversationId: () => convId, TRANSCRIBE_PATH, MAIA_PATH };
}

module.exports = { createConversation, explain, TRANSCRIBE_PATH, MAIA_PATH };
