// @ts-check
/**
 * Monitor instrument registry — local-first, read-only (B3)
 * ═══════════════════════════════════════════════════════════════════════════
 * JARVIS-FOUNDER-WORKSPACE-01 / B3, authorized by the P0 founder adjudication
 * (FD-4 · OE-4 · D-04 · D-05). Laws, each with a defeat candidate in the B3 matrix:
 *   MR-1  an instrument is ADMITTED only with a proof of read-only-ness; a script that writes,
 *         deletes, escalates, mutates a database or reaches a remote host is REFUSED by name
 *   MR-2  a script instrument is pinned by content hash; a changed script is refused until re-proven
 *   MR-3  local-first: no instrument may name a production host (D-04); network is refused unless
 *         loopback GET or gated by a declared env variable the registry pins off
 *   MR-4  an unreachable or failing instrument observes `unavailable`, never a calm value
 *   MR-5  the registry carries no score, aggregate or cost (D-05)
 *   MR-6  every observation names instrument · time · proof · state (DC-1 / DC-8)
 *   MR-7  "not instrumented" and "unauthorized" are first-class states, never gaps
 *
 * Observation states (founder §V.E): current · historical · stale · unavailable ·
 * unauthorized · not_instrumented · refused. `scheduled` is carried per entry and is
 * false for every entry today: no scheduler runs any JARVIS instrument (P0 census §5).
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolveAinHome } from './read-organs.mjs';

export const OBSERVATION_SCHEMA = 'instrument-observation.v1';
export const REGISTRY_SCHEMA = 'instrument-registry.v1';
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

// ── static read-only scan (comment-stripped shell) ───────────────────────────

const PRODUCTION_HOSTS = /minisforum|soullab\.life|192\.168\.\d+\.\d+|maia-postgres|maia-sovereign|maia-whisper/;

/**
 * Scan a shell script for mutation, escalation, database mutation and network.
 * Findings are REFUSALS; `allowed` lists what a declaration permitted.
 * @param {string} text
 * @param {{ scratch_vars?: string[], output_path_envs?: string[], network_gate_env?: string|null, allow_loopback_get?: boolean, loopback_host_vars?: string[], kills_own_children?: boolean }} decl
 */
export function scanShell(text, decl = {}) {
  const scratch = new Set(decl.scratch_vars || []);
  const outEnvs = new Set(decl.output_path_envs || []);
  /** @type {{ line: number, token: string, why: string }[]} */ const findingsPre = [];
  const raw = text.split('\n').map((l) => l.replace(/(^|\s)#.*$/, '')).join('\n');
  // awk/sed programs live in single quotes; their `>` are comparisons, not redirects. A redirect INTO a single-quoted
  // literal (`> 'file'`) is caught before stripping.
  // Redirect targets in quotes are protected first (`> "$VAR"` → `> $VAR`, `> 'file'` → marker), then every quoted string is
  // blanked so prose and awk programs cannot be read as commands (the C21 lesson: an instrument that scans prose fails on prose).
  const keepNl = (/** @type {string} */ m) => m.replace(/[^\n]/g, '');
  const src = raw
    // a quoted variable reference (`"$out"`, `"${CENSUS_OUT%.tsv}.txt"`) is a path token, never prose: unquote it to its variable
    .replace(/"\$\{?([A-Za-z_][A-Za-z0-9_]*)[^"]*"/g, '$$$1')
    .replace(/>\s*'[^']+'/g, (m) => `> LITERAL_QUOTED_PATH${m.slice(-1)}`)
    // quoted strings (awk/sed programs, echoed prose) are blanked across lines, newlines preserved so line numbers hold
    .replace(/'[^']*'/g, (m) => `'${keepNl(m)}'`)
    .replace(/"(?:[^"\\]|\\.)*"/g, (m) => `"${keepNl(m)}"`);
  const hostVars = new Set(decl.loopback_host_vars || []);
  for (const v of hostVars) if (!new RegExp(`^\\s*${v}=("?)(127\\.0\\.0\\.1|localhost)\\1\\s*$`, 'm').test(raw) && !new RegExp(`${v}=\\$\\{${v}:-(127\\.0\\.0\\.1|localhost)\\}`).test(raw)) findingsPre.push({ line: 0, token: v, why: `declared loopback host var ${v} is not assigned a loopback literal in the script` });
  /** @type {{ line: number, token: string, why: string }[]} */ const findings = [...findingsPre];
  /** @type {{ line: number, token: string, by: string }[]} */ const allowed = [];
  const lines = src.split('\n');
  const varOf = (/** @type {string} */ s) => { const m = s.match(/^"?\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/); return m ? m[1] : null; };
  const rawLines = raw.split('\n');
  lines.forEach((line, i) => {
    const n = i + 1;
    const rawLine = rawLines[i] || '';
    const f = (/** @type {string} */ token, /** @type {string} */ why) => findings.push({ line: n, token, why });
    if (/\bsudo\b/.test(line)) f('sudo', 'privilege escalation');
    if (PRODUCTION_HOSTS.test(line) && /\b(ssh|scp|rsync|curl|wget|docker|psql|nc|git\s+(?:fetch|pull|push|ls-remote|remote))\b/.test(line)) f('production host', 'reaches a production host or container (D-04)');
    if (/\b(ssh|scp|rsync|sftp|nc)\b\s/.test(line)) f(RegExp.$1, 'remote access');
    if (/\bwget\b/.test(line)) f('wget', 'network fetch');
    if (/\bcurl\b/.test(line)) {
      const mutating = /-X\s*(POST|PUT|DELETE|PATCH)|\s-d\s|--data|-F\s/.test(line);
      const loopback = /(127\.0\.0\.1|localhost)/.test(line) || [...hostVars].some((v) => new RegExp(`\\$\\{?${v}\\}?`).test(line));
      if (mutating) f('curl (mutating)', 'network write');
      else if (loopback && decl.allow_loopback_get) allowed.push({ line: n, token: 'curl loopback GET', by: 'allow_loopback_get' });
      else f('curl', 'network fetch not on loopback');
    }
    if (/\bdocker\s+(exec|run|rm|rmi|stop|start|restart|kill|compose|volume\s+rm|system\s+prune|builder\s+prune)\b/.test(line)) f('docker ' + RegExp.$1, 'container mutation or exec');
    const g = line.match(/\bgit\b[^|;&]*?\b(push|commit|checkout|switch|reset|clean|rebase|merge|cherry-pick|am|apply|stash|tag|branch\s+-[dDm]|worktree\s+(?:remove|prune|add|move)|fetch|pull|ls-remote|remote\s+(?:add|set-url))(?![-\w])/);
    if (g) {
      const verb = g[1];
      const network = /^(fetch|pull|ls-remote)$/.test(verb);
      if (network && decl.network_gate_env && new RegExp(`\\$\\{?${decl.network_gate_env}`).test(raw) ) allowed.push({ line: n, token: `git ${verb}`, by: `gated by ${decl.network_gate_env} (pinned off)` });
      else f(`git ${verb}`, network ? 'network' : 'repository mutation');
    }
    const rm = line.match(/\brm\s+(-[a-zA-Z]+\s+)*("?\$\{?[A-Za-z_][A-Za-z0-9_]*\}?"?|\S+)/);
    if (rm) { const v = varOf(rm[2]); if (v && scratch.has(v)) allowed.push({ line: n, token: `rm ${rm[2]}`, by: `scratch var ${v}` }); else f(`rm ${rm[2]}`, 'deletion outside declared scratch'); }
    const mk = rawLine.match(/\bmkdir\b[^|;&]*/);
    if (mk) { const e = [...outEnvs].find((x) => mk[0].includes(x)); if (e) allowed.push({ line: n, token: 'mkdir', by: `output path env ${e}` }); else f('mkdir', 'creates a directory outside a declared output path'); }
    if (/\b(psql|pg_dump|pg_restore)\b/.test(line)) f(RegExp.$1, 'database access');
    if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)\s+(INTO|FROM|TABLE|SET)?/i.test(line) && /\b(psql|-c\s|sql)\b/i.test(line)) f('SQL mutation', 'database mutation');
    const k = line.match(/\b(kill|pkill|killall)\b\s*(-[-\w]+\s+)*(\S*)/);
    if (k) { const rawK = rawLine.match(/\bkill\b[^|;&]*/); if (k[1] === 'kill' && decl.kills_own_children && rawK && /\$/.test(rawK[0]) && !/\b\d{2,}\b|-9\s+\w/.test(rawK[0])) allowed.push({ line: n, token: `kill ${k[3]}`, by: 'kills_own_children (variable pid only)' }); else f(k[1], 'process signal'); }
    if (/\blaunchctl\s+(load|unload|bootstrap|bootout|kickstart)\b/.test(line)) f('launchctl', 'scheduler mutation');
    // redirections: `> target` / `>> target` / `tee target`; allow /dev/null, fds, scratch vars, output envs
    const ps = line.match(/>\s*>\(\s*tee\s+(-a\s+)?"?\$\{?([A-Za-z_][A-Za-z0-9_]*)/);
    if (ps) { if (outEnvs.has(ps[2])) allowed.push({ line: n, token: `> >(tee $${ps[2]})`, by: `output path env ${ps[2]}` }); else f(`> >(tee $${ps[2]})`, 'process substitution to an undeclared path'); }
    const re = /(^|[^-=<\w])(>{1,2})\s*("?\$\{?[A-Za-z_][A-Za-z0-9_]*\}?"?|\/dev\/null|&\d|"?[^\s;&|)]+)/g; let m;
    while ((m = re.exec(line))) {
      const t = m[3]; if (/^&\d|\/dev\/null|^"?\$\(dirname|^>\(/.test(t) || /2>&1|>&2/.test(line.slice(Math.max(0, m.index - 1), m.index + 4))) continue;
      if (t.startsWith('LITERAL_QUOTED_PATH')) { f(`> '…'`, 'write to a literal path'); continue; }
      const v = varOf(t);
      if (v && (scratch.has(v) || outEnvs.has(v))) { allowed.push({ line: n, token: `> ${t}`, by: scratch.has(v) ? `scratch var ${v}` : `output path env ${v}` }); continue; }
      if (v) { f(`> ${t}`, 'write to an undeclared path variable'); continue; }
      if (/^"?\$\(/.test(t) || /\)$/.test(t)) continue; // awk/printf formatting inside $( ) or comparison noise
      f(`> ${t}`, 'write to a literal path');
    }
    const tee = line.match(/\btee\s+(-a\s+)?("?\$\{?[A-Za-z_][A-Za-z0-9_]*\}?"?|\S+)/);
    if (tee) { const v = varOf(tee[2]); if (v && outEnvs.has(v)) allowed.push({ line: n, token: `tee ${tee[2]}`, by: `output path env ${v}` }); else if (/\$\{?CENSUS_OUT/.test(tee[2]) && outEnvs.has('CENSUS_OUT')) allowed.push({ line: n, token: `tee ${tee[2]}`, by: 'output path env CENSUS_OUT' }); else f(`tee ${tee[2]}`, 'tee to an undeclared path'); }
  });
  return { ok: findings.length === 0, findings, allowed };
}

/** @param {string} file */
export function sha256File(file) { return createHash('sha256').update(readFileSync(file)).digest('hex'); }

// ── the registry (declared, then proven at admission) ─────────────────────────

/**
 * @typedef {{ id: string, subject: string, group: string, plain: string, kind: 'script'|'command'|'loopback-get'|'presence-gated-cli'|'not-instrumented', host: 'local',
 *   script?: string, args?: string[], env?: Record<string,string>, command?: string[], url?: string, gate_dir?: string,
 *   declaration?: { scratch_vars?: string[], output_path_envs?: string[], network_gate_env?: string|null, allow_loopback_get?: boolean, loopback_host_vars?: string[], kills_own_children?: boolean },
 *   output?: { mode: 'json'|'jsonl'|'tsv'|'text', via?: string },
 *   scheduled: false, stale_after_s: number|null, timeout_ms: number, requires?: string, cites: string }} Entry
 */

/** @type {Entry[]} */
export const DECLARED = [
  { id: 'git.checkout', subject: 'Checkout', group: 'This workspace', plain: 'Branch, head and whether the working copy is clean.', kind: 'command', host: 'local', command: ['git', 'rev-parse', '--abbrev-ref', 'HEAD'], scheduled: false, stale_after_s: 300, timeout_ms: 5000, cites: 'F2 §2 (git read-only)' },
  { id: 'git.status', subject: 'Working copy', group: 'This workspace', plain: 'Uncommitted changes in the bound checkout.', kind: 'command', host: 'local', command: ['git', 'status', '--porcelain'], scheduled: false, stale_after_s: 300, timeout_ms: 5000, cites: 'F2 §2' },
  { id: 'ollama.tags', subject: 'Local model worker (Ollama)', group: 'Local models', plain: 'Which local models Ollama can serve right now.', kind: 'loopback-get', host: 'local', url: 'http://127.0.0.1:11434/api/tags', scheduled: false, stale_after_s: 300, timeout_ms: 3000, cites: 'F2 §2 (Ollama /api/tags)' },
  { id: 'session.governor.status', subject: 'Builder sessions', group: 'JARVIS runtime', plain: 'Governed sessions that are open, queued or recoverable.', kind: 'presence-gated-cli', host: 'local', script: 'scripts/builder/session.mjs', args: ['status', '--json'], gate_dir: 'sessions', scheduled: false, stale_after_s: 120, timeout_ms: 15000, cites: 'B2 RL-5 (presence-gated; allRecs() mkdirs on read — observation routed to owner)' },
  { id: 'ops.workstation-storage-census', subject: 'Workstation storage and memory', group: 'Mac Studio', plain: 'Disk, memory, swap, Docker and worktree footprint on the workstation.', kind: 'script', host: 'local', script: 'scripts/ops/workstation-storage-census.sh', env: { CENSUS_SKIP_DOCKER: '0' }, declaration: { scratch_vars: ['out'], output_path_envs: ['CENSUS_OUT', 'CENSUS_JSON'], allow_loopback_get: false, kills_own_children: true }, output: { mode: 'jsonl', via: 'CENSUS_JSON' }, scheduled: false, stale_after_s: 86400, timeout_ms: 600000, cites: 'docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md · FD-4' },
  { id: 'ops.worktree-census', subject: 'Worktrees', group: 'Mac Studio', plain: 'Registered git worktrees, their size and whether they are merged or pushed.', kind: 'script', host: 'local', script: 'scripts/ops/worktree-census.sh', env: { CENSUS_FETCH: '0' }, declaration: { scratch_vars: ['RAW', 'TSV'], output_path_envs: ['CENSUS_OUT', 'CENSUS_JSON'], network_gate_env: 'CENSUS_FETCH', allow_loopback_get: false }, output: { mode: 'json', via: 'CENSUS_JSON' }, scheduled: false, stale_after_s: 86400, timeout_ms: 600000, cites: 'docs/ops/WORKSTATION_STORAGE_RELIEF_2026-09-22.md · FD-4' },
  { id: 'voice.whisper-server', subject: 'Local Whisper (whisper.cpp)', group: 'Local voice', plain: 'Whether the local speech-to-text server answers on 127.0.0.1:8080.', kind: 'script', host: 'local', script: 'scripts/check-whisper.sh', declaration: { scratch_vars: [], output_path_envs: [], allow_loopback_get: true, loopback_host_vars: ['WHISPER_HOST'] }, output: { mode: 'text' }, scheduled: false, stale_after_s: 300, timeout_ms: 15000, cites: 'V0 §Q4 · OE-1' },
  { id: 'github.read', subject: 'GitHub (PRs, checks)', group: 'Repository', plain: 'Pull-request and check state, read only.', kind: 'not-instrumented', host: 'local', requires: 'OE-4 read-only instrument with token custody (a later B3 act); JOP-04 forbids every write', scheduled: false, stale_after_s: null, timeout_ms: 0, cites: 'P0 adjudication OE-4' },
  { id: 'production.minisforum', subject: 'Production (minisforum)', group: 'Production', plain: 'Not observed from this workspace, by law.', kind: 'not-instrumented', host: 'local', requires: 'D-04: production is never probed by a dashboard; a separate authority act is required', scheduled: false, stale_after_s: null, timeout_ms: 0, cites: 'F0 adjudication D-04' },
];

/** Scripts the registry REFUSES by name, with the reason it would find (kept so a future entry cannot slip them in). */
export const REFUSED_BY_NAME = [
  { script: 'scripts/storage-health-monitor.sh', why: 'rm -rf at 90% · sudo rm -rf /tmp/*' },
  { script: 'scripts/health-check.sh', why: 'production INSERT/DELETE through docker exec psql' },
  { script: 'scripts/backup-postgres.sh', why: 'pg_dump write' },
  { script: 'scripts/verify-deploy-provenance.sh', why: 'self-test that mkdirs and rm -rfs its own scratch; not an observation of live state' },
  { script: 'scripts/smoke-voice.sh', why: 'POSTs to https://soullab.life (production, network)' },
];

/**
 * Admit an entry: prove it, pin it. Never runs it.
 * @param {Entry} e @param {{ root?: string }} [opts]
 */
export function admit(e, opts = {}) {
  const root = opts.root || REPO_ROOT;
  const base = { schema: REGISTRY_SCHEMA, id: e.id, subject: e.subject, group: e.group, plain: e.plain, kind: e.kind, host: e.host, scheduled: false, stale_after_s: e.stale_after_s, cites: e.cites };
  if (e.host !== 'local') return { ...base, admitted: false, refusal: { law: 'MR-3', why: `host '${e.host}' is not local` } };
  if (e.kind === 'not-instrumented') return { ...base, admitted: true, proof: { kind: 'not-instrumented', requires: e.requires } }; // never runs; may name the boundary it stands for
  const runnable = JSON.stringify({ script: e.script, args: e.args, env: e.env, command: e.command, url: e.url });
  if (PRODUCTION_HOSTS.test(runnable)) return { ...base, admitted: false, refusal: { law: 'MR-3', why: 'a runnable entry names a production host' } };
  if (e.kind === 'command') {
    const allowedVerbs = /^git$/.test(e.command?.[0] || '') && /^(rev-parse|status|log|show|diff|branch|worktree|ls-files|describe)$/.test(e.command?.[1] || '');
    return allowedVerbs ? { ...base, admitted: true, proof: { kind: 'command-allowlist', command: e.command } } : { ...base, admitted: false, refusal: { law: 'MR-1', why: `command not in the read-only allowlist: ${e.command?.join(' ')}` } };
  }
  if (e.kind === 'loopback-get') {
    const ok = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(e.url || '');
    return ok ? { ...base, admitted: true, proof: { kind: 'loopback-get', url: e.url } } : { ...base, admitted: false, refusal: { law: 'MR-3', why: `url is not loopback: ${e.url}` } };
  }
  if (e.kind === 'presence-gated-cli') {
    return { ...base, admitted: true, proof: { kind: 'presence-gated-witness', script: e.script, witness: 'B2 RL-5 (byte-identical snapshot around session.mjs report --json; status shares allRecs())', gate_dir: e.gate_dir }, script_sha256: existsSync(path.join(root, e.script || '')) ? sha256File(path.join(root, /** @type {string} */ (e.script))) : null };
  }
  // script
  const file = path.join(root, e.script || '');
  if (!existsSync(file)) return { ...base, admitted: false, refusal: { law: 'MR-1', why: `script absent: ${e.script}` } };
  const scan = scanShell(readFileSync(file, 'utf8'), e.declaration || {});
  if (!scan.ok) return { ...base, admitted: false, refusal: { law: 'MR-1', why: `static scan found ${scan.findings.length} refusal(s)`, findings: scan.findings } };
  return { ...base, admitted: true, proof: { kind: 'static-scan', declaration: e.declaration || {}, allowed: scan.allowed }, script: e.script, script_sha256: sha256File(file), env: e.env || {}, args: e.args || [], output: e.output, timeout_ms: e.timeout_ms };
}

/** @param {{ root?: string, entries?: Entry[] }} [opts] */
export function buildRegistry(opts = {}) {
  const root = opts.root || REPO_ROOT;
  const entries = (opts.entries || DECLARED).map((e) => admit(e, { root }));
  const refused = REFUSED_BY_NAME.map((r) => {
    const file = path.join(root, r.script);
    const scan = existsSync(file) ? scanShell(readFileSync(file, 'utf8'), {}) : null;
    return { ...r, present: !!scan, scan_findings: scan ? scan.findings.length : null, first_findings: scan ? scan.findings.slice(0, 3) : [] };
  });
  return { schema: REGISTRY_SCHEMA, built_at: new Date().toISOString(), root, entries, refused_by_name: refused };
}

// ── observe ───────────────────────────────────────────────────────────────────

/**
 * Observe one admitted entry. Re-verifies the pinned hash (MR-2). Never observes a refused entry.
 * @param {any} entry admitted registry entry
 * @param {{ root?: string, env?: NodeJS.ProcessEnv, exec?: (file: string, args: string[], opts: any) => string, fetchImpl?: (url: string, init: any) => Promise<{ ok: boolean, status: number, text: () => Promise<string> }>, now?: () => string, scratchDir?: string }} [io]
 */
export async function observe(entry, io = {}) {
  const root = io.root || REPO_ROOT;
  const now = io.now || (() => new Date().toISOString());
  const observed_at = now();
  const base = { schema: OBSERVATION_SCHEMA, instrument_id: entry.id, subject: entry.subject, group: entry.group, plain: entry.plain, host: 'local', observed_at, proof: entry.proof ? entry.proof.kind : null };
  if (!entry.admitted) return { ...base, state: 'refused', freshness: 'none', result: null, error: entry.refusal?.why || 'refused' };
  if (entry.kind === 'not-instrumented') return { ...base, state: 'not_instrumented', freshness: 'none', result: null, error: null, requires: entry.proof?.requires };
  const t0 = Date.now();
  try {
    if (entry.kind === 'command') {
      const exec = io.exec || defaultExec();
      const out = exec(entry.proof.command[0], entry.proof.command.slice(1).concat(entry.id === 'git.checkout' || entry.id === 'git.status' ? [] : []), { cwd: root, env: io.env || process.env, encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'pipe'] });
      return { ...base, state: 'current', freshness: 'current', result: { stdout: String(out).trim() }, error: null, duration_ms: Date.now() - t0 };
    }
    if (entry.kind === 'loopback-get') {
      const f = io.fetchImpl || ((u, i) => fetch(u, i));
      const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), 3000);
      try {
        const r = await f(entry.proof.url, { signal: ac.signal });
        const text = await r.text();
        if (!r.ok) return { ...base, state: 'unavailable', freshness: 'none', result: null, error: `HTTP ${r.status}`, duration_ms: Date.now() - t0 };
        let parsed; try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 2000) }; }
        return { ...base, state: 'current', freshness: 'current', result: parsed, error: null, duration_ms: Date.now() - t0 };
      } finally { clearTimeout(timer); }
    }
    if (entry.kind === 'presence-gated-cli') {
      const dir = path.join(resolveAinHome(io.env || process.env), entry.proof.gate_dir);
      if (!(existsSync(dir) && statSync(dir).isDirectory())) return { ...base, state: 'unavailable', freshness: 'none', result: null, error: `${dir} absent; the governor was not invoked (presence gate, nothing created)`, duration_ms: Date.now() - t0 };
      const file = path.join(root, entry.proof.script);
      if (entry.script_sha256 && sha256File(file) !== entry.script_sha256) return { ...base, state: 'refused', freshness: 'none', result: null, error: 'script changed since admission (MR-2)' };
      const exec = io.exec || defaultExec();
      const out = exec(process.execPath, [file, 'status', '--json'], { cwd: root, env: io.env || process.env, encoding: 'utf8', timeout: 15000, stdio: ['ignore', 'pipe', 'pipe'] });
      let parsed; try { parsed = JSON.parse(String(out)); } catch (e) { return { ...base, state: 'unavailable', freshness: 'none', result: null, error: `governor output unreadable: ${msg(e)}`, duration_ms: Date.now() - t0 }; }
      return { ...base, state: 'current', freshness: 'current', result: stripNumbers(parsed), error: null, duration_ms: Date.now() - t0 };
    }
    if (entry.kind === 'script') {
      const file = path.join(root, entry.script);
      if (sha256File(file) !== entry.script_sha256) return { ...base, state: 'refused', freshness: 'none', result: null, error: 'script changed since admission (MR-2); re-prove before observing' };
      const exec = io.exec || defaultExec();
      const scratch = io.scratchDir || null;
      const env = { ...(io.env || process.env), ...entry.env };
      let jsonPath = null;
      if (entry.output && entry.output.via && scratch) { jsonPath = path.join(scratch, `${entry.id}.${entry.output.mode}`); env[entry.output.via] = jsonPath; }
      const out = exec('bash', [file].concat(entry.args || []), { cwd: root, env, encoding: 'utf8', timeout: entry.timeout_ms || 60000, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 16 * 1024 * 1024 });
      /** @type {any} */ let result = { stdout_head: String(out).split('\n').slice(0, 40) };
      if (jsonPath && existsSync(jsonPath)) {
        const raw = readFileSync(jsonPath, 'utf8');
        if (entry.output.mode === 'json') { try { result = { json: JSON.parse(raw) }; } catch (e) { result = { json_unreadable: msg(e) }; } }
        else if (entry.output.mode === 'jsonl') {
          /** @type {any[]} */
          const rows = [];
          /** @type {number[]} */
          const bad = [];
          raw.split('\n').filter(Boolean).forEach((l, i) => { try { rows.push(JSON.parse(l)); } catch { bad.push(i + 1); } });
          result = { rows, unreadable_lines: bad };
        }
      }
      return { ...base, state: 'current', freshness: 'current', result, error: null, duration_ms: Date.now() - t0 };
    }
    return { ...base, state: 'unavailable', freshness: 'none', result: null, error: `unknown kind ${entry.kind}` };
  } catch (e) {
    return { ...base, state: 'unavailable', freshness: 'none', result: null, error: msg(e), duration_ms: Date.now() - t0 };
  }
}

/** @param {any} registry @param {Parameters<typeof observe>[1]} [io] */
export async function observeAll(registry, io = {}) {
  const out = [];
  for (const e of registry.entries) out.push(await observe(e, io));
  return out;
}

// ── observation history (read-only) → historical / stale ─────────────────────

/**
 * Latest stored observation per instrument under $AIN/observations/<id>/*.json (written only by the CLI's --write).
 * @param {{ env?: NodeJS.ProcessEnv }} [opts]
 */
export function readObservationHistory(opts = {}) {
  const dir = path.join(resolveAinHome(opts.env || process.env), 'observations');
  /** @type {Record<string, { file: string, observation: any }>} */ const latest = {};
  /** @type {{ file: string, error: string }[]} */ const unreadable = [];
  if (!(existsSync(dir) && statSync(dir).isDirectory())) return { present: false, dir, latest, unreadable };
  for (const id of readdirSync(dir).sort()) {
    const d = path.join(dir, id); if (!statSync(d).isDirectory()) continue;
    const files = readdirSync(d).filter((f) => f.endsWith('.json')).sort();
    if (!files.length) continue;
    const file = path.join(d, files[files.length - 1]);
    try { latest[id] = { file, observation: JSON.parse(readFileSync(file, 'utf8')) }; } catch (e) { unreadable.push({ file, error: msg(e) }); }
  }
  return { present: true, dir, latest, unreadable };
}

/**
 * Freshness of a stored observation relative to now and the entry's stale_after_s.
 * @param {any} entry @param {any} observation @param {string} nowIso
 * @returns {'current'|'historical'|'stale'}
 */
export function freshnessOf(entry, observation, nowIso) {
  const age = (Date.parse(nowIso) - Date.parse(observation.observed_at)) / 1000;
  if (!Number.isFinite(age)) return 'historical';
  if (entry.stale_after_s == null) return 'historical';
  return age <= entry.stale_after_s ? 'current' : 'stale';
}

// ── helpers ───────────────────────────────────────────────────────────────────
function defaultExec() { return (/** @type {string} */ file, /** @type {string[]} */ args, /** @type {any} */ o) => { const cp = /** @type {any} */ (globalThis).process.getBuiltinModule ? /** @type {any} */ (globalThis).process.getBuiltinModule('node:child_process') : null; if (!cp) throw new Error('child_process unavailable'); return cp.execFileSync(file, args, o).toString(); }; }
/** The governor's counts are its own; the registry carries no aggregate (MR-5). @param {any} o */
function stripNumbers(o) { if (!o || typeof o !== 'object') return o; const out = Array.isArray(o) ? [] : {}; for (const [k, v] of Object.entries(o)) { if (typeof v === 'number') continue; /** @type {any} */ (out)[k] = typeof v === 'object' ? stripNumbers(v) : v; } return out; }
/** @param {unknown} e */ function msg(e) { return e instanceof Error ? e.message : String(e); }
