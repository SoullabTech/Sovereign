/**
 * GET    /api/book-studio/workbench/tables/[id]
 * PATCH  /api/book-studio/workbench/tables/[id]
 * DELETE /api/book-studio/workbench/tables/[id]
 *
 * Per-Table operations.
 *
 * GET resolves card content via source adapters before returning. The Table
 * layout stores pointers; clients receive groups with resolved content
 * attached to each card so the UI can render previews without a second roundtrip.
 *
 * PATCH body shape: { name?: string, layout?: TableLayout }
 *
 * DELETE is hard delete — no soft state.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireArranger } from '@/lib/workbench/access';
import { query } from '@/lib/db/postgres';
import { getSource } from '@/lib/workbench/sources';
import type { TableLayout, CardPointer } from '@/lib/workbench/sources/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface TableRow {
  id: string;
  name: string;
  layout: TableLayout;
  created_at: Date;
  updated_at: Date;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireArranger();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;

  const result = await query<TableRow>(
    `SELECT id, name, layout, created_at, updated_at
     FROM workbench_tables
     WHERE id = $1 AND arranger_id = $2`,
    [id, auth.memberId],
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const table = result.rows[0];

  // Resolve card content via source adapters.
  const resolvedGroups = await Promise.all(
    (table.layout.groups ?? []).map(async (g) => {
      const resolvedCards = await Promise.all(
        g.cards.map(async (c) => {
          const adapter = getSource(c.source);
          if (!adapter) return { ...c, resolved: null as null | { content: string; meta: Record<string, unknown> } };
          const resolved = await adapter.resolve(c.ref, auth.memberId);
          return { ...c, resolved };
        }),
      );
      return { ...g, cards: resolvedCards };
    }),
  );

  return NextResponse.json({
    table: {
      ...table,
      layout: { groups: resolvedGroups },
    },
  });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireArranger();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;

  let body: { name?: string; layout?: TableLayout };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const sets: string[] = [];
  const queryParams: unknown[] = [];

  if (typeof body.name === 'string') {
    const trimmed = body.name.trim();
    if (!trimmed) {
      return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    }
    queryParams.push(trimmed);
    sets.push(`name = $${queryParams.length}`);
  }
  if (body.layout && typeof body.layout === 'object') {
    if (!validateLayout(body.layout)) {
      return NextResponse.json({ error: 'Invalid layout shape' }, { status: 400 });
    }
    queryParams.push(JSON.stringify(body.layout));
    sets.push(`layout = $${queryParams.length}::jsonb`);
  }
  if (sets.length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  sets.push(`updated_at = NOW()`);
  queryParams.push(id);
  queryParams.push(auth.memberId);

  const result = await query<TableRow>(
    `UPDATE workbench_tables SET ${sets.join(', ')}
     WHERE id = $${queryParams.length - 1} AND arranger_id = $${queryParams.length}
     RETURNING id, name, layout, created_at, updated_at`,
    queryParams,
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ table: result.rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const auth = await requireArranger();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await params;

  const result = await query(
    `DELETE FROM workbench_tables
     WHERE id = $1 AND arranger_id = $2
     RETURNING id`,
    [id, auth.memberId],
  );
  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

/**
 * Shape check for an incoming layout.
 *
 * Placement ids must be unique across the whole table, and pile ids unique
 * across the table. A duplicated placement id is not a cosmetic problem: the
 * verbs address a card by its placement id, so two cards sharing one id makes
 * "move THIS card" ambiguous and React keys collide. The client generates ids
 * correctly; this refuses the case where it does not.
 *
 * Note what is deliberately NOT checked: a given {source, ref} may appear any
 * number of times, in one pile or many. That is Duplicate placement — one
 * capture the member has put in more than one place — and it is a member act,
 * not a malformed layout.
 */
function validateLayout(layout: unknown): layout is TableLayout {
  if (!layout || typeof layout !== 'object') return false;
  const groups = (layout as TableLayout).groups;
  if (!Array.isArray(groups)) return false;

  const groupIds = new Set<string>();
  const placementIds = new Set<string>();

  for (const g of groups) {
    if (!g || typeof g !== 'object') return false;
    if (typeof g.id !== 'string' || typeof g.name !== 'string') return false;
    if (groupIds.has(g.id)) return false;
    groupIds.add(g.id);
    if (!Array.isArray(g.cards)) return false;
    for (const c of g.cards as CardPointer[]) {
      if (!c || typeof c !== 'object') return false;
      if (typeof c.id !== 'string' || typeof c.source !== 'string' || typeof c.ref !== 'string') {
        return false;
      }
      if (placementIds.has(c.id)) return false;
      placementIds.add(c.id);
    }
  }
  return true;
}
