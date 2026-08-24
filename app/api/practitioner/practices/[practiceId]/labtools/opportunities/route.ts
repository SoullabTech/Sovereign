export const dynamic = 'force-dynamic';

/**
 * Opportunities API
 * GET  - List opportunities for practice
 * POST - Create a new opportunity
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { unauthenticatedResponse } from '@/lib/auth/authFailure';

// AUTH-01-D3: the route-local `getMemberFromRequest` that stood here is REMOVED.
// It read a bare `x-member-id` and treated `SELECT id FROM members WHERE id = $1`
// returning a row as proof of identity — the impersonation pattern
// lib/auth/getMemberFromRequest.ts:19-22 documents as fixed. Member UUIDs are exposed
// to clients, so "the row exists" was never evidence that the caller is that member.
//
// Its NAME also collided with the hardened module, which is how these routes escaped
// the first census. Identity now comes from the canonical resolver directly, under its
// own name, so a name-based search can never again hide a route from a census.
//
// ⭐ Authentication only. `verifyPracticeOwnership()` and every other practitioner
// authorization check below are UNCHANGED: authentication answers who the member is,
// ownership answers what that authenticated member may do.

async function verifyPracticeOwnership(practiceId: string, memberId: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM rl_practices WHERE id = $1 AND owner_user_id = $2',
    [practiceId, memberId]
  );
  return result.rows.length > 0;
}

type RouteContext = { params: Promise<{ practiceId: string }> };

const VALID_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'nurturing'];
const ACTIVE_STAGES = ['lead', 'qualified', 'proposal', 'negotiation'];

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const ventureId = searchParams.get('ventureId');
    const personId = searchParams.get('personId');
    const active = searchParams.get('active');
    const filter = searchParams.get('filter');

    let sql = `
      SELECT
        o.id, o.title, o.description, o.stage, o.estimated_value_cents, o.currency,
        o.expected_close_date, o.actual_close_date,
        o.venture_id, o.person_id,
        o.created_at, o.updated_at,
        v.name as venture_name,
        p.display_name as person_name, p.company as person_company
      FROM rl_opportunities o
      LEFT JOIN rl_ventures v ON v.id = o.venture_id
      LEFT JOIN rl_people p ON p.id = o.person_id
      WHERE o.practice_id = $1
    `;
    const values: unknown[] = [practiceId];
    let paramIndex = 2;

    if (stage && VALID_STAGES.includes(stage)) {
      sql += ` AND o.stage = $${paramIndex++}::opportunity_stage`;
      values.push(stage);
    }
    if (ventureId) {
      sql += ` AND o.venture_id = $${paramIndex++}`;
      values.push(ventureId);
    }
    if (personId) {
      sql += ` AND o.person_id = $${paramIndex++}`;
      values.push(personId);
    }
    if (active === 'true') {
      sql += ` AND o.stage = ANY($${paramIndex++}::opportunity_stage[])`;
      values.push(ACTIVE_STAGES);
    }
    if (filter === 'stalled') {
      // Stalled = active opportunities with no update in 14 days
      sql += ` AND o.stage = ANY($${paramIndex++}::opportunity_stage[])`;
      values.push(ACTIVE_STAGES);
      sql += ` AND o.updated_at < NOW() - INTERVAL '14 days'`;
    }

    sql += ` ORDER BY
      CASE o.stage
        WHEN 'negotiation' THEN 1
        WHEN 'proposal' THEN 2
        WHEN 'qualified' THEN 3
        WHEN 'lead' THEN 4
        WHEN 'won' THEN 5
        WHEN 'lost' THEN 6
        WHEN 'nurturing' THEN 7
      END,
      o.expected_close_date ASC NULLS LAST,
      o.created_at DESC`;

    const result = await query(sql, values);

    return NextResponse.json({
      opportunities: result.rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        stage: r.stage,
        valueCents: r.estimated_value_cents,
        currency: r.currency,
        expectedCloseAt: r.expected_close_date,
        closedAt: r.actual_close_date,
        ventureId: r.venture_id,
        ventureName: r.venture_name,
        personId: r.person_id,
        personName: r.person_name,
        personCompany: r.person_company,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }))
    });
  } catch (error) {
    console.error('[OPPORTUNITIES] List error:', error);
    return NextResponse.json({ error: 'Failed to list opportunities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      stage,
      valueCents,
      expectedCloseAt,
      ventureId,
      personId
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const oppStage = stage || 'lead';
    if (!VALID_STAGES.includes(oppStage)) {
      return NextResponse.json({
        error: `Stage must be one of: ${VALID_STAGES.join(', ')}`
      }, { status: 400 });
    }

    const value = typeof valueCents === 'number' ? valueCents : 0;
    if (value < 0) {
      return NextResponse.json({ error: 'Value cannot be negative' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_opportunities (
        practice_id, title, description, stage, estimated_value_cents, expected_close_date,
        venture_id, person_id
      )
       VALUES ($1, $2, $3, $4::opportunity_stage, $5, $6, $7, $8)
       RETURNING id, title, description, stage, estimated_value_cents, currency,
                 expected_close_date, venture_id, person_id, created_at`,
      [
        practiceId,
        title.trim(),
        description?.trim() || null,
        oppStage,
        value,
        expectedCloseAt || null,
        ventureId || null,
        personId || null
      ]
    );

    const opp = result.rows[0];
    return NextResponse.json({
      success: true,
      opportunity: {
        id: opp.id,
        title: opp.title,
        description: opp.description,
        stage: opp.stage,
        valueCents: opp.estimated_value_cents,
        currency: opp.currency,
        expectedCloseAt: opp.expected_close_date,
        ventureId: opp.venture_id,
        personId: opp.person_id,
        createdAt: opp.created_at
      }
    }, { status: 201 });
  } catch (error) {
    console.error('[OPPORTUNITIES] Create error:', error);
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
  }
}
