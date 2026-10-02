/**
 * JARVIS O5-R3 — conforming REFERENCE DOUBLE for the process-lifetime writer lease.
 *
 * It proves only that the R3-L laws are mutually satisfiable. It is a test double
 * over the model world, ⛔ never an implementation and never a seed for one.
 *
 * Observable contract (what the falsifiers bind; storage shape is NOT bound):
 *   acquire(world, self, { nonce, now }) → { ok:true, lease, took_over_from?, proof? }
 *                                        | { ok:false, reason, holder? }
 *   release(world, self, lease)          → { ok:true } | { ok:false, reason }
 *   append(world, self, lease, record, ledger = LEDGER)
 *                                        → { ok:true } | { ok:false, reason }   (the ONLY grant-ledger mutation,
 *                                          for EVERY ledger in the grant domain, human-provider included)
 *   writeOther(world, self, path, bytes) → { ok:true } | { ok:false, reason }   (a home write OUTSIDE the grant domain;
 *                                          the lease does not govern it, R3-R1)
 *   readLedger(world, self)              → { ok:true, events }                  (never needs the lease)
 *
 * Mixed-version law (R3-R10): the lease holder STILL takes the legacy per-append
 * lock for every append, and never treats an existing one as abandoned merely
 * because it holds the lease, so a lease-unaware writer on an older binding keeps
 * seeing GRANT_LEDGER_BUSY and is never written through.
 *
 * Refusal vocabulary: HOME_LEASE_HELD · HELD_BY_THIS_PROCESS · LEASE_OWNER_UNDETERMINABLE ·
 * LEASE_RECORD_UNREADABLE · WRITER_LEASE_NOT_HELD · NOT_LEASE_OWNER.
 */
import { LEASE, LEDGER, GRANT_LEDGERS, appendLockOf } from './world.mjs';

export const REASONS = Object.freeze([
  'HOME_LEASE_HELD', 'HELD_BY_THIS_PROCESS', 'LEASE_OWNER_UNDETERMINABLE',
  'LEASE_RECORD_UNREADABLE', 'WRITER_LEASE_NOT_HELD', 'NOT_LEASE_OWNER', 'GRANT_LEDGER_BUSY',
]);

export const recordOf = (self, nonce, now = 0) => JSON.stringify({
  pid: self.pid, process_start_time: self.start_time, host: self.host, acquired_at: now, owner_nonce: nonce,
});

export function parseLease(bytes) {
  try {
    const r = JSON.parse(bytes);
    const ok = r && typeof r.owner_nonce === 'string' && Number.isInteger(r.pid)
      && typeof r.host === 'string' && r.process_start_time !== undefined && r.process_start_time !== null;
    return ok ? r : null;
  } catch { return null; }
}

export const sameProcess = (r, self) => r.host === self.host && r.pid === self.pid && r.process_start_time === self.start_time;

/** Proof of abandonment. Only DEAD and DEAD_PID_REUSED license a takeover. */
export function judgeHolder(world, holder, self) {
  if (sameProcess(holder, self)) return 'THIS_PROCESS';
  if (holder.host !== world.host) return 'UNDETERMINABLE';
  const p = world.probe(holder.host, holder.pid);
  if (p.state === 'GONE') return 'DEAD';
  if (p.state === 'ALIVE') return p.start_time === holder.process_start_time ? 'ALIVE' : 'DEAD_PID_REUSED';
  return 'UNDETERMINABLE';
}

/** Fencing: the DURABLE lease record names this exact process and lease incarnation. */
export function holdsLease(world, self, lease) {
  const cur = parseLease(world.fs.read(LEASE));
  return !!(cur && lease && cur.owner_nonce === lease.owner_nonce && sameProcess(cur, self));
}

/** One append under the legacy per-append lock; an existing lock is never cleared here. */
export function appendUnderLock(world, ledger, record, holder = 'lease-holder') {
  const lock = appendLockOf(ledger);
  if (!world.fs.createExclusive(lock, holder)) return { ok: false, reason: 'GRANT_LEDGER_BUSY' };
  try { world.fs.append(ledger, JSON.stringify(record) + '\n'); } finally { world.fs.remove(lock, holder); }
  return { ok: true };
}

export const REFERENCE = Object.freeze({
  async acquire(world, self, { nonce, now = 0 }) {
    const mine = recordOf(self, nonce, now);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      if (world.fs.createExclusive(LEASE, mine)) return { ok: true, lease: { owner_nonce: nonce } };
      const cur = world.fs.read(LEASE);
      if (cur === null) continue; // released between our create and our read
      const holder = parseLease(cur);
      if (!holder) return { ok: false, reason: 'LEASE_RECORD_UNREADABLE' };
      const verdict = judgeHolder(world, holder, self);
      if (verdict === 'THIS_PROCESS') return { ok: false, reason: 'HELD_BY_THIS_PROCESS', holder };
      if (verdict === 'ALIVE') return { ok: false, reason: 'HOME_LEASE_HELD', holder };
      if (verdict === 'UNDETERMINABLE') return { ok: false, reason: 'LEASE_OWNER_UNDETERMINABLE', holder };
      await world.tick();
      // The takeover is a compare-and-swap against the exact bytes the proof was about.
      if (world.fs.swap(LEASE, cur, mine)) return { ok: true, lease: { owner_nonce: nonce }, took_over_from: holder, proof: verdict };
      return { ok: false, reason: 'HOME_LEASE_HELD' };
    }
    return { ok: false, reason: 'HOME_LEASE_HELD' };
  },

  async release(world, self, lease) {
    const cur = world.fs.read(LEASE);
    const holder = parseLease(cur);
    if (!holder || !lease || holder.owner_nonce !== lease.owner_nonce || !sameProcess(holder, self)) {
      return { ok: false, reason: 'NOT_LEASE_OWNER' };
    }
    return world.fs.remove(LEASE, cur) ? { ok: true } : { ok: false, reason: 'NOT_LEASE_OWNER' };
  },

  async append(world, self, lease, record, ledger = LEDGER) {
    if (!GRANT_LEDGERS.includes(ledger)) throw new Error('NOT_A_GRANT_LEDGER');
    // Fencing: the DURABLE lease record is checked at the moment of every mutation.
    if (!holdsLease(world, self, lease)) return { ok: false, reason: 'WRITER_LEASE_NOT_HELD' };
    return appendUnderLock(world, ledger, record);
  },

  async writeOther(world, self, target, bytes) {
    if (GRANT_LEDGERS.includes(target)) throw new Error('GRANT_LEDGER_IS_NOT_OTHER');
    world.fs.write(target, bytes);
    return { ok: true };
  },

  readLedger(world) {
    const text = world.fs.read(LEDGER) ?? '';
    return { ok: true, events: text.split('\n').filter(Boolean).map((l) => JSON.parse(l)) };
  },
});
