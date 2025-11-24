import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { ObsidianVaultBridge } from '../../../../../../lib/bridges/obsidian-vault-bridge';

export async function POST(request: NextRequest) {
  try {
    const { query, filter, maxResults = 10 } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    // Initialize vault bridge
    const vaultBridge = new ObsidianVaultBridge();

    let results = [];

    // Perform search based on filter
    switch (filter) {
      case 'framework':
        const frameworks = await vaultBridge.getFrameworks();
        results = frameworks.filter(note =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase())
        ).slice(0, maxResults);
        break;

      case 'concept':
        const concepts = await vaultBridge.getConcepts();
        results = concepts.filter(note =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase())
        ).slice(0, maxResults);
        break;

      case 'practice':
        const practices = await vaultBridge.getPractices();
        results = practices.filter(note =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase())
        ).slice(0, maxResults);
        break;

      case 'integration':
        const integrations = await vaultBridge.getIntegrations();
        results = integrations.filter(note =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase())
        ).slice(0, maxResults);
        break;

      case 'book':
        const books = await vaultBridge.getBookContent();
        results = books.filter(note =>
          note.title.toLowerCase().includes(query.toLowerCase()) ||
          note.content.toLowerCase().includes(query.toLowerCase())
        ).slice(0, maxResults);
        break;

      default: // 'all'
        const searchResult = await vaultBridge.query({
          context: query,
          semanticSearch: true,
          maxResults
        });
        results = searchResult.knowledge;
        break;
    }

    // Add relevance scores for display
    results = results.map(note => ({
      ...note,
      relevance: calculateRelevance(query, note.content)
    }));

    // Sort by relevance
    results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    return NextResponse.json({
      success: true,
      results,
      query,
      filter,
      total: results.length
    });

  } catch (error) {
    console.error('Vault search failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    }, { status: 500 });
  }
}

// Simple relevance calculation
function calculateRelevance(query: string, content: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();

  let score = 0;
  queryWords.forEach(word => {
    const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
    score += matches;
  });

  // Normalize by content length and query words
  return Math.min(score / (queryWords.length * 10), 1);
}