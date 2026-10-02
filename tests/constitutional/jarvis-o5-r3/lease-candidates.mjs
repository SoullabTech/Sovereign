/**
 * JARVIS O5-R3 — writer-lease DEFEAT CANDIDATES.
 *
 * Each is the reference with exactly ONE decision replaced by a plausible,
 * competent, wrong one (decision-level lethality, as in O5-R1/R2 and S3).
 * `buildLease({})` is the reference decision set; the matrix proves it passes.
 *
 * The founder's four named mutants map to: skipped acquisition → DC-L1 ·
 * release after one append → DC-L2 · stale owner trusted without proof →
 * DC-L3a…d · writer identity unchecked on release → DC-L4.
 * Build-gate additions (founder rulings R3-R1/R2/R10): grant-domain inclusion →
 * DC-D1 · grant-domain scope → DC-D2 · mixed-version append-lock safety →
 * DC-L9 / DC-L10.
 */
import { LEASE, LEDGER, GRANT_LEDGERS, appendLockOf } from './world.mjs';
import { REFERENCE, recordOf, parseLease, sameProcess, judgeHolder, holdsLease, appendUnderLock } from './lease-reference.mjs';

const TTL = 60_000;

export function buildLease(o = {}) {
  const judge = o.judge ?? judgeHolder;
  const s = {
    async acquire(world, self, { nonce, now = 0 }) {
      const mine = recordOf(self, nonce, now);
      if (o.lastWriterWins) { world.fs.write(LEASE, mine); return { ok: true, lease: { owner_nonce: nonce } }; }
      if (o.checkThenCreate) {
        if (!world.fs.exists(LEASE)) { await world.tick(); world.fs.write(LEASE, mine); return { ok: true, lease: { owner_nonce: nonce } }; }
      } else if (world.fs.createExclusive(LEASE, mine)) {
        if (o.clearOnAcquire) {
          // "holding the lease proves any append lock is residue of a dead writer" (census §4.7, withdrawn by R3-R10)
          for (const l of GRANT_LEDGERS) { const lock = appendLockOf(l); if (world.fs.exists(lock)) world.fs.remove(lock, world.fs.read(lock)); }
        }
        return { ok: true, lease: { owner_nonce: nonce } };
      }
      const cur = world.fs.read(LEASE);
      const holder = parseLease(cur);
      if (!holder) {
        if (o.unreadableIsAbandoned) { world.fs.write(LEASE, mine); return { ok: true, lease: { owner_nonce: nonce } }; }
        return { ok: false, reason: 'LEASE_RECORD_UNREADABLE' };
      }
      const verdict = judge(world, holder, self, now);
      if (verdict === 'THIS_PROCESS') return { ok: false, reason: 'HELD_BY_THIS_PROCESS', holder };
      if (verdict === 'ALIVE') return { ok: false, reason: 'HOME_LEASE_HELD', holder };
      if (verdict === 'UNDETERMINABLE') return { ok: false, reason: 'LEASE_OWNER_UNDETERMINABLE', holder };
      await world.tick();
      if (o.takeoverByOverwrite) { world.fs.write(LEASE, mine); return { ok: true, lease: { owner_nonce: nonce }, took_over_from: holder }; }
      if (world.fs.swap(LEASE, cur, mine)) return { ok: true, lease: { owner_nonce: nonce }, took_over_from: holder, proof: verdict };
      return { ok: false, reason: 'HOME_LEASE_HELD' };
    },
    async release(world, self, lease) {
      if (o.releaseWithoutIdentity) { world.fs.remove(LEASE, world.fs.read(LEASE)); return { ok: true }; }
      return REFERENCE.release(world, self, lease);
    },
    async append(world, self, lease, record, ledger = LEDGER) {
      if (!GRANT_LEDGERS.includes(ledger)) throw new Error('NOT_A_GRANT_LEDGER');
      // ONE decision: is this caller the current writer for THIS ledger?
      const guarded = !(o.noGuard || (o.canonicalOnly && ledger !== LEDGER));
      if (guarded) {
        let ok;
        if (o.cachedFlag) ok = !!o.cachedFlag.get(`${self.host}:${self.pid}`);
        else if (o.bearerNonce) {
          // the nonce alone authorizes: whoever presents it writes, whatever process they are
          const cur = parseLease(world.fs.read(LEASE));
          ok = !!(cur && lease && cur.owner_nonce === lease.owner_nonce);
        } else ok = holdsLease(world, self, lease);
        if (!ok) return { ok: false, reason: 'WRITER_LEASE_NOT_HELD' };
      }
      let r;
      if (o.noAppendLock) {
        // the lease is taken to subsume the legacy per-append lock
        world.fs.append(ledger, JSON.stringify(record) + '\n');
        r = { ok: true };
      } else if (o.clearAppendLock) {
        // "I hold the lease, so any append lock must be abandoned residue"
        const lock = appendLockOf(ledger);
        if (world.fs.exists(lock)) world.fs.remove(lock, world.fs.read(lock));
        r = appendUnderLock(world, ledger, record);
      } else {
        r = appendUnderLock(world, ledger, record);
      }
      if (r.ok && o.releaseAfterAppend) world.fs.remove(LEASE, world.fs.read(LEASE));
      return r;
    },
    async writeOther(world, self, target, bytes) {
      if (o.homeWide) {
        // the lease is read as ownership of the whole home, so every home write needs it
        const holder = parseLease(world.fs.read(LEASE));
        if (!holder || !sameProcess(holder, self)) return { ok: false, reason: 'HOME_LEASE_HELD' };
      }
      return REFERENCE.writeOther(world, self, target, bytes);
    },
    readLedger(world, self) {
      if (o.readNeedsLease) {
        const holder = parseLease(world.fs.read(LEASE));
        if (holder && !sameProcess(holder, self)) return { ok: false, reason: 'HOME_LEASE_HELD' };
      }
      return REFERENCE.readLedger(world, self);
    },
  };
  if (o.cachedFlag) {
    // Ownership remembered in memory at acquire/release, never re-read from the durable record.
    const acquire = s.acquire; const release = s.release;
    s.acquire = async (w, self, opts) => { const r = await acquire(w, self, opts); if (r.ok) o.cachedFlag.set(`${self.host}:${self.pid}`, true); return r; };
    s.release = async (w, self, lease) => { const r = await release(w, self, lease); if (r.ok) o.cachedFlag.delete(`${self.host}:${self.pid}`); return r; };
  }
  return s;
}

// Wrong proofs of abandonment.
const pidOnlyAnyHost = (world, holder, self) => {
  if (sameProcess(holder, self)) return 'THIS_PROCESS';
  const p = world.probeLocalPidOnly(holder.pid); // kill(pid, 0) on this host, whatever host the record names
  if (p.state === 'GONE') return 'DEAD';
  return p.start_time === holder.process_start_time ? 'ALIVE' : 'DEAD_PID_REUSED';
};
const ageIsDeath = (world, holder, self, now) => {
  if (sameProcess(holder, self)) return 'THIS_PROCESS';
  if (now - holder.acquired_at > TTL) return 'DEAD';
  return judgeHolder(world, holder, self);
};
const pidWithoutStartTime = (world, holder, self) => {
  if (sameProcess(holder, self)) return 'THIS_PROCESS';
  if (holder.host !== world.host) return 'UNDETERMINABLE';
  const p = world.probe(holder.host, holder.pid);
  if (p.state === 'GONE') return 'DEAD';
  return p.state === 'ALIVE' ? 'ALIVE' : 'UNDETERMINABLE';
};

const NO_EXCLUSION = 'with no exclusion a second process takes the home ';
const IRREDUCIBLE_NO_GUARD = 'with no mutation guard the refused writer\'s writes land, so the second-writer and fencing laws fail with it';

export const LEASE_CANDIDATES = Object.freeze([
  { id: 'DC-L0a', named: 'R3-L1', law: 'acquisition without exclusion: a second acquirer simply overwrites the lease (last writer wins)',
    subject: buildLease({ lastWriterWins: true }),
    // Irreducible: a lease with no exclusion IS the multi-writer home. Every law that asks
    // "can a second process take this home?" must refuse it, from each boundary in turn.
    collateral: {
      'R3-L3': NO_EXCLUSION + 'after the holder has written',
      'R3-L4': NO_EXCLUSION + 'from a live holder (no proof is ever consulted)',
      'R3-L6': NO_EXCLUSION + 'concurrently (both acquirers win)',
      'R3-L7': NO_EXCLUSION + 'during a takeover (both reconcilers win)',
    } },
  { id: 'DC-L0b', named: 'R3-L1', law: 'the lease nonce is a bearer token: a second process presenting it writes',
    subject: buildLease({ bearerNonce: true }),
    collateral: { 'R3-D1': 'R3-D1 re-asks R3-L1\'s stolen-lease question for every grant ledger; a bearer token answers it wrongly on each' } },
  { id: 'DC-L1', named: 'R3-L2', law: 'acquisition skipped: the store mutates the ledger without requiring the lease',
    subject: buildLease({ noGuard: true }),
    collateral: { 'R3-L1': IRREDUCIBLE_NO_GUARD, 'R3-L8': IRREDUCIBLE_NO_GUARD, 'R3-D1': IRREDUCIBLE_NO_GUARD + ', on every grant ledger' } },
  { id: 'DC-L2', named: 'R3-L3', law: 'the lease is released after one append (an append lock wearing a lease\'s name)',
    subject: buildLease({ releaseAfterAppend: true }),
    collateral: { 'R3-L5': 'the owner\'s own second write is refused after its lease evaporated, which is the same error seen from the release side',
      'R3-L10': 'R3-L10 (b) appends to each grant ledger in turn; the second is refused because the lease evaporated after the first' } },
  { id: 'DC-L3a', named: 'R3-L4', law: 'stale owner trusted without proof: a local pid probe answers for a holder on another host',
    subject: buildLease({ judge: pidOnlyAnyHost }), collateral: {} },
  { id: 'DC-L3b', named: 'R3-L4', law: 'stale owner trusted without proof: lease age stands in for death',
    subject: buildLease({ judge: ageIsDeath }), collateral: {} },
  { id: 'DC-L3c', named: 'R3-L4', law: 'stale owner trusted without proof: an unreadable ownership record is treated as abandoned and overwritten',
    subject: buildLease({ unreadableIsAbandoned: true }), collateral: {} },
  { id: 'DC-L3d', named: 'R3-L4', law: 'a pid alone is taken as identity (no process start time), so a reused pid holds the home forever',
    subject: buildLease({ judge: pidWithoutStartTime }), collateral: {} },
  { id: 'DC-L4', named: 'R3-L5', law: 'writer identity is not checked on release',
    subject: buildLease({ releaseWithoutIdentity: true }), collateral: {} },
  { id: 'DC-L5', named: 'R3-L6', law: 'acquisition is check-then-create (a read, a round trip, then a plain write)',
    subject: buildLease({ checkThenCreate: true }), collateral: {} },
  { id: 'DC-L6', named: 'R3-L7', law: 'takeover overwrites after proving death, instead of swapping against the bytes it proved',
    subject: buildLease({ takeoverByOverwrite: true }), collateral: {} },
  { id: 'DC-L7', named: 'R3-L8', law: 'fencing by an in-memory "held" flag instead of the durable lease record',
    get subject() { return buildLease({ cachedFlag: new Map() }); }, collateral: {} },
  { id: 'DC-D1', named: 'R3-D1', law: 'the lease guards the canonical grant ledger only; the human-provider grant ledger stays a weaker side door',
    subject: buildLease({ canonicalOnly: true }), collateral: {} },
  { id: 'DC-D2', named: 'R3-D2', law: 'the lease is read as whole-home ownership: Work Unit, session, run and recovery writes are serialized behind it',
    subject: buildLease({ homeWide: true }), collateral: {} },
  { id: 'DC-L9', named: 'R3-L10', law: 'the lease subsumes the legacy append lock: the holder neither takes it nor honours it',
    subject: buildLease({ noAppendLock: true }), collateral: {} },
  { id: 'DC-L10', named: 'R3-L10', law: 'the lease holder treats any existing append lock as abandoned residue and clears it',
    subject: buildLease({ clearAppendLock: true }), collateral: {} },
  { id: 'DC-L11', named: 'R3-L10', law: 'lease acquisition clears append-lock "residue" (the census §4.7 proposal that R3-R10 withdrew)',
    subject: buildLease({ clearOnAcquire: true }), collateral: {} },
  { id: 'DC-L8', named: 'R3-L9', law: 'reading requires the lease, so a read-only census is refused while Desktop runs',
    subject: buildLease({ readNeedsLease: true }), collateral: {} },
]);
