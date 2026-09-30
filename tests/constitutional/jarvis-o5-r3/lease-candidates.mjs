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
 */
import { LEASE, LEDGER } from './world.mjs';
import { REFERENCE, recordOf, parseLease, sameProcess, judgeHolder } from './lease-reference.mjs';

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
    async append(world, self, lease, record) {
      if (o.noGuard) { world.fs.append(LEDGER, JSON.stringify(record) + '\n'); return { ok: true }; }
      if (o.cachedFlag) {
        if (!(o.cachedFlag.get(`${self.host}:${self.pid}`))) return { ok: false, reason: 'WRITER_LEASE_NOT_HELD' };
        world.fs.append(LEDGER, JSON.stringify(record) + '\n');
        return { ok: true };
      }
      if (o.bearerNonce) {
        // the nonce alone authorizes: whoever presents it writes, whatever process they are
        const cur = parseLease(world.fs.read(LEASE));
        if (!cur || !lease || cur.owner_nonce !== lease.owner_nonce) return { ok: false, reason: 'WRITER_LEASE_NOT_HELD' };
        world.fs.append(LEDGER, JSON.stringify(record) + '\n');
        return { ok: true };
      }
      const r = await REFERENCE.append(world, self, lease, record);
      if (r.ok && o.releaseAfterAppend) world.fs.remove(LEASE, world.fs.read(LEASE));
      return r;
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
    subject: buildLease({ bearerNonce: true }), collateral: {} },
  { id: 'DC-L1', named: 'R3-L2', law: 'acquisition skipped: the store mutates the ledger without requiring the lease',
    subject: buildLease({ noGuard: true }),
    collateral: { 'R3-L1': IRREDUCIBLE_NO_GUARD, 'R3-L8': IRREDUCIBLE_NO_GUARD } },
  { id: 'DC-L2', named: 'R3-L3', law: 'the lease is released after one append (an append lock wearing a lease\'s name)',
    subject: buildLease({ releaseAfterAppend: true }),
    collateral: { 'R3-L5': 'the owner\'s own second write is refused after its lease evaporated, which is the same error seen from the release side' } },
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
  { id: 'DC-L8', named: 'R3-L9', law: 'reading requires the lease, so a read-only census is refused while Desktop runs',
    subject: buildLease({ readNeedsLease: true }), collateral: {} },
]);
