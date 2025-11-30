/**
 * Memory Layer Types and Interfaces
 */

export interface MemoryResult {
  content: string;
  relevance: number; // 0-1 scale
  tokens: number;
  source: 'session' | 'journal' | 'profile' | 'symbolic' | 'external';
  metadata?: {
    timestamp?: string;
    id?: string;
    tags?: string[];
    mood?: string;
    type?: string;
  };
}

export interface MemoryLayer {
  fetch(query: string, userId: string, options?: any): Promise<MemoryResult[]>;
}

export interface MemoryConfig {
  maxResults: number;
  minRelevance: number;
  enabledLayers: string[];
}