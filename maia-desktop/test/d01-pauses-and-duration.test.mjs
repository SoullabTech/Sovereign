// MAIA-D01 — pauses, resumption, and the 2–5 minute duration witness.
//
// The acceptance case is a natural monologue, NOT a command. The founder's
// ruling was explicit that the test must not be optimized for short
// command-style speech, so these cases are built from a synthesized monologue
// with real reflective pauses in it.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createVad, DEFAULTS } = require('../src/voice/vad.js');
const { createEpochState } = require('../src/voice/epoch.js');
const { createDiagnostics } = require('../src/voice/diagnostics.js');

const FRAME_MS = 20;
const speech = () => Array.from({ length: 320 }, (_, i) => 0.16 * Math.sin(i / 3));
const silence = () => new Array(320).fill(0.0005);
const frames = (ms, gen) => Array.from({ length: Math.round(ms / FRAME_MS) }, gen);

function feed(vad, list) {
  const out = [];
  for (const f of list) out.push(...vad.push(f, FRAME_MS));
  return out;
}

test('a long reflective pause does NOT end the capture epoch', () => {
  const events = [];
  const diagnostics = createDiagnostics((e, r) => events.push(r), { now: () => events.length });
  const epoch = createEpochState({ diagnostics });
  const vad = createVad();
  epoch.startEpoch();

  for (const t of feed(vad, frames(4000, speech))) {
    if (t === 'audio_started') epoch.audioStarted();
    if (t === 'speech_started') epoch.speechStarted();
  }
  // Twelve seconds of silence — twice the long-pause threshold, five times the
  // utterance boundary. A dictation VAD would have torn down twice by now.
  const during = feed(vad, frames(12000, silence));
  assert.ok(during.includes('utterance_boundary'), 'an utterance boundary should be offered');
  assert.ok(during.includes('long_pause'), 'a long pause should be reported to the surface');

  assert.equal(epoch.snapshot().open, true, 'the epoch closed on silence — a pause was read as a finished thought');
  assert.ok(!events.map((e) => e.event).includes('voice_recognition_ended'));
});

test('speech resuming after a long pause continues the SAME epoch', () => {
  const events = [];
  const diagnostics = createDiagnostics((e, r) => events.push(r), { now: () => events.length });
  const epoch = createEpochState({ diagnostics });
  const vad = createVad();
  epoch.startEpoch();
  const epochAtStart = epoch.snapshot().epochId;

  feed(vad, frames(3000, speech));
  epoch.audioStarted(); epoch.speechStarted();
  epoch.final('the first thing I wanted to say', 'a');
  feed(vad, frames(9000, silence));
  const resumed = feed(vad, frames(3000, speech));
  assert.ok(resumed.includes('speech_started'), 'VAD must re-acknowledge speech after a pause');
  epoch.final('and then the other thing', 'b');

  assert.equal(epoch.snapshot().epochId, epochAtStart, 'a pause caused an epoch restart');
  assert.deepEqual(epoch.snapshot().finals,
    ['the first thing I wanted to say', 'and then the other thing']);
});

test('the utterance boundary is generous enough for mid-thought silence', () => {
  // A boundary must NOT be offered at ordinary dictation thresholds.
  const vad = createVad();
  feed(vad, frames(2000, speech));
  const short = feed(vad, frames(800, silence));   // typical dictation cutoff
  assert.ok(!short.includes('utterance_boundary'),
    `an 800 ms pause ended an utterance; endOfUtteranceMs=${DEFAULTS.endOfUtteranceMs}`);
  const longer = feed(vad, frames(2000, silence)); // now past 2500 ms total
  assert.ok(longer.includes('utterance_boundary'));
});

test('DURATION WITNESS — a 5 minute monologue survives with no lost tail', () => {
  const events = [];
  const diagnostics = createDiagnostics((e, r) => events.push(r), { now: () => events.length });
  const epoch = createEpochState({ diagnostics });
  const vad = createVad();
  epoch.startEpoch();

  // 300 s: alternating stretches of speech and genuinely long pauses, the shape
  // of someone thinking out loud rather than dictating.
  let elapsed = 0, seg = 0;
  while (elapsed < 300000) {
    const talk = 9000 + (seg % 4) * 3000;      //  9–18 s of speech
    for (const t of feed(vad, frames(talk, speech))) {
      if (t === 'audio_started') epoch.audioStarted();
      if (t === 'speech_started') epoch.speechStarted();
    }
    epoch.partial(`segment ${seg} in progress`);
    epoch.final(`segment ${seg}`, `seg-${seg}`);
    const pause = 3000 + (seg % 3) * 4000;     //  3–11 s of silence
    feed(vad, frames(pause, silence));
    elapsed += talk + pause;
    seg += 1;
  }

  assert.ok(seg >= 12, `expected a real monologue, got ${seg} segments`);
  assert.equal(epoch.snapshot().open, true, 'the epoch did not survive five minutes');
  assert.equal(epoch.snapshot().finals.length, seg, 'finals were lost mid-monologue');
  assert.equal(epoch.snapshot().lost.length, 0, 'material was lost during the monologue');

  const text = epoch.commit();
  assert.ok(text.includes('segment 0'), 'the beginning did not survive to commit');
  assert.ok(text.includes(`segment ${seg - 1}`), 'the END did not survive to commit');
  assert.equal(epoch.snapshot().lost.length, 0);
});

test('DURATION WITNESS — a mid-monologue restart loses nothing', () => {
  const events = [];
  const diagnostics = createDiagnostics((e, r) => events.push(r), { now: () => events.length });
  const epoch = createEpochState({ diagnostics });
  epoch.startEpoch();
  for (let i = 0; i < 8; i++) epoch.final(`part ${i}`, `p${i}`);
  epoch.partial('mid-sentence when the stream dropped');
  epoch.restart('transcription_failed');        // the stream dies at the worst moment
  for (let i = 8; i < 16; i++) epoch.final(`part ${i}`, `p${i}`);

  const s = epoch.snapshot();
  assert.equal(s.finals.length, 16, 'a restart lost accumulated finals');
  assert.equal(s.salvaged.length, 1, 'the interrupted sentence was not salvaged');
  assert.equal(s.lost.length, 0);
  assert.ok(epoch.commit().includes('part 0'));
});
