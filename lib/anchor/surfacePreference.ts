/**
 * MEMBER STANDING-CONSENT — Daily Anchor surface preference.
 *
 * The member's standing authorization for whether a Daily Anchor is eligible to
 * surface into MAIA's prompt. Mirrors member_memory_atoms.return_preference: the
 * *value vocabulary is verbatim* so there is one shared consent grammar across
 * memory surfaces (atoms + anchors), and a reviewer who knows one knows both.
 *
 * The DEPLOYMENT flag MAIA_ANCHOR_CONTEXT_ENABLED is a kill-switch, NOT the
 * consent source. This preference is the consent source. Both must permit
 * surfacing for an anchor to reach the prompt.
 *
 * Enforcement of ambient exclusion lives as a literal SQL predicate in the
 * loader (lib/anchor/loadRecentAnchors.ts) — auditable by the refusal registry
 * (R08). This module is the source of truth for *input validation* at the
 * gesture route. If you change the ambient-eligible set here, you MUST change
 * the loader's SQL predicate and R08's regex to match.
 *
 * See:
 *   - docs/canon/SPIRAL_CONTINUITY_ENGINE.md §7 (ambient-surfacing boundary)
 *   - database/migrations/20260702000003_member_daily_anchor_surface_preference.sql
 */

export type AnchorSurfacePreference =
  | 'member_pulled'
  | 'contextual_doorway'
  | 'ritual_review_opt_in';

/** Every value the surface_preference column may hold (CHECK-constraint mirror). */
export const VALID_ANCHOR_SURFACE_PREFERENCES: ReadonlySet<AnchorSurfacePreference> =
  new Set<AnchorSurfacePreference>([
    'member_pulled',
    'contextual_doorway',
    'ritual_review_opt_in',
  ]);

/**
 * The subset that authorizes AMBIENT surfacing into the prompt. `member_pulled`
 * is deliberately absent — those anchors return only when the member explicitly
 * pulls them, never ambiently. This constant documents the intent; the loader's
 * SQL predicate is the enforcement (kept as a literal there so R08 can grep it).
 */
export const AMBIENT_ELIGIBLE_ANCHOR_SURFACE_PREFERENCES: readonly AnchorSurfacePreference[] =
  ['contextual_doorway', 'ritual_review_opt_in'];

export function isValidAnchorSurfacePreference(
  value: unknown,
): value is AnchorSurfacePreference {
  return (
    typeof value === 'string' &&
    VALID_ANCHOR_SURFACE_PREFERENCES.has(value as AnchorSurfacePreference)
  );
}
