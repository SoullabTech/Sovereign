// DESKTOP SOVEREIGN CORE 03 — capture supervision.
//
// d02a proves the liveness POLICY as a pure function. Nothing proved the
// SUPERVISION: it sat inside a `setInterval` in main.js, so what a detected
// loss does to the epoch, to the diagnostic record and to the surface — and in
// what order — was reachable only by running Electron with a real microphone
// and then unplugging it.
//
// ⛔ Proof doctrine (founder ruling, DSC-03): for a state transition, prove
// OCCURRENCE, NON-OCCURRENCE, ORDERING, and STATE-AFTER separately. Do not
// infer any of them from truthiness or from the final state alone. Both prior
// units had a gap of exactly that shape.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createCaptureWatch, WATCH_TICK_MS } = require('../src/capture-watch.js');
const { createCaptureLiveness, SILENT_DEATH_MS } = require('../src/capture-liveness.js');

/** A voice session stub. All effects land in ONE ordered log. */
function stubVoice(log, o = {}) {
  let checks = 0;
  return {
    get checkCount() { return checks; },
    liveness: {
      check: () => {
        checks += 1;
        const t = o.transitions ? o.transitions.shift() : null;
        log.push({ checked: t ? t.transition : null });
        return t || null;
      },
    },
    epoch: { captureLost: (cause) => log.push({ epochCaptureLost: cause }) },
    diagnostics: { emit: (event, meta) => log.push({ emitted: event, meta }) },
  };
}

function fakeTimers() {
  const live = new Map();
  let id = 0;
  return {
    live,
    setInterval: (fn, ms) => { const k = ++id; live.set(k, { fn, ms }); return { k, unref() {} }; },
    clearInterval: (h) => { if (h) live.delete(h.k); },
  };
}

function wire(o = {}) {
  const log = [];
  let v = o.voice === undefined ? stubVoice(log, o) : o.voice;
  const timers = fakeTimers();
  const w = createCaptureWatch({
    voice: () => v,
    announce: () => log.push({ announced: true }),
    timers,
    tickMs: o.tickMs,
  });
  return { w, log, timers, setVoice: (x) => { v = x; }, voice: () => v };
}

const LOSS = { transition: 'lost', cause: 'silent_death', state: 'recovering' };
const NEVER = { transition: 'lost', cause: 'never_started', state: 'recovering' };

// ── OCCURRENCE ──────────────────────────────────────────────────────────────

test('a detected loss records the epoch boundary, the diagnostic, and the surface', () => {
  const { w, log } = wire({ transitions: [LOSS] });
  const t = w.tick();
  assert.equal(t.cause, 'silent_death');
  assert.ok(log.some((e) => 'epochCaptureLost' in e), 'the epoch never learned capture was lost');
  assert.ok(log.some((e) => e.emitted === 'voice_capture_lost'), 'no diagnostic evidence was recorded');
  assert.ok(log.some((e) => e.announced), 'the member was never told');
});

test('the cause is carried verbatim — never_started is not silent_death', () => {
  const { w, log } = wire({ transitions: [NEVER] });
  w.tick();
  assert.equal(log.find((e) => 'epochCaptureLost' in e).epochCaptureLost, 'never_started');
  assert.equal(log.find((e) => e.emitted).meta.cause, 'never_started');
});

test('⭐ the diagnostic names the watchdog as the source, not the renderer', () => {
  const { w, log } = wire({ transitions: [LOSS] });
  w.tick();
  assert.equal(log.find((e) => e.emitted).meta.source, 'watchdog',
    'a watchdog-detected loss is indistinguishable from a track_ended the renderer reported');
});

// ── NON-OCCURRENCE ──────────────────────────────────────────────────────────

test('⭐ the tick is not the event — a healthy tick announces and records NOTHING', () => {
  const { w, log } = wire({ transitions: [] });
  assert.equal(w.tick(), null);
  assert.equal(log.filter((e) => 'epochCaptureLost' in e).length, 0);
  assert.equal(log.filter((e) => 'emitted' in e).length, 0);
  assert.equal(log.filter((e) => 'announced' in e).length, 0,
    'a quiet second redrew the surface');
});

test('many healthy ticks stay silent — supervision is not a heartbeat', () => {
  const { w, log } = wire({ transitions: [] });
  for (let i = 0; i < 20; i += 1) w.tick();
  assert.equal(log.filter((e) => 'announced' in e).length, 0);
});

test('⭐ the session disappearing stops supervision without announcing', () => {
  const { w, log, timers, setVoice } = wire({ transitions: [LOSS] });
  w.start();
  setVoice(null);
  const t = w.tick();
  assert.equal(t, null);
  assert.deepEqual(log, [], 'a vanished session produced an announcement');
  assert.equal(w.isWatching, false, 'supervision outlived the session it supervises');
  assert.equal(timers.live.size, 0, 'the timer outlived the session');
});

// ── ORDERING ────────────────────────────────────────────────────────────────

test('⭐ the surface is told LAST — never before the epoch records the boundary', () => {
  const { w, log } = wire({ transitions: [LOSS] });
  w.tick();
  const epoch = log.findIndex((e) => 'epochCaptureLost' in e);
  const emitted = log.findIndex((e) => 'emitted' in e);
  const announced = log.findIndex((e) => 'announced' in e);
  assert.ok(epoch >= 0 && emitted > epoch,
    'the diagnostic was recorded before the epoch knew');
  assert.ok(announced > emitted,
    'the surface was told before the record was complete — the snapshot ships a frame where liveness and epoch disagree');
});

test('⭐ the detector is asked exactly once per tick — check() mutates', () => {
  const { w, voice } = wire({ transitions: [LOSS, LOSS] });
  w.tick();
  assert.equal(voice().checkCount, 1,
    'a second check in one tick spends the member’s one recovery without waiting for it');
});

// ── STATE AFTER ─────────────────────────────────────────────────────────────

test('⭐ restarting never stacks a second watcher', () => {
  const { w, timers } = wire();
  w.start(); w.start(); w.start();
  assert.equal(timers.live.size, 1, 'each start left another timer running');
  w.stop();
  assert.equal(timers.live.size, 0);
  assert.equal(w.isWatching, false);
});

test('stop is idempotent and leaves nothing behind', () => {
  const { w, timers } = wire();
  w.start(); w.stop(); w.stop();
  assert.equal(timers.live.size, 0);
  assert.equal(w.isWatching, false);
});

test('the scheduled function is the tick itself, at the policy cadence', () => {
  const { w, timers, log } = wire({ transitions: [LOSS] });
  w.start();
  const [entry] = [...timers.live.values()];
  assert.equal(entry.ms, WATCH_TICK_MS);
  entry.fn();                                   // fire it the way a real timer would
  assert.ok(log.some((e) => 'epochCaptureLost' in e), 'the scheduled function is not the tick');
});

// ── the cadence is policy, and it is load-bearing ───────────────────────────

test('⭐ the tick stays well under the silent-death threshold', () => {
  assert.ok(WATCH_TICK_MS < SILENT_DEATH_MS,
    'detection latency is now the threshold PLUS a whole tick');
  assert.ok(SILENT_DEATH_MS / WATCH_TICK_MS >= 3,
    'the cadence is too close to the threshold to detect it promptly');
});

// ── the real detector, driven through the real supervisor ───────────────────

test('⭐ end-to-end on the real liveness policy: armed, silent, then told', () => {
  const log = [];
  let clock = 0;
  const liveness = createCaptureLiveness({ now: () => clock });
  const v = {
    liveness,
    epoch: { captureLost: (c) => log.push({ epochCaptureLost: c }) },
    diagnostics: { emit: (e, m) => log.push({ emitted: e, meta: m }) },
  };
  const w = createCaptureWatch({ voice: () => v, announce: () => log.push({ announced: true }),
    timers: fakeTimers() });

  liveness.arm();
  clock = 1000; assert.equal(w.tick(), null, 'a loss was declared inside the threshold');
  clock = 2999; assert.equal(w.tick(), null, 'a pause was mistaken for a failure');
  assert.deepEqual(log, [], 'the member was disturbed while capture was merely young');

  clock = 3001;
  const t = w.tick();
  assert.equal(t.cause, 'never_started', 'a worklet that never emitted was reported as a dead stream');
  assert.equal(liveness.state, 'recovering');
  assert.equal(log.filter((e) => 'announced' in e).length, 1);

  // A frame arriving proves the rebuild worked; supervision goes quiet again.
  liveness.noteFrame();
  assert.equal(liveness.isListening, true);
  log.length = 0;
  clock = 3500; assert.equal(w.tick(), null);
  assert.deepEqual(log, [], 'a recovered session was still being reported as lost');
});
