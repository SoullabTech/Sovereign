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
 *   append(world, self, lease, record)   → { ok:true } | { ok:false, reason }   (the ONLY ledger mutation)
 *   readLedger(world, self)              → { ok:true, events }                  (never needs the lease)
 *
 * Refusal vocabulary: HOME_LEASE_HELD · HELD_BY_THIS_PROCESS · LEASE_OWNER_UNDETERMINABLE ·
 * LEASE_RECORD_UNREADABLE · WRITER_LEASE_NOT_HELD · NOT_LEASE_OWNER.
 */
import { LEASE, LEDGER } from './world.mjs';

export const REASONS = Object.freeze([
  'HOME_LEASE_HELD', 'HELD_BY_THIS_PROCESS', 'LEASE_OWNER_UNDETERMINABLE',
  'LEASE_RECORD_UNREADABLE', 'WRITER_LEASE_NOT_HELD', 'NOT_LEASE_OWNER',
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

function currentHolder(world, self, lease) {
  const cur = parseLease(world.fs.read(LEASE));
  return !!(cur && lease && cur.owner_nonce === lease.owner_nonce && sameProcess(cur, self));
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

  async append(world, self, lease, record) {
    // Fencing: the DURABLE lease record is checked at the moment of every mutation.
    if (!currentHolder(world, self, lease)) return { ok: false, reason: 'WRITER_LEASE_NOT_HELD' };
    world.fs.append(LEDGER, JSON.stringify(record) + '\n');
    return { ok: true };
  },

  readLedger(world) {
    const text = world.fs.read(LEDGER) ?? '';
    return { ok: true, events: text.split('\n').filter(Boolean).map((l) => JSON.parse(l)) };
  },
});
