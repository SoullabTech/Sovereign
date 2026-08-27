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

// ⛔ RETRACTED 2026-08-27. A TRANSPORT_CEILING_BYTES of 460 KB used to live
// here, on the reasoning that bodies over ~512 KB were rejected. The server log
// disproved it outright: 861996 bytes returned 339 chars and 1455660 bytes
// returned 75 chars, both HTTP 200, both reaching the route and Whisper
// normally. There is no size limit and no duration limit. The guard is gone
// rather than left in place "just in case" — a limit justified by a disproven
// measurement would silently refuse turns the server handles fine, and would
// outlive everyone's memory of why it was added.

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
  // ⭐ The route explains its own failures — `error` plus a `details` field
  // carrying the upstream message. Showing a bare status code when the server
  // told us why is a diagnostic loss, and it cost a device walk (2026-08-27).
  if (body && body.error) {
    return body.details ? `${body.error} — ${String(body.details).slice(0, 300)}` : body.error;
  }
  // Not JSON at all: an error page from the proxy or the framework rather than
  // from the route. Say so, and carry a readable fragment of whatever it was.
  if (body && body.__raw) return `Request failed (${status}). Server said: ${body.__raw}`;
  return `Request failed (${status}).`;
}

/**
 * Read an error body without assuming it is JSON. A non-JSON body is itself
 * evidence — it means the response did not come from the route handler — so it
 * is preserved as `__raw` rather than discarded.
 */
async function readErrorBody(res) {
  if (!res) return null;
  let text = '';
  try { text = await res.text(); } catch { return null; }
  if (!text) return null;
  try { return JSON.parse(text); } catch { /* fall through */ }
  return { __raw: text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) };
}


// ── multipart with a known length ────────────────────────────────────────────
//
// ⭐ Node's fetch streams a FormData/Blob body with chunked transfer-encoding
// and no Content-Length once it is large enough not to buffer. A browser always
// sends Content-Length for FormData — which is why every existing client of
// this route works and Desktop alone was seeing intermittent failures that
// never reached the handler (server log, 2026-08-27: the failing requests are
// absent from it entirely, while 1455660 bytes succeeded).
//
// middleware.ts matches every API route and buffers the request body before the
// handler runs. A body of unknown length is the thing that distinguishes our
// requests from every request this route has served in production.
//
// So the multipart envelope is built here as one contiguous buffer. fetch sets
// Content-Length from it because the length is known. Nothing about the request
// the server sees changes otherwise — same field name, same filename, same
// content type.
const BOUNDARY = 'maiadesktop6f1a2b3c4d5e';

function multipartWav(wav, filename) {
  const head = Buffer.from(
    `--${BOUNDARY}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
    'Content-Type: audio/wav\r\n\r\n',
    'utf8',
  );
  const tail = Buffer.from(`\r\n--${BOUNDARY}--\r\n`, 'utf8');
  return Buffer.concat([head, Buffer.from(wav.buffer, wav.byteOffset, wav.byteLength), tail]);
}

const MULTIPART_HEADERS = Object.freeze({
  'Content-Type': `multipart/form-data; boundary=${BOUNDARY}`,
});

function createConversation({ session, diagnostics, sessionId }) {
  let convId = sessionId;

  // The device walk (2026-08-27) produced `chars=0` on a request that had
  // succeeded, and there was no way to tell whether the mic had captured
  // near-silence or whether the failure was downstream. Level is structure, not
  // content — it says how loud, never what was said — so it belongs in
  // diagnostics and answers that question the next time it is asked.
  function level(samples) {
    let peak = 0, sum = 0;
    for (let i = 0; i < samples.length; i++) {
      const v = samples[i]; const a = v < 0 ? -v : v;
      if (a > peak) peak = a;
      sum += v * v;
    }
    const rms = samples.length ? Math.sqrt(sum / samples.length) : 0;
    return { peakX1000: Math.round(peak * 1000), rmsX1000: Math.round(rms * 1000) };
  }

  async function transcribe(samples, sampleRate) {
    const wav = encodeWav(samples, sampleRate);
    const { peakX1000, rmsX1000 } = level(samples);
    diagnostics.emit('voice_transcribe_sent', {
      bytes: wav.byteLength,
      seconds: Math.round((samples.length / (sampleRate || 1)) * 10) / 10,
      peakX1000,
      rmsX1000,
    });


    const payload = multipartWav(wav, 'utterance.wav');

    let out = await session.authedFetch(TRANSCRIBE_PATH, {
      method: 'POST', headers: MULTIPART_HEADERS, body: payload,
    });
    let body = out.ok ? null : await readErrorBody(out.res);

    // ⭐ ONE RETRY, and only for a failure that never reached the route.
    //
    // The server log (2026-08-27) showed every request it received succeeding,
    // including 1.4 MB ones, while the app was being handed Next's /_error page
    // for requests that appear nowhere in that log. Whatever drops them sits
    // between the two and is not yet understood — so this is an admitted
    // MITIGATION, not a fix, and it is deliberately narrow: only a 5xx whose
    // body is not the route's own JSON, only once, never on 4xx.
    //
    // Retrying is safe here specifically because a failed transcription stores
    // nothing and forms no memory. If that ever stops being true, this must go.
    if (!out.ok && out.status >= 500 && body && body.__raw) {
      diagnostics.emit('voice_transcribe_sent', { bytes: wav.byteLength, source: 'retry' });
      out = await session.authedFetch(TRANSCRIBE_PATH, {
        method: 'POST', headers: MULTIPART_HEADERS, body: payload,
      });
      body = out.ok ? null : await readErrorBody(out.res);
    }

    if (!out.ok) {
      const message = out.error || explain(out.status, body);
      // The event carries the shape of the failure, never the server's prose —
      // `details` can quote upstream output and telemetry is not the place for
      // it. The member-facing surface gets the full message instead.
      diagnostics.emit('voice_transcribe_error', {
        errorName: `http_${out.status || 0}`,
        source: body && body.__raw ? 'non_route' : 'route',
      });
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
      const body = await readErrorBody(out.res);
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

module.exports = { createConversation, explain, readErrorBody, multipartWav, BOUNDARY, TRANSCRIBE_PATH, MAIA_PATH };
