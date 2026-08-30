/**
 * WS2-04A STAGE 2.1 — the instrument, exercised against known answers.
 *
 * The proof about Elemental Alchemy is only worth what this measurement is
 * worth, and a measurement that has never been run on a manuscript whose
 * answer is known in advance is not evidence. So each case below composes a
 * synthetic manuscript with a NAMED composer, or edits one by hand, and
 * asserts what the pass must say about it.
 *
 * The case that matters most is the last one: the hybrid. It is the false
 * positive the tightened predicate exists to refuse.
 */

import {
  composeCurrentWithMarks,
  proveLines,
} from '../ws2-04a-stage21-legacy-proof';
import { composeLegacyHashHeadings, type SourceSection } from '../lib/composers';

/** A book with multi-line bodies and one headingless section — the shapes that
    broke earlier line accounting. */
const BOOK: SourceSection[] = [
  { heading: 'Chapter One', body: 'first line\nsecond line\n\nfourth line' },
  { heading: 'Chapter Two', body: 'alpha\nbeta' },
  { heading: null, body: 'an interlude with no heading at all\nrunning two lines' },
  { heading: 'Chapter Three', body: 'gamma\n\ndelta\nepsilon' },
];

const run = (sections: SourceSection[], draft: string) => {
  const { lines, headingLineOf, boundaryLineOf } = composeCurrentWithMarks(sections);
  return proveLines(lines, draft.split('\n'), headingLineOf, boundaryLineOf);
};

describe('stage 2.1 per-line proof', () => {
  it('marks heading lines from the section record, not from position', () => {
    const { headingLineOf, lines } = composeCurrentWithMarks(BOOK);
    // the headingless section reports null, and its first body line is NOT
    // claimed as a heading even though it sits at a section start
    expect(headingLineOf[2]).toBeNull();
    expect(headingLineOf.filter((l) => l !== null)).toHaveLength(3);
    headingLineOf.forEach((l, i) => {
      if (l !== null) expect(lines[l]).toBe(BOOK[i].heading);
    });
  });

  it('a legacy-composed draft accounts for every heading and no body line', () => {
    const r = run(BOOK, composeLegacyHashHeadings(BOOK));
    expect(r.exactLegacy).toBe(r.headedCount);   // 3, not 4 — the interlude has none
    expect(r.headedCount).toBe(3);
    expect(r.otherHeadingDiff).toBe(0);
    expect(r.bodyDiff).toBe(0);
    expect(r.resolved).toBe(r.boundaries);
  });

  it('one edited body line is body-counted, never absorbed as scaffolding', () => {
    const draft = composeLegacyHashHeadings(BOOK).replace('beta', 'beta, rewritten');
    const r = run(BOOK, draft);
    expect(r.bodyDiff).toBeGreaterThan(0);
  });

  it('a renamed heading is NOT the legacy form', () => {
    const draft = composeLegacyHashHeadings(BOOK).replace('# Chapter Two', '# Chapter II');
    const r = run(BOOK, draft);
    expect(r.exactLegacy).toBe(2);
    expect(r.otherHeadingDiff).toBe(1);
    expect(r.bodyDiff).toBe(0);
  });

  it('THE HYBRID: partly legacy headings must not read as fully legacy', () => {
    // one heading left in the current plain form, the rest legacy. No composer
    // that ever ran emitted this. The old predicate — "every difference I can
    // see is legacy-shaped" — was satisfied by it.
    const draft = composeLegacyHashHeadings(BOOK).replace('# Chapter Two\n', 'Chapter Two\n');
    const r = run(BOOK, draft);
    expect(r.exactLegacy).toBeLessThan(r.headedCount);
    expect(r.bodyDiff).toBe(0);
    // and the decisive test refuses it outright
    expect(composeLegacyHashHeadings(BOOK) === draft).toBe(false);
  });

  it('a pristine draft shows no differences at all', () => {
    const { lines } = composeCurrentWithMarks(BOOK);
    const r = run(BOOK, lines.join('\n'));
    expect(r.exactLegacy).toBe(0);
    expect(r.otherHeadingDiff).toBe(0);
    expect(r.bodyDiff).toBe(0);
    expect(r.resolved).toBe(r.boundaries);
  });
});
