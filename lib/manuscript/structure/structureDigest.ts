/**
 * The canonical-structure digest, as a pure function of rows.
 *
 * EXTRACTED, NOT INVENTED. `canonicalFingerprint()` has digested authored
 * structure since WS2-05B-5½ — every field of every unit and every membership,
 * ordered deterministically. BUILD-07A needs the same digest over rows it has
 * already read inside a capture, without a second database round-trip and
 * without a second algorithm that merely agrees with the first today. So the
 * digest moves here, with no database in it, and `canonicalFingerprint` calls
 * in. One algorithm; two callers.
 *
 * THE ROW SHAPES ARE THE DATABASE'S, snake_case and all. The digest is over
 * `JSON.stringify` of the rows, so a renamed key would change every existing
 * fingerprint — including the `canonical_at_open` values frozen into ask
 * threads. Callers that hold camelCase rows map them back to this shape rather
 * than this function learning a second one.
 */

import { createHash } from 'crypto';

/** A `manuscript_structure_units` row, as `canonicalFingerprint` selects it. */
export interface CanonicalUnitRow {
  id: string;
  parent_id: string | null;
  position: number;
  kind: string | null;
  title: string | null;
  origin: string;
  adopted_from_id: string | null;
}

/** A `manuscript_structure_members` row, as `canonicalFingerprint` selects it. */
export interface CanonicalMemberRow {
  unit_id: string;
  draft_section_id: string;
}

const byId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const byUnitThenSection = (a: CanonicalMemberRow, b: CanonicalMemberRow) =>
  a.unit_id < b.unit_id ? -1 : a.unit_id > b.unit_id ? 1
    : a.draft_section_id < b.draft_section_id ? -1 : a.draft_section_id > b.draft_section_id ? 1 : 0;

/**
 * SHA-256 over every field that describes the Work's authored structure.
 *
 * Rows are sorted here with the same ordering the SQL used (`ORDER BY id`;
 * `ORDER BY unit_id, draft_section_id`) so two identical structures digest
 * identically whatever order a caller supplies them in. PostgreSQL orders text
 * by collation; uuids compare bytewise in both places, and every id here is a
 * uuid, so the two orderings coincide.
 */
export function fingerprintStructureRows(
  units: readonly CanonicalUnitRow[],
  members: readonly CanonicalMemberRow[],
): string {
  const u = [...units].sort(byId).map((r) => ({
    id: r.id, parent_id: r.parent_id, position: r.position, kind: r.kind,
    title: r.title, origin: r.origin, adopted_from_id: r.adopted_from_id,
  }));
  const m = [...members].sort(byUnitThenSection).map((r) => ({
    unit_id: r.unit_id, draft_section_id: r.draft_section_id,
  }));
  return createHash('sha256')
    .update(JSON.stringify({ units: u, members: m }))
    .digest('hex');
}
