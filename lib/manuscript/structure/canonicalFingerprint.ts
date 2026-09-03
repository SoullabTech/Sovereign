/**
 * WS2-05B-5½ — everything the canonical structure of a Work currently is, as one
 * digest.
 *
 * WHY NOT A COUNT. The first negative witness in the reader run asserted that a
 * manuscript had ZERO structure units after a reading, and called that proof the
 * reader had written none. It proves nothing of the sort. It proves "this Work
 * has no structure" - true of a Work that never had any, and silent about a Work
 * that already does. On Elemental Alchemy, with divisions authored in 05A, that
 * check would have failed the run for structure the member wrote themselves.
 *
 * A count is also blind to the writes most worth catching. A renamed division, a
 * moved boundary, a section reassigned from one unit to another: all writes, all
 * leaving the count exactly where it was.
 *
 * So the claim being made is BEFORE == AFTER, over every field that describes
 * the Work, ordered deterministically. It is READ-ONLY and imports no writer -
 * the static "no structure service in the process" proof stands alongside it,
 * because a digest can only show that nothing moved, never that nothing could.
 */

import { query } from '@/lib/db/postgres';
import {
  fingerprintStructureRows,
  type CanonicalMemberRow,
  type CanonicalUnitRow,
} from './structureDigest';

/**
 * BUILD-07A NOTE. The digest itself lives in `structureDigest.ts`, pure, so the
 * developmental-evidence capture can fingerprint the rows it has already read
 * under its own lock with the SAME algorithm. This function is the database
 * reader; it selects exactly the columns it always has, in the same order, and
 * hands them to the one digest. The value it returns is unchanged.
 */
export async function canonicalFingerprint(manuscriptId: string): Promise<string> {
  const units = await query<CanonicalUnitRow>(
    `SELECT id, parent_id, position, kind, title, origin, adopted_from_id
       FROM manuscript_structure_units
      WHERE manuscript_id = $1
      ORDER BY id`, [manuscriptId]);

  /* Memberships are joined through units so the scope is the same manuscript,
     and ordered by both columns so two identical structures digest identically
     whatever order the planner returns rows in. */
  const members = await query<CanonicalMemberRow>(
    `SELECT m.unit_id, m.draft_section_id
       FROM manuscript_structure_members m
       JOIN manuscript_structure_units u ON u.id = m.unit_id
      WHERE u.manuscript_id = $1
      ORDER BY m.unit_id, m.draft_section_id`, [manuscriptId]);

  return fingerprintStructureRows(units.rows, members.rows);
}
