export const dynamic = 'force-dynamic';

/**
 * Container Status Transition API
 * POST - Transition container to new status
 *
 * State machine enforced by database trigger:
 * - inquiry → active|declined|referred_out
 * - active → paused|closing
 * - paused → active|closing
 * - closing → completed|referred_out
 * - completed, referred_out, declined = terminal
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

async function getMemberFromRequest(request: NextRequest): Promise<{ id: string } | null> {
  const memberId = request.headers.get('x-member-id');
  if (!memberId) return null;
  const result = await query('SELECT id FROM members WHERE id = $1', [memberId]);
  return result.rows.length > 0 ? { id: memberId } : null;
}

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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { containerId } = await context.params;
    const member = await getMemberFromRequest(request);
    if (!member) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await verifyContainerAccess(containerId, member.id)) {
      return NextResponse.json({ error: 'Container not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status: newStatus } = body;

    if (!newStatus) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get current status
    const currentResult = await query(
      'SELECT status FROM rl_containers WHERE id = $1',
      [containerId]
    );
    const currentStatus = currentResult.rows[0].status;

    // Attempt transition (trigger will enforce state machine)
    try {
      const result = await query(
        `UPDATE rl_containers SET status = $1::container_status
         WHERE id = $2
         RETURNING id, type, status, scope, start_at, end_at, visibility, risk_flags, updated_at`,
        [newStatus, containerId]
      );

      return NextResponse.json({
        success: true,
        container: {
          id: result.rows[0].id,
          type: result.rows[0].type,
          status: result.rows[0].status,
          scope: result.rows[0].scope,
          startAt: result.rows[0].start_at,
          endAt: result.rows[0].end_at,
          visibility: result.rows[0].visibility,
          riskFlags: result.rows[0].risk_flags,
          updatedAt: result.rows[0].updated_at
        },
        transition: {
          from: currentStatus,
          to: newStatus
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message.includes('Invalid status transition')) {
        return NextResponse.json({
          error: message,
          code: 'INVALID_TRANSITION'
        }, { status: 400 });
      }
      throw err;
    }
  } catch (error) {
    console.error('[CONTAINER] Transition error:', error);
    return NextResponse.json({ error: 'Failed to transition container' }, { status: 500 });
  }
}
