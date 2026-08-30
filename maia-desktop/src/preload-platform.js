'use strict';
// MAIA Desktop — the PLATFORM preload.
//
// COMPANION-01A P1 + P2. Deliberately the narrowest bridge in the app.
//
// ⛔ What is NOT here, and must never be added:
//   · any voice verb — voiceStart/Stop/Frame, voiceMicResult, voiceCaptureLost
//   · the session token, in any form
//   · any general IPC, shell, or filesystem access
//
// The platform surface renders the member's realm and owns nothing. Capability
// requests go to main by name; main holds the credential and calls canonical.
// A verb added here widens Desktop's authority and belongs in a ruling.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('maiaPlatform', {
  // COMPANION-01A step 1 exposes only the negative-proof channel. The capability
  // bridge (member state, entitlements, history, adoption, settings) is step 3
  // and lands with its own review.
  reportProbe: (r) => ipcRenderer.invoke('maia:probe-report', r),
});
