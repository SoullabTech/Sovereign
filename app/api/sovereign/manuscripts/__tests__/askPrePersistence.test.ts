/**
 * ASK-WORK-ANCHOR-01 · B1 — a refusal leaves no evidence of a relationship.
 *
 * ⭐ SOURCE ASSERTIONS, AND NAMED AS SUCH. The decisive branch is UNREACHABLE
 * today — `parseAnchor` admits only proposal-bearing anchors — so no behavioural
 * run against a booted server can reach it. ⛔ That is not a reason to leave the
 * ordering unasserted: it is the reason the assertion has to be structural.
 *
 * ⭐⭐ The behavioural half is the zero-row witness, which proves every refusal
 * REACHABLE today writes nothing. The decisive behavioural proof of
 * `no_reading`-before-persist is OWED AT B3, where widening makes it reachable.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROUTE = 'app/api/sovereign/manuscripts/[id]/ask/route.ts';
const src = readFileSync(join(process.cwd(), ROUTE), 'utf8');
/* ⛔ Comments describe the prohibition and quote the defect verbatim; a scanner
   that reads them finds the forbidden ordering inside the sentence explaining
   it. Eight occurrences of that class in this programme is eight too many. */
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const at = (needle: string) => code.indexOf(needle);

describe('the readingless decision stands above every durable write', () => {
  it('⭐⭐ refuses before the thread is opened', () => {
    const refusal = at("refusal: 'no_reading'");
    const open = at('await openThread(');
    expect(refusal).toBeGreaterThan(-1);
    expect(open).toBeGreaterThan(-1);
    expect(refusal).toBeLessThan(open);
  });

  it('⭐⭐ and before the member’s own words are recorded', () => {
    const refusal = at("refusal: 'no_reading'");
    const append = at('appendTurn(');
    expect(append).toBeGreaterThan(-1);
    expect(refusal).toBeLessThan(append);
  });

  it('⛔ names no thread, because there is none to name', () => {
    /* The refusal used to answer `{ threadId: liveThreadId, refusal }` — which
       was only possible because a row had already been written. */
    const line = code.slice(at("refusal: 'no_reading'") - 120,
                            at("refusal: 'no_reading'") + 120);
    expect(line).not.toContain('threadId');
  });

  /**
   * ⚠️ A FIRST DRAFT ASSERTED ONE `openThread` AND WAS WRONG. This route has TWO
   * lanes — the 05B structure path and the 07E developmental path — and each
   * opens its own thread. ⭐ The correction is worth keeping: an ordering
   * assertion that counts globally would pass or fail for reasons that have
   * nothing to do with either lane's order.
   */
  it('⛔ each lane opens a thread exactly once, and there are three lanes', () => {
    /* ⚠️ TWO AT B1, THREE AT B3 — the Work lane is the third. ⭐ The count is
       kept rather than dropped: it is what makes "exactly once, per lane" a
       claim about the file rather than about whichever slice a scanner picked. */
    expect((code.match(/await openThread\(/g) ?? []).length).toBe(3);
  });

  /**
   * ⭐⭐ AND THE DEVELOPMENTAL LANE ALREADY HELD THIS LAW. Its refusals stand
   * above its own `openThread` — *"No thread is opened, no opportunity minted,
   * no act claimed."* B1 does not invent the standard; it brings the structure
   * lane into line with the one the S3 lane already set.
   */
  /**
   * ⚠️ SCOPED TO THE FUNCTION, NOT TO "THE SECOND `openThread`". A first cut
   * counted occurrences and broke the moment B3 added a third lane between
   * them — it was asserting about file order, not about the developmental
   * lane. ⭐ Sliced from the function's own declaration, it cannot be moved by
   * anything landing above it.
   */
  it('⭐ the developmental lane refuses before it opens, too', () => {
    const lane = code.slice(code.indexOf('async function developmentalTurn'));
    const open = lane.indexOf('await openThread(');
    const orientation = lane.indexOf("refusal: 'section_orientation_unavailable'");
    expect(open).toBeGreaterThan(-1);
    expect(orientation).toBeGreaterThan(-1);
    expect(orientation).toBeLessThan(open);
  });

  it('⭐ the canonical baseline still refuses before any write', () => {
    const unmeasurable = at("refusal: 'canonical_unmeasurable'");
    expect(unmeasurable).toBeGreaterThan(-1);
    expect(unmeasurable).toBeLessThan(at('await openThread('));
  });

  /**
   * ⚠️ AMENDED AT B3, BY FOUNDER RULING. B1 asserted the boundary was NOT widened,
   * which was its own law and was right. B3 widened it for `work` alone.
   *
   * ⭐⭐ WHAT SURVIVES IS THE HALF THAT MATTERS MOST: `section` stays closed. It
   * is easy for someone later to read "Work support" as permission to widen both
   * typed anchors — and a section-anchored thread would make scrolling a change
   * of relationship. This line is where that disagreement would be written.
   */
  it('⭐ the boundary admits `work`, and ⛔ `section` stays closed', () => {
    const list = code.match(/const SUPPORTED_ANCHORS = \[([^\]]*)\]/);
    expect(list).not.toBeNull();
    const admitted = list![1].replace(/['"\s]/g, '').split(',');
    expect(admitted.sort().join(',')).toBe('division,question,uncertainty,work');
    expect(admitted).not.toContain('section');
    expect(admitted).not.toContain('concern');
    /* ⭐ And the work anchor is parsed CLOSED — `on` and nothing else. */
    expect(code).toMatch(/case 'work':[\s\S]{0,120}keys === 'on'/);
  });

  /**
   * ⭐⭐ B1'S OWED PROOF, DISCHARGED AT B3. The Work lane establishes its context
   * BEFORE it opens anything, so an admitted anchor whose relationship cannot be
   * proven writes nothing. Held behaviourally by the B3 witness; held here so the
   * ORDER cannot be quietly reversed later.
   */
  it('⭐⭐ the Work lane proves the relationship before it persists', () => {
    const lane = code.slice(code.indexOf('async function workTurn'));
    const proof = lane.indexOf('buildWorkContext(');
    const refusal = lane.indexOf('built.ok');
    const open = lane.indexOf('await openThread(');
    const append = lane.indexOf('appendTurn(');
    expect(proof).toBeGreaterThan(-1);
    expect(refusal).toBeGreaterThan(proof);
    expect(open).toBeGreaterThan(refusal);
    expect(append).toBeGreaterThan(open);
  });
});
