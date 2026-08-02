/**
 * GET  /api/book-studio/workbench/tables
 * POST /api/book-studio/workbench/tables
 *
 * List or create Tables for the current arranger. v0 UI ships with a single
 * persistent Table, but the schema and API support many — adding multi-table
 * UI later costs nothing.
 *
 * POST body shape: { name?: string }
 *   Default name is 'Untitled table'. Empty layout: { groups: [] }.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireArranger } from '@/lib/workbench/access';
import { query } from '@/lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const auth = await requireArranger();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await query(
    `SELECT id, name, layout, created_at, updated_at
     FROM workbench_tables
     WHERE arranger_id = $1
     ORDER BY updated_at DESC`,
    [auth.memberId],
  );

  return NextResponse.json({ tables: result.rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireArranger();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { name?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine — accept defaults.
  }

  const name = (body.name ?? '').trim() || 'Untitled table';

  const result = await query(
    `INSERT INTO workbench_tables (arranger_id, name)
     VALUES ($1, $2)
     RETURNING id, name, layout, created_at, updated_at`,
    [auth.memberId, name],
  );

  return NextResponse.json({ table: result.rows[0] }, { status: 201 });
}
