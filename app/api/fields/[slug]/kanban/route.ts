import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getFieldBySlug } from '@/lib/masters/registry';

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
        `SELECT id, field_slug, column_id, title, body, tags, author_id, sort_order, created_at, updated_at, shared
         FROM field_kanban_cards
         WHERE (field_slug = $1 OR shared = true)
         ORDER BY column_id, sort_order, created_at`,
        [slug]
      )
    : await query(
        `SELECT id, field_slug, column_id, title, body, tags, author_id, sort_order, created_at, updated_at, shared
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
  const { column_id, title, text, tags, author_id } = body;
  if (!column_id || !title?.trim()) {
    return NextResponse.json({ error: 'column_id and title required' }, { status: 400 });
  }
  const { rows } = await query(
    `INSERT INTO field_kanban_cards (field_slug, column_id, title, body, tags, author_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [slug, column_id, title.trim(), text || null, tags || [], author_id || null]
  );
  return NextResponse.json({ card: rows[0] }, { status: 201 });
}
