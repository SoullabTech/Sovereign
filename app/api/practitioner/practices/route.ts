export const dynamic = 'force-dynamic';

/**
 * Practices API
 * GET  - List all practices for authenticated user
 * POST - Create a new practice
 *
 * Security: Session cookie (primary) or x-member-id header (fallback for beta/local).
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdIfAuthenticated } from '@/lib/auth/session';


/**
 * Get member ID from session (preferred) or x-member-id header (fallback).
 * Returns null if neither is available/valid.
 */
async function getMemberIdWithFallback(): Promise<string | null> {
  // Try session auth first (cookie or x-session-token)
  const sessionMemberId = await getMemberIdIfAuthenticated();
  if (sessionMemberId) {
    return sessionMemberId;
  }

  // AUTH-01-D: the x-member-id fallback is REMOVED. It accepted any well-formed
  // member UUID after a mere existence check — precisely the impersonation pattern
  // lib/auth/getMemberFromRequest.ts:19-22 documents as previously fixed. Member
  // UUIDs are exposed to clients, so "the row exists" was never evidence that the
  // caller is that member. Native/iOS clients authenticate with x-session-token,
  // which getMemberIdIfAuthenticated already validates.
  return null;
}

export async function GET() {
  try {
    const memberId = await getMemberIdWithFallback();
    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    console.error('[PRACTICES] List error:', error);
    return NextResponse.json({ error: 'Failed to list practices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdWithFallback();
    if (!memberId) {
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
    console.error('[PRACTICES] Create error:', error);
    return NextResponse.json({ error: 'Failed to create practice' }, { status: 500 });
  }
}
