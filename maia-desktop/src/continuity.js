// MAIA Desktop — conversation continuity. MAIA-D04 / MAIA-D04A.
//
// Extracted from main.js by DESKTOP SOVEREIGN CORE 01. Nothing here is
// Electron-specific and nothing here changed in the move: this is the same
// orchestration, in a file that a native host could reuse without importing a
// browser.
//
// WHAT THIS OWNS
//   joining the member's canonical thread, at launch and at sign-in
//   staying joined as the canonical conversation moves elsewhere
//   the member guard that decides whose thread may appear in this window
//
// WHAT IT DOES NOT OWN
//   the transport that carries the announcement outward (injected as `publish`)
//   the policy deciding whether an observation warrants adoption (thread-watch)
//   the network calls themselves (the conversation client)
//
// ⛔ THE DIRECTION OF AUTHORITY IS FIXED AND MUST NOT INVERT:
//   member identity → canonical conversation → Desktop observes → reconciles
// Desktop never pushes a thread state outward and holds none of its own. A
// disconnected Desktop defers; it does not author. That is why every failure
// path below is quiet-and-retry rather than a local decision about what the
// conversation now is — a host that cannot reach canonical MAIA has lost its
// ability to KNOW, not gained the authority to DECIDE.

'use strict';

const { createThreadWatch } = require('./thread-watch');

const THREAD_POLL_MS = 15000;

/**
 * @param conversation  () => conversation client | null   (re-created at sign-in)
 * @param session       () => member session | null        (created once at start)
 * @param publish       (payload) => void   one thread announcement to the surface
 * @param turnInFlight  () => boolean       a turn in progress defers adoption
 */
function createContinuity({
  conversation,
  session,
  publish,
  turnInFlight = () => false,
  threadWatch = createThreadWatch(),
  pollMs = THREAD_POLL_MS,
  timers = { setInterval, clearInterval },
} = {}) {
  let poll = null;

  /**
   * Who is signed in right now.
   *
   * ⭐ `username`, not `name`. The session's `member.name` is a DISPLAY name —
   * two members can share one, and a display name is not an identity to gate
   * adoption on. `username` is what the member authenticated as and is unique by
   * the members contract.
   *
   * Returns null when nobody is signed in, which makes every observation
   * `member_mismatch` and therefore inert. Failing closed is the right default
   * for a guard whose job is to prevent one person's conversation appearing in
   * another person's window.
   */
  function currentMemberId() {
    const st = session && session();
    const state = st && st.state();
    if (!state || !state.signedIn || !state.member) return null;
    return state.member.username || null;
  }

  // ── D04 — join the member's thread, do not open a new one ─────────────────
  //
  // Called after sign-in and at startup for a restored session. The adoption is
  // a read against the server's own record of the member's conversations, so
  // Desktop lands in whatever thread they were last in — on iPhone, on web, or
  // here. `desktop-<timestamp>` survives only as the id for a member who has no
  // history anywhere, where it is the FIRST conversation rather than a second.
  async function join() {
    const conv = conversation && conversation();
    if (!conv) return;
    const out = await conv.adoptMemberThread();
    if (!out.ok) {
      // ⛔ A failed lookup must never silently fork the conversation. Say so.
      publish({ resumed: false, error: out.error });
      return;
    }
    const h = out.resumed ? await conv.history() : { turns: [] };
    publish({
      resumed: out.resumed,
      conversationId: out.sessionId,
      turns: h.turns,
    });

    // ⭐ MAIA-D04A. Adoption is no longer a one-time act at sign-in. From here
    // the window keeps watching, so a conversation continued on another surface
    // is joined without a relaunch.
    threadWatch.start(currentMemberId(), out.sessionId);
    startPolling();
  }

  // ── MAIA-D04A — live re-adoption ──────────────────────────────────────────
  //
  // D04 made Desktop join the member's thread at launch. This makes it STAY
  // joined: an open window notices that the canonical conversation moved and
  // conforms to it.
  async function pollOnce() {
    const conv = conversation && conversation();
    if (!conv || !threadWatch.isWatching) return;

    const peek = await conv.canonicalThreadId();
    // ⛔ A failed read is NOT an instruction to abandon the thread we hold. The
    // network being down must never fork the member's conversation, so a failure
    // is silent here and simply retried on the next tick.
    if (!peek.ok) return;

    const decision = threadWatch.observe({
      memberId: currentMemberId(),
      canonicalId: peek.sessionId,
      turnInFlight: turnInFlight(),
    });

    if (decision.action !== 'adopt') return;   // ignore and defer are both quiet

    // Re-adopt through the SAME path used at sign-in. There is one adoption
    // implementation and this is it — a second one would be free to drift.
    const out = await conv.adoptMemberThread();
    if (!out.ok) return;                        // watch keeps the old id; retries

    const h = await conv.history();
    threadWatch.noteAdopted(out.sessionId);
    publish({
      resumed: true,
      conversationId: out.sessionId,
      turns: h.turns,
      // Lets the surface say something true about WHY the thread changed under
      // them, rather than silently redrawing.
      rejoined: true,
      from: decision.from || null,
    });
  }

  function startPolling() {
    stopPolling();
    poll = timers.setInterval(() => { void pollOnce(); }, pollMs);
    if (poll && poll.unref) poll.unref();
  }

  function stopPolling() {
    if (poll) { timers.clearInterval(poll); poll = null; }
  }

  // ⛔ The watch dies with the session. Nothing may adopt on behalf of someone
  // who is no longer signed in.
  function stop() {
    threadWatch.stop();
    stopPolling();
  }

  return {
    join,
    pollOnce,
    stop,
    currentMemberId,
    get isWatching() { return threadWatch.isWatching; },
    get isPolling() { return poll !== null; },
  };
}

module.exports = { createContinuity, THREAD_POLL_MS };
