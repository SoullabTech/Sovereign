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
  it('⛔ each lane opens a thread exactly once, and there are two lanes', () => {
    expect((code.match(/await openThread\(/g) ?? []).length).toBe(2);
  });

  /**
   * ⭐⭐ AND THE DEVELOPMENTAL LANE ALREADY HELD THIS LAW. Its refusals stand
   * above its own `openThread` — *"No thread is opened, no opportunity minted,
   * no act claimed."* B1 does not invent the standard; it brings the structure
   * lane into line with the one the S3 lane already set.
   */
  it('⭐ the developmental lane refuses before it opens, too', () => {
    const second = code.indexOf('await openThread(', at('await openThread(') + 1);
    expect(second).toBeGreaterThan(-1);
    const orientation = at("refusal: 'section_orientation_unavailable'");
    expect(orientation).toBeGreaterThan(-1);
    expect(orientation).toBeLessThan(second);
  });

  it('⭐ the canonical baseline still refuses before any write', () => {
    const unmeasurable = at("refusal: 'canonical_unmeasurable'");
    expect(unmeasurable).toBeGreaterThan(-1);
    expect(unmeasurable).toBeLessThan(at('await openThread('));
  });

  it('⛔ and the boundary is NOT widened by this act', () => {
    const list = code.match(/const SUPPORTED_ANCHORS = \[([^\]]*)\]/);
    expect(list).not.toBeNull();
    const admitted = list![1].replace(/['"\s]/g, '');
    expect(admitted).toBe('question,uncertainty,division');
    expect(admitted).not.toContain('work');
    expect(admitted).not.toContain('section');
  });
});
