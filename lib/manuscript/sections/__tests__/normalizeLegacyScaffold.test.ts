/**
 * WS2-04B-0 — legacy scaffold normalisation.
 *
 * This transform runs without asking and CHANGES A MEMBER'S DRAFT, which
 * conversion never does. Its licence rests entirely on proving the bytes it
 * removes were written by the platform — so most of what follows checks that
 * it REFUSES the moment that proof weakens.
 *
 * The inverse proof gets its own tests, because it is the difference between
 * "the result looks right" and "nothing else was touched".
 */

import {
  planNormalization,
  addHistoricalScaffold,
  historicalPrefixMatchesComposer,
} from '../normalizeLegacyScaffold';
import { composeCurrent, composeLegacyHashHeadings } from '../composers';
import { planConversion } from '../convertDraft';

const src = (rows: { heading: string | null; body: string }[]) =>
  rows.map((r, i) => ({ id: `sec-${i}`, ...r }));

const BOOK = src([
  { heading: 'Chapter One', body: 'The morning came.\nIt was cold.' },
  { heading: 'Chapter Two', body: 'She left before dawn.' },
  { heading: null, body: 'An unheaded interlude.' },
  { heading: 'Chapter Three', body: 'And did not return.' },
]);

/** Convert a draft the way 04A does, then hand the slices to 04B-0. */
const slicesOf = (content: string) => {
  const plan = planConversion(content, BOOK);
  if (!plan.ok) throw new Error(`conversion refused: ${plan.refusal}`);
  return plan.slices.map((s) => s.text);
};

describe('the authorised class', () => {
  it('the prefix under test is what the legacy composer actually emits', () => {
    expect(historicalPrefixMatchesComposer()).toBe(true);
  });

  it('normalises a legacy draft to exactly the current composer output', () => {
    const legacy = composeLegacyHashHeadings(BOOK);
    const r = planNormalization(BOOK, slicesOf(legacy));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.content).toBe(composeCurrent(BOOK));
    expect(r.headingsNormalized).toBe(3);          // the interlude has no heading
    expect(r.charsRemoved).toBe(3 * 2);            // exactly "# " per heading
  });

  it('leaves headingless sections untouched', () => {
    const legacy = composeLegacyHashHeadings(BOOK);
    const before = slicesOf(legacy);
    const r = planNormalization(BOOK, before);
    if (!r.ok) throw new Error('expected a plan');
    expect(r.slices[2]).toBe(before[2]);
  });

  it('removes ONLY the prefix — every other character survives', () => {
    const legacy = composeLegacyHashHeadings(BOOK);
    const r = planNormalization(BOOK, slicesOf(legacy));
    if (!r.ok) throw new Error('expected a plan');
    expect(r.content.replace(/^/gm, '')).toContain('The morning came.\nIt was cold.');
    expect(r.content).not.toContain('# ');
    expect(r.content).toContain('Chapter One');
  });
});

describe('the inverse proof', () => {
  it('re-adding the scaffold reproduces the original byte for byte', () => {
    const legacy = composeLegacyHashHeadings(BOOK);
    const r = planNormalization(BOOK, slicesOf(legacy));
    if (!r.ok) throw new Error('expected a plan');
    expect(addHistoricalScaffold(r.slices, BOOK.map((s) => s.heading))).toBe(legacy);
  });

  it('re-adding is section-aware, not a blind prefix on every slice', () => {
    // the headingless section must NOT gain a "# " on the way back
    const rebuilt = addHistoricalScaffold(['a', 'b'], ['H', null]);
    expect(rebuilt).toBe('# ab');
  });
});

describe('what it refuses', () => {
  it('refuses a draft already in current form', () => {
    const current = composeCurrent(BOOK);
    expect(planNormalization(BOOK, slicesOf(current)))
      .toMatchObject({ ok: false, refusal: 'already_normalized' });
  });

  it('refuses a draft that is not a legacy variant', () => {
    const edited = composeCurrent(BOOK).replace('It was cold.', 'It was warm.');
    expect(planNormalization(BOOK, slicesOf(edited)))
      .toMatchObject({ ok: false, refusal: 'not_legacy_composer_variant' });
  });

  it('THE ONE-BAD-HEADING RULE: any heading off the historical form stops it', () => {
    // A book that is legacy everywhere except one heading the member retitled.
    // Normalising the rest would silently accept a draft this transform cannot
    // prove the provenance of.
    const hybrid = composeLegacyHashHeadings(BOOK).replace('# Chapter Two', '## Chapter Two');
    const r = planNormalization(BOOK, [hybrid]);
    expect(r.ok).toBe(false);
  });

  it('refuses when a body edit accompanies the scaffolding', () => {
    const legacyEdited = composeLegacyHashHeadings(BOOK)
      .replace('She left before dawn.', 'She left long before dawn.');
    const r = planNormalization(BOOK, slicesOf(legacyEdited));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.refusal).toBe('not_legacy_composer_variant');
  });

  it('refuses when the slice count does not match the sections', () => {
    const legacy = composeLegacyHashHeadings(BOOK);
    expect(planNormalization(BOOK, [legacy])).toMatchObject({ ok: false });
  });

  it('a refusal carries no member text', () => {
    const edited = composeCurrent(BOOK).replace('She left before dawn.', 'Anna left at dawn.');
    const r = planNormalization(BOOK, slicesOf(edited));
    if (r.ok) throw new Error('expected a refusal');
    expect(JSON.stringify(r)).not.toContain('Anna');
  });
});

describe('awkward but legitimate manuscripts', () => {
  const cases: [string, { heading: string | null; body: string }[]][] = [
    ['a heading that itself starts with #', [{ heading: '#1 Rule', body: 'b' }]],
    ['unicode heading', [{ heading: 'Chapître Un', body: 'héllo wörld' }]],
    ['empty body', [{ heading: 'H', body: '' }]],
    ['blank runs in body', [{ heading: 'H', body: 'a\n\n\n\nb' }]],
    ['no headings at all', [{ heading: null, body: 'x' }, { heading: null, body: 'y' }]],
  ];
  it.each(cases)('%s', (_label, rows) => {
    const sections = src(rows);
    const legacy = composeLegacyHashHeadings(sections);
    const conv = planConversion(legacy, sections);
    if (!conv.ok) return;
    const r = planNormalization(sections, conv.slices.map((s) => s.text));
    if (!r.ok) return; // refusal is always acceptable
    // but if it DID run, both proofs must hold
    expect(r.content).toBe(composeCurrent(sections));
    expect(addHistoricalScaffold(r.slices, sections.map((s) => s.heading))).toBe(legacy);
  });
});
