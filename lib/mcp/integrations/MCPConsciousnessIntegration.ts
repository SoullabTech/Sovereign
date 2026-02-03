/**
 * MCP Consciousness Integration for MAIA-SOVEREIGN
 *
 * Gathers contextual data from all MCP sources and injects it into
 * the consciousness pipeline for enriched Oracle responses.
 *
 * Data Sources:
 * - Apple Health: HRV, sleep quality, heart rate for biometric context
 * - Calendar: Schedule awareness for timing-sensitive guidance
 * - Obsidian: Personal knowledge base for memory augmentation
 * - Beads: Task load for workload-aware responses
 * - Ganglion: Real-time EEG for consciousness state detection
 */

import { getAppleHealthAdapter, type HealthMetricsSummary } from '../adapters/AppleHealthAdapter';
import { getCalendarAdapter, type DaySchedule } from '../adapters/CalendarAdapter';
import { getObsidianAdapter, type KnowledgeResult } from '../adapters/ObsidianAdapter';
import { getBeadsAdapter, type TaskLoad } from '../adapters/BeadsAdapter';
import { getGanglionAdapter, type ConsciousnessState } from '../adapters/GanglionAdapter';

// ============================================================================
// Types
// ============================================================================

export interface MCPContextBundle {
  health?: {
    available: boolean;
    summary?: HealthMetricsSummary;
    hrvContext?: string;
    sleepContext?: string;
    energyContext?: string;
  };
  calendar?: {
    available: boolean;
    schedule?: DaySchedule;
    upcomingContext?: string;
    busyLevel?: 'light' | 'moderate' | 'packed';
  };
  knowledge?: {
    available: boolean;
    relevantNotes?: KnowledgeResult;
    contextSnippet?: string;
  };
  tasks?: {
    available: boolean;
    load?: TaskLoad;
    workloadContext?: string;
    focusSuggestion?: string;
  };
  consciousness?: {
    available: boolean;
    state?: ConsciousnessState;
    focusLevel?: number;
    meditationScore?: number;
    stateContext?: string;
  };
  metadata: {
    gatheredAt: Date;
    sourcesAvailable: string[];
    sourcesFailed: string[];
    totalSources: number;
    successRate: number;
  };
}

export interface OracleContextEnrichment {
  // Formatted string for system prompt injection
  contextBlock: string;
  // Structured data for consciousness analysis
  biometricCorrelation?: {
    hrvLevel: 'low' | 'moderate' | 'high';
    energyState: 'depleted' | 'normal' | 'energized';
    sleepQuality: 'poor' | 'moderate' | 'good';
  };
  // Schedule awareness
  timingGuidance?: {
    isBusy: boolean;
    nextCommitment?: string;
    suggestedPace: 'brief' | 'standard' | 'expansive';
  };
  // Workload context
  taskContext?: {
    workloadLevel: 'light' | 'moderate' | 'heavy' | 'overloaded';
    highPriorityCount: number;
    focusSuggestion?: string;
  };
  // Consciousness state (if EEG available)
  consciousnessMarkers?: {
    focusScore: number;
    meditationScore: number;
    coherence: number;
    suggestedApproach: 'analytical' | 'intuitive' | 'grounding';
  };
}

// ============================================================================
// Main Integration Class
// ============================================================================

export class MCPConsciousnessIntegration {
  private healthAdapter = getAppleHealthAdapter();
  private calendarAdapter = getCalendarAdapter();
  private obsidianAdapter = getObsidianAdapter();
  private beadsAdapter = getBeadsAdapter();
  private ganglionAdapter = getGanglionAdapter();

  // Cache for expensive operations (5 minute TTL)
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Gather all available MCP context for a user query
   */
  async gatherContext(
    userId: string,
    query: string,
    options: {
      includeHealth?: boolean;
      includeCalendar?: boolean;
      includeKnowledge?: boolean;
      includeTasks?: boolean;
      includeConsciousness?: boolean;
    } = {}
  ): Promise<MCPContextBundle> {
    const {
      includeHealth = true,
      includeCalendar = true,
      includeKnowledge = true,
      includeTasks = true,
      includeConsciousness = true,
    } = options;

    const sourcesAvailable: string[] = [];
    const sourcesFailed: string[] = [];

    // Gather all contexts in parallel
    const [health, calendar, knowledge, tasks, consciousness] = await Promise.all([
      includeHealth ? this.gatherHealthContext().catch(() => null) : null,
      includeCalendar ? this.gatherCalendarContext().catch(() => null) : null,
      includeKnowledge ? this.gatherKnowledgeContext(query).catch(() => null) : null,
      includeTasks ? this.gatherTaskContext().catch(() => null) : null,
      includeConsciousness ? this.gatherConsciousnessContext().catch(() => null) : null,
    ]);

    // Track sources
    if (health?.available) sourcesAvailable.push('appleHealth');
    else if (includeHealth) sourcesFailed.push('appleHealth');

    if (calendar?.available) sourcesAvailable.push('calendar');
    else if (includeCalendar) sourcesFailed.push('calendar');

    if (knowledge?.available) sourcesAvailable.push('obsidian');
    else if (includeKnowledge) sourcesFailed.push('obsidian');

    if (tasks?.available) sourcesAvailable.push('beads');
    else if (includeTasks) sourcesFailed.push('beads');

    if (consciousness?.available) sourcesAvailable.push('ganglion');
    else if (includeConsciousness) sourcesFailed.push('ganglion');

    const totalSources = sourcesAvailable.length + sourcesFailed.length;

    return {
      health: health || undefined,
      calendar: calendar || undefined,
      knowledge: knowledge || undefined,
      tasks: tasks || undefined,
      consciousness: consciousness || undefined,
      metadata: {
        gatheredAt: new Date(),
        sourcesAvailable,
        sourcesFailed,
        totalSources,
        successRate: totalSources > 0 ? sourcesAvailable.length / totalSources : 0,
      },
    };
  }

  /**
   * Generate enrichment for Oracle system prompt
   */
  async generateOracleEnrichment(
    userId: string,
    query: string
  ): Promise<OracleContextEnrichment> {
    const bundle = await this.gatherContext(userId, query);
    const contextParts: string[] = [];

    // Build context block
    if (bundle.health?.available && bundle.health.summary) {
      const h = bundle.health.summary;
      const hrvTrend = h.hrv?.trend || 'unknown';
      const sleepQuality = h.sleep?.qualityScore || 0;
      const readiness = h.readinessScore || 0;
      contextParts.push(`[Health Context: HRV ${hrvTrend}, Sleep quality ${sleepQuality}%, Readiness ${readiness}%]`);
    }

    if (bundle.calendar?.available && bundle.calendar.schedule) {
      const c = bundle.calendar;
      const busyText = c.busyLevel === 'packed' ? 'very busy' : c.busyLevel === 'moderate' ? 'moderately busy' : 'light';
      contextParts.push(`[Schedule: ${busyText} today${c.upcomingContext ? `, ${c.upcomingContext}` : ''}]`);
    }

    if (bundle.knowledge?.available && bundle.knowledge.contextSnippet) {
      contextParts.push(`[Relevant Knowledge: ${bundle.knowledge.contextSnippet}]`);
    }

    if (bundle.tasks?.available && bundle.tasks.load) {
      const t = bundle.tasks.load;
      contextParts.push(`[Task Load: ${t.workloadLevel}, ${t.openTasks} open, ${t.highPriority} high priority]`);
    }

    if (bundle.consciousness?.available && bundle.consciousness.state) {
      const c = bundle.consciousness.state;
      contextParts.push(`[EEG State: Focus ${c.focusScore}%, Meditation ${c.meditationScore}%]`);
    }

    // Build structured enrichment
    const enrichment: OracleContextEnrichment = {
      contextBlock: contextParts.length > 0
        ? `\n--- MCP Context ---\n${contextParts.join('\n')}\n-------------------\n`
        : '',
    };

    // Add biometric correlation
    if (bundle.health?.summary) {
      const h = bundle.health.summary;
      const hrvTrend = h.hrv?.trend;
      const sleepQuality = h.sleep?.qualityScore || 50;
      const readiness = h.readinessScore || 50;
      enrichment.biometricCorrelation = {
        hrvLevel: hrvTrend === 'improving' ? 'high' : hrvTrend === 'declining' ? 'low' : 'moderate',
        energyState: readiness > 70 ? 'energized' : readiness < 40 ? 'depleted' : 'normal',
        sleepQuality: sleepQuality > 75 ? 'good' : sleepQuality < 50 ? 'poor' : 'moderate',
      };
    }

    // Add timing guidance
    if (bundle.calendar?.available) {
      enrichment.timingGuidance = {
        isBusy: bundle.calendar.busyLevel === 'packed',
        nextCommitment: bundle.calendar.schedule?.events?.[0]?.title,
        suggestedPace: bundle.calendar.busyLevel === 'packed' ? 'brief' :
                       bundle.calendar.busyLevel === 'light' ? 'expansive' : 'standard',
      };
    }

    // Add task context
    if (bundle.tasks?.load) {
      enrichment.taskContext = {
        workloadLevel: bundle.tasks.load.workloadLevel,
        highPriorityCount: bundle.tasks.load.highPriority,
        focusSuggestion: bundle.tasks.focusSuggestion,
      };
    }

    // Add consciousness markers
    if (bundle.consciousness?.state) {
      const c = bundle.consciousness.state;
      enrichment.consciousnessMarkers = {
        focusScore: c.focusScore,
        meditationScore: c.meditationScore,
        coherence: c.coherence || 0,
        suggestedApproach: c.meditationScore > 60 ? 'intuitive' :
                          c.focusScore > 70 ? 'analytical' : 'grounding',
      };
    }

    return enrichment;
  }

  // ============================================================================
  // Private Context Gatherers
  // ============================================================================

  private async gatherHealthContext(): Promise<MCPContextBundle['health']> {
    if (!this.healthAdapter.isConnected()) {
      return { available: false };
    }

    try {
      const summary = await this.healthAdapter.getHealthSummary();
      const hrvTrend = summary.hrv?.trend || 'unknown';
      const sleepQuality = summary.sleep?.qualityScore || 50;
      const readiness = summary.readinessScore || 50;

      // Generate natural language context
      const hrvContext = hrvTrend === 'improving'
        ? 'HRV trending upward, indicating good stress recovery'
        : hrvTrend === 'declining'
        ? 'HRV trending downward, may indicate stress accumulation'
        : 'HRV stable';

      const sleepContext = sleepQuality > 75
        ? 'Well-rested with good sleep quality'
        : sleepQuality < 50
        ? 'Sleep quality suboptimal, may benefit from rest-focused guidance'
        : 'Moderate sleep quality';

      const energyContext = readiness > 70
        ? 'High energy levels'
        : readiness < 40
        ? 'Low energy, consider energy-conserving approaches'
        : 'Normal energy levels';

      return {
        available: true,
        summary,
        hrvContext,
        sleepContext,
        energyContext,
      };
    } catch {
      return { available: false };
    }
  }

  private async gatherCalendarContext(): Promise<MCPContextBundle['calendar']> {
    if (!this.calendarAdapter.isConnected()) {
      return { available: false };
    }

    try {
      const schedule = await this.calendarAdapter.getDaySchedule(new Date());
      const eventCount = schedule.events?.length || 0;

      const busyLevel: 'light' | 'moderate' | 'packed' =
        eventCount <= 2 ? 'light' :
        eventCount <= 5 ? 'moderate' : 'packed';

      // Generate upcoming context
      let upcomingContext: string | undefined;
      if (schedule.events && schedule.events.length > 0) {
        const next = schedule.events[0];
        const now = new Date();
        const eventTime = new Date(next.startTime);
        const minutesUntil = Math.round((eventTime.getTime() - now.getTime()) / 60000);

        if (minutesUntil > 0 && minutesUntil < 60) {
          upcomingContext = `Next: "${next.title}" in ${minutesUntil} minutes`;
        } else if (minutesUntil > 0 && minutesUntil < 180) {
          upcomingContext = `Next: "${next.title}" in ${Math.round(minutesUntil / 60)} hours`;
        }
      }

      return {
        available: true,
        schedule,
        upcomingContext,
        busyLevel,
      };
    } catch {
      return { available: false };
    }
  }

  private async gatherKnowledgeContext(query: string): Promise<MCPContextBundle['knowledge']> {
    if (!this.obsidianAdapter.isConnected()) {
      return { available: false };
    }

    try {
      // Search for relevant notes
      const results = await this.obsidianAdapter.searchNotes(query, 3);

      if (!results || results.length === 0) {
        return { available: true }; // Connected but no relevant notes
      }

      // Generate context snippet from top results
      const topResults = results.slice(0, 2);
      const contextSnippet = topResults
        .map(r => `"${r.title}": ${r.excerpt?.slice(0, 100)}...`)
        .join('; ');

      // Results are already ObsidianSearchResult[], use directly
      const knowledgeResult: KnowledgeResult = {
        notes: results,
        summary: contextSnippet,
        relevantTags: [],
      };

      return {
        available: true,
        relevantNotes: knowledgeResult,
        contextSnippet,
      };
    } catch {
      return { available: false };
    }
  }

  private async gatherTaskContext(): Promise<MCPContextBundle['tasks']> {
    if (!this.beadsAdapter.isConnected()) {
      return { available: false };
    }

    try {
      const load = await this.beadsAdapter.analyzeTaskLoad();

      // Generate workload context
      const workloadContext = load.workloadLevel === 'overloaded'
        ? 'Very high task load - consider prioritization support'
        : load.workloadLevel === 'heavy'
        ? 'High task load - focused execution recommended'
        : load.workloadLevel === 'moderate'
        ? 'Moderate task load - balanced approach suitable'
        : 'Light task load - space for exploration';

      // Generate focus suggestion
      let focusSuggestion: string | undefined;
      if (load.highPriority > 3) {
        focusSuggestion = 'Multiple high-priority items need attention';
      } else if (load.staleCount > 5) {
        focusSuggestion = 'Several stale tasks may need review';
      }

      return {
        available: true,
        load,
        workloadContext,
        focusSuggestion,
      };
    } catch {
      return { available: false };
    }
  }

  private async gatherConsciousnessContext(): Promise<MCPContextBundle['consciousness']> {
    if (!this.ganglionAdapter.isConnected()) {
      return { available: false };
    }

    try {
      const state = await this.ganglionAdapter.getConsciousnessState();

      if (!state) {
        return { available: false };
      }

      // Generate state context
      let stateContext: string;
      if (state.meditationScore > 70) {
        stateContext = 'Deep meditative state detected - receptive to subtle guidance';
      } else if (state.focusScore > 70) {
        stateContext = 'High focus state - analytical processing optimal';
      } else if (state.focusScore < 30 && state.meditationScore < 30) {
        stateContext = 'Scattered attention - grounding approaches may help';
      } else {
        stateContext = 'Balanced mental state';
      }

      return {
        available: true,
        state,
        focusLevel: state.focusScore,
        meditationScore: state.meditationScore,
        stateContext,
      };
    } catch {
      return { available: false };
    }
  }

  // ============================================================================
  // Cache Helpers
  // ============================================================================

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let instance: MCPConsciousnessIntegration | null = null;

export function getMCPConsciousnessIntegration(): MCPConsciousnessIntegration {
  if (!instance) {
    instance = new MCPConsciousnessIntegration();
  }
  return instance;
}

export function resetMCPConsciousnessIntegration(): void {
  instance = null;
}
