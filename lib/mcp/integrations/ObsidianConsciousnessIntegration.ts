/**
 * Obsidian Consciousness Integration for MAIA-SOVEREIGN
 *
 * Bridges Obsidian vault with MAIA's consciousness systems:
 * - Injects personal knowledge context into Oracle conversations
 * - Enables MAIA to reference user's notes, research, and reflections
 * - Connects journaling history with current conversations
 *
 * Usage in Oracle:
 *   const knowledgeContext = await obsidianIntegration.getOracleContext(userId, topic);
 *   // MAIA can now reference user's notes about the topic
 */

import { EventEmitter } from 'events';
import {
  getObsidianAdapter,
  type KnowledgeResult,
  type NoteContext,
} from '../adapters/ObsidianAdapter';
import { getMCPClientManager } from '../MCPClientManager';

export interface OracleKnowledgeContext {
  available: boolean;
  relevantNotes?: string;
  noteTitles?: string[];
  suggestedConnections?: string[];
  personalContext?: string;
  lastUpdated?: Date;
}

export interface KnowledgeEnrichmentRequest {
  topic: string;
  conversationContext?: string;
  maxNotes?: number;
  includeTags?: string[];
  excludeFolders?: string[];
}

export interface JournalInsight {
  recentEntries: number;
  themes: string[];
  lastEntryDate?: Date;
  relevantExcerpts: string[];
}

/**
 * Obsidian Consciousness Integration
 * Connects personal knowledge with MAIA's awareness
 */
export class ObsidianConsciousnessIntegration extends EventEmitter {
  private adapter = getObsidianAdapter();
  private manager = getMCPClientManager();
  private vaultIndexed = false;

  constructor() {
    super();
  }

  /**
   * Initialize the integration
   */
  async initialize(): Promise<boolean> {
    try {
      await this.manager.initialize();

      if (!this.manager.isConnected('obsidian')) {
        console.log('[ObsidianIntegration] Obsidian MCP not connected');
        return false;
      }

      // Quick vault check
      const stats = await this.adapter.getVaultStats();
      if (stats) {
        this.vaultIndexed = true;
        console.log(`[ObsidianIntegration] Connected to vault with ${stats.totalNotes} notes`);
      }

      return true;
    } catch (error) {
      console.error('[ObsidianIntegration] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Get context for Oracle conversations
   * Main method for enriching MAIA's responses with personal knowledge
   */
  async getOracleContext(
    userId: string,
    request: KnowledgeEnrichmentRequest
  ): Promise<OracleKnowledgeContext> {
    if (!this.manager.isConnected('obsidian')) {
      return { available: false };
    }

    try {
      // Search for relevant notes
      const knowledge = await this.adapter.queryKnowledge({
        query: request.topic,
        limit: request.maxNotes || 3,
        tags: request.includeTags,
      });

      if (knowledge.notes.length === 0) {
        return {
          available: true,
          relevantNotes: '',
          noteTitles: [],
          lastUpdated: new Date(),
        };
      }

      // Build context for Oracle
      const relevantNotes = this.buildKnowledgeContext(knowledge, request);
      const noteTitles = knowledge.notes.map(n => n.title);
      const suggestedConnections = this.findConnections(knowledge);
      const personalContext = this.generatePersonalContext(knowledge, request.topic);

      return {
        available: true,
        relevantNotes,
        noteTitles,
        suggestedConnections,
        personalContext,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('[ObsidianIntegration] Failed to get context:', error);
      return { available: false };
    }
  }

  /**
   * Search for journal entries related to a topic
   * Useful for understanding user's history with a theme
   */
  async getJournalInsights(
    topic: string,
    journalFolder: string = 'Journal'
  ): Promise<JournalInsight> {
    try {
      // Search within journal folder
      const results = await this.adapter.queryKnowledge({
        query: topic,
        limit: 10,
        folder: journalFolder,
      });

      // Extract themes from results
      const themes = new Set<string>();
      const excerpts: string[] = [];

      for (const note of results.notes) {
        // Add tags as themes
        results.relevantTags.forEach(tag => themes.add(tag));

        // Collect excerpts
        if (note.excerpt) {
          excerpts.push(note.excerpt.slice(0, 150));
        }
      }

      return {
        recentEntries: results.notes.length,
        themes: Array.from(themes),
        lastEntryDate: results.notes[0]?.path ? new Date() : undefined, // Would need actual date
        relevantExcerpts: excerpts.slice(0, 3),
      };
    } catch (error) {
      console.error('[ObsidianIntegration] Failed to get journal insights:', error);
      return {
        recentEntries: 0,
        themes: [],
        relevantExcerpts: [],
      };
    }
  }

  /**
   * Find notes that might inform current conversation
   * Called when MAIA detects themes that might have personal context
   */
  async enrichWithPersonalKnowledge(
    themes: string[],
    maxNotesPerTheme: number = 2
  ): Promise<string> {
    const allContext: string[] = [];

    for (const theme of themes.slice(0, 3)) { // Limit to 3 themes
      const knowledge = await this.adapter.findRelatedKnowledge(theme, maxNotesPerTheme);
      if (knowledge) {
        allContext.push(knowledge);
      }
    }

    if (allContext.length === 0) {
      return '';
    }

    return `\n--- Personal Knowledge Context ---\n${allContext.join('\n\n')}`;
  }

  /**
   * Get note content for deep reference
   * When MAIA needs to quote or reference specific content
   */
  async getSpecificNote(notePath: string): Promise<NoteContext | null> {
    return this.adapter.getNoteContext(notePath);
  }

  /**
   * Find connections between current topic and user's knowledge graph
   */
  async findKnowledgeConnections(
    topic: string,
    currentContext: string
  ): Promise<string[]> {
    const connections: string[] = [];

    // Search for topic
    const results = await this.adapter.searchNotes(topic, 5);

    for (const result of results) {
      // Get linked notes
      const note = await this.adapter.readNote(result.path);
      if (note?.links) {
        for (const link of note.links.slice(0, 2)) {
          connections.push(`"${result.title}" links to "${link}"`);
        }
      }
    }

    return connections.slice(0, 5);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private buildKnowledgeContext(
    knowledge: KnowledgeResult,
    request: KnowledgeEnrichmentRequest
  ): string {
    const parts: string[] = [];

    parts.push(`User has ${knowledge.notes.length} note(s) related to "${request.topic}":`);

    for (const note of knowledge.notes) {
      parts.push(`\n**${note.title}**:`);
      parts.push(note.excerpt);
    }

    if (knowledge.relevantTags.length > 0) {
      parts.push(`\nRelated tags: ${knowledge.relevantTags.join(', ')}`);
    }

    return parts.join('\n');
  }

  private findConnections(knowledge: KnowledgeResult): string[] {
    const connections: string[] = [];

    // Suggest exploring related tags
    for (const tag of knowledge.relevantTags.slice(0, 3)) {
      connections.push(`Explore more about ${tag}`);
    }

    // Suggest related notes
    if (knowledge.notes.length > 1) {
      connections.push(`Compare perspectives from "${knowledge.notes[0].title}" and "${knowledge.notes[1].title}"`);
    }

    return connections;
  }

  private generatePersonalContext(
    knowledge: KnowledgeResult,
    topic: string
  ): string {
    if (knowledge.notes.length === 0) {
      return `User hasn't written about "${topic}" yet.`;
    }

    const noteCount = knowledge.notes.length;
    const tagInfo = knowledge.relevantTags.length > 0
      ? ` (themes: ${knowledge.relevantTags.slice(0, 3).join(', ')})`
      : '';

    return `User has explored "${topic}" in ${noteCount} note${noteCount > 1 ? 's' : ''}${tagInfo}. ` +
      `Consider referencing their existing understanding.`;
  }

  /**
   * Check if vault access is available
   */
  isAvailable(): boolean {
    return this.manager.isConnected('obsidian') && this.vaultIndexed;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.removeAllListeners();
  }
}

// Singleton instance
let instance: ObsidianConsciousnessIntegration | null = null;

export function getObsidianConsciousnessIntegration(): ObsidianConsciousnessIntegration {
  if (!instance) {
    instance = new ObsidianConsciousnessIntegration();
  }
  return instance;
}

export function resetObsidianConsciousnessIntegration(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
