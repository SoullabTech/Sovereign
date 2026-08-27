// DESKTOP-CONVERSATION-01 — the assembled path.
//
// ⭐ The first assertion here is the one that would have caught the class E
// defect the 2026-08-27 device walk found. Fifty-five green assertions did not,
// because every one of them proved a COMPONENT in isolation and none proved the
// assembled path dispatches audio at all. That gap is what this file closes.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'src');
const strip = (f) => readFileSync(path.join(srcDir, f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

const mainJs = strip('main.js');
const { encodeWav, resample } = require('../src/voice/wav.js');
const { createUtteranceBuffer } = require('../src/voice/utterance.js');
const { createConversation, explain, readErrorBody, multipartWav, BOUNDARY } = require('../src/conversation.js');
const { createSession } = require('../src/session.js');

// ── ⭐ the class E regression ───────────────────────────────────────────────

test('CLASS E REGRESSION — the frame handler buffers audio and dispatches a turn', () => {
  const handler = /ipcMain\.handle\('maia:voice-frame'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(handler.includes('utterance.push'),
    'frames are not buffered — audio is being dropped, which is the class E defect');
  assert.ok(/utterance_boundary[\s\S]*?runTurn\(\)/.test(handler),
    'an utterance boundary does not dispatch a turn — transcription is unreachable');
});

test('the turn loop actually calls transcribe AND ask — not one without the other', () => {
  const turn = /async function runTurn\(\)[\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(turn.includes('conversation.transcribe('), 'never transcribes');
  assert.ok(turn.includes('conversation.ask('), 'never asks MAIA — stops at "transcription works"');
  assert.ok(turn.includes("'maia:audio'") || turn.includes('maia:audio'), 'never emits audio');
});

test('a boundary does NOT end the epoch — a pause is still not a finished thought', () => {
  const handler = /ipcMain\.handle\('maia:voice-frame'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(!/endEpoch|userStop/.test(handler), 'an utterance boundary tore down capture');
});

// ── audio format ────────────────────────────────────────────────────────────

test('WAV header is well-formed and declares the real sample rate', () => {
  const wav = encodeWav(new Float32Array(1600), 16000);
  const dv = new DataView(wav.buffer);
  assert.equal(String.fromCharCode(...wav.subarray(0, 4)), 'RIFF');
  assert.equal(String.fromCharCode(...wav.subarray(8, 12)), 'WAVE');
  assert.equal(dv.getUint16(22, true), 1, 'must be mono');
  assert.equal(dv.getUint32(24, true), 16000, 'sample rate must be the real one');
  assert.equal(dv.getUint16(34, true), 16, 'must be 16-bit');
  assert.equal(wav.length, 44 + 1600 * 2);
});

test('out-of-range samples clamp instead of wrapping to the opposite sign', () => {
  const wav = encodeWav(Float32Array.from([1.8, -1.8]), 16000);
  const dv = new DataView(wav.buffer);
  assert.equal(dv.getInt16(44, true), 32767, 'positive overflow wrapped — audible as a click');
  assert.equal(dv.getInt16(46, true), -32768, 'negative overflow wrapped');
});

// ── the audio tail rule ─────────────────────────────────────────────────────

test('take() is the only way to empty the buffer, and it returns what it removed', () => {
  const b = createUtteranceBuffer({ minSamples: 10 });
  b.push(Float32Array.from([0.5, 0.5, 0.5, 0.5, 0.5]));
  b.push(Float32Array.from([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]));
  const got = b.take();
  assert.equal(got.sampleCount, 11);
  assert.equal(got.samples.length, 11);
  assert.equal(b.size(), 0);
  assert.equal(b.take(), null, 'a second take must not resurrect audio');
});

test('below the floor, take() returns null and KEEPS the audio rather than discarding it', () => {
  const b = createUtteranceBuffer({ minSamples: 100 });
  b.push(new Float32Array(50));
  assert.equal(b.take(), null);
  assert.equal(b.size(), 50, 'a sub-threshold take silently dropped the member\'s audio');
});

test('over the ceiling, dropped samples are COUNTED, never silently discarded', () => {
  const b = createUtteranceBuffer({ maxSamples: 100, minSamples: 1 });
  for (let i = 0; i < 5; i++) b.push(new Float32Array(40));
  const got = b.take();
  assert.ok(got.droppedSamples > 0, 'overflow was silent');
  assert.equal(got.droppedSamples + got.sampleCount, 200, 'the accounting does not add up');
});

// ── identity ────────────────────────────────────────────────────────────────

test('the session sends x-session-token and NEVER x-member-id', async () => {
  const seen = [];
  const s = createSession({
    app: { getPath: () => '/nonexistent-for-test' },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async (url, init) => {
      seen.push({ url, headers: init.headers || {} });
      if (url.includes('signin')) return { ok: true, status: 200, json: async () => ({ success: true, token: 'T', member: { name: 'K' } }) };
      return { ok: true, status: 200, json: async () => ({}) };
    },
  });
  await s.signIn('kelly', 'pw');
  await s.authedFetch('/api/anything', { method: 'POST' });
  const call = seen[1];
  assert.equal(call.headers['x-session-token'], 'T');
  assert.ok(!('x-member-id' in call.headers), 'sent a bare identity claim the server must reject');
});

test('the token is NEVER exposed through state()', async () => {
  const s = createSession({
    app: { getPath: () => '/nonexistent-for-test' },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ success: true, token: 'SECRET-TOKEN', member: { name: 'K' } }) }),
  });
  await s.signIn('kelly', 'pw');
  assert.ok(!JSON.stringify(s.state()).includes('SECRET-TOKEN'), 'the token leaked to the renderer');
  assert.equal(s.state().signedIn, true);
});

test('a 401 REFUSES and clears the session — it never degrades to anonymous', async () => {
  let calls = 0;
  const s = createSession({
    app: { getPath: () => '/nonexistent-for-test' },
    safeStorage: { isEncryptionAvailable: () => false },
    fetchImpl: async () => {
      calls++;
      if (calls === 1) return { ok: true, status: 200, json: async () => ({ success: true, token: 'T', member: {} }) };
      return { ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) };
    },
  });
  await s.signIn('kelly', 'pw');
  const out = await s.authedFetch('/api/anything');
  assert.equal(out.ok, false);
  assert.equal(out.status, 401);
  assert.equal(s.state().signedIn, false, 'an expired session survived — MAIA would become a stranger mid-conversation');
});

test('preload never exposes the token, only whether one exists', () => {
  const preload = strip('preload.js');
  const exposed = preload.slice(preload.indexOf('exposeInMainWorld'));
  for (const banned of ['token', 'sessionToken', 'password:']) {
    assert.ok(!exposed.includes(banned), `preload exposes ${banned} to the renderer`);
  }
  assert.ok(exposed.includes('getAuth'), 'renderer cannot ask whether it is signed in');
});

test('speaking requires a signed-in member', () => {
  const h = /ipcMain\.handle\('maia:voice-start'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(/signedIn/.test(h), 'capture can start without a verified member');
});

// ── routes + sovereignty ────────────────────────────────────────────────────

test('conversation uses the LIVE routes, not Desktop-specific ones', () => {
  const c = strip('conversation.js');
  assert.ok(c.includes("'/api/voice/transcribe-simple'"));
  assert.ok(c.includes("'/api/sovereign/app/maia/list'"));
});

test('Desktop never reaches for openai-tts — the canon conflict stays unresolved, not silently resolved', () => {
  for (const f of ['conversation.js', 'main.js', 'session.js', 'renderer.js']) {
    assert.ok(!/openai-tts|openai\.com/.test(strip(f)), `${f} routes voice through OpenAI`);
  }
});

test('sample rate is clamped in MAIN so the WAV header cannot lie', () => {
  const h = /ipcMain\.handle\('maia:voice-start'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(h.includes('8000') && h.includes('192000'), 'sample rate is unbounded');
  assert.ok(h.includes('voice.sampleRate ='), 'sample rate is never recorded');
});

test('the transcription gate is reported, never bypassed', () => {
  assert.ok(explain(410).includes('ALLOW_AUDIO_TRANSCRIPTION'),
    'a disabled gate would surface as an opaque failure');
  assert.equal(explain(401), 'Session expired — please sign in again.');
});

test('conversation reports failures instead of going quiet', async () => {
  const events = [];
  const conv = createConversation({
    session: { authedFetch: async () => ({ ok: false, status: 410, res: { json: async () => ({}) } }) },
    diagnostics: { emit: (e) => events.push(e) },
    sessionId: 's1',
  });
  const out = await conv.transcribe(new Float32Array(1600), 16000);
  assert.equal(out.ok, false);
  assert.ok(out.error.includes('ALLOW_AUDIO_TRANSCRIPTION'));
  assert.ok(events.includes('voice_transcribe_error'));
});

test('MAIA text reaches the surface but never telemetry', async () => {
  const events = [];
  const conv = createConversation({
    session: { authedFetch: async () => ({ ok: true, status: 200, res: { json: async () => ({ message: 'what is asking to be said', audio: { audioBase64: 'AAA', format: 'mp3' } }) } }) },
    diagnostics: { emit: (e, m) => events.push({ e, m }) },
    sessionId: 's1',
  });
  const out = await conv.ask('hello');
  assert.equal(out.text, 'what is asking to be said');
  assert.equal(out.audio.base64, 'AAA');
  assert.ok(!JSON.stringify(events).includes('asking to be said'), 'MAIA\'s words leaked into telemetry');
});

test('the surface renders member text with textContent, never innerHTML', () => {
  const r = strip('renderer.js');
  assert.ok(r.includes('b.textContent = body'), 'turn bodies must not be injected as HTML');
});

test('diagnostics are behind a toggle — the instrument is no longer the interface', () => {
  const html = readFileSync(path.join(srcDir, 'index.html'), 'utf8');
  assert.ok(/#log\s*\{[^}]*display:\s*none/.test(html), 'the diagnostic log is visible by default');
  assert.ok(html.includes('id="toggle"'), 'no disclosure control for diagnostics');
});

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE WALK 2026-08-27 — the surface showed `Request failed (500)` while the
// route was returning `{ error, details }` explaining exactly what went wrong.
// A failure that can explain itself and does not is a diagnostic loss, and this
// one cost a walk. These assertions keep the explanation reaching the member.
// ─────────────────────────────────────────────────────────────────────────────

test('a route error surfaces the server’s own explanation, not a bare status', () => {
  const msg = explain(500, { error: 'Local Faster-Whisper transcription failed', details: 'connect ECONNREFUSED' });
  assert.ok(msg.includes('Local Faster-Whisper transcription failed'), 'the route’s error is dropped');
  assert.ok(msg.includes('ECONNREFUSED'), 'the route’s details are dropped — this is the loss the walk found');
});

test('a non-JSON error body is preserved as evidence, not discarded', async () => {
  const res = { text: async () => '<html><body>502 Bad Gateway</body></html>' };
  const body = await readErrorBody(res);
  assert.ok(body && body.__raw, 'a non-JSON body was thrown away');
  assert.ok(!body.__raw.includes('<'), 'markup was not stripped before display');
  assert.ok(explain(502, body).includes('502 Bad Gateway'), 'the proxy’s message never reaches the surface');
});

test('a non-JSON error is distinguishable from a route error in diagnostics', () => {
  // strip(): the assertion is about code, not about the comment that explains
  // why the code is that way — that comment necessarily names `details`.
  const src = strip('conversation.js');
  const handler = /if \(!out\.ok\) \{[\s\S]*?voice_transcribe_error[\s\S]*?\}\);/.exec(src)[0];
  assert.ok(/source:\s*body && body\.__raw \? 'non_route' : 'route'/.test(handler),
    'the event cannot distinguish a route failure from a proxy/framework failure');
  assert.ok(!/details/.test(handler), 'upstream prose is being written into telemetry');
});

test('the surface uses the canonical Soullab tokens, not a Desktop palette', () => {
  const html = readFileSync(path.join(srcDir, 'index.html'), 'utf8');
  const css = /<style>[\s\S]*?<\/style>/.exec(html)[0];
  // The canonical values, from app/globals.css :root.
  for (const [token, value] of [
    ['--sl-bg-canvas', '#0A1628'],
    ['--sl-text-primary', '#F5F7FB'],
    ['--sl-accent-primary', '#B8860B'],
    ['--sl-accent-soft', '#D4AF37'],
  ]) {
    assert.ok(css.includes(`${token}: ${value}`), `${token} has drifted from app/globals.css`);
  }
  // Every colour outside the token block must be a var() reference — a raw hex
  // in a rule is a second palette forming.
  const body = css.slice(css.indexOf('}', css.indexOf(':root')) + 1);
  const strays = body.match(/#[0-9A-Fa-f]{3,8}\b/g) || [];
  assert.deepEqual(strays, [], `raw colours outside the token block: ${strays.join(', ')}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE WALK 2026-08-27, second pass. Turns landed, then degraded: transcripts
// came back empty, and once as a looping Arabic hallucination — Whisper's
// signature for fragmented audio. The cause was the frame path, not the model.
// ─────────────────────────────────────────────────────────────────────────────

test('audio is sent to Whisper at 16 kHz, not at the capture rate', () => {
  const a = new Float32Array(48000);
  for (let i = 0; i < a.length; i++) a[i] = Math.sin((2 * Math.PI * 440 * i) / 48000) * 0.5;
  const wav = encodeWav(a, 48000);
  const dv = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
  assert.equal(dv.getUint32(24, true), 16000, 'the WAV header does not declare 16 kHz');
  assert.equal(dv.getUint32(40, true) / 2, 16000, 'one second did not decimate to one second of samples');
  assert.ok(wav.byteLength < 40000, `48 kHz payload was not reduced (${wav.byteLength} bytes)`);
});

test('decimation averages the source window rather than point-sampling', () => {
  // A ramp: a point sampler takes every third value; an averaging decimator
  // returns the window mean, which for a ramp sits between them.
  const ramp = Float32Array.from({ length: 9 }, (_, i) => i / 9);
  const out = resample(ramp, 3, 1);
  assert.equal(out.length, 3);
  assert.ok(Math.abs(out[0] - (0 + 1 / 9 + 2 / 9) / 3) < 1e-6, 'the decimator is point-sampling — speech will alias');
});

test('upsampling is refused rather than faked', () => {
  const a = Float32Array.from([0, 0.5, -0.5]);
  assert.equal(resample(a, 16000, 48000).length, 3, 'samples were invented to hit a higher rate');
});

test('the renderer batches frames instead of one IPC round trip per block', () => {
  const r = readFileSync(path.join(srcDir, 'renderer.js'), 'utf8');
  assert.ok(!/onmessage\s*=\s*\(evt\)\s*=>\s*window\.maia\.voiceFrame\(Array\.from/.test(r),
    'every 128-sample block is still its own invoke() — this is the drop');
  assert.ok(/pendingLen\s*\+=/.test(r) && /inFlight/.test(r),
    'there is no batching with backpressure in the frame path');
});

test('backpressure accumulates audio and never discards it', () => {
  const r = strip('renderer.js');
  const drain = /const drain = \(\) => \{[\s\S]*?\n  \};/.exec(r)[0];
  assert.ok(/if \(inFlight \|\| pendingLen < BATCH\) return;/.test(drain),
    'a send in flight does not defer — frames will overlap or be lost');
  const onmessage = /node\.port\.onmessage = \(evt\) => \{[\s\S]*?\n  \};/.exec(r)[0];
  assert.ok(/pending\.push\(evt\.data\)/.test(onmessage),
    'blocks are not retained while a send is in flight — this drops audio');
  assert.ok(!/pending\s*=\s*\[\]\s*;?\s*(\/\/.*)?$/m.test(onmessage),
    'the pending buffer is cleared on receipt — audio is being thrown away');
});

test('there is no client-side size ceiling — the server log disproved it', async () => {
  // 861996 bytes → 200 → 339 chars, and 1455660 bytes → 200 → 75 chars, both
  // reaching the route normally. A guard justified by a disproven measurement
  // would refuse turns that work.
  const src = strip('conversation.js');
  assert.ok(!/TRANSPORT_CEILING_BYTES/.test(src), 'the retracted size ceiling is still in the code');
  const sent = [];
  const conv = createConversation({
    session: { authedFetch: async () => { sent.push(1); return { ok: true, status: 200, res: { json: async () => ({ transcription: 'ok' }) } }; } },
    diagnostics: { emit: () => {} },
    sessionId: 'x',
  });
  const big = new Float32Array(16000 * 60); // ~1.9 MB — comfortably over the old guard
  const out = await conv.transcribe(big, 16000);
  assert.equal(out.ok, true, 'a large turn is still being refused locally');
  assert.equal(sent.length, 1, 'the request was not actually sent');
});

test('a 5xx that never reached the route is retried', async () => {
  const attempts = [];
  const conv = createConversation({
    session: {
      authedFetch: async () => {
        attempts.push(1);
        if (attempts.length === 1) {
          return { ok: false, status: 500, res: { text: async () => '<html>An error 500 occurred on server</html>' } };
        }
        return { ok: true, status: 200, res: { json: async () => ({ transcription: 'heard you' }) } };
      },
    },
    diagnostics: { emit: () => {} },
    sessionId: 'x',
  });
  const out = await conv.transcribe(new Float32Array(1600), 16000);
  assert.equal(attempts.length, 2, 'the request was not retried');
  assert.deepEqual([out.ok, out.text], [true, 'heard you']);
});

test('the retry is narrow — never on 4xx, and bounded on 5xx', async () => {
  const attempts = [];
  const mk = (status, bodyText) => createConversation({
    session: { authedFetch: async () => { attempts.push(status); return { ok: false, status, res: { text: async () => bodyText } }; } },
    diagnostics: { emit: () => {} },
    sessionId: 'x',
  });

  attempts.length = 0;
  await mk(413, '<html>too large</html>').transcribe(new Float32Array(160), 16000);
  assert.equal(attempts.length, 1, 'a 4xx was retried — the client is repeating a refusal');

  attempts.length = 0;
  await mk(500, '<html>An error 500</html>').transcribe(new Float32Array(160), 16000);
  assert.equal(attempts.length, 3, 'a persistent 5xx did not stop at the attempt bound');

  attempts.length = 0;
  await mk(500, JSON.stringify({ error: 'Local Faster-Whisper transcription failed' })).transcribe(new Float32Array(160), 16000);
  assert.equal(attempts.length, 1, 'a 5xx from the route itself was retried — the route already answered');
});
test('the level of a sent utterance is measured, so an empty transcript is diagnosable', async () => {
  const events = [];
  const conv = createConversation({
    session: { authedFetch: async () => ({ ok: true, status: 200, res: { json: async () => ({ transcription: 'x' }) } }) },
    diagnostics: { emit: (n, m) => events.push([n, m]) },
    sessionId: 'x',
  });
  const a = new Float32Array(16000);
  for (let i = 0; i < a.length; i++) a[i] = Math.sin((2 * Math.PI * 440 * i) / 16000) * 0.5;
  await conv.transcribe(a, 16000);
  const sent = events.find(([n]) => n === 'voice_transcribe_sent')[1];
  assert.ok(sent.peakX1000 > 400 && sent.peakX1000 <= 1000, `peak not measured (${sent.peakX1000})`);
  assert.ok(sent.rmsX1000 > 0, 'rms not measured — silence and speech remain indistinguishable');
  assert.ok(sent.seconds > 0, 'duration not measured');
});

// ─────────────────────────────────────────────────────────────────────────────
// The failing requests were absent from the server log entirely while a 1.4 MB
// request succeeded — dropped between the app and the handler, intermittently,
// biased toward larger bodies. Node's fetch streams a FormData body with
// chunked transfer-encoding and no Content-Length; a browser never does, which
// is why every other client of this route works.
// ─────────────────────────────────────────────────────────────────────────────

test('the multipart envelope is one contiguous buffer, so Content-Length is known', () => {
  const wav = encodeWav(new Float32Array(1600), 16000);
  const body = multipartWav(wav, 'utterance.wav');
  assert.ok(Buffer.isBuffer(body), 'the body is not a buffer — fetch will stream it without a length');
  const head = body.subarray(0, 200).toString('utf8');
  assert.ok(head.startsWith(`--${BOUNDARY}\r\n`), 'the multipart preamble is malformed');
  assert.ok(head.includes('name="file"'), 'the route reads formData.get("file") — the field name must be file');
  assert.ok(head.includes('filename="utterance.wav"'), 'a missing filename makes the route substitute one');
  assert.ok(body.subarray(-Buffer.byteLength(`\r\n--${BOUNDARY}--\r\n`)).toString('utf8') === `\r\n--${BOUNDARY}--\r\n`,
    'the closing boundary is missing — the server will see a truncated part');
});

test('the WAV survives the envelope byte for byte', () => {
  const wav = encodeWav(Float32Array.from({ length: 320 }, (_, i) => Math.sin(i / 4) * 0.5), 16000);
  const body = multipartWav(wav, 'utterance.wav');
  const start = body.indexOf(Buffer.from('\r\n\r\n')) + 4;
  const carried = body.subarray(start, start + wav.byteLength);
  assert.ok(carried.equals(Buffer.from(wav.buffer, wav.byteOffset, wav.byteLength)),
    'the audio was altered in transit — RIFF header or samples corrupted');
});

test('the request declares multipart with the same boundary it wrote', async () => {
  const seen = [];
  const conv = createConversation({
    session: { authedFetch: async (p, init) => { seen.push(init); return { ok: true, status: 200, res: { json: async () => ({ transcription: 'x' }) } }; } },
    diagnostics: { emit: () => {} },
    sessionId: 'x',
  });
  await conv.transcribe(new Float32Array(1600), 16000);
  const ct = seen[0].headers['Content-Type'];
  assert.ok(/^multipart\/form-data; boundary=/.test(ct), `the route rejects a non-multipart content type (${ct})`);
  assert.ok(ct.endsWith(BOUNDARY), 'the declared boundary does not match the one in the body');
  assert.ok(!(seen[0].body instanceof FormData), 'still sending a streaming FormData body');
});

test('the retry reuses the same buffer rather than rebuilding it', () => {
  const src = strip('conversation.js');
  assert.ok(!/retryForm/.test(src), 'the retry builds a second envelope — they can diverge');
  const retry = /for \(let attempt = 1[\s\S]*?\n    \}/.exec(src)[0];
  assert.ok(/body: payload/.test(retry), 'the retry does not send the same bytes as the first attempt');
  assert.ok(/attempt <= MAX_TRANSCRIBE_ATTEMPTS - 1/.test(retry), 'the retry loop is not bounded by the attempt cap');
  assert.ok(/out\.ok \|\| out\.status < 500 \|\| !body \|\| !body\.__raw/.test(retry),
    'the loop does not stop on success, on a 4xx, or on a failure the route itself answered');
});
