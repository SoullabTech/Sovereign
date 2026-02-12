export const dynamic = 'force-dynamic';

/**
 * GET /api/iching/search?q=keyword — Search hexagrams
 *
 * Searches hexagrams by keyword in name, english name, keywords, and texts.
 * Also supports filtering by change type.
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { searchHexagrams, getHexagramsByChangeType, getAllHexagrams } from '@/lib/iching/lookup';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const changeType = searchParams.get('changeType');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 64);

    let results;

    if (changeType) {
      results = getHexagramsByChangeType(changeType);
    } else if (query.trim()) {
      results = searchHexagrams(query);
    } else {
      results = getAllHexagrams();
    }

    // Return compact representation
    const hexagrams = results.slice(0, limit).map(h => ({
      number: h.number,
      name: h.name,
      english: h.english,
      character: h.character,
      element: h.element,
      changeType: h.changeType,
      keywords: h.keywords,
      lines: h.lines.map(l => ({ position: l.position, isYang: l.isYang })),
    }));

    return NextResponse.json({ hexagrams, total: results.length });
  } catch (error) {
    console.error('[I Ching] Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
