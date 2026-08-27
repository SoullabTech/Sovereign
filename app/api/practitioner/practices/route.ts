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
  // AUTH-BOUNDARY-02 — THE FALLBACK IS GONE, and the name is kept only so no
  // call site changes in this repair.
  //
  // The removed branch read `x-member-id`, checked the UUID shape, confirmed the
  // member EXISTED, and returned it as the caller. Its comment said "for
  // beta/local development", but nothing scoped it to development: it ran in
  // production, on every request, and it is the same existence-check
  // impersonation that `lib/auth/getMemberFromRequest.ts:19-27` documents as
  // fixed. A UUID regex constrains the SHAPE of the claim, never its truth.
  //
  // Session auth was already tried first, so a member with a real session is
  // unaffected — the only caller this refuses is one who had no session and was
  // relying on naming a member id.
  return getMemberIdIfAuthenticated();
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
