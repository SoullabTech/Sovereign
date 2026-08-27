// MAIA-D02A — capture liveness. The app must never say it is listening while
// no audio is arriving.
//
// Desktop declared "Listening…" the moment the worklet connected, with no
// independent proof that a single frame had ever been produced. A worklet that
// connects and then emits nothing left the live dot and "Listening…" on screen
// indefinitely, and the member kept talking into nothing.
//
// These assertions pin the founder's state contract: frame receipt — not
// AudioWorklet connection — is the authority for LISTENING.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createCaptureLiveness, SILENT_DEATH_MS } = require('../src/capture-liveness.js');

/** A liveness machine on a clock we control, so no test needs a microphone. */
function mk(opts = {}) {
  let t = 0;
  const l = createCaptureLiveness({ now: () => t, ...opts });
  return { l, tick: (ms) => { t += ms; }, at: () => t };
}

// ── 1. Normal start ─────────────────────────────────────────────────────────

test('1. STARTING → first PCM frame → LISTENING', () => {
  const { l, tick } = mk();
  l.arm();
  assert.equal(l.state, 'starting');
  assert.equal(l.isListening, false, 'connected is not listening');

  tick(40);
  const t = l.noteFrame();
  assert.equal(t.transition, 'listening');
  assert.equal(t.first, true);
  assert.equal(l.state, 'listening');
  assert.equal(l.isListening, true);
});

test('a healthy frame is not an event — the watchdog stays quiet', () => {
  const { l, tick } = mk();
  l.arm(); l.noteFrame();
  tick(60);
  assert.equal(l.noteFrame(), null, 'steady-state frames must not churn the UI');
  assert.equal(l.check(), null, 'a tick is not an event');
});

// ── 2. Worklet connects but never emits ─────────────────────────────────────

test('2. ⭐ THE DEFECT: connected but never emitting never becomes LISTENING', () => {
  const { l, tick } = mk();
  l.arm();

  // Far past any plausible threshold. This is the sixteen-second case.
  for (let i = 0; i < 20; i++) { tick(1000); l.check(); }

  assert.notEqual(l.state, 'listening', 'claimed LISTENING with zero frames');
  assert.equal(l.isListening, false);
  assert.ok(['recovering', 'unavailable'].includes(l.state), `got ${l.state}`);
});

test('2b. the never-started cause is distinct from a stream that died', () => {
  const { l, tick } = mk();
  l.arm();
  tick(SILENT_DEATH_MS + 1);
  const t = l.check();
  assert.equal(t.transition, 'lost');
  assert.equal(t.cause, 'never_started', 'a graph that never produced is its own cause');
});

// ── 3. Capture dies after working ───────────────────────────────────────────

test('3. a stream that dies mid-conversation loses the LISTENING state', () => {
  const { l, tick } = mk();
  l.arm(); l.noteFrame();
  assert.equal(l.isListening, true);

  tick(SILENT_DEATH_MS + 1);
  const t = l.check();
  assert.equal(t.cause, 'silent_death');
  assert.equal(l.isListening, false, 'still presenting LISTENING after capture died');
});

test('3b. the threshold is not crossed early — a pause is not a failure', () => {
  const { l, tick } = mk();
  l.arm(); l.noteFrame();
  tick(SILENT_DEATH_MS - 1);
  assert.equal(l.check(), null, 'a false positive interrupts a live conversation');
  assert.equal(l.isListening, true);
});

// ── 4. Recovery succeeds ────────────────────────────────────────────────────

test('4. frames resuming after a loss returns the session to LISTENING', () => {
  const { l, tick } = mk();
  l.arm(); l.noteFrame();
  tick(SILENT_DEATH_MS + 1);
  assert.equal(l.check().recovering, true);
  assert.equal(l.state, 'recovering');

  const back = l.noteFrame();
  assert.equal(back.transition, 'recovered');
  assert.equal(l.state, 'listening');
  assert.equal(l.isListening, true);
});

// ── 5. Recovery fails ───────────────────────────────────────────────────────

test('5. ⭐ a failed recovery ends in UNAVAILABLE, never in fake listening', () => {
  const { l, tick } = mk();
  l.arm(); l.noteFrame();
  tick(SILENT_DEATH_MS + 1);
  l.check();                                   // → recovering
  tick(SILENT_DEATH_MS + 1);
  const t = l.check();                         // rebuild produced nothing
  assert.equal(t.transition, 'failed');
  assert.equal(l.state, 'unavailable');
  assert.equal(l.isListening, false);
});

test('5b. UNAVAILABLE is terminal — nothing silently resurrects it', () => {
  const { l, tick } = mk();
  l.arm(); l.noteFrame();
  tick(SILENT_DEATH_MS + 1); l.check();
  tick(SILENT_DEATH_MS + 1); l.check();
  assert.equal(l.state, 'unavailable');
  assert.equal(l.noteFrame(), null, 'a stray frame must not un-say the truth');
  assert.equal(l.state, 'unavailable');
});

test('5c. recovery is bounded — a session cannot flap forever', () => {
  const { l, tick } = mk();
  l.arm(); l.noteFrame();
  tick(SILENT_DEATH_MS + 1); l.check();        // recovery 1
  l.noteFrame();                               // recovered
  tick(SILENT_DEATH_MS + 1);
  const t = l.check();
  assert.equal(t.transition, 'failed', 'budget must not reset on success');
  assert.equal(l.recoveriesUsed, 1);
});

// ── explicit track losses share the path ────────────────────────────────────

test('track_ended and track_muted change state the same way silent death does', () => {
  for (const cause of ['track_ended', 'track_muted']) {
    const { l } = mk();
    l.arm(); l.noteFrame();
    const t = l.lost(cause);
    assert.equal(t.cause, cause);
    assert.equal(l.isListening, false, `${cause} left the surface claiming to listen`);
  }
});

// ── 6. Diagnostics ──────────────────────────────────────────────────────────

test('6. silence duration and last frame are observable without per-frame diagnostics', () => {
  const { l, tick } = mk();
  l.arm();
  assert.equal(l.lastFrameAt, null, 'no frame has arrived; there is no timestamp to report');
  tick(500);
  assert.equal(l.silenceMs(), 500, 'total silence is measurable with zero frames');

  l.noteFrame();
  const at = l.lastFrameAt;
  tick(750);
  assert.equal(l.lastFrameAt, at);
  assert.equal(l.silenceMs(), 750);
});

test('disarming is not a loss', () => {
  const { l } = mk();
  l.arm(); l.noteFrame();
  l.disarm();
  assert.equal(l.state, 'idle');
  assert.equal(l.isListening, false);
  assert.equal(l.check(), null, 'a stopped session must not report failures');
});
