import * as fs from 'fs';
import * as path from 'path';
import {
  STUDIO_MAP,
  STUDIO_MODES,
  assertModesHonest,
  assertShellPromisesNothing,
  shellDestinations,
  visibleDestinations,
} from '../studioMap';
import { PANELS, writingFieldLayout, LAYOUT_TOLERANCE, COLUMN_FRACTION } from '../studioTheme';
import { CANVAS_MANUSCRIPT_PARAM, resolveManuscript } from '../canvasIdentity';
import {
  assertRoundTripPreservesWork,
  handoffToMaia,
  resolveWorkContext,
  MAIA_WORK_PARAM,
} from '../workContext';
import type { LivingWork } from '../useLivingWorks';

const read = (...p: string[]) =>
  fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const page = strip(read('canvas', 'page.tsx'));
const maiaColumn = strip(read('canvas', 'MaiaColumn.tsx'));
const outline = strip(read('canvas', 'ManuscriptOutline.tsx'));
const band = strip(read('canvas', 'StudioLowerBand.tsx'));
const modeBar = strip(read('studio', 'StudioModeBar.tsx'));

/**
 * WS2-03B — the real Writer's Studio shell.
 *
 * 03A projected the accepted primitives onto the old composition and the room
 * still read as the old Canvas. These tests hold what the composition must be
 * and, more importantly, what it may not fabricate to get there: reference 04
 * is a picture of a finished Studio, and every beautiful thing in it that has
 * no substrate is a temptation with a name.
 */

/* ══ 1 · THE COMPOSITION IS ACTUALLY DIFFERENT ═══════════════════════════ */

describe('the old composition is gone, not re-skinned', () => {
  it('no longer runs a folded drawer spine with one drawer at a time', () => {
    // The 03A room's whole shape: a DrawerId union, a single `drawer` state,
    // and a vertical writing-mode nav. If any of it survives, the projection
    // seam survived with it.
    expect(page).not.toMatch(/type DrawerId/);
    expect(page).not.toMatch(/writing-mode:vertical-rl/);
    expect(page).not.toMatch(/DRAWER_PANEL_ROLE/);
  });

  it('no longer hides MAIA behind a 40px folded hinge', () => {
    expect(page).not.toMatch(/windowOpen \? 'w-80' : 'w-10'/);
    expect(page).toContain('MaiaColumn');
  });

  it('carries the five-mode shell and the lower band the room never had', () => {
    expect(page).toContain('StudioModeBar');
    expect(page).toContain('StudioLowerBand');
    expect(page).toContain('StudioShellRail');
  });
});

/* ══ 2 · GEOMETRY — 04's MEASURED PROPORTIONS, IN THE REAL ROOM ══════════ */

describe('the writing field takes its measured share', () => {
  it('is an explicit width, never a flex remainder', () => {
    // The WS2-02B defect, and the one this layout is built to make impossible:
    // the field rendered at 33.3% while the token table said 35.2%, because it
    // took whatever was left rather than what was measured.
    const field = page.slice(page.indexOf('data-panel-role="writing-field"'));
    const style = field.slice(0, field.indexOf('}}'));
    expect(style).toMatch(/width: compact \? '100%' : pct\(L\.writingField\)/);
    expect(style).not.toMatch(/flex:\s*1/);
    // Nor may any column beside it grow into the field's share.
    expect(page).not.toMatch(/pct\(L\.\w+\),\s*\n\s*flex: 1/);
  });

  it('resolves every one of 04’s five columns through writingFieldLayout', () => {
    for (const col of ['rail', 'outlinePanel', 'writingField', 'maiaPanel', 'materialsPanel']) {
      expect(page).toContain(`L.${col}`);
    }
    expect(page).toContain('writingFieldLayout(NOTIONAL, columnsShown)');
  });

  it('reproduces the reference share within the stated tolerance', () => {
    const L = writingFieldLayout(100000);
    const share = L.writingField / 100000;
    expect(Math.abs(share - COLUMN_FRACTION.writingField)).toBeLessThan(LAYOUT_TOLERANCE);
  });

  it('keeps the field the largest column when a panel is dismissed', () => {
    // A dismissed panel leaves the row and its share is redivided in the same
    // measured ratio — the field can only grow, never be squeezed.
    const full = writingFieldLayout(100000);
    const fewer = writingFieldLayout(100000, [
      'rail', 'outlinePanel', 'writingField', 'maiaPanel',
    ]);
    expect(fewer.writingField).toBeGreaterThan(full.writingField);
    for (const c of ['rail', 'outlinePanel', 'maiaPanel'] as const) {
      expect(fewer.writingField).toBeGreaterThan(fewer[c]);
    }
  });
});

/* ══ 3 · THE SHELL RAIL — SIXTEEN, AND SIXTEEN HONEST ════════════════════ */

describe('the shell rail shows the whole Studio and promises none of it', () => {
  /* `hasManuscript` and a manuscript id are one fact, not two: if the room has
     a manuscript it can name it. Passing them apart described a state that
     cannot occur, and the identity guard rightly rejects it. */
  const groups = (has = true) =>
    shellDestinations(has, STUDIO_MAP, {
      satisfiedInRoom: ['materials', 'structure', 'versions'],
      manuscriptId: has ? 'ms-on-the-table' : null,
    });

  it('preserves D-019’s exact semantic grouping — 7 + 4 + 5', () => {
    const g = groups();
    expect(g.map((x) => x.region)).toEqual(['work', 'maia', 'tools']);
    expect(g.map((x) => x.destinations.length)).toEqual([7, 4, 5]);
    expect(g[0].destinations.map((d) => d.label)).toEqual([
      'Home', 'Manuscript', 'Materials', 'Structure', 'Notes', 'Versions', 'Goals',
    ]);
    expect(g[1].destinations.map((d) => d.label)).toEqual([
      'Conversations', 'Discover', 'Insights', 'Suggestions',
    ]);
    expect(g[2].destinations.map((d) => d.label)).toEqual([
      'Find/Replace', 'Statistics', 'Timeline', 'Word Web', 'Export',
    ]);
  });

  it('never lets an unavailable destination carry a link or a count', () => {
    for (const has of [true, false]) {
      expect(() => assertShellPromisesNothing(groups(has))).not.toThrow();
      for (const d of groups(has).flatMap((x) => x.destinations)) {
        if (!d.actionable) {
          expect(d.href).toBeUndefined();
          expect(d.count).toBeUndefined();
        }
      }
    }
  });

  it('strips 04’s reference counts before they can reach a member', () => {
    // STUDIO_MAP carries count 24 on Materials and 12 on Notes because the
    // reference draws them. They are the reference author's figures. Shipping
    // them would tell a member they have twenty-four materials they do not.
    const mapCounts = STUDIO_MAP.flatMap((g) => g.destinations)
      .filter((d) => typeof d.count === 'number');
    expect(mapCounts.length).toBeGreaterThan(0);

    const notes = groups().flatMap((g) => g.destinations).find((d) => d.id === 'notes')!;
    expect(notes.count).toBeUndefined();
    const materials = groups().flatMap((g) => g.destinations).find((d) => d.id === 'materials')!;
    expect(materials.count).toBeUndefined();
  });

  it('shows a count only when the shell counted one itself', () => {
    const withReal = shellDestinations(true, STUDIO_MAP, {
      counts: { materials: 3 }, satisfiedInRoom: ['materials'], manuscriptId: 'ms-x',
    });
    const m = withReal.flatMap((g) => g.destinations).find((d) => d.id === 'materials')!;
    expect(m.count).toBe(3);
  });

  it('carries the manuscript identity into every manuscript-scoped link', () => {
    /* The shell rail rendered destination.href verbatim, so Export pointed at
       /press/manuscript?tab=export with no manuscript named — and that room
       falls back to list[0].id. A link the shell itself wrote would have
       opened a different book. Dead links were guarded; addressed ones were
       not. */
    const withId = shellDestinations(true, STUDIO_MAP, {
      satisfiedInRoom: ['materials', 'structure', 'versions'],
      manuscriptId: 'ms-on-the-table',
    }).flatMap((g) => g.destinations);

    for (const d of withId) {
      if (!d.actionable || d.satisfiedInRoom || !d.requiresManuscript) continue;
      expect(d.href).toContain(`${CANVAS_MANUSCRIPT_PARAM}=ms-on-the-table`);
    }
    const exp = withId.find((d) => d.id === 'export')!;
    expect(exp.href).toBe('/press/manuscript?tab=export&m=ms-on-the-table');
    const ms = withId.find((d) => d.id === 'manuscript')!;
    expect(ms.href).toContain('m=ms-on-the-table');
  });

  it('refuses a manuscript-scoped link that does not name its manuscript', () => {
    // Structural, not a convention: the boundary throws rather than shipping
    // a link that resolves and opens something else.
    const noId = shellDestinations(true, STUDIO_MAP, {});
    expect(() => assertShellPromisesNothing(noId)).toThrow(/does not name one/);
  });

  it('leaves links alone that are not manuscript-scoped', () => {
    const home = shellDestinations(true, STUDIO_MAP, { manuscriptId: 'ms-x' })
      .flatMap((g) => g.destinations)
      .find((d) => d.id === 'home')!;
    expect(home.href).toBe('/writers-studio');
  });

  it('does not activate Conversations to match the reference', () => {
    const conv = groups().flatMap((g) => g.destinations).find((d) => d.id === 'conversations')!;
    expect(conv.actionable).toBe(false);
    expect(conv.href).toBeUndefined();
  });

  it('leaves Studio Home’s drop-boundary untouched', () => {
    // The amendment is scoped to the shell. Home still drops `later` entirely.
    for (const has of [true, false]) {
      const shown = visibleDestinations(has).flatMap((g) => g.destinations);
      expect(shown.filter((d) => d.availability === 'later')).toEqual([]);
    }
  });

  it('advertises nothing as coming soon, in the rail or anywhere else', () => {
    for (const src of [page, modeBar, band, maiaColumn, outline]) {
      expect(src.toLowerCase()).not.toContain('coming soon');
      expect(src.toLowerCase()).not.toContain('not yet available');
    }
  });
});

describe('the parameter the shell writes is the one the destination reads', () => {
  it('/press/manuscript still reads CANVAS_MANUSCRIPT_PARAM', () => {
    /* The original WS2-01-adjacent defect was a producer and a consumer
       disagreeing about a parameter name while every other check passed. The
       shell now writes manuscript identity into a link aimed at another room,
       so that room's reader is pinned here: if it renames the parameter, this
       fails instead of the link silently opening list[0]. */
    const room = fs.readFileSync(
      path.join(__dirname, '..', '..', 'press', 'manuscript', 'page.tsx'),
      'utf8',
    );
    expect(room).toMatch(
      new RegExp(`searchParams\\?\\.get\\('${CANVAS_MANUSCRIPT_PARAM}'\\)`),
    );
  });
});

describe('MAIA’s panel can be brought back', () => {
  it('offers a show/hide toggle for the panel itself', () => {
    /* Her panel was dismissible with no route home: every other panel reopens
       from the rail, and her whole rail band is unavailable by design. */
    expect(page).toContain('data-panel-toggle="maia"');
    expect(page).toContain("summon('maia')");
    expect(page).toMatch(/aria-pressed=\{maiaOpen\}/);
  });

  it('does so without making any MAIA destination look reachable', () => {
    // Fixing the bug by putting a live MAIA entry in the rail would have made
    // the band look navigable — the exact promise WS2-03B refuses to make.
    const conv = shellDestinations(true, STUDIO_MAP, { satisfiedInRoom: ['materials'], manuscriptId: 'ms-x' })
      .flatMap((g) => g.destinations)
      .find((d) => d.id === 'conversations')!;
    expect(conv.actionable).toBe(false);
    expect(conv.href).toBeUndefined();
    // A toggle, not a link.
    const toggle = page.slice(page.indexOf('data-panel-toggle="maia"'));
    expect(toggle.slice(0, 400)).not.toMatch(/href/);
  });
});

/* ══ 4 · THE FIVE MODES ══════════════════════════════════════════════════ */

describe('the mode bar is the Studio’s shape, not a promise', () => {
  it('names all five', () => {
    expect(STUDIO_MODES.map((m) => m.label)).toEqual([
      'Write', 'Develop', 'Explore', 'Review', 'Publish',
    ]);
  });

  /* Written when Write was the only built room, this asserted the snapshot
     ("only Write") rather than the rule. BUILD-07D built the Develop room, so
     the snapshot is stale by construction while the rule is unchanged: a mode
     is available exactly when it has somewhere to go, and a mode that is not
     built promises nothing. That is what assertModesHonest enforces, and it is
     what this now asserts — so the next room to be built moves its own mode
     without editing this test again. */
  it('gives a room to exactly the modes that have one', () => {
    expect(() => assertModesHonest()).not.toThrow();
    for (const m of STUDIO_MODES) {
      if (m.availability === 'available') expect(m.href).toBeTruthy();
      else expect(m.href).toBeUndefined();
    }
    expect(STUDIO_MODES.filter((m) => m.availability === 'available').map((m) => m.id))
      .toEqual(['write', 'develop']);
  });

  it('renders the unavailable four as unpressable spans', () => {
    expect(modeBar).toMatch(/<span/);
    expect(modeBar).toContain("'aria-disabled': true");
    expect(modeBar).not.toMatch(/onClick/);
    expect(modeBar).not.toMatch(/<a\b/);
  });

  it('spends gold only on the mode that is live', () => {
    expect(modeBar).toMatch(/active[\s\S]{0,120}GOLD\.DEFAULT/);
  });
});

/* ══ 5 · MANUSCRIPT IDENTITY — THE WS2-01 MINIMUM ════════════════════════ */

describe('an unresolvable manuscript identity fails visibly', () => {
  /* Synthetic ids on purpose.
     An earlier version of this block used the two ids from the WS2-01 finding
     and read them as two manuscripts. They are not: a3ae67fd is the requested
     MANUSCRIPT and ce284751 is the authenticated MEMBER, and that manuscript
     WAS owned by that member. So the original defect cannot be reproduced at
     this level at all — the list handed to the resolver is what was wrong,
     one layer up, and that is WS2-01's to find. Borrowing the real ids here
     would dress a generic property test as a reproduction of the defect. */
  const LIB = [
    { id: 'ms-first', title: 'A book with sections' },
    { id: 'ms-second', title: 'Something else' },
  ];

  it('never silently substitutes manuscripts[0] for a named identity', () => {
    const r = resolveManuscript('ms-not-in-this-list', LIB);
    expect(r.kind).toBe('unresolved');
    expect(r).not.toHaveProperty('manuscript');
  });

  it('has removed the fallback from the room itself', () => {
    expect(page).not.toMatch(/manuscripts\[0\]/);
    expect(page).not.toMatch(/\?\?\s*manuscripts\[0\]/);
    // And the sentence that made the substitution sound like a courtesy.
    expect(page).not.toContain('The most recent of your');
  });

  it('renders the refusal as a refusal, not as an error', () => {
    expect(page).toContain("resolution.kind === 'unresolved'");
    expect(page).toMatch(/data-state="refusal"/);
    expect(page).toContain('not on your shelf');
  });

  it('asks rather than guesses when nothing was named and several exist', () => {
    const r = resolveManuscript(null, LIB);
    expect(r.kind).toBe('ambiguous');
    expect(page).toContain("resolution.kind === 'ambiguous'");
    expect(page).toContain('Which one are you working on?');
  });

  it('still opens straight through in the unambiguous cases', () => {
    expect(resolveManuscript(null, [LIB[0]])).toEqual({
      kind: 'resolved', manuscript: LIB[0], wasRequested: false,
    });
    expect(resolveManuscript('ms-second', LIB)).toEqual({
      kind: 'resolved', manuscript: LIB[1], wasRequested: true,
    });
    expect(resolveManuscript(null, []).kind).toBe('empty');
  });
});

/* ══ 6 · PERSISTENT WORK CONTEXT ═════════════════════════════════════════ */

const work = (id: string, expressions: string[]): LivingWork => ({
  id, title: `Work ${id}`, purpose: null, form: null, stage: null,
  createdAt: '', updatedAt: '',
  expressions: expressions.map((e) => ({
    expressionType: 'manuscript', expressionId: e, declaredAt: '',
  })),
  materials: [],
});

describe('the current Work is declared, never inferred', () => {
  it('claims no Work identity when none declares the manuscript', () => {
    expect(resolveWorkContext('ready', [work('w1', ['other'])], 'm1').kind).toBe('none');
  });

  it('makes one declaring Work the explicit persistent context', () => {
    const ctx = resolveWorkContext('ready', [work('w1', ['m1'])], 'm1');
    expect(ctx.kind).toBe('work');
    expect(ctx.kind === 'work' && ctx.work.id).toBe('w1');
  });

  it('refuses to choose when two or more declare it', () => {
    const ctx = resolveWorkContext('ready', [work('w1', ['m1']), work('w2', ['m1'])], 'm1');
    expect(ctx.kind).toBe('ambiguous');
    expect(ctx).not.toHaveProperty('work');
  });

  it('asserts nothing before the declarations are read', () => {
    expect(resolveWorkContext('loading', [], 'm1').kind).toBe('unknown');
  });

  it('survives reload by pinning the manuscript, not by storing the Work', () => {
    // A stored "last Work" is a second source of truth that can go stale
    // against a declaration the member has since withdrawn.
    expect(page).toContain('window.history.replaceState');
    expect(page).toContain('canvasForManuscript');
    expect(page).not.toMatch(/localStorage|sessionStorage/);
  });

  it('pins a manuscript CHOSEN in the chooser, not only one resolved silently', () => {
    /* Found in the first authenticated capture, not by any test here.
       The pin used to skip whenever `wasRequested` was true — reasoning that
       an identity which came from the URL is already in it. But choosing in
       the ambiguity chooser also sets `requested`, in React state and nowhere
       else, so the founder's session ran with a bare /writers-studio/canvas
       in the address bar and a reload would have returned them to the chooser.

       The condition must therefore be about the URL, never about provenance. */
    expect(page).not.toMatch(/resolution\.wasRequested\)?\s*return/);
    expect(page).toContain("requestedManuscriptId(window.location.search) === id");
  });
});

/* ══ 7 · THE STUDIO → MAIA HANDOFF ═══════════════════════════════════════ */

describe('the handoff contract carries identity both ways', () => {
  const works = [work('w1', ['m1'])];

  it('preserves the Work across the whole round trip', () => {
    expect(() => assertRoundTripPreservesWork(works, 'm1')).not.toThrow();
  });

  it('refuses to hand off at all when the Work is ambiguous', () => {
    const two = [work('w1', ['m1']), work('w2', ['m1'])];
    expect(() => assertRoundTripPreservesWork(two, 'm1')).toThrow(/exactly one/);
  });

  it('carries an identity, never a position', () => {
    const out = handoffToMaia('/maia', { workId: 'w1', manuscriptId: 'm1' });
    expect(new URLSearchParams(out.slice(out.indexOf('?'))).get(MAIA_WORK_PARAM)).toBe('w1');
    expect(out).not.toContain('recent');
  });

  /* SUPERSEDED AT WS2-03C, and replaced by its inverse rather than deleted.
     This used to assert `page` did NOT contain handoffToMaia — Conversations
     was held shut because the middle term did not exist. It exists now:
     /maia receives the Work id, the server re-reads the member's own row, and
     the exchange names what it is in relation to. Holding the door shut after
     that would be its own dishonesty. What survives is the CONDITION. */
  /* SUPERSEDED AT WS2-03D by the founder's placement ruling. At 03C
     Conversations was a LINK to /maia, and the authenticated witness showed
     the cost: speaking with MAIA ejected the writer from the Studio, taking
     the manuscript and the Work with it. MAIA is adjacent to the Work, not a
     destination you abandon your book to reach. The gate is unchanged; where
     it opens is not. */
  it('satisfies Conversations in this room rather than navigating away', () => {
    expect(page).toContain("'conversations'");
    expect(page).toContain("summon('conversation')");
    // The default interaction may not be a link out of the Studio.
    expect(page).not.toContain('handoffToMaia');
    expect(page).not.toMatch(/situatedHrefs/);
  });

  it('still gates on exactly one declared Work', () => {
    expect(page).toMatch(/summoned\.conversation === true && Boolean\(work\)/);
  });

  it('keeps the manuscript at its measured width while conversing', () => {
    /* The whole point of speaking beside the Work: MAIA takes the Materials
       share, the writing field does not give up a pixel. */
    expect(page).toMatch(/\(materialsOpen \|\| conversationOpen\) && !compact/);
    expect(page).toContain('pct(L.maiaPanel + L.materialsPanel + L.gutter)');
    const L = writingFieldLayout(100000);
    const conversing = L.maiaPanel + L.materialsPanel + L.gutter;
    expect(conversing).toBeGreaterThan(L.maiaPanel);
    expect(L.writingField).toBeGreaterThan(conversing / 2);
  });

  it('cannot be used to promote a destination that has no room behind it', () => {
    // A context gate, not a back door. Only `later` destinations situate, and
    // only with a real href — Home, already available, is unaffected.
    const g = shellDestinations(true, STUDIO_MAP, {
      manuscriptId: 'ms-x',
      situatedHrefs: { notes: '', home: '/somewhere-else' },
    }).flatMap((x) => x.destinations);
    expect(g.find((d) => d.id === 'notes')!.actionable).toBe(false);
    expect(g.find((d) => d.id === 'home')!.href).toBe('/writers-studio');
  });

  it('no longer says reflection "will become available" once it is', () => {
    /* That sentence was true when written and went false the moment 03C
       opened Conversations. A kept promise still reading as pending tells the
       member the room cannot do what it is at that moment doing. */
    expect(maiaColumn).not.toContain('will become available');
    expect(maiaColumn).toContain('REFLECTION_READY');
    expect(maiaColumn).toContain('REFLECTION_NEEDS_WORK');
  });
});

/* ══ 8 · NOTHING FABRICATED TO REACH THE SCREENSHOT ══════════════════════ */

describe('every visible region is real or plainly unavailable', () => {
  it('invents no insight, posture, or MAIA figure', () => {
    for (const banned of ['MaiaInsightCard', 'MaiaPostureRow', 'INSIGHTS', 'evidenceCount']) {
      expect(maiaColumn).not.toContain(banned);
    }
  });

  it('draws no goal and no progress bar, because no goal can be declared', () => {
    expect(band).not.toMatch(/pct|percent|%`/);
    expect(band).toContain('nothing is measured');
  });

  it('publishes no invented statistic', () => {
    // Word-bounded: 'space-between' is not a claim about the member's pace.
    for (const banned of ['Reading time', 'Comments', 'completion', 'pace']) {
      expect(band).not.toMatch(new RegExp(`\\b${banned}\\b`));
    }
  });

  it('groups the outline only as the member’s sections actually are', () => {
    // 04 nests chapters under "Part I — Remembering". Nothing groups sections,
    // so a part heading here would be the system authoring their book.
    expect(outline).not.toContain('Part I');
    expect(outline).not.toMatch(/OUTLINE\s*=/);
    expect(outline).toContain('data.sections');
  });

  it('marks no current chapter, because no cursor-to-section relation exists', () => {
    expect(outline).not.toMatch(/GOLD/);
  });

  it('carries no reference material record into the room', () => {
    for (const banned of ['MATERIAL_GROUPS', 'Larry Interview', 'Cloud Study', 'Voice notes']) {
      expect(page + band + outline + maiaColumn).not.toContain(banned);
    }
  });
});

/* ══ 9 · MATERIALS STAYS CONTEXTUAL ══════════════════════════════════════ */

describe('Materials does not become furniture', () => {
  it('opens on real declared materials, not because 04 draws it open', () => {
    expect(page).toContain('const declaredMaterials = work?.materials.length ?? 0');
    expect(page).toContain('const materialsInContext = declaredMaterials > 0');
    expect(page).toMatch(/open\('materials', materialsInContext\)/);
  });

  it('is dismissible by contract, and the contract still says so', () => {
    const m = PANELS.find((p) => p.role === 'materials')!;
    expect(m.contextual).toBe(true);
    expect(m.dismissible).toBe(true);
    expect(page).toMatch(/onDismiss=\{\(\) => dismiss\('materials'\)\}/);
  });

  it('yields its column before the field gives up its measure', () => {
    expect(page).toContain('materialsOpen && !conversationOpen && !compact');
    expect(page).not.toMatch(/outlineOpen && !compact/);
  });

  it('also yields to the conversation, and the field still does not', () => {
    /* WS2-03D. Materials had one yield condition (compact); it now has two.
       Both are the same rule in different circumstances — chrome collapses
       before the writing field is crushed. The field is in neither list. */
    expect(page).toContain('materialsOpen && !conversationOpen && !compact');
    expect(page).not.toMatch(/conversationOpen && !compact\s*&&[\s\S]{0,40}<main/);
  });
});

/* ══ 10 · WHAT 03B DID NOT TAKE AWAY ═════════════════════════════════════ */

describe('the room keeps every capability it had', () => {
  it('still holds the writing surface, the Work drawer and Materials', () => {
    for (const kept of ['Worktable', 'WorkDrawer', 'MaterialsDrawer']) {
      expect(page).toContain(kept);
    }
  });

  it('still reads revisions, which are now the Versions region', () => {
    expect(page).toContain('loadRevisions');
    expect(page).toContain('onCheckpointed');
  });

  it('still renders each panel under the contract it actually is', () => {
    const declared = new Set(PANELS.map((p) => p.role));
    for (const role of ['manuscript-outline', 'maia', 'materials', 'writing-field']) {
      expect(declared.has(role as never)).toBe(true);
      expect(page).toContain(role);
    }
  });
});
