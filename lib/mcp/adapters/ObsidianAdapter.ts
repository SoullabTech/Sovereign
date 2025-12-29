/**
 * Obsidian MCP Adapter for MAIA-SOVEREIGN
 *
 * Provides access to user's Obsidian vault via MCP protocol.
 * Enables MAIA to reference personal notes, research, and knowledge.
 *
 * Key capabilities:
 * - Read notes by path or title
 * - Search vault by content or tags
 * - Access frontmatter metadata
 * - Follow links and backlinks
 * - Semantic search (if vault has embeddings)
 *
 * Uses: cyanheads/obsidian-mcp-server
 * https://github.com/cyanheads/obsidian-mcp-server
 */

import { EventEmitter } from 'events';
import type {
  MCPToolResult,
  ObsidianNote,
  ObsidianSearchResult,
} from '../types';
import { getMCPClientManager } from '../MCPClientManager';

export interface VaultStats {
  totalNotes: number;
  totalTags: number;
  recentlyModified: ObsidianNote[];
}

export interface NoteContext {
  note: ObsidianNote;
  relatedNotes: ObsidianNote[];
  tags: string[];
}

export interface KnowledgeQuery {
  query: string;
  limit?: number;
  tags?: string[];
  folder?: string;
}

export interface KnowledgeResult {
  notes: ObsidianSearchResult[];
  summary: string;
  relevantTags: string[];
}

/**
 * Obsidian MCP Adapter
 * Provides knowledge-aware access to user's vault
 */
export class ObsidianAdapter extends EventEmitter {
  private manager = getMCPClientManager();
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 60000; // 1 minute for notes

  constructor() {
    super();
  }

  /**
   * Check if Obsidian MCP is connected
   */
  isConnected(): boolean {
    return this.manager.isConnected('obsidian');
  }

  /**
   * Get available tools from the Obsidian MCP server
   */
  async getAvailableTools(): Promise<string[]> {
    const allTools = this.manager.getAllTools();
    const obsidianTools = allTools.get('obsidian');
    return obsidianTools?.map(t => t.name) || [];
  }

  // ============================================================================
  // Note Operations
  // ============================================================================

  /**
   * Read a note by path
   */
  async readNote(path: string): Promise<ObsidianNote | null> {
    const cacheKey = `note_${path}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as ObsidianNote;

    try {
      const result = await this.manager.callTool('obsidian', {
        name: 'read_note',
        arguments: { path },
      });

      const note = this.parseNoteResult(result, path);
      if (note) {
        this.setCache(cacheKey, note);
        this.emit('noteRead', note);
      }
      return note;
    } catch (error) {
      console.error('[ObsidianAdapter] Failed to read note:', error);
      return null;
    }
  }

  /**
   * Search notes by content
   */
  async searchNotes(query: string, limit: number = 10): Promise<ObsidianSearchResult[]> {
    try {
      const result = await this.manager.callTool('obsidian', {
        name: 'search_notes',
        arguments: { query, limit },
      });

      const results = this.parseSearchResults(result);
      this.emit('searchCompleted', { query, results });
      return results;
    } catch (error) {
      console.error('[ObsidianAdapter] Failed to search notes:', error);
      return [];
    }
  }

  /**
   * Search notes by tag
   */
  async searchByTag(tag: string, limit: number = 20): Promise<ObsidianSearchResult[]> {
    // Normalize tag (ensure it starts with #)
    const normalizedTag = tag.startsWith('#') ? tag : `#${tag}`;

    try {
      const result = await this.manager.callTool('obsidian', {
        name: 'search_by_tag',
        arguments: { tag: normalizedTag, limit },
      });

      return this.parseSearchResults(result);
    } catch (error) {
      console.error('[ObsidianAdapter] Failed to search by tag:', error);
      return [];
    }
  }

  /**
   * List notes in a folder
   */
  async listFolder(folder: string): Promise<string[]> {
    try {
      const result = await this.manager.callTool('obsidian', {
        name: 'list_folder',
        arguments: { path: folder },
      });

      return this.parseFileList(result);
    } catch (error) {
      console.error('[ObsidianAdapter] Failed to list folder:', error);
      return [];
    }
  }

  /**
   * Get recently modified notes
   */
  async getRecentNotes(limit: number = 10): Promise<ObsidianNote[]> {
    try {
      const result = await this.manager.callTool('obsidian', {
        name: 'get_recent_notes',
        arguments: { limit },
      });

      return this.parseNotesArray(result);
    } catch (error) {
      console.error('[ObsidianAdapter] Failed to get recent notes:', error);
      return [];
    }
  }

  // ============================================================================
  // Knowledge Operations (for Oracle context)
  // ============================================================================

  /**
   * Query knowledge base with semantic understanding
   * This is the main method for Oracle integration
   */
  async queryKnowledge(query: KnowledgeQuery): Promise<KnowledgeResult> {
    const { query: searchQuery, limit = 5, tags, folder } = query;

    try {
      // Search by content
      let results = await this.searchNotes(searchQuery, limit * 2);

      // Filter by tags if specified
      if (tags && tags.length > 0) {
        results = results.filter(r => {
          // Check if note has any of the specified tags
          return tags.some(tag =>
            r.matches?.some(m => m.text.includes(tag)) ||
            r.excerpt.includes(tag)
          );
        });
      }

      // Filter by folder if specified
      if (folder) {
        results = results.filter(r => r.path.startsWith(folder));
      }

      // Limit results
      results = results.slice(0, limit);

      // Extract relevant tags from results
      const relevantTags = this.extractTagsFromResults(results);

      // Generate summary
      const summary = this.generateKnowledgeSummary(searchQuery, results);

      return {
        notes: results,
        summary,
        relevantTags,
      };
    } catch (error) {
      console.error('[ObsidianAdapter] Failed to query knowledge:', error);
      return {
        notes: [],
        summary: 'Unable to access knowledge base.',
        relevantTags: [],
      };
    }
  }

  /**
   * Get context around a specific note (with related notes)
   */
  async getNoteContext(path: string): Promise<NoteContext | null> {
    const note = await this.readNote(path);
    if (!note) return null;

    // Get linked notes
    const relatedNotes: ObsidianNote[] = [];

    // Follow outgoing links
    if (note.links) {
      for (const link of note.links.slice(0, 3)) {
        const linkedNote = await this.readNote(link);
        if (linkedNote) relatedNotes.push(linkedNote);
      }
    }

    // Get backlinks
    if (note.backlinks) {
      for (const backlink of note.backlinks.slice(0, 3)) {
        const backlinkNote = await this.readNote(backlink);
        if (backlinkNote) relatedNotes.push(backlinkNote);
      }
    }

    return {
      note,
      relatedNotes,
      tags: note.tags || [],
    };
  }

  /**
   * Find notes related to a topic (for Oracle enrichment)
   */
  async findRelatedKnowledge(topic: string, maxNotes: number = 3): Promise<string> {
    const results = await this.searchNotes(topic, maxNotes);

    if (results.length === 0) {
      return '';
    }

    // Build context string for Oracle
    const contextParts: string[] = [];
    contextParts.push(`Found ${results.length} relevant notes in vault:`);

    for (const result of results) {
      contextParts.push(`\n- "${result.title}" (${result.path}):`);
      contextParts.push(`  ${result.excerpt.slice(0, 200)}...`);
    }

    return contextParts.join('\n');
  }

  // ============================================================================
  // Vault Statistics
  // ============================================================================

  /**
   * Get vault statistics
   */
  async getVaultStats(): Promise<VaultStats | null> {
    try {
      const result = await this.manager.callTool('obsidian', {
        name: 'get_vault_stats',
        arguments: {},
      });

      return this.parseVaultStats(result);
    } catch (error) {
      console.error('[ObsidianAdapter] Failed to get vault stats:', error);
      return null;
    }
  }

  /**
   * Get all tags in vault
   */
  async getAllTags(): Promise<string[]> {
    try {
      const result = await this.manager.callTool('obsidian', {
        name: 'get_all_tags',
        arguments: {},
      });

      return this.parseTagList(result);
    } catch (error) {
      console.error('[ObsidianAdapter] Failed to get tags:', error);
      return [];
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private parseNoteResult(result: MCPToolResult, path: string): ObsidianNote | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      // Try to parse as JSON first
      try {
        const data = JSON.parse(textContent.text);
        return {
          path: data.path || path,
          title: data.title || path.split('/').pop()?.replace('.md', '') || 'Untitled',
          content: data.content || textContent.text,
          frontmatter: data.frontmatter,
          tags: data.tags || [],
          links: data.links || [],
          backlinks: data.backlinks || [],
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          modifiedAt: data.modifiedAt ? new Date(data.modifiedAt) : undefined,
        };
      } catch {
        // Plain text content
        return {
          path,
          title: path.split('/').pop()?.replace('.md', '') || 'Untitled',
          content: textContent.text,
          tags: this.extractTagsFromContent(textContent.text),
          links: this.extractLinksFromContent(textContent.text),
        };
      }
    } catch {
      return null;
    }
  }

  private parseSearchResults(result: MCPToolResult): ObsidianSearchResult[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (!Array.isArray(data)) return [];

      return data.map((item: Record<string, unknown>) => ({
        path: String(item.path || ''),
        title: String(item.title || item.path || 'Untitled'),
        excerpt: String(item.excerpt || item.content || '').slice(0, 300),
        score: Number(item.score || item.relevance || 0),
        matches: Array.isArray(item.matches) ? item.matches.map((m: Record<string, unknown>) => ({
          line: Number(m.line || 0),
          text: String(m.text || ''),
        })) : undefined,
      }));
    } catch {
      return [];
    }
  }

  private parseNotesArray(result: MCPToolResult): ObsidianNote[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (!Array.isArray(data)) return [];

      return data.map((item: Record<string, unknown>) => ({
        path: String(item.path || ''),
        title: String(item.title || 'Untitled'),
        content: String(item.content || ''),
        frontmatter: item.frontmatter as Record<string, unknown> | undefined,
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        links: Array.isArray(item.links) ? item.links.map(String) : [],
        backlinks: Array.isArray(item.backlinks) ? item.backlinks.map(String) : [],
        createdAt: item.createdAt ? new Date(item.createdAt as string) : undefined,
        modifiedAt: item.modifiedAt ? new Date(item.modifiedAt as string) : undefined,
      }));
    } catch {
      return [];
    }
  }

  private parseFileList(result: MCPToolResult): string[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (Array.isArray(data)) {
        return data.map(item =>
          typeof item === 'string' ? item : String(item.path || item.name || '')
        );
      }
      return [];
    } catch {
      return [];
    }
  }

  private parseTagList(result: MCPToolResult): string[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      if (Array.isArray(data)) {
        return data.map(String);
      }
      return [];
    } catch {
      return [];
    }
  }

  private parseVaultStats(result: MCPToolResult): VaultStats | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      const data = JSON.parse(textContent.text);
      return {
        totalNotes: Number(data.totalNotes || data.noteCount || 0),
        totalTags: Number(data.totalTags || data.tagCount || 0),
        recentlyModified: Array.isArray(data.recentlyModified)
          ? this.parseNotesArray({ content: [{ type: 'text', text: JSON.stringify(data.recentlyModified) }] })
          : [],
      };
    } catch {
      return null;
    }
  }

  private extractTagsFromContent(content: string): string[] {
    const tagRegex = /#[\w-]+/g;
    const matches = content.match(tagRegex);
    return matches ? [...new Set(matches)] : [];
  }

  private extractLinksFromContent(content: string): string[] {
    const linkRegex = /\[\[([^\]]+)\]\]/g;
    const links: string[] = [];
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1].split('|')[0]); // Handle [[link|alias]] format
    }
    return [...new Set(links)];
  }

  private extractTagsFromResults(results: ObsidianSearchResult[]): string[] {
    const tags = new Set<string>();
    for (const result of results) {
      const extracted = this.extractTagsFromContent(result.excerpt);
      extracted.forEach(tag => tags.add(tag));
    }
    return Array.from(tags);
  }

  private generateKnowledgeSummary(query: string, results: ObsidianSearchResult[]): string {
    if (results.length === 0) {
      return `No notes found matching "${query}".`;
    }

    const noteCount = results.length;
    const topNote = results[0];

    return `Found ${noteCount} note${noteCount > 1 ? 's' : ''} related to "${query}". ` +
      `Most relevant: "${topNote.title}".`;
  }
}

// Singleton instance
let instance: ObsidianAdapter | null = null;

export function getObsidianAdapter(): ObsidianAdapter {
  if (!instance) {
    instance = new ObsidianAdapter();
  }
  return instance;
}

export function resetObsidianAdapter(): void {
  if (instance) {
    instance = null;
  }
}
