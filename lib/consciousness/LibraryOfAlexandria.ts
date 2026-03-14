/**
 * Library of Alexandria — Adapter
 *
 * LEGACY ADAPTER: This module previously used Supabase + OpenAI (both prohibited).
 * It now delegates to LibraryService (local PostgreSQL + Ollama).
 *
 * Downstream consumers (ResonanceField.ts, ProgressiveWisdomInjection.ts)
 * import searchLibrary and LibraryChunk from here. This adapter preserves
 * that interface while routing through the sovereign infrastructure.
 *
 * See: lib/library/LibraryService.ts for the canonical implementation.
 */

import { libraryService } from '@/lib/library/LibraryService';

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
 * Search the Library of Alexandria using semantic embeddings.
 * Delegates to LibraryService (local PostgreSQL + Ollama).
 */
export async function searchLibrary(options: LibrarySearchOptions): Promise<LibraryChunk[]> {
  const {
    query,
    maxResults = 5,
    filterByElement,
  } = options;

  try {
    const context = await libraryService.search(query, {
      limit: maxResults,
      mode: 'deep',
    });

    // Map LibrarySearchResult → legacy LibraryChunk interface
    let results: LibraryChunk[] = context.chunks.map(chunk => ({
      file_name: chunk.title || chunk.file_path || 'unknown',
      content: chunk.excerpt,
      similarity: chunk.score,
      category: chunk.meta?.domain,
      element: chunk.meta?.element,
      level: chunk.meta?.phase,
    }));

    // Apply legacy element filter if specified
    if (filterByElement) {
      results = results.filter(r => r.element === filterByElement);
    }

    return results;
  } catch (error) {
    console.error('[Library] Search exception:', error);
    return [];
  }
}

/**
 * Quick helper for queries — returns formatted wisdom string.
 */
export async function getRelevantWisdom(
  userQuery: string,
  maxChunks: number = 3
): Promise<string> {
  const chunks = await searchLibrary({
    query: userQuery,
    maxResults: maxChunks,
    minSimilarity: 0.6,
  });

  if (chunks.length === 0) {
    return '';
  }

  const formattedWisdom = chunks.map((chunk, idx) => {
    let section = `### Wisdom Chunk ${idx + 1} (${(chunk.similarity * 100).toFixed(0)}% relevant)
**Source:** ${chunk.file_name}`;

    if (chunk.category) section += `\n**Category:** ${chunk.category}`;
    if (chunk.element) section += `\n**Element:** ${chunk.element}`;

    section += `\n\n${chunk.content}\n`;

    return section;
  }).join('\n---\n\n');

  return formattedWisdom;
}

/**
 * Stats for monitoring — delegates to LibraryService.
 */
export async function getLibraryStats() {
  try {
    const stats = await libraryService.getStats();
    return {
      totalChunks: stats.chunks,
      withEmbeddings: stats.chunks, // All chunks have embeddings in new system
      ready: stats.chunks > 0,
    };
  } catch (error) {
    return {
      totalChunks: 0,
      withEmbeddings: 0,
      ready: false,
    };
  }
}
