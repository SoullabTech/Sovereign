// @ts-check
/** Defeat candidates for jarvis-operator-voice.v1. Each is the smallest competent embodiment of ONE wrong belief. */
import { createDoorway, STT_ENDPOINT, TTS_ENDPOINT } from './contract.mjs';

export const CANDIDATES = Object.freeze([
  { id: 'DC-V1', kills: 'V-F1', belief: 'spoken text needs its own tidy-up before it reaches the seam',
    make: (/** @type {any} */ io, /** @type {any} */ o) => { const d = createDoorway({ ...io, seam: (t) => io.seam(t.trim().toLowerCase().replace(/[.!?]+$/, '')) }, o); return { ...d, typed: (/** @type {string} */ t) => io.seam(t) }; } },
  { id: 'DC-V2', kills: 'V-F2', belief: 'the renderer should be able to point STT at any server',
    make: (/** @type {any} */ io, /** @type {any} */ o) => { const d = createDoorway({ ...io, stt: (pcm, _ep) => io.stt(pcm, o.sttEndpoint || STT_ENDPOINT) }, o); return d; } },
  { id: 'DC-V3', kills: 'V-F3', belief: 'keeping the last utterance around makes debugging easier',
    make: (/** @type {any} */ io, /** @type {any} */ o) => { const kept = /** @type {Float32Array[]} */ ([]); const d = createDoorway({ ...io, stt: (pcm, ep) => { kept.push(pcm); return io.stt(pcm, ep); } }, o); return { ...d, view: () => ({ ...d.view(), frames_held: d.view().frames_held + kept.length }) }; } },
  { id: 'DC-V4', kills: 'V-F4', belief: 'if Kokoro is down the browser voice is better than silence',
    make: (/** @type {any} */ io, /** @type {any} */ o) => { const d = createDoorway({ ...io, tts: async (t, ep) => { try { return await io.tts(t, ep); } catch { io.speechSynthesisUsed = true; return new Uint8Array(1); } } }, o); return d; } },
  { id: 'DC-V5', kills: 'V-F5', belief: '"Jarvis, run it" is a natural voice command',
    make: (/** @type {any} */ io, /** @type {any} */ o) => { const d = createDoorway({ ...io, seam: (t) => { if (/^jarvis,?\s+run/i.test(t)) { io.executed = true; return { command: 'run' }; } return io.seam(t); } }, o); return d; } },
  { id: 'DC-V6', kills: 'V-F6', belief: 'the mic is listening as soon as the button is down',
    make: (/** @type {any} */ io, /** @type {any} */ o) => { const d = createDoorway(io, o); return { ...d, view: () => { const v = d.view(); return { ...v, listening: v.capturing, state: v.capturing && v.state === 'idle' ? 'listening' : v.state }; } }; } },
  { id: 'DC-V7', kills: 'V-F7', belief: 'whatever Whisper returns is the utterance',
    make: (/** @type {any} */ io, /** @type {any} */ o) => { const d = createDoorway({ ...io, stt: async (pcm, ep) => { const t = await io.stt(pcm, ep); return t.replace(/\[BLANK_AUDIO\]/g, '(blank)'); } }, o); return d; } },
  { id: 'DC-V8', kills: 'V-F8', belief: 'a queued reply should finish before the next one starts',
    make: (/** @type {any} */ io, /** @type {any} */ o) => createDoorway({ ...io, player: { play: () => { io.playing = true; }, stop: () => { /* let it finish */ } } }, o) },
  { id: 'DC-V9', kills: 'V-F9', belief: 'the founder wants voice, so speech should be on out of the box',
    make: (/** @type {any} */ io, /** @type {any} */ o) => createDoorway(io, { ...o, speechEnabled: true }) },
  { id: 'DC-V10', kills: 'V-F10', belief: 'an energy spike is as good as a wake word',
    make: (/** @type {any} */ io, /** @type {any} */ o) => { const d = createDoorway(io, o); return { ...d, frame: (/** @type {Float32Array} */ pcm) => { if (!d.view().capturing && pcm.some((x) => Math.abs(x) > 0.5)) d.pressToTalk(); d.frame(pcm); } }; } },
]);
