import { readFileSync } from 'fs';
import { join } from 'path';
import { progressFor, progressLabel, fromWire, type Measurable, type WriterGoal } from '../goalsClient';

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
