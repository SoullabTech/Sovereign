import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminCheck = await query(
    `SELECT id FROM members WHERE id = $1 AND ('team_admin' = ANY(roles) OR 'admin' = ANY(roles))`,
    [memberId]
  );
  if (adminCheck.rows.length === 0) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [msgs, activeToday, onlineNow, channels, dms] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total FROM team_messages`, []),
    query(`SELECT COUNT(DISTINCT sender_id)::int AS count FROM team_messages WHERE created_at > NOW() - INTERVAL '24 hours'`, []),
    query(`SELECT COUNT(*)::int AS count FROM team_presence WHERE last_seen_at > NOW() - INTERVAL '2 minutes'`, []),
    query(`SELECT COUNT(*)::int AS count FROM team_channels WHERE archived_at IS NULL`, []),
    query(`SELECT COUNT(*)::int AS count FROM team_dm_threads`, []),
  ]);

  return NextResponse.json({
    totalMessages: msgs.rows[0].total,
    activeMembersToday: activeToday.rows[0].count,
    onlineNow: onlineNow.rows[0].count,
    activeChannels: channels.rows[0].count,
    dmThreads: dms.rows[0].count,
  });
}
