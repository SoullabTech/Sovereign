/**
 * Client-side ordering for practitioner notes.
 *
 * The server returns notes with `ORDER BY note_date DESC, created_at DESC`. Before
 * notes could be backdated, the client could assume a newly created note was also the
 * newest and simply prepend it. Once `note_date` is author-supplied that assumption
 * breaks: a note about last week's session belongs in last week's position.
 *
 * This module exists so there is exactly ONE notion of "newest" — mirroring the SQL —
 * rather than a server ordering and a divergent client ordering.
 *
 * Kept pure (no React, no fetch) so the correspondence with the SQL is testable.
 */

export interface OrderableNote {
  noteDate: string;
  createdAt: string;
}

/**
 * Mirrors `ORDER BY note_date DESC, created_at DESC`.
 *
 * `note_date` is a DATE: every note on the same calendar day serializes to the same
 * instant, so the first key ties and `created_at` breaks it — exactly as Postgres does.
 */
export function sortNotes<T extends OrderableNote>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const byNoteDate = new Date(b.noteDate).getTime() - new Date(a.noteDate).getTime();
    if (byNoteDate !== 0) return byNoteDate;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
