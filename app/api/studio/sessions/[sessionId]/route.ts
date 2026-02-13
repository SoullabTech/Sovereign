export const dynamic = 'force-dynamic';

/**
 * SINGLE SESSION API
 *
 * GET: Fetch session details by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

async function getPractitionerId(): Promise<string | null> {
  const result = await db.query(
    'SELECT id FROM practitioners WHERE slug = $1',
    ['stellium']
  );
  return result.rows[0]?.id || null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const memberId = await getMemberIdFromRequest(req);
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const practitionerId = await getPractitionerId();
    if (!practitionerId) {
      return NextResponse.json({ success: false, error: 'Practitioner not found' }, { status: 404 });
    }

    const result = await db.query(
      `SELECT
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
        s.google_event_id,
        s.calendar_sync_status,
        s.scribe_session_id,
        s.created_at,
        s.updated_at,
        s.completed_at,
        c.name as client_name,
        c.email as client_email,
        svc.name as service_name
      FROM sessions s
      LEFT JOIN practitioner_clients c ON s.client_id = c.id
      LEFT JOIN services svc ON s.service_id = svc.id
      WHERE s.id = $1 AND s.practitioner_id = $2`,
      [sessionId, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const session = {
      id: row.id,
      practitioner_id: row.practitioner_id,
      client_id: row.client_id,
      service_id: row.service_id,
      scheduled_start: row.scheduled_start,
      scheduled_end: row.scheduled_end,
      status: row.status,
      location_type: row.location_type,
      location_details: row.location_details,
      notes: row.notes,
      practitioner_notes: row.practitioner_notes,
      price_cents: row.price_cents,
      payment_status: row.payment_status,
      google_event_id: row.google_event_id,
      calendar_sync_status: row.calendar_sync_status,
      scribe_session_id: row.scribe_session_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at,
      client_name: row.client_name,
      client_email: row.client_email,
      service_name: row.service_name,
    };

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('[Studio Session] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
