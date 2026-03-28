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
  const statusFilter = url.searchParams.get('status');

  // Join latest iteration + iteration count per idea
  const baseQuery = `
    SELECT i.*,
      li.content AS latest_content,
      li.version_number AS latest_version,
      li.created_at AS latest_iteration_at,
      li.author_id AS latest_author_id,
      ic.iteration_count
    FROM field_ideas i
    LEFT JOIN LATERAL (
      SELECT content, version_number, created_at, author_id
      FROM field_idea_iterations
      WHERE idea_id = i.id
      ORDER BY version_number DESC
      LIMIT 1
    ) li ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*)::int AS iteration_count
      FROM field_idea_iterations
      WHERE idea_id = i.id
    ) ic ON true
    WHERE i.field_slug = $1
    ${statusFilter && statusFilter !== 'all' ? 'AND i.status = $2' : ''}
    ORDER BY
      CASE i.status
        WHEN 'ripe' THEN 0
        WHEN 'intensifying' THEN 1
        WHEN 'developing' THEN 2
        WHEN 'spark' THEN 3
        ELSE 4
      END,
      i.updated_at DESC
  `;

  const queryParams = statusFilter && statusFilter !== 'all'
    ? [slug, statusFilter]
    : [slug];

  const { rows } = await query(baseQuery, queryParams);
  return NextResponse.json({ ideas: rows });
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
  const { title, content, origin, warmth, tags, created_by } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }
  if (!content?.trim()) {
    return NextResponse.json({ error: 'content is required (first iteration)' }, { status: 400 });
  }

  // Create idea
  const { rows: ideaRows } = await query(
    `INSERT INTO field_ideas
       (field_slug, title, summary, status, warmth, origin, tags, created_by)
     VALUES ($1, $2, $3, 'spark', $4, $5, $6, $7)
     RETURNING *`,
    [
      slug,
      title.trim(),
      content.trim().slice(0, 200), // summary = truncated first iteration
      warmth || 'low',
      origin || null,
      tags || [],
      created_by || null,
    ]
  );

  const idea = ideaRows[0];

  // Create first iteration
  const { rows: iterRows } = await query(
    `INSERT INTO field_idea_iterations (idea_id, version_number, content, author_id)
     VALUES ($1, 1, $2, $3)
     RETURNING *`,
    [idea.id, content.trim(), created_by || null]
  );

  return NextResponse.json({
    idea: { ...idea, latest_content: iterRows[0].content, latest_version: 1, iteration_count: 1 },
  }, { status: 201 });
}
