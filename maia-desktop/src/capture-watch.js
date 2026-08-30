// MAIA Desktop — capture supervision. MAIA-D02A / DSC-03.
//
// ⛔ READ THIS BEFORE ASSUMING THIS FILE IS THE LIVENESS DETECTOR. It is not.
// `capture-liveness.js` holds the policy — the state contract, the thresholds,
// the recovery bound — and it was ALREADY portable: a decision function over an
// injected clock, holding no timer and no DOM. DSC-03 did not move it and did
// not need to.
//
// What lived in main.js, and moved here, is the SUPERVISION around it:
//
//   how often the detector is asked          (cadence, a policy)
//   what a detected loss MEANS               (epoch + diagnostics + surface)
//   when supervision stops on its own        (the session disappeared)
//   that restarting never stacks a watcher
//
// None of that is Electron's. A native host would owe every one of these
// obligations. What Electron still supplies is the timer primitive and the
// transport, and both arrive injected.
//
// ⛔ THIS IS NOT A DESKTOP SUPERVISOR AND MUST NOT BECOME ONE. It supervises
// capture liveness and nothing else. It has one present caller. It reads no
// turn state, no conversation state, and no window state. If a later unit wants
// to house unrelated lifecycle here, that is the speculative-supervisor mistake
// the portability invariant §5 forbids — open a unit and argue for it instead.
//
// The naming follows the precedent already in this tree: `thread-watch.js` is
// the continuity policy and `continuity.js` supervises it; `capture-liveness.js`
// is the capture policy and this supervises it.

'use strict';

/**
 * How often the detector is asked. This is a POLICY value, not a host detail,
 * and it is load-bearing in one direction: it must stay well under
 * `SILENT_DEATH_MS` (3000) or detection latency becomes the threshold plus a
 * whole tick. A test asserts that relationship rather than trusting it.
 */
const WATCH_TICK_MS = 1000;

/**
 * @param voice     () => voice session | null   (replaced on every capture start)
 * @param announce  () => void   push the voice-state snapshot to the surface
 */
function createCaptureWatch({
  voice,
  announce,
  timers = { setInterval, clearInterval },
  tickMs = WATCH_TICK_MS,
} = {}) {
  let handle = null;

  /**
   * One supervision tick. Returns the transition, or null.
   *
   * ⛔ THE TICK IS NOT THE EVENT. `check()` returns null while healthy, so this
   * announces only on a real transition — a watchdog that broadcast every
   * second would be its own kind of noise.
   *
   * ⛔ `voice()` is re-read every tick rather than captured at start. That is
   * the self-stop: when the session disappears, supervision ends on its own.
   * It is load-bearing, not defensive — the microphone-denied path drops the
   * session WITHOUT stopping the watcher and relies on this tick to notice.
   *
   * ⛔ `check()` MUTATES. It is called exactly once per tick: twice would let a
   * session fall STARTING → RECOVERING → UNAVAILABLE inside a single second and
   * spend the member's one recovery without ever waiting for it.
   */
  function tick() {
    const v = voice && voice();
    if (!v) { stop(); return null; }

    const t = v.liveness.check();
    if (!t) return null;

    // The epoch machine already knows how to record a capture boundary; this
    // reuses it rather than inventing a second notion of "lost". The cause is
    // carried through verbatim — `never_started` and `silent_death` are
    // different truths and the member-facing wording differs.
    v.epoch.captureLost(t.cause);
    v.diagnostics.emit('voice_capture_lost', {
      cause: t.cause,
      source: 'watchdog',
    });

    // ⛔ LAST, always. The snapshot the surface receives reads BOTH the liveness
    // state and the epoch's. Announcing before the epoch records the boundary
    // would ship a frame in which the two disagree.
    announce();
    return t;
  }

  function start() {
    stop();                       // restarting must never stack a second watcher
    handle = timers.setInterval(tick, tickMs);
    if (handle && handle.unref) handle.unref();
  }

  function stop() {
    if (handle) { timers.clearInterval(handle); handle = null; }
  }

  return { start, stop, tick, get isWatching() { return handle !== null; } };
}

module.exports = { createCaptureWatch, WATCH_TICK_MS };
