/**
 * GOOGLE CALENDAR SESSION SYNC
 *
 * Pushes MAIA session bookings to Google Calendar.
 * Called from session create, update, and cancel flows.
 *
 * Non-blocking by design — sync failures never prevent
 * the session operation itself from succeeding.
 */

import { query } from '@/lib/db/postgres';
import { GoogleCalendarService } from './GoogleCalendarService';

// ─── Types ─────────────────────────────────────────────────────────────

interface SessionForSync {
  id: string;
  scheduledStart: Date | string;
  scheduledEnd: Date | string;
  clientName?: string;
  serviceName?: string;
  locationType?: string;
  locationDetails?: string;
  notes?: string;
  practitionerName?: string;
}

interface SyncResult {
  success: boolean;
  googleEventId?: string;
  error?: string;
}

// ─── Core sync functions ───────────────────────────────────────────────

/**
 * Create a Google Calendar event for a new session.
 * Updates the session row with the google_event_id and sync status.
 */
export async function syncNewSessionToGoogle(
  memberId: string,
  session: SessionForSync
): Promise<SyncResult> {
  try {
    // Check if Google Calendar is connected
    const connected = await GoogleCalendarService.isConnected(memberId);
    if (!connected) {
      // Not an error — they just haven't connected Google Calendar
      await updateSyncStatus(session.id, 'not_connected');
      return { success: true };
    }

    const start = new Date(session.scheduledStart);
    const end = new Date(session.scheduledEnd);

    const summary = [session.serviceName, session.clientName]
      .filter(Boolean)
      .join(' — ') || 'Session';

    const description = buildEventDescription(session);

    const googleEventId = await GoogleCalendarService.createEvent(memberId, {
      summary,
      description,
      start,
      end,
      location: session.locationDetails || undefined,
    });

    if (googleEventId) {
      await updateSyncStatus(session.id, 'synced', googleEventId);
      console.log(`[CalendarSync] Session ${session.id} synced → Google event ${googleEventId}`);
      return { success: true, googleEventId };
    } else {
      await updateSyncStatus(session.id, 'failed', null, 'Google Calendar API returned no event ID');
      return { success: false, error: 'Failed to create Google Calendar event' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CalendarSync] Failed to sync session ${session.id}:`, message);
    await updateSyncStatus(session.id, 'failed', null, message);
    return { success: false, error: message };
  }
}

/**
 * Update an existing Google Calendar event when a session is modified.
 * If no google_event_id exists, creates a new event instead.
 */
export async function syncUpdatedSessionToGoogle(
  memberId: string,
  session: SessionForSync
): Promise<SyncResult> {
  try {
    const connected = await GoogleCalendarService.isConnected(memberId);
    if (!connected) {
      return { success: true };
    }

    // Get the existing google_event_id
    const existing = await query(
      'SELECT google_event_id FROM sessions WHERE id = $1',
      [session.id]
    );
    const googleEventId = existing.rows[0]?.google_event_id;

    if (!googleEventId) {
      // No existing event — create one
      return syncNewSessionToGoogle(memberId, session);
    }

    // Delete the old event and create a new one
    // (Google Calendar API update requires the full event body anyway,
    // and delete+create is more reliable than PATCH for our use case)
    await GoogleCalendarService.deleteEvent(memberId, googleEventId);

    return syncNewSessionToGoogle(memberId, session);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CalendarSync] Failed to update sync for session ${session.id}:`, message);
    await updateSyncStatus(session.id, 'failed', null, message);
    return { success: false, error: message };
  }
}

/**
 * Cancel/delete the Google Calendar event when a session is cancelled.
 */
export async function syncCancelledSessionToGoogle(
  memberId: string,
  sessionId: string
): Promise<SyncResult> {
  try {
    const connected = await GoogleCalendarService.isConnected(memberId);
    if (!connected) {
      return { success: true };
    }

    const existing = await query(
      'SELECT google_event_id FROM sessions WHERE id = $1',
      [sessionId]
    );
    const googleEventId = existing.rows[0]?.google_event_id;

    if (!googleEventId) {
      return { success: true }; // Nothing to cancel
    }

    const deleted = await GoogleCalendarService.deleteEvent(memberId, googleEventId);

    if (deleted) {
      await updateSyncStatus(sessionId, 'cancelled');
      console.log(`[CalendarSync] Cancelled Google event ${googleEventId} for session ${sessionId}`);
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CalendarSync] Failed to cancel sync for session ${sessionId}:`, message);
    return { success: false, error: message };
  }
}

/**
 * Sync all pending/unsynced sessions to Google Calendar.
 * Used for manual "sync all" from the UI.
 */
export async function syncAllPendingSessions(memberId: string): Promise<{
  synced: number;
  failed: number;
  skipped: number;
}> {
  const connected = await GoogleCalendarService.isConnected(memberId);
  if (!connected) {
    return { synced: 0, failed: 0, skipped: 0 };
  }

  // Find sessions that haven't been synced yet
  const result = await query(`
    SELECT
      s.id,
      s.scheduled_start,
      s.scheduled_end,
      s.location_type,
      s.location_details,
      s.notes,
      c.name as client_name,
      svc.name as service_name,
      p.name as practitioner_name
    FROM sessions s
    LEFT JOIN practitioner_clients c ON s.client_id = c.id
    LEFT JOIN services svc ON s.service_id = svc.id
    LEFT JOIN practitioners p ON s.practitioner_id = p.id
    WHERE s.google_event_id IS NULL
      AND s.calendar_sync_status IS DISTINCT FROM 'synced'
      AND s.status IN ('scheduled', 'confirmed')
      AND s.scheduled_start > NOW()
    ORDER BY s.scheduled_start ASC
    LIMIT 50
  `);

  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of result.rows) {
    const syncResult = await syncNewSessionToGoogle(memberId, {
      id: row.id,
      scheduledStart: row.scheduled_start,
      scheduledEnd: row.scheduled_end,
      clientName: row.client_name,
      serviceName: row.service_name,
      locationType: row.location_type,
      locationDetails: row.location_details,
      notes: row.notes,
      practitionerName: row.practitioner_name,
    });

    if (syncResult.success && syncResult.googleEventId) {
      synced++;
    } else if (!syncResult.success) {
      failed++;
    } else {
      skipped++;
    }
  }

  console.log(`[CalendarSync] Bulk sync complete: ${synced} synced, ${failed} failed, ${skipped} skipped`);
  return { synced, failed, skipped };
}

// ─── Helpers ───────────────────────────────────────────────────────────

async function updateSyncStatus(
  sessionId: string,
  status: string,
  googleEventId?: string | null,
  error?: string
): Promise<void> {
  const updates: string[] = [`calendar_sync_status = $2`];
  const params: (string | null)[] = [sessionId, status];

  if (googleEventId !== undefined) {
    updates.push(`google_event_id = $${params.length + 1}`);
    params.push(googleEventId);
  }

  if (error !== undefined) {
    updates.push(`calendar_sync_error = $${params.length + 1}`);
    params.push(error);
  } else {
    updates.push(`calendar_sync_error = NULL`);
  }

  updates.push(`updated_at = NOW()`);

  await query(
    `UPDATE sessions SET ${updates.join(', ')} WHERE id = $1`,
    params
  );
}

function buildEventDescription(session: SessionForSync): string {
  const lines: string[] = [];

  if (session.clientName) {
    lines.push(`Client: ${session.clientName}`);
  }
  if (session.serviceName) {
    lines.push(`Service: ${session.serviceName}`);
  }
  if (session.locationType) {
    const typeLabel = {
      video: 'Video Call',
      phone: 'Phone',
      in_person: 'In Person',
      async: 'Async',
    }[session.locationType] || session.locationType;
    lines.push(`Location: ${typeLabel}`);
  }
  if (session.notes) {
    lines.push('');
    lines.push(session.notes);
  }

  lines.push('');
  lines.push('Managed by Soullab Studio');

  return lines.join('\n');
}
