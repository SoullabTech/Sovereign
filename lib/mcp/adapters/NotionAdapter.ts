/**
 * Notion MCP Adapter for MAIA-SOVEREIGN
 *
 * Provides access to user's Notion workspace via MCP protocol.
 * Enables MAIA to reference projects, tasks, and structured knowledge.
 *
 * Key capabilities:
 * - Search pages and databases
 * - Read page content
 * - Query databases
 * - Access project/task structures
 *
 * Uses: Official Notion MCP Server
 * https://github.com/makenotion/notion-mcp-server
 */

import { EventEmitter } from 'events';
import type { MCPToolResult, NotionPage, NotionDatabase } from '../types';
import { getMCPClientManager } from '../MCPClientManager';

export interface WorkspaceStats {
  totalPages: number;
  totalDatabases: number;
  recentlyEdited: NotionPage[];
}

export interface PageContext {
  page: NotionPage;
  childPages: NotionPage[];
  linkedDatabases: NotionDatabase[];
}

export interface ProjectQuery {
  query: string;
  database?: string;
  status?: string;
  limit?: number;
}

export interface ProjectResult {
  pages: NotionPage[];
  summary: string;
  relatedDatabases: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority?: string;
  dueDate?: Date;
  project?: string;
  tags: string[];
}

/**
 * Notion MCP Adapter
 * Provides workspace-aware access to user's Notion
 */
export class NotionAdapter extends EventEmitter {
  private manager = getMCPClientManager();
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 120000; // 2 minutes for Notion (less volatile than calendar)

  constructor() {
    super();
  }

  /**
   * Check if Notion MCP is connected
   */
  isConnected(): boolean {
    return this.manager.isConnected('notion');
  }

  /**
   * Get available tools from the Notion MCP server
   */
  async getAvailableTools(): Promise<string[]> {
    const allTools = this.manager.getAllTools();
    const notionTools = allTools.get('notion');
    return notionTools?.map(t => t.name) || [];
  }

  // ============================================================================
  // Page Operations
  // ============================================================================

  /**
   * Search pages by query
   */
  async searchPages(query: string, limit: number = 10): Promise<NotionPage[]> {
    try {
      const result = await this.manager.callTool('notion', {
        name: 'search',
        arguments: {
          query,
          filter: { property: 'object', value: 'page' },
          page_size: limit,
        },
      });

      const pages = this.parsePageResults(result);
      this.emit('searchCompleted', { query, results: pages });
      return pages;
    } catch (error) {
      console.error('[NotionAdapter] Failed to search pages:', error);
      return [];
    }
  }

  /**
   * Get page by ID
   */
  async getPage(pageId: string): Promise<NotionPage | null> {
    const cacheKey = `page_${pageId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as NotionPage;

    try {
      const result = await this.manager.callTool('notion', {
        name: 'get_page',
        arguments: { page_id: pageId },
      });

      const page = this.parseSinglePage(result);
      if (page) {
        this.setCache(cacheKey, page);
        this.emit('pageRead', page);
      }
      return page;
    } catch (error) {
      console.error('[NotionAdapter] Failed to get page:', error);
      return null;
    }
  }

  /**
   * Get page content (blocks)
   */
  async getPageContent(pageId: string): Promise<string> {
    try {
      const result = await this.manager.callTool('notion', {
        name: 'get_block_children',
        arguments: { block_id: pageId },
      });

      return this.parseBlocksToText(result);
    } catch (error) {
      console.error('[NotionAdapter] Failed to get page content:', error);
      return '';
    }
  }

  /**
   * Get recently edited pages
   */
  async getRecentPages(limit: number = 10): Promise<NotionPage[]> {
    try {
      const result = await this.manager.callTool('notion', {
        name: 'search',
        arguments: {
          sort: { direction: 'descending', timestamp: 'last_edited_time' },
          filter: { property: 'object', value: 'page' },
          page_size: limit,
        },
      });

      return this.parsePageResults(result);
    } catch (error) {
      console.error('[NotionAdapter] Failed to get recent pages:', error);
      return [];
    }
  }

  // ============================================================================
  // Database Operations
  // ============================================================================

  /**
   * Query a database
   */
  async queryDatabase(
    databaseId: string,
    filter?: Record<string, unknown>,
    sorts?: Array<{ property: string; direction: 'ascending' | 'descending' }>,
    limit: number = 100
  ): Promise<NotionPage[]> {
    try {
      const result = await this.manager.callTool('notion', {
        name: 'query_database',
        arguments: {
          database_id: databaseId,
          filter,
          sorts,
          page_size: limit,
        },
      });

      return this.parsePageResults(result);
    } catch (error) {
      console.error('[NotionAdapter] Failed to query database:', error);
      return [];
    }
  }

  /**
   * Get database schema
   */
  async getDatabaseSchema(databaseId: string): Promise<NotionDatabase | null> {
    try {
      const result = await this.manager.callTool('notion', {
        name: 'get_database',
        arguments: { database_id: databaseId },
      });

      return this.parseDatabase(result);
    } catch (error) {
      console.error('[NotionAdapter] Failed to get database:', error);
      return null;
    }
  }

  /**
   * Search databases
   */
  async searchDatabases(query: string, limit: number = 10): Promise<NotionDatabase[]> {
    try {
      const result = await this.manager.callTool('notion', {
        name: 'search',
        arguments: {
          query,
          filter: { property: 'object', value: 'database' },
          page_size: limit,
        },
      });

      return this.parseDatabaseResults(result);
    } catch (error) {
      console.error('[NotionAdapter] Failed to search databases:', error);
      return [];
    }
  }

  // ============================================================================
  // Project/Task Operations (for consciousness integration)
  // ============================================================================

  /**
   * Query projects from workspace
   * Searches for project-like pages/databases
   */
  async queryProjects(query: ProjectQuery): Promise<ProjectResult> {
    const { query: searchQuery, database, status, limit = 10 } = query;

    try {
      let results: NotionPage[];

      if (database) {
        // Query specific database
        const filter = status
          ? { property: 'Status', select: { equals: status } }
          : undefined;
        results = await this.queryDatabase(database, filter, undefined, limit);
      } else {
        // Search all pages
        results = await this.searchPages(searchQuery, limit);
      }

      // Find related databases
      const databases = await this.searchDatabases('project', 3);
      const relatedDatabases = databases.map(d => d.title);

      const summary = this.generateProjectSummary(searchQuery, results);

      return {
        pages: results,
        summary,
        relatedDatabases,
      };
    } catch (error) {
      console.error('[NotionAdapter] Failed to query projects:', error);
      return {
        pages: [],
        summary: 'Unable to access project data.',
        relatedDatabases: [],
      };
    }
  }

  /**
   * Get tasks from a task database
   * Assumes common task database structure
   */
  async getTasks(
    databaseId: string,
    options: {
      status?: string;
      assignee?: string;
      dueBefore?: Date;
      limit?: number;
    } = {}
  ): Promise<TaskItem[]> {
    const { status, assignee, dueBefore, limit = 50 } = options;

    try {
      // Build filter
      const filterConditions: Array<Record<string, unknown>> = [];

      if (status) {
        filterConditions.push({
          property: 'Status',
          select: { equals: status },
        });
      }

      if (assignee) {
        filterConditions.push({
          property: 'Assignee',
          people: { contains: assignee },
        });
      }

      if (dueBefore) {
        filterConditions.push({
          property: 'Due',
          date: { on_or_before: dueBefore.toISOString() },
        });
      }

      const filter = filterConditions.length > 0
        ? { and: filterConditions }
        : undefined;

      const results = await this.queryDatabase(
        databaseId,
        filter,
        [{ property: 'Due', direction: 'ascending' }],
        limit
      );

      return results.map(page => this.pageToTask(page));
    } catch (error) {
      console.error('[NotionAdapter] Failed to get tasks:', error);
      return [];
    }
  }

  /**
   * Find related knowledge for a topic
   * Used by Oracle for context enrichment
   */
  async findRelatedKnowledge(topic: string, maxPages: number = 3): Promise<string> {
    const results = await this.searchPages(topic, maxPages);

    if (results.length === 0) {
      return '';
    }

    const contextParts: string[] = [];
    contextParts.push(`Found ${results.length} relevant pages in Notion:`);

    for (const page of results) {
      contextParts.push(`\n- "${page.title}"`);
      if (page.excerpt) {
        contextParts.push(`  ${page.excerpt.slice(0, 150)}...`);
      }
    }

    return contextParts.join('\n');
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

  private parsePageResults(result: MCPToolResult): NotionPage[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      const results = data.results || data;
      if (!Array.isArray(results)) return [];

      return results.map((item: Record<string, unknown>) => this.parsePageItem(item));
    } catch {
      return [];
    }
  }

  private parseSinglePage(result: MCPToolResult): NotionPage | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      const data = JSON.parse(textContent.text);
      return this.parsePageItem(data);
    } catch {
      return null;
    }
  }

  private parsePageItem(item: Record<string, unknown>): NotionPage {
    const properties = item.properties as Record<string, Record<string, unknown>> || {};

    // Extract title from various possible locations
    let title = 'Untitled';
    if (properties.title?.title) {
      const titleArray = properties.title.title as Array<{ plain_text?: string }>;
      title = titleArray.map(t => t.plain_text || '').join('') || 'Untitled';
    } else if (properties.Name?.title) {
      const titleArray = properties.Name.title as Array<{ plain_text?: string }>;
      title = titleArray.map(t => t.plain_text || '').join('') || 'Untitled';
    }

    return {
      id: String(item.id || ''),
      title,
      url: String(item.url || ''),
      createdTime: item.created_time ? new Date(item.created_time as string) : undefined,
      lastEditedTime: item.last_edited_time ? new Date(item.last_edited_time as string) : undefined,
      properties,
      parentType: this.getParentType(item.parent as Record<string, unknown>),
      parentId: this.getParentId(item.parent as Record<string, unknown>),
      excerpt: this.extractExcerpt(properties),
    };
  }

  private parseDatabase(result: MCPToolResult): NotionDatabase | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      const data = JSON.parse(textContent.text);
      return this.parseDatabaseItem(data);
    } catch {
      return null;
    }
  }

  private parseDatabaseResults(result: MCPToolResult): NotionDatabase[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      const results = data.results || data;
      if (!Array.isArray(results)) return [];

      return results.map((item: Record<string, unknown>) => this.parseDatabaseItem(item));
    } catch {
      return [];
    }
  }

  private parseDatabaseItem(item: Record<string, unknown>): NotionDatabase {
    const titleArray = item.title as Array<{ plain_text?: string }> || [];
    const title = titleArray.map(t => t.plain_text || '').join('') || 'Untitled Database';

    const properties = item.properties as Record<string, Record<string, unknown>> || {};

    const propRecord: Record<string, { name: string; type: string }> = {};
    for (const key of Object.keys(properties)) {
      propRecord[key] = {
        name: key,
        type: String((properties[key] as Record<string, unknown>)?.type || 'unknown'),
      };
    }

    return {
      id: String(item.id || ''),
      title,
      url: String(item.url || ''),
      properties: propRecord,
      createdTime: item.created_time ? new Date(item.created_time as string) : undefined,
      lastEditedTime: item.last_edited_time ? new Date(item.last_edited_time as string) : undefined,
    };
  }

  private parseBlocksToText(result: MCPToolResult): string {
    if (result.isError || !result.content) return '';

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return '';

      const data = JSON.parse(textContent.text);
      const blocks = data.results || data;
      if (!Array.isArray(blocks)) return '';

      const textParts: string[] = [];

      for (const block of blocks) {
        const blockType = block.type as string;
        const blockContent = block[blockType] as Record<string, unknown>;

        if (blockContent?.rich_text) {
          const richText = blockContent.rich_text as Array<{ plain_text?: string }>;
          const text = richText.map(t => t.plain_text || '').join('');
          if (text) textParts.push(text);
        }
      }

      return textParts.join('\n');
    } catch {
      return '';
    }
  }

  private getParentType(parent: Record<string, unknown> | undefined): 'database' | 'page' | 'workspace' {
    if (!parent) return 'workspace';
    if (parent.database_id) return 'database';
    if (parent.page_id) return 'page';
    return 'workspace';
  }

  private getParentId(parent: Record<string, unknown> | undefined): string | undefined {
    if (!parent) return undefined;
    return String(parent.database_id || parent.page_id || '');
  }

  private extractExcerpt(properties: Record<string, Record<string, unknown>>): string | undefined {
    // Look for common description/summary properties
    const descProps = ['Description', 'Summary', 'Notes', 'Content'];

    for (const prop of descProps) {
      if (properties[prop]?.rich_text) {
        const richText = properties[prop].rich_text as Array<{ plain_text?: string }>;
        const text = richText.map(t => t.plain_text || '').join('');
        if (text) return text.slice(0, 200);
      }
    }

    return undefined;
  }

  private pageToTask(page: NotionPage): TaskItem {
    const props = page.properties || {};

    // Helper to safely access nested properties
    const getProp = (key: string): Record<string, unknown> | undefined => {
      const prop = props[key];
      return prop && typeof prop === 'object' ? prop as Record<string, unknown> : undefined;
    };

    // Extract status
    let status = 'Unknown';
    const statusProp = getProp('Status');
    if (statusProp?.select && typeof statusProp.select === 'object') {
      const selectObj = statusProp.select as Record<string, unknown>;
      status = String(selectObj.name || 'Unknown');
    }

    // Extract priority
    let priority: string | undefined;
    const priorityProp = getProp('Priority');
    if (priorityProp?.select && typeof priorityProp.select === 'object') {
      const selectObj = priorityProp.select as Record<string, unknown>;
      priority = String(selectObj.name || '');
    }

    // Extract due date
    let dueDate: Date | undefined;
    const dueProp = getProp('Due');
    if (dueProp?.date && typeof dueProp.date === 'object') {
      const dateObj = dueProp.date as Record<string, unknown>;
      if (dateObj.start) {
        dueDate = new Date(dateObj.start as string);
      }
    }

    // Extract project
    let project: string | undefined;
    const projectProp = getProp('Project');
    if (projectProp?.relation && Array.isArray(projectProp.relation)) {
      const relations = projectProp.relation as Array<{ id: string }>;
      if (relations.length > 0) {
        project = relations[0].id;
      }
    }

    // Extract tags
    const tags: string[] = [];
    const tagsProp = getProp('Tags');
    if (tagsProp?.multi_select && Array.isArray(tagsProp.multi_select)) {
      const multiSelect = tagsProp.multi_select as Array<{ name: string }>;
      tags.push(...multiSelect.map(t => t.name));
    }

    return {
      id: page.id,
      title: page.title,
      status,
      priority,
      dueDate,
      project,
      tags,
    };
  }

  private generateProjectSummary(query: string, results: NotionPage[]): string {
    if (results.length === 0) {
      return `No pages found matching "${query}".`;
    }

    const count = results.length;
    const topResult = results[0];

    return `Found ${count} page${count > 1 ? 's' : ''} related to "${query}". ` +
      `Most relevant: "${topResult.title}".`;
  }
}

// Singleton instance
let instance: NotionAdapter | null = null;

export function getNotionAdapter(): NotionAdapter {
  if (!instance) {
    instance = new NotionAdapter();
  }
  return instance;
}

export function resetNotionAdapter(): void {
  if (instance) {
    instance = null;
  }
}
