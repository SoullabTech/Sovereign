/**
 * HISTORY — grouping is presentation, summarizing is interpretation.
 *
 * Founder ruling 2026-09-07:
 *
 *   A date may gather acts. It may not explain what those acts amounted to.
 *
 * The failure this guards against is not a bug; it is a drift. Every product
 * with a timeline eventually grows a daily headline — "a productive day", "you
 * focused on structure" — because a date header with three items under it
 * looks like it wants a summary. It does not. The summary would be the system
 * telling the writer what their own week meant.
 */

import { byDay, sentenceFor, beneath, subjectOf, type StudioAct } from '../studioHistory';

const act = (over: Partial<StudioAct>): StudioAct => ({
  id: over.id ?? 'a1',
  kind: over.kind ?? 'version_kept',
  at: over.at ?? '2026-09-07T18:00:00.000Z',
  workTitle: over.workTitle ?? null,
  manuscriptTitle: over.manuscriptTitle ?? null,
  manuscriptId: over.manuscriptId ?? null,
  detail: over.detail ?? null,
  note: over.note ?? null,
});

describe('HISTORY — what a date may and may not do', () => {
  it('gathers acts under a day', () => {
    const days = byDay([
      act({ id: '1', at: '2026-09-07T18:00:00.000Z' }),
      act({ id: '2', at: '2026-09-07T09:00:00.000Z' }),
      act({ id: '3', at: '2026-09-06T09:00:00.000Z' }),
    ]);
    expect(days).toHaveLength(2);
    expect(days[0].acts.map((a) => a.id)).toEqual(['1', '2']);
    expect(days[1].acts.map((a) => a.id)).toEqual(['3']);
  });

  it('⛔ a day carries NOTHING but its acts — no count, no headline', () => {
    /* Asserted on the shape, not on the rendering. A summary cannot be added
       to a day without editing the type, which forces the argument into the
       open instead of letting a helpful-looking string appear in a template. */
    const [day] = byDay([act({}), act({ id: '2' })]);
    expect(Object.keys(day).sort()).toEqual(['acts', 'key', 'label']);
  });

  it('labels a day as a date, never as a duration', () => {
    /* "3 days ago" would score dormancy the same way the Work cards did. */
    const [day] = byDay([act({ at: '2026-09-07T18:00:00.000Z' })], new Date('2026-09-30T00:00:00Z'));
    expect(day.label).not.toMatch(/ago|day[s]? |week|month/i);
    expect(day.label).toMatch(/September/);
  });

  it('names the year only when it is not the current one', () => {
    const now = new Date('2026-09-30T00:00:00Z');
    expect(byDay([act({ at: '2026-03-04T12:00:00Z' })], now)[0].label).not.toMatch(/2026|2025/);
    expect(byDay([act({ at: '2025-03-04T12:00:00Z' })], now)[0].label).toMatch(/2025/);
  });

  it('skips an act whose timestamp cannot be read rather than inventing a day', () => {
    expect(byDay([act({ at: 'not-a-date' })])).toEqual([]);
  });
});

describe('HISTORY — the filename ruling', () => {
  it('a declared Work title outranks the manuscript title', () => {
    /* Founder 2026-09-07: a source filename is provenance, not a Work name.
       ELEMENTAL_ALCHEMY.docx must never stand in for Elemental Alchemy. */
    expect(
      subjectOf(act({ workTitle: 'Elemental Alchemy', manuscriptTitle: 'ELEMENTAL_ALCHEMY' })),
    ).toBe('Elemental Alchemy');
  });

  it('falls back to the manuscript title only when no Work claims it', () => {
    expect(subjectOf(act({ manuscriptTitle: 'ELEMENTAL_ALCHEMY' }))).toBe('ELEMENTAL_ALCHEMY');
    expect(subjectOf(act({}))).toBeNull();
  });

  it('the filename appears on the arrival act, where custody is the point', () => {
    expect(
      sentenceFor(act({ kind: 'writing_arrived', detail: 'ELEMENTAL_ALCHEMY.docx' })),
    ).toBe('Brought ELEMENTAL_ALCHEMY.docx into the Studio');
  });
});

describe('HISTORY — an act is stated, never characterized', () => {
  it('says what happened and stops', () => {
    expect(sentenceFor(act({ kind: 'version_kept', detail: '12', workTitle: 'Elemental Alchemy' })))
      .toBe('Kept version 12 of Elemental Alchemy');
    expect(sentenceFor(act({ kind: 'line_marked', workTitle: 'Elemental Alchemy' })))
      .toBe('Marked a line in Elemental Alchemy');
    expect(sentenceFor(act({ kind: 'work_begun', workTitle: 'Elemental Alchemy' })))
      .toBe('Began Elemental Alchemy');
  });

  it('⛔ omits an act it cannot state rather than approximating it', () => {
    expect(sentenceFor(act({ kind: 'expression_declared' }))).toBeNull();
    expect(sentenceFor(act({ kind: 'material_declared' }))).toBeNull();
  });

  it("the second line is the member's own words, quoted as theirs", () => {
    expect(beneath(act({ note: 'before final Fire revision' }))).toBe('“before final Fire revision”');
  });

  it('an act with nothing recorded beneath it gets no second line', () => {
    /* Not "no note" — nothing. An absence is not an occasion to write copy. */
    expect(beneath(act({ kind: 'version_kept', detail: '12' }))).toBeNull();
  });

  it('a whitespace-only note is not a member sentence', () => {
    expect(beneath(act({ note: '   ' }))).toBeNull();
  });
});
