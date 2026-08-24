export const dynamic = 'force-dynamic';

/**
 * Single Practice API
 * GET    - Get practice details
 * PATCH  - Update practice
 * DELETE - Delete practice (soft delete)
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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { practiceId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    const result = await query(
      `SELECT id, name, modes, timezone, capacity_policy, created_at, updated_at
       FROM rl_practices
       WHERE id = $1 AND owner_user_id = $2`,
      [practiceId, memberId]
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
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
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
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyPracticeOwnership(practiceId, memberId)) {
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
