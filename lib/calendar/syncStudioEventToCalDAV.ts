/**
 * CALDAV SYNC FOR STUDIO CALENDAR EVENTS
 *
 * Fire-and-forget sync of studio-created events to CalDAV (Proton, etc.).
 * Mirrors the syncSessionToGoogle pattern: non-blocking, error-persisted.
 *
 * Does NOT overwrite calendar_provider — event origin stays 'studio'.
 * Only updates sync_status, external_event_id, and tracking fields.
 */

import db from '@/lib/db/postgres';
import { getCalDAVClient } from '@/lib/connectors/caldav/caldavConnector';
import { getConnector } from '@/lib/connectors/connectorDb';

/**
 * Sync a newly created studio event to the member's CalDAV calendar.
 * Fire-and-forget — caller should not await this.
 */
export async function syncEventToCalDAV(
  memberId: string,
  eventId: string
): Promise<void> {
  try {
    // Check if CalDAV is configured
    const connector = await getConnector(memberId, 'caldav');
    if (!connector || connector.status !== 'connected') {
      await updateSyncStatus(eventId, memberId, 'not_connected', null, 'CalDAV not configured');
      return;
    }

    // Load the event — scoped to member, exclude deleted
    const result = await db.query(
      `SELECT id, title, description, start_time, end_time, all_day, location, calendar_disclosure
       FROM calendar_events
       WHERE id = $1 AND member_id = $2 AND deleted_at IS NULL`,
      [eventId, memberId]
    );

    if (result.rows.length === 0) {
      console.warn('[CalDAV Sync] Event not found or deleted:', eventId);
      return;
    }

    const row = result.rows[0];

    // Respect disclosure: private events should not sync externally
    if (row.calendar_disclosure === 'private') {
      await updateSyncStatus(eventId, memberId, 'local_only', null, null);
      return;
    }

    // Get CalDAV client
    const client = await getCalDAVClient(memberId);

    // Build CalDAV event — apply disclosure filter
    const title = row.calendar_disclosure === 'generic' ? 'Busy' : row.title;
    const description = row.calendar_disclosure === 'full' ? (row.description ?? undefined) : undefined;

    const externalEventId = await client.createEvent({
      title,
      description,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      location: row.calendar_disclosure === 'full' ? (row.location ?? undefined) : undefined,
      status: 'confirmed',
    });

    // Update sync tracking
    await updateSyncStatus(eventId, memberId, 'synced', externalEventId, null);

    console.log(`[CalDAV Sync] Event synced: ${eventId} → ${externalEventId}`);
  } catch (err: any) {
    const errorMsg = err.message ?? 'Unknown sync error';
    console.error(`[CalDAV Sync] Failed for event ${eventId}:`, errorMsg);
    await updateSyncStatus(eventId, memberId, 'failed', null, errorMsg).catch(() => {});
  }
}

/**
 * Delete a studio event from the member's CalDAV calendar.
 * Fire-and-forget — caller should not await this.
 */
export async function deleteEventFromCalDAV(
  memberId: string,
  eventId: string
): Promise<void> {
  try {
    // Load the external event ID
    const result = await db.query(
      `SELECT external_event_id FROM calendar_events
       WHERE id = $1 AND member_id = $2`,
      [eventId, memberId]
    );

    if (result.rows.length === 0) return;

    const externalId = result.rows[0].external_event_id;
    if (!externalId) return; // Never synced — nothing to delete

    // Check if CalDAV is configured
    const connector = await getConnector(memberId, 'caldav');
    if (!connector || connector.status !== 'connected') return;

    const client = await getCalDAVClient(memberId);
    await client.deleteEvent(externalId);

    console.log(`[CalDAV Sync] Event deleted from CalDAV: ${externalId}`);
  } catch (err: any) {
    // Log but don't fail — the local soft-delete already succeeded
    console.error(`[CalDAV Sync] Delete failed for event ${eventId}:`, err.message);
  }
}

// ── Internal helpers ────────────────────────────────────────────────────────

async function updateSyncStatus(
  eventId: string,
  memberId: string,
  syncStatus: string,
  externalEventId: string | null,
  syncError: string | null
): Promise<void> {
  await db.query(
    `UPDATE calendar_events
     SET sync_status = $1,
         external_event_id = COALESCE($2, external_event_id),
         last_sync_error = $3,
         last_synced_at = CASE WHEN $1 = 'synced' THEN NOW() ELSE last_synced_at END,
         updated_at = NOW()
     WHERE id = $4 AND member_id = $5`,
    [syncStatus, externalEventId, syncError, eventId, memberId]
  );
}
