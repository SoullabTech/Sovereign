/**
 * SAFETY CONCERN LOG API
 *
 * GET /api/practitioner/safety/[logId]
 * POST /api/practitioner/safety/[logId] - Acknowledge safety concern
 *
 * AUTHORIZATION: Session-based. Only the log's practitioner can access/acknowledge.
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireMemberId } from '@/lib/auth/session';
import { query } from '@/lib/db/postgres';

interface RouteParams {
  params: Promise<{ logId: string }>;
}

const AckBodySchema = z.object({
  reviewNote: z.string().trim().max(2000).optional(),
});

/**
 * GET /api/practitioner/safety/[logId]
 *
 * Get a specific safety concern log
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { logId } = await params;

    const result = await query(
      `SELECT
        scl.*,
        c.name as client_name,
        c.preferred_name as client_preferred_name,
        m.body as message_body,
        m.created_at as message_created_at
      FROM safety_concern_logs scl
      LEFT JOIN practitioner_clients c ON scl.client_id = c.id
      LEFT JOIN client_messages m ON scl.message_id = m.id
      WHERE scl.id = $1 AND scl.practitioner_id = $2`,
      [logId, practitionerId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Safety log not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ log: result.rows[0] });
  } catch (error) {
    console.error('[Safety Log API] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch safety log' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/practitioner/safety/[logId]
 *
 * Acknowledge a safety concern (mark as reviewed)
 * Body:
 * - reviewNote: optional string (max 2000 chars) - private de-identified note
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const practitionerId = await requireMemberId();
    const { logId } = await params;

    // Parse and validate body
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    const parsed = AckBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Ownership check + acknowledge in one atomic statement
    // Uses COALESCE to be idempotent - won't overwrite existing ack
    const result = await query(
      `UPDATE safety_concern_logs
       SET
         acknowledged_at = COALESCE(acknowledged_at, NOW()),
         acknowledged_by = COALESCE(acknowledged_by, $2),
         review_note = COALESCE($3, review_note)
       WHERE id = $1
         AND practitioner_id = $2
       RETURNING
         id,
         practitioner_id,
         client_id,
         message_id,
         acknowledged_at,
         acknowledged_by,
         review_note,
         logged_at,
         email_status,
         created_at`,
      [logId, practitionerId, parsed.data.reviewNote ?? null]
    );

    if ((result.rowCount ?? 0) === 0) {
      // Either not found OR not owned by this practitioner
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,
      log: result.rows[0],
    });
  } catch (error) {
    console.error('[Safety Log API] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge safety concern' },
      { status: 500 }
    );
  }
}
