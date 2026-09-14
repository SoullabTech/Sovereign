/**
 * S3 CLASS-B DEFEAT CANDIDATES — eight disposable WRONG machines.
 *
 * Authority: founder ruling 2026-09-13 opening B-ii.
 *
 * ⭐ THE RULE THIS FILE OBEYS: each candidate is the SMALLEST COMPETENT WRONG
 * MACHINE that embodies its named error. ⛔ No candidate carries an unrelated
 * defect to help the suite go red. Each is plausibly shippable except for the
 * exact constitutional error under examination.
 *
 * ⛔⛔ THE CORE IS A TEST DOUBLE, NOT THE IMPLEMENTATION. It holds state in a
 * Map: no table, no transaction, no lock, no durability, no schema. It exists
 * so DISCRIMINATION is measurable — a candidate must differ from something
 * otherwise correct, or "unrelated falsifiers pass" is meaningless.
 * ⛔ It is evidence, never a seed: B-iv must not be derived from it, or the
 * implementation's storage decisions would be smuggled in from a double that
 * was never designed to make them.
 *
 * ⚠️ MODELLING LIMIT, STATED NOT HIDDEN. JavaScript is single-threaded, so a
 * read-then-write race is modelled by placing an `await` between the read and
 * the write — which is exactly what a DB round-trip does. S3-F1 passing here is
 * therefore NECESSARY AND NOT SUFFICIENT for a real candidate: real atomicity
 * must be proved against a database, in B-iv's own witness.
 */

import type {
  ActRef, CandidateFactory, CompletionId, CrossingLedger, PausedAsk,
  ResumeOutcome, ResumeRequest, S3Candidate, SectionId,
} from './transitionContract';

const tick = () => new Promise<void>((r) => setTimeout(r, 0));
const covers = (claim: readonly SectionId[], required: readonly SectionId[]) =>
  required.every((s) => claim.includes(s));

interface Act {
  readonly required: readonly SectionId[];
  readonly text: string;
  claimed: boolean;
  completion: CompletionId | null;
}

/** Which behaviours a candidate replaces. Everything unnamed stays conforming. */
interface Deviation {
  /** Identity: how `pause` issues a reference, and how `resume` resolves one. */
  readonly identity?: 'prose';
  /** The claim step. */
  readonly claim?: 'read_then_write' | 'per_section';
  /** Replay handling. */
  readonly replay?: 'request_keyed' | 'regenerate' | 'incomplete_resumable' | 'reusable_authority';
  /** What determines W2. */
  readonly scope?: 'client';
}

class Machine implements S3Candidate {
  private readonly acts = new Map<string, Act>();
  private readonly seenRequests = new Set<string>();
  private readonly ledger = { crossings: [] as SectionId[], receipts: [] as SectionId[], completions: [] as CompletionId[] };
  private dieNext = false;
  private n = 0;

  constructor(private readonly d: Deviation = {}) {}

  async pause(ask: PausedAsk): Promise<ActRef> {
    if (this.d.identity === 'prose') {
      for (const [ref, a] of this.acts) if (a.text === ask.authoredText) return ref as ActRef;
    }
    const ref = `act-${++this.n}`;
    this.acts.set(ref, { required: ask.requiredSections, text: ask.authoredText, claimed: false, completion: null });
    return ref as ActRef;
  }

  failAfterClaimOnce(): void { this.dieNext = true; }
  async observe(): Promise<CrossingLedger> {
    return { crossings: [...this.ledger.crossings], receipts: [...this.ledger.receipts], completions: [...this.ledger.completions] };
  }

  private resolve(req: ResumeRequest): Act | undefined {
    if (this.d.identity === 'prose') {
      for (const a of this.acts.values()) if (a.text === req.authoredText) return a;
      // A prose-identified machine treats unseen characters as a NEW act.
      const a: Act = { required: [...req.authorizes], text: req.authoredText, claimed: false, completion: null };
      this.acts.set(`act-${++this.n}`, a);
      return a;
    }
    return this.acts.get(req.ref);
  }

  async resume(req: ResumeRequest): Promise<ResumeOutcome> {
    const act = this.resolve(req);
    if (!act) return { kind: 'refused', reason: 'unknown_act' };

    // DC-8 — a completed act's authority is reusable for a DIFFERENT section set.
    const reusing = this.d.replay === 'reusable_authority'
      && act.completion !== null && !covers(req.authorizes, act.required);
    if (!reusing && !covers(req.authorizes, act.required))
      return { kind: 'refused', reason: 'body_scope_incomplete' };

    // DC-2 — idempotency keyed on the SERVING REQUEST, not the member act.
    if (this.d.replay === 'request_keyed') {
      if (this.seenRequests.has(req.request) && act.completion)
        return { kind: 'recovered', completion: act.completion };
      this.seenRequests.add(req.request);
    } else if (act.completion !== null && !reusing) {
      // DC-5 — regenerate the completion identity instead of recovering it.
      if (this.d.replay === 'regenerate')
        return { kind: 'recovered', completion: `c-${++this.n}` as CompletionId };
      return { kind: 'recovered', completion: act.completion };
    }

    if (act.claimed && act.completion === null) {
      // DC-6 — absence of completion read as "permission remains".
      if (this.d.replay !== 'incomplete_resumable') return { kind: 'interrupted' };
    }

    // THE CLAIM.
    if (this.d.claim === 'read_then_write') {
      if (act.claimed && act.completion === null && this.d.replay !== 'incomplete_resumable')
        return { kind: 'interrupted' };
      await tick();                       // ⚠️ the round trip the real defect has
      act.claimed = true;
    } else {
      act.claimed = true;                 // single atomic step — no await inside
    }

    if (this.dieNext) { this.dieNext = false; throw new Error('process died after claim'); }

    // DC-7 — the CLIENT's set determines W2.
    const crossed = this.d.scope === 'client' ? [...req.authorizes] : [...act.required];
    this.ledger.crossings.push(...crossed);
    this.ledger.receipts.push(...crossed);

    // DC-4 — one consumption per section rather than one per member act.
    const completions: CompletionId[] = this.d.claim === 'per_section'
      ? crossed.map(() => `c-${++this.n}` as CompletionId)
      : [`c-${++this.n}` as CompletionId];
    this.ledger.completions.push(...completions);
    act.completion = completions[0]!;

    return { kind: 'executed', completion: completions[0]!, crossings: crossed, receipts: crossed };
  }
}

export interface Candidate {
  readonly id: string;
  readonly error: string;
  /** The falsifier(s) this candidate is BUILT to be killed by. */
  readonly intendedKills: readonly string[];
  /**
   * ⭐ CLASSIFIED collateral: a falsifier outside the intended set that dies as
   * an IRREDUCIBLE CONSEQUENCE of the named error, with the reason stated.
   *
   * ⛔ This is not a way to wave away sloppiness. A reason must name why
   * narrowing the candidate further would stop it being the error it models.
   * UNCLASSIFIED collateral is what "repair candidate isolation" applies to.
   */
  readonly expectedCollateral?: readonly { readonly id: string; readonly because: string }[];
  readonly make: CandidateFactory;
}

const machine = (d: Deviation): CandidateFactory => async () => new Machine(d);

/** ⭐ The reference point. Not a candidate — the thing candidates deviate from. */
export const CONFORMING: Candidate = {
  id: 'CONFORMING', error: '— (test double, not an implementation)',
  intendedKills: [], make: machine({}),
};

export const CANDIDATES: readonly Candidate[] = [
  { id: 'DC-1', error: 'read-before-write claim', intendedKills: ['S3-F1'], make: machine({ claim: 'read_then_write' }) },
  {
    id: 'DC-2', error: 'request-keyed idempotency', intendedKills: ['S3-F2'],
    /* ⭐⭐ The most destructive of the eight, and necessarily so. */
    expectedCollateral: [
      { id: 'S3-F1', because: 'if identity IS the request, two concurrent requests are two identities — act-level state is never consulted, so both claim' },
      { id: 'S3-F4', because: 'no act-level completion is consulted, so a reworded replay under a new request re-executes' },
      { id: 'S3-F6', because: 'a lost-response retry carries a new request id, so it is a new identity rather than a recovery' },
    ],
    make: machine({ replay: 'request_keyed' }),
  },
  {
    id: 'DC-3', error: 'prose-derived identity', intendedKills: ['S3-F3', 'S3-F4'],
    expectedCollateral: [
      { id: 'S3-F10', because: 'an unknown REFERENCE cannot be refused by a machine in which the reference is not what identifies' },
    ],
    make: machine({ identity: 'prose' }),
  },
  { id: 'DC-4', error: 'per-section consumption', intendedKills: ['S3-F5'], make: machine({ claim: 'per_section' }) },
  { id: 'DC-5', error: 'regenerate on lost response', intendedKills: ['S3-F6'], make: machine({ replay: 'regenerate' }) },
  { id: 'DC-6', error: 'incomplete means resumable', intendedKills: ['S3-F7'], make: machine({ replay: 'incomplete_resumable' }) },
  { id: 'DC-7', error: 'client-carried scope authority', intendedKills: ['S3-F9'], make: machine({ scope: 'client' }) },
  { id: 'DC-8', error: 'durable reusable authority', intendedKills: ['S3-F10'], make: machine({ replay: 'reusable_authority' }) },
];
