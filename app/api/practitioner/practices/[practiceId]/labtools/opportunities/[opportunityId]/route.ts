export const dynamic = 'force-dynamic';

/**
 * Single Opportunity API
 * GET    - Get opportunity details
 * PATCH  - Update opportunity
 * DELETE - Delete opportunity
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

async function getMemberFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) return null;
  const result = await query('SELECT id FROM members WHERE id = $1', [memberId]);
  return result.rows.length > 0 ? { id: memberId } : null;
}

async function verifyPracticeOwnership(practiceId: string, memberId: string): Promise<boolean> {
  const result = await query(
    'SELECT id FROM rl_practices WHERE id = $1 AND owner_user_id = $2',
    [practiceId, memberId]
  );
  return result.rows.length > 0;
}

type RouteContext = { params: Promise<{ practiceId: string; opportunityId: string }> };

const VALID_STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
const CLOSED_STAGES = ['closed_won', 'closed_lost'];

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, opportunityId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(
      `SELECT
        o.id, o.title, o.description, o.stage, o.value_cents, o.currency,
        o.expected_close_at, o.closed_at,
        o.venture_id, o.person_id,
        o.created_at, o.updated_at,
        v.name as venture_name,
        p.display_name as person_name, p.company as person_company, p.email as person_email
      FROM rl_opportunities o
      LEFT JOIN rl_ventures v ON v.id = o.venture_id
      LEFT JOIN rl_people p ON p.id = o.person_id
      WHERE o.id = $1 AND o.practice_id = $2`,
      [opportunityId, practiceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const o = result.rows[0];

    // Get related tasks
    const tasksResult = await query(
      `SELECT id, title, due_at, status, created_at
       FROM rl_tasks
       WHERE opportunity_id = $1 AND status = 'open'
       ORDER BY due_at ASC NULLS LAST, created_at DESC`,
      [opportunityId]
    );

    // Get related meetings
    const meetingsResult = await query(
      `SELECT id, title, meeting_type, scheduled_start_at, status
       FROM rl_meetings
       WHERE opportunity_id = $1
       ORDER BY scheduled_start_at DESC
       LIMIT 10`,
      [opportunityId]
    );

    return NextResponse.json({
      opportunity: {
        id: o.id,
        title: o.title,
        description: o.description,
        stage: o.stage,
        valueCents: o.value_cents,
        currency: o.currency,
        expectedCloseAt: o.expected_close_at,
        closedAt: o.closed_at,
        ventureId: o.venture_id,
        ventureName: o.venture_name,
        personId: o.person_id,
        personName: o.person_name,
        personCompany: o.person_company,
        personEmail: o.person_email,
        createdAt: o.created_at,
        updatedAt: o.updated_at
      },
      tasks: tasksResult.rows.map(t => ({
        id: t.id,
        title: t.title,
        dueAt: t.due_at,
        status: t.status,
        createdAt: t.created_at
      })),
      meetings: meetingsResult.rows.map(m => ({
        id: m.id,
        title: m.title,
        meetingType: m.meeting_type,
        scheduledStartAt: m.scheduled_start_at,
        status: m.status
      }))
    });
  } catch (error) {
    console.error('[OPPORTUNITIES] Get error:', error);
    return NextResponse.json({ error: 'Failed to get opportunity' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, opportunityId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Verify opportunity exists
    const existing = await query(
      'SELECT id, stage FROM rl_opportunities WHERE id = $1 AND practice_id = $2',
      [opportunityId, practiceId]
    );
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.title !== undefined) {
      if (!body.title?.trim()) {
        return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
      }
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title.trim());
    }

    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(body.description?.trim() || null);
    }

    if (body.stage !== undefined) {
      if (!VALID_STAGES.includes(body.stage)) {
        return NextResponse.json({
          error: `Stage must be one of: ${VALID_STAGES.join(', ')}`
        }, { status: 400 });
      }
      updates.push(`stage = $${paramIndex++}::opportunity_stage`);
      values.push(body.stage);

      // Auto-set closed_at when closing
      if (CLOSED_STAGES.includes(body.stage) && !CLOSED_STAGES.includes(existing.rows[0].stage)) {
        updates.push(`closed_at = NOW()`);
      }
      // Clear closed_at if reopening
      if (!CLOSED_STAGES.includes(body.stage) && CLOSED_STAGES.includes(existing.rows[0].stage)) {
        updates.push(`closed_at = NULL`);
      }
    }

    if (body.valueCents !== undefined) {
      if (typeof body.valueCents !== 'number' || body.valueCents < 0) {
        return NextResponse.json({ error: 'Value must be a non-negative number' }, { status: 400 });
      }
      updates.push(`value_cents = $${paramIndex++}`);
      values.push(body.valueCents);
    }

    if (body.expectedCloseAt !== undefined) {
      updates.push(`expected_close_at = $${paramIndex++}`);
      values.push(body.expectedCloseAt || null);
    }

    if (body.ventureId !== undefined) {
      updates.push(`venture_id = $${paramIndex++}`);
      values.push(body.ventureId || null);
    }

    if (body.personId !== undefined) {
      updates.push(`person_id = $${paramIndex++}`);
      values.push(body.personId || null);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(opportunityId);
    const result = await query(
      `UPDATE rl_opportunities SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, title, description, stage, value_cents, currency,
                 expected_close_at, closed_at, venture_id, person_id,
                 created_at, updated_at`,
      values
    );

    const o = result.rows[0];
    return NextResponse.json({
      success: true,
      opportunity: {
        id: o.id,
        title: o.title,
        description: o.description,
        stage: o.stage,
        valueCents: o.value_cents,
        currency: o.currency,
        expectedCloseAt: o.expected_close_at,
        closedAt: o.closed_at,
        ventureId: o.venture_id,
        personId: o.person_id,
        createdAt: o.created_at,
        updatedAt: o.updated_at
      }
    });
  } catch (error) {
    console.error('[OPPORTUNITIES] Update error:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId, opportunityId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const result = await query(
      'DELETE FROM rl_opportunities WHERE id = $1 AND practice_id = $2 RETURNING id',
      [opportunityId, practiceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[OPPORTUNITIES] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}
