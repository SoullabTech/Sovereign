/**
 * Author Studio — Layer 2 map.
 *
 * RULED 2026-07-30 (Kelly). The Studio is built around **Studios, not
 * implementation tabs**. Three layers, kept separate on purpose:
 *
 *   Layer 1  House            — Vision Studio · Author Studio · Pro Studio
 *   Layer 2  Studio Home      — the member-facing ENVIRONMENT (this file)
 *   Layer 3  Working surfaces — Source · Working Draft (app/press/manuscript)
 *
 * The deployed implementation jumped Layer 1 → Layer 3. That is why it felt
 * like there was no Studio: the environment did not exist, only the workbench.
 *
 * WHY THIS FILE IS SEPARATE FROM THE ROOM'S TABS
 * The Manuscript Room's seven tabs (Manuscript · Working Draft · Keeps ·
 * Collections · Emerging Books · Export · Your Book) are implementation
 * artifacts. They may be renamed, regrouped, or replaced as capability
 * evolves. This map must NOT move when they do. Studio navigation is durable;
 * tab naming is a small local design decision one layer below.
 *
 * Two rejected options are recorded here so they are not re-proposed:
 *   - Building the shell around the seven tabs would bake the implementation
 *     accident into the product.
 *   - Adopting the five-surface vocabulary (Capture · Gatherings · Shape ·
 *     Write · Release) wholesale would have navigation promise rooms that do
 *     not exist. Gatherings, Shape and Release are unbuilt.
 *
 * HONESTY RULE, enforced by the types below: a destination that is not built
 * carries NO href. It is not a link, it is not clickable, and it never implies
 * a capability that is absent. `availability: 'later'` and `href` are mutually
 * exclusive by construction — see assertStudioMapHonest().
 */

export type StudioAvailability = 'available' | 'later';

/**
 * WS2-02 — the three regions of the Studio, and why they are three.
 *
 * PROVENANCE. This grammar is **D-019**, settled by the founder on 2026-08-28
 * and read from reference screen `04-writing-field-wide.png`. It is not
 * settled here. This file is an implementation candidate for an existing
 * ruling, and it may not drift from it. The governing record lives on the one
 * Writer's Studio lane, `claude/writers-studio-organization-wxpb7q`
 * (D-020: a Writer's Studio document that exists on another branch and not on
 * that one is not governing) — see docs/programmes/writers-studio-v2/
 * DECISIONS.md and WS2-ARCHITECTURE-DEFINITION.md.
 *
 * D-019 also retires "MAIA region" as an *architectural* definition: a region
 * is presentation. The architecture is MAIA-in-relation-to-a-Work. `region`
 * below is therefore chrome, and carries no authority over the object model.
 *
 * The reference grammar keeps three kinds of thing apart because collapsing
 * them is the failure this product is most likely to commit:
 *
 *   work    The member's material and the rooms that hold it. The Work is the
 *           primary context — everything else is addressed TO it.
 *
 *   maia    Relational offerings. MAIA is **not another content owner**: she
 *           does not hold a region of the member's material, she speaks about
 *           it. Nothing under this region may author, own, or score the work.
 *           See maiaOffering.ts for that constraint, made executable.
 *
 *   tools   Instruments. **Not relational participants** — a tool operates on
 *           the work and says nothing about it. Find/Replace has no opinion.
 *
 * A destination's region is a structural fact **of the shell grammar** — not a
 * rendering hint, and not domain ownership. Per D-019 a region is chrome: it
 * says where a destination sits in the Studio's navigation, and it confers no
 * authority over the object model. The domain relations are D-018's (a
 * Manuscript belongs to a Work; a Material relates to one without becoming
 * it), and they hold regardless of how this map is banded.
 *
 * What the banding does do is keep drift visible: it is what stops Insights
 * from being placed as a room that owns material, and Statistics from being
 * placed as a judgement. That is a constraint on the chrome, enforced by the
 * region tests — never a claim that the chrome defines the ontology.
 */
export type StudioRegion = 'work' | 'maia' | 'tools';

export interface StudioDestination {
  id: string;
  label: string;
  /** One quiet line. What the place IS — never what it promises to become. */
  note?: string;
  availability: StudioAvailability;
  /**
   * Present if and only if availability === 'available'. A 'later' destination
   * is rendered as plainly unavailable, never as a dead or hopeful link.
   */
  href?: string;
  /**
   * TRUE when this destination only makes sense once the member has a
   * manuscript. Hidden (not disabled) before then — an empty Studio should
   * offer the one real door, not a row of greyed-out ones.
   */
  requiresManuscript?: boolean;
  /**
   * A count 04 right-aligns on the item — Materials 24, Notes 12. A fact about
   * the member's own material. Never a rating: nothing MAIA evaluates may
   * arrive here as a figure (D-003, maiaOffering.ts).
   */
  count?: number;
}

export interface StudioGroup {
  id: string;
  /** Which of the three regions this group belongs to. See StudioRegion. */
  region: StudioRegion;
  /** Omitted for the first group — the shell does not label the obvious. */
  label?: string;
  destinations: StudioDestination[];
}

/**
 * Layer 3 lives at /press/manuscript. Studio Home enters it by named surface
 * rather than dropping the member on whatever tab happens to be first.
 */
export const WRITE_HREF = '/press/manuscript?tab=draft';
export const SOURCE_HREF = '/press/manuscript?tab=manuscript';
/**
 * `?import=1` states the intent explicitly. Without it, a member who already
 * has a manuscript lands in that manuscript's Room instead of the import form,
 * because the Room shows its landing/upload view only when nothing is active.
 * Caught by the post-#825 seam walk — the earlier walk only ever imported from
 * an empty Studio, so the with-a-book path was never exercised.
 */
export const IMPORT_HREF = '/press/manuscript?import=1';

/**
 * Writer Canvas v0.1 — the room the Studio's entry paths lead into. The v0.1
 * boundary (docs/design/author-studio/WRITER_CANVAS_V01_IMPLEMENTATION_BOUNDARY
 * _2026-08-05.md) ships the room with ONE real instrument, the writing surface,
 * so the door requires a manuscript: a member with nothing on the table begins
 * at Studio Home. The gathering/development arrival (walk amendment A6) is a
 * later slice and gets its own door only when it is real.
 */
export const CANVAS_HREF = '/writers-studio/canvas';

/**
 * The canonical D-019 grammar: 7 + 4 + 5 = SIXTEEN destinations.
 *
 * ── CORRECTED BY THE WS2-02B RENDER ────────────────────────────────────────
 *
 * This map carried NINETEEN. The extra three were Writer Canvas, Working Draft
 * and Source, plus Import Manuscript — the transitional doors into the legacy
 * working surfaces — sitting in the rail as if they were destinations of the
 * same kind as Materials or Goals. The file's own comment said "the settled
 * grammar names sixteen" while its data said otherwise. Nobody caught it until
 * the fixture was rendered and the rail could be counted.
 *
 * That was not a miscount so much as a confusion of two different things:
 *
 *   DESTINATION   a place in the Studio. Manuscript is one.
 *   SURFACE       a way of working inside a place. Working Draft and Source
 *                 are two views of the manuscript, not two more rooms.
 *   ARRIVAL       an action that brings work in. Import belongs to Work Home,
 *                 per FUNCTION-PLACEMENT.md — EXPLORE owns start and import;
 *                 WRITE owns the draft and its contextual surfaces.
 *
 * NOTHING IS DELETED. Every href below the fold still exists and is still
 * exported — WRITE_HREF, SOURCE_HREF, IMPORT_HREF, CANVAS_HREF are unchanged
 * and their consumers are untouched. What changed is placement: they are
 * reached through Manuscript and through Work Home rather than standing in the
 * persistent rail. Canonising today's transitional routes as permanent
 * navigation is exactly what WS2-03 must not inherit.
 */
export const STUDIO_MAP: StudioGroup[] = [
  {
    id: 'work-space',
    region: 'work',
    label: 'Work space',
    destinations: [
      { id: 'home', label: 'Home', availability: 'available', href: '/writers-studio' },
      {
        id: 'manuscript',
        label: 'Manuscript',
        note: 'The room where your work develops.',
        availability: 'available',
        href: CANVAS_HREF,
        requiresManuscript: true,
      },
      /* Not built as destinations. Materials and Structure exist only as
         drawers inside the Canvas; Versions has revision substrate with no
         member surface; Notes and Goals have none. See visibleDestinations —
         a `later` destination never reaches a member. */
      { id: 'materials', label: 'Materials', availability: 'later', count: 24 },
      { id: 'structure', label: 'Structure', availability: 'later' },
      { id: 'notes', label: 'Notes', availability: 'later', count: 12 },
      { id: 'versions', label: 'Versions', availability: 'later' },
      { id: 'goals', label: 'Goals', availability: 'later' },
    ],
  },
  {
    id: 'maia',
    region: 'maia',
    label: 'MAIA',
    /* Offerings, not holdings.

       Nothing in this band is available. A generic conversational surface
       exists at /maia, but Studio Conversations does not: under D-019 the
       architecture is MAIA-in-relation-to-a-Work, and Work context does not
       survive the handoff into that route. A surface that exists is not the
       same as the destination this grammar names. Discover / Insights /
       Suggestions have no substrate at all.

       Conversations becomes available when the handoff preserves Work context.
       That seam is WS2-03's; WS2-09 owns the deeper situated behaviour. */
    destinations: [
      { id: 'conversations', label: 'Conversations', availability: 'later' },
      { id: 'discover', label: 'Discover', availability: 'later' },
      { id: 'insights', label: 'Insights', availability: 'later' },
      { id: 'suggestions', label: 'Suggestions', availability: 'later' },
    ],
  },
  {
    id: 'tools',
    region: 'tools',
    label: 'Tools',
    /* Instruments. A tool operates on the work and says nothing about it.
       Only Export is real — /press/manuscript carries an export tab. */
    destinations: [
      { id: 'find-replace', label: 'Find/Replace', availability: 'later' },
      { id: 'statistics', label: 'Statistics', availability: 'later' },
      { id: 'timeline', label: 'Timeline', availability: 'later' },
      { id: 'word-web', label: 'Word Web', availability: 'later' },
      {
        id: 'export',
        label: 'Export',
        note: 'Take your writing out.',
        availability: 'available',
        href: '/press/manuscript?tab=export',
        requiresManuscript: true,
      },
    ],
  },
];

/**
 * The honesty invariant, executable.
 *
 * Enforced in tests rather than left to review: an unbuilt destination must
 * never carry a link, and a built one must always carry one. This is the rule
 * the shell exists to keep — navigation may not promise what is not there.
 */
export function assertStudioMapHonest(map: StudioGroup[] = STUDIO_MAP): void {
  for (const group of map) {
    for (const d of group.destinations) {
      if (d.availability === 'later' && d.href !== undefined) {
        throw new Error(`Studio map: "${d.label}" is not built but carries an href.`);
      }
      if (d.availability === 'available' && !d.href) {
        throw new Error(`Studio map: "${d.label}" is available but has nowhere to go.`);
      }
    }
  }
}

/**
 * Destinations the member can actually act on right now.
 *
 * NO ROADMAP LEAKAGE — where the rule now lives (WS2-02).
 *
 * The rule is unchanged: *a product reveals capability, not construction
 * status.* An author arriving to write must not read a list of things the room
 * cannot do before reaching the one it can.
 *
 * What changed is where it is enforced. Before WS2-02 the rule was kept by
 * holding the map itself empty of unbuilt destinations — the map could not
 * leak a roadmap because it had no roadmap in it. That worked while the map
 * was five destinations, and it stops working now that the settled grammar
 * names sixteen: keeping the map bare would mean deleting settled architecture
 * to fit today's substrate, which is the one thing WS2-02 may not do.
 *
 * So the grammar is whole in STUDIO_MAP, and the rule is enforced here, at the
 * boundary the member actually meets: `later` destinations are dropped, not
 * disabled, not greyed, not labelled "coming soon". Nothing downstream has to
 * remember to filter them, because nothing downstream ever receives them.
 *
 * This is strictly stronger than the old arrangement. The old test could only
 * assert that the map happened to be bare; this function guarantees the member
 * sees no unbuilt destination no matter what the map later carries.
 */
export function visibleDestinations(
  hasManuscript: boolean,
  map: StudioGroup[] = STUDIO_MAP,
): StudioGroup[] {
  return map
    .map((g) => ({
      ...g,
      destinations: g.destinations.filter(
        (d) =>
          d.availability === 'available' && (!d.requiresManuscript || hasManuscript),
      ),
    }))
    .filter((g) => g.destinations.length > 0);
}
