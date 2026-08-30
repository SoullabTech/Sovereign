// MAIA-DESKTOP-CONVERSATION-RESET-01 — the conversational authority.
//
// The ruling (905fe3408) refuses component-level evidence as evidence that
// Desktop conversation works: "A transcript can wrap correctly, a scrollbar can
// behave correctly, VAD can emit the expected event — and the conversation can
// still be unusable."
//
// So the load-bearing test in this file is not a transition table. It is the
// GRAMMAR PROOF: one START, ten consecutive spoken turns with no gesture
// between them, then a text turn, then a spoken turn again. That is RESET-01's
// acceptance witness steps 3–16 expressed at the layer that can be proven
// without a device.
//
// ⛔ WHAT THIS FILE DOES NOT PROVE. It does not prove Desktop works. The
// acceptance witness is behavioural and needs a real member speaking to a real
// transcriber, and the sovereign STT on 127.0.0.1:8000 is absent from the
// founder Mac (RESET-01, "Blocker, stated plainly"). Green here means the
// grammar is sound. It does not mean the conversation happens.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  createDesktopConversation, CAPTURE_STATES, TURN_STATES,
} = require('../src/desktop-conversation.js');

/** Dispatch and require acceptance — a refused step must fail loudly, named. */
function ok(c, event) {
  const out = c.dispatch(event);
  assert.equal(out.accepted, true,
    `${event.type} was refused: ${out.refusal && out.refusal.reason}`);
  return out.snapshot;
}

/** Dispatch and require refusal for a specific reason. */
function no(c, event, reason) {
  const before = c.snapshot();
  const out = c.dispatch(event);
  assert.equal(out.accepted, false, `${event && event.type} should have been refused`);
  assert.equal(out.refusal.reason, reason);
  return { before, after: out.snapshot };
}

/** An open capture session, which is where every conversational test starts. */
function listening(init) {
  const c = createDesktopConversation(init);
  ok(c, { type: 'START_VOICE' });
  ok(c, { type: 'CAPTURE_OPENED' });
  assert.equal(c.snapshot().capture.state, 'open');
  return c;
}

/** One complete spoken turn, MAIA answering with voice. */
function spokenTurn(c, said, answered) {
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'SPEECH_DRAFT', text: said.slice(0, 4) });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: said });
  ok(c, { type: 'MAIA_ANSWER', text: answered, hasAudio: true });
  return ok(c, { type: 'PLAYBACK_ENDED' });
}

// ── the grammar proof ───────────────────────────────────────────────────────

test('GRAMMAR: one START, ten spoken turns, a text turn, then speech again', () => {
  const c = listening();
  const gen = c.snapshot().generation;

  for (let i = 1; i <= 10; i++) {
    const snap = spokenTurn(c, `member turn ${i}`, `maia turn ${i}`);

    // ⭐ THE WHOLE POINT. After a completed turn the member speaks again with
    // NO gesture: capture never left `open`, the turn is back at idle, and
    // input is armed. No second press, no session recreation (§3).
    assert.equal(snap.capture.state, 'open', `turn ${i}: capture left open`);
    assert.equal(snap.turn.state, 'idle', `turn ${i}: turn did not return to idle`);
    assert.equal(snap.inputArmed, true, `turn ${i}: input not re-armed`);
    assert.equal(snap.generation, gen, `turn ${i}: conversation generation changed`);
    assert.equal(snap.draft, null, `turn ${i}: a draft survived the turn`);
  }

  let snap = c.snapshot();
  assert.equal(snap.history.length, 20, 'ten turns = ten member + ten MAIA commits');
  assert.deepEqual(snap.history[0], { role: 'member', text: 'member turn 1', turnId: 1 });
  assert.deepEqual(snap.history[19], { role: 'maia', text: 'maia turn 10', turnId: 10 });

  // §7 — one composer. A text turn is the SAME grammar, not a mode.
  ok(c, { type: 'SEND_TEXT', text: 'typed instead' });
  assert.equal(c.snapshot().turn.state, 'waiting_for_maia');
  assert.equal(c.snapshot().turn.source, 'text');
  assert.equal(c.snapshot().capture.state, 'open', 'text must not close capture');
  ok(c, { type: 'MAIA_ANSWER', text: 'answer to typed', hasAudio: true });
  ok(c, { type: 'PLAYBACK_ENDED' });

  // …and speech again, without reconstructing the session (witness step 16).
  snap = spokenTurn(c, 'spoken again after typing', 'and answered');
  assert.equal(snap.capture.state, 'open');
  assert.equal(snap.turn.state, 'idle');
  assert.equal(snap.history.length, 24);
  assert.equal(snap.generation, gen, 'the whole walk is ONE conversation generation');
});

test('capture never leaves `open` across the ten turns — no VAD event touches it', () => {
  const c = listening();
  const seen = new Set();
  for (let i = 0; i < 10; i++) {
    ok(c, { type: 'VAD_SPEECH_STARTED' });
    seen.add(c.snapshot().capture.state);
    ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });     // ⛔ ends the utterance only
    seen.add(c.snapshot().capture.state);
    ok(c, { type: 'TRANSCRIPTION_FINAL', text: `t${i}` });
    seen.add(c.snapshot().capture.state);
    ok(c, { type: 'MAIA_ANSWER', text: `a${i}`, hasAudio: true });
    seen.add(c.snapshot().capture.state);
    ok(c, { type: 'PLAYBACK_ENDED' });
    seen.add(c.snapshot().capture.state);
  }
  assert.deepEqual([...seen], ['open'], 'the capture axis moved during a turn');
});

test('the axes are independent: MAIA answering survives the microphone dying', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'the words already left the mic' });
  assert.equal(c.snapshot().turn.state, 'waiting_for_maia');

  // The mic dies while the request is in flight.
  ok(c, { type: 'CAPTURE_LOST', cause: 'track_ended' });
  let snap = c.snapshot();
  assert.equal(snap.capture.state, 'recovering');
  assert.equal(snap.turn.state, 'waiting_for_maia', 'a dead mic cancelled MAIA');

  ok(c, { type: 'MAIA_ANSWER', text: 'answered anyway', hasAudio: true });
  ok(c, { type: 'PLAYBACK_ENDED' });
  snap = c.snapshot();
  assert.equal(snap.turn.state, 'idle');
  assert.equal(snap.capture.state, 'recovering', 'the turn healed the capture axis');
  assert.equal(snap.history.length, 2);

  // And recovery re-arms the member without a new conversation.
  const gen = snap.generation;
  ok(c, { type: 'CAPTURE_OPENED' });
  assert.equal(c.snapshot().capture.state, 'open');
  assert.equal(c.snapshot().generation, gen, 'recovery must not fork the conversation');
});

test('STOP_VOICE touches the capture axis only — it is not "stop MAIA"', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'said' });
  ok(c, { type: 'MAIA_ANSWER', text: 'speaking', hasAudio: true });

  ok(c, { type: 'STOP_VOICE' });
  const snap = c.snapshot();
  assert.equal(snap.capture.state, 'closed');
  assert.equal(snap.turn.state, 'maia_speaking', 'stopping the mic silenced MAIA');
  ok(c, { type: 'PLAYBACK_ENDED' });
  assert.equal(c.snapshot().turn.state, 'idle');
});

// ── the ephemeral draft is not history (§4) ─────────────────────────────────

test('the draft never becomes history, and the final never merges with it', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'SPEECH_DRAFT', text: 'I was going to' });
  ok(c, { type: 'SPEECH_DRAFT', text: 'I was going to say some' });
  assert.equal(c.snapshot().draft, 'I was going to say some');
  assert.equal(c.snapshot().history.length, 0, 'a draft entered history');

  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'I was going to say something else' });
  const snap = c.snapshot();
  assert.equal(snap.draft, null, 'the draft outlived its utterance');
  assert.equal(snap.history.length, 1);
  assert.equal(snap.history[0].text, 'I was going to say something else');
});

test('a turn ending for any reason takes the draft with it', () => {
  for (const ending of [
    { type: 'TRANSCRIPTION_EMPTY' },
    { type: 'TRANSCRIPTION_FAILED', reason: 'http_500' },
  ]) {
    const c = listening();
    ok(c, { type: 'VAD_SPEECH_STARTED' });
    ok(c, { type: 'SPEECH_DRAFT', text: 'half a thought' });
    ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
    ok(c, { type: ending.type, reason: ending.reason });
    const snap = c.snapshot();
    assert.equal(snap.draft, null, `${ending.type} left a draft behind`);
    assert.equal(snap.history.length, 0, `${ending.type} committed something`);
    // ⛔ Never silent: the turn ended for a reason the surface can name.
    assert.equal(snap.lastTurnEnd.draftChars, 14);
    assert.equal(snap.turn.state, 'idle');
    assert.equal(snap.capture.state, 'open', 'a failed turn closed the capture');
  }
});

// ── required negative cases ─────────────────────────────────────────────────

test('NEGATIVE: duplicate final', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'said once' });
  const { after } = no(c, { type: 'TRANSCRIPTION_FINAL', text: 'said once' }, 'no_turn_finalizing');
  assert.equal(after.history.length, 1, 'the duplicate final was committed twice');
  assert.equal(after.turn.state, 'waiting_for_maia');
});

test('NEGATIVE: late transcription after cancellation', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  const cancelledTurn = c.snapshot().turn.id;
  ok(c, { type: 'CANCEL' });
  assert.equal(c.snapshot().turn.state, 'idle');

  // The transcriber answers a turn nobody is in any more.
  const { after } = no(c,
    { type: 'TRANSCRIPTION_FINAL', text: 'too late', turnId: cancelledTurn }, 'stale_turn');
  assert.equal(after.history.length, 0, 'a cancelled turn was committed');

  // ⛔ And it must not leak into the NEXT utterance either.
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'the real next thing' });
  const snap = c.snapshot();
  assert.equal(snap.history.length, 1);
  assert.equal(snap.history[0].text, 'the real next thing');
});

test('NEGATIVE: a late partial cannot overwrite a final or bleed forward', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'SPEECH_DRAFT', text: 'partial' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  // Arriving after the boundary — the utterance is closed.
  no(c, { type: 'SPEECH_DRAFT', text: 'late partial' }, 'no_open_utterance');
  // §4 rules the draft away on the FINAL, not on the boundary — so what must
  // hold here is that the late partial did not OVERWRITE what is on screen.
  assert.equal(c.snapshot().draft, 'partial', 'a late partial overwrote the draft');

  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'the final' });
  no(c, { type: 'SPEECH_DRAFT', text: 'later still' }, 'no_open_utterance');
  assert.equal(c.snapshot().history[0].text, 'the final');
  assert.equal(c.snapshot().draft, null);
});

test('NEGATIVE: playback-ended twice', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'said' });
  ok(c, { type: 'MAIA_ANSWER', text: 'answered', hasAudio: true });
  ok(c, { type: 'PLAYBACK_ENDED' });
  const first = c.snapshot();

  const { after } = no(c, { type: 'PLAYBACK_ENDED' }, 'not_speaking');
  assert.equal(after.turn.state, 'idle');
  assert.equal(after.turn.id, first.turn.id, 'the second ending disturbed the turn');
  assert.equal(after.history.length, 2, 'the second ending changed history');
  assert.equal(after.capture.state, 'open');
});

test('NEGATIVE: VAD during MAIA playback — refused, capture untouched', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'said' });
  ok(c, { type: 'MAIA_ANSWER', text: 'MAIA speaking now', hasAudio: true });

  // §6 — the capture graph stays alive; turn input is disarmed. MAIA's own
  // voice reaching the microphone must not author a turn.
  const { after } = no(c, { type: 'VAD_SPEECH_STARTED' }, 'input_disarmed');
  assert.equal(after.capture.state, 'open', 'disarming closed the capture');
  assert.equal(after.turn.state, 'maia_speaking');
  assert.equal(after.inputArmed, false);
  no(c, { type: 'SPEECH_DRAFT', text: 'her own words' }, 'no_open_utterance');
  no(c, { type: 'VAD_UTTERANCE_BOUNDARY' }, 'no_open_utterance');
  assert.equal(c.snapshot().history.length, 2, 'MAIA answered herself');

  // On `ended`, input re-arms — that is the whole handoff.
  ok(c, { type: 'PLAYBACK_ENDED' });
  assert.equal(c.snapshot().inputArmed, true);
  ok(c, { type: 'VAD_SPEECH_STARTED' });
});

test('NEGATIVE: attempted thread change during an active conversation', () => {
  const c = listening({ threadId: 'thread-A' });
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'mid conversation' });

  // Detection is allowed. Acting on it is not (§5).
  ok(c, { type: 'THREAD_MOVED', threadId: 'thread-B' });
  let snap = c.snapshot();
  assert.equal(snap.threadId, 'thread-A', 'the room was replaced underneath the member');
  assert.equal(snap.threadPinned, true);
  assert.deepEqual(snap.threadDrift, { observedId: 'thread-B', pinned: true });
  assert.equal(snap.history.length, 1, 'history was redrawn mid-conversation');

  const { after } = no(c, { type: 'THREAD_ADOPTED', threadId: 'thread-B' }, 'thread_pinned');
  assert.equal(after.threadId, 'thread-A');
  assert.equal(after.history.length, 1);
});

test('a thread rebind is allowed once the conversation is at rest', () => {
  const c = listening({ threadId: 'thread-A' });
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'said' });
  ok(c, { type: 'MAIA_ANSWER', text: 'answered', hasAudio: false });
  no(c, { type: 'THREAD_ADOPTED', threadId: 'thread-B' }, 'thread_pinned'); // capture still open
  ok(c, { type: 'STOP_VOICE' });

  const gen = c.snapshot().generation;
  ok(c, { type: 'THREAD_ADOPTED', threadId: 'thread-B' });
  const snap = c.snapshot();
  assert.equal(snap.threadId, 'thread-B');
  assert.equal(snap.history.length, 0, 'the old thread bled into the new one');
  assert.equal(snap.generation, gen + 1, 'a rebind must start a new generation');
  assert.equal(snap.threadDrift, null);
});

test('NEGATIVE: capture loss mid-turn ends only a mic-sourced turn, and names why', () => {
  // Lost while HEARING: no final is coming, so the turn ends — accounted.
  const a = listening();
  ok(a, { type: 'VAD_SPEECH_STARTED' });
  ok(a, { type: 'SPEECH_DRAFT', text: 'mid sentence' });
  ok(a, { type: 'CAPTURE_LOST', cause: 'track_muted' });
  let snap = a.snapshot();
  assert.equal(snap.capture.state, 'recovering');
  assert.equal(snap.capture.cause, 'track_muted');
  assert.equal(snap.turn.state, 'idle');
  assert.equal(snap.draft, null);
  assert.equal(snap.lastTurnEnd.reason, 'capture_lost');
  assert.equal(snap.lastTurnEnd.draftChars, 12, 'the lost draft was not accounted for');
  assert.equal(snap.history.length, 0);

  // Lost while FINALIZING: the same, and the late final is then refused.
  const b = listening();
  ok(b, { type: 'VAD_SPEECH_STARTED' });
  ok(b, { type: 'VAD_UTTERANCE_BOUNDARY' });
  const lost = b.snapshot().turn.id;
  ok(b, { type: 'CAPTURE_LOST', cause: 'track_ended' });
  assert.equal(b.snapshot().turn.state, 'idle');
  no(b, { type: 'TRANSCRIPTION_FINAL', text: 'orphan', turnId: lost }, 'stale_turn');
  assert.equal(b.snapshot().history.length, 0);
});

test('NEGATIVE: a stale event from a prior conversation generation is inert', () => {
  const c = listening();
  const first = c.snapshot().generation;
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'from the old session' });
  ok(c, { type: 'STOP_VOICE' });

  // A new conversation session begins.
  ok(c, { type: 'START_VOICE' });
  ok(c, { type: 'CAPTURE_OPENED' });
  const second = c.snapshot().generation;
  assert.equal(second, first + 1);

  // Everything still in flight from generation 1 is refused, whatever it is.
  for (const e of [
    { type: 'MAIA_ANSWER', text: 'answer to the old turn', hasAudio: true, generation: first },
    { type: 'TRANSCRIPTION_FINAL', text: 'old words', generation: first },
    { type: 'PLAYBACK_ENDED', generation: first },
    { type: 'SPEECH_DRAFT', text: 'old partial', generation: first },
    { type: 'CAPTURE_LOST', cause: 'old', generation: first },
  ]) {
    no(c, e, 'stale_generation');
  }

  const snap = c.snapshot();
  assert.equal(snap.turn.state, 'idle', 'a stale event moved the live turn');
  assert.equal(snap.capture.state, 'open', 'a stale event moved the live capture');
  assert.equal(snap.history.length, 1, 'a stale event wrote to the live history');
  assert.equal(snap.draft, null);

  // …and the live conversation still works.
  spokenTurn(c, 'a new thing', 'a new answer');
  assert.equal(c.snapshot().history.length, 3);
});

// ── refusal discipline and snapshot contract ────────────────────────────────

test('every refusal is counted and named — none is silent', () => {
  const c = createDesktopConversation();
  assert.equal(c.snapshot().refusals, 0);
  assert.equal(c.snapshot().lastRefusal, null);

  no(c, { type: 'VAD_SPEECH_STARTED' }, 'capture_not_open');
  assert.equal(c.snapshot().refusals, 1);
  assert.deepEqual(c.snapshot().lastRefusal,
    { event: 'VAD_SPEECH_STARTED', reason: 'capture_not_open', detail: 'closed' });

  no(c, { type: 'NOT_A_THING' }, 'unknown_event');
  no(c, null, 'malformed_event');
  no(c, { type: 'CANCEL' }, 'no_turn_to_cancel');
  no(c, { type: 'STOP_VOICE' }, 'capture_not_open');
  no(c, { type: 'SEND_TEXT', text: '   ' }, 'empty_text');
  assert.equal(c.snapshot().refusals, 6);
});

test('a refused transition never throws and never mutates the conversation', () => {
  const c = listening();
  spokenTurn(c, 'one real turn', 'one real answer');
  const before = c.snapshot();

  for (const e of [
    { type: 'CAPTURE_OPENED' }, { type: 'CAPTURE_FAILED' }, { type: 'PLAYBACK_ENDED' },
    { type: 'PLAYBACK_FAILED' }, { type: 'MAIA_ANSWER', text: 'x' }, { type: 'MAIA_FAILED' },
    { type: 'TRANSCRIPTION_EMPTY' }, { type: 'TRANSCRIPTION_FAILED' },
    { type: 'VAD_UTTERANCE_BOUNDARY' }, { type: 'SPEECH_DRAFT', text: 'x' },
    { type: 'CANCEL' }, { type: 'START_VOICE' }, { type: 'THREAD_ADOPTED', threadId: 'z' },
  ]) {
    const out = c.dispatch(e);
    assert.equal(out.accepted, false, `${e.type} should be refused here`);
  }

  const after = c.snapshot();
  assert.equal(after.capture.state, before.capture.state);
  assert.equal(after.turn.state, before.turn.state);
  assert.equal(after.turn.id, before.turn.id);
  assert.equal(after.generation, before.generation);
  assert.equal(after.threadId, before.threadId);
  assert.deepEqual(after.history, before.history);
});

test('snapshots are immutable, and a held snapshot does not change underneath', () => {
  const c = listening();
  const held = spokenTurn(c, 'first', 'answer');
  assert.ok(Object.isFrozen(held));
  assert.ok(Object.isFrozen(held.capture));
  assert.ok(Object.isFrozen(held.turn));
  assert.ok(Object.isFrozen(held.history));
  assert.ok(held.history.every((t) => Object.isFrozen(t)));
  assert.throws(() => { 'use strict'; held.history.push({ role: 'maia', text: 'forged' }); });

  spokenTurn(c, 'second', 'answer');
  assert.equal(held.history.length, 2, 'a held snapshot mutated');
  assert.equal(c.snapshot().history.length, 4);
  assert.notEqual(c.snapshot(), held, 'the snapshot identity did not advance');
});

test('the axes are exactly the ruled vocabularies', () => {
  assert.deepEqual(CAPTURE_STATES, ['closed', 'opening', 'open', 'recovering', 'failed']);
  assert.deepEqual(TURN_STATES,
    ['idle', 'hearing', 'finalizing', 'waiting_for_maia', 'maia_speaking']);
});

test('the authority is pure — no Electron, DOM, fetch, timers, audio, or fs', () => {
  const src = require('node:fs').readFileSync(
    new URL('../src/desktop-conversation.js', import.meta.url), 'utf8');
  // Comments name the prohibitions, so judge code only.
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const forbidden of [
    /\brequire\s*\(/, /\bimport\s/, /\belectron\b/i, /\bdocument\b/, /\bwindow\b/,
    /\bfetch\s*\(/, /setTimeout|setInterval/, /\bDate\s*\./, /AudioContext|MediaStream/,
    /\bfs\b|readFile|writeFile/, /\bprocess\./, /\bMath\.random/,
  ]) {
    assert.equal(forbidden.test(code), false, `authority reaches for ${forbidden}`);
  }
});

test('SEND_TEXT is refused while a turn is open, and CANCEL is the way back', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  no(c, { type: 'SEND_TEXT', text: 'typed over speech' }, 'turn_busy');
  assert.equal(c.snapshot().history.length, 0);

  ok(c, { type: 'CANCEL' });
  ok(c, { type: 'SEND_TEXT', text: 'now typed' });
  assert.equal(c.snapshot().history[0].text, 'now typed');
  assert.equal(c.snapshot().capture.state, 'open', 'cancelling closed the capture');
});

test('MAIA answering without a voice completes the turn rather than waiting on silence', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'said' });
  ok(c, { type: 'MAIA_ANSWER', text: 'text only', hasAudio: false });
  const snap = c.snapshot();
  assert.equal(snap.turn.state, 'idle');
  assert.equal(snap.lastTurnEnd.reason, 'answered_without_voice');
  assert.equal(snap.history.length, 2);
  assert.equal(snap.capture.state, 'open');
  ok(c, { type: 'VAD_SPEECH_STARTED' });          // listening again immediately
});

test('a failed playback costs the sound, never the committed turn', () => {
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'said' });
  ok(c, { type: 'MAIA_ANSWER', text: 'her words', hasAudio: true });
  ok(c, { type: 'PLAYBACK_FAILED', reason: 'blocked' });
  const snap = c.snapshot();
  assert.equal(snap.turn.state, 'idle');
  assert.equal(snap.history.length, 2);
  assert.equal(snap.history[1].text, 'her words');
  assert.equal(snap.lastTurnEnd.cause, 'blocked');
});

test('a capture that never opens is failed, restartable, and forks nothing', () => {
  const c = createDesktopConversation();
  ok(c, { type: 'START_VOICE' });
  ok(c, { type: 'CAPTURE_FAILED', cause: 'permission_denied' });
  let snap = c.snapshot();
  assert.equal(snap.capture.state, 'failed');
  assert.equal(snap.capture.cause, 'permission_denied');
  assert.equal(snap.turn.state, 'idle');
  no(c, { type: 'VAD_SPEECH_STARTED' }, 'capture_not_open');

  const gen = snap.generation;
  ok(c, { type: 'START_VOICE' });                 // retry is allowed from failed
  ok(c, { type: 'CAPTURE_OPENED' });
  snap = c.snapshot();
  assert.equal(snap.capture.state, 'open');
  assert.equal(snap.generation, gen + 1);
  spokenTurn(c, 'finally', 'heard');
  assert.equal(c.snapshot().history.length, 2);
});

test('a new generation inherits no turn — the member is never re-armed by nothing', () => {
  // Found by the stale-generation case: STOP_VOICE leaves a turn in flight to
  // MAIA (correctly — stopping the mic is not stopping MAIA), and START_VOICE
  // used to open the next session already sitting in it. The member would have
  // been disarmed with no event left that could ever re-arm them.
  const c = listening();
  ok(c, { type: 'VAD_SPEECH_STARTED' });
  ok(c, { type: 'VAD_UTTERANCE_BOUNDARY' });
  ok(c, { type: 'TRANSCRIPTION_FINAL', text: 'said' });
  ok(c, { type: 'MAIA_ANSWER', text: 'speaking', hasAudio: true });
  ok(c, { type: 'STOP_VOICE' });
  assert.equal(c.snapshot().turn.state, 'maia_speaking');

  ok(c, { type: 'START_VOICE' });
  const snap = c.snapshot();
  assert.equal(snap.turn.state, 'idle', 'the new session inherited the old turn');
  assert.equal(snap.turn.id, 0, 'an ended turn is still addressable');
  assert.equal(snap.lastTurnEnd.reason, 'generation_changed');

  ok(c, { type: 'CAPTURE_OPENED' });
  spokenTurn(c, 'a fresh turn', 'a fresh answer');
  assert.equal(c.snapshot().turn.state, 'idle');
  assert.equal(c.snapshot().history.length, 4);
});
