/**
 * External Memory Layer - Stub Implementation
 * TODO: Replace with Mem0, LangChain, or other external memory services
 */

import { MemoryResult, MemoryLayer } from './types';

export const externalMemory: MemoryLayer = {
  async fetch(query: string, userId: string, options?: any): Promise<MemoryResult[]> {
    // Simulate external API call delay
    await new Promise(resolve => setTimeout(resolve, 150));

    // Mock external memory patterns - long-term behavioral insights
    const lowerQuery = query.toLowerCase();

    const externalInsights = [
      {
        pattern: ['pattern', 'repeat', 'again', 'always'],
        insight: 'External memory: User has a recurring pattern of seeking clarity during transition periods.',
        relevance: 0.7
      },
      {
        pattern: ['growth', 'learning', 'develop'],
        insight: 'Long-term tracking: User shows consistent growth through reflective dialogue over past 3 months.',
        relevance: 0.72
      },
      {
        pattern: ['decision', 'choice', 'should'],
        insight: 'Behavioral pattern: User processes decisions best through exploration rather than direct advice.',
        relevance: 0.68
      },
      {
        pattern: ['feel', 'emotion', 'heart'],
        insight: 'External insight: User\'s emotional intelligence has strengthened through journaling practice.',
        relevance: 0.69
      }
    ];

    // Find relevant external insights
    const matchingInsights = externalInsights.filter(item =>
      item.pattern.some(keyword => lowerQuery.includes(keyword))
    );

    if (matchingInsights.length === 0) {
      // Return generic external memory if no specific patterns match
      return [{
        content: 'External memory service: Long-term growth trajectory shows increasing self-awareness and authenticity.',
        relevance: 0.6,
        tokens: 40,
        source: 'external',
        metadata: {
          timestamp: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
          id: `external_${userId}_generic`,
          type: 'behavioral_trend',
          tags: ['growth_pattern', 'long_term']
        }
      }];
    }

    return matchingInsights.slice(0, 2).map((insight, index) => ({
      content: insight.insight,
      relevance: insight.relevance - (index * 0.02),
      tokens: Math.ceil(insight.insight.length / 4),
      source: 'external' as const,
      metadata: {
        timestamp: new Date(Date.now() - 86400000 * (7 + index * 7)).toISOString(),
        id: `external_${userId}_${index}`,
        type: 'pattern_analysis',
        tags: insight.pattern
      }
    }));
  }
};