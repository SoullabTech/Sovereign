// Read-only bridge from JARVIS Desktop to the local continuity projection.
// The SQLite store is rebuildable and non-authoritative. No mutation API is
// exposed here, and no retrieved material is sent to a model by this module.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const MAX_QUERY_CHARS = 500;
const DEFAULT_LIMIT = 8;

function dbPath(env = process.env, home = os.homedir()) {
  return env.JARVIS_CONTINUITY_DB ||
    path.join(home, '.jarvis', 'continuity', 'continuity.sqlite3');
}

function scriptPath(repoRoot) {
  return repoRoot ? path.join(repoRoot, 'scripts', 'builder', 'jarvis-recall.py') : null;
}

function resolvePython(env = process.env, exists = fs.existsSync) {
  const candidates = [
    env.JARVIS_PYTHON_BIN,
    '/usr/bin/python3',
    '/opt/homebrew/bin/python3',
    '/usr/local/bin/python3',
  ].filter(Boolean);
  return { path: candidates.find(exists) || null, tried: candidates };
}

function validateQuery(query, limit = DEFAULT_LIMIT) {
  const q = typeof query === 'string' ? query.trim() : '';
  const n = Number.isInteger(limit) ? limit : DEFAULT_LIMIT;
  const errors = [];
  if (!q) errors.push('query is required');
  if (q.length > MAX_QUERY_CHARS) errors.push(`query exceeds ${MAX_QUERY_CHARS} characters`);
  if (n < 1 || n > 20) errors.push('limit must be between 1 and 20');
  return { ok: errors.length === 0, query: q, limit: n, errors };
}

function status(repoRoot, opts = {}) {
  const exists = opts.exists || fs.existsSync;
  const env = opts.env || process.env;
  const home = opts.home || os.homedir();
  const script = scriptPath(repoRoot);
  const db = dbPath(env, home);
  const python = resolvePython(env, exists);
  if (!repoRoot || !script || !exists(script)) {
    return { state: 'UNAVAILABLE', available: false, detail: 'continuity script is not present in the bound repository' };
  }
  if (!exists(db)) {
    return { state: 'NEEDS_SETUP', available: false, detail: 'local continuity index has not been created yet', db };
  }
  if (!python.path) {
    return { state: 'NEEDS_SETUP', available: false, detail: `python3 not found; tried ${python.tried.join(', ')}`, db };
  }
  return { state: 'AVAILABLE', available: true, detail: 'local Claude/JARVIS continuity index present; all imported material is LOCAL_ONLY by default', db };
}

function search(repoRoot, query, limit = DEFAULT_LIMIT, opts = {}) {
  const checked = validateQuery(query, limit);
  if (!checked.ok) {
    return { ok: false, status: 'REFUSED', errors: checked.errors, results: [] };
  }
  const st = status(repoRoot, opts);
  if (!st.available) {
    return { ok: false, status: st.state, errors: [st.detail], results: [] };
  }

  const env = opts.env || process.env;
  const home = opts.home || os.homedir();
  const python = resolvePython(env, opts.exists || fs.existsSync);
  const exec = opts.execFileSyncImpl || execFileSync;
  const argv = [
    scriptPath(repoRoot),
    '--repo', repoRoot,
    '--db', dbPath(env, home),
    'search', checked.query,
    '--branch-limit', String(checked.limit),
    '--history-limit', String(checked.limit),
  ];
  try {
    const raw = exec(python.path, argv, {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: 15000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const parsed = JSON.parse(raw);
    const branch = (parsed.branch_records || []).map((item) => ({
      ...item,
      authority: item.authority || 'BRANCH_RECORD_NONCANONICAL',
    }));
    const history = (parsed.history || []).map((item) => ({
      ...item,
      authority: 'HISTORICAL_ORIENTATION',
    }));
    return {
      ok: true,
      status: 'COMPLETED',
      query: checked.query,
      summary: parsed.branch_summary || null,
      results: [...branch, ...history].slice(0, checked.limit),
    };
  } catch (error) {
    const detail = String(error.stderr || error.message || error).slice(0, 1000);
    return { ok: false, status: 'FAILED', errors: [detail], results: [] };
  }
}

module.exports = {
  MAX_QUERY_CHARS,
  DEFAULT_LIMIT,
  dbPath,
  scriptPath,
  resolvePython,
  validateQuery,
  status,
  search,
};
