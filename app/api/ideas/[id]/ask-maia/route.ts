export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/serverSessions';
import { query } from '@/lib/db/postgres';
import {
  generateThreadReflection,
  type ThreadBlockSummary,
} from '@/lib/team/maiaThreadReflection';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// User-facing block labels — kept here so the server composes context with
// the same labels the UI renders. Must stay in sync with BLOCK_LABELS in
// app/maia/ideas/[id]/page.tsx.
const BLOCK_LABELS: Record<'note' | 'decision' | 'change', string> = {
  note: 'Reflection',
  decision: 'Decision',
  change: 'Shift',
};

const OUTCOME_LABELS: Record<string, string> = {
  worked: 'Worked',
  partly: 'Partly worked',
  didnt: "Didn't work",
  unsure: 'Not sure',
};

interface IdeaRow {
  id: string;
  title: string;
  framing: string | null;
}

interface BlockRow {
  id: string;
  block_type: 'note' | 'decision' | 'change' | 'maia_reflection';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * POST /api/ideas/[id]/ask-maia
 *
 * Server-composed, single-shot MAIA reflection persisted in-thread as a
 * `maia_reflection` block. No body required — the user does not author the
 * prompt. The server gathers a bounded context slice (title + framing +
 * last decision + last 3–4 blocks) and calls the Haiku-backed primitive.
 *
 * Returns: { success: true, block: <the new maia_reflection block> }
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

    // Ownership + idea context in one fetch
    const ideaResult = await query<IdeaRow>(
      `SELECT id, title, framing
         FROM member_ideas
        WHERE id = $1 AND member_id = $2`,
      [ideaId, session.memberId]
    );
    if (ideaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    const idea = ideaResult.rows[0];

    // Last 4 member-authored blocks (exclude prior maia_reflection blocks so
    // we don't recursively reflect on reflections).
    const recentResult = await query<BlockRow>(
      `SELECT id, block_type, content, metadata, created_at
         FROM member_idea_blocks
        WHERE idea_id = $1
          AND block_type IN ('note', 'decision', 'change')
        ORDER BY created_at DESC
        LIMIT 4`,
      [ideaId]
    );
    // Re-order oldest-first so the primitive sees chronological flow
    const recentBlocks = [...recentResult.rows].reverse();

    // Most recent decision (may or may not be in the 4-block slice)
    const decisionResult = await query<{ content: string }>(
      `SELECT content
         FROM member_idea_blocks
        WHERE idea_id = $1 AND block_type = 'decision'
        ORDER BY created_at DESC
        LIMIT 1`,
      [ideaId]
    );
    const lastDecision =
      decisionResult.rows.length > 0 ? decisionResult.rows[0].content : null;

    // Shape the context for the primitive
    const summaries: ThreadBlockSummary[] = recentBlocks.map((b) => {
      const rawOutcome =
        b.block_type === 'change' && typeof b.metadata?.outcome === 'string'
          ? (b.metadata.outcome as string)
          : undefined;
      return {
        type: b.block_type as 'note' | 'decision' | 'change',
        label: BLOCK_LABELS[b.block_type as 'note' | 'decision' | 'change'],
        content: b.content,
        outcome: rawOutcome ? OUTCOME_LABELS[rawOutcome] ?? rawOutcome : undefined,
      };
    });

    // Generate — single-shot, no streaming, bounded output
    const reflection = await generateThreadReflection({
      ideaTitle: idea.title,
      ideaFraming: idea.framing,
      lastDecision,
      recentBlocks: summaries,
    });

    // Persist atomically as a maia_reflection block. The trust boundary
    // lives here: only this endpoint writes this block_type.
    const metadata = { source: 'maia', invoked_from: 'idea_thread' } as const;
    const insertResult = await query<BlockRow>(
      `INSERT INTO member_idea_blocks (idea_id, member_id, block_type, content, metadata)
       VALUES ($1, $2, 'maia_reflection', $3, $4)
       RETURNING id, block_type, content, metadata, created_at`,
      [ideaId, session.memberId, reflection, JSON.stringify(metadata)]
    );

    // Touch last_entered_at so the idea bubbles up
    await query(
      `UPDATE member_ideas SET last_entered_at = NOW() WHERE id = $1`,
      [ideaId]
    );

    return NextResponse.json(
      { success: true, block: insertResult.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('[ideas/ask-maia] failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate reflection' },
      { status: 500 }
    );
  }
}
