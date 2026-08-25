// MAIA Desktop — voice activity detection over OWNED audio frames.
//
// MAIA-D01. Pure: takes frames of PCM samples and a frame duration, returns
// transitions. No audio API, no timers, no clock.
//
// ── WHY THE DEFAULTS LOOK SLOW ──────────────────────────────────────────────
//
// Dictation VADs close an utterance after ~500–800 ms of silence. That is
// correct for "set a timer for ten minutes" and wrong for everything this
// product is for. A member narrating a dream, working through grief, or
// thinking mid-sentence produces silences far longer than any dictation
// threshold, and a 700 ms cutoff turns each of those into a severed utterance.
//
// So the boundary that matters here is deliberately generous, and — the load-
// bearing part — an utterance boundary is NOT an epoch boundary. When
// `endOfUtteranceMs` elapses this module says "an utterance ended, a final may
// be requested." It never says "tear down capture." Capture keeps running
// through the pause, so speech resuming after a long pause continues the same
// epoch with its accumulated finals intact.
//
// The programme's §XII invariant, restated in code terms: silence is a
// relational event, not a timeout.

'use strict';

const DEFAULTS = Object.freeze({
  // Hysteresis: entering speech is harder than staying in it, so a breath
  // mid-word does not flap the state.
  speechRms: 0.020,
  silenceRms: 0.012,
  // Consecutive frames required to confirm a transition (debounce).
  speechFrames: 3,
  silenceFrames: 5,
  // A pause this long ends an UTTERANCE (a final may be requested).
  // It does NOT end the epoch. 2500 ms is chosen to sit above ordinary
  // mid-thought pauses rather than above ordinary word gaps.
  endOfUtteranceMs: 2500,
  // A pause this long is reported as a long reflective pause, purely so the
  // surface can show the member it is still listening. Still not an epoch end.
  longPauseMs: 6000,
});

function rms(frame) {
  if (!frame || frame.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < frame.length; i++) { const s = frame[i]; sum += s * s; }
  return Math.sqrt(sum / frame.length);
}

/**
 * @param {object} [config] overrides for DEFAULTS
 * @returns {{push: (frame: ArrayLike<number>, frameMs: number) => string[], state: () => object, reset: () => void}}
 *   `push` returns zero or more transitions, in order:
 *     'audio_started' · 'speech_started' · 'speech_ended'
 *     'utterance_boundary' · 'long_pause'
 */
function createVad(config = {}) {
  const cfg = { ...DEFAULTS, ...config };
  let sawAudio = false;
  let inSpeech = false;
  let speechRun = 0;
  let silenceRun = 0;
  let silenceMs = 0;
  let utteranceBoundaryEmitted = false;
  let longPauseEmitted = false;
  let voicedMs = 0;

  return {
    push(frame, frameMs) {
      const events = [];
      if (!sawAudio) { sawAudio = true; events.push('audio_started'); }

      const level = rms(frame);

      if (!inSpeech) {
        if (level >= cfg.speechRms) {
          speechRun += 1;
          if (speechRun >= cfg.speechFrames) {
            inSpeech = true;
            speechRun = 0; silenceRun = 0; silenceMs = 0;
            utteranceBoundaryEmitted = false; longPauseEmitted = false;
            events.push('speech_started');
          }
        } else {
          speechRun = 0;
          // Only accumulate pause time once we have heard speech at least once;
          // pre-speech silence is not a pause, it is not having started.
          if (voicedMs > 0) {
            silenceMs += frameMs;
            if (!utteranceBoundaryEmitted && silenceMs >= cfg.endOfUtteranceMs) {
              utteranceBoundaryEmitted = true;
              events.push('utterance_boundary');
            }
            if (!longPauseEmitted && silenceMs >= cfg.longPauseMs) {
              longPauseEmitted = true;
              events.push('long_pause');
            }
          }
        }
        return events;
      }

      // In speech.
      if (level < cfg.silenceRms) {
        silenceRun += 1;
        silenceMs += frameMs;
        if (silenceRun >= cfg.silenceFrames) {
          inSpeech = false;
          silenceRun = 0;
          events.push('speech_ended');
        }
      } else {
        silenceRun = 0;
        silenceMs = 0;
        voicedMs += frameMs;
        utteranceBoundaryEmitted = false;
        longPauseEmitted = false;
      }
      return events;
    },

    state() {
      return { sawAudio, inSpeech, silenceMs, voicedMs, utteranceBoundaryEmitted, longPauseEmitted };
    },

    reset() {
      sawAudio = false; inSpeech = false; speechRun = 0; silenceRun = 0;
      silenceMs = 0; voicedMs = 0;
      utteranceBoundaryEmitted = false; longPauseEmitted = false;
    },
  };
}

module.exports = { createVad, rms, DEFAULTS };
