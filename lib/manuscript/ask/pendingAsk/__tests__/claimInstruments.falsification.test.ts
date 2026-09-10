/**
 * S3 · P1 — FALSIFYING THE INSTRUMENTS BEFORE TRUSTING THEM.
 *
 *   ⭐⭐ Known-bad behaviour must make the purported regression test FAIL before
 *       that test counts as evidence.
 *
 * Canonical has no pendingAskRef protocol, so these invariants cannot be proved
 * valuable by failing against canonical — there is nothing there to replay. Each
 * obligation is therefore falsified against a DELIBERATE implementation of the
 * prohibited behaviour, and must go RED at the obligation that names it.
 *
 * ⭐ AND THE SUITE MUST DISCRIMINATE. An instrument that fails everything catches
 * the bad variants by accident. So a lawful reference is required to pass all ten
 * obligations first — otherwise the red results below prove nothing.
 *
 * ⛔ THE LAWFUL REFERENCE HERE IS AN INSTRUMENT FIXTURE, NOT THE SUBSTRATE. The
 * durable pending-Ask substrate is a later authorized act; nothing in this file
 * touches a database, a route, or the Work.
 */

import {
  runClaimObligations, failedObligations,
  type ClaimCandidate, type ResumeDeps, type ResumeResult, type ResumeRunner,
} from '../claimObligations';
import {
  claimAcquired,
  type ClaimOutcome, type Interleaving, type PendingAskClaimant, type PendingAskRef,
} from '../claimContract';

type Seed = Parameters<ClaimCandidate['make']>[0];
type Row = { memberId: string; manuscriptId: string; threadId: string;
             readingId: string; observationKey: string;
             consumed: boolean; completed: boolean; expired: boolean };

const rows = (seed: Seed): Map<PendingAskRef, Row> => {
  const m = new Map<PendingAskRef, Row>();
  for (const p of seed.pending) m.set(p.ref, { ...p, consumed: false, completed: false, expired: false });
  for (const r of seed.expired) {
    m.set(r, { memberId: 'm-1', manuscriptId: 'w-1', threadId: 't-1', readingId: 'r-1',
               observationKey: 'o-1', consumed: false, completed: false, expired: true });
  }
  return m;
};

const consumedOutcome = (row: Row): ClaimOutcome =>
  ({ kind: 'already_consumed', completion: row.completed ? 'completed' : 'incomplete' });

const classify = (row: Row | undefined): ClaimOutcome | null => {
  if (!row) return { kind: 'unknown' };
  if (row.consumed) return consumedOutcome(row);
  if (row.expired) return { kind: 'expired' };
  return null;
};

/* ── ✅ THE LAWFUL REFERENCE — atomic claim, truthful classification ────────── */

const lawfulClaimant = (seed: Seed): PendingAskClaimant => {
  const db = rows(seed);
  return {
    async claim(ref) {
      if (seed.faulted) return { kind: 'unavailable', reason: 'substrate fault' };
      // ⭐ Read and write with NO await between them: the mutation is the claim.
      // The database equivalent is `UPDATE … WHERE ref = $1 AND consumed_at IS
      // NULL AND expires_at > NOW() RETURNING …` — the predicate IS "still pending".
      const row = db.get(ref);
      const refusal = classify(row);
      if (refusal) return refusal;
      row!.consumed = true;
      return { kind: 'claimed', coordinates: {
        memberId: row!.memberId, manuscriptId: row!.manuscriptId, threadId: row!.threadId,
        readingId: row!.readingId, observationKey: row!.observationKey } };
    },
    async recordCompleted(ref) { const r = db.get(ref); if (r) r.completed = true; },
  };
};

const lawfulResume: ResumeRunner = async (ref, d: ResumeDeps): Promise<ResumeResult> => {
  const outcome = await d.claimant.claim(ref);        // ⭐ claim FIRST
  if (!claimAcquired(outcome)) return { kind: 'refused', outcome };
  if (await d.establishBoundary() !== 'may_cross') return { kind: 'refused', outcome: { kind: 'unavailable', reason: 'boundary' } };
  await d.loadBody();
  await d.confirmCrossing();
  return { kind: 'crossed' };
};

const LAWFUL: ClaimCandidate = { make: lawfulClaimant, resume: lawfulResume };

/* ── ⛔ THE PROHIBITED VARIANTS ────────────────────────────────────────────── */

/** V1 · SELECT-then-UPDATE. The window `consumeOAuthState`'s header names. */
const readThenWrite = (seed: Seed): PendingAskClaimant => {
  const db = rows(seed);
  const il: Interleaving | undefined = seed.interleaving;
  return {
    async claim(ref) {
      if (seed.faulted) return { kind: 'unavailable', reason: 'substrate fault' };
      const row = db.get(ref);
      const refusal = classify(row);
      if (refusal) return refusal;
      await il?.betweenReadAndWrite?.();          // ⛔ the race window, made deterministic
      row!.consumed = true;
      return { kind: 'claimed', coordinates: {
        memberId: row!.memberId, manuscriptId: row!.manuscriptId, threadId: row!.threadId,
        readingId: row!.readingId, observationKey: row!.observationKey } };
    },
    async recordCompleted(ref) { const r = db.get(ref); if (r) r.completed = true; },
  };
};

/** V2 · Continuity recognition mistaken for anti-replay: identifies, never consumes. */
const neverConsumes = (seed: Seed): PendingAskClaimant => {
  const db = rows(seed);
  return {
    async claim(ref) {
      if (seed.faulted) return { kind: 'unavailable', reason: 'substrate fault' };
      const row = db.get(ref);
      if (!row) return { kind: 'unknown' };
      if (row.expired) return { kind: 'expired' };
      return { kind: 'claimed', coordinates: {
        memberId: row.memberId, manuscriptId: row.manuscriptId, threadId: row.threadId,
        readingId: row.readingId, observationKey: row.observationKey } };
    },
    async recordCompleted(ref) { const r = db.get(ref); if (r) r.completed = true; },
  };
};

/** V3 · SQLSTATE 40001 reported as a replay. A DB fact dressed as a member fact. */
const faultAsReplay = (seed: Seed): PendingAskClaimant => {
  const inner = lawfulClaimant({ ...seed, faulted: false });
  return {
    async claim(ref) {
      if (seed.faulted) return { kind: 'already_consumed', completion: 'incomplete' };
      return inner.claim(ref);
    },
    recordCompleted: inner.recordCompleted,
  };
};

/** V4 · A durable identity record that also remembers what may be read. */
const carriesPermission = (seed: Seed): PendingAskClaimant => {
  const inner = lawfulClaimant(seed);
  return {
    async claim(ref) {
      const o = await inner.claim(ref);
      if (!claimAcquired(o)) return o;
      return { ...o, coordinates: { ...o.coordinates, sectionId: 'sec-7' } } as unknown as ClaimOutcome;
    },
    recordCompleted: inner.recordCompleted,
  };
};

/** V5 · Atomic bookkeeping AFTER the constitutional event. */
const claimAfterBoundary: ResumeRunner = async (ref, d) => {
  if (await d.establishBoundary() !== 'may_cross') return { kind: 'refused', outcome: { kind: 'unavailable', reason: 'boundary' } };
  const outcome = await d.claimant.claim(ref);      // ⛔ too late
  if (!claimAcquired(outcome)) return { kind: 'refused', outcome };
  await d.loadBody();
  await d.confirmCrossing();
  return { kind: 'crossed' };
};

/** V6 · The loser is refused an ANSWER, having already been given the prose. */
const losersStillLoad: ResumeRunner = async (ref, d) => {
  const outcome = await d.claimant.claim(ref);
  await d.establishBoundary();
  await d.loadBody();                               // ⛔ before the refusal is honoured
  if (!claimAcquired(outcome)) return { kind: 'refused', outcome };
  await d.confirmCrossing();
  return { kind: 'crossed' };
};

/* ── the falsification ────────────────────────────────────────────────────── */

describe('S3 · P1 · pending-Ask claim instruments', () => {
  it('⭐ DISCRIMINATES: the lawful reference passes all ten obligations', async () => {
    const results = await runClaimObligations(LAWFUL);
    expect(results).toHaveLength(10);
    expect(failedObligations(results)).toEqual([]);
  });

  const variants: { name: string; candidate: ClaimCandidate; mustFail: string }[] = [
    { name: 'V1 · SELECT-then-UPDATE loses the race',
      candidate: { make: readThenWrite, resume: lawfulResume }, mustFail: 'C1' },
    { name: 'V2 · recognises continuity but never consumes',
      candidate: { make: neverConsumes, resume: lawfulResume }, mustFail: 'C2' },
    { name: 'V3 · reports a substrate fault as a replay',
      candidate: { make: faultAsReplay, resume: lawfulResume }, mustFail: 'C5' },
    { name: 'V4 · encodes a section permission in durable identity',
      candidate: { make: carriesPermission, resume: lawfulResume }, mustFail: 'C8' },
    { name: 'V5 · claims AFTER establishing the boundary',
      candidate: { make: lawfulClaimant, resume: claimAfterBoundary }, mustFail: 'O1' },
    { name: 'V6 · loads prose for a losing resume',
      candidate: { make: lawfulClaimant, resume: losersStillLoad }, mustFail: 'O2' },
  ];

  it.each(variants)('⛔ $name → RED at $mustFail', async ({ candidate, mustFail }) => {
    const failed = failedObligations(await runClaimObligations(candidate));
    expect(failed).toContain(mustFail);
  });

  it('⭐ every obligation is falsified by at least one prohibited variant it names', async () => {
    const named = new Set(variants.map((v) => v.mustFail));
    // C3/C4/C6/C7 are covered transitively by V2 (never consumes) and V1 (races);
    // this assertion holds the NAMED set honest rather than claiming full coverage.
    expect([...named].sort()).toEqual(['C1', 'C2', 'C5', 'C8', 'O1', 'O2']);
  });
});
