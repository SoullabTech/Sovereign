/**
 * Studio Home — the three-state interaction invariant.
 *
 *   CONTINUE = trustworthy writing activity belongs to a Work
 *   ORIENT   = writing/work exists, but no trustworthy continuation exists
 *   BEGIN    = neither exists
 *
 * This is the actual intelligence of the Home, and the place where it either
 * tells the truth or invents one. The defect these tests exist to prevent is
 * subtle and was shipped once: `living_work.updatedAt` was used to pick the
 * resume hero, so renaming a work — or declaring its form, or attaching a
 * material — promoted it to "Continue writing" over a work the member had
 * actually been writing in. A row changing is not a person writing.
 */

import { arrivalFor } from '../homeState';
import type { LivingWork } from '../useLivingWorks';
import type { CurrentManuscript } from '../useCurrentManuscript';

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const work = (
  id: string,
  opts: { title?: string | null; updatedAt: string; manuscriptId?: string },
): LivingWork => ({
  id,
  title: opts.title ?? null,
  purpose: null,
  form: null,
  stage: null,
  createdAt: iso(100),
  updatedAt: opts.updatedAt,
  expressions: opts.manuscriptId
    ? [{ expressionType: 'manuscript', expressionId: opts.manuscriptId, declaredAt: iso(90) }]
    : [],
  materials: [],
});

const ms = (
  id: string,
  opts: { lastWrittenAt: string | null; chars?: number; title?: string | null },
): CurrentManuscript => ({
  id,
  title: opts.title ?? null,
  createdAt: iso(50),
  sectionCount: 1,
  charCount: opts.chars ?? 1000,
  keepCount: 0,
  lastWrittenAt: opts.lastWrittenAt,
});

describe('Studio Home — arrival state', () => {
  it('BEGIN when neither works nor writing exist', () => {
    expect(arrivalFor([], []).kind).toBe('begin');
  });

  it('CONTINUE when a work has real writing activity', () => {
    const a = arrivalFor([work('w1', { updatedAt: iso(9), manuscriptId: 'm1' })], [
      ms('m1', { lastWrittenAt: iso(1) }),
    ]);
    expect(a.kind).toBe('continue');
    expect(a.resume?.id).toBe('w1');
  });

  it('⛔ a Work-row timestamp alone NEVER produces CONTINUE', () => {
    /* The shipped defect. The work was touched seconds ago — renamed, or given
       a form — but nothing was ever written in it. */
    const a = arrivalFor([work('w1', { updatedAt: iso(0), manuscriptId: 'm1' })], [
      ms('m1', { lastWrittenAt: null }),
    ]);
    expect(a.kind).toBe('orient');
    expect(a.resume).toBeNull();
  });

  it('⛔ the newest EMPTY work cannot outrank an older actively-written one', () => {
    const empty = work('w-empty', { title: 'Just renamed', updatedAt: iso(0) });
    const written = work('w-real', { title: 'Elemental Alchemy', updatedAt: iso(30), manuscriptId: 'm1' });
    const a = arrivalFor([empty, written], [ms('m1', { lastWrittenAt: iso(2) })]);
    expect(a.kind).toBe('continue');
    expect(a.resume?.id).toBe('w-real');
    /* and the empty work is still visible, just not impersonating activity */
    expect(a.shelf.map((w) => w.id)).toContain('w-empty');
  });

  it('picks the most recently WRITTEN work, not the most recently touched', () => {
    const older = work('w-older', { updatedAt: iso(0), manuscriptId: 'm-old' });
    const newer = work('w-newer', { updatedAt: iso(60), manuscriptId: 'm-new' });
    const a = arrivalFor(
      [older, newer],
      [ms('m-old', { lastWrittenAt: iso(20) }), ms('m-new', { lastWrittenAt: iso(1) })],
    );
    expect(a.resume?.id).toBe('w-newer');
  });

  it('⛔ orphan manuscript activity produces ORIENT, not CONTINUE', () => {
    /* Writing exists and was recently written — but no Work claims it, so
       there is nothing to "continue" in the Studio's own terms. */
    const a = arrivalFor([], [ms('m9', { lastWrittenAt: iso(1), chars: 151000 })]);
    expect(a.kind).toBe('orient');
    expect(a.resume).toBeNull();
    expect(a.feature?.id).toBe('m9');
  });

  it('ORIENT features the most substantial unclaimed writing', () => {
    const a = arrivalFor(
      [work('w1', { updatedAt: iso(0) })],
      [ms('small', { lastWrittenAt: null, chars: 900 }), ms('big', { lastWrittenAt: null, chars: 151000 })],
    );
    expect(a.kind).toBe('orient');
    expect(a.feature?.id).toBe('big');
    expect(a.imported.map((m) => m.id)).toEqual(['small']);
  });

  it('ORIENT with works but no writing at all still offers no continuation', () => {
    const a = arrivalFor([work('w1', { updatedAt: iso(0) })], []);
    expect(a.kind).toBe('orient');
    expect(a.resume).toBeNull();
    expect(a.feature).toBeNull();
    expect(a.shelf.map((w) => w.id)).toEqual(['w1']);
  });

  it('a claimed manuscript never appears as imported writing', () => {
    const a = arrivalFor([work('w1', { updatedAt: iso(5), manuscriptId: 'm1' })], [
      ms('m1', { lastWrittenAt: iso(1) }),
    ]);
    expect(a.feature).toBeNull();
    expect(a.imported).toEqual([]);
  });

  it('CONTINUE still surfaces unclaimed writing beneath the resumed work', () => {
    const a = arrivalFor([work('w1', { updatedAt: iso(5), manuscriptId: 'm1' })], [
      ms('m1', { lastWrittenAt: iso(1) }),
      ms('m9', { lastWrittenAt: null, chars: 151000 }),
    ]);
    expect(a.kind).toBe('continue');
    expect(a.imported.map((m) => m.id)).toEqual(['m9']);
  });

  it('⛔ an EMPTY manuscript with a draft timestamp never produces CONTINUE', () => {
    /* Observed live 2026-08-14. /manuscripts/blank creates a working-draft row
       alongside the blank manuscript and reuses untouched blanks, so a draft
       timestamp can exist with zero content. The Home promoted that work to
       the hero and rendered "No writing yet · written 6 hours ago". A row
       being touched is not a person writing. */
    const a = arrivalFor([work('w1', { title: 'Test', updatedAt: iso(0), manuscriptId: 'm-blank' })], [
      ms('m-blank', { lastWrittenAt: iso(0), chars: 0 }),
    ]);
    expect(a.kind).toBe('orient');
    expect(a.resume).toBeNull();
  });

  it('a work with one real character IS continuable', () => {
    const a = arrivalFor([work('w1', { updatedAt: iso(9), manuscriptId: 'm1' })], [
      ms('m1', { lastWrittenAt: iso(0), chars: 1 }),
    ]);
    expect(a.kind).toBe('continue');
    expect(a.resume?.id).toBe('w1');
  });
});
