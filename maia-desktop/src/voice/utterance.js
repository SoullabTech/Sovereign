// MAIA Desktop — utterance buffering.
//
// DESKTOP-CONVERSATION-01, and the repair for the class E defect the 2026-08-27
// device walk found: the frame handler ran the VAD and then dropped every
// sample on the floor, so transcription was never reachable.
//
// Pure. Holds the PCM the member has spoken since the last boundary, and hands
// it over when the VAD says an utterance ended.
//
// ⛔ THE TAIL RULE APPLIES HERE TOO. `take()` is the only way to empty the
// buffer, and it returns what it removed. There is no path that clears audio
// without giving it to the caller — the same structural discipline the epoch
// state machine uses for text, applied one layer down, because audio dropped
// here would be speech lost before the tail invariant could ever see it.
//
// Leading context is preserved deliberately: speech is detected a few frames
// AFTER it starts (the VAD needs consecutive frames to confirm), so buffering
// only after `speech_started` would clip the first syllable of every utterance.
// Frames accumulate continuously; the pre-roll is already there when speech is
// acknowledged.

'use strict';

const DEFAULTS = Object.freeze({
  // Hard ceiling so a member who talks for ten minutes without a boundary does
  // not build an unbounded buffer. At 48 kHz this is ~60 s of audio.
  maxSamples: 48000 * 60,
  // Below this, a "boundary" is silence or a cough, not an utterance worth
  // sending. Roughly 0.3 s at 48 kHz.
  minSamples: 14400,
});

function createUtteranceBuffer(config = {}) {
  const cfg = { ...DEFAULTS, ...config };
  let chunks = [];
  let total = 0;
  let dropped = 0;

  return {
    push(frame) {
      chunks.push(frame);
      total += frame.length;
      // Drop from the FRONT when over the ceiling: the recent past is what the
      // member is still saying. Counted, never silent.
      while (total > cfg.maxSamples && chunks.length > 1) {
        const gone = chunks.shift();
        total -= gone.length;
        dropped += gone.length;
      }
    },

    /** @returns {{samples: Float32Array, sampleCount: number, droppedSamples: number}|null} */
    take() {
      if (total < cfg.minSamples) return null;
      const out = new Float32Array(total);
      let at = 0;
      for (const c of chunks) { out.set(c, at); at += c.length; }
      const result = { samples: out, sampleCount: total, droppedSamples: dropped };
      chunks = []; total = 0; dropped = 0;
      return result;
    },

    /**
     * ⭐ DESKTOP-CONVERSATION-WIRING-01. Drop the audio captured across a turn
     * window, ACCOUNTED.
     *
     * Frames accumulate continuously — that is the pre-roll rule above — so
     * while MAIA is being asked and is speaking, the buffer keeps filling with
     * the pause, the room, and MAIA's own voice arriving back through the
     * microphone. None of that is the member's next utterance. Left in place it
     * is prepended to whatever they say next, which is how a reply gets
     * answered as if the member had said it.
     *
     * ⛔ IT IS NOT A SILENT CLEAR. It returns how many samples it removed so
     * the caller can say so in the diagnostic record. `take()` remains the only
     * path that hands audio onward; this is the only path that drops it, and it
     * reports what it dropped. Audio still never disappears without a number
     * attached to it.
     *
     * @returns {number} samples discarded
     */
    discard() {
      const gone = total;
      chunks = []; total = 0; dropped = 0;
      return gone;
    },

    /** Discard without returning — only legitimate when a session ends entirely. */
    clear() { chunks = []; total = 0; dropped = 0; },
    size() { return total; },
  };
}

module.exports = { createUtteranceBuffer, DEFAULTS };
