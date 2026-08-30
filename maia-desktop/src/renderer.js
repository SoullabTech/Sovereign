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

'use strict';

const $ = (id) => document.getElementById(id);
let audioCtx = null, stream = null, node = null, listening = false;

// ⭐ MAIA-D02A. `listening` above means "the renderer opened a capture graph".
// It does NOT mean audio is arriving, and conflating the two is exactly how the
// interface came to say "Listening…" for sixteen seconds against zero frames.
// MAIN is authoritative about liveness; this mirrors what main reports.
let captureState = 'idle';        // idle | starting | listening | recovering | unavailable
let captureCause = null;
let rebuilding = false;
let sending = false;                     // DESKTOP-TEXT-01 — one typed turn at a time
let player = null;

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
  if (!listening) return { text: 'Ready when you are.', err: false };
  switch (captureState) {
    case 'listening':
      return { text: 'Listening…', err: false };
    case 'starting':
      // ⭐ The worklet is connected and no frame has arrived yet. That is NOT
      // listening, and saying so would be the exact defect this unit closes.
      return { text: 'Opening the microphone…', err: false };
    case 'recovering':
      return { text: 'Lost the microphone — reconnecting…', err: false };
    case 'unavailable': {
      // Truthful failure: names what stopped, never claims to be hearing them,
      // and says what would get it back.
      const why = captureCause === 'track_muted' ? 'your microphone is muted'
        : captureCause === 'track_ended' ? 'your microphone was disconnected'
        : captureCause === 'never_started' ? 'no audio ever reached MAIA'
        : 'audio stopped arriving';
      return { text: `MAIA cannot hear you — ${why}. Press Stop, then Start listening.`, err: true };
    }
    default:
      return { text: 'Ready when you are.', err: false };
  }
}

function showResting() {
  const s = restingLabel();
  setState(s.text, s.err);
  $('dot').classList.toggle('live', listening && captureState === 'listening');
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

  $('talk').textContent = 'Stop';
  // ⛔ Deliberately NOT 'Listening…' and NOT a live dot. The graph is connected;
  // no frame has arrived yet. Main says when audio is actually flowing, and
  // `showResting()` is the only thing allowed to make that claim.
  captureState = 'starting';
  captureCause = null;
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
  captureState = 'idle';
  captureCause = null;
  rebuilding = false;
  if (node) { node.port.onmessage = null; node.disconnect(); node = null; }
  if (audioCtx) { await audioCtx.close().catch(() => {}); audioCtx = null; }
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  await window.maia.voiceStop();
  $('dot').classList.remove('live');
  $('talk').textContent = 'Start listening';
  setState('Ready when you are.');
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

function play({ base64, format }) {
  try {
    // Stop any previous utterance rather than layering two voices.
    if (player) { player.pause(); player = null; }
    const mime = format === 'wav' ? 'audio/wav' : format === 'opus' ? 'audio/opus' : 'audio/mpeg';
    player = new Audio(`data:${mime};base64,${base64}`);
    player.play().catch(() => setState('MAIA answered, but playback was blocked.', true));
  } catch {
    setState('MAIA answered, but her voice could not be played.', true);
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
    setState('Ready when you are.');
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
    if (!text || sending) return;
    sending = true;
    $('send').disabled = true;
    const previous = $('msg').value;
    $('msg').value = '';
    try {
      const out = await window.maia.sendText(text);
      if (!out || out.ok === false) {
        // Give the member their words back rather than swallowing them.
        $('msg').value = previous;
        setState((out && out.error) || 'That did not send.', true);
      }
    } finally {
      sending = false;
      $('send').disabled = false;
      $('msg').focus();
    }
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

  window.maia.onTurn((t) => {
    if (t.phase === 'transcribing') setState('Hearing you…');
    else if (t.phase === 'heard') { addTurn('member', t.member); setState('…'); }
    else if (t.phase === 'thinking') setState('MAIA is with it…');
    else if (t.phase === 'answered') { addTurn('maia', t.maia); showResting(); }
    else if (t.phase === 'no-voice') setState("MAIA answered in text — her voice isn't enabled on the server.");
    else if (t.phase === 'error') setState(t.error, true);
    else if (t.phase === 'idle') showResting();
  });

  // ⭐ MAIA-D02A. Main is authoritative about whether audio is arriving; this
  // is the surface obeying it. Rides the already-ratified
  // `maia:voice-state-changed` channel — no new bridge was opened for this.
  window.maia.onVoiceState((snap) => {
    const cap = (snap && snap.capture) || { state: 'idle', cause: null };
    const was = captureState;
    captureState = cap.state;
    captureCause = cap.cause;

    if (!listening) return;
    showResting();                       // detect → change the visible state, first

    // → attempt bounded recovery. Main has already spent the budget by putting
    //   us in `recovering`; the renderer's job is the part only it can do,
    //   because only it may call getUserMedia.
    if (captureState === 'recovering' && was !== 'recovering' && !rebuilding) {
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

  showSignedIn(await window.maia.getAuth());
});
