// MAIA Desktop — the turn. DESKTOP-CONVERSATION-01 / DSC-02.
//
// Extracted from main.js by DESKTOP SOVEREIGN CORE 02. Nothing here changed in
// the move. The acceptance for DESKTOP-CONVERSATION-01 is back-and-forth
// conversation, so this is the loop that matters, and none of it is Electron's:
// a native host announces phases through its own surface and hands audio to its
// own output device, while what a turn MEANS stays here.
//
// Every failure is surfaced to the member in words rather than swallowed — a
// companion that goes quiet after you speak is the failure mode this whole
// programme exists to avoid.
//
// ⛔ THREE ORDERINGS HERE ARE SEMANTIC, NOT INCIDENTAL. DSC-01 established the
// rule the hard way (see the invariant §7A): moving a caller moves its ordering
// obligations even when every module it calls stays correct.
//
//   1. transcription succeeds → epoch.final → announce 'heard'
//      The epoch records a FINAL only for a transcript canonical MAIA actually
//      returned. An empty or failed transcription must record nothing: the tail
//      invariant would then be protecting material the member never said, and
//      a local host would be asserting what no canonical action confirmed.
//
//   2. an empty take() returns WITHOUT entering the busy state
//      A cough is not a turn. Entering busy for one would defer a canonical
//      thread adoption in continuity, which reads this module's `isBusy` — so a
//      throat-clear elsewhere in the house would stall the member's continuity.
//
//   3. busy is released in `finally`, on every path including a throw
//      A leaked busy flag freezes every later turn AND permanently defers
//      adoption. The release is cross-unit, not local hygiene.
//
// ⛔ The runtime references are read through getters at exactly the points the
// original read them, INCLUDING after an await. That is deliberate: if the
// member stops capture or signs out mid-turn, the next read finds a dead
// session and the throw becomes a surfaced error. Capturing them once at entry
// would instead write quietly into a session that no longer exists.

'use strict';

/**
 * ⛔ REVOCATION IS NOT FAILURE. TURN-REVOCATION-01.
 *
 * A member signing out does not mean the turn went wrong. It means the session
 * that authorised the turn no longer exists, and an answer produced for it must
 * not be delivered. Two dispositions were in the tree and neither was right: a
 * bare `return` (silent, indistinguishable from success to any future caller)
 * and a generic `error` phase (an operational failure screamed at someone who
 * just signed out).
 *
 *   FAILURE      the model, the network or transcription genuinely failed
 *                → surfaced to the member as an error
 *   REVOCATION   the member session ceased to authorise this turn
 *                → the turn is CANCELLED: no MAIA answer is published, no error
 *                  reaches the member, the in-flight flag is released, and the
 *                  outcome is named internally as `revoked`
 *
 * Silent experientially, explicit internally. That second half is the point: a
 * bare return could be mistaken for completion by the next caller to read this.
 *
 * ⛔ WHY `authorized()` RATHER THAN A NULL CHECK. Revocation cannot be inferred
 * from which reference went null. Auth teardown releases capture BEFORE it drops
 * the conversation, so there is a window where `voice()` is gone and
 * `conversation()` is not — inferring from nulls would classify sign-out as a
 * failure for exactly that window. So the turn asks the authority question
 * directly. A capture that ends while the member remains signed in is NOT
 * revocation and keeps its existing disposition.
 */
const TURN_OUTCOME = Object.freeze({
  SKIPPED: 'skipped',      // no session, no conversation, busy, or a cough
  COMPLETED: 'completed',
  IDLE: 'idle',            // nothing was said
  FAILED: 'failed',
  REVOKED: 'revoked',      // the session that authorised this turn is gone
});

/**
 * @param conversation () => conversation client | null   (re-created at sign-in)
 * @param voice        () => voice session | null         (created per capture)
 * @param announce     (payload) => void   one turn-phase announcement
 * @param speak        (audio) => void     MAIA's voice to an output device
 */
function createTurn({
  conversation,
  voice,
  announce,
  speak,
  authorized = () => true,
  diagnostic = () => {},
  now = () => Date.now(),
} = {}) {
  let busy = false;

  /**
   * The session that authorised this turn is gone. Cancel it.
   *
   * `idle` rather than nothing: the surface has already been told `transcribing`
   * or `thinking`, and leaving it there forever would be its own dishonesty —
   * the silent-success class this codebase refuses. `idle` is neither an answer
   * nor an error; it is the truthful end of a turn in which nothing was said.
   */
  function revoke(at) {
    diagnostic('session_revoked', { at });
    announce({ phase: 'idle' });
    return TURN_OUTCOME.REVOKED;
  }

  /**
   * The half a spoken turn and a typed turn share, so they cannot drift apart.
   *
   * ⭐ DESKTOP-TEXT-01, reconciled. A typed turn still gets her voice: the
   * modality is how the MEMBER spoke, not how MAIA answers.
   */
  async function answer(said) {
    announce({ phase: 'heard', member: said });
    announce({ phase: 'thinking' });

    const a = await conversation().ask(said);
    if (!authorized()) return revoke('ask');
    if (!a.ok) { announce({ phase: 'error', error: a.error }); return TURN_OUTCOME.FAILED; }

    // Words before voice, always. The surface must never speak an answer it
    // has not yet shown — that is how text and voice diverge.
    announce({ phase: 'answered', maia: a.text });
    if (a.audio) speak(a.audio);
    else announce({ phase: 'no-voice' });
    return TURN_OUTCOME.COMPLETED;
  }

  /**
   * A typed turn. Same turn, same thread, same revocation rule.
   *
   * ⛔ It shares `busy` with the spoken path deliberately: a typed message must
   * not interleave with a spoken one and leave two half-turns in the thread.
   *
   * ⛔ It does NOT carry its own answer to "what if authority disappears" — the
   * implementation this replaces had one, and TURN-REVOCATION-01 owns that
   * disposition now for both modalities.
   */
  async function say(text) {
    const said = typeof text === 'string' ? text.trim() : '';
    if (!said || busy || !conversation()) return TURN_OUTCOME.SKIPPED;
    busy = true;
    try {
      return await answer(said);
    } catch (e) {
      if (!authorized()) return revoke('threw');
      announce({ phase: 'error', error: (e && e.message) || 'turn failed' });
      return TURN_OUTCOME.FAILED;
    } finally {
      busy = false;
    }
  }

  async function run() {
    if (!voice() || busy || !conversation()) return TURN_OUTCOME.SKIPPED;
    const taken = voice().utterance.take();
    if (!taken) return TURN_OUTCOME.SKIPPED;   // silence or a cough, not an utterance
    busy = true;
    try {
      announce({ phase: 'transcribing' });

      const t = await conversation().transcribe(taken.samples, voice().sampleRate);
      // ⛔ Asked BEFORE anything is re-resolved: after this await the references
      // may be gone precisely because the member signed out.
      if (!authorized()) return revoke('transcribe');
      if (!t.ok) { announce({ phase: 'error', error: t.error }); return TURN_OUTCOME.FAILED; }

      const said = (t.text || '').trim();
      if (!said) { announce({ phase: 'idle' }); return TURN_OUTCOME.IDLE; }

      // The transcript is a FINAL for the epoch — the tail invariant now has real
      // material to protect, which on the first walk it never did.
      voice().epoch.final(said, `utt-${now()}`);

      return await answer(said);
    } catch (e) {
      // A throw that happened BECAUSE the session went away is revocation, not
      // failure — the references vanished mid-flight for an authorised reason.
      if (!authorized()) return revoke('threw');
      announce({ phase: 'error', error: (e && e.message) || 'turn failed' });
      return TURN_OUTCOME.FAILED;
    } finally {
      busy = false;
    }
  }

  return {
    run,
    say,
    /** Read by continuity: a turn in flight defers thread adoption. */
    get isBusy() { return busy; },
  };
}

module.exports = { createTurn, TURN_OUTCOME };
