import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const body = await req.json();
  const { title, summary, status, warmth, tags } = body;

  const existing = await query(
    `SELECT id FROM field_ideas WHERE id = $1 AND field_slug = $2`,
    [id, slug]
  );
  if (!existing.rows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { rows } = await query(
    `UPDATE field_ideas
     SET title      = COALESCE($1, title),
         summary    = COALESCE($2, summary),
         status     = COALESCE($3, status),
         warmth     = COALESCE($4, warmth),
         tags       = COALESCE($5, tags),
         updated_at = NOW()
     WHERE id = $6 AND field_slug = $7
     RETURNING *`,
    [
      title ?? null,
      summary ?? null,
      status ?? null,
      warmth ?? null,
      tags ?? null,
      id,
      slug,
    ]
  );

  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ idea: rows[0] });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  await query(`DELETE FROM field_ideas WHERE id = $1 AND field_slug = $2`, [id, slug]);
  return NextResponse.json({ ok: true });
}
