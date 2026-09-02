export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import { generateTitleProposals } from '@/lib/team/maiaTitleProposal';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/ideas/[id]/suggest-title
 *
 * MAIA proposes 2–3 candidate names for the inquiry. The candidates are written
 * to member_ideas.proposed_titles ONLY. This route never writes `title`.
 *
 * The idea is renamed exclusively by PATCH /api/ideas/[id], which requires a
 * member-supplied title string. That is the ratification boundary, and it is
 * enforced by the shape of the routes rather than by discipline.
 *
 * Returns: { success: true, proposed_titles: string[] }
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: ideaId } = await params;
    if (!UUID_RE.test(ideaId)) {
      return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 });
    }

    const ideaResult = await query<{
      id: string;
      title: string;
      seed: string | null;
      title_source: string;
    }>(
      `SELECT id, title, seed, title_source
         FROM member_ideas
        WHERE id = $1 AND member_id = $2`,
      [ideaId, session.memberId]
    );
    if (ideaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    const idea = ideaResult.rows[0];

    const blocksResult = await query<{ content: string }>(
      `SELECT content
         FROM member_idea_blocks
        WHERE idea_id = $1
          AND block_type IN ('note', 'decision', 'change')
        ORDER BY created_at DESC
        LIMIT 6`,
      [ideaId]
    );
    const recentBlocks = [...blocksResult.rows].reverse().map((r) => r.content);

    if (recentBlocks.length === 0) {
      return NextResponse.json(
        { error: 'This idea has nothing written in it yet' },
        { status: 400 }
      );
    }

    const proposals = await generateTitleProposals({
      seed: idea.seed,
      // An auto-derived title was never named by anyone; showing it to the model
      // as the "current working name" would only anchor it on the seed sentence.
      currentTitle: idea.title_source === 'auto_seed' ? null : idea.title,
      recentBlocks,
    });

    if (proposals.length === 0) {
      return NextResponse.json(
        { error: 'No usable suggestions came back. Nothing was changed.' },
        { status: 502 }
      );
    }

    const updated = await query<{ proposed_titles: string[] }>(
      `UPDATE member_ideas
          SET proposed_titles = $1, proposed_titles_at = NOW()
        WHERE id = $2 AND member_id = $3
      RETURNING proposed_titles`,
      [proposals, ideaId, session.memberId]
    );

    return NextResponse.json({
      success: true,
      proposed_titles: updated.rows[0]?.proposed_titles ?? proposals,
    });
  } catch (error) {
    console.error('[ideas/suggest-title] failed:', error);
    return NextResponse.json(
      { error: 'Failed to suggest a name' },
      { status: 500 }
    );
  }
}
