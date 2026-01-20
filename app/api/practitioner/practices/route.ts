export const dynamic = 'force-dynamic';

/**
 * Practices API
 * GET  - List all practices for authenticated user
 * POST - Create a new practice
 *
 * Security: Uses httpOnly session cookie auth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { requireMemberId } from '@/lib/auth/session';

export async function GET() {
  try {
    const memberId = await requireMemberId();

    const result = await query(
      `SELECT
        id, name, modes, timezone, capacity_policy,
        created_at, updated_at
       FROM rl_practices
       WHERE owner_user_id = $1
       ORDER BY created_at DESC`,
      [memberId]
    );

    return NextResponse.json({
      practices: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        modes: row.modes,
        timezone: row.timezone,
        capacityPolicy: row.capacity_policy,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[PRACTICES] List error:', error);
    return NextResponse.json({ error: 'Failed to list practices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await requireMemberId();

    const body = await request.json();
    const { name, modes = [], timezone = 'UTC', capacityPolicy = {} } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_practices (owner_user_id, name, modes, timezone, capacity_policy)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, modes, timezone, capacity_policy, created_at, updated_at`,
      [memberId, name.trim(), modes, timezone, JSON.stringify(capacityPolicy)]
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
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('[PRACTICES] Create error:', error);
    return NextResponse.json({ error: 'Failed to create practice' }, { status: 500 });
  }
}
