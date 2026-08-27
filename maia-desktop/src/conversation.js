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
// ⭐ D04. The member's existing thread, from the server rather than from this
// device. GET with no sessionId returns their last 50 turns across ALL
// surfaces, newest first, each carrying its session_id — so the thread the
// member was last in on iPhone or web is simply readable. Passing a sessionId
// returns that thread in order.
const TURNS_PATH = '/api/conversation/turns';

// ── D02 · the near-silence gate ─────────────────────────────────────────────
//
// Whisper's multilingual `base` model hallucinates on near-silence, and it does
// not hallucinate quietly — it emits a phrase repeated thirty or a hundred
// times. On the 2026-08-27 long walk MAIA received one such loop and answered
// it as if it were speech: "that's not a thought, that's something trying to
// break through." She offered depth-psychological framing about words the
// member never said. That is a sovereignty defect, not only a reliability one.
//
// The level fields make it separable. Every turn from that walk, by rms:
//
//     rms  7  8  9 14 16 16 18 23 28 30 33   loops, fragments, invented text
//     rms 54 70 72 76 77 86 87 99 139 148    accurate transcription
//
// ⛔ THE THRESHOLD IS DELIBERATELY BELOW THE GAP. The first walk separated
// cleanly around 40 and 40 was the tempting choice. A second walk settled it:
//
//     rms 19 → 39 chars    rms 24 → 126 chars
//     rms 32 → 56 chars    rms 42 →  95 chars
//
// all four genuine speech. A cut at 40 would have discarded three of them. The
// tail invariant says a member's speech is never silently discarded, and quiet
// real speech is a far worse loss than an occasional hallucination getting
// through — so the gap in the first sample was not a boundary, it was an
// artifact of that sample.
//
// The cut is 12: below the quietest real speech observed (19) with margin, and
// above the loudest confirmed room tone (9) with margin. It moves DOWN on new
// evidence of quiet speech; it does not move up to catch more hallucinations.
//
// ⛔ AND IT IS NEVER SILENT. A gated turn is reported to the member in words.
// Discarding audio without saying so is the exact failure the epoch machine one
// layer down exists to prevent; this gate does not get an exemption from it.
// A second hallucination shape, seen on the same walk: instead of a repeated
// phrase, Whisper emitted a run of INVISIBLE characters — zero-width spaces and
// bidi formatting marks. `.trim()` does not remove those, so the transcript
// passed the "is it empty?" check and reached MAIA, who answered "that one came
// through as noise — nothing readable on my end." She was right, and she should
// never have been asked.
//
// This is a separate layer from the level gate below and both are needed: the
// level gate cannot see the transcript, and this cannot see the audio.
const INVISIBLE = /[\u00AD\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]/g;

/** The transcript with zero-width and directional marks removed. */
function visibleText(text) {
  return String(text || '').replace(INVISIBLE, '').trim();
}

const SILENCE_RMS_X1000 = 12;
const SILENCE_PEAK_X1000 = 350;

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

// Total attempts per turn, initial included. See the retry comment below.
const MAX_TRANSCRIBE_ATTEMPTS = 3;
const RETRY_DELAY_MS = 250;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  let resumed = false;

  /**
   * ⭐ D04 — ADOPT THE MEMBER'S THREAD, DO NOT MINT ONE.
   *
   * Desktop used to open `desktop-<launch timestamp>`, which gave the member
   * continuity (same identity, same memory, same realm) but not THREAD
   * continuity: every launch started a conversation that existed nowhere else.
   * That is a Desktop-only conversation lineage, and the programme's invariant
   * — one MAIA realm, many surfaces — forbids exactly that.
   *
   * The fix is a read, not a design. `conversation_turns` already holds every
   * surface's turns against one member id, and the route already scopes by the
   * authenticated member. So Desktop asks the server which conversation the
   * member is in and joins it.
   *
   * ⛔ Falls back to the passed id ONLY when the member has no history at all
   * — a genuinely new member, where there is no thread to join. Never on an
   * error: a failed lookup must not silently fork the conversation, so it
   * reports and leaves the caller to decide.
   *
   * @returns {Promise<{ok: boolean, sessionId?: string, resumed?: boolean, error?: string}>}
   */
  async function adoptMemberThread() {
    const out = await session.authedFetch(TURNS_PATH, { method: 'GET' });
    if (!out.ok) {
      const body = await readErrorBody(out.res);
      return { ok: false, error: out.error || explain(out.status, body) };
    }
    let data = null;
    try { data = await out.res.json(); } catch { /* not JSON */ }
    const messages = (data && Array.isArray(data.messages)) ? data.messages : [];
    // Newest first, so the first row carrying a session id is the live thread.
    const latest = messages.find((m) => m && typeof m.sessionId === 'string' && m.sessionId.trim());
    if (!latest) {
      // No history: this member has no thread anywhere. Keeping the minted id
      // is correct here — it is the FIRST conversation, not a second one.
      return { ok: true, sessionId: convId, resumed: false };
    }
    convId = latest.sessionId.trim();
    resumed = true;
    return { ok: true, sessionId: convId, resumed: true };
  }

  /** The adopted thread in order, so Desktop opens on what was actually said. */
  async function history(limit = 20) {
    const out = await session.authedFetch(
      `${TURNS_PATH}?sessionId=${encodeURIComponent(convId)}`, { method: 'GET' });
    if (!out.ok) return { ok: false, turns: [] };
    let data = null;
    try { data = await out.res.json(); } catch { /* not JSON */ }
    const rows = (data && Array.isArray(data.messages)) ? data.messages : [];
    // Ascending from the route; the tail is the part a member recognises.
    return { ok: true, turns: rows.slice(-limit).map((m) => ({ role: m.role, content: m.content })) };
  }

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

    // Both must be low. Either alone is ambiguous — a single door slam lifts
    // peak without lifting rms, and distant speech lifts rms without peak.
    if (rmsX1000 < SILENCE_RMS_X1000 && peakX1000 < SILENCE_PEAK_X1000) {
      diagnostics.emit('voice_transcribe_error', { errorName: 'near_silence', source: 'client' });
      return {
        ok: false,
        gated: true,
        error: 'That came through as near-silence, so I didn\'t send it — nothing was transcribed. Say it again when you\'re ready.',
      };
    }


    const payload = multipartWav(wav, 'utterance.wav');

    let out = await session.authedFetch(TRANSCRIBE_PATH, {
      method: 'POST', headers: MULTIPART_HEADERS, body: payload,
    });
    let body = out.ok ? null : await readErrorBody(out.res);

    // ⭐ BOUNDED RETRY, and only for a failure that never reached the route.
    //
    // Root cause is known and is server-side: Next throws
    //   TypeError: Response body object should not be disturbed or locked
    // from fromNodeNextRequest — while CONSTRUCTING the Request, before any
    // application code runs. See docs/ops/TRANSCRIBE_BODY_DISTURBED_2026-08-27.md.
    //
    // The device walk showed it is close to a coin flip and largely independent
    // of size: 540324 bytes succeeded first try, 741224 succeeded on the retry,
    // 583236 failed twice, and 234100 — a small one — also failed twice. Against
    // a ~50% race, one retry leaves roughly a quarter of turns dead. Three
    // attempts leaves about an eighth.
    //
    // ⛔ Still bounded, and bounded for the same reason as before: a persistent
    // failure is information, and a loop that hides it turns a real defect into
    // an app that is merely slow and undiagnosable. Three attempts, then the
    // member is told the truth.
    //
    // ⛔ This is a MITIGATION of a server defect, not its fix, and it is safe
    // only because a failed transcription stores nothing and forms no memory.
    // It comes out when the server is fixed.
    for (let attempt = 1; attempt <= MAX_TRANSCRIBE_ATTEMPTS - 1; attempt++) {
      if (out.ok || out.status < 500 || !body || !body.__raw) break;
      // A short pause: the race is in per-request setup, so an immediate resend
      // is more likely to land in the same state than one a moment later.
      await sleep(RETRY_DELAY_MS * attempt);
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
    // ⭐ Visible characters only. A transcript of nothing but formatting marks is
    // not something the member said, and `chars` must count what MAIA would
    // actually receive — otherwise the diagnostics report a turn that isn't one.
    const text = visibleText(data && data.transcription);
    diagnostics.emit('voice_transcribe_result', { chars: text.length });
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

  return {
    transcribe, ask, adoptMemberThread, history,
    conversationId: () => convId, isResumed: () => resumed,
    TRANSCRIBE_PATH, MAIA_PATH, TURNS_PATH,
  };
}

module.exports = {
  createConversation, explain, readErrorBody, multipartWav, BOUNDARY,
  TRANSCRIBE_PATH, MAIA_PATH, TURNS_PATH,
  SILENCE_RMS_X1000, SILENCE_PEAK_X1000, visibleText,
};
