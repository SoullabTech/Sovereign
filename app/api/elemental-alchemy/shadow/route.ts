export const dynamic = 'force-dynamic';
/**
 * SHADOW INTEGRATION API ROUTE
 *
 * POST /api/elemental-alchemy/shadow
 * Record a shadow instance
 *
 * GET /api/elemental-alchemy/shadow?userId=xxx&windowDays=30
 * Get shadow metrics and trends
 *
 * Response: { metrics, trends, recentInstances }
 */

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = false;
import {
  recordShadowInstance,
  createShadowPattern,
  getShadowTransformationMetrics,
  getUserShadowPatterns,
  getPatternInstances,
  getShadowPatternHistory,
} from '@/lib/features/ShadowIntegrationTracker';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

// Skip during static export (Capacitor builds)

/**
 * POST - Record a shadow instance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId: suppliedUserId,
      shadowPatternId,
      facet,
      shadowPattern,
      trigger,
      context,
      intensity,
      noticeMethod,
      awareness,
      goldMedicineApplied,
      responseTaken,
      insights,
      notes,
    } = body;

    // ACTOR from the verified session. body.userId is a redundant echo of the
    // caller and never establishes identity. Decided before any member-data write.
    const userId = await getMemberIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (suppliedUserId && suppliedUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!facet || !shadowPattern || !intensity || !noticeMethod || !awareness) {
      return NextResponse.json(
        {
          error: 'Required fields: userId, facet, shadowPattern, intensity, noticeMethod, awareness',
        },
        { status: 400 }
      );
    }

    // Validate intensity
    if (intensity < 1 || intensity > 5) {
      return NextResponse.json(
        { error: 'Intensity must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Record instance in service (in-memory for now)
    // Will be replaced with direct DB write when we wire up the service to Postgres
    const instance = await recordShadowInstance(userId, {
      shadowPatternId: shadowPatternId || 'temp',
      trigger,
      context,
      intensity,
      noticeMethod,
      awareness,
      goldMedicineApplied,
      responseTaken,
      insights,
    });

    // Save to database
    const wasIntegrated = !!(goldMedicineApplied || responseTaken);

    const result = await query(
      `
      INSERT INTO ea_shadow_instances (
        user_id,
        shadow_pattern_id,
        facet,
        shadow_pattern,
        trigger,
        context,
        intensity,
        notice_method,
        awareness,
        gold_medicine_applied,
        response_taken,
        insights,
        was_integrated,
        notes,
        occurred_at,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING *
      `,
      [
        userId,
        shadowPatternId || null,
        facet,
        shadowPattern,
        trigger || null,
        context || null,
        intensity,
        noticeMethod,
        awareness,
        goldMedicineApplied || null,
        responseTaken || null,
        insights || null,
        wasIntegrated,
        notes || null,
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        id: result.rows[0].id,
        facet: result.rows[0].facet,
        intensity: result.rows[0].intensity,
        wasIntegrated: result.rows[0].was_integrated,
        occurredAt: result.rows[0].occurred_at,
      },
      message: wasIntegrated
        ? 'Shadow instance recorded with gold medicine applied! 🌟'
        : 'Shadow instance recorded. Awareness is the first step.',
    });

  } catch (error) {
    console.error('❌ [SHADOW API POST] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to record shadow instance',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Fetch shadow metrics and recent instances
 */
export async function GET(request: NextRequest) {
  // Static export: return stub response during pre-rendering
  if (process.env.CAPACITOR_BUILD) {
    return NextResponse.json({ stub: true });
  }
  try {
    const { searchParams } = new URL(request.url);
    const suppliedUserId = searchParams.get('userId');
    const windowDays = parseInt(searchParams.get('windowDays') || '30');
    const patternId = searchParams.get('patternId');

    // ACTOR from the verified session; `?userId=` is a redundant echo only.
    const userId = await getMemberIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (suppliedUserId && suppliedUserId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'You may only act on your own data.' },
        { status: 403 }
      );
    }

    // If specific pattern requested, get history
    if (patternId) {
      const history = await getShadowPatternHistory(patternId);

      return NextResponse.json({
        success: true,
        data: {
          pattern: history.pattern,
          instances: history.instances,
          timeline: history.timeline,
          progressSummary: history.progressSummary,
        },
      });
    }

    // Get metrics from service
    const metrics = await getShadowTransformationMetrics(userId);

    // Get recent instances from database
    const recentInstances = await query(
      `
      SELECT
        id,
        facet,
        shadow_pattern,
        trigger,
        intensity,
        notice_method,
        awareness,
        gold_medicine_applied,
        was_integrated,
        occurred_at
      FROM ea_shadow_instances
      WHERE user_id = $1
        AND occurred_at >= NOW() - INTERVAL '${windowDays} days'
      ORDER BY occurred_at DESC
      LIMIT 20
      `,
      [userId]
    );

    // Calculate simple trends from database
    const trendData = await query(
      `
      SELECT
        DATE(occurred_at) as date,
        COUNT(*) as instance_count,
        AVG(intensity::numeric) as avg_intensity,
        SUM(CASE WHEN was_integrated THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric as integration_rate
      FROM ea_shadow_instances
      WHERE user_id = $1
        AND occurred_at >= NOW() - INTERVAL '${windowDays} days'
      GROUP BY DATE(occurred_at)
      ORDER BY date DESC
      `,
      [userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        // Metrics
        metrics: {
          totalInstancesRecorded: metrics.totalInstancesRecorded,
          totalPatternsTracked: metrics.totalPatternsTracked,
          integrationRate: Math.round(metrics.averageIntegrationRate * 100),

          byStatus: {
            active: metrics.activePatterns,
            integrating: metrics.integratingPatterns,
            integrated: metrics.integratedPatterns,
            dormant: metrics.dormantPatterns,
          },

          byElement: metrics.shadowsByElement,

          last30Days: {
            instancesRecorded: metrics.last30Days.instancesRecorded,
            integrationRate: Math.round(metrics.last30Days.integrationRate * 100),
            mostActivePattern: metrics.last30Days.mostActivePattern,
          },

          last90Days: {
            instancesRecorded: metrics.last90Days.instancesRecorded,
            integrationRate: Math.round(metrics.last90Days.integrationRate * 100),
            patternsIntegrated: metrics.last90Days.patternsIntegrated,
          },
        },

        // Recent instances
        recentInstances: recentInstances.rows.map(row => ({
          id: row.id,
          facet: row.facet,
          pattern: row.shadow_pattern,
          trigger: row.trigger,
          intensity: row.intensity,
          noticeMethod: row.notice_method,
          awareness: row.awareness,
          goldMedicineApplied: row.gold_medicine_applied,
          wasIntegrated: row.was_integrated,
          occurredAt: row.occurred_at,
        })),

        // Trends
        trends: trendData.rows.map(row => ({
          date: row.date,
          instanceCount: parseInt(row.instance_count),
          avgIntensity: parseFloat(row.avg_intensity).toFixed(1),
          integrationRate: Math.round(parseFloat(row.integration_rate) * 100),
        })),

        windowDays,
      },
    });

  } catch (error) {
    console.error('❌ [SHADOW API GET] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch shadow metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update shadow pattern status
 */
export async function PATCH(request: NextRequest) {
  try {
    // ACTOR first — an unauthenticated caller learns nothing beyond 401.
    const actorId = await getMemberIdFromRequest(request);
    if (!actorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ⛔ FAIL CLOSED — no mutation is possible here, by design, for now.
    //
    // This handler previously updated ea_shadow_patterns keyed on a caller-supplied
    // patternId alone, with no owner reference of any kind: possession of an id was
    // the whole authorization. It cannot be repaired by substituting the actor,
    // because the target table carries NO owner column in any environment.
    //
    // The domain model is not ambiguous — ShadowPattern.userId exists and
    // ShadowIntegrationTracker already enforces `pattern.userId !== userId` when
    // recording an instance. A shadow pattern belongs to exactly one member. What
    // is missing is persistence of that already-defined contract, not the contract.
    //
    // Ownership may NOT be inferred from: body.userId · ?userId= · possession of
    // patternId · the in-process shadowPatternsCache (process-local Maps, explicitly
    // unimplemented persistence) · a join through ea_shadow_instances (a pattern with
    // zero instances would then have no provable owner).
    //
    // Enablement requires ea_shadow_patterns.user_id UUID NOT NULL REFERENCES
    // members(id), after which this becomes:
    //   UPDATE ea_shadow_patterns SET ... WHERE id = $1 AND user_id = $actorId
    //   RETURNING id   -- 404 on zero rows, never revealing another member's pattern
    //
    // Founder ruling 2026-08-16: authenticate, then fail closed. Mutation DISALLOWED.
    return NextResponse.json(
      {
        error: 'Not implemented',
        message:
          'Updating a shadow pattern is unavailable pending persistent ownership. ' +
          'No change was made.',
      },
      { status: 501 }
    );

    // eslint-disable-next-line no-unreachable
    const body = await request.json();
    const { patternId, status, integrationNotes } = body;

    if (!patternId || !status) {
      return NextResponse.json(
        { error: 'patternId and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'integrating', 'integrated', 'dormant'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Update in database
    await query(
      `
      UPDATE ea_shadow_patterns
      SET
        status = $2,
        integration_notes = $3,
        updated_at = NOW()
      WHERE id = $1
      `,
      [patternId, status, integrationNotes || null]
    );

    return NextResponse.json({
      success: true,
      message: `Pattern status updated to ${status}`,
    });

  } catch (error) {
    console.error('❌ [SHADOW API PATCH] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to update pattern',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
