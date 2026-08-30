/**
 * WS2-04B — what a writer is told when section navigation is unavailable.
 *
 * The resolver's `reason` is a classification: EDITED, NO_SOURCE, WITHHELD.
 * Those are instrumentation words. Showing them to a writer would leak the
 * measuring apparatus into the room and describe their manuscript in a
 * vocabulary invented for auditing it.
 *
 * The mapping is here, on the server side of the boundary, so a component
 * cannot render a raw reason by accident — there is no path from the
 * classification to the screen that does not pass through this file.
 *
 * Founder-authored copy, 2026-08-30. Each state names a DIFFERENT KIND OF
 * TASK, and the distinction is the point:
 *
 *   no structure yet   → an authorship task. The writer makes the sections.
 *   breaks unconfirmed → a sovereignty task. Only they can say where a break
 *                        now falls, and the system must not guess.
 *   unverifiable       → a platform task. Ours, not theirs, and it should not
 *                        read like something they did.
 *
 * In all three the same sentence appears in substance: their writing is
 * unchanged and they can keep working. Whatever else is true, nothing has
 * happened to their words.
 */

export interface NavigationUnavailableCopy {
  title: string;
  body: string;
}

export function sectionNavigationCopy(reason: string): NavigationUnavailableCopy {
  switch (reason) {
    case 'NO_SOURCE':
      return {
        title: "This draft doesn't have section structure yet.",
        body: 'You can keep writing here. To use section navigation, create its sections first.',
      };
    case 'EDITED':
      return {
        title: "This draft's section breaks need your confirmation.",
        body:
          'Your writing is unchanged, and you can keep working here. Section navigation ' +
          'will stay off until you confirm where the sections belong.',
      };
    case 'WITHHELD':
    default:
      /* Also the fallback for a reason this file has not been taught. An
         unknown classification must never fall through to a raw string: the
         honest answer is that we could not verify it, which is exactly what
         WITHHELD means anyway. */
      return {
        title: "Section navigation isn't available for this draft right now.",
        body:
          "Writer's Studio couldn't verify its section structure safely. " +
          'Your writing is unchanged.',
      };
  }
}

/**
 * The pre-activation state: convertible, simply not converted yet. Deliberately
 * says almost nothing — there is no problem to explain, and this state
 * disappears once activation converts before rendering.
 */
export const NAVIGATION_NOT_ACTIVE = {
  title: "Section navigation isn't active for this draft yet.",
  body: '',
} as const;

/** Diagnostic words that must never appear in member-facing copy. */
const FORBIDDEN = [
  'classification', 'boundary resolution', 'NO_SOURCE', 'WITHHELD',
  'EDITED', 'PRISTINE', 'LEGACY_COMPOSER_VARIANT', 'stale_base',
];

/** Guard for the tests: no instrumentation vocabulary reaches a writer. */
export function copyIsFreeOfDiagnostics(c: NavigationUnavailableCopy): boolean {
  const text = `${c.title} ${c.body}`;
  return !FORBIDDEN.some((w) => text.includes(w));
}
