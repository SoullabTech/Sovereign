/**
 * OpenAI Embedding Service
 * Generates vector embeddings for semantic search
 */

import OpenAI from 'openai';
import type { EmbeddingService } from '../core/MemoryCore';

export class OpenAIEmbedder implements EmbeddingService {
  private openai: OpenAI;
  private model: string = 'text-embedding-ada-002';
  private cache: Map<string, number[]> = new Map();
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async embed(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = this.getCacheKey(text);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
        encoding_format: 'float'
      });
      
      const embedding = response.data[0].embedding;
      
      // Cache the result
      this.cache.set(cacheKey, embedding);
      
      // Limit cache size
      if (this.cache.size > 1000) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }
      
      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return zero vector as fallback
      return new Array(1536).fill(0);
    }
  }
  
  async embedBatch(texts: string[]): Promise<number[][]> {
    try {
      // OpenAI allows up to 2048 embeddings per request
      const batchSize = 100;
      const embeddings: number[][] = [];
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        
        const response = await this.openai.embeddings.create({
          model: this.model,
          input: batch,
          encoding_format: 'float'
        });
        
        const batchEmbeddings = response.data.map(d => d.embedding);
        embeddings.push(...batchEmbeddings);
        
        // Cache individual embeddings
        batch.forEach((text, idx) => {
          const cacheKey = this.getCacheKey(text);
          this.cache.set(cacheKey, batchEmbeddings[idx]);
        });
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      // Return zero vectors as fallback
      return texts.map(() => new Array(1536).fill(0));
    }
  }
  
  private getCacheKey(text: string): string {
    // Simple hash for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${this.model}_${hash}_${text.slice(0, 50)}`;
  }
  
  // Clear cache
  clearCache() {
    this.cache.clear();
  }
  
  // Get cache size
  getCacheSize(): number {
    return this.cache.size;
  }
}