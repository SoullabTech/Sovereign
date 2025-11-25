'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Memory {
  id: string;
  type: 'journal' | 'upload' | 'voice' | 'chat';
  title?: string;
  content: string;
  preview?: string;
  metadata?: {
    filename?: string;
    fileType?: string;
    mood?: string;
    tags?: string[];
    duration?: number;
    audioUrl?: string;
    language?: string;
  };
  insights?: {
    archetype: string;
    confidence: number;
    symbol: string;
  }[];
  emotion?: {
    valence: number;
    arousal: number;
    dominance: number;
    energySignature: string;
    primaryEmotion?: {
      emotion: string;
      intensity: number;
      color: string;
    };
  };
  createdAt: string;
}

interface UseMemorySystemOptions {
  userId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useMemorySystem({ 
  userId, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: UseMemorySystemOptions) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Memory['type'] | 'all'>('all');

  // Fetch journal entries
  const fetchJournals = useCallback(async () => {
    try {
      const response = await fetch(`/api/journal?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch journals');
      
      const data = await response.json();
      if (data.success && data.entries) {
        return data.entries.map((entry: any) => ({
          id: entry.id,
          type: 'journal' as const,
          title: entry.title,
          content: entry.content,
          preview: entry.content.slice(0, 150) + '...',
          metadata: {
            mood: entry.mood,
            tags: entry.tags
          },
          createdAt: entry.timestamp
        }));
      }
      return [];
    } catch (err) {
      console.error('Error fetching journals:', err);
      return [];
    }
  }, [userId]);

  // Fetch uploads
  const fetchUploads = useCallback(async () => {
    try {
      const response = await fetch(`/api/upload?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch uploads');
      
      const data = await response.json();
      if (data.success && data.files) {
        return data.files.map((file: any) => ({
          id: file.id,
          type: 'upload' as const,
          title: file.originalName,
          content: file.summary,
          preview: file.summary,
          metadata: {
            filename: file.originalName,
            fileType: file.type
          },
          createdAt: file.timestamp
        }));
      }
      return [];
    } catch (err) {
      console.error('Error fetching uploads:', err);
      return [];
    }
  }, [userId]);

  // Fetch voice notes
  const fetchVoiceNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/voice/list?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch voice notes');
      
      const data = await response.json();
      if (data.success && data.data) {
        return data.data.map((note: any) => ({
          id: note.id,
          type: 'voice' as const,
          title: 'Voice Note',
          content: note.text,
          preview: note.text.slice(0, 150) + (note.text.length > 150 ? '...' : ''),
          metadata: {
            audioUrl: note.audioUrl,
            duration: note.duration,
            language: 'en-US'
          },
          createdAt: note.createdAt
        }));
      }
      return [];
    } catch (err) {
      console.error('Error fetching voice notes:', err);
      return [];
    }
  }, [userId]);

  // Fetch all memories using unified API
  const fetchAllMemories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memory/list?userId=${userId}&type=all&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch memories');
      
      const data = await response.json();
      if (data.success && data.memories) {
        // Memories are already enriched with archetypal insights
        setMemories(data.memories);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError('Failed to load memories');
      console.error('Error fetching unified memories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Add a new memory
  const addMemory = useCallback(async (
    type: Memory['type'], 
    content: string, 
    metadata?: Memory['metadata']
  ) => {
    try {
      let endpoint = '';
      let body: any = { userId };

      switch (type) {
        case 'journal':
          endpoint = '/api/journal';
          body = {
            ...body,
            title: metadata?.mood ? `${metadata.mood} reflection` : 'Journal Entry',
            content,
            mood: metadata?.mood,
            tags: metadata?.tags
          };
          break;

        case 'voice':
          // Voice notes are handled differently via form data
          return;

        case 'upload':
          // Uploads are handled differently via form data
          return;

        default:
          throw new Error('Unsupported memory type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Failed to add memory');

      // Refresh memories after adding
      await fetchAllMemories();
    } catch (err) {
      console.error('Error adding memory:', err);
      throw err;
    }
  }, [userId, fetchAllMemories]);

  // Delete a memory
  const deleteMemory = useCallback(async (memoryId: string, type: Memory['type']) => {
    try {
      let endpoint = '';
      
      switch (type) {
        case 'journal':
          endpoint = `/api/journal?id=${memoryId}&userId=${userId}`;
          break;
        case 'upload':
          endpoint = `/api/upload?id=${memoryId}&userId=${userId}`;
          break;
        case 'voice':
          endpoint = `/api/voice/transcribe?id=${memoryId}&userId=${userId}`;
          break;
        default:
          throw new Error('Unsupported memory type');
      }

      const response = await fetch(endpoint, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete memory');

      // Remove from local state
      setMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (err) {
      console.error('Error deleting memory:', err);
      throw err;
    }
  }, [userId]);

  // Get filtered memories
  const filteredMemories = filter === 'all' 
    ? memories 
    : memories.filter(m => m.type === filter);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchAllMemories();

    if (autoRefresh) {
      const interval = setInterval(fetchAllMemories, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAllMemories, autoRefresh, refreshInterval]);

  return {
    memories: filteredMemories,
    allMemories: memories,
    isLoading,
    error,
    filter,
    setFilter,
    refresh: fetchAllMemories,
    addMemory,
    deleteMemory
  };
}