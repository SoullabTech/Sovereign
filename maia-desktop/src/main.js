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
const { SURFACES, PROBE_SURFACE, isPermitted } = require('./surfaces');
const { createSession } = require('./session');
const { createConversation } = require('./conversation');
const { createCaptureLiveness } = require('./capture-liveness');
const { createThreadWatch } = require('./thread-watch');

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
let turnBusy = false;

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

// ── MAIA-D02A: the capture watchdog ─────────────────────────────────────────
//
// The worklet posts a block every 2.67 ms, and silence is still blocks. So the
// absence of frames is never "the member went quiet" — it is the capture graph
// having died without saying so. That is what the interface was concealing when
// it held "Listening…" for sixteen seconds against zero audio.
//
// ⛔ The tick is not the event. `check()` returns null while healthy, so this
// pushes state only on a real transition — a watchdog that broadcast every
// second would be its own kind of noise.
let captureWatchdog = null;
const threadWatch = createThreadWatch();

function startCaptureWatchdog() {
  stopCaptureWatchdog();
  captureWatchdog = setInterval(() => {
    if (!voice) return stopCaptureWatchdog();
    const t = voice.liveness.check();
    if (!t) return;
    // The epoch machine already knows how to record a capture boundary; this
    // reuses it rather than inventing a second notion of "lost".
    voice.epoch.captureLost(t.cause);
    voice.diagnostics.emit('voice_capture_lost', {
      cause: t.cause,
      source: 'watchdog',
    });
    pushState();
  }, 1000);
  if (captureWatchdog.unref) captureWatchdog.unref();
}

function stopCaptureWatchdog() {
  if (captureWatchdog) { clearInterval(captureWatchdog); captureWatchdog = null; }
}

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
  startCaptureWatchdog();
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
      void runTurn();
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
  stopCaptureWatchdog();
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

// ── the turn: transcript → MAIA → audible answer ────────────────────────────
//
// The acceptance for DESKTOP-CONVERSATION-01 is back-and-forth conversation, so
// this is the loop that matters. Every failure is surfaced to the member in
// words rather than swallowed — a companion that goes quiet after you speak is
// the failure mode this whole programme exists to avoid.
async function runTurn() {
  if (!voice || turnBusy || !conversation) return;
  const taken = voice.utterance.take();
  if (!taken) return;                    // silence or a cough, not an utterance
  turnBusy = true;
  try {
    broadcast('maia:turn', { phase: 'transcribing' });

    const t = await conversation.transcribe(taken.samples, voice.sampleRate);
    if (!t.ok) { broadcast('maia:turn', { phase: 'error', error: t.error }); return; }

    const said = (t.text || '').trim();
    if (!said) { broadcast('maia:turn', { phase: 'idle' }); return; }

    // The transcript is a FINAL for the epoch — the tail invariant now has real
    // material to protect, which on the first walk it never did.
    voice.epoch.final(said, `utt-${Date.now()}`);
    broadcast('maia:turn', { phase: 'heard', member: said });

    broadcast('maia:turn', { phase: 'thinking' });
    const a = await conversation.ask(said);
    if (!a.ok) { broadcast('maia:turn', { phase: 'error', error: a.error }); return; }

    broadcast('maia:turn', { phase: 'answered', maia: a.text });
    if (a.audio) broadcast('maia:audio', a.audio);
    else broadcast('maia:turn', { phase: 'no-voice' });
  } catch (e) {
    broadcast('maia:turn', { phase: 'error', error: (e && e.message) || 'turn failed' });
  } finally {
    turnBusy = false;
  }
}


// ── D04 — join the member's thread, do not open a new one ───────────────────
//
// Called after sign-in and at startup for a restored session. The adoption is
// a read against the server's own record of the member's conversations, so
// Desktop lands in whatever thread they were last in — on iPhone, on web, or
// here. `desktop-<timestamp>` survives only as the id for a member who has no
// history anywhere, where it is the FIRST conversation rather than a second.
async function joinMemberThread() {
  if (!conversation) return;
  const out = await conversation.adoptMemberThread();
  if (!out.ok) {
    // ⛔ A failed lookup must never silently fork the conversation. Say so.
    broadcast('maia:thread', { resumed: false, error: out.error });
    return;
  }
  const h = out.resumed ? await conversation.history() : { turns: [] };
  broadcast('maia:thread', {
    resumed: out.resumed,
    conversationId: out.sessionId,
    turns: h.turns,
  });

  // ⭐ MAIA-D04A. Adoption is no longer a one-time act at sign-in. From here
  // the window keeps watching, so a conversation continued on another surface
  // is joined without a relaunch.
  threadWatch.start(currentMemberId(), out.sessionId);
  startThreadWatch();
}

// ── MAIA-D04A — live re-adoption ────────────────────────────────────────────
//
// D04 made Desktop join the member's thread at launch. This makes it STAY
// joined: an open window notices that the canonical conversation moved and
// conforms to it.
//
// The server is authority throughout:
//   member identity → canonical conversation → Desktop observes → reconciles
// Desktop never pushes a thread state outward and holds none of its own.
const THREAD_POLL_MS = 15000;
let threadPoll = null;

/**
 * Who is signed in right now.
 *
 * ⭐ `username`, not `name`. The session's `member.name` is a DISPLAY name —
 * two members can share one, and a display name is not an identity to gate
 * adoption on. `username` is what the member authenticated as and is unique by
 * the members contract.
 *
 * Returns null when nobody is signed in, which makes every observation
 * `member_mismatch` and therefore inert. Failing closed is the right default
 * for a guard whose job is to prevent one person's conversation appearing in
 * another person's window.
 */
function currentMemberId() {
  const st = memberSession && memberSession.state();
  if (!st || !st.signedIn || !st.member) return null;
  return st.member.username || null;
}

function startThreadWatch() {
  stopThreadWatch();
  threadPoll = setInterval(() => { void pollCanonicalThread(); }, THREAD_POLL_MS);
  if (threadPoll.unref) threadPoll.unref();
}

function stopThreadWatch() {
  if (threadPoll) { clearInterval(threadPoll); threadPoll = null; }
}

async function pollCanonicalThread() {
  if (!conversation || !threadWatch.isWatching) return;

  const peek = await conversation.canonicalThreadId();
  // ⛔ A failed read is NOT an instruction to abandon the thread we hold. The
  // network being down must never fork the member's conversation, so a failure
  // is silent here and simply retried on the next tick.
  if (!peek.ok) return;

  const decision = threadWatch.observe({
    memberId: currentMemberId(),
    canonicalId: peek.sessionId,
    turnInFlight: turnBusy,
  });

  if (decision.action !== 'adopt') return;   // ignore and defer are both quiet

  // Re-adopt through the SAME path used at sign-in. There is one adoption
  // implementation and this is it — a second one would be free to drift.
  const out = await conversation.adoptMemberThread();
  if (!out.ok) return;                        // watch keeps the old id; retries

  const h = await conversation.history();
  threadWatch.noteAdopted(out.sessionId);
  broadcast('maia:thread', {
    resumed: true,
    conversationId: out.sessionId,
    turns: h.turns,
    // Lets the surface say something true about WHY the thread changed under
    // them, rather than silently redrawing.
    rejoined: true,
    from: decision.from || null,
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
    void joinMemberThread();
  }
  broadcast('maia:auth', memberSession.state());
  return out;
});

ipcMain.handle('maia:sign-out', async () => {
  memberSession.signOut();
  conversation = null;
  // ⛔ The watch dies with the session. Nothing may adopt on behalf of someone
  // who is no longer signed in.
  threadWatch.stop();
  stopThreadWatch();
  broadcast('maia:auth', memberSession.state());
  return { ok: true };
});

ipcMain.handle('maia:auth-state', async () => memberSession.state());

// ── the permission wall ─────────────────────────────────────────────────────
//
// COMPANION-01A P1. Installed PER PARTITION, and the default session is denied
// everything. Previously one handler on defaultSession granted audio to any
// window that asked; a platform surface would have inherited it.
//
// Each surface's capabilities live in surfaces.js, which is where widening
// Desktop's authority has to be argued. This function only enforces.
function installPermissionWall() {
  const wall = (partition) => {
    const ses = session.fromPartition(partition);
    ses.setPermissionRequestHandler((_wc, permission, callback) => {
      callback(isPermitted(partition, permission));
    });
    ses.setPermissionCheckHandler((_wc, permission) => isPermitted(partition, permission));
  };
  for (const s of Object.values(SURFACES)) wall(s.partition);

  // Fail closed. Anything that reaches the default session — a window created
  // without naming a partition, a future mistake — gets nothing at all.
  session.defaultSession.setPermissionRequestHandler((_wc, _p, callback) => callback(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
}

function createSurfaceWindow(surface, opts = {}) {
  const win = new BrowserWindow({
    width: opts.width || 900,
    height: opts.height || 700,
    show: opts.show !== false,
    title: opts.title || 'MAIA Desktop',
    backgroundColor: '#14100E',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: surface.partition,
      preload: path.join(__dirname, surface.preload),
    },
  });
  win.loadFile(path.join(__dirname, surface.entry));
  return win;
}

function createWindow() {
  mainWindow = createSurfaceWindow(SURFACES.voice, {
    title: 'MAIA Desktop — D01 native voice witness',
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  installPermissionWall();

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
    mainWindow.webContents.once('did-finish-load', () => { void joinMemberThread(); });
  }
});

// Negative proof for the wall, dev-only. Opens a platform-partition window that
// asks for the microphone exactly as web code would; main must refuse it.
//   MAIA_DESKTOP_PLATFORM_PROBE=1 electron .
if (process.env.MAIA_DESKTOP_PLATFORM_PROBE === '1') {
  app.whenReady().then(() => {
    const probe = createSurfaceWindow(PROBE_SURFACE, {
      width: 640, height: 420, title: 'COMPANION-01A — platform permission probe',
    });
    ipcMain.handle('maia:probe-report', async (_e, r) => {
      console.log('[COMPANION-01A] platform probe:', JSON.stringify(r));
      return { ok: true };
    });
    probe.on('closed', () => {});
  });
}

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

module.exports = { EPOCH_END_REASONS, installPermissionWall, createSurfaceWindow };
