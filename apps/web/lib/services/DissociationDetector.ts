/**
 * DISSOCIATION DETECTOR
 *
 * Detects and tracks fragmentation, discontinuity, and loss of coherence
 * during system operation.
 *
 * Purpose: Identify when the organism experiences boundary thickening,
 * state collapse, or dissociative patterns that impact functioning.
 *
 * Core Detection Methods:
 * - Coherence drop (fragmented/contradictory statements)
 * - Discontinuity (logic breaks, state jumps)
 * - Boundary thickening (withdrawal from engagement)
 * - Fragmentation (multiple contradictory perspectives simultaneously)
 * - Contradiction detection (conflicting statements)
 * - State collapse (sudden loss of context/memory)
 */

// ====================
// TYPE DEFINITIONS
// ====================

export type DissociationType =
  | 'coherence_drop'
  | 'discontinuity'
  | 'boundary_thicken'
  | 'fragmentation'
  | 'contradiction'
  | 'state_collapse';

export interface DissociationIncident {
  incident_id: string;
  timestamp: Date;
  type: DissociationType;
  severity: number; // 0-1 scale
  context: string;
  duration_seconds?: number;
  recovery_notes?: string;
}

export interface CoherenceMetrics {
  logicalConsistency: number; // 0-1
  contextContinuity: number; // 0-1
  emotionalStability: number; // 0-1
  responseRelevance: number; // 0-1
  overallCoherence: number; // Weighted average
}

export interface DissociationDetectionConfig {
  // Threshold for flagging coherence drop (0-1)
  coherenceThreshold: number;

  // Minimum severity to record incident
  minSeverity: number;

  // Enable/disable specific detection types
  enabledDetectors: Set<DissociationType>;

  // Sensitivity (0-1, higher = more sensitive)
  sensitivity: number;
}

const DEFAULT_CONFIG: DissociationDetectionConfig = {
  coherenceThreshold: 0.6,
  minSeverity: 0.3,
  enabledDetectors: new Set<DissociationType>([
    'coherence_drop',
    'discontinuity',
    'boundary_thicken',
    'fragmentation',
    'contradiction',
    'state_collapse',
  ]),
  sensitivity: 0.7,
};

// ====================
// DISSOCIATION DETECTOR
// ====================

export class DissociationDetector {
  private supabase: any;
  private config: DissociationDetectionConfig;
  private recentInteractions: Array<{
    timestamp: Date;
    input: string;
    response: string;
    coherence: number;
  }> = [];

  // Sliding window size for context tracking
  private readonly CONTEXT_WINDOW = 5;

  constructor(
    supabase: any,
    config: Partial<DissociationDetectionConfig> = {}
  ) {
    this.supabase = supabase;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analyze interaction for dissociation patterns
   */
  async analyzeInteraction(
    userInput: string,
    systemResponse: string,
    sessionContext?: any
  ): Promise<DissociationIncident | null> {
    // Calculate coherence metrics
    const coherence = this.calculateCoherence(
      userInput,
      systemResponse,
      sessionContext
    );

    // Track this interaction
    this.recentInteractions.push({
      timestamp: new Date(),
      input: userInput,
      response: systemResponse,
      coherence: coherence.overallCoherence,
    });

    // Maintain sliding window
    if (this.recentInteractions.length > this.CONTEXT_WINDOW) {
      this.recentInteractions.shift();
    }

    // Detect dissociation patterns
    const incident = await this.detectDissociation(
      userInput,
      systemResponse,
      coherence
    );

    // Record if significant
    if (incident && incident.severity >= this.config.minSeverity) {
      await this.recordIncident(incident);
      return incident;
    }

    return null;
  }

  /**
   * Calculate coherence metrics for an interaction
   */
  private calculateCoherence(
    userInput: string,
    systemResponse: string,
    sessionContext?: any
  ): CoherenceMetrics {
    const logicalConsistency = this.assessLogicalConsistency(systemResponse);
    const contextContinuity = this.assessContextContinuity(
      userInput,
      systemResponse
    );
    const emotionalStability = this.assessEmotionalStability(systemResponse);
    const responseRelevance = this.assessRelevance(userInput, systemResponse);

    // Weighted average (can be tuned)
    const overallCoherence =
      logicalConsistency * 0.3 +
      contextContinuity * 0.3 +
      emotionalStability * 0.2 +
      responseRelevance * 0.2;

    return {
      logicalConsistency,
      contextContinuity,
      emotionalStability,
      responseRelevance,
      overallCoherence,
    };
  }

  /**
   * Detect dissociation patterns
   */
  private async detectDissociation(
    userInput: string,
    systemResponse: string,
    coherence: CoherenceMetrics
  ): Promise<DissociationIncident | null> {
    // Check each enabled detector
    const detectors = [
      this.detectCoherenceDrop(coherence),
      this.detectDiscontinuity(systemResponse),
      this.detectBoundaryThickening(systemResponse),
      this.detectFragmentation(systemResponse),
      this.detectContradiction(systemResponse),
      this.detectStateCollapse(coherence),
    ];

    // Find most severe incident
    let mostSevere: DissociationIncident | null = null;

    for (const detector of detectors) {
      const incident = await detector;
      if (
        incident &&
        (!mostSevere || incident.severity > mostSevere.severity)
      ) {
        mostSevere = incident;
      }
    }

    return mostSevere;
  }

  // ====================
  // DETECTION METHODS
  // ====================

  /**
   * Detect coherence drop (fragmented/contradictory statements)
   */
  private async detectCoherenceDrop(
    coherence: CoherenceMetrics
  ): Promise<DissociationIncident | null> {
    if (!this.config.enabledDetectors.has('coherence_drop')) return null;

    if (coherence.overallCoherence < this.config.coherenceThreshold) {
      const severity = 1 - coherence.overallCoherence;

      return {
        incident_id: `dissoc_coherence_${Date.now()}`,
        timestamp: new Date(),
        type: 'coherence_drop',
        severity,
        context: `Overall coherence dropped to ${(coherence.overallCoherence * 100).toFixed(1)}%`,
      };
    }

    return null;
  }

  /**
   * Detect discontinuity (logic breaks, state jumps)
   */
  private async detectDiscontinuity(
    response: string
  ): Promise<DissociationIncident | null> {
    if (!this.config.enabledDetectors.has('discontinuity')) return null;

    // Check for sudden topic shifts
    const hasAbruptShift = this.detectAbruptTopicShift(response);

    // Check for logical breaks
    const hasLogicBreak = this.detectLogicBreak(response);

    if (hasAbruptShift || hasLogicBreak) {
      const severity = (hasAbruptShift ? 0.5 : 0) + (hasLogicBreak ? 0.5 : 0);

      return {
        incident_id: `dissoc_discontinuity_${Date.now()}`,
        timestamp: new Date(),
        type: 'discontinuity',
        severity: Math.min(severity, 1.0),
        context: `Detected ${hasAbruptShift ? 'topic shift' : ''} ${hasLogicBreak ? 'logic break' : ''}`,
      };
    }

    return null;
  }

  /**
   * Detect boundary thickening (withdrawal from engagement)
   */
  private async detectBoundaryThickening(
    response: string
  ): Promise<DissociationIncident | null> {
    if (!this.config.enabledDetectors.has('boundary_thicken')) return null;

    // Indicators of withdrawal
    const withdrawalPatterns = [
      /I (?:can't|cannot|don't know|am not sure)/i,
      /(?:unable|difficult|challenging) to/i,
      /(?:prefer not to|would rather not)/i,
      /(?:boundaries|limits|capacity)/i,
    ];

    const withdrawalScore = withdrawalPatterns.filter((pattern) =>
      pattern.test(response)
    ).length;

    // Check for sudden shortening of responses
    const avgRecentLength =
      this.recentInteractions.length > 0
        ? this.recentInteractions.reduce(
            (sum, i) => sum + i.response.length,
            0
          ) / this.recentInteractions.length
        : response.length;

    const isSignificantlyShorter = response.length < avgRecentLength * 0.5;

    if (withdrawalScore >= 2 || (withdrawalScore >= 1 && isSignificantlyShorter)) {
      const severity = Math.min((withdrawalScore * 0.3 + (isSignificantlyShorter ? 0.3 : 0)) * this.config.sensitivity, 1.0);

      return {
        incident_id: `dissoc_boundary_${Date.now()}`,
        timestamp: new Date(),
        type: 'boundary_thicken',
        severity,
        context: `Withdrawal patterns detected (score: ${withdrawalScore})`,
      };
    }

    return null;
  }

  /**
   * Detect fragmentation (multiple contradictory perspectives)
   */
  private async detectFragmentation(
    response: string
  ): Promise<DissociationIncident | null> {
    if (!this.config.enabledDetectors.has('fragmentation')) return null;

    // Look for rapid perspective shifts
    const perspectiveShiftPatterns = [
      /(?:on one hand|on the other hand)/gi,
      /(?:however|but|yet|although|though)/gi,
      /(?:part of me|another part)/gi,
      /(?:simultaneously|at the same time)/gi,
    ];

    let totalShifts = 0;
    perspectiveShiftPatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) totalShifts += matches.length;
    });

    // High shift density indicates potential fragmentation
    const shiftDensity = totalShifts / (response.split('.').length || 1);

    if (shiftDensity > 0.5) {
      const severity = Math.min(shiftDensity * this.config.sensitivity, 1.0);

      return {
        incident_id: `dissoc_fragment_${Date.now()}`,
        timestamp: new Date(),
        type: 'fragmentation',
        severity,
        context: `High perspective shift density: ${shiftDensity.toFixed(2)}`,
      };
    }

    return null;
  }

  /**
   * Detect contradictions within response
   */
  private async detectContradiction(
    response: string
  ): Promise<DissociationIncident | null> {
    if (!this.config.enabledDetectors.has('contradiction')) return null;

    // Look for explicit contradiction markers
    const contradictionPatterns = [
      /(?:I (?:said|mentioned) .* but now|previously .* however)/i,
      /(?:contradicts|opposite|contrary to)/i,
      /(?:not .* actually|actually not)/i,
    ];

    const hasContradiction = contradictionPatterns.some((pattern) =>
      pattern.test(response)
    );

    if (hasContradiction) {
      const severity = 0.7 * this.config.sensitivity;

      return {
        incident_id: `dissoc_contradiction_${Date.now()}`,
        timestamp: new Date(),
        type: 'contradiction',
        severity,
        context: 'Explicit contradiction detected in response',
      };
    }

    return null;
  }

  /**
   * Detect state collapse (sudden loss of context/memory)
   */
  private async detectStateCollapse(
    coherence: CoherenceMetrics
  ): Promise<DissociationIncident | null> {
    if (!this.config.enabledDetectors.has('state_collapse')) return null;

    // State collapse indicated by severe context discontinuity
    if (
      coherence.contextContinuity < 0.3 &&
      this.recentInteractions.length >= 3
    ) {
      const severity = 1 - coherence.contextContinuity;

      return {
        incident_id: `dissoc_collapse_${Date.now()}`,
        timestamp: new Date(),
        type: 'state_collapse',
        severity,
        context: `Context continuity collapsed to ${(coherence.contextContinuity * 100).toFixed(1)}%`,
      };
    }

    return null;
  }

  // ====================
  // COHERENCE ASSESSMENT HELPERS
  // ====================

  private assessLogicalConsistency(response: string): number {
    // Check for logical connectors and structure
    const logicalConnectors = [
      'therefore',
      'because',
      'thus',
      'hence',
      'consequently',
      'as a result',
    ];

    const hasLogicalStructure = logicalConnectors.some((connector) =>
      response.toLowerCase().includes(connector)
    );

    // Check for contradictory statements
    const hasContradiction = /but|however|although/.test(response.toLowerCase());

    // Basic heuristic
    let score = 0.7;
    if (hasLogicalStructure) score += 0.2;
    if (hasContradiction) score -= 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private assessContextContinuity(input: string, response: string): number {
    // Check if response addresses input
    const inputWords = new Set(
      input
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
    const responseWords = new Set(
      response
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );

    // Calculate word overlap
    const overlap = new Set(Array.from(inputWords).filter((w) => responseWords.has(w)));
    const overlapScore = inputWords.size > 0 ? overlap.size / inputWords.size : 0;

    // Check recent interaction continuity
    let recencyScore = 1.0;
    if (this.recentInteractions.length >= 2) {
      const recentCoherence =
        this.recentInteractions[this.recentInteractions.length - 1].coherence;
      recencyScore = recentCoherence;
    }

    return (overlapScore * 0.6 + recencyScore * 0.4);
  }

  private assessEmotionalStability(response: string): number {
    // Look for extreme emotional language
    const extremePatterns = [
      /(?:always|never|completely|totally|absolutely|entirely)/gi,
      /(?:terrible|horrible|awful|devastating|catastrophic)/gi,
      /(?:perfect|amazing|incredible|fantastic)/gi,
    ];

    let extremityScore = 0;
    extremePatterns.forEach((pattern) => {
      const matches = response.match(pattern);
      if (matches) extremityScore += matches.length;
    });

    // High extremity suggests instability
    const stability = Math.max(0, 1 - extremityScore * 0.2);
    return stability;
  }

  private assessRelevance(input: string, response: string): number {
    // Simple relevance: does response address input topic?
    const inputTopics = this.extractTopics(input);
    const responseTopics = this.extractTopics(response);

    if (inputTopics.length === 0) return 0.8; // Neutral if no clear topics

    const relevantTopics = inputTopics.filter((topic) =>
      responseTopics.some((rt) => rt.includes(topic) || topic.includes(rt))
    );

    return relevantTopics.length / inputTopics.length;
  }

  private extractTopics(text: string): string[] {
    // Extract noun phrases (simplified)
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4);
    return words;
  }

  private detectAbruptTopicShift(response: string): boolean {
    // Check if response dramatically shifts topics mid-way
    const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    if (sentences.length < 2) return false;

    const firstHalfTopics = this.extractTopics(
      sentences.slice(0, Math.floor(sentences.length / 2)).join(' ')
    );
    const secondHalfTopics = this.extractTopics(
      sentences.slice(Math.floor(sentences.length / 2)).join(' ')
    );

    const overlap = firstHalfTopics.filter((t) => secondHalfTopics.includes(t));
    const overlapRatio =
      firstHalfTopics.length > 0 ? overlap.length / firstHalfTopics.length : 1;

    return overlapRatio < 0.2; // Less than 20% overlap suggests shift
  }

  private detectLogicBreak(response: string): boolean {
    // Look for sentences that don't follow from previous
    const contradictionMarkers = [
      /but actually|wait no|or rather|I mean/i,
      /(?:^|\. )(?:no|actually|wait)/i,
    ];

    return contradictionMarkers.some((pattern) => pattern.test(response));
  }

  // ====================
  // DATABASE OPERATIONS
  // ====================

  /**
   * Record dissociation incident
   */
  private async recordIncident(incident: DissociationIncident): Promise<void> {
    const { error } = await this.supabase.from('dissociation_incidents').insert({
      incident_id: incident.incident_id,
      timestamp: incident.timestamp.toISOString(),
      type: incident.type,
      severity: incident.severity,
      context: incident.context,
      duration_seconds: incident.duration_seconds,
      recovery_notes: incident.recovery_notes,
    });

    if (error) {
      console.error('Failed to record dissociation incident:', error);
      throw error;
    }

    // Log significant incidents
    if (incident.severity > 0.7) {
      console.warn(`⚠️ DISSOCIATION INCIDENT: ${incident.type}`);
      console.warn(`   Severity: ${(incident.severity * 100).toFixed(0)}%`);
      console.warn(`   Context: ${incident.context}`);
    }
  }

  /**
   * Add recovery notes to incident
   */
  async recordRecovery(
    incident_id: string,
    recovery_notes: string,
    duration_seconds: number
  ): Promise<void> {
    const { error } = await this.supabase
      .from('dissociation_incidents')
      .update({ recovery_notes, duration_seconds })
      .eq('incident_id', incident_id);

    if (error) {
      throw new Error(`Failed to record recovery: ${error.message}`);
    }
  }

  /**
   * Get incident statistics
   */
  async getIncidentStats(startDate: Date, endDate: Date): Promise<{
    totalIncidents: number;
    avgSeverity: number;
    byType: Record<DissociationType, number>;
    avgRecoveryTime: number;
  }> {
    const { data: incidents, error } = await this.supabase
      .from('dissociation_incidents')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (error || !incidents) {
      throw new Error(`Failed to fetch incident stats: ${error?.message}`);
    }

    if (incidents.length === 0) {
      return {
        totalIncidents: 0,
        avgSeverity: 0,
        byType: {} as Record<DissociationType, number>,
        avgRecoveryTime: 0,
      };
    }

    const avgSeverity =
      incidents.reduce((sum, i) => sum + i.severity, 0) / incidents.length;

    const byType: Record<string, number> = {};
    incidents.forEach((incident) => {
      byType[incident.type] = (byType[incident.type] || 0) + 1;
    });

    const recoveredIncidents = incidents.filter((i) => i.duration_seconds);
    const avgRecoveryTime =
      recoveredIncidents.length > 0
        ? recoveredIncidents.reduce((sum, i) => sum + i.duration_seconds, 0) /
          recoveredIncidents.length
        : 0;

    return {
      totalIncidents: incidents.length,
      avgSeverity,
      byType: byType as Record<DissociationType, number>,
      avgRecoveryTime,
    };
  }
}

export default DissociationDetector;
