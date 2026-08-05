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

export const STUDIO_MAP: StudioGroup[] = [
  {
    id: 'home',
    destinations: [
      {
        id: 'studio-home',
        label: 'Home',
        availability: 'available',
        href: '/press/studio',
      },
    ],
  },
  {
    id: 'current-book',
    label: 'Current Book',
    destinations: [
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
    destinations: [
      {
        id: 'import',
        label: 'Import Manuscript',
        note: 'Bring a book in from a file.',
        availability: 'available',
        href: IMPORT_HREF,
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

/** Destinations the member can actually act on right now. */
export function visibleDestinations(
  hasManuscript: boolean,
  map: StudioGroup[] = STUDIO_MAP,
): StudioGroup[] {
  return map
    .map((g) => ({
      ...g,
      destinations: g.destinations.filter((d) => !d.requiresManuscript || hasManuscript),
    }))
    .filter((g) => g.destinations.length > 0);
}
