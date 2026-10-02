/**
 * O5-R3 RUNTIME BINDING WITNESS — falsifiers RB-1…RB-5 (founder ruling 2026-10-01).
 *
 *   RB-1  startup produces the record: complete, atomic, and its incarnation is the LEASE's own probe
 *   RB-2  re-binding changes it: a later capture reflects the new checkout entirely
 *   RB-3  a stale pid / incarnation can never masquerade as the live writer
 *   RB-4  store hashes are the bound checkout's WORKING-TREE bytes (what importBound loads)
 *   RB-5  the record grants no authority: forged, stale or absent, it changes no grant outcome
 *
 * Subject: { captureAndWrite, readRecord, judgeLive, bindingPath, grantAttempt }.
 * Unlike the R3 lease suite, the subject here is the REAL module (and the real lease
 * and stores for RB-5); defeat candidates replace one decision each.
 * Real git repositories and real processes are used; nothing is mocked except where a
 * probe outcome must be forced (RB-3 a–f).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LEASE = await import(pathToFileURL(path.join(ROOT, 'scripts/builder/grant-writer-lease-v1.mjs')).href);

export const STORE_FILES = [
  'scripts/builder/grant-writer-lease-v1.mjs',
  'scripts/builder/grant-ledger-core-v1.mjs',
  'scripts/builder/canonical-provider-execution-grant-store-v1.mjs',
  'scripts/builder/human-provider-execution-grant-store.mjs',
];
const MIN_FIELDS = ['pid', 'processStartedAt', 'writtenAt', 'app.mode', 'app.build', 'app.sourceRoot', 'binding.repoRoot', 'binding.selectionSource', 'binding.head', 'binding.clean', 'stores'];

const expect = (f, cond, msg) => { if (!cond) f.push(msg); };
async function run(fn) {
  const failures = [];
  try { await fn(failures); } catch (e) { failures.push(`threw: ${e.message}`); }
  return { pass: failures.length === 0, failures };
}
const tmp = (tag) => fs.mkdtempSync(path.join(os.tmpdir(), `o5r3rb-${tag}-`));
const sha = (buf) => 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex');
const get = (o, p) => p.split('.').reduce((v, k) => (v == null ? undefined : v[k]), o);

/** A real git checkout carrying (some of) the store files. */
export function makeRepo(tag, contents = {}) {
  const dir = tmp(tag);
  const git = (...a) => execFileSync('git', ['-C', dir, ...a], { stdio: 'pipe' });
  git('init', '-q');
  git('config', 'user.email', 'witness@o5r3.local'); git('config', 'user.name', 'o5r3');
  for (const rel of STORE_FILES) {
    if (contents[rel] === null) continue;
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), contents[rel] ?? `// ${tag} ${rel}\n`);
  }
  git('add', '-A'); git('commit', '-qm', tag);
  return { dir, head: execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() };
}

/** A filesystem that records the path of every write-ish operation, in order. */
export function recordingFs() {
  const ops = [];
  const fdPath = new Map();
  return {
    ops,
    ...fs,
    openSync(p, flags, mode) { const fd = fs.openSync(p, flags, mode); fdPath.set(fd, p); ops.push(['open', p, String(flags)]); return fd; },
    writeSync(fd, ...a) { ops.push(['write', fdPath.get(fd)]); return fs.writeSync(fd, ...a); },
    writeFileSync(p, ...a) { ops.push(['writeFile', p]); return fs.writeFileSync(p, ...a); },
    fsyncSync(fd) { ops.push(['fsync', fdPath.get(fd)]); return fs.fsyncSync(fd); },
    renameSync(a, b) { ops.push(['rename', a, b]); return fs.renameSync(a, b); },
  };
}
const depsWith = (fsImpl) => ({ fs: fsImpl, execFileSync, hostname: () => os.hostname() });

/** RB-1 — startup produces a complete record, atomically, whose incarnation is the lease's own probe. */
export const RB1 = (s) => run(async (f) => {
  const repo = makeRepo('rb1');
  const support = tmp('support');
  const rfs = recordingFs();
  const rec = s.captureAndWrite({
    appSupportDir: support, resolved: { root: repo.dir, resolution: 'dev-walk' },
    app: { mode: 'development', build: null, sourceRoot: repo.dir }, deps: depsWith(rfs),
  });
  const file = s.bindingPath(support);
  const onDisk = s.readRecord(file);
  expect(f, onDisk && JSON.stringify(onDisk) === JSON.stringify(rec), 'no record on disk, or it differs from what was returned');
  for (const k of MIN_FIELDS) expect(f, onDisk && get(onDisk, k) !== undefined, `minimum field missing: ${k}`);
  expect(f, onDisk?.pid === process.pid, 'pid is not this process');
  expect(f, onDisk?.processStartedAt === LEASE.processStartTime(process.pid), `incarnation ${onDisk?.processStartedAt} is not the lease's own probe ${LEASE.processStartTime(process.pid)} (same probe, same unit)`);
  expect(f, onDisk?.binding?.repoRoot === repo.dir && onDisk?.binding?.head === repo.head && onDisk?.binding?.clean === true && onDisk?.binding?.selectionSource === 'dev-walk', 'binding is not the resolved checkout as it is');
  expect(f, typeof onDisk?.law === 'string' && /grants no authority/.test(onDisk.law), 'the no-authority law is not carried by the record');
  const finalWrites = rfs.ops.filter(([op, p, flags]) => p === file && (op === 'write' || op === 'writeFile' || (op === 'open' && /w|a/.test(flags))));
  const renamed = rfs.ops.some(([op, , to]) => op === 'rename' && to === file);
  const synced = rfs.ops.findIndex(([op, p]) => op === 'fsync' && p !== file);
  const renIdx = rfs.ops.findIndex(([op, , to]) => op === 'rename' && to === file);
  expect(f, finalWrites.length === 0 && renamed && synced >= 0 && synced < renIdx, `not atomic (temp → fsync → rename): ${JSON.stringify(rfs.ops.map((o) => o[0]))}`);
});

/** RB-2 — re-binding rewrites the record to the NEW checkout, in every field. */
export const RB2 = (s) => run(async (f) => {
  const a = makeRepo('rb2a');
  const b = makeRepo('rb2b', { [STORE_FILES[0]]: '// different lease bytes\n' });
  const support = tmp('support');
  const app = { mode: 'packaged', build: 'abc1234', sourceRoot: '/Applications/JARVIS.app/Contents/Resources' };
  s.captureAndWrite({ appSupportDir: support, resolved: { root: a.dir, resolution: 'implicit-default' }, app });
  s.captureAndWrite({ appSupportDir: support, resolved: { root: b.dir, resolution: 'explicit-config' }, app });
  const rec = s.readRecord(s.bindingPath(support));
  expect(f, rec?.binding?.repoRoot === b.dir, `re-bind not reflected: repoRoot ${rec?.binding?.repoRoot}`);
  expect(f, rec?.binding?.head === b.head, 're-bind not reflected: head');
  expect(f, rec?.binding?.selectionSource === 'config.json', `re-bind not reflected: selectionSource ${rec?.binding?.selectionSource}`);
  expect(f, rec?.stores?.[STORE_FILES[0]] === sha(fs.readFileSync(path.join(b.dir, STORE_FILES[0]))), 're-bind not reflected: store hashes still describe the old checkout');
});

/** RB-3 — a stale pid or incarnation never reads as the live writer. */
export const RB3 = (s) => run(async (f) => {
  const host = os.hostname();
  const base = { pid: 4242, host, processStartedAt: 'ps-lstart:A', terminatedAt: null };
  const judge = (rec, probe, hostname = () => host) => s.judgeLive(rec, { hostname, probe });
  expect(f, judge(base, () => ({ state: 'GONE' })) === 'STALE', '(a) a dead pid read as live');
  expect(f, judge(base, () => ({ state: 'ALIVE', start_time: 'ps-lstart:B' })) === 'STALE', '(b) a reused pid (different incarnation) read as live');
  expect(f, judge(base, () => ({ state: 'ALIVE', start_time: 'ps-lstart:A' })) === 'LIVE', '(c) the genuinely live writer was not recognised');
  expect(f, judge(base, () => ({ state: 'ALIVE', start_time: 'ps-lstart:A' }), () => 'other-host') === 'UNDETERMINABLE', '(d) a record from another host was judged locally');
  expect(f, judge({ ...base, terminatedAt: 't' }, () => ({ state: 'ALIVE', start_time: 'ps-lstart:A' })) === 'TERMINATED', '(e) a terminated record read as live');
  expect(f, judge(null, () => ({ state: 'ALIVE' })) === 'UNREADABLE' && judge({ pid: 'x' }, () => ({ state: 'ALIVE' })) === 'UNREADABLE', '(f) an unreadable record was judged');
  // (g) REAL: a record written by a process that has since exited
  const support = tmp('support');
  const repo = makeRepo('rb3');
  const child = spawnSync(process.execPath, ['-e', `
    const RB = require(${JSON.stringify(path.join(ROOT, 'jarvis-desktop/src/runtime-binding.js'))});
    RB.captureAndWrite({ appSupportDir: ${JSON.stringify(support)}, resolved: { root: ${JSON.stringify(repo.dir)}, resolution: 'dev-walk' }, app: { mode: 'development', build: null, sourceRoot: ${JSON.stringify(repo.dir)} } });
  `], { stdio: 'inherit' });
  expect(f, child.status === 0, '(g) the child could not write its record');
  const childRec = s.readRecord(s.bindingPath(support));
  expect(f, childRec && childRec.pid !== process.pid && s.judgeLive(childRec) === 'STALE', `(g) a REAL exited writer's record read as ${s.judgeLive(childRec)}`);
});

/** RB-4 — store hashes are the bound checkout's working-tree bytes; absence is null, never omitted. */
export const RB4 = (s) => run(async (f) => {
  const bound = makeRepo('rb4', { [STORE_FILES[3]]: null });          // human-provider store absent: a pre-R3-like checkout
  const appTree = makeRepo('rb4app', { [STORE_FILES[1]]: '// app tree bytes\n' });
  fs.writeFileSync(path.join(bound.dir, STORE_FILES[0]), '// edited after commit: what importBound will actually load\n');
  const support = tmp('support');
  s.captureAndWrite({ appSupportDir: support, resolved: { root: bound.dir, resolution: 'explicit-config' }, app: { mode: 'packaged', build: 'b', sourceRoot: appTree.dir } });
  const rec = s.readRecord(s.bindingPath(support));
  for (const rel of STORE_FILES.slice(0, 3)) {
    expect(f, rec?.stores?.[rel] === sha(fs.readFileSync(path.join(bound.dir, rel))), `${rel}: hash is not the bound checkout's working-tree bytes`);
  }
  expect(f, rec?.stores && STORE_FILES[3] in rec.stores && rec.stores[STORE_FILES[3]] === null, 'an absent store file was omitted or invented rather than recorded as null');
  expect(f, rec?.binding?.clean === false, 'a dirty bound checkout was reported clean');
});

/** RB-5 — possession of a record grants nothing; its absence takes nothing away. */
export const RB5 = (s) => run(async (f) => {
  const home = tmp('home');
  const support = tmp('support');
  const repo = makeRepo('rb5');
  const file = s.bindingPath(support);
  // a perfectly convincing record naming THIS live process
  s.captureAndWrite({ appSupportDir: support, resolved: { root: repo.dir, resolution: 'dev-walk' }, app: { mode: 'development', build: null, sourceRoot: repo.dir } });
  expect(f, s.judgeLive(s.readRecord(file)) === 'LIVE', 'precondition: the record names the live process');
  const withRecord = await s.grantAttempt({ home, appSupportDir: support });
  expect(f, withRecord.reason === 'WRITER_LEASE_NOT_HELD', `a LIVE record without the lease was given grant authority (${withRecord.reason ?? 'wrote'})`);
  fs.writeFileSync(file, '{ corrupt');
  const acquired = LEASE.acquireGrantWriterLeaseV1(home);
  const corrupt = await s.grantAttempt({ home, appSupportDir: support });
  fs.rmSync(file, { force: true });
  const absent = await s.grantAttempt({ home, appSupportDir: support });
  LEASE.releaseGrantWriterLeaseV1(home, acquired.lease);
  expect(f, corrupt.ok === true && absent.ok === true, `the lease holder's authority depended on the record (corrupt: ${corrupt.reason}, absent: ${absent.reason})`);
});

export const RB_FALSIFIERS = Object.freeze({ 'RB-1': RB1, 'RB-2': RB2, 'RB-3': RB3, 'RB-4': RB4, 'RB-5': RB5 });
