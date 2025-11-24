/**
 * Journal Memory Layer - Stub Implementation
 * TODO: Replace with Supabase vector search or journal database
 */

import { MemoryResult, MemoryLayer } from './types';

export const journalMemory: MemoryLayer = {
  async fetch(query: string, userId: string, options?: any): Promise<MemoryResult[]> {
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const lowerQuery = query.toLowerCase();

    // Mock journal entries based on common themes
    const mockJournalTemplates = [
      {
        pattern: ['stuck', 'blocked', 'frustrated'],
        content: 'Journal entry from 3 days ago: "Feeling stuck in the same patterns. Need to break through this resistance."',
        mood: 'contemplative',
        relevance: 0.85
      },
      {
        pattern: ['work', 'job', 'career'],
        content: 'Journal reflection: "Questioning whether this career path aligns with who I\'m becoming."',
        mood: 'uncertain',
        relevance: 0.80
      },
      {
        pattern: ['relationship', 'family', 'friend'],
        content: 'Recent journal: "Family dynamics surfacing again. Old patterns trying to reassert themselves."',
        mood: 'processing',
        relevance: 0.75
      },
      {
        pattern: ['creative', 'art', 'writing', 'music'],
        content: 'Journal note: "Creative energy is flowing again. Something is unlocking in my expression."',
        mood: 'inspired',
        relevance: 0.78
      }
    ];

    // Find matching journal entries
    const matchingEntries = mockJournalTemplates
      .filter(template => 
        template.pattern.some(keyword => lowerQuery.includes(keyword))
      )
      .slice(0, 2); // Limit to 2 most relevant

    if (matchingEntries.length === 0) {
      // Return a generic journal memory if no specific match
      return [{
        content: 'Recent journal theme: Exploring deeper questions about authenticity and growth.',
        relevance: 0.6,
        tokens: 35,
        source: 'journal',
        metadata: {
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          id: `journal_${userId}_generic`,
          mood: 'reflective',
          type: 'theme_summary'
        }
      }];
    }

    return matchingEntries.map((entry, index) => ({
      content: entry.content,
      relevance: entry.relevance - (index * 0.05), // Slight relevance decay
      tokens: Math.ceil(entry.content.length / 4),
      source: 'journal' as const,
      metadata: {
        timestamp: new Date(Date.now() - 86400000 * (index + 1)).toISOString(),
        id: `journal_${userId}_${index}`,
        mood: entry.mood,
        type: 'journal_entry'
      }
    }));
  }
};