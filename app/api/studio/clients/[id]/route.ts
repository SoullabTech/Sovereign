export const dynamic = 'force-dynamic';

/**
 * STUDIO CLIENT DETAIL API
 *
 * GET /api/studio/clients/[id] - Fetch single client with sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) {
      return NextResponse.json({ error: 'Unauthorized or not a practitioner' }, { status: 401 });
    }

    const { practitionerId } = identity;
    const { id: clientId } = await params;

    // Fetch client
    const clientResult = await db.query(
      `SELECT
        c.id,
        c.practitioner_id,
        c.email,
        c.name,
        c.phone,
        c.status,
        c.tier,
        c.tags,
        c.key_placements,
        c.total_revenue,
        c.birth_date,
        c.birth_time,
        c.birth_location,
        c.internal_notes,
        c.chart_image_url,
        c.created_at,
        c.updated_at,
        c.last_session_at
      FROM practitioner_clients c
      WHERE c.id = $1 AND c.practitioner_id = $2`,
      [clientId, practitionerId]
    );

    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const row = clientResult.rows[0];

    // Fetch client's sessions (most recent first)
    const sessionsResult = await db.query(
      `SELECT
        id,
        session_type,
        modality,
        scheduled_at,
        duration_minutes,
        status,
        location_type,
        location_details,
        session_notes,
        follow_up_notes,
        themes,
        insights,
        fee,
        paid,
        created_at,
        completed_at
      FROM practitioner_sessions
      WHERE client_id = $1
      ORDER BY scheduled_at DESC
      LIMIT 50`,
      [clientId]
    );

    const sessions = sessionsResult.rows.map(s => ({
      id: s.id,
      sessionType: s.session_type,
      modality: s.modality,
      scheduledAt: s.scheduled_at,
      durationMinutes: s.duration_minutes,
      status: s.status,
      locationType: s.location_type,
      locationDetails: s.location_details,
      sessionNotes: s.session_notes,
      followUpNotes: s.follow_up_notes,
      themes: s.themes || [],
      insights: s.insights || [],
      fee: s.fee ? parseFloat(s.fee) : null,
      paid: s.paid,
      createdAt: s.created_at,
      completedAt: s.completed_at,
    }));

    // Find next scheduled session
    const nextSession = sessions.find(
      s => s.status === 'scheduled' || s.status === 'confirmed'
    );

    const client = {
      id: row.id,
      practitionerId: row.practitioner_id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      status: row.status,
      tier: row.tier,
      tags: row.tags || [],
      keyPlacements: row.key_placements,
      totalRevenue: parseFloat(row.total_revenue) || 0,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthLocation: row.birth_location,
      internalNotes: row.internal_notes,
      chartImageUrl: row.chart_image_url,
      lastSessionAt: row.last_session_at,
      nextSessionAt: nextSession?.scheduledAt || null,
      totalSessions: sessions.filter(s => s.status === 'completed').length,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return NextResponse.json({ client, sessions });
  } catch (error) {
    console.error('[Studio Client Detail] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}
