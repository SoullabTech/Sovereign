/**
 * Ordering for the continuity kinds on practitioner_client_notes.
 *
 * ⛔ THERE IS DELIBERATELY NO GENERIC `sortByKind()` HERE.
 *
 * `sortNotes()` in `noteOrder.ts` mirrors `ORDER BY note_date DESC, created_at DESC`
 * and is exclusive to kind='note'. That ordering expresses the ontology of a session
 * note: a session happened at a time. The continuity kinds do not share that axis,
 * and routing them through one parameterised comparator would assert that they do.
 *
 * ⭐ An object may carry timestamps without being temporal in meaning.
 *
 * Four objects, four questions, four comparators. A little duplication is preferable
 * to an abstraction that implies a shared ordering ontology.
 *
 * @see lib/studio/noteOrder.ts — kind='note' only
 */

export interface OrderableContinuityItem {
  createdAt: string;
  updatedAt: string;
  status: string | null;
}

/**
 * LIVING COMMITMENTS — "which are still active, and which were most recently tended?"
 *
 * `status='alive'` first, then `updated_at DESC`. `updated_at` is admissible here
 * because it reflects practitioner activity on the commitment itself, not the
 * chronology of a session. ⛔ `note_date` is NOT used.
 */
export function sortLivingCommitments<T extends OrderableContinuityItem>(list: T[]): T[] {
  return [...list]
    .filter((c) => c.status === 'alive')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * COMMITMENT HISTORY — completed and released.
 *
 * Collapsed by default in the UI; never mixed into the live list. Ordered by
 * `updated_at DESC` as the v1 fallback — there are no `completed_at` / `released_at`
 * columns, and adding them would exceed the authorized object.
 */
export function sortCommitmentHistory<T extends OrderableContinuityItem>(list: T[]): T[] {
  return [...list]
    .filter((c) => c.status === 'completed' || c.status === 'released')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * RECOGNITIONS — insertion order, newest first (`created_at DESC`).
 *
 * ⚠️ PROVISIONAL, NOT ONTOLOGICAL. This asserts nothing about significance.
 * Ranking would require someone to decide what matters; curation would require a
 * reordering UI that does not exist. Insertion order is the only option that makes
 * no claim. ⛔ `note_date` is NOT used.
 */
export function sortRecognitions<T extends { createdAt: string }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * IMPORTANT DETAILS — stable insertion order, OLDEST first (`created_at ASC`).
 *
 * These behave like a maintained reference card, not a feed: stable placement
 * matters more than recency, and additions append without reshuffling the field.
 * The oldest detail may well be the most important one. ⛔ No date-based claim of
 * relevance is implied, and `note_date` is NOT used.
 */
export function sortImportantDetails<T extends { createdAt: string }>(list: T[]): T[] {
  return [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
