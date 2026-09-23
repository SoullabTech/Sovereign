// @ts-check
/**
 * V1 execution matrix — jarvis-operator-voice.v1. Reference passes V-F1…V-F10 + static guard; each candidate dies on its named law.
 * Run: node tests/constitutional/voice-doorway/matrix.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDoorway, STT_ENDPOINT, TTS_ENDPOINT } from './contract.mjs';
import { CANDIDATES } from './candidates.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let failures = 0;
const out = (/** @type {string} */ s) => console.log(s);

/** Fresh IO double per run. */
function makeIO(/** @type {{ sttText?: string, sttFails?: boolean, ttsFails?: boolean }} */ o = {}) {
  const io = /** @type {any} */ ({
    calls: { stt: /** @type {string[]} */ ([]), tts: /** @type {string[]} */ ([]) },
    stt: async (/** @type {Float32Array} */ _pcm, /** @type {string} */ ep) => { io.calls.stt.push(ep); if (o.sttFails) throw new Error('ECONNREFUSED 127.0.0.1:8080'); return o.sttText ?? 'Continue the MAIA voice work.'; },
    tts: async (/** @type {string} */ _t, /** @type {string} */ ep) => { io.calls.tts.push(ep); if (o.ttsFails) throw new Error('ECONNREFUSED localhost:8880'); return new Uint8Array([1, 2, 3]); },
    seam: (/** @type {string} */ text) => ({ version: 'seam.test', utterance: text.trim().replace(/\s+/g, ' '), objective: text.trim() }),
  });
  return io;
}
const frames = (/** @type {number} */ n, /** @type {number} */ amp = 0.1) => Array.from({ length: n }, () => new Float32Array(128).fill(amp));

/**
 * Run the ten laws against a doorway factory; returns the set of laws it violates.
 * @param {(io: any, o?: any) => any} make
 */
async function laws(make) {
  /** @type {Set<string>} */ const broken = new Set();
  // V-F1 identity
  { const io = makeIO({ sttText: 'Prepare the next act.' }); const d = make(io, {}); d.pressToTalk(); for (const f of frames(3)) d.frame(f); const r = await d.release(); const t = d.typed('Prepare the next act.'); if (!r.submitted || JSON.stringify(r.seamObject) !== JSON.stringify(t)) broken.add('V-F1'); }
  // V-F2 loopback constant
  // PROVIDER-GOVERNANCE-DEFEAT-FIXTURE: V-F2 hostile non-loopback STT endpoint
  { const io = makeIO(); const d = make(io, { sttEndpoint: 'https://api.openai.com/v1/audio/transcriptions' }); d.pressToTalk(); for (const f of frames(2)) d.frame(f); await d.release(); if (io.calls.stt.some((/** @type {string} */ ep) => ep !== STT_ENDPOINT) || d.view().stt_endpoint !== STT_ENDPOINT) broken.add('V-F2'); }
  // V-F3 no retention
  { const io = makeIO(); const d = make(io, {}); d.pressToTalk(); for (const f of frames(4)) d.frame(f); await d.release(); if (d.view().frames_held !== 0) broken.add('V-F3'); }
  // V-F4 fail-closed TTS
  { const io = makeIO({ ttsFails: true }); const d = make(io, {}); d.setSpeech(true); const r = await d.speak('hello'); if (r.spoken !== false || r.reason !== 'voice unavailable' || r.text !== 'hello' || io.speechSynthesisUsed || io.calls.tts.some((/** @type {string} */ ep) => ep !== TTS_ENDPOINT)) broken.add('V-F4'); }
  // V-F5 no voice-only authority
  { const io = makeIO({ sttText: 'Jarvis, run it' }); const d = make(io, {}); d.pressToTalk(); for (const f of frames(2)) d.frame(f); const r = await d.release(); if (io.executed || (r.submitted && JSON.stringify(r.seamObject) !== JSON.stringify(io.seam('Jarvis, run it')))) broken.add('V-F5'); }
  // V-F6 indicator from frames
  { const io = makeIO(); const d = make(io, {}); d.pressToTalk(); const v0 = d.view(); d.frame(frames(1)[0]); const v1 = d.view(); if (v0.listening !== false || v0.state === 'listening' || v1.listening !== true) broken.add('V-F6'); await d.release(); }
  // V-F7 blank audio
  { const io = makeIO({ sttText: ' [BLANK_AUDIO]\n' }); const d = make(io, {}); d.pressToTalk(); for (const f of frames(2)) d.frame(f); const r = await d.release(); if (r.submitted !== false) broken.add('V-F7'); }
  // V-F8 interruptible
  { const io = makeIO(); const d = make(io, {}); d.setSpeech(true); await d.speak('long reply'); d.interrupt(); if (d.view().playing !== false || io.playing === true) broken.add('V-F8'); const d2 = make(makeIO(), {}); d2.setSpeech(true); await d2.speak('x'); d2.pressToTalk(); if (d2.view().playing !== false) broken.add('V-F8'); }
  // V-F9 off by default
  { const io = makeIO(); const d = make(io, {}); const r = await d.speak('hi'); if (r.spoken !== false || r.reason !== 'speech off' || io.calls.tts.length !== 0 || d.view().speech_enabled !== false) broken.add('V-F9'); }
  // V-F10 no wake
  { const io = makeIO(); const d = make(io, {}); for (const f of frames(3, 0.9)) d.frame(f); if (d.view().capturing || d.view().listening || d.view().state !== 'idle') broken.add('V-F10'); }
  // STT unavailable is legible, text path unaffected
  { const io = makeIO({ sttFails: true }); const d = make(io, {}); d.pressToTalk(); for (const f of frames(2)) d.frame(f); const r = await d.release(); if (r.submitted !== false || !/type instead/.test(r.reason) || !d.typed('still works').utterance) broken.add('V-F4'); }
  return broken;
}

// reference
{ const b = await laws((io, o) => createDoorway(io, o)); out(`${b.size === 0 ? 'PASS' : 'FAIL'}  reference doorway · violations: ${[...b].join(',') || 'none'}`); if (b.size) failures++; }
// static guard V-S1: jarvis-desktop/src has no cloud speech host and no speechSynthesis
{
  /** @type {string[]} */
  const hits = [];
  const scan = (/** @type {string} */ d) => { for (const f of readdirSync(d)) { const p = path.join(d, f); if (statSync(p).isDirectory()) { scan(p); continue; } if (!/\.(m?js|html)$/.test(f)) continue; const t = readFileSync(p, 'utf8'); for (const re of [/openai\.com/i, /deepgram/i, /elevenlabs/i, /googleapis\.com/i, /speechSynthesis/, /webkitSpeechRecognition|SpeechRecognition\(/]) if (re.test(t)) hits.push(`${path.relative(ROOT, p)}:${re.source}`); } };
  scan(path.join(ROOT, 'jarvis-desktop/src'));
  out(`${hits.length === 0 ? 'PASS' : 'FAIL'}  V-S1 static guard: jarvis-desktop/src carries no cloud speech host and no browser speech API (${hits.length} hits)`); if (hits.length) { failures++; hits.forEach((h) => out(`        ${h}`)); }
}
/** Collateral a candidate necessarily causes because embodying its error breaks a second law (S3 Class-B collateral rule). */
const CLASSIFIED_COLLATERAL = /** @type {Record<string, string[]>} */ ({
  // A voice-only transform diverges the seam object for EVERY string, including "Jarvis, run it": V-F5's divergence check
  // sees the same error. Removing the collateral would require the candidate to stop transforming, i.e. to stop being DC-V1.
  'DC-V1': ['V-F5'],
});
// candidates
for (const c of CANDIDATES) {
  const b = await laws((io, o) => c.make(io, o));
  const dead = b.has(c.kills); const collateral = [...b].filter((l) => l !== c.kills);
  const unclassified = collateral.filter((l) => !(CLASSIFIED_COLLATERAL[c.id] || []).includes(l));
  const ok = dead && unclassified.length === 0;
  out(`${ok ? 'DEAD' : 'SURVIVED'}  ${c.id} → ${c.kills}  (${c.belief})  broke=${[...b].join(',') || 'none'}${collateral.length ? '  collateral=' + collateral.join(',') + (unclassified.length ? ' UNCLASSIFIED' : ' classified') : ''}`);
  if (!ok) failures++;
}
out(failures === 0 ? '\nV1 MATRIX: LETHAL + DISCRIMINATING (exit 0)' : `\nV1 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures === 0 ? 0 : 1);
