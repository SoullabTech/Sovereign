/**
 * Beads Consciousness Integration for MAIA-SOVEREIGN
 *
 * Bridges Beads task system with MAIA's consciousness systems:
 * - Injects task context into Oracle conversations
 * - Enables MAIA to understand work patterns and load
 * - Correlates task activity with consciousness states
 *
 * Usage in Oracle:
 *   const taskContext = await beadsIntegration.getOracleContext(userId);
 *   // MAIA can now reference user's tasks and work patterns
 */

import { EventEmitter } from 'events';
import {
  getBeadsAdapter,
  type TaskLoad,
  type WorkspaceStatus,
  type BeadIssue,
} from '../adapters/BeadsAdapter';
import { getMCPClientManager } from '../MCPClientManager';

export interface OracleTaskContext {
  available: boolean;
  workloadSummary?: string;
  taskLoadLevel?: 'light' | 'moderate' | 'heavy' | 'overloaded';
  focusSuggestion?: string;
  staleTasks?: string;
  relatedTasks?: string;
  lastUpdated?: Date;
}

export interface TaskAwarenessEvent {
  type: 'high_priority' | 'stale_task' | 'workload_shift' | 'completion';
  description: string;
  relevance: 'high' | 'medium' | 'low';
  issueId?: string;
}

export interface ProductivityInsight {
  recentCompletions: number;
  averageTimeToClose: number; // days
  staleTrend: 'improving' | 'stable' | 'declining';
  suggestedAction?: string;
}

/**
 * Beads Consciousness Integration
 * Connects task awareness with MAIA's guidance
 */
export class BeadsConsciousnessIntegration extends EventEmitter {
  private adapter = getBeadsAdapter();
  private manager = getMCPClientManager();
  private beadsConnected = false;
  private lastTaskLoad: TaskLoad | null = null;

  constructor() {
    super();
  }

  /**
   * Initialize the integration
   */
  async initialize(): Promise<boolean> {
    try {
      await this.manager.initialize();

      if (!this.manager.isConnected('beads')) {
        console.log('[BeadsIntegration] Beads MCP not connected');
        return false;
      }

      // Quick status check
      const status = await this.adapter.getStatus();
      if (status) {
        this.beadsConnected = true;
        console.log(`[BeadsIntegration] Connected to Beads with ${status.openCount} open issues`);
      }

      return true;
    } catch (error) {
      console.error('[BeadsIntegration] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Get context for Oracle conversations
   * Main method for enriching MAIA's responses with task awareness
   */
  async getOracleContext(userId: string, topic?: string): Promise<OracleTaskContext> {
    if (!this.manager.isConnected('beads')) {
      return { available: false };
    }

    try {
      const taskLoad = await this.adapter.analyzeTaskLoad();
      this.lastTaskLoad = taskLoad;

      // Build workload summary
      const workloadSummary = this.buildWorkloadSummary(taskLoad);

      // Generate focus suggestion
      const focusSuggestion = this.generateFocusSuggestion(taskLoad);

      // Find stale tasks
      let staleTasks: string | undefined;
      if (taskLoad.staleCount > 0) {
        const staleIssues = await this.adapter.getStaleIssues(7);
        staleTasks = this.formatStaleTasks(staleIssues);
      }

      // Find related tasks if topic provided
      let relatedTasks: string | undefined;
      if (topic) {
        relatedTasks = await this.adapter.findRelatedTasks(topic, 3);
      }

      return {
        available: true,
        workloadSummary,
        taskLoadLevel: taskLoad.workloadLevel,
        focusSuggestion,
        staleTasks,
        relatedTasks,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('[BeadsIntegration] Failed to get context:', error);
      return { available: false };
    }
  }

  /**
   * Get high-priority tasks for immediate attention
   */
  async getHighPriorityTasks(): Promise<BeadIssue[]> {
    const allOpen = await this.adapter.listIssues({ status: 'open' });
    return allOpen.filter(i =>
      i.priority === 'high' || i.priority === 'critical'
    );
  }

  /**
   * Generate task awareness events for consciousness tracking
   */
  async generateAwarenessEvents(): Promise<TaskAwarenessEvent[]> {
    const events: TaskAwarenessEvent[] = [];
    const taskLoad = await this.adapter.analyzeTaskLoad();

    // High priority alerts
    if (taskLoad.highPriority > 0) {
      events.push({
        type: 'high_priority',
        description: `${taskLoad.highPriority} high-priority task${taskLoad.highPriority > 1 ? 's' : ''} need attention`,
        relevance: 'high',
      });
    }

    // Stale task alerts
    if (taskLoad.staleCount > 0) {
      events.push({
        type: 'stale_task',
        description: `${taskLoad.staleCount} task${taskLoad.staleCount > 1 ? 's' : ''} haven't been updated in a week`,
        relevance: taskLoad.staleCount > 3 ? 'high' : 'medium',
      });
    }

    // Workload alerts
    if (taskLoad.workloadLevel === 'overloaded') {
      events.push({
        type: 'workload_shift',
        description: 'Task load is very high - consider prioritization or delegation',
        relevance: 'high',
      });
    } else if (taskLoad.workloadLevel === 'heavy') {
      events.push({
        type: 'workload_shift',
        description: 'Task load is elevated - stay mindful of capacity',
        relevance: 'medium',
      });
    }

    // Recent completions (positive reinforcement)
    if (taskLoad.recentlyCompleted > 0) {
      events.push({
        type: 'completion',
        description: `${taskLoad.recentlyCompleted} task${taskLoad.recentlyCompleted > 1 ? 's' : ''} recently completed`,
        relevance: 'low',
      });
    }

    return events;
  }

  /**
   * Get productivity insights
   */
  async getProductivityInsights(): Promise<ProductivityInsight> {
    const taskLoad = await this.adapter.analyzeTaskLoad();
    const staleIssues = await this.adapter.getStaleIssues(7);

    // Determine stale trend
    let staleTrend: ProductivityInsight['staleTrend'] = 'stable';
    if (staleIssues.length === 0) {
      staleTrend = 'improving';
    } else if (staleIssues.length > 5) {
      staleTrend = 'declining';
    }

    // Generate suggested action
    let suggestedAction: string | undefined;
    if (taskLoad.workloadLevel === 'overloaded') {
      suggestedAction = 'Consider breaking large tasks into smaller pieces or renegotiating deadlines.';
    } else if (staleIssues.length > 3) {
      suggestedAction = 'Review stale tasks - close, defer, or re-prioritize.';
    } else if (taskLoad.highPriority > 5) {
      suggestedAction = 'Too many high-priority items - consider relative prioritization.';
    } else if (taskLoad.openTasks < 3 && taskLoad.workloadLevel === 'light') {
      suggestedAction = 'Good time to take on a new project or tackle backlog items.';
    }

    return {
      recentCompletions: taskLoad.recentlyCompleted,
      averageTimeToClose: 0, // Would need historical data
      staleTrend,
      suggestedAction,
    };
  }

  /**
   * Check if current task load supports deep work
   */
  async canSupportDeepWork(): Promise<{
    supported: boolean;
    reason: string;
  }> {
    const taskLoad = await this.adapter.analyzeTaskLoad();

    if (taskLoad.highPriority > 3) {
      return {
        supported: false,
        reason: `${taskLoad.highPriority} high-priority tasks may cause interruptions`,
      };
    }

    if (taskLoad.workloadLevel === 'overloaded') {
      return {
        supported: false,
        reason: 'Task load is too high - consider clearing some items first',
      };
    }

    return {
      supported: true,
      reason: 'Task load allows for focused work',
    };
  }

  /**
   * Quick capture a task from conversation
   * Creates a bead/issue from natural language
   */
  async quickCapture(
    title: string,
    options: {
      body?: string;
      labels?: string[];
      priority?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): Promise<BeadIssue | null> {
    return this.adapter.createIssue(title, options);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private buildWorkloadSummary(taskLoad: TaskLoad): string {
    const parts: string[] = [];

    parts.push(`${taskLoad.openTasks} open task${taskLoad.openTasks !== 1 ? 's' : ''}`);

    if (taskLoad.highPriority > 0) {
      parts.push(`${taskLoad.highPriority} high-priority`);
    }

    if (taskLoad.staleCount > 0) {
      parts.push(`${taskLoad.staleCount} stale`);
    }

    const summary = parts.join(', ');
    const level = this.formatWorkloadLevel(taskLoad.workloadLevel);

    return `Workload: ${level}. ${summary}.`;
  }

  private formatWorkloadLevel(level: TaskLoad['workloadLevel']): string {
    switch (level) {
      case 'light':
        return 'Light';
      case 'moderate':
        return 'Moderate';
      case 'heavy':
        return 'Heavy';
      case 'overloaded':
        return 'Overloaded';
    }
  }

  private generateFocusSuggestion(taskLoad: TaskLoad): string {
    if (taskLoad.workloadLevel === 'overloaded') {
      return 'Consider prioritizing ruthlessly - what can be deferred or delegated?';
    }

    if (taskLoad.highPriority > 3) {
      return 'Focus on clearing high-priority items before taking on new work.';
    }

    if (taskLoad.staleCount > 3) {
      return 'Some tasks are going stale - consider quick review and cleanup.';
    }

    if (taskLoad.workloadLevel === 'light') {
      return 'Workload is light - good time for creative or strategic work.';
    }

    return 'Balanced workload - maintain steady progress on priorities.';
  }

  private formatStaleTasks(issues: BeadIssue[]): string {
    if (issues.length === 0) return '';

    const formatted = issues.slice(0, 3).map(i =>
      `- ${i.id}: "${i.title}"`
    ).join('\n');

    return `Stale tasks (no updates in 7+ days):\n${formatted}`;
  }

  /**
   * Check if beads access is available
   */
  isAvailable(): boolean {
    return this.manager.isConnected('beads') && this.beadsConnected;
  }

  /**
   * Get last known task load (cached)
   */
  getLastTaskLoad(): TaskLoad | null {
    return this.lastTaskLoad;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.removeAllListeners();
  }
}

// Singleton instance
let instance: BeadsConsciousnessIntegration | null = null;

export function getBeadsConsciousnessIntegration(): BeadsConsciousnessIntegration {
  if (!instance) {
    instance = new BeadsConsciousnessIntegration();
  }
  return instance;
}

export function resetBeadsConsciousnessIntegration(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
