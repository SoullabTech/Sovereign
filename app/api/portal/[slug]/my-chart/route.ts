/**
 * MY CHART API
 *
 * Protected endpoint that returns the client's birth chart data.
 * Requires valid client portal session.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireClientSession } from '@/lib/auth/clientSession';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Require valid client session for this portal
    const sessionResult = await requireClientSession(slug);
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }

    const { clientId, practitionerId } = sessionResult;

    // Get client data with birth info
    const clientResult = await query(
      `SELECT
        c.id,
        c.name,
        c.preferred_name,
        c.birth_date,
        c.birth_time,
        c.birth_location,
        c.birth_latitude,
        c.birth_longitude,
        c.birth_timezone,
        c.birth_time_accuracy,
        c.has_chart,
        c.chart_image_url,
        c.key_placements,
        c.portal_claimed_at
       FROM practitioner_clients c
       WHERE c.id = $1 AND c.practitioner_id = $2`,
      [clientId, practitionerId]
    );

    if (clientResult.rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = clientResult.rows[0];

    // Get most recent session notes (if practitioner allows sharing)
    const sessionsResult = await query(
      `SELECT
        session_type,
        scheduled_at,
        themes,
        follow_up_notes
       FROM practitioner_sessions
       WHERE client_id = $1 AND status = 'completed'
       ORDER BY scheduled_at DESC
       LIMIT 5`,
      [clientId]
    );

    // Get shared resources for this client
    const resourcesResult = await query(
      `SELECT id, name, description, resource_type, url
       FROM practitioner_resources
       WHERE practitioner_id = $1
         AND (visibility = 'all_clients' OR $2 = ANY(shared_with))`,
      [practitionerId, clientId]
    );

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.preferred_name || client.name,
        portalClaimedAt: client.portal_claimed_at,
        birthData: client.birth_date ? {
          date: client.birth_date,
          time: client.birth_time,
          location: client.birth_location,
          timezone: client.birth_timezone,
          // Note: lat/lng and accuracy omitted for privacy
        } : null,
        hasChart: client.has_chart,
        chartImageUrl: client.chart_image_url,
        keyPlacements: client.key_placements,
      },
      sessions: sessionsResult.rows.map((s) => ({
        type: s.session_type,
        date: s.scheduled_at,
        themes: s.themes,
        followUp: s.follow_up_notes,
      })),
      resources: resourcesResult.rows,
    });
  } catch (error) {
    console.error('[My Chart] Error:', error);
    return NextResponse.json({ error: 'Failed to load chart' }, { status: 500 });
  }
}
