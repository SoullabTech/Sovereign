/**
 * Simple Memory Compression Service
 * Beta implementation without external dependencies
 */

import { MemoryCompressor, RecallMemory } from '../core/MemoryCore';

export class SimpleCompressor implements MemoryCompressor {
  
  async summarize(text: string): Promise<string> {
    // Simple extractive summarization
    const sentences = this.splitIntoSentences(text);
    
    if (sentences.length <= 2) {
      return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }

    // Score sentences based on word frequency and position
    const wordFreq = this.calculateWordFrequency(text);
    const sentenceScores = sentences.map((sentence, index) => {
      const words = sentence.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const score = words.reduce((sum, word) => sum + (wordFreq[word] || 0), 0) / words.length;
      
      // Boost first and last sentences slightly
      const positionBoost = (index === 0 || index === sentences.length - 1) ? 0.1 : 0;
      
      return { sentence, score: score + positionBoost, index };
    });

    // Select top sentences
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.min(3, Math.ceil(sentences.length * 0.3))))
      .sort((a, b) => a.index - b.index); // Restore original order

    const summary = topSentences.map(s => s.sentence).join(' ');
    return summary.length > 250 ? summary.substring(0, 250) + '...' : summary;
  }

  async compress(memories: RecallMemory[]): Promise<string> {
    if (memories.length === 0) return '[]';

    const compressed = memories.map(memory => ({
      id: memory.id,
      type: memory.type,
      summary: memory.summary,
      timestamp: memory.timestamp.toISOString(),
      importance: memory.importance,
      emotionalSignature: memory.emotionalSignature
    }));

    return JSON.stringify(compressed);
  }

  async decompress(compressed: string): Promise<RecallMemory[]> {
    try {
      const data = JSON.parse(compressed);
      if (!Array.isArray(data)) return [];

      return data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp),
        content: item.summary, // We only have summaries in compressed data
        embedding: [], // Empty embedding for compressed memories
        associations: [],
        accessCount: 0,
        lastAccessed: new Date(),
        metadata: {}
      }));
    } catch (error) {
      console.error('Failed to decompress memories:', error);
      return [];
    }
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  private calculateWordFrequency(text: string): Record<string, number> {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const freq: Record<string, number> = {};
    const total = words.length;

    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    // Normalize frequencies
    Object.keys(freq).forEach(word => {
      freq[word] = freq[word] / total;
    });

    return freq;
  }
}