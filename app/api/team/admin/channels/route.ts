import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

async function requireAdmin(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return null;
  const r = await query(
    `SELECT id FROM members WHERE id = $1 AND ('team_admin' = ANY(roles) OR 'admin' = ANY(roles))`,
    [memberId]
  );
  return r.rows.length > 0 ? memberId : null;
}

// GET all channels (including archived)
export async function GET(request: NextRequest) {
  const adminId = await requireAdmin(request);
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const result = await query(
    `SELECT c.*,
            m.name AS created_by_name,
            (SELECT COUNT(*) FROM team_messages WHERE channel_id = c.id)::int AS message_count
     FROM team_channels c
     LEFT JOIN members m ON m.id = c.created_by
     ORDER BY c.created_at ASC`,
    []
  );
  return NextResponse.json({ channels: result.rows });
}

// PATCH update a channel
export async function PATCH(request: NextRequest) {
  const adminId = await requireAdmin(request);
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { channelId, name, description, archive } = await request.json();
  if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 });

  if (typeof archive === 'boolean') {
    await query(
      `UPDATE team_channels SET archived_at = $1, updated_at = NOW() WHERE id = $2`,
      [archive ? new Date() : null, channelId]
    );
  }
  if (name !== undefined || description !== undefined) {
    await query(
      `UPDATE team_channels SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         updated_at = NOW()
       WHERE id = $3`,
      [name ?? null, description ?? null, channelId]
    );
  }

  const r = await query(`SELECT * FROM team_channels WHERE id = $1`, [channelId]);
  return NextResponse.json({ channel: r.rows[0] });
}

// DELETE a channel permanently
export async function DELETE(request: NextRequest) {
  const adminId = await requireAdmin(request);
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { channelId } = await request.json();
  if (!channelId) return NextResponse.json({ error: 'channelId required' }, { status: 400 });

  // Prevent deleting the general/announcements channel
  const check = await query(`SELECT slug FROM team_channels WHERE id = $1`, [channelId]);
  if (check.rows[0]?.slug === 'general') {
    return NextResponse.json({ error: 'Cannot delete the general channel' }, { status: 400 });
  }

  await query(`DELETE FROM team_channels WHERE id = $1`, [channelId]);
  return NextResponse.json({ ok: true });
}
