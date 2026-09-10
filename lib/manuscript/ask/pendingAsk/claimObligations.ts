/**
 * S3 · P1 — THE BEHAVIOURAL OBLIGATIONS OF A PENDING-ASK CLAIM.
 *
 *   ⭐⭐ A regression test is evidence only if the known-bad implementation
 *       FAILS it. An instrument that cannot fail when the governed behaviour is
 *       wrong has not tested that behaviour.
 *
 * ⛔ WHY THIS IS A RUNNABLE SUITE AND NOT BARE `it()` BLOCKS. Canonical has NO
 * pendingAskRef protocol at all, so these invariants cannot be proved valuable
 * by "failing against canonical" — there is no canonical positive resume
 * mechanism to replay. The deeper rule applies instead:
 *
 *   The test must fail against a known implementation of the PROHIBITED
 *   behaviour.
 *
 * So the obligations are expressed as a function over a candidate, and the
 * falsification test drives the prohibited variants through it and requires each
 * to go RED at a NAMED obligation.
 *
 * ⛔ NOTHING HERE IS THE SUBSTRATE. This module tests claimants; it is not one.
 */

import {
  claimAcquired,
  type AuthorizationActId,
  type ClaimOutcome,
  type Interleaving,
  type PendingAskClaimant,
  type PendingAskRef,
} from './claimContract';

/* ── the resume seam the ordering obligations observe ──────────────────────── */

/**
 * ⭐ THE ORDER IS THE OBLIGATION, NOT ONLY THE OUTCOME. A test asserting merely
 * that the second request got no answer would pass against an implementation
 * that crossed twice and cleaned up afterwards.
 */
export type ResumeStep = 'claim' | 'boundary' | 'may_cross' | 'load' | 'receipt';

export interface ResumeDeps {
  readonly claimant: PendingAskClaimant;
  /** Instrumented stand-in for `establishDisclosureBoundary`. */
  establishBoundary(): Promise<'may_cross' | 'refused'>;
  /** Instrumented stand-in for `loadRevisionContent`. */
  loadBody(): Promise<string | null>;
  /** Instrumented stand-in for `confirmDisclosureCrossed`. */
  confirmCrossing(): Promise<void>;
  /** Appended by each instrumented dependency, in call order. */
  readonly trace: ResumeStep[];
}

export type ResumeResult =
  | { readonly kind: 'crossed' }
  | { readonly kind: 'refused'; readonly outcome: ClaimOutcome };

export type ResumeRunner = (ref: PendingAskRef, deps: ResumeDeps) => Promise<ResumeResult>;

/* ── what a candidate must supply ──────────────────────────────────────────── */

export interface ClaimCandidate {
  /** A fresh substrate holding exactly the refs described. */
  make(seed: {
    pending: readonly { ref: PendingAskRef; memberId: string; manuscriptId: string;
                        threadId: string; readingId: string; observationKey: string }[];
    expired: readonly PendingAskRef[];
    /** When set, every `claim` reports a substrate fault. */
    faulted?: boolean;
    interleaving?: Interleaving;
  }): PendingAskClaimant;
  /** The resume composition under test. */
  resume: ResumeRunner;
}

export interface ObligationResult {
  readonly id: string;
  readonly ok: boolean;
  readonly detail: string;
}

const PENDING = {
  ref: 'pending-1', memberId: 'm-1', manuscriptId: 'w-1',
  threadId: 't-1', readingId: 'r-1', observationKey: 'o-1',
} as const;

/**
 * ⭐ ONE PHYSICAL PRESS. A transport retry reuses `ACT`; a member consciously
 * authorizing again mints something like `OTHER_ACT`. The two are the whole
 * reason `act_already_processed` exists as a separate answer.
 */
const ACT = 'act-one-physical-press-0001';
const OTHER_ACT = 'act-a-different-press-0002';

const deps = (claimant: PendingAskClaimant, opts: { boundary?: 'may_cross' | 'refused' } = {}): ResumeDeps => {
  const trace: ResumeStep[] = [];
  return {
    claimant: {
      async claim(ref, actId) { trace.push('claim'); return claimant.claim(ref, actId); },
      async recordCompleted(ref) { return claimant.recordCompleted(ref); },
    },
    async establishBoundary() { trace.push('boundary'); const r = opts.boundary ?? 'may_cross'; if (r === 'may_cross') trace.push('may_cross'); return r; },
    async loadBody() { trace.push('load'); return 'authored body characters'; },
    async confirmCrossing() { trace.push('receipt'); },
    trace,
  };
};

const ok = (id: string, detail: string): ObligationResult => ({ id, ok: true, detail });
const bad = (id: string, detail: string): ObligationResult => ({ id, ok: false, detail });

/**
 * Run every obligation against one candidate.
 *
 * ⭐ Returns results rather than asserting, so the same suite can be required to
 * PASS for a lawful claimant and to FAIL — at a named obligation — for each
 * prohibited variant.
 */
export async function runClaimObligations(c: ClaimCandidate): Promise<ObligationResult[]> {
  const out: ObligationResult[] = [];
  const seedOne = { pending: [PENDING], expired: [] as string[] };

  /* C1 · ONE ATOMIC WINNER — the decisive question. Two concurrent claims, and
     a deterministic interleaving that drives the competitor between a
     non-atomic claimant's read and its write. */
  {
    let second: Promise<ClaimOutcome> | null = null;
    /* ⭐ The guard is set BEFORE the competing call, not after it. An `async`
       claimant runs its body synchronously up to its first `await`, so a hook
       that guarded on `second` alone would still be null when the nested claim
       re-entered it — and the interleaving would recurse forever instead of
       racing once. Found by running the instrument, not by reading it. */
    let raced = false;
    const claimant = c.make({
      ...seedOne,
      interleaving: {
        betweenReadAndWrite: async () => {
          if (raced) return;
          raced = true;
          second = claimant.claim(PENDING.ref, ACT);
          await second;
        },
      },
    });
    const first = await claimant.claim(PENDING.ref, ACT);
    const other = second ? await second : await claimant.claim(PENDING.ref, ACT);
    const winners = [first, other].filter(claimAcquired).length;
    out.push(winners === 1
      ? ok('C1', 'exactly one concurrent claim acquired')
      : bad('C1', `${winners} concurrent claims acquired; exactly 1 required`));
  }

  /* C2 · A DIFFERENT ACT reaching for a spent claim. */
  {
    const claimant = c.make(seedOne);
    await claimant.claim(PENDING.ref, ACT);
    const again = await claimant.claim(PENDING.ref, OTHER_ACT);
    out.push(again.kind === 'already_consumed'
      ? ok('C2', 'a different act finds the claim already consumed')
      : bad('C2', `a different act reported '${again.kind}'`));
  }

  /* ⭐⭐ C2b · THE SAME PRESS, ARRIVING TWICE — and it must not be called a
     reuse. Same prohibition, different truth: a transport retry is not an
     attempt to spend an authorization again. An implementation that maps both
     replay classes to `already_consumed` fails HERE and nowhere else. */
  {
    const claimant = c.make(seedOne);
    await claimant.claim(PENDING.ref, ACT);
    const same = await claimant.claim(PENDING.ref, ACT);
    out.push(same.kind === 'act_already_processed'
      ? ok('C2b', 'the same act arriving twice reports act_already_processed')
      : bad('C2b', `the same act reported '${same.kind}' — a retry of one press is not a reuse`));
  }

  /* C3 · EXPIRED IS ITS OWN ANSWER — never collapsed into consumed or unknown. */
  {
    const claimant = c.make({ pending: [], expired: [PENDING.ref] });
    const o = await claimant.claim(PENDING.ref, ACT);
    out.push(o.kind === 'expired'
      ? ok('C3', 'an expired pending Ask reports expired')
      : bad('C3', `an expired pending Ask reported '${o.kind}'`));
  }

  /* C4 · UNKNOWN IS ITS OWN ANSWER. */
  {
    const claimant = c.make({ pending: [], expired: [] });
    const o = await claimant.claim('never-existed', ACT);
    out.push(o.kind === 'unknown'
      ? ok('C4', 'an absent pending Ask reports unknown')
      : bad('C4', `an absent pending Ask reported '${o.kind}'`));
  }

  /* ⭐ C5 · A SUBSTRATE FAULT IS NOT A REPLAY. A serialization failure is a
     database fact, not proof that another request consumed this Ask. */
  {
    const claimant = c.make({ ...seedOne, faulted: true });
    const o = await claimant.claim(PENDING.ref, ACT);
    out.push(o.kind === 'unavailable'
      ? ok('C5', 'a substrate fault reports unavailable')
      : bad('C5', `a substrate fault reported '${o.kind}' — a fault must never masquerade as a replay`));
  }

  /* C6 · NO CONSUMED → PENDING. Consumed then never completed still refuses. */
  {
    const claimant = c.make(seedOne);
    await claimant.claim(PENDING.ref, ACT);
    const third = await claimant.claim(PENDING.ref, ACT);
    out.push(!claimAcquired(third)
      ? ok('C6', 'a consumed-but-incomplete Ask is never re-acquired')
      : bad('C6', 'a consumed Ask returned to pending — a fresh member act is required'));
  }

  /* C7 · LOST-RESPONSE RECOVERY — completed and incomplete stay distinguishable. */
  {
    const a = c.make(seedOne);
    await a.claim(PENDING.ref, ACT);
    /* ⭐ The lost-response case IS the same act retrying, so the truthful kind
       here is `act_already_processed`; what must survive is the COMPLETION,
       which is what tells the member whether their answer exists. */
    const beforeCompletion = await a.claim(PENDING.ref, ACT);
    await a.recordCompleted(PENDING.ref);
    const afterCompletion = await a.claim(PENDING.ref, ACT);
    const spent = (o: ClaimOutcome) => o.kind === 'act_already_processed' || o.kind === 'already_consumed';
    const good = spent(beforeCompletion) && (beforeCompletion as { completion?: string }).completion === 'incomplete'
      && spent(afterCompletion) && (afterCompletion as { completion?: string }).completion === 'completed';
    out.push(good
      ? ok('C7', 'completed and incomplete consumption are distinguishable')
      : bad('C7', 'a retry cannot tell a completed crossing from an incomplete one'));
  }

  /* ⭐ C8 · NO PERMISSION IN THE OUTCOME. A claim yields identity, never a grant. */
  {
    const claimant = c.make(seedOne);
    const o = await claimant.claim(PENDING.ref, ACT);
    const keys = JSON.stringify(o).toLowerCase();
    const leaked = ['maycross', 'may_cross', 'disclosureid', 'receiptid', 'authorized',
      'permission', 'sectionid', 'sectionref', 'scopekind', 'prose', 'passage']
      .filter((k) => keys.includes(k));
    out.push(leaked.length === 0
      ? ok('C8', 'the claim outcome carries identity only')
      : bad('C8', `the claim outcome carries refused field(s): ${leaked.join(', ')}`));
  }

  /* ⭐⭐ O1 · NO BOUNDARY BEFORE CLAIM. Constitutional ordering, not bookkeeping. */
  {
    const claimant = c.make(seedOne);
    const d = deps(claimant);
    await c.resume(PENDING.ref, d);
    const iClaim = d.trace.indexOf('claim');
    const iBoundary = d.trace.indexOf('boundary');
    out.push(iClaim >= 0 && (iBoundary === -1 || iClaim < iBoundary)
      ? ok('O1', `claim precedes boundary — ${d.trace.join(' → ')}`)
      : bad('O1', `boundary reached before the claim — ${d.trace.join(' → ')}`));
  }

  /* ⭐⭐ O2 · A LOSER REACHES NOTHING. Four operations stay unreachable. */
  {
    const claimant = c.make(seedOne);
    await claimant.claim(PENDING.ref, ACT);            // the winner, elsewhere
    const d = deps(claimant);
    const r = await c.resume(PENDING.ref, d);     // the replay
    const forbidden = (['boundary', 'may_cross', 'load', 'receipt'] as ResumeStep[])
      .filter((s) => d.trace.includes(s));
    out.push(r.kind === 'refused' && forbidden.length === 0
      ? ok('O2', `a losing resume reached nothing — ${d.trace.join(' → ')}`)
      : bad('O2', `a losing resume reached ${forbidden.join(', ') || 'a crossing'} — ${d.trace.join(' → ')}`));
  }

  return out;
}

export const failedObligations = (rs: readonly ObligationResult[]): string[] =>
  rs.filter((r) => !r.ok).map((r) => r.id);
