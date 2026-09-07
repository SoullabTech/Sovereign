import { type CanvasSurfaceId } from './canvasSurfaces';

/**
 * The four historical writing surfaces, mapped onto the three ruled materials.
 *
 * `app/writers-studio/canvas/WritingSurface.tsx` carried a four-material system
 * — warm · ivory · white · midnight — stored per manuscript under
 * `writing_surface:<id>`. That component is imported by nothing, so the
 * materials were reachable by no member on any live path. It is evidence, not
 * a component to resurrect:
 *
 *   Component existence is not capability existence. A live member path is the proof.
 *
 * But the storage keys are real and some carry a choice a writer actually made
 * in an older room. Those seed the new preference ONCE and then stop mattering.
 *
 * ── ⛔ Four historical values do not become a fourth product choice ────────
 * The founder ruled three. A harvested value does not acquire product
 * authority because code exists for it, so each legacy value maps
 * DETERMINISTICALLY onto the nearest surviving material and the mapping is
 * written down here rather than inferred at a call site:
 *
 *   warm     → dark        the espresso writing ground; the Studio's own light
 *   midnight → dark        a darker dark is still dark; no third dark exists
 *   ivory    → parchment   warm off-white, closest to the earthier page
 *   white    → paper       clean off-white
 *
 * midnight collapsing into dark is a real loss of distinction and is recorded
 * as one: nothing in the ruled set is a near-black page, and inventing one to
 * preserve a preference nobody could reach would be reintroducing the fourth
 * option through the migration.
 */
export const LEGACY_SURFACE_MAP: Readonly<Record<string, CanvasSurfaceId>> = {
  warm: 'dark',
  midnight: 'dark',
  ivory: 'parchment',
  white: 'paper',
};

/** The keys the old system wrote. Read only; never written, never deleted. */
export const LEGACY_GLOBAL_KEY = 'writing_surface';
export const legacyManuscriptKey = (manuscriptId: string) => `writing_surface:${manuscriptId}`;

/**
 * A legacy value, if this browser holds one. Pure over its input so the
 * migration is testable without a browser.
 */
export function mapLegacySurface(value: string | null | undefined): CanvasSurfaceId | null {
  if (!value) return null;
  return LEGACY_SURFACE_MAP[value] ?? null;
}

/**
 * The one-time seed input: the manuscript's own legacy choice first, then the
 * browser-wide one, exactly as the old loader resolved it.
 *
 * ⛔ Reads only. The legacy keys are left untouched and inert — this pass
 * deletes nothing, so a member who somehow returns to old code finds what they
 * left. After the seed the DB preference is authoritative and this function's
 * answer is never consulted again.
 */
export function legacySeed(manuscriptId: string | null): CanvasSurfaceId | null {
  if (typeof window === 'undefined') return null;
  try {
    const scoped = manuscriptId
      ? window.localStorage.getItem(legacyManuscriptKey(manuscriptId))
      : null;
    return mapLegacySurface(scoped ?? window.localStorage.getItem(LEGACY_GLOBAL_KEY));
  } catch {
    /* Private windows and blocked site data throw. No seed is a fine outcome. */
    return null;
  }
}
