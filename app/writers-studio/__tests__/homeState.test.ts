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

import { arrivalFor, homeWritingExtent } from '../homeState';
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

/**
 * STUDIO-WRITING-PRESENCE-01. `chars` is SOURCE extent and stays that. The
 * presence facts default to the shape these tests were written against — an
 * imported manuscript with substance that the member has genuinely edited — so
 * existing cases keep their meaning; the new falsifiers set them explicitly.
 */
const ms = (
  id: string,
  opts: {
    lastMemberDraftActivityAt: string | null;
    chars?: number;
    title?: string | null;
    draftChars?: number | null;
    hasDraftWriting?: boolean;
    hasWriting?: boolean;
    contributed?: boolean;
  },
): CurrentManuscript => ({
  id,
  title: opts.title ?? null,
  createdAt: iso(50),
  sectionCount: 1,
  charCount: opts.chars ?? 1000,
  keepCount: 0,
  lastMemberDraftActivityAt: opts.lastMemberDraftActivityAt,
  draftCharCount: opts.draftChars ?? null,
  hasDraftWriting: opts.hasDraftWriting ?? false,
  hasWriting: opts.hasWriting ?? (opts.chars ?? 1000) > 0,
  hasCurrentMemberContribution: opts.contributed ?? (opts.chars ?? 1000) > 0,
});

describe('Studio Home — arrival state', () => {
  it('BEGIN when neither works nor writing exist', () => {
    expect(arrivalFor([], []).kind).toBe('begin');
  });

  it('CONTINUE when a work has real writing activity', () => {
    const a = arrivalFor([work('w1', { updatedAt: iso(9), manuscriptId: 'm1' })], [
      ms('m1', { lastMemberDraftActivityAt: iso(1) }),
    ]);
    expect(a.kind).toBe('continue');
    expect(a.resume?.id).toBe('w1');
  });

  it('⛔ a Work-row timestamp alone NEVER produces CONTINUE', () => {
    /* The shipped defect. The work was touched seconds ago — renamed, or given
       a form — but nothing was ever written in it. */
    const a = arrivalFor([work('w1', { updatedAt: iso(0), manuscriptId: 'm1' })], [
      ms('m1', { lastMemberDraftActivityAt: null }),
    ]);
    expect(a.kind).toBe('orient');
    expect(a.resume).toBeNull();
  });

  it('⛔ the newest EMPTY work cannot outrank an older actively-written one', () => {
    const empty = work('w-empty', { title: 'Just renamed', updatedAt: iso(0) });
    const written = work('w-real', { title: 'Elemental Alchemy', updatedAt: iso(30), manuscriptId: 'm1' });
    const a = arrivalFor([empty, written], [ms('m1', { lastMemberDraftActivityAt: iso(2) })]);
    expect(a.kind).toBe('continue');
    expect(a.resume?.id).toBe('w-real');
    /* and the empty work is still visible, just not impersonating activity */
    expect(a.shelf.map((w) => w.id)).toContain('w-empty');
  });

  /* ⚠️ Renamed 2026-09-08: this orders by latest MEMBER DRAFT ACTIVITY among
     Works already proven continuable. A checkpoint moves that timestamp without
     changing a character, so it never established "most recently written". */
  it('orders eligible works by latest draft activity, not by row touch', () => {
    const older = work('w-older', { updatedAt: iso(0), manuscriptId: 'm-old' });
    const newer = work('w-newer', { updatedAt: iso(60), manuscriptId: 'm-new' });
    const a = arrivalFor(
      [older, newer],
      [ms('m-old', { lastMemberDraftActivityAt: iso(20) }), ms('m-new', { lastMemberDraftActivityAt: iso(1) })],
    );
    expect(a.resume?.id).toBe('w-newer');
  });

  it('⛔ orphan manuscript activity produces ORIENT, not CONTINUE', () => {
    /* Writing exists and carries recent draft activity — but no Work claims it, so
       there is nothing to "continue" in the Studio's own terms. */
    const a = arrivalFor([], [ms('m9', { lastMemberDraftActivityAt: iso(1), chars: 151000 })]);
    expect(a.kind).toBe('orient');
    expect(a.resume).toBeNull();
    expect(a.feature?.id).toBe('m9');
  });

  it('ORIENT features the most substantial unclaimed writing', () => {
    const a = arrivalFor(
      [work('w1', { updatedAt: iso(0) })],
      [ms('small', { lastMemberDraftActivityAt: null, chars: 900 }), ms('big', { lastMemberDraftActivityAt: null, chars: 151000 })],
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
      ms('m1', { lastMemberDraftActivityAt: iso(1) }),
    ]);
    expect(a.feature).toBeNull();
    expect(a.imported).toEqual([]);
  });

  it('CONTINUE still surfaces unclaimed writing beneath the resumed work', () => {
    const a = arrivalFor([work('w1', { updatedAt: iso(5), manuscriptId: 'm1' })], [
      ms('m1', { lastMemberDraftActivityAt: iso(1) }),
      ms('m9', { lastMemberDraftActivityAt: null, chars: 151000 }),
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
      ms('m-blank', { lastMemberDraftActivityAt: iso(0), chars: 0 }),
    ]);
    expect(a.kind).toBe('orient');
    expect(a.resume).toBeNull();
  });

  /**
   * WS-HOME-REDESIGN v0.2 — RETURN is plural.
   *
   * A single hero made recency masquerade as priority: the newest thing was
   * the only thing offered, and every other live work was demoted to a list
   * beneath a heading. A writer cycling among works by inspiration was being
   * told, every arrival, which one to resume.
   */
  describe('RETURN offers the live work, not only the newest', () => {
    const written = (n: number, daysAgo: number) => ({
      w: work(`w${n}`, { title: `Work ${n}`, updatedAt: iso(50), manuscriptId: `m${n}` }),
      m: ms(`m${n}`, { lastMemberDraftActivityAt: iso(daysAgo) }),
    });

    it('offers up to two other written works beside the resumed one', () => {
      const rows = [written(1, 1), written(2, 3), written(3, 8)];
      const a = arrivalFor(rows.map((r) => r.w), rows.map((r) => r.m));
      expect(a.resume?.id).toBe('w1');
      expect(a.alsoWritten.map((w) => w.id)).toEqual(['w2', 'w3']);
      expect(a.shelf).toEqual([]);
    });

    it('⛔ never offers a work that has no writing in it', () => {
      const live = written(1, 1);
      const empty = work('w-empty', { title: 'Renamed yesterday', updatedAt: iso(0) });
      const a = arrivalFor([empty, live.w], [live.m]);
      expect(a.alsoWritten).toEqual([]);
      expect(a.shelf.map((w) => w.id)).toEqual(['w-empty']);
    });

    it('caps RETURN and passes the rest to the shelf — nothing is lost', () => {
      const rows = [written(1, 1), written(2, 2), written(3, 3), written(4, 4), written(5, 5)];
      const a = arrivalFor(rows.map((r) => r.w), rows.map((r) => r.m));
      const offered = [a.resume!.id, ...a.alsoWritten.map((w) => w.id)];
      expect(offered).toEqual(['w1', 'w2', 'w3']);
      expect(a.shelf.map((w) => w.id)).toEqual(['w4', 'w5']);
      /* Every work appears exactly once — a work in both RETURN and the shelf
         would let a member delete it in one place and still see it in the
         other. */
      expect([...offered, ...a.shelf.map((w) => w.id)].sort()).toEqual([
        'w1', 'w2', 'w3', 'w4', 'w5',
      ]);
    });

    it('ORIENT and BEGIN offer nothing to return to', () => {
      expect(arrivalFor([], []).alsoWritten).toEqual([]);
      expect(arrivalFor([work('w1', { updatedAt: iso(0) })], []).alsoWritten).toEqual([]);
    });
  });

  it('a work with one real character IS continuable', () => {
    const a = arrivalFor([work('w1', { updatedAt: iso(9), manuscriptId: 'm1' })], [
      ms('m1', { lastMemberDraftActivityAt: iso(0), chars: 1 }),
    ]);
    expect(a.kind).toBe('continue');
    expect(a.resume?.id).toBe('w1');
  });
});


/**
 * STUDIO-WRITING-PRESENCE-01 — F1…F12, the ratified falsifier set.
 *
 * The lane exists because a SOURCE character count was answering a presence
 * question. `manuscript_sections` is written by exactly one route — import — so
 * anything begun in the Studio had charCount 0 forever, however much the member
 * wrote.
 *
 * ⭐ F5b is the decisive one. A design that passes F1–F5a and fails F5b has
 * changed vocabulary and nothing else.
 */
describe('STUDIO-WRITING-PRESENCE-01 — presence, authorship, extent', () => {
  const W = (mid: string) => work('w1', { updatedAt: iso(3), manuscriptId: mid });
  /* ⚠️ The arrival kind is 'continue'. An earlier draft of this helper compared
     against 'return', which made every NEGATIVE case here pass vacuously — a
     falsifier that cannot fail proves nothing. Asserted below so the literal
     cannot drift back out of agreement with homeState. */
  const continuable = (m: CurrentManuscript) => arrivalFor([W(m.id)], [m]).kind === 'continue';

  it('F0 the helper can actually observe continuability (guards F1\u2013F12)', () => {
    const genuine = ms('m', {
      lastMemberDraftActivityAt: iso(1), chars: 0, draftChars: 4200,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    expect(continuable(genuine)).toBe(true);
  });

  it('F1 untouched blank: no writing, no contribution, not continuable', () => {
    const m = ms('m', { lastMemberDraftActivityAt: null, chars: 0, hasWriting: false, contributed: false });
    expect(m.hasWriting).toBe(false);
    expect(continuable(m)).toBe(false);
  });

  it('F2 touched then emptied: draft activity moved, still not continuable', () => {
    const m = ms('m', { lastMemberDraftActivityAt: iso(1), chars: 0, hasWriting: false, contributed: false });
    expect(m.lastMemberDraftActivityAt).not.toBeNull();
    expect(continuable(m)).toBe(false);
  });

  it('F3 Studio-born with real writing: continuable despite zero Source', () => {
    const m = ms('m', {
      lastMemberDraftActivityAt: iso(1), chars: 0, draftChars: 4200,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    expect(continuable(m)).toBe(true);
  });

  it('F4 imported, no draft yet: Source supplies the extent', () => {
    const m = ms('m', { lastMemberDraftActivityAt: null, chars: 9000, contributed: false });
    const { feature } = arrivalFor([], [m]);
    expect(feature?.id).toBe('m');
  });

  it('F5a imported, seeded, untouched: writing exists but is not the member\u2019s', () => {
    const m = ms('m', {
      lastMemberDraftActivityAt: null, chars: 9000, draftChars: 9000,
      hasDraftWriting: true, hasWriting: true, contributed: false,
    });
    expect(continuable(m)).toBe(false);
  });

  it('\u2b50 F5b THE CHECKPOINT FALSIFIER: draft activity without authorship', () => {
    /* import seed \u2192 member presses "Keep a version". The checkpoint route
       advances updated_at and the revision trail and changes NO content. */
    const m = ms('m', {
      lastMemberDraftActivityAt: iso(1), chars: 9000, draftChars: 9000,
      hasDraftWriting: true, hasWriting: true, contributed: false,
    });
    expect(m.lastMemberDraftActivityAt).not.toBeNull();          // draft activity: TRUE
    expect(m.hasCurrentMemberContribution).toBe(false);
    expect(continuable(m)).toBe(false);              // and NOT continuable
  });

  it('F6 imported then genuinely edited: continuable', () => {
    const m = ms('m', {
      lastMemberDraftActivityAt: iso(1), chars: 9000, draftChars: 9400,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    expect(continuable(m)).toBe(true);
  });

  it('F7 edited then restored to Source exactly: no current divergence', () => {
    const m = ms('m', {
      lastMemberDraftActivityAt: iso(1), chars: 9000, draftChars: 9000,
      hasDraftWriting: true, hasWriting: true, contributed: false,
    });
    expect(continuable(m)).toBe(false);
  });

  it('F10 a large Studio-born draft outranks a one-page import', () => {
    const born = ms('born', {
      lastMemberDraftActivityAt: iso(1), chars: 0, draftChars: 200_000,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    const imported = ms('imported', { lastMemberDraftActivityAt: null, chars: 1800, contributed: false });
    expect(arrivalFor([], [imported, born]).feature?.id).toBe('born');
  });

  it('F11 Source non-empty with an emptied draft still has writing, and orients by Source', () => {
    const emptied = ms('emptied', {
      lastMemberDraftActivityAt: iso(1), chars: 200_000, draftChars: 0,
      hasDraftWriting: false, hasWriting: true, contributed: true,
    });
    const small = ms('small', {
      lastMemberDraftActivityAt: iso(2), chars: 0, draftChars: 500,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    expect(emptied.hasWriting).toBe(true);
    /* featureExtent falls back to Source, so 200k outranks 500 — and it is NOT
       max(): the draft governs whenever it holds substantive writing. */
    expect(arrivalFor([], [small, emptied]).feature?.id).toBe('emptied');
  });

  it('F11b a shortened draft governs over its larger Source (never max)', () => {
    const shortened = ms('shortened', {
      lastMemberDraftActivityAt: iso(1), chars: 200_000, draftChars: 10_000,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    const other = ms('other', {
      lastMemberDraftActivityAt: iso(2), chars: 0, draftChars: 50_000,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    expect(arrivalFor([], [other, shortened]).feature?.id).toBe('other');
  });

  it('F12 a missing revision-1 baseline fails closed: not continuable', () => {
    const m = ms('m', {
      lastMemberDraftActivityAt: iso(1), chars: 9000, draftChars: 9000,
      hasDraftWriting: true, hasWriting: true, contributed: false,
    });
    expect(continuable(m)).toBe(false);
  });
});


/**
 * STUDIO-WRITING-PRESENCE-01 — the two corrections that closed the build review.
 */
describe('extent and substance', () => {
  it('\u2b50 a Studio-born draft reports its OWN extent, not Source', () => {
    /* pageEstimate clamps to 1, so reading Source here would have said "1 page"
       for a four-thousand-word draft: the sentence fixed, the number beside it
       still false. */
    const born = {
      charCount: 0, draftCharCount: 4200, hasDraftWriting: true, hasWriting: true,
    };
    expect(homeWritingExtent(born)).toBe(4200);
  });

  it('an emptied draft falls back to Source extent', () => {
    expect(homeWritingExtent({ charCount: 200_000, draftCharCount: 0, hasDraftWriting: false }))
      .toBe(200_000);
  });

  it('a shortened draft governs over its larger Source — never max()', () => {
    expect(homeWritingExtent({ charCount: 200_000, draftCharCount: 10_000, hasDraftWriting: true }))
      .toBe(10_000);
  });

  it('a whitespace-only draft contributes no extent', () => {
    /* hasDraftWriting is false for whitespace (asserted against the SQL predicate
       in the API test), so the extent falls back to Source — 0 here. */
    expect(homeWritingExtent({ charCount: 0, draftCharCount: 12, hasDraftWriting: false })).toBe(0);
  });
});

/**
 * WS-MAKE-WORK-REACH-01 — the doorway must live where the writing lives.
 *
 * ⛔ Found in production 2026-09-09. "Make this a work" was wired and working,
 * and rendered in exactly ONE place: beside the `feature` writing. `feature` is
 * non-null only in the `orient` arrival, so a member with even one continuable
 * Work lands in `return`, `feature` is null, and the action is not on the page
 * at all — their unclaimed writing can only be opened or deleted, forever.
 *
 * These assert the ARRIVAL FACT that made it unreachable. The rendering is
 * asserted structurally beneath.
 */
describe('WS-MAKE-WORK-REACH-01 — unclaimed writing is reachable from any arrival', () => {
  const writing = (id: string, chars = 9000) =>
    ms(id, { lastMemberDraftActivityAt: null, chars, contributed: false });

  it('⛔ the arrival that hid it: one continuable Work ⇒ return ⇒ feature is null', () => {
    const w = work('w1', { updatedAt: iso(1), manuscriptId: 'm-live' });
    const live = ms('m-live', {
      lastMemberDraftActivityAt: iso(1), chars: 0, draftChars: 4200,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    const a = arrivalFor([w], [live, writing('e1'), writing('e2')]);

    expect(a.kind).toBe('continue');
    expect(a.feature).toBeNull();
    /* …yet the unclaimed writing is still there, and still the member's to act on. */
    expect(a.imported.map((m) => m.id).sort()).toEqual(['e1', 'e2']);
  });

  it('the same writing IS the feature when nothing is continuable', () => {
    const a = arrivalFor([], [writing('e1'), writing('e2', 100)]);
    expect(a.kind).toBe('orient');
    expect(a.feature?.id).toBe('e1');
  });

  it('⭐ unclaimed writing appears in EVERY arrival that has any', () => {
    /* feature ∪ imported is the whole unclaimed set, in both arrivals — so a
       surface offered on both reaches all of it, and one offered only on
       `feature` reaches none of it in `return`. */
    const w = work('w1', { updatedAt: iso(1), manuscriptId: 'm-live' });
    const live = ms('m-live', {
      lastMemberDraftActivityAt: iso(1), chars: 0, draftChars: 4200,
      hasDraftWriting: true, hasWriting: true, contributed: true,
    });
    for (const arrival of [
      arrivalFor([w], [live, writing('e1'), writing('e2')]),
      arrivalFor([], [writing('e1'), writing('e2', 100)]),
    ]) {
      const reachable = [arrival.feature?.id, ...arrival.imported.map((m) => m.id)]
        .filter(Boolean)
        .sort();
      expect(reachable).toEqual(['e1', 'e2']);
    }
  });
});
