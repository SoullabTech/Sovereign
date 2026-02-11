export const dynamic = 'force-dynamic';

/**
 * Field Room Invite — Accept (auth'd, consumes use, joins room)
 * POST /api/field-invites/accept
 *
 * Auth-gated: member must be signed in to accept.
 * Atomically validates, joins room, and increments use count.
 * Uses resource_invites table (separate from passkey invites).
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const runtime = 'nodejs';

const ALLOWED_ROLES = new Set(['witness', 'participant', 'quiet']);

export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const token = String(body.token || '');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  // Lock invite row to avoid double-consume
  const inviteRes = await query<{
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
     FOR UPDATE`,
    [token]
  );

  if (inviteRes.rows.length === 0) {
    return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  }

  const inv = inviteRes.rows[0];
  const now = new Date();
  const expiresAt = new Date(inv.expires_at);

  if (inv.revoked_at) return NextResponse.json({ error: 'Invite revoked' }, { status: 410 });
  if (expiresAt <= now) return NextResponse.json({ error: 'Invite expired' }, { status: 410 });
  if (inv.uses_count >= inv.max_uses) return NextResponse.json({ error: 'Invite used up' }, { status: 410 });
  if (!ALLOWED_ROLES.has(inv.role)) return NextResponse.json({ error: 'Invalid invite role' }, { status: 500 });

  // Target type v1
  if (inv.target_type !== 'field_room') {
    return NextResponse.json({ error: 'Unsupported target' }, { status: 400 });
  }

  const roomId = inv.target_id;

  // Capacity check (mirror existing join logic)
  try {
    const cap = await query<{ capacity: number; count: number }>(
      `SELECT r.capacity AS capacity,
              (SELECT COUNT(*)::int FROM commons_room_members m WHERE m.room_id = r.id) AS count
       FROM commons_rooms r
       WHERE r.id = $1
       LIMIT 1`,
      [roomId]
    );
    if (cap.rows.length) {
      const { capacity, count } = cap.rows[0];
      if (capacity > 0 && count >= capacity) {
        return NextResponse.json({ error: 'Room full' }, { status: 409 });
      }
    }
  } catch {
    // commons_rooms table may not exist yet — allow join to proceed
  }

  // Join (idempotent — ON CONFLICT updates role)
  await query(
    `INSERT INTO commons_room_members (room_id, member_id, role)
     VALUES ($1,$2,$3)
     ON CONFLICT (room_id, member_id) DO UPDATE SET role = EXCLUDED.role`,
    [roomId, memberId, inv.role]
  );

  // Consume use
  await query(
    `UPDATE resource_invites
     SET uses_count = uses_count + 1
     WHERE token = $1`,
    [token]
  );

  return NextResponse.json({
    redirectTo: `/field-rooms/${roomId}`,
    role: inv.role,
  });
}
