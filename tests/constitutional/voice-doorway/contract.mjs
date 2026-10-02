// @ts-check
/**
 * jarvis-operator-voice.v1 — typed contract + conforming reference double (V1)
 * ═══════════════════════════════════════════════════════════════════════════
 * JARVIS-VOICE-DOORWAY-01 / V1, authorized by the founder's continuation act (2026-09-23).
 * Types OBSERVABLE DOORWAY SEMANTICS at the boundary, never the machine behind it:
 * no worklet, no IPC, no Electron, no audio. The reference is a TEST DOUBLE —
 * evidence the laws are mutually satisfiable, ⛔ never a seed for V2.
 *
 * Law (ratified OE-1 + continuation act): one mind, two capture modes.
 *   microphone → local STT (127.0.0.1:8080) → transcript → THE SAME string seam typed text uses
 *   → response text [always] → optional local TTS (localhost:8880), off by default, fail-closed.
 *
 * Falsifiers (each with a defeat candidate in candidates.mjs):
 *   V-F1  identity: voice(s) and typed(s) yield deep-equal seam objects for the same string
 *   V-F2  STT is a loopback constant owned by the doorway; a caller-supplied endpoint is refused
 *   V-F3  no retention: captured frames are discarded after transcription; nothing persists them
 *   V-F4  fail-closed TTS: Kokoro unavailable → text shown, `voice unavailable`; no fallback of any kind
 *   V-F5  no voice-only authority: the seam is the only sink; no command grammar reaches anything else
 *   V-F6  the listening indicator is driven by frame receipt, never by button state
 *   V-F7  blank audio ([BLANK_AUDIO] / empty) is never submitted
 *   V-F8  speech output is interruptible: a new gesture, a new utterance or Escape stops playback now
 *   V-F9  speech output is OFF by default
 *   V-F10 wake activation is absent: nothing opens capture without a founder gesture
 */

export const STT_ENDPOINT = 'http://127.0.0.1:8080/inference';
export const TTS_ENDPOINT = 'http://localhost:8880/v1/audio/speech';
export const STATES = Object.freeze(['idle', 'listening', 'transcribing', 'thinking', 'speaking', 'voice_unavailable']);
export const BLANK = /^\s*(\[BLANK_AUDIO\]\s*)*$/;

/**
 * @typedef {{ text: string, source: 'typed'|'voice' }} SeamInput   NOTE: the seam object must NOT depend on `source` (V-F1)
 * @typedef {{ stt: (pcm: Float32Array, endpoint: string) => Promise<string>, tts: (text: string, endpoint: string) => Promise<Uint8Array>, seam: (text: string) => any, player?: { play: (audio: Uint8Array) => void, stop: () => void } }} IO
 */

/**
 * Conforming reference doorway. Pure over its injected IO.
 * @param {IO} io
 * @param {{ speechEnabled?: boolean }} [opts]
 */
export function createDoorway(io, opts = {}) {
  let state = 'idle';
  /** @type {Float32Array[]} */ let frames = [];
  let capturing = false;          // button/gesture state
  let framesReceived = 0;         // liveness truth (V-F6)
  let speechEnabled = opts.speechEnabled === true; // V-F9: off unless explicitly turned on
  let playing = false;
  const player = io.player || { play: () => { playing = true; }, stop: () => { playing = false; } };
  const events = /** @type {string[]} */ ([]);
  const log = (/** @type {string} */ e) => events.push(e);

  return {
    /** Founder gesture opens capture (V-F10: nothing else does). */
    pressToTalk() { capturing = true; frames = []; framesReceived = 0; state = 'idle'; log('gesture:press'); if (playing) { player.stop(); playing = false; log('interrupt:gesture'); } },
    /** A frame arriving from the microphone: only this promotes to listening (V-F6). */
    frame(/** @type {Float32Array} */ pcm) { if (!capturing) return; frames.push(pcm); framesReceived++; if (state !== 'listening') { state = 'listening'; log('state:listening'); } },
    /** Release: transcribe locally, discard frames, hand the transcript to the SAME seam typed text uses. */
    async release() {
      if (!capturing) return { submitted: false, reason: 'not capturing' };
      capturing = false;
      if (framesReceived === 0) { state = 'idle'; log('release:nothing-heard'); return { submitted: false, reason: 'nothing heard' }; }
      state = 'transcribing'; log('state:transcribing');
      const pcm = concat(frames);
      frames = []; // V-F3: nothing retains the audio beyond this call
      let text;
      try { text = await io.stt(pcm, STT_ENDPOINT); } catch (e) { state = 'idle'; log('stt:unavailable'); return { submitted: false, reason: "JARVIS can't hear right now — type instead", stt_error: String(e) }; }
      if (BLANK.test(text)) { state = 'idle'; log('release:blank'); return { submitted: false, reason: 'nothing heard' }; } // V-F7
      state = 'thinking'; log('state:thinking');
      const seamObject = io.seam(text); // V-F1 / V-F5: the only sink, the same function typed text uses
      state = 'idle';
      return { submitted: true, text, seamObject };
    },
    /** Typed path, for the identity law: the same seam, nothing else. */
    typed(/** @type {string} */ text) { return io.seam(text); },
    /** Optional speech. Off by default; local only; fail-closed (V-F4, V-F9). */
    async speak(/** @type {string} */ text) {
      if (!speechEnabled) return { spoken: false, reason: 'speech off', text };
      state = 'speaking'; log('state:speaking');
      try { const audio = await io.tts(text, TTS_ENDPOINT); player.play(audio); playing = true; return { spoken: true, text }; }
      catch (e) { state = 'voice_unavailable'; log('tts:unavailable'); return { spoken: false, reason: 'voice unavailable', text, tts_error: String(e) }; }
    },
    interrupt() { if (playing) { player.stop(); playing = false; log('interrupt:escape'); } state = 'idle'; },
    setSpeech(/** @type {boolean} */ on) { speechEnabled = on === true; log(`speech:${speechEnabled ? 'on' : 'off'}`); },
    /** Visible state (V-F6: `listening` only ever follows a received frame). */
    view() { return { state, listening: framesReceived > 0 && capturing, capturing, frames_held: frames.length, speech_enabled: speechEnabled, playing, stt_endpoint: STT_ENDPOINT, tts_endpoint: TTS_ENDPOINT }; },
    events: () => events.slice(),
  };
}

/** @param {Float32Array[]} parts */
function concat(parts) { const n = parts.reduce((a, p) => a + p.length, 0); const out = new Float32Array(n); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; }
