/**
 * WS-BETA-R2 / #1804 — two historically valid *exact* chapter-review sets.
 *
 * Old runtime commissions eight Review lenses including Themes; the flagship
 * Review intentionally commissions seven (Themes and Overview belong to Develop).
 * Preserve the old eight-lens manifest verbatim. Do not invent a Themes reading,
 * add Overview to Review, or let an incomplete/duplicate mixed set pass.
 *
 * This only makes the NEW reader backward-accepting. The immutable OLD reader
 * cannot accept seven-lens submissions, so rollback still requires a separate
 * reviewed ingress/failure-prefix safeguard.
 */
export const LEGACY_EIGHT_CHAPTER_REVIEW_LENSES = [
  'structure', 'development', 'continuity', 'arc', 'themes', 'voice', 'coherence', 'reader',
] as const;

export function isCompleteChapterReviewAccounting(
  completed: ReadonlySet<string>,
  currentSeven: readonly string[],
): boolean {
  const matches = (required: readonly string[]): boolean =>
    completed.size === required.length && required.every((lens) => completed.has(lens));
  return matches(currentSeven) || matches(LEGACY_EIGHT_CHAPTER_REVIEW_LENSES);
}
