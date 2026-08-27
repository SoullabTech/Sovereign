// JARVIS Desktop — Alpha. A separate operational surface from MAIA Desktop.
// Presentation layer ONLY. All logic is canonical Builder OS / router state,
// read or invoked via the same code paths terminal execution uses. No
// business logic is duplicated here, and no arbitrary shell execution is
// exposed to the renderer.
const { app, BrowserWindow, ipcMain, dialog, Menu, shell, clipboard } = require('electron');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { buildManifest } = require('./capability-form.js');
const PROV = require('./provenance.js');
const GOV = require('./governance.js');
const RepoConfig = require('./repo-config.js');
const { childEnv, resolveNodeBinary } = require('./child-env.js');
const MECH = require('./builder-mechanism.js');
// C1 evidence containment: correctness is decided from canonical evidence, never
// from the worker's self-report. The verifier itself stays in scripts/builder —
// a Desktop-local copy would fork it and defeat the containment.
const { decideCorrectness } = require('./correctness');
// JARVIS-STAB-01..04 — run custody, programme state, and the C3 handoff loop.
// All four are pure or store-backed; none of them adds execution authority.
const RUNS = require('./task-runs.js');
const PS = require('./programme-state.js');
const PACKET = require('./execution-packet.js');
const RECEIPT = require('./evidence-receipt.js');

// ---------------------------------------------------------------------------
// Instance identity.
//
// The single-instance lock below is keyed on the userData directory, which
// Electron derives from the app name — so the dev build and the installed
// build were requesting the SAME lock. Whichever started first won, and the
// other called app.quit() and exited 0 with no output. That is precisely the
// "JARVIS.app won't launch" symptom investigated on 2026-08-11: a dev instance
// had been holding the lock since 19:48, and `killall JARVIS` never matched it
// because the dev process is named `Electron`, not `JARVIS`.
//
// The F5 comment below says "one lock per artifact identity". That was the
// intent; keying on the app name did not implement it. Dev and packaged are
// genuinely different artifacts operating potentially different substrates, so
// they get genuinely different userData — and therefore different locks. Two
// packaged copies still collide, which is what F5 actually wanted to prevent.
if (!app.isPackaged) {
  app.setPath('userData', path.join(app.getPath('appData'), 'jarvis-desktop-dev'));
}

// ---------------------------------------------------------------------------
// Runtime-root contract. Packaged mode's __dirname resolves inside
// Contents/Resources/app.asar, which is NOT physically nested inside the
// Sovereign git checkout — upward directory discovery can never reach it
// there (found by screenshot-verifying the first packaged build: every
// subsystem showed UNKNOWN despite dev mode working correctly). Dev and
// packaged modes are therefore handled as explicitly distinct cases, keyed
// off Electron's own app.isPackaged rather than inferred from walk failure.
//
// A candidate root is valid only if ALL FOUR canonical markers are present —
// existence of a directory alone is not accepted as AVAILABLE.
// ---------------------------------------------------------------------------
const CANONICAL_MARKERS = [
  ['scripts', 'builder', 'session.mjs'],
  ['scripts', 'builder', 'deterministic.mjs'],
  ['scripts', 'builder', 'router.mjs'],
  ['package.json'],
];
function isValidRepoRoot(dir) {
  return CANONICAL_MARKERS.every((parts) => fs.existsSync(path.join(dir, ...parts)));
}

function findRepoRootDevMode(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (isValidRepoRoot(dir)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// The installed app must find its substrate without Terminal help, so the
// order below is: what the founder explicitly named (env, then persisted
// config), and only then the hard-coded candidate — which stays DEGRADED
// because nobody chose it. Nothing here binds to a Claude worktree: worktrees
// are development substrates and are expected to disappear.
//
// A configured root is RE-VERIFIED on every launch, not trusted because it was
// once valid. A repo that has been moved or deleted must read as a problem the
// founder can see and fix, not as a silent fallback to somewhere else.
function findRepoRootPackagedMode() {
  const cfgForConflict = RepoConfig.readConfig(app.getPath('appData'));

  if (process.env.JARVIS_REPO_ROOT && isValidRepoRoot(process.env.JARVIS_REPO_ROOT)) {
    // An environment variable outranking a saved choice is defensible — but
    // only if the founder can SEE it. On macOS this variable can be set at the
    // launchd level (`launchctl setenv`), in which case every Finder, Dock and
    // Spotlight launch inherits it invisibly and no Terminal is involved. A
    // founder who then picks a repository in Preferences would watch the app
    // keep using a different one, with nothing on screen explaining why. That
    // is the exact failure this app's provenance discipline exists to prevent,
    // so the conflict is reported rather than silently resolved.
    const conflict =
      cfgForConflict.present && cfgForConflict.repo_root !== process.env.JARVIS_REPO_ROOT
        ? `JARVIS_REPO_ROOT is set in the launch environment (${process.env.JARVIS_REPO_ROOT}) and OVERRIDES your saved choice (${cfgForConflict.repo_root}). If it is set at the launchd level, every Finder/Dock launch inherits it. Clear it with:  launchctl unsetenv JARVIS_REPO_ROOT  (then quit and relaunch JARVIS).`
        : null;
    return {
      root: process.env.JARVIS_REPO_ROOT,
      resolution: PROV.RESOLUTION.ENV,
      configProblem: conflict,
      // Structured, not just prose: the provenance surface needs the fact, not
      // the sentence, so it can degrade rather than re-parse a message.
      conflictingConfigRoot: conflict ? cfgForConflict.repo_root : null,
    };
  }

  const cfg = cfgForConflict;
  if (cfg.present && isValidRepoRoot(cfg.repo_root)) {
    return { root: cfg.repo_root, resolution: PROV.RESOLUTION.CONFIG, configProblem: null, conflictingConfigRoot: null };
  }
  // Distinguish "configured but no longer valid" from "never configured" —
  // they need different responses and the founder deserves to know which.
  const configProblem = cfg.problem
    ? cfg.problem
    : cfg.present
      ? `configured repository no longer carries the canonical markers: ${cfg.repo_root}`
      : null;

  if (isValidRepoRoot('/Users/soullab/MAIA-SOVEREIGN')) {
    return { root: '/Users/soullab/MAIA-SOVEREIGN', resolution: PROV.RESOLUTION.DEFAULT, configProblem, conflictingConfigRoot: null };
  }
  return { root: null, resolution: PROV.RESOLUTION.NONE, configProblem, conflictingConfigRoot: null };
}

// Dev mode resolves by upward walk FIRST, because running `npm start` from
// inside a checkout is an explicit statement about which substrate you mean,
// and it must keep outranking a saved choice made on some earlier day.
//
// JOP-04 defect (founder walk, 2026-08-17). The walk used to be dev mode's
// ONLY step: a dev launch from a checkout missing the canonical markers fell
// straight to NONE, ignoring JARVIS_REPO_ROOT and the persisted choice that
// packaged mode honours — so Work answered "repo root not found — cannot
// route" while a perfectly valid saved workspace sat unread in config.json,
// and every dependent System row read UNKNOWN. Dev mode was the mode without
// a durable resolver, which is backwards: dev is where checkouts move, get
// rebased onto branches that predate the builder cluster, and lose markers.
//
// The walk keeps its precedence; it now falls THROUGH to the same env →
// config → default ladder instead of off a cliff. No new resolution source is
// introduced and no fallback is silent — the ladder each step reports is the
// one packaged mode already reports, so Preferences and the provenance
// surface explain a dev binding exactly as they explain a packaged one.
// The ORDER lives in repo-resolution.js so it can be proven without Electron;
// the SOURCES stay here, so each one still has exactly one implementation.
const { resolveDevMode } = require('./repo-resolution');

// Mutable: Preferences can rebind the substrate at runtime. Everything that
// reads it does so through currentRoot() rather than closing over the value,
// so a rebind takes effect without a relaunch.
let RESOLVED = app.isPackaged
  ? findRepoRootPackagedMode()
  : resolveDevMode({
      walk: () => findRepoRootDevMode(__dirname),
      ladder: findRepoRootPackagedMode,
      launchedFrom: () => __dirname,
      RESOLUTION: PROV.RESOLUTION,
    });
function currentRoot() { return RESOLVED.root; }
const REPO_ROOT_MODE = app.isPackaged ? 'packaged' : 'dev';

// --- F3: artifact identity, stamped at package time -----------------------
//
// The stamp is read from Contents/Resources/, NOT from __dirname (the source
// tree). It used to be written to src/build-info.json by `npm run stamp`, which
// meant a packaging run left a file behind that a later `npm start` would read
// and report as its own build identity. Two independent guards now:
//
//   1. Location — the stamp is generated into build/ and shipped as an
//      extraResource, so it physically cannot appear in src/ and a dev process
//      has nothing to pick up.
//   2. Gate — unpackaged returns null before touching the filesystem at all, so
//      even a stamp restored into place by hand cannot elevate a dev identity.
//
// The second guard is the load-bearing one: it is a fact about THIS process
// rather than about what happens to be on disk near it.
function readBuildInfo() {
  if (!app.isPackaged) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(process.resourcesPath, 'build-info.json'), 'utf8'));
  } catch {
    return null;
  }
}

// --- F3: substrate identity, read from the checkout that actually executes -
//
// `git_connected` is reported as its own fact rather than inferred from
// `head !== null`. A path can be a real directory, carry all four canonical
// markers, and still not be a git worktree — and the founder's response to
// "this is not a repository" is different from "this is a repository I could
// not read". Collapsing the two would put the Home panel in the position of
// guessing which one it is looking at.
//
// `branch` is empty on a detached HEAD, which is a legitimate state for a
// worktree cut at a SHA — reported as 'detached' rather than as a failure.
function readSubstrateVersion(root) {
  const unread = { head: null, dirty: null, branch: null, git_connected: false };
  if (!root) return unread;
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: childEnv(process.env).env }).trim();
  try {
    // Ask git whether this is a worktree FIRST — before reading anything from
    // it — so a non-repository is named as such instead of surfacing as an
    // unexplained read failure three fields later.
    if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') return unread;
    const head = git(['rev-parse', '--short', 'HEAD']);
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    const porcelain = execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8', env: childEnv(process.env).env });
    return {
      head,
      dirty: porcelain.trim().length > 0,
      branch: branch === 'HEAD' ? 'detached' : branch,
      git_connected: true,
    };
  } catch {
    return unread;
  }
}

function currentProvenance() {
  const sub = readSubstrateVersion(currentRoot());
  return PROV.describeProvenance({
    buildInfo: readBuildInfo(),
    isPackaged: app.isPackaged,
    repoRoot: currentRoot(),
    resolution: RESOLVED.resolution,
    conflictingConfigRoot: RESOLVED.conflictingConfigRoot || null,
    head: sub.head,
    dirty: sub.dirty,
  });
}

// F5: two JARVIS builds running at once made every reading ambiguous during
// the 2026-08-11 walk. One lock per artifact identity; the title then names
// which artifact this window is, so two windows can never be confused again.
// The `return` is load-bearing, not tidiness: app.quit() only *requests* the
// quit, so without it the whole module kept initialising — registering IPC
// handlers and a whenReady window — while shutting down. Whatever it did in
// that window it did silently, which is part of why this exit was so hard to
// read from the outside.
if (!app.requestSingleInstanceLock()) {
  app.quit();
  return;
}
app.on('second-instance', () => {
  if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
});

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 880,
    height: 640,
    title: PROV.windowTitle(currentProvenance().artifact),
    backgroundColor: '#0a0b0d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Re-assert after load: a page-supplied document.title would otherwise
  // replace the artifact identity, which is the one thing this title is for.
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle(PROV.windowTitle(currentProvenance().artifact));
  });
}

// ---------------------------------------------------------------------------
// Substrate binding at runtime — Preferences.
//
// Rebinding is deliberately NOT a silent convenience. It re-verifies the
// candidate against the same canonical markers used at startup, refuses
// anything that fails them, and persists only what passed. A rejected
// selection leaves the previous binding untouched: a mistyped or moved folder
// must never quietly detach the console from its substrate.
// ---------------------------------------------------------------------------
let prefsWindow = null;

function repoConfigState() {
  const cfg = RepoConfig.readConfig(app.getPath('appData'));
  const root = currentRoot();
  return {
    active_repo_root: root,
    resolution: RESOLVED.resolution,
    valid: root ? isValidRepoRoot(root) : false,
    mode: REPO_ROOT_MODE,
    config_path: cfg.path,
    config_present: cfg.present,
    config_repo_root: cfg.repo_root,
    config_set_at: cfg.set_at,
    config_set_by: cfg.set_by,
    problem: RESOLVED.configProblem || cfg.problem || null,
    // Named so the Preferences surface can explain WHY a root is degraded
    // rather than just colouring it — the DEFAULT case is the one a founder
    // most needs to notice and convert into a deliberate choice.
    explicit: RESOLVED.resolution === PROV.RESOLUTION.CONFIG || RESOLVED.resolution === PROV.RESOLUTION.ENV,
    markers: CANONICAL_MARKERS.map((parts) => parts.join('/')),
  };
}

function broadcastRepoChange() {
  const state = repoConfigState();
  for (const w of BrowserWindow.getAllWindows()) {
    if (!w.isDestroyed()) w.webContents.send('jarvis:repo-changed', state);
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setTitle(PROV.windowTitle(currentProvenance().artifact));
  }
}

function bindRepoRoot(candidate, setBy) {
  if (!candidate) return { ok: false, reason: 'no directory chosen' };
  if (!isValidRepoRoot(candidate)) {
    return {
      ok: false,
      reason: `Not a canonical Sovereign checkout — missing one or more required markers (${CANONICAL_MARKERS.map(p => p.join('/')).join(', ')}).`,
      candidate,
    };
  }
  RepoConfig.writeConfig(app.getPath('appData'), candidate, setBy);
  RESOLVED = { root: candidate, resolution: PROV.RESOLUTION.CONFIG, configProblem: null, conflictingConfigRoot: null };
  broadcastRepoChange();
  return { ok: true, reason: null, candidate };
}

async function chooseRepoInteractive(parentWindow) {
  const res = await dialog.showOpenDialog(parentWindow || mainWindow || null, {
    title: 'Choose the Sovereign repository JARVIS should operate against',
    message: 'Select a checkout carrying the canonical Builder OS markers.',
    properties: ['openDirectory'],
    defaultPath: currentRoot() || app.getPath('home'),
    buttonLabel: 'Use this repository',
  });
  if (res.canceled || !res.filePaths || !res.filePaths.length) {
    return { ok: false, reason: 'cancelled', candidate: null };
  }
  const out = bindRepoRoot(res.filePaths[0], 'preferences');
  if (!out.ok) {
    await dialog.showMessageBox(parentWindow || mainWindow || null, {
      type: 'warning',
      message: 'That folder is not a Sovereign checkout',
      detail: `${out.reason}\n\nThe previous binding is unchanged.`,
      buttons: ['OK'],
    });
  }
  return out;
}

function openPreferences() {
  if (prefsWindow && !prefsWindow.isDestroyed()) { prefsWindow.focus(); return; }
  prefsWindow = new BrowserWindow({
    width: 620,
    height: 460,
    title: 'JARVIS Preferences',
    backgroundColor: '#0a0b0d',
    parent: mainWindow || undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  prefsWindow.loadFile(path.join(__dirname, 'preferences.html'));
  prefsWindow.on('closed', () => { prefsWindow = null; });
}

function buildMenu() {
  const template = [
    {
      label: 'JARVIS',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { label: 'Preferences…', accelerator: 'Command+,', click: () => openPreferences() },
        { type: 'separator' },
        { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    { label: 'Edit', submenu: [{ role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
    {
      label: 'View',
      submenu: [
        { role: 'reload' }, { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Reveal configuration in Finder',
          click: () => shell.showItemInFolder(RepoConfig.configPath(app.getPath('appData'))),
        },
      ],
    },
    { label: 'Window', submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }] },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// First run (or a substrate that has gone away): ask, rather than launching
// into a console whose every panel reads UNKNOWN with no way to fix it from
// inside the app. Only prompts in packaged mode — dev mode resolves by walking
// its own source tree and does not need a binding.
async function ensureBindingOnFirstRun() {
  if (!app.isPackaged) return;
  if (currentRoot() && RESOLVED.resolution !== PROV.RESOLUTION.DEFAULT) return;
  // Asked once. A founder who declined keeps the fallback and can still bind
  // it any time from Preferences — the DEGRADED state stays visible there and
  // on the console, so declining hides nothing.
  if (RepoConfig.promptSeen(app.getPath('appData'))) return;

  const degraded = RESOLVED.resolution === PROV.RESOLUTION.DEFAULT;
  const { response } = await dialog.showMessageBox(mainWindow || null, {
    type: degraded ? 'question' : 'warning',
    message: degraded
      ? 'JARVIS has not been told which repository to use'
      : 'JARVIS could not find a repository to operate against',
    detail: [
      RESOLVED.configProblem ? `${RESOLVED.configProblem}\n` : '',
      degraded
        ? `It found ${currentRoot()} by falling back to a hard-coded candidate. That checkout was never named by you, so JARVIS is reporting it as DEGRADED rather than treating it as chosen.`
        : 'No checkout carrying the canonical Builder OS markers was found.',
      '',
      'Choosing a repository stores it under ~/Library/Application Support/JARVIS/ and it will be remembered on every future launch.',
    ].filter(Boolean).join('\n'),
    buttons: ['Choose Repository…', 'Continue Without Choosing'],
    defaultId: 0,
    cancelId: 1,
  });
  RepoConfig.markPromptSeen(app.getPath('appData'), response === 0 ? 'chose' : 'declined');
  if (response === 0) await chooseRepoInteractive(mainWindow);
}

ipcMain.handle('jarvis:repo-config', async () => repoConfigState());
ipcMain.handle('jarvis:choose-repo', async (evt) => {
  const w = BrowserWindow.fromWebContents(evt.sender);
  const out = await chooseRepoInteractive(w);
  return { ...out, state: repoConfigState() };
});
// No renderer-supplied path: the argument list is empty on purpose, so this
// can only ever reveal the binding JARVIS itself resolved and is displaying.
ipcMain.handle('jarvis:reveal-workspace', async () => {
  const root = currentRoot();
  if (!root) return { revealed: false, reason: 'no workspace is bound' };
  shell.showItemInFolder(root);
  return { revealed: true, root };
});
ipcMain.handle('jarvis:clear-repo', async () => {
  RepoConfig.clearConfig(app.getPath('appData'));
  // Re-resolve from scratch so the surface shows what the app would ACTUALLY
  // do on a cold launch now — not a cached memory of the binding just removed.
  RESOLVED = findRepoRootPackagedMode();
  broadcastRepoChange();
  return repoConfigState();
});

app.whenReady().then(async () => {
  buildMenu();
  createWindow();
  await ensureBindingOnFirstRun();
  // JARVIS-STAB-01 — a run left in flight by a closed window was never finished.
  // Reconciled once at launch so history never shows a run claiming to be
  // executing inside a process that no longer exists. Best-effort: a store that
  // cannot be reached must not stop the app from opening.
  try { await RUNS.reconcileOnLaunch(currentRoot()); } catch { /* custody is reported on the surface, not fatal here */ }
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

// ---------------------------------------------------------------------------
// jarvis:status — HOME + SYSTEM truth states. Every field is either a real
// observation or explicitly UNKNOWN. Nothing is inferred from intended
// architecture.
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:status', async () => {
  const result = {
    observed_at: new Date().toISOString(),
    repo_root: currentRoot() || `UNKNOWN (${REPO_ROOT_MODE} mode) — set JARVIS_REPO_ROOT, or run from inside a checkout with all four canonical markers`,
    repo_root_mode: REPO_ROOT_MODE,
    provenance: currentProvenance(),
    // The Home ACTIVE WORKSPACE panel reads this and nothing else. It is the
    // SAME resolution the router uses — not a second read of the binding — so
    // the panel cannot drift from what Work will actually route against. That
    // drift is the whole failure mode of 2026-08-17: the screen and the router
    // disagreeing about which substrate was bound.
    workspace: (() => {
      const root = currentRoot();
      const sub = readSubstrateVersion(root);
      return {
        bound: !!root,
        root: root || null,
        name: root ? path.basename(root) : null,
        branch: sub.branch,
        head: sub.head,
        dirty: sub.dirty,
        git_connected: sub.git_connected,
        resolution: RESOLVED.resolution,
        problem: root ? null : (RESOLVED.configProblem || 'no repository is bound'),
      };
    })(),
    sessions: [],
    // NOT PROBED, not UNKNOWN. These three are probed further down and every
    // path below overwrites them; if the substrate is unbound we return early
    // and they stand as-is. "We did not look, and here is why" is a different
    // fact from "we looked and cannot tell", and only the first is true here.
    // Leaving bare UNKNOWNs on screen is what made the console read as broken
    // when it was reporting a specific, fixable condition.
    builder_os: { state: 'NOT PROBED', detail: 'depends on a bound execution substrate — none is bound' },
    route_a: { state: 'NOT PROBED', detail: 'depends on a bound execution substrate — none is bound' },
    local_worker: { state: 'NOT PROBED', detail: 'not probed while no execution substrate is bound' },
    // Declared so they are visibly accounted for rather than silently absent.
    // Neither is probed by Desktop, and neither should be: a status row must
    // never be the thing that opens a database connection or reaches
    // production. UNCONFIGURED and NOT PROBED are the honest answers.
    memory_postgres: { state: 'UNCONFIGURED', detail: 'Desktop holds no database configuration and does not connect to one. Memory/Postgres state is read from the host, not from this console.' },
    production: { state: 'NOT PROBED', detail: 'requires explicit production/SSH authority, which Desktop does not hold and does not request. Not probed by design.' },
    claude_lane: { state: 'AVAILABLE', detail: 'Router can select C3; Desktop Alpha does not auto-execute it (see §8 security stance) — this console itself runs the Claude Code session that built it.' },
    builder_mechanism: { state: 'UNKNOWN', detail: null },
    governance_holds: [],
    desktop_runtime: { state: 'AVAILABLE', detail: `Electron ${process.versions.electron}, node ${process.versions.node}` },
  };

  // Builder work-unit mechanism — resolved from the BOUND root only, and
  // re-evaluated on every status call, so a repo re-binding is reflected without
  // a relaunch. Reported before the early return, because "no repository bound"
  // is itself the honest answer for this row rather than a silent UNKNOWN.
  {
    const ms = MECH.mechanismState(currentRoot());
    result.builder_mechanism = ms.available
      ? { state: 'AVAILABLE', detail: `governed work-unit lane '${ms.lane}' (read-only); mechanism at ${ms.source}` }
      : { state: 'UNAVAILABLE', detail: ms.reason };
  }

  if (!currentRoot()) return result;

  // Builder OS — the same session.mjs terminal execution uses, run by the same
  // node the terminal uses. A packaged launch inherits no login shell and so no
  // nvm PATH; resolving the binary is what makes "the same" literally true
  // rather than aspirational.
  const nodeBin = resolveNodeBinary();
  if (!nodeBin.path) {
    // Named, with the search shown. The raw `spawnSync node ENOENT` this
    // replaces named neither the cause nor a fix, and read as a broken Builder
    // OS rather than as a missing runtime.
    result.builder_os = {
      state: 'UNCONFIGURED',
      detail: `no node executable could be resolved, so session.mjs cannot be run. Tried: ${nodeBin.tried.join(', ')}. Set JARVIS_NODE_BIN to an absolute node path, or install node where your login shell can find it.`,
    };
    return result;
  }
  try {
    const raw = execFileSync(nodeBin.path, ['scripts/builder/session.mjs', 'status', '--json'], { cwd: currentRoot(), encoding: 'utf8', timeout: 15000, env: childEnv(process.env).env });
    const j = JSON.parse(raw);
    result.builder_os = {
      state: 'AVAILABLE',
      detail: {
        // The machine this builder is running on. Added for JOP-04b: the
        // acceptance bar for the node-PATH repair names OS, architecture,
        // release, node and Electron as the proof that Builder OS is
        // OBSERVABLE from the packaged app rather than merely truthful about
        // being unobservable.
        //
        // These sit ALONGSIDE the governor counts rather than replacing them.
        // "Builder OS" denotes two different things depending on who is
        // speaking: the founder's §2 means the builder's operating system,
        // while this codebase's own description means the session governor
        // that "tracks who is working on what, and stops two lanes claiming
        // the same unit". Both are real, and on a day when four sessions
        // collided over one repo the governor half is not the half to drop.
        // So the row answers both readings instead of picking one.
        host: {
          os: `${os.type()} ${os.release()}`,
          platform: process.platform,
          architecture: process.arch,
          release: os.release(),
          // `node` is the node the BUILDER runs on — the one that just executed
          // session.mjs — not process.versions.node, which is the node embedded
          // inside Electron (18.18.2 here) and has nothing to do with the
          // governor. The first packaged render of this block reported 18.18.2
          // beside a node_binary of v22.22.3 and was believed until the two were
          // read together. Labelling Electron's internal runtime as "node" on a
          // row about the builder is precisely the quiet inaccuracy this
          // console exists to refuse, so both are named for what they are.
          node: nodeBin.version || null,
          node_binary: nodeBin.path,
          node_resolved_by: nodeBin.source,
          electron: process.versions.electron,
          electron_embedded_node: process.versions.node,
        },
        active: j.active,
        limit: j.limit,
        queued: j.queued,
        sessions: (j.sessions || []).map(s => ({ id: s.session_id, unit: s.work_unit, claim_state: s.liveness?.claim_state, heartbeat_age_s: s.liveness?.heartbeat_age_s })),
      },
    };
    // F2 needs the governor's own liveness flags to decide which acts to offer.
    result.sessions = (j.sessions || []).map(s => ({
      session_id: s.session_id, work_unit: s.work_unit, branch: s.branch, worktree: s.worktree,
      mode: s.mode, owner: s.owner, state: s.state, liveness: s.liveness,
    }));
    result.governance_holds = (j.sessions || [])
      .filter(s => s.liveness?.claim_state === 'STALE' || s.liveness?.claim_state === 'AMBIGUOUS_OWNERSHIP')
      .map(s => ({ id: s.session_id, unit: s.work_unit, claim_state: s.liveness?.claim_state, held: 'HELD' }));
    if (j.queued > 0) {
      result.governance_holds.push({ id: null, unit: `${j.queued} session(s) queued`, claim_state: 'CAPACITY', held: 'HELD' });
    }
  } catch (e) {
    result.builder_os = { state: 'DEGRADED', detail: `session.mjs status failed: ${e.message.slice(0, 300)}` };
  }

  // Route A — the deterministic registry is either present with its own
  // proof passing, or it is not. No middle state is invented.
  try {
    const registryPath = path.join(currentRoot(), 'scripts', 'builder', 'deterministic.mjs');
    if (fs.existsSync(registryPath)) {
      const mod = await import(`file://${registryPath}?t=${Date.now()}`);
      const count = Object.keys(mod.CAPABILITIES || {}).length;
      result.route_a = { state: 'AVAILABLE', detail: `${count} deterministic capabilities registered` };
    } else {
      result.route_a = { state: 'UNAVAILABLE', detail: 'deterministic.mjs not found on this checkout' };
    }
  } catch (e) {
    result.route_a = { state: 'DEGRADED', detail: `registry import failed: ${e.message.slice(0, 300)}` };
  }

  // Local worker — a real reachability probe against Ollama, not an assumption.
  try {
    const res = await fetch('http://127.0.0.1:11434/api/tags', { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const body = await res.json();
      const hasModel = (body.models || []).some(m => m.name?.startsWith('qwen2.5'));
      result.local_worker = hasModel
        ? { state: 'AVAILABLE', detail: `Ollama reachable, qwen2.5 present (${(body.models || []).length} models total)` }
        : { state: 'DEGRADED', detail: 'Ollama reachable but qwen2.5:7b not found' };
    } else {
      result.local_worker = { state: 'DEGRADED', detail: `Ollama responded HTTP ${res.status}` };
    }
  } catch (e) {
    // UNREACHABLE, not UNAVAILABLE: the distinction is whether the thing is
    // absent or merely not answering. A worker that is simply not running is
    // one launch away from AVAILABLE, and the row should say so.
    result.local_worker = { state: 'UNREACHABLE', detail: `Ollama unreachable at 127.0.0.1:11434 — ${e.message.slice(0, 200)}` };
  }

  return result;
});

// ---------------------------------------------------------------------------
// jarvis:capabilities — the C0 capability manifest, read from the SAME
// deterministic.mjs the executor imports. Deliberately not a curated list:
// if a capability is added, removed, or has its schema changed in the
// registry, this surface changes with it and no Desktop-side edit is needed.
//
// The registry declares names and argument schemas only — no descriptions and
// no categories. Those fields are therefore absent here rather than invented,
// and the UI must show their absence rather than paper over it.
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:capabilities', async () => {
  if (!currentRoot()) {
    return { available: false, reason: 'repo root not found — cannot read the deterministic registry', source: null, count: 0, capabilities: [] };
  }
  const registryPath = path.join(currentRoot(), 'scripts', 'builder', 'deterministic.mjs');
  try {
    if (!fs.existsSync(registryPath)) {
      return { available: false, reason: 'deterministic.mjs not found on this checkout', source: registryPath, count: 0, capabilities: [] };
    }
    const mod = await import(`file://${registryPath}?t=${Date.now()}`);
    const capabilities = buildManifest(mod.CAPABILITIES);
    return { available: true, reason: null, source: registryPath, count: capabilities.length, capabilities };
  } catch (e) {
    return { available: false, reason: `registry import failed: ${e.message.slice(0, 300)}`, source: registryPath, count: 0, capabilities: [] };
  }
});

// ---------------------------------------------------------------------------
// jarvis:mechanism-status — is the governed work-unit mechanism reachable from
// the BOUND root? Read-only, no execution. Recomputed per call so that changing
// the repo binding re-evaluates availability without a relaunch. There is no
// fallback to any other checkout or to a bundled copy: see builder-mechanism.js.
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:mechanism-status', async () => MECH.mechanismState(currentRoot()));

// ---------------------------------------------------------------------------
// jarvis:run-work-unit — Desktop access to the governed Builder work-unit
// mechanism, admitting only its authorized `local-native` read-only lane.
//
// This is NOT "C3 execution". C3 remains routed-but-not-executed by
// jarvis:submit-task below, because the mechanism's own checkAuthority admits
// READ_ONLY_LANES only — that is the mechanism enforcing an existing authority
// boundary, not an unfinished wire here.
//
// Desktop performs NO admission of its own. It hands the packet to executeRun,
// which runs validatePacket + checkAuthority first and routes any worker-emitted
// gate through validateWorkerGate itself. A refusal is returned AS a refusal,
// with the mechanism's own failure_class and detail; nothing here upgrades,
// retries, or reinterprets an outcome the mechanism produced.
//
// The lane is pinned to AUTHORIZED_LANE rather than taken from the caller. That
// is scope, not authority: had the renderer been able to name a lane, the
// mechanism would still refuse anything outside READ_ONLY_LANES.
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:run-work-unit', async (_evt, req) => {
  const root = currentRoot();
  if (!root) {
    return { submitted: false, outcome: 'MECHANISM_UNAVAILABLE', reason: 'no execution substrate is bound — bind a repository before submitting work units', mechanism: MECH.mechanismState(null), run: null, events: [] };
  }
  const packet = {
    ...(req && typeof req === 'object' ? req.packet : null),
    execution_lane: MECH.AUTHORIZED_LANE,
  };
  try {
    return await MECH.runWorkUnit(root, packet, {});
  } catch (e) {
    // An unexpected throw is a Desktop-side fault and is labelled as one, so it
    // is never mistaken for a governed refusal by the mechanism.
    return { submitted: false, outcome: 'DESKTOP_FAULT', reason: String(e.message).slice(0, 300), mechanism: MECH.mechanismState(root), run: null, events: [] };
  }
});

// ---------------------------------------------------------------------------
// jarvis:submit-task — the router execution surface. Routes through the same
// router.mjs / deterministic.mjs terminal execution uses. No arbitrary shell.
// C3 is selected and explained but NOT auto-executed (explicit §8 stance).
//
// Since 2026-08-14 this is no longer the ONLY execution surface: the governed
// work-unit mechanism above is a second one, on a different lane vocabulary
// (`local-native`, not C0/C1/C3) and with its own authority checks. The two do
// not overlap, and neither is a route into the other.
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:submit-task', async (_evt, task) => {
  if (!currentRoot()) return { status: 'error', reason: 'repo root not found — cannot route' };
  const routerPath = path.join(currentRoot(), 'scripts', 'builder', 'router.mjs');
  const detPath = path.join(currentRoot(), 'scripts', 'builder', 'deterministic.mjs');

  const { route } = await import(`file://${routerPath}?t=${Date.now()}`);
  const decision = route(task);

  // JARVIS-STAB-01 — custody is opened BEFORE anything is attempted, so a crash
  // during a 30-second C1 call leaves a reconcilable in-flight run rather than
  // no trace that the founder ever asked. The registry names feed the routing
  // fingerprint (STAB-02); failing to read them costs fingerprint coverage, not
  // the run, so it is caught and reported rather than aborting the submission.
  let capabilityNames = null;
  try {
    const det = await import(`file://${detPath}?t=${Date.now()}`);
    capabilityNames = Object.keys(det.CAPABILITIES || {});
  } catch { capabilityNames = null; }

  const opened = await RUNS.openRun(currentRoot(), {
    task, decision, capabilityNames,
    app_build_sha: (readBuildInfo() || {}).app_build_sha || null,
  });
  const store = opened.store;
  const run = opened.run;
  // A run that could not be recorded is reported as UNCUSTODIED rather than
  // silently proceeding as before. Ephemeral was the defect; ephemeral-and-
  // unlabelled would be the same defect with a new module in front of it.
  const custody = opened.custody
    ? { recorded: true, run_id: run.run_id, reason: null }
    : { recorded: false, run_id: null, reason: opened.reason };

  const response = {
    run_id: custody.run_id,
    custody,
    routing_fingerprint: opened.custody ? run.routing_fingerprint : null,
    task: task,
    execution_lane: decision.execution_lane,
    cost_class: decision.cost_class,
    reason: decision.reason,
    status: decision.status,
    verification_required: decision.verification_required,
    result: null,
    verification: null,
  };

  const mark = (state, patch) => { if (store && run) RUNS.transition(store, run, state, patch); };

  if (decision.status === 'rejected_oversized') {
    mark(RUNS.STATE.REJECTED_OVERSIZED, {});
    return response;
  }

  if (decision.execution_lane === 'C0') {
    mark(RUNS.STATE.EXECUTING, {});
    try {
      const { runCapability } = await import(`file://${detPath}?t=${Date.now()}`);
      const r = runCapability(task.capability, task.args || {}, currentRoot());
      response.result = r;
      response.status = 'completed';
      // Independent verification: a second, structurally different check —
      // that the capability is still registered and the result carries the
      // expected shape. Deep re-verification is the caller's job (as proven
      // in the live Route A proof); the console surfaces what it can cheaply
      // confirm itself without duplicating capability logic.
      // C0: an independent check genuinely establishes the RESULT is correct
      // (proven in the live Route A proof — a separate code path re-derives
      // the same fact). "Verification: PASS" is warranted here.
      response.verification = { kind: 'result', label: 'Verification', checked: 'capability registered + exit_code present', pass: typeof r.exit_code === 'number' };
      mark(RUNS.STATE.COMPLETED, { result: response.result, verification: response.verification });
    } catch (e) {
      response.status = 'failed';
      response.result = { error: e.message };
      mark(RUNS.STATE.FAILED, { result: response.result });
    }
  } else if (decision.execution_lane === 'C1') {
    mark(RUNS.STATE.EXECUTING, {});
    try {
      // ── canonical evidence substrate ───────────────────────────────────────
      // Imported, never reimplemented. materializePacket() builds the ONLY
      // context the worker is shown, and verifyEvidence() scores the answer's
      // citations for containment inside exactly those fragments. Both come
      // from the canonical modules adopted byte-exact in 0bec4eb24 — a
      // Desktop-local copy would fork the verifier and defeat the point.
      //
      // Only these two functions are called. executeRun(), ain-delegate.sh,
      // the planner, the orchestrator and the queue are NEVER invoked from
      // here; jarvis-runtime-pipeline.mjs has no top-level side effects, so
      // importing it for verifyEvidence() does not wake the delegate path.
      const ctxPath = path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-context.mjs');
      const pipePath = path.join(REPO_ROOT, 'scripts', 'builder', 'jarvis-runtime-pipeline.mjs');
      const { materializePacket, renderFragments } = await import(`file://${ctxPath}?t=${Date.now()}`);
      const { verifyEvidence } = await import(`file://${pipePath}?t=${Date.now()}`);

      const selectors = Array.isArray(task.context_selectors) ? task.context_selectors : [];
      let fragments = [];
      let materialization_error = null;
      if (selectors.length) {
        // Fail closed: an unresolvable selector must not silently degrade into
        // "no evidence required". materializeOne throws on any invalid selector.
        try {
          fragments = materializePacket({ context_selectors: selectors }, REPO_ROOT);
        } catch (e) {
          materialization_error = e.message;
        }
      }

      // The citation syntax is stated because the verifier enforces an exact
      // machine-readable form. Asking for "citations" in prose and then scoring
      // path.ext:NN produces false refusals of correct answers — the defect
      // recorded as D8 in docs/ops/JARVIS_PLANNER_ROUTER_ALPHA.md.
      const prompt = fragments.length
        ? `${renderFragments(fragments)}\n\nAnswer using ONLY the numbered source above. `
          + `Cite every claim inline in the exact form path/to/file.ext:LINE `
          + `(colon, no space) — for example scripts/builder/router.mjs:42. `
          + `Prose such as "on line 42" does not count as a citation. `
          + `Cite only lines present in the source above.\n\n${task.prompt}`
        : task.prompt;

      const res = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt, stream: false }),
        signal: AbortSignal.timeout(30000),
      });
      const body = await res.json();
      response.result = { response: body.response, model: body.model };
      response.status = 'completed';

      const evidence = fragments.length ? verifyEvidence(body.response || '', fragments) : null;

      // Correctness is decided by the canonical verifier alone. Execution
      // success never implies it — that collapse is what let a fabricated
      // capability ("EnumerateApiRoutes … register_capabilities.py:42") read as
      // verified during the 2026-08-11 founder walk. The mapping lives in its
      // own module so it is testable without Electron.
      const { correctness, correctness_reason } = decideCorrectness({
        materialization_error,
        fragmentCount: fragments.length,
        evidence,
      });

      // C1: this checks that the local worker actually ran and identified
      // itself correctly. It does NOT check whether the ANSWER is correct —
      // qwen2.5:7b has been observed to answer a known-answer classification
      // wrong (2026-08-11 founder walk). "Verification: PASS" would silently
      // imply correctness it does not establish. Kept as two separate,
      // honestly-labeled facts instead of one collapsed badge.
      response.verification = {
        kind: 'execution',
        label: 'Execution verified',
        checked: 'HTTP 200 from local Ollama endpoint, model field matches request',
        pass: res.ok && body.model === 'qwen2.5:7b',
        correctness,
        correctness_reason,
        correctness_method: fragments.length ? 'canonical verifyEvidence() — materialized-fragment containment' : null,
        fragments_offered: fragments.length,
        evidence,
      };
      mark(RUNS.STATE.COMPLETED, { result: response.result, verification: response.verification });
    } catch (e) {
      response.status = 'failed';
      response.result = { error: e.message };
      mark(RUNS.STATE.FAILED, { result: response.result });
    }
  } else if (decision.execution_lane === 'C3') {
    response.status = 'routed_not_executed';
    // AUTHORITY UNCHANGED. Desktop still does not invoke Claude — §8 stands, and
    // nothing below executes anything. What changed (JARVIS-STAB-03) is that the
    // lane no longer TERMINATES in prose telling the founder to go reconstruct
    // the context by hand: the run is under custody, a handoff packet can be
    // produced from it in one act, and the evidence has an agreed way back.
    response.result = {
      note: 'C3 selected. Desktop Alpha does not auto-invoke Claude — that would exercise founder identity / widen permissions without an active founder-driven session (§8).',
      handoff: custody.recorded
        ? `Use OPEN IN CLAUDE CODE to write the execution packet for ${custody.run_id}.`
        : `No handoff packet can be produced: this run is UNCUSTODIED (${custody.reason}).`,
    };
    mark(RUNS.STATE.ROUTED_NOT_EXECUTED, { result: response.result });
  }

  return response;
});

// ---------------------------------------------------------------------------
// JARVIS-STAB-01 — durable run history.
//
// Read-only. Serves ONLY router-surface runs (task-runs.js filters), and carries
// the determinism audit (STAB-02) computed from that same durable history rather
// than asserted. An empty history reports UNVERIFIED, not "deterministic".
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:list-runs', async (_evt, opts) => {
  const o = opts && typeof opts === 'object' ? opts : {};
  const limit = Number.isInteger(o.limit) ? Math.min(Math.max(o.limit, 1), 200) : 25;
  return RUNS.listRuns(currentRoot(), { limit, offset: Number.isInteger(o.offset) ? Math.max(o.offset, 0) : 0 });
});

// ---------------------------------------------------------------------------
// JARVIS-STAB-03 — produce the execution packet for a run.
//
// This writes a file and fills the clipboard. It does NOT execute, spawn, or
// authenticate anything: the founder still opens the session. The act it
// replaces is not "running Claude" — it is the founder retyping the run's
// context from memory, which is the reconstruction burden the programme exists
// to remove.
//
// Every SHA is passed through programme-state's observation constructors, so a
// base that was not re-read this run travels as CARRIED-with-provenance and can
// never present to the worker as freshly current.
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:handoff-packet', async (_evt, req) => {
  const root = currentRoot();
  const runId = req && typeof req.run_id === 'string' ? req.run_id : null;
  if (!runId) return { ok: false, reason: 'run_id is required', packet: null, text: null, path: null };

  const found = await RUNS.getRun(root, runId);
  if (!found.custody) return { ok: false, reason: found.reason, packet: null, text: null, path: null };
  if (!found.run) return { ok: false, reason: `no router run '${runId}' in durable history`, packet: null, text: null, path: null };

  // The candidate SHA is read from the bound checkout NOW, so it is genuinely
  // FRESH. Canonical and production are not read here — this console has no
  // authority to speak for either — so they travel as whatever the caller last
  // verified, marked accordingly, or as NEVER_OBSERVED.
  const sub = readSubstrateVersion(root);
  const candidate = sub.git_connected
    ? PS.observed('candidate_sha', sub.head, { at: new Date().toISOString(), by: `git HEAD on ${root}` })
    : PS.carried('candidate_sha', null);

  const prior = (req && req.bases) || {};
  const rehydrate = (field) => {
    const b = prior[field];
    // A base supplied by the caller is treated as a PRIOR observation and
    // carried — never restamped as fresh. Restamping is exactly how a stale
    // canonical would reach a worker wearing a current marker.
    return b && b.value ? PS.carried(field, b) : PS.carried(field, null);
  };

  const rp = await RUNS.receiptPath(root, runId);
  const packet = PACKET.buildPacket({
    run_id: runId,
    unit: (req && req.unit) || null,
    task: found.run.task,
    lane: found.run.lane,
    reason: found.run.reason,
    canonical_sha: rehydrate('canonical_sha'),
    production_sha: rehydrate('production_sha'),
    candidate_sha: candidate,
    allowed: (req && req.allowed) || [],
    forbidden: (req && req.forbidden) || [],
    acceptance: (req && req.acceptance) || [],
    stop_condition: (req && req.stop_condition) || null,
    receipt_path: rp.path,
  });
  const text = PACKET.renderPacket(packet);
  const written = await RUNS.writeHandoffPacket(root, runId, text);

  // JARVIS-STAB-06 — record WHAT BASE this packet was issued against.
  //
  // Without this the returning receipt has nothing to be checked against, and
  // evidence produced against one head would ingest silently as a statement
  // about another. Recorded at issue time because that is the only moment the
  // base is knowable; recovering it later from the packet text would be
  // reconstruction, which is the thing this programme removes.
  found.run.handoff = {
    issued_at: new Date().toISOString(),
    receipt_path: rp.path,
    packet_path: written.path,
    unit: packet.unit,
    bases: {
      canonical_sha: packet.canonical_sha.value,
      production_sha: packet.production_sha.value,
      candidate_sha: packet.candidate_sha.value,
    },
  };
  await RUNS.saveRun(root, found.run, 'handoff_issued');
  try { clipboard.writeText(text); } catch { /* a clipboard failure must not lose the file */ }
  return { ok: written.ok, reason: written.reason, packet, text, path: written.path, copied_to_clipboard: true };
});

// ---------------------------------------------------------------------------
// JARVIS-STAB-04 — ingest the evidence a worker returned.
//
// The receipt is EVIDENCE FROM OUTSIDE and is validated as such. A receipt that
// fails validation is refused WHOLE and its violations are returned for display:
// a half-applied receipt leaves a record that is neither the old state nor the
// reported one. Ingestion never advances the run's own state — what this console
// did (routed, did not execute) stays true regardless of what came back.
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:ingest-receipt', async (_evt, req) => {
  const root = currentRoot();
  const runId = req && typeof req.run_id === 'string' ? req.run_id : null;
  if (!runId) return { ok: false, reason: 'run_id is required', violations: [], run: null };

  const found = await RUNS.getRun(root, runId);
  if (!found.custody) return { ok: false, reason: found.reason, violations: [], run: null };

  // An inline receipt is accepted for paste-back; otherwise the agreed drop file
  // is read. Both go through identical validation — a pasted receipt is not more
  // trusted than a written one.
  let receipt = req && req.receipt ? req.receipt : null;
  let source = 'inline';
  if (!receipt) {
    const r = await RUNS.readReceipt(root, runId);
    if (!r.ok) return { ok: false, reason: r.reason, violations: [], run: null };
    if (!r.receipt) return { ok: false, reason: `no evidence has returned yet — expected a receipt at ${r.path}`, violations: [], run: found.run, awaiting: r.path };
    receipt = r.receipt;
    source = r.path;
  }

  // JARVIS-STAB-06 — the head is re-read HERE, at ingestion, because that is
  // when the question "is this evidence still about the current tree?" is
  // actually being asked. Reusing the value read at handoff would answer it
  // with a fact from before the interval in question.
  const nowSub = readSubstrateVersion(root);
  const current_base = nowSub.git_connected ? nowSub.head : null;

  const applied = RECEIPT.applyReceipt(found.run, receipt, { at: new Date().toISOString(), current_base });
  if (!applied.ok) {
    return { ok: false, reason: 'receipt refused — it was not applied', violations: applied.violations, run: found.run, source };
  }
  const saved = await RUNS.saveRun(root, applied.run, 'evidence_received');
  if (!saved.ok) return { ok: false, reason: saved.reason, violations: [], run: found.run, source };
  return {
    ok: true, reason: null, violations: [], run: applied.run,
    evidence: RECEIPT.describeEvidence(applied.run),
    // Drift does not fail the ingestion — the evidence is real — but it MUST
    // reach the cockpit as a blocker so the programme cannot advance on
    // historical evidence as though it were current.
    reconciliation: RECEIPT.reconciliationBlockers(applied.run, PS),
    source,
  };
});

// ---------------------------------------------------------------------------
// F2 — jarvis:governance-action.
//
// Desktop performs NO governance of its own. It runs the same session.mjs the
// terminal runs, with three allowlisted verbs, and returns the governor's own
// exit code and stderr verbatim. A refusal is returned AS a refusal; nothing
// here upgrades an outcome the governor declined, and `--force` is unreachable.
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:governance-action', async (_evt, req) => {
  if (!currentRoot()) {
    return { ok: false, outcome: 'usage', label: 'NO SUBSTRATE', detail: 'No execution substrate resolved — cannot reach session.mjs.', errors: [] };
  }
  const built = GOV.buildGovernanceArgv(req || {});
  if (!built.ok) {
    return { ok: false, outcome: 'invalid', label: 'NOT SENT', detail: null, errors: built.errors };
  }
  // Same resolved runtime as the status probe — a governance act must not run
  // on a different node from the one that reported the state it acts on.
  const govNode = resolveNodeBinary();
  if (!govNode.path) {
    return { ok: false, outcome: 'invalid', label: 'NOT SENT', detail: `no node executable could be resolved. Tried: ${govNode.tried.join(', ')}.`, errors: ['node-unresolved'] };
  }
  try {
    const stdout = execFileSync(govNode.path, built.argv, { cwd: currentRoot(), encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: childEnv(process.env).env });
    const r = GOV.interpretExit(0, stdout, '');
    return { ok: true, ...r, errors: [], invoked: built.argv.join(' ') };
  } catch (e) {
    // Non-zero exit is a GOVERNED ANSWER, not a Desktop failure.
    const r = GOV.interpretExit(typeof e.status === 'number' ? e.status : -1, e.stdout || '', e.stderr || e.message);
    return { ok: false, ...r, errors: [], invoked: built.argv.join(' ') };
  }
});
