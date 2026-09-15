/**
 * SECTION-PROJECTION-EXTRACTION-01 — the projection law, at its own address.
 *
 * ⭐⭐ THE ACCEPTANCE LAW, IN ONE SENTENCE:
 *
 *     A pure read rule must be importable without importing the authority to
 *     mutate the object it describes.
 *
 * ⛔ WHAT WENT WRONG, AND IT WAS PLACEMENT, NOT BEHAVIOUR. `splitStoredSection`
 * is pure — `(text, heading) → { headingPrefix, body }`, no database, no
 * ontology — and it lived inside `saveSection.ts` beside `saveSection` and
 * `saveSectionInTransaction`, which UPDATE `manuscript_draft_sections` and
 * `manuscript_working_drafts`. So a read-only route that needed the projection
 * rule acquired, transitively, a module that can mutate the Work.
 *
 * ⭐ `askRouteEffectFamily` detected exactly that, and was right to: it walks the
 * Ask route's transitive VALUE-import graph and holds that *"the Work is
 * reachable from this route for READING only."* The route never called the
 * mutating exports — and a static law exists precisely because *does not call it
 * today* is not a guarantee.
 *
 * ⭐⭐ THE PATTERN IS ALREADY RULED IN THIS CODEBASE. `lib/manuscript/exactText.ts`
 * was extracted on a founder ruling for the same reason: *"the mutation law was
 * about to lose its home along with an ontology it never belonged to."* Neutral
 * manuscript law does not live inside a mutation-bearing carrier merely because
 * that is where it was first needed.
 *
 * ⛔ NOTHING HERE IS NEW. The function below is the one that was in
 * `saveSection.ts`, moved character for character. ⛔ No heading law changed, no
 * projection semantics changed, and `saveSection` imports it rather than keeping
 * a second copy — a duplicated projection would shift offsets by the heading
 * prefix, silently, and only for headed sections.
 */

/**
 * Split a stored section slice into the part the member may not edit and the
 * part they may. PURE.
 *
 * Returns null when the slice does not begin with the heading the Source
 * records — which means this section is not in the shape this cut knows how to
 * edit, and refusing is the only honest response. Never guesses at a heading
 * by looking at the text.
 */
export function splitStoredSection(
  text: string,
  heading: string | null,
): { headingPrefix: string; body: string } | null {
  const h = heading?.trim();
  if (!h) return { headingPrefix: '', body: text };

  /* The composer writes `heading\n\n` before the body. Accept exactly that,
     and the degenerate case of a heading with nothing after it. */
  if (text === h) return { headingPrefix: h, body: '' };
  if (text.startsWith(`${h}\n`)) {
    const prefixEnd = text.startsWith(`${h}\n\n`) ? h.length + 2 : h.length + 1;
    return { headingPrefix: text.slice(0, prefixEnd), body: text.slice(prefixEnd) };
  }
  return null;
}
