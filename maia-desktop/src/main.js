// MAIA Desktop — main process. MAIA-D01 native voice witness shell.
//
// SCOPE. This is the smallest governed shell that can carry the native voice
// seam. It is NOT the MAIA Desktop Companion. There is no House, no Realm, no
// conversation resume, no Session Room, no packaging, no updater — those are
// D03+ and the D01 ruling forbids them here.
//
// SECURITY POSTURE, inherited from jarvis-desktop as precedent (R5):
//   · contextIsolation on, nodeIntegration off, sandboxed renderer
//   · loadFile only — no remote content is ever loaded into the renderer
//   · a narrow named-verb preload; no general IPC, no shell, no fs
//   · main owns every value that reaches a privileged call
//   · media permission is granted ONLY for audio, and only to our own file URL
//
// WHY THE RENDERER TOUCHES THE MICROPHONE AT ALL — stated plainly rather than
// glossed. In Electron, microphone acquisition runs through Chromium's media
// stack, which lives in the renderer. So `getUserMedia` is called there. What
// makes this "desktop-owned" in the sense the ruling requires is what happens
// next: the renderer hands raw PCM frames across the bridge and has no further
// authority. Segmentation, epoch state, the tail invariant, transcription
// transport and diagnostics all execute in main. No browser recognition service
// is involved at any point, and there is no recognition lifecycle to lose
// control of — which is precisely the dependency §XII rules out.
//
// The honest limitation: this is Chromium's audio input stack, not CoreAudio
// directly. Recorded in the D01 record under KNOWN LIMITATIONS rather than
// smoothed over.

'use strict';

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('node:path');

const { createDiagnostics } = require('./voice/diagnostics');
const { createEpochState, EPOCH_END_REASONS } = require('./voice/epoch');
const { createVad } = require('./voice/vad');
const { createTranscriptionClient } = require('./voice/transcription');

// Separate userData for a dev launch, so a development instance can never read
// or corrupt an installed instance's state. (jarvis-desktop precedent.)
if (!app.isPackaged) {
  app.setPath('userData', path.join(app.getPath('appData'), 'maia-desktop-dev'));
}

let mainWindow = null;

// ── voice session, owned entirely by main ───────────────────────────────────
let voice = null;

function broadcast(channel, payload) {
  for (const w of BrowserWindow.getAllWindows()) {
    if (!w.isDestroyed()) w.webContents.send(channel, payload);
  }
}

function newVoiceSession() {
  const diagnostics = createDiagnostics(
    (event, record) => broadcast('maia:voice-event', record),
    { surface: 'desktop', now: () => Date.now() }
  );

  // Salvaged material becomes the member's own draft. It is NOT silently
  // re-fed to MAIA as if it had been recognized as final — the member decides
  // what to do with words the system nearly lost.
  const draft = [];
  const epoch = createEpochState({
    diagnostics,
    onSalvage: (text) => { draft.push(text); return true; },
  });

  const vad = createVad();
  const transcription = createTranscriptionClient({
    fetchImpl: (url, init) => fetch(url, init),
    diagnostics,
    endpoint: process.env.MAIA_TRANSCRIBE_URL || 'http://127.0.0.1:3000/api/voice/transcribe-simple',
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  });

  return { diagnostics, epoch, vad, transcription, draft, frames: 0 };
}

function voiceStateSnapshot() {
  if (!voice) return { active: false };
  return { active: true, ...voice.epoch.snapshot(), vad: voice.vad.state(), draft: voice.draft.length };
}

function pushState() { broadcast('maia:voice-state-changed', voiceStateSnapshot()); }

// ── IPC — every handler validates in MAIN; nothing is taken on trust ────────

ipcMain.handle('maia:voice-start', async () => {
  if (voice) return { ok: false, reason: 'already capturing' };
  voice = newVoiceSession();
  voice.epoch.startEpoch();
  pushState();
  return { ok: true };
});

ipcMain.handle('maia:voice-mic-result', async (_evt, payload) => {
  if (!voice) return { ok: false, reason: 'no capture session' };
  const granted = payload && payload.granted === true;
  if (granted) {
    voice.epoch.micGranted();
  } else {
    const errorName = payload && typeof payload.errorName === 'string'
      ? payload.errorName.slice(0, 64) : 'Error';
    voice.epoch.captureLost('permission_denied');
    voice.diagnostics.emit('voice_transcribe_error', { errorName, phase: 'permission' });
    voice = null;
  }
  pushState();
  return { ok: true };
});

ipcMain.handle('maia:voice-frame', async (_evt, payload) => {
  if (!voice) return { ok: false, reason: 'no capture session' };

  // Validate in main. A renderer may send anything; only a numeric frame of a
  // sane length is accepted, and frameMs is clamped rather than trusted.
  const raw = payload && payload.samples;
  if (!raw || typeof raw.length !== 'number' || raw.length === 0 || raw.length > 65536) {
    return { ok: false, reason: 'invalid frame' };
  }
  const frameMs = Math.max(1, Math.min(1000, Number(payload.frameMs) || 20));

  voice.frames += 1;
  for (const t of voice.vad.push(raw, frameMs)) {
    if (t === 'audio_started') voice.epoch.audioStarted();
    else if (t === 'speech_started') voice.epoch.speechStarted();
    // 'utterance_boundary' / 'long_pause' / 'speech_ended' deliberately do NOT
    // end the epoch. A pause is not a finished thought (§XII).
  }
  return { ok: true };
});

ipcMain.handle('maia:voice-capture-lost', async (_evt, payload) => {
  if (!voice) return { ok: false, reason: 'no capture session' };
  const cause = payload && typeof payload.cause === 'string'
    ? payload.cause.slice(0, 64) : 'unknown';
  const tail = voice.epoch.captureLost(cause);
  pushState();
  return { ok: true, tail };
});

ipcMain.handle('maia:voice-stop', async () => {
  if (!voice) return { ok: false, reason: 'no capture session' };
  const tail = voice.epoch.userStop();
  const text = voice.epoch.commit();
  const snapshot = voiceStateSnapshot();
  voice = null;
  pushState();
  // `chars` only — the transcript itself goes to the surface, never to telemetry.
  return { ok: true, tail, chars: text.length, snapshot };
});

ipcMain.handle('maia:voice-state', async () => voiceStateSnapshot());

ipcMain.handle('maia:status', async () => ({
  app: 'maia-desktop',
  unit: 'MAIA-D01',
  packaged: app.isPackaged,
  // Truthful by construction: an unstamped build must LOOK unstamped.
  build: process.env.MAIA_DESKTOP_BUILD_SHA || 'UNSTAMPED',
}));

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: 'MAIA Desktop — D01 native voice witness',
    backgroundColor: '#14100E',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  // Grant ONLY audio, and only to our own loaded file. Everything else — video,
  // geolocation, notifications, display capture — is refused, so the renderer
  // cannot acquire a device this unit never authorized.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(permission === 'media' || permission === 'audioCapture');
  });
  session.defaultSession.setPermissionCheckHandler((_wc, permission) =>
    permission === 'media' || permission === 'audioCapture');

  createWindow();
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

module.exports = { EPOCH_END_REASONS };
