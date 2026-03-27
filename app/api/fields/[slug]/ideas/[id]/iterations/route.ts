import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { id } = await params;

  const { rows } = await query(
    `SELECT * FROM field_idea_iterations
     WHERE idea_id = $1
     ORDER BY version_number DESC`,
    [id]
  );

  return NextResponse.json({ iterations: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const body = await req.json();
  const { content, author_id } = body;

  if (!content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  // Verify idea exists
  const existing = await query(
    `SELECT id FROM field_ideas WHERE id = $1 AND field_slug = $2`,
    [id, slug]
  );
  if (!existing.rows.length) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  // Atomic version increment: SELECT FOR UPDATE then INSERT
  const { rows: versionRows } = await query(
    `SELECT COALESCE(MAX(version_number), 0) + 1 AS next_version
     FROM field_idea_iterations
     WHERE idea_id = $1
     FOR UPDATE`,
    [id]
  );
  const nextVersion = versionRows[0].next_version;

  const { rows } = await query(
    `INSERT INTO field_idea_iterations (idea_id, version_number, content, author_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, nextVersion, content.trim(), author_id || null]
  );

  // Update idea's updated_at and summary (latest content truncated)
  await query(
    `UPDATE field_ideas
     SET updated_at = NOW(),
         summary = $1
     WHERE id = $2`,
    [content.trim().slice(0, 200), id]
  );

  return NextResponse.json({ iteration: rows[0] }, { status: 201 });
}
