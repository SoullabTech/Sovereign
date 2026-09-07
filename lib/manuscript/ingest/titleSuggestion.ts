/**
 * A SUGGESTION for the title field, not a title.
 *
 * FOUNDER RULING 2026-09-07 — *a source filename is provenance, not a Work
 * name.* Observed on production: the Studio's largest heading read
 * `ELEMENTAL_ALCHEMY` — a filesystem token standing in for a book.
 *
 * The member always sees this in an editable field before anything is saved
 * (it only prefills an empty one), so what is stored is theirs by acceptance.
 * The repair is therefore narrow on purpose: undo the FILESYSTEM ENCODING and
 * nothing else. Underscores and hyphen runs are separators a filesystem
 * required, not punctuation an author chose, so removing them returns the
 * member's own characters rather than adding any.
 *
 * ⛔ Case is deliberately left alone. Title-casing `ELEMENTAL_ALCHEMY` would
 * invent an authorial decision — and some writers do title in caps. There is a
 * `titleFromFilename` in lib/library/ingestIntegrity.ts that title-cases;
 * it serves the library PDF pipeline and is NOT reused here, because a
 * different pipeline's idea of a good title is not a reason to restyle a
 * member's book.
 *
 * ⛔ The true filename is untouched and still recorded, verbatim, in
 * manuscript_source_arrivals.original_filename — which is where provenance
 * lives and where the Studio's HISTORY reads it from.
 */
export function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
