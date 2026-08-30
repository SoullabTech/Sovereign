// MAIA Desktop — the surface.
//
// DESKTOP-CONVERSATION-01. The renderer's privileged act is still only
// acquiring the microphone; everything else is forwarding and display.
//
// ⛔ HARD PROHIBITION (D01, unchanged). No SpeechRecognition, no
// webkitSpeechRecognition, no Web Speech API, no browser-owned recognition
// lifecycle. This file holds a MediaStream and an AudioWorklet and nothing else.
//
// The diagnostic events still flow — they are behind a disclosure toggle now
// rather than being the interface. An instrument is not a companion.
//
// ── DESKTOP-CONVERSATION-WIRING-01 — THE RENDERER NO LONGER DECIDES ─────────
//
// RESET-01 §1: "The renderer holds no conversational state. It receives a
// snapshot; it sends gestures." It used to hold `listening`, `captureState`,
// `captureCause` and `sending` and compose a conversational description out of
// them — a second state machine, free to disagree with the authority, which is
// the defect generator the reset names.
//
// What is left, and why:
//
//   `conv`       the authority's snapshot. The ONLY source of what the
//                conversation is doing. Never written to except on arrival.
//   `listening`  NOT conversational state — a capture-graph fact: does this
//                renderer currently hold a MediaStream whose frames it should
//                forward? It gates `node.port.onmessage` and nothing else.
//   `rebuilding` NOT conversational state — a re-entrancy guard on
//                getUserMedia, the one privileged act the renderer still owns.
//
// ⛔ `sending` IS GONE. It duplicated "one turn at a time", which the authority
// already answers. Two rapid sends are not a race to guard against here: the
// second is REFUSED by the authority and the member gets their words back.
//
// ⛔ `captureState` / `captureCause` are gone as fields. They are read off the
// snapshot at the point of use, so there is nothing to keep in sync.

'use strict';

const $ = (id) => document.getElementById(id);

// ⭐ MAIA-D02A, carried. `listening` means "the renderer opened a capture
// graph". It does NOT mean audio is arriving, and conflating the two is exactly
// how the interface came to say "Listening…" for sixteen seconds against zero
// frames. It is now used ONLY to gate frame forwarding — never to describe the
// conversation, which is the authority's job.
let audioCtx = null, stream = null, node = null, listening = false;
let rebuilding = false;                  // re-entrancy guard on getUserMedia
let player = null;

// ⭐ The authority's snapshot — the single source of conversational meaning.
// Null until the first push arrives, and every read tolerates that.
let conv = null;

const captureState = () => (conv && conv.capture ? conv.capture.state : 'closed');
const turnState = () => (conv && conv.turn ? conv.turn.state : 'idle');

function setState(text, isError) {
  $('state').textContent = text;
  $('state').className = 'state' + (isError ? ' err' : '');
}

/**
 * ⭐ The resting label, in ONE place.
 *
 * The acceptance condition for MAIA-D02A is a claim about what the member may
 * be shown, so it is expressed once here rather than at each of the call sites
 * that previously wrote `listening ? 'Listening…' : …` from the renderer's own
 * belief.
 *
 * ⛔ "Listening…" is reachable ONLY from captureState === 'listening'.
 */
function restingLabel() {
  // ── the TURN axis first ───────────────────────────────────────────────────
  // What the conversation is doing outranks how the microphone is doing. Both
  // are true at once and the member only needs the nearer one.
  switch (turnState()) {
    case 'hearing':          return { text: 'Listening…', err: false };
    case 'finalizing':       return { text: 'Hearing you…', err: false };
    case 'waiting_for_maia': return { text: 'MAIA is with it…', err: false };
    // ⭐ RESET-01 §6. Said plainly, because it is the moment the member most
    // needs to know they are not expected to speak yet.
    case 'maia_speaking':    return { text: 'MAIA is speaking…', err: false };
    default: break;
  }

  // ── the turn is idle, so describe the CAPTURE axis ────────────────────────
  // ⛔ "Listening…" is still reachable ONLY from an open capture, which now
  // means frame receipt: the authority does not leave `opening` until a frame
  // has actually arrived. D02A's rule is preserved structurally, one layer up.
  switch (captureState()) {
    case 'open':
      return { text: 'Listening…', err: false };
    case 'opening':
      return { text: 'Opening the microphone…', err: false };
    case 'recovering':
      return { text: 'Lost the microphone — reconnecting…', err: false };
    case 'failed': {
      // Truthful failure: names what stopped, never claims to be hearing them,
      // and says what would get it back.
      const cause = conv && conv.capture ? conv.capture.cause : null;
      const why = cause === 'track_muted' ? 'your microphone is muted'
        : cause === 'track_ended' ? 'your microphone was disconnected'
        : cause === 'never_started' ? 'no audio ever reached MAIA'
        : cause === 'permission_denied' ? 'the microphone was not granted'
        : 'audio stopped arriving';
      return { text: `MAIA cannot hear you — ${why}. Press Stop, then Start listening.`, err: true };
    }
    default:
      return { text: 'Ready when you are.', err: false };
  }
}

/**
 * The whole visible conversational state, recomputed from the snapshot.
 *
 * ⛔ ONE PLACE. Every caller that used to write a label from its own belief now
 * comes through here, so there is no path by which the surface can assert
 * something the authority does not say.
 */
function showResting() {
  const s = restingLabel();
  setState(s.text, s.err);
  // The live dot follows the authority's capture axis — nothing local.
  $('dot').classList.toggle('live', captureState() === 'open');
  // ⭐ The button says what the CAPTURE session is, not what the turn is. A
  // member mid-turn is still listening, and offering "Start listening" there
  // would be the teardown-and-recreate loop the reset forbids.
  $('talk').textContent = captureState() === 'closed' ? 'Start listening' : 'Stop';
  // ⭐ RESET-01 §7. The composer is disabled exactly while the authority has a
  // turn open — the same disarm that stops speech from creating one.
  const armed = conv ? conv.inputArmed !== false : true;
  $('send').disabled = !armed;
}

function addTurn(who, body) {
  const main = $('main');
  main.classList.remove('center');
  const el = document.createElement('div');
  el.className = `turn ${who}`;
  el.innerHTML = `<div class="who">${who === 'maia' ? 'MAIA' : 'You'}</div>`;
  const b = document.createElement('div');
  b.className = 'body';
  b.textContent = body;                    // textContent, never innerHTML
  el.appendChild(b);
  main.appendChild(el);
  main.scrollTop = main.scrollHeight;
}

// ── microphone ──────────────────────────────────────────────────────────────

async function startListening() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
  } catch (e) {
    setState(`Microphone unavailable (${(e && e.name) || 'error'}).`, true);
    return;
  }

  audioCtx = new AudioContext();
  const started = await window.maia.voiceStart(audioCtx.sampleRate);
  if (!started || started.ok === false) {
    setState(started?.reason || 'Could not start listening.', true);
    await audioCtx.close().catch(() => {});
    audioCtx = null;
    stream.getTracks().forEach((t) => t.stop()); stream = null;
    return;
  }
  await window.maia.voiceMicResult(true, null);

  // ⛔ Set BEFORE the graph is built. `node.port.onmessage` drops frames while
  // this is false, so building first would discard the opening blocks of the
  // member's first utterance — the same class of loss the batching fix closed.
  listening = true;

  await buildCaptureGraph();

  // ⛔ Deliberately NOT 'Listening…' and NOT a live dot. The graph is connected;
  // no frame has arrived yet. The authority says when audio is actually
  // flowing, and `showResting()` only reports what it says.
  showResting();
}

/**
 * Acquire the microphone and wire the worklet.
 *
 * ⭐ MAIA-D02A extracted this from `startListening` so a rebuild can reuse it.
 * ⛔ It deliberately does NOT call `voiceStart`: on a recovery the session in
 * main is still open, and re-opening it would discard the epoch and the draft —
 * losing words the member already said in order to fix the microphone.
 */
async function openCaptureGraph() {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });
  audioCtx = new AudioContext();
  await buildCaptureGraph();
}

async function buildCaptureGraph() {

  for (const track of stream.getAudioTracks()) {
    track.addEventListener('ended', () => window.maia.voiceCaptureLost('track_ended'));
    track.addEventListener('mute', () => window.maia.voiceCaptureLost('track_muted'));
  }

  await audioCtx.audioWorklet.addModule('capture-worklet.js');
  const src = audioCtx.createMediaStreamSource(stream);
  node = new AudioWorkletNode(audioCtx, 'maia-capture');

  // ⭐ BATCHED (device walk 2026-08-27). The worklet emits a 128-sample block
  // every 2.67 ms — 375 a second. Sending each one as its own ipcRenderer
  // .invoke(), carrying a plain Array, saturated the renderer thread and dropped
  // most of them: a long utterance arrived as ~3.8 s of fragments and Whisper
  // returned an empty transcript. Blocks are accumulated and sent as Float32Array.
  //
  // ⛔ BACKPRESSURE MUST NOT DROP AUDIO. While a send is in flight, blocks keep
  // accumulating — the batch grows, nothing is discarded. This is the same rule
  // the epoch machine holds one layer down: audio is never silently lost to make
  // the plumbing easier.
  const rate = audioCtx.sampleRate;
  const BATCH = Math.round(rate * 0.06);       // ~60 ms per send, ~17 sends/sec
  const MAX_BATCH = 32768;                     // main rejects frames above 65536
  let pending = [];
  let pendingLen = 0;
  let inFlight = false;

  const drain = () => {
    if (inFlight || pendingLen < BATCH) return;
    const take = Math.min(pendingLen, MAX_BATCH);
    const batch = new Float32Array(take);
    let off = 0;
    while (off < take) {
      const head = pending[0];
      const room = take - off;
      if (head.length <= room) { batch.set(head, off); off += head.length; pending.shift(); }
      else { batch.set(head.subarray(0, room), off); pending[0] = head.subarray(room); off += room; }
    }
    pendingLen -= take;
    inFlight = true;
    window.maia.voiceFrame(batch, (take / rate) * 1000)
      .catch(() => {})
      .finally(() => { inFlight = false; drain(); });
  };

  node.port.onmessage = (evt) => {
    if (!listening) return;
    pending.push(evt.data);
    pendingLen += evt.data.length;
    drain();
  };
  src.connect(node);
}

async function stopListening() {
  listening = false;
  rebuilding = false;
  if (node) { node.port.onmessage = null; node.disconnect(); node = null; }
  if (audioCtx) { await audioCtx.close().catch(() => {}); audioCtx = null; }
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  // ⛔ The authority is told through main, and the surface then reports what it
  // says. The renderer does not announce 'Ready when you are.' on its own
  // belief that stopping worked.
  await window.maia.voiceStop();
  showResting();
}

/**
 * Bounded recovery: rebuild the capture graph once, in place.
 *
 * ⛔ Does NOT close the voice session in main. The epoch, the draft and any
 * salvaged words survive — a dropped microphone must not also cost the member
 * what they had already said.
 *
 * If this succeeds, frames resume, main sees them and reports `listening` again.
 * If it does not, main's watchdog finds the next window still empty and moves to
 * `dead`, and `showResting()` tells the member the truth. Either way the surface
 * never returns to "Listening…" on the strength of this function having run —
 * only actual audio can do that.
 */
async function rebuildCapture() {
  try {
    if (node) { node.port.onmessage = null; node.disconnect(); node = null; }
    if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
    if (audioCtx) { await audioCtx.close().catch(() => {}); audioCtx = null; }
    if (!listening) return;              // the member stopped while we were trying
    await openCaptureGraph();
  } catch {
    // Swallowed on purpose: the watchdog is the authority on whether this
    // worked. A thrown error here must not become a second, competing verdict.
  }
}

// ── MAIA's voice ────────────────────────────────────────────────────────────

/**
 * ⭐ RESET-01 §6. MAIA speaks, and THE END OF IT IS REPORTED.
 *
 * This is the half of the handoff only the renderer can perform: main has no
 * output device and cannot observe playback finishing. Until this existed, the
 * turn was treated as over the instant the audio was handed across, so
 * speech-turn creation re-armed while she was still talking and her own voice
 * came back through the microphone as a member turn.
 *
 * ⛔ EVERY EXIT REPORTS. Ended, blocked, threw — each one calls `report` exactly
 * once. A playback that failed silently would leave the authority in
 * `maia_speaking` and the member disarmed with nothing left to re-arm them,
 * which is a worse failure than the sound not playing.
 */
function play({ base64, format }) {
  let reported = false;
  const report = (ok, reason) => {
    if (reported) return;                  // `ended` after an error, or vice versa
    reported = true;
    // The authority is the judge of whether this report is still current; it
    // refuses a late or duplicate one. The renderer just tells the truth.
    void window.maia.playbackEnded(ok, reason);
  };

  try {
    // Stop any previous utterance rather than layering two voices.
    if (player) { player.pause(); player = null; }
    const mime = format === 'wav' ? 'audio/wav' : format === 'opus' ? 'audio/opus' : 'audio/mpeg';
    const audio = new Audio(`data:${mime};base64,${base64}`);
    player = audio;
    audio.addEventListener('ended', () => report(true));
    audio.addEventListener('error', () => report(false, 'decode_error'));
    audio.play().catch(() => {
      setState('MAIA answered, but playback was blocked.', true);
      report(false, 'blocked');
    });
  } catch {
    setState('MAIA answered, but her voice could not be played.', true);
    report(false, 'threw');
  }
}

// ── wiring ──────────────────────────────────────────────────────────────────

function showSignedIn(state) {
  $('signin').style.display = state.signedIn ? 'none' : 'flex';
  $('bar').style.display = state.signedIn ? 'flex' : 'none';
  // ⭐ DESKTOP-TEXT-01. The composer appears with the voice bar, not instead of
  // it: a signed-in member can reach MAIA either way, at any moment.
  $('composer').style.display = state.signedIn ? 'flex' : 'none';
  if (state.signedIn) {
    $('main').classList.remove('center');
    showResting();
  } else {
    $('main').classList.add('center');
    if (listening) stopListening();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  $('signin').onsubmit = async (e) => {
    e.preventDefault();
    $('autherr').textContent = 'Signing in…';
    const out = await window.maia.signIn($('u').value.trim(), $('p').value);
    $('autherr').textContent = out.ok ? '' : (out.error || 'Sign-in failed.');
  };
  // ⭐ DESKTOP-TEXT-01. Enter submits (it is a <form>), so typing feels like
  // typing. The turn itself renders through `maia:turn`, exactly as a spoken
  // one does — the renderer does NOT append the member's line locally, because
  // then a refused send would leave words on screen that MAIA never received.
  $('composer').onsubmit = async (e) => {
    e.preventDefault();
    const text = $('msg').value.trim();
    if (!text) return;
    const previous = $('msg').value;
    $('msg').value = '';
    // ⛔ NO LOCAL `sending` LATCH. "One turn at a time" is the authority's
    // answer, not a boolean here. A second send arriving before the snapshot
    // updates is REFUSED by the authority, and the member gets their words
    // back on exactly the path below — the same one every other refusal takes.
    const out = await window.maia.sendText(text);
    if (!out || out.ok === false) {
      // Give the member their words back rather than swallowing them.
      $('msg').value = previous;
      setState((out && out.error) || 'That did not send.', true);
    }
    $('msg').focus();
  };

  $('out').onclick = () => window.maia.signOut();
  $('talk').onclick = () => (listening ? stopListening() : startListening());
  $('toggle').onclick = () => $('log').classList.toggle('on');

  window.maia.onAuth(showSignedIn);
  window.maia.onAudio(play);

  // ⭐ D04. Desktop opens on the member's existing thread, so the first thing
  // they see is what was actually said — on whichever surface they said it.
  window.maia.onThread((t) => {
    if (!t) return;
    if (t.error) { setState(`Could not reach your conversation — ${t.error}`, true); return; }
    if (!t.resumed) return;                 // no history anywhere: this IS the first

    // ⭐ MAIA-D04A. A live rejoin replaces what is on screen, so the surface is
    // cleared first. Appending would splice two threads into one transcript
    // that never happened — the member would read a conversation nobody had.
    if (t.rejoined) $('main').innerHTML = '';

    for (const turn of t.turns || []) {
      addTurn(turn.role === 'assistant' ? 'maia' : 'member', turn.content);
    }
    // ⛔ Never a silent redraw. If the thread changed underneath the member
    // while they were looking at it, they are told that it did.
    setState(t.rejoined
      ? 'Caught up — you continued this somewhere else.'
      : 'Picking up where you left off.');
  });

  // ⭐ `maia:turn` now carries the two things the SNAPSHOT CANNOT: the words
  // themselves, and a failure message written for a person. The conversational
  // STATE that used to be inferred from each phase — "Hearing you…", "MAIA is
  // with it…" — is read from the authority instead, so a phase arriving out of
  // order can no longer leave a label the conversation has moved past.
  window.maia.onTurn((t) => {
    if (t.phase === 'heard') addTurn('member', t.member);
    else if (t.phase === 'answered') addTurn('maia', t.maia);
    else if (t.phase === 'no-voice') {
      setState("MAIA answered in text — her voice isn't enabled on the server.");
      return;
    } else if (t.phase === 'error') {
      // ⛔ A failure keeps its own words. The authority knows the turn ended;
      // only this carries WHY, and the member is owed that sentence.
      setState(t.error, true);
      return;
    }
    showResting();
  });

  // ⭐ MAIA-D02A. Main is authoritative about whether audio is arriving; this
  // is the surface obeying it. Rides the already-ratified
  // `maia:voice-state-changed` channel — no new bridge was opened for this.
  // ⭐ THE SNAPSHOT ARRIVES HERE AND NOWHERE ELSE. Everything visible is
  // recomputed from it; the renderer forms no opinion of its own.
  window.maia.onVoiceState((snap) => {
    const was = captureState();
    conv = (snap && snap.conversation) || conv;
    showResting();                       // detect → change the visible state, first

    // → attempt bounded recovery. The authority has already spent the budget by
    //   moving to `recovering`; the renderer's job is the part only it can do,
    //   because only it may call getUserMedia.
    if (listening && captureState() === 'recovering' && was !== 'recovering' && !rebuilding) {
      rebuilding = true;
      rebuildCapture().finally(() => { rebuilding = false; });
    }
  });

  window.maia.onVoiceEvent((e) => {
    const line = document.createElement('div');
    line.textContent = `${e.event} ` + Object.entries(e)
      .filter(([k]) => !['event', 'surface', 'at'].includes(k))
      .map(([k, v]) => `${k}=${v}`).join(' ');
    $('log').prepend(line);
  });

  // ⛔ The first paint is a projection too. Without this the surface would
  // describe the conversation from its own defaults until the first push.
  const initial = await window.maia.getVoiceState();
  conv = (initial && initial.conversation) || null;
  showSignedIn(await window.maia.getAuth());
});
