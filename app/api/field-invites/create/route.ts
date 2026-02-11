export const dynamic = 'force-dynamic';

/**
 * Field Room Invite — Create
 * POST /api/field-invites/create
 *
 * Generates a token-based invite link for a Field Room.
 * Auth-gated: only existing room members can invite.
 * Uses resource_invites table (separate from passkey invites).
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const runtime = 'nodejs';

const ALLOWED_ROLES = new Set(['witness', 'participant', 'quiet']);
const ALLOWED_TARGET_TYPES = new Set(['field_room']);

function getExpiresAt(expiresIn: string | null): Date {
  // v1 presets: '1h' | '24h' | '7d'
  const now = Date.now();
  const ms =
    expiresIn === '1h' ? 60 * 60 * 1000 :
    expiresIn === '7d' ? 7 * 24 * 60 * 60 * 1000 :
    24 * 60 * 60 * 1000; // default 24h
  return new Date(now + ms);
}

export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromRequest(req);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const targetType = String(body.targetType || '');
  const targetId = String(body.targetId || '');
  const role = String(body.role || 'witness');
  const expiresIn = body.expiresIn ? String(body.expiresIn) : null;
  const maxUses = Number.isFinite(body.maxUses) ? Number(body.maxUses) : 1;

  if (!ALLOWED_TARGET_TYPES.has(targetType)) {
    return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 });
  }
  if (!/^[0-9a-f-]{36}$/i.test(targetId)) {
    return NextResponse.json({ error: 'Invalid targetId' }, { status: 400 });
  }
  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  if (!(maxUses >= 1 && maxUses <= 10)) {
    return NextResponse.json({ error: 'Invalid maxUses' }, { status: 400 });
  }

  // Must be a room member to invite
  const membership = await query(
    `SELECT 1 FROM commons_room_members
     WHERE room_id = $1 AND member_id = $2
     LIMIT 1`,
    [targetId, memberId]
  );
  if (membership.rows.length === 0) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const token = crypto.randomBytes(24).toString('base64url'); // high entropy
  const expiresAt = getExpiresAt(expiresIn);

  await query(
    `INSERT INTO resource_invites (
      token, created_by_member_id, target_type, target_id,
      role, expires_at, max_uses
    ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [token, memberId, targetType, targetId, role, expiresAt.toISOString(), maxUses]
  );

  return NextResponse.json({
    token,
    inviteUrl: `/invite/${token}`,
    expiresAt: expiresAt.toISOString(),
    role,
  });
}
