/**
 * WS-DEV-SCOPE-01 — the writer chooses what MAIA reads.
 *
 * Founder ruling 2026-09-07, on `ceiling_exceeded` against a 211-page book:
 * the reading always attempted the whole draft, so a real book met a dead end
 * rather than a choice. The ceiling is not changed here and refusing the whole
 * work is still correct — what changes is that refusal is no longer the only
 * outcome.
 *
 * These are the obligations of the scope law itself. A mistake here is the
 * kind that does not show: an off-by-one range, a dropped id, an empty scope
 * quietly becoming everything.
 */

import { isReadingScope, resolveScope, type ReadingScope } from '../scope';

/* A small book: eight sections, two divisions. */
const TOPOLOGY = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];
const UNITS = { partOne: ['s1', 's2', 's3'], partTwo: ['s4', 's5'], empty: [] };
const inputs = { topology: TOPOLOGY, unitSections: UNITS };
const ok = (scope: ReadingScope) => {
  const r = resolveScope(scope, inputs);
  if (!r.ok) throw new Error(`expected a scope, got ${r.refusal}: ${r.detail}`);
  return r.bodyScope;
};
const refusal = (scope: ReadingScope) => {
  const r = resolveScope(scope, inputs);
  return r.ok ? 'ok' : r.refusal;
};

describe('the four scopes the contract names', () => {
  it('whole work', () => {
    expect(ok({ kind: 'whole' })).toEqual(TOPOLOGY);
  });

  it('one section — the current one', () => {
    expect(ok({ kind: 'section', sectionId: 's5' })).toEqual(['s5']);
  });

  it('a division the member authored', () => {
    expect(ok({ kind: 'unit', unitId: 'partOne' })).toEqual(['s1', 's2', 's3']);
  });

  it('an explicit range, inclusive of both ends', () => {
    /* Inclusive because a writer naming chapters 2 through 4 means to include
       chapter 4. An exclusive end is a programmer's convention leaking into a
       member's sentence. */
    expect(ok({ kind: 'range', fromSectionId: 's3', toSectionId: 's6' })).toEqual([
      's3', 's4', 's5', 's6',
    ]);
  });

  it('a range of one section is a range', () => {
    expect(ok({ kind: 'range', fromSectionId: 's4', toSectionId: 's4' })).toEqual(['s4']);
  });
});

describe('⛔ never infers what the writer meant', () => {
  it('refuses an inverted range instead of swapping the ends', () => {
    /* Silently reversing would be inferring intent, which the contract forbids
       by name. A reader who asked for 9 through 4 has made a mistake worth
       seeing, not a request worth guessing at. */
    expect(refusal({ kind: 'range', fromSectionId: 's6', toSectionId: 's2' })).toBe('range_inverted');
  });

  it('refuses an unknown section rather than reading the nearest one', () => {
    expect(refusal({ kind: 'section', sectionId: 'not-mine' })).toBe('unknown_scope_target');
    expect(refusal({ kind: 'range', fromSectionId: 's1', toSectionId: 'not-mine' })).toBe(
      'unknown_scope_target',
    );
  });

  it('refuses an unknown division rather than falling back to the whole work', () => {
    expect(refusal({ kind: 'unit', unitId: 'not-mine' })).toBe('unknown_scope_target');
  });

  it('⛔ an empty scope NEVER becomes the whole work', () => {
    /* The failure that would be invisible: a division whose sections all left
       the draft resolving to "everything", so a member asking for one chapter
       silently commissions a reading of the book — and hits the ceiling, or
       worse, does not. */
    expect(refusal({ kind: 'unit', unitId: 'empty' })).toBe('empty_scope');
    expect(resolveScope({ kind: 'whole' }, { topology: [], unitSections: {} })).toMatchObject({
      ok: false,
      refusal: 'empty_scope',
    });
  });

  it('⛔ does not choose, rank, or prefer any section', () => {
    /* Every scope is exactly what was named. Nothing is added because it looks
       important and nothing is dropped because it looks minor. */
    expect(ok({ kind: 'range', fromSectionId: 's1', toSectionId: 's2' })).toHaveLength(2);
    expect(ok({ kind: 'unit', unitId: 'partTwo' })).toEqual(['s4', 's5']);
  });
});

describe('order comes from the work, never from the request', () => {
  it('a division is read in document order, whatever order it stores', () => {
    const shuffled = { topology: TOPOLOGY, unitSections: { p: ['s3', 's1', 's2'] } };
    const r = resolveScope({ kind: 'unit', unitId: 'p' }, shuffled);
    expect(r.ok && r.bodyScope).toEqual(['s1', 's2', 's3']);
  });

  it('a division naming a section that has left the draft reads the rest', () => {
    /* Dropped from the READ, never from the coverage record — the reading
       still reports what it did not read. */
    const stale = { topology: TOPOLOGY, unitSections: { p: ['s2', 'gone', 's3'] } };
    const r = resolveScope({ kind: 'unit', unitId: 'p' }, stale);
    expect(r.ok && r.bodyScope).toEqual(['s2', 's3']);
  });
});

describe('⛔ the shape can carry identifiers and nothing else', () => {
  it('accepts exactly the four named shapes', () => {
    expect(isReadingScope({ kind: 'whole' })).toBe(true);
    expect(isReadingScope({ kind: 'section', sectionId: 's1' })).toBe(true);
    expect(isReadingScope({ kind: 'unit', unitId: 'u1' })).toBe(true);
    expect(isReadingScope({ kind: 'range', fromSectionId: 's1', toSectionId: 's2' })).toBe(true);
  });

  it('⛔ refuses a scope carrying prose, an observation, or any extra field', () => {
    /* The route's own guard is the first line; this is the second. A scope is
       structural or it is not a scope. */
    expect(isReadingScope({ kind: 'section', sectionId: 's1', text: 'the prose' })).toBe(false);
    expect(isReadingScope({ kind: 'whole', observation: 'what MAIA should say' })).toBe(false);
    expect(isReadingScope({ kind: 'range', fromSectionId: 's1', toSectionId: 's2', note: 'x' })).toBe(false);
  });

  it('refuses a malformed or unnamed shape rather than coercing it', () => {
    expect(isReadingScope({ kind: 'chapter', chapterId: 'c1' })).toBe(false);
    expect(isReadingScope({ kind: 'section' })).toBe(false);
    expect(isReadingScope({ kind: 'section', sectionId: '' })).toBe(false);
    expect(isReadingScope(null)).toBe(false);
    expect(isReadingScope('whole')).toBe(false);
  });
});
