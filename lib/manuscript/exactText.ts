/**
 * EXACT-TEXT FIT — neutral Work law, owned by no ontology.
 *
 * ⭐⭐ THE OWNERSHIP IS THE POINT:
 *
 *     exact-text fit law       ← HERE. Neutral Work law.
 *     authorization            consumes it
 *     execution                consumes it
 *     old proposal machinery   ⛔ no longer owns it
 *
 * ⚠️ EXTRACTED 2026-09-14 ON A FOUNDER RULING, AFTER A CENSUS CORRECTION. The
 * runtime-port census said both functions were "already re-expressed" in
 * `revisionAuthorization/contract.ts`. ⛔ Only `occurrences` was.
 * `applyExactlyOnce` — the law that actually performs the replacement — existed
 * solely in `revisionProposal/contract.ts`, the module whose authority
 * vocabulary is being retired. So the mutation law was about to lose its home
 * along with an ontology it never belonged to.
 *
 * ⛔ THE AUTHORITY VOCABULARY DOES NOT TRAVEL WITH IT. Nothing here knows about
 * `execution_authority`, `inspection_only`, proposals, offers or
 * authorizations. This module answers one question: *do these exact characters
 * occur exactly once in this body, and what does the body become if they are
 * replaced?*
 */

/**
 * ⭐ Occurrences of `needle`, counted WITHOUT OVERLAP.
 *
 * ⛔ NOT `indexOf`. "Found" is not "identified" — a permission that cannot say
 * WHICH characters it means does not name an exact change.
 */
export function occurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let n = 0;
  let i = haystack.indexOf(needle);
  while (i !== -1) { n += 1; i = haystack.indexOf(needle, i + needle.length); }
  return n;
}

export type ExactMatch =
  | { readonly ok: true; readonly applied: string }
  | { readonly ok: false; readonly reason: 'expected_text_absent' | 'expected_text_ambiguous' };

/**
 * ⭐⭐ THE EXACT-ONCE GUARD, PURE — the one place that decides whether a stated
 * change still names something, so the law is falsifiable without a database.
 *
 * ⛔ `expected_text_ambiguous` is not a softer `absent`. Deleting "the first
 * one" would be the system choosing on the member's behalf and calling it their
 * authorization.
 */
export function applyExactlyOnce(
  body: string, expected: string, replacement: string,
): ExactMatch {
  const n = occurrences(body, expected);
  if (n === 0) return { ok: false, reason: 'expected_text_absent' };
  if (n > 1) return { ok: false, reason: 'expected_text_ambiguous' };
  return { ok: true, applied: body.replace(expected, replacement) };
}
