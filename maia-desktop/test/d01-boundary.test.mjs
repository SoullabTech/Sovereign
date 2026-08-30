// MAIA-D01 — the renderer↔main authority boundary, and transcription failure.
//
// MAIA-D00A's discipline applied from the start: the allow-list is EXACT, lives
// in one file, and every channel carries a documented purpose.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  RATIFIED_INVOKE_CHANNELS, INVOKE_CHANNEL_NAMES, PUSH_CHANNEL_NAMES,
} from './d01-preload-allowlist.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'src');
const strip = (f) => readFileSync(path.join(srcDir, f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

const preload = strip('preload.js');
const mainJs = strip('main.js');

test('preload exposes exactly the ratified invoke channels', () => {
  const channels = [...preload.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual(channels, INVOKE_CHANNEL_NAMES);
});

test('preload subscribes to exactly the ratified push channels', () => {
  const pushed = [...preload.matchAll(/ipcRenderer\.on\('([^']+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual(pushed, PUSH_CHANNEL_NAMES);
});

test('every ratified channel carries a documented purpose and a naming ruling', () => {
  for (const c of RATIFIED_INVOKE_CHANNELS) {
    assert.ok(c.purpose && c.purpose.length > 40, `${c.channel} has no real purpose statement`);
    assert.ok(c.ratified_in, `${c.channel} names no ruling`);
  }
});

test('main handles exactly the ratified channels and no others', () => {
  const handled = [...mainJs.matchAll(/ipcMain\.handle\('([^']+)'/g)].map((m) => m[1]).sort();
  assert.deepEqual(handled, INVOKE_CHANNEL_NAMES, 'main handles a channel the allow-list never ratified');
});

test('no general IPC, shell, or Node authority crosses the bridge', () => {
  for (const banned of ['require(', 'child_process', 'shell.', 'exec(', 'ipcRenderer.send(', 'fs.', 'process.env']) {
    // `require('electron')` is the preload's own import and is unavoidable;
    // assert on what is EXPOSED, not on the module header.
    const exposed = preload.slice(preload.indexOf('exposeInMainWorld'));
    assert.ok(!exposed.includes(banned), `preload exposes ${banned} to the renderer`);
  }
});

test('the renderer cannot name a device, an endpoint, or an epoch', () => {
  const exposed = preload.slice(preload.indexOf('exposeInMainWorld'));
  for (const banned of ['deviceId', 'endpoint', 'epochId', 'url', 'path']) {
    assert.ok(!exposed.includes(banned), `preload lets the renderer supply ${banned}`);
  }
});

test('main validates every renderer-supplied frame rather than trusting it', () => {
  const handler = /ipcMain\.handle\('maia:voice-frame'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(/raw\.length > 65536|length > 65536/.test(handler), 'frame length is unbounded');
  assert.ok(handler.includes('Math.min(1000'), 'frameMs is not clamped');
  assert.ok(handler.includes("reason: 'invalid frame'"), 'an invalid frame is not refused');
});

test('main truncates every renderer-supplied string', () => {
  for (const ch of ['maia:voice-capture-lost', 'maia:voice-mic-result']) {
    const h = new RegExp(`ipcMain\\.handle\\('${ch}'[\\s\\S]*?\\n\\}\\);`).exec(mainJs)[0];
    assert.ok(h.includes('.slice(0, 64)'), `${ch} accepts an unbounded renderer string`);
  }
});

// ⚠️ AUTHORITY CHANGE, 2026-08-30. This guard used to assert the OPPOSITE: that
// the default session grants `media`/`audioCapture` unconditionally. That was
// right while this local renderer was the voice path. Convergence moved the
// conversation to canonical `/maia` on the platform partition, and the founder
// ruling that followed made the default session fail-closed:
//
//   ordinary defaultSession          audio DENY · video DENY
//   explicit unpackaged witness run  audio only, to that context
//
// The test is inverted deliberately and by ruling, not relaxed. What it
// protects is stronger than what it protected before.
test('the default session grants NOTHING unconditionally', () => {
  assert.ok(mainJs.includes('setPermissionRequestHandler'), 'no permission handler installed');
  const h = /setPermissionRequestHandler\([\s\S]*?\}\);/.exec(mainJs)[0];
  assert.ok(/defaultSessionPermission\(/.test(h),
    'the default session no longer routes through the policy — it must not decide inline');
  assert.ok(!/callback\(true\)\s*;/.test(h), 'permission is granted unconditionally');
  assert.ok(!/permission === 'media'/.test(h),
    'the blanket audio grant is back on the default session');
});

test('the default session is fail-closed, and witness mode is a declaration', () => {
  const { defaultSessionPermission, WITNESS_MODE_ENV } = require('../src/shell-policy.js');
  const declared = { env: { [WITNESS_MODE_ENV]: '1' }, isPackaged: false };

  // ⛔ A PACKAGED build cannot be talked into it by its environment. This is
  // the assertion that keeps the diagnostic exemption off a member's machine.
  assert.equal(defaultSessionPermission('media', { ...declared, isPackaged: true }), false,
    'a packaged Desktop granted a microphone on the default session');

  // ⛔ Nor can an unpackaged build that never declared itself.
  for (const env of [{}, { [WITNESS_MODE_ENV]: '' }, { [WITNESS_MODE_ENV]: '0' },
                     { [WITNESS_MODE_ENV]: 'true' }, { [WITNESS_MODE_ENV]: 'yes' }]) {
    assert.equal(defaultSessionPermission('media', { env, isPackaged: false }), false,
      `${JSON.stringify(env)} was treated as a witness declaration`);
  }

  // ⛔ Absent facts refuse. Fail-closed means the empty case is a denial.
  assert.equal(defaultSessionPermission('media', undefined), false);
  assert.equal(defaultSessionPermission('media', {}), false);

  // ⭐ The one exception, and it is AUDIO ONLY — witness mode is not a bypass
  // of the rest of the refusal.
  assert.equal(defaultSessionPermission('media', declared), true);
  assert.equal(defaultSessionPermission('audioCapture', declared), true);
  for (const p of ['videoCapture', 'display-capture', 'geolocation', 'notifications',
                   'brand-new-permission-2027']) {
    assert.equal(defaultSessionPermission(p, declared), false,
      `witness mode granted ${p} — it grants a microphone, not a machine`);
  }
});

test('the renderer window is sandboxed, isolated, and loads no remote content', () => {
  assert.ok(mainJs.includes('contextIsolation: true'));
  assert.ok(mainJs.includes('nodeIntegration: false'));
  assert.ok(mainJs.includes('sandbox: true'));
  assert.ok(mainJs.includes('loadFile('), 'window must load a local file');
  assert.ok(!/loadURL\(/.test(mainJs), 'remote content may not be loaded into the renderer');
});

test('an unstamped build reports UNSTAMPED, never a fabricated SHA', () => {
  assert.ok(mainJs.includes("'UNSTAMPED'"));
  assert.ok(!/GIT_COMMIT.*'dev'|build: 'dev'/.test(mainJs));
});

// ── transcription failure is a boundary, not a hole ─────────────────────────

const { createTranscriptionClient } = require('../src/voice/transcription.js');
const { createDiagnostics } = require('../src/voice/diagnostics.js');

function tclient(fetchImpl) {
  const events = [];
  const diagnostics = createDiagnostics((e, r) => events.push(r), { now: () => events.length });
  const client = createTranscriptionClient({ fetchImpl, diagnostics, sleep: async () => {} });
  return { client, events, names: () => events.map((e) => e.event) };
}

test('transcription failure reports an error and never returns empty text as success', async () => {
  const { client, names } = tclient(async () => { const e = new Error('down'); e.name = 'FetchError'; throw e; });
  const res = await client.send(new Uint8Array(64), { epochId: 1 });
  assert.equal(res.ok, false);
  assert.equal(res.text, null, 'a failure returned text, which would look like a legitimate empty result');
  assert.ok(names().includes('voice_transcribe_error'));
  assert.ok(!names().includes('voice_transcribe_result'));
});

test('an EMPTY transcription result stays distinguishable from a failure', async () => {
  const { client, names } = tclient(async () => ({ ok: true, json: async () => ({ text: '' }) }));
  const res = await client.send(new Uint8Array(64));
  assert.equal(res.ok, true);
  assert.equal(res.text, '');
  assert.ok(names().includes('voice_transcribe_result'));
  assert.ok(!names().includes('voice_transcribe_error'));
});

test('transcription retries, then gives up rather than hanging', async () => {
  let calls = 0;
  const { client } = tclient(async () => { calls++; if (calls < 3) throw new Error('flap'); return { ok: true, json: async () => ({ text: 'got it' }) }; });
  const res = await client.send(new Uint8Array(64));
  assert.equal(res.ok, true);
  assert.equal(res.text, 'got it');
  assert.equal(res.attempts, 3);
});

// ── privacy ─────────────────────────────────────────────────────────────────

test('the diagnostics emitter REFUSES transcript text in metadata', () => {
  const { createDiagnostics: cd } = require('../src/voice/diagnostics.js');
  const d = cd(() => {});
  assert.throws(() => d.emit('voice_result_final', { text: 'what the member actually said' }), /never enter telemetry/);
  assert.throws(() => d.emit('voice_result_interim', { transcript: 'the words' }), /never enter telemetry/);
});

test('the diagnostics emitter REFUSES an unknown event name', () => {
  const { createDiagnostics: cd } = require('../src/voice/diagnostics.js');
  const d = cd(() => {});
  assert.throws(() => d.emit('desktop_voice_something_new', {}), /unknown voice diagnostic event/);
});

test('every emitted event name exists in the canonical union or is a declared new event', () => {
  const canonical = readFileSync(
    path.join(here, '..', '..', 'lib', 'voice', 'voiceDiagnostics.ts'), 'utf8');
  const { REUSED_EVENTS, NEW_EVENTS } = require('../src/voice/diagnostics.js');
  for (const e of REUSED_EVENTS) {
    assert.ok(canonical.includes(`'${e}'`), `${e} is not in the canonical VoiceDiagEvent union`);
  }
  assert.equal(NEW_EVENTS.length, 1, 'a second new event appeared without an argument for it');
  assert.equal(NEW_EVENTS[0], 'voice_tail_lost');
  assert.ok(!canonical.includes("'voice_tail_lost'"),
    'voice_tail_lost now exists canonically — reuse it instead of declaring it new');
});

// ── device-witness evidence sink (MAIA-D01 device closure) ──────────────────

test('the evidence sink is OUTSIDE the capture path', () => {
  // It may observe records and write them. It may NOT appear in frame handling,
  // VAD, epoch transitions, or the bridge — "additive" has to be checkable.
  const frameHandler = /ipcMain\.handle\('maia:voice-frame'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(!frameHandler.includes('witness'), 'the evidence sink entered frame handling');
  assert.ok(!preload.includes('witness'), 'the evidence sink reached the bridge');
  for (const f of ['epoch.js', 'vad.js', 'diagnostics.js', 'transcription.js']) {
    assert.ok(!strip(path.join('voice', f)).includes('witness'),
      `the evidence sink entered the pure voice core (${f})`);
  }
});

test('the evidence sink can never break capture', () => {
  const w = /function witnessWrite\([\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/try\s*\{/.test(w) && /catch/.test(w), 'a failing write could propagate into capture');
});

test('the evidence sink writes only records the privacy-refusing emitter produced', () => {
  // It appends `frames` (a number) and nothing else. If it ever composed its own
  // record, the emitter's refusal would no longer cover what lands on disk.
  assert.ok(/witnessWrite\(record, /.test(mainJs), 'the sink must forward the emitted record verbatim');
  const w = /function witnessWrite\([\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/\.\.\.record, frames/.test(w), 'the sink composes a record instead of forwarding one');
});
