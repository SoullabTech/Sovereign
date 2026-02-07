export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO RETRY NOTIFICATIONS
 *
 * Re-sends notification emails for a booking request based on its status.
 * Delegates to shared idempotent retry helper (canonical payload hash + atomic claim).
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { retryNotifications } from '@/lib/portal/retry/retryNotifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate practitioner
    const practitioner = await getCurrentPractitioner(request);
    if (!practitioner) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: requestId } = await params;

    // Get booking request scoped to this practitioner
    const brResult = await db.query(
      `SELECT id, session_id, status, error_message, error_meta
       FROM booking_requests
       WHERE id = $1 AND practitioner_id = $2`,
      [requestId, practitioner.practitionerId]
    );

    if (brResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booking request not found' },
        { status: 404 }
      );
    }

    const bookingRequest = brResult.rows[0];

    if (!bookingRequest.session_id) {
      return NextResponse.json(
        { success: false, error: 'No session linked to this request' },
        { status: 400 }
      );
    }

    // Get session details with joins
    const sessionResult = await db.query(
      `SELECT
         s.id as session_id, s.status as session_status,
         s.scheduled_start, s.scheduled_end, s.management_token,
         s.notes,
         c.name as client_name, c.email as client_email,
         svc.name as service_name, svc.duration_minutes,
         p.name as practitioner_name, p.email as practitioner_email,
         p.slug as practitioner_slug, p.business_name, p.member_id
       FROM sessions s
       LEFT JOIN stellium_clients c ON s.client_id = c.id
       LEFT JOIN services svc ON s.service_id = svc.id
       LEFT JOIN practitioners p ON s.practitioner_id = p.id
       WHERE s.id = $1 AND s.practitioner_id = $2`,
      [bookingRequest.session_id, practitioner.practitionerId]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    // Get practitioner timezone
    const tzResult = await db.query(
      `SELECT timezone FROM practitioner_settings WHERE practitioner_id = $1`,
      [practitioner.practitionerId]
    );
    const timezone = tzResult.rows[0]?.timezone || 'America/Chicago';

    // Delegate to shared idempotent retry helper
    const result = await retryNotifications({
      requestId,
      bookingRequest: {
        status: bookingRequest.status,
        session_id: bookingRequest.session_id,
        error_message: bookingRequest.error_message,
        error_meta: bookingRequest.error_meta,
      },
      session: {
        session_id: session.session_id,
        scheduled_start: session.scheduled_start,
        scheduled_end: session.scheduled_end,
        notes: session.notes,
        client_name: session.client_name,
        client_email: session.client_email,
        service_name: session.service_name,
        duration_minutes: session.duration_minutes,
        practitioner_name: session.practitioner_name,
        practitioner_email: session.practitioner_email,
        practitioner_slug: session.practitioner_slug,
        business_name: session.business_name,
        management_token: session.management_token,
      },
      timezone,
    });

    console.log(
      `[Studio Retry Notifications] request=${requestId} ` +
      `status=${bookingRequest.status} success=${result.success} idempotent=${result.idempotent}`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Studio Retry Notifications]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retry notifications' },
      { status: 500 }
    );
  }
}
