/**
 * EW-F2 · STEP 2 — WHICH AUTHORITY OWNS A SECTION.
 *
 * ⭐⭐ THE RULING THIS FILE IS:
 *
 *   The server decides which authority owns the section; the surface renders
 *   that authority rather than inventing one.
 *
 * ── WHY THIS REPLACES A BOOLEAN ───────────────────────────────────────────
 *
 * The write state used to carry `editable: boolean`, and the Section surface
 * rendered `!editable` as "This section can be read here but not yet edited."
 * That sentence is TRUE of an unprojectable section and FALSE of a section
 * being worked as a proposal — where the writer is very much editing, just not
 * the manuscript. Overloading the boolean would have made the room say the one
 * thing most likely to mislead at the exact moment authority is divided.
 *
 * ⛔ PW-5 in the founder's obligations: the proposal_work reason is EXPLICIT,
 * never inferred from the absence of editability.
 *
 * ── AND WHY IT IS NOT A SECOND SOURCE OF TRUTH ────────────────────────────
 *
 * `manuscript_draft_sections` has no authority column and gains none. This is
 * RESOLVED, per request, from facts the server already owns: whether the
 * section projects, and whether this member has a live proposal targeting it.
 * The storage layer's `editable` remains what it always was — a fact about
 * PROJECTABILITY — and is mapped here rather than redefined there.
 */

export type SectionAuthority =
  /** The section engine owns this section's keystrokes. The ordinary case. */
  | 'manuscript_write'
  /** The server cannot project this section's shape. Read-only reference. */
  | 'unprojectable'
  /**
   * ⭐ A proposal is being worked here. Keystrokes belong to the staged
   * proposal and NEVER to the manuscript. The manuscript-writing control is
   * not mounted — PW-1 — which is what makes the separation structural rather
   * than a matter of which box looks different.
   */
  | 'proposal_work';

export const SECTION_AUTHORITIES: readonly SectionAuthority[] =
  ['manuscript_write', 'unprojectable', 'proposal_work'];

export function isSectionAuthority(v: unknown): v is SectionAuthority {
  return typeof v === 'string'
    && (SECTION_AUTHORITIES as readonly string[]).includes(v);
}

/**
 * ⭐⭐ THE ONE PREDICATE THE SAVE PATH MAY ASK.
 *
 * Every place that used to ask `editable` asks this instead, so adding a
 * fourth authority later cannot silently grant manuscript-write to it: the
 * default is refusal, and a new member of the union must be named here on
 * purpose to be allowed through.
 */
export function ownsManuscriptWrite(a: SectionAuthority): boolean {
  return a === 'manuscript_write';
}

/**
 * The authority a section has when no proposal is being worked on it.
 * ⛔ Deliberately total over the boolean: there is no third thing a
 * projectability flag can mean.
 */
export function authorityFromProjectability(projectable: boolean): SectionAuthority {
  return projectable ? 'manuscript_write' : 'unprojectable';
}
