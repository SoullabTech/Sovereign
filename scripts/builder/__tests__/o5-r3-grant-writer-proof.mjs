#!/usr/bin/env node
/**
 * O5-R3 integration proof — the writer lease and the grant ledgers, against the REAL stores
 * and REAL separate processes. The frozen suite (tests/constitutional/jarvis-o5-r3) binds the
 * model; this binds the implementation.
 *
 * ⚠️ Development evidence, NOT admission evidence. Admission (founder ruling) requires the
 * two-process races, mixed-version/runtime-SHA proof, raw-byte recovery and durability
 * witness ON THE MAC STUDIO. This proof is the instrument for that witness; running it here
 * (Linux container) establishes nothing about macOS APFS or the pinned Desktop binding.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as realFs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as L from '../grant-writer-lease-v1.mjs';
import * as CORE from '../grant-ledger-core-v1.mjs';
import * as C from '../canonical-provider-execution-grant-store-v1.mjs';
import * as H from '../human-provider-execution-grant-store.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LEASE_URL = pathToFileURL(path.join(ROOT, 'scripts/builder/grant-writer-lease-v1.mjs')).href;
const results = [];
async function check(name, fn) {
  try { await fn(); results.push([name, true]); process.stdout.write(`PASS  ${name}\n`); }
  catch (e) { results.push([name, false]); process.stdout.write(`FAIL  ${name}\n      ${String(e?.stack || e).split('\n').slice(0, 4).join('\n      ')}\n`); }
}
const mkHome = (tag) => fs.mkdtempSync(path.join(os.tmpdir(), `o5r3-${tag}-`));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (pred, ms = 15000) => { const t = Date.now(); while (!pred()) { if (Date.now() - t > ms) throw new Error('timeout'); await sleep(10); } };

/** A child process that waits for GO, tries to acquire, reports, then waits for EXIT (or exits at once). */
function child(home, tag, { holdUntil = null, exitAfter = false, release = false } = {}) {
  const code = `
    import * as L from ${JSON.stringify(LEASE_URL)};
    import fs from 'node:fs';
    const [home, tag, go, done, hold, release] = process.argv.slice(1);
    while (go !== '-' && !fs.existsSync(go)) await new Promise((r) => setTimeout(r, 2));
    const r = L.acquireGrantWriterLeaseV1(home);
    fs.writeFileSync(done, JSON.stringify({ ok: r.ok, reason: r.reason ?? null, proof: r.proof ?? null, generation: r.lease?.generation ?? r.generation ?? null, pid: process.pid }));
    if (hold !== '-') while (!fs.existsSync(hold)) await new Promise((r) => setTimeout(r, 5));
    if (release === '1' && r.ok) L.releaseGrantWriterLeaseV1(home, r.lease);
  `;
  const done = path.join(home, `..${path.basename(home)}-${tag}.done`);
  const p = spawn(process.execPath, ['--input-type=module', '-e', code, home, tag, holdUntil?.go ?? '-', done, holdUntil?.hold ?? '-', release ? '1' : '0'], { stdio: ['ignore', 'ignore', 'inherit'] });
  const exited = new Promise((r) => p.on('exit', r));
  return { proc: p, done, exited, result: () => JSON.parse(fs.readFileSync(done, 'utf8')) };
}

// Minimal preview objects the stores accept for ISSUED (we only need a ledger with events).
function seedLedger(file, text) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
const ISSUED = (id) => JSON.stringify({ event: 'ISSUED', at: 't0', grant: { grant_id: id, work_unit_id: 'wu-r3', provider_id: 'p' } }) + '\n';

// ── Store enforcement (R3-R2, R3-R3) ──────────────────────────────────────────
await check('I1 — both grant stores refuse every mutation without the lease; the ledgers are untouched', () => {
  const home = mkHome('i1');
  const cf = C.canonicalGrantLedgerPathV1('wu-r3', home);
  const hf = H.grantLedgerPath('wu-r3', home);
  seedLedger(cf, ISSUED('g1')); seedLedger(hf, ISSUED('g1'));
  const before = [fs.readFileSync(cf), fs.readFileSync(hf)];
  const calls = [
    () => C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home }),
    () => C.consumeCanonicalExecutionGrantV1('wu-r3', 'g1', { home }),
    () => C.invalidateCanonicalExecutionGrantV1('wu-r3', 'g1', { home }),
    () => C.revokeCanonicalExecutionGrantV1('wu-r3', 'g1', { home }),
    () => H.claimHumanExecutionGrant('wu-r3', 'g1', { home }),
    () => H.consumeHumanExecutionGrant('wu-r3', 'g1', { home }),
    () => H.invalidateHumanExecutionGrant('wu-r3', 'g1', { home }),
    () => H.revokeHumanExecutionGrant('wu-r3', 'g1', { home }),
  ];
  for (const call of calls) assert.equal(call().reason, 'WRITER_LEASE_NOT_HELD');
  assert.deepEqual([fs.readFileSync(cf), fs.readFileSync(hf)], before);
  assert.equal(L.acquireGrantWriterLeaseV1(home).ok, true);
  assert.equal(C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home }).ok, true);
  assert.equal(H.claimHumanExecutionGrant('wu-r3', 'g1', { home }).ok, true);
  L.releaseGrantWriterLeaseV1(home);
});

await check('I2 — a lease object presented by the wrong process identity writes nothing (stolen lease)', () => {
  const home = mkHome('i2');
  const cf = C.canonicalGrantLedgerPathV1('wu-r3', home);
  seedLedger(cf, ISSUED('g1'));
  const a = L.acquireGrantWriterLeaseV1(home);
  const stolen = { ...a.lease, identity: { ...a.lease.identity, pid: a.lease.identity.pid + 1 } };
  assert.equal(C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home, lease: stolen }).reason, 'WRITER_LEASE_NOT_HELD');
  assert.equal(fs.readFileSync(cf, 'utf8'), ISSUED('g1'));
  L.releaseGrantWriterLeaseV1(home, a.lease);
});

// ── Real separate processes (R3-R7, R3-R8, R3-R9) ─────────────────────────────
await check('I3 — REAL two-process contention: 8 processes race an empty home, exactly one acquires', async () => {
  const home = mkHome('i3');
  const go = path.join(home, '..go-' + path.basename(home));
  const hold = path.join(home, '..hold-' + path.basename(home));
  const kids = Array.from({ length: 8 }, (_, i) => child(home, `k${i}`, { holdUntil: { go, hold } }));
  await sleep(300); fs.writeFileSync(go, '');
  await until(() => kids.every((k) => fs.existsSync(k.done)));
  const rs = kids.map((k) => k.result());
  fs.writeFileSync(hold, ''); await Promise.all(kids.map((k) => k.exited));
  assert.equal(rs.filter((r) => r.ok).length, 1, JSON.stringify(rs));
  assert.ok(rs.filter((r) => !r.ok).every((r) => r.reason === 'HOME_LEASE_HELD'), JSON.stringify(rs));
  assert.equal(L.readLeaseState(home).record.pid, rs.find((r) => r.ok).pid);
});

await check('I4 — REAL stale-owner takeover: the holder process exits without releasing; its death is proven, not aged', async () => {
  const home = mkHome('i4');
  const k = child(home, 'dead');
  await k.exited;
  assert.equal(k.result().ok, true);
  const r = L.acquireGrantWriterLeaseV1(home);
  assert.equal(r.ok, true); assert.equal(r.proof, 'DEAD'); assert.equal(r.took_over_from.pid, k.result().pid);
  L.releaseGrantWriterLeaseV1(home);
});

await check('I5 — REAL live-owner non-takeover: a living holder keeps the home; after it releases, acquisition needs no takeover', async () => {
  const home = mkHome('i5');
  const hold = path.join(home, '..hold-' + path.basename(home));
  const k = child(home, 'live', { holdUntil: { go: null, hold }, release: true });
  await until(() => fs.existsSync(k.done));
  const refused = L.acquireGrantWriterLeaseV1(home);
  assert.equal(refused.ok, false); assert.equal(refused.reason, 'HOME_LEASE_HELD');
  fs.writeFileSync(hold, ''); await k.exited;
  const r = L.acquireGrantWriterLeaseV1(home);
  assert.equal(r.ok, true); assert.equal(r.proof, undefined);
  L.releaseGrantWriterLeaseV1(home);
});

await check('I6 — PID reuse: a record naming a LIVE pid with a different incarnation is proven dead (same probe, same unit)', async () => {
  const home = mkHome('i6');
  const hold = path.join(home, '..hold-' + path.basename(home));
  const other = child(home, 'bystander', { holdUntil: { go: null, hold } }); // just a live process with some pid
  await until(() => fs.existsSync(other.done));
  L.releaseGrantWriterLeaseV1(home); // (the bystander may have acquired; irrelevant) — write a forged predecessor next
  const st = L.readLeaseState(home);
  const livePid = other.result().pid;
  const real = L.processStartTime(livePid);
  assert.ok(real, 'the live pid has a probeable incarnation');
  const dir = path.join(home, L.LEASE_DIR);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `g-${String(st.generation + 1).padStart(12, '0')}.json`), JSON.stringify({
    version: L.LEASE_VERSION, generation: st.generation + 1, owner_nonce: 'reused', host: os.hostname(), pid: livePid,
    process_start_time: real + ':not-this-incarnation', acquired_at: 'long ago',
  }));
  const r = L.acquireGrantWriterLeaseV1(home);
  fs.writeFileSync(hold, ''); await other.exited;
  assert.equal(r.ok, true); assert.equal(r.proof, 'DEAD_PID_REUSED');
  L.releaseGrantWriterLeaseV1(home);
});

await check('I7 — REAL concurrent takeover: 8 reconcilers prove the same death, exactly one takes the lease', async () => {
  const home = mkHome('i7');
  const dead = child(home, 'dead'); await dead.exited;
  const go = path.join(home, '..go-' + path.basename(home));
  const hold = path.join(home, '..hold-' + path.basename(home));
  const kids = Array.from({ length: 8 }, (_, i) => child(home, `t${i}`, { holdUntil: { go, hold } }));
  await sleep(300); fs.writeFileSync(go, '');
  await until(() => kids.every((k) => fs.existsSync(k.done)));
  const rs = kids.map((k) => k.result());
  fs.writeFileSync(hold, ''); await Promise.all(kids.map((k) => k.exited));
  assert.equal(rs.filter((r) => r.ok).length, 1, JSON.stringify(rs));
  assert.equal(rs.find((r) => r.ok).proof, 'DEAD');
});

await check('I8 — release after fencing: a superseded holder cannot release its successor and cannot write', async () => {
  const home = mkHome('i8');
  const cf = C.canonicalGrantLedgerPathV1('wu-r3', home);
  seedLedger(cf, ISSUED('g1'));
  const a = L.acquireGrantWriterLeaseV1(home);
  // out-of-band supersession (the shape an operator-authorized reconciliation would take)
  const dir = path.join(home, L.LEASE_DIR);
  const succ = { version: L.LEASE_VERSION, generation: a.lease.generation + 1, owner_nonce: 'successor', host: os.hostname(), pid: 1, process_start_time: L.processStartTime(1) ?? 'x', acquired_at: 'now' };
  fs.writeFileSync(path.join(dir, `g-${String(succ.generation).padStart(12, '0')}.json`), JSON.stringify(succ));
  assert.equal(C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home }).reason, 'WRITER_LEASE_NOT_HELD');
  assert.equal(L.releaseGrantWriterLeaseV1(home, a.lease).reason, 'NOT_LEASE_OWNER');
  assert.equal(L.readLeaseState(home).record.owner_nonce, 'successor');
  assert.equal(fs.readFileSync(cf, 'utf8'), ISSUED('g1'));
});

// ── Terminal recovery behind the durable barrier (R3-R5, R3-R6, R3-R12) ──────
const PREFIX = ISSUED('g1').replace('"p"', '"café"');
const TORN = Buffer.concat([Buffer.from(PREFIX), Buffer.from('{"event":"CLAIMED","note":"'), Buffer.from([0xc3])]); // ends mid-UTF-8 sequence

await check('I9 — torn raw-byte fragment: quarantined losslessly (split UTF-8 intact), committed bytes exact, next append lands', () => {
  const home = mkHome('i9');
  const cf = C.canonicalGrantLedgerPathV1('wu-r3', home);
  seedLedger(cf, TORN);
  L.acquireGrantWriterLeaseV1(home);
  const out = C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home });
  assert.equal(out.ok, true);
  const q = out.recovered_terminal_fragment;
  const frag = TORN.subarray(Buffer.byteLength(PREFIX));
  assert.equal(q.offset, Buffer.byteLength(PREFIX));
  assert.deepEqual(Buffer.from(q.bytes_b64, 'base64'), frag);
  assert.equal(q.byte_length, frag.length);
  assert.equal(q.reason, 'UNCOMMITTED_TERMINAL_FRAGMENT');
  assert.equal(q.lease.owner_nonce, L.heldLease(home).owner_nonce);
  const now = fs.readFileSync(cf);
  assert.deepEqual(now.subarray(0, Buffer.byteLength(PREFIX)), Buffer.from(PREFIX));
  assert.equal(C.readCanonicalGrantLedgerV1('wu-r3', { home }).uncommitted_tail, null);
  assert.equal(C.canonicalGrantStandingV1('wu-r3', 'g1', { home }).standing, 'CLAIMED');
  const qfile = path.join(home, CORE.QUARANTINE_DIR, 'canonical', 'wu-r3.jsonl');
  assert.deepEqual(JSON.parse(fs.readFileSync(qfile, 'utf8').trim()), q);
  L.releaseGrantWriterLeaseV1(home);
});

/** A recording filesystem: every durability-relevant call, in order, optionally failing one. */
function recordingFs(failOn = null) {
  const ops = [];
  const fsyncedPaths = [];
  const fdPath = new Map();
  const fail = (op, p) => { if (failOn && failOn(op, p)) { const e = new Error(`INJECTED ${op} FAILURE on ${p}`); e.code = 'EIO'; throw e; } };
  const tag = (p) => (p.includes(CORE.QUARANTINE_DIR) ? (fs.existsSync(p) && fs.statSync(p).isDirectory() ? 'qdir' : 'quarantine') : p.endsWith('.jsonl') ? 'ledger' : p.endsWith('.lock') ? 'lock' : 'dir');
  return {
    ops,
    fsyncedPaths,
    ...realFs,
    openSync(p, flags, mode) { const fd = realFs.openSync(p, flags, mode); fdPath.set(fd, p); ops.push(`open:${tag(p)}:${flags}`); return fd; },
    writeSync(fd, ...a) { fail('write', fdPath.get(fd)); ops.push(`write:${tag(fdPath.get(fd))}`); return realFs.writeSync(fd, ...a); },
    fsyncSync(fd) { const p = fdPath.get(fd); fail('fsync', p); ops.push(`fsync:${tag(p)}`); fsyncedPaths.push(path.resolve(p)); return realFs.fsyncSync(fd); },
    ftruncateSync(fd, n) { fail('ftruncate', fdPath.get(fd)); ops.push(`ftruncate:${tag(fdPath.get(fd))}:${n}`); return realFs.ftruncateSync(fd, n); },
    appendFileSync(p, ...a) { fail('append', p); ops.push(`append:${tag(p)}`); return realFs.appendFileSync(p, ...a); },
    unlinkSync(p) { ops.push(`unlink:${tag(p)}`); return realFs.unlinkSync(p); },
  };
}

await check('I10 — R3-R12 order: quarantine write → fsync → dir fsync(s) → ftruncate → ledger fsync → append; no dir fsync on a later append to the log', () => {
  const home = mkHome('i10');
  const cf = C.canonicalGrantLedgerPathV1('wu-r3', home);
  seedLedger(cf, TORN);
  L.acquireGrantWriterLeaseV1(home);
  const rfs = recordingFs(); CORE.setGrantLedgerFsForTesting(rfs);
  try { assert.equal(C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home }).ok, true); } finally { CORE.setGrantLedgerFsForTesting(null); }
  const ops = rfs.ops.filter((o) => !o.startsWith('open:'));
  const at = (x) => ops.findIndex((o) => o.startsWith(x));
  const order = ['write:quarantine', 'fsync:quarantine', 'fsync:qdir', `ftruncate:ledger:${Buffer.byteLength(PREFIX)}`, 'fsync:ledger', 'append:ledger'];
  const idx = order.map(at);
  assert.ok(idx.every((i) => i >= 0) && idx.every((i, n) => n === 0 || i > idx[n - 1]), `order: ${ops.join(' → ')}`);
  // exact directories: the new quarantine file's own dir, and the parent of each newly created dir
  const qroot = path.resolve(home, CORE.QUARANTINE_DIR);
  for (const d of [path.join(qroot, 'canonical'), qroot, path.resolve(home)]) {
    assert.ok(rfs.fsyncedPaths.includes(d), `directory not fsynced: ${d}`);
  }
  const truncAt = rfs.ops.findIndex((o) => o.startsWith('ftruncate:'));
  const lastDirSync = Math.max(...rfs.ops.map((o, i) => ((o === 'fsync:qdir' || o === 'fsync:dir') ? i : -1)));
  assert.ok(lastDirSync < truncAt, 'a directory fsync came after truncation');
  // second recovery appends to the EXISTING quarantine log: file fsync suffices, no directory sync
  fs.appendFileSync(cf, '{"event":"CONS');
  const rfs2 = recordingFs(); CORE.setGrantLedgerFsForTesting(rfs2);
  try { C.consumeCanonicalExecutionGrantV1('wu-r3', 'g1', { home }); } finally { CORE.setGrantLedgerFsForTesting(null); }
  assert.ok(rfs2.ops.includes('fsync:quarantine') && !rfs2.ops.some((o) => o === 'fsync:qdir' || o === 'fsync:dir'), rfs2.ops.join(' → '));
  L.releaseGrantWriterLeaseV1(home);
});

await check('I11 — a failure at ANY durability step stops: no truncation after a failed evidence step, no append after a failed repair', () => {
  const cases = [
    ['quarantine write', (op, p) => op === 'write' && p.includes(CORE.QUARANTINE_DIR), 'untouched'],
    ['quarantine fsync', (op, p) => op === 'fsync' && p.includes(CORE.QUARANTINE_DIR) && p.endsWith('.jsonl'), 'untouched'],
    ['quarantine dir fsync', (op, p) => op === 'fsync' && p.endsWith(path.join(CORE.QUARANTINE_DIR, 'canonical')), 'untouched'],
    ['ledger ftruncate', (op) => op === 'ftruncate', 'untouched'],
    ['ledger fsync after truncate', (op, p) => op === 'fsync' && p.endsWith('wu-r3.jsonl') && !p.includes(CORE.QUARANTINE_DIR), 'truncated-no-append'],
  ];
  for (const [label, failOn, expect] of cases) {
    const home = mkHome('i11');
    const cf = C.canonicalGrantLedgerPathV1('wu-r3', home);
    seedLedger(cf, TORN);
    L.acquireGrantWriterLeaseV1(home);
    const rfs = recordingFs(failOn); CORE.setGrantLedgerFsForTesting(rfs);
    let threw = false;
    try { C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home }); } catch { threw = true; } finally { CORE.setGrantLedgerFsForTesting(null); }
    assert.ok(threw, `${label}: failure was not surfaced`);
    assert.ok(!rfs.ops.includes('append:ledger'), `${label}: appended after a durability failure`);
    const now = fs.readFileSync(cf);
    if (expect === 'untouched') assert.deepEqual(now, TORN, `${label}: the ledger was changed before the evidence was durable`);
    else assert.deepEqual(now, Buffer.from(PREFIX), `${label}: unexpected ledger state`);
    assert.ok(!fs.existsSync(C.canonicalGrantLedgerLockPathV1('wu-r3', home)), `${label}: append lock left behind`);
    L.releaseGrantWriterLeaseV1(home);
  }
});

await check('I12 — committed corruption (mid-file) with a torn tail STOPS: nothing quarantined, nothing truncated, nothing appended', () => {
  const home = mkHome('i12');
  const cf = C.canonicalGrantLedgerPathV1('wu-r3', home);
  const text = ISSUED('g1') + '{broken\n' + '{"event":"CLA';
  seedLedger(cf, text);
  L.acquireGrantWriterLeaseV1(home);
  assert.throws(() => C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home }), /CANONICAL_EXECUTION_GRANT_LEDGER_CORRUPT/);
  assert.equal(fs.readFileSync(cf, 'utf8'), text);
  assert.ok(!fs.existsSync(path.join(home, CORE.QUARANTINE_DIR)));
  L.releaseGrantWriterLeaseV1(home);
});

// ── Mixed-version compatibility (R3-R10) ──────────────────────────────────────
await check('I13 — a legacy (lease-unaware) writer holding the append lock: the lease holder is refused on BOTH stores; the lock survives', () => {
  const home = mkHome('i13');
  L.acquireGrantWriterLeaseV1(home);
  for (const [file, lock, call] of [
    [C.canonicalGrantLedgerPathV1('wu-r3', home), C.canonicalGrantLedgerLockPathV1('wu-r3', home), () => C.claimCanonicalExecutionGrantV1('wu-r3', 'g1', { home })],
    [H.grantLedgerPath('wu-r3', home), H.grantLedgerLockPath('wu-r3', home), () => H.claimHumanExecutionGrant('wu-r3', 'g1', { home })],
  ]) {
    seedLedger(file, ISSUED('g1'));
    fs.writeFileSync(lock, ''); // exactly what legacy withLedgerLock creates
    assert.equal(call().reason, 'GRANT_LEDGER_BUSY');
    assert.ok(fs.existsSync(lock), 'legacy lock removed');
    assert.equal(fs.readFileSync(file, 'utf8'), ISSUED('g1'));
    fs.unlinkSync(lock);
  }
  L.releaseGrantWriterLeaseV1(home);
});

await check('I14 — the human-provider store now takes and releases the per-append lock around its write (hardening for future transitions)', () => {
  const home = mkHome('i14');
  seedLedger(H.grantLedgerPath('wu-r3', home), ISSUED('g1'));
  L.acquireGrantWriterLeaseV1(home);
  const rfs = recordingFs(); CORE.setGrantLedgerFsForTesting(rfs);
  try { assert.equal(H.claimHumanExecutionGrant('wu-r3', 'g1', { home }).ok, true); } finally { CORE.setGrantLedgerFsForTesting(null); }
  const i = (x) => rfs.ops.indexOf(x);
  assert.ok(i('open:lock:wx') >= 0 && i('open:lock:wx') < i('append:ledger') && i('append:ledger') < i('unlink:lock'), rfs.ops.join(' → '));
  L.releaseGrantWriterLeaseV1(home);
});

// ── Reads (R3-R4) and callers (R3-R3) ─────────────────────────────────────────
await check('I15 — reads are lease-free: another process holds the lease; this one reads both ledgers and changes nothing', async () => {
  const home = mkHome('i15');
  seedLedger(C.canonicalGrantLedgerPathV1('wu-r3', home), ISSUED('g1') + '{"event":"CL');
  seedLedger(H.grantLedgerPath('wu-r3', home), ISSUED('g1'));
  const hold = path.join(home, '..hold-' + path.basename(home));
  const k = child(home, 'writer', { holdUntil: { go: null, hold } });
  await until(() => fs.existsSync(k.done));
  const snap = JSON.stringify(fs.readdirSync(home, { recursive: true }).sort().map((f) => [f, fs.statSync(path.join(home, f)).isFile() ? fs.readFileSync(path.join(home, f), 'base64') : 'dir']));
  assert.equal(C.readCanonicalGrantEventsV1('wu-r3', { home }).length, 1);
  assert.equal(H.readGrantEvents('wu-r3', { home }).length, 1);
  assert.equal(C.canonicalGrantStandingV1('wu-r3', 'g1', { home }).standing, 'ACTIVE');
  const after = JSON.stringify(fs.readdirSync(home, { recursive: true }).sort().map((f) => [f, fs.statSync(path.join(home, f)).isFile() ? fs.readFileSync(path.join(home, f), 'base64') : 'dir']));
  fs.writeFileSync(hold, ''); await k.exited;
  assert.equal(after, snap);
});

await check('I16 — callers: Desktop becomes the writer on first grant mutation and reuses it; the census write pass refuses while another process holds the lease', async () => {
  const home = mkHome('i16');
  const require = createRequire(import.meta.url);
  const WUC = require(path.join(ROOT, 'jarvis-desktop/src/work-unit-control.js'));
  const env = { ...process.env, AIN_DELEGATION_HOME: home };
  const w1 = await WUC.grantWriter(ROOT, { env });
  const w2 = await WUC.grantWriter(ROOT, { env });
  assert.equal(w1.ok, true); assert.equal(w2.ok, true);
  assert.equal(w1.lease.generation, w2.lease.generation);
  await WUC.releaseGrantWriter(ROOT);
  assert.equal(L.readLeaseState(home).record.released, true);
  const hold = path.join(home, '..hold-' + path.basename(home));
  const k = child(home, 'desktop', { holdUntil: { go: null, hold } });
  await until(() => fs.existsSync(k.done));
  const census = await import(pathToFileURL(path.join(ROOT, 'scripts/builder/o5-recovery-census.mjs')).href);
  const r = await census.admittedWrite(ROOT, { env, admit: 'sha256:irrelevant' });
  const refusedDesktop = await WUC.grantWriter(ROOT, { env });
  fs.writeFileSync(hold, ''); await k.exited;
  assert.equal(r.ok, false); assert.equal(r.refused, 'GRANT_WRITER_LEASE_UNAVAILABLE'); assert.equal(r.lease_reason, 'HOME_LEASE_HELD');
  assert.equal(refusedDesktop.ok, false); assert.equal(refusedDesktop.reason, 'GRANT_WRITER_LEASE_UNAVAILABLE');
});

await check('I17 — every ignored return is gone: each invalidate is captured and reported; each consume feeds a reported settlement', () => {
  const src = fs.readFileSync(path.join(ROOT, 'jarvis-desktop/src/work-unit-control.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const bare = src.match(/^\s*store\.(invalidate|consume)\w*\(/gm) || [];
  assert.deepEqual(bare, [], 'a grant-store invalidate/consume result is discarded');
  const inv = (src.match(/invalidationOutcome\(store\.invalidate/g) || []).length;
  const invReported = (src.match(/^\s+invalidation,$/gm) || []).length;
  assert.equal(inv, 7); assert.equal(invReported, 7);
  assert.equal((src.match(/settlement: settlementOutcome\(consumed\)/g) || []).length, 3);
});

const failed = results.filter(([, ok]) => !ok).length;
process.stdout.write(`\n${results.length - failed} passed · ${failed} failed\n`);
process.exit(failed ? 1 : 0);
