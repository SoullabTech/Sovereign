export const dynamic = 'force-dynamic';

/**
 * Single Container API
 * GET   - Get container details
 * PATCH - Update container
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

async function verifyContainerAccess(containerId: string, memberId: string): Promise<boolean> {
  const result = await query(
    `SELECT c.id FROM rl_containers c
     JOIN rl_practices p ON p.id = c.practice_id
     WHERE c.id = $1 AND p.owner_user_id = $2`,
    [containerId, memberId]
  );
  return result.rows.length > 0;
}

type RouteContext = { params: Promise<{ containerId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { containerId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyContainerAccess(containerId, memberId)) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    // Get container with participants
    const containerResult = await query(
      `SELECT c.*, p.name as practice_name
       FROM rl_containers c
       JOIN rl_practices p ON p.id = c.practice_id
       WHERE c.id = $1`,
      [containerId]
    );

    const container = containerResult.rows[0];

    // Get participants
    const participantsResult = await query(
      `SELECT cp.id, cp.person_id, cp.role, cp.created_at, pe.display_name, pe.email
       FROM rl_participants cp
       JOIN rl_people pe ON pe.id = cp.person_id
       WHERE cp.container_id = $1`,
      [containerId]
    );

    // Get recent sessions (last 10)
    const sessionsResult = await query(
      `SELECT id, session_type, scheduled_start_at, scheduled_end_at, status, location
       FROM rl_sessions
       WHERE container_id = $1
       ORDER BY scheduled_start_at DESC
       LIMIT 10`,
      [containerId]
    );

    // Get agreements
    const agreementsResult = await query(
      `SELECT id, kind, status, version, accepted_at, created_at
       FROM rl_agreements
       WHERE container_id = $1
       ORDER BY created_at DESC`,
      [containerId]
    );

    return NextResponse.json({
      container: {
        id: container.id,
        practiceId: container.practice_id,
        practiceName: container.practice_name,
        type: container.type,
        status: container.status,
        scope: container.scope,
        startAt: container.start_at,
        endAt: container.end_at,
        visibility: container.visibility,
        riskFlags: container.risk_flags,
        createdAt: container.created_at,
        updatedAt: container.updated_at
      },
      participants: participantsResult.rows.map(r => ({
        id: r.id,
        personId: r.person_id,
        displayName: r.display_name,
        email: r.email,
        role: r.role,
        createdAt: r.created_at
      })),
      recentSessions: sessionsResult.rows.map(r => ({
        id: r.id,
        sessionType: r.session_type,
        scheduledStartAt: r.scheduled_start_at,
        scheduledEndAt: r.scheduled_end_at,
        status: r.status,
        location: r.location
      })),
      agreements: agreementsResult.rows.map(r => ({
        id: r.id,
        kind: r.kind,
        status: r.status,
        version: r.version,
        acceptedAt: r.accepted_at,
        createdAt: r.created_at
      }))
    });
  } catch (error) {
    console.error('[CONTAINER] Get error:', error);
    return NextResponse.json({ error: 'Failed to get container' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { containerId } = await context.params;
    const memberId = await getMemberIdFromRequest(request);
    if (!memberId) {
      return unauthenticatedResponse();
    }

    if (!await verifyContainerAccess(containerId, memberId)) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.scope !== undefined) {
      updates.push(`scope = $${paramIndex++}`);
      values.push(body.scope);
    }
    if (body.visibility !== undefined) {
      updates.push(`visibility = $${paramIndex++}::container_visibility`);
      values.push(body.visibility);
    }
    if (body.riskFlags !== undefined) {
      updates.push(`risk_flags = $${paramIndex++}`);
      values.push(body.riskFlags);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(containerId);
    const result = await query(
      `UPDATE rl_containers SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, type, status, scope, visibility, risk_flags, updated_at`,
      values
    );

    return NextResponse.json({ success: true, container: result.rows[0] });
  } catch (error) {
    console.error('[CONTAINER] Update error:', error);
    return NextResponse.json({ error: 'Failed to update container' }, { status: 500 });
  }
}
