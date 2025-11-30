import { LlamaService } from './LlamaService';
import { MemoryStore } from './MemoryStore';
import { logger } from '../../utils/logger';

export interface MemoryItem {
  id: string;
  type: 'journal' | 'upload' | 'voice' | 'chat';
  content: string;
  preview: string;
  timestamp: Date;
  metadata?: any;
  relevanceScore?: number;
}

export interface MemoryContext {
  memories: MemoryItem[];
  formattedContext: string;
  hasRelevantMemories: boolean;
}

export class EnhancedMemoryRetrieval {
  constructor(
    private llamaService: LlamaService,
    private memoryStore: MemoryStore
  ) {}

  /**
   * Retrieve and format memories for Oracle context
   */
  async retrieveMemoryContext(
    userId: string, 
    query: string, 
    limit: number = 5
  ): Promise<MemoryContext> {
    try {
      // 1. Search across all memory types
      const [journalResults, uploadResults, voiceResults] = await Promise.all([
        this.searchJournalEntries(userId, query, Math.ceil(limit / 3)),
        this.searchUploads(userId, query, Math.ceil(limit / 3)),
        this.searchVoiceNotes(userId, query, Math.ceil(limit / 3))
      ]);

      // 2. Combine and sort by relevance
      const allMemories = [
        ...journalResults,
        ...uploadResults,
        ...voiceResults
      ].sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, limit);

      // 3. Format for context injection
      const formattedContext = this.formatMemoriesForContext(allMemories);

      return {
        memories: allMemories,
        formattedContext,
        hasRelevantMemories: allMemories.length > 0
      };
    } catch (error) {
      logger.error("Failed to retrieve memory context", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: userId.substring(0, 8) + '...'
      });
      
      return {
        memories: [],
        formattedContext: "",
        hasRelevantMemories: false
      };
    }
  }

  /**
   * Search journal entries with semantic matching
   */
  private async searchJournalEntries(
    userId: string, 
    query: string, 
    limit: number
  ): Promise<MemoryItem[]> {
    const results = await this.llamaService.searchMemories(
      userId, 
      query, 
      limit, 
      { type: 'journal' }
    );

    return results.map(result => ({
      id: result.id,
      type: 'journal' as const,
      content: result.content,
      preview: this.createPreview(result.content, 150),
      timestamp: new Date(result.metadata.timestamp),
      metadata: result.metadata,
      relevanceScore: result.score
    }));
  }

  /**
   * Search uploads with semantic matching
   */
  private async searchUploads(
    userId: string, 
    query: string, 
    limit: number
  ): Promise<MemoryItem[]> {
    const results = await this.llamaService.searchMemories(
      userId, 
      query, 
      limit, 
      { type: 'upload' }
    );

    return results.map(result => ({
      id: result.id,
      type: 'upload' as const,
      content: result.content,
      preview: this.createPreview(result.content, 150),
      timestamp: new Date(result.metadata.timestamp),
      metadata: result.metadata,
      relevanceScore: result.score
    }));
  }

  /**
   * Search voice notes with semantic matching
   */
  private async searchVoiceNotes(
    userId: string, 
    query: string, 
    limit: number
  ): Promise<MemoryItem[]> {
    const results = await this.llamaService.searchMemories(
      userId, 
      query, 
      limit, 
      { type: 'voice' }
    );

    return results.map(result => ({
      id: result.id,
      type: 'voice' as const,
      content: result.content,
      preview: this.createPreview(result.content, 150),
      timestamp: new Date(result.metadata.timestamp),
      metadata: result.metadata,
      relevanceScore: result.score
    }));
  }

  /**
   * Format memories for LLM context injection
   */
  private formatMemoriesForContext(memories: MemoryItem[]): string {
    if (memories.length === 0) {
      return "";
    }

    const header = "\n## Relevant Past Memories\n";
    
    const formattedMemories = memories.map(memory => {
      const typeLabel = {
        journal: '📓 Journal',
        upload: '📎 Upload',
        voice: '🎤 Voice Note',
        chat: '💬 Conversation'
      }[memory.type];

      const dateStr = this.formatDate(memory.timestamp);
      const title = memory.metadata?.title || memory.metadata?.filename || '';
      const titlePart = title ? ` "${title}"` : '';

      return `- ${typeLabel} (${dateStr})${titlePart}: "${memory.preview}..."`;
    }).join('\n');

    return header + formattedMemories + '\n';
  }

  /**
   * Create a preview of content
   */
  private createPreview(content: string, maxLength: number): string {
    // Remove excessive whitespace and newlines
    const cleaned = content.replace(/\s+/g, ' ').trim();
    
    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    // Try to cut at a word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace);
    }
    
    return truncated;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Get memory statistics for user
   */
  async getMemoryStats(userId: string): Promise<{
    totalMemories: number;
    journalCount: number;
    uploadCount: number;
    voiceCount: number;
    oldestMemory?: Date;
    newestMemory?: Date;
  }> {
    const [journals, uploads, voices] = await Promise.all([
      this.memoryStore.getJournalEntries(userId, 1000),
      this.memoryStore.getUploads(userId, 1000),
      this.memoryStore.getMemories(userId, 1000)
    ]);

    const voiceNotes = voices.filter(m => m.memory_type === 'voice');
    const allDates = [
      ...journals.map(j => new Date(j.created_at)),
      ...uploads.map(u => new Date(u.created_at)),
      ...voiceNotes.map(v => new Date(v.created_at))
    ].sort((a, b) => a.getTime() - b.getTime());

    return {
      totalMemories: journals.length + uploads.length + voiceNotes.length,
      journalCount: journals.length,
      uploadCount: uploads.length,
      voiceCount: voiceNotes.length,
      oldestMemory: allDates[0],
      newestMemory: allDates[allDates.length - 1]
    };
  }
}