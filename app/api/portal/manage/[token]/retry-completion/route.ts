export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PORTAL RETRY COMPLETION
 *
 * Client-facing "Try Again" — retries both notifications and calendar sync
 * for a booking request linked to a management token.
 *
 * No auth required (token IS the auth — same as cancel/reschedule).
 * Calls shared retry helpers that are internally idempotent.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { retryNotifications } from '@/lib/portal/retry/retryNotifications';
import { retryCalendar } from '@/lib/portal/retry/retryCalendar';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // 1. Look up session by management_token (same pattern as GET)
    const sessionResult = await db.query(
      `SELECT
         s.id as session_id, s.status as session_status,
         s.scheduled_start, s.scheduled_end,
         s.google_event_id, s.calendar_sync_status, s.calendar_sync_error,
         s.management_token, s.notes,
         c.name as client_name, c.email as client_email, c.phone as client_phone,
         svc.name as service_name, svc.duration_minutes,
         p.id as practitioner_id, p.name as practitioner_name,
         p.email as practitioner_email, p.slug as practitioner_slug,
         p.business_name, p.member_id
       FROM sessions s
       LEFT JOIN stellium_clients c ON s.client_id = c.id
       LEFT JOIN services svc ON s.service_id = svc.id
       LEFT JOIN practitioners p ON s.practitioner_id = p.id
       WHERE s.management_token = $1`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired management link' },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];

    // 2. Find the most recent booking_request for this session
    const brResult = await db.query(
      `SELECT id, status, error_message, error_meta, session_id
       FROM booking_requests
       WHERE session_id = $1 AND practitioner_id = $2
       ORDER BY created_at DESC
       LIMIT 1`,
      [session.session_id, session.practitioner_id]
    );

    if (brResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No booking request found for this session' },
        { status: 404 }
      );
    }

    const bookingRequest = brResult.rows[0];

    // 3. Get practitioner timezone
    const tzResult = await db.query(
      `SELECT timezone FROM practitioner_settings WHERE practitioner_id = $1`,
      [session.practitioner_id]
    );
    const timezone = tzResult.rows[0]?.timezone || 'America/Chicago';

    // 4. Run notifications + calendar retry in parallel
    const [notifResult, calResult] = await Promise.all([
      retryNotifications({
        requestId: bookingRequest.id,
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
      }),
      session.member_id
        ? retryCalendar({
            requestId: bookingRequest.id,
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
            memberId: session.member_id,
          })
        : Promise.resolve({
            success: true,
            idempotent: false,
            syncStatus: 'skipped' as const,
            message: 'No member linked for calendar',
          }),
    ]);

    const overallSuccess = notifResult.success && calResult.success;
    const overallIdempotent = notifResult.idempotent && calResult.idempotent;

    console.log(
      `[Portal Retry Completion] token=${token.slice(0, 8)}... ` +
      `notif=${notifResult.success ? 'ok' : 'fail'}${notifResult.idempotent ? '(idem)' : ''} ` +
      `cal=${calResult.success ? 'ok' : 'fail'}${calResult.idempotent ? '(idem)' : ''}`
    );

    return NextResponse.json({
      success: overallSuccess,
      idempotent: overallIdempotent,
      results: {
        notifications: notifResult,
        calendar: calResult,
      },
    });
  } catch (error) {
    console.error('[Portal Retry Completion]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
