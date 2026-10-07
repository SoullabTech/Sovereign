/**
 * Hermetic checks for F-pass durability (R1) and the finish gate. Synthetic home only; depends on pilot.ts and the
 * durability/finish modules — NOT on the UI model — so it runs from a clean checkout.
 */
import {
  appendFileSync, chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { blankSheet, seal, sealDigest, snapshot, type Manifest, type Sealed, type Sheet } from './pilot';
import {
  appendEvent, Custody, DurabilityRefused, readEvents, sha256Hex, canonicalSheet, writeOnceVerified,
} from './human-f-durability';
import { finishF } from './human-f-finish';

let total = 0;
let failed = 0;
const ok = (name: string, pass: boolean): void => {
  total += 1;
  if (!pass) failed += 1;
  console.log((pass ? 'PASS' : 'FAIL') + '  ' + name);
};
/** Like ok(), but an exception inside the body is a FAIL on this check's own name, never an anonymous crash. */
const okf = (name: string, body: () => boolean): void => {
  let pass = false;
  try { pass = body(); } catch { pass = false; }
  ok(name, pass);
};
const refusedWith = (f: () => unknown, code: string): boolean => {
  try { f(); return false; } catch (e) { return e instanceof DurabilityRefused && e.code === code; }
};
const mode = (p: string): number => statSync(p).mode & 0o777;

const UNIT = {
  work_unit: {
    identity: { id: 'x', objective: 'o', task_shape: 'CODE_GROUNDED', work_class: 'IMPLEMENTATION' },
    custody: { evidence_class: 'E1_REPOSITORY_LOCAL' },
    routing_request: { requested_posture: 'default', review_pressure: 'ordinary' },
    context: { context_refs: [], evidence_refs: [], assumptions: [], unknowns: [] },
    scope: { repository: 'r', base_ref: 'b', allowed_paths: ['lib/x.ts'], forbidden_paths: [] },
    authority: { repository_read: true, repository_write: 'none', shell: 'none', network_external: false },
    routing: { router_version: 'r', route_version: 'v', route_source: 's', bound_at_sha: 'b', primary: {}, challengers: [], transport_bindings: [], route_record: {} },
    evaluation: { acceptance_conditions: [], falsification_conditions: [], stop_conditions: [] },
    state: { lifecycle_state: 'DONE' },
  },
};

const ANSWERS = { Q_DEPTH: 3, Q_RISK: true, Q_SUFFICIENT: false, Q_LLM_NEEDED: true } as const;
function fillCase(sheet: Sheet, pilotId: string): Sheet {
  const next = structuredClone(sheet);
  for (const e of next.entries) if (e.pilot_id === pilotId) e.value = ANSWERS[e.target];
  return next;
}
function fillAll(sheet: Sheet): Sheet {
  let s = sheet;
  for (const id of new Set(sheet.entries.map((e) => e.pilot_id))) s = fillCase(s, id);
  return s;
}
const parseF = (t: string): Sheet => {
  const s = JSON.parse(t) as Sheet;
  if (s.domain !== 'F' || s.labeller !== 'A' || !s.after_p_seal_sha256) throw new DurabilityRefused('NOT_AN_F_SHEET', 'test parse');
  return s;
};

interface Env {
  root: string; home: string; manifest: Manifest; index: ReturnType<typeof snapshot>['index'];
  sealedP: Sealed; fBlank: Sheet; source: string; working: string; backup: string;
  manifestPath: string; indexPath: string; sealedPPath: string; custody: () => Custody;
}
function mk(cases = 3): Env {
  const root = mkdtempSync(join(tmpdir(), 'jev-f-dur-'));
  const home = join(root, 'home');
  const dir = join(home, 'work-units-v2');
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < cases; i += 1) {
    const u = structuredClone(UNIT);
    u.work_unit.identity.id = 'v2-dur-' + i;
    writeFileSync(join(dir, 'v2-dur-' + i + '.json'), JSON.stringify(u));
  }
  const { manifest, index } = snapshot(home, cases);
  const pSheet = fillAll(blankSheet(manifest, 'A', 'P'));
  const sealedP = seal(manifest, pSheet, 1);
  const fBlank = blankSheet(manifest, 'A', 'F', sealedP);
  const pilotDir = join(root, 'pilot');
  mkdirSync(pilotDir, { recursive: true });
  const source = join(pilotDir, 'kelly-F-sheet.json');
  writeFileSync(source, JSON.stringify(fBlank, null, 2));
  const manifestPath = join(pilotDir, 'manifest.json');
  const indexPath = join(pilotDir, 'local-index.json');
  const sealedPPath = join(pilotDir, 'kelly-P-sealed.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  writeFileSync(indexPath, JSON.stringify(index, null, 2));
  writeFileSync(sealedPPath, JSON.stringify(sealedP, null, 2));
  const working = join(pilotDir, 'kelly-F-sheet-working.json');
  const backup = join(root, 'backup');
  const custody = (): Custody => new Custody({ home, sourcePath: source, workingPath: working, backupDir: backup, parse: parseF, identity: () => ({ test: true }) });
  return { root, home, manifest, index, sealedP, fBlank, source, working, backup, manifestPath, indexPath, sealedPPath, custody };
}
const ids = (e: Env): string[] => e.manifest.units.map((u) => u.pilot_id);
const gens = (e: Env): string[] => (existsSync(join(e.backup, 'generations')) ? readdirSync(join(e.backup, 'generations')).sort() : []);

// ── start / save ──
{
  const e = mk();
  const c = e.custody();
  const r0 = c.start();
  ok('start on a blank source reports 0 cases, disk-verified, no working file yet', r0.completed_cases_from_disk === 0 && r0.disk_verified && !r0.working_exists);
  const [a, b] = ids(e) as [string, string];
  const s1 = c.save(fillCase(e.fBlank, a), a);
  ok('save writes working + rolling + generation, byte-identical', existsSync(e.working) && readFileSync(e.working, 'utf8') === readFileSync(join(e.backup, 'rolling-latest.json'), 'utf8')
    && gens(e).length === 1 && sha256Hex(readFileSync(join(e.backup, 'generations', gens(e)[0] as string))) === s1.report.working_sha256);
  ok('save reports the count read BACK from disk', s1.report.completed_cases_from_disk === 1 && s1.report.working_sha256 === sha256Hex(readFileSync(e.working)));
  ok('working, rolling and generation files are mode 0600', mode(e.working) === 0o600 && mode(join(e.backup, 'rolling-latest.json')) === 0o600
    && mode(join(e.backup, 'generations', gens(e)[0] as string)) === 0o600 && mode(join(e.backup, 'events.jsonl')) === 0o600);
  const ev = readEvents(join(e.backup, 'events.jsonl')).events;
  const last = ev[ev.length - 1]!;
  ok('event log records the save with both hashes and the generation, and verifies as a chain',
    last.event === 'F_CASE_SAVED_TO_DISK' && last.working_sha256 === s1.report.working_sha256 && last.rolling_sha256 === s1.report.working_sha256 && typeof last.generation_file === 'string');
  const logText = readFileSync(join(e.backup, 'events.jsonl'), 'utf8');
  ok('event log carries NO judgment values, notes or answers', !/"value"|"note"|"ambiguous"|Q_DEPTH|Q_RISK|"answers"/.test(logText));
  ok('startup event records source, working, rolling, event-log paths and code identity',
    ev.some((x) => x.event === 'F_SERVER_STARTED' && x.working_path === e.working && typeof x.rolling_path === 'string' && typeof x.event_log_path === 'string' && (x.code_identity as { test?: boolean }).test === true));
  c.save(fillCase(readFileSync(e.working, 'utf8') ? parseF(readFileSync(e.working, 'utf8')) : e.fBlank, b), b);
  ok('a second save advances the generation ledger without touching the first', gens(e).length === 2);

  // tamper with the event log → refused
  const evPath = join(e.backup, 'events.jsonl');
  const orig = readFileSync(evPath, 'utf8');
  writeFileSync(evPath, orig.replace('F_CASE_SAVED_TO_DISK', 'F_CASE_SAVED_TO_DISX'));
  ok('a tampered event log is refused (hash chain)', refusedWith(() => readEvents(evPath), 'EVENT_LOG_CORRUPT'));
  writeFileSync(evPath, orig);
  ok('the restored event log verifies again', readEvents(evPath).events.length === ev.length + 1);
  rmSync(e.root, { recursive: true, force: true });
}

// ── loss and replacement after a successful save ──
{
  const e = mk();
  const c = e.custody(); c.start();
  const [a, b] = ids(e) as [string, string];
  c.save(fillCase(e.fBlank, a), a);
  const afterA = parseF(readFileSync(e.working, 'utf8'));
  c.save(fillCase(afterA, b), b);
  const good = readFileSync(e.working, 'utf8');

  rmSync(e.working);
  const r1 = c.verify();
  okf('primary file DELETED after a successful save is restored from the survivors, count intact', () =>
    readFileSync(e.working, 'utf8') === good && r1.report.completed_cases_from_disk === 2 && r1.report.repaired.includes('WORKING_RESTORED_MISSING'));

  writeFileSync(e.working, JSON.stringify(e.fBlank, null, 2));
  const r2 = c.verify();
  okf('primary file REPLACED by the blank source is repaired, and the diverged copy is preserved for inspection', () =>
    readFileSync(e.working, 'utf8') === good && r2.report.repaired.includes('WORKING_RESTORED_DIVERGED')
    && existsSync(join(e.backup, 'diverged')) && readdirSync(join(e.backup, 'diverged')).length === 1);

  writeFileSync(e.working, '{not json');
  okf('primary file replaced by garbage is repaired from the ledger', () => c.verify().report.completed_cases_from_disk === 2 && readFileSync(e.working, 'utf8') === good);

  rmSync(join(e.backup, 'rolling-latest.json'));
  okf('rolling copy deleted is refreshed', () => c.verify().report.repaired.includes('ROLLING_REFRESHED') && existsSync(join(e.backup, 'rolling-latest.json')));

  rmSync(e.working); rmSync(join(e.backup, 'rolling-latest.json'));
  okf('working AND rolling deleted: the generation ledger restores both', () => c.verify().report.completed_cases_from_disk === 2 && readFileSync(e.working, 'utf8') === good);

  // disk disagrees with whatever a process last saw: verify() returns DISK truth, never a cached count
  writeFileSync(e.working, JSON.stringify(e.fBlank, null, 2));
  const seen = c.verify();
  okf('/api/state analogue: when disk and the last-known state disagree, the served sheet is the verified disk state', () =>
    seen.sheet.entries.filter((x) => x.value !== null).length === 8 && seen.report.completed_cases_from_disk === 2);

  // restart
  const c2 = e.custody();
  const r3 = c2.start();
  okf('server RESTART resumes at the saved count (never a fresh blank)', () => r3.completed_cases_from_disk === 2);
  ok('restart is recorded (two F_SERVER_STARTED events)', readEvents(join(e.backup, 'events.jsonl')).events.filter((x) => x.event === 'F_SERVER_STARTED').length === 2);

  // restart after the working file AND rolling copy vanished while the server was down
  rmSync(e.working); rmSync(join(e.backup, 'rolling-latest.json'));
  okf('restart after the primary was deleted while down still resumes at the saved count', () => e.custody().start().completed_cases_from_disk === 2);

  // newest generation lost but working is newer → ledger ahead, working matches ledger → keep newest, rebuild generation
  const newest = gens(e)[gens(e).length - 1] as string;
  rmSync(join(e.backup, 'generations', newest));
  const r4 = c2.verify();
  okf('newest generation deleted: the newer working state is kept (no silent rollback) and the generation is rebuilt', () =>
    r4.report.completed_cases_from_disk === 2 && r4.report.repaired.includes('GENERATION_REBUILT') && gens(e).length === 2);

  // every copy gone but the ledger remains → refuse LOUDLY, never start blank
  rmSync(e.working); rmSync(join(e.backup, 'rolling-latest.json')); rmSync(join(e.backup, 'generations'), { recursive: true });
  ok('all copies lost but the ledger remembers a save → verify REFUSES (DURABILITY_UNRECOVERABLE)', refusedWith(() => c2.verify(), 'DURABILITY_UNRECOVERABLE'));
  ok('…and a restart REFUSES to start a blank sheet over lost progress', refusedWith(() => e.custody().start(), 'DURABILITY_UNRECOVERABLE'));
  rmSync(e.root, { recursive: true, force: true });
}

// ── live torn-tail refusal (Mac HTTP witness: restart-only coverage was insufficient) ──
{
  const e = mk();
  const c = e.custody(); c.start();
  const a = ids(e)[0] as string;
  c.save(fillCase(e.fBlank, a), a);
  const eventPath = join(e.backup, 'events.jsonl');
  appendFileSync(eventPath, '{"torn":');
  const beforeLog = readFileSync(eventPath);
  const beforeWorking = readFileSync(e.working);
  const beforeRolling = readFileSync(join(e.backup, 'rolling-latest.json'));
  ok('live torn event-log tail is refused by verify without retrying a save',
    refusedWith(() => c.verify(), 'EVENT_LOG_TORN_TAIL'));
  ok('live torn-tail inspection preserves the exact log and working/rolling bytes',
    readFileSync(eventPath).equals(beforeLog) && readFileSync(e.working).equals(beforeWorking)
    && readFileSync(join(e.backup, 'rolling-latest.json')).equals(beforeRolling));
  rmSync(e.root, { recursive: true, force: true });
}

// ── crash windows ──
{
  const e = mk();
  const c = e.custody(); c.start();
  const [a, b] = ids(e) as [string, string];
  c.save(fillCase(e.fBlank, a), a);
  const afterA = parseF(readFileSync(e.working, 'utf8'));
  // simulate a crash AFTER the generation was written but before working/rolling/event
  const next = fillCase(afterA, b);
  const text = canonicalSheet(next);
  writeOnceVerified(join(e.backup, 'generations', `gen-000002-${sha256Hex(text).slice(0, 8)}.json`), text);
  const r = c.verify();
  okf('crash after the generation write: the NEWEST state is recovered, not the previous one', () => r.report.completed_cases_from_disk === 2 && readFileSync(e.working, 'utf8') === text);
  ok('…and the ledger catches up with an explicit event', r.report.repaired.includes('EVENT_CATCHUP'));

  // a generation whose bytes do not match its own name is ignored
  writeFileSync(join(e.backup, 'generations', 'gen-000009-deadbeef.json'), '{"torn":');
  ok('a corrupt generation file is ignored, never served', c.verify().report.completed_cases_from_disk === 2);

  // torn event-log tail
  appendFileSync(join(e.backup, 'events.jsonl'), '{"seq":99,"at":"torn');
  const c2 = e.custody();
  const r2 = c2.start();
  ok('a torn event-log tail is quarantined (copy kept) and the chain verifies again',
    r2.completed_cases_from_disk === 2 && readdirSync(e.backup).some((f) => f.startsWith('events.jsonl.torn-')) && readEvents(join(e.backup, 'events.jsonl')).tornTailBytes === 0);
  rmSync(e.root, { recursive: true, force: true });
}

// ── injected crashes at every save step: the NEWEST state must always survive ──
for (const step of ['generation', 'working', 'rolling', 'event'] as const) {
  const e = mk();
  const [a, b] = ids(e) as [string, string];
  const c0 = e.custody(); c0.start();
  c0.save(fillCase(e.fBlank, a), a);
  const base = parseF(readFileSync(e.working, 'utf8'));
  const crashing = new Custody({
    home: e.home, sourcePath: e.source, workingPath: e.working, backupDir: e.backup, parse: parseF,
    fault: (s) => { if (s === step) throw new Error('INJECTED_CRASH_AFTER_' + s); },
  });
  crashing.start();
  let crashed = false;
  try { crashing.save(fillCase(base, b), b); } catch (err) { crashed = err instanceof Error && err.message.startsWith('INJECTED_CRASH'); }
  const survivor = e.custody();
  const r = survivor.start();
  ok(`crash injected after the ${step.toUpperCase()} step: the save the user was told about survives, on all copies`,
    crashed && r.completed_cases_from_disk === 2 && readFileSync(e.working, 'utf8') === readFileSync(join(e.backup, 'rolling-latest.json'), 'utf8')
    && sha256Hex(readFileSync(e.working)) === r.working_sha256);
  ok(`…and after a ${step.toUpperCase()} crash the ledger's last hash equals the working file`, (() => {
    const evs = readEvents(join(e.backup, 'events.jsonl')).events.filter((x) => typeof x.working_sha256 === 'string');
    return evs[evs.length - 1]?.working_sha256 === r.working_sha256;
  })());
  rmSync(e.root, { recursive: true, force: true });
}

// ── placement, binding ──
{
  const e = mk();
  ok('backup directory equal to the working directory is refused',
    refusedWith(() => new Custody({ home: e.home, sourcePath: e.source, workingPath: e.working, backupDir: join(e.root, 'pilot'), parse: parseF }).start(), 'BACKUP_DIR_NOT_SEPARATE'));
  let insideHome = false;
  try { new Custody({ home: e.home, sourcePath: e.source, workingPath: e.working, backupDir: join(e.home, 'bk'), parse: parseF }).start(); }
  catch { insideHome = true; }
  ok('a backup directory inside the delegation home is refused', insideHome);
  ok('the working file may not be the frozen source sheet',
    refusedWith(() => new Custody({ home: e.home, sourcePath: e.source, workingPath: e.source, backupDir: e.backup, parse: parseF }).start(), 'WORKING_IS_SOURCE'));
  const c = e.custody(); c.start();
  const a = ids(e)[0] as string;
  const wrongManifest = fillCase(e.fBlank, a); wrongManifest.manifest_sha256 = 'f'.repeat(64);
  ok('a candidate bound to the WRONG MANIFEST is refused', refusedWith(() => c.save(wrongManifest, a), 'MANIFEST_MISMATCH'));
  const wrongSeal = fillCase(e.fBlank, a); wrongSeal.after_p_seal_sha256 = 'e'.repeat(64);
  ok('a candidate bound to the WRONG P SEAL is refused', refusedWith(() => c.save(wrongSeal, a), 'P_SEAL_MISMATCH'));
  const extra = fillCase(e.fBlank, a); extra.entries.pop();
  ok('a candidate with a different entry set is refused', refusedWith(() => c.save(extra, a), 'ENTRY_SET_MISMATCH'));
  ok('refused candidates left nothing on disk', !existsSync(e.working) && gens(e).length === 0);
  rmSync(e.root, { recursive: true, force: true });
}

// ── finish gate ──
function finishOpts(e: Env, sealedPDigest = sealDigest(e.sealedP)) {
  return {
    home: e.home, manifestPath: e.manifestPath, indexPath: e.indexPath, sealedPPath: e.sealedPPath,
    workingPath: e.working, backupDir: e.backup, presealDir: join(e.root, 'preseal'), outDir: join(e.root, 'out'),
    expectManifest: e.manifest.manifest_sha256, expectPSeal: sealedPDigest,
  };
}
{
  const e = mk();
  const c = e.custody(); c.start();
  const all = ids(e);
  let s = e.fBlank;
  for (const id of all.slice(0, 2)) { s = fillCase(s, id); c.save(s, id); }
  ok('PARTIAL F (2 of 3 cases) is refused', refusedWith(() => finishF(finishOpts(e)), 'INCOMPLETE_F'));
  ok('…and the refusal created no pre-seal backup and no sealed output', !existsSync(join(e.root, 'preseal')) && !existsSync(join(e.root, 'out')));
  s = fillCase(s, all[2] as string); c.save(s, all[2] as string);

  ok('a wrong EXPECTED manifest is refused', refusedWith(() => finishF({ ...finishOpts(e), expectManifest: 'a'.repeat(64) }), 'MANIFEST_EXPECT_MISMATCH'));
  ok('a wrong EXPECTED P seal is refused', refusedWith(() => finishF({ ...finishOpts(e), expectPSeal: 'b'.repeat(64) }), 'P_SEAL_EXPECT_MISMATCH'));

  const rolling = join(e.backup, 'rolling-latest.json');
  const rollingGood = readFileSync(rolling, 'utf8');
  writeFileSync(rolling, rollingGood.replace('"labeller": "A"', '"labeller": "A" '));
  ok('working vs rolling disagreement is refused before any backup', refusedWith(() => finishF(finishOpts(e)), 'COPIES_DISAGREE') && !existsSync(join(e.root, 'preseal')));
  writeFileSync(rolling, rollingGood);

  const evPath = join(e.backup, 'events.jsonl');
  const evGood = readFileSync(evPath, 'utf8');
  appendEvent(evPath, 'F_CASE_SAVED_TO_DISK', { pilot_id: 'x', working_sha256: '0'.repeat(64) });
  ok('a final event-log hash that disagrees with the working file is refused', refusedWith(() => finishF(finishOpts(e)), 'EVENT_LOG_DISAGREES'));
  writeFileSync(evPath, evGood);

  // pre-seal backup conflict: a different file already sits at the target path
  const workingSha = sha256Hex(readFileSync(e.working));
  mkdirSync(join(e.root, 'preseal'), { recursive: true });
  writeFileSync(join(e.root, 'preseal', `kelly-F-sheet-preseal-${workingSha.slice(0, 12)}.json`), 'something else');
  ok('a pre-seal backup path already holding DIFFERENT bytes is refused, and nothing is sealed',
    refusedWith(() => finishF(finishOpts(e)), 'PRESEAL_BACKUP_FAILED') && !existsSync(join(e.root, 'out', 'kelly-F-sealed.json')));
  rmSync(join(e.root, 'preseal'), { recursive: true });

  const r = finishF(finishOpts(e));
  ok('FINAL 100% F: finish succeeds and returns the five handoff artifacts with SHA-256s',
    r.artifacts.map((a) => a.name).join('|') === 'manifest|sealed P|sealed F|report|pre-seal F backup' && r.artifacts.every((a) => /^[0-9a-f]{64}$/.test(a.sha256)));
  const pre = r.artifacts[4]!;
  ok('the pre-seal backup is read-only (0400) and hashes to the working file', mode(pre.path) === 0o400 && pre.sha256 === sha256Hex(readFileSync(e.working)) && r.presealBackupSha256 === pre.sha256);
  const sealedF = JSON.parse(readFileSync(r.artifacts[2]!.path, 'utf8')) as Sealed;
  ok('sealed F is bound to sealed P and carries every label', sealedF.after_p_seal_sha256 === sealDigest(e.sealedP) && sealedF.labels.length === 12 && sealedF.domain === 'F');
  ok('the report prints the banner and NO verdict', /verdict: NOT PRODUCED/.test(r.reportText) && /PILOT_ONLY/.test(r.reportText));
  ok('annotations stay local-only (0600) and are not among the five handoff artifacts', mode(join(e.root, 'out', 'kelly-F-annotations.json')) === 0o600 && !r.artifacts.some((a) => /annotations|local-index/.test(a.path)));
  ok('finish is recorded in the event log (pre-seal backup, then seal)', (() => {
    const names = readEvents(evPath).events.map((x) => x.event);
    return names.indexOf('F_PRESEAL_BACKUP') > -1 && names.indexOf('F_SEALED') > names.indexOf('F_PRESEAL_BACKUP');
  })());
  ok('re-running finish refuses to overwrite sealed output', refusedWith(() => finishF(finishOpts(e)), 'OUTPUT_EXISTS'));
  chmodSync(pre.path, 0o600);
  rmSync(e.root, { recursive: true, force: true });
}

// ── exact real-pilot scale, still entirely synthetic: 25 cases / 100 judgments ──
{
  const e = mk(25);
  const c = e.custody(); c.start();
  const complete = fillAll(e.fBlank);
  ok('25-case synthetic fixture has exactly 100 judgments',
    e.manifest.units.length === 25 && complete.entries.length === 100);
  const partial = structuredClone(complete);
  partial.entries[99]!.value = null;
  const lastId = ids(e)[24] as string;
  c.save(partial, lastId);
  ok('99 of 100 F judgments refuse before pre-seal or output creation',
    refusedWith(() => finishF(finishOpts(e)), 'INCOMPLETE_F')
    && !existsSync(join(e.root, 'preseal')) && !existsSync(join(e.root, 'out')));
  c.save(complete, lastId);
  const r = finishF(finishOpts(e));
  const sealedF = JSON.parse(readFileSync(r.artifacts[2]!.path, 'utf8')) as Sealed;
  ok('100 of 100 F judgments seal exactly 25 cases bound to the expected P seal',
    sealedF.labels.length === 100 && sealedF.after_p_seal_sha256 === sealDigest(e.sealedP)
    && sealedF.domain === 'F' && sealedF.labeller === 'A');
  const pre = r.artifacts[4]!;
  ok('full-scale pre-seal bytes match working bytes and the report remains NOT PRODUCED',
    readFileSync(pre.path).equals(readFileSync(e.working))
    && r.presealBackupSha256 === sha256Hex(readFileSync(e.working))
    && mode(pre.path) === 0o400 && /verdict: NOT PRODUCED/.test(r.reportText));
  chmodSync(pre.path, 0o600);
  rmSync(e.root, { recursive: true, force: true });
}

console.log('\n' + total + ' checks · ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
