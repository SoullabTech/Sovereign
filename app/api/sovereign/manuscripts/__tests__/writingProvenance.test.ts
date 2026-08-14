/**
 * `lastWrittenAt` must mean a member act, not a row mutation.
 *
 * Three production rows disproved three successive definitions of "writing
 * activity", each one a layer better than the last and each still measuring a
 * mutation:
 *
 *   living_work.updatedAt              — a RENAME moved it
 *   draft.updated_at on a blank draft  — CREATING the blank moved it
 *   draft.updated_at on a seeded import — the IMPORT moved it
 *
 * The third is the one these tests pin. Manuscript 33a9233c on production
 * carries 374,697 characters with manuscript, working draft and its only
 * revision all created in the same second (08-06 18:02:42) and never touched
 * since. Under the previous rule Studio Home would have offered to "continue
 * writing" a book nobody had written a word of in this system.
 *
 * The discriminator is `updated_at > created_at`, which is exact rather than
 * heuristic ONLY because every writer to that column was enumerated on this
 * SHA: both INSERT paths omit updated_at (so it equals created_at), both
 * UPDATE paths are member acts (save/autosave, restore-a-revision), and no
 * migration backfills it.
 */

import { arrivalFor } from '@/app/writers-studio/homeState';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';
import type { CurrentManuscript } from '@/app/writers-studio/useCurrentManuscript';

/** What the API returns AFTER the CASE — a seed yields null, an edit yields a time. */
const lastWrittenAt = (createdAt: string, updatedAt: string): string | null =>
  new Date(updatedAt).getTime() > new Date(createdAt).getTime() ? updatedAt : null;

const iso = (daysAgo: number, plusMinutes = 0) =>
  new Date(Date.now() - daysAgo * 86400000 + plusMinutes * 60000).toISOString();

const work = (id: string, title: string | null, manuscriptId?: string): LivingWork => ({
  id, title, purpose: null, form: null, stage: null,
  createdAt: iso(30), updatedAt: iso(0),
  expressions: manuscriptId
    ? [{ expressionType: 'manuscript', expressionId: manuscriptId, declaredAt: iso(1) }]
    : [],
  materials: [],
});

const ms = (id: string, chars: number, written: string | null, title = 'm'): CurrentManuscript => ({
  id, title, createdAt: iso(8), sectionCount: 1, charCount: chars, keepCount: 0,
  lastWrittenAt: written,
});

describe('lastWrittenAt — the API boundary', () => {
  it('a SEEDED IMPORT yields null: created and updated in the same second', () => {
    const t = iso(8);
    expect(lastWrittenAt(t, t)).toBeNull();
  });

  it('a BLANK PAGE yields null for the same reason', () => {
    const t = iso(0);
    expect(lastWrittenAt(t, t)).toBeNull();
  });

  it('a SAVE after creation yields the time of the save', () => {
    const created = iso(8);
    const saved = iso(8, 17);
    expect(lastWrittenAt(created, saved)).toBe(saved);
  });

  it('a clock that never advances is treated as no writing, not as writing', () => {
    /* Fail closed: equality and any impossible backwards value both yield null. */
    const created = iso(8);
    expect(lastWrittenAt(created, iso(8, -5))).toBeNull();
  });
});

describe('Studio Home — the production row that forced this fix', () => {
  /* 374,697 chars, created == updated, never touched. The real 33a9233c.
     ⚠️ SEED_AT is bound ONCE on purpose. Calling iso(8) twice returns two
     values a millisecond apart, which is not "the same second" — the first
     draft of this test did exactly that and manufactured a passing edit out
     of two identical-looking expressions. */
  const SEED_AT = iso(8);
  const seededImport = ms('33a9233c', 374697, lastWrittenAt(SEED_AT, SEED_AT), 'book-print-kdp-final');

  it('⛔ a populated SEEDED IMPORT stays ORIENT even after it belongs to a Work', () => {
    const a = arrivalFor([work('w-new', 'book-print-kdp-final', '33a9233c')], [seededImport]);
    expect(a.kind).toBe('orient');
    expect(a.resume).toBeNull();
  });

  it('⛔ it is not continuable while unclaimed either — it is the ORIENT feature', () => {
    const a = arrivalFor([], [seededImport]);
    expect(a.kind).toBe('orient');
    expect(a.feature?.id).toBe('33a9233c');
  });

  it('✅ ONE real save promotes the same manuscript to CONTINUE', () => {
    const edited = ms('33a9233c', 374697, lastWrittenAt(SEED_AT, iso(0)), 'book-print-kdp-final');
    const a = arrivalFor([work('w-new', 'book-print-kdp-final', '33a9233c')], [edited]);
    expect(a.kind).toBe('continue');
    expect(a.resume?.id).toBe('w-new');
  });

  it('⛔ a blank draft stays ORIENT — the earlier defect, still closed', () => {
    const t = iso(0);
    const blank = ms('m-blank', 0, lastWrittenAt(t, t));
    expect(arrivalFor([work('w1', 'Test', 'm-blank')], [blank]).kind).toBe('orient');
  });

  it('⛔ empty Works never outrank real writing, in either state', () => {
    /* The two production Inner Guide works: titled, zero characters, no
       manuscript. They must never become the hero. */
    const empties = [work('g1', 'An Inner Guide Meditation Book'), work('g2', 'Inner Guide Meditation')];
    const orient = arrivalFor(empties, [seededImport]);
    expect(orient.kind).toBe('orient');
    expect(orient.feature?.id).toBe('33a9233c');

    const edited = ms('33a9233c', 374697, lastWrittenAt(SEED_AT, iso(0)), 'book-print-kdp-final');
    const cont = arrivalFor([...empties, work('w-real', 'The Book', '33a9233c')], [edited]);
    expect(cont.kind).toBe('continue');
    expect(cont.resume?.id).toBe('w-real');
    expect(cont.shelf.map((w) => w.id)).toEqual(expect.arrayContaining(['g1', 'g2']));
  });

  it('fails closed to ORIENT when activity provenance is missing or unusable', () => {
    for (const bad of [null, '', 'not-a-date']) {
      const a = arrivalFor([work('w1', 'X', 'm1')], [ms('m1', 5000, bad as string | null)]);
      expect(a.kind).toBe('orient');
    }
  });
});
