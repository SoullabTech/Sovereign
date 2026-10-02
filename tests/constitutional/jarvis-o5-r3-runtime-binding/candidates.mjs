/**
 * O5-R3 RUNTIME BINDING WITNESS — the REAL subject and its DEFEAT CANDIDATES.
 *
 * REAL is the shipped module (jarvis-desktop/src/runtime-binding.js) plus the real
 * canonical grant store for RB-5's grant attempt. Each candidate replaces exactly
 * one decision with a plausible, competent, wrong one. Every candidate is pinned
 * here as code; none depends on live behaviour staying broken.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { ROOT, STORE_FILES } from './falsifiers.mjs';

const require = createRequire(import.meta.url);
const RB = require(path.join(ROOT, 'jarvis-desktop/src/runtime-binding.js'));
const C = await import(pathToFileURL(path.join(ROOT, 'scripts/builder/canonical-provider-execution-grant-store-v1.mjs')).href);

// ── RB-5 grant attempt: seed one ISSUED grant as a fixture, then try to claim it ─
let seq = 0;
function seed(home) {
  const id = `g-rb5-${++seq}`;
  const file = C.canonicalGrantLedgerPathV1('wu-rb5', home);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify({ event: 'ISSUED', at: 't0', grant: { grant_id: id, work_unit_id: 'wu-rb5' } }) + '\n');
  return { id, file };
}
const realGrantAttempt = async ({ home }) => { const { id } = seed(home); return C.claimCanonicalExecutionGrantV1('wu-rb5', id, { home }); };

export const REAL = Object.freeze({
  captureAndWrite: RB.captureAndWrite,
  readRecord: RB.readRecord,
  judgeLive: RB.judgeLive,
  bindingPath: RB.bindingPath,
  grantAttempt: realGrantAttempt,
});

// ── helpers for candidates: the real building blocks, one decision changed ──────
const deps = () => ({ fs, execFileSync, hostname: () => os.hostname() });
function capture({ appSupportDir, resolved, app, env = process.env, pid = process.pid, now = () => new Date().toISOString(), deps: d = deps() }, o = {}) {
  const root = resolved?.root ?? null;
  const git = o.cleanMeansHeadResolves
    ? (() => { const g = RB.gitState(root, d); return { head: g.head, clean: g.head !== null }; })()
    : RB.gitState(root, d);
  let stores = RB.storeHashes(o.hashSourceRoot ? app.sourceRoot : root, d);
  if (o.hashCommittedBlobs) {
    stores = Object.fromEntries(STORE_FILES.map((rel) => {
      try { return [rel, 'sha256:' + crypto.createHash('sha256').update(execFileSync('git', ['-C', root, 'show', `HEAD:${rel}`], { stdio: ['ignore', 'pipe', 'ignore'] })).digest('hex')]; } catch { return [rel, null]; }
    }));
  }
  if (o.omitAbsent) stores = Object.fromEntries(Object.entries(stores).filter(([, v]) => v !== null));
  const record = RB.buildRecord({
    pid, host: d.hostname(),
    processStartedAt: o.wallClockStart ? new Date(Date.now() - process.uptime() * 1000).toISOString() : RB.processStartTime(pid, d),
    writtenAt: now(), app,
    binding: { repoRoot: root, selectionSource: RB.SELECTION_SOURCE[resolved?.resolution] || 'unresolved', head: git.head, clean: git.clean },
    stores, delegationHome: env.AIN_DELEGATION_HOME || null, envRepoRoot: env.JARVIS_REPO_ROOT || null,
  });
  const file = RB.bindingPath(appSupportDir);
  if (o.inPlace) {
    d.fs.mkdirSync(path.dirname(file), { recursive: true });
    const fd = d.fs.openSync(file, 'w', 0o600);
    try { d.fs.writeSync(fd, JSON.stringify(record, null, 2) + '\n'); } finally { d.fs.closeSync(fd); }
    return record;
  }
  return RB.writeRecord(file, record, d);
}
const withCapture = (o) => ({ ...REAL, captureAndWrite: (args) => capture(args, o) });

// "Captured once at startup and reused": re-binds never reach the disk.
function memoized() {
  const done = new Map();
  return { ...REAL, captureAndWrite: (args) => { if (!done.has(args.appSupportDir)) done.set(args.appSupportDir, RB.captureAndWrite(args)); return done.get(args.appSupportDir); } };
}

const judgeWith = (fn) => ({ ...REAL, judgeLive: fn });
const pidOnly = (rec, { probe = (pid) => RB.probeProcess(pid) } = {}) => {
  if (!rec || !Number.isInteger(rec.pid)) return 'UNREADABLE';
  if (rec.terminatedAt) return 'TERMINATED';
  return probe(rec.pid).state === 'ALIVE' ? 'LIVE' : 'STALE';
};
const fileExistsIsLive = (rec) => (rec && Number.isInteger(rec.pid) ? (rec.terminatedAt ? 'TERMINATED' : 'LIVE') : 'UNREADABLE');
const ignoresHost = (rec, { probe = (pid) => RB.probeProcess(pid) } = {}) => RB.judgeLive(rec, { hostname: () => rec?.host, probe });

// RB-5: the record is consulted for authority.
const trustsRecord = async ({ home, appSupportDir }) => {
  const rec = RB.readRecord(RB.bindingPath(appSupportDir));
  const { id, file } = seed(home);
  if (rec && rec.pid === process.pid && RB.judgeLive(rec) === 'LIVE') {
    fs.appendFileSync(file, JSON.stringify({ event: 'CLAIMED', at: 't1', grant_id: id }) + '\n');
    return { ok: true, status: 'CLAIMED', via: 'runtime-binding record' };
  }
  return C.claimCanonicalExecutionGrantV1('wu-rb5', id, { home });
};
const requiresRecord = async ({ home, appSupportDir }) => {
  const rec = RB.readRecord(RB.bindingPath(appSupportDir));
  if (!rec || RB.judgeLive(rec) !== 'LIVE') { seed(home); return { ok: false, reason: 'RUNTIME_BINDING_NOT_LIVE' }; }
  return realGrantAttempt({ home });
};

const cand = (id, named, law, subject, collateral = {}) => ({ id, named, law, subject, collateral });

export const RB_CANDIDATES = Object.freeze([
  cand('DC-RB1a', 'RB-1', 'written in place: a reader can see a torn record mid-write', withCapture({ inPlace: true })),
  cand('DC-RB1b', 'RB-1', 'incarnation from wall-clock arithmetic instead of the lease\'s own probe (the ms-vs-s unit hazard of R3-R7)', withCapture({ wallClockStart: true }),
    { 'RB-5': 'a record whose incarnation is not in the probe\'s own unit can never be judged LIVE, so RB-5\'s precondition (a LIVE record naming this process) cannot be met — the unit hazard seen from the reader\'s side' }),
  cand('DC-RB2', 'RB-2', 'captured once at startup and reused: re-binds never reach the record', memoized()),
  cand('DC-RB3a', 'RB-3', 'a pid alone is taken as identity', judgeWith(pidOnly)),
  cand('DC-RB3b', 'RB-3', 'the record existing is taken as the writer being alive', judgeWith(fileExistsIsLive)),
  cand('DC-RB3c', 'RB-3', 'the host is ignored, so a local probe answers for a record from another machine', judgeWith(ignoresHost)),
  cand('DC-RB4a', 'RB-4', 'store hashes from the committed blobs, not the working tree importBound actually loads', withCapture({ hashCommittedBlobs: true })),
  cand('DC-RB4b', 'RB-4', 'store hashes from the app source tree, not the bound checkout', withCapture({ hashSourceRoot: true }),
    { 'RB-2': 'RB-2 binds a packaged app whose sourceRoot is not the checkout, so hashing the source tree also fails to follow the re-bind' }),
  cand('DC-RB4c', 'RB-4', 'an absent store file is silently omitted instead of recorded as null', withCapture({ omitAbsent: true })),
  cand('DC-RB4d', 'RB-4', '"clean" means HEAD resolves, not that the working tree matches it', withCapture({ cleanMeansHeadResolves: true })),
  cand('DC-RB5a', 'RB-5', 'a LIVE record naming this process is treated as grant authority', { ...REAL, grantAttempt: trustsRecord }),
  cand('DC-RB5b', 'RB-5', 'the lease holder is also required to have a LIVE record', { ...REAL, grantAttempt: requiresRecord }),
]);
