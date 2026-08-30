// MAIA Desktop — the one conversational authority.
//
// MAIA-DESKTOP-CONVERSATION-RESET-01 §1, ruled 2026-08-30 (commit 905fe3408,
// docs/architecture/MAIA_DESKTOP_CONVERSATION_RESET_01.md). That ruling names
// the defect this module exists to end:
//
//   > Five independent state-holders — main, conversation, turn,
//   > voice-lifecycle, and the renderer — each interpreting the others' state.
//   > There is no single object that knows what Desktop is doing
//   > conversationally.
//
// This is that object. It is the ONLY place Desktop decides what a conversation
// means. Every other module becomes an organ: it reports what happened and it
// obeys the snapshot. Nothing else keeps a conversational belief of its own.
//
// ── PURE BY CONSTRUCTION ────────────────────────────────────────────────────
//
// ⛔ No Electron. No DOM. No microphone. No fetch. No timers. No audio APIs. No
// filesystem. No clock — not even Date.now(), because a state machine that
// reads the wall clock cannot be replayed and therefore cannot be witnessed.
//
// This is not stylistic. The reset's acceptance witness is behavioural and
// requires a real transcriber that does not currently exist on the founder Mac
// (RESET-01, "Blocker, stated plainly"). The ruling separates the two: the
// grammar can be built and unit-witnessed against nothing at all, and it is
// exactly this purity that makes that possible. Ten conversational turns are
// proven here without a device; nothing here is called green because of it.
//
// ── THE SHAPE ───────────────────────────────────────────────────────────────
//
//   gestures + organ events  →  dispatch()  →  { accepted, refusal, snapshot }
//
// Gestures in, immutable snapshots out. An invalid transition is REFUSED — it
// is never applied, never thrown, and never silent: every refusal is counted
// and the last one is carried in the snapshot. A machine that discards an
// impossible event without saying so is how a surface comes to disagree with
// its source, which is the defect generator RESET-01 §1 deletes.
//
// ── TWO AXES, AND WHY ───────────────────────────────────────────────────────
//
// RESET-01 §2: "The microphone being open is not the same thing as the member
// having a turn." Most of the observed Desktop failures are that conflation.
//
//   CAPTURE   closed · opening · open · recovering · failed
//   TURN      idle · hearing · finalizing · waiting_for_maia · maia_speaking
//
// ⛔ NO VAD EVENT MAY TOUCH THE CAPTURE AXIS. VAD ends an utterance; it does
// not end listening. Pressed once, capture stays `open` across every turn of
// the session — that is RESET-01 §3, and it is what "speak again without
// touching anything" actually means.
//
// ⛔ PLAYBACK COMPLETION RETURNS THE TURN TO IDLE AND LEAVES CAPTURE OPEN
// (§6). Not: stop capture → play → open a new capture → hope the lifecycles
// line up.

'use strict';

const CAPTURE_STATES = Object.freeze(['closed', 'opening', 'open', 'recovering', 'failed']);
const TURN_STATES = Object.freeze(['idle', 'hearing', 'finalizing', 'waiting_for_maia', 'maia_speaking']);

// The turn states in which the member's own input creates turns. While the turn
// is anywhere else, speech-turn creation is DISARMED — which is how §6's
// controlled half-duplex and §7's "text momentarily disarms speech" are the
// same mechanism rather than two flags that can disagree.
const INPUT_ARMED_TURN_STATE = 'idle';

// Turn states whose material is coming from the microphone. A capture loss ends
// these, because no final is coming for them. It does NOT end a turn already in
// flight to MAIA — the words are gone from the mic's hands by then.
const MIC_SOURCED_TURN_STATES = Object.freeze(['hearing', 'finalizing']);

function frozenTurn(role, text, turnId) {
  return Object.freeze({ role, text, turnId });
}

/**
 * @param {object} [init]
 * @param {string|null} [init.threadId] The thread adopted at launch, if known.
 */
function createDesktopConversation(init = {}) {
  // ── the one authoritative state object ────────────────────────────────────
  //
  // Everything Desktop believes about the conversation is in here. There is no
  // second copy anywhere, and `snapshot()` is the only way out.
  const state = {
    // ⭐ GENERATION. A conversation session's identity. It increments when the
    // conversation is (re)opened — START_VOICE, or a thread rebind — because
    // after either, work still in flight was addressed to a conversation that
    // no longer exists. An event carrying a stale generation is refused rather
    // than applied to whoever is here now.
    generation: 1,
    threadId: typeof init.threadId === 'string' && init.threadId ? init.threadId : null,
    threadDrift: null,          // detection only; never a rebind (§5)

    captureState: 'closed',
    captureCause: null,

    turnState: 'idle',
    turnId: 0,
    turnSource: null,           // 'speech' | 'text'
    turnSeq: 0,

    // ⭐ The ephemeral speech draft (§4). It is NOT history and never becomes
    // history: the committed member turn is built from the FINAL transcript,
    // never from the draft. A draft that could be committed is a partial that
    // can outlive its utterance, and that is how a late partial leaks into the
    // next turn.
    draft: null,

    history: [],
    lastTurnEnd: null,
    refusals: 0,
    lastRefusal: null,
  };

  let cachedSnapshot = null;

  function snapshot() {
    if (cachedSnapshot) return cachedSnapshot;
    cachedSnapshot = Object.freeze({
      generation: state.generation,
      threadId: state.threadId,
      // Pinned exactly while the conversation is live. At rest it is free to be
      // reconciled; while somebody is standing in the room it is not (§5).
      threadPinned: isActive(),
      threadDrift: state.threadDrift ? Object.freeze({ ...state.threadDrift }) : null,
      capture: Object.freeze({ state: state.captureState, cause: state.captureCause }),
      turn: Object.freeze({ state: state.turnState, id: state.turnId, source: state.turnSource }),
      // Armed means: a member gesture or an utterance may open a new turn.
      inputArmed: state.turnState === INPUT_ARMED_TURN_STATE,
      draft: state.draft,
      history: Object.freeze(state.history.slice()),
      lastTurnEnd: state.lastTurnEnd ? Object.freeze({ ...state.lastTurnEnd }) : null,
      refusals: state.refusals,
      lastRefusal: state.lastRefusal ? Object.freeze({ ...state.lastRefusal }) : null,
    });
    return cachedSnapshot;
  }

  function touched() { cachedSnapshot = null; }

  /** Live = the member is in this conversation right now, on either axis. */
  function isActive() {
    return state.captureState !== 'closed' || state.turnState !== 'idle';
  }

  function refuse(type, reason, detail) {
    state.refusals += 1;
    state.lastRefusal = { event: type, reason, ...(detail ? { detail } : {}) };
    touched();
    return { accepted: false, refusal: snapshot().lastRefusal, snapshot: snapshot() };
  }

  function accept() {
    touched();
    return { accepted: true, refusal: null, snapshot: snapshot() };
  }

  function commit(role, text, turnId) {
    state.history = state.history.concat([frozenTurn(role, text, turnId)]);
  }

  /**
   * End the current turn, always through here.
   *
   * ⛔ ONE EXIT. The draft dies with the turn and dies only here, so there is no
   * path on which a partial survives its own utterance into the next one. The
   * reason is recorded rather than dropped: a turn that ends for a reason
   * nobody can name is the failure this programme keeps re-finding.
   */
  function endTurn(reason, extra) {
    const draftChars = state.draft ? state.draft.length : 0;
    state.lastTurnEnd = {
      reason,
      turnId: state.turnId,
      source: state.turnSource,
      draftChars,
      ...(extra || {}),
    };
    state.turnState = 'idle';
    state.turnSource = null;
    state.draft = null;
    // ⛔ AND THE TURN STOPS BEING ADDRESSABLE. Leaving `turnId` set meant a
    // transcript arriving for a cancelled turn still MATCHED the current turn
    // id, so it was judged by the state machine — refused for the state it
    // happened to land in — rather than refused as the stale thing it is. At
    // idle there is no turn to address, and `lastTurnEnd` keeps the id.
    state.turnId = 0;
  }

  function openTurn(source) {
    state.turnSeq += 1;
    state.turnId = state.turnSeq;
    state.turnSource = source;
    state.draft = null;
  }

  /**
   * Staleness, in one place.
   *
   * An event may name the `generation` and/or the `turnId` it belongs to. If it
   * names one and is wrong, it belongs to a conversation or a turn that is over
   * and it may not mutate this one. If it names neither, it is a live organ
   * report and is judged on the state machine alone.
   */
  function staleness(e) {
    if (e.generation != null && e.generation !== state.generation) return 'stale_generation';
    if (e.turnId != null && e.turnId !== state.turnId) return 'stale_turn';
    return null;
  }

  function text(e) {
    return typeof e.text === 'string' ? e.text.trim() : '';
  }

  // ── the grammar ───────────────────────────────────────────────────────────

  const handlers = {

    // ── member gestures ─────────────────────────────────────────────────────

    /** §3. Pressed ONCE. Everything after this is the conversation running. */
    START_VOICE() {
      if (state.captureState !== 'closed' && state.captureState !== 'failed') {
        return refuse('START_VOICE', 'capture_already_open', state.captureState);
      }
      // ⛔ A NEW GENERATION INHERITS NO TURN. A reply still in flight when the
      // member stopped belongs to the conversation that just ended; carrying it
      // across would open the new session already mid-turn, with the member
      // disarmed and no event coming that could ever re-arm them.
      if (state.turnState !== 'idle') endTurn('generation_changed');
      state.generation += 1;
      state.captureState = 'opening';
      state.captureCause = null;
      state.threadDrift = null;
      return accept();
    },

    /**
     * ⛔ STOP_VOICE TOUCHES THE CAPTURE AXIS ONLY.
     *
     * "Stop listening" is not "stop MAIA". A turn already in flight to MAIA, or
     * a reply already being spoken, is not the microphone's to cancel — it runs
     * to its own end. Only a turn whose material was still coming from the mic
     * ends here, and it ends named.
     */
    STOP_VOICE() {
      if (state.captureState === 'closed') return refuse('STOP_VOICE', 'capture_not_open');
      state.captureState = 'closed';
      state.captureCause = null;
      if (MIC_SOURCED_TURN_STATES.includes(state.turnState)) endTurn('capture_closed');
      return accept();
    },

    /** §7. One composer. A text turn is a turn — the same grammar, no mode. */
    SEND_TEXT(e) {
      const body = text(e);
      if (!body) return refuse('SEND_TEXT', 'empty_text');
      if (state.turnState !== INPUT_ARMED_TURN_STATE) {
        return refuse('SEND_TEXT', 'turn_busy', state.turnState);
      }
      openTurn('text');
      commit('member', body, state.turnId);
      state.turnState = 'waiting_for_maia';
      return accept();
    },

    CANCEL() {
      if (state.turnState === 'idle') return refuse('CANCEL', 'no_turn_to_cancel');
      endTurn('cancelled');
      return accept();
    },

    // ── capture organ ───────────────────────────────────────────────────────

    CAPTURE_OPENED() {
      if (state.captureState !== 'opening' && state.captureState !== 'recovering') {
        return refuse('CAPTURE_OPENED', 'capture_not_opening', state.captureState);
      }
      state.captureState = 'open';
      state.captureCause = null;
      return accept();
    },

    /**
     * ⭐ THE AXES PROVE THEMSELVES HERE. A microphone dying while MAIA is
     * answering does not cancel MAIA — the member's words left the mic's hands
     * at the final. Only a turn still drawing on the mic ends.
     */
    CAPTURE_LOST(e) {
      if (state.captureState !== 'open') {
        return refuse('CAPTURE_LOST', 'capture_not_open', state.captureState);
      }
      state.captureState = 'recovering';
      state.captureCause = typeof e.cause === 'string' ? e.cause : 'unknown';
      if (MIC_SOURCED_TURN_STATES.includes(state.turnState)) endTurn('capture_lost');
      return accept();
    },

    CAPTURE_FAILED(e) {
      if (state.captureState !== 'opening' && state.captureState !== 'recovering') {
        return refuse('CAPTURE_FAILED', 'capture_not_opening', state.captureState);
      }
      state.captureState = 'failed';
      state.captureCause = typeof e.cause === 'string' ? e.cause : 'unknown';
      if (MIC_SOURCED_TURN_STATES.includes(state.turnState)) endTurn('capture_failed');
      return accept();
    },

    // ── speech organ ────────────────────────────────────────────────────────

    VAD_SPEECH_STARTED() {
      if (state.captureState !== 'open') {
        return refuse('VAD_SPEECH_STARTED', 'capture_not_open', state.captureState);
      }
      // §6/§7. While MAIA is speaking, or a turn is in flight, speech-turn
      // creation is disarmed — the capture graph stays alive and the acoustic
      // frames keep arriving, they simply do not author a turn.
      if (state.turnState !== INPUT_ARMED_TURN_STATE) {
        return refuse('VAD_SPEECH_STARTED', 'input_disarmed', state.turnState);
      }
      openTurn('speech');
      state.turnState = 'hearing';
      return accept();
    },

    /** §4. Ephemeral. Replaces; never appends; never becomes history. */
    SPEECH_DRAFT(e) {
      if (state.turnState !== 'hearing') {
        // ⛔ A draft arriving after the boundary is a LATE PARTIAL. It is
        // refused rather than shown, because the only thing it can do now is
        // overwrite a final or bleed into the next utterance.
        return refuse('SPEECH_DRAFT', 'no_open_utterance', state.turnState);
      }
      state.draft = typeof e.text === 'string' ? e.text : '';
      return accept();
    },

    /** ⛔ Ends the UTTERANCE. Never the capture. (§2) */
    VAD_UTTERANCE_BOUNDARY() {
      if (state.turnState !== 'hearing') {
        return refuse('VAD_UTTERANCE_BOUNDARY', 'no_open_utterance', state.turnState);
      }
      state.turnState = 'finalizing';
      return accept();
    },

    /**
     * The authoritative transcript. It supersedes the draft — it is never
     * merged with it, and the draft is discarded unread.
     */
    TRANSCRIPTION_FINAL(e) {
      if (state.turnState !== 'finalizing') {
        return refuse('TRANSCRIPTION_FINAL', 'no_turn_finalizing', state.turnState);
      }
      const body = text(e);
      if (!body) return refuse('TRANSCRIPTION_FINAL', 'empty_final');
      state.draft = null;
      commit('member', body, state.turnId);
      state.turnState = 'waiting_for_maia';
      return accept();
    },

    /** Not a failure: "no speech in this segment" is a legitimate answer. */
    TRANSCRIPTION_EMPTY() {
      if (state.turnState !== 'finalizing') {
        return refuse('TRANSCRIPTION_EMPTY', 'no_turn_finalizing', state.turnState);
      }
      endTurn('transcription_empty');
      return accept();
    },

    TRANSCRIPTION_FAILED(e) {
      if (state.turnState !== 'finalizing') {
        return refuse('TRANSCRIPTION_FAILED', 'no_turn_finalizing', state.turnState);
      }
      endTurn('transcription_failed', { cause: typeof e.reason === 'string' ? e.reason : 'unknown' });
      return accept();
    },

    // ── MAIA ────────────────────────────────────────────────────────────────

    MAIA_ANSWER(e) {
      if (state.turnState !== 'waiting_for_maia') {
        return refuse('MAIA_ANSWER', 'no_turn_waiting', state.turnState);
      }
      const body = text(e);
      if (!body) return refuse('MAIA_ANSWER', 'empty_answer');
      commit('maia', body, state.turnId);
      if (e.hasAudio === true) {
        state.turnState = 'maia_speaking';
        return accept();
      }
      // No voice on the server: the turn is complete in text and the member is
      // listening again immediately. Silence is not a state to sit in.
      endTurn('answered_without_voice');
      return accept();
    },

    MAIA_FAILED(e) {
      if (state.turnState !== 'waiting_for_maia') {
        return refuse('MAIA_FAILED', 'no_turn_waiting', state.turnState);
      }
      endTurn('maia_failed', { cause: typeof e.reason === 'string' ? e.reason : 'unknown' });
      return accept();
    },

    /** §6. The handoff. Capture is untouched; the member may speak again now. */
    PLAYBACK_ENDED() {
      if (state.turnState !== 'maia_speaking') {
        return refuse('PLAYBACK_ENDED', 'not_speaking', state.turnState);
      }
      endTurn('playback_ended');
      return accept();
    },

    PLAYBACK_FAILED(e) {
      if (state.turnState !== 'maia_speaking') {
        return refuse('PLAYBACK_FAILED', 'not_speaking', state.turnState);
      }
      // MAIA's words are already committed. A voice that could not play costs
      // the sound, never the turn.
      endTurn('playback_failed', { cause: typeof e.reason === 'string' ? e.reason : 'unknown' });
      return accept();
    },

    // ── thread (§5) ─────────────────────────────────────────────────────────

    /**
     * ⛔ THE ONLY REBIND, AND IT IS REFUSED WHILE THE CONVERSATION IS LIVE.
     * Cross-device continuity is a persistence property, not permission to
     * replace the room while somebody is standing in it.
     */
    THREAD_ADOPTED(e) {
      const id = typeof e.threadId === 'string' ? e.threadId.trim() : '';
      if (!id) return refuse('THREAD_ADOPTED', 'empty_thread_id');
      if (isActive()) return refuse('THREAD_ADOPTED', 'thread_pinned', state.turnState);
      if (id === state.threadId) return refuse('THREAD_ADOPTED', 'thread_unchanged');
      state.threadId = id;
      state.threadDrift = null;
      state.history = [];
      state.generation += 1;
      return accept();
    },

    /**
     * Detection only. `thread-watch` keeps its eyes and loses its hands: this
     * records that the canonical thread moved and rebinds nothing, ever.
     */
    THREAD_MOVED(e) {
      const id = typeof e.threadId === 'string' ? e.threadId.trim() : '';
      if (!id) return refuse('THREAD_MOVED', 'empty_thread_id');
      if (id === state.threadId) return refuse('THREAD_MOVED', 'thread_unchanged');
      state.threadDrift = { observedId: id, pinned: isActive() };
      return accept();
    },
  };

  /**
   * @param {{type: string, [k: string]: any}} event
   * @returns {{accepted: boolean, refusal: object|null, snapshot: object}}
   */
  function dispatch(event) {
    if (!event || typeof event.type !== 'string') return refuse('(malformed)', 'malformed_event');
    const handler = handlers[event.type];
    if (!handler) return refuse(event.type, 'unknown_event');
    const stale = staleness(event);
    if (stale) return refuse(event.type, stale);
    return handler(event);
  }

  return { dispatch, snapshot };
}

module.exports = {
  createDesktopConversation,
  CAPTURE_STATES,
  TURN_STATES,
};
