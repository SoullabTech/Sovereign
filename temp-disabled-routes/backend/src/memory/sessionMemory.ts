/**
 * Session Memory Layer - Stub Implementation
 * TODO: Replace with actual session history retrieval
 */

import { MemoryResult, MemoryLayer } from './types';

export const sessionMemory: MemoryLayer = {
  async fetch(query: string, userId: string, options?: any): Promise<MemoryResult[]> {
    // Simulate session memory lookup delay
    await new Promise(resolve => setTimeout(resolve, 50));

    // Mock recent conversation context
    const mockResults: MemoryResult[] = [
      {
        content: `Recent session context: User mentioned "${query.substring(0, 30)}..." indicating current focus on reflection`,
        relevance: 0.9,
        tokens: 45,
        source: 'session',
        metadata: {
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          id: `session_${userId}_${Date.now()}`,
          type: 'conversation_turn'
        }
      }
    ];

    // Only return if query has some substance
    if (query.length < 5) {
      return [];
    }

    return mockResults;
  }
};