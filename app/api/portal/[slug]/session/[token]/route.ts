export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * PORTAL SESSION MANAGEMENT API
 *
 * Token-based session operations (cancel, reschedule).
 * No auth required — manage_token from email link is the credential.
 *
 * GET  — Retrieve session details (for cancel/reschedule pages)
 * POST — Cancel or reschedule the session
 */

import { NextRequest, NextResponse } from 'next/server';
import db, { transaction } from '@/lib/db/postgres';
import crypto from 'crypto';
import { calculateAvailability } from '@/lib/availability/calculateAvailability';

// ── GET: session details for cancel/reschedule pages ──
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  try {
    const { slug, token } = await params;

    const result = await db.query(
      `SELECT
        s.id, s.scheduled_start, s.scheduled_end, s.status, s.notes,
        s.service_snapshot, s.cancelled_at, s.rescheduled_to_id,
        sv.name as service_name, sv.duration_minutes,
        p.name as practitioner_name, p.slug as practitioner_slug,
        ps.cancellation_policy, ps.timezone as practitioner_timezone,
        sc.name as client_name, sc.email as client_email
       FROM sessions s
       JOIN practitioners p ON p.id = s.practitioner_id
       LEFT JOIN services sv ON sv.id = s.service_id
       LEFT JOIN practitioner_settings ps ON ps.practitioner_id = s.practitioner_id
       LEFT JOIN stellium_clients sc ON sc.id = s.client_id
       WHERE s.manage_token = $1 AND p.slug = $2`,
      [token, slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = result.rows[0];

    // Check if cancellation window is still open (default 24h)
    const now = new Date();
    const sessionStart = new Date(session.scheduled_start);
    const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    const minNoticeHours = 24; // Could be made configurable per practitioner

    return NextResponse.json({
      session: {
        id: session.id,
        scheduledStart: session.scheduled_start,
        scheduledEnd: session.scheduled_end,
        status: session.status,
        serviceName: session.service_name || session.service_snapshot?.name,
        durationMinutes: session.duration_minutes || session.service_snapshot?.duration_minutes,
        practitionerName: session.practitioner_name,
        practitionerTimezone: session.practitioner_timezone || 'America/New_York',
        clientName: session.client_name,
        clientEmail: session.client_email,
        cancellationPolicy: session.cancellation_policy,
        cancelledAt: session.cancelled_at,
        rescheduledToId: session.rescheduled_to_id,
      },
      canCancel: session.status === 'scheduled' && hoursUntilSession >= minNoticeHours,
      canReschedule: session.status === 'scheduled' && hoursUntilSession >= minNoticeHours,
      hoursUntilSession: Math.round(hoursUntilSession * 10) / 10,
      minNoticeHours,
    });
  } catch (error) {
    console.error('[Portal Session] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── POST: cancel or reschedule ──
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; token: string }> }
) {
  try {
    const { slug, token } = await params;
    const body = await request.json();
    const { action, reason, newDate, newTime } = body;

    if (!action || !['cancel', 'reschedule'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Look up session by token
    const sessionResult = await db.query(
      `SELECT
        s.id, s.practitioner_id, s.client_id, s.service_id,
        s.scheduled_start, s.scheduled_end, s.status, s.notes,
        s.service_snapshot, s.price_cents,
        p.name as practitioner_name, p.slug as practitioner_slug, p.member_id,
        p.email as practitioner_email, p.business_name,
        sv.duration_minutes, sv.confirmation_instructions,
        ps.timezone as practitioner_timezone,
        sc.name as client_name, sc.email as client_email
       FROM sessions s
       JOIN practitioners p ON p.id = s.practitioner_id
       LEFT JOIN services sv ON sv.id = s.service_id
       LEFT JOIN practitioner_settings ps ON ps.practitioner_id = s.practitioner_id
       LEFT JOIN stellium_clients sc ON sc.id = s.client_id
       WHERE s.manage_token = $1 AND p.slug = $2`,
      [token, slug]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessionResult.rows[0];

    if (session.status !== 'scheduled') {
      return NextResponse.json(
        { error: `This session is already ${session.status}` },
        { status: 409 }
      );
    }

    // Check notice window
    const now = new Date();
    const sessionStart = new Date(session.scheduled_start);
    const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession < 24) {
      return NextResponse.json(
        { error: 'Cannot modify session within 24 hours of start time' },
        { status: 403 }
      );
    }

    // ── CANCEL ──
    if (action === 'cancel') {
      await db.query(
        `UPDATE sessions
         SET status = 'cancelled', cancelled_at = NOW(), cancelled_reason = $1, cancelled_by = 'client', updated_at = NOW()
         WHERE id = $2`,
        [reason || null, session.id]
      );

      // TODO: Send cancellation emails (fire-and-forget)
      // TODO: Delete Google Calendar event if google_event_id exists

      return NextResponse.json({
        success: true,
        action: 'cancelled',
        message: 'Your session has been cancelled.',
      });
    }

    // ── RESCHEDULE ──
    if (action === 'reschedule') {
      if (!newDate || !newTime) {
        return NextResponse.json(
          { error: 'New date and time are required for rescheduling' },
          { status: 400 }
        );
      }

      const durationMinutes = session.duration_minutes || session.service_snapshot?.duration_minutes || 60;
      const newStart = new Date(`${newDate}T${newTime}`);
      const newEnd = new Date(newStart.getTime() + durationMinutes * 60 * 1000);

      // Transaction: cancel old + create new
      const newSessionId = crypto.randomUUID();
      const newManageToken = crypto.randomUUID().replace(/-/g, '');

      await transaction(async (client) => {
        // Check conflict on new slot
        const conflictResult = await client.query(
          `SELECT id FROM sessions
           WHERE practitioner_id = $1
           AND status NOT IN ('cancelled', 'no_show')
           AND id != $2
           AND (
             (scheduled_start <= $3 AND scheduled_end > $3)
             OR (scheduled_start < $4 AND scheduled_end >= $4)
             OR (scheduled_start >= $3 AND scheduled_end <= $4)
           )
           FOR UPDATE`,
          [session.practitioner_id, session.id, newStart.toISOString(), newEnd.toISOString()]
        );

        if (conflictResult.rows.length > 0) {
          throw new Error('SLOT_TAKEN');
        }

        // Create new session first (FK requires it to exist before rescheduled_to_id reference)
        await client.query(
          `INSERT INTO sessions
           (id, practitioner_id, client_id, service_id, scheduled_start, scheduled_end,
            status, notes, price_cents, booking_source, service_snapshot, manage_token,
            rescheduled_from_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, 'portal', $9, $10, $11, NOW())`,
          [
            newSessionId,
            session.practitioner_id,
            session.client_id,
            session.service_id,
            newStart.toISOString(),
            newEnd.toISOString(),
            session.notes,
            session.price_cents,
            JSON.stringify(session.service_snapshot),
            newManageToken,
            session.id,
          ]
        );

        // Mark old session as rescheduled
        await client.query(
          `UPDATE sessions
           SET status = 'cancelled', cancelled_at = NOW(), cancelled_reason = 'Rescheduled by client',
               cancelled_by = 'client', rescheduled_to_id = $1, updated_at = NOW()
           WHERE id = $2`,
          [newSessionId, session.id]
        );
      });

      // TODO: Send reschedule emails + new ICS (fire-and-forget)
      // TODO: Update Google Calendar event

      return NextResponse.json({
        success: true,
        action: 'rescheduled',
        message: 'Your session has been rescheduled.',
        new_session_id: newSessionId,
        new_manage_token: newManageToken,
        details: {
          date: newDate,
          time: newTime,
          duration: durationMinutes,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'SLOT_TAKEN') {
      return NextResponse.json(
        { error: 'That time slot is no longer available. Please choose another.' },
        { status: 409 }
      );
    }

    console.error('[Portal Session] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
