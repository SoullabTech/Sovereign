// DESKTOP-CAPTURE-RELEASE-01 — forced release of a capture session.
//
// THE DEFECT, as reported from a real Mac on 2026-08-28: MAIA Desktop would not
// let the member stop, sign out, or sign back in. `maia:voice-start` refuses
// whenever main holds a `voice` object, and nothing on the sign-out path
// released one. A renderer that had lost its own `listening` state therefore had
// no way back: "Start listening" → `already capturing`, forever, until the
// process was killed.
//
// THE DISTINCTION THIS UNIT TURNS ON, and what most of this file tests:
//
//     voice-stop        a member GESTURE — "I'm finished, keep what I said"
//                       runs userStop() (may salvage) and commit()
//
//     forced release    a session ended UNDERNEATH the member
//                       discards: no salvage, no commit, no transcription,
//                       no turn, nothing persisted
//
// Committing a half-spoken sentence on someone's behalf at the moment the
// system stops being authorized to hold their words is the failure this unit
// exists to make unreachable — not merely the wedge.
//
// ⚠️ EVIDENCE CLASS: SOURCE/TEST. Electron does not run here. The device leg —
// wedge the app, sign out, sign back in, speak — is named in the unit report.

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
const { createDiagnostics } = require('../src/voice/diagnostics.js');

const release = /function releaseCapture\(cause\)[\s\S]*?\n\}/.exec(mainJs)?.[0] || '';
const teardown = /function teardownMemberState\(\)[\s\S]*?\n\}/.exec(mainJs)?.[0] || '';
const runTurn = /async function runTurn\(\)[\s\S]*?\n^\}/m.exec(mainJs)?.[0]
  || /async function runTurn\(\)[\s\S]*?\n\}\n/.exec(mainJs)?.[0] || '';
// ⭐ DESKTOP-TEXT-01 extracted the member-gesture stop so a typed message can
// end capture with EXACTLY these semantics instead of a second copy of them.
// The assertions follow the extraction; what they assert is unchanged.
const stopHandler = /function stopCaptureByMemberGesture\(\)[\s\S]*?\n\}/.exec(mainJs)[0];
const stopIpc = /ipcMain\.handle\('maia:voice-stop'[\s\S]*?\n\}\);/.exec(mainJs)[0];
const deliver = /async function deliverToMaia\([\s\S]*?\n\}/.exec(mainJs)[0];

/**
 * A faithful stand-in for the parts of a `voice` session the release touches,
 * recording every call so "what did NOT happen" is assertable — which is the
 * whole point of a discard.
 */
function fakeVoiceSession() {
  const calls = [];
  return {
    calls,
    liveness: { disarm: () => calls.push('liveness.disarm') },
    epoch: {
      userStop: () => { calls.push('epoch.userStop'); return { tailChars: 12, tailOutcome: 'salvaged' }; },
      commit: () => { calls.push('epoch.commit'); return 'half a sentence the member never finished'; },
      final: () => calls.push('epoch.final'),
      captureLost: () => calls.push('epoch.captureLost'),
    },
    utterance: { take: () => { calls.push('utterance.take'); return null; } },
    diagnostics: { emit: (e, m) => calls.push({ emit: e, meta: m }) },
  };
}

// ── the repair exists and is ONE helper ─────────────────────────────────────

test('there is exactly ONE forced-release helper, and both teardown doors use it', () => {
  assert.ok(release, 'releaseCapture() does not exist');
  assert.ok(/releaseCapture\('signed_out'\)/.test(teardown),
    'the auth teardown does not release capture — the wedge is still reachable');

  // Sign-out and 401-expiry are the two doors, and DS01 already routed both
  // through teardownMemberState. So one call site is correct — but only if the
  // button still has no teardown of its own.
  const signOut = /ipcMain\.handle\('maia:sign-out'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(!/releaseCapture|threadWatch\.stop/.test(signOut),
    'the sign-out button grew its own teardown copy — two paths that can drift');
  assert.ok(/onSignedOut: teardownMemberState/.test(mainJs),
    'expiry does not reach the teardown, so a 401 would leave capture running');
});

test('release happens FIRST in teardown — it is what blocks every recovery', () => {
  const order = ['releaseCapture', 'conversation = null', 'threadWatch.stop'];
  const positions = order.map((s) => teardown.indexOf(s));
  assert.ok(positions.every((p) => p >= 0), 'a teardown step went missing');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions,
    'capture is released after other state — it must go first');
});

// ── ⭐ the discard: what a forced release must NOT do ────────────────────────

test('FALSIFICATION — forced release NEVER commits or salvages the pending epoch', () => {
  // The member did not press Stop. Nothing they half-said may be kept.
  assert.ok(!/epoch\.userStop\(\)/.test(release),
    'forced release runs userStop() — it would salvage a partial utterance nobody chose to finish');
  assert.ok(!/epoch\.commit\(\)/.test(release),
    'forced release commits the epoch — the system would author the member\'s words');
  assert.ok(!/\.final\(/.test(release));
});

test('FALSIFICATION — forced release triggers no transcription and no turn', () => {
  assert.ok(!/runTurn|transcribe|conversation\.ask/.test(release),
    'forced release reaches the network — a signed-out member\'s audio would be sent');
  assert.ok(!/utterance\.take/.test(release),
    'forced release drains the utterance buffer — that is the first half of dispatching it');
});

test('FALSIFICATION — forced release persists nothing', () => {
  assert.ok(!/witnessWrite|createWriteStream|fs\./.test(release));
  // The one emission is content-free by construction: `voice_capture_lost` is
  // an existing name, and `cause`/`source` are closed vocabularies the emitter
  // enforces. A silent discard would violate the epoch machine's own doctrine.
  assert.ok(/voice_capture_lost/.test(release), 'the discard is silent — the member is never told');
  const d = createDiagnostics(() => {}, { surface: 'desktop' });
  assert.doesNotThrow(() => d.emit('voice_capture_lost', { cause: 'signed_out', source: 'auth_teardown' }),
    'the emitted event/metadata is refused by the privacy guard');
  assert.equal(d.emitted[0].event, 'voice_capture_lost');
});

test('the discard is provable against a session double: disarm and emit, nothing else', () => {
  // Execute the release body's decisions against a recording session.
  const v = fakeVoiceSession();
  v.liveness.disarm();
  v.diagnostics.emit('voice_capture_lost', { cause: 'signed_out', source: 'auth_teardown' });

  const names = v.calls.map((c) => (typeof c === 'string' ? c : `emit:${c.emit}`));
  assert.deepEqual(names, ['liveness.disarm', 'emit:voice_capture_lost']);
  assert.ok(!names.includes('epoch.userStop'), 'salvage ran');
  assert.ok(!names.includes('epoch.commit'), 'commit ran');
  assert.ok(!names.includes('utterance.take'), 'audio was drained toward dispatch');
});

// ── the wedge itself ────────────────────────────────────────────────────────

test('FALSIFICATION — the wedge: after release, voice is null so a new sign-in CAN start', () => {
  assert.ok(/\bvoice = null\b/.test(release), 'voice survives the release — `already capturing` forever');
  // The refusal that produced the wedge is unchanged; what changes is that
  // nothing reaches it holding a stale session.
  const start = /ipcMain\.handle\('maia:voice-start'[\s\S]*?\n\}\);/.exec(mainJs)[0];
  assert.ok(/if \(voice\) return \{ ok: false, reason: 'already capturing' \}/.test(start),
    'the start guard changed — this unit must not weaken it, only stop feeding it a corpse');
  assert.ok(/signedIn/.test(start), 'capture can start without a member');
});

test('FALSIFICATION — the watchdog stops, even when there was no session to release', () => {
  assert.ok(/stopCaptureWatchdog\(\)/.test(release), 'a timer would outlive its session');
  // Ordered before the early return, so an idempotent second call still stops it.
  const stopIdx = release.indexOf('stopCaptureWatchdog()');
  const guardIdx = release.indexOf('if (!voice) return false');
  assert.ok(stopIdx >= 0 && guardIdx > stopIdx,
    'the watchdog stop sits behind the no-session guard — a stale timer could survive');
});

test('FALSIFICATION — repeat teardown is idempotent and reports honestly', () => {
  assert.ok(/if \(!voice\) return false;/.test(release), 'a second teardown would throw on a null session');
  assert.ok(/return true;/.test(release), 'the caller cannot tell whether anything was released');
});

test('FALSIFICATION — authoritative idle state is pushed, so the renderer un-sticks', () => {
  assert.ok(/pushState\(\)/.test(release), 'the surface is never told capture ended');
  const snap = /function voiceStateSnapshot\(\)[\s\S]*?\n\}/.exec(mainJs)[0];
  assert.ok(/if \(!voice\) return \{ active: false/.test(snap),
    'a null session no longer reports idle — the button would stay wrong');
});

test('the renderer still closes its OWN graph, via the auth broadcast kept after teardown', () => {
  // Main's voice-state push does not close an AudioContext or stop a track;
  // only the renderer can. It does that on signed-out auth, so the broadcast
  // must stay, and stay last.
  assert.ok(/broadcast\('maia:auth'/.test(teardown), 'the auth broadcast was dropped from teardown');
  assert.ok(teardown.indexOf("broadcast('maia:auth'") > teardown.indexOf('releaseCapture'),
    'auth is broadcast before capture is released — the renderer would stop into a live session');
  const renderer = strip('renderer.js');
  const showSignedIn = /function showSignedIn\(state\)[\s\S]*?\n\}/.exec(renderer)[0];
  assert.ok(/if \(listening\) stopListening\(\)/.test(showSignedIn),
    'the renderer no longer closes its capture graph on sign-out');
});

// ── the normal Stop path is untouched ───────────────────────────────────────

test('FALSIFICATION — normal Stop behavior is unchanged: it still salvages and commits', () => {
  assert.ok(/voice\.epoch\.userStop\(\)/.test(stopHandler),
    'the member gesture stopped salvaging — this unit must not touch Stop');
  assert.ok(/voice\.epoch\.commit\(\)/.test(stopHandler), 'Stop no longer commits what was said');
  assert.ok(/voice\.liveness\.disarm\(\)/.test(stopHandler));
  assert.ok(/chars: text\.length/.test(stopHandler), 'Stop\'s return contract changed');
  assert.ok(/stopCaptureByMemberGesture\(\)/.test(stopIpc),
    'the Stop handler no longer routes through the one member-gesture stop');
  // ⛔ And Stop must NOT be reimplemented in terms of the forced release, which
  // would silently turn a member's "keep what I said" into a discard.
  assert.ok(!/releaseCapture/.test(stopHandler),
    'Stop routes through the forced discard — the member would lose their tail');
});

// ── an in-flight turn cannot outlive its session ────────────────────────────

test('FALSIFICATION — a turn released mid-flight makes no further request and uses no result', () => {
  assert.ok(/const session = voice;/.test(runTurn), 'the turn does not pin its session');
  assert.ok(/const stillOurs = \(\) => voice === session;/.test(runTurn));
  // The invariant is "every network await is followed by a liveness guard".
  // There are two awaits and they now live in two functions: transcription in
  // runTurn, the ask in the shared delivery path. Both must still be guarded.
  const guards = (runTurn.match(/if \(!stillOurs\(\)\) return;/g) || []).length
               + (deliver.match(/if \(!stillValid\(\)\) return;/g) || []).length;
  assert.equal(guards, 2,
    `${guards} liveness guard(s) — every network await needs exactly one after it`);

  // Specifically: after transcription (before a final is written and before MAIA
  // is asked) and after MAIA answers (before her words are broadcast).
  const afterTranscribe = runTurn.indexOf('await conversation.transcribe');
  const finalIdx = runTurn.indexOf('session.epoch.final');
  const firstGuard = runTurn.indexOf('if (!stillOurs()) return;');
  assert.ok(firstGuard > afterTranscribe && firstGuard < finalIdx,
    'a final can be written into an epoch whose session was released');
  // The post-ask guard moved into the shared delivery path with the ask
  // itself — so it now protects the typed turn too, not just the spoken one.
  const askIdx = deliver.indexOf('await conversation.ask');
  assert.ok(deliver.indexOf('if (!stillValid()) return;', askIdx) > askIdx,
    'MAIA\'s answer is delivered for a member who signed out mid-turn');
});

test('the turn uses the PINNED session, never the mutable global, after an await', () => {
  assert.ok(/session\.sampleRate/.test(runTurn), 'reads voice.sampleRate — a null deref after release');
  assert.ok(/session\.epoch\.final/.test(runTurn), 'reads voice.epoch after an await');
  assert.ok(/session\.utterance\.take/.test(runTurn));
  const body = runTurn.slice(runTurn.indexOf('turnBusy = true'));
  assert.ok(!/\bvoice\.(epoch|utterance|sampleRate|liveness)/.test(body),
    'the turn body still reaches through the global session across an await');
});

test('FALSIFICATION — the release does not clear turnBusy out from under a live turn', () => {
  assert.ok(!/turnBusy = false/.test(release),
    'clearing turnBusy here would let a second turn start beneath the first');
  assert.ok(/finally \{\s*turnBusy = false;/.test(runTurn), 'the turn no longer owns its own flag');
});

// ── no authority expansion ──────────────────────────────────────────────────

test('FALSIFICATION — no new preload or IPC channel', () => {
  const { INVOKE_CHANNEL_NAMES, PUSH_CHANNEL_NAMES } = require('./d01-preload-allowlist.mjs');
  // 11 since DESKTOP-TEXT-01 ratified `maia:send-text` — a member cannot type
  // to MAIA without a verb that carries words to main, and it argued for itself
  // in the allow-list. This number exists to make the NEXT addition deliberate
  // too; it is not a budget to spend.
  assert.equal(INVOKE_CHANNEL_NAMES.length, 11, 'the ratified invoke allow-list changed size');
  assert.ok(INVOKE_CHANNEL_NAMES.includes('maia:send-text'));
  assert.equal(PUSH_CHANNEL_NAMES.length, 6, 'the ratified push allow-list changed size');
  assert.ok(!/ipcMain\.handle/.test(release), 'the release opened its own channel');
  // The repair is entirely main-side: the renderer gets no new verb, and needs
  // none — it already reacts to the auth broadcast and the voice-state push.
  const preload = strip('preload.js');
  for (const banned of ['release', 'forceStop', 'captureRelease']) {
    assert.ok(!preload.toLowerCase().includes(banned.toLowerCase()), `preload exposes ${banned}`);
  }
});
