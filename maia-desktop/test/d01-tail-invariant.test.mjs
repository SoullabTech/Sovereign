// MAIA-D01 — the tail invariant, proven exhaustively.
//
//   No capture/transcription epoch may end with nonempty human speech state
//   that is silently discarded.
//
// These are the assertions that make the native seam worth building. They run on
// Linux because the module under test is pure — the microphone is witnessed
// separately, on macOS.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createEpochState, EPOCH_END_REASONS } = require('../src/voice/epoch.js');
const { createDiagnostics } = require('../src/voice/diagnostics.js');

function harness({ onSalvage } = {}) {
  const events = [];
  const diagnostics = createDiagnostics((e, r) => events.push(r), { now: () => events.length });
  const epoch = createEpochState({ diagnostics, onSalvage });
  const names = () => events.map((e) => e.event);
  return { epoch, events, names };
}

// ── The invariant itself, across EVERY boundary that can close an epoch ─────
const BOUNDARIES = [
  ['user stop', (e) => e.userStop()],
  ['restart', (e) => e.restart()],
  ['capture lost', (e) => e.captureLost('track_ended')],
  ['transcription failure', (e) => e.endEpoch(EPOCH_END_REASONS.TRANSCRIPTION_FAILED)],
  ['device change', (e) => e.endEpoch(EPOCH_END_REASONS.DEVICE_CHANGED)],
];

for (const [label, close] of BOUNDARIES) {
  test(`tail invariant — ${label} never silently discards pending speech`, () => {
    const { epoch, names } = harness();
    epoch.startEpoch();
    epoch.partial('and then the door in the dream was already open');
    close(epoch);
    const n = names();
    assert.ok(
      n.includes('voice_transcript_salvaged') || n.includes('voice_tail_lost'),
      `${label} closed with pending speech and emitted neither salvage nor loss`
    );
    assert.equal(epoch.snapshot().openPartialChars, 0);
  });

  test(`tail invariant — ${label} reports LOSS when salvage is refused`, () => {
    const { epoch, names } = harness({ onSalvage: () => false });
    epoch.startEpoch();
    epoch.partial('the part I never say out loud');
    close(epoch);
    assert.ok(names().includes('voice_tail_lost'), `${label} lost material without saying so`);
    assert.equal(epoch.snapshot().lost.length, 1);
  });

  test(`tail invariant — ${label} emits NEITHER event when nothing was pending`, () => {
    const { epoch, names } = harness();
    epoch.startEpoch();
    close(epoch);
    const n = names();
    assert.ok(!n.includes('voice_transcript_salvaged'), 'claimed a salvage that did not happen');
    assert.ok(!n.includes('voice_tail_lost'), 'claimed a loss that did not happen');
  });
}

test('salvaged material reaches the host and is reported by size only', () => {
  const got = [];
  const { epoch, events } = harness({ onSalvage: (t, i) => { got.push({ t, i }); return true; } });
  epoch.startEpoch();
  epoch.partial('a sentence I had not finished');
  epoch.userStop();
  assert.equal(got.length, 1);
  assert.equal(got[0].t, 'a sentence I had not finished');
  const sal = events.find((e) => e.event === 'voice_transcript_salvaged');
  assert.equal(sal.chars, 29);
  assert.ok(!JSON.stringify(sal).includes('sentence'), 'transcript text leaked into telemetry');
});

// ── finals: dedupe, survival, and not smuggling partials into the turn ──────

test('a final supersedes the open partial without claiming a salvage', () => {
  const { epoch, names } = harness();
  epoch.startEpoch();
  epoch.partial('the door in the');
  epoch.final('the door in the dream was open', 'seg-1');
  assert.ok(!names().includes('voice_transcript_salvaged'), 'committing is not salvaging');
  assert.equal(epoch.snapshot().openPartialChars, 0);
  assert.deepEqual(epoch.snapshot().finals, ['the door in the dream was open']);
});

test('duplicate finals do not accumulate', () => {
  const { epoch } = harness();
  epoch.startEpoch();
  assert.deepEqual(epoch.final('one', 'seg-1'), { accepted: true, duplicate: false });
  assert.deepEqual(epoch.final('one', 'seg-1'), { accepted: false, duplicate: true });
  assert.deepEqual(epoch.final('one', 'seg-1'), { accepted: false, duplicate: true });
  assert.deepEqual(epoch.snapshot().finals, ['one']);
});

test('a duplicate final still accounts for pending material', () => {
  const { epoch, names } = harness();
  epoch.startEpoch();
  epoch.final('one', 'seg-1');
  epoch.partial('two, still being said');
  epoch.final('one', 'seg-1');           // backend replays its buffer
  assert.ok(
    names().includes('voice_transcript_salvaged') || names().includes('voice_tail_lost'),
    'a duplicate final became a hole for pending speech to escape through'
  );
});

test('restart preserves accumulated finals across the boundary', () => {
  const { epoch } = harness();
  epoch.startEpoch();
  epoch.final('first thing', 'a');
  epoch.final('second thing', 'b');
  epoch.restart(EPOCH_END_REASONS.TRANSCRIPTION_FAILED);
  epoch.final('third thing', 'c');
  assert.deepEqual(epoch.snapshot().finals, ['first thing', 'second thing', 'third thing']);
  assert.equal(epoch.snapshot().epochId, 2);
});

test('commit carries only committed finals — an open partial never masquerades as final', () => {
  const { epoch } = harness();
  epoch.startEpoch();
  epoch.final('what I meant to say', 'a');
  epoch.partial('and the half thought at the end');
  const text = epoch.commit();
  assert.equal(text, 'what I meant to say');
  assert.equal(epoch.snapshot().salvaged.length, 1, 'the half thought must be salvaged, not dropped');
});

test('a trailing result after commit is observed, never inferred', () => {
  const { epoch, names } = harness();
  epoch.startEpoch();
  epoch.final('done', 'a');
  epoch.commit();
  epoch.resultAfterCommit('one more clause');
  assert.ok(names().includes('voice_result_after_commit'));
});

// ── session isolation ───────────────────────────────────────────────────────

test('reset clears every session-scoped field — nothing crosses into the next sitting', () => {
  const { epoch } = harness();
  epoch.startEpoch();
  epoch.final('private thing', 'a');
  epoch.partial('another private thing');
  epoch.reset();
  const s = epoch.snapshot();
  assert.deepEqual(s.finals, []);
  assert.equal(s.openPartialChars, 0);
  assert.equal(s.epochId, 0);
  assert.deepEqual(s.salvaged, []);
  assert.deepEqual(s.lost, []);
  epoch.startEpoch();
  assert.equal(epoch.commit(), '', 'material crossed a session boundary');
});

test('reset mid-epoch still accounts for pending material', () => {
  const { epoch, names } = harness();
  epoch.startEpoch();
  epoch.partial('unfinished at reset');
  epoch.reset();
  assert.ok(names().includes('voice_transcript_salvaged') || names().includes('voice_tail_lost'));
});

// ── ordering ────────────────────────────────────────────────────────────────

test('the full witness ordering is emitted for one natural turn', () => {
  const { epoch, names } = harness();
  epoch.micGranted();
  epoch.startEpoch();
  epoch.audioStarted();
  epoch.speechStarted();
  epoch.partial('I keep coming back to');
  epoch.final('I keep coming back to the same week in March', 'a');
  epoch.userStop();
  epoch.commit();
  const n = names();
  const order = ['voice_mic_granted', 'voice_listening_started', 'voice_audio_started',
    'voice_speech_started', 'voice_result_interim', 'voice_result_final',
    'voice_recognition_ended', 'voice_turn_committed'];
  let at = -1;
  for (const e of order) {
    const i = n.indexOf(e);
    assert.ok(i > at, `${e} out of order or missing in ${n.join(' > ')}`);
    at = i;
  }
});

test('audio_started and speech_started fire once per epoch, not per frame', () => {
  const { epoch, names } = harness();
  epoch.startEpoch();
  for (let i = 0; i < 50; i++) { epoch.audioStarted(); epoch.speechStarted(); }
  assert.equal(names().filter((e) => e === 'voice_audio_started').length, 1);
  assert.equal(names().filter((e) => e === 'voice_speech_started').length, 1);
});
