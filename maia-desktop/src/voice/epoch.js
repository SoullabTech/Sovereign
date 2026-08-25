// MAIA Desktop — capture/transcription epoch state, and the tail invariant.
//
// MAIA-D01. This is the load-bearing module of the native voice seam, and it is
// deliberately PURE: no Electron, no audio API, no timers, no clock, no I/O. All
// of that is injected. The consequence matters for this programme — the tail
// invariant can be proven exhaustively on Linux even though the microphone that
// feeds it can only be witnessed on macOS.
//
// ── THE INVARIANT ───────────────────────────────────────────────────────────
//
//   No capture/transcription epoch may end with nonempty human speech state
//   that is silently discarded. At an epoch boundary, unfinished material must
//   be preserved/salvaged, or explicitly surfaced as lost.
//
// It is enforced STRUCTURALLY rather than by discipline: `openPartial` is
// private, and exactly one function — `closeOpenPartial()` — can clear it. Every
// boundary path (final, restart, user stop, capture loss, transcription failure)
// routes through that one function, and it cannot return without emitting either
// `voice_transcript_salvaged` or `voice_tail_lost`. There is no path that clears
// the field quietly, because there is no other path that clears the field.
//
// ── WHY PAUSES ARE NOT BOUNDARIES ───────────────────────────────────────────
//
// This module never ends an epoch because of silence. That is the whole point of
// the programme's §XII working invariant: a human pause is not a finished
// thought. Silence is handled by the VAD as an utterance boundary — a place a
// final may be requested — never as a reason to tear down capture. Restarts here
// are caused by real events (transcription stream failure, device change, user
// action), and every one of them preserves accumulated finals.

'use strict';

const EPOCH_END_REASONS = Object.freeze({
  USER_STOP: 'user_stop',
  RESTART: 'restart',
  CAPTURE_LOST: 'capture_lost',
  TRANSCRIPTION_FAILED: 'transcription_failed',
  DEVICE_CHANGED: 'device_changed',
});

/**
 * @param {object} deps
 * @param {{emit: (e: string, m?: object) => void}} deps.diagnostics
 * @param {(text: string, info: object) => boolean} [deps.onSalvage]
 *        Sink for rescued material. Returning FALSE means the host could not
 *        take custody — the material is then reported lost rather than assumed
 *        saved. Default accepts.
 */
function createEpochState({ diagnostics, onSalvage } = {}) {
  if (!diagnostics || typeof diagnostics.emit !== 'function') {
    throw new Error('createEpochState requires a diagnostics emitter');
  }
  const salvageSink = typeof onSalvage === 'function' ? onSalvage : () => true;

  let epochId = 0;
  let open = false;
  let audioSeen = false;
  let speechSeen = false;
  let committed = false;

  // Uncommitted recognized material for the CURRENT epoch. Private on purpose.
  let openPartial = '';
  // Finals accepted this SESSION. Deliberately survives every epoch restart:
  // losing them on restart is the exact regression NC "restart loses
  // accumulated finals" exists to catch.
  const finals = [];
  // Dedupe keys for finals. A transcription backend that re-delivers a segment
  // (a retry, a reconnect replaying its buffer) must not double-count it.
  const seenFinalKeys = new Set();

  const salvaged = [];
  const lost = [];

  function assertOpen(what) {
    if (!open) throw new Error(`${what} outside an open epoch`);
  }

  /**
   * THE ONLY path that may clear `openPartial`.
   *
   * @param {string} reason
   * @param {boolean} allowSalvage false when the material provably cannot be
   *        carried forward (host refused custody, or the boundary destroys it).
   * @returns {{outcome: 'empty'|'salvaged'|'lost', chars: number}}
   */
  function closeOpenPartial(reason, allowSalvage = true) {
    const text = openPartial.trim();
    if (!text) { openPartial = ''; return { outcome: 'empty', chars: 0 }; }

    if (allowSalvage) {
      let accepted = false;
      try { accepted = salvageSink(text, { reason, epochId }) !== false; }
      catch { accepted = false; }
      if (accepted) {
        openPartial = '';
        salvaged.push({ chars: text.length, reason, epochId });
        diagnostics.emit('voice_transcript_salvaged', { cause: reason, chars: text.length, epochId });
        return { outcome: 'salvaged', chars: text.length };
      }
    }

    // Not salvageable. It is NOT dropped quietly — the loss is stated.
    openPartial = '';
    lost.push({ chars: text.length, reason, epochId });
    diagnostics.emit('voice_tail_lost', { cause: reason, chars: text.length, epochId });
    return { outcome: 'lost', chars: text.length };
  }

  const api = {
    micGranted(meta = {}) { diagnostics.emit('voice_mic_granted', { ...meta }); },

    /** Open a capture epoch. Also the restart path — epochId increments. */
    startEpoch() {
      if (open) throw new Error('epoch already open');
      epochId += 1;
      open = true;
      audioSeen = false;
      speechSeen = false;
      diagnostics.emit('voice_listening_started', { epochId });
      return epochId;
    },

    audioStarted() {
      assertOpen('audioStarted');
      if (audioSeen) return;
      audioSeen = true;
      diagnostics.emit('voice_audio_started', { epochId });
    },

    speechStarted() {
      assertOpen('speechStarted');
      if (speechSeen) return;
      speechSeen = true;
      diagnostics.emit('voice_speech_started', { epochId });
    },

    /** A partial/interim transcript. Replaces the open partial, never appends. */
    partial(text) {
      assertOpen('partial');
      openPartial = typeof text === 'string' ? text : '';
      diagnostics.emit('voice_result_interim', { chars: openPartial.trim().length, epochId });
    },

    /**
     * A final transcript. `key` identifies the segment for dedupe; when the
     * backend supplies no id, the caller should pass a stable one.
     * @returns {{accepted: boolean, duplicate: boolean}}
     */
    final(text, key) {
      assertOpen('final');
      const clean = typeof text === 'string' ? text.trim() : '';
      const id = key === undefined || key === null ? `auto:${finals.length}:${clean}` : String(key);

      if (seenFinalKeys.has(id)) {
        // The open partial still has to be closed — a duplicate final must not
        // become a hole through which pending material escapes unreported.
        closeOpenPartial('duplicate_final');
        diagnostics.emit('voice_result_final', { chars: clean.length, epochId, duplicate: true });
        return { accepted: false, duplicate: true };
      }

      // The partial is superseded by this final, not lost — no salvage event,
      // because the material is being COMMITTED, which is the stronger outcome.
      openPartial = '';
      seenFinalKeys.add(id);
      if (clean) finals.push(clean);
      diagnostics.emit('voice_result_final', { chars: clean.length, epochId, duplicate: false });
      return { accepted: true, duplicate: false };
    },

    /** Close the current epoch. Every boundary funnels here. */
    endEpoch(reason, { allowSalvage = true } = {}) {
      assertOpen('endEpoch');
      const tail = closeOpenPartial(reason, allowSalvage);
      open = false;
      diagnostics.emit('voice_recognition_ended', {
        reason, epochId, tailOutcome: tail.outcome, tailChars: tail.chars,
      });
      return tail;
    },

    /** Capture died. The death is reported, then the epoch closes normally. */
    captureLost(cause, { allowSalvage = true } = {}) {
      diagnostics.emit('voice_capture_lost', { cause, epochId });
      if (!open) return { outcome: 'empty', chars: 0 };
      return api.endEpoch(EPOCH_END_REASONS.CAPTURE_LOST, { allowSalvage });
    },

    /** End this epoch and open the next. Accumulated finals survive. */
    restart(reason = EPOCH_END_REASONS.RESTART, opts = {}) {
      const tail = open ? api.endEpoch(reason, opts) : { outcome: 'empty', chars: 0 };
      api.startEpoch();
      return tail;
    },

    userStop(opts = {}) {
      return api.endEpoch(EPOCH_END_REASONS.USER_STOP, opts);
    },

    /**
     * Hand the accumulated utterance to MAIA. Only COMMITTED finals cross —
     * an open partial is closed first (salvaged or reported), never smuggled in
     * as if it had been recognized as final.
     */
    commit() {
      diagnostics.emit('voice_turn_commit_requested', { epochId, finals: finals.length });
      if (open) closeOpenPartial('commit');
      const text = finals.join(' ').replace(/\s+/g, ' ').trim();
      committed = true;
      diagnostics.emit('voice_turn_committed', { epochId, chars: text.length, finals: finals.length });
      return text;
    },

    /** A trailing result after commit — ordering F. Observed, never inferred. */
    resultAfterCommit(text) {
      diagnostics.emit('voice_result_after_commit', {
        chars: typeof text === 'string' ? text.trim().length : 0, epochId,
      });
    },

    /**
     * Begin a NEW session. Everything session-scoped is cleared, so recognized
     * material can never cross from one member turn or sitting into the next.
     */
    reset() {
      if (open) api.endEpoch(EPOCH_END_REASONS.RESTART);
      epochId = 0; open = false; audioSeen = false; speechSeen = false; committed = false;
      openPartial = '';
      finals.length = 0;
      seenFinalKeys.clear();
      salvaged.length = 0;
      lost.length = 0;
    },

    snapshot() {
      return {
        epochId, open, audioSeen, speechSeen, committed,
        openPartialChars: openPartial.trim().length,
        finals: [...finals],
        salvaged: [...salvaged],
        lost: [...lost],
      };
    },
  };

  return api;
}

module.exports = { createEpochState, EPOCH_END_REASONS };
