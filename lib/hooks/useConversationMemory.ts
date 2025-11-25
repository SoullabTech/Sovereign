'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface ConversationMemory {
  id: string;
  content: string;
  timestamp: string;
  participants: string[];
  emotional_tone?: string;
  wisdom_themes?: string[];
  elemental_resonance?: string;
}

interface SaveMemoryOptions {
  memoryType?: string;
  sourceType?: string;
  emotionalTone?: string;
  wisdomThemes?: string[];
  elementalResonance?: string;
  sessionId?: string;
}

export function useConversationMemory() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConversation, setPendingConversation] = useState<string | null>(null);

  const saveMemory = useCallback(async (
    content: string, 
    options: SaveMemoryOptions = {}
  ): Promise<ConversationMemory | null> => {
    if (!isAuthenticated || !user) {
      // Store for later saving after authentication
      setPendingConversation(content);
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          memoryType: options.memoryType || 'conversation',
          sourceType: options.sourceType || 'voice',
          emotionalTone: options.emotionalTone,
          wisdomThemes: options.wisdomThemes || [],
          elementalResonance: options.elementalResonance,
          sessionId: options.sessionId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save memory');
      }

      const data = await response.json();
      return data.memory;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save memory';
      setError(errorMessage);
      console.error('Error saving memory:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const savePendingMemory = useCallback(async (options: SaveMemoryOptions = {}) => {
    if (pendingConversation && isAuthenticated) {
      const saved = await saveMemory(pendingConversation, options);
      if (saved) {
        setPendingConversation(null);
      }
      return saved;
    }
    return null;
  }, [pendingConversation, isAuthenticated, saveMemory]);

  const getMemories = useCallback(async (options: {
    limit?: number;
    offset?: number;
    type?: string;
    sessionId?: string;
  } = {}): Promise<ConversationMemory[]> => {
    if (!isAuthenticated) {
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.type) params.append('type', options.type);
      if (options.sessionId) params.append('sessionId', options.sessionId);

      const response = await fetch(`/api/memories?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch memories');
      }

      const data = await response.json();
      return data.memories || [];

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch memories';
      setError(errorMessage);
      console.error('Error fetching memories:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const getRecentWisdom = useCallback(async (): Promise<{
    lastConversation?: ConversationMemory;
    frequentThemes: string[];
    elementalPatterns: Record<string, number>;
  }> => {
    const recentMemories = await getMemories({ limit: 10 });
    
    if (recentMemories.length === 0) {
      return { frequentThemes: [], elementalPatterns: {} };
    }

    // Extract wisdom patterns
    const allThemes = recentMemories.flatMap(m => m.wisdom_themes || []);
    const themeFrequency = allThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frequentThemes = Object.entries(themeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    // Elemental resonance patterns
    const elementalPatterns = recentMemories.reduce((acc, m) => {
      if (m.elemental_resonance) {
        acc[m.elemental_resonance] = (acc[m.elemental_resonance] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      lastConversation: recentMemories[0],
      frequentThemes,
      elementalPatterns
    };
  }, [getMemories]);

  return {
    saveMemory,
    savePendingMemory,
    getMemories,
    getRecentWisdom,
    pendingConversation,
    isLoading,
    error,
    hasPendingMemory: !!pendingConversation
  };
}