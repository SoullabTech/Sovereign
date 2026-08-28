// DESKTOP-TEXT-01 — typing is a second input modality, not a second MAIA.
//
// THE WHOLE UNIT IN ONE SENTENCE: a member types to the SAME MAIA they speak
// to — same conversation authority, same thread, same route, same memory and
// context assembly, same persistence, same rendering.
//
// ⛔ THE FAILURE THIS FILE EXISTS TO PREVENT is not "text doesn't work". It is
// text quietly acquiring its own path — a second route, a second conversation
// object, an embedded web chat — and Desktop ending up with two MAIAs again six
// weeks from now, with a commit message claiming otherwise. Most of the
// assertions below are therefore about SAMENESS, not about function.
//
// ⚠️ EVIDENCE CLASS: SOURCE/TEST.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const srcDir = path.join(root, 'src');
const raw = (f) => readFileSync(path.join(srcDir, f), 'utf8');
const strip = (f) => raw(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n');

const mainJs = strip('main.js');
const handler = /ipcMain\.handle\('maia:send-text'[\s\S]*?\n\}\);/.exec(mainJs)?.[0] || '';
const deliver = /async function deliverToMaia\([\s\S]*?\n\}/.exec(mainJs)?.[0] || '';
const runTurn = /async function runTurn\(\)[\s\S]*?\n^\}/m.exec(mainJs)?.[0] || '';

const { MAIA_PATH, TRANSCRIBE_PATH, createConversation } = require('../src/conversation.js');

// ════════════════════════════════════════════════════════════════════════════
// ⭐ THE PROHIBITION — one MAIA, one route
// ════════════════════════════════════════════════════════════════════════════

test('⛔ /api/between/chat appears NOWHERE in the Desktop tree', () => {
  // The founder's design invariant, made mechanical: text and voice are input
  // modalities of the Desktop conversation authority, never separate MAIA
  // implementations. The thin web route degrades an unauthenticated request to
  // `anon:` and carries a fraction of the memory assembly; routing Desktop text
  // through it — or embedding the surface that does — rebuilds the split.
  const offenders = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) { walk(full); continue; }
      if (!/\.(js|mjs|html|json)$/.test(name)) continue;
      if (full === fileURLToPath(import.meta.url)) continue;
      // ⭐ CODE, not prose. Comments in main.js and session.js name the route in
      // order to explain why Desktop must NOT use it — that documentation is
      // the invariant being taught, and banning the word would delete the
      // reasoning. What must never exist is a REACHABLE reference.
      const body = /\.(js|mjs)$/.test(name)
        ? readFileSync(full, 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n').map((l) => l.replace(/(^|[^:'"`])\/\/.*$/, '$1')).join('\n')
        : readFileSync(full, 'utf8');
      if (body.includes('between/chat')) offenders.push(path.relative(root, full));
    }
  };
  walk(root);
  assert.deepEqual(offenders, [],
    `the thin web MAIA route reached the Desktop tree: ${offenders.join(', ')}`);
});

test('the typed turn goes to the SAME route the spoken turn goes to', () => {
  assert.equal(MAIA_PATH, '/api/sovereign/app/maia/list');
  // One `ask` implementation, one MAIA_PATH, and the text handler reaches it
  // only through the shared delivery path.
  const askSites = (mainJs.match(/conversation\.ask\(/g) || []).length;
  assert.equal(askSites, 1, 'MAIA is asked from more than one place — the paths can diverge');
  assert.ok(deliver.includes('conversation.ask('), 'the one ask is not in the shared path');
});

test('there is ONE delivery path, and both modalities enter it', () => {
  assert.ok(deliver, 'deliverToMaia() does not exist — text and voice have separate tails');
  assert.ok(runTurn.includes('deliverToMaia('), 'the spoken turn does not use the shared path');
  assert.ok(handler.includes('deliverToMaia('), 'the typed turn does not use the shared path');

  // Everything after "the words exist" must live in the shared path, not be
  // re-emitted per modality.
  for (const phase of ['heard', 'thinking', 'answered']) {
    assert.ok(deliver.includes(`'${phase}'`), `phase ${phase} is missing from the shared path`);
    assert.ok(!handler.includes(`'${phase}'`), `the text handler re-implements phase ${phase}`);
    assert.ok(!runTurn.includes(`phase: '${phase}'`), `the voice loop re-implements phase ${phase}`);
  }
});

test('no second conversation object, and no second thread', () => {
  assert.ok(!/createConversation\(/.test(handler), 'the text path mints its own conversation');
  // `conversation` is created at sign-in and at restore — those two, and no more.
  assert.equal((mainJs.match(/conversation = createConversation\(/g) || []).length, 2,
    'a third conversation object exists — one of them is a second thread');
  assert.ok(!/sessionId/.test(handler), 'the text handler names a thread; main owns that');
});

test('a typed turn still gets her voice — modality is how the MEMBER spoke', () => {
  assert.ok(deliver.includes("broadcast('maia:audio'"), 'the shared path stopped emitting audio');
  assert.ok(deliver.includes("'no-voice'"), 'a server without local voice is no longer reported');
  assert.ok(!/includeAudio/.test(handler), 'the text path decides audio for itself');
});

// ════════════════════════════════════════════════════════════════════════════
// THE SCOPING RULING — text and voice are mutually exclusive
// ════════════════════════════════════════════════════════════════════════════

test('sending while listening performs a NORMAL STOP, not a discard', () => {
  // The founder's scoping: making "typing while listening" unreachable is how
  // this unit ships without implementing DESKTOP-CAPTURE-CONTROL-01 by
  // accident. Normal Stop, so words already spoken are kept.
  assert.ok(handler.includes('stopCaptureByMemberGesture()'),
    'a typed message leaves capture running — that is the capture-control state, which is gated');
  assert.ok(!handler.includes('releaseCapture('),
    'a typed message DISCARDS what the member already said — it must commit, not discard');
});

test('the member-gesture stop has exactly ONE implementation', () => {
  const fn = /function stopCaptureByMemberGesture\(\)[\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/epoch\.userStop\(\)/.test(fn) && /epoch\.commit\(\)/.test(fn),
    'the extracted stop lost its salvage/commit semantics');
  // Both callers delegate; neither carries a copy.
  const stopIpc = /ipcMain\.handle\('maia:voice-stop'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(stopIpc.includes('stopCaptureByMemberGesture()'));
  assert.ok(!/epoch\.userStop\(\)/.test(stopIpc), 'the Stop handler kept its own copy of the semantics');
  assert.equal((mainJs.match(/epoch\.userStop\(\)/g) || []).length, 1,
    'more than one place performs a member-gesture stop');
});

test('one turn at a time — a typed message cannot interleave with a spoken one', () => {
  assert.ok(/if \(turnBusy\) return/.test(handler), 'two turns can run at once, splitting the thread');
  assert.ok(/turnBusy = true/.test(handler) && /finally \{[\s\S]*?turnBusy = false/.test(handler),
    'the text path does not release the turn latch — one failure would wedge every later turn');
});

// ════════════════════════════════════════════════════════════════════════════
// MAIN VALIDATES — the renderer names only the words
// ════════════════════════════════════════════════════════════════════════════

test('the text is trimmed, capped and refused in MAIN, not trusted from the renderer', () => {
  assert.ok(/typeof payload\.text === 'string'/.test(handler), 'a non-string body is trusted');
  assert.ok(/\.trim\(\)\.slice\(0, 4000\)/.test(handler), 'unbounded text reaches the route');
  assert.ok(/if \(!said\) return/.test(handler), 'an empty message becomes a turn');
  assert.ok(/signedIn/.test(handler), 'a signed-out member can write to MAIA');
});

test('the bridge carries WORDS and nothing else', () => {
  const preload = strip('preload.js');
  const exposed = preload.slice(preload.indexOf('exposeInMainWorld'));
  assert.ok(/sendText: \(text\) => ipcRenderer\.invoke\('maia:send-text', \{ text \}\)/.test(exposed),
    'the text verb carries more than the words');
  for (const banned of ['sessionId', 'memberId', 'route', 'path', 'token']) {
    assert.ok(!new RegExp(`send-text[\\s\\S]{0,120}${banned}`).test(exposed),
      `the renderer can name ${banned} on a typed turn`);
  }
});

test('the channel was RATIFIED, not merely added', () => {
  const { RATIFIED_INVOKE_CHANNELS, INVOKE_CHANNEL_NAMES } = require('./d01-preload-allowlist.mjs');
  assert.ok(INVOKE_CHANNEL_NAMES.includes('maia:send-text'));
  const entry = RATIFIED_INVOKE_CHANNELS.find((c) => c.channel === 'maia:send-text');
  assert.equal(entry.ratified_in, 'DESKTOP-TEXT-01');
  assert.ok(entry.purpose.length > 80, 'the entry does not argue for itself');
  // Exactly one channel was added. The doctrine is that an eleventh has to come
  // and argue; a twelfth arriving alongside it would not have.
  assert.equal(INVOKE_CHANNEL_NAMES.length, 11);
});

// ════════════════════════════════════════════════════════════════════════════
// THE SURFACE
// ════════════════════════════════════════════════════════════════════════════

test('the composer exists, and appears only for a signed-in member', () => {
  const html = raw('index.html');
  assert.ok(/id="composer"/.test(html), 'there is no composer');
  assert.ok(/id="msg"/.test(html) && /id="send"/.test(html));
  // A <form>, so Enter submits — typing should feel like typing.
  assert.ok(/<form id="composer">/.test(html), 'the composer is not a form; Enter would not send');

  const renderer = strip('renderer.js');
  const show = /function showSignedIn\(state\)[\s\S]*?\n\}/.exec(renderer)[0];
  assert.ok(/composer'\)\.style\.display = state\.signedIn/.test(show),
    'the composer is visible to a signed-out member');
});

test('the member\'s line is NOT drawn locally — a refused send must not leave words on screen', () => {
  const renderer = strip('renderer.js');
  const submit = /\$\('composer'\)\.onsubmit[\s\S]*?\n  \};/.exec(renderer)[0];
  assert.ok(!/addTurn\(/.test(submit),
    'the renderer appends the member turn itself — a failed send would show a message MAIA never got');
  // It renders through the same `maia:turn` phase a spoken turn does.
  assert.ok(/t\.phase === 'heard'[\s\S]{0,80}addTurn\('member'/.test(renderer),
    'the shared heard-phase no longer renders the member line');
});

test('a refused send returns the member\'s words to them', () => {
  const renderer = strip('renderer.js');
  const submit = /\$\('composer'\)\.onsubmit[\s\S]*?\n  \};/.exec(renderer)[0];
  assert.ok(/\$\('msg'\)\.value = previous/.test(submit), 'a failed send swallows what was typed');
  assert.ok(/out\.ok === false/.test(submit), 'a refusal is not detected');
  assert.ok(/sending/.test(submit), 'double-submit is possible');
});

// ════════════════════════════════════════════════════════════════════════════
// EXCLUSIONS — this unit is the composer, and nothing else
// ════════════════════════════════════════════════════════════════════════════

test('DESKTOP-TEXT-01 did not smuggle in the units that follow it', () => {
  const html = raw('index.html');
  const all = mainJs + strip('renderer.js') + html;
  // Keep is DESKTOP-KEEP-01; origin-scope and view-capture-suspend are the two
  // DS01 blockers; capture-control is separately governed and gates this unit.
  // ⛔ Precise, not lexical. `track_muted` and `--sl-text-muted` predate this
  // unit and mean nothing to it; a crude /mute/i sweep flags them and teaches
  // nothing. What must be absent is a CONTROL this unit had no authority to add.
  const preload = strip('preload.js');
  const exposed = preload.slice(preload.indexOf('exposeInMainWorld'));
  const verbs = [...exposed.matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
  assert.ok(verbs.includes('sendText'), 'the text verb is missing');
  for (const forbidden of ['mute', 'setMuted', 'keep', 'markKeep', 'suspend', 'showPlatform']) {
    assert.ok(!verbs.includes(forbidden), `${forbidden}() was added by the text unit`);
  }
  const composer = /<form id="composer">[\s\S]*?<\/form>/.exec(html)[0];
  assert.ok(!/mute|keep|bookmark/i.test(composer), 'the composer grew a control from a later unit');
  assert.ok(!/PLATFORM_DENY|deniedPaths/.test(all), 'origin-scope was implemented inside the text unit');
  assert.ok(!/ipcMain\.handle\('maia:(keep|mute|suspend)/.test(mainJs), 'a later unit\'s handler appeared');
});
