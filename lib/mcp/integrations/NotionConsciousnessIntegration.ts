/**
 * Notion Consciousness Integration for MAIA-SOVEREIGN
 *
 * Bridges Notion workspace with MAIA's consciousness systems:
 * - Injects project/task context into Oracle conversations
 * - Enables MAIA to reference user's structured knowledge
 * - Connects workspace activity with consciousness states
 *
 * Usage in Oracle:
 *   const workspaceContext = await notionIntegration.getOracleContext(userId, topic);
 *   // MAIA can now reference user's Notion pages about the topic
 */

import { EventEmitter } from 'events';
import {
  getNotionAdapter,
  type ProjectResult,
  type TaskItem,
} from '../adapters/NotionAdapter';
import { getMCPClientManager } from '../MCPClientManager';
import type { NotionPage } from '../types';

export interface OracleWorkspaceContext {
  available: boolean;
  relevantPages?: string;
  pageTitles?: string[];
  projectContext?: string;
  taskSummary?: string;
  lastUpdated?: Date;
}

export interface WorkspaceEnrichmentRequest {
  topic: string;
  includeProjects?: boolean;
  includeTasks?: boolean;
  maxPages?: number;
  taskDatabaseId?: string;
}

export interface ProjectInsight {
  activeProjects: number;
  recentActivity: string[];
  suggestedFocus?: string;
}

export interface TaskAwareness {
  pendingTasks: number;
  upcomingDeadlines: TaskItem[];
  overdueCount: number;
  focusSuggestion?: string;
}

/**
 * Notion Consciousness Integration
 * Connects workspace knowledge with MAIA's awareness
 */
export class NotionConsciousnessIntegration extends EventEmitter {
  private adapter = getNotionAdapter();
  private manager = getMCPClientManager();
  private workspaceConnected = false;

  constructor() {
    super();
  }

  /**
   * Initialize the integration
   */
  async initialize(): Promise<boolean> {
    try {
      await this.manager.initialize();

      if (!this.manager.isConnected('notion')) {
        console.log('[NotionIntegration] Notion MCP not connected');
        return false;
      }

      this.workspaceConnected = true;
      console.log('[NotionIntegration] Connected to Notion workspace');

      return true;
    } catch (error) {
      console.error('[NotionIntegration] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Get context for Oracle conversations
   * Main method for enriching MAIA's responses with workspace knowledge
   */
  async getOracleContext(
    userId: string,
    request: WorkspaceEnrichmentRequest
  ): Promise<OracleWorkspaceContext> {
    if (!this.manager.isConnected('notion')) {
      return { available: false };
    }

    try {
      // Search for relevant pages
      const pages = await this.adapter.searchPages(request.topic, request.maxPages || 5);

      if (pages.length === 0) {
        return {
          available: true,
          relevantPages: '',
          pageTitles: [],
          lastUpdated: new Date(),
        };
      }

      // Build context
      const relevantPages = this.buildPagesContext(pages, request.topic);
      const pageTitles = pages.map(p => p.title);

      // Optional: Get project context
      let projectContext: string | undefined;
      if (request.includeProjects) {
        const projects = await this.adapter.queryProjects({ query: request.topic, limit: 3 });
        projectContext = this.buildProjectContext(projects);
      }

      // Optional: Get task summary
      let taskSummary: string | undefined;
      if (request.includeTasks && request.taskDatabaseId) {
        const tasks = await this.adapter.getTasks(request.taskDatabaseId, { limit: 5 });
        taskSummary = this.buildTaskSummary(tasks);
      }

      return {
        available: true,
        relevantPages,
        pageTitles,
        projectContext,
        taskSummary,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('[NotionIntegration] Failed to get context:', error);
      return { available: false };
    }
  }

  /**
   * Get project insights for consciousness awareness
   * Useful for understanding user's active focus areas
   */
  async getProjectInsights(projectQuery: string = 'project'): Promise<ProjectInsight> {
    try {
      const recentPages = await this.adapter.getRecentPages(10);

      // Filter for project-like pages
      const projectPages = recentPages.filter(p =>
        p.title.toLowerCase().includes('project') ||
        p.parentType === 'database'
      );

      const recentActivity = recentPages.slice(0, 5).map(p => {
        const timeAgo = this.getTimeAgo(p.lastEditedTime);
        return `"${p.title}" (${timeAgo})`;
      });

      // Suggest focus based on recent activity
      const suggestedFocus = projectPages.length > 0
        ? `Consider focusing on "${projectPages[0].title}" based on recent activity.`
        : undefined;

      return {
        activeProjects: projectPages.length,
        recentActivity,
        suggestedFocus,
      };
    } catch (error) {
      console.error('[NotionIntegration] Failed to get project insights:', error);
      return {
        activeProjects: 0,
        recentActivity: [],
      };
    }
  }

  /**
   * Get task awareness for consciousness context
   * Helps MAIA understand user's task load
   */
  async getTaskAwareness(taskDatabaseId: string): Promise<TaskAwareness> {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get pending tasks
      const pendingTasks = await this.adapter.getTasks(taskDatabaseId, {
        status: 'In Progress',
        limit: 50,
      });

      // Get tasks due soon
      const upcomingTasks = await this.adapter.getTasks(taskDatabaseId, {
        dueBefore: weekFromNow,
        limit: 10,
      });

      // Filter for upcoming deadlines (within 7 days, not overdue)
      const upcomingDeadlines = upcomingTasks.filter(t =>
        t.dueDate && t.dueDate >= now && t.dueDate <= weekFromNow
      );

      // Count overdue
      const overdueCount = upcomingTasks.filter(t =>
        t.dueDate && t.dueDate < now
      ).length;

      // Generate focus suggestion
      let focusSuggestion: string | undefined;
      if (overdueCount > 0) {
        focusSuggestion = `${overdueCount} task${overdueCount > 1 ? 's are' : ' is'} overdue - may need attention.`;
      } else if (upcomingDeadlines.length > 0) {
        const nextDue = upcomingDeadlines[0];
        focusSuggestion = `Next deadline: "${nextDue.title}" due ${this.formatDueDate(nextDue.dueDate!)}.`;
      } else if (pendingTasks.length === 0) {
        focusSuggestion = 'Task list is clear - good time for deep work or new projects.';
      }

      return {
        pendingTasks: pendingTasks.length,
        upcomingDeadlines,
        overdueCount,
        focusSuggestion,
      };
    } catch (error) {
      console.error('[NotionIntegration] Failed to get task awareness:', error);
      return {
        pendingTasks: 0,
        upcomingDeadlines: [],
        overdueCount: 0,
      };
    }
  }

  /**
   * Find pages related to current conversation themes
   * Called when MAIA detects themes that might have workspace context
   */
  async enrichWithWorkspaceKnowledge(
    themes: string[],
    maxPagesPerTheme: number = 2
  ): Promise<string> {
    const allContext: string[] = [];

    for (const theme of themes.slice(0, 3)) { // Limit to 3 themes
      const knowledge = await this.adapter.findRelatedKnowledge(theme, maxPagesPerTheme);
      if (knowledge) {
        allContext.push(knowledge);
      }
    }

    if (allContext.length === 0) {
      return '';
    }

    return `\n--- Notion Workspace Context ---\n${allContext.join('\n\n')}`;
  }

  /**
   * Get page content for deep reference
   * When MAIA needs to quote or reference specific content
   */
  async getPageContent(pageId: string): Promise<{
    title: string;
    content: string;
  } | null> {
    const page = await this.adapter.getPage(pageId);
    if (!page) return null;

    const content = await this.adapter.getPageContent(pageId);

    return {
      title: page.title,
      content,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private buildPagesContext(pages: NotionPage[], topic: string): string {
    const parts: string[] = [];

    parts.push(`User has ${pages.length} page(s) in Notion related to "${topic}":`);

    for (const page of pages) {
      parts.push(`\n**${page.title}**`);
      if (page.excerpt) {
        parts.push(page.excerpt);
      }
    }

    return parts.join('\n');
  }

  private buildProjectContext(projects: ProjectResult): string {
    if (projects.pages.length === 0) {
      return '';
    }

    const parts: string[] = [];
    parts.push(`Related projects in workspace:`);

    for (const page of projects.pages.slice(0, 3)) {
      parts.push(`- ${page.title}`);
    }

    return parts.join('\n');
  }

  private buildTaskSummary(tasks: TaskItem[]): string {
    if (tasks.length === 0) {
      return 'No active tasks found.';
    }

    const byStatus = new Map<string, number>();
    for (const task of tasks) {
      byStatus.set(task.status, (byStatus.get(task.status) || 0) + 1);
    }

    const statusParts: string[] = [];
    byStatus.forEach((count, status) => {
      statusParts.push(`${count} ${status.toLowerCase()}`);
    });

    return `Task summary: ${statusParts.join(', ')}.`;
  }

  private getTimeAgo(date?: Date): string {
    if (!date) return 'unknown';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays}d ago`;
  }

  private formatDueDate(date: Date): string {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Check if workspace access is available
   */
  isAvailable(): boolean {
    return this.manager.isConnected('notion') && this.workspaceConnected;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.removeAllListeners();
  }
}

// Singleton instance
let instance: NotionConsciousnessIntegration | null = null;

export function getNotionConsciousnessIntegration(): NotionConsciousnessIntegration {
  if (!instance) {
    instance = new NotionConsciousnessIntegration();
  }
  return instance;
}

export function resetNotionConsciousnessIntegration(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
