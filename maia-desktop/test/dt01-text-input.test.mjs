// DESKTOP-TEXT-INPUT-01 — a typed turn is the same turn.
//
// The unit exists because Desktop had exactly one way in, the microphone, and
// that channel was producing degenerate transcripts. The risk in adding a
// second way in is not that typing is hard; it is that a second input path
// quietly becomes a SECOND CONVERSATION — different identity, different
// persistence, different audio disposition — that drifts from the spoken one.
//
// So these tests assert the boundary, not the feature. main.js is not
// importable outside Electron, so the assertions are made against the source
// with comments stripped — the same technique d01-boundary.test.mjs uses, and
// for the same reason: what matters is what the shipped file actually does.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, '..', 'src');
const strip = (f) => readFileSync(path.join(srcDir, f), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

const mainJs = strip('main.js');
const preload = strip('preload.js');
const renderer = strip('renderer.js');
const html = readFileSync(path.join(srcDir, 'index.html'), 'utf8');

const sayHandler = (() => {
  const at = mainJs.indexOf("ipcMain.handle('maia:say'");
  assert.ok(at > -1, 'main does not handle maia:say');
  return mainJs.slice(at, mainJs.indexOf('ipcMain.handle', at + 10));
})();

// ── the load-bearing one ────────────────────────────────────────────────────
//
// ⭐ ONE conversation implementation. If this count ever reaches two, a typed
// turn and a spoken turn have become free to diverge — which is the whole
// failure this unit was bounded to avoid.
test('there is exactly ONE conversation.ask() call site in main', () => {
  const sites = (mainJs.match(/conversation\.ask\(/g) || []).length;
  assert.equal(sites, 1, 'a second ask() path exists — typed and spoken turns can now drift');
});

test('the typed turn goes through the SAME deliverTurn the spoken turn uses', () => {
  assert.ok(sayHandler.includes('deliverTurn('), 'maia:say does not call deliverTurn');
  assert.ok(!sayHandler.includes('conversation.ask('), 'maia:say reaches ask() directly, bypassing the shared path');
  const runTurn = mainJs.slice(mainJs.indexOf('async function runTurn'));
  assert.ok(runTurn.includes('deliverTurn('), 'the spoken turn no longer shares the path');
});

// ── the negative control the ruling asked for ───────────────────────────────
//
// ⛔ The renderer must not acquire a network primitive. It asks main to perform
// one named operation; it may not describe the call.
test('the renderer supplies TEXT and cannot name the call', () => {
  const exposed = preload.slice(preload.indexOf('exposeInMainWorld'));
  const say = exposed.slice(exposed.indexOf('say:'), exposed.indexOf('say:') + 200);
  assert.match(say, /invoke\('maia:say',\s*\{\s*text\s*\}\s*\)/, 'say() passes more than text');

  for (const banned of ['url', 'endpoint', 'route', 'method', 'headers', 'body',
                        'memberId', 'sessionId', 'includeAudio', 'token']) {
    assert.ok(!sayHandler.includes(banned),
      `maia:say lets the renderer influence ${banned}`);
  }
});

test('main reads only payload.text, and clamps it in MAIN', () => {
  assert.match(sayHandler, /typeof payload\.text === 'string'/, 'text is not type-checked in main');
  assert.match(sayHandler, /\.trim\(\)\.slice\(0, MAX_TYPED_CHARS\)/, 'text is not clamped in main');
  assert.match(mainJs, /const MAX_TYPED_CHARS = \d+;/, 'no clamp constant in main');
});

// ── the refusals, in main, where a renderer bug cannot reach around them ────
test('a signed-out typed send is refused, in the same words as speaking', () => {
  assert.match(sayHandler, /signedIn/, 'maia:say does not check the session');
  assert.match(sayHandler, /sign in before speaking/, 'the refusal wording diverges from the voice path');
  const voiceStart = mainJs.slice(mainJs.indexOf("ipcMain.handle('maia:voice-start'"));
  assert.ok(voiceStart.includes('sign in before speaking'), 'the voice refusal wording moved');
});

test('a whitespace-only send is refused before any turn is created', () => {
  const refusal = sayHandler.indexOf('nothing to send');
  const ask = sayHandler.indexOf('deliverTurn(');
  assert.ok(refusal > -1, 'empty text is not refused');
  assert.ok(refusal < ask, 'the empty check runs after the turn has already started');
});

test('a typed turn cannot race a spoken one — shared turnBusy exclusion', () => {
  const guard = sayHandler.indexOf('if (turnBusy)');
  const set = sayHandler.indexOf('turnBusy = true');
  assert.ok(guard > -1, 'maia:say does not honour turnBusy');
  assert.ok(guard < set, 'turnBusy is claimed before it is checked');
  assert.match(sayHandler, /finally\s*\{[\s\S]*turnBusy = false/, 'turnBusy is not released on every path');
  // The spoken path still refuses while a typed turn is in flight.
  const runTurn = mainJs.slice(mainJs.indexOf('async function runTurn'));
  assert.match(runTurn, /if \(!voice \|\| turnBusy/, 'the spoken path no longer honours turnBusy');
});

// ── the surface ────────────────────────────────────────────────────────────
test('the compose field exists and Enter sends', () => {
  assert.match(html, /<input id="say"/, 'no text field in the bar');
  assert.match(html, /<button id="send">/, 'no Send control in the bar');
  assert.match(renderer, /e\.key === 'Enter' && !e\.shiftKey/, 'Enter does not send');
});

test('the renderer refuses an empty send without troubling main', () => {
  const fn = renderer.slice(renderer.indexOf('async function sendTyped'));
  const refuse = fn.indexOf("if (!text) return;");
  const call = fn.indexOf('window.maia.say(');
  assert.ok(refuse > -1 && refuse < call, 'the renderer sends whitespace to main');
});

// ⭐ Exactly one member turn, however the words were obtained. The renderer
// must NOT render what it just sent — that turn arrives on the `heard` phase,
// the same way a spoken one does. Rendering locally too would double it.
test('the renderer does not render the typed turn itself', () => {
  const fn = renderer.slice(renderer.indexOf('async function sendTyped'),
                            renderer.indexOf("$('send').onclick"));
  assert.ok(!fn.includes('addTurn('), 'the typed turn is rendered twice — locally and on `heard`');
});

test('a refused send keeps the text and says why', () => {
  const fn = renderer.slice(renderer.indexOf('async function sendTyped'),
                            renderer.indexOf("$('send').onclick"));
  const setState = fn.indexOf('setState(');
  const clear = fn.indexOf("el.value = ''");
  assert.ok(setState > -1, 'a refusal is silent');
  assert.ok(setState < clear, 'the field is cleared before the refusal is known — the words are lost');
});
