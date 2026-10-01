// JARVIS Desktop — O5-R3 RUNTIME BINDING WITNESS (founder ruling 2026-10-01).
//
// *A live writer must leave a contemporaneous, externally inspectable witness of
// the code and checkout authority under which it is operating.*
//
// THE LAW THIS FILE MAY NEVER BREAK:
//   The record describes the current binding; possession of the record grants no
//   authority whatsoever.
// Nothing in the lease, the grant stores or the Desktop's grant path reads this
// file. Writer authority is the lease (scripts/builder/grant-writer-lease-v1.mjs)
// and nothing else. A forged, stale or corrupt record changes no outcome.
//
// WHY IT EXISTS. Desktop's runtime identity is two facts (provenance.js, F3):
// the APP code it runs and the bound SUBSTRATE whose working-tree bytes supply the
// grant stores (importBound re-imports them on every call). Both are known inside
// the process and were invisible outside it. This record makes them witnessable
// while the process is alive.
//
// LIFECYCLE. Written atomically after binding resolution at startup, and again on
// every re-bind. On orderly quit it is marked terminated; truth never depends on
// that cleanup — a reader judges liveness by host + pid + process incarnation,
// probed exactly the way the lease probes it, so the record and a lease
// generation record can be compared field for field.
//
// It lives under ~/Library/Application Support/JARVIS/, never in the delegation
// home, so Desktop startup still writes nothing to the home (CENSUS-9).
'use strict';

const realFs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync: realExec } = require('child_process');

const RECORD_VERSION = 'O5R3RB.v1';
const FILENAME = 'runtime-binding.json';
const LAW = 'The record describes the current binding; possession of the record grants no authority whatsoever.';

/** The R3 grant-store code, as loaded from the bound checkout by importBound. */
const STORE_FILES = Object.freeze([
  'scripts/builder/grant-writer-lease-v1.mjs',
  'scripts/builder/grant-ledger-core-v1.mjs',
  'scripts/builder/canonical-provider-execution-grant-store-v1.mjs',
  'scripts/builder/human-provider-execution-grant-store.mjs',
]);

/** How the bound checkout was selected; provenance RESOLUTION → the founder's vocabulary. */
const SELECTION_SOURCE = Object.freeze({
  'explicit-env': 'JARVIS_REPO_ROOT',
  'explicit-config': 'config.json',
  'implicit-default': 'fallback',
  'dev-walk': 'dev-walk',   // unpackaged launch from inside the checkout (launch mode A)
  unresolved: 'unresolved',
});

const defaultDeps = () => ({ fs: realFs, execFileSync: realExec, hostname: () => os.hostname() });

// ── Process incarnation: the SAME probe and format as grant-writer-lease-v1.mjs ──
function linuxStart(pid, { fs }) {
  try {
    const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8');
    const after = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
    const ticks = after[19];
    let boot = '';
    try { boot = fs.readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim(); } catch { /* none */ }
    return ticks ? `linux-proc:${boot}:${ticks}` : null;
  } catch { return null; }
}
function psStart(pid, { execFileSync }) {
  try {
    const out = execFileSync('ps', ['-o', 'lstart=', '-p', String(pid)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
    return out ? `ps-lstart:${out.replace(/\s+/g, ' ')}` : null;
  } catch { return null; }
}
function processStartTime(pid, deps = defaultDeps()) {
  return linuxStart(pid, deps) ?? psStart(pid, deps);
}
function probeProcess(pid, deps = defaultDeps()) {
  try { process.kill(pid, 0); } catch (e) {
    if (e && e.code === 'ESRCH') return { state: 'GONE' };
    if (!e || e.code !== 'EPERM') return { state: 'UNDETERMINABLE' };
  }
  const start = processStartTime(pid, deps);
  return start ? { state: 'ALIVE', start_time: start } : { state: 'UNDETERMINABLE' };
}

// ── The bound checkout, as it actually is on disk ─────────────────────────────
/** sha256 of the WORKING-TREE bytes (what importBound loads), never git's committed blobs. null = absent. */
function storeHashes(root, deps = defaultDeps()) {
  const out = {};
  for (const rel of STORE_FILES) {
    try { out[rel] = 'sha256:' + crypto.createHash('sha256').update(deps.fs.readFileSync(path.join(root, rel))).digest('hex'); }
    catch { out[rel] = null; }
  }
  return out;
}
function gitState(root, deps = defaultDeps()) {
  const git = (args, timeout) => deps.execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout,
  }).trim();
  // A just-created worktree can make its first status probe materially slower
  // than the same probe a few seconds later. One inconclusive cold read must not
  // become the durable startup record, so each fact gets one bounded retry.
  const read = (args) => {
    for (const timeout of [10000, 30000]) {
      try { return git(args, timeout); } catch { /* retry once, then remain unknown */ }
    }
    return null;
  };
  const head = read(['rev-parse', 'HEAD']);
  const status = read(['status', '--porcelain']);
  return { head: head || null, clean: status === null ? null : status === '' };
}

// ── The record ────────────────────────────────────────────────────────────────
function buildRecord({ pid, host, processStartedAt, writtenAt, app, binding, stores, delegationHome, envRepoRoot }) {
  return {
    version: RECORD_VERSION,
    law: LAW,
    pid,
    host,
    processStartedAt,
    writtenAt,
    app: { mode: app.mode, build: app.build ?? null, sourceRoot: app.sourceRoot ?? null },
    binding: {
      repoRoot: binding.repoRoot ?? null,
      selectionSource: binding.selectionSource,
      head: binding.head ?? null,
      clean: binding.clean ?? null,
    },
    stores,
    delegationHome: delegationHome ?? null,
    env: { JARVIS_REPO_ROOT: envRepoRoot ?? null },
    terminatedAt: null,
  };
}

/** Atomic: temp file in the same directory, fsync, rename over, fsync the directory. */
function writeRecord(file, record, deps = defaultDeps()) {
  const { fs } = deps;
  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const tmp = path.join(dir, `.${FILENAME}.tmp-${process.pid}-${crypto.randomBytes(4).toString('hex')}`);
  const fd = fs.openSync(tmp, 'wx', 0o600);
  try {
    fs.writeSync(fd, JSON.stringify(record, null, 2) + '\n');
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
  try { fs.renameSync(tmp, file); } catch (e) { try { fs.unlinkSync(tmp); } catch { /* gone */ } throw e; }
  try { const d = fs.openSync(dir, 'r'); try { fs.fsyncSync(d); } finally { fs.closeSync(d); } } catch { /* best effort */ }
  return record;
}

function bindingPath(appSupportDir) {
  return path.join(appSupportDir, 'JARVIS', FILENAME);
}

/**
 * Capture the binding as it is NOW and write it. `resolved` is main.js's RESOLVED
 * ({ root, resolution }); `app` is { mode, build, sourceRoot }.
 */
function captureAndWrite({ appSupportDir, resolved, app, env = process.env, pid = process.pid, now = () => new Date().toISOString(), deps = defaultDeps() }) {
  const root = resolved && resolved.root ? resolved.root : null;
  const { head, clean } = root ? gitState(root, deps) : { head: null, clean: null };
  const record = buildRecord({
    pid,
    host: deps.hostname(),
    processStartedAt: processStartTime(pid, deps),
    writtenAt: now(),
    app,
    binding: {
      repoRoot: root,
      selectionSource: SELECTION_SOURCE[resolved && resolved.resolution] || 'unresolved',
      head,
      clean,
    },
    stores: root ? storeHashes(root, deps) : Object.fromEntries(STORE_FILES.map((f) => [f, null])),
    delegationHome: env.AIN_DELEGATION_HOME || path.join(os.homedir(), '.claude', 'ain-delegation'),
    envRepoRoot: env.JARVIS_REPO_ROOT || null,
  });
  return writeRecord(bindingPath(appSupportDir), record, deps);
}

function readRecord(file, deps = defaultDeps()) {
  try { return JSON.parse(deps.fs.readFileSync(file, 'utf8')); } catch { return null; }
}

/**
 * Is the writer this record describes the one alive NOW? Descriptive only.
 * A pid alone is not identity: a reused pid with a different incarnation is STALE.
 */
function judgeLive(record, { hostname = () => os.hostname(), probe = (pid) => probeProcess(pid) } = {}) {
  if (!record || typeof record !== 'object' || !Number.isInteger(record.pid)) return 'UNREADABLE';
  if (record.terminatedAt) return 'TERMINATED';
  if (record.host !== hostname()) return 'UNDETERMINABLE';
  if (!record.processStartedAt) return 'UNDETERMINABLE';
  const p = probe(record.pid);
  if (p.state === 'GONE') return 'STALE';
  if (p.state === 'ALIVE') return p.start_time === record.processStartedAt ? 'LIVE' : 'STALE';
  return 'UNDETERMINABLE';
}

/** Orderly quit: mark OUR record terminated. Never touches a record another process wrote. */
function markTerminated(appSupportDir, { pid = process.pid, now = () => new Date().toISOString(), deps = defaultDeps() } = {}) {
  const file = bindingPath(appSupportDir);
  const rec = readRecord(file, deps);
  if (!rec || rec.pid !== pid || rec.processStartedAt !== processStartTime(pid, deps)) return { ok: false, reason: 'NOT_OUR_RECORD' };
  writeRecord(file, { ...rec, terminatedAt: now() }, deps);
  return { ok: true };
}

module.exports = {
  RECORD_VERSION, FILENAME, LAW, STORE_FILES, SELECTION_SOURCE,
  processStartTime, probeProcess, storeHashes, gitState,
  buildRecord, writeRecord, bindingPath, captureAndWrite, readRecord, judgeLive, markTerminated,
};
