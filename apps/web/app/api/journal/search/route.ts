import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { semanticSearch } from '@/lib/semantic/index';
import { mem0 } from '@/lib/memory/mem0';

export async function POST(req: NextRequest) {
  try {
    const { userId, query, type, limit } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const searchType = type || 'journal';
    const searchLimit = limit || 10;

    let results;

    if (searchType === 'journal') {
      results = await semanticSearch.searchJournalEntries(
        userId || 'beta-user',
        query,
        searchLimit
      );
    } else if (searchType === 'memory') {
      results = await semanticSearch.searchMemories(
        userId || 'beta-user',
        query,
        searchLimit
      );
    } else if (searchType === 'theme') {
      const threadResults = await semanticSearch.findThematicThreads(
        userId || 'beta-user',
        query
      );
      return NextResponse.json({
        success: true,
        type: 'thematic_threads',
        threads: threadResults.threads,
        summary: threadResults.summary
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid search type. Use: journal, memory, or theme' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      type: searchType,
      query,
      results: results.entries,
      summary: results.thematicSummary,
      relatedSymbols: results.relatedSymbols,
      relatedArchetypes: results.relatedArchetypes
    });

  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'beta-user';
  const symbol = searchParams.get('symbol');
  const archetype = searchParams.get('archetype');

  if (symbol) {
    const narrative = await mem0.getSymbolicNarrative(userId, symbol);
    return NextResponse.json({
      success: true,
      symbol,
      narrative
    });
  }

  if (archetype) {
    const patterns = await mem0.getRecentPatterns(userId, 30);
    return NextResponse.json({
      success: true,
      archetype,
      patterns
    });
  }

  return NextResponse.json({
    endpoint: '/api/journal/search',
    methods: {
      POST: {
        description: 'Semantic search across journal entries or memories',
        parameters: {
          query: 'Natural language search query (required)',
          userId: 'User ID (optional, default: beta-user)',
          type: 'Search type: journal, memory, or theme (optional, default: journal)',
          limit: 'Number of results (optional, default: 10)'
        }
      },
      GET: {
        description: 'Get symbolic narrative or archetype patterns',
        parameters: {
          userId: 'User ID (optional, default: beta-user)',
          symbol: 'Symbol name to get narrative',
          archetype: 'Archetype name to get patterns'
        }
      }
    },
    examples: {
      searchJournal: 'POST with { "query": "Have I written about rebirth?", "type": "journal" }',
      searchMemory: 'POST with { "query": "transitions", "type": "memory" }',
      findThreads: 'POST with { "query": "grief", "type": "theme" }',
      getSymbol: 'GET with ?symbol=river',
      getArchetype: 'GET with ?archetype=Seeker'
    }
  });
}