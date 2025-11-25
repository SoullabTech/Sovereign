/**
 * USER JOURNEY TRACKER
 *
 * Tracks transformation progression across multiple messages/sessions
 * Shows the SPIRAL in action - coherence changes, state shifts, escalation/improvement
 *
 * CAPABILITIES:
 * 1. Store extraction results over time
 * 2. Detect coherence trends (ascending, descending, oscillating)
 * 3. Track state changes (hyperarousal → freeze → dissociation, etc.)
 * 4. Alert on escalation patterns
 * 5. Identify healing progression
 * 6. Visualize spiral movement (Nigredo → Albedo → Rubedo)
 *
 * CLINICAL VALUE:
 * - Early intervention when patterns worsen
 * - Validate healing is occurring
 * - Track regression vs progression
 * - See which frameworks shift over time
 * - Understand individual transformation arc
 */

import type { ExtractionResult } from './SymbolExtractionEngine';
import type { TransformationSignature } from './CrossFrameworkSynergyEngine';

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Single snapshot of extraction at a point in time
 */
export interface JourneySnapshot {
  timestamp: Date;
  messageId?: string;
  sessionId?: string;

  // Core extraction data
  extraction: ExtractionResult;
  primarySignature?: TransformationSignature;

  // Key metrics for tracking
  coherence: number;
  alchemicalStage: 'Nigredo' | 'Albedo' | 'Rubedo' | 'Unknown';
  dominantState: string; // e.g., "freeze", "hyperarousal", "dissociation", "integration"
  urgencyLevel: 'critical' | 'high' | 'moderate' | 'low';

  // Framework-specific states
  somaticState?: 'freeze' | 'fight' | 'flight' | 'fawn' | 'none';
  polyvagalState?: 'dorsal' | 'sympathetic' | 'ventral';
  ifsConfiguration?: string; // e.g., "managers-exhausted", "firefighters-active", "exiles-present"
}

/**
 * Complete journey progression analysis
 */
export interface JourneyProgression {
  userId: string;
  userName?: string;

  snapshots: JourneySnapshot[];
  startDate: Date;
  lastUpdate: Date;
  totalSnapshots: number;

  // Coherence Analysis
  coherenceTrend: 'ascending' | 'descending' | 'stable' | 'oscillating' | 'insufficient-data';
  coherenceChange: number; // delta from first to last
  coherenceHistory: number[];

  // State Path (shows progression through states)
  statePath: string[]; // e.g., ["hyperarousal", "freeze", "dissociation"]
  stateChanges: number; // How many times dominant state changed

  // Alchemical Progression
  alchemicalPath: string[]; // e.g., ["Nigredo", "Nigredo", "Albedo"]
  currentPhase: 'Nigredo' | 'Albedo' | 'Rubedo' | 'Unknown';
  phaseChanges: number;

  // Alerts & Patterns
  escalationAlert: boolean;
  escalationReason?: string;
  escalationSeverity?: 'mild' | 'moderate' | 'severe';

  improvementDetected: boolean;
  improvementIndicators?: string[];

  // Spiral Analysis
  spiralDirection: 'descending' | 'ascending' | 'stable' | 'chaotic';
  spiralPhaseDescription: string;

  // Framework Stability
  frameworkStability: {
    somatic: 'stable' | 'shifting' | 'unstable';
    polyvagal: 'stable' | 'shifting' | 'unstable';
    ifs: 'stable' | 'shifting' | 'unstable';
  };

  // Clinical Summary
  clinicalSummary: string;
  recommendations: string[];
}

/**
 * Configuration for journey analysis
 */
export interface JourneyConfig {
  minSnapshotsForTrend: number; // Minimum snapshots needed for trend analysis
  escalationThreshold: number; // Coherence drop that triggers escalation alert
  improvementThreshold: number; // Coherence rise that indicates improvement
  stateChangeWindow: number; // How many snapshots to look back for state changes
}

// ============================================================================
// JOURNEY TRACKER ENGINE
// ============================================================================

class UserJourneyTrackerEngine {
  private journeys: Map<string, JourneyProgression> = new Map();

  private config: JourneyConfig = {
    minSnapshotsForTrend: 2,
    escalationThreshold: -0.10, // 10% drop in coherence = alert
    improvementThreshold: 0.10, // 10% rise = improvement
    stateChangeWindow: 3
  };

  /**
   * Add a new snapshot to user's journey
   */
  addSnapshot(
    userId: string,
    extraction: ExtractionResult,
    primarySignature?: TransformationSignature,
    messageId?: string,
    sessionId?: string
  ): JourneySnapshot {
    const snapshot = this.createSnapshot(extraction, primarySignature, messageId, sessionId);

    // Get or create journey
    let journey = this.journeys.get(userId);
    if (!journey) {
      journey = this.initializeJourney(userId, snapshot);
      this.journeys.set(userId, journey);
    } else {
      journey.snapshots.push(snapshot);
      journey.lastUpdate = snapshot.timestamp;
      journey.totalSnapshots = journey.snapshots.length;

      // Re-analyze journey
      this.analyzeJourney(journey);
    }

    return snapshot;
  }

  /**
   * Get journey progression for a user
   */
  getJourney(userId: string): JourneyProgression | null {
    return this.journeys.get(userId) || null;
  }

  /**
   * Get all journeys (for admin/analysis)
   */
  getAllJourneys(): JourneyProgression[] {
    return Array.from(this.journeys.values());
  }

  /**
   * Clear journey data for a user
   */
  clearJourney(userId: string): void {
    this.journeys.delete(userId);
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  /**
   * Create a snapshot from extraction result
   */
  private createSnapshot(
    extraction: ExtractionResult,
    primarySignature?: TransformationSignature,
    messageId?: string,
    sessionId?: string
  ): JourneySnapshot {
    const coherence = extraction.alchemicalStage?.coherence || 0;
    const alchemicalStage = this.determineAlchemicalStage(coherence);
    const dominantState = this.determineDominantState(extraction);
    const urgencyLevel = primarySignature?.urgency || this.inferUrgency(extraction);

    return {
      timestamp: new Date(),
      messageId,
      sessionId,
      extraction,
      primarySignature,
      coherence,
      alchemicalStage,
      dominantState,
      urgencyLevel,
      somaticState: extraction.somaticState?.incompleteResponse.type,
      polyvagalState: extraction.polyvagalState?.state,
      ifsConfiguration: this.determineIFSConfiguration(extraction)
    };
  }

  /**
   * Initialize a new journey
   */
  private initializeJourney(userId: string, firstSnapshot: JourneySnapshot): JourneyProgression {
    return {
      userId,
      snapshots: [firstSnapshot],
      startDate: firstSnapshot.timestamp,
      lastUpdate: firstSnapshot.timestamp,
      totalSnapshots: 1,
      coherenceTrend: 'insufficient-data',
      coherenceChange: 0,
      coherenceHistory: [firstSnapshot.coherence],
      statePath: [firstSnapshot.dominantState],
      stateChanges: 0,
      alchemicalPath: [firstSnapshot.alchemicalStage],
      currentPhase: firstSnapshot.alchemicalStage,
      phaseChanges: 0,
      escalationAlert: false,
      improvementDetected: false,
      spiralDirection: 'stable',
      spiralPhaseDescription: 'Journey just beginning',
      frameworkStability: {
        somatic: 'stable',
        polyvagal: 'stable',
        ifs: 'stable'
      },
      clinicalSummary: 'Initial snapshot captured',
      recommendations: []
    };
  }

  /**
   * Analyze complete journey and update progression metrics
   */
  private analyzeJourney(journey: JourneyProgression): void {
    const snapshots = journey.snapshots;

    if (snapshots.length < this.config.minSnapshotsForTrend) {
      return; // Not enough data yet
    }

    // Update coherence metrics
    journey.coherenceHistory = snapshots.map(s => s.coherence);
    journey.coherenceChange = this.calculateCoherenceChange(snapshots);
    journey.coherenceTrend = this.detectCoherenceTrend(journey.coherenceHistory);

    // Update state path
    journey.statePath = snapshots.map(s => s.dominantState);
    journey.stateChanges = this.countStateChanges(journey.statePath);

    // Update alchemical path
    journey.alchemicalPath = snapshots.map(s => s.alchemicalStage);
    journey.currentPhase = snapshots[snapshots.length - 1].alchemicalStage;
    journey.phaseChanges = this.countPhaseChanges(journey.alchemicalPath);

    // Detect escalation
    const escalation = this.detectEscalation(snapshots);
    journey.escalationAlert = escalation.detected;
    journey.escalationReason = escalation.reason;
    journey.escalationSeverity = escalation.severity;

    // Detect improvement
    const improvement = this.detectImprovement(snapshots);
    journey.improvementDetected = improvement.detected;
    journey.improvementIndicators = improvement.indicators;

    // Analyze spiral direction
    journey.spiralDirection = this.analyzeSpiralDirection(journey);
    journey.spiralPhaseDescription = this.describeSpiralPhase(journey);

    // Framework stability
    journey.frameworkStability = this.analyzeFrameworkStability(snapshots);

    // Generate clinical summary and recommendations
    journey.clinicalSummary = this.generateClinicalSummary(journey);
    journey.recommendations = this.generateRecommendations(journey);
  }

  /**
   * Determine alchemical stage from coherence
   */
  private determineAlchemicalStage(coherence: number): 'Nigredo' | 'Albedo' | 'Rubedo' | 'Unknown' {
    if (coherence < 0.33) return 'Nigredo';
    if (coherence < 0.67) return 'Albedo';
    if (coherence >= 0.67) return 'Rubedo';
    return 'Unknown';
  }

  /**
   * Determine dominant state from extraction
   */
  private determineDominantState(extraction: ExtractionResult): string {
    // Priority order: Somatic > Polyvagal > IFS
    if (extraction.somaticState?.detected) {
      const type = extraction.somaticState.incompleteResponse.type;
      if (type === 'freeze') return 'freeze';
      if (type === 'fight' || type === 'flight') return 'hyperarousal';
      if (type === 'fawn') return 'fawn-pleasing';
    }

    if (extraction.polyvagalState) {
      if (extraction.polyvagalState.state === 'dorsal') return 'shutdown-dissociation';
      if (extraction.polyvagalState.state === 'sympathetic') return 'hyperarousal';
      if (extraction.polyvagalState.state === 'ventral') return 'social-engagement';
    }

    if (extraction.ifsParts?.parts.length) {
      const hasFirefighters = extraction.ifsParts.parts.some(p => p.type === 'firefighter');
      const hasExiles = extraction.ifsParts.parts.some(p => p.type === 'exile');
      const hasManagers = extraction.ifsParts.parts.some(p => p.type === 'manager');

      if (hasFirefighters) return 'protector-storm';
      if (hasExiles && hasManagers) return 'parts-conflict';
      if (hasExiles) return 'exile-activated';
    }

    return 'unknown';
  }

  /**
   * Infer urgency from extraction when no signature present
   */
  private inferUrgency(extraction: ExtractionResult): 'critical' | 'high' | 'moderate' | 'low' {
    const coherence = extraction.alchemicalStage?.coherence || 0;
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';

    if ((hasFreeze || hasDorsal) && coherence < 0.2) return 'critical';
    if (coherence < 0.25) return 'high';
    if (coherence < 0.5) return 'moderate';
    return 'low';
  }

  /**
   * Determine IFS configuration
   */
  private determineIFSConfiguration(extraction: ExtractionResult): string {
    if (!extraction.ifsParts?.detected) return 'none';

    const parts = extraction.ifsParts.parts;
    const managers = parts.filter(p => p.type === 'manager');
    const firefighters = parts.filter(p => p.type === 'firefighter');
    const exiles = parts.filter(p => p.type === 'exile');

    if (managers.length && firefighters.length && exiles.length) return 'full-system-activation';
    if (firefighters.length && exiles.length) return 'firefighters-protecting-exiles';
    if (managers.some(m => m.indicator.includes('exhausted')) && exiles.length) return 'managers-exhausted';
    if (firefighters.length) return 'firefighters-active';
    if (exiles.length) return 'exiles-present';
    if (managers.length) return 'managers-working';

    return 'unknown';
  }

  /**
   * Calculate coherence change from first to last snapshot
   */
  private calculateCoherenceChange(snapshots: JourneySnapshot[]): number {
    const first = snapshots[0].coherence;
    const last = snapshots[snapshots.length - 1].coherence;
    return last - first;
  }

  /**
   * Detect coherence trend over time
   */
  private detectCoherenceTrend(coherenceHistory: number[]): 'ascending' | 'descending' | 'stable' | 'oscillating' {
    if (coherenceHistory.length < 2) return 'stable';

    const changes: number[] = [];
    for (let i = 1; i < coherenceHistory.length; i++) {
      changes.push(coherenceHistory[i] - coherenceHistory[i - 1]);
    }

    const positiveChanges = changes.filter(c => c > 0.05).length;
    const negativeChanges = changes.filter(c => c < -0.05).length;
    const stableChanges = changes.filter(c => Math.abs(c) <= 0.05).length;

    if (positiveChanges > negativeChanges * 2) return 'ascending';
    if (negativeChanges > positiveChanges * 2) return 'descending';
    if (stableChanges > changes.length * 0.6) return 'stable';
    return 'oscillating';
  }

  /**
   * Count how many times dominant state changed
   */
  private countStateChanges(statePath: string[]): number {
    let changes = 0;
    for (let i = 1; i < statePath.length; i++) {
      if (statePath[i] !== statePath[i - 1]) changes++;
    }
    return changes;
  }

  /**
   * Count how many times alchemical phase changed
   */
  private countPhaseChanges(alchemicalPath: string[]): number {
    let changes = 0;
    for (let i = 1; i < alchemicalPath.length; i++) {
      if (alchemicalPath[i] !== alchemicalPath[i - 1]) changes++;
    }
    return changes;
  }

  /**
   * Detect escalation patterns
   */
  private detectEscalation(snapshots: JourneySnapshot[]): {
    detected: boolean;
    reason?: string;
    severity?: 'mild' | 'moderate' | 'severe';
  } {
    if (snapshots.length < 2) return { detected: false };

    const recent = snapshots.slice(-3); // Look at last 3 snapshots
    const coherenceDrops = [];

    for (let i = 1; i < recent.length; i++) {
      const drop = recent[i].coherence - recent[i - 1].coherence;
      if (drop < 0) coherenceDrops.push(drop);
    }

    // Check for significant coherence drop
    const totalDrop = coherenceDrops.reduce((sum, drop) => sum + drop, 0);
    if (totalDrop < this.config.escalationThreshold) {
      const severity = totalDrop < -0.20 ? 'severe' : totalDrop < -0.15 ? 'moderate' : 'mild';
      return {
        detected: true,
        reason: `Coherence dropped ${(totalDrop * 100).toFixed(0)}% in recent sessions`,
        severity
      };
    }

    // Check for worsening states
    const stateWorsening = this.detectStateWorsening(recent);
    if (stateWorsening) {
      return {
        detected: true,
        reason: stateWorsening,
        severity: 'moderate'
      };
    }

    // Check for urgency escalation
    const urgencyLevels = { 'low': 1, 'moderate': 2, 'high': 3, 'critical': 4 };
    const firstUrgency = urgencyLevels[recent[0].urgencyLevel];
    const lastUrgency = urgencyLevels[recent[recent.length - 1].urgencyLevel];

    if (lastUrgency > firstUrgency + 1) {
      return {
        detected: true,
        reason: `Urgency escalated from ${recent[0].urgencyLevel} to ${recent[recent.length - 1].urgencyLevel}`,
        severity: lastUrgency === 4 ? 'severe' : 'moderate'
      };
    }

    return { detected: false };
  }

  /**
   * Detect if states are worsening
   */
  private detectStateWorsening(snapshots: JourneySnapshot[]): string | null {
    const states = snapshots.map(s => s.dominantState);

    // Worsening patterns
    const worseningPatterns = [
      ['hyperarousal', 'freeze'],
      ['hyperarousal', 'shutdown-dissociation'],
      ['freeze', 'shutdown-dissociation'],
      ['social-engagement', 'hyperarousal'],
      ['social-engagement', 'freeze']
    ];

    for (let i = 1; i < states.length; i++) {
      const from = states[i - 1];
      const to = states[i];

      for (const [worse1, worse2] of worseningPatterns) {
        if (from === worse1 && to === worse2) {
          return `State progression worsened: ${from} → ${to}`;
        }
      }
    }

    return null;
  }

  /**
   * Detect improvement patterns
   */
  private detectImprovement(snapshots: JourneySnapshot[]): {
    detected: boolean;
    indicators?: string[];
  } {
    if (snapshots.length < 2) return { detected: false };

    const indicators: string[] = [];
    const recent = snapshots.slice(-3);

    // Check coherence rise
    const coherenceRise = recent[recent.length - 1].coherence - recent[0].coherence;
    if (coherenceRise > this.config.improvementThreshold) {
      indicators.push(`Coherence increased ${(coherenceRise * 100).toFixed(0)}%`);
    }

    // Check for improving states
    const stateImprovement = this.detectStateImprovement(recent);
    if (stateImprovement) {
      indicators.push(stateImprovement);
    }

    // Check urgency decrease
    const urgencyLevels = { 'low': 1, 'moderate': 2, 'high': 3, 'critical': 4 };
    const firstUrgency = urgencyLevels[recent[0].urgencyLevel];
    const lastUrgency = urgencyLevels[recent[recent.length - 1].urgencyLevel];

    if (lastUrgency < firstUrgency) {
      indicators.push(`Urgency decreased: ${recent[0].urgencyLevel} → ${recent[recent.length - 1].urgencyLevel}`);
    }

    // Check alchemical progression
    const alchemicalProgression = this.detectAlchemicalProgression(recent);
    if (alchemicalProgression) {
      indicators.push(alchemicalProgression);
    }

    return {
      detected: indicators.length > 0,
      indicators: indicators.length > 0 ? indicators : undefined
    };
  }

  /**
   * Detect if states are improving
   */
  private detectStateImprovement(snapshots: JourneySnapshot[]): string | null {
    const states = snapshots.map(s => s.dominantState);

    // Improvement patterns
    const improvementPatterns = [
      ['shutdown-dissociation', 'freeze'],
      ['shutdown-dissociation', 'hyperarousal'],
      ['freeze', 'hyperarousal'],
      ['freeze', 'social-engagement'],
      ['hyperarousal', 'social-engagement'],
      ['protector-storm', 'parts-conflict'],
      ['parts-conflict', 'social-engagement']
    ];

    for (let i = 1; i < states.length; i++) {
      const from = states[i - 1];
      const to = states[i];

      for (const [better1, better2] of improvementPatterns) {
        if (from === better1 && to === better2) {
          return `State improved: ${from} → ${to}`;
        }
      }
    }

    return null;
  }

  /**
   * Detect alchemical progression
   */
  private detectAlchemicalProgression(snapshots: JourneySnapshot[]): string | null {
    const phases = snapshots.map(s => s.alchemicalStage);

    // Check for progression: Nigredo → Albedo → Rubedo
    const progressionPatterns = [
      ['Nigredo', 'Albedo'],
      ['Albedo', 'Rubedo']
    ];

    for (let i = 1; i < phases.length; i++) {
      const from = phases[i - 1];
      const to = phases[i];

      for (const [phase1, phase2] of progressionPatterns) {
        if (from === phase1 && to === phase2) {
          return `Alchemical progression: ${from} → ${to}`;
        }
      }
    }

    return null;
  }

  /**
   * Analyze spiral direction (overall trajectory)
   */
  private analyzeSpiralDirection(journey: JourneyProgression): 'descending' | 'ascending' | 'stable' | 'chaotic' {
    const { coherenceTrend, stateChanges, totalSnapshots } = journey;

    // High state volatility = chaotic
    if (stateChanges / totalSnapshots > 0.7) return 'chaotic';

    // Coherence trend determines direction
    if (coherenceTrend === 'descending') return 'descending';
    if (coherenceTrend === 'ascending') return 'ascending';
    if (coherenceTrend === 'stable') return 'stable';

    // Oscillating with low state changes = stable
    if (coherenceTrend === 'oscillating' && stateChanges < totalSnapshots * 0.3) return 'stable';

    return 'chaotic';
  }

  /**
   * Describe spiral phase in clinical terms
   */
  private describeSpiralPhase(journey: JourneyProgression): string {
    const { spiralDirection, currentPhase, coherenceTrend } = journey;

    if (spiralDirection === 'descending') {
      return `Descending spiral - deepening into ${currentPhase} phase. Client experiencing intensification of symptoms. Intervention recommended.`;
    }

    if (spiralDirection === 'ascending') {
      return `Ascending spiral - emerging from ${currentPhase === 'Nigredo' ? 'Nigredo toward Albedo' : currentPhase === 'Albedo' ? 'Albedo toward Rubedo' : 'darkness into light'}. Signs of healing and integration.`;
    }

    if (spiralDirection === 'stable') {
      return `Stable period in ${currentPhase} phase. Client holding ground, neither worsening nor improving significantly.`;
    }

    return `Chaotic pattern - high volatility in states. Client may be in transition or experiencing instability. Close monitoring recommended.`;
  }

  /**
   * Analyze framework stability
   */
  private analyzeFrameworkStability(snapshots: JourneySnapshot[]): {
    somatic: 'stable' | 'shifting' | 'unstable';
    polyvagal: 'stable' | 'shifting' | 'unstable';
    ifs: 'stable' | 'shifting' | 'unstable';
  } {
    const recent = snapshots.slice(-3);

    return {
      somatic: this.analyzeFrameworkStabilityHelper(recent.map(s => s.somaticState)),
      polyvagal: this.analyzeFrameworkStabilityHelper(recent.map(s => s.polyvagalState)),
      ifs: this.analyzeFrameworkStabilityHelper(recent.map(s => s.ifsConfiguration))
    };
  }

  private analyzeFrameworkStabilityHelper(states: any[]): 'stable' | 'shifting' | 'unstable' {
    const changes = this.countStateChanges(states.map(s => String(s)));
    if (changes === 0) return 'stable';
    if (changes === 1) return 'shifting';
    return 'unstable';
  }

  /**
   * Generate clinical summary
   */
  private generateClinicalSummary(journey: JourneyProgression): string {
    const { totalSnapshots, coherenceChange, spiralDirection, currentPhase } = journey;

    const changeDesc = coherenceChange > 0 ? 'improved' : coherenceChange < 0 ? 'declined' : 'remained stable';
    const changeAmount = Math.abs(coherenceChange * 100).toFixed(0);

    return `Client tracked across ${totalSnapshots} sessions. Coherence has ${changeDesc} by ${changeAmount}%. Currently in ${currentPhase} phase with ${spiralDirection} spiral trajectory. ${journey.escalationAlert ? 'ALERT: Escalation detected.' : ''} ${journey.improvementDetected ? 'Positive signs of healing present.' : ''}`;
  }

  /**
   * Generate recommendations based on journey
   */
  private generateRecommendations(journey: JourneyProgression): string[] {
    const recs: string[] = [];

    if (journey.escalationAlert) {
      recs.push('⚠️ PRIORITY: Address escalation pattern immediately');
      recs.push('Increase session frequency or support level');

      if (journey.escalationSeverity === 'severe') {
        recs.push('🚨 Consider crisis intervention or additional support resources');
      }
    }

    if (journey.spiralDirection === 'descending') {
      recs.push('Focus on nervous system regulation and safety');
      recs.push('Slow down therapeutic pace to match client capacity');
    }

    if (journey.spiralDirection === 'ascending') {
      recs.push('Continue current therapeutic approach - showing positive results');
      recs.push('Client may be ready for deeper integration work');
    }

    if (journey.spiralDirection === 'chaotic') {
      recs.push('High volatility detected - focus on stabilization');
      recs.push('Work with parts that may be in conflict (IFS approach)');
    }

    if (journey.frameworkStability.somatic === 'unstable') {
      recs.push('Somatic state highly variable - prioritize body-based regulation');
    }

    if (journey.improvementDetected) {
      recs.push('✅ Acknowledge progress with client');
      recs.push('Explore what has been helpful in recent sessions');
    }

    return recs;
  }
}

// Export singleton instance
export const userJourneyTracker = new UserJourneyTrackerEngine();
export type { JourneyConfig };
