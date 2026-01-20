export const dynamic = 'force-static';

/**
 * Contribution Review API
 *
 * POST - Perform review action (approve, request_revision, flag, archive)
 * Requires Curator level (Level 2)
 *
 * See /docs/COMMONS_CONTRIBUTION_SYSTEM.md for context.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

type ReviewAction = 'approve' | 'request_revision' | 'flag' | 'archive';

async function safeQuery(sql: string, params: unknown[] = []): Promise<{ rows: Record<string, unknown>[]; error?: string }> {
  try {
    const result = await query(sql, params);
    return { rows: result.rows };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('does not exist') || message.includes('column')) {
      console.warn(`[CONTRIBUTIONS] Query skipped (missing table/column): ${message}`);
      return { rows: [], error: message };
    }
    throw error;
  }
}

async function getCuratorLevel(memberId: string): Promise<number> {
  const result = await safeQuery(
    `SELECT level FROM contribution_levels WHERE member_id = $1`,
    [memberId]
  );

  if (result.error || result.rows.length === 0) {
    return 0; // Default to Level 0
  }

  return result.rows[0].level as number;
}

async function incrementAcceptedCount(memberId: string): Promise<void> {
  await safeQuery(
    `INSERT INTO contribution_levels (member_id, accepted_count)
     VALUES ($1, 1)
     ON CONFLICT (member_id)
     DO UPDATE SET accepted_count = contribution_levels.accepted_count + 1`,
    [memberId]
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      curatorId,
      action,
      notes,
      safetyNotes,
    } = body as {
      curatorId: string;
      action: ReviewAction;
      notes?: string;
      safetyNotes?: string;
    };

    if (!curatorId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: curatorId, action' },
        { status: 400 }
      );
    }

    // Verify curator level
    const curatorLevel = await getCuratorLevel(curatorId);
    if (curatorLevel < 2) {
      return NextResponse.json(
        { error: 'Curator level required to review contributions' },
        { status: 403 }
      );
    }

    // Get existing contribution
    const existing = await safeQuery(
      `SELECT id, status, created_by, title FROM commons_contributions WHERE id = $1`,
      [id]
    );

    if (existing.error || existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Contribution not found' },
        { status: 404 }
      );
    }

    const contribution = existing.rows[0];

    // Validate action for current status
    const validActions: Record<string, ReviewAction[]> = {
      submitted: ['approve', 'request_revision', 'flag', 'archive'],
      flagged: ['approve', 'request_revision', 'archive'],
      published: ['archive'],
    };

    const currentStatus = contribution.status as string;
    if (!validActions[currentStatus]?.includes(action)) {
      return NextResponse.json(
        { error: `Cannot ${action} a ${currentStatus} contribution` },
        { status: 400 }
      );
    }

    // Require notes for certain actions
    if (['request_revision', 'flag', 'archive'].includes(action) && !notes) {
      return NextResponse.json(
        { error: `Notes are required when ${action.replace('_', ' ')}ing a contribution` },
        { status: 400 }
      );
    }

    // Build update based on action
    let newStatus: string;
    let updateFields: string[] = [
      'reviewed_by = $2',
      'reviewed_at = NOW()',
    ];
    const updateParams: unknown[] = [id, curatorId];
    let paramIndex = 3;

    switch (action) {
      case 'approve':
        newStatus = 'published';
        updateFields.push('published_at = NOW()');
        if (safetyNotes) {
          updateFields.push(`safety_notes = $${paramIndex++}`);
          updateParams.push(safetyNotes);
        }
        break;

      case 'request_revision':
        newStatus = 'needs_revision';
        updateFields.push(`review_notes = $${paramIndex++}`);
        updateParams.push(notes);
        break;

      case 'flag':
        newStatus = 'flagged';
        updateFields.push(`review_notes = $${paramIndex++}`);
        updateParams.push(notes);
        break;

      case 'archive':
        newStatus = 'archived';
        updateFields.push(`review_notes = $${paramIndex++}`);
        updateParams.push(notes);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    updateFields.push(`status = $${paramIndex++}`);
    updateParams.push(newStatus);

    const result = await safeQuery(
      `UPDATE commons_contributions
       SET ${updateFields.join(', ')}
       WHERE id = $1
       RETURNING id, status, title, reviewed_at, published_at`,
      updateParams
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Update failed' },
        { status: 500 }
      );
    }

    const updated = result.rows[0];

    // If approved, increment the author's accepted count
    if (action === 'approve') {
      await incrementAcceptedCount(contribution.created_by as string);
      console.log(`[CONTRIBUTIONS] Approved and published: ${updated.id} (${updated.title})`);
    } else {
      console.log(`[CONTRIBUTIONS] ${action}: ${updated.id} (${updated.title})`);
    }

    return NextResponse.json({
      success: true,
      contribution: {
        id: updated.id,
        status: updated.status,
        title: updated.title,
        reviewedAt: updated.reviewed_at,
        publishedAt: updated.published_at,
      },
      action,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[CONTRIBUTIONS] Review error: ${message}`);
    return NextResponse.json(
      { error: 'Failed to process review action' },
      { status: 500 }
    );
  }
}
