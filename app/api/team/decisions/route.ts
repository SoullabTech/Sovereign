import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

/**
 * GET /api/team/decisions
 *
 * The TEAM lens over studio_decisions: operational decisions captured from any
 * channel the member can access. Answers "what did we decide?" for the whole
 * Co-lab — accessible to every member (incl. non-practitioners like the engineer),
 * unlike the practitioner-private Decision Council at /studio/decisions.
 *
 * One store (studio_decisions), two lenses. Channel-origin decisions stay at
 * channel visibility (public channels → all members; private → members only).
 */
export async function GET(request: NextRequest) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const res = await query(
    `SELECT d.id, d.title, d.context, d.status, d.created_at,
            d.source_message_id, d.source_channel_id, d.captured_by_member_id,
            c.slug AS channel_slug, c.name AS channel_name, c.is_private,
            cap.name AS captured_by_name,
            m.message_kind AS source_kind,
            (SELECT COUNT(*)::int FROM studio_tasks t WHERE t.source_decision_id = d.id) AS task_count,
            COALESCE((
              SELECT json_agg(json_build_object('id', t.id, 'title', t.title, 'assignee', t.assignee, 'status', t.status) ORDER BY t.created_at)
              FROM studio_tasks t WHERE t.source_decision_id = d.id
            ), '[]'::json) AS tasks
       FROM studio_decisions d
       JOIN team_channels c ON c.id = d.source_channel_id
       LEFT JOIN members cap ON cap.id = d.captured_by_member_id
       LEFT JOIN team_messages m ON m.id = d.source_message_id
      WHERE d.source_channel_id IS NOT NULL
        AND (
          c.is_private = FALSE
          OR EXISTS (
            SELECT 1 FROM team_channel_members tcm
             WHERE tcm.channel_id = c.id AND tcm.member_id = $1
          )
        )
      ORDER BY d.created_at DESC
      LIMIT 100`,
    [memberId]
  );

  const decisions = res.rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    context: row.context,
    status: row.status,
    sourceMessageId: row.source_message_id,
    sourceChannelId: row.source_channel_id,
    channelSlug: row.channel_slug,
    channelName: row.channel_name,
    capturedByName: row.captured_by_name,
    sourceKind: row.source_kind ?? null,
    taskCount: row.task_count ?? 0,
    tasks: row.tasks ?? [],
    createdAt: row.created_at,
  }));

  return NextResponse.json({ decisions });
}
