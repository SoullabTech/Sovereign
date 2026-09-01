/**
 * WS2-05B step 1 — what the mechanical tier may and may not say.
 */

import {
  gatherEvidence, observeStructuralLabels, observeNumbering, observeLexicalDensity,
  observeSuspectedScaffold, observeTransitions, sectionTopologyHash, resetEvidenceIds,
  type HeadedSection,
} from '../evidence';

const s = (position: number, heading: string | null): HeadedSection =>
  ({ id: `s${position}`, position, heading });

beforeEach(() => resetEvidenceIds());

describe('every observation declares its limits', () => {
  const book: HeadedSection[] = [
    s(0, 'CHAPTER 1: BEGINNING'), s(1, 'FIRE RISING'), s(2, 'THE FIRE WITHIN'),
    s(3, 'TENDING FIRE'), s(4, 'CHAPTER 2: AFTER'), s(5, 'PREFACE'),
    s(6, 'INTRODUCTION'), s(7, 'CONCLUSION'),
  ];

  it('nothing is emitted without a non-empty doesNotEstablish', () => {
    const ev = gatherEvidence('m', book);
    expect(ev.observations.length).toBeGreaterThan(0);
    for (const o of ev.observations) {
      expect(o.doesNotEstablish.length).toBeGreaterThan(0);
    }
  });

  it('no observation names a division, a title or a confidence', () => {
    const serialised = JSON.stringify(gatherEvidence('m', book).observations);
    /* This tier observes. These keys appearing would mean it had started to
       interpret, which is the failure 86bab2094 shipped. `kind` is excluded
       deliberately: here it is the observation's own discriminant, not a
       proposed division's vocabulary. */
    expect(serialised).not.toMatch(/"(title|divisions?|children|confidence|proposed)"/);
    /* And every `kind` value is an observation type, never a structural word. */
    for (const o of gatherEvidence('m', book).observations) {
      expect(o.kind).not.toMatch(/chapter|part|section|movement/i);
    }
  });

  it('a lexical cluster refuses to claim a boundary', () => {
    const [o] = observeLexicalDensity(book);
    expect(o.kind).toBe('lexical-density');
    expect(o.doesNotEstablish).toContain('start-boundary');
    expect(o.doesNotEstablish).toContain('structural-vs-thematic');
  });
});

describe('detectors', () => {
  it('reports the numbers a sequence is missing, not only the ones it has', () => {
    const [o] = observeNumbering([
      s(0, 'CHAPTER 1: A'), s(1, 'CHAPTER 2: B'), s(2, 'SOMETHING ELSE'), s(3, 'CHAPTER 4: D'),
    ]);
    expect(o.kind === 'numbering-pattern' && o.seen).toEqual([1, 2, 4]);
    expect(o.kind === 'numbering-pattern' && o.missing).toEqual([3]);
  });

  it('a lexical cluster carries every occurrence outside its core', () => {
    const far: HeadedSection[] = [
      s(0, 'FIRE ONE'), s(1, 'FIRE TWO'), s(2, 'FIRE THREE'),
      ...Array.from({ length: 20 }, (_, i) => s(3 + i, `OTHER MATTER ${i}`)),
      s(30, 'FIRE AGAIN LATER'),
    ];
    const [o] = observeLexicalDensity(far);
    expect(o.kind === 'lexical-density' && o.core).toEqual({ from: 0, to: 2 });
    expect(o.kind === 'lexical-density' && o.outside).toEqual([30]);
  });

  it('three adjacent structural labels are suspected scaffold; two are not', () => {
    expect(observeSuspectedScaffold([
      s(0, 'PART ONE'), s(1, 'PART TWO'), s(2, 'BACK MATTER'), s(3, 'REAL PROSE HERE'),
    ])).toHaveLength(1);
    expect(observeSuspectedScaffold([
      s(0, 'PREFACE'), s(1, 'INTRODUCTION'), s(2, 'REAL PROSE HERE'),
    ])).toHaveLength(0);
  });

  it('labels are observed without claiming the Work uses them structurally', () => {
    const [o] = observeStructuralLabels([s(0, 'CHAPTER 5: FIRE'), s(1, 'PROSE')]);
    expect(o.doesNotEstablish).toContain('whole-work-grammar');
  });
});

describe('vocabulary shift is not part of pass 1', () => {
  it('gatherEvidence emits no transition observations', () => {
    /* Genuinely disjoint vocabulary, as real headings are. Numbering a shared
       stem does NOT work: digits are stripped before comparison, so "NOUN1
       NOUN2" collapses to one shared word. Hence letters only. */
    const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const w = (n: number) => A[n % 26] + A[Math.floor(n / 26) % 26] + A[Math.floor(n / 676) % 26];
    const many: HeadedSection[] = Array.from({ length: 40 }, (_, i) =>
      s(i, `${w(i)} ${w(i + 500)} ${w(i + 1000)}`));
    expect(observeTransitions(many).length).toBeGreaterThan(10);
    expect(gatherEvidence('m', many).observations.some((o) => o.kind === 'transition'))
      .toBe(false);
  });

  it('and pass 1 says it read headings only', () => {
    const ev = gatherEvidence('m', [s(0, 'A HEADING HERE')]);
    expect(ev.coverage).toEqual({
      headings: 'all',
      /* The ceilings are stated even where nothing was read, so a headings-only
         reading and a body-reading one are legible under the same policy. */
      bodies: { mode: 'none', sectionIds: [], totalChars: 0, truncated: false,
        sectionLimit: 8, charLimit: 60_000 },
      passes: 1,
    });
  });
});

describe('topology hash', () => {
  it('is the ORDERED ids, so a reorder changes it', () => {
    const a = [s(0, 'A'), s(1, 'B'), s(2, 'C')];
    const reordered = [
      { id: 's1', position: 0, heading: 'B' },
      { id: 's0', position: 1, heading: 'A' },
      { id: 's2', position: 2, heading: 'C' },
    ];
    expect(sectionTopologyHash(a)).not.toEqual(sectionTopologyHash(reordered));
  });

  it('is unchanged by an edit to a heading', () => {
    expect(sectionTopologyHash([s(0, 'A'), s(1, 'B')]))
      .toEqual(sectionTopologyHash([s(0, 'REWRITTEN'), s(1, 'B')]));
  });
});
