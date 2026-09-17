// DESKTOP-CONVERSATION-WIRING-01 — the organs, behind the authority.
//
// ⛔ NOT REDUCER-ONLY. `desktop-conversation.test.mjs` proves the grammar of the
// pure authority. These assertions prove the WIRING: the real `voice-lifecycle`
// pushing real frames through a real VAD into a real `DesktopConversation`, and
// the real `turn` transcribing and asking against it. If the grammar is sound
// and the wiring is wrong, that file stays green and this one goes red — which
// is the whole reason it exists.
//
// The reset refuses component-level evidence as evidence that Desktop
// conversation works. This is not the acceptance witness either: that is
// behavioural, needs a member speaking, and needs reachable sovereign STT and
// TTS behind whatever transport the witness uses. What is proven here is that
// the organs no longer decide, and that ten turns hold together through them.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createDesktopConversation } = require('../src/desktop-conversation.js');
const { createVoiceLifecycle } = require('../src/voice-lifecycle.js');
const { createTurn } = require('../src/turn.js');
const { createVad } = require('../src/voice/vad.js');
const { createUtteranceBuffer } = require('../src/voice/utterance.js');
const { createEpochState } = require('../src/voice/epoch.js');
const { createCaptureLiveness } = require('../src/capture-liveness.js');
const { createMemberDraft } = require('../src/voice/member-draft.js');
const { createThreadWatch } = require('../src/thread-watch.js');

const RATE = 48000;
const FRAME_MS = 20;
const SAMPLES = Math.round(RATE * (FRAME_MS / 1000));

/** Voiced PCM loud enough for the real VAD to call it speech. */
function voiced(n = SAMPLES) {
  const f = new Float32Array(n);
  for (let i = 0; i < n; i++) f[i] = Math.sin(i / 6) * 0.5;
  return f;
}
const quiet = (n = SAMPLES) => new Float32Array(n);

/**
 * The real composition, with only the two things a unit test cannot have:
 * the network (the conversation client) and the output device (playback).
 *
 * ⛔ Everything between them is the production article — the same VAD, the same
 * utterance buffer, the same epoch, the same liveness, the same lifecycle, the
 * same turn, and the same authority.
 */
function desktop(o = {}) {
  const log = [];
  const authority = createDesktopConversation();
  let clock = 0;

  const diagnostics = { emit: (e, m) => log.push({ event: e, ...m }) };
  const draft = createMemberDraft();
  const voice = {
    frames: 0,
    sampleRate: RATE,
    diagnostics,
    draft,
    epoch: createEpochState({ diagnostics, onSalvage: draft.accept }),
    vad: createVad(),
    utterance: createUtteranceBuffer(),
    liveness: createCaptureLiveness({ now: () => clock }),
  };
  let live = voice;

  const conversation = {
    transcribe: async (samples) => {
      log.push({ transcribed: samples.length });
      return o.transcribe ? o.transcribe() : { ok: true, text: `heard ${++spoken}` };
    },
    ask: async (said) => {
      log.push({ asked: said });
      return o.ask ? o.ask() : { ok: true, text: `answer to ${said}`, audio: { b64: 'AAA' } };
    },
  };
  let spoken = 0;

  // ⭐ The host's dispatch wrapper, reproduced faithfully: the turn window's
  // audio is discarded, accounted, whenever the authority returns to idle.
  const dispatch = (event) => {
    const before = authority.snapshot();
    const out = authority.dispatch(event);
    if (before.turn.state !== 'idle' && out.snapshot.turn.state === 'idle' && live) {
      const samples = live.utterance.discard();
      if (samples > 0) log.push({ event: 'voice_utterance_discarded', samples });
    }
    return out;
  };
  const authorityPort = { dispatch, snapshot: () => authority.snapshot() };

  const turn = createTurn({
    conversation: () => (o.noConversation ? null : conversation),
    voice: () => live,
    announce: (p) => log.push(p),
    speak: (a) => log.push({ spoke: a }),
    authority: authorityPort,
    authorized: o.authorized || (() => true),
    diagnostic: (event, meta) => log.push({ event, ...meta }),
  });

  const pending = [];
  const lifecycle = createVoiceLifecycle({
    voice: () => live,
    watch: { start: () => log.push({ watch: 'start' }), stop: () => log.push({ watch: 'stop' }) },
    announce: () => {},
    dispatchTurn: () => { pending.push(turn.run()); },
    revokeSession: () => { live = null; },
    projectState: () => null,
    authority: authorityPort,
  });

  /**
   * Push frames until the REAL VAD produces an utterance boundary.
   *
   * ⛔ `silentFrames` is derived from the VAD's own `endOfUtteranceMs` (2500),
   * not chosen. 150 frames × 20 ms = 3000 ms clears it with margin. Nothing
   * here tunes the VAD — the test obeys the thresholds the walk settled.
   */
  async function utter({ voicedFrames = 20, silentFrames = 150 } = {}) {
    for (let i = 0; i < voicedFrames; i++) { clock += FRAME_MS; lifecycle.frame(voiced(), FRAME_MS); }
    for (let i = 0; i < silentFrames; i++) { clock += FRAME_MS; lifecycle.frame(quiet(), FRAME_MS); }
    await Promise.all(pending.splice(0));
  }

  return {
    authority, lifecycle, turn, log, dispatch, utter,
    snap: () => authority.snapshot(),
    frame: (pcm) => { clock += FRAME_MS; lifecycle.frame(pcm, FRAME_MS); },
    /** The renderer's playback report — the only half main cannot observe. */
    playbackEnded: (ok = true, reason) =>
      dispatch(ok ? { type: 'PLAYBACK_ENDED' } : { type: 'PLAYBACK_FAILED', reason }),
    start: () => { lifecycle.begin(); clock += FRAME_MS; lifecycle.frame(voiced(), FRAME_MS); },
    phases: () => log.filter((e) => e.phase).map((e) => e.phase),
    killSession: () => { live = null; },
  };
}

// ── 1 · start once ──────────────────────────────────────────────────────────

test('1 — START opens the capture session exactly once, on frame receipt', () => {
  const d = desktop();
  d.lifecycle.begin();
  // ⛔ `begin` reaches `opening`, NOT `open`. D02A: graph connection is not
  // evidence of audio, and the interface said "Listening…" for sixteen seconds
  // against zero frames precisely because something once believed it was.
  assert.equal(d.snap().capture.state, 'opening');
  assert.equal(d.snap().generation, 2);

  d.frame(voiced());
  assert.equal(d.snap().capture.state, 'open', 'a frame did not prove the capture');
  const gen = d.snap().generation;

  // ⛔ A second START is refused by the AUTHORITY — it does not open a second
  // conversation. (Main also guards with `if (voice) return 'already
  // capturing'`; this is the layer beneath that, which must hold on its own.)
  const again = d.dispatch({ type: 'START_VOICE' });
  assert.equal(again.accepted, false);
  assert.equal(again.refusal.reason, 'capture_already_open');
  assert.equal(d.snap().generation, gen, 'a second START forked the conversation');
});

// ── 2 & 3 · an ordinary turn, then another without START ────────────────────

test('2, 3 — a spoken turn completes, and the next one needs no gesture', async () => {
  const d = desktop();
  d.start();
  await d.utter();

  assert.deepEqual(d.phases(), ['transcribing', 'heard', 'thinking', 'answered']);
  assert.equal(d.snap().turn.state, 'maia_speaking', 'the turn ended while MAIA was speaking');
  assert.equal(d.snap().history.length, 2);

  d.playbackEnded();
  assert.equal(d.snap().turn.state, 'idle');
  assert.equal(d.snap().capture.state, 'open', 'the microphone was torn down between turns');

  // ⭐ No START, no gesture, nothing touched.
  await d.utter();
  assert.equal(d.snap().history.length, 4);
  assert.equal(d.snap().history[2].text, 'heard 2');
  assert.equal(d.snap().capture.state, 'open');
});

// ── 4 · the ten-turn grammar, through the wired boundary ────────────────────

test('4 — ten consecutive spoken turns through the real VAD and lifecycle', async () => {
  const d = desktop();
  d.start();
  const gen = d.snap().generation;

  for (let i = 1; i <= 10; i++) {
    await d.utter();
    assert.equal(d.snap().turn.state, 'maia_speaking', `turn ${i}: MAIA never answered`);
    d.playbackEnded();

    const s = d.snap();
    assert.equal(s.turn.state, 'idle', `turn ${i}: not re-armed`);
    assert.equal(s.capture.state, 'open', `turn ${i}: capture left open`);
    assert.equal(s.inputArmed, true, `turn ${i}: the member cannot speak`);
    assert.equal(s.generation, gen, `turn ${i}: the conversation forked`);
    assert.equal(s.history.length, i * 2, `turn ${i}: history is wrong`);
  }

  // ⛔ The tenth member turn is the tenth thing the member said — not MAIA's
  // ninth reply picked up by the microphone.
  assert.equal(d.snap().history[18].text, 'heard 10');
  assert.equal(d.snap().history[18].role, 'member');
});

// ── 5 · text while the voice session stays open ─────────────────────────────

test('5 — a text turn completes and leaves the voice session open', async () => {
  const d = desktop();
  d.start();
  await d.utter();
  d.playbackEnded();

  // ⛔ THE DEFECT THIS CLOSES: `maia:send-text` used to call `lifecycle.end()`
  // first, so typing one line tore down the microphone and the member had to
  // press Start again to speak.
  const outcome = await d.turn.say('typed instead of spoken');
  assert.equal(outcome, 'completed');
  assert.equal(d.snap().capture.state, 'open', 'a typed turn closed the capture');
  assert.equal(d.snap().turn.state, 'maia_speaking');
  d.playbackEnded();

  assert.equal(d.snap().history[2].text, 'typed instead of spoken');
  assert.equal(d.snap().history[2].role, 'member');

  // …and speech still works, with no reconstruction of the session.
  await d.utter();
  assert.equal(d.snap().history.length, 6);
  assert.equal(d.snap().turn.source, 'speech');
});

test('5b — text is refused mid-turn rather than interleaving two half-turns', async () => {
  const d = desktop();
  d.start();
  // Open a turn and leave it waiting.
  d.dispatch({ type: 'VAD_SPEECH_STARTED' });
  d.dispatch({ type: 'VAD_UTTERANCE_BOUNDARY' });
  d.dispatch({ type: 'TRANSCRIPTION_FINAL', text: 'mid turn' });

  assert.equal(await d.turn.say('typed over it'), 'skipped');
  assert.equal(d.snap().history.length, 1, 'a typed turn interleaved with a spoken one');
});

// ── 6 · late and stale events ───────────────────────────────────────────────

test('6 — a transcript for a stopped session cannot enter the conversation', async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const d = desktop({ transcribe: async () => { await gate; return { ok: true, text: 'from before' }; } });
  d.start();

  // A turn is in flight when the member stops and starts again.
  const inFlight = (async () => { await d.utter(); })();
  d.lifecycle.end();
  assert.equal(d.snap().capture.state, 'closed');

  release();
  await inFlight;

  // The late final belonged to a conversation the member left.
  assert.equal(d.snap().history.length, 0, 'a stale transcript entered the conversation');
  assert.ok(d.log.some((e) => e.event === 'turn_final_refused'),
    'the refusal was silent — nothing said the transcript was dropped');
});

test('6b — a reply arriving after CANCEL is refused, and never reaches the surface', async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const d = desktop({ ask: async () => { await gate; return { ok: true, text: 'too late' }; } });
  d.start();
  const inFlight = (async () => { await d.utter(); })();

  // Give the ask a tick to be in flight, then cancel.
  await Promise.resolve();
  d.dispatch({ type: 'CANCEL' });
  release();
  await inFlight;

  assert.ok(!d.phases().includes('answered'), 'a cancelled turn was answered on screen');
  assert.equal(d.snap().turn.state, 'idle');
  assert.equal(d.snap().capture.state, 'open', 'CANCEL closed the microphone');
});

test('6c — playback reported twice moves nothing the second time', async () => {
  const d = desktop();
  d.start();
  await d.utter();
  assert.equal(d.playbackEnded().accepted, true);
  const after = d.snap();
  const second = d.playbackEnded();
  assert.equal(second.accepted, false);
  assert.equal(second.refusal.reason, 'not_speaking');
  assert.equal(d.snap().history.length, after.history.length);
  assert.equal(d.snap().turn.id, after.turn.id);
});

// ── 7 · the thread cannot be swapped underneath the member ──────────────────

test('7 — thread-watch defers while a Desktop conversation is live', async () => {
  const watch = createThreadWatch();
  const d = desktop();
  watch.start('member-a', 'thread-A');

  // Between two turns: no turn is in flight, and the microphone is open. This
  // is exactly the gap in which the thread used to be swapped.
  d.start();
  await d.utter();
  d.playbackEnded();
  assert.equal(d.snap().turn.state, 'idle');
  assert.equal(d.snap().threadPinned, true, 'an open capture is not a live conversation');

  const decision = watch.observe({
    memberId: 'member-a',
    canonicalId: 'thread-B',
    turnInFlight: d.turn.isBusy,
    conversationActive: d.snap().threadPinned,
  });
  assert.equal(decision.action, 'defer');
  assert.equal(decision.reason, 'conversation_active');

  // ⛔ And the authority refuses the rebind outright, even if something asked.
  const refused = d.dispatch({ type: 'THREAD_ADOPTED', threadId: 'thread-B' });
  assert.equal(refused.accepted, false);
  assert.equal(refused.refusal.reason, 'thread_pinned');

  // Once the conversation ends, reconciliation resumes.
  d.lifecycle.end();
  assert.equal(d.snap().threadPinned, false);
  assert.equal(watch.observe({
    memberId: 'member-a', canonicalId: 'thread-B',
    turnInFlight: false, conversationActive: d.snap().threadPinned,
  }).action, 'adopt');
});

// ── 8 · MAIA speaking does not destroy the capture session ──────────────────

test('8 — MAIA speaking disarms input and leaves the capture session intact', async () => {
  const d = desktop();
  d.start();
  await d.utter();
  assert.equal(d.snap().turn.state, 'maia_speaking');

  // Her voice comes back through the microphone: real frames, real VAD.
  const before = d.snap().history.length;
  await d.utter();
  assert.equal(d.snap().history.length, before, 'MAIA answered her own voice');
  assert.equal(d.snap().capture.state, 'open', 'the echo closed the capture');
  assert.equal(d.snap().turn.state, 'maia_speaking');

  // ⭐ AND THE ECHO IS NOT PREPENDED TO THE NEXT UTTERANCE. On re-arm the turn
  // window is discarded, accounted, so the member's next words start clean.
  d.playbackEnded();
  assert.ok(d.log.some((e) => e.event === 'voice_utterance_discarded' && e.samples > 0),
    "MAIA's voice stayed in the buffer and became part of the next turn");

  await d.utter();
  assert.equal(d.snap().history.length, before + 2);
});

// ── 9 · STOP semantics ──────────────────────────────────────────────────────

test('9 — STOP while idle closes capture and nothing else', async () => {
  const d = desktop();
  d.start();
  await d.utter();
  d.playbackEnded();

  d.lifecycle.end();
  assert.equal(d.snap().capture.state, 'closed');
  assert.equal(d.snap().turn.state, 'idle');
  assert.equal(d.snap().history.length, 2, 'stopping discarded the conversation');
});

test('9b — STOP while MAIA is replying does not corrupt the reply', async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const d = desktop({ ask: async () => { await gate; return { ok: true, text: 'still valid', audio: { b64: 'A' } }; } });
  d.start();
  const inFlight = (async () => { await d.utter(); })();
  await Promise.resolve();

  // ⛔ Stopping the microphone is not stopping MAIA.
  d.lifecycle.end();
  assert.equal(d.snap().capture.state, 'closed');
  assert.equal(d.snap().turn.state, 'waiting_for_maia', 'STOP cancelled a valid reply');

  release();
  await inFlight;
  assert.equal(d.snap().history.length, 2, 'the reply was lost');
  assert.equal(d.snap().history[1].text, 'still valid');
  assert.equal(d.snap().turn.state, 'maia_speaking');

  d.playbackEnded();
  assert.equal(d.snap().turn.state, 'idle');
  assert.equal(d.snap().capture.state, 'closed', 'the reply reopened the microphone');
});

// ── capture failure, wired ──────────────────────────────────────────────────

test('capture loss mid-member-turn ends the turn; mid-reply it does not', async () => {
  // While HEARING: no final is coming, so the turn ends — accounted.
  const a = desktop();
  a.start();
  for (let i = 0; i < 20; i++) a.frame(voiced());
  assert.equal(a.snap().turn.state, 'hearing');
  a.lifecycle.captureLost('track_ended');
  assert.equal(a.snap().capture.state, 'recovering');
  assert.equal(a.snap().turn.state, 'idle');
  assert.equal(a.snap().lastTurnEnd.reason, 'capture_lost');

  // While WAITING FOR MAIA: the words already left the microphone.
  let release;
  const gate = new Promise((r) => { release = r; });
  const b = desktop({ ask: async () => { await gate; return { ok: true, text: 'answered anyway', audio: { b64: 'A' } }; } });
  b.start();
  const inFlight = (async () => { await b.utter(); })();
  await Promise.resolve();
  b.lifecycle.captureLost('track_muted');
  assert.equal(b.snap().turn.state, 'waiting_for_maia', 'a dead microphone cancelled MAIA');
  release();
  await inFlight;
  assert.equal(b.snap().history.length, 2);
});

test('a refused microphone fails the capture axis and opens no turn', () => {
  const d = desktop();
  d.lifecycle.begin();
  d.lifecycle.micResult(false, 'NotAllowedError');
  assert.equal(d.snap().capture.state, 'failed');
  assert.equal(d.snap().capture.cause, 'permission_denied');
  assert.equal(d.snap().turn.state, 'idle');
  assert.equal(d.dispatch({ type: 'VAD_SPEECH_STARTED' }).refusal.reason, 'capture_not_open');
});

test('a failing transcription and a failing MAIA both re-arm the member', async () => {
  for (const [label, o] of [
    ['transcription', { transcribe: () => ({ ok: false, error: 'whisper is gone' }) }],
    ['maia', { ask: () => ({ ok: false, error: 'maia unreachable' }) }],
  ]) {
    const d = desktop(o);
    d.start();
    await d.utter();
    assert.equal(d.snap().turn.state, 'idle', `${label}: the member was left disarmed`);
    assert.equal(d.snap().capture.state, 'open', `${label}: a failure closed the capture`);
    assert.equal(d.phases().at(-1), 'error', `${label}: the failure was silent`);

    // ⭐ And the member can simply speak again.
    await d.utter();
    assert.ok(d.log.filter((e) => e.transcribed).length >= 2, `${label}: could not speak again`);
  }
});

test('a failed playback releases the turn — the sound is lost, the words are not', async () => {
  const d = desktop();
  d.start();
  await d.utter();
  d.playbackEnded(false, 'blocked');
  assert.equal(d.snap().turn.state, 'idle');
  assert.equal(d.snap().history.length, 2, 'a failed playback lost MAIA\'s words');
  assert.equal(d.snap().lastTurnEnd.cause, 'blocked');
  assert.equal(d.snap().capture.state, 'open');
});

// ── 10 · no competing authority remains on the wired path ───────────────────

test('10 — the renderer holds no conversational state, and reads the snapshot', () => {
  const { readFileSync } = require('node:fs');
  const src = readFileSync(new URL('../src/renderer.js', import.meta.url), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  // ⛔ The deleted fields, by name (RESET-01 §1). Each was mutable renderer
  // state free to disagree with its source. `captureState`/`turnState` survive
  // ONLY as arrow-function projections over `conv` — declared with `const`,
  // never assigned — so the assertion is against MUTABILITY, not the name.
  for (const dead of [/let captureState/, /let captureCause/, /let sending/,
    /\bcaptureState = ['"]/, /\bcaptureCause = /, /\bsending = /]) {
    assert.ok(!dead.test(code), `the renderer still holds mutable state: ${dead}`);
  }

  // What it may still hold is capture-graph plumbing, not meaning.
  assert.ok(/let audioCtx = null, stream = null, node = null, listening = false;/.test(code),
    'the capture graph fields changed shape — check they are still graph-only');
  assert.ok(/node\.port\.onmessage[\s\S]*?if \(!listening\) return;/.test(code),
    '`listening` no longer gates frame forwarding, which is its only remaining job');

  // ⭐ Every conversational read goes through the snapshot.
  assert.ok(/conv = \(snap && snap\.conversation\) \|\| conv/.test(code),
    'the renderer does not adopt the authority snapshot');
  assert.ok(/const captureState = \(\) =>[\s\S]*?conv\.capture/.test(code),
    'capture state is not read from the snapshot');
  assert.ok(/const turnState = \(\) =>[\s\S]*?conv\.turn/.test(code),
    'turn state is not read from the snapshot');
  assert.ok(/window\.maia\.playbackEnded\(ok, reason\)/.test(code),
    'the renderer never reports playback completion — MAIA never stops speaking');
});

test('10b — main holds no conversational state beside the authority', () => {
  const { readFileSync } = require('node:fs');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  // `turnBusy` was main's own flag before DSC-02 moved it into turn.js; neither
  // may come back, in main or anywhere else.
  assert.ok(!/let turnBusy/.test(code), 'main is holding turn state again');
  assert.ok(/const authority = createDesktopConversation\(\)/.test(code),
    'main no longer composes the authority');
  // ⛔ The surface is fed the authority's snapshot, not main's opinion of it.
  assert.ok(/conversation: conversationState/.test(code),
    'the voice-state projection no longer carries the conversation snapshot');
  // ⛔ Text must not close the capture session.
  const sendText = /ipcMain\.handle\('maia:send-text'[\s\S]*?\n\}\);/.exec(code)[0];
  assert.ok(!/lifecycle\.end\(\)/.test(sendText),
    'a typed turn still tears down the microphone');
});

test('10c — turn.js keeps no in-flight flag of its own', () => {
  const { readFileSync } = require('node:fs');
  const src = readFileSync(new URL('../src/turn.js', import.meta.url), 'utf8');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/let busy/.test(code), 'turn.js is holding its own turn state again');
  assert.ok(/get isBusy\(\) \{ return authority\.snapshot\(\)\.turn\.state !== 'idle'; \}/.test(code),
    'isBusy is no longer a projection of the authority');
});
