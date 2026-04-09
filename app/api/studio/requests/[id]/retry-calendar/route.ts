export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO RETRY CALENDAR SYNC
 *
 * Retry Google Calendar sync for a booking request.
 * Delegates to shared idempotent retry helper (canonical payload hash + atomic claim).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { retryCalendar } from '@/lib/portal/retry/retryCalendar';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Auth: must be an active practitioner
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized or not a practitioner' },
        { status: 401 }
      );
    }

    const { practitionerId, memberId } = identity;
    const { id: requestId } = await params;

    // Get the booking request scoped to this practitioner
    const requestResult = await db.query(
      `SELECT id, status, session_id, error_meta
       FROM booking_requests
       WHERE id = $1 AND practitioner_id = $2`,
      [requestId, practitionerId]
    );

    if (requestResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking request not found' },
        { status: 404 }
      );
    }

    const bookingRequest = requestResult.rows[0];

    if (!bookingRequest.session_id) {
      return NextResponse.json(
        { success: false, error: 'No session linked to this request' },
        { status: 400 }
      );
    }

    // Look up the session with calendar info
    const sessionResult = await db.query(
      `SELECT
         s.id as session_id, s.status as session_status,
         s.scheduled_start, s.scheduled_end,
         s.google_event_id,
         c.name as client_name, c.email as client_email, c.phone as client_phone,
         svc.name as service_name
       FROM sessions s
       LEFT JOIN practitioner_clients c ON s.client_id = c.id
       LEFT JOIN services svc ON s.service_id = svc.id
       WHERE s.id = $1 AND s.practitioner_id = $2`,
      [bookingRequest.session_id, practitionerId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    // Delegate to shared idempotent retry helper
    const result = await retryCalendar({
      requestId,
      bookingRequest: {
        status: bookingRequest.status,
        session_id: bookingRequest.session_id,
        error_meta: bookingRequest.error_meta,
      },
      session: {
        session_id: session.session_id,
        session_status: session.session_status,
        scheduled_start: session.scheduled_start,
        scheduled_end: session.scheduled_end,
        google_event_id: session.google_event_id,
        client_name: session.client_name,
        client_email: session.client_email,
        client_phone: session.client_phone,
        service_name: session.service_name,
      },
      memberId,
    });

    console.log(
      `[Studio Retry Calendar] request=${requestId} ` +
      `success=${result.success} idempotent=${result.idempotent} sync=${result.syncStatus}`
    );

    // Return with appropriate HTTP status
    if (!result.success && !result.idempotent) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Studio Retry Calendar]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
