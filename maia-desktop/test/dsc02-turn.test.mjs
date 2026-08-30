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
const { createTurn, TURN_OUTCOME } = require('../src/turn.js');
const { createDesktopConversation } = require('../src/desktop-conversation.js');

/**
 * ⭐ DESKTOP-CONVERSATION-WIRING-01. These tests now drive the REAL authority,
 * not a stub of it. `turn.js` holds no `busy` flag any more: whether a turn may
 * open, whether a result is still current, and whether one is in flight are all
 * the authority's answers, so a fake here would prove nothing about the wiring.
 *
 * `openUtterance()` is what `voice-lifecycle` does before calling `run()` — a
 * VAD boundary the authority accepted. Calling `run()` without it is exactly
 * the caller-did-not-ask case, and it is asserted separately.
 */
function liveAuthority() {
  const a = createDesktopConversation();
  a.dispatch({ type: 'START_VOICE' });
  a.dispatch({ type: 'CAPTURE_OPENED' });
  return a;
}

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
  const authority = o.authority || liveAuthority();
  const t = createTurn({
    voice: () => v,
    conversation: () => c,
    announce: (p) => log.push(p),
    speak: (a) => log.push({ spoke: a }),
    authority,
    authorized: o.authorized || (() => true),
    diagnostic: (event, meta) => log.push({ diagnostic: event, meta }),
    now: () => 1234,
  });
  /** One accepted VAD boundary, then the turn — the real call sequence. */
  const speak = async () => {
    authority.dispatch({ type: 'VAD_SPEECH_STARTED' });
    const opened = authority.dispatch({ type: 'VAD_UTTERANCE_BOUNDARY' });
    // ⛔ EXACTLY WHAT voice-lifecycle DOES: a refused boundary dispatches no
    // turn. A harness that called `run()` anyway would be testing a caller
    // that does not exist, and would hide the refusal it is meant to prove.
    if (!opened.accepted) return TURN_OUTCOME.SKIPPED;
    return t.run();
  };
  /** Finish MAIA's reply, as the renderer's playback report does. */
  const endPlayback = () => authority.dispatch({ type: 'PLAYBACK_ENDED' });
  return { t, log, authority, speak, endPlayback,
           setVoice: (x) => { v = x; }, setConv: (x) => { c = x; },
           phases: () => log.filter((e) => e.phase).map((e) => e.phase) };
}

// ── the whole turn ──────────────────────────────────────────────────────────

test('a complete turn: transcribing → heard → thinking → answered → voice', async () => {
  const { t, speak, log, phases } = wire();
  await speak();
  assert.deepEqual(phases(), ['transcribing', 'heard', 'thinking', 'answered']);
  assert.equal(log.find((e) => e.phase === 'heard').member, 'hello maia', 'the transcript is not trimmed');
  assert.equal(log.find((e) => e.phase === 'answered').maia, 'hello');
  assert.deepEqual(log.at(-1), { spoke: { b64: 'AAA', format: 'mp3' } });
});

test('⭐ words before voice, always — the surface never speaks what it has not shown', async () => {
  const { t, speak, log } = wire();
  await speak();
  const answered = log.findIndex((e) => e.phase === 'answered');
  const spoke = log.findIndex((e) => e.spoke);
  assert.ok(answered >= 0 && spoke > answered, 'audio was emitted before the words — text and voice diverge');
});

test('no audio in the answer — the member is told, and is never both', async () => {
  const { t, speak, log, phases } = wire({ ask: () => ({ ok: true, text: 'hello', audio: null }) });
  await speak();
  assert.deepEqual(phases(), ['transcribing', 'heard', 'thinking', 'answered', 'no-voice']);
  assert.equal(log.filter((e) => e.spoke).length, 0);
});

test('the real sample rate reaches transcription — a wrong one transcribes a chipmunk', async () => {
  const { t, speak, log } = wire({ sampleRate: 16000 });
  await speak();
  assert.equal(log.find((e) => e.transcribe).transcribe.rate, 16000);
});

// ── ⛔ ORDERING 1: nothing is recorded that canonical MAIA did not return ────

test('⭐ an empty transcript records NO epoch final, and never asks MAIA', async () => {
  const { t, speak, log, phases } = wire({ transcribe: () => ({ ok: true, text: '   ' }) });
  await speak();
  assert.deepEqual(phases(), ['transcribing', 'idle']);
  assert.equal(log.filter((e) => 'epochFinal' in e).length, 0,
    'the tail invariant is now protecting material the member never said');
  assert.equal(log.filter((e) => e.ask).length, 0, 'MAIA was asked about silence');
});

test('⭐ a failed transcription records NO epoch final, and never asks MAIA', async () => {
  const { t, speak, log, phases } = wire({ transcribe: () => ({ ok: false, error: 'whisper down' }) });
  await speak();
  assert.deepEqual(phases(), ['transcribing', 'error']);
  assert.equal(log.find((e) => e.phase === 'error').error, 'whisper down');
  assert.equal(log.filter((e) => 'epochFinal' in e).length, 0,
    'a final was recorded for a transcription that never succeeded');
  assert.equal(log.filter((e) => e.ask).length, 0);
});

test('⭐ the final is recorded BEFORE the member is told they were heard', async () => {
  const { t, speak, log } = wire();
  assert.equal(log.findIndex((e) => 'epochFinal' in e), -1, 'sanity: nothing recorded before the run');
  await speak();
  const f = log.findIndex((e) => 'epochFinal' in e);
  const heard = log.findIndex((e) => e.phase === 'heard');
  assert.ok(f >= 0 && heard > f,
    "'heard' was announced before the epoch recorded the final — the tail invariant has nothing to protect");
  assert.equal(log[f].epochFinal, 'hello maia', 'the epoch recorded an untrimmed transcript');
  assert.equal(log[f].id, 'utt-1234');
});

// ── ⛔ ORDERING 2: a cough is not a turn ────────────────────────────────────

// ⛔ HONEST LIMIT of the control below. Setting busy before `take()` and
// releasing it synchronously on an empty take is NOT observable: there is no
// await between, and JS is single-threaded, so continuity's poll can never see
// the transient. That ordering is incidental. What IS semantic — and what this
// test holds — is that a cough must not LEAVE the flag set, because a leaked
// flag defers thread adoption forever. The dangerous mutation fails 2 tests.
test('⭐ silence or a cough never enters the busy state — continuity is not stalled', async () => {
  const { t, speak, log } = wire({ empty: true });
  await speak();
  assert.deepEqual(log, [], 'a cough announced a turn phase');
  assert.equal(t.isBusy, false);
});

test('the guard is silent when there is no voice session or no conversation', async () => {
  const a = wire({ voice: null }); await a.speak();
  assert.deepEqual(a.log, []);
  const b = wire({ conv: null }); await b.speak();
  assert.deepEqual(b.log, [], 'a turn ran without a conversation to have it with');
});

// ── ⛔ ORDERING 3: busy is released on every path ───────────────────────────

test('⭐ one turn at a time — a second dispatch mid-turn does nothing', async () => {
  // A transcribe that blocks until we let it finish, so a second dispatch lands
  // squarely mid-turn.
  let release;
  const gate = new Promise((r) => { release = r; });
  const w = wire({
    transcribe: async () => { await gate; return { ok: true, text: 'hi' }; },
    ask: () => ({ ok: true, text: 'yes', audio: null }),
  });
  const first = w.speak();
  assert.equal(w.t.isBusy, true, 'a turn in flight does not report itself busy — continuity would adopt mid-turn');

  // ⭐ THE SECOND DISPATCH IS NOW REFUSED BY THE AUTHORITY, not by a local
  // flag. `speak()` offers a VAD boundary; the authority refuses it as
  // `input_disarmed`, and the turn never opens — so `run` is never reached.
  await w.speak();
  assert.equal(w.log.filter((e) => e.phase === 'transcribing').length, 1, 'two turns ran at once');
  // Precisely: the opening event is what the authority refuses. Asserting on
  // `lastRefusal` would read the BOUNDARY's refusal, which is a consequence.
  const denied = w.authority.dispatch({ type: 'VAD_SPEECH_STARTED' });
  assert.equal(denied.refusal.reason, 'input_disarmed');

  release();
  await first;
  // No audio in this answer, so the turn completes outright.
  assert.equal(w.t.isBusy, false, 'the turn leaked — every later turn is frozen');
});

test('⭐ RESET-01 §6 — with audio the turn stays open until playback reports ended', async () => {
  // The old contract ended the turn the instant the audio was handed over,
  // which re-armed speech-turn creation while MAIA was still talking. Her voice
  // then came back through the microphone and authored a turn.
  const { t, speak, endPlayback, authority } = wire();
  await speak();
  assert.equal(authority.snapshot().turn.state, 'maia_speaking');
  assert.equal(t.isBusy, true, 'the turn ended while MAIA was still speaking');

  // ⛔ And a VAD boundary during playback opens nothing.
  authority.dispatch({ type: 'VAD_SPEECH_STARTED' });
  assert.equal(authority.snapshot().lastRefusal.reason, 'input_disarmed');

  endPlayback();
  assert.equal(t.isBusy, false, 'playback ended and the member is still disarmed');
  assert.equal(authority.snapshot().capture.state, 'open', 'playback closed the capture');
});

test('⭐ a thrown error is surfaced in words and releases the turn', async () => {
  const { t, speak, log, phases } = wire({ ask: () => { throw new Error('network exploded'); } });
  await speak();
  assert.deepEqual(phases(), ['transcribing', 'heard', 'thinking', 'error']);
  assert.equal(log.at(-1).error, 'network exploded');
  assert.equal(t.isBusy, false, 'a throw leaked the turn — turns AND thread adoption are frozen');
});

test('a failed ask is surfaced, and "answered" is never announced', async () => {
  const { t, speak, log, phases } = wire({ ask: () => ({ ok: false, error: 'maia unreachable' }) });
  await speak();
  assert.deepEqual(phases(), ['transcribing', 'heard', 'thinking', 'error']);
  assert.equal(log.at(-1).error, 'maia unreachable');
  assert.equal(t.isBusy, false);
});

test('the turn is released after every terminal path, not just the happy one', async () => {
  // ⛔ EVERY failure path must return the authority to idle. A terminal event
  // the authority REFUSES is not a terminal event — it leaves the member
  // disarmed behind an error they have already been shown, which is the exact
  // defect `failTurn` exists to close.
  for (const o of [{ empty: true }, { transcribe: () => ({ ok: false, error: 'x' }) },
    { transcribe: () => ({ ok: true, text: '' }) }, { ask: () => ({ ok: false, error: 'y' }) },
    { ask: () => { throw new Error('z'); } },
    { transcribe: () => { throw new Error('t'); } }]) {
    const { t, speak, authority } = wire(o);
    await speak();
    assert.equal(t.isBusy, false, `the turn leaked on ${JSON.stringify(Object.keys(o))}`);
    assert.equal(authority.snapshot().turn.state, 'idle');
    // ⛔ And capture is untouched by any of it — the member may speak again.
    assert.equal(authority.snapshot().capture.state, 'open',
      `a failed turn closed the capture on ${JSON.stringify(Object.keys(o))}`);
  }

  // The happy path with audio is the one exception, and it is not a leak: the
  // turn is genuinely still running until MAIA stops speaking.
  const w = wire();
  await w.speak();
  assert.equal(w.t.isBusy, true);
  w.endPlayback();
  assert.equal(w.t.isBusy, false);
});

// ── ⛔ runtime references are re-read, not captured ─────────────────────────

test('⭐ capture stopped mid-turn — the error is surfaced, not written to a dead session', async () => {
  const w = wire({ transcribe: () => ({ ok: true, text: 'hello' }) });
  const original = w.speak();
  w.setVoice(null);                       // the member stops capture while MAIA transcribes
  await original;
  assert.equal(w.phases().at(-1), 'error',
    'a turn wrote into a session that no longer exists instead of surfacing the loss');
  // ⛔ Released from wherever the authority actually was when it threw.
  assert.equal(w.t.isBusy, false, 'the member was left disarmed behind a surfaced error');
  assert.equal(w.authority.snapshot().turn.state, 'idle');
});

test('the conversation client vanishing while still signed in IS a failure', async () => {
  // ⛔ TURN-REVOCATION-01. Not sign-out. The member is still authorised; the
  // client went away for some other reason, and that is an operational failure
  // which must still be surfaced.
  const w = wire();
  const running = w.speak();
  w.setConv(null);
  await running;
  assert.equal(w.phases().at(-1), 'error');
  assert.equal(w.t.isBusy, false);
});

// ── ⭐ TURN-REVOCATION-01: revocation is not failure ────────────────────────

test('⭐ signed out mid-answer — the turn is CANCELLED, not failed', async () => {
  let signedIn = true;
  const w = wire({ authorized: () => signedIn });
  const running = w.speak();
  signedIn = false;                       // the member signs out while MAIA answers
  const outcome = await running;

  assert.equal(outcome, TURN_OUTCOME.REVOKED, 'a revoked turn reports as something else');
  assert.equal(w.log.filter((e) => e.phase === 'error').length, 0,
    'an operational error was shown to someone who had just signed out');
  assert.equal(w.log.filter((e) => e.phase === 'answered').length, 0,
    'MAIA’s answer was delivered into a session that no longer authorises it');
  assert.equal(w.log.filter((e) => e.spoke).length, 0, 'the answer was spoken aloud after sign-out');
  assert.equal(w.t.isBusy, false, 'the in-flight flag survived revocation — every later turn is frozen');
});

test('⭐ revocation is explicit internally even though it is silent to the member', async () => {
  let signedIn = true;
  const w = wire({ authorized: () => signedIn });
  const running = w.speak();
  signedIn = false;
  await running;
  const d = w.log.find((e) => e.diagnostic);
  assert.equal(d && d.diagnostic, 'session_revoked',
    'a bare return — a future caller cannot tell this from successful completion');
});

test('⭐ the surface is not left mid-thought — revocation ends at idle, not silence', async () => {
  let signedIn = true;
  const w = wire({ authorized: () => signedIn });
  const running = w.speak();
  signedIn = false;
  await running;
  assert.equal(w.phases().at(-1), 'idle',
    'the surface was left showing “thinking…” forever — the silent-success class');
});

test('⭐ revocation detected at the transcribe boundary, before anything is recorded', async () => {
  let signedIn = true;
  const w = wire({ authorized: () => signedIn, transcribe: () => { signedIn = false; return { ok: true, text: 'hello' }; } });
  const outcome = await w.speak();
  assert.equal(outcome, TURN_OUTCOME.REVOKED);
  assert.equal(w.log.filter((e) => 'epochFinal' in e).length, 0,
    'a final was recorded on an epoch the member no longer authorises');
  assert.equal(w.log.filter((e) => e.ask).length, 0, 'MAIA was asked on behalf of a signed-out member');
});

test('⭐ revocation detected at the ASK boundary — after transcription succeeded', async () => {
  // ⛔ The sign-out tests above revoke before the transcribe await resolves, so
  // the transcribe-boundary check catches them and the ask-boundary check is
  // never reached. Revoking from inside `ask` is what exercises it — and it is
  // the likelier real sequence, since asking MAIA is the long wait.
  let signedIn = true;
  const w = wire({ ask: () => { signedIn = false; return { ok: true, text: 'hello', audio: null }; },
    authorized: () => signedIn });
  const outcome = await w.speak();
  assert.equal(outcome, TURN_OUTCOME.REVOKED);
  assert.equal(w.log.filter((e) => e.phase === 'answered').length, 0,
    'MAIA answered into a session that stopped authorising the turn while she was thinking');
  assert.equal(w.log.filter((e) => e.spoke).length, 0);
  assert.equal(w.log.find((e) => e.diagnostic).meta.at, 'ask');
});

test('⭐ a throw caused BY the session going away is revocation, not failure', async () => {
  let signedIn = true;
  const w = wire({ authorized: () => signedIn, ask: () => { signedIn = false; throw new Error('socket closed'); } });
  const outcome = await w.speak();
  assert.equal(outcome, TURN_OUTCOME.REVOKED);
  assert.equal(w.log.filter((e) => e.phase === 'error').length, 0,
    'a teardown-caused throw was reported to the member as an operational error');
});

test('a genuine failure while still signed in is still a failure', async () => {
  const w = wire({ ask: () => ({ ok: false, error: 'maia unreachable' }) });
  const outcome = await w.speak();
  assert.equal(outcome, TURN_OUTCOME.FAILED, 'a real failure was misclassified as revocation');
  assert.equal(w.log.at(-1).error, 'maia unreachable');
});

test('outcomes are named for every terminal path', async () => {
  assert.equal(await wire().speak(), TURN_OUTCOME.COMPLETED);
  assert.equal(await wire({ empty: true }).speak(), TURN_OUTCOME.SKIPPED);
  assert.equal(await wire({ transcribe: () => ({ ok: true, text: '  ' }) }).speak(), TURN_OUTCOME.IDLE);
  assert.equal(await wire({ transcribe: () => ({ ok: false, error: 'x' }) }).speak(), TURN_OUTCOME.FAILED);
  assert.equal(await wire({ voice: null }).speak(), TURN_OUTCOME.SKIPPED);
});
