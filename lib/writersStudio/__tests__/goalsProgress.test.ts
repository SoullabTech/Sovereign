import { readFileSync } from 'fs';
import { join } from 'path';
import { progressFor, progressLabel, fromWire, maiaMaySupport, type Measurable, type WriterGoal } from '../goalsClient';

/**
 * GOALS v1 — FR-09 · FR-10 · FR-11, made falsifiable.
 *
 *     The writer declares the goal.
 *     The system may measure progress against it.
 *     MAIA may not invent the goal.
 *
 * The two ways a goals feature goes wrong are both silent: it puts a number on
 * a qualitative aim, and it turns a number into a verdict. Neither throws.
 */

const COUNTS: Measurable = {
  manuscriptWords: 2140,
  sectionCount: 12,
  wordsBySection: { s1: 800 },
};

const base = {
  id: 'g1',
  statement: 'Finish the Torus chapter',
  sectionId: null as string | null,
  anchorHeading: null as string | null,
  livingWorkId: null,
  byWhen: null as string | null,
  standing: 'open' as const,
  support: 'track_only' as const,
  createdAt: 'x',
  updatedAt: 'x',
};

describe('FR-09 · an intention has no number, by construction', () => {
  it('an intention reports no progress at all', () => {
    const g: WriterGoal = { ...base, kind: 'intention' };
    expect(progressFor(g, COUNTS)).toEqual({ kind: 'none' });
    expect(progressLabel(progressFor(g, COUNTS))).toBeNull();
  });

  it('a wire row claiming measurable without both fields is read as an intention', () => {
    /* Not "a measurable goal with a missing number" — that shape can lie. The
       one that cannot is the intention. */
    const g = fromWire({
      id: 'g', statement: 's', kind: 'measurable', metric: null, target: null,
      section_id: null, anchor_heading: null, living_work_id: null,
      by_when: null, standing: 'open', created_at: 'x', updated_at: 'x',
    });
    expect(g.kind).toBe('intention');
    expect(progressFor(g, COUNTS)).toEqual({ kind: 'none' });
  });
});

describe('FR-11 · anchor loss ends measurement, not the goal', () => {
  const measurable = { ...base, kind: 'measurable' as const, metric: 'words' as const, target: 3000 };

  it('counts a manuscript-wide goal against the manuscript', () => {
    expect(progressFor(measurable, COUNTS)).toEqual({
      kind: 'counted', current: 2140, target: 3000, metric: 'words',
    });
  });

  it('counts a section-anchored goal against that section', () => {
    const g: WriterGoal = { ...measurable, sectionId: 's1', anchorHeading: 'The Torus' };
    expect(progressFor(g, COUNTS)).toMatchObject({ kind: 'counted', current: 800 });
  });

  it('a deleted section makes the goal UNMEASURABLE — never re-scoped to the book', () => {
    /* THE RULING. Re-basing "3,000 words in this chapter" onto the whole
       manuscript would report 2,140/3,000 — a plausible, helpful-looking number
       for a goal the writer never set. */
    const g: WriterGoal = { ...measurable, sectionId: null, anchorHeading: 'The Torus' };
    const p = progressFor(g, COUNTS);
    expect(p).toEqual({ kind: 'unmeasurable', reason: 'anchor-lost', target: 3000, metric: 'words' });
    expect(p).not.toMatchObject({ current: 2140 });
  });
});

describe('unread is not empty — the INSTRUMENT READ rule, in the product', () => {
  const measurable = { ...base, kind: 'measurable' as const, metric: 'words' as const, target: 3000 };

  it('a live section the room has not counted reads UNCOUNTED, not 0', () => {
    const g: WriterGoal = { ...measurable, sectionId: 'not-counted', anchorHeading: 'Somewhere' };
    expect(progressFor(g, COUNTS)).toEqual({ kind: 'uncounted', target: 3000, metric: 'words' });
  });

  it('an unread manuscript word count reads UNCOUNTED, not 0', () => {
    /* `draftMeta?.words ?? 0` would report the writer's unread draft as a blank
       page, beside a target they set themselves. */
    const p = progressFor(measurable, { ...COUNTS, manuscriptWords: null });
    expect(p).toEqual({ kind: 'uncounted', target: 3000, metric: 'words' });
    expect(progressLabel(p)).not.toMatch(/^0 /);
  });

  it('keeps unread distinct from anchor-lost', () => {
    /* One is a fact about our reading, the other about the writer's material.
       Collapsing them would tell a writer their chapter is gone because we were
       slow. */
    const uncounted = progressFor({ ...measurable, sectionId: 'nope', anchorHeading: 'H' }, COUNTS);
    const lost = progressFor({ ...measurable, sectionId: null, anchorHeading: 'H' }, COUNTS);
    expect(uncounted.kind).not.toBe(lost.kind);
  });
});

describe('FR-10 · no progress figure may be a function of the clock', () => {
  const src = readFileSync(join(process.cwd(), 'lib', 'writersStudio', 'goalsClient.ts'), 'utf8');

  it('exports nothing that turns a date into a judgement', () => {
    /* The rule is kept by ABSENCE, not by discipline: a surface cannot render
       "215 words/day required" if no function here computes it. */
    for (const banned of ['pace', 'onTrack', 'projected', 'daysLeft', 'perDay', 'streak', 'behind', 'ahead']) {
      expect(src).not.toMatch(new RegExp(`(function|const)\\s+${banned}`, 'i'));
    }
  });

  it('renders only the count and the target', () => {
    expect(progressLabel({ kind: 'counted', current: 2140, target: 3000, metric: 'words' }))
      .toBe('2,140 / 3,000 words');
  });

  it('byWhen is carried as a date and never computed with', () => {
    /* Date arithmetic is how "by 30 September" becomes "you are behind". */
    expect(src).not.toMatch(/Date\.now\(\)|new Date\(/);
  });
});

describe('the schema carries the rulings', () => {
  const sql = readFileSync(
    join(process.cwd(), 'database', 'migrations', '20260907000011_writer_goals.sql'), 'utf8');

  it('FR-09 is a biconditional CHECK, not a nullable target', () => {
    expect(sql).toMatch(/\(kind = 'measurable'\) = \(metric IS NOT NULL AND target IS NOT NULL\)/);
  });

  it('FR-11 keeps the goal when the section goes', () => {
    expect(sql).toMatch(/section_id uuid REFERENCES manuscript_sections\(id\) ON DELETE SET NULL/);
    expect(sql).not.toMatch(/manuscript_sections\(id\) ON DELETE CASCADE/);
  });

  it('FR-10 stores no clock-derived column', () => {
    for (const banned of ['pace', 'streak', 'projected', 'per_day', 'started_at', 'progress']) {
      expect(sql).not.toMatch(new RegExp(`\\n\\s+${banned}\\s`, 'i'));
    }
  });
});

describe('FR-13 · encouragement is invited; pressure is imposed', () => {
  const g = (support: 'track_only' | 'encourage' | 'work_with'): WriterGoal =>
    ({ ...base, kind: 'intention', support } as unknown as WriterGoal);

  it('quiet is the default, and it is a real choice rather than an absence', () => {
    const wire = fromWire({
      id: 'g', statement: 's', kind: 'intention', metric: null, target: null,
      section_id: null, anchor_heading: null, living_work_id: null, by_when: null,
      standing: 'open', support: 'track_only', created_at: 'x', updated_at: 'x',
    } as never);
    expect(wire.support).toBe('track_only');
    expect(maiaMaySupport(wire)).toBe(false);
  });

  it('MAIA may speak unbidden only where the writer invited it', () => {
    expect(maiaMaySupport(g('track_only'))).toBe(false);
    expect(maiaMaySupport(g('encourage'))).toBe(true);
    expect(maiaMaySupport(g('work_with'))).toBe(true);
  });

  it('an unreadable grant fails QUIET, not open', () => {
    /* A row we cannot interpret must not be read as an invitation. Failing open
       here would let a bad migration or a future enum value start coaching
       someone who never asked. */
    const wire = fromWire({
      id: 'g', statement: 's', kind: 'intention', metric: null, target: null,
      section_id: null, anchor_heading: null, living_work_id: null, by_when: null,
      standing: 'open', support: 'something_new', created_at: 'x', updated_at: 'x',
    } as never);
    expect(wire.support).toBe('track_only');
    expect(maiaMaySupport(wire)).toBe(false);
  });

  it('the grant permits company, never clock arithmetic (FR-10 survives FR-13)', () => {
    /* Inviting support does not unlock a different vocabulary. "That's a lot of
       movement" is companionship; "215 words a day" is supervision, at every
       grant level. */
    const src = readFileSync(join(process.cwd(), 'lib', 'writersStudio', 'goalsClient.ts'), 'utf8');
    expect(src).not.toMatch(/Date\.now\(\)|new Date\(/);
    for (const banned of ['pace', 'onTrack', 'projected', 'perDay', 'behind']) {
      expect(src).not.toMatch(new RegExp(`(function|const)\\s+${banned}`, 'i'));
    }
  });

  it('no MAIA path reaches Goals yet, and the gate exists before one does', () => {
    /* FR-13 says what MAIA may do when invited; it does not commission the
       doing. The guard is written first so the path cannot later be built
       without consulting it. */
    expect(typeof maiaMaySupport).toBe('function');
  });
});

describe('FR-14 · grant ≠ trigger ≠ cadence', () => {
  const src = readFileSync(join(process.cwd(), 'lib', 'writersStudio', 'goalsClient.ts'), 'utf8');

  it('the gate takes a grant and nothing else — it cannot become a trigger', () => {
    /* PERMISSION TO SUPPORT IS NOT PERMISSION TO INTERRUPT. A trigger needs an
       occasion: a timestamp, a last-shown time, a frequency, an event. This
       function is given none, so it cannot answer "now?" — only "allowed?".
       Making it a trigger would require changing its signature, which is
       exactly the visible act this test exists to force. */
    expect(maiaMaySupport.length).toBe(1);
    expect(maiaMaySupport({ support: 'encourage' })).toBe(true);
    /* and it is total over the grant alone: same input, same answer, always */
    expect(maiaMaySupport({ support: 'encourage' })).toBe(maiaMaySupport({ support: 'encourage' }));
  });

  it('no trigger or cadence machinery exists in the module', () => {
    for (const banned of [
      'lastSupportedAt', 'nextSupportAt', 'shouldSupport', 'supportDue',
      'cadence', 'interval', 'remind', 'notify', 'checkIn',
    ]) {
      expect(src).not.toMatch(new RegExp(`(function|const|let)\\s+${banned}`, 'i'));
    }
  });

  it('answers MAY, not SHOULD — the name and the absence both say so', () => {
    /* A stored `encourage` is not a command to produce motivational prose. If a
       `shouldSupport` ever appears beside this, the decision about whether
       support is appropriate right now has been moved out of the interaction
       and into a column. */
    expect(src).toContain('export function maiaMaySupport');
    expect(src).not.toMatch(/export function (maiaShould|shouldMaia)/i);
  });

  it('the correction is recorded, not silently applied', () => {
    /* The shipped docstring said the gate answered whether MAIA may speak
       "unbidden" — a trigger smuggled into a permission by one word. */
    expect(src).toContain('Permission to support is not permission to interrupt');
    expect(src).not.toMatch(/may SPEAK ABOUT this goal\s*\n?\s*\*?\s*unbidden/);
  });
});
