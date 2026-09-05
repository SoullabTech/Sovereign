/**
 * ONE word count for the Studio, so the surfaces cannot disagree.
 *
 * ── Why this file exists ──────────────────────────────────────────────────
 * `page.tsx` declared its `onMeta` consumer as
 *   { updatedAt; revisionCount; words: number }
 * while both producers — Worktable and WritingSurface — declared and emitted
 *   { updatedAt; revisionCount }
 * with no `words` at all. The consumer then guarded the OBJECT and read the
 * FIELD:
 *   {draftMeta && <>{draftMeta.words.toLocaleString()} words</>}
 * so every continuous manuscript reached
 *   TypeError: Cannot read properties of undefined (reading 'toLocaleString')
 * and the Canvas fell to the app error boundary. Observed in production on
 * de0f35434 against a 185-section continuous manuscript, 2026-09-05.
 *
 * The defect was the MISSING DATUM, not the unguarded read. A display guard
 * (`?.words ?? 0`) would have painted "0 words" over a real draft and called
 * it fixed. So the count is restored at the producers, and it is defined once
 * here rather than three times inline — three inline `split(/\s+/)` calls are
 * three chances for the surfaces to drift apart again.
 */

/**
 * Words in a draft. Whitespace-separated runs; empty and blank text are 0.
 *
 * Deliberately not clever: no locale segmentation, no hyphen or contraction
 * rules. It is the writer's rough sense of size, and it must agree between
 * the orientation line and the lower band — agreement matters more here than
 * lexical precision, and a precise-looking count nobody can reproduce would
 * be worse than a plain one.
 */
export function countDraftWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length;
}
