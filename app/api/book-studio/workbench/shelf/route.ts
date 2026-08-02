/**
 * GET /api/book-studio/workbench/shelf
 *
 * Query the Shelf — fans out across enabled source adapters and merges
 * results sorted by createdAt DESC.
 *
 * Query params:
 *   text   — free-text search
 *   source — restrict to a single source kind (otherwise all enabled)
 *   from   — ISO date lower bound
 *   to     — ISO date upper bound
 *   tag    — capture tag (where supported)
 *
 * The source set is chosen by the caller's role, not by the caller's request:
 * founder searches `uploaded` (unchanged from Slice 1), member searches `keep`.
 * A `?source=` param can only NARROW that set, never widen it.
 *
 * Sanctuary filtering happens inside each adapter, not here. This route is
 * a pure fan-out + sort.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireArranger } from '@/lib/workbench/access';
import { sourcesForRole } from '@/lib/workbench/sources';
import type { WorkbenchSourceKind, WorkbenchCardRef } from '@/lib/workbench/sources/types';

export const dynamic = 'force-dynamic';

const VALID_SOURCES: WorkbenchSourceKind[] = [
  'uploaded',
  'ideas',
  'keep',
  'journals',
  'decisions',
];

export async function GET(req: NextRequest) {
  const auth = await requireArranger();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const sp = req.nextUrl.searchParams;
  const text = sp.get('text') ?? undefined;
  const from = sp.get('from') ?? undefined;
  const to = sp.get('to') ?? undefined;
  const tag = sp.get('tag') ?? undefined;
  const sourceParam = sp.get('source');

  // Role decides the ceiling; `?source=` may only narrow within it.
  let sources = sourcesForRole(auth.role);
  if (sourceParam) {
    if (!VALID_SOURCES.includes(sourceParam as WorkbenchSourceKind)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }
    sources = sources.filter((s) => s.kind === sourceParam);
  }

  const query = {
    arrangerId: auth.memberId,
    text,
    from,
    to,
    tag,
  };

  const results = await Promise.all(
    sources.map(async (s) => {
      try {
        return await s.search(query);
      } catch (err) {
        console.error(`[WorkbenchShelf] ${s.kind} failed:`, err);
        return [] as WorkbenchCardRef[];
      }
    }),
  );

  const cards = results
    .flat()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 300);

  return NextResponse.json({
    cards,
    enabledSources: sources.map((s) => s.kind),
  });
}
