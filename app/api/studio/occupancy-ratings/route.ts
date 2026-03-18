export const dynamic = 'force-dynamic';

/**
 * Session Occupancy Ratings API
 *
 * GET  — list ratings for a client or decision/change (longitudinal view)
 * POST — record a session occupancy rating (1–5)
 *
 * 1 = reciprocal    — genuine back-and-forth, pauses tolerated
 * 2 = mild          — some over-talking, redirectable
 * 3 = occupied      — frequent occupation, pauses difficult
 * 4 = sustained     — extended monologue, minimal reciprocal contact
 * 5 = total         — no usable intervention channel
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import type { OccupancyRating } from '@/lib/studio/practitioner/types';

function rowToRating(row: Record<string, unknown>): OccupancyRating {
  return {
    id: row.id as string,
    decisionId: row.decision_id as string | null,
    changeId: row.change_id as string | null,
    studioSessionId: row.studio_session_id as string | null,
    practitionerId: row.practitioner_id as string,
    clientId: row.client_id as string | null,
    score: row.score as OccupancyRating['score'],
    warmInterruptionTolerated: row.warm_interruption_tolerated as boolean | null,
    momentOfContact: row.moment_of_contact as string | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
  };
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const decisionId = searchParams.get('decisionId');
    const changeId = searchParams.get('changeId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);

    const conditions: string[] = ['practitioner_id = $1'];
    const values: unknown[] = [practitionerId];
    let idx = 2;

    if (clientId)   { conditions.push(`client_id = $${idx++}`);   values.push(clientId); }
    if (decisionId) { conditions.push(`decision_id = $${idx++}`); values.push(decisionId); }
    if (changeId)   { conditions.push(`change_id = $${idx++}`);   values.push(changeId); }

    values.push(limit);

    const result = await db.query(
      `SELECT * FROM session_occupancy_ratings
       WHERE ${conditions.join(' AND ')}
       ORDER BY rated_at DESC
       LIMIT $${idx}`,
      values
    );

    const ratings = result.rows.map(rowToRating);

    // Calculate trajectory from last 3 ratings
    let trajectory: 'improving' | 'stable' | 'worsening' | 'unknown' = 'unknown';
    if (ratings.length >= 2) {
      const recent = ratings.slice(0, 3).map((r) => r.score);
      const first = recent[recent.length - 1];
      const last = recent[0];
      if (last < first) trajectory = 'improving';
      else if (last > first) trajectory = 'worsening';
      else trajectory = 'stable';
    }

    return NextResponse.json({
      ratings,
      current: ratings[0] || null,
      trajectory,
    });
  } catch (error) {
    console.error('[Occupancy Ratings] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const identity = await getCurrentPractitioner(request);
    if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { practitionerId } = identity;
    const body = await request.json();

    const {
      clientId = null,
      decisionId = null,
      changeId = null,
      studioSessionId = null,
      score,
      warmInterruptionTolerated = null,
      momentOfContact = null,
      notes = null,
    } = body;

    if (typeof score !== 'number' || score < 1 || score > 5) {
      return NextResponse.json({ error: 'score must be 1–5' }, { status: 400 });
    }

    const result = await db.query(
      `INSERT INTO session_occupancy_ratings
        (practitioner_id, client_id, studio_session_id, decision_id, change_id,
         score, warm_interruption_tolerated, moment_of_contact, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [practitionerId, clientId, studioSessionId, decisionId, changeId,
       score, warmInterruptionTolerated, momentOfContact, notes]
    );

    return NextResponse.json({ rating: rowToRating(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error('[Occupancy Ratings] POST error:', error);
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 });
  }
}
