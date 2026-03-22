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
  const statusFilter = url.searchParams.get('status'); // 'open' | 'decided' | 'deferred' | 'superseded' | 'all' | null

  let queryText: string;
  let queryParams: (string | null)[];

  if (!statusFilter || statusFilter === 'all') {
    queryText = `
      SELECT id, field_slug, title, context, recommendation, owner, status,
             deadline, decided_at, decided_by, tags, created_by, created_at, updated_at
      FROM field_decisions
      WHERE field_slug = $1
      ORDER BY
        CASE status WHEN 'open' THEN 0 WHEN 'deferred' THEN 1 WHEN 'decided' THEN 2 ELSE 3 END,
        created_at DESC
    `;
    queryParams = [slug];
  } else {
    queryText = `
      SELECT id, field_slug, title, context, recommendation, owner, status,
             deadline, decided_at, decided_by, tags, created_by, created_at, updated_at
      FROM field_decisions
      WHERE field_slug = $1 AND status = $2
      ORDER BY created_at DESC
    `;
    queryParams = [slug, statusFilter];
  }

  const { rows } = await query(queryText, queryParams);
  return NextResponse.json({ decisions: rows });
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
  const { title, context, recommendation, owner, status, deadline, tags, created_by } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const { rows } = await query(
    `INSERT INTO field_decisions
       (field_slug, title, context, recommendation, owner, status, deadline, tags, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      slug,
      title.trim(),
      context || null,
      recommendation || null,
      owner || null,
      status || 'open',
      deadline || null,
      tags || [],
      created_by || null,
    ]
  );

  return NextResponse.json({ decision: rows[0] }, { status: 201 });
}
