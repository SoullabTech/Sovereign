import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getFieldBySlug } from '@/lib/masters/registry';
import { sendPartnerNotification } from '@/lib/masters/partnerNotifications';
import { logFieldActivity } from '@/lib/masters/fieldActivityLog';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getFieldBySlug(slug)) {
    return NextResponse.json({ error: 'Field not found' }, { status: 404 });
  }
  const url = new URL(req.url);
  const sharedOnly = url.searchParams.get('shared') === '1';

  const { rows } = sharedOnly
    ? await query(
        `SELECT id, field_slug, column_id, title, body, tags, author_id, sort_order, created_at, updated_at, shared, card_type
         FROM field_kanban_cards
         WHERE (field_slug = $1 OR shared = true)
         ORDER BY column_id, sort_order, created_at`,
        [slug]
      )
    : await query(
        `SELECT id, field_slug, column_id, title, body, tags, author_id, sort_order, created_at, updated_at, shared, card_type
         FROM field_kanban_cards
         WHERE field_slug = $1
         ORDER BY column_id, sort_order, created_at`,
        [slug]
      );
  return NextResponse.json({ cards: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getFieldBySlug(slug)) {
    return NextResponse.json({ error: 'Field not found' }, { status: 404 });
  }
  const body = await req.json();
  const { column_id, title, text, tags, author_id, card_type } = body;
  if (!column_id || !title?.trim()) {
    return NextResponse.json({ error: 'column_id and title required' }, { status: 400 });
  }
  const validCardTypes = ['build', 'decision', 'insight', 'question'] as const;
  type CardType = typeof validCardTypes[number];
  const safeCardType: CardType = validCardTypes.includes(card_type) ? (card_type as CardType) : 'build';

  const { rows } = await query(
    `INSERT INTO field_kanban_cards (field_slug, column_id, title, body, tags, author_id, card_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [slug, column_id, title.trim(), text || null, tags || [], author_id || null, safeCardType]
  );

  if (author_id) {
    void sendPartnerNotification({
      event: 'card_added',
      actorId: author_id,
      fieldSlug: slug,
      cardTitle: title.trim(),
      columnId: column_id,
    });
    void logFieldActivity({
      fieldSlug: slug,
      actorId: author_id,
      eventType: 'card_added',
      payload: { cardId: rows[0].id, title: title.trim(), columnId: column_id, card_type: safeCardType },
    });
  }

  return NextResponse.json({ card: rows[0] }, { status: 201 });
}
