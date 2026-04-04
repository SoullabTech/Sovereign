/**
 * Inner Guide Field — Facet state persistence.
 *
 * Follows the exact spiralStatePersistence.ts pattern:
 * - Load: graceful fallback on error
 * - Save: fire-and-forget, void return, never blocks oracle
 *
 * Extends member_spiral_state table with facet_id and facet_movement
 * columns rather than creating a new table.
 */

import { query } from '@/lib/db/postgres';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FacetState {
  facet_id: string;
  facet_movement: string | null;
}

export interface FacetStateUpdate {
  facet_id: string;
  facet_movement?: string;
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

/**
 * Load persisted facet state for a member.
 * Returns null on missing data or error — never throws.
 */
export async function loadFacetState(memberId: string): Promise<FacetState | null> {
  try {
    const result = await query(
      `SELECT facet_id, facet_movement
       FROM member_spiral_state
       WHERE member_id = $1
       AND facet_id IS NOT NULL`,
      [memberId],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      facet_id: row.facet_id,
      facet_movement: row.facet_movement ?? null,
    };
  } catch (err) {
    console.warn('[InnerGuideField] loadFacetState failed — continuing without facet state:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Save (fire-and-forget)
// ---------------------------------------------------------------------------

/**
 * Upsert facet state for a member.
 *
 * Fire-and-forget: returns void, errors are caught and logged.
 * Never awaited in the oracle route — same pattern as upsertSpiralState.
 */
export function upsertFacetState(memberId: string, update: FacetStateUpdate): void {
  query(
    `UPDATE member_spiral_state
     SET facet_id = $2,
         facet_movement = COALESCE($3, facet_movement),
         updated_at = NOW()
     WHERE member_id = $1`,
    [memberId, update.facet_id, update.facet_movement ?? null],
  ).then((result) => {
    if (result.rowCount === 0) {
      // No existing row — this is fine, spiral state will be created
      // by upsertSpiralState on its normal path. We don't create rows
      // just for facet state.
      return;
    }
  }).catch((err) => {
    console.warn('[InnerGuideField] upsertFacetState failed:', err);
  });
}
