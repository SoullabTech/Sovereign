export const dynamic = 'force-dynamic';

/**
 * Single Practice API
 * GET    - Get practice details
 * PATCH  - Update practice
 * DELETE - Delete practice (soft delete)
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

type RouteContext = { params: Promise<{ practiceId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT id, name, modes, timezone, capacity_policy, created_at, updated_at
       FROM rl_practices
       WHERE id = $1 AND owner_user_id = $2`,
      [practiceId, member.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const practice = result.rows[0];
    return NextResponse.json({
      practice: {
        id: practice.id,
        name: practice.name,
        modes: practice.modes,
        timezone: practice.timezone,
        capacityPolicy: practice.capacity_policy,
        createdAt: practice.created_at,
        updatedAt: practice.updated_at
      }
    });
  } catch (error) {
    console.error('[PRACTICE] Get error:', error);
    return NextResponse.json({ error: 'Failed to get practice' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name.trim());
    }
    if (body.modes !== undefined) {
      updates.push(`modes = $${paramIndex++}`);
      values.push(body.modes);
    }
    if (body.timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`);
      values.push(body.timezone);
    }
    if (body.capacityPolicy !== undefined) {
      updates.push(`capacity_policy = $${paramIndex++}`);
      values.push(JSON.stringify(body.capacityPolicy));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(practiceId);
    const result = await query(
      `UPDATE rl_practices SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, name, modes, timezone, capacity_policy, created_at, updated_at`,
      values
    );

    const practice = result.rows[0];
    return NextResponse.json({
      success: true,
      practice: {
        id: practice.id,
        name: practice.name,
        modes: practice.modes,
        timezone: practice.timezone,
        capacityPolicy: practice.capacity_policy,
        createdAt: practice.created_at,
        updatedAt: practice.updated_at
      }
    });
  } catch (error) {
    console.error('[PRACTICE] Update error:', error);
    return NextResponse.json({ error: 'Failed to update practice' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyPracticeOwnership(practiceId, member.id)) {
      return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
    }

    // Cascading delete will remove all related data
    await query('DELETE FROM rl_practices WHERE id = $1', [practiceId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PRACTICE] Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete practice' }, { status: 500 });
  }
}
