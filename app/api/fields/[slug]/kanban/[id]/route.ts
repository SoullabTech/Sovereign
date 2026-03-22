import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { sendPartnerNotification } from '@/lib/masters/partnerNotifications';
import { logFieldActivity } from '@/lib/masters/fieldActivityLog';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const body = await req.json();
  const { column_id, title, text, tags, author_id, card_type } = body;

  // Fetch existing card to detect column change for notifications
  const existing = await query(
    `SELECT column_id, title FROM field_kanban_cards WHERE id = $1 AND field_slug = $2`,
    [id, slug]
  );
  if (!existing.rows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const previousColumnId = existing.rows[0].column_id as string;
  const cardTitle = (title?.trim() ?? existing.rows[0].title) as string;

  const validCardTypes = ['build', 'decision', 'insight', 'question'] as const;
  type CardType = typeof validCardTypes[number];
  const safeCardType: CardType | null = card_type != null && validCardTypes.includes(card_type)
    ? (card_type as CardType)
    : null;

  const { rows } = await query(
    `UPDATE field_kanban_cards
     SET column_id = COALESCE($1, column_id),
         title = COALESCE($2, title),
         body = COALESCE($3, body),
         tags = COALESCE($4, tags),
         card_type = COALESCE($7, card_type),
         updated_at = NOW()
     WHERE id = $5 AND field_slug = $6
     RETURNING *`,
    [column_id || null, title || null, text !== undefined ? text : null, tags || null, id, slug, safeCardType]
  );
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fire-and-forget: notify + log only when column actually changed
  const columnMoved = column_id != null && column_id !== previousColumnId;
  if (columnMoved && author_id) {
    void sendPartnerNotification({
      event: 'card_moved',
      actorId: author_id,
      fieldSlug: slug,
      cardTitle,
      columnId: column_id,
    });
    void logFieldActivity({
      fieldSlug: slug,
      actorId: author_id,
      eventType: 'card_moved',
      payload: { cardId: id, title: cardTitle, fromColumn: previousColumnId, toColumn: column_id, card_type: rows[0].card_type },
    });
  }

  return NextResponse.json({ card: rows[0] });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  await query(
    `DELETE FROM field_kanban_cards WHERE id = $1 AND field_slug = $2`,
    [id, slug]
  );
  return NextResponse.json({ ok: true });
}
