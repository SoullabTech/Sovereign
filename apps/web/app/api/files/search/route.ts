import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';import { getServerSession } from 'next-auth';
// Temporarily stub out backend imports that are excluded from build
// import { searchUserFiles } from '@/backend/src/services/IngestionQueue';
import { OpenAI } from 'openai';

// Stub searchUserFiles
const searchUserFiles = async (userId: string, query: string, limit: number) => {
  return [] as Array<{
    id: string;
    fileName: string;
    content: string;
    similarity: number;
    createdAt: string;
    summary?: string;
    keyTopics?: string[];
    emotionalTone?: string;
    elementalResonance?: string;
    metadata?: any;
  }>;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface SearchResult {
  id: string;
  fileName: string;
  content: string;
  summary: string;
  keyTopics: string[];
  emotionalTone: string;
  elementalResonance: string;
  similarity: number;
  uploadedAt: string;
  citation: {
    fileName: string;
    uploadDate: string;
    relevantSection: string;
    confidence: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request
    const body = await req.json();
    const { query, limit = 5, threshold = 0.7 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const userId = session.user.email || "anonymous";

    // Search files using semantic similarity
    const rawResults = await searchUserFiles(userId, query, limit * 2); // Get more to filter

    // Filter by similarity threshold and format results
    const formattedResults: SearchResult[] = rawResults
      .filter(result => result.similarity >= threshold)
      .slice(0, limit)
      .map(result => {
        const uploadDate = new Date(result.createdAt).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short', 
          day: 'numeric'
        });

        // Extract relevant section (first sentence that might match the query)
        const relevantSection = extractRelevantSection(result.content, query);

        return {
          id: result.id,
          fileName: result.fileName,
          content: result.content,
          summary: result.summary || '',
          keyTopics: result.keyTopics || [],
          emotionalTone: result.emotionalTone || 'neutral',
          elementalResonance: result.elementalResonance || 'aether',
          similarity: result.similarity,
          uploadedAt: result.createdAt,
          citation: {
            fileName: result.fileName,
            uploadDate,
            relevantSection,
            confidence: result.similarity
          }
        };
      });

    // If no results, try broader search with lower threshold
    let alternativeResults: SearchResult[] = [];
    if (formattedResults.length === 0 && threshold > 0.5) {
      const broaderResults = await searchUserFiles(userId, query, 3);
      alternativeResults = broaderResults
        .filter(result => result.similarity >= 0.5)
        .map(result => ({
          id: result.id,
          fileName: result.fileName,
          content: result.content,
          summary: result.summary || '',
          keyTopics: result.keyTopics || [],
          emotionalTone: result.emotionalTone || 'neutral',
          elementalResonance: result.elementalResonance || 'aether',
          similarity: result.similarity,
          uploadedAt: result.createdAt,
          citation: {
            fileName: result.fileName,
            uploadDate: new Date(result.createdAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short', 
              day: 'numeric'
            }),
            relevantSection: extractRelevantSection(result.content, query),
            confidence: result.similarity
          }
        }));
    }

    return NextResponse.json({
      query,
      results: formattedResults,
      alternativeResults: formattedResults.length === 0 ? alternativeResults : [],
      metadata: {
        totalFound: formattedResults.length + alternativeResults.length,
        threshold,
        searchTime: new Date().toISOString(),
        hasHighConfidence: formattedResults.some(r => r.similarity > 0.85)
      }
    });

  } catch (error) {
    console.error('File search error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Extract most relevant section from file content based on query
 */
function extractRelevantSection(content: string, query: string): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Simple relevance scoring based on keyword overlap
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
  
  let bestSentence = sentences[0] || '';
  let bestScore = 0;
  
  for (const sentence of sentences.slice(0, 20)) { // Check first 20 sentences
    const sentenceWords = sentence.toLowerCase().split(' ');
    const score = queryWords.reduce((acc, word) => {
      return acc + (sentenceWords.some(sw => sw.includes(word)) ? 1 : 0);
    }, 0);
    
    if (score > bestScore) {
      bestScore = score;
      bestSentence = sentence;
    }
  }
  
  // Clean and truncate
  const cleaned = bestSentence.trim();
  return cleaned.length > 200 
    ? cleaned.substring(0, 200) + '...' 
    : cleaned;
}

// GET endpoint for testing
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  // Redirect to POST with query
  return POST(new NextRequest(req.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  }));
}