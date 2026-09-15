import {
  FALSIFIER,
  MEANINGS,
  SCORED_ACTS,
  TREATMENTS,
  TREATMENT_KEYS,
  WALK,
  collisions,
  parseTreatment,
  resolve,
  sectionBoundary,
  signature,
} from '../field/fieldTreatments';

/**
 * The design study's own instrument. It cannot decide whether a treatment FEELS
 * unambiguous — only the walk can do that — but it can prove one ambiguous
 * before a walk is spent on it.
 */
describe('the three treatments', () => {
  it('there are exactly three, and exactly three meanings', () => {
    expect(TREATMENT_KEYS).toEqual(['A', 'B', 'C']);
    expect(MEANINGS).toEqual(['location', 'focus', 'thread']);
  });

  /** ⭐ THE FALSIFIER, in its machine-checkable form. */
  it.each(TREATMENT_KEYS)('treatment %s draws no two meanings the same', (k) => {
    const found = collisions(TREATMENTS[k]);
    expect(found).toEqual([]);
  });

  it('states the falsifier in the writer’s terms, not the code’s', () => {
    expect(FALSIFIER).toContain('location, attention, or conversation');
    expect(FALSIFIER).toContain('reject it');
  });

  /**
   * ⭐ C is the treatment that separates on EVERY axis, which is what makes it
   * a different proposition rather than a tuned version of the other two.
   */
  it('C separates the three meanings by placement and by tone, not only by form', () => {
    const c = TREATMENTS.C;
    const places = MEANINGS.map((m) => c.marks[m].placement);
    const tones = MEANINGS.map((m) => c.marks[m].tone);
    expect(new Set(places).size).toBe(3);
    expect(new Set(tones).size).toBe(3);
  });

  /**
   * ⚠️ B is kept honest rather than tuned until it passes: its premise puts
   * location and focus in the same place and the same tone on purpose, and only
   * form and weight hold them apart. The study exists to find out whether that
   * is enough for a reader. Recording it here means a later "fix" that quietly
   * moved B's location mark out of the prose would be a change of treatment,
   * not an improvement.
   */
  it('B deliberately puts location and focus in the same place and tone', () => {
    const b = TREATMENTS.B;
    expect(b.marks.location.placement).toBe('work');
    expect(b.marks.focus.placement).toBe('work');
    expect(b.marks.location.tone).toBe('accent');
    expect(b.marks.focus.tone).toBe('accent');
    expect(signature(b.marks.location)).not.toBe(signature(b.marks.focus));
  });

  it('A carries no standing mark in the prose at all', () => {
    expect(TREATMENTS.A.marks.location.placement).toBe('rail');
    expect(sectionBoundary(TREATMENTS.A)).toBeNull();
  });

  /** The thread is subordinate to the Focus in every treatment, and never the accent. */
  it.each(TREATMENT_KEYS)('treatment %s never draws the thread in the accent', (k) => {
    expect(TREATMENTS[k].marks.thread.tone).toBe('maia');
    expect(TREATMENTS[k].marks.thread.placement).toBe('orbit');
  });

  it('resolves a mark to tokens without any surface deciding for itself', () => {
    const focus = resolve(TREATMENTS.C, 'focus');
    const thread = resolve(TREATMENTS.C, 'thread');
    expect(focus.color).not.toBe(thread.color);
    expect(focus.form).toBe('frame');
    expect(thread.form).toBe('edge');
  });

  it('absent or unrecognised means the room is not in the study', () => {
    expect(parseTreatment(null)).toBeNull();
    expect(parseTreatment('')).toBeNull();
    expect(parseTreatment('D')).toBeNull();
    expect(parseTreatment('c')).toBe('C');
    expect(parseTreatment(' a ')).toBe('A');
  });
});

describe('the walk', () => {
  it('is the eight acts, in order', () => {
    expect(WALK.map((a) => a.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(WALK[0].act).toBe('read normally');
    expect(WALK[7].act).toBe('continue writing');
  });

  /**
   * ⛔ Act 2 is Product Finding A. It fails identically in all three treatments
   * because all three share the substrate, so it discriminates nothing. It is
   * BLOCKED, never a treatment failure.
   */
  it('marks act 2 blocked by Finding A and excludes it from what is scored', () => {
    expect(WALK[1].blocked).toBe('FINDING_A');
    expect(SCORED_ACTS).toHaveLength(7);
    expect(SCORED_ACTS.some((a) => a.n === 2)).toBe(false);
  });

  it('blocks exactly one act — the rest are the study', () => {
    expect(WALK.filter((a) => a.blocked)).toHaveLength(1);
  });
});
