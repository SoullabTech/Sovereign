/**
 * Pinecone Vector Store for Archetypal Indexing
 * "SoulMap" - tracks user's symbolic evolution in vector space
 */

import { OpenAI } from 'openai';
import { StoredJournalEntry } from '../storage/journal-storage';
import { MemoryEntry } from '../memory/mem0';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface VectorMetadata {
  userId: string;
  entryId: string;
  type: 'journal' | 'memory' | 'dream' | 'ritual';
  timestamp: string;
  symbols: string[];
  archetypes: string[];
  emotions: string[];
  mode?: string;
  moonPhase?: string;
  element?: string;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

export interface ArchetypalEvolution {
  archetype: string;
  timeline: Array<{
    date: string;
    intensity: number;
    context: string;
  }>;
  evolution: string;
}

class SoulIndex {
  private vectors: Map<string, { vector: number[]; metadata: VectorMetadata }>;
  private pineconeEnabled: boolean;

  constructor() {
    this.vectors = new Map();
    this.pineconeEnabled = !!process.env.PINECONE_API_KEY;

    if (!this.pineconeEnabled) {
      console.warn('Pinecone not configured - using in-memory vector store');
    }
  }

  async indexJournalEntry(entry: StoredJournalEntry): Promise<void> {
    const text = this.createIndexText(entry);
    const vector = await this.generateEmbedding(text);

    const metadata: VectorMetadata = {
      userId: entry.userId,
      entryId: entry.id,
      type: 'journal',
      timestamp: entry.timestamp,
      symbols: entry.reflection.symbols,
      archetypes: entry.reflection.archetypes,
      emotions: [entry.reflection.emotionalTone],
      mode: entry.mode,
      element: entry.element
    };

    const id = `journal_${entry.id}`;

    if (this.pineconeEnabled) {
      await this.upsertToPinecone(id, vector, metadata);
    } else {
      this.vectors.set(id, { vector, metadata });
    }
  }

  async indexMemory(memory: MemoryEntry): Promise<void> {
    const text = `${memory.content} ${memory.metadata.symbol || ''} ${memory.metadata.archetype || ''} ${memory.metadata.emotion || ''}`;
    const vector = await this.generateEmbedding(text);

    const metadata: VectorMetadata = {
      userId: memory.userId,
      entryId: memory.id,
      type: 'memory',
      timestamp: memory.timestamp,
      symbols: memory.metadata.symbol ? [memory.metadata.symbol] : [],
      archetypes: memory.metadata.archetype ? [memory.metadata.archetype] : [],
      emotions: memory.metadata.emotion ? [memory.metadata.emotion] : []
    };

    const id = `memory_${memory.id}`;

    if (this.pineconeEnabled) {
      await this.upsertToPinecone(id, vector, metadata);
    } else {
      this.vectors.set(id, { vector, metadata });
    }
  }

  async searchByArchetype(
    userId: string,
    archetype: string,
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    const query = `Exploring the ${archetype} archetype and its manifestations`;
    const queryVector = await this.generateEmbedding(query);

    if (this.pineconeEnabled) {
      return await this.searchPinecone(queryVector, {
        userId,
        archetypes: [archetype]
      }, limit);
    } else {
      return this.searchInMemory(queryVector, { userId, archetypes: [archetype] }, limit);
    }
  }

  async searchBySymbol(
    userId: string,
    symbol: string,
    limit: number = 10
  ): Promise<VectorSearchResult[]> {
    const query = `Understanding the ${symbol} symbol and its meaning`;
    const queryVector = await this.generateEmbedding(query);

    if (this.pineconeEnabled) {
      return await this.searchPinecone(queryVector, {
        userId,
        symbols: [symbol]
      }, limit);
    } else {
      return this.searchInMemory(queryVector, { userId, symbols: [symbol] }, limit);
    }
  }

  async getArchetypalEvolution(
    userId: string,
    archetype: string
  ): Promise<ArchetypalEvolution> {
    const results = await this.searchByArchetype(userId, archetype, 50);

    const timeline = results.map(result => ({
      date: result.metadata.timestamp,
      intensity: result.score,
      context: result.metadata.type
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const evolution = this.generateEvolutionNarrative(archetype, timeline);

    return {
      archetype,
      timeline,
      evolution
    };
  }

  async getSoulMap(userId: string): Promise<{
    dominantSymbols: Array<{ symbol: string; strength: number }>;
    archetypalSignature: Array<{ archetype: string; strength: number }>;
    emotionalLandscape: Array<{ emotion: string; frequency: number }>;
    temporalPatterns: {
      morningJournaling: number;
      eveningReflection: number;
      dreamRecording: number;
    };
  }> {
    const allVectors = this.pineconeEnabled
      ? await this.getAllUserVectors(userId)
      : Array.from(this.vectors.values())
          .filter(v => v.metadata.userId === userId)
          .map((v, i) => ({ id: `vec_${i}`, score: 1, metadata: v.metadata }));

    const symbolCounts = new Map<string, number>();
    const archetypeCounts = new Map<string, number>();
    const emotionCounts = new Map<string, number>();

    allVectors.forEach(vec => {
      vec.metadata.symbols.forEach(s => {
        symbolCounts.set(s, (symbolCounts.get(s) || 0) + vec.score);
      });
      vec.metadata.archetypes.forEach(a => {
        archetypeCounts.set(a, (archetypeCounts.get(a) || 0) + vec.score);
      });
      vec.metadata.emotions.forEach(e => {
        emotionCounts.set(e, (emotionCounts.get(e) || 0) + 1);
      });
    });

    return {
      dominantSymbols: Array.from(symbolCounts.entries())
        .map(([symbol, strength]) => ({ symbol, strength }))
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 10),
      archetypalSignature: Array.from(archetypeCounts.entries())
        .map(([archetype, strength]) => ({ archetype, strength }))
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 5),
      emotionalLandscape: Array.from(emotionCounts.entries())
        .map(([emotion, frequency]) => ({ emotion, frequency }))
        .sort((a, b) => b.frequency - a.frequency),
      temporalPatterns: {
        morningJournaling: 0,
        eveningReflection: 0,
        dreamRecording: 0
      }
    };
  }

  private async generateEmbedding(text: string): Promise<number[]> {
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

  private createIndexText(entry: StoredJournalEntry): string {
    return `${entry.entry}\n\nSymbols: ${entry.reflection.symbols.join(', ')}\nArchetypes: ${entry.reflection.archetypes.join(', ')}\nEmotion: ${entry.reflection.emotionalTone}\nReflection: ${entry.reflection.reflection}`;
  }

  private async upsertToPinecone(
    id: string,
    vector: number[],
    metadata: VectorMetadata
  ): Promise<void> {
    console.log(`[SoulIndex] Would upsert to Pinecone: ${id} (Pinecone not configured)`);
  }

  private async searchPinecone(
    queryVector: number[],
    filter: Partial<VectorMetadata>,
    limit: number
  ): Promise<VectorSearchResult[]> {
    console.log(`[SoulIndex] Would search Pinecone (not configured)`);
    return [];
  }

  private searchInMemory(
    queryVector: number[],
    filter: Partial<VectorMetadata>,
    limit: number
  ): VectorSearchResult[] {
    const results: VectorSearchResult[] = [];

    for (const [id, data] of this.vectors.entries()) {
      if (filter.userId && data.metadata.userId !== filter.userId) continue;
      if (filter.symbols && !filter.symbols.some(s => data.metadata.symbols.includes(s))) continue;
      if (filter.archetypes && !filter.archetypes.some(a => data.metadata.archetypes.includes(a))) continue;

      const score = this.cosineSimilarity(queryVector, data.vector);

      results.push({
        id,
        score,
        metadata: data.metadata
      });
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
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

  private async getAllUserVectors(userId: string): Promise<VectorSearchResult[]> {
    return [];
  }

  private generateEvolutionNarrative(
    archetype: string,
    timeline: Array<{ date: string; intensity: number; context: string }>
  ): string {
    if (timeline.length === 0) {
      return `The ${archetype} has not yet appeared in your journey.`;
    }

    const firstDate = new Date(timeline[0].date).toLocaleDateString();
    const lastDate = new Date(timeline[timeline.length - 1].date).toLocaleDateString();
    const avgIntensity = timeline.reduce((sum, t) => sum + t.intensity, 0) / timeline.length;

    return `The ${archetype} first emerged on ${firstDate} and has appeared ${timeline.length} times in your journey, most recently on ${lastDate}. Average resonance: ${(avgIntensity * 100).toFixed(1)}%.`;
  }
}

export const soulIndex = new SoulIndex();