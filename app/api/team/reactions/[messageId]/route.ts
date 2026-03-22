import { NextRequest, NextResponse } from 'next/server';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { toggleReaction } from '@/lib/team/ChannelService';

export const dynamic = 'force-dynamic';

const ALLOWED_EMOJI = new Set([
  '👍','👎','❤️','🔥','🎉','✅','❌','🤔','👀','🙌',
  '😂','😅','🚀','💡','⚡','🌊','🌿','✨','🙏','💪',
]);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messageId } = await params;
  const body = await request.json();
  const { emoji } = body;

  if (!emoji || !ALLOWED_EMOJI.has(emoji)) {
    return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
  }

  const action = await toggleReaction(messageId, memberId, emoji);
  return NextResponse.json({ action });
}
