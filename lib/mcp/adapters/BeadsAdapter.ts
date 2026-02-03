/**
 * Beads MCP Adapter for MAIA-SOVEREIGN
 *
 * Provides access to the Beads task management system via MCP protocol.
 * Enables MAIA to understand user's tasks, projects, and work patterns.
 *
 * Key capabilities:
 * - List and search tasks/issues
 * - Create and update tasks
 * - Track task completion patterns
 * - Understand work load and priorities
 *
 * Uses: Custom Beads MCP Server (mcp-servers/beads)
 */

import { EventEmitter } from 'events';
import type { MCPToolResult, BeadsIssue } from '../types';
import { getMCPClientManager } from '../MCPClientManager';

// Type aliases for convenience
export type BeadIssue = BeadsIssue;
export type BeadStatus = BeadsIssue['status'];

export interface WorkspaceStatus {
  openCount: number;
  closedCount: number;
  labels: string[];
  recentActivity: BeadIssue[];
}

export interface TaskQuery {
  status?: 'open' | 'closed' | 'all';
  label?: string;
  assigned?: string;
  limit?: number;
}

export interface TaskResult {
  issues: BeadIssue[];
  summary: string;
  totalCount: number;
}

export interface TaskLoad {
  openTasks: number;
  highPriority: number;
  staleCount: number;
  recentlyCompleted: number;
  workloadLevel: 'light' | 'moderate' | 'heavy' | 'overloaded';
}

/**
 * Beads MCP Adapter
 * Provides task-aware access to Beads system
 */
export class BeadsAdapter extends EventEmitter {
  private manager = getMCPClientManager();
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 30000; // 30 seconds for tasks (more dynamic)

  constructor() {
    super();
  }

  /**
   * Check if Beads MCP is connected
   */
  isConnected(): boolean {
    return this.manager.isConnected('beads');
  }

  /**
   * Get available tools from the Beads MCP server
   */
  async getAvailableTools(): Promise<string[]> {
    const allTools = this.manager.getAllTools();
    const beadsTools = allTools.get('beads');
    return beadsTools?.map(t => t.name) || [];
  }

  // ============================================================================
  // Issue Operations
  // ============================================================================

  /**
   * List issues with optional filters
   */
  async listIssues(query: TaskQuery = {}): Promise<BeadIssue[]> {
    const { status = 'open', label, assigned, limit } = query;

    try {
      const result = await this.manager.callTool('beads', {
        name: 'beads_list',
        arguments: { status, label, assigned, limit },
      });

      return this.parseIssueList(result);
    } catch (error) {
      console.error('[BeadsAdapter] Failed to list issues:', error);
      return [];
    }
  }

  /**
   * Get issue by ID
   */
  async getIssue(id: string): Promise<BeadIssue | null> {
    const cacheKey = `issue_${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached as BeadIssue;

    try {
      const result = await this.manager.callTool('beads', {
        name: 'beads_show',
        arguments: { id },
      });

      const issue = this.parseSingleIssue(result);
      if (issue) {
        this.setCache(cacheKey, issue);
        this.emit('issueRead', issue);
      }
      return issue;
    } catch (error) {
      console.error('[BeadsAdapter] Failed to get issue:', error);
      return null;
    }
  }

  /**
   * Search issues by text
   */
  async searchIssues(query: string, limit: number = 10): Promise<BeadIssue[]> {
    try {
      const result = await this.manager.callTool('beads', {
        name: 'beads_search',
        arguments: { query, limit },
      });

      const issues = this.parseIssueList(result);
      this.emit('searchCompleted', { query, results: issues });
      return issues;
    } catch (error) {
      console.error('[BeadsAdapter] Failed to search issues:', error);
      return [];
    }
  }

  /**
   * Create a new issue
   */
  async createIssue(
    title: string,
    options: {
      body?: string;
      labels?: string[];
      priority?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): Promise<BeadIssue | null> {
    try {
      const result = await this.manager.callTool('beads', {
        name: 'beads_create',
        arguments: {
          title,
          body: options.body,
          labels: options.labels,
          priority: options.priority,
        },
      });

      const issue = this.parseSingleIssue(result);
      if (issue) {
        this.emit('issueCreated', issue);
      }
      return issue;
    } catch (error) {
      console.error('[BeadsAdapter] Failed to create issue:', error);
      return null;
    }
  }

  /**
   * Update an issue
   */
  async updateIssue(
    id: string,
    updates: {
      title?: string;
      body?: string;
      status?: string;
      labels?: string[];
    }
  ): Promise<BeadIssue | null> {
    try {
      const result = await this.manager.callTool('beads', {
        name: 'beads_update',
        arguments: { id, ...updates },
      });

      // Invalidate cache
      this.cache.delete(`issue_${id}`);

      const issue = this.parseSingleIssue(result);
      if (issue) {
        this.emit('issueUpdated', issue);
      }
      return issue;
    } catch (error) {
      console.error('[BeadsAdapter] Failed to update issue:', error);
      return null;
    }
  }

  /**
   * Close an issue
   */
  async closeIssue(id: string, reason?: string): Promise<boolean> {
    try {
      await this.manager.callTool('beads', {
        name: 'beads_close',
        arguments: { id, reason },
      });

      // Invalidate cache
      this.cache.delete(`issue_${id}`);
      this.emit('issueClosed', { id, reason });
      return true;
    } catch (error) {
      console.error('[BeadsAdapter] Failed to close issue:', error);
      return false;
    }
  }

  /**
   * Add a comment to an issue
   */
  async addComment(id: string, comment: string): Promise<boolean> {
    try {
      await this.manager.callTool('beads', {
        name: 'beads_comment',
        arguments: { id, comment },
      });

      this.emit('commentAdded', { id, comment });
      return true;
    } catch (error) {
      console.error('[BeadsAdapter] Failed to add comment:', error);
      return false;
    }
  }

  // ============================================================================
  // Workspace Operations
  // ============================================================================

  /**
   * Get workspace status
   */
  async getStatus(): Promise<WorkspaceStatus | null> {
    try {
      const result = await this.manager.callTool('beads', {
        name: 'beads_status',
        arguments: {},
      });

      return this.parseStatus(result);
    } catch (error) {
      console.error('[BeadsAdapter] Failed to get status:', error);
      return null;
    }
  }

  /**
   * Get stale issues
   */
  async getStaleIssues(days: number = 7): Promise<BeadIssue[]> {
    try {
      const result = await this.manager.callTool('beads', {
        name: 'beads_stale',
        arguments: { days },
      });

      return this.parseIssueList(result);
    } catch (error) {
      console.error('[BeadsAdapter] Failed to get stale issues:', error);
      return [];
    }
  }

  // ============================================================================
  // Task Load Analysis (for consciousness integration)
  // ============================================================================

  /**
   * Analyze current task load
   * Main method for consciousness context
   */
  async analyzeTaskLoad(): Promise<TaskLoad> {
    try {
      const [openIssues, staleIssues, status] = await Promise.all([
        this.listIssues({ status: 'open' }),
        this.getStaleIssues(7),
        this.getStatus(),
      ]);

      const highPriority = openIssues.filter(i =>
        i.priority === 'high' || i.priority === 'critical'
      ).length;

      const recentlyCompleted = status?.recentActivity.filter(i =>
        i.status === 'closed'
      ).length || 0;

      // Determine workload level
      let workloadLevel: TaskLoad['workloadLevel'];
      const openCount = openIssues.length;

      if (openCount <= 3) {
        workloadLevel = 'light';
      } else if (openCount <= 8) {
        workloadLevel = 'moderate';
      } else if (openCount <= 15) {
        workloadLevel = 'heavy';
      } else {
        workloadLevel = 'overloaded';
      }

      // Adjust for high priority and stale tasks
      if (highPriority > 3 && workloadLevel !== 'overloaded') {
        workloadLevel = workloadLevel === 'light' ? 'moderate' : 'heavy';
      }

      return {
        openTasks: openCount,
        highPriority,
        staleCount: staleIssues.length,
        recentlyCompleted,
        workloadLevel,
      };
    } catch (error) {
      console.error('[BeadsAdapter] Failed to analyze task load:', error);
      return {
        openTasks: 0,
        highPriority: 0,
        staleCount: 0,
        recentlyCompleted: 0,
        workloadLevel: 'light',
      };
    }
  }

  /**
   * Find related tasks for a topic
   * Used by Oracle for context enrichment
   */
  async findRelatedTasks(topic: string, limit: number = 5): Promise<string> {
    const results = await this.searchIssues(topic, limit);

    if (results.length === 0) {
      return '';
    }

    const contextParts: string[] = [];
    contextParts.push(`Found ${results.length} related tasks in Beads:`);

    for (const issue of results) {
      const priority = issue.priority ? ` [${issue.priority}]` : '';
      contextParts.push(`\n- ${issue.id}: "${issue.title}"${priority}`);
      if (issue.body) {
        contextParts.push(`  ${issue.body.slice(0, 100)}...`);
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

  private parseIssueList(result: MCPToolResult): BeadIssue[] {
    if (result.isError || !result.content) return [];

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return [];

      const data = JSON.parse(textContent.text);
      const issues = Array.isArray(data) ? data : data.issues || [];

      return issues.map((item: Record<string, unknown>) => this.parseIssueItem(item));
    } catch {
      return [];
    }
  }

  private parseSingleIssue(result: MCPToolResult): BeadIssue | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      const data = JSON.parse(textContent.text);
      return this.parseIssueItem(data);
    } catch {
      return null;
    }
  }

  private parseIssueItem(item: Record<string, unknown>): BeadIssue {
    return {
      id: String(item.id || item.key || ''),
      title: String(item.title || item.summary || 'Untitled'),
      body: item.body ? String(item.body) : item.description ? String(item.description) : undefined,
      status: String(item.status || 'open') as BeadStatus,
      priority: item.priority ? String(item.priority) as BeadIssue['priority'] : undefined,
      labels: Array.isArray(item.labels) ? item.labels.map(String) : [],
      assignee: item.assignee ? String(item.assignee) : undefined,
      createdAt: item.createdAt || item.created_at
        ? new Date(item.createdAt as string || item.created_at as string)
        : undefined,
      updatedAt: item.updatedAt || item.updated_at
        ? new Date(item.updatedAt as string || item.updated_at as string)
        : undefined,
      dependencies: Array.isArray(item.dependencies) ? item.dependencies.map(String) : [],
      comments: Array.isArray(item.comments)
        ? item.comments.map((c: Record<string, unknown>) => ({
            id: String(c.id || ''),
            author: String(c.author || 'unknown'),
            content: String(c.content || c.body || ''),
            createdAt: c.createdAt ? new Date(c.createdAt as string) : new Date(),
          }))
        : [],
    };
  }

  private parseStatus(result: MCPToolResult): WorkspaceStatus | null {
    if (result.isError || !result.content) return null;

    try {
      const textContent = result.content.find(c => c.type === 'text');
      if (!textContent?.text) return null;

      const data = JSON.parse(textContent.text);

      return {
        openCount: Number(data.open || data.openCount || 0),
        closedCount: Number(data.closed || data.closedCount || 0),
        labels: Array.isArray(data.labels) ? data.labels.map(String) : [],
        recentActivity: Array.isArray(data.recent || data.recentActivity)
          ? (data.recent || data.recentActivity).map((i: Record<string, unknown>) => this.parseIssueItem(i))
          : [],
      };
    } catch {
      return null;
    }
  }
}

// Singleton instance
let instance: BeadsAdapter | null = null;

export function getBeadsAdapter(): BeadsAdapter {
  if (!instance) {
    instance = new BeadsAdapter();
  }
  return instance;
}

export function resetBeadsAdapter(): void {
  if (instance) {
    instance = null;
  }
}
