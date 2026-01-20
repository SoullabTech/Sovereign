export const dynamic = 'force-dynamic';

/**
 * Practices API
 * GET  - List all practices for authenticated user
 * POST - Create a new practice
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

// Helper to get member from session (simplified - extend as needed)
async function getMemberFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  // Check for member ID in headers (set by middleware or client)
  const memberId = request.headers.get('x-member-id');
  if (!memberId) return null;

  // Verify member exists
  const result = await query('SELECT id FROM members WHERE id = $1', [memberId]);
  if (result.rows.length === 0) return null;

  return { id: memberId };
}

export async function GET(request: NextRequest) {
  try {
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT
        id, name, modes, timezone, capacity_policy,
        created_at, updated_at
       FROM rl_practices
       WHERE owner_user_id = $1
       ORDER BY created_at DESC`,
      [member.id]
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
    console.error('[PRACTICES] List error:', error);
    return NextResponse.json({ error: 'Failed to list practices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, modes = [], timezone = 'UTC', capacityPolicy = {} } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO rl_practices (owner_user_id, name, modes, timezone, capacity_policy)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, modes, timezone, capacity_policy, created_at, updated_at`,
      [member.id, name.trim(), modes, timezone, JSON.stringify(capacityPolicy)]
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
    console.error('[PRACTICES] Create error:', error);
    return NextResponse.json({ error: 'Failed to create practice' }, { status: 500 });
  }
}
