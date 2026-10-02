/**
 * O5-R3 — process-lifetime WRITER LEASE over the grant authority domain.
 *
 * Founder rulings R3-R1…R12 (2026-09-30):
 *   One proven writer may mutate the grant authority domain at a time.
 *   The per-append lock gives exclusivity of one append; it does not establish ownership.
 *
 * Mechanism: GENERATION FILES, never a rewritten lease file.
 *   <home>/grant-writer-lease/g-000000000001.json, g-…2.json, …
 *   The current state is the HIGHEST generation. Every change (first acquisition,
 *   takeover of a proven-dead holder, release) is the exclusive creation of the
 *   NEXT generation: write a temp file, then link() it to the generation name,
 *   which fails with EEXIST if another process got there first. POSIX rename is
 *   not compare-and-swap (R3-R8); an exclusive create of the next name is, so two
 *   contenders can never both believe they took the same lease.
 *
 * Identity (R3-R7): host · pid · process incarnation · owner_nonce. The owner
 * stamps its incarnation through the SAME probe the reconciler uses, so the unit
 * is always the same. A local probe is never evidence about another host.
 * Unknown is not dead; unreadable is not stale; age is not death.
 *
 * Presentation (R3-R3): a process that acquires the lease holds it in a
 * process-wide registry (globalThis, shared across module instances loaded from
 * different paths). Grant stores check it AND re-read the durable generation at
 * every mutation (fencing, R3-L8): a lease object that is no longer current writes
 * nothing.
 *
 * ⛔ Reads never need the lease (R3-R4) and nothing here runs on a read path.
 */
import {
  closeSync, existsSync, fsyncSync, linkSync, mkdirSync, openSync,
  readdirSync, readFileSync, unlinkSync, writeSync,
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

export const LEASE_VERSION = 'O5R3L.v1';
export const LEASE_DIR = 'grant-writer-lease';

export const REFUSAL = Object.freeze({
  HELD: 'HOME_LEASE_HELD',
  THIS_PROCESS: 'HELD_BY_THIS_PROCESS',
  UNDETERMINABLE: 'LEASE_OWNER_UNDETERMINABLE',
  UNREADABLE: 'LEASE_RECORD_UNREADABLE',
  NOT_HELD: 'WRITER_LEASE_NOT_HELD',
  NOT_OWNER: 'NOT_LEASE_OWNER',
});

export const resolveHome = (home) => path.resolve(home
  || process.env.AIN_DELEGATION_HOME
  || path.join(os.homedir(), '.claude', 'ain-delegation'));

const leaseDir = (home) => path.join(resolveHome(home), LEASE_DIR);
const genName = (n) => `g-${String(n).padStart(12, '0')}.json`;
const genOf = (name) => { const m = /^g-(\d{12})\.json$/.exec(name); return m ? Number(m[1]) : null; };

// ── Process incarnation (one probe, one unit, for owner and reconciler alike) ──

function linuxStart(pid) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const after = stat.slice(stat.lastIndexOf(')') + 2).split(' ');
    const ticks = after[19]; // field 22: starttime, clock ticks since boot
    let boot = '';
    try { boot = readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim(); } catch { /* no boot id */ }
    return ticks ? `linux-proc:${boot}:${ticks}` : null;
  } catch { return null; }
}

function psStart(pid) {
  try {
    const out = execFileSync('ps', ['-o', 'lstart=', '-p', String(pid)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).trim();
    return out ? `ps-lstart:${out.replace(/\s+/g, ' ')}` : null;
  } catch { return null; }
}

/** The incarnation of a local pid, or null if it cannot be determined. */
export function processStartTime(pid) {
  return linuxStart(pid) ?? psStart(pid);
}

let selfIdentity = null;
export function currentProcessIdentity() {
  if (!selfIdentity) {
    selfIdentity = Object.freeze({ host: os.hostname(), pid: process.pid, process_start_time: processStartTime(process.pid) });
  }
  return selfIdentity;
}

/** Liveness as THIS host can observe it. */
export function probeProcess(host, pid) {
  if (host !== os.hostname()) return { state: 'UNDETERMINABLE' };
  try { process.kill(pid, 0); } catch (e) {
    if (e?.code === 'ESRCH') return { state: 'GONE' };
    if (e?.code !== 'EPERM') return { state: 'UNDETERMINABLE' };
  }
  const start = processStartTime(pid);
  return start ? { state: 'ALIVE', start_time: start } : { state: 'UNDETERMINABLE' };
}

const sameProcess = (a, b) => !!a && !!b && a.host === b.host && a.pid === b.pid
  && a.process_start_time != null && a.process_start_time === b.process_start_time;

/** Proof of abandonment. Only DEAD and DEAD_PID_REUSED license a takeover. */
export function judgeHolder(holder, self, probe = probeProcess) {
  if (sameProcess(holder, self)) return 'THIS_PROCESS';
  if (holder.host !== self.host) return 'UNDETERMINABLE';
  if (holder.process_start_time == null) return 'UNDETERMINABLE';
  const p = probe(holder.host, holder.pid);
  if (p.state === 'GONE') return 'DEAD';
  if (p.state === 'ALIVE') return p.start_time === holder.process_start_time ? 'ALIVE' : 'DEAD_PID_REUSED';
  return 'UNDETERMINABLE';
}

// ── Generations ────────────────────────────────────────────────────────────────

/** The current generation of the lease, read without side effects. */
export function readLeaseState(home) {
  const dir = leaseDir(home);
  if (!existsSync(dir)) return { generation: 0, record: null };
  const gens = readdirSync(dir).map(genOf).filter((n) => n !== null).sort((a, b) => a - b);
  if (!gens.length) return { generation: 0, record: null };
  const generation = gens[gens.length - 1];
  let record = null;
  try {
    record = JSON.parse(readFileSync(path.join(dir, genName(generation)), 'utf8'));
  } catch (e) {
    if (e?.code === 'ENOENT') return readLeaseState(home);
    return { generation, record: null, unreadable: true };
  }
  const shaped = record && record.version === LEASE_VERSION && typeof record.owner_nonce === 'string'
    && (record.released === true || (Number.isInteger(record.pid) && typeof record.host === 'string'));
  return shaped ? { generation, record } : { generation, record: null, unreadable: true };
}

/** Exclusive creation of generation n. true = created; false = another process got there first. */
function createGeneration(home, n, record) {
  const dir = leaseDir(home);
  mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.tmp-${process.pid}-${randomBytes(6).toString('hex')}`);
  const fd = openSync(tmp, 'wx', 0o600);
  try {
    writeSync(fd, JSON.stringify(record) + '\n');
    fsyncSync(fd);
  } finally { closeSync(fd); }
  try {
    linkSync(tmp, path.join(dir, genName(n)));
    return true;
  } catch (e) {
    if (e?.code === 'EEXIST') return false;
    throw e;
  } finally {
    try { unlinkSync(tmp); } catch { /* already gone */ }
  }
}

// ── Process-wide registry (shared across module instances) ────────────────────

const REGISTRY_KEY = Symbol.for('jarvis.o5r3.grantWriterLeases');
const registry = () => (globalThis[REGISTRY_KEY] ??= new Map());
/**
 * A synchronous release hook for process exit, published on first acquisition so a host
 * (Electron `will-quit`) can release without importing this ESM module. A crash that skips
 * it leaves the lease to proof-based takeover: same host, pid gone or reused.
 */
export const RELEASE_HOOK_KEY = Symbol.for('jarvis.o5r3.releaseAllGrantWriterLeases');

export function heldLease(home) { return registry().get(resolveHome(home)) ?? null; }

// ── The four acts ─────────────────────────────────────────────────────────────

export function acquireGrantWriterLeaseV1(home, {
  identity = currentProcessIdentity(),
  probe = probeProcess,
  now = () => new Date().toISOString(),
  nonce = randomBytes(16).toString('hex'),
} = {}) {
  const key = resolveHome(home);
  if (identity.process_start_time == null) return { ok: false, reason: REFUSAL.UNDETERMINABLE, detail: 'this process has no determinable incarnation' };
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const state = readLeaseState(key);
    if (state.unreadable) return { ok: false, reason: REFUSAL.UNREADABLE, generation: state.generation };
    let proof = null;
    if (state.record && !state.record.released) {
      const verdict = judgeHolder(state.record, identity, probe);
      if (verdict === 'THIS_PROCESS') return { ok: false, reason: REFUSAL.THIS_PROCESS, holder: state.record, generation: state.generation };
      if (verdict === 'ALIVE') return { ok: false, reason: REFUSAL.HELD, holder: state.record, generation: state.generation };
      if (verdict === 'UNDETERMINABLE') return { ok: false, reason: REFUSAL.UNDETERMINABLE, holder: state.record, generation: state.generation };
      proof = verdict;
    }
    const generation = state.generation + 1;
    const record = {
      version: LEASE_VERSION, generation, owner_nonce: nonce,
      host: identity.host, pid: identity.pid, process_start_time: identity.process_start_time,
      acquired_at: now(),
      ...(proof ? { took_over: { generation: state.generation, owner_nonce: state.record.owner_nonce, proof } } : {}),
    };
    if (createGeneration(key, generation, record)) {
      const lease = Object.freeze({ home: key, generation, owner_nonce: nonce, identity });
      registry().set(key, lease);
      globalThis[RELEASE_HOOK_KEY] = releaseAllGrantWriterLeasesV1;
      return { ok: true, lease, ...(proof ? { took_over_from: state.record, proof } : {}) };
    }
    // Another process created this generation first: re-read and judge the winner.
  }
  return { ok: false, reason: REFUSAL.HELD };
}

/** Fencing: does this lease still name the CURRENT durable generation, for this very process? */
export function checkGrantWriterLeaseV1(home, lease = heldLease(home), { identity = currentProcessIdentity() } = {}) {
  if (!lease) return { ok: false, reason: REFUSAL.NOT_HELD };
  const state = readLeaseState(home);
  if (state.unreadable) return { ok: false, reason: REFUSAL.UNREADABLE };
  const r = state.record;
  const current = r && !r.released && state.generation === lease.generation
    && r.owner_nonce === lease.owner_nonce && sameProcess(r, identity) && sameProcess(lease.identity, identity);
  return current ? { ok: true, lease } : { ok: false, reason: REFUSAL.NOT_HELD };
}

export function releaseGrantWriterLeaseV1(home, lease = heldLease(home), { now = () => new Date().toISOString(), identity = currentProcessIdentity() } = {}) {
  const key = resolveHome(home);
  if (!checkGrantWriterLeaseV1(key, lease, { identity }).ok) return { ok: false, reason: REFUSAL.NOT_OWNER };
  const record = { version: LEASE_VERSION, generation: lease.generation + 1, released: true, owner_nonce: lease.owner_nonce, released_at: now() };
  if (!createGeneration(key, lease.generation + 1, record)) return { ok: false, reason: REFUSAL.NOT_OWNER };
  if (registry().get(key) === lease) registry().delete(key);
  return { ok: true };
}

/** Acquire if this process does not already hold a current lease. */
export function ensureGrantWriterLeaseV1(home, opts = {}) {
  const held = heldLease(home);
  if (held && checkGrantWriterLeaseV1(home, held, opts).ok) return { ok: true, lease: held, reused: true };
  if (held) registry().delete(resolveHome(home));
  return acquireGrantWriterLeaseV1(home, opts);
}

/** Release every lease this process holds (process exit). */
export function releaseAllGrantWriterLeasesV1() {
  const out = [];
  for (const [key, lease] of [...registry()]) out.push({ home: key, ...releaseGrantWriterLeaseV1(key, lease) });
  return out;
}
