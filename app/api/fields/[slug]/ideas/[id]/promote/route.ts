import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const body = await req.json();
  const { target, column_id, reason } = body;

  if (!target || !['decision', 'kanban'].includes(target)) {
    return NextResponse.json({ error: 'target must be "decision" or "kanban"' }, { status: 400 });
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: 'reason is required' }, { status: 400 });
  }

  // Load idea with latest iteration and count
  const { rows: ideaRows } = await query(
    `SELECT i.*,
      li.content AS latest_content,
      ic.iteration_count
    FROM field_ideas i
    LEFT JOIN LATERAL (
      SELECT content FROM field_idea_iterations
      WHERE idea_id = i.id ORDER BY version_number DESC LIMIT 1
    ) li ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS iteration_count
      FROM field_idea_iterations WHERE idea_id = i.id
    ) ic ON true
    WHERE i.id = $1 AND i.field_slug = $2`,
    [id, slug]
  );

  if (!ideaRows.length) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  const idea = ideaRows[0];

  if (idea.status === 'adopted') {
    return NextResponse.json({ error: 'Idea already promoted' }, { status: 409 });
  }

  // Build enriched context for the target record
  const enrichedContext = [
    idea.latest_content || idea.summary || '',
    '',
    '---',
    `Promoted from Idea Field · ${idea.iteration_count || 1} iteration${(idea.iteration_count || 1) > 1 ? 's' : ''} · origin: ${idea.origin || 'unknown'}`,
  ].join('\n');

  let promotedId: string;

  if (target === 'decision') {
    const { rows } = await query(
      `INSERT INTO field_decisions
         (field_slug, title, context, recommendation, status, created_by)
       VALUES ($1, $2, $3, $4, 'open', $5)
       RETURNING id`,
      [slug, idea.title, enrichedContext, reason.trim(), idea.created_by]
    );
    promotedId = rows[0].id;

    await query(
      `UPDATE field_ideas
       SET status = 'adopted',
           promoted_to_decision_id = $1,
           promotion_reason = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [promotedId, reason.trim(), id]
    );
  } else {
    // kanban
    const { rows } = await query(
      `INSERT INTO field_kanban_cards
         (field_slug, column_id, title, body, author_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [slug, column_id || 'planned', idea.title, enrichedContext, idea.created_by]
    );
    promotedId = rows[0].id;

    await query(
      `UPDATE field_ideas
       SET status = 'adopted',
           promoted_to_kanban_id = $1,
           promotion_reason = $2,
           updated_at = NOW()
       WHERE id = $3`,
      [promotedId, reason.trim(), id]
    );
  }

  return NextResponse.json({
    promoted: true,
    target,
    target_id: promotedId,
    idea_id: id,
  });
}
