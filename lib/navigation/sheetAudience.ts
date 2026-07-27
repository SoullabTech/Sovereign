/**
 * Per-surface audience policy for the Decisions and Changes member sheets.
 *
 * SPLIT RULING (Kelly, 2026-07-27)
 * -------------------------------
 * These two sheets appeared together in the House and were provisionally
 * classed "founder/steward-only governance surfaces." An access-control audit
 * (out of scope for the House navigation contract, PR #766) found they are NOT
 * the same kind of surface, so a single shared audience mis-describes both:
 *
 *   - Changes   → a PERSONAL MEMBER tool. The backend `/api/changes` is
 *                 member-scoped by design ("the member owns the chain — they can
 *                 keep iterating with or without MAIA's support"). It stays
 *                 available to every authenticated member. It is NOT governance.
 *
 *   - Decisions → the Studio Decision Council, a PRACTITIONER tool. The backend
 *                 `/api/studio/decisions` (and all `[id]` sub-routes) is
 *                 practitioner-gated via `getCurrentPractitioner` — an active
 *                 row in `practitioners`. It should appear only for practitioners.
 *
 * Each surface now carries its own independently derived policy. They are no
 * longer coupled by the accident of their shared placement in the House.
 *
 * The API layer already enforces the correct boundary in both cases; this module
 * exists so the UI trigger visibility matches that boundary instead of showing a
 * practitioner-only tool to ordinary members (who then hit a 401/403 empty sheet).
 *
 * `isPractitioner` comes from the `practitioner` role in `lib/hooks/useSession`.
 *
 * DELIBERATELY NARROWER than the House / rail gate — do NOT normalize the two.
 * `MaiaLeftRail` (and the House destination model, PR #766) gate practitioner
 * rooms on the coarser `isAdmin || isPractitioner`. Here we use `isPractitioner`
 * ALONE, because `/api/studio/decisions` enforces `getCurrentPractitioner` — an
 * active row in `practitioners`. An admin WITHOUT a practitioner record would be
 * shown the button by the coarse gate and then hit the same 401/403 empty sheet
 * this fix removes. Only widen this to include admins after confirming admins
 * necessarily have practitioner records; until then the exact-match gate is correct.
 */

export interface SheetAudienceContext {
  /** Authenticated member (holds a member id). The /maia surface requires this. */
  isMember: boolean;
  /** Member holds the `practitioner` role — see `lib/hooks/useSession`. */
  isPractitioner: boolean;
}

/**
 * Changes is a personal member capability — visible to any authenticated member.
 * Kept as a named policy (rather than an implicit "always true") so the split
 * from Decisions is explicit and regressions are caught by the audience test.
 */
export function canSeeChangesTrigger(ctx: SheetAudienceContext): boolean {
  return ctx.isMember;
}

/**
 * Decisions is the practitioner Decision Council — visible only to practitioners,
 * mirroring the `getCurrentPractitioner` gate on `/api/studio/decisions`.
 */
export function canSeeDecisionsTrigger(ctx: SheetAudienceContext): boolean {
  return ctx.isPractitioner;
}
