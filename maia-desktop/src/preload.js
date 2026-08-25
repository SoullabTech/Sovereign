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
  voiceStart: () => ipcRenderer.invoke('maia:voice-start'),
  voiceStop: () => ipcRenderer.invoke('maia:voice-stop'),
  voiceFrame: (samples, frameMs) => ipcRenderer.invoke('maia:voice-frame', { samples, frameMs }),
  // The renderer OBSERVES getUserMedia resolving; it does not get to assert that
  // capture is healthy. Main treats this as a report, not as authority.
  voiceMicResult: (granted, errorName) =>
    ipcRenderer.invoke('maia:voice-mic-result', { granted, errorName }),
  voiceCaptureLost: (cause) => ipcRenderer.invoke('maia:voice-capture-lost', { cause }),

  // ── read-only ─────────────────────────────────────────────────────────────
  getVoiceState: () => ipcRenderer.invoke('maia:voice-state'),
  getStatus: () => ipcRenderer.invoke('maia:status'),

  // ── main → renderer ───────────────────────────────────────────────────────
  // Outward only; nothing crosses inward on these.
  onVoiceEvent: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, payload) => fn(payload);
    ipcRenderer.on('maia:voice-event', handler);
    return () => ipcRenderer.removeListener('maia:voice-event', handler);
  },
  onVoiceState: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const handler = (_evt, payload) => fn(payload);
    ipcRenderer.on('maia:voice-state-changed', handler);
    return () => ipcRenderer.removeListener('maia:voice-state-changed', handler);
  },
});
