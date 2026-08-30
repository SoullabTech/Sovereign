/**
 * WS2-04A — the conversion planner.
 *
 * These run without a database because the deciding is pure. What is being
 * asserted is mostly what the planner REFUSES: it converts without asking the
 * member, so every case where the structure is not already proven has to stop,
 * and a refusal is the feature rather than a gap.
 *
 * The two cases modelled on production are the ones that must pass — a
 * pristine draft and a body-edited draft whose headings are untouched — and
 * the edited case is the one that matters, because a partition cut from a
 * recomposed Source instead of the member's own text would silently discard
 * everything they wrote.
 */

import { planConversion } from '../convertDraft';
import { flattenSections } from '../seedInvariant';
import { composeCurrent, composeLegacyHashHeadings } from '../../../../scripts/lib/composers';

const src = (rows: { heading: string | null; body: string }[]) =>
  rows.map((r, i) => ({ id: `sec-${i}`, ...r }));

const BOOK = src([
  { heading: 'Chapter One', body: 'The morning came.\nIt was cold.' },
  { heading: 'Chapter Two', body: 'She left before dawn.' },
  { heading: null, body: 'An unheaded interlude.' },
  { heading: 'Chapter Three', body: 'And did not return.' },
]);

describe('planConversion — what it converts', () => {
  it('partitions a pristine draft, and the slices flatten back exactly', () => {
    const content = composeCurrent(BOOK);
    const plan = planConversion(content, BOOK);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.slices).toHaveLength(BOOK.length);
    expect(flattenSections(plan.slices)).toBe(content);
  });

  it('carries source provenance in document order', () => {
    const plan = planConversion(composeCurrent(BOOK), BOOK);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.slices.map((s) => s.sourceSectionId))
      .toEqual(['sec-0', 'sec-1', 'sec-2', 'sec-3']);
  });

  it('THE PRODUCTION CASE: body edits survive verbatim', () => {
    // Both real EDITED books are body-only with headings untouched. The slices
    // must come from what the member actually wrote — a partition of a
    // recomposed Source would silently replace their edits with the original.
    const content = composeCurrent(BOOK)
      .replace('It was cold.', 'It was bitterly cold, and she knew it.')
      .replace('And did not return.', 'And did not return until spring.');
    const plan = planConversion(content, BOOK);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(flattenSections(plan.slices)).toBe(content);
    expect(plan.slices.some((s) => s.text.includes('bitterly cold'))).toBe(true);
    expect(plan.slices.some((s) => s.text.includes('until spring'))).toBe(true);
  });

  it('an edit that grows one section does not shift another\'s text into it', () => {
    const content = composeCurrent(BOOK).replace(
      'She left before dawn.',
      'She left before dawn.\n\nA whole new paragraph she wrote later.',
    );
    const plan = planConversion(content, BOOK);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.slices[1].text).toContain('A whole new paragraph');
    expect(plan.slices[2].text).toContain('An unheaded interlude');
    expect(plan.slices[2].text).not.toContain('A whole new paragraph');
    expect(flattenSections(plan.slices)).toBe(content);
  });

  it('every section boundary starts a section — none is absorbed', () => {
    const content = composeCurrent(BOOK);
    const plan = planConversion(content, BOOK);
    if (!plan.ok) throw new Error('expected a plan');
    expect(plan.slices[0].text.startsWith('Chapter One')).toBe(true);
    expect(plan.slices[1].text.startsWith('Chapter Two')).toBe(true);
    expect(plan.slices[3].text.startsWith('Chapter Three')).toBe(true);
  });
});

describe('planConversion — what it refuses', () => {
  it('refuses NO_SOURCE: there are no boundaries to derive', () => {
    const plan = planConversion('a blank page someone typed into', []);
    expect(plan).toMatchObject({ ok: false, refusal: 'no_source_sections' });
  });

  it('refuses an empty sourceless draft too', () => {
    expect(planConversion('', [])).toMatchObject({ ok: false, refusal: 'no_source_sections' });
  });

  it('HOLDS the legacy composer rather than stripping its scaffold', () => {
    // Removing `# ` changes the draft's bytes, so it cannot happen inside a
    // conversion promising the bytes are unchanged. Both claims cannot be true.
    const plan = planConversion(composeLegacyHashHeadings(BOOK), BOOK);
    expect(plan).toMatchObject({ ok: false, refusal: 'legacy_scaffold_held' });
  });

  it('refuses a renamed heading — only the writer can say where the break falls', () => {
    const content = composeCurrent(BOOK).replace('Chapter Two', 'Chapter II — The Leaving');
    const plan = planConversion(content, BOOK);
    expect(plan).toMatchObject({ ok: false, refusal: 'boundary_moved' });
  });

  it('refuses a deleted heading — sections merged is the writer\'s to declare', () => {
    const content = composeCurrent(BOOK).replace('Chapter Two\n\n', '');
    const plan = planConversion(content, BOOK);
    expect(plan.ok).toBe(false);
  });

  it('refuses text added before the first boundary', () => {
    // The dedication belongs to no section. Absorbing it into section 0 would
    // attribute it to Chapter One; dropping it would lose it. Neither is the
    // system's to decide, so it stops.
    const content = 'A dedication written above everything.\n\n' + composeCurrent(BOOK);
    expect(planConversion(content, BOOK)).toMatchObject({
      ok: false,
      refusal: 'leading_text_before_first_boundary',
    });
  });

  it('a refusal never carries member text', () => {
    const content = composeCurrent(BOOK).replace('Chapter Two', 'The Leaving Of Anna');
    const plan = planConversion(content, BOOK);
    if (plan.ok) throw new Error('expected a refusal');
    expect(JSON.stringify(plan)).not.toContain('Anna');
    expect(JSON.stringify(plan)).not.toContain('morning');
  });
});

describe('planConversion — the round trip holds under awkward text', () => {
  const cases: [string, { heading: string | null; body: string }[]][] = [
    ['trailing whitespace', [{ heading: 'H', body: 'body with trailing spaces   ' }]],
    ['unicode', [{ heading: 'Chapître Un', body: 'héllo wörld — ünïcode' }]],
    ['blank runs', [{ heading: 'H', body: 'a\n\n\n\nb' }]],
    ['empty body', [{ heading: 'H', body: '' }]],
    ['no headings at all', [{ heading: null, body: 'just prose' }, { heading: null, body: 'more prose' }]],
  ];
  it.each(cases)('%s', (_label, rows) => {
    const sections = src(rows);
    const content = composeCurrent(sections);
    const plan = planConversion(content, sections);
    // A refusal is acceptable for awkward text; a LOSSY conversion never is.
    if (!plan.ok) return;
    expect(flattenSections(plan.slices)).toBe(content);
    expect(plan.slices).toHaveLength(sections.length);
  });

  it('headingless sections still partition — a boundary need not be a heading', () => {
    const two = src([
      { heading: null, body: 'just prose' },
      { heading: null, body: 'more prose' },
    ]);
    const content = composeCurrent(two);
    const plan = planConversion(content, two);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.slices.map((s) => s.text)).toEqual(['just prose\n\n', 'more prose\n']);
    expect(flattenSections(plan.slices)).toBe(content);
  });
});
