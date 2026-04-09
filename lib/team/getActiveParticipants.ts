// SoulComms — Active participant resolver
//
// SINGLE SOURCE OF TRUTH for "who counts as a participant in this channel"
// when converting it from public to private.
//
// This module is called by both:
//   - GET  /api/team/channels/[channelId]/visibility/preview (count for modal)
//   - PATCH /api/team/channels/[channelId]/visibility       (seed for flip)
//
// They MUST use the same definition or the modal lies. Do not duplicate this
// query elsewhere.
//
// Definition: a participant is a member who has either
//   1. sent ≥1 non-deleted message in this channel (top-level OR thread reply), OR
//   2. is the channel creator (preserves control even if they never posted)
//
// Reactions and read receipts deliberately do NOT count — they're too low-signal
// to justify access in an intentional-membership model.

import { query } from '@/lib/db/postgres';
import type { TransactionClient } from '@/lib/db/postgres';

type Querier = {
  query: typeof query | TransactionClient['query'];
};

/**
 * Return the set of member IDs who are active participants in a channel,
 * filtered to members who currently exist in the `members` table.
 *
 * Used for both preview (count) and seed (insert) — same query, no drift.
 *
 * @param channelId - The channel to inspect
 * @param client - Optional transaction client; defaults to top-level query()
 * @returns Sorted array of distinct member UUIDs
 */
export async function getActiveParticipants(
  channelId: string,
  client?: Querier
): Promise<string[]> {
  const q = client?.query ?? query;
  const result = await q<{ member_id: string }>(
    `SELECT DISTINCT m.id AS member_id
       FROM members m
      WHERE m.id IN (
        SELECT DISTINCT sender_id
          FROM team_messages
         WHERE channel_id = $1 AND deleted_at IS NULL
        UNION
        SELECT created_by
          FROM team_channels
         WHERE id = $1 AND created_by IS NOT NULL
      )
      ORDER BY m.id`,
    [channelId]
  );

  return result.rows.map((row) => row.member_id);
}
