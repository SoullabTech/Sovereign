/**
 * Pipeline (Opportunities) API
 * GET /api/practitioner/practices/[practiceId]/labtools/pipeline - List opportunities
 * POST /api/practitioner/practices/[practiceId]/labtools/pipeline - Create opportunity
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMember, verifyPracticeOwnership } from '@/lib/practitioner/auth';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const { practiceId } = await params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isOwner = await verifyPracticeOwnership(practiceId, member.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const type = searchParams.get('type');

    let whereClause = 'WHERE o.practice_id = $1';
    const queryParams: (string | null)[] = [practiceId];

    if (stage && stage !== 'all') {
      queryParams.push(stage);
      whereClause += ` AND o.stage = $${queryParams.length}`;
    }

    if (type && type !== 'all') {
      queryParams.push(type);
      whereClause += ` AND o.opportunity_type = $${queryParams.length}`;
    }

    const result = await query(
      `SELECT
        o.id,
        o.title,
        o.description,
        o.opportunity_type as "opportunityType",
        o.stage,
        o.estimated_value_cents as "estimatedValueCents",
        o.currency,
        o.probability,
        o.expected_close_date as "expectedCloseDate",
        o.source,
        o.person_id as "personId",
        p.display_name as "personName",
        o.venture_id as "ventureId",
        v.name as "ventureName",
        o.notes,
        o.stage_changed_at as "stageChangedAt",
        o.created_at as "createdAt"
      FROM rl_opportunities o
      LEFT JOIN rl_people p ON p.id = o.person_id
      LEFT JOIN rl_ventures v ON v.id = o.venture_id
      ${whereClause}
      ORDER BY
        CASE o.stage
          WHEN 'negotiation' THEN 1
          WHEN 'proposal' THEN 2
          WHEN 'qualified' THEN 3
          WHEN 'lead' THEN 4
          WHEN 'nurturing' THEN 5
          WHEN 'won' THEN 6
          WHEN 'lost' THEN 7
        END,
        o.expected_close_date ASC NULLS LAST`,
      queryParams
    );

    // Calculate pipeline value
    const pipelineStats = await query(
      `SELECT
        COUNT(*) FILTER (WHERE stage NOT IN ('won', 'lost')) as "activeCount",
        SUM(estimated_value_cents) FILTER (WHERE stage NOT IN ('won', 'lost')) as "totalValue",
        SUM(estimated_value_cents * probability / 100) FILTER (WHERE stage NOT IN ('won', 'lost')) as "weightedValue"
      FROM rl_opportunities
      WHERE practice_id = $1`,
      [practiceId]
    );

    return NextResponse.json({
      opportunities: result.rows,
      stats: pipelineStats.rows[0]
    });
  } catch (error) {
    console.error('Pipeline fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ practiceId: string }> }
) {
  try {
    const { practiceId } = await params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isOwner = await verifyPracticeOwnership(practiceId, member.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      opportunityType = 'sale',
      stage = 'lead',
      estimatedValueCents,
      currency = 'USD',
      probability = 50,
      expectedCloseDate,
      source,
      personId,
      ventureId,
      notes
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_opportunities (
        practice_id, title, description, opportunity_type, stage,
        estimated_value_cents, currency, probability, expected_close_date,
        source, person_id, venture_id, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id`,
      [
        practiceId,
        title,
        description || null,
        opportunityType,
        stage,
        estimatedValueCents || null,
        currency,
        probability,
        expectedCloseDate || null,
        source || null,
        personId || null,
        ventureId || null,
        notes || null
      ]
    );

    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('Pipeline create error:', error);
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}
