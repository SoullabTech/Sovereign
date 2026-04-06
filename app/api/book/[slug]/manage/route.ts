export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PUBLIC BOOKING MANAGEMENT API
 *
 * GET  ?token=X — Get booking details (unauthenticated, via confirmation token)
 * POST ?token=X&action=cancel — Cancel a booking
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Confirmation token required' }, { status: 400 });
    }

    const result = await db.query(
      `SELECT
        bm.confirmation_token,
        bm.booker_timezone,
        bm.source,
        bm.created_at as booked_at,
        s.id as session_id,
        s.scheduled_start,
        s.scheduled_end,
        s.status,
        s.notes,
        sv.name as service_name,
        sv.duration_minutes,
        sv.price_cents,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        p.name as practitioner_name,
        p.slug as practitioner_slug
      FROM booking_metadata bm
      JOIN sessions s ON bm.session_id = s.id
      LEFT JOIN services sv ON s.service_id = sv.id
      LEFT JOIN practitioner_clients c ON s.client_id = c.id
      JOIN practitioners p ON s.practitioner_id = p.id
      WHERE bm.confirmation_token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const row = result.rows[0];
    return NextResponse.json({
      booking: {
        sessionId: row.session_id,
        status: row.status,
        serviceName: row.service_name,
        durationMinutes: row.duration_minutes,
        priceCents: row.price_cents,
        scheduledStart: row.scheduled_start,
        scheduledEnd: row.scheduled_end,
        clientName: row.client_name,
        clientEmail: row.client_email,
        clientPhone: row.client_phone,
        practitionerName: row.practitioner_name,
        practitionerSlug: row.practitioner_slug,
        bookerTimezone: row.booker_timezone,
        bookedAt: row.booked_at,
        notes: row.notes,
      },
    });
  } catch (error) {
    console.error('[Book/Manage] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token) {
      return NextResponse.json({ error: 'Confirmation token required' }, { status: 400 });
    }

    if (action !== 'cancel') {
      return NextResponse.json({ error: 'Unsupported action. Use action=cancel' }, { status: 400 });
    }

    // Find the booking
    const meta = await db.query(
      `SELECT bm.session_id, bm.calendar_event_id, s.status
       FROM booking_metadata bm
       JOIN sessions s ON bm.session_id = s.id
       WHERE bm.confirmation_token = $1`,
      [token]
    );

    if (meta.rows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { session_id, calendar_event_id, status } = meta.rows[0];

    if (status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }

    // Cancel the session
    await db.query(
      `UPDATE sessions SET status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [session_id]
    );

    // Soft-delete the calendar event
    if (calendar_event_id) {
      await db.query(
        `UPDATE calendar_events SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [calendar_event_id]
      );
    }

    return NextResponse.json({ success: true, message: 'Booking cancelled' });
  } catch (error) {
    console.error('[Book/Manage] POST error:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
