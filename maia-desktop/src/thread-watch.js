// MAIA Desktop — live thread re-adoption.
//
// MAIA-D04A. An already-open Desktop must notice that the member's canonical
// active conversation has changed, and join it, without being relaunched.
//
// ── THE PROBLEM ─────────────────────────────────────────────────────────────
//
// D04 proved launch-time adoption: Desktop opens on the member's existing
// conversation instead of minting a private one. But it adopted ONCE, at
// sign-in. An open window then drifted — the member could speak on their phone
// for an hour and the Desktop beside them would still be showing, and appending
// to, the thread it found at launch.
//
// That is continuity as a SNAPSHOT. The Companion's claim is continuity as a
// FIELD: one MAIA realm across surfaces, joined and stayed in.
//
// ── DIRECTION OF AUTHORITY ──────────────────────────────────────────────────
//
//   member identity → canonical active conversation → Desktop OBSERVES
//                                                   → Desktop RECONCILES
//
// ⛔ NOT: Desktop invents sync state and pushes it outward. Desktop holds no
// authoritative thread state of its own and never will. It reads what the
// server says is canonical and conforms. A Desktop that could push its idea of
// "the current conversation" outward would be a parallel realm wearing MAIA's
// name, which is the one thing this programme exists to prevent.
//
// ⛔ This module performs NO I/O and holds NO timer. It is a decision function
// over observations, so every rule below is testable without a network, a
// clock, or a second device — the same reason capture liveness lives outside
// the renderer.
'use strict';

/**
 * @typedef {Object} Observation
 * @property {string|null} memberId      Who is signed in RIGHT NOW.
 * @property {string|null} canonicalId   The server's current thread for them.
 * @property {boolean} turnInFlight      A turn is mid-flight in this window.
 * @property {boolean} [conversationActive] A Desktop conversation is live — the
 *   microphone is open or a turn is underway. Pinned per RESET-01 §5.
 */

function createThreadWatch() {
  let watching = false;
  let watchedMember = null;
  let adoptedId = null;

  return {
    /**
     * Begin watching on behalf of one member, from a known adopted thread.
     * The member id is captured here and every later observation is checked
     * against it.
     */
    start(memberId, currentThreadId) {
      watching = true;
      watchedMember = memberId || null;
      adoptedId = currentThreadId || null;
      return { action: 'watching', memberId: watchedMember, adoptedId };
    },

    /** Sign-out, or the window closing. Nothing is watched and nothing adopts. */
    stop() {
      watching = false;
      watchedMember = null;
      adoptedId = null;
      return { action: 'stopped' };
    },

    /**
     * Decide what an observation means. Returns exactly one of:
     *   adopt  — join `canonicalId`; the caller performs the adoption
     *   defer  — a change exists but this is not the moment
     *   ignore — nothing to do
     *
     * The order of these guards is the acceptance list, and it is deliberate.
     */
    observe(obs) {
      const o = obs || {};

      if (!watching) return { action: 'ignore', reason: 'not_watching' };

      // ⛔ CROSS-MEMBER ADOPTION IS IMPOSSIBLE HERE, BY CONSTRUCTION.
      // If the signed-in member is not the one this watch was started for — a
      // sign-out and sign-in as someone else, a session swapped underneath us —
      // no adoption may occur. A thread belongs to a person, and joining one
      // person's conversation into another's window is the worst failure this
      // feature could have. It is checked BEFORE anything else is considered.
      if (!o.memberId || o.memberId !== watchedMember) {
        return { action: 'ignore', reason: 'member_mismatch' };
      }

      // The server has no canonical thread to offer. Keeping what we have is
      // correct: absence of an answer is not an instruction to abandon.
      if (!o.canonicalId) return { action: 'ignore', reason: 'no_canonical' };

      // ⛔ NO CHURN. The overwhelmingly common observation is "nothing moved".
      // Re-adopting an id we already hold would re-broadcast the thread, redraw
      // the surface and re-log an event every poll — a feature that is quiet
      // only when nothing happens is the only kind worth running on a timer.
      if (o.canonicalId === adoptedId) return { action: 'ignore', reason: 'unchanged' };

      // ⛔ AN IN-FLIGHT TURN IS NEVER DISCARDED. The member has spoken and is
      // waiting for an answer. Swapping the thread underneath that would throw
      // away what they just said to make the bookkeeping tidy. The change is
      // real and will still be there on the next observation; it waits.
      if (o.turnInFlight) return { action: 'defer', reason: 'turn_in_flight', canonicalId: o.canonicalId };

      // ⭐ DESKTOP-CONVERSATION-WIRING-01, per RESET-01 §5. Detection keeps its
      // eyes; it loses its hands while somebody is standing in the room.
      // `turnInFlight` alone was never enough: between two spoken turns, with
      // the microphone still open and the member mid-conversation, no turn is in
      // flight — and the thread would have been swapped underneath them in that
      // gap. Cross-device continuity is a persistence property, not permission
      // to replace the room. Reconciliation resumes when the conversation ends.
      //
      // ⛔ A DISTINCT REASON, not a widened `turn_in_flight`. The two defer for
      // different truths and a witness needs to read which one happened.
      if (o.conversationActive) {
        return { action: 'defer', reason: 'conversation_active', canonicalId: o.canonicalId };
      }

      return { action: 'adopt', reason: 'canonical_changed', from: adoptedId, canonicalId: o.canonicalId };
    },

    /**
     * Record that an adoption actually completed.
     * ⭐ Called by the caller AFTER the adoption succeeds, never before — if the
     * adoption fails, the watch still holds the old id and will try again on the
     * next observation rather than believing a change it never made.
     */
    noteAdopted(threadId) {
      if (!watching) return { action: 'ignore', reason: 'not_watching' };
      adoptedId = threadId || adoptedId;
      return { action: 'adopted', adoptedId };
    },

    get isWatching() { return watching; },
    get memberId() { return watchedMember; },
    get adoptedId() { return adoptedId; },
  };
}

module.exports = { createThreadWatch };
