/**
 * PUBLISH RECORD
 *
 * Tracks what a member has published to Nostr.
 * Uses the existing member_nostr_events table.
 */

import { query } from '@/lib/db/postgres';
import type { PublishContentType, SignatureMode } from './memberPublish';

export interface PublishRecord {
  eventId: string;
  memberId: string;
  contentType: PublishContentType;
  signatureMode: SignatureMode;
  relayUrl: string;
  publishedAt: string;
  anonymous: boolean;
}

/**
 * Store a record of a published event. Fire-and-forget safe.
 */
export async function recordPublish(record: PublishRecord): Promise<void> {
  await query(
    `INSERT INTO member_nostr_events (
       member_id, event_id, event_kind, raw_event, created_at
     ) VALUES ($1, $2, 1, $3, NOW())
     ON CONFLICT DO NOTHING`,
    [
      record.memberId,
      record.eventId,
      JSON.stringify({
        contentType: record.contentType,
        signatureMode: record.signatureMode,
        relayUrl: record.relayUrl,
        publishedAt: record.publishedAt,
        anonymous: record.anonymous,
        type: 'sovereign_publish',
      }),
    ]
  );
}

/**
 * Get published event count for a member.
 */
export async function getPublishCount(memberId: string): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM member_nostr_events
     WHERE member_id = $1 AND event_kind = 1
       AND raw_event->>'type' = 'sovereign_publish'`,
    [memberId]
  );
  return parseInt(result.rows[0]?.count ?? '0', 10);
}
