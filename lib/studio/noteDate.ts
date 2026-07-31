/**
 * Validation for a caller-supplied practitioner-note date.
 *
 * `note_date` is interpolated into `$n::date` in the client-notes routes. Until the
 * compose form began sending the field it was unreachable from the UI, so a malformed
 * value would have surfaced as a Postgres cast error — a 500 for what is really a bad
 * request. Now that practitioners author this value, reject it at the edge instead.
 *
 * Kept as a pure module (no Next.js, no db) so it can be tested directly.
 */

/** `YYYY-MM-DD`, and a date that actually exists — 2026-02-30 is rejected. */
export function isValidNoteDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  // UTC construction avoids the local-timezone shift that makes `new Date('2026-07-30')`
  // land on the previous day in negative-offset zones.
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}
