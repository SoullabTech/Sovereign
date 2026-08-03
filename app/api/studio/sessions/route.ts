export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO SESSIONS API
 *
 * CRUD operations for practitioner sessions (bookings)
 * Uses the `sessions` table from portal_services_tables migration
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';
import { resolveSessionTeamId } from '@/lib/team/sessionTeamScope';
import { sendBookingConfirmation } from '@/lib/notifications/SessionNotificationService';
import { syncNewSessionToGoogle, syncUpdatedSessionToGoogle, syncCancelledSessionToGoogle } from '@/lib/calendar/syncSessionToGoogle';

const VALID_STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;
const VALID_LOCATION_TYPES = ['video', 'phone', 'in_person', 'async'] as const;

type SessionStatus = typeof VALID_STATUSES[number];
type LocationType = typeof VALID_LOCATION_TYPES[number];

function isValidStatus(s: string): s is SessionStatus {
  return VALID_STATUSES.includes(s as SessionStatus);
}

function isValidLocationType(t: string): t is LocationType {
  return VALID_LOCATION_TYPES.includes(t as LocationType);
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found for member' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const upcoming = searchParams.get('upcoming') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    let sql = `
      SELECT
        s.id,
        s.practitioner_id,
        s.client_id,
        s.service_id,
        s.scheduled_start,
        s.scheduled_end,
        s.status,
        s.location_type,
        s.location_details,
        s.notes,
        s.practitioner_notes,
        s.price_cents,
        s.payment_status,
        s.created_at,
        s.updated_at,
        s.completed_at,
        c.name as client_name,
        c.email as client_email,
        svc.name as service_name
      FROM sessions s
      LEFT JOIN practitioner_clients c ON s.client_id = c.id
      LEFT JOIN services svc ON s.service_id = svc.id
      WHERE s.practitioner_id = $1
    `;
    const params: (string | number)[] = [practitionerId];

    // Status filter
    if (status && isValidStatus(status)) {
      sql += ` AND s.status = $${params.length + 1}`;
      params.push(status);
    }

    // Client filter
    if (clientId) {
      sql += ` AND s.client_id = $${params.length + 1}`;
      params.push(clientId);
    }

    // Upcoming only
    if (upcoming) {
      sql += ` AND s.scheduled_start >= NOW()`;
    }

    sql += ` ORDER BY s.scheduled_start ${upcoming ? 'ASC' : 'DESC'} LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    const sessions = result.rows.map(row => ({
      id: row.id,
      practitionerId: row.practitioner_id,
      clientId: row.client_id,
      serviceId: row.service_id,
      scheduledStart: row.scheduled_start,
      scheduledEnd: row.scheduled_end,
      status: row.status,
      locationType: row.location_type,
      locationDetails: row.location_details,
      notes: row.notes,
      practitionerNotes: row.practitioner_notes,
      priceCents: row.price_cents,
      paymentStatus: row.payment_status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
      // Joined fields
      clientName: row.client_name,
      clientEmail: row.client_email,
      serviceName: row.service_name,
      // Trust layer
      calendarDisclosure: row.calendar_disclosure ?? 'generic',
    }));

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('[Studio Sessions] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found for member' }, { status: 404 });
    }

    const body = await request.json();
    const {
      client_id,
      service_id,
      session_type,
      scheduled_at,
      duration_minutes = 60,
      location_type = 'video',
      meeting_link,
      prep_notes,
      status = 'scheduled',
      calendar_disclosure,
    } = body;

    // Validate required fields
    if (!client_id) {
      return NextResponse.json({ success: false, error: 'Client is required' }, { status: 400 });
    }

    if (!scheduled_at) {
      return NextResponse.json({ success: false, error: 'Scheduled time is required' }, { status: 400 });
    }

    if (location_type && !isValidLocationType(location_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid location type. Must be one of: ${VALID_LOCATION_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate scheduled_end from scheduled_at + duration_minutes
    const scheduledStart = new Date(scheduled_at);
    const scheduledEnd = new Date(scheduledStart.getTime() + duration_minutes * 60 * 1000);

    // Build notes (combine session_type and prep_notes if provided)
    let notes = '';
    if (session_type) {
      notes += `Session Type: ${session_type}\n`;
    }
    if (prep_notes) {
      notes += prep_notes;
    }

    // Resolve calendar disclosure: per-session → practitioner default → 'generic'
    let effectiveDisclosure = calendar_disclosure;
    if (!effectiveDisclosure) {
      try {
        const settingsResult = await db.query(
          `SELECT value FROM studio_settings WHERE key = 'calendar_disclosure_default'`
        );
        effectiveDisclosure = settingsResult.rows[0]?.value || 'generic';
      } catch {
        effectiveDisclosure = 'generic';
      }
    }

    const teamId = await resolveSessionTeamId(practitionerId);
    const result = await db.query(
      `INSERT INTO sessions
        (practitioner_id, client_id, service_id, scheduled_start, scheduled_end, status, location_type, location_details, notes, calendar_disclosure, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::calendar_disclosure, $11)
       RETURNING *`,
      [
        practitionerId,
        client_id,
        service_id || null,
        scheduledStart.toISOString(),
        scheduledEnd.toISOString(),
        status,
        location_type,
        meeting_link || null,
        notes.trim() || null,
        effectiveDisclosure,
        teamId,
      ]
    );

    const session = result.rows[0];

    // Get client details (used for both notification and calendar sync)
    let clientName: string | undefined;
    let clientPhone: string | undefined;
    let clientEmail: string | undefined;
    try {
      const clientResult = await db.query(
        'SELECT name, email, phone FROM practitioner_clients WHERE id = $1',
        [client_id]
      );
      const client = clientResult.rows[0];
      clientName = client?.name;
      clientPhone = client?.phone;
      clientEmail = client?.email;
    } catch (err) {
      console.error('[Studio Sessions] Failed to fetch client details:', err);
    }

    // Send WhatsApp/SMS confirmation to client (async, non-blocking)
    try {
      // Get practitioner name
      const practitionerResult = await db.query(
        'SELECT name FROM practitioners WHERE id = $1',
        [practitionerId]
      );
      const practitioner = practitionerResult.rows[0];

      if (clientEmail || clientPhone) {
        sendBookingConfirmation({
          id: session.id,
          clientName: clientName || 'Client',
          clientPhone: clientPhone,
          clientEmail: clientEmail,
          serviceName: session_type || 'Session',
          scheduledStart: scheduledStart,
          scheduledEnd: scheduledEnd,
          locationType: location_type,
          locationDetails: meeting_link,
          practitionerName: practitioner?.name || 'Your practitioner',
        }, practitionerId).then(results => {
          const channels = [
            results.email    && `email=${results.email.success ? 'ok' : 'fail'}`,
            results.whatsapp && `whatsapp=${results.whatsapp.success ? 'ok' : 'fail'}`,
            results.sms      && `sms=${results.sms.success ? 'ok' : 'fail'}`,
          ].filter(Boolean).join(', ');
          console.log(`[Studio Sessions] Notifications: ${channels || 'none attempted'} | anySuccess=${results.anySuccess}`);
        }).catch(err => {
          console.error('[Studio Sessions] Notification error:', err);
        });
      }
    } catch (notifError) {
      // Don't fail the session creation if notification fails
      console.error('[Studio Sessions] Failed to send notification:', notifError);
    }

    // Sync to Google Calendar (async, non-blocking)
    if (memberId) {
      syncNewSessionToGoogle(memberId, {
        id: session.id,
        scheduledStart: scheduledStart,
        scheduledEnd: scheduledEnd,
        clientName: clientName,
        serviceName: session_type || undefined,
        locationType: location_type,
        locationDetails: meeting_link,
        disclosure: effectiveDisclosure,
      }).then(syncResult => {
        if (syncResult.googleEventId) {
          console.log(`[Studio Sessions] Synced to Google Calendar: ${syncResult.googleEventId}`);
        }
      }).catch(err => {
        console.error('[Studio Sessions] Calendar sync error:', err);
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        practitionerId: session.practitioner_id,
        clientId: session.client_id,
        serviceId: session.service_id,
        scheduledStart: session.scheduled_start,
        scheduledEnd: session.scheduled_end,
        status: session.status,
        locationType: session.location_type,
        locationDetails: session.location_details,
        notes: session.notes,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      },
    });
  } catch (error) {
    console.error('[Studio Sessions] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found for member' }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    // Build dynamic update
    const updateFields: string[] = [];
    const params: (string | null | number)[] = [id, practitionerId];

    if (updates.status !== undefined) {
      if (!isValidStatus(updates.status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`status = $${params.length + 1}`);
      params.push(updates.status);

      // Auto-set completed_at
      if (updates.status === 'completed') {
        updateFields.push(`completed_at = NOW()`);
      }
    }

    if (updates.scheduledStart !== undefined) {
      updateFields.push(`scheduled_start = $${params.length + 1}`);
      params.push(updates.scheduledStart);
    }

    if (updates.scheduledEnd !== undefined) {
      updateFields.push(`scheduled_end = $${params.length + 1}`);
      params.push(updates.scheduledEnd);
    }

    if (updates.locationType !== undefined) {
      if (!isValidLocationType(updates.locationType)) {
        return NextResponse.json(
          { success: false, error: `Invalid location type. Must be one of: ${VALID_LOCATION_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
      updateFields.push(`location_type = $${params.length + 1}`);
      params.push(updates.locationType);
    }

    if (updates.locationDetails !== undefined) {
      updateFields.push(`location_details = $${params.length + 1}`);
      params.push(updates.locationDetails || null);
    }

    if (updates.notes !== undefined) {
      updateFields.push(`notes = $${params.length + 1}`);
      params.push(updates.notes || null);
    }

    if (updates.practitionerNotes !== undefined) {
      updateFields.push(`practitioner_notes = $${params.length + 1}`);
      params.push(updates.practitionerNotes || null);
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 });
    }

    updateFields.push(`updated_at = NOW()`);

    const result = await db.query(
      `UPDATE sessions
       SET ${updateFields.join(', ')}
       WHERE id = $1 AND practitioner_id = $2
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const session = result.rows[0];

    // Sync to Google Calendar (async, non-blocking)
    if (memberId) {
      if (updates.status === 'cancelled') {
        // Session cancelled — delete from Google Calendar
        syncCancelledSessionToGoogle(memberId, session.id).catch(err => {
          console.error('[Studio Sessions] Calendar cancel sync error:', err);
        });
      } else if (updates.scheduledStart || updates.scheduledEnd) {
        // Time changed — update Google Calendar event
        syncUpdatedSessionToGoogle(memberId, {
          id: session.id,
          scheduledStart: session.scheduled_start,
          scheduledEnd: session.scheduled_end,
          locationType: session.location_type,
          locationDetails: session.location_details,
          notes: session.notes,
        }).catch(err => {
          console.error('[Studio Sessions] Calendar update sync error:', err);
        });
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        practitionerId: session.practitioner_id,
        clientId: session.client_id,
        serviceId: session.service_id,
        scheduledStart: session.scheduled_start,
        scheduledEnd: session.scheduled_end,
        status: session.status,
        locationType: session.location_type,
        locationDetails: session.location_details,
        notes: session.notes,
        practitionerNotes: session.practitioner_notes,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        completedAt: session.completed_at,
      },
    });
  } catch (error) {
    console.error('[Studio Sessions] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found for member' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    // Sync cancellation to Google Calendar before updating status
    if (memberId) {
      syncCancelledSessionToGoogle(memberId, id).catch(err => {
        console.error('[Studio Sessions] Calendar cancel sync error:', err);
      });
    }

    // Soft delete by setting status to cancelled
    const result = await db.query(
      `UPDATE sessions
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND practitioner_id = $2
       RETURNING id`,
      [id, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Sessions] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel session' },
      { status: 500 }
    );
  }
}
