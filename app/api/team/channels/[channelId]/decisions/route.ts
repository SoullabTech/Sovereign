import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { getCurrentPractitioner } from '@/lib/auth/getCurrentPractitioner';
import { requireChannelAccess } from '@/lib/team/permissions';
import { query } from '@/lib/db/postgres';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

// Co-lab → Studio Decisions capture.
// "A decision can be spoken in Co-lab. A decision becomes operational when it
//  is captured into Studio Decisions." One store, two lenses — see migration
//  20260606000001_colab_decision_task_provenance.sql.

function mapDecision(row: any) {
  return {
    id: row.id,
    title: row.title,
    context: row.context,
    status: row.status,
    sourceMessageId: row.source_message_id,
    sourceChannelId: row.source_channel_id,
    capturedByMemberId: row.captured_by_member_id,
    capturedByName: row.captured_by_name ?? null,
    channelSlug: row.channel_slug ?? null,
    taskCount: row.task_count ?? 0,
    createdAt: row.created_at,
  };
}

const DECISION_SELECT = `
  SELECT d.*, c.slug AS channel_slug,
         cap.name AS captured_by_name,
         (SELECT COUNT(*)::int FROM studio_tasks t WHERE t.source_decision_id = d.id) AS task_count
    FROM studio_decisions d
    LEFT JOIN team_channels c ON c.id = d.source_channel_id
    LEFT JOIN members cap ON cap.id = d.captured_by_member_id
`;

/**
 * POST /api/team/channels/:channelId/decisions  { messageId }
 * Capture a channel message (typically message_kind='decision') as an operational
 * Studio Decision. Idempotent: re-capturing the same message returns the existing one.
 * Any channel member may capture (the engineer's eng decisions matter too); the
 * decision is owned by the capturing practitioner if they are one, else null.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;
  const access = await requireChannelAccess(channelId, memberId);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason ?? 'Forbidden' },
      { status: access.reason === 'not_found' ? 404 : 403 }
    );
  }

  const { messageId } = await request.json().catch(() => ({}));
  if (!messageId || typeof messageId !== 'string') {
    return NextResponse.json({ error: 'messageId required' }, { status: 400 });
  }

  // Resolve the source message + its channel + speaker
  const msgRes = await query(
    `SELECT m.id, m.body, m.channel_id,
            c.slug AS channel_slug,
            COALESCE(mem.name, 'Someone') AS sender_name
       FROM team_messages m
       JOIN team_channels c ON c.id = m.channel_id
       LEFT JOIN members mem ON mem.id = m.sender_id
      WHERE m.id = $1`,
    [messageId]
  );
  const msg = msgRes.rows[0];
  if (!msg) return NextResponse.json({ error: 'message_not_found' }, { status: 404 });
  if (msg.channel_id !== channelId) {
    return NextResponse.json({ error: 'message_not_in_channel' }, { status: 400 });
  }

  // Idempotent: one decision per source message
  const existing = await query(`${DECISION_SELECT} WHERE d.source_message_id = $1`, [messageId]);
  if (existing.rows[0]) {
    return NextResponse.json({ decision: mapDecision(existing.rows[0]), alreadyCaptured: true });
  }

  // Owner: the capturing practitioner if they are one; otherwise null (team member)
  const practitioner = await getCurrentPractitioner(request);

  const bodyText: string = (msg.body ?? '').trim();
  const title = (bodyText.split('\n')[0] || 'Decision').slice(0, 120);
  const context = `Decided in #${msg.channel_slug} (${msg.sender_name}):\n\n${bodyText}`;

  const id = randomUUID();
  await query(
    `INSERT INTO studio_decisions
       (id, practitioner_id, captured_by_member_id, source_message_id, source_channel_id, title, context, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')`,
    [id, practitioner?.practitionerId ?? null, memberId, messageId, channelId, title, context]
  );

  console.log(
    `[Co-lab/decision-capture] { decisionId: '${id}', channelId: '${channelId.slice(0, 8)}', ` +
    `messageId: '${messageId.slice(0, 8)}', byMember: '${memberId.slice(0, 8)}', isPractitioner: ${!!practitioner} }`
  );

  const created = await query(`${DECISION_SELECT} WHERE d.id = $1`, [id]);
  return NextResponse.json({ decision: mapDecision(created.rows[0]) }, { status: 201 });
}

/**
 * GET /api/team/channels/:channelId/decisions
 * Decisions captured from this channel (newest first).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;
  const access = await requireChannelAccess(channelId, memberId);
  if (!access.allowed) {
    return NextResponse.json(
      { error: access.reason ?? 'Forbidden' },
      { status: access.reason === 'not_found' ? 404 : 403 }
    );
  }

  const res = await query(
    `${DECISION_SELECT} WHERE d.source_channel_id = $1 ORDER BY d.created_at DESC LIMIT 100`,
    [channelId]
  );
  return NextResponse.json({ decisions: res.rows.map(mapDecision) });
}
