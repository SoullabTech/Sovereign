export const dynamic = 'force-dynamic';

/**
 * Field Room Invite — Resolve (public preview, no sensitive data)
 * GET /api/field-invites/resolve?token=<token>
 *
 * Returns invite validity and metadata for the landing page.
 * No auth required — this is what guests see before signing in.
 * Uses resource_invites table (separate from passkey invites).
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ valid: false, reason: 'MISSING_TOKEN' }, { status: 400 });

  const result = await query<{
    target_type: string;
    target_id: string;
    role: string;
    expires_at: string;
    max_uses: number;
    uses_count: number;
    revoked_at: string | null;
  }>(
    `SELECT target_type, target_id, role, expires_at, max_uses, uses_count, revoked_at
     FROM resource_invites
     WHERE token = $1
     LIMIT 1`,
    [token]
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ valid: false, reason: 'NOT_FOUND' }, { status: 404 });
  }

  const row = result.rows[0];
  const now = new Date();
  const expiresAt = new Date(row.expires_at);

  if (row.revoked_at) {
    return NextResponse.json({ valid: false, reason: 'REVOKED' }, { status: 410 });
  }
  if (expiresAt <= now) {
    return NextResponse.json({ valid: false, reason: 'EXPIRED' }, { status: 410 });
  }
  if (row.uses_count >= row.max_uses) {
    return NextResponse.json({ valid: false, reason: 'USED_UP' }, { status: 410 });
  }

  // For field rooms, check capacity without leaking content
  let full = false;
  if (row.target_type === 'field_room') {
    try {
      const cap = await query<{ capacity: number; count: number }>(
        `SELECT r.capacity AS capacity,
                (SELECT COUNT(*)::int FROM commons_room_members m WHERE m.room_id = r.id) AS count
         FROM commons_rooms r
         WHERE r.id = $1
         LIMIT 1`,
        [row.target_id]
      );
      if (cap.rows.length) {
        full = cap.rows[0].capacity > 0 && cap.rows[0].count >= cap.rows[0].capacity;
      }
    } catch {
      // commons_rooms table may not exist yet — non-fatal
    }
  }

  return NextResponse.json({
    valid: true,
    targetType: row.target_type,
    targetId: row.target_id,
    role: row.role,
    expiresAt: row.expires_at,
    full,
    requiresLogin: true,
  });
}
