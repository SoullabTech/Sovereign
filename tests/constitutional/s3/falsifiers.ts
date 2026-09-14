/**
 * S3 CLASS-B FALSIFIERS — S3-F1…S3-F7 · S3-F9 · S3-F10.
 *
 * Authority: S3-FALSIFIERS-01_SPECIFICATION_2026-09-13.md · S3-DESIGN-01 §15.
 *
 * ⛔ S3-F8 IS NOT HERE. It is Class A, it is SPENT, and its evidence is the
 * disposable-shadow witness at 833ec87f — not a unit assertion.
 *
 * ⭐⭐ THESE ARE WRITTEN AGAINST THE CONTRACT, NEVER AGAINST AN IMPLEMENTATION.
 * That is the whole discipline: a suite authored after the thing it guards can
 * only confirm what was built.
 *
 * ⛔ NOTHING HERE BUILDS PENDING-ASK MACHINERY. Every falsifier takes a
 * `CandidateFactory` and asserts on observations alone.
 *
 * B-iii is the gate this file exists to pass: each named defeat candidate, once
 * built, must DIE here. ⛔ A survivor repairs THE SUITE, never the candidate.
 */

import {
  type CandidateFactory, type ResumeOutcome, type SectionId,
  actRef, sectionId, requestId, memberId, workId,
} from './transitionContract';

export interface Falsifier {
  readonly id: string;
  readonly law: string;
  /** The plausible wrong implementation this exists to kill. */
  readonly defeats: string;
  run(make: CandidateFactory): Promise<void>;
}

class Violation extends Error {}
const fail = (id: string, msg: string): never => { throw new Violation(`${id}: ${msg}`); };
const S = (...ids: string[]) => ids.map(sectionId);
const same = (a: readonly SectionId[], b: readonly SectionId[]) =>
  a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);

const ACT = { member: memberId('m1'), work: workId('w1') };
const TEXT = 'Help me revise this section.';

/** One paused act requiring exactly `req`, with `text` as inert payload. */
async function paused(make: CandidateFactory, req: readonly SectionId[], text = TEXT) {
  const c = await make();
  const ref = await c.pause({ ...ACT, requiredSections: req, authoredText: text });
  return { c, ref };
}

const executed = (o: ResumeOutcome) => o.kind === 'executed';

// ─────────────────────────────────────────────────────────────────────────────

export const S3_F1: Falsifier = {
  id: 'S3-F1',
  law: 'one member act is consumed at most once',
  defeats: 'read-then-write precheck with no row lock (the 093379e8d shape)',
  async run(make) {
    const { c, ref } = await paused(make, S('s1'));
    const one = { ref, authorizes: S('s1'), authoredText: TEXT };
    const [a, b] = await Promise.all([
      c.resume({ ...one, request: requestId('r1') }),
      c.resume({ ...one, request: requestId('r2') }),
    ]);
    const winners = [a, b].filter(executed).length;
    if (winners !== 1) fail('S3-F1', `exactly one invocation may execute; ${winners} did`);
    const led = await c.observe();
    if (led.crossings.length !== 1) fail('S3-F1', `one crossing; saw ${led.crossings.length}`);
  },
};

export const S3_F2: Falsifier = {
  id: 'S3-F2',
  law: 'a replay must never mint another boundary',
  defeats: 'idempotency keyed on the serving request id',
  async run(make) {
    const { c, ref } = await paused(make, S('s1'));
    const first = await c.resume({ ref, authorizes: S('s1'), request: requestId('r1'), authoredText: TEXT });
    if (!executed(first)) fail('S3-F2', 'the first invocation must execute');
    const before = await c.observe();
    // A NEW request id — the whole point.
    const replay = await c.resume({ ref, authorizes: S('s1'), request: requestId('r2'), authoredText: TEXT });
    if (executed(replay)) fail('S3-F2', 'a replay under a new request id executed again');
    const after = await c.observe();
    if (after.crossings.length !== before.crossings.length)
      fail('S3-F2', 'the replay added a crossing');
    if (after.receipts.length !== before.receipts.length)
      fail('S3-F2', 'the replay added a receipt');
  },
};

export const S3_F3: Falsifier = {
  id: 'S3-F3',
  law: 'identity is the act, never the characters',
  defeats: 'prose equivalence, i.e. isHeldRetry extended into consumption',
  async run(make) {
    const c = await make();
    // Two DISTINCT acts carrying byte-identical authored prose.
    const a = await c.pause({ ...ACT, requiredSections: S('s1'), authoredText: TEXT });
    const b = await c.pause({ ...ACT, requiredSections: S('s1'), authoredText: TEXT });
    if (a === b) fail('S3-F3', 'two distinct member acts collapsed into one identity');
    const ra = await c.resume({ ref: a, authorizes: S('s1'), request: requestId('r1'), authoredText: TEXT });
    const rb = await c.resume({ ref: b, authorizes: S('s1'), request: requestId('r2'), authoredText: TEXT });
    if (!executed(ra) || !executed(rb))
      fail('S3-F3', 'both acts must execute independently; identical prose is not one act');
  },
};

export const S3_F4: Falsifier = {
  id: 'S3-F4',
  law: 'identity is the act, never the characters — from the other side',
  defeats: 'prose equivalence, again: mutated text manufacturing a new identity',
  async run(make) {
    const { c, ref } = await paused(make, S('s1'));
    const first = await c.resume({ ref, authorizes: S('s1'), request: requestId('r1'), authoredText: TEXT });
    if (!executed(first)) fail('S3-F4', 'the first invocation must execute');
    const before = await c.observe();
    const edited = await c.resume({
      ref, authorizes: S('s1'), request: requestId('r2'),
      authoredText: '  Help me   REVISE this section.  ',
    });
    if (executed(edited)) fail('S3-F4', 'editing the prose renewed authority');
    const after = await c.observe();
    if (after.crossings.length !== before.crossings.length)
      fail('S3-F4', 'a reworded replay added a crossing');
  },
};

export const S3_F5: Falsifier = {
  id: 'S3-F5',
  law: 'consumption 1:<=1 · consumption -> section receipts 1:N (Ruling 5)',
  defeats: 'consuming once per section, or one receipt with a plural scope',
  async run(make) {
    const { c, ref } = await paused(make, S('s1', 's2'));
    const out = await c.resume({ ref, authorizes: S('s1', 's2'), request: requestId('r1'), authoredText: TEXT });
    if (out.kind !== 'executed') return fail('S3-F5', 'a complete authorization must execute');
    if (!same(out.receipts, S('s1', 's2')))
      fail('S3-F5', 'one receipt per authorized section, singular each');
    if (out.receipts.length !== 2) fail('S3-F5', 'two authorized sections must mint two receipts');
    const led = await c.observe();
    if (led.completions.length !== 1)
      fail('S3-F5', `one act is one consumption; saw ${led.completions.length} completions`);
  },
};

export const S3_F6: Falsifier = {
  id: 'S3-F6',
  law: 'a completed outcome is recoverable and never authoritative (Ruling 6)',
  defeats: 're-execution, and the subtler wrong fix: a FRESH EQUIVALENT answer',
  async run(make) {
    const { c, ref } = await paused(make, S('s1'));
    const first = await c.resume({ ref, authorizes: S('s1'), request: requestId('r1'), authoredText: TEXT });
    if (first.kind !== 'executed') return fail('S3-F6', 'the first invocation must execute');
    const before = await c.observe();
    // The response was lost. The member's client retries.
    const retry = await c.resume({ ref, authorizes: S('s1'), request: requestId('r2'), authoredText: TEXT });
    if (retry.kind !== 'recovered')
      return fail('S3-F6', `a lost response must recover, not ${retry.kind}`);
    // ⭐ COMPLETION IDENTITY, never answer text.
    if (retry.completion !== first.completion)
      fail('S3-F6', 'recovery returned a different completion identity — a regenerated outcome');
    const after = await c.observe();
    if (after.crossings.length !== before.crossings.length)
      fail('S3-F6', 'recovery performed a second crossing');
  },
};

export const S3_F7: Falsifier = {
  id: 'S3-F7',
  law: 'incompletion is not resumable BY REPLAY OF THE MEMBER ACT',
  defeats: 'reading absence of completion as "permission remains"',
  async run(make) {
    const { c, ref } = await paused(make, S('s1'));
    c.failAfterClaimOnce();
    try {
      await c.resume({ ref, authorizes: S('s1'), request: requestId('r1'), authoredText: TEXT });
    } catch { /* the process died; that IS the fixture */ }
    const before = await c.observe();
    if (before.crossings.length !== 0) fail('S3-F7', 'the fixture must die before any crossing');
    const retry = await c.resume({ ref, authorizes: S('s1'), request: requestId('r2'), authoredText: TEXT });
    if (executed(retry)) fail('S3-F7', 'a replay resumed a claimed-but-incomplete act');
    if (retry.kind !== 'interrupted' && retry.kind !== 'refused')
      fail('S3-F7', `expected interrupted or refused; saw ${retry.kind}`);
    const after = await c.observe();
    if (after.crossings.length !== 0) fail('S3-F7', 'the replay crossed');
  },
};

export const S3_F9: Falsifier = {
  id: 'S3-F9',
  law: 're-derive the required set server-side; a client claim never widens W2',
  defeats: 'client-carried authorization',
  async run(make) {
    // The server derives {s1}. The client claims {s1, s2} — wider.
    const a = await paused(make, S('s1'));
    const wide = await a.c.resume({
      ref: a.ref, authorizes: S('s1', 's2'), request: requestId('r1'), authoredText: TEXT,
    });
    if (wide.kind === 'executed') {
      if (!same(wide.crossings, S('s1')))
        fail('S3-F9', 'a client claim widened what crossed into W2');
      if (!same(wide.receipts, S('s1')))
        fail('S3-F9', 'a client claim widened the receipts minted');
    } else if (wide.kind !== 'refused') {
      fail('S3-F9', `a wider claim may execute server-narrowed or refuse; saw ${wide.kind}`);
    }
    // Narrower than required must refuse, and must say which refusal.
    const b = await paused(make, S('s1', 's2'));
    const narrow = await b.c.resume({
      ref: b.ref, authorizes: S('s1'), request: requestId('r2'), authoredText: TEXT,
    });
    if (narrow.kind !== 'refused' || narrow.reason !== 'body_scope_incomplete')
      fail('S3-F9', 'an incomplete scope must refuse as body_scope_incomplete');
    if ((await b.c.observe()).crossings.length !== 0)
      fail('S3-F9', 'an incomplete scope crossed anyway');
  },
};

export const S3_F10: Falsifier = {
  id: 'S3-F10',
  law: 'nothing already existing may authorize another section or another act',
  defeats: 'the prohibited durable shape { ref, sectionId, authorized: true }',
  async run(make) {
    const c = await make();
    const a = await c.pause({ ...ACT, requiredSections: S('s1'), authoredText: TEXT });
    const b = await c.pause({ ...ACT, requiredSections: S('s2'), authoredText: 'another question' });
    const first = await c.resume({ ref: a, authorizes: S('s1'), request: requestId('r1'), authoredText: TEXT });
    if (!executed(first)) fail('S3-F10', 'the first invocation must execute');
    const before = await c.observe();
    // A's completed authority must not reach B's section...
    const cross = await c.resume({ ref: a, authorizes: S('s2'), request: requestId('r2'), authoredText: TEXT });
    if (executed(cross)) fail('S3-F10', "a completed act authorized another act's section");
    // ...and a forged reference authorizes nothing.
    const forged = await c.resume({
      ref: actRef('not-an-act'), authorizes: S('s1'), request: requestId('r3'), authoredText: TEXT,
    });
    if (forged.kind !== 'refused' || forged.reason !== 'unknown_act')
      fail('S3-F10', 'an unknown reference must refuse as unknown_act');
    const after = await c.observe();
    if (after.crossings.length !== before.crossings.length)
      fail('S3-F10', 'authority leaked across acts or sections');
    if (b === a) fail('S3-F10', 'two acts shared one identity');
  },
};

export const CLASS_B: readonly Falsifier[] = [
  S3_F1, S3_F2, S3_F3, S3_F4, S3_F5, S3_F6, S3_F7, S3_F9, S3_F10,
];

/**
 * Run the suite against one candidate.
 *
 * ⭐ In B-iii this is pointed at each DEFEAT CANDIDATE, and a candidate that
 * does not fail is the suite's defect.
 */
export async function runClassB(make: CandidateFactory): Promise<
  { id: string; passed: boolean; error?: string }[]
> {
  const out: { id: string; passed: boolean; error?: string }[] = [];
  for (const f of CLASS_B) {
    try { await f.run(make); out.push({ id: f.id, passed: true }); }
    catch (e) { out.push({ id: f.id, passed: false, error: e instanceof Error ? e.message : String(e) }); }
  }
  return out;
}
