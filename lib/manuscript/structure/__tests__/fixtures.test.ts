/**
 * WS2-05B-8B-02b - the adversarial fixture must stay adversarial.
 *
 * The readability witness passed mechanically and failed the moment a person
 * read the page, and the fixture is how it got that far: it copied the real
 * reading's SHAPE and gave every division a different kind, so it could not
 * exhibit the defect it was standing in for.
 *
 * These assertions are not about rendering. They are about the fixture keeping
 * the properties it exists for, so that a later tidy-up cannot quietly return
 * it to a shape every surface can already draw.
 */

import { adversarialReading, allReadings, fixtureSections } from '../fixtures';
import type { ProposedUnit } from '../interpret';

const flatten = (units: readonly ProposedUnit[], into: ProposedUnit[] = []) => {
  for (const u of units) { into.push(u); flatten(u.children, into); }
  return into;
};

describe('the adversarial fixture', () => {
  const reading = adversarialReading();
  if (!('units' in reading)) throw new Error('expected a tree-bearing form');
  const all = flatten(reading.units);
  const elements = all.filter((u) => u.kind === 'element');

  it('carries five siblings of one kind, none of them titled', () => {
    expect(elements).toHaveLength(5);
    expect(elements.every((u) => u.title === null)).toBe(true);
    expect(new Set(elements.map((u) => u.kind))).toEqual(new Set(['element']));

    /* They are siblings, not five divisions scattered through the tree: the
       failure was five IDENTICAL ROWS next to each other. */
    const parent = all.find((u) => u.children.some((c) => c.kind === 'element'));
    expect(parent?.children.filter((c) => c.kind === 'element')).toHaveLength(5);
  });

  it('makes the label the only thing telling them apart', () => {
    const labels = elements.map((u) => u.editorialLabel);
    expect(labels).toEqual(['Fire', 'Water', 'Earth', 'Air', 'Aether']);
    /* Distinct labels on identical titles and kinds. Strip the labels and the
       five rows become indistinguishable, which is exactly the defect. */
    expect(new Set(labels).size).toBe(5);
  });

  it('has nothing unaccounted, so the defect cannot hide behind a gap', () => {
    expect(reading.unaccountedSectionIds).toEqual([]);
    expect(reading.uncertainRegions).toHaveLength(3);
  });

  it('refuses to shrink rather than quietly folding the five together', () => {
    expect(() => adversarialReading(fixtureSections(9))).toThrow(/14 sections/);
  });

  /* A second `mixed` in `allReadings` would silently turn "each form once" into
     "each form once, except mixed twice" in every consumer that iterates it. */
  it('is not in allReadings, which is one reading per form', () => {
    expect(Object.keys(allReadings)).toEqual(
      ['stable', 'partial', 'flat', 'mixed', 'ambiguous', 'none']);
  });
});

describe('every fixture carries an editorial letter', () => {
  it.each(Object.keys(allReadings) as (keyof typeof allReadings)[])(
    '%s', (name) => {
      const r = allReadings[name]();
      expect(r.editorialSynthesis?.thesis).toBeTruthy();
      expect(Array.isArray(r.editorialSynthesis?.strongestFindings)).toBe(true);
      expect(Array.isArray(r.editorialSynthesis?.questionsForAuthor)).toBe(true);
    });

  /* A question's sectionIds are checked by the host against the draft, so a
     fixture naming an id its own sections do not hold would be a shape no real
     reading could reach. */
  it('names only sections the fixture Work actually holds', () => {
    const s = fixtureSections();
    const held = new Set(s.map((x) => x.id));
    for (const name of Object.keys(allReadings) as (keyof typeof allReadings)[]) {
      for (const q of allReadings[name](s).editorialSynthesis?.questionsForAuthor ?? []) {
        for (const id of q.sectionIds ?? []) expect(held.has(id)).toBe(true);
      }
    }
  });
});
