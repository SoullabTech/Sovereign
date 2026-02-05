/**
 * Pipeline Opportunity Detail API
 * GET /api/practitioner/practices/[practiceId]/labtools/pipeline/[oppId] - Get opportunity
 * PATCH /api/practitioner/practices/[practiceId]/labtools/pipeline/[oppId] - Update opportunity
 * DELETE /api/practitioner/practices/[practiceId]/labtools/pipeline/[oppId] - Delete opportunity
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedMember, verifyPracticeOwnership } from '@/lib/practitioner/auth';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ practiceId: string; oppId: string }> }
) {
  try {
    const { practiceId, oppId } = await params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isOwner = await verifyPracticeOwnership(practiceId, member.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get opportunity with related data
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
        o.actual_close_date as "actualCloseDate",
        o.source,
        o.person_id as "personId",
        p.display_name as "personName",
        p.email as "personEmail",
        p.company as "personCompany",
        o.venture_id as "ventureId",
        v.name as "ventureName",
        o.lost_reason as "lostReason",
        o.notes,
        o.stage_changed_at as "stageChangedAt",
        o.created_at as "createdAt",
        o.updated_at as "updatedAt"
      FROM rl_opportunities o
      LEFT JOIN rl_people p ON p.id = o.person_id
      LEFT JOIN rl_ventures v ON v.id = o.venture_id
      WHERE o.id = $1 AND o.practice_id = $2`,
      [oppId, practiceId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Get related meetings
    const meetingsResult = await query(
      `SELECT
        m.id,
        m.title,
        m.meeting_type as "meetingType",
        m.status,
        m.scheduled_start_at as "scheduledStartAt"
      FROM rl_meetings m
      WHERE m.opportunity_id = $1
      ORDER BY m.scheduled_start_at DESC
      LIMIT 5`,
      [oppId]
    );

    // Get related tasks
    const tasksResult = await query(
      `SELECT
        t.id,
        t.title,
        t.status,
        t.due_date as "dueDate"
      FROM rl_tasks t
      WHERE t.opportunity_id = $1
      ORDER BY t.due_date ASC NULLS LAST
      LIMIT 5`,
      [oppId]
    );

    return NextResponse.json({
      opportunity: {
        ...result.rows[0],
        meetings: meetingsResult.rows,
        tasks: tasksResult.rows
      }
    });
  } catch (error) {
    console.error('Opportunity fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ practiceId: string; oppId: string }> }
) {
  try {
    const { practiceId, oppId } = await params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isOwner = await verifyPracticeOwnership(practiceId, member.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const allowedFields = [
      'title', 'description', 'opportunityType', 'stage',
      'estimatedValueCents', 'currency', 'probability',
      'expectedCloseDate', 'actualCloseDate', 'source',
      'personId', 'ventureId', 'lostReason', 'notes'
    ];

    const updates: string[] = [];
    const values: (string | number | null)[] = [];
    let paramCount = 0;

    // Map camelCase to snake_case
    const fieldMap: Record<string, string> = {
      opportunityType: 'opportunity_type',
      estimatedValueCents: 'estimated_value_cents',
      expectedCloseDate: 'expected_close_date',
      actualCloseDate: 'actual_close_date',
      personId: 'person_id',
      ventureId: 'venture_id',
      lostReason: 'lost_reason'
    };

    for (const field of allowedFields) {
      if (field in body) {
        paramCount++;
        const dbField = fieldMap[field] || field;
        updates.push(`${dbField} = $${paramCount}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(oppId, practiceId);

    await query(
      `UPDATE rl_opportunities
       SET ${updates.join(', ')}
       WHERE id = $${paramCount + 1} AND practice_id = $${paramCount + 2}`,
      values
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Opportunity update error:', error);
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ practiceId: string; oppId: string }> }
) {
  try {
    const { practiceId, oppId } = await params;
    const member = await getAuthenticatedMember(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isOwner = await verifyPracticeOwnership(practiceId, member.id);
    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await query(
      `DELETE FROM rl_opportunities WHERE id = $1 AND practice_id = $2`,
      [oppId, practiceId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Opportunity delete error:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}
