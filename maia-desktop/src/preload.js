// MAIA Desktop — narrow, explicit bridge.
//
// MAIA-D01. The pattern is inherited from jarvis-desktop/src/preload.js as
// architectural precedent (MAIA-D00 §3, founder ruling R5) — NOT by forking the
// JARVIS application. What carries over is the doctrine, and MAIA-D00A's lesson
// about how it decays: the renderer gets named verbs and nothing else, main owns
// every value that reaches a privileged call, and the allow-list is reviewed in
// exactly ONE place (test/d01-preload-allowlist.mjs) so an eleventh channel has
// to come and argue for itself instead of appearing.
//
// ⛔ What deliberately does NOT cross this bridge:
//    · no general IPC channel, no `send`, no `exec`
//    · no Node, no fs, no shell, no child_process
//    · no device identifiers the renderer may choose from
//    · no transcription endpoint the renderer may name
//
// The renderer's role in the voice seam is narrow on purpose: it acquires the
// microphone (only Chromium can) and forwards OWNED AUDIO FRAMES. Every decision
// about those frames — VAD, epoch state, the tail invariant, transcription
// transport — lives in main, where the renderer cannot reach it.

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('maia', {
  // ── voice: renderer → main ────────────────────────────────────────────────
  // Frames only. The renderer cannot name a device, an endpoint, or an epoch:
  // main assigns and owns all three, so a buggy or compromised renderer cannot
  // redirect capture or forge an epoch boundary.
  // The renderer reports the AudioContext's real sample rate; main clamps it.
  // Without it the WAV header would lie and Whisper would hear the wrong voice.
  voiceStart: (sampleRate) => ipcRenderer.invoke('maia:voice-start', { sampleRate }),
  voiceStop: () => ipcRenderer.invoke('maia:voice-stop'),
  voiceFrame: (samples, frameMs) => ipcRenderer.invoke('maia:voice-frame', { samples, frameMs }),
  // The renderer OBSERVES getUserMedia resolving; it does not get to assert that
  // capture is healthy. Main treats this as a report, not as authority.
  voiceMicResult: (granted, errorName) =>
    ipcRenderer.invoke('maia:voice-mic-result', { granted, errorName }),
  voiceCaptureLost: (cause) => ipcRenderer.invoke('maia:voice-capture-lost', { cause }),

  // ── DESKTOP-TEXT-01: the member's other way of speaking ───────────────────
  // The renderer forwards TEXT and nothing else. It cannot name a thread, a
  // route, or a member — main owns all three, exactly as it owns the epoch on
  // the voice side. A typed turn and a spoken turn become the same turn the
  // moment the words exist.
  sendText: (text) => ipcRenderer.invoke('maia:send-text', { text }),

  // ── RESET-01 §6: the half-duplex handoff ──────────────────────────────────
  // ⭐ THE ELEVENTH CHANNEL, and it had to argue for itself.
  //
  // Only the renderer holds an output device, so only the renderer can observe
  // that MAIA finished speaking. Without this, main re-armed speech-turn
  // creation the instant the audio was handed over — while she was still
  // talking — and her voice came back through the microphone as a member turn.
  //
  // ⛔ It carries an OBSERVATION, not authority, exactly like `voiceMicResult`.
  // The renderer cannot name a turn, a generation, or a conversation: main
  // supplies all three from the authority, which refuses the report if the turn
  // is not `maia_speaking`, if it arrives twice, or if it belongs to a
  // conversation that has since been replaced.
  playbackEnded: (ok, reason) => ipcRenderer.invoke('maia:playback-ended', { ok, reason }),

  // ── read-only ─────────────────────────────────────────────────────────────
  getVoiceState: () => ipcRenderer.invoke('maia:voice-state'),
  getStatus: () => ipcRenderer.invoke('maia:status'),

  // ── member session ────────────────────────────────────────────────────────
  // ⛔ The token itself NEVER crosses this bridge. `getAuth` returns whether a
  // session exists and whose it is — never the credential. A renderer that
  // could read the token could exfiltrate it.
  signIn: (username, password) => ipcRenderer.invoke('maia:sign-in', { username, password }),
  signOut: () => ipcRenderer.invoke('maia:sign-out'),
  getAuth: () => ipcRenderer.invoke('maia:auth-state'),

  // ── main → renderer ───────────────────────────────────────────────────────
  // Outward only; nothing crosses inward on these.
  onVoiceEvent: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, payload) => fn(payload);
    ipcRenderer.on('maia:voice-event', handler);
    return () => ipcRenderer.removeListener('maia:voice-event', handler);
  },
  onTurn: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, payload) => fn(payload);
    ipcRenderer.on('maia:turn', handler);
    return () => ipcRenderer.removeListener('maia:turn', handler);
  },
  onAudio: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, payload) => fn(payload);
    ipcRenderer.on('maia:audio', handler);
    return () => ipcRenderer.removeListener('maia:audio', handler);
  },
  onThread: (fn) => {
    const handler = (_e, payload) => fn(payload);
    ipcRenderer.on('maia:thread', handler);
    return () => ipcRenderer.removeListener('maia:thread', handler);
  },
  onAuth: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, payload) => fn(payload);
    ipcRenderer.on('maia:auth', handler);
    return () => ipcRenderer.removeListener('maia:auth', handler);
  },
  onVoiceState: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, payload) => fn(payload);
    ipcRenderer.on('maia:voice-state-changed', handler);
    return () => ipcRenderer.removeListener('maia:voice-state-changed', handler);
  },
});
