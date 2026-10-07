/**
 * HTTP-level smoke test of the F surface's durability. Spawns the REAL server against a synthetic home and drives it
 * over HTTP: save → delete the working file → state still disk-verified → restart → progress intact → refusal paths.
 *
 * ⚠️ Requires the UI model modules (`human-ui-model.ts`, `human-ui.css`). At 279bfb232 these are NOT in version control,
 * so this test cannot run from a clean checkout until they are committed. It is the only check that needs them.
 *
 *   JEV_TSX="npx tsx" npx tsx human-f-ui-server-smoke.ts
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blankSheet, seal, snapshot } from './pilot';

const tsx = process.env.JEV_TSX ?? 'npx tsx';
let total = 0; let failed = 0;
const ok = (name: string, pass: boolean): void => { total += 1; if (!pass) failed += 1; console.log((pass ? 'PASS' : 'FAIL') + '  ' + name); };

const UNIT = { work_unit: {
  identity: { id: 'x', objective: 'o', task_shape: 'CODE_GROUNDED', work_class: 'IMPLEMENTATION' },
  custody: { evidence_class: 'E1_REPOSITORY_LOCAL' }, routing_request: {}, context: {}, scope: { allowed_paths: ['lib/x.ts'] },
  authority: { repository_read: true, network_external: false }, routing: { route_record: {} },
  evaluation: { acceptance_conditions: [], falsification_conditions: [], stop_conditions: [] }, state: { lifecycle_state: 'DONE' } } };

const root = mkdtempSync(join(tmpdir(), 'jev-f-smoke-'));
const home = join(root, 'home'); const dir = join(home, 'work-units-v2');
mkdirSync(dir, { recursive: true });
for (let i = 0; i < 2; i += 1) { const u = structuredClone(UNIT); u.work_unit.identity.id = 'v2-smoke-' + i; writeFileSync(join(dir, 'v2-smoke-' + i + '.json'), JSON.stringify(u)); }
const { manifest, index } = snapshot(home, 2);
let p = blankSheet(manifest, 'A', 'P');
for (const e of p.entries) e.value = e.target === 'Q_DEPTH' ? 2 : true;
const sealedP = seal(manifest, p, 1);
const f = blankSheet(manifest, 'A', 'F', sealedP);
const pilot = join(root, 'pilot'); mkdirSync(pilot, { recursive: true });
const source = join(pilot, 'kelly-F-sheet.json'); const working = join(pilot, 'kelly-F-sheet-working.json');
const backup = join(root, 'backup');
writeFileSync(source, JSON.stringify(f, null, 2));
writeFileSync(join(pilot, 'manifest.json'), JSON.stringify(manifest)); writeFileSync(join(pilot, 'local-index.json'), JSON.stringify(index));
const port = 20000 + Math.floor(Math.random() * 20000);
const base = 'http://127.0.0.1:' + port;

function start(): Promise<{ proc: ChildProcess; out: () => string }> {
  const args = [join(__dirname, 'human-f-ui-server.ts'), '--home', home, '--manifest', join(pilot, 'manifest.json'), '--index', join(pilot, 'local-index.json'),
    '--sheet', source, '--working', working, '--backup-dir', backup, '--port', String(port)];
  // detached = own process group, so stop() can take down the whole tsx → node tree (a shell wrapper would orphan the server)
  const [cmd, ...pre] = tsx.split(' ');
  const proc = spawn(cmd as string, [...pre, ...args], { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let out = '';
  proc.stdout?.on('data', (d) => { out += String(d); }); proc.stderr?.on('data', (d) => { out += String(d); });
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server did not start: ' + out)), 60_000);
    const iv = setInterval(() => { if (out.includes('BOUNDARY=')) { clearTimeout(t); clearInterval(iv); resolve({ proc, out: () => out }); } }, 100);
    proc.on('exit', (c) => { if (!out.includes('BOUNDARY=')) { clearTimeout(t); clearInterval(iv); reject(new Error('server exited ' + c + ': ' + out)); } });
  });
}
const get = async (path: string) => { const r = await fetch(base + path); return { status: r.status, body: await r.json() as any }; };
const post = async (path: string, body: unknown) => { const r = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, body: await r.json() as any }; };
const answers = { Q_DEPTH: { value: 4, ambiguous: false, note: null }, Q_RISK: { value: true, ambiguous: false, note: null }, Q_SUFFICIENT: { value: false, ambiguous: false, note: null }, Q_LLM_NEEDED: { value: true, ambiguous: true, note: 'nearest' } };
const stop = (s: { proc: ChildProcess }): Promise<void> => new Promise((r) => {
  const pid = s.proc.pid as number;
  const killGroup = (sig: NodeJS.Signals): void => { try { process.kill(-pid, sig); } catch { /* already gone */ } };
  s.proc.once('exit', () => setTimeout(r, 300));
  killGroup('SIGTERM');
  setTimeout(() => { killGroup('SIGKILL'); r(); }, 5000);
});

(async () => {
  let s = await start();
  ok('startup prints the actual WORKING= / BACKUP_DIR= / EVENT_LOG= paths', s.out().includes('WORKING=' + working) && s.out().includes('BACKUP_DIR=' + backup) && s.out().includes('EVENT_LOG='));
  const st0 = await get('/api/state');
  ok('/api/state carries a disk-verification block (0 of 2 at start)', st0.status === 200 && st0.body.custody.disk_verified === true && st0.body.state.completed_cases === 0);
  const id0 = st0.body.state.cases[0].pilot_id as string;
  const sv = await post('/api/save', { pilot_id: id0, answers });
  ok('/api/save reports 1 of 2 read back from disk, with working/rolling hashes', sv.status === 200 && sv.body.state.completed_cases === 1 && sv.body.custody.working_sha256 === sv.body.custody.rolling_sha256);
  rmSync(working);
  const st1 = await get('/api/state');
  ok('working file DELETED behind the running server: /api/state still reports 1 of 2 and says it repaired', st1.body.state.completed_cases === 1 && st1.body.custody.repaired.includes('WORKING_RESTORED_MISSING') && existsSync(working));
  const cu = await get('/api/custody');
  ok('/api/custody returns only the verification block (no answers, no routing state)', cu.status === 200 && !('state' in cu.body) && cu.body.custody.completed_cases_from_disk === 1);
  const bad = await post('/api/save', { pilot_id: id0, answers: { ...answers, Q_DEPTH: { value: 'UNDETERMINABLE', ambiguous: false, note: null } } });
  ok('an invalid F answer is refused (400) and changes nothing', bad.status === 400 && (await get('/api/custody')).body.custody.completed_cases_from_disk === 1);
  await stop(s);
  s = await start();
  ok('server RESTART resumes at 1 of 2 (not a fresh blank)', (await get('/api/state')).body.state.completed_cases === 1);
  const id1 = (await get('/api/state')).body.state.cases[1].pilot_id as string;
  const sv2 = await post('/api/save', { pilot_id: id1, answers });
  ok('second case saves; 2 of 2 read back from disk', sv2.body.state.completed_cases === 2);
  const logText = readFileSync(join(backup, 'events.jsonl'), 'utf8');
  ok('the on-disk event log is content-free and records every save', (logText.match(/F_CASE_SAVED_TO_DISK/g) ?? []).length === 2 && !/nearest|"value"|Q_DEPTH/.test(logText));
  ok('startup event pinned the code identity (file hashes, MISSING if absent)', /"code_identity":\{"git_head"/.test(logText) && logText.includes('human-f-durability.ts'));
  await stop(s);

  // everything but the ledger lost while the server is down → it must REFUSE to start
  rmSync(working); rmSync(join(backup, 'rolling-latest.json')); rmSync(join(backup, 'generations'), { recursive: true });
  let refused = false;
  try { const s2 = await start(); await stop(s2); } catch (e) { refused = String(e).includes('DURABILITY_UNRECOVERABLE'); }
  ok('with all copies lost, the server REFUSES to start (never a blank sheet over lost progress)', refused);
  rmSync(root, { recursive: true, force: true });
  console.log('\n' + total + ' checks · ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
})().catch((e) => { console.error('SMOKE ERROR', e); rmSync(root, { recursive: true, force: true }); process.exit(1); });
