/**
 * JARVIS O5-R3 — writer-lease FALSIFIERS (R3-L1…R3-L9).
 *
 * Founder ruling (2026-09-30): *a delegation home has exactly one active writer
 * process. Multi-writer operation is unsupported and must be refused
 * structurally. The per-append lock guarantees exclusive mutation of an
 * individual append; it does not establish single-writer ownership.*
 *
 * ⚠️ Naming: the founder's "F5 — second writer cannot acquire the home" is
 * R3-L1 here. `F5` already denotes the frozen O5-R1 evidence-escalation falsifier.
 *
 * Each falsifier is an async pure function of a lease subject over a fresh
 * model world (`world.mjs`). They test the invariant AT THE BOUNDARY
 * (acquisition, mutation, release), not whether two appends corrupt a file.
 */
import { makeWorld, LEASE, LEDGER, HUMAN_LEDGER, GRANT_LEDGERS, NON_GRANT_PATHS, appendLockOf, ledgerLines } from './world.mjs';
import { recordOf } from './lease-reference.mjs';

const expect = (f, cond, msg) => { if (!cond) f.push(msg); };
const owner = (w) => { try { return JSON.parse(w.fs.read(LEASE)).owner_nonce; } catch { return null; } };

async function run(fn) {
  const failures = [];
  try { await fn(failures); } catch (e) { failures.push(`threw: ${e.message}`); }
  return { pass: failures.length === 0, failures };
}

/** R3-L1 — the founder's F5: a second writer cannot acquire the home, and changes nothing. */
export const L1 = (s) => run(async (f) => {
  const w = makeWorld();
  const A = w.spawn(100, 1);
  const B = w.spawn(200, 2);
  const a = await s.acquire(w, A, { nonce: 'na' });
  expect(f, a.ok, 'A could not acquire an empty home');
  const b = await s.acquire(w, B, { nonce: 'nb' });
  expect(f, !b.ok && b.reason === 'HOME_LEASE_HELD', `second writer not refused (${b.ok ? 'acquired' : b.reason})`);
  expect(f, owner(w) === 'na', 'A is no longer the owner after B tried');
  const before = w.fs.read(LEDGER);
  for (const lease of [b.lease, { owner_nonce: 'nb' }, a.lease]) {
    const r = await s.append(w, B, lease, { event: 'CLAIMED', by: 'B' });
    expect(f, !r.ok, `B mutated the ledger with lease ${JSON.stringify(lease)}`);
  }
  expect(f, w.fs.read(LEDGER) === before, 'ledger changed by the refused writer');
  const ra = await s.append(w, A, a.lease, { event: 'CLAIMED', by: 'A' });
  expect(f, ra.ok && ledgerLines(w).length === 1, 'the lease holder could not write');
});

/** R3-L2 — no mutation without the lease: skipping acquisition must be refused by the store. */
export const L2 = (s) => run(async (f) => {
  const w = makeWorld();
  const A = w.spawn(100, 1);
  for (const lease of [undefined, null, { owner_nonce: 'forged' }]) {
    const r = await s.append(w, A, lease, { event: 'ISSUED' });
    expect(f, !r.ok && r.reason === 'WRITER_LEASE_NOT_HELD', `append without the lease was ${r.ok ? 'accepted' : r.reason}`);
  }
  expect(f, w.fs.read(LEDGER) === null, 'a lease-less write reached the ledger');
  const a = await s.acquire(w, A, { nonce: 'na' });
  const r = await s.append(w, A, a.lease, { event: 'ISSUED' });
  expect(f, r.ok, 'the holder could not write after acquiring');
});

/** R3-L3 — the lease is process-lifetime: it is not surrendered by writing. */
export const L3 = (s) => run(async (f) => {
  const w = makeWorld();
  const A = w.spawn(100, 1);
  const B = w.spawn(200, 2);
  const a = await s.acquire(w, A, { nonce: 'na' });
  for (let i = 0; i < 3; i += 1) {
    const r = await s.append(w, A, a.lease, { event: 'E', i });
    expect(f, r.ok, `holder append ${i} refused`);
    const b = await s.acquire(w, B, { nonce: `nb${i}` });
    expect(f, !b.ok, `B acquired the home after A's append ${i}`);
    expect(f, owner(w) === 'na', `ownership moved after append ${i}`);
  }
});

/** R3-L4 — abandonment requires proof: pid + start time + host, never age, never an unreadable record. */
export const L4 = (s) => run(async (f) => {
  const LATER = 10 ** 12;
  // (a) holder proven dead on this host → takeover
  { const w = makeWorld(); const A = w.spawn(100, 1); const B = w.spawn(200, 2);
    await s.acquire(w, A, { nonce: 'na' }); w.kill(A);
    const b = await s.acquire(w, B, { nonce: 'nb' });
    expect(f, b.ok && owner(w) === 'nb', '(a) a proven-dead holder blocked the home forever'); }
  // (b) holder alive, same start time → refused, record untouched
  { const w = makeWorld(); const A = w.spawn(100, 1); const B = w.spawn(200, 2);
    await s.acquire(w, A, { nonce: 'na', now: 0 }); const bytes = w.fs.read(LEASE);
    const b = await s.acquire(w, B, { nonce: 'nb', now: LATER });
    expect(f, !b.ok && b.reason === 'HOME_LEASE_HELD', `(b) a live holder was displaced (${b.reason ?? 'acquired'}); age is not proof`);
    expect(f, w.fs.read(LEASE) === bytes, '(b) the live holder\'s record was altered'); }
  // (c) pid reused by a different process → the original holder is proven dead
  { const w = makeWorld(); const A = w.spawn(100, 1); const B = w.spawn(200, 2);
    await s.acquire(w, A, { nonce: 'na' }); w.kill(A); w.spawn(100, 77);
    const b = await s.acquire(w, B, { nonce: 'nb' });
    expect(f, b.ok && owner(w) === 'nb', '(c) a reused pid was mistaken for the original holder'); }
  // (d) holder on another host → unprovable, refused
  { const w = makeWorld(); const B = w.spawn(100, 2);
    w.fs.write(LEASE, recordOf({ pid: 100, start_time: 1, host: 'laptop' }, 'remote'));
    const bytes = w.fs.read(LEASE);
    const b = await s.acquire(w, B, { nonce: 'nb' });
    expect(f, !b.ok && b.reason === 'LEASE_OWNER_UNDETERMINABLE', `(d) a remote holder was ${b.ok ? 'displaced' : b.reason}`);
    expect(f, w.fs.read(LEASE) === bytes, '(d) the remote holder\'s record was altered'); }
  // (e) unreadable ownership record → refused, never deleted or overwritten
  { const w = makeWorld(); const B = w.spawn(200, 2);
    w.fs.write(LEASE, '{"pid":10');
    const b = await s.acquire(w, B, { nonce: 'nb' });
    expect(f, !b.ok && b.reason === 'LEASE_RECORD_UNREADABLE', `(e) an unreadable record was ${b.ok ? 'overwritten' : b.reason}`);
    expect(f, w.fs.read(LEASE) === '{"pid":10', '(e) the unreadable record was not preserved'); }
  // (f) liveness cannot be determined → refused
  { const w = makeWorld(); const A = w.spawn(100, 1); const B = w.spawn(200, 2);
    await s.acquire(w, A, { nonce: 'na' }); w.kill(A); w.probeUndeterminable = true;
    const b = await s.acquire(w, B, { nonce: 'nb' });
    expect(f, !b.ok && b.reason === 'LEASE_OWNER_UNDETERMINABLE', `(f) an undeterminable holder was ${b.ok ? 'displaced' : b.reason}`); }
  // (g) same process asks again → reported, never a second lease
  { const w = makeWorld(); const A = w.spawn(100, 1);
    await s.acquire(w, A, { nonce: 'na' }); const bytes = w.fs.read(LEASE);
    const again = await s.acquire(w, A, { nonce: 'na2' });
    expect(f, !again.ok && again.reason === 'HELD_BY_THIS_PROCESS', `(g) the same process got ${again.ok ? 'a second lease' : again.reason}`);
    expect(f, w.fs.read(LEASE) === bytes, '(g) the record changed on a same-process request'); }
});

/** R3-L5 — release checks writer identity; a superseded lease cannot release its successor. */
export const L5 = (s) => run(async (f) => {
  const w = makeWorld();
  const A = w.spawn(100, 1);
  const B = w.spawn(200, 2);
  const C = w.spawn(300, 3);
  const a = await s.acquire(w, A, { nonce: 'na' });
  for (const lease of [a.lease, { owner_nonce: 'na' }, undefined]) {
    const r = await s.release(w, B, lease);
    expect(f, !r.ok, `B released A's lease with ${JSON.stringify(lease)}`);
  }
  expect(f, owner(w) === 'na', 'A lost the home to a non-owner release');
  expect(f, (await s.append(w, A, a.lease, { event: 'X' })).ok, 'A could not write after refused releases');
  expect(f, (await s.release(w, A, a.lease)).ok, 'the owner could not release');
  const c = await s.acquire(w, C, { nonce: 'nc' });
  const stale = await s.release(w, A, a.lease);
  expect(f, c.ok && !stale.ok && owner(w) === 'nc', 'a superseded lease released its successor');
});

/** R3-L6 — acquisition is atomic: two concurrent acquirers, exactly one owner. */
export const L6 = (s) => run(async (f) => {
  const w = makeWorld();
  const A = w.spawn(100, 1);
  const B = w.spawn(200, 2);
  const [a, b] = await Promise.all([s.acquire(w, A, { nonce: 'na' }), s.acquire(w, B, { nonce: 'nb' })]);
  const winners = [a, b].filter((r) => r.ok).length;
  expect(f, winners === 1, `${winners} processes believe they own the home`);
  const who = a.ok ? 'na' : b.ok ? 'nb' : null;
  expect(f, owner(w) === who, 'the durable owner is not the reported winner');
});

/** R3-L7 — takeover is atomic: two reconcilers proving the same death, exactly one owner. */
export const L7 = (s) => run(async (f) => {
  const w = makeWorld();
  const D = w.spawn(100, 1);
  const B = w.spawn(200, 2);
  const C = w.spawn(300, 3);
  await s.acquire(w, D, { nonce: 'nd' });
  w.kill(D);
  const [b, c] = await Promise.all([s.acquire(w, B, { nonce: 'nb' }), s.acquire(w, C, { nonce: 'nc' })]);
  const winners = [b, c].filter((r) => r.ok).length;
  expect(f, winners === 1, `${winners} reconcilers took over the same abandoned lease`);
  const who = b.ok ? 'nb' : c.ok ? 'nc' : null;
  expect(f, owner(w) === who, 'the durable owner is not the reported winner');
});

/** R3-L8 — fencing: only the CURRENT durable lease may write; a superseded lease object may not. */
export const L8 = (s) => run(async (f) => {
  { const w = makeWorld(); const A = w.spawn(100, 1);
    const first = await s.acquire(w, A, { nonce: 'n1' });
    await s.release(w, A, first.lease);
    const second = await s.acquire(w, A, { nonce: 'n2' });
    const old = await s.append(w, A, first.lease, { event: 'STALE' });
    expect(f, !old.ok, 'a released lease object still wrote');
    expect(f, (await s.append(w, A, second.lease, { event: 'CURRENT' })).ok, 'the current lease could not write'); }
  { const w = makeWorld(); const A = w.spawn(100, 1);
    const a = await s.acquire(w, A, { nonce: 'na' });
    // an out-of-band ownership change (e.g. an operator-authorized reconciliation)
    w.fs.write(LEASE, recordOf({ pid: 300, start_time: 3, host: w.host }, 'operator-assigned'));
    const r = await s.append(w, A, a.lease, { event: 'AFTER_SUPERSESSION' });
    expect(f, !r.ok, 'a superseded holder wrote after the durable lease moved');
    expect(f, ledgerLines(w).length === 0, 'the superseded write reached the ledger'); }
});

/** R3-L9 — read-only census needs no lease, may run while Desktop holds it, and changes nothing. */
export const L9 = (s) => run(async (f) => {
  const w = makeWorld();
  const A = w.spawn(100, 1);
  const R = w.spawn(400, 4);
  const a = await s.acquire(w, A, { nonce: 'na' });
  await s.append(w, A, a.lease, { event: 'ISSUED' });
  const snapshot = new Map(w.files);
  const r = await s.readLedger(w, R);
  expect(f, r?.ok && r.events?.length === 1, `a read-only reader was ${r?.ok ? 'given the wrong events' : `refused (${r?.reason})`}`);
  expect(f, w.files.size === snapshot.size && [...snapshot].every(([k, v]) => w.files.get(k) === v), 'the read changed the home');
});

/**
 * R3-D1 — every ledger in the grant authority domain is inside the lease (R3-R2, R3-R3):
 * the human-provider grant ledger refuses lease-less mutation exactly as the canonical one does.
 */
export const D1 = (s) => run(async (f) => {
  for (const ledger of GRANT_LEDGERS) {
    const w = makeWorld();
    const A = w.spawn(100, 1);
    const B = w.spawn(200, 2);
    const a = await s.acquire(w, A, { nonce: 'na' });
    for (const lease of [undefined, { owner_nonce: 'forged' }, a.lease]) {
      const r = await s.append(w, B, lease, { event: 'ISSUED', by: 'B' }, ledger);
      expect(f, !r.ok, `${ledger}: a non-holder mutated it with ${JSON.stringify(lease)}`);
    }
    expect(f, w.fs.read(ledger) === null, `${ledger}: a lease-less write reached the grant ledger`);
    const ra = await s.append(w, A, a.lease, { event: 'ISSUED', by: 'A' }, ledger);
    expect(f, ra.ok && w.fs.read(ledger) !== null, `${ledger}: the holder could not write`);
  }
});

/**
 * R3-D2 — scope is the grant domain, not the home (R3-R1): while the lease is held, other
 * processes still write Work Unit, session, Path A run and recovery records unimpeded.
 */
export const D2 = (s) => run(async (f) => {
  const w = makeWorld();
  const A = w.spawn(100, 1);
  const B = w.spawn(200, 2);
  await s.acquire(w, A, { nonce: 'na' });
  for (const target of NON_GRANT_PATHS) {
    const r = await s.writeOther(w, B, target, `{"by":"B"}`);
    expect(f, r?.ok && w.fs.read(target) === '{"by":"B"}', `${target}: a non-grant home write was serialized behind the grant lease (${r?.reason})`);
  }
  const bare = makeWorld();
  const C = bare.spawn(300, 3);
  const r = await s.writeOther(bare, C, NON_GRANT_PATHS[0], '{}');
  expect(f, r?.ok, 'a non-grant write required a lease with no lease in existence');
});

/**
 * R3-L10 — mixed-version safety (R3-R10): until every grant writer is lease-aware, the lease
 * holder still takes the legacy per-append lock, and never clears one it did not take.
 */
export const L10 = (s) => run(async (f) => {
  // (a) a lease-unaware legacy writer holds the append lock → the holder is refused, nothing is written through
  { const w = makeWorld(); const A = w.spawn(100, 1);
    const a = await s.acquire(w, A, { nonce: 'na' });
    const lock = appendLockOf(LEDGER);
    w.fs.createExclusive(lock, 'legacy-writer');
    const r = await s.append(w, A, a.lease, { event: 'CLAIMED' });
    expect(f, !r.ok && r.reason === 'GRANT_LEDGER_BUSY', `holder wrote while a legacy writer held the append lock (${r.ok ? 'accepted' : r.reason})`);
    expect(f, w.fs.read(lock) === 'legacy-writer', 'the legacy writer\'s append lock was removed or replaced');
    expect(f, w.fs.read(LEDGER) === null, 'the ledger changed under a legacy writer\'s lock'); }
  // (b) every holder append happens under the append lock, and releases only its own
  { const w = makeWorld(); const A = w.spawn(100, 1);
    const a = await s.acquire(w, A, { nonce: 'na' });
    for (const ledger of GRANT_LEDGERS) await s.append(w, A, a.lease, { event: 'ISSUED' }, ledger);
    expect(f, w.writes.length === GRANT_LEDGERS.length && w.writes.every((x) => x.appendLockHeld), 'an append happened without the legacy append lock held');
    expect(f, GRANT_LEDGERS.every((l) => !w.fs.exists(appendLockOf(l))), 'the holder left an append lock behind'); }
  // (c) acquiring the lease never clears an existing append lock
  { const w = makeWorld(); const A = w.spawn(100, 1);
    w.fs.createExclusive(appendLockOf(LEDGER), 'legacy-writer');
    await s.acquire(w, A, { nonce: 'na' });
    expect(f, w.fs.read(appendLockOf(LEDGER)) === 'legacy-writer', 'lease acquisition treated a legacy append lock as residue'); }
});

export const LEASE_FALSIFIERS = Object.freeze({
  'R3-L1': L1, 'R3-L2': L2, 'R3-L3': L3, 'R3-L4': L4, 'R3-L5': L5,
  'R3-L6': L6, 'R3-L7': L7, 'R3-L8': L8, 'R3-L9': L9, 'R3-L10': L10,
  'R3-D1': D1, 'R3-D2': D2,
});
