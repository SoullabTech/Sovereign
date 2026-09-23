// @ts-check
/**
 * B3 execution matrix — Monitor instrument registry.
 * Laws MR-1…MR-7 (instrument-registry.mjs header) + FD-4 (additive JSON mode) + RL-4 (witness: a census run mutates nothing).
 * Run: node tests/constitutional/founder-workspace/b3-matrix.mjs   (FOUNDER_WORKSPACE_SCRATCH=<dir> recommended)
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, statSync, lstatSync, rmSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { buildRegistry, admit, observe, observeAll, scanShell, readObservationHistory, freshnessOf, DECLARED, REFUSED_BY_NAME, REPO_ROOT } from '../../../scripts/builder/founder-workspace/instrument-registry.mjs';
import { adaptObservations, composeViewModel } from '../../../scripts/builder/founder-workspace/adapters.mjs';
import { validateViewModel } from '../../../scripts/builder/founder-workspace/viewmodel-v1.mjs';
import { readAllOrgans } from '../../../scripts/builder/founder-workspace/read-organs.mjs';
import { admitByName, observeWithoutPin, admitAnyUrl, observeOptimistic, registryWithScore, freshnessAlwaysCurrent } from './b3-candidates.mjs';

const SCRATCH = process.env.FOUNDER_WORKSPACE_SCRATCH || os.tmpdir();
let failures = 0;
/** @param {boolean} ok @param {string} law @param {string} text */
function check(ok, law, text) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${law}  ${text}`); if (!ok) failures++; }
/** @param {string} dir */
function snapshot(dir) {
  /** @type {Record<string,string>} */
  const out = {}; const walk = (/** @type {string} */ d) => { for (const f of readdirSync(d)) { if (f === 'node_modules' || f === '.git') continue; const p = path.join(d, f); let s; try { s = lstatSync(p); } catch { continue; } if (s.isSymbolicLink()) continue; if (s.isDirectory()) walk(p); else out[path.relative(dir, p)] = `${s.size}:${s.mtimeMs}`; } }; walk(dir); return out; }
const same = (/** @type {any} */ a, /** @type {any} */ b) => JSON.stringify(a) === JSON.stringify(b);

const reg = buildRegistry();
/** @returns {any} */
const byId = (/** @type {string} */ id) => reg.entries.find((e) => e.id === id);

// ── MR-1 admission ─────────────────────────────────────────────────────────────
check(['ops.workstation-storage-census', 'ops.worktree-census', 'voice.whisper-server'].every((id) => byId(id).admitted && byId(id).proof.kind === 'static-scan'), 'MR-1', 'the two census scripts and check-whisper admit on a static scan with every permitted write named');
check(reg.refused_by_name.every((r) => r.present && (r.scan_findings ?? 0) > 0), 'MR-1', `every script refused by name is present and fails the scan (${reg.refused_by_name.map((r) => `${path.basename(r.script)}=${r.scan_findings}`).join(' ')})`);
{ const e = /** @type {any} */ (admit(/** @type {any} */ ({ ...DECLARED.find((d) => d.id === 'ops.worktree-census'), id: 'x.mutating', script: 'scripts/storage-health-monitor.sh', declaration: {} }))); check(!e.admitted && e.refusal.law === 'MR-1', 'MR-1', 'storage-health-monitor.sh under a census-shaped entry is still REFUSED'); }
{ const c = admitByName({ id: 'x', script: 'scripts/storage-health-monitor.sh' }); check(c.admitted === true, 'DC-M1', 'candidate "trusted by name" ADMITS storage-health-monitor.sh → DIES on MR-1'); }

// ── MR-2 hash pin ──────────────────────────────────────────────────────────────
{
  const root = mkdtempSync(path.join(SCRATCH, 'fw-b3-pin-'));
  mkdirSync(path.join(root, 'scripts/ops'), { recursive: true });
  copyFileSync(path.join(REPO_ROOT, 'scripts/ops/worktree-census.sh'), path.join(root, 'scripts/ops/worktree-census.sh'));
  const e = /** @type {any} */ (admit(/** @type {any} */ (DECLARED.find((d) => d.id === 'ops.worktree-census')), { root }));
  writeFileSync(path.join(root, 'scripts/ops/worktree-census.sh'), readFileSync(path.join(root, 'scripts/ops/worktree-census.sh'), 'utf8') + '\nrm -rf "$HOME/important"\n');
  const o = await observe(e, { root, exec: () => { throw new Error('must not run'); } });
  check(o.state === 'refused' && /changed since admission/.test(o.error), 'MR-2', 'a script edited after admission is REFUSED at observation, never run');
  const c = observeWithoutPin(e, path.join(root, 'scripts/ops/worktree-census.sh'));
  check(c.state === 'current' && c.changed_ignored, 'DC-M2', 'candidate "no pin" observes the changed script as current → DIES on MR-2');
  rmSync(root, { recursive: true, force: true });
}

// ── MR-3 local-first ───────────────────────────────────────────────────────────
{
  const bad1 = /** @type {any} */ (admit({ id: 'x.ssh', subject: 's', group: 'g', plain: 'p', kind: 'command', host: 'local', command: ['ssh', 'soullab@minisforum', 'uptime'], scheduled: false, stale_after_s: 60, timeout_ms: 1000, cites: 't' }));
  const bad2 = /** @type {any} */ (admit({ id: 'x.url', subject: 's', group: 'g', plain: 'p', kind: 'loopback-get', host: 'local', url: 'http://minisforum:11434/api/tags', scheduled: false, stale_after_s: 60, timeout_ms: 1000, cites: 't' }));
  const bad3 = /** @type {any} */ (admit({ id: 'x.remote', subject: 's', group: 'g', plain: 'p', kind: 'command', host: /** @type {any} */ ('minisforum'), command: ['git', 'status'], scheduled: false, stale_after_s: 60, timeout_ms: 1000, cites: 't' }));
  check(!bad1.admitted && !bad2.admitted && !bad3.admitted && bad2.refusal.law === 'MR-3', 'MR-3', 'ssh to production, a non-loopback URL and a remote host are all REFUSED');
  check(byId('production.minisforum').admitted && byId('production.minisforum').proof.kind === 'not-instrumented', 'MR-7', 'the production boundary is a first-class not-instrumented row, not a probe');
  check(admitAnyUrl({ id: 'x', url: 'http://minisforum:11434/api/tags' }).admitted === true, 'DC-M3', 'candidate "any url" admits a production URL → DIES on MR-3');
}

// ── MR-4 unavailable never calm ───────────────────────────────────────────────
{
  const o1 = await observe(byId('ollama.tags'), { fetchImpl: async () => { throw new Error('ECONNREFUSED'); } });
  const o2 = await observe(byId('git.checkout'), { exec: () => { throw new Error('git missing'); } });
  check(o1.state === 'unavailable' && o1.freshness === 'none' && o2.state === 'unavailable', 'MR-4', 'a throwing probe observes unavailable · freshness none');
  const rows = adaptObservations([o1, o2], { entries: [byId('ollama.tags'), byId('git.checkout')] });
  check(rows.every((r) => r.level === 'failed' && r.freshness === 'current'), 'MR-4', 'adapted rows read failed (observed now), never good');
  check(observeOptimistic(byId('ollama.tags'), () => { throw new Error('x'); }).state === 'current', 'DC-M4', 'candidate "optimistic" reports current on error → DIES on MR-4');
  const o3 = await observe(byId('ollama.tags'), { fetchImpl: async () => ({ ok: true, status: 200, text: async () => JSON.stringify({ models: [{ name: 'qwen2.5:7b' }] }) }) });
  check(o3.state === 'current' && o3.result.models.length === 1, 'MR-6', 'a loopback GET that answers observes current with the parsed result');
}

// ── MR-5 no score / aggregate / cost ──────────────────────────────────────────
{
  const keys = new Set(); const walk = (/** @type {any} */ x) => { if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) { keys.add(k); walk(v); } }; walk(reg);
  const bad = [...keys].filter((k) => /^(score|health_score|health|aggregate|overall|cost|costs|rollup)$/i.test(k));
  check(bad.length === 0, 'MR-5', `registry carries no score/aggregate/cost key (${keys.size} keys scanned)`);
  check('health_score' in registryWithScore(reg), 'DC-M5', 'candidate "one health score" adds health_score → DIES on MR-5');
}

// ── MR-6 every observation names instrument · time · proof · state ────────────
{
  const all = /** @type {any[]} */ (await observeAll({ entries: reg.entries.filter((e) => e.kind === 'not-instrumented') }, {}));
  check(all.every((o) => o.instrument_id && o.observed_at && o.state && 'proof' in o), 'MR-6', 'observations carry instrument_id · observed_at · state · proof');
  check(all.every((o) => o.state === 'not_instrumented' && o.requires), 'MR-7', 'not-instrumented entries observe not_instrumented with what they require');
}

// ── FD-4 additive JSON mode + RL-4 witness (real runs, bounded, this host) ───
{
  const sd = mkdtempSync(path.join(SCRATCH, 'fw-b3-run-'));
  const before = snapshot(REPO_ROOT);
  const plain = execFileSync('bash', [path.join(REPO_ROOT, 'scripts/ops/worktree-census.sh')], { env: { ...process.env, REPO: REPO_ROOT, CENSUS_FETCH: '0', CENSUS_JSON: '', CENSUS_OUT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 300000 });
  check(plain.startsWith('Worktree census — READ ONLY') && !readdirSync(sd).length, 'FD-4', 'worktree-census default output unchanged and no JSON produced without CENSUS_JSON');
  const jsonPath = path.join(sd, 'wt.json');
  execFileSync('bash', [path.join(REPO_ROOT, 'scripts/ops/worktree-census.sh')], { env: { ...process.env, REPO: REPO_ROOT, CENSUS_FETCH: '0', CENSUS_JSON: jsonPath, CENSUS_OUT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 300000 });
  const wt = JSON.parse(readFileSync(jsonPath, 'utf8'));
  check(wt.read_only === true && Array.isArray(wt.rows) && wt.rows.length >= 1 && 'class' in wt.rows[0], 'FD-4', `worktree-census CENSUS_JSON → ${wt.rows.length} row(s), same columns as the TSV`);
  const jl = path.join(sd, 'st.jsonl');
  execFileSync('bash', [path.join(REPO_ROOT, 'scripts/ops/workstation-storage-census.sh')], { env: { ...process.env, CENSUS_ROOTS: path.join(REPO_ROOT, 'docs'), CENSUS_SKIP_DOCKER: '1', CENSUS_PROBE_SECS: '5', CENSUS_JSON: jl, CENSUS_OUT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 300000 });
  const lines = readFileSync(jl, 'utf8').split('\n').filter(Boolean); let bad = 0; const kinds = new Set(); for (const l of lines) { try { kinds.add(JSON.parse(l).kind); } catch { bad++; } }
  check(bad === 0 && kinds.has('meta') && kinds.has('section') && kinds.has('row'), 'FD-4', `workstation-storage-census CENSUS_JSON → ${lines.length} JSON lines (meta · section · row), 0 unreadable`);
  check(same(before, snapshot(REPO_ROOT)), 'RL-4', 'both census runs left the repository snapshot byte-identical (size + mtime)');
  // registry-driven observation of the two scripts through observe() with the JSON sidecar
  const oWt = /** @type {any} */ (await observe(byId('ops.worktree-census'), { scratchDir: sd, env: { ...process.env, REPO: REPO_ROOT } }));
  check(oWt.state === 'current' && oWt.result.json && oWt.result.json.rows.length >= 1, 'MR-6', `observe(ops.worktree-census) → current via CENSUS_JSON (${oWt.duration_ms} ms)`);
  rmSync(sd, { recursive: true, force: true });
}

// ── history: historical / stale, and the composed Monitor validates ───────────
{
  const home = mkdtempSync(path.join(SCRATCH, 'fw-b3-home-'));
  const env = { ...process.env, AIN_DELEGATION_HOME: home };
  const old = { schema: 'instrument-observation.v1', instrument_id: 'git.status', subject: 'Working copy', group: 'This workspace', plain: 'x', host: 'local', observed_at: '2026-09-20T10:00:00Z', proof: 'command-allowlist', state: 'current', freshness: 'current', result: { stdout: '' }, error: null };
  mkdirSync(path.join(home, 'observations', 'git.status'), { recursive: true });
  writeFileSync(path.join(home, 'observations', 'git.status', '2026-09-20T10-00-00Z.json'), JSON.stringify(old));
  writeFileSync(path.join(home, 'observations', 'git.status', 'bad.json'), '{');
  const h = readObservationHistory({ env });
  check(h.present && h.latest['git.status'] === undefined && h.unreadable.length === 1 || (h.latest['git.status'] && h.unreadable.length === 1), 'RL-2', `history: unreadable stored observation surfaced (${h.unreadable.length})`);
  const fresh = freshnessOf(byId('git.status'), old, '2026-09-23T10:00:00Z');
  check(fresh === 'stale', 'MR-6', `a 3-day-old observation with stale_after_s=300 is stale (got ${fresh})`);
  check(freshnessAlwaysCurrent() === 'current', 'DC-M6', 'candidate "yesterday is still current" → DIES on MR-6');
  const rows = adaptObservations([], { entries: [byId('git.status')] }, { latest: { 'git.status': { file: 'f', observation: old } } }, '2026-09-23T10:00:00Z');
  check(rows[0].freshness === 'historical' && rows[0].level === 'good' && /present state unknown/.test(rows[0].plain), 'DC-8', 'a historical good observation renders "observed then · present state unknown", never fine-now');
  const organs = await readAllOrgans({ env, exec: () => '{}' });
  const obs = await observeAll({ entries: reg.entries.filter((e) => e.kind === 'not-instrumented') }, {});
  const vm = composeViewModel({ status: null, organs, observed_against: 'test', observations: obs, registry: reg, observation_history: h });
  const r = validateViewModel(vm, { mode: 'live' });
  check(r.ok && vm.monitor.some((m) => m.subject === 'Production (minisforum)' && m.level === 'unauthorized'), 'AL-5', `composed view-model with registry rows validates live (${vm.monitor.length} monitor rows; ${r.violations.length} violations)`);
  if (!r.ok) r.violations.slice(0, 5).forEach((v) => console.log(`        ${v.law} ${v.path}: ${v.detail}`));
  rmSync(home, { recursive: true, force: true });
}

console.log(failures === 0 ? '\nB3 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)' : `\nB3 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures === 0 ? 0 : 1);
