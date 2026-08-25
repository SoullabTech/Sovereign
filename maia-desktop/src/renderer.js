// MAIA Desktop — renderer. MAIA-D01.
//
// The renderer's ONLY privileged act is acquiring the microphone, because in
// Electron the media stack lives here. Everything after that is forwarding.
//
// ⛔ HARD PROHIBITION (D01 ruling). No SpeechRecognition, no
// webkitSpeechRecognition, no Web Speech API, no browser-owned recognition
// lifecycle. This file acquires a MediaStream and reads raw samples off it. It
// holds no recognition object, so there is no recognition lifecycle to lose.
// test/d01-no-web-speech.test.mjs fails if that ever stops being true.

'use strict';

const els = {};
let audioCtx = null;
let stream = null;
let node = null;

function log(line) {
  const el = els.events;
  if (!el) return;
  const div = document.createElement('div');
  div.className = 'evt';
  div.textContent = line;
  el.prepend(div);
}

async function start() {
  await window.maia.voiceStart();
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
    await window.maia.voiceMicResult(true, null);
  } catch (e) {
    await window.maia.voiceMicResult(false, (e && e.name) || 'Error');
    return;
  }

  // A track ending or muting under us is the silent-capture-death class the
  // browser programme already documented. Report it; main decides what it means.
  for (const track of stream.getAudioTracks()) {
    track.addEventListener('ended', () => window.maia.voiceCaptureLost('track_ended'));
    track.addEventListener('mute', () => window.maia.voiceCaptureLost('track_muted'));
  }

  audioCtx = new AudioContext();
  await audioCtx.audioWorklet.addModule('capture-worklet.js');
  const src = audioCtx.createMediaStreamSource(stream);
  node = new AudioWorkletNode(audioCtx, 'maia-capture');
  const frameMs = () => (128 / audioCtx.sampleRate) * 1000;
  node.port.onmessage = (evt) => {
    // Arrays cross the bridge as plain numbers; main validates length and range.
    window.maia.voiceFrame(Array.from(evt.data), frameMs());
  };
  src.connect(node);
  els.start.disabled = true;
  els.stop.disabled = false;
}

async function stop() {
  const res = await window.maia.voiceStop();
  if (node) { node.port.onmessage = null; node.disconnect(); node = null; }
  if (audioCtx) { await audioCtx.close().catch(() => {}); audioCtx = null; }
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null; }
  els.start.disabled = false;
  els.stop.disabled = true;
  if (res && res.ok) log(`committed · ${res.chars} chars · tail=${res.tail.outcome}`);
}

window.addEventListener('DOMContentLoaded', () => {
  els.start = document.getElementById('start');
  els.stop = document.getElementById('stop');
  els.events = document.getElementById('events');
  els.state = document.getElementById('state');
  els.start.onclick = start;
  els.stop.onclick = stop;

  window.maia.onVoiceEvent((e) => {
    const bits = Object.entries(e)
      .filter(([k]) => k !== 'event' && k !== 'surface')
      .map(([k, v]) => `${k}=${v}`).join(' ');
    log(`${e.event}  ${bits}`);
  });
  window.maia.onVoiceState((s) => {
    els.state.textContent = s.active
      ? `epoch ${s.epochId} · finals ${s.finals.length} · open ${s.openPartialChars} chars · salvaged ${s.salvaged.length} · lost ${s.lost.length}`
      : 'idle';
  });
});
