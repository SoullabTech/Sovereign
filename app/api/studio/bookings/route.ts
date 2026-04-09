export const dynamic = 'force-dynamic';
export async function generateStaticParams() { return []; }

/**
 * STUDIO BOOKINGS API
 *
 * Lists and manages bookings for the practitioner
 * Reads from sessions table (DB is canon)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getPractitionerIdForMember } from '@/lib/studio/getPractitionerIdForMember';

// Valid session statuses (allowlist prevents silent empty results)
const VALID_STATUSES = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;
type SessionStatus = typeof VALID_STATUSES[number];

function isValidStatus(s: string): s is SessionStatus {
  return VALID_STATUSES.includes(s as SessionStatus);
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerIdForMember(memberId);
    if (!practitionerId) {
      return NextResponse.json({ error: 'Practitioner not found for member' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get('status') || 'all';
    const from = searchParams.get('from'); // ISO timestamp (UTC)
    const to = searchParams.get('to');     // ISO timestamp (UTC)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Status filter: only allow known values, else treat as 'all'
    const status = rawStatus === 'all' || isValidStatus(rawStatus) ? rawStatus : 'all';

    let sql = `
      SELECT
        s.id,
        s.scheduled_start,
        s.scheduled_end,
        s.status,
        s.notes,
        s.practitioner_notes,
        s.price_cents,
        s.payment_status,
        s.google_event_id,
        s.calendar_sync_status,
        s.calendar_sync_error,
        s.calendar_disclosure,
        s.created_at,
        s.updated_at,
        sv.name as service_name,
        sv.duration_minutes,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM sessions s
      LEFT JOIN services sv ON s.service_id = sv.id
      LEFT JOIN practitioner_clients c ON s.client_id = c.id
      WHERE s.practitioner_id = $1
    `;
    const params: (string | number)[] = [practitionerId];

    if (status && status !== 'all') {
      sql += ` AND s.status = $${params.length + 1}`;
      params.push(status);
    }

    if (from) {
      sql += ` AND s.scheduled_start >= $${params.length + 1}`;
      params.push(from);
    } else {
      // Default to upcoming only
      sql += ` AND s.scheduled_start >= NOW()`;
    }

    if (to) {
      sql += ` AND s.scheduled_start <= $${params.length + 1}`;
      params.push(to);
    }

    sql += ` ORDER BY s.scheduled_start ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(sql, params);

    // Transform to frontend-friendly format
    const bookings = result.rows.map(row => ({
      id: row.id,
      startAt: row.scheduled_start,
      endAt: row.scheduled_end,
      status: row.status,
      notes: row.notes,
      practitionerNotes: row.practitioner_notes,
      priceCents: row.price_cents,
      paymentStatus: row.payment_status,
      serviceName: row.service_name,
      durationMinutes: row.duration_minutes,
      clientName: row.client_name,
      clientEmail: row.client_email,
      clientPhone: row.client_phone,
      googleEventId: row.google_event_id,
      calendarSyncStatus: row.calendar_sync_status,
      calendarSyncError: row.calendar_sync_error,
      calendarDisclosure: row.calendar_disclosure ?? 'generic',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('[Studio Bookings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, practitionerNotes, scribeSessionId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const updates: string[] = [];
    const params: (string | null)[] = [id];

    if (status) {
      // Validate status against allowlist
      if (!isValidStatus(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updates.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (practitionerNotes !== undefined) {
      updates.push(`practitioner_notes = $${params.length + 1}`);
      params.push(practitionerNotes);
    }

    if (scribeSessionId) {
      updates.push(`scribe_session_id = $${params.length + 1}`);
      params.push(scribeSessionId);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    updates.push(`updated_at = NOW()`);

    await db.query(
      `UPDATE sessions SET ${updates.join(', ')} WHERE id = $1`,
      params
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Studio Bookings] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
