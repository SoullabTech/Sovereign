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

const { app, BrowserWindow, ipcMain, session, safeStorage } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const { createDiagnostics } = require('./voice/diagnostics');
const { createEpochState, EPOCH_END_REASONS } = require('./voice/epoch');
const { createVad } = require('./voice/vad');
const { createUtteranceBuffer } = require('./voice/utterance');
const { createSession } = require('./session');
const { createConversation } = require('./conversation');
const { createCaptureLiveness } = require('./capture-liveness');
const { createCaptureWatch } = require('./capture-watch');
const { createContinuity } = require('./continuity');
const { createTurn } = require('./turn');

// Separate userData for a dev launch, so a development instance can never read
// or corrupt an installed instance's state. (jarvis-desktop precedent.)
if (!app.isPackaged) {
  app.setPath('userData', path.join(app.getPath('appData'), 'maia-desktop-dev'));
}

let mainWindow = null;
let memberSession = null; // member session — survives capture start/stop
let conversation = null; // one continuity for this run

// ── voice session, owned entirely by main ───────────────────────────────────
let voice = null;

function broadcast(channel, payload) {
  for (const w of BrowserWindow.getAllWindows()) {
    if (!w.isDestroyed()) w.webContents.send(channel, payload);
  }
}

// ── device-witness evidence sink (MAIA-D01 device closure) ──────────────────
//
// ADDITIVE, and deliberately OUTSIDE the capture path: it observes the same
// records the surface already receives and appends them to a JSONL file. It
// touches no frame, no VAD state, no epoch state, and no bridge channel — tests
// assert that, so "outside the capture path" is checkable rather than claimed.
//
// It exists because the founder walk must be judged on diagnostic evidence, not
// on whether the final transcript "looks mostly right". Reading events off a
// screen and recalling them afterwards is the kind of witness this programme
// keeps having to correct.
//
// Records are already privacy-refusing at the emitter: it throws on transcript
// text, so nothing this sink can write contains member speech. It forwards the
// emitted record verbatim and appends one number; it never composes a record of
// its own, which would put content on disk the emitter never vetted.
let witnessStream = null;
function witnessPath() {
  const dir = path.join(app.getPath('userData'), 'witness');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, `d01-witness-${Date.now()}.jsonl`);
}
function witnessWrite(record, frames) {
  if (!witnessStream) return;
  try { witnessStream.write(JSON.stringify({ ...record, frames }) + '\n'); }
  catch { /* evidence capture must never break capture */ }
}

function newVoiceSession() {
  if (!witnessStream) {
    const p = witnessPath();
    witnessStream = fs.createWriteStream(p, { flags: 'a' });
    console.log(`[D01 witness] evidence → ${p}`);
  }
  const diagnostics = createDiagnostics(
    (event, record) => {
      broadcast('maia:voice-event', record);
      witnessWrite(record, voice ? voice.frames : 0);
    },
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
  const utterance = createUtteranceBuffer();

  // ⭐ MAIA-D02A. Liveness lives in MAIN, not the renderer, for the same reason
  // every other voice decision does: main sees every frame, and a policy that
  // lives in a `<script>` tag cannot be tested without a microphone.
  const liveness = createCaptureLiveness();

  return { diagnostics, epoch, vad, utterance, draft, liveness, frames: 0, sampleRate: 48000 };
}

function voiceStateSnapshot() {
  if (!voice) return { active: false, capture: { state: 'idle', cause: null } };
  return {
    active: true,
    ...voice.epoch.snapshot(),
    vad: voice.vad.state(),
    draft: voice.draft.length,
    // ⭐ MAIA-D02A. The surface may present "Listening…" only when
    // `capture.state === 'listening'`. Carried on the already-ratified
    // `maia:voice-state-changed` channel rather than a new one — the preload
    // doctrine says an added channel must argue for itself, and this one does
    // not need to: the snapshot already exists and already reaches the surface.
    capture: {
      state: voice.liveness.state,
      cause: voice.liveness.cause,
      recoveriesUsed: voice.liveness.recoveriesUsed,
    },
  };
}

function pushState() { broadcast('maia:voice-state-changed', voiceStateSnapshot()); }

// ── MAIA-D02A: capture supervision ──────────────────────────────────────────
//
// ⭐ DESKTOP SOVEREIGN CORE 03. The liveness POLICY was already portable
// (`capture-liveness.js` — a decision function over a clock). What main was
// holding was the supervision around it: the cadence, what a detected loss
// means for the epoch and the diagnostic record, and when supervision stops
// itself. That moved to `capture-watch.js`. Main still supplies the two things
// only a host can: the timer primitive and the transport.
const captureWatch = createCaptureWatch({
  voice: () => voice,
  announce: () => pushState(),
});

// ── IPC — every handler validates in MAIN; nothing is taken on trust ────────

ipcMain.handle('maia:voice-start', async (_evt, payload) => {
  if (voice) return { ok: false, reason: 'already capturing' };
  if (!memberSession || !memberSession.state().signedIn) {
    return { ok: false, reason: 'sign in before speaking' };
  }
  voice = newVoiceSession();
  // Clamped in MAIN. A wrong sample rate produces a WAV header that lies, and
  // Whisper would transcribe a chipmunk or a drawl rather than the member.
  const sr = Number(payload && payload.sampleRate);
  voice.sampleRate = Number.isFinite(sr) && sr >= 8000 && sr <= 192000 ? Math.round(sr) : 48000;
  voice.epoch.startEpoch();
  voice.liveness.arm();
  captureWatch.start();
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

  // ⭐ MAIA-D02A. Audio is arriving, so the capture graph is alive. If a loss
  // was detected and a rebuild was in flight, this is the proof it worked.
  if (voice.liveness.noteFrame()) pushState();

  // ⭐ CLASS E REPAIR (device walk 2026-08-27). The buffer used to not exist:
  // the VAD ran and every sample was dropped, so transcription was unreachable.
  // Frames accumulate CONTINUOUSLY — not from `speech_started` — because the VAD
  // needs consecutive frames to confirm speech, so starting the buffer at the
  // acknowledgement would clip the first syllable of every utterance.
  const frame = raw instanceof Float32Array ? raw : Float32Array.from(raw);
  voice.utterance.push(frame);

  for (const t of voice.vad.push(frame, frameMs)) {
    if (t === 'audio_started') voice.epoch.audioStarted();
    else if (t === 'speech_started') voice.epoch.speechStarted();
    else if (t === 'utterance_boundary') {
      // An utterance ended, so a final may be requested. This still does NOT end
      // the epoch — capture keeps running through the pause (§XII).
      void turn.run();
    }
  }
  return { ok: true };
});

ipcMain.handle('maia:voice-capture-lost', async (_evt, payload) => {
  if (!voice) return { ok: false, reason: 'no capture session' };
  const cause = payload && typeof payload.cause === 'string'
    ? payload.cause.slice(0, 64) : 'unknown';
  const tail = voice.epoch.captureLost(cause);
  // ⭐ MAIA-D02A. `track_ended` and `track_muted` used to reach main and change
  // nothing the member could see. Routing them through the same state machine
  // as silent death means all three losses produce the same visible truth.
  voice.liveness.lost(cause);
  pushState();
  return { ok: true, tail };
});

ipcMain.handle('maia:voice-stop', async () => {
  if (!voice) return { ok: false, reason: 'no capture session' };
  voice.liveness.disarm();
  captureWatch.stop();
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

// ── the turn ────────────────────────────────────────────────────────────────
//
// ⭐ DESKTOP SOVEREIGN CORE 02. What a turn MEANS — its ordering, its guard, its
// failure and completion semantics — lives in `turn.js`, Electron-free. What
// main keeps is the transport: announcing a phase to a window, and handing
// audio to the renderer because only it has an output device.
//
// `turnBusy` moved with it. It was never host state: it is the turn's own
// in-flight flag, which main merely happened to hold. Continuity reads it
// through the same accessor it always did.
const turn = createTurn({
  conversation: () => conversation,
  voice: () => voice,
  announce: (payload) => broadcast('maia:turn', payload),
  speak: (audio) => broadcast('maia:audio', audio),
});

// ── conversation continuity ─────────────────────────────────────────────────
//
// ⭐ DESKTOP SOVEREIGN CORE 01. Joining the member's canonical thread and
// staying joined to it are MAIA semantics, not Electron's, and they now live in
// `continuity.js` where a native host could reuse them. What main keeps is what
// only a host can supply: the transport that carries the announcement to a
// window, and the answer to "is a turn in flight right now".
const continuity = createContinuity({
  conversation: () => conversation,
  session: () => memberSession,
  publish: (payload) => broadcast('maia:thread', payload),
  turnInFlight: () => turn.isBusy,
});

// ── auth IPC — the token never crosses the bridge ───────────────────────────

ipcMain.handle('maia:sign-in', async (_evt, payload) => {
  const username = typeof payload?.username === 'string' ? payload.username.slice(0, 200) : '';
  const password = typeof payload?.password === 'string' ? payload.password.slice(0, 400) : '';
  if (!username || !password) return { ok: false, error: 'username and password are required' };
  const out = await memberSession.signIn(username, password);
  if (out.ok) {
    conversation = createConversation({
      session: memberSession,
      diagnostics: { emit: (e, m) => broadcast('maia:voice-event', { event: e, surface: 'desktop', at: Date.now(), ...m }) },
      sessionId: `desktop-${Date.now()}`,
    });
    void continuity.join();
  }
  broadcast('maia:auth', memberSession.state());
  return out;
});

ipcMain.handle('maia:sign-out', async () => {
  memberSession.signOut();
  conversation = null;
  continuity.stop();
  broadcast('maia:auth', memberSession.state());
  return { ok: true };
});

ipcMain.handle('maia:auth-state', async () => memberSession.state());

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

  memberSession = createSession({ app, safeStorage });
  if (memberSession.state().signedIn) {
    conversation = createConversation({
      session: memberSession,
      diagnostics: { emit: (e, m) => broadcast('maia:voice-event', { event: e, surface: 'desktop', at: Date.now(), ...m }) },
      sessionId: `desktop-${Date.now()}`,
    });
  }

  createWindow();
  // After the window exists, so the restored thread has somewhere to land.
  if (memberSession.state().signedIn) {
    mainWindow.webContents.once('did-finish-load', () => { void continuity.join(); });
  }
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

module.exports = { EPOCH_END_REASONS };
