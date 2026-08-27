// MAIA-D02 — the near-silence dispatch gate.
//
// On the long walk of 2026-08-27, MAIA received a Whisper hallucination — one
// phrase repeated thirty times, produced from twenty seconds of room tone — and
// answered it as speech: "that's not a thought, that's something trying to
// break through." She offered interpretation of words the member never said.
// These assertions keep that from reaching her, and keep the gate honest about
// the two ways it could itself go wrong: discarding real speech, or discarding
// anything silently.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createConversation, SILENCE_RMS_X1000, SILENCE_PEAK_X1000 } = require('../src/conversation.js');

/** Mono audio at a chosen amplitude, so a fixture can state its own level. */
const at = (n, amp) => Float32Array.from({ length: n }, (_, i) => Math.sin(i / 3) * amp);

function mk() {
  const sent = [];
  const events = [];
  const conv = createConversation({
    session: { authedFetch: async (p) => { sent.push(p); return { ok: true, status: 200, res: { json: async () => ({ transcription: 'x' }) } }; } },
    diagnostics: { emit: (n, m) => events.push([n, m]) },
    sessionId: 'x',
  });
  return { conv, sent, events };
}

test('room tone is not dispatched — the hallucination never reaches MAIA', async () => {
  const { conv, sent } = mk();
  // The actual failing turn: peakX1000=127 rmsX1000=8.
  const out = await conv.transcribe(at(16000 * 20, 0.008), 16000);
  assert.equal(out.ok, false);
  assert.equal(out.gated, true);
  assert.deepEqual(sent, [], 'near-silence was still sent to Whisper');
});

test('the gate is NEVER silent — the member is told in words', async () => {
  const { conv, events } = mk();
  const out = await conv.transcribe(at(1600, 0.008), 16000);
  assert.match(out.error, /near-silence/i, 'the member is not told why nothing happened');
  assert.match(out.error, /say it again/i, 'the member is not told what to do');
  assert.ok(events.some(([n, m]) => n === 'voice_transcribe_error' && m.errorName === 'near_silence'),
    'the gate leaves no diagnostic trace');
  // Level is still reported, so a mis-tuned threshold is visible rather than invisible.
  assert.ok(events.some(([n, m]) => n === 'voice_transcribe_sent' && m.rmsX1000 !== undefined),
    'a gated turn reports no level — the threshold could not be re-tuned from the field');
});

test('⛔ the threshold sits BELOW the observed gap, erring toward sending', () => {
  // Walk data: bad turns ran rms 7–33, good turns 54–148. A cut at 40 would
  // separate them perfectly and would be wrong — quiet real speech is a far
  // worse loss than an occasional hallucination, per the tail invariant.
  assert.ok(SILENCE_RMS_X1000 <= 20,
    `threshold ${SILENCE_RMS_X1000} is inside the ambiguous band — it will discard real speech`);
});

test('quiet but real speech is still sent', async () => {
  const { conv, sent } = mk();
  // rms ~33: garbage on the walk, but inside the ambiguous band — must pass.
  const out = await conv.transcribe(at(16000, 0.047), 16000);
  assert.equal(out.ok, true, 'quiet speech was discarded — this is the tail invariant broken');
  assert.equal(sent.length, 1);
});

test('a loud transient alone does not open the gate, and does not close it', async () => {
  // Either signal alone is ambiguous: a door slam lifts peak without rms;
  // distant speech lifts rms without peak. Both must be low to gate.
  const { conv, sent } = mk();
  const quiet = at(16000, 0.005);
  quiet[0] = 0.9;                       // one loud sample: peak high, rms still tiny
  await conv.transcribe(quiet, 16000);
  assert.equal(sent.length, 1, 'a single transient was treated as speech-free and dropped');
  assert.ok(SILENCE_PEAK_X1000 > 0);
});
