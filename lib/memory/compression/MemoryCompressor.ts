/**
 * Memory Compression Service
 * Summarizes and compresses memories for efficient storage
 */

import OpenAI from 'openai';
import type { MemoryCompressor, RecallMemory } from '../core/MemoryCore';

export class MemoryCompressorService implements MemoryCompressor {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async summarize(text: string): Promise<string> {
    // Short texts don't need summarization
    if (text.length < 200) {
      return text;
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a memory compression system. Create concise, meaningful summaries that preserve emotional significance and key insights. Keep summaries under 100 words.'
          },
          {
            role: 'user',
            content: `Summarize this memory, preserving its emotional essence and key insights:\n\n${text}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });
      
      return response.choices[0].message.content || text.slice(0, 200);
    } catch (error) {
      console.error('Error summarizing text:', error);
      // Fallback to simple truncation
      return text.slice(0, 200) + '...';
    }
  }
  
  async compress(memories: RecallMemory[]): Promise<string> {
    // Group memories by type
    const grouped: Record<string, RecallMemory[]> = {};
    
    memories.forEach(memory => {
      if (!grouped[memory.type]) {
        grouped[memory.type] = [];
      }
      grouped[memory.type].push(memory);
    });
    
    // Create compressed representation
    const compressed: any = {
      period: {
        start: memories[0]?.timestamp,
        end: memories[memories.length - 1]?.timestamp
      },
      types: {},
      themes: [],
      insights: [],
      emotionalJourney: []
    };
    
    // Compress each type
    for (const [type, typeMemories] of Object.entries(grouped)) {
      compressed.types[type] = {
        count: typeMemories.length,
        summaries: await this.compressMemoryGroup(typeMemories),
        dominantMood: this.getDominantMood(typeMemories),
        dominantElement: this.getDominantElement(typeMemories)
      };
    }
    
    // Extract themes
    compressed.themes = await this.extractThemes(memories);
    
    // Extract key insights
    compressed.insights = memories
      .filter(m => m.type === 'insight' || m.importance > 80)
      .map(m => m.summary)
      .slice(0, 10);
    
    // Map emotional journey
    compressed.emotionalJourney = this.mapEmotionalJourney(memories);
    
    return JSON.stringify(compressed);
  }
  
  async decompress(compressed: string): Promise<RecallMemory[]> {
    try {
      const data = JSON.parse(compressed);
      const memories: RecallMemory[] = [];
      
      // Reconstruct memories from compressed data
      for (const [type, typeData] of Object.entries(data.types as any)) {
        const summaries = typeData.summaries || [];
        
        summaries.forEach((summary: string, idx: number) => {
          memories.push({
            id: `decompressed_${type}_${idx}`,
            userId: 'unknown',
            type: type as RecallMemory['type'],
            content: summary,
            summary: summary,
            embedding: [], // Would need to regenerate
            timestamp: new Date(data.period.start),
            associations: [],
            emotionalSignature: {
              mood: typeData.dominantMood || 'neutral',
              energy: 'emerging',
              element: typeData.dominantElement || 'aether'
            },
            importance: 50,
            accessCount: 0,
            lastAccessed: new Date(),
            metadata: { compressed: true }
          });
        });
      }
      
      return memories;
    } catch (error) {
      console.error('Error decompressing memories:', error);
      return [];
    }
  }
  
  private async compressMemoryGroup(memories: RecallMemory[]): Promise<string[]> {
    // Take top 5 most important memories
    const topMemories = memories
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5);
    
    // Summarize each
    const summaries = await Promise.all(
      topMemories.map(m => this.summarize(m.content))
    );
    
    return summaries;
  }
  
  private async extractThemes(memories: RecallMemory[]): Promise<string[]> {
    // Combine all summaries
    const allText = memories.map(m => m.summary).join(' ');
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract 3-5 key themes from these memories. Return only the themes as a comma-separated list.'
          },
          {
            role: 'user',
            content: allText.slice(0, 2000) // Limit context
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      });
      
      const themes = response.choices[0].message.content || '';
      return themes.split(',').map(t => t.trim()).filter(t => t.length > 0);
    } catch (error) {
      console.error('Error extracting themes:', error);
      return this.extractThemesFallback(memories);
    }
  }
  
  private extractThemesFallback(memories: RecallMemory[]): string[] {
    // Simple keyword extraction
    const words: Record<string, number> = {};
    
    memories.forEach(m => {
      const tokens = m.summary.toLowerCase().split(/\W+/);
      tokens.forEach(token => {
        if (token.length > 5) {
          words[token] = (words[token] || 0) + 1;
        }
      });
    });
    
    return Object.entries(words)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
  
  private getDominantMood(memories: RecallMemory[]): string {
    const moods: Record<string, number> = {};
    
    memories.forEach(m => {
      const mood = m.emotionalSignature.mood;
      moods[mood] = (moods[mood] || 0) + 1;
    });
    
    return Object.entries(moods)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  }
  
  private getDominantElement(memories: RecallMemory[]): string {
    const elements: Record<string, number> = {};
    
    memories.forEach(m => {
      const element = m.emotionalSignature.element;
      elements[element] = (elements[element] || 0) + 1;
    });
    
    return Object.entries(elements)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'aether';
  }
  
  private mapEmotionalJourney(memories: RecallMemory[]): Array<{
    date: Date;
    mood: string;
    energy: string;
    importance: number;
  }> {
    return memories.map(m => ({
      date: m.timestamp,
      mood: m.emotionalSignature.mood,
      energy: m.emotionalSignature.energy,
      importance: m.importance
    }));
  }
}