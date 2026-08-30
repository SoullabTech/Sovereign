// DESKTOP SOVEREIGN CORE 04 — the voice session lifecycle.
//
// The whole capture lifecycle lived inside ipcMain handlers, so nothing could
// reach it without Electron and a real microphone. Two things in particular
// were entirely unproven: what a REFUSED microphone does, and what Desktop does
// with speech the system nearly lost.
//
// ⛔ Proof doctrine: occurrence, non-occurrence, ordering, state-after-success,
// state-after-failure — proven separately, never inferred from truthiness or
// final state, with each scenario arranged so the failing case can fail.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createVoiceLifecycle } = require('../src/voice-lifecycle.js');
const { createEpochState } = require('../src/voice/epoch.js');
const { createCaptureLiveness } = require('../src/capture-liveness.js');
const { createUtteranceBuffer } = require('../src/voice/utterance.js');

/** A session whose every effect lands in ONE ordered log. */
function stubSession(log, o = {}) {
  return {
    frames: 0,
    sampleRate: 48000,
    epoch: {
      startEpoch: () => log.push({ epoch: 'startEpoch' }),
      micGranted: () => log.push({ epoch: 'micGranted' }),
      captureLost: (c) => { log.push({ epoch: 'captureLost', cause: c }); return { outcome: 'empty' }; },
      audioStarted: () => log.push({ epoch: 'audioStarted' }),
      speechStarted: () => log.push({ epoch: 'speechStarted' }),
      userStop: () => { log.push({ epoch: 'userStop' }); return { outcome: 'empty' }; },
      commit: () => { log.push({ epoch: 'commit' }); return o.text || 'hello'; },
    },
    liveness: {
      arm: () => log.push({ liveness: 'arm' }),
      noteFrame: () => { log.push({ liveness: 'noteFrame' }); return o.promote || null; },
      lost: (c) => log.push({ liveness: 'lost', cause: c }),
      disarm: () => log.push({ liveness: 'disarm' }),
    },
    utterance: { push: (f) => log.push({ buffered: f.length }) },
    vad: { push: () => { log.push({ vad: 'push' }); return o.vad || []; } },
    diagnostics: { emit: (e, m) => log.push({ emitted: e, meta: m }) },
  };
}

function wire(o = {}) {
  const log = [];
  let v = o.session === undefined ? stubSession(log, o) : o.session;
  const lc = createVoiceLifecycle({
    voice: () => v,
    watch: { start: () => log.push({ watch: 'start' }), stop: () => log.push({ watch: 'stop' }) },
    announce: () => log.push({ announced: true }),
    dispatchTurn: () => log.push({ dispatched: true }),
    revokeSession: () => { log.push({ revoked: true }); v = null; },
    projectState: () => ({ snapshotOf: v ? 'live' : 'idle' }),
  });
  return { lc, log, session: () => v, setSession: (x) => { v = x; },
           order: () => log.map((e) => Object.keys(e)[0] + (e.epoch || e.liveness || e.watch || '')) };
}

// ── begin ───────────────────────────────────────────────────────────────────

test('begin opens the epoch, arms liveness, starts supervision, then announces', () => {
  const { lc, log } = wire();
  assert.deepEqual(lc.begin(), { ok: true });
  assert.deepEqual(log, [
    { epoch: 'startEpoch' }, { liveness: 'arm' }, { watch: 'start' }, { announced: true },
  ]);
});

test('⭐ the epoch opens BEFORE liveness is armed', () => {
  const { lc, log } = wire();
  lc.begin();
  const opened = log.findIndex((e) => e.epoch === 'startEpoch');
  const armed = log.findIndex((e) => e.liveness === 'arm');
  assert.ok(opened >= 0 && armed > opened,
    'frames were declared expected for an epoch that had not opened — a detected loss would have no epoch to close');
});

test('begin without a session is refused, and touches nothing', () => {
  const { lc, log } = wire({ session: null });
  assert.deepEqual(lc.begin(), { ok: false, reason: 'no capture session' });
  assert.deepEqual(log, []);
});

// ── ⭐ THE ASYMMETRY RULING ─────────────────────────────────────────────────

test('⭐ a REFUSED microphone closes the epoch and revokes the session', () => {
  const { lc, log } = wire();
  assert.deepEqual(lc.micResult(false, 'NotAllowedError'), { ok: true });
  assert.equal(log.find((e) => e.epoch === 'captureLost').cause, 'permission_denied',
    'the open epoch was abandoned rather than closed');
  assert.ok(log.some((e) => e.revoked), 'the session survived a refusal it cannot recover from');
  assert.equal(log.find((e) => e.emitted).meta.errorName, 'NotAllowedError');
});

test('⭐ a REFUSED microphone does NOT send liveness looking for a rebuild', () => {
  const { lc, log } = wire();
  lc.micResult(false, 'NotAllowedError');
  assert.equal(log.filter((e) => e.liveness === 'lost').length, 0,
    'a refusal spent the member’s single bounded recovery on something no rebuild can fix, ' +
    'and asserted RECOVERING about a session being destroyed on the next line');
});

test('⭐ a LOST capture DOES seek a rebuild — and the session survives', () => {
  const { lc, log, session } = wire();
  const out = lc.captureLost('track_ended');
  assert.equal(out.ok, true);
  assert.equal(log.find((e) => e.epoch === 'captureLost').cause, 'track_ended');
  assert.equal(log.find((e) => e.liveness === 'lost').cause, 'track_ended',
    'a real loss did not seek the one rebuild it is entitled to');
  assert.equal(log.filter((e) => e.revoked).length, 0, 'a recoverable loss destroyed the session');
  assert.ok(session(), 'the session was dropped on a loss it could have recovered from');
});

test('⭐ the two paths differ in exactly one thing: whether a rebuild is sought', () => {
  // The ruling, stated as a diff. Both close the epoch; only one seeks recovery;
  // only the other revokes.
  const a = wire(); a.lc.micResult(false, 'NotAllowedError');
  const b = wire(); b.lc.captureLost('track_muted');
  const closed = (l) => l.some((e) => e.epoch === 'captureLost');
  assert.ok(closed(a.log) && closed(b.log), 'one of the paths leaves an open epoch behind');
  assert.equal(a.log.some((e) => e.liveness === 'lost'), false);
  assert.equal(b.log.some((e) => e.liveness === 'lost'), true);
  assert.equal(a.log.some((e) => e.revoked), true);
  assert.equal(b.log.some((e) => e.revoked), false);
});

test('a GRANTED microphone records the grant and nothing else', () => {
  const { lc, log } = wire();
  lc.micResult(true, 'Error');
  assert.ok(log.some((e) => e.epoch === 'micGranted'));
  assert.equal(log.filter((e) => e.epoch === 'captureLost').length, 0);
  assert.equal(log.filter((e) => e.revoked).length, 0);
  assert.ok(log.some((e) => e.announced));
});

// ── frame pipeline ──────────────────────────────────────────────────────────

test('⭐ the buffer is filled BEFORE the VAD runs', () => {
  const { lc, log } = wire();
  lc.frame(Float32Array.from([0.1, 0.2]), 20);
  const buffered = log.findIndex((e) => 'buffered' in e);
  const vad = log.findIndex((e) => e.vad);
  assert.ok(buffered >= 0 && vad > buffered,
    'the VAD consumed a boundary before the frame reached the buffer — the first syllable is clipped');
});

test('⭐ liveness is noted before the buffer — a just-proved rebuild is visible', () => {
  const { lc, log } = wire();
  lc.frame(Float32Array.from([0.1]), 20);
  const noted = log.findIndex((e) => e.liveness === 'noteFrame');
  const buffered = log.findIndex((e) => 'buffered' in e);
  assert.ok(noted >= 0 && buffered > noted);
});

test('a liveness promotion announces; a healthy frame does not', () => {
  const promoted = wire({ promote: { transition: 'listening' } });
  promoted.lc.frame(Float32Array.from([0.1]), 20);
  assert.equal(promoted.log.filter((e) => e.announced).length, 1);

  const healthy = wire();
  healthy.lc.frame(Float32Array.from([0.1]), 20);
  assert.equal(healthy.log.filter((e) => e.announced).length, 0,
    'every frame redrew the surface — 375 announcements a second');
});

test('frames are counted, and a plain array is normalised to PCM', () => {
  const { lc, log, session } = wire();
  lc.frame([0.1, 0.2, 0.3], 20);
  assert.equal(session().frames, 1);
  assert.equal(log.find((e) => 'buffered' in e).buffered, 3);
});

test('VAD transitions map onto the epoch, and a boundary dispatches a turn', () => {
  const { lc, log } = wire({ vad: ['audio_started', 'speech_started', 'utterance_boundary'] });
  lc.frame(Float32Array.from([0.1]), 20);
  assert.ok(log.some((e) => e.epoch === 'audioStarted'));
  assert.ok(log.some((e) => e.epoch === 'speechStarted'));
  assert.ok(log.some((e) => e.dispatched), 'an utterance boundary never asked for a final');
});

test('⛔ a boundary does NOT end the epoch — capture runs through the pause', () => {
  const { lc, log } = wire({ vad: ['utterance_boundary'] });
  lc.frame(Float32Array.from([0.1]), 20);
  assert.equal(log.filter((e) => e.epoch === 'userStop' || e.epoch === 'commit').length, 0,
    'a pause tore down capture');
  assert.equal(log.filter((e) => e.watch === 'stop').length, 0);
});

test('a frame after the session is gone is refused, and dispatches nothing', () => {
  const { lc, log, setSession } = wire();
  setSession(null);
  assert.deepEqual(lc.frame(Float32Array.from([0.1]), 20), { ok: false, reason: 'no capture session' });
  assert.deepEqual(log, []);
});

test('⭐ frames still in flight when the session is revoked are refused, not applied', () => {
  // ⛔ The narrow version of this (null the session before ANY use) passes even
  // against a lifecycle that caches the session on first resolve, because the
  // cache is still empty. The real path: the renderer posts a block every
  // 2.67 ms, so when `end` or a denial revokes mid-stream there are frames
  // already in flight. A cached session would apply them to a committed epoch.
  const { lc, log } = wire();
  lc.begin();
  lc.frame(Float32Array.from([0.1]), 20);          // a LIVE frame first
  lc.end();                                         // revokes
  log.length = 0;

  assert.deepEqual(lc.frame(Float32Array.from([0.2]), 20),
    { ok: false, reason: 'no capture session' });
  assert.deepEqual(log, [], 'an in-flight frame was applied to a revoked session');
});

test('⭐ after a refusal revokes the session, later lifecycle calls touch nothing', () => {
  const { lc, log } = wire();
  lc.begin();
  lc.frame(Float32Array.from([0.1]), 20);
  lc.micResult(false, 'NotAllowedError');           // revokes
  log.length = 0;

  assert.equal(lc.frame(Float32Array.from([0.2]), 20).ok, false);
  assert.equal(lc.captureLost('track_ended').ok, false);
  assert.equal(lc.end().ok, false);
  assert.deepEqual(log, [], 'a revoked session was still being driven');
});

// ── end ─────────────────────────────────────────────────────────────────────

test('⭐ end: supervision stops before the epoch closes, and the snapshot precedes revocation', () => {
  const { lc, log } = wire({ text: 'hello there' });
  const out = lc.end();
  assert.equal(out.ok, true);
  assert.equal(out.chars, 11, 'chars are not the committed length');
  assert.deepEqual(out.snapshot, { snapshotOf: 'live' },
    'the caller was handed the idle snapshot — the projection was taken after revocation');
  assert.deepEqual(log.map((e) => Object.keys(e)[0] === 'epoch' ? e.epoch : Object.keys(e)[0]), [
    'liveness', 'watch', 'userStop', 'commit', 'revoked', 'announced',
  ]);
});

test('⭐ supervision is stopped BEFORE the epoch closes', () => {
  const { lc, log } = wire();
  lc.end();
  const stopped = log.findIndex((e) => e.watch === 'stop');
  const closed = log.findIndex((e) => e.epoch === 'userStop');
  assert.ok(stopped >= 0 && closed > stopped,
    'a supervision tick could report a loss for a session being closed deliberately');
});

test('end returns only the committed length, never the transcript', () => {
  const { lc } = wire({ text: 'a private thing the member said' });
  const out = lc.end();
  assert.equal(typeof out.chars, 'number');
  assert.equal(JSON.stringify(out).includes('private thing'), false,
    'the transcript left through the return value');
});

// ── ⭐ SALVAGE: the member's authorship, proven at the Desktop disposition ───

test('⭐ salvaged speech becomes the member’s draft — it is NOT a completed turn', () => {
  // The composition root's disposition, asserted directly rather than through
  // the epoch's generic callback stub. d01-tail-invariant proves the epoch CALLS
  // onSalvage; nothing proved what Desktop DOES with the call.
  const log = [];
  const draft = [];
  const diagnostics = { emit: (e, m) => log.push({ e, m }) };
  const epoch = createEpochState({
    diagnostics,
    onSalvage: (text) => { draft.push(text); return true; },   // main.js:newVoiceSession
  });

  epoch.startEpoch();
  epoch.partial('something half-said');
  const dispatched = [];
  const lc = createVoiceLifecycle({
    voice: () => ({
      frames: 0, epoch, diagnostics,
      liveness: { lost: () => {}, arm: () => {}, disarm: () => {}, noteFrame: () => null },
      utterance: createUtteranceBuffer(),
      vad: { push: () => [] },
    }),
    watch: { start: () => {}, stop: () => {} },
    announce: () => {},
    dispatchTurn: () => dispatched.push(true),
    revokeSession: () => {},
    projectState: () => null,
  });

  lc.captureLost('track_ended');

  assert.deepEqual(draft, ['something half-said'],
    'nearly-lost speech did not reach the member’s draft');
  assert.deepEqual(dispatched, [],
    'salvage alone completed a turn — the member never decided the words were final');
  assert.ok(log.some((x) => x.e === 'voice_transcript_salvaged'),
    'the salvage was silent; the member cannot know words were nearly lost');
  assert.equal(epoch.snapshot().committed, false,
    'salvage committed the epoch — salvaged material was treated as authored');
});

test('⭐ a refused salvage is stated as a loss, never dropped quietly', () => {
  const log = [];
  const diagnostics = { emit: (e, m) => log.push({ e, m }) };
  const epoch = createEpochState({ diagnostics, onSalvage: () => false });
  epoch.startEpoch();
  epoch.partial('half a sentence');
  epoch.captureLost('track_ended');
  assert.ok(log.some((x) => x.e === 'voice_tail_lost'),
    'material the member nearly said vanished without the loss being stated');
});

// ── the real liveness machine, driven through the real lifecycle ────────────

test('⭐ end-to-end: a refusal leaves liveness un-spent for a later real loss', () => {
  let clock = 0;
  const liveness = createCaptureLiveness({ now: () => clock });
  const log = [];
  const v = {
    frames: 0, liveness,
    epoch: { startEpoch: () => {}, captureLost: () => ({}), micGranted: () => {} },
    diagnostics: { emit: () => {} },
    utterance: { push: () => {} }, vad: { push: () => [] },
  };
  let live = v;
  const lc = createVoiceLifecycle({
    voice: () => live, watch: { start: () => {}, stop: () => {} },
    announce: () => log.push('announced'), dispatchTurn: () => {},
    revokeSession: () => { live = null; }, projectState: () => null,
  });

  lc.begin();
  assert.equal(liveness.state, 'starting');
  lc.micResult(false, 'NotAllowedError');
  assert.equal(liveness.recoveriesUsed, 0,
    'the refusal burned the single recovery a later real loss is entitled to');
  assert.equal(liveness.state, 'starting',
    'the refusal asserted RECOVERING about a session that was being destroyed');
});
