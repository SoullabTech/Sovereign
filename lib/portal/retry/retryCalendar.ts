/**
 * RETRY CALENDAR SYNC — shared idempotent dispatch
 *
 * Called by both Studio and Portal retry paths.
 * Canonical payload hash + atomic claim guard prevents duplicate API calls.
 */

import db from '@/lib/db/postgres';
import { safeParseMeta, dispatchHash } from './safeMeta';
import { GoogleCalendarService } from '@/lib/calendar/GoogleCalendarService';

export interface CalendarRetryResult {
  success: boolean;
  idempotent: boolean;
  syncStatus: 'synced' | 'failed' | 'skipped';
  eventId?: string | null;
  message?: string;
  error?: string;
}

interface RetryCalendarInput {
  requestId: string;
  bookingRequest: {
    status: string;
    session_id: string;
    error_meta?: unknown;
  };
  session: {
    session_id: string;
    session_status: string;
    scheduled_start: string;
    scheduled_end: string;
    google_event_id: string | null;
    client_name: string | null;
    client_email: string | null;
    client_phone?: string | null;
    service_name: string | null;
  };
  memberId: string;
}

export async function retryCalendar(input: RetryCalendarInput): Promise<CalendarRetryResult> {
  const { requestId, bookingRequest, session, memberId } = input;

  // Check if Google Calendar is connected
  const isCalendarConnected = await GoogleCalendarService.isConnected(memberId);
  if (!isCalendarConnected) {
    return {
      success: true,
      idempotent: false,
      syncStatus: 'skipped',
      message: 'Google Calendar not connected',
    };
  }

  // Determine sync mode based on request status and session status
  const requestStatus = bookingRequest.status;
  const sessionStatus = session.session_status;
  let syncMode: 'create' | 'update' | 'delete' | null = null;

  if (requestStatus === 'created_session') {
    if (sessionStatus === 'scheduled' || sessionStatus === 'confirmed') {
      syncMode = session.google_event_id ? 'update' : 'create';
    }
  } else if (requestStatus === 'cancelled_by_client') {
    if (sessionStatus === 'cancelled' && session.google_event_id) {
      syncMode = 'delete';
    }
  } else if (requestStatus === 'rescheduled_by_client') {
    if (sessionStatus === 'scheduled' || sessionStatus === 'confirmed') {
      syncMode = session.google_event_id ? 'update' : 'create';
    }
  }

  if (!syncMode) {
    return {
      success: false,
      idempotent: false,
      syncStatus: 'skipped',
      message: `Cannot sync calendar for request status: ${requestStatus}, session status: ${sessionStatus}`,
    };
  }

  // Build canonical dispatch payload
  const dispatchPayload: Record<string, unknown> = {
    requestId,
    mode: syncMode,
    sessionId: session.session_id,
    googleEventId: session.google_event_id || null,
    calendarId: 'primary',
  };
  const dispatchKey = dispatchHash(dispatchPayload);
  const existingMeta = safeParseMeta(bookingRequest.error_meta);

  // Fast path: if last dispatch with same key succeeded, short-circuit
  if (existingMeta.calendar_dispatch_key === dispatchKey
      && existingMeta.calendar_dispatch_ok === true) {
    return {
      success: true,
      idempotent: true,
      syncStatus: 'synced',
      eventId: session.google_event_id,
      message: 'Calendar already synced for this state',
    };
  }

  // Atomic claim: write dispatch key before calling Google
  const claim = await db.query(
    `UPDATE booking_requests
     SET error_meta = jsonb_set(
       COALESCE(error_meta, '{}'::jsonb),
       '{calendar_dispatch_key}',
       $1::jsonb
     ),
     updated_at = NOW()
     WHERE id = $2
       AND (COALESCE(error_meta->>'calendar_dispatch_key', '') IS DISTINCT FROM $3)
     RETURNING error_meta`,
    [JSON.stringify(dispatchKey), requestId, dispatchKey]
  );

  if (claim.rowCount === 0) {
    return {
      success: true,
      idempotent: true,
      syncStatus: 'synced',
      eventId: session.google_event_id,
      message: 'Calendar dispatch already claimed',
    };
  }

  const claimedMeta = safeParseMeta(claim.rows[0]?.error_meta);

  // Execute the sync operation
  let eventId: string | null = null;
  let syncStatus: 'synced' | 'failed' = 'failed';
  let syncError: string | null = null;

  try {
    const summary = session.service_name || `Session - ${session.client_name || 'Client'}`;
    const descriptionParts: string[] = [];
    if (session.client_name) descriptionParts.push(`Client: ${session.client_name}`);
    if (session.client_email) descriptionParts.push(`Email: ${session.client_email}`);
    if (session.client_phone) descriptionParts.push(`Phone: ${session.client_phone}`);
    const description = descriptionParts.join('\n');

    const startTime = new Date(session.scheduled_start);
    const endTime = new Date(session.scheduled_end);

    if (syncMode === 'create') {
      eventId = await GoogleCalendarService.createEvent(
        memberId,
        { summary, description, start: startTime, end: endTime },
        'primary'
      );
      syncStatus = eventId ? 'synced' : 'failed';
      if (!eventId) syncError = 'Failed to create Google Calendar event';
    } else if (syncMode === 'update') {
      if (!session.google_event_id) {
        throw new Error('Cannot update event without google_event_id');
      }
      eventId = await GoogleCalendarService.updateEvent(
        memberId,
        session.google_event_id,
        { summary, description, start: startTime, end: endTime },
        'primary'
      );
      syncStatus = eventId ? 'synced' : 'failed';
      if (!eventId) syncError = 'Failed to update Google Calendar event';
    } else if (syncMode === 'delete') {
      if (!session.google_event_id) {
        throw new Error('Cannot delete event without google_event_id');
      }
      const deleted = await GoogleCalendarService.deleteEvent(memberId, session.google_event_id);
      if (deleted) {
        syncStatus = 'synced';
        eventId = null;
      } else {
        syncError = 'Failed to delete Google Calendar event';
      }
    }
  } catch (calendarError: unknown) {
    const errorMessage = calendarError instanceof Error ? calendarError.message : String(calendarError);
    console.error('[Retry Calendar] Calendar operation failed:', errorMessage);
    syncError = errorMessage;
    syncStatus = 'failed';
  }

  // Update session's calendar sync fields
  await db.query(
    `UPDATE sessions
     SET google_event_id = $1,
         calendar_sync_status = $2,
         calendar_sync_error = $3,
         updated_at = NOW()
     WHERE id = $4`,
    [eventId, syncStatus, syncError, session.session_id]
  );

  // Record results in error_meta (merge against claimedMeta)
  const calHistory = Array.isArray(claimedMeta.calendar_retry_history)
    ? (claimedMeta.calendar_retry_history as unknown[])
    : [];

  const now = new Date().toISOString();
  const updatedMeta = {
    ...claimedMeta,
    last_calendar_retry: now,
    calendar_retry_result: syncStatus,
    calendar_dispatch_key: dispatchKey,
    calendar_dispatch_payload: dispatchPayload,
    calendar_dispatch_ok: syncStatus === 'synced',
    calendar_retry_history: [
      ...calHistory,
      { at: now, key: dispatchKey, mode: syncMode, result: syncStatus, error: syncError },
    ].slice(-10),
    last_action: 'retry_calendar',
    last_action_at: now,
    last_action_idempotent: false,
  };

  await db.query(
    `UPDATE booking_requests
     SET error_meta = $1::jsonb,
         updated_at = NOW()
     WHERE id = $2`,
    [updatedMeta, requestId]
  );

  if (syncStatus === 'synced') {
    return {
      success: true,
      idempotent: false,
      syncStatus,
      eventId,
      message: `Calendar ${syncMode} successful`,
    };
  } else {
    return {
      success: false,
      idempotent: false,
      syncStatus,
      error: syncError || `Failed to ${syncMode} calendar event`,
    };
  }
}
