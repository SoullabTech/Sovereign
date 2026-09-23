// @ts-check
/**
 * B2 execution matrix — read organs + adapters (JARVIS-FOUNDER-WORKSPACE-01 / B2).
 * Laws: RL-0 no write primitive imported · RL-1 absent storage is reported, never created ·
 *       RL-2 unreadable objects are surfaced, never dropped · RL-3 a bad event line is surfaced with its line number ·
 *       RL-4 reading the whole substrate mutates nothing (byte/mtime snapshot) · RL-5 the real governor CLI is presence-gated ·
 *       AL-1 a live composition refuses ILLUSTRATIVE · AL-2 unknown organ state → unobserved, never good ·
 *       AL-3 every unreadable becomes a visible row · AL-5 the composed view-model validates and carries no count.
 * Run: node tests/constitutional/founder-workspace/b2-matrix.mjs  (exit 0 = all laws hold + all candidates dead)
 */
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readdirSync, statSync, rmSync, readFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { listWorkUnitsV2, listRunsReadOnly, readEventsTail, listSessions, governorReportReadOnly, listResults, readAllOrgans, REPO_ROOT } from '../../../scripts/builder/founder-workspace/read-organs.mjs';
import { composeViewModel, levelOf, adaptStatus } from '../../../scripts/builder/founder-workspace/adapters.mjs';
import { validateViewModel } from '../../../scripts/builder/founder-workspace/viewmodel-v1.mjs';
import { listRunsCreatesOnRead, listRunsSkipsUnreadable, levelOfOptimistic } from './b2-candidates.mjs';

const require = createRequire(import.meta.url);
const C = require(path.join(REPO_ROOT, 'jarvis-desktop/src/canonical-work-unit-v2.js'));
const here = path.dirname(fileURLToPath(import.meta.url));
const SCRATCH = process.env.FOUNDER_WORKSPACE_SCRATCH || os.tmpdir();

let failures = 0;
/** @param {boolean} ok @param {string} law @param {string} text */
function check(ok, law, text) { console.log(`${ok ? 'PASS' : 'FAIL'}  ${law}  ${text}`); if (!ok) failures++; }
/** @param {string} dir */
function snapshot(dir) {
  /** @type {Record<string, string>} */ const out = {};
  if (!existsSync(dir)) return out;
  const walk = (/** @type {string} */ d) => { for (const f of readdirSync(d)) { const p = path.join(d, f); const s = statSync(p); if (s.isDirectory()) walk(p); else out[path.relative(dir, p)] = `${s.size}:${s.mtimeMs}`; } };
  walk(dir); return out;
}
const same = (/** @type {any} */ a, /** @type {any} */ b) => JSON.stringify(a) === JSON.stringify(b);

// ── RL-0 static guard ──────────────────────────────────────────────────────
{
  const src = readFileSync(path.join(REPO_ROOT, 'scripts/builder/founder-workspace/read-organs.mjs'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const importLine = src.match(/import\s*\{([^}]*)\}\s*from\s*'node:fs'/);
  const names = importLine ? importLine[1].split(',').map((s) => s.trim()) : [];
  const forbidden = names.filter((n) => /mkdir|write|append|rename|unlink|rm|copy|chmod|truncate/i.test(n));
  const bodyHits = src.match(/\b(mkdirSync|writeFileSync|appendFileSync|renameSync|unlinkSync|rmSync|initStore|ensureHome|ensureStore)\b/g) || [];
  check(forbidden.length === 0 && bodyHits.length === 0, 'RL-0', `read-organs imports no write primitive (fs imports: ${names.join(', ')}; body hits: ${bodyHits.length})`);
  const adapters = readFileSync(path.join(REPO_ROOT, 'scripts/builder/founder-workspace/adapters.mjs'), 'utf8');
  check(!/from 'node:(fs|child_process|net|http)'/.test(adapters), 'RL-0', 'adapters import no fs/process/network');
}

// ── absent home ──────────────────────────────────────────────────────────────
{
  const home = path.join(mkdtempSync(path.join(SCRATCH, 'fw-b2-absent-')), 'never-created');
  const env = { ...process.env, AIN_DELEGATION_HOME: home };
  let execCalls = 0;
  const organs = await readAllOrgans({ env, exec: () => { execCalls++; return '{}'; } });
  check(!existsSync(home), 'RL-1', 'absent $AIN home is not created by any read organ');
  check([organs.units, organs.runs, organs.events, organs.sessions, organs.governor, organs.results].every((o) => o.present === false), 'RL-1', 'every organ reports present:false on an absent home');
  check(execCalls === 0, 'RL-5', 'governor CLI not invoked when $AIN/sessions is absent (presence gate)');
  const vm = composeViewModel({ status: null, organs, observed_against: 'test' });
  check(validateViewModel(vm, { mode: 'live' }).ok, 'AL-5', 'composition over an absent home validates live');
  check(vm.monitor.every((r) => r.level !== 'good'), 'AL-2', 'nothing reads good when nothing was observed');
  rmSync(path.dirname(home), { recursive: true, force: true });
}

// ── populated home (real canonical writer, scratch only) ──────────────────────
{
  const home = mkdtempSync(path.join(SCRATCH, 'fw-b2-home-'));
  const env = { ...process.env, AIN_DELEGATION_HOME: home, USER: 'b2-test' };
  const spec = { objective: 'Prove the Founder Workspace can read a real unit', workClass: 'VERIFICATION', taskShape: 'CODE_GROUNDED', capability: '', evidenceClass: 'E1_REPOSITORY_LOCAL', requestedPosture: 'default', reviewPressure: 'ordinary', evidenceFocus: 'scripts/builder/work-unit-v2.mjs', acceptanceCriteria: 'Unit is listed', falsificationConditions: 'Unit is hidden', stopConditions: 'Stop before execution', authorityRequest: { networkExternal: false, providerSpend: false, externalDisclosure: 'none' } };
  const created = await C.createCanonicalV2(REPO_ROOT, spec, { canonicalSha: 'f0063747979b8104282e3f482dcd91ec6c208ad0', nowMs: 1000, env });
  check(created.ok === true, 'setup', `real canonical v2 unit created in scratch (${created.work_unit_id || created.reason})`);
  const unitsDir = path.join(home, 'work-units-v2');
  writeFileSync(path.join(unitsDir, 'wu-corrupt.json'), '{ not json');
  writeFileSync(path.join(unitsDir, 'wu-notenvelope.json'), '{"hello":"world"}');
  mkdirSync(path.join(home, 'runtime', 'runs'), { recursive: true });
  writeFileSync(path.join(home, 'runtime', 'runs', 'r-0123456789.json'), JSON.stringify({ run_id: 'r-0123456789', created_at: '2026-09-23T10:00:00Z', state: 'completed', work_unit_id: 'wu-x', execution_lane: 'C0' }));
  writeFileSync(path.join(home, 'runtime', 'runs', 'r-bad.json'), '{{{');
  writeFileSync(path.join(home, 'runtime', 'events.jsonl'), JSON.stringify({ at: '2026-09-23T10:00:00Z', event: 'worker.started', run_id: 'r-0123456789' }) + '\n' + 'this is not json\n' + JSON.stringify({ at: '2026-09-23T10:01:00Z', event: 'worker.finished', run_id: 'r-0123456789' }) + '\n');
  mkdirSync(path.join(home, 'sessions'), { recursive: true });
  writeFileSync(path.join(home, 'sessions', 's-1.json'), JSON.stringify({ session_id: 's-1', state: 'handed-off', purpose: 'MAIA voice work', branch: 'x', opened_at: '2026-09-22T10:00:00Z', closed_at: '2026-09-22T12:00:00Z', model: 'm' }));
  writeFileSync(path.join(home, 'sessions', 's-bad.json'), 'nope');
  mkdirSync(path.join(home, 'results'), { recursive: true });
  writeFileSync(path.join(home, 'results', 'wu-x.json'), JSON.stringify({ work_unit_id: 'wu-x', lane: 'local-native' }));

  const before = snapshot(home);
  const organs = await readAllOrgans({ env, exec: () => JSON.stringify({ window_since: 'all-time', max_builder_governed_concurrency: 1, work_handed_off: 1, caveat: 'test' }) });
  check(same(before, snapshot(home)), 'RL-4', 'reading every organ changed no file (size+mtime snapshot identical)');
  check(organs.units.units.length === 1 && organs.units.unreadable.length === 2, 'RL-2', `work units: 1 readable via statusCanonicalV2, 2 unreadable surfaced (${organs.units.unreadable.map((u) => path.basename(u.file)).join(', ')})`);
  check(organs.runs.runs.length === 1 && organs.runs.unreadable.length === 1, 'RL-2', 'runs: corrupt run surfaced, not skipped');
  check(organs.events.entries.length === 2 && organs.events.unreadable.length === 1 && /line 2/.test(organs.events.unreadable[0].error), 'RL-3', 'events: bad line surfaced with its line number');
  check(organs.sessions.sessions.length === 1 && organs.sessions.unreadable.length === 1, 'RL-2', 'sessions: corrupt record surfaced');
  check(organs.results.results.length === 1, 'setup', 'results enumerated');

  // real governor CLI, presence-gated, read-only
  const before2 = snapshot(home);
  const gov = await governorReportReadOnly({ env, root: REPO_ROOT });
  check(gov.present === true && !!gov.report && typeof gov.report.work_handed_off === 'number' && same(before2, snapshot(home)), 'RL-5', `real session.mjs report --json read through the wrapper without mutation (handed_off=${gov.report?.work_handed_off})`);

  const status = { observed_at: '2026-09-23T20:00:00Z', workspace: { root: REPO_ROOT, branch: 'claude/x', head: 'eb77216b', clean: true }, builder_os: { state: 'AVAILABLE', detail: 'ok' }, local_worker: { state: 'UNREACHABLE', detail: 'Ollama not running' }, production: { state: 'NOT PROBED', detail: 'by Desktop law' }, continuity: { state: 'SOMETHING_NEW', detail: '' }, governance_holds: [] };
  const vm = composeViewModel({ status, organs, observed_against: '840194ba859bd5a497fc939c94329ee972ca3f80' });
  const r = validateViewModel(vm, { mode: 'live' });
  check(r.ok, 'AL-5', `composed live view-model validates (${r.violations.length} violations)`);
  if (!r.ok) r.violations.slice(0, 6).forEach((v) => console.log(`        ${v.law} ${v.path}: ${v.detail}`));
  check(vm.work.units.filter((u) => u.state === 'UNREADABLE').length === 2 && vm.work.history.some((h) => h.evidence_state === 'UNREADABLE') && vm.events.some((e) => e.evidence_state === 'UNREADABLE') && vm.work.handoffs.some((h) => h.evidence_state === 'UNREADABLE'), 'AL-3', 'every unreadable object is a visible row in the view-model');
  const real = vm.work.units.find((u) => u.state !== 'UNREADABLE');
  check(!!real && real.state === 'DRAFT' && real.title === spec.objective && real.evidence_state === 'OBSERVED', 'AL-4', `real unit adapted: ${real?.id} · ${real?.state} · "${real?.title}"`);
  const cont = vm.monitor.find((m) => m.subject === 'Continuity');
  check(cont?.level === 'unobserved', 'AL-2', `unknown organ state 'SOMETHING_NEW' renders unobserved (got ${cont?.level})`);
  const prod = vm.monitor.find((m) => m.subject.startsWith('Production'));
  check(prod?.level === 'unauthorized' && prod.evidence_state === 'DELIBERATELY REFUSED', 'AL-2', 'NOT PROBED renders unauthorized · DELIBERATELY REFUSED (D-04)');
  check(vm.monitor.every((m) => m.instrument && m.observed_at !== undefined && m.freshness), 'AL-4', 'every monitor row names instrument + freshness');
  check(!!vm.work.governor && !Object.values(vm.work.governor).some((v) => typeof v === 'number'), 'AL-5', 'governor counts stripped from the view-model (VM-7)');
  // stale status: observed_at absent → nothing reads good
  const stale = adaptStatus({ ...status, observed_at: null });
  check(stale.monitor.every((m) => m.level !== 'good' && m.freshness === 'none'), 'AL-2', 'a status without observed_at can never read good (no false calm)');
  // AL-1 refusal at the seam
  let refused = false;
  try { composeViewModel({ status, organs, observed_against: 't', graph: { nodes: [{ id: 'n', kind: 'x', label: 'Example', evidence_state: 'ILLUSTRATIVE' }], edges: [] } }); } catch (e) { refused = /VM-5/.test(String(e)); }
  check(refused, 'AL-1', 'live composition refuses an ILLUSTRATIVE object at the seam');

  // ── defeat candidates ──
  {
    const h2 = path.join(mkdtempSync(path.join(SCRATCH, 'fw-b2-dc-')), 'absent');
    const e2 = { ...process.env, AIN_DELEGATION_HOME: h2 };
    listRunsCreatesOnRead(e2);
    check(existsSync(path.join(h2, 'runtime', 'runs')), 'DC-R1', 'candidate "read may create" DIES on RL-1 (directory appeared)');
    rmSync(path.dirname(h2), { recursive: true, force: true });
  }
  {
    const c = listRunsSkipsUnreadable(env);
    check(c.unreadable.length === 0 && c.runs.length === 1, 'DC-R2', 'candidate "skip unreadable quietly" DIES on RL-2 (unreadable count 0 while a corrupt run exists)');
  }
  check(levelOfOptimistic('SOMETHING_NEW') === 'good' && levelOf('SOMETHING_NEW') === 'unobserved', 'DC-R3', 'candidate "unknown is probably fine" DIES on AL-2');
  rmSync(home, { recursive: true, force: true });
}

console.log(failures === 0 ? '\nB2 MATRIX: ALL LAWS HOLD · CANDIDATES DEAD (exit 0)' : `\nB2 MATRIX: ${failures} failure(s) (exit 1)`);
process.exit(failures === 0 ? 0 : 1);
