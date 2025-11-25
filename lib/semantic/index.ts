/**
 * Semantic Search for Journal Entries & Memories
 * "Have I written about rebirth before?" → finds thematically similar entries
 */

import { OpenAI } from 'openai';
import { journalStorage, StoredJournalEntry } from '../storage/journal-storage';
import { mem0, MemoryEntry } from '../memory/mem0';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface SemanticSearchResult {
  entries: Array<{
    entry: StoredJournalEntry | MemoryEntry;
    relevanceScore: number;
    matchReason: string;
  }>;
  thematicSummary: string;
  relatedSymbols: string[];
  relatedArchetypes: string[];
}

export class SemanticSearch {
  async searchJournalEntries(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<SemanticSearchResult> {
    const entries = journalStorage.getEntries(userId);

    if (entries.length === 0) {
      return {
        entries: [],
        thematicSummary: 'No journal entries found.',
        relatedSymbols: [],
        relatedArchetypes: []
      };
    }

    const embeddings = await this.generateQueryEmbedding(query);

    const scoredEntries = await Promise.all(
      entries.map(async (entry) => {
        const entryText = `${entry.entry}\nSymbols: ${entry.reflection.symbols.join(', ')}\nArchetypes: ${entry.reflection.archetypes.join(', ')}\nEmotion: ${entry.reflection.emotionalTone}`;
        const entryEmbedding = await this.generateQueryEmbedding(entryText);
        const relevanceScore = this.cosineSimilarity(embeddings, entryEmbedding);
        const matchReason = await this.generateMatchReason(query, entry);

        return {
          entry,
          relevanceScore,
          matchReason
        };
      })
    );

    const sortedResults = scoredEntries
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    const relatedSymbols = this.extractUniqueSymbols(sortedResults.map(r => r.entry));
    const relatedArchetypes = this.extractUniqueArchetypes(sortedResults.map(r => r.entry));

    const thematicSummary = await this.generateThematicSummary(query, sortedResults);

    return {
      entries: sortedResults,
      thematicSummary,
      relatedSymbols,
      relatedArchetypes
    };
  }

  async searchMemories(
    userId: string,
    query: string,
    limit: number = 10
  ): Promise<SemanticSearchResult> {
    const memories = await mem0.getMemory(userId);

    if (memories.length === 0) {
      return {
        entries: [],
        thematicSummary: 'No memories found.',
        relatedSymbols: [],
        relatedArchetypes: []
      };
    }

    const embeddings = await this.generateQueryEmbedding(query);

    const scoredMemories = await Promise.all(
      memories.map(async (memory) => {
        const memoryText = `${memory.content}\n${memory.metadata.symbol || ''}\n${memory.metadata.archetype || ''}\n${memory.metadata.emotion || ''}`;
        const memoryEmbedding = await this.generateQueryEmbedding(memoryText);
        const relevanceScore = this.cosineSimilarity(embeddings, memoryEmbedding);
        const matchReason = `Matched on: ${memory.type}`;

        return {
          entry: memory,
          relevanceScore,
          matchReason
        };
      })
    );

    const sortedResults = scoredMemories
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    const relatedSymbols = sortedResults
      .map(r => (r.entry as MemoryEntry).metadata.symbol)
      .filter(Boolean) as string[];

    const relatedArchetypes = sortedResults
      .map(r => (r.entry as MemoryEntry).metadata.archetype)
      .filter(Boolean) as string[];

    const thematicSummary = await this.generateMemoryThematicSummary(query, sortedResults);

    return {
      entries: sortedResults,
      thematicSummary,
      relatedSymbols: [...new Set(relatedSymbols)],
      relatedArchetypes: [...new Set(relatedArchetypes)]
    };
  }

  async findThematicThreads(
    userId: string,
    theme: string
  ): Promise<{
    threads: Array<{
      entries: StoredJournalEntry[];
      theme: string;
      evolution: string;
    }>;
    summary: string;
  }> {
    const results = await this.searchJournalEntries(userId, theme, 20);

    const threads = this.groupByTheme(results.entries.map(e => e.entry as StoredJournalEntry));

    const summary = await this.generateThreadSummary(theme, threads);

    return {
      threads,
      summary
    };
  }

  private async generateQueryEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 8000)
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      return Array(1536).fill(0);
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async generateMatchReason(query: string, entry: StoredJournalEntry): Promise<string> {
    const symbols = entry.reflection.symbols.slice(0, 3).join(', ');
    const archetypes = entry.reflection.archetypes.slice(0, 2).join(', ');
    return `Symbols: ${symbols}. Archetypes: ${archetypes}.`;
  }

  private extractUniqueSymbols(entries: (StoredJournalEntry | MemoryEntry)[]): string[] {
    const symbols = new Set<string>();
    entries.forEach(entry => {
      if ('reflection' in entry) {
        entry.reflection.symbols.forEach(s => symbols.add(s));
      } else if ('metadata' in entry && entry.metadata.symbol) {
        symbols.add(entry.metadata.symbol);
      }
    });
    return Array.from(symbols);
  }

  private extractUniqueArchetypes(entries: (StoredJournalEntry | MemoryEntry)[]): string[] {
    const archetypes = new Set<string>();
    entries.forEach(entry => {
      if ('reflection' in entry) {
        entry.reflection.archetypes.forEach(a => archetypes.add(a));
      } else if ('metadata' in entry && entry.metadata.archetype) {
        archetypes.add(entry.metadata.archetype);
      }
    });
    return Array.from(archetypes);
  }

  private async generateThematicSummary(
    query: string,
    results: Array<{ entry: StoredJournalEntry | MemoryEntry; relevanceScore: number }>
  ): Promise<string> {
    if (results.length === 0) {
      return `No entries found related to: ${query}`;
    }

    const symbolCount = this.extractUniqueSymbols(results.map(r => r.entry)).length;
    const archetypeCount = this.extractUniqueArchetypes(results.map(r => r.entry)).length;

    return `Found ${results.length} entries related to "${query}". Discovered ${symbolCount} unique symbols and ${archetypeCount} archetypes across these reflections.`;
  }

  private async generateMemoryThematicSummary(
    query: string,
    results: Array<{ entry: MemoryEntry; relevanceScore: number }>
  ): Promise<string> {
    if (results.length === 0) {
      return `No memories found related to: ${query}`;
    }

    return `Found ${results.length} memory threads related to "${query}".`;
  }

  private groupByTheme(entries: StoredJournalEntry[]): Array<{
    entries: StoredJournalEntry[];
    theme: string;
    evolution: string;
  }> {
    const symbolGroups = new Map<string, StoredJournalEntry[]>();

    entries.forEach(entry => {
      entry.reflection.symbols.forEach(symbol => {
        const existing = symbolGroups.get(symbol) || [];
        existing.push(entry);
        symbolGroups.set(symbol, existing);
      });
    });

    return Array.from(symbolGroups.entries()).map(([symbol, groupEntries]) => ({
      entries: groupEntries,
      theme: symbol,
      evolution: `The ${symbol} appeared ${groupEntries.length} times across your journey.`
    }));
  }

  private async generateThreadSummary(
    theme: string,
    threads: Array<{ entries: StoredJournalEntry[]; theme: string }>
  ): Promise<string> {
    const totalEntries = threads.reduce((sum, t) => sum + t.entries.length, 0);
    return `Discovered ${threads.length} symbolic threads related to "${theme}", spanning ${totalEntries} journal entries.`;
  }
}

export const semanticSearch = new SemanticSearch();