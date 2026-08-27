// MAIA Desktop — capture liveness.
//
// MAIA-D02A. The app must never tell the member it is listening while no audio
// is arriving.
//
// ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
//
// On 2026-08-27 the PWA held LISTENING for sixteen seconds with zero audio
// frames: the interface said it was hearing the member, and it was not. Desktop
// was worse. It had no detector at all, and its two existing loss signals —
// `track_ended` and `track_muted` — reported to the main process and never
// changed anything the member could see. Three ways to lose the microphone,
// zero visible consequences.
//
// This is the silent-success class: a system reporting a state it is not in.
// It is worse than a system reporting failure, because it spends the member's
// trust to do it. They keep talking into nothing.
//
// ── WHY ABSENCE OF FRAMES IS UNAMBIGUOUS ────────────────────────────────────
//
// The worklet posts a message for EVERY audio block — a 128-sample block every
// 2.67 ms, ~375 a second — and silence is still audio blocks. So no frames does
// NOT mean "the member is quiet". It means the capture graph is dead.
//
// That is what makes this detector safe to build. It never has to guess at a
// speech threshold, so it can never mistake a thoughtful pause for a failure.
// The near-silence gate in `conversation.js` is the one that judges CONTENT;
// this one only asks whether audio is arriving at all.
//
// ⛔ This module holds no timer and no DOM. It is a decision function over a
// clock, so the whole policy is testable without a microphone — the same reason
// D01's guard lives outside the renderer.
'use strict';

/**
 * No frames for this long means the graph is not producing, whether it never
 * started or stopped. ~1100 missed blocks against the 2.67 ms cadence —
 * generous by three orders of magnitude, because a false positive interrupts a
 * live conversation and that costs more than a slightly late truth.
 */
const SILENT_DEATH_MS = 3000;

/** How many times the capture graph may be rebuilt before we stop and say so. */
const MAX_RECOVERIES = 1;

/**
 * ── THE STATE CONTRACT (founder ruling, MAIA-D02A) ──────────────────────────
 *
 *   IDLE         not capturing
 *   STARTING     worklet connected, WAITING FOR THE FIRST REAL FRAME
 *   LISTENING    recent audio frames positively observed
 *   RECOVERING   expected frames stopped arriving; one rebuild in flight
 *   UNAVAILABLE  bounded recovery failed — the member must be told
 *
 * ⭐ STARTING is the whole point. "Listening" must NOT be synonymous with
 * "worklet connected": a worklet that connects and never emits is precisely the
 * failure this unit exists to catch, and a detector that assumes liveness at
 * connect time would report it as healthy forever.
 *
 * ⭐ FRAME RECEIPT IS THE AUTHORITY. Nothing else may promote a session to
 * LISTENING — not a successful getUserMedia, not a connected node, not the
 * absence of an error.
 */
const IDLE = 'idle';
const STARTING = 'starting';
const LISTENING = 'listening';
const RECOVERING = 'recovering';
const UNAVAILABLE = 'unavailable';

function createCaptureLiveness(opts = {}) {
  const now = opts.now || (() => Date.now());
  const silentDeathMs = opts.silentDeathMs ?? SILENT_DEATH_MS;
  const maxRecoveries = opts.maxRecoveries ?? MAX_RECOVERIES;

  let state = IDLE;
  let lastFrameAt = null;     // null until a frame has ACTUALLY arrived
  let waitingSince = 0;       // when the current expectation of frames began
  let recoveries = 0;
  let lastCause = null;

  /** Enter the loss path. Shared by the watchdog and by explicit track events,
   *  so a muted device and a dead worklet cannot diverge in what is shown. */
  function enterLoss(cause) {
    lastCause = cause;
    if (recoveries < maxRecoveries) {
      recoveries += 1;
      state = RECOVERING;
      waitingSince = now();       // the rebuild gets a full window to prove itself
      return { transition: 'lost', cause, state, recovering: true };
    }
    state = UNAVAILABLE;
    return { transition: 'failed', cause, state, recovering: false };
  }

  return {
    /** Capture has started. Frames are EXPECTED but none have arrived. */
    arm() {
      state = STARTING;
      lastFrameAt = null;
      waitingSince = now();
      recoveries = 0;
      lastCause = null;
      return { transition: 'starting', state };
    },

    /** A batch of real audio arrived — the only thing that proves liveness. */
    noteFrame() {
      if (state === IDLE || state === UNAVAILABLE) return null;
      const first = lastFrameAt === null;
      lastFrameAt = now();
      waitingSince = lastFrameAt;
      if (state === STARTING) { state = LISTENING; return { transition: 'listening', state, first }; }
      if (state === RECOVERING) { state = LISTENING; return { transition: 'recovered', state, cause: lastCause }; }
      return null;                 // healthy and already LISTENING: not an event
    },

    /**
     * Watchdog tick. Returns a transition or null.
     * ⛔ Returns null while healthy — a tick is not an event, and a watchdog
     * that broadcast every second would be its own kind of noise.
     */
    check() {
      if (state !== STARTING && state !== LISTENING && state !== RECOVERING) return null;
      if (now() - waitingSince <= silentDeathMs) return null;
      if (state === RECOVERING) {
        state = UNAVAILABLE;
        return { transition: 'failed', cause: lastCause || 'silent_death', state, recovering: false };
      }
      // STARTING that never produced is a distinct cause from a stream that
      // died mid-conversation, and the member-facing wording differs.
      return enterLoss(state === STARTING ? 'never_started' : 'silent_death');
    },

    /** An explicit loss signal — `track_ended`, `track_muted`, or similar. */
    lost(cause) {
      if (state === IDLE || state === UNAVAILABLE) return null;
      return enterLoss(cause || 'unknown');
    },

    /** Capture stopped deliberately. Not a loss. */
    disarm() {
      state = IDLE;
      lastCause = null;
      lastFrameAt = null;
      return { transition: 'disarmed', state };
    },

    /** ⭐ The surface may present "Listening…" only when this is true. */
    get isListening() { return state === LISTENING; },
    get state() { return state; },
    get cause() { return lastCause; },
    get recoveriesUsed() { return recoveries; },
    /** Observable without per-frame diagnostics — total silence is detectable
     *  precisely because nothing per-frame is required to notice it. */
    get lastFrameAt() { return lastFrameAt; },
    silenceMs() { return now() - waitingSince; },
  };
}

module.exports = {
  createCaptureLiveness, SILENT_DEATH_MS, MAX_RECOVERIES,
  IDLE, STARTING, LISTENING, RECOVERING, UNAVAILABLE,
};
