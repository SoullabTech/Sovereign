import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { generateReflection, MAIA_BOT_ID_EXPORT } from '@/lib/team/maiaReflectService';
import { requireChannelAccess } from '@/lib/team/permissions';
import { query } from '@/lib/db/postgres';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ channelId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { channelId } = await params;

  const access = await requireChannelAccess(channelId, memberId);
  if (!access.allowed) {
    const status = access.reason === 'not_found' ? 404 : 403;
    return NextResponse.json({ error: access.reason ?? 'Forbidden' }, { status });
  }

  const { messageId, messageBody, reflectMode = 'reflect' } = await request.json();

  if (!messageBody) return NextResponse.json({ error: 'messageBody required' }, { status: 400 });

  // Get channel context
  const channelRes = await query(
    `SELECT id, name, slug, archetype, purpose_block FROM team_channels WHERE id = $1`,
    [channelId]
  );
  if (!channelRes.rows[0]) return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  const channel = channelRes.rows[0];

  try {
    const reflection = await generateReflection({
      messageBody,
      channelArchetype: channel.archetype ?? 'general',
      channelPurpose: channel.purpose_block ?? '',
      channelName: channel.name,
      mode: reflectMode,
    });

    // Post as MAIA bot message in the thread of the original message
    const msgRes = await query(
      `INSERT INTO team_messages (id, channel_id, sender_id, body, parent_id, sender_type)
       VALUES ($1, $2, $3, $4, $5, 'maia') RETURNING *`,
      [crypto.randomUUID(), channelId, MAIA_BOT_ID_EXPORT, reflection, messageId ?? null]
    );

    const row = msgRes.rows[0];
    return NextResponse.json({
      message: {
        id: row.id,
        channelId: row.channel_id,
        senderId: row.sender_id,
        senderName: 'MAIA',
        senderType: 'maia',
        body: row.body,
        parentId: row.parent_id,
        reactions: [],
        replyCount: 0,
        createdAt: row.created_at,
        editedAt: null,
      },
    });
  } catch (err) {
    console.error('[MAIA reflect]', err);
    return NextResponse.json({ error: 'Reflection failed' }, { status: 500 });
  }
}
