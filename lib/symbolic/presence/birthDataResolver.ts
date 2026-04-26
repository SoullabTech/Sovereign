/**
 * Birth Data Resolver — Astrologer field prerequisite check.
 *
 * Per the Astrologer canon §3 (Symbolic Grammar) and route-integration map §3,
 * interpretation requires complete birth data. This module determines whether
 * the member has sufficient data on file for the chart to be readable.
 *
 * Definition of "sufficient" (v1, self-only):
 *   birth_date IS NOT NULL
 *   AND birth_time IS NOT NULL
 *   AND birth_timezone IS NOT NULL
 *   AND (birth_location_name IS NOT NULL  OR  (birth_location_lat AND birth_location_lng))
 *
 * Recomputed every turn (no caching). If birth data is partially or fully
 * removed while the field is active, the next turn's `nextFieldState` will
 * downgrade `'active' → 'requested'` because `hasBirthData === false`.
 *
 * Partner data is not modeled in v1; `partner` is always false. The brief
 * instructs MAIA to ask for partner data verbally inside the conversation
 * when synastry is needed.
 */

import { query } from '@/lib/db/postgres';

export interface BirthDataStatus {
  /** True iff the member has sufficient self birth data for chart reading. */
  self: boolean;
  /** Partner data is not modeled in v1; always false. */
  partner: false;
}

const ALL_FALSE: BirthDataStatus = { self: false, partner: false };

/** Row shape returned from the members table read. */
export interface MemberBirthRow {
  birth_date: Date | string | null;
  birth_time: string | null;
  birth_timezone: string | null;
  birth_location_name: string | null;
  birth_location_lat: string | number | null;
  birth_location_lng: string | number | null;
}

/**
 * Pure evaluator over a member row. Exposed for unit testing without DB.
 *
 * Returns `{ self: false, partner: false }` for null input or any missing
 * required field. Returns `{ self: true, partner: false }` when all four
 * conditions hold.
 */
export function evaluateRow(row: MemberBirthRow | null | undefined): BirthDataStatus {
  if (!row) return ALL_FALSE;

  const hasDate = row.birth_date != null;
  const hasTime = row.birth_time != null && String(row.birth_time).trim() !== '';
  const hasTimezone = row.birth_timezone != null && row.birth_timezone.trim() !== '';

  const hasName = row.birth_location_name != null && row.birth_location_name.trim() !== '';
  const hasLatLng = row.birth_location_lat != null && row.birth_location_lng != null;
  const hasLocation = hasName || hasLatLng;

  const self = hasDate && hasTime && hasTimezone && hasLocation;
  return { self, partner: false };
}

/**
 * Read birth data status for a member from the database.
 *
 * Graceful fallback: returns `{ self: false, partner: false }` on any DB
 * error or missing member row. The route then routes to REQUESTED state and
 * re-prompts for data, which is the correct degraded behavior.
 */
export async function getBirthDataStatus(memberId: string): Promise<BirthDataStatus> {
  try {
    const result = await query<MemberBirthRow>(
      `SELECT
         birth_date,
         birth_time,
         birth_timezone,
         birth_location_name,
         birth_location_lat,
         birth_location_lng
       FROM members
       WHERE id = $1`,
      [memberId],
    );
    if (result.rows.length === 0) return ALL_FALSE;
    return evaluateRow(result.rows[0]);
  } catch (error) {
    console.warn('[birth-data-resolver] read failed', {
      memberId,
      error: error instanceof Error ? error.message : String(error),
    });
    return ALL_FALSE;
  }
}
