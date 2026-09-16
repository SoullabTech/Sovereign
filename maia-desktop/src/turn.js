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
//   2. an empty take() TELLS THE AUTHORITY rather than returning silently
//      A cough is not a turn — but by the time we are here the authority has
//      already opened one, because the VAD boundary was accepted upstream.
//      Returning quietly would leave it in `finalizing` with nothing coming and
//      the member disarmed for good. The obligation the old `busy` flag carried
//      here — never strand continuity behind a throat-clear — is now the
//      authority's, and it is discharged by saying so, not by skipping a flag.
//
//   3. every exit reaches the authority, including a throw
//      What a leaked `busy` flag used to do — freeze every later turn and
//      permanently defer adoption — an unreleased authority turn would do
//      exactly the same way. So there is no path out of `run` or `say` that
//      does not dispatch a terminal event: FINAL→ANSWER, EMPTY, FAILED, or
//      CANCEL on revocation. This is cross-unit, not local hygiene.
//
// ── DESKTOP-CONVERSATION-WIRING-01 — THIS MODULE NO LONGER DECIDES ──────────
//
// It owned `busy`: one boolean that meant "a turn is happening", read by
// continuity, shared by the spoken and typed paths. That was a second turn
// state machine sitting beside the authority's, and RESET-01 §1 names exactly
// that shape as the defect generator — a projection free to disagree with its
// source.
//
// `busy` is gone. Every question this module used to answer for itself now goes
// to `DesktopConversation`:
//
//   may this turn start?        the authority accepts or refuses the opening
//                               event (VAD_UTTERANCE_BOUNDARY / SEND_TEXT)
//   is a turn in flight?        authority.snapshot().turn.state !== 'idle'
//   is this result still ours?  the authority refuses a stale generation/turn
//
// ⛔ AND A REFUSAL IS OBEYED, NOT WORKED AROUND. If the authority refuses a
// final, this module does NOT announce it and does NOT ask MAIA. That is the
// whole point: an organ reports what happened; it does not decide what it meant.
//
// ⭐ The turn now carries `generation` and `turnId` on every dispatch, captured
// BEFORE the first await. A reply that comes back after the member cancelled,
// stopped, or started a new session is refused by the authority rather than
// delivered into whatever conversation is here now.
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
  SKIPPED: 'skipped',      // no session, no conversation, a cough, or the authority refused
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
 * @param authority    the DesktopConversation. `dispatch` returns
 *   `{accepted, refusal, snapshot}`; nothing here interprets state itself.
 */
function createTurn({
  conversation,
  voice,
  announce,
  speak,
  authority,
  authorized = () => true,
  diagnostic = () => {},
  now = () => Date.now(),
} = {}) {
  if (!authority || typeof authority.dispatch !== 'function') {
    throw new Error('turn requires the DesktopConversation authority');
  }

  /**
   * End the turn wherever it actually is.
   *
   * ⛔ FOUND BY dsc02, AND IT WAS A REAL DEFECT. The catch-all used to dispatch
   * `TRANSCRIPTION_FAILED` for every throw. But a throw from `ask`, or from
   * `epoch.final` after the member stopped capture, happens when the authority
   * has ALREADY left `finalizing` — so the event was refused, the turn stayed in
   * `waiting_for_maia`, and the member was left permanently disarmed by an error
   * that had been surfaced to them in words. A terminal event that is refused is
   * not a terminal event.
   *
   * So the terminal is chosen from where the authority IS, not from where the
   * code happens to be.
   */
  function failTurn(reason, tkt) {
    const at = authority.snapshot().turn.state;
    if (at === 'finalizing') authority.dispatch({ type: 'TRANSCRIPTION_FAILED', reason, ...tkt });
    else if (at === 'waiting_for_maia') authority.dispatch({ type: 'MAIA_FAILED', reason, ...tkt });
    else if (at !== 'idle') authority.dispatch({ type: 'CANCEL', ...tkt });
  }

  /** The turn the authority currently holds open, for stale-event refusal. */
  function ticket() {
    const s = authority.snapshot();
    return { generation: s.generation, turnId: s.turn.id };
  }

  /**
   * The session that authorised this turn is gone. Cancel it.
   *
   * `idle` rather than nothing: the surface has already been told `transcribing`
   * or `thinking`, and leaving it there forever would be its own dishonesty —
   * the silent-success class this codebase refuses. `idle` is neither an answer
   * nor an error; it is the truthful end of a turn in which nothing was said.
   */
  function revoke(at, tkt) {
    diagnostic('session_revoked', { at });
    // ⛔ The authority is released too. A revoked turn that left it in
    // `waiting_for_maia` would keep the member disarmed for a conversation
    // whose authorising session is gone.
    if (tkt) authority.dispatch({ type: 'CANCEL', ...tkt });
    announce({ phase: 'idle' });
    return TURN_OUTCOME.REVOKED;
  }

  /**
   * The half a spoken turn and a typed turn share, so they cannot drift apart.
   *
   * ⭐ DESKTOP-TEXT-01, reconciled. A typed turn still gets her voice: the
   * modality is how the MEMBER spoke, not how MAIA answers.
   */
  async function answer(said, tkt) {
    announce({ phase: 'heard', member: said });
    announce({ phase: 'thinking' });

    const a = await conversation().ask(said);
    if (!authorized()) return revoke('ask');

    if (!a.ok) {
      // ⛔ Told to the authority BEFORE the member. A failure the authority
      // never heard would leave it waiting for MAIA forever, and the member
      // disarmed with no event left that could re-arm them.
      authority.dispatch({ type: 'MAIA_FAILED', reason: a.error, ...tkt });
      announce({ phase: 'error', error: a.error });
      return TURN_OUTCOME.FAILED;
    }

    // ⛔ THE AUTHORITY DECIDES WHETHER THIS ANSWER IS STILL OURS. A reply for a
    // cancelled turn, or for a session the member has since restarted, is
    // refused here and never reaches the surface — the conversation on screen
    // stays the one the member is actually in.
    const out = authority.dispatch({
      type: 'MAIA_ANSWER', text: a.text, hasAudio: Boolean(a.audio), ...tkt,
    });
    if (!out.accepted) {
      diagnostic('turn_answer_refused', { reason: out.refusal && out.refusal.reason });
      return TURN_OUTCOME.SKIPPED;
    }

    // Words before voice, always. The surface must never speak an answer it
    // has not yet shown — that is how text and voice diverge.
    announce({ phase: 'answered', maia: a.text });
    // ⭐ RESET-01 §6. With audio, the turn is NOT over: the authority sits in
    // `maia_speaking` with speech-turn creation disarmed until playback reports
    // `ended`. Without audio it already returned to idle, and the member may
    // speak again this instant.
    if (a.audio) speak(a.audio);
    else announce({ phase: 'no-voice' });
    return TURN_OUTCOME.COMPLETED;
  }

  /**
   * A typed turn. Same turn, same thread, same revocation rule.
   *
   * ⛔ It shares the AUTHORITY'S turn axis with the spoken path deliberately: a
   * typed message must not interleave with a spoken one and leave two
   * half-turns in the thread. One axis, so there is nothing to keep in sync.
   *
   * ⛔ It does NOT carry its own answer to "what if authority disappears" — the
   * implementation this replaces had one, and TURN-REVOCATION-01 owns that
   * disposition now for both modalities.
   */
  async function say(text) {
    const said = typeof text === 'string' ? text.trim() : '';
    if (!said || !conversation()) return TURN_OUTCOME.SKIPPED;

    // ⭐ RESET-01 §7. One composer, two forms of expression. The typed turn asks
    // the SAME authority for the SAME opening, so "one turn at a time" is no
    // longer a boolean this module holds — it is the authority refusing to open
    // a second turn, which is also what disarms speech while the text turn runs.
    const opened = authority.dispatch({ type: 'SEND_TEXT', text: said });
    if (!opened.accepted) {
      diagnostic('turn_text_refused', { reason: opened.refusal && opened.refusal.reason });
      return TURN_OUTCOME.SKIPPED;
    }
    const tkt = ticket();
    try {
      return await answer(said, tkt);
    } catch (e) {
      if (!authorized()) return revoke('threw', tkt);
      failTurn('threw', tkt);
      announce({ phase: 'error', error: (e && e.message) || 'turn failed' });
      return TURN_OUTCOME.FAILED;
    }
  }

  /**
   * The spoken path.
   *
   * ⛔ THE CALLER HAS ALREADY ASKED THE AUTHORITY. `voice-lifecycle` dispatches
   * VAD_UTTERANCE_BOUNDARY and calls this ONLY if the authority accepted it, so
   * by the time we are here the turn is legitimately `finalizing`. That is what
   * makes MAIA's own voice arriving back through the microphone incapable of
   * starting a turn: the boundary is refused upstream and this never runs.
   */
  async function run() {
    if (!voice() || !conversation()) return TURN_OUTCOME.SKIPPED;

    // ⛔ THE AUTHORITY OPENED THIS TURN OR THERE IS NO TURN. `voice-lifecycle`
    // only calls here when it accepted a VAD boundary, so `finalizing` is the
    // one state this may run in. Anything else is a caller that did not ask —
    // and running anyway is how a second turn used to start under the first.
    // This replaces the `busy` flag: same protection, one authority.
    const opened = authority.snapshot().turn.state;
    if (opened !== 'finalizing') {
      diagnostic('turn_run_refused', { turnState: opened });
      return TURN_OUTCOME.SKIPPED;
    }

    const taken = voice().utterance.take();
    if (!taken) {
      // A cough that got as far as a boundary. The authority is sitting in
      // `finalizing` with nothing coming, so it is told — never left there.
      authority.dispatch({ type: 'TRANSCRIPTION_EMPTY', ...ticket() });
      return TURN_OUTCOME.SKIPPED;
    }
    const tkt = ticket();
    try {
      announce({ phase: 'transcribing' });

      const t = await conversation().transcribe(taken.samples, voice().sampleRate);
      // ⛔ Asked BEFORE anything is re-resolved: after this await the references
      // may be gone precisely because the member signed out.
      if (!authorized()) return revoke('transcribe', tkt);
      if (!t.ok) {
        authority.dispatch({ type: 'TRANSCRIPTION_FAILED', reason: t.error, ...tkt });
        announce({ phase: 'error', error: t.error });
        return TURN_OUTCOME.FAILED;
      }

      const said = (t.text || '').trim();
      if (!said) {
        authority.dispatch({ type: 'TRANSCRIPTION_EMPTY', ...tkt });
        announce({ phase: 'idle' });
        return TURN_OUTCOME.IDLE;
      }

      // ⛔ THE AUTHORITY COMMITS THE MEMBER TURN, and it may refuse: the member
      // may have cancelled, stopped, or restarted while Whisper was working. A
      // refused final is not announced and MAIA is not asked — otherwise a
      // transcript from a conversation that ended lands in the one that
      // replaced it.
      const committed = authority.dispatch({ type: 'TRANSCRIPTION_FINAL', text: said, ...tkt });
      if (!committed.accepted) {
        diagnostic('turn_final_refused', {
          reason: committed.refusal && committed.refusal.reason,
        });
        return TURN_OUTCOME.SKIPPED;
      }

      // The transcript is a FINAL for the epoch — the tail invariant now has real
      // material to protect, which on the first walk it never did.
      voice().epoch.final(said, `utt-${now()}`);

      return await answer(said, tkt);
    } catch (e) {
      // A throw that happened BECAUSE the session went away is revocation, not
      // failure — the references vanished mid-flight for an authorised reason.
      if (!authorized()) return revoke('threw', tkt);
      failTurn('threw', tkt);
      announce({ phase: 'error', error: (e && e.message) || 'turn failed' });
      return TURN_OUTCOME.FAILED;
    }
  }

  return {
    run,
    say,
    /**
     * Read by continuity: a turn in flight defers thread adoption.
     *
     * ⭐ A PROJECTION NOW, not a held boolean. It reports what the authority
     * says rather than what this module remembers, so the two cannot disagree.
     */
    get isBusy() { return authority.snapshot().turn.state !== 'idle'; },
  };
}

module.exports = { createTurn, TURN_OUTCOME };
