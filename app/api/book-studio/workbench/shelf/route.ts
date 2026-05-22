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
 * Slice 1 enables only `uploaded`. Slice 3 lights up the remaining sources
 * via lib/workbench/sources/index.ts — no changes to this route required.
 *
 * Sanctuary filtering happens inside each adapter, not here. This route is
 * a pure fan-out + sort.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireFounder } from '@/lib/founder/founderAuth';
import { enabledSources, getSource } from '@/lib/workbench/sources';
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
  const auth = await requireFounder();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const sp = req.nextUrl.searchParams;
  const text = sp.get('text') ?? undefined;
  const from = sp.get('from') ?? undefined;
  const to = sp.get('to') ?? undefined;
  const tag = sp.get('tag') ?? undefined;
  const sourceParam = sp.get('source');

  let sources = enabledSources();
  if (sourceParam) {
    if (!VALID_SOURCES.includes(sourceParam as WorkbenchSourceKind)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }
    const single = getSource(sourceParam as WorkbenchSourceKind);
    sources = single ? [single] : [];
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
