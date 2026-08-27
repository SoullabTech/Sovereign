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
let player = null;

function setState(text, isError) {
  $('state').textContent = text;
  $('state').className = 'state' + (isError ? ' err' : '');
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

  listening = true;
  $('dot').classList.add('live');
  $('talk').textContent = 'Stop';
  setState('Listening…');
}

async function stopListening() {
  listening = false;
  if (node) { node.port.onmessage = null; node.disconnect(); node = null; }
  if (audioCtx) { await audioCtx.close().catch(() => {}); audioCtx = null; }
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  await window.maia.voiceStop();
  $('dot').classList.remove('live');
  $('talk').textContent = 'Start listening';
  setState('Ready when you are.');
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
    for (const turn of t.turns || []) {
      addTurn(turn.role === 'assistant' ? 'maia' : 'member', turn.content);
    }
    setState('Picking up where you left off.');
  });

  window.maia.onTurn((t) => {
    if (t.phase === 'transcribing') setState('Hearing you…');
    else if (t.phase === 'heard') { addTurn('member', t.member); setState('…'); }
    else if (t.phase === 'thinking') setState('MAIA is with it…');
    else if (t.phase === 'answered') { addTurn('maia', t.maia); setState(listening ? 'Listening…' : 'Ready when you are.'); }
    else if (t.phase === 'no-voice') setState("MAIA answered in text — her voice isn't enabled on the server.");
    else if (t.phase === 'error') setState(t.error, true);
    else if (t.phase === 'idle') setState(listening ? 'Listening…' : 'Ready when you are.');
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
