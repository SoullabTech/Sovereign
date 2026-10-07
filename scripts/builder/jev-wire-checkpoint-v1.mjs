/**
 * JARVIS-JEV-01 / JEV-INT-05 — external checkpoint for the J1R5-WIRE experiment ledger.
 *
 * STATUS: CANDIDATE. Off. Authorizes nothing. No provider client, no credential, no network.
 *
 * The ledger (hash-chained, validated) is the history; the CHECKPOINT is an independent second store,
 * meant to live on a different volume, that remembers which initialization this is and the last
 * (seq, head) the ledger is known to have reached. Two stores cannot be written atomically, so the
 * protocol is ordered and refuses on every state it cannot explain:
 *
 *   every append:  ledger append (fsync) → checkpoint advance (tmp+fsync+rename+dir fsync)
 *   reservation:   the checkpoint covers the reservation BEFORE the request may leave
 *   outcomes:      the checkpoint covers observed/settled BEFORE completion is reported or another attempt starts
 *
 * Consequently the checkpoint is never ahead of a healthy ledger; the legal divergence is "ledger ahead by
 * the records of one interrupted step". That state is REFUSED until an explicit, deliberate `resume()`;
 * it is never silently reconciled. Everything else is refused outright:
 *   missing · corrupt · unavailable checkpoint · binding mismatch · different initialization (replaced or
 *   re-initialized ledger) · ledger shorter than the anchor (truncated) · ledger diverging at the anchor ·
 *   missing ledger while a checkpoint exists · repeat initialization · held lock.
 * A missing checkpoint is never recreated over recorded history. A stale pair lock is never deleted.
 *
 * Residual (declared): both stores rolled back together, or both replaced by someone who can write both,
 * cannot be detected by any local mechanism. A separate volume reduces common-mode loss only.
 */
import { closeSync, existsSync, fsyncSync, openSync, readFileSync, realpathSync, renameSync, statSync, unlinkSync, writeSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { BUDGET, canonicalJson, sha256Hex } from './jev-wire-v1.mjs';

export const CHECKPOINT_FORMAT = 'jev-wire-checkpoint/v1';
const err = (code) => new Error(code);
const isStr = (v) => typeof v === 'string' && v.length > 0;

/** Canonical form of a path whose file may not exist yet: real parent directory + basename. */
function canonical(path) {
  const abs = resolve(path);
  let dir = dirname(abs);
  try { dir = realpathSync(dir); } catch { /* parent not present: compare lexically */ }
  const full = join(dir, basename(abs));
  return process.platform === 'darwin' || process.platform === 'win32' ? full.toLowerCase() : full;
}
const identityOf = (path) => { try { const st = statSync(path); return st.dev + ':' + st.ino; } catch { return null; } };

/**
 * Every file either store may create or replace, grouped by owner. The two owners must not share ANY of them:
 *   ledger owns      L · L.lock · L.pair.lock
 *   checkpoint owns  C · C.tmp
 * Equal, aliased (symlink / hard link / case-folded) or derived-name collisions are refused BEFORE either store
 * is created, read for repair, or changed — a mis-pointed path must never overwrite the other store.
 */
export function assertDistinctStores(ledgerPath, checkpointPath) {
  const ledgerOwned = [ledgerPath, ledgerPath + '.lock', ledgerPath + '.pair.lock'];
  const checkpointOwned = [checkpointPath, checkpointPath + '.tmp'];
  const all = [...ledgerOwned, ...checkpointOwned];
  const keys = all.map(canonical);
  for (const a of ledgerOwned.map(canonical)) {
    for (const b of checkpointOwned.map(canonical)) if (a === b) throw err('PAIR_PATH_COLLISION');
  }
  if (new Set(keys.slice(0, 3)).size !== 3 || new Set(keys.slice(3)).size !== 2) throw err('PAIR_PATH_COLLISION');
  // aliases of files that already exist (hard links / symlink farms)
  const ids = all.map(identityOf);
  for (let i = 0; i < ledgerOwned.length; i += 1) {
    for (let j = ledgerOwned.length; j < all.length; j += 1) if (ids[i] && ids[i] === ids[j]) throw err('PAIR_PATH_COLLISION');
  }
}

export function createCheckpointedLedger(base, checkpointPath, { hooks = {} } = {}) {
  assertDistinctStores(base.path, checkpointPath);
  const pairLockPath = base.path + '.pair.lock';
  const caps = { max_attempts: BUDGET.max_attempts, ceiling_usd: BUDGET.ceiling_usd, reserve_usd: BUDGET.reserve_usd };
  const expectedBinding = () => ({ ...base.identity, caps });

  const withPairLock = (fn) => {
    assertDistinctStores(base.path, checkpointPath);        // before the lock file (itself a mutation) exists
    let fd;
    try { fd = openSync(pairLockPath, 'wx'); } catch { throw err('PAIR_LOCK_HELD'); }
    try { writeSync(fd, String(process.pid)); return fn(); }
    finally { closeSync(fd); try { unlinkSync(pairLockPath); } catch { /* already gone */ } }
  };

  const checkpointDirUsable = () => {
    try { return statSync(dirname(checkpointPath)).isDirectory(); } catch { return false; }
  };

  const readCheckpoint = () => {
    let text;
    try { text = readFileSync(checkpointPath, 'utf8'); } catch (e) {
      if (e && e.code === 'ENOENT') return checkpointDirUsable() ? null : fail('PAIR_CHECKPOINT_UNAVAILABLE');
      return fail('PAIR_CHECKPOINT_UNAVAILABLE');
    }
    let cp;
    try { cp = JSON.parse(text); } catch { return fail('PAIR_CHECKPOINT_CORRUPT'); }
    if (!cp || typeof cp !== 'object' || cp.format !== CHECKPOINT_FORMAT) return fail('PAIR_CHECKPOINT_CORRUPT');
    if (![cp.instance_id, cp.head, cp.experiment_id, cp.table_hash, cp.fixture_list_hash, cp.schema_sha256].every(isStr)) return fail('PAIR_CHECKPOINT_CORRUPT');
    if (!Number.isSafeInteger(cp.seq) || cp.seq < 0 || !cp.caps || typeof cp.caps !== 'object') return fail('PAIR_CHECKPOINT_CORRUPT');
    const { checkpoint_hash: stored, ...rest } = cp;
    if (stored !== sha256Hex(canonicalJson(rest))) return fail('PAIR_CHECKPOINT_CORRUPT');
    return cp;
  };
  function fail(code) { throw err(code); }

  const writeCheckpoint = (records) => {
    const last = records[records.length - 1];
    const body = {
      format: CHECKPOINT_FORMAT, instance_id: records[0].hash, ...expectedBinding(),
      seq: last.seq, head: last.hash, written_at: Date.now(),
    };
    const full = { ...body, checkpoint_hash: sha256Hex(canonicalJson(body)) };
    const tmp = checkpointPath + '.tmp';
    try {
      const fd = openSync(tmp, 'w');
      try { writeSync(fd, JSON.stringify(full) + '\n'); fsyncSync(fd); } finally { closeSync(fd); }
      renameSync(tmp, checkpointPath);
      const dfd = openSync(dirname(checkpointPath), 'r');
      try { fsyncSync(dfd); } finally { closeSync(dfd); }
    } catch { throw err('PAIR_CHECKPOINT_UNAVAILABLE'); }
  };

  /** Throws a PAIR_* code on every inconsistent state. Returns { records, cp, ahead }. */
  const verifyPair = ({ allowAhead = false } = {}) => {
    const ledgerExists = existsSync(base.path);
    const cp = readCheckpoint();
    if (!ledgerExists && cp) return fail('PAIR_LEDGER_MISSING');
    if (!ledgerExists) return fail('LEDGER_NOT_INITIALIZED');
    if (!cp) return fail('PAIR_CHECKPOINT_MISSING');
    const want = expectedBinding();
    if (cp.experiment_id !== want.experiment_id || cp.table_hash !== want.table_hash
      || cp.fixture_list_hash !== want.fixture_list_hash || cp.schema_sha256 !== want.schema_sha256
      || canonicalJson(cp.caps) !== canonicalJson(want.caps)) return fail('PAIR_BINDING_MISMATCH');
    const records = base.read();                                   // validated chain; throws LEDGER_*
    if (records[0].hash !== cp.instance_id) return fail('PAIR_INSTANCE_MISMATCH');
    if (cp.seq > records.length - 1) return fail('PAIR_LEDGER_BEHIND');
    if (records[cp.seq].hash !== cp.head) return fail('PAIR_LEDGER_DIVERGES');
    const ahead = records.length - 1 - cp.seq;
    if (ahead > 0 && !allowAhead) return fail('PAIR_CHECKPOINT_BEHIND');
    return { records, cp, ahead };
  };

  return {
    path: base.path,
    checkpointPath,
    identity: base.identity,
    read: () => base.read(),
    state: () => base.state(),
    verify: () => withPairLock(() => { const { ahead } = verifyPair({ allowAhead: true }); return { consistent: ahead === 0, ahead }; }),

    /** One deliberate act that creates BOTH stores. Refused if either already exists. */
    initialize: () => withPairLock(() => {
      if (existsSync(base.path) || existsSync(checkpointPath)) return fail('PAIR_ALREADY_INITIALIZED');
      if (!checkpointDirUsable()) return fail('PAIR_CHECKPOINT_UNAVAILABLE');
      base.initialize();
      hooks.afterLedgerAppend?.('init');
      writeCheckpoint(base.read());
      hooks.afterCheckpoint?.('init');
    }),

    /** Only for a crash between the two stores of initialization: ledger holds ONLY its init record. */
    establishCheckpoint: () => withPairLock(() => {
      if (existsSync(checkpointPath)) return fail('PAIR_ALREADY_INITIALIZED');
      if (!existsSync(base.path)) return fail('LEDGER_NOT_INITIALIZED');
      const records = base.read();
      if (records.length !== 1) return fail('PAIR_CANNOT_ESTABLISH_OVER_HISTORY');
      if (!checkpointDirUsable()) return fail('PAIR_CHECKPOINT_UNAVAILABLE');
      writeCheckpoint(records);
    }),

    /** Explicit act: advance the checkpoint over records that already validly extend the anchored head. */
    resume: () => withPairLock(() => {
      const { records, cp, ahead } = verifyPair({ allowAhead: true });
      if (ahead === 0) return { advanced: false, seq: cp.seq };
      writeCheckpoint(records);
      return { advanced: true, from_seq: cp.seq, to_seq: records.length - 1, extra_kinds: records.slice(cp.seq + 1).map((r) => r.kind) };
    }),

    /** Reservation: ledger gate+append, then the checkpoint covers it BEFORE the caller may dispatch. */
    reserveIfAllowed: (record, gate) => withPairLock(() => {
      verifyPair();
      const out = base.reserveIfAllowed(record, gate);
      if (!out.ok) return out;
      hooks.afterLedgerAppend?.('reserved');
      writeCheckpoint(base.read());
      hooks.afterCheckpoint?.('reserved');
      verifyPair();                                                // dispatch only on proven agreement
      return out;
    }),

    /** Any later record (observed / settled / halted): ledger first, checkpoint immediately after. */
    append: (record) => withPairLock(() => {
      verifyPair();
      base.append(record);
      hooks.afterLedgerAppend?.(record.kind);
      writeCheckpoint(base.read());
      hooks.afterCheckpoint?.(record.kind);
    }),
  };
}
