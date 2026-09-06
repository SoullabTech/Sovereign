/**
 * WHAT DEVELOP SAYS ABOUT AN UNREADABLE WORK.
 *
 * The defect: one sentence — "this work is not ready to be read yet, it needs
 * a draft with sections" — stood for three different states, and a member read
 * it beside an outline of their own 185 chapters. These tests hold the states
 * apart, and hold the offer to exactly the two cases where an act exists.
 */

import { preparationCopy } from '../developPreparationClient';
import type { DevelopPreparation, Divergence } from '@/lib/manuscript/development/preparation';

const divergence = (over: Partial<Divergence> = {}): Divergence => ({
  classification: 'EDITED' as const,
  boundaries: 185, resolved: 185, headingsChanged: 0, bodyLinesChanged: 12, draftChars: 400_000,
  ...over,
});

const CONVERTIBLE: DevelopPreparation = {
  kind: 'convertible', sourceSections: 185, diverged: true,
  divergence: divergence(), disclosure: 'a'.repeat(64),
};

it('says nothing at all when the Work is ready — the room shows its ordinary invitation', () => {
  expect(preparationCopy({ kind: 'ready', draftSections: 185 })).toBeNull();
});

it('offers an act in exactly the two states where one exists', () => {
  const offers = (s: DevelopPreparation) => Boolean(preparationCopy(s)?.act);
  expect(offers({ kind: 'no_draft', sourceSections: 185 })).toBe(true);
  expect(offers(CONVERTIBLE)).toBe(true);
  expect(offers({ kind: 'no_source' })).toBe(false);
  expect(offers({ kind: 'indeterminate', detail: 'x' })).toBe(false);
  expect(offers({
    kind: 'unresolvable', sourceSections: 185,
    divergence: divergence({ resolved: 180 }), refusal: 'boundary_moved',
  })).toBe(false);
});

it('names the Source count rather than denying it — never "no sections" over a Work that has them', () => {
  for (const state of [{ kind: 'no_draft', sourceSections: 185 } as const, CONVERTIBLE]) {
    const text = preparationCopy(state)!.body.join(' ');
    expect(text).toContain('185');
    expect(text).not.toMatch(/needs a draft with sections/);
  }
});

it('discloses the change before offering to convert a draft that has moved', () => {
  const text = preparationCopy(CONVERTIBLE)!.body.join(' ');
  expect(text).toMatch(/changed since it was imported/);
  expect(text).toContain('12 lines');
  /* The promise the conversion actually keeps, said plainly. */
  expect(text).toMatch(/Not one character moves/);
});

it('does not claim the draft changed when it has not', () => {
  const text = preparationCopy({ ...CONVERTIBLE, diverged: false, divergence: divergence({ classification: 'PRISTINE', bodyLinesChanged: 0 }) })!.body.join(' ');
  expect(text).not.toMatch(/changed since it was imported/);
  expect(text).toMatch(/still matches it exactly/);
});

/* ⛔ NO GUESS IS EVER OFFERED FOR RATIFICATION. */
it('when boundaries cannot be located it says so, offers nothing, and confirms the work is untouched', () => {
  const copy = preparationCopy({
    kind: 'unresolvable', sourceSections: 185,
    divergence: divergence({ resolved: 180 }), refusal: 'boundary_moved',
  })!;
  expect(copy.action).toBeNull();
  const text = copy.body.join(' ');
  expect(text).toContain('180 of 185');
  expect(text).toMatch(/will not place the rest by guessing/);
  expect(text).toMatch(/nothing has been changed/i);
});

it('the no-draft case names the canonical act, not a new one', () => {
  expect(preparationCopy({ kind: 'no_draft', sourceSections: 185 })!.act).toBe('begin_draft');
  expect(preparationCopy(CONVERTIBLE)!.act).toBe('convert');
});
