export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PUBLIC BOOKING CONFIRMATION API
 *
 * POST — Create a booking (session + calendar_event + booking_metadata)
 * No auth required — this is a public endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import crypto from 'crypto';
import { resolveSessionTeamId } from '@/lib/team/sessionTeamScope';
import { bridgeBookingToCalendar } from '@/lib/portal/bookingTools';

interface BookingBody {
  serviceId: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  name: string;
  email: string;
  phone?: string;
  timezone?: string;
  notes?: string;
  intakeResponses?: Record<string, unknown>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: BookingBody = await request.json();

    // Validate required fields
    const { serviceId, date, time, name, email, phone, timezone, notes, intakeResponses } = body;
    if (!serviceId || !date || !time || !name || !email) {
      return NextResponse.json(
        { error: 'serviceId, date, time, name, and email are required' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json(
        { error: 'Invalid date (YYYY-MM-DD) or time (HH:MM) format' },
        { status: 400 }
      );
    }

    // Get practitioner
    const practResult = await db.query(
      `SELECT id, member_id, name as pract_name FROM practitioners WHERE slug = $1 AND status = 'active'`,
      [slug]
    );
    if (practResult.rows.length === 0) {
      return NextResponse.json({ error: 'Practitioner not found' }, { status: 404 });
    }
    const practitioner = practResult.rows[0];
    const practitionerId = practitioner.id;

    // Get service
    const svcResult = await db.query(
      `SELECT id, name, duration_minutes, price_cents
       FROM services WHERE id = $1 AND practitioner_id = $2 AND is_active = true`,
      [serviceId, practitionerId]
    );
    if (svcResult.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const service = svcResult.rows[0];

    // Calculate times
    const scheduledStart = new Date(`${date}T${time}`);
    const scheduledEnd = new Date(scheduledStart.getTime() + service.duration_minutes * 60 * 1000);

    // Conflict check
    const conflict = await db.query(
      `SELECT id FROM sessions
       WHERE practitioner_id = $1
       AND status NOT IN ('cancelled', 'no_show')
       AND (
         (scheduled_start <= $2 AND scheduled_end > $2)
         OR (scheduled_start < $3 AND scheduled_end >= $3)
         OR (scheduled_start >= $2 AND scheduled_end <= $3)
       )`,
      [practitionerId, scheduledStart.toISOString(), scheduledEnd.toISOString()]
    );
    if (conflict.rows.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another time.' },
        { status: 409 }
      );
    }

    // Get or create client
    let clientId: string;
    const existingClient = await db.query(
      `SELECT id FROM stellium_clients WHERE practitioner_id = $1 AND email = $2`,
      [practitionerId, email]
    );
    if (existingClient.rows.length > 0) {
      clientId = existingClient.rows[0].id;
      await db.query(
        `UPDATE stellium_clients SET name = $1, phone = COALESCE($2, phone), updated_at = NOW() WHERE id = $3`,
        [name, phone, clientId]
      );
    } else {
      clientId = crypto.randomUUID();
      await db.query(
        `INSERT INTO stellium_clients (id, practitioner_id, name, email, phone, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 'active', NOW())`,
        [clientId, practitionerId, name, email, phone || null]
      );
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const teamId = await resolveSessionTeamId(practitionerId);
    await db.query(
      `INSERT INTO sessions
       (id, practitioner_id, client_id, service_id, scheduled_start, scheduled_end, status, notes, price_cents, created_at, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, NOW(), $9)`,
      [
        sessionId,
        practitionerId,
        clientId,
        serviceId,
        scheduledStart.toISOString(),
        scheduledEnd.toISOString(),
        notes || null,
        service.price_cents,
        teamId,
      ]
    );

    // Bridge to calendar_events + booking_metadata
    let confirmationToken: string | null = null;
    try {
      await bridgeBookingToCalendar({
        sessionId,
        practitionerId,
        serviceName: service.name,
        clientName: name,
        scheduledStart,
        scheduledEnd,
        source: 'portal',
        bookerTimezone: timezone,
        intakeResponses,
      });

      // Retrieve the confirmation token
      const metaResult = await db.query(
        `SELECT confirmation_token FROM booking_metadata WHERE session_id = $1`,
        [sessionId]
      );
      confirmationToken = metaResult.rows[0]?.confirmation_token || null;
    } catch (err) {
      console.error('[Book/Confirm] Calendar bridge failed:', err);
    }

    return NextResponse.json({
      success: true,
      booking: {
        sessionId,
        confirmationToken,
        serviceName: service.name,
        practitionerName: practitioner.pract_name,
        date,
        time,
        durationMinutes: service.duration_minutes,
        clientName: name,
        clientEmail: email,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[Book/Confirm] Error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
