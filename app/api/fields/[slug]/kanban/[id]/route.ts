import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const body = await req.json();
  const { column_id, title, text, tags } = body;
  const { rows } = await query(
    `UPDATE field_kanban_cards
     SET column_id = COALESCE($1, column_id),
         title = COALESCE($2, title),
         body = COALESCE($3, body),
         tags = COALESCE($4, tags),
         updated_at = NOW()
     WHERE id = $5 AND field_slug = $6
     RETURNING *`,
    [column_id || null, title || null, text !== undefined ? text : null, tags || null, id, slug]
  );
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
