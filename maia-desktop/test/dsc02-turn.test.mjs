// DESKTOP SOVEREIGN CORE 02 — the extracted turn orchestration.
//
// Like DSC-01, these assertions could not be written before the extraction:
// the loop sat inside main.js behind `ipcMain`, so dc01 could only grep it for
// the strings 'transcribe' and 'ask'. What a turn MEANS — its ordering, its
// guard, what it records and what it refuses to record — was unproven.
//
// ⛔ Written under the invariant §7A rule: prove the CALLER-level ordering
// obligations, not merely that the extracted component is correct.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createTurn } = require('../src/turn.js');

/** A voice session stub. `log` is shared so epoch writes and announcements interleave in ONE order. */
function stubVoice(log, o = {}) {
  return {
    sampleRate: o.sampleRate || 48000,
    utterance: {
      take: () => (o.empty ? null : { samples: Float32Array.from([0.1, 0.2]) }),
    },
    epoch: {
      final: (text, id) => log.push({ epochFinal: text, id }),
    },
  };
}

function stubConv(log, o = {}) {
  return {
    transcribe: async (samples, rate) => {
      log.push({ transcribe: { rate, n: samples.length } });
      return o.transcribe ? o.transcribe() : { ok: true, text: '  hello maia  ' };
    },
    ask: async (said) => {
      log.push({ ask: said });
      return o.ask ? o.ask() : { ok: true, text: 'hello', audio: { b64: 'AAA', format: 'mp3' } };
    },
  };
}

function wire(o = {}) {
  const log = [];
  const voice = o.voice === undefined ? stubVoice(log, o) : o.voice;
  const conv = o.conv === undefined ? stubConv(log, o) : o.conv;
  let v = voice, c = conv;
  const t = createTurn({
    voice: () => v,
    conversation: () => c,
    announce: (p) => log.push(p),
    speak: (a) => log.push({ spoke: a }),
    now: () => 1234,
  });
  return { t, log, setVoice: (x) => { v = x; }, setConv: (x) => { c = x; },
           phases: () => log.filter((e) => e.phase).map((e) => e.phase) };
}

// ── the whole turn ──────────────────────────────────────────────────────────

test('a complete turn: transcribing → heard → thinking → answered → voice', async () => {
  const { t, log, phases } = wire();
  await t.run();
  assert.deepEqual(phases(), ['transcribing', 'heard', 'thinking', 'answered']);
  assert.equal(log.find((e) => e.phase === 'heard').member, 'hello maia', 'the transcript is not trimmed');
  assert.equal(log.find((e) => e.phase === 'answered').maia, 'hello');
  assert.deepEqual(log.at(-1), { spoke: { b64: 'AAA', format: 'mp3' } });
});

test('⭐ words before voice, always — the surface never speaks what it has not shown', async () => {
  const { t, log } = wire();
  await t.run();
  const answered = log.findIndex((e) => e.phase === 'answered');
  const spoke = log.findIndex((e) => e.spoke);
  assert.ok(answered >= 0 && spoke > answered, 'audio was emitted before the words — text and voice diverge');
});

test('no audio in the answer — the member is told, and is never both', async () => {
  const { t, log, phases } = wire({ ask: () => ({ ok: true, text: 'hello', audio: null }) });
  await t.run();
  assert.deepEqual(phases(), ['transcribing', 'heard', 'thinking', 'answered', 'no-voice']);
  assert.equal(log.filter((e) => e.spoke).length, 0);
});

test('the real sample rate reaches transcription — a wrong one transcribes a chipmunk', async () => {
  const { t, log } = wire({ sampleRate: 16000 });
  await t.run();
  assert.equal(log.find((e) => e.transcribe).transcribe.rate, 16000);
});

// ── ⛔ ORDERING 1: nothing is recorded that canonical MAIA did not return ────

test('⭐ an empty transcript records NO epoch final, and never asks MAIA', async () => {
  const { t, log, phases } = wire({ transcribe: () => ({ ok: true, text: '   ' }) });
  await t.run();
  assert.deepEqual(phases(), ['transcribing', 'idle']);
  assert.equal(log.filter((e) => e.epochFinal).length, 0,
    'the tail invariant is now protecting material the member never said');
  assert.equal(log.filter((e) => e.ask).length, 0, 'MAIA was asked about silence');
});

test('⭐ a failed transcription records NO epoch final, and never asks MAIA', async () => {
  const { t, log, phases } = wire({ transcribe: () => ({ ok: false, error: 'whisper down' }) });
  await t.run();
  assert.deepEqual(phases(), ['transcribing', 'error']);
  assert.equal(log.find((e) => e.phase === 'error').error, 'whisper down');
  assert.equal(log.filter((e) => e.epochFinal).length, 0,
    'a final was recorded for a transcription that never succeeded');
  assert.equal(log.filter((e) => e.ask).length, 0);
});

test('⭐ the final is recorded BEFORE the member is told they were heard', async () => {
  const { t, log } = wire();
  assert.equal(log.findIndex((e) => e.epochFinal), -1, 'sanity: nothing recorded before the run');
  await t.run();
  const f = log.findIndex((e) => e.epochFinal);
  const heard = log.findIndex((e) => e.phase === 'heard');
  assert.ok(f >= 0 && heard > f,
    "'heard' was announced before the epoch recorded the final — the tail invariant has nothing to protect");
  assert.equal(log[f].epochFinal, 'hello maia', 'the epoch recorded an untrimmed transcript');
  assert.equal(log[f].id, 'utt-1234');
});

// ── ⛔ ORDERING 2: a cough is not a turn ────────────────────────────────────

test('⭐ silence or a cough never enters the busy state — continuity is not stalled', async () => {
  const { t, log } = wire({ empty: true });
  await t.run();
  assert.deepEqual(log, [], 'a cough announced a turn phase');
  assert.equal(t.isBusy, false);
});

test('the guard is silent when there is no voice session or no conversation', async () => {
  const a = wire({ voice: null }); await a.t.run();
  assert.deepEqual(a.log, []);
  const b = wire({ conv: null }); await b.t.run();
  assert.deepEqual(b.log, [], 'a turn ran without a conversation to have it with');
});

// ── ⛔ ORDERING 3: busy is released on every path ───────────────────────────

test('⭐ one turn at a time — a second dispatch mid-turn does nothing', async () => {
  // A transcribe that blocks until we let it finish, so a second dispatch lands
  // squarely mid-turn.
  let release;
  const gate = new Promise((r) => { release = r; });
  const log2 = [];
  const t2 = createTurn({
    voice: () => stubVoice(log2),
    conversation: () => ({
      transcribe: async () => { await gate; return { ok: true, text: 'hi' }; },
      ask: async () => ({ ok: true, text: 'yes', audio: null }),
    }),
    announce: (p) => log2.push(p),
    speak: () => {},
    now: () => 1,
  });
  const first = t2.run();
  assert.equal(t2.isBusy, true, 'a turn in flight does not report itself busy — continuity would adopt mid-turn');
  await t2.run();                                  // second dispatch, while busy
  assert.equal(log2.filter((e) => e.phase === 'transcribing').length, 1, 'two turns ran at once');
  release();
  await first;
  assert.equal(t2.isBusy, false, 'busy leaked after a completed turn — every later turn is frozen');
});

test('⭐ a thrown error is surfaced in words and releases the turn', async () => {
  const { t, log, phases } = wire({ ask: () => { throw new Error('network exploded'); } });
  await t.run();
  assert.deepEqual(phases(), ['transcribing', 'heard', 'thinking', 'error']);
  assert.equal(log.at(-1).error, 'network exploded');
  assert.equal(t.isBusy, false, 'a throw leaked the busy flag — turns AND thread adoption are frozen');
});

test('a failed ask is surfaced, and "answered" is never announced', async () => {
  const { t, log, phases } = wire({ ask: () => ({ ok: false, error: 'maia unreachable' }) });
  await t.run();
  assert.deepEqual(phases(), ['transcribing', 'heard', 'thinking', 'error']);
  assert.equal(log.at(-1).error, 'maia unreachable');
  assert.equal(t.isBusy, false);
});

test('busy is released after every terminal path, not just the happy one', async () => {
  for (const o of [{}, { empty: true }, { transcribe: () => ({ ok: false, error: 'x' }) },
    { transcribe: () => ({ ok: true, text: '' }) }, { ask: () => ({ ok: false, error: 'y' }) },
    { ask: () => { throw new Error('z'); } }]) {
    const { t } = wire(o);
    await t.run();
    assert.equal(t.isBusy, false, `busy leaked on ${JSON.stringify(Object.keys(o))}`);
  }
});

// ── ⛔ runtime references are re-read, not captured ─────────────────────────

test('⭐ capture stopped mid-turn — the error is surfaced, not written to a dead session', async () => {
  const w = wire({ transcribe: () => ({ ok: true, text: 'hello' }) });
  const original = w.t.run();
  w.setVoice(null);                       // the member stops capture while MAIA transcribes
  await original;
  assert.equal(w.phases().at(-1), 'error',
    'a turn wrote into a session that no longer exists instead of surfacing the loss');
  assert.equal(w.t.isBusy, false);
});

test('⭐ signed out mid-turn — the loss is surfaced rather than swallowed', async () => {
  const w = wire();
  const running = w.t.run();
  w.setConv(null);
  await running;
  assert.equal(w.phases().at(-1), 'error');
  assert.equal(w.t.isBusy, false);
});
