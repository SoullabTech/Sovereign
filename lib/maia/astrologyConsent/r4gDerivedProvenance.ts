/**
 * R4G guard for known derived content originating in a protected chart
 * conversation. Exclusion occurs BEFORE memory is compressed or prompted.
 *
 * R4H: historical UNKNOWN origin is quarantined from prompt recall.
 * This is a deliberate, documented continuity tradeoff; it does NOT erase
 * historical records or automatically reclassify them as chart material.
 * Ordinary conversation turns and forward-authored ordinary memories remain.
 */
import { query } from '@/lib/db/postgres';

export async function excludeProtectedDevelopmentalMemories<T extends { id: string }>(
  userId: string,
  candidates: readonly T[],
): Promise<T[]> {
  if (!userId || candidates.length === 0) return [];
  const sourceIds = candidates.map(item => String(item.id));
  const denied = await query<{ id: string }>(
    `SELECT DISTINCT d.id::text AS id
       FROM developmental_memories AS d
       LEFT JOIN conversation_turns AS ct ON ct.exchange_id = d.source_exchange_id
       LEFT JOIN (SELECT session_id FROM astro_maia_protected_origins UNION ALL SELECT session_id FROM astro_maia_transfer_grants) AS g
         ON g.session_id = COALESCE(d.source_session_id, ct.session_id)
      WHERE d.user_id = $1::uuid
        AND d.id::text = ANY($2::text[])
        AND (
          d.origin_scope IS DISTINCT FROM 'ordinary'
          OR d.source_session_id IS NULL
          OR g.session_id IS NOT NULL
        )`,
    [userId, sourceIds],
  );
  const protectedIds = new Set(denied.rows.map(row => String(row.id)));
  return candidates.filter(candidate => !protectedIds.has(String(candidate.id)));
}
