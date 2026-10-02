/**
 * O5-R3 — shared core for every append-only grant ledger in the grant authority domain
 * (canonical W v2 grants and human-provider grants alike, R3-R2).
 *
 * READ (lease-free, side-effect-free, R3-R4)
 *   The newline is the commit marker. A final line without one is an UNCOMMITTED
 *   write: it is skipped and reported, never fatal. A committed line that does not
 *   parse is corruption and throws, as before.
 *
 * MUTATE (R3-R3, enforced here, never by caller discipline)
 *   1. the process must hold the CURRENT writer lease for this home (fencing re-read);
 *   2. the legacy per-append lock `<wu>.lock` is still taken and honoured, and is
 *      never cleared because we hold the lease (R3-R10);
 *   3. a torn terminal fragment is recovered behind the durable barrier (R3-R5/R6/R12):
 *        quarantine exact raw bytes → fsync quarantine → [fsync parent dir(s) if created]
 *        → ftruncate ledger to the last proven committed byte boundary → fsync ledger
 *        → only then the next append.
 *      Any durability failure throws and nothing further happens.
 *      *Evidence becomes durable before destruction; repaired authority becomes
 *      durable before new history.*
 *   4. the record and its newline go out as ONE write.
 *
 * Normal appends are not fsynced: the fsync deferral stands everywhere except the
 * destructive recovery boundary (R3-R12).
 */
import * as realFs from 'node:fs';
import path from 'node:path';
import { checkGrantWriterLeaseV1, heldLease, resolveHome } from './grant-writer-lease-v1.mjs';

export const QUARANTINE_VERSION = 'O5R3Q.v1';
export const QUARANTINE_REASON = 'UNCOMMITTED_TERMINAL_FRAGMENT';
export const QUARANTINE_DIR = 'grant-ledger-quarantine';

let FS = realFs;
/** Test seam: substitute the filesystem (used to witness fsync ordering and failure). */
export function setGrantLedgerFsForTesting(impl) { FS = impl ?? realFs; }

/** Split a ledger's bytes at the last newline. Offsets are BYTES, never characters. */
export function splitCommitted(buf) {
  const cut = buf.lastIndexOf(0x0a) + 1;
  return { committed: buf.subarray(0, cut), tail: buf.subarray(cut), offset: cut };
}

/** Lease-free read. Returns committed events and any uncommitted terminal fragment. */
export function readGrantLedgerV1(file, { corruptCode }) {
  if (!FS.existsSync(file)) return { events: [], uncommitted_tail: null };
  const buf = FS.readFileSync(file);
  const { committed, tail, offset } = splitCommitted(buf);
  const events = [];
  let lineNumber = 0;
  for (const line of committed.toString('utf8').split('\n')) {
    lineNumber += 1;
    if (!line.trim()) continue;
    try { events.push(JSON.parse(line)); } catch { throw new Error(`${corruptCode} at line ${lineNumber}`); }
  }
  return {
    events,
    uncommitted_tail: tail.length ? { offset, byte_length: tail.length, bytes_b64: tail.toString('base64') } : null,
  };
}

function fsyncPath(p) {
  const fd = FS.openSync(p, 'r');
  try { FS.fsyncSync(fd); } finally { FS.closeSync(fd); }
}

/**
 * Recover a torn terminal fragment. Caller holds the lease and the append lock.
 * Returns the quarantine record, or null if the ledger ends on a committed boundary.
 */
function recoverTerminalFragment({ home, file, ledgerId, store, corruptCode, lease, now }) {
  const read = readGrantLedgerV1(file, { corruptCode }); // throws on committed corruption: STOP, no repair (R3-R6)
  const t = read.uncommitted_tail;
  if (!t) return null;

  const record = {
    version: QUARANTINE_VERSION, ledger: ledgerId, store,
    offset: t.offset, byte_length: t.byte_length, bytes_b64: t.bytes_b64,
    reason: QUARANTINE_REASON,
    lease: { generation: lease.generation, owner_nonce: lease.owner_nonce },
    at: now(),
  };

  // 1. evidence, durably
  const qdir = path.join(resolveHome(home), QUARANTINE_DIR, store);
  const qfile = path.join(qdir, path.basename(file));
  const dirsCreated = [];
  for (const d of [path.join(resolveHome(home), QUARANTINE_DIR), qdir]) {
    if (!FS.existsSync(d)) { FS.mkdirSync(d, { mode: 0o700 }); dirsCreated.push(d); }
  }
  const fileCreated = !FS.existsSync(qfile);
  const qfd = FS.openSync(qfile, 'a', 0o600);
  try {
    FS.writeSync(qfd, JSON.stringify(record) + '\n');
    FS.fsyncSync(qfd);
  } finally { FS.closeSync(qfd); }
  if (fileCreated) fsyncPath(qdir);
  for (const d of dirsCreated) fsyncPath(path.dirname(d));

  // 2. destruction of never-committed bytes only, then the repaired authority, durably
  const lfd = FS.openSync(file, 'r+');
  try {
    FS.ftruncateSync(lfd, t.offset);
    FS.fsyncSync(lfd);
  } finally { FS.closeSync(lfd); }

  return record;
}

/**
 * Run a grant-ledger mutation under the full R3 discipline. `fn(ctx)` performs the
 * read-check-append; `ctx.append(event)` is the only way to write.
 */
export function mutateGrantLedgerV1({ home, file, lockPath, ledgerId, store, corruptCode, lease: explicit, now = () => new Date().toISOString() }, fn) {
  const lease = explicit ?? heldLease(home);
  const held = checkGrantWriterLeaseV1(home, lease);
  if (!held.ok) return { ok: false, status: 'REFUSED', reason: 'WRITER_LEASE_NOT_HELD', lease_reason: held.reason };

  FS.mkdirSync(path.dirname(lockPath), { recursive: true });
  let fd;
  try {
    fd = FS.openSync(lockPath, 'wx', 0o600);
    FS.closeSync(fd);
  } catch (error) {
    if (error?.code === 'EEXIST') return { ok: false, status: 'REFUSED', reason: 'GRANT_LEDGER_BUSY' };
    throw error;
  }
  try {
    const quarantined = recoverTerminalFragment({ home, file, ledgerId, store, corruptCode, lease, now });
    const ctx = {
      append(event) {
        FS.mkdirSync(path.dirname(file), { recursive: true });
        FS.appendFileSync(file, JSON.stringify(event) + '\n', { mode: 0o600 }); // one write: record + commit marker
        return event;
      },
      quarantined,
    };
    const out = fn(ctx);
    return quarantined && out && typeof out === 'object' ? { ...out, recovered_terminal_fragment: quarantined } : out;
  } finally {
    try { FS.unlinkSync(lockPath); } catch (error) { if (error?.code !== 'ENOENT') throw error; }
  }
}
