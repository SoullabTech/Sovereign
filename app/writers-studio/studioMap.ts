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
 * A destination's region is a structural fact, not a rendering hint. It is
 * what stops Insights from drifting into being a room that owns material, and
 * what stops Statistics from drifting into being a judgement.
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

export const STUDIO_MAP: StudioGroup[] = [
  {
    id: 'home',
    region: 'work',
    destinations: [
      {
        id: 'studio-home',
        label: 'Home',
        availability: 'available',
        href: '/writers-studio',
      },
    ],
  },
  {
    id: 'current-book',
    region: 'work',
    /* "Current Writing", not "Current Book" (Kelly, 2026-08-05): writing is
       the practice; a book is one thing writing may become. The id stays —
       it is an implementation key, not member-facing vocabulary. */
    label: 'Current Writing',
    destinations: [
      {
        id: 'canvas',
        label: 'Writer Canvas',
        note: 'The room where your work develops.',
        availability: 'available',
        href: CANVAS_HREF,
        requiresManuscript: true,
      },
      {
        id: 'write',
        label: 'Working Draft',
        note: 'Where you write. Yours to change.',
        availability: 'available',
        href: WRITE_HREF,
        requiresManuscript: true,
      },
      {
        id: 'source',
        label: 'Source',
        note: 'What you brought in, unchanged.',
        availability: 'available',
        href: SOURCE_HREF,
        requiresManuscript: true,
      },
    ],
  },
  {
    id: 'threshold',
    region: 'work',
    destinations: [
      {
        id: 'import',
        label: 'Import Manuscript',
        note: 'Bring in writing from a file.',
        availability: 'available',
        href: IMPORT_HREF,
      },
    ],
  },

  /* ── WS2-02 · the rest of the WORK region ──────────────────────────────
     These are places the reference grammar settles, and that the substrate
     does not yet reach as destinations. Availability below is grounded in a
     read of the code, not in the programme description:

       Materials  MaterialsDrawer.tsx + living-works/[id]/materials exist, but
                  only as a drawer INSIDE the Canvas. There is no room to send
                  a member to, so this is not a destination yet.
       Structure  Same shape — a conditional Canvas drawer, no room.
       Versions   manuscripts/[id]/draft/revisions exists as substrate with no
                  member-facing surface. Substrate is not a destination.
       Notes      No substrate found.
       Goals      No substrate found. `writing_goal` appears nowhere.

     They are carried here so the grammar is whole and later slices have a
     settled place to land in — NOT so the member is shown them. See
     visibleDestinations: a 'later' destination never reaches a screen. */
  {
    id: 'work-later',
    region: 'work',
    destinations: [
      { id: 'materials', label: 'Materials', availability: 'later' },
      { id: 'structure', label: 'Structure', availability: 'later' },
      { id: 'notes', label: 'Notes', availability: 'later' },
      { id: 'versions', label: 'Versions', availability: 'later' },
      { id: 'goals', label: 'Goals', availability: 'later' },
    ],
  },

  /* ── WS2-02 · MAIA ─────────────────────────────────────────────────────
     Offerings, not holdings. Conversations is real: /maia is the built
     conversational surface. Discover / Insights / Suggestions have no
     substrate — no route, no table, no service. */
  {
    id: 'maia',
    region: 'maia',
    label: 'MAIA',
    destinations: [
      {
        id: 'conversations',
        label: 'Conversations',
        note: 'Where you and MAIA talk.',
        availability: 'available',
        href: '/maia',
      },
      { id: 'discover', label: 'Discover', availability: 'later' },
      { id: 'insights', label: 'Insights', availability: 'later' },
      { id: 'suggestions', label: 'Suggestions', availability: 'later' },
    ],
  },

  /* ── WS2-02 · TOOLS ────────────────────────────────────────────────────
     Export is real — /press/manuscript carries an export tab. The other four
     were searched for and are absent: no find-replace, no writer-scoped
     statistics, no timeline, no word-web. */
  {
    id: 'tools',
    region: 'tools',
    label: 'Tools',
    destinations: [
      {
        id: 'export',
        label: 'Export',
        note: 'Take your writing out.',
        availability: 'available',
        href: '/press/manuscript?tab=export',
        requiresManuscript: true,
      },
      { id: 'find-replace', label: 'Find/Replace', availability: 'later' },
      { id: 'statistics', label: 'Statistics', availability: 'later' },
      { id: 'timeline', label: 'Timeline', availability: 'later' },
      { id: 'word-web', label: 'Word Web', availability: 'later' },
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
