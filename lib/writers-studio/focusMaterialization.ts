/**
 * BW-03 — CLASS-C FAILURE SEMANTICS · the outcome algebra for Work materialization.
 *
 * THE DEFECT THIS ANSWERS (BW-01R · W7). The focus assembler was shaped:
 *
 *     try { const row = await db(...); return row ?? null } catch { return null }
 *
 * so three different truths arrived as one value:
 *
 *     1. AUTHORIZATION FAILURE   "you may not cross this boundary"
 *     2. ABSENCE                 "there is no authorized resource here"
 *     3. MATERIALIZATION FAILURE "authority was established; the resource could not be loaded"
 *
 * A query naming a table that does not exist therefore became indistinguishable
 * from an empty Work, and hid for the entire life of the feature.
 *
 * ⭐ THE LAW BW-01 MADE POSSIBLE. Before `BoundWorkScope`, authorization and
 * materialization were the SAME ACT, so these could not be separated even in
 * principle. Now (1) is decided by the binder before this module runs, and this
 * module is only ever reached with authority already established.
 *
 * ─── DISCLOSURE, WHICH CHANGES AT THE AUTHORITY LINE ────────────────────────
 *
 *   PRE-AUTHORITY   foreign Work and absent Work MUST present identically.
 *                   (AUTH-04 · BW-AUTH-3 · witnessed by BW-01R W3.)
 *
 *   POST-AUTHORITY  the system has already proved THIS MEMBER MAY ACCESS THIS
 *                   WORK. Saying "your Work exists but could not be loaded"
 *                   discloses nothing about anybody else's resource — so the
 *                   failure may, and must, be loud.
 *
 * ⛔ WHY `empty` IS ITS OWN OUTCOME AND NOT A FAILURE. An authorized Work with
 * nothing in it yet is a TRUE ANSWER, not an error. Folding it into
 * `materialization_failed` would be loud and wrong; folding a failure into it is
 * the W7 defect. The whole point of this algebra is that the two stop being the
 * same value, so collapsing them in either direction defeats it.
 */

/** What the operator sees. ⛔ Never rendered to the writer. */
export interface MaterializationDetail {
  readonly stage: 'query' | 'range' | 'shape';
  /** Exact underlying error — server-side only. */
  readonly error: string;
}

export type FocusMaterialization =
  /** Authorized content obtained. */
  | { readonly kind: 'loaded'; readonly content: string }
  /** Authorized, and there is genuinely nothing to read. A true answer. */
  | { readonly kind: 'empty' }
  /** Authority established; the content operation failed. ⭐ LOUD. */
  | { readonly kind: 'materialization_failed'; readonly detail: MaterializationDetail }
  /** An impossible state — a contract violation, not an operational fault. */
  | { readonly kind: 'invariant_failed'; readonly detail: MaterializationDetail };

export const loaded = (content: string): FocusMaterialization =>
  content.length > 0 ? { kind: 'loaded', content } : { kind: 'empty' };

export const materializationFailed = (
  stage: MaterializationDetail['stage'], error: unknown,
): FocusMaterialization => ({
  kind: 'materialization_failed',
  detail: { stage, error: error instanceof Error ? error.message : String(error) },
});

export const invariantFailed = (
  stage: MaterializationDetail['stage'], error: string,
): FocusMaterialization => ({ kind: 'invariant_failed', detail: { stage, error } });

export const isMaterialized = (m: FocusMaterialization): m is Extract<FocusMaterialization, { kind: 'loaded' }> =>
  m.kind === 'loaded';

/**
 * ⭐ THE ASSERTION BW-03 EXISTS TO MAKE. A materialization outcome can never be
 * the pre-authority refusal, because this type cannot express it. `UNAVAILABLE`
 * is the binder's word and belongs to a different layer.
 *
 * `BW-LAW-2` — content loaders consume authority and return content or a
 * materialization failure; they do not return "not authorized".
 */
export type NeverUnavailable<T extends FocusMaterialization> =
  T extends { kind: 'unavailable' } ? never : T;
