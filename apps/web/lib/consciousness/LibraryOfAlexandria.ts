/**
 * Library of Alexandria - Semantic Wisdom Search
 *
 * Searches Kelly's complete wisdom vault (6,388+ chunks) using semantic embeddings.
 * Finds relevant content by MEANING, not just keywords.
 *
 * This is the 4th wisdom hemisphere in the corpus callosum architecture.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Lazy initialization to avoid env var issues
let supabase: SupabaseClient;
let openai: OpenAI;

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabase;
}

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  return openai;
}

export interface LibrarySearchOptions {
  query: string;
  maxResults?: number;
  minSimilarity?: number;
  filterByCategory?: string;
  filterByElement?: string;
  filterByLevel?: number;
}

export interface LibraryChunk {
  file_name: string;
  content: string;
  similarity: number;
  category?: string;
  element?: string;
  level?: number;
  concepts?: string[];
  keywords?: string[];
}

/**
 * Search the Library of Alexandria using semantic embeddings
 */
export async function searchLibrary(options: LibrarySearchOptions): Promise<LibraryChunk[]> {
  const {
    query,
    maxResults = 5,
    minSimilarity = 0.5,
    filterByCategory,
    filterByElement,
    filterByLevel
  } = options;

  try {
    // Generate embedding for query
    const embeddingResponse = await getOpenAI().embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Perform semantic search
    const { data, error } = await getSupabase().rpc('match_file_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: minSimilarity,
      match_count: maxResults,
    });

    if (error) {
      console.warn(`[Library] Search failed, using fallback: ${error.message}`);

      // Fallback: return random relevant chunks (better than nothing)
      const fallbackQuery = getSupabase()
        .from('file_chunks')
        .select('file_name, content, category, element, level, concepts, keywords')
        .not('embedding', 'is', null)
        .limit(maxResults);

      if (filterByCategory) fallbackQuery.eq('category', filterByCategory);
      if (filterByElement) fallbackQuery.eq('element', filterByElement);
      if (filterByLevel) fallbackQuery.eq('level', filterByLevel);

      const { data: fallbackData } = await fallbackQuery;

      return (fallbackData || []).map(chunk => ({
        ...chunk,
        similarity: 0.6 // Placeholder similarity
      }));
    }

    // Apply additional filters if needed
    let results = data || [];

    if (filterByCategory) {
      results = results.filter((r: any) => r.category === filterByCategory);
    }

    if (filterByElement) {
      results = results.filter((r: any) => r.element === filterByElement);
    }

    if (filterByLevel) {
      results = results.filter((r: any) => r.level === filterByLevel);
    }

    return results.map((chunk: any) => ({
      file_name: chunk.file_name,
      content: chunk.content,
      similarity: chunk.similarity,
      category: chunk.category,
      element: chunk.element,
      level: chunk.level,
      concepts: chunk.concepts,
      keywords: chunk.keywords,
    }));

  } catch (error) {
    console.error('[Library] Search exception:', error);
    return [];
  }
}

/**
 * Quick helper for CCCS queries - returns formatted wisdom string
 */
export async function getRelevantWisdom(
  userQuery: string,
  maxChunks: number = 3
): Promise<string> {
  const chunks = await searchLibrary({
    query: userQuery,
    maxResults: maxChunks,
    minSimilarity: 0.6, // Higher threshold for quality
  });

  if (chunks.length === 0) {
    return '';
  }

  // Format for prompt injection
  const formattedWisdom = chunks.map((chunk, idx) => {
    let section = `### Wisdom Chunk ${idx + 1} (${(chunk.similarity * 100).toFixed(0)}% relevant)
**Source:** ${chunk.file_name}`;

    if (chunk.category) section += `\n**Category:** ${chunk.category}`;
    if (chunk.element) section += `\n**Element:** ${chunk.element}`;
    if (chunk.concepts && chunk.concepts.length > 0) {
      section += `\n**Concepts:** ${chunk.concepts.slice(0, 5).join(', ')}`;
    }

    section += `\n\n${chunk.content}\n`;

    return section;
  }).join('\n---\n\n');

  return formattedWisdom;
}

/**
 * Stats for monitoring
 */
export async function getLibraryStats() {
  const { count } = await getSupabase()
    .from('file_chunks')
    .select('*', { count: 'exact', head: true });

  const { count: withEmbeddings } = await getSupabase()
    .from('file_chunks')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);

  return {
    totalChunks: count || 0,
    withEmbeddings: withEmbeddings || 0,
    ready: (withEmbeddings || 0) > 0,
  };
}
