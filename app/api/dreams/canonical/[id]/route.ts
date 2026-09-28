import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

type DreamRow = {
  id: string;
  user_id: string;
  entry_type: 'dream';
  content: string;
  source: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
  audio_path: string | null;
  audio_mime: string | null;
  audio_duration_ms: number | null;
  transcript_source: string | null;
  transcript_confidence: number | null;
};
async function ownedIdsFor(memberId: string): Promise<string[]> {
  const ids = [memberId];
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(memberId)) return ids;

  try {
    const result = await query<{ username: string }>(
      'SELECT username FROM members WHERE id::text = $1 LIMIT 1',
      [memberId],
    );
    const username = result.rows[0]?.username;
    if (username) ids.push(username, username + '-nezat');
  } catch {
    // UUID ownership remains sufficient when legacy alias lookup is unavailable.
  }
  return ids;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const { id } = await params;
  const owners = await ownedIdsFor(memberId);
  const placeholders = owners.map((_, index) => '$' + (index + 2)).join(', ');
  const result = await query<DreamRow>(
    `SELECT id::text AS id, user_id, entry_type, content, source, meta,
            created_at::text AS created_at,
            audio_path, audio_mime, audio_duration_ms,
            transcript_source, transcript_confidence
       FROM quick_journal_entries
      WHERE id::text = $1
        AND entry_type = 'dream'
        AND user_id IN (${placeholders})
      LIMIT 1`,
    [id, ...owners],
  );

  const dream = result.rows[0];
  if (!dream) {
    return NextResponse.json({ success: false, error: 'Dream not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    dream: {
      id: dream.id,
      content: dream.content,
      createdAt: dream.created_at,
      source: dream.source,
      meta: dream.meta,
      audio: dream.audio_path
        ? {
            path: dream.audio_path,
            mime: dream.audio_mime,
            durationMs: dream.audio_duration_ms,
            transcriptSource: dream.transcript_source,
            transcriptConfidence: dream.transcript_confidence,
          }
        : null,
    },
  });
}
