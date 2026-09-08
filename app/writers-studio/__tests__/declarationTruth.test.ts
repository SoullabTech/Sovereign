import { readFileSync } from 'fs';
import { join } from 'path';
import {
  assertRoomClaimsNothingUnbuilt,
  assertShellPromisesNothing,
  capabilityOf,
  isBuilt,
  RATIFIED_UNPLACED,
  shellDestinations,
  STUDIO_MAP,
  visibleDestinations,
  type StudioGroup,
} from '../studioMap';
import { STRUCTURE_SURFACES } from '../canvas/StudioLowerBand';
import { declaringWorks } from '../workContext';
import type { LivingWork } from '../useLivingWorks';

/**
 * WRITER'S STUDIO — CAPABILITY COMPLETION · REPAIR TRUTH (D1–D4).
 *
 * The founder rule these make executable:
 *
 *     Implementation may lag ratified intent.
 *     Declaration may not lag known implementation.
 *
 * Every failure below is silent in production — a member simply sees a working
 * capability described as unavailable, and nobody notices because the rail
 * looks exactly the same either way. That is why these are tests and not a
 * review note.
 */

/** The room the Canvas actually declares, read from source so it cannot drift. */
const CANVAS_SOURCE = readFileSync(join(__dirname, '..', 'canvas', 'page.tsx'), 'utf8');
const WORK_DRAWER_SOURCE = readFileSync(join(__dirname, '..', 'canvas', 'WorkDrawer.tsx'), 'utf8');

describe('D1 · declaration truth — built capability is never declared unavailable', () => {
  it.each(['materials', 'structure', 'versions', 'statistics', 'conversations', 'notes', 'goals'])(
    '%s is declared BUILT, because a member opens it today',
    (id) => {
      const capability = capabilityOf(id);
      expect(capability).not.toBeNull();
      expect(isBuilt(capability!)).toBe(true);
    },
  );

  it('Statistics is actionable in the room that renders its figures', () => {
    /* The sharpest defect this repair closes: the rail drew Statistics
       unavailable while the lower band of the same screen displayed the word,
       section and version counts. */
    const groups = shellDestinations(true, undefined, {
      satisfiedInRoom: ['materials', 'structure', 'versions', 'conversations', 'statistics'],
      manuscriptId: 'm1',
    });
    const stats = groups.flatMap((g) => g.destinations).find((d) => d.id === 'statistics');
    expect(stats?.actionable).toBe(true);
    expect(stats?.satisfiedInRoom).toBe(true);
  });

  it('the Canvas hosts every in-room capability the map declares', () => {
    /* Otherwise the map says a capability is built and the room silently drops
       it, which is the same defect pointing the other way. */
    const inRoomIds = STUDIO_MAP.flatMap((g) => g.destinations)
      .filter((d) => d.availability === 'in-room')
      .map((d) => d.id);
    for (const id of inRoomIds) {
      expect(CANVAS_SOURCE).toContain(`'${id}'`);
    }
  });

  it('Insights records that its ratified function is already served by Develop', () => {
    /* D1: record the relationship rather than building a second MAIA authority
       beside a constituted one. */
    const insights = STUDIO_MAP.flatMap((g) => g.destinations).find((d) => d.id === 'insights');
    expect(insights?.availability).toBe('later');
    expect(insights?.servedBy?.mode).toBe('develop');
  });

  it('Home is unchanged: route-reachable only, nothing unbuilt, no dead links', () => {
    for (const has of [true, false]) {
      for (const d of visibleDestinations(has).flatMap((g) => g.destinations)) {
        expect(d.availability).toBe('available');
        expect(d.href).toBeTruthy();
      }
    }
  });
});

describe('FR-C · an unavailable destination must SAY its state, not merely dim', () => {
  it('every unavailable destination carries a reason, and every available one does not', () => {
    for (const has of [true, false]) {
      const groups = shellDestinations(has, undefined, { manuscriptId: has ? 'm1' : null });
      expect(() => assertShellPromisesNothing(groups)).not.toThrow();
      for (const d of groups.flatMap((g) => g.destinations)) {
        if (d.actionable) expect(d.unavailableBecause).toBeUndefined();
        else expect(d.unavailableBecause).toBeDefined();
      }
    }
  });

  it('distinguishes not-built from waiting-for-a-manuscript', () => {
    /* These are different sentences and must not collapse: telling a member an
       unbuilt capability "needs a manuscript" promises it arrives when they
       have one. */
    const withoutBook = shellDestinations(false).flatMap((g) => g.destinations);
    const manuscript = withoutBook.find((d) => d.id === 'manuscript');
    const discover = withoutBook.find((d) => d.id === 'discover');
    expect(manuscript?.unavailableBecause).toBe('needs-manuscript');
    expect(discover?.unavailableBecause).toBe('unbuilt');
  });

  it('says where a ratified function is already served instead of calling it absent', () => {
    const insights = shellDestinations(true, undefined, { manuscriptId: 'm1' })
      .flatMap((g) => g.destinations)
      .find((d) => d.id === 'insights');
    expect(insights?.unavailableBecause).toBe('served-elsewhere');
  });

  it('refuses a shell that leaves an unavailable destination silent', () => {
    /* The regression this ruling lost once already: a render that only dims. */
    const silent = [
      {
        id: 'g',
        region: 'work' as const,
        destinations: [
          { id: 'x', label: 'X', availability: 'later' as const, actionable: false, satisfiedInRoom: false },
        ],
      },
    ];
    expect(() => assertShellPromisesNothing(silent)).toThrow(/does not say why/);
  });
});

describe('D3 · capability truth has one authority; placement may have many', () => {
  it('a room may not promote a destination the map declares unbuilt', () => {
    expect(() => assertRoomClaimsNothingUnbuilt(['materials'])).not.toThrow();
    expect(() => assertRoomClaimsNothingUnbuilt(['discover'])).toThrow(/Capability truth lives in the map/);
    expect(() => assertRoomClaimsNothingUnbuilt(['nonesuch'])).toThrow(/does not name/);
  });

  it('a room naming an unbuilt destination cannot make it actionable anyway', () => {
    /* Belt and braces: even if the assertion above were bypassed, the
       projection itself refuses. Before this repair, satisfiedInRoom could
       promote any id at all. */
    const groups = shellDestinations(true, undefined, {
      satisfiedInRoom: ['discover', 'suggestions', 'word-web'],
      manuscriptId: 'm1',
    });
    for (const id of ['discover', 'suggestions', 'word-web']) {
      const d = groups.flatMap((g) => g.destinations).find((x) => x.id === id);
      expect(d?.actionable).toBe(false);
      expect(d?.satisfiedInRoom).toBe(false);
    }
  });

  it('the lower band projects availability rather than declaring it', () => {
    const outline = STRUCTURE_SURFACES.find((s) => s.id === 'outline');
    const threads = STRUCTURE_SURFACES.find((s) => s.id === 'threads');
    expect(outline?.available).toBe(isBuilt(capabilityOf('structure')!));
    expect(threads?.available).toBe(isBuilt(capabilityOf('threads')!));
    /* and it may not invent a surface studioMap.ts does not record */
    for (const s of STRUCTURE_SURFACES) {
      const id = s.id === 'outline' ? 'structure' : s.id;
      expect(capabilityOf(id)).not.toBeNull();
    }
  });

  it('Threads is ratified and unplaced — never silently dropped, never a 17th destination', () => {
    /* D-019 settles the rail at sixteen. Threads is ratified by FIELD-MAP §3/§4.
       Both hold: the capability is recorded, the grammar is untouched. */
    const railIds = STUDIO_MAP.flatMap((g) => g.destinations).map((d) => d.id);
    expect(railIds).not.toContain('threads');
    expect(railIds).toHaveLength(16);
    expect(RATIFIED_UNPLACED.map((u) => u.id)).toContain('threads');
    expect(capabilityOf('threads')).toBe('later');
  });

  it('nothing in the unplaced register can reach a member', () => {
    const shown = [true, false].flatMap((h) =>
      visibleDestinations(h).flatMap((g) => g.destinations).map((d) => d.id),
    );
    for (const u of RATIFIED_UNPLACED) expect(shown).not.toContain(u.id);
  });
});

describe('D4 · a reversible act may not hide the gesture that reverses it', () => {
  /* ⚠️ CORRECTED BY A FRESHNESS MERGE. This lane implemented the D4 repair
     independently, not knowing canonical had already shipped it as
     WS-WORKDRAWER-01 under the same founder ruling — with its own
     `workDeclarations` module and better copy. The duplicate was dropped and
     canonical's kept, which is the rule this whole lane exists to enforce: do
     not build a second implementation while an existing viable one can be
     converged.

     The assertion therefore tests the RULE against whatever implements it,
     rather than pinning the phrasing of one branch's version. */
  it('the drawer answers the ambiguous state with withdrawal, not another declaration', () => {
    const i = WORK_DRAWER_SOURCE.indexOf("state === 'ambiguous'");
    expect(i).toBeGreaterThan(-1);
    const branch = WORK_DRAWER_SOURCE.slice(i, i + 1600);
    expect(branch).toContain('undeclare(w.id)');
    expect(branch).not.toContain('ShapeGesture');
  });

  it('the ambiguous state is derived, never guessed', () => {
    expect(WORK_DRAWER_SOURCE).toContain('worksDeclaring(');
    expect(WORK_DRAWER_SOURCE).toContain('declarationState(');
  });
});
