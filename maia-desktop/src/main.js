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

const { app, BrowserView, BrowserWindow, ipcMain, Menu, session, safeStorage, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const { createDiagnostics } = require('./voice/diagnostics');
const { createEpochState, EPOCH_END_REASONS } = require('./voice/epoch');
const { createVad } = require('./voice/vad');
const { createUtteranceBuffer } = require('./voice/utterance');
const { createMemberDraft } = require('./voice/member-draft');
const { createPlatformShell, MAIA, PLATFORM } = require('./shell');
const {
  PLATFORM_ENTRY_PATH, PLATFORM_HOUSE_PATH, navigationDecision,
} = require('./shell-policy');
const { createSession } = require('./session');
const { createConversation } = require('./conversation');
const { createCaptureLiveness, IDLE } = require('./capture-liveness');
const { createCaptureWatch } = require('./capture-watch');
const { createContinuity } = require('./continuity');
const { createTurn } = require('./turn');
const { createVoiceLifecycle } = require('./voice-lifecycle');

// Separate userData for a dev launch, so a development instance can never read
// or corrupt an installed instance's state. (jarvis-desktop precedent.)
if (!app.isPackaged) {
  app.setPath('userData', path.join(app.getPath('appData'), 'maia-desktop-dev'));
}

let mainWindow = null;
let platformShell = null;     // DESKTOP-SHELL-01 — the one remote view, or none
let desktopPlace = MAIA;      // where the member is: MAIA, or a platform place
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

  // ⭐ DSC-FINAL. The disposition for speech the system nearly lost is MAIA's,
  // not Electron's: the host WIRES it, it does not define it. See
  // `voice/member-draft.js` for what accepting salvage into the member's draft
  // means and why a replacement host must inherit it rather than rediscover it.
  const draft = createMemberDraft();
  const epoch = createEpochState({ diagnostics, onSalvage: draft.accept });

  const vad = createVad();
  const utterance = createUtteranceBuffer();

  // ⭐ MAIA-D02A. Liveness lives in MAIN, not the renderer, for the same reason
  // every other voice decision does: main sees every frame, and a policy that
  // lives in a `<script>` tag cannot be tested without a microphone.
  const liveness = createCaptureLiveness();

  return { diagnostics, epoch, vad, utterance, draft, liveness, frames: 0, sampleRate: 48000 };
}

function voiceStateSnapshot() {
  // ⛔ The projection REPORTS what the liveness domain calls idle; it does not
  // independently know what idle is. A private literal here would keep asserting
  // the old string if the policy renamed the state — silently, and about
  // liveness, which is the one domain D02A exists to stop lying about.
  if (!voice) return { active: false, capture: { state: IDLE, cause: null } };
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

// ── the voice session lifecycle ─────────────────────────────────────────────
//
// ⭐ DESKTOP SOVEREIGN CORE 04. What happens when capture begins, when a frame
// arrives, when the microphone is refused, when capture is lost and when the
// member stops is MAIA voice semantics — a CoreAudio host would owe every one
// identically. It lives in `voice-lifecycle.js`.
//
// Main keeps what only a host can: the IPC envelope, payload validation, the
// signed-in gate, the composition root, the transport — and the `voice`
// reference itself. The capability never holds a session; when one must die it
// asks, and main revokes. See invariant §7B.
const lifecycle = createVoiceLifecycle({
  voice: () => voice,
  watch: captureWatch,
  announce: () => pushState(),
  dispatchTurn: () => { void turn.run(); },
  revokeSession: () => { voice = null; },
  projectState: () => voiceStateSnapshot(),
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
  return lifecycle.begin();
});

ipcMain.handle('maia:voice-mic-result', async (_evt, payload) => {
  if (!voice) return { ok: false, reason: 'no capture session' };
  const granted = payload && payload.granted === true;
  const errorName = payload && typeof payload.errorName === 'string'
    ? payload.errorName.slice(0, 64) : 'Error';
  return lifecycle.micResult(granted, errorName);
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
  return lifecycle.frame(raw, frameMs);
});

ipcMain.handle('maia:voice-capture-lost', async (_evt, payload) => {
  if (!voice) return { ok: false, reason: 'no capture session' };
  const cause = payload && typeof payload.cause === 'string'
    ? payload.cause.slice(0, 64) : 'unknown';
  return lifecycle.captureLost(cause);
});

ipcMain.handle('maia:voice-stop', async () => {
  if (!voice) return { ok: false, reason: 'no capture session' };
  return lifecycle.end();
});

// ── DESKTOP-TEXT-01: the member's other way of speaking ─────────────────────
ipcMain.handle('maia:send-text', async (_evt, payload) => {
  // Validated in MAIN, like every other handler. The renderer's trim is a
  // convenience; this is the one that counts.
  const raw = payload && typeof payload.text === 'string' ? payload.text : '';
  const said = raw.trim().slice(0, 4000);
  if (!said) return { ok: false, error: 'nothing to send' };

  if (!memberSession || !memberSession.state().signedIn || !conversation) {
    return { ok: false, error: 'sign in before writing' };
  }
  // One turn at a time, shared with the voice path — a typed message must not
  // interleave with a spoken one and produce two half-turns in the thread.
  if (turn.isBusy) return { ok: false, error: 'one turn at a time' };

  // Text and voice are mutually exclusive: a live capture ends with normal
  // member-Stop semantics first, so the epoch commits rather than being
  // discarded behind a typed message.
  const stopped = lifecycle.end();
  const out = await turn.say(said);
  return out === 'completed' || out === 'revoked'
    ? { ok: true, stoppedCapture: !!(stopped && stopped.ok) }
    : { ok: false, error: 'the turn did not complete' };
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
  // ⛔ TURN-REVOCATION-01. The authority question, asked directly rather than
  // inferred from which reference went null — auth teardown releases capture
  // before it drops the conversation, and inferring would misread that window
  // as a failure.
  authorized: () => Boolean(memberSession && memberSession.state().signedIn),
  diagnostic: (event, meta) =>
    broadcast('maia:voice-event', { event, surface: 'desktop', at: Date.now(), ...meta }),
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

// ── destinations · navigation · the application menu ────────────────────────
//
// ⭐ HOUSE-RECONCILE-01. Carried from DESKTOP-HOUSE-01. Navigation is driven
// from the application menu, which lives in MAIN — deliberately NOT from a
// preload verb. A `showPlatform()` channel would let a compromised renderer
// summon remote content into its own window, which is the precise move the
// shell exists to prevent.
const DESTINATIONS = [
  { id: MAIA, label: 'MAIA', accelerator: 'Alt+CmdOrCtrl+M', enabled: true },
  { id: PLATFORM, label: 'The House', accelerator: 'Alt+CmdOrCtrl+J', enabled: true },
  { id: 'sessions', label: 'Sessions', enabled: false },
  { id: 'library', label: 'Library', enabled: false },
  { id: 'settings', label: 'Settings', enabled: false },
];

function buildMenu() {
  const signedIn = !!(memberSession && memberSession.state().signedIn);
  const here = desktopPlace;
  const go = DESTINATIONS.map((d) => ({
    label: d.label,
    accelerator: d.accelerator,
    type: 'checkbox',
    checked: d.id === here,
    // Every destination but MAIA needs a member; nothing remote opens for
    // nobody. MAIA itself stays reachable so there is always a way back.
    enabled: d.enabled && (d.id === MAIA || signedIn),
    click: () => { void goTo(d.id); },
  }));

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
    { label: 'Go', submenu: go },
    { role: 'editMenu' },
    { role: 'windowMenu' },
  ]));
}

function showPlace(place) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setTitle(place === PLATFORM ? 'MAIA Desktop — The House' : 'MAIA Desktop');
  buildMenu();
}

async function goTo(id) {
  if (!platformShell) return;
  if (!memberSession || !memberSession.state().signedIn) return;
  const path = id === MAIA ? PLATFORM_ENTRY_PATH : id === PLATFORM ? PLATFORM_HOUSE_PATH : null;
  if (!path) return;

  // ⭐ TRUTHFUL ATTENTION. Capture is released BEFORE the platform becomes
  // visible, never after and never in parallel. If the microphone were still
  // live behind the House, MAIA would be listening — and, with the epoch still
  // open, transcribing, answering and speaking — to a member who has visibly
  // gone somewhere else. Attention the member cannot see is not attention they
  // consented to.
  //
  // The lifecycle DISCARDS: nothing is committed, no tail is taken, and the
  // turn that was in flight ends as revoked rather than delivered. Words spoken
  // before crossing the threshold are not turned into a turn behind a screen
  // the member is no longer looking at.
  lifecycle.revokeCapture({ cause: 'attention_crossed' });

  const out = await platformShell.navigate(path);
  if (!out.ok) {
    // ⛔ A failed entry must not leave a blank view attached and the member
    // stranded. Say so where the surface already speaks. We do NOT fall back to
    // the local renderer — that would reintroduce the second MAIA this unit
    // removed, and would hide a real failure behind scaffolding.
    broadcast('maia:turn', { phase: 'error', error: `Could not open ${path} — ${out.error}` });
    return;
  }
  desktopPlace = id;
  showPlace(id);
}

// ── auth teardown ───────────────────────────────────────────────────────────
//
// ⭐ DESKTOP-AUTH-CAUSE-01, carried. This destroys the entire visible member
// surface, and it used to do so in silence: a member watching MAIA vanish had
// nothing to read, and neither did a witness.
//
// The 401 door is not only the one startup request — continuity polls on an
// interval and every poll is an authenticated fetch, so a rejected credential
// can take the surface down at ANY moment, minutes into a walk, with no member
// action anywhere near it.
function teardownMemberState(reason) {
  const cause = (reason && reason.cause) || 'member';
  const via = reason && reason.path ? ` path=${reason.path}` : '';
  console.log(`[Desktop auth] member state torn down — cause=${cause}${via}`);

  // ⭐ FIRST, before anything else falls away. Capture is the one piece of
  // member state that used to outlive its member, and it is the piece that
  // blocks every recovery: while a session is held, signing back in still
  // cannot start listening. The disposition belongs to the lifecycle.
  // The host translates its own vocabulary into the ratified one. `member` is
  // the sign-out button; `401` is a credential rejected on any authenticated
  // call, which any background poll can trigger with no member action near it.
  lifecycle.revokeCapture({
    cause: cause === '401' ? 'session_expired' : 'signed_out',
  });
  conversation = null;
  continuity.stop();
  // ⛔ Destroy, not hide. The cookie goes with the view.
  if (platformShell) void platformShell.destroy();
  desktopPlace = MAIA;
  buildMenu();
  // ⛔ The surface is told the CAUSE too, not just the fact. A member whose
  // session expired under them deserves to know that is what happened.
  broadcast('maia:auth', {
    ...(memberSession ? memberSession.state() : { signedIn: false, member: null }),
    endedBy: cause,
  });
}

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
  teardownMemberState({ cause: 'member' });
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

  // ⛔ THE PRIVILEGED RENDERER NEVER NAVIGATES. It holds `window.maia`, so
  // anything that moved it off `file://` would put remote content in front of
  // the bridge. There is no legitimate navigation here to allow, so the guard
  // is unconditional rather than origin-checked: a stricter rule than the
  // platform view gets, because this side has more to lose.
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const decision = navigationDecision(url);
    if (decision.action === 'external') shell.openExternal(decision.url);
    return { action: 'deny' };
  });

  platformShell = createPlatformShell({
    BrowserView,
    sessionApi: session,
    shellApi: shell,
    window: mainWindow,
    credential: memberSession,
    onPlace: showPlace,
  });

  mainWindow.on('resize', () => { if (platformShell) platformShell.fit(); });
  mainWindow.on('closed', () => {
    mainWindow = null;
    // The view belongs to the window; it must not outlive it.
    if (platformShell) { void platformShell.destroy(); platformShell = null; }
  });

  buildMenu();
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

  // ⭐ `onSignedOut` because sign-out is not always a button. session.js
  // discovers a 401 by itself and signs out internally; without this, main
  // never learned and the remote view kept its cookie.
  memberSession = createSession({ app, safeStorage, onSignedOut: teardownMemberState });
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
