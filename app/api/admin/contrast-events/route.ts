/**
 * Admin API: Contrast Events
 *
 * GET  — list events with filters (date, session, event_type, shown/accepted)
 * PATCH — update reviewer label and notes for a specific event
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const eventType = url.searchParams.get('event_type');
    const sessionId = url.searchParams.get('session_id');
    const days = parseInt(url.searchParams.get('days') || '7');
    const needsReview = url.searchParams.get('needs_review') === 'true';

    let whereClause = `WHERE created_at > NOW() - INTERVAL '${days} days'`;
    const params: unknown[] = [];

    if (eventType) {
      params.push(eventType);
      whereClause += ` AND event_type = $${params.length}`;
    }

    if (sessionId) {
      params.push(sessionId);
      whereClause += ` AND session_id = $${params.length}`;
    }

    if (needsReview) {
      whereClause += ` AND post_response_state_reviewed IS NULL AND event_type = 'engaged_after_contrast'`;
    }

    // Events list
    const events = await query(
      `SELECT * FROM contrast_events ${whereClause}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    // Summary stats
    const summary = await query(
      `SELECT
         event_type,
         count(*) as count
       FROM contrast_events
       WHERE created_at > NOW() - INTERVAL '${days} days'
       GROUP BY event_type
       ORDER BY count DESC`
    );

    // Review progress
    const reviewProgress = await query(
      `SELECT
         count(*) FILTER (WHERE post_response_state_reviewed IS NOT NULL) as reviewed,
         count(*) FILTER (WHERE post_response_state_reviewed IS NULL AND event_type = 'engaged_after_contrast') as needs_review,
         count(*) FILTER (WHERE post_response_state_predicted IS NOT NULL) as classified,
         count(*) FILTER (
           WHERE post_response_state_predicted IS NOT NULL
           AND post_response_state_reviewed IS NOT NULL
           AND post_response_state_predicted = post_response_state_reviewed
         ) as agreement
       FROM contrast_events
       WHERE created_at > NOW() - INTERVAL '${days} days'`
    );

    // Post-response state distribution (reviewed only)
    const stateDistribution = await query(
      `SELECT
         post_response_state_reviewed as state,
         count(*) as count
       FROM contrast_events
       WHERE post_response_state_reviewed IS NOT NULL
         AND created_at > NOW() - INTERVAL '${days} days'
       GROUP BY post_response_state_reviewed
       ORDER BY count DESC`
    );

    return NextResponse.json({
      events: events.rows,
      summary: summary.rows,
      reviewProgress: reviewProgress.rows[0] || { reviewed: 0, needs_review: 0, classified: 0, agreement: 0 },
      stateDistribution: stateDistribution.rows,
      meta: { limit, offset, days },
    });
  } catch (err) {
    console.error('[admin/contrast-events] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load contrast events' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, reviewedState, reviewNotes } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'eventId required' }, { status: 400 });
    }

    const validStates = ['shift', 'continue', 'resist', 'unclear'];
    if (reviewedState && !validStates.includes(reviewedState)) {
      return NextResponse.json({ error: `Invalid state: ${reviewedState}` }, { status: 400 });
    }

    await query(
      `UPDATE contrast_events
       SET post_response_state_reviewed = $1,
           review_notes = $2
       WHERE id = $3`,
      [reviewedState || null, reviewNotes || null, eventId]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/contrast-events] PATCH failed:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
