/**
 * WS2-05A — place within the Work, carried in the URL.
 *
 * Work identity persists; place within the Work persists. Once a member is
 * navigating an authored structure, being returned to the top of the
 * manuscript after a reload is especially incoherent — the Studio would be
 * forgetting where they were standing in a book it has just helped them
 * organise.
 *
 *     ?m=<manuscript-id>&s=<draft-section-id>
 *
 * IDENTITY, NOT POSITION. `s` is a draft-section uuid — the same identity the
 * outline, the save queue and the write path already speak. `s=22` would be an
 * ordinal, and ordinals move: a section inserted above would silently reopen a
 * different piece of the book, with no error and no way for the member to know.
 *
 * NO NEW DATABASE STATE. The section id is already the navigation authority;
 * the URL is simply where the browser keeps it.
 *
 * REPLACE, NEVER PUSH. A section click changes place within the Work, not
 * browser-level destination. With pushState, Back would walk the member
 * backwards through every section they happened to inspect instead of leaving
 * the Work — synthetic history, not useful history.
 */

export const SECTION_PARAM = 's';

export interface PlaceResolution {
  /** The section to open. Null when there is nothing to open. */
  sectionId: string | null;
  /**
   * True when the URL asserted a place that does not exist here, and the
   * location must be rewritten so it stops saying something untrue.
   */
  rewriteLocation: boolean;
}

/**
 * Which section to open, given what the URL asked for and what this draft
 * actually holds.
 *
 * A stale, malformed or foreign `s` is NOT an error the member should have to
 * read, and it is not a reason to guess. It falls back to the draft's first
 * section — the existing behaviour — and the caller rewrites the location.
 * Manufacturing a relation to the nearest position, or to a section with a
 * similar heading, would be exactly the fuzzy matching this programme refuses.
 */
export function resolveInitialSection(
  requested: string | null | undefined,
  sectionIds: readonly string[],
): PlaceResolution {
  const first = sectionIds[0] ?? null;
  if (!requested) return { sectionId: first, rewriteLocation: false };
  if (sectionIds.includes(requested)) return { sectionId: requested, rewriteLocation: false };
  return { sectionId: first, rewriteLocation: true };
}

/** The requested section id from a query string, if any. */
export function readSectionParam(search: string): string | null {
  try {
    const v = new URLSearchParams(search).get(SECTION_PARAM);
    return v && v.trim().length > 0 ? v : null;
  } catch {
    return null;
  }
}

/**
 * The location a given place should be shown at, preserving every other
 * parameter the caller arrived with (`m`, and the dev-only `witnessDelayMs`).
 *
 * Returns the path plus query only — never an absolute URL. `replaceState` with
 * a same-origin relative value cannot navigate anywhere, which is the point:
 * remembering a place must not be able to become a redirect.
 */
export function locationForSection(
  pathname: string,
  search: string,
  sectionId: string | null,
): string {
  const params = new URLSearchParams(search);
  if (sectionId) params.set(SECTION_PARAM, sectionId);
  else params.delete(SECTION_PARAM);
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}
