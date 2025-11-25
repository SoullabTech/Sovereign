import { EventEmitter } from 'events';
import crypto from 'crypto';

interface EmbeddingResult {
  text: string;
  vector: number[];
  timestamp: number;
  hash: string;
}

interface SimilarityResult {
  text: string;
  score: number;
  vector: number[];
}

/**
 * Vector embeddings service with caching and similarity search
 */
export class VectorEmbeddingService extends EventEmitter {
  private cache: Map<string, EmbeddingResult>;
  private readonly MAX_CACHE_SIZE = 10000;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  private embeddingDimension: number = 384; // Default for all-MiniLM-L6-v2
  private openaiApiKey?: string;
  private useOpenAI: boolean = false;

  constructor(options?: { openaiApiKey?: string; dimension?: number }) {
    super();
    this.cache = new Map();
    this.openaiApiKey = options?.openaiApiKey;
    this.useOpenAI = !!this.openaiApiKey;
    if (options?.dimension) {
      this.embeddingDimension = options.dimension;
    }
    this.startCacheCleanup();
  }

  /**
   * Get embedding for text with caching
   */
  async getEmbedding(text: string): Promise<number[]> {
    const hash = this.hashText(text);

    // Check cache
    const cached = this.cache.get(hash);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.emit('cache_hit', { text: text.substring(0, 50) });
      return cached.vector;
    }

    // Generate new embedding
    const vector = await this.generateEmbedding(text);

    // Cache result
    this.cacheEmbedding(hash, text, vector);

    return vector;
  }

  /**
   * Get embeddings for multiple texts (batch processing)
   */
  async getBatchEmbeddings(texts: string[]): Promise<Map<string, number[]>> {
    const results = new Map<string, number[]>();
    const uncachedTexts: string[] = [];
    const textToHash = new Map<string, string>();

    // Check cache for each text
    for (const text of texts) {
      const hash = this.hashText(text);
      textToHash.set(text, hash);

      const cached = this.cache.get(hash);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        results.set(text, cached.vector);
      } else {
        uncachedTexts.push(text);
      }
    }

    // Generate embeddings for uncached texts
    if (uncachedTexts.length > 0) {
      const newEmbeddings = await this.generateBatchEmbeddings(uncachedTexts);

      for (let i = 0; i < uncachedTexts.length; i++) {
        const text = uncachedTexts[i];
        const vector = newEmbeddings[i];
        const hash = textToHash.get(text)!;

        results.set(text, vector);
        this.cacheEmbedding(hash, text, vector);
      }
    }

    return results;
  }

  /**
   * Find most similar texts using cosine similarity
   */
  async findSimilar(
    queryText: string,
    candidates: string[],
    topK: number = 5
  ): Promise<SimilarityResult[]> {
    // Get query embedding
    const queryVector = await this.getEmbedding(queryText);

    // Get candidate embeddings
    const candidateEmbeddings = await this.getBatchEmbeddings(candidates);

    // Calculate similarities
    const similarities: SimilarityResult[] = [];

    candidateEmbeddings.forEach((vector, text) => {
      const score = this.cosineSimilarity(queryVector, vector);
      similarities.push({ text, score, vector });
    });

    // Sort by similarity and return top K
    similarities.sort((a, b) => b.score - a.score);
    return similarities.slice(0, topK);
  }

  /**
   * Calculate semantic similarity between two texts
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    const [vec1, vec2] = await Promise.all([
      this.getEmbedding(text1),
      this.getEmbedding(text2)
    ]);

    return this.cosineSimilarity(vec1, vec2);
  }

  /**
   * Generate embedding using either OpenAI or local method
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    if (this.useOpenAI && this.openaiApiKey) {
      return this.generateOpenAIEmbedding(text);
    } else {
      return this.generateLocalEmbedding(text);
    }
  }

  /**
   * Generate embeddings for batch of texts
   */
  private async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (this.useOpenAI && this.openaiApiKey) {
      return this.generateOpenAIBatchEmbeddings(texts);
    } else {
      return Promise.all(texts.map(text => this.generateLocalEmbedding(text)));
    }
  }

  /**
   * Generate embedding using OpenAI API
   */
  private async generateOpenAIEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
          dimensions: this.embeddingDimension
        })
      });

      const data = await response.json();
      if (!data.data || !data.data[0] || !data.data[0].embedding) {
        console.error('Invalid OpenAI response structure:', data);
        return this.generateLocalEmbedding(text);
      }
      return data.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding failed, falling back to local', error);
      return this.generateLocalEmbedding(text);
    }
  }

  /**
   * Generate batch embeddings using OpenAI API
   */
  private async generateOpenAIBatchEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: texts,
          dimensions: this.embeddingDimension
        })
      });

      const data = await response.json();
      return data.data.map((item: any) => item.embedding);
    } catch (error) {
      console.error('OpenAI batch embedding failed, falling back to local', error);
      return Promise.all(texts.map(text => this.generateLocalEmbedding(text)));
    }
  }

  /**
   * Generate local embedding using TF-IDF-like approach
   * This is a simplified version for development - in production use a proper model
   */
  private async generateLocalEmbedding(text: string): Promise<number[]> {
    // Tokenize and create simple embedding
    const words = text.toLowerCase().split(/\s+/);
    const vector = new Array(this.embeddingDimension).fill(0);

    // Simple hash-based embedding (not semantically meaningful but works for development)
    words.forEach((word, index) => {
      const hash = this.hashText(word);
      const indices = this.hashToIndices(hash, 10); // Each word affects 10 dimensions

      indices.forEach(idx => {
        vector[idx] += 1 / Math.sqrt(words.length); // TF normalization
      });
    });

    // L2 normalization
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  /**
   * Convert hash to array indices for embedding
   */
  private hashToIndices(hash: string, count: number): number[] {
    const indices: number[] = [];
    for (let i = 0; i < count; i++) {
      const subHash = this.hashText(hash + i);
      const value = parseInt(subHash.substring(0, 8), 16);
      indices.push(value % this.embeddingDimension);
    }
    return indices;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Hash text for cache key
   */
  private hashText(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Cache embedding result
   */
  private cacheEmbedding(hash: string, text: string, vector: number[]): void {
    // Manage cache size
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      // Remove oldest entries
      const entriesToRemove = Math.floor(this.MAX_CACHE_SIZE * 0.1);
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      for (let i = 0; i < entriesToRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }

    this.cache.set(hash, {
      text,
      vector,
      timestamp: Date.now(),
      hash
    });

    this.emit('cache_update', { size: this.cache.size });
  }

  /**
   * Start periodic cache cleanup
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      this.cache.forEach((entry, key) => {
        if (now - entry.timestamp > this.CACHE_TTL) {
          expiredKeys.push(key);
        }
      });

      expiredKeys.forEach(key => this.cache.delete(key));

      if (expiredKeys.length > 0) {
        this.emit('cache_cleanup', { removed: expiredKeys.length });
      }
    }, 60 * 60 * 1000); // Run every hour
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.emit('cache_cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL
    };
  }
}