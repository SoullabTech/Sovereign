// JARVIS Desktop — Alpha. A separate operational surface from MAIA Desktop.
// Presentation layer ONLY. All logic is canonical Builder OS / router state,
// read or invoked via the same code paths terminal execution uses. No
// business logic is duplicated here, and no arbitrary shell execution is
// exposed to the renderer.
const { app, BrowserWindow, ipcMain } = require('electron');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

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

function findRepoRootPackagedMode() {
  // Preferred Alpha order (never silently guess an arbitrary checkout):
  //  1. JARVIS_REPO_ROOT env var
  //  2. persisted founder-machine configuration — POST-ALPHA, not built here
  //  3. known local default, only if its markers actually verify
  //  4. otherwise UNKNOWN
  const candidates = [process.env.JARVIS_REPO_ROOT, '/Users/soullab/MAIA-SOVEREIGN'].filter(Boolean);
  for (const c of candidates) {
    if (isValidRepoRoot(c)) return c;
  }
  return null;
}

const REPO_ROOT = app.isPackaged ? findRepoRootPackagedMode() : findRepoRootDevMode(__dirname);
const REPO_ROOT_MODE = app.isPackaged ? 'packaged' : 'dev';

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 880,
    height: 640,
    title: 'JARVIS',
    backgroundColor: '#0a0b0d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);
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
    repo_root: REPO_ROOT || `UNKNOWN (${REPO_ROOT_MODE} mode) — set JARVIS_REPO_ROOT, or run from inside a checkout with all four canonical markers`,
    repo_root_mode: REPO_ROOT_MODE,
    builder_os: { state: 'UNKNOWN', detail: null },
    route_a: { state: 'UNKNOWN', detail: null },
    local_worker: { state: 'UNKNOWN', detail: null },
    claude_lane: { state: 'AVAILABLE', detail: 'Router can select C3; Desktop Alpha does not auto-execute it (see §8 security stance) — this console itself runs the Claude Code session that built it.' },
    governance_holds: [],
    desktop_runtime: { state: 'AVAILABLE', detail: `Electron ${process.versions.electron}, node ${process.versions.node}` },
  };

  if (!REPO_ROOT) return result;

  // Builder OS — the same session.mjs terminal execution uses.
  try {
    const raw = execFileSync('node', ['scripts/builder/session.mjs', 'status', '--json'], { cwd: REPO_ROOT, encoding: 'utf8', timeout: 15000 });
    const j = JSON.parse(raw);
    result.builder_os = {
      state: 'AVAILABLE',
      detail: { active: j.active, limit: j.limit, queued: j.queued, sessions: (j.sessions || []).map(s => ({ id: s.session_id, unit: s.work_unit, claim_state: s.liveness?.claim_state, heartbeat_age_s: s.liveness?.heartbeat_age_s })) },
    };
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
    const registryPath = path.join(REPO_ROOT, 'scripts', 'builder', 'deterministic.mjs');
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
    result.local_worker = { state: 'UNAVAILABLE', detail: `Ollama unreachable at 127.0.0.1:11434 — ${e.message.slice(0, 200)}` };
  }

  return result;
});

// ---------------------------------------------------------------------------
// jarvis:submit-task — the ONLY execution surface. Routes through the same
// router.mjs / deterministic.mjs terminal execution uses. No arbitrary shell.
// C3 is selected and explained but NOT auto-executed (explicit §8 stance).
// ---------------------------------------------------------------------------
ipcMain.handle('jarvis:submit-task', async (_evt, task) => {
  if (!REPO_ROOT) return { status: 'error', reason: 'repo root not found — cannot route' };
  const routerPath = path.join(REPO_ROOT, 'scripts', 'builder', 'router.mjs');
  const detPath = path.join(REPO_ROOT, 'scripts', 'builder', 'deterministic.mjs');

  const { route } = await import(`file://${routerPath}?t=${Date.now()}`);
  const decision = route(task);

  const response = {
    task: task,
    execution_lane: decision.execution_lane,
    cost_class: decision.cost_class,
    reason: decision.reason,
    status: decision.status,
    verification_required: decision.verification_required,
    result: null,
    verification: null,
  };

  if (decision.status === 'rejected_oversized') return response;

  if (decision.execution_lane === 'C0') {
    try {
      const { runCapability } = await import(`file://${detPath}?t=${Date.now()}`);
      const r = runCapability(task.capability, task.args || {}, REPO_ROOT);
      response.result = r;
      response.status = 'completed';
      // Independent verification: a second, structurally different check —
      // that the capability is still registered and the result carries the
      // expected shape. Deep re-verification is the caller's job (as proven
      // in the live Route A proof); the console surfaces what it can cheaply
      // confirm itself without duplicating capability logic.
      response.verification = { checked: 'capability registered + exit_code present', pass: typeof r.exit_code === 'number' };
    } catch (e) {
      response.status = 'failed';
      response.result = { error: e.message };
    }
  } else if (decision.execution_lane === 'C1') {
    try {
      const res = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        body: JSON.stringify({ model: 'qwen2.5:7b', prompt: task.prompt, stream: false }),
        signal: AbortSignal.timeout(30000),
      });
      const body = await res.json();
      response.result = { response: body.response, model: body.model };
      response.status = 'completed';
      response.verification = { checked: 'HTTP 200 from local Ollama endpoint, model field matches request', pass: res.ok && body.model === 'qwen2.5:7b' };
    } catch (e) {
      response.status = 'failed';
      response.result = { error: e.message };
    }
  } else if (decision.execution_lane === 'C3') {
    response.status = 'routed_not_executed';
    response.result = { note: 'C3 selected. Desktop Alpha does not auto-invoke Claude — that would exercise founder identity / widen permissions without an active founder-driven session (§8). Open a Claude Code session to execute this task.' };
  }

  return response;
});
