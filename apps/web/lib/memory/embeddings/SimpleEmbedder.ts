/**
 * Simple Embedding Service
 * Beta implementation without external dependencies
 * Uses basic text hashing for semantic similarity
 */

import { EmbeddingService } from '../core/MemoryCore';

export class SimpleEmbedder implements EmbeddingService {
  private dimension = 384; // Standard embedding dimension

  async embed(text: string): Promise<number[]> {
    return this.textToEmbedding(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map(text => this.textToEmbedding(text));
  }

  private textToEmbedding(text: string): number[] {
    // Normalize text
    const normalizedText = text.toLowerCase().trim();
    
    // Create a simple but deterministic embedding using text features
    const embedding = new Array(this.dimension).fill(0);
    
    // Character-based features
    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText.charCodeAt(i);
      const index = char % this.dimension;
      embedding[index] += Math.sin(char * 0.1) * 0.1;
    }

    // Word-based features
    const words = normalizedText.split(/\s+/).filter(w => w.length > 2);
    words.forEach((word, wordIndex) => {
      const wordHash = this.simpleHash(word);
      for (let i = 0; i < word.length && i < 10; i++) {
        const index = (wordHash + i) % this.dimension;
        embedding[index] += Math.cos(word.charCodeAt(i) * 0.2) * 0.2;
      }
    });

    // Sentiment-based features (simple keyword matching)
    const positiveWords = ['good', 'great', 'amazing', 'wonderful', 'joy', 'love', 'peace', 'happy', 'beautiful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'angry', 'fear', 'worry', 'pain', 'difficult'];
    
    let sentiment = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) sentiment += 0.5;
      if (negativeWords.includes(word)) sentiment -= 0.5;
    });

    // Apply sentiment to specific dimensions
    for (let i = 0; i < 20; i++) {
      embedding[i] += sentiment * 0.3;
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] /= magnitude;
      }
    }

    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}