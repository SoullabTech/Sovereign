export const dynamic = 'force-dynamic';

/**
 * Protocol Assignment Snapshot
 *
 * GET — Returns a computed outcome summary for a protocol assignment.
 *       Aggregates occupancy ratings and experiment outcomes since the protocol
 *       was started, giving the practitioner a directional read on whether
 *       the pathway is changing the relational structure.
 *
 * This is not a stored record — it is computed on request from existing data.
 * The source tables are: studio_occupancy_ratings, studio_change_experiments.
 *
 * Snapshot fields:
 *   - daysActive:          days since started_at
 *   - stageReached:        current active_stage_number
 *   - targetOccupancy:     the threshold the practitioner is working toward
 *   - scope:               change | decision | client
 *   - startingOccupancy:   first rating after started_at (null if none)
 *   - currentOccupancy:    most recent rating (null if none)
 *   - lowestOccupancy:     minimum score in window (null if none)
 *   - highestOccupancy:    maximum score in window (null if none)
 *   - ratingCount:         total ratings in window
 *   - occupancyTrend:      improving | worsening | stable | unknown
 *   - onTarget:            currentOccupancy <= targetOccupancy (null if no current)
 *   - experimentsTotal:    total experiments since started_at (change-scope only)
 *   - experimentsActive:   currently active experiments
 *   - experimentsCompleted: completed experiments
 *   - experimentsAbandoned: abandoned experiments
 *   - mostRecentExperiment: title + status of the latest experiment (null if none)
 */

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/postgres';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';

function computeTrend(
  ordered: number[]  // scores from oldest to newest
): 'improving' | 'worsening' | 'stable' | 'unknown' {
  if (ordered.length < 2) return 'unknown';
  const delta = ordered[ordered.length - 1] - ordered[ordered.length - 2];
  if (delta < 0) return 'improving';  // lower score = less occupation = better
  if (delta > 0) return 'worsening';
  return 'stable';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const identity = await getCurrentPractitioner(request);
  if (!identity) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { practitionerId } = identity;
  const { id } = await params;

  try {
    // ─── Load assignment ──────────────────────────────────────────────
    const assignmentResult = await db.query(
      `SELECT * FROM studio_protocol_assignments WHERE id = $1 AND practitioner_id = $2`,
      [id, practitionerId]
    );

    if (assignmentResult.rows.length === 0) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const a = assignmentResult.rows[0];
    const startedAt: string = a.started_at;

    // Determine scope
    const scope: 'change' | 'decision' | 'client' =
      a.change_id   ? 'change'   :
      a.decision_id ? 'decision' :
                      'client';

    // ─── Occupancy ratings in window ─────────────────────────────────
    let ratingsResult;

    if (a.change_id) {
      ratingsResult = await db.query(
        `SELECT score, rated_at FROM studio_occupancy_ratings
         WHERE change_id = $1 AND rated_at >= $2
         ORDER BY rated_at ASC`,
        [a.change_id, startedAt]
      );
    } else if (a.decision_id) {
      ratingsResult = await db.query(
        `SELECT score, rated_at FROM studio_occupancy_ratings
         WHERE decision_id = $1 AND rated_at >= $2
         ORDER BY rated_at ASC`,
        [a.decision_id, startedAt]
      );
    } else {
      ratingsResult = await db.query(
        `SELECT score, rated_at FROM studio_occupancy_ratings
         WHERE client_id = $1 AND rated_at >= $2
         ORDER BY rated_at ASC`,
        [a.client_id, startedAt]
      );
    }

    const scores: number[] = ratingsResult.rows.map((r) => Number(r.score));
    const ratingCount = scores.length;

    const startingOccupancy = ratingCount > 0 ? scores[0]                 : null;
    const currentOccupancy  = ratingCount > 0 ? scores[scores.length - 1] : null;
    const lowestOccupancy   = ratingCount > 0 ? Math.min(...scores)        : null;
    const highestOccupancy  = ratingCount > 0 ? Math.max(...scores)        : null;
    const occupancyTrend    = computeTrend(scores);

    const onTarget =
      currentOccupancy != null && a.target_occupancy != null
        ? currentOccupancy <= Number(a.target_occupancy)
        : null;

    // ─── Experiments (change-scope only) ─────────────────────────────
    let experimentsTotal     = 0;
    let experimentsActive    = 0;
    let experimentsCompleted = 0;
    let experimentsAbandoned = 0;
    let mostRecentExperiment: { title: string; status: string } | null = null;

    if (a.change_id) {
      const expResult = await db.query(
        `SELECT title, status, created_at FROM studio_change_experiments
         WHERE change_id = $1 AND practitioner_id = $2
           AND created_at >= $3
         ORDER BY created_at DESC`,
        [a.change_id, practitionerId, startedAt]
      );

      experimentsTotal = expResult.rows.length;
      for (const row of expResult.rows) {
        if (row.status === 'active')    experimentsActive++;
        if (row.status === 'completed') experimentsCompleted++;
        if (row.status === 'abandoned') experimentsAbandoned++;
      }
      if (expResult.rows.length > 0) {
        mostRecentExperiment = {
          title:  expResult.rows[0].title,
          status: expResult.rows[0].status,
        };
      }
    }

    // ─── Days active ──────────────────────────────────────────────────
    const daysActive = Math.floor(
      (Date.now() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return NextResponse.json({
      snapshot: {
        assignmentId:         a.id,
        protocolId:           a.protocol_id,
        scope,
        status:               a.status,
        daysActive,
        stageReached:         a.active_stage_number,
        targetOccupancy:      a.target_occupancy != null ? Number(a.target_occupancy) : null,
        startingOccupancy,
        currentOccupancy,
        lowestOccupancy,
        highestOccupancy,
        ratingCount,
        occupancyTrend,
        onTarget,
        experimentsTotal,
        experimentsActive,
        experimentsCompleted,
        experimentsAbandoned,
        mostRecentExperiment,
      },
    });

  } catch (error) {
    console.error('[Protocol Snapshot] GET error:', error);
    return NextResponse.json({ error: 'Snapshot failed' }, { status: 500 });
  }
}
