import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const body = await req.json();
  const { title, context, recommendation, owner, status, deadline, decided_by, tags } = body;

  const existing = await query(
    `SELECT id FROM field_decisions WHERE id = $1 AND field_slug = $2`,
    [id, slug]
  );
  if (!existing.rows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // When marking decided, auto-set decided_at if not provided
  const decidedAt =
    status === 'decided' ? (body.decided_at ?? new Date().toISOString()) : body.decided_at ?? null;

  const { rows } = await query(
    `UPDATE field_decisions
     SET title            = COALESCE($1, title),
         context          = COALESCE($2, context),
         recommendation   = COALESCE($3, recommendation),
         owner            = COALESCE($4, owner),
         status           = COALESCE($5, status),
         deadline         = COALESCE($6, deadline),
         decided_at       = CASE WHEN $5 = 'decided' THEN COALESCE($7::TIMESTAMPTZ, NOW()) ELSE decided_at END,
         decided_by       = COALESCE($8::UUID, decided_by),
         tags             = COALESCE($9, tags),
         updated_at       = NOW()
     WHERE id = $10 AND field_slug = $11
     RETURNING *`,
    [
      title ?? null,
      context ?? null,
      recommendation ?? null,
      owner ?? null,
      status ?? null,
      deadline ?? null,
      decidedAt,
      decided_by ?? null,
      tags ?? null,
      id,
      slug,
    ]
  );

  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ decision: rows[0] });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  await query(`DELETE FROM field_decisions WHERE id = $1 AND field_slug = $2`, [id, slug]);
  return NextResponse.json({ ok: true });
}
