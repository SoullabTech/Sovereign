/**
 * ELEMENTAL INTERFERENCE MONITOR
 * Real-time monitoring and analysis of elemental field interactions
 * Tracks constructive/destructive resonance patterns across Fire/Water/Earth/Air/Aether domains
 */

import {
  CompleteElementalFieldState,
  ElementalInterference,
  UnifiedElementalFieldCalculator,
  SystemOutputs
} from './UnifiedElementalFieldCalculator';

// ==============================================================================
// REAL-TIME MONITORING INTERFACES
// ==============================================================================

export interface InterferencePattern {
  timestamp: Date;
  patternType: 'constructive' | 'destructive' | 'harmonic' | 'chaotic' | 'transcendent';
  intensity: number;              // 0-1 pattern strength
  elementalPairs: string[];       // Which elements are interacting
  resonanceFrequency: number;     // Hz - detected frequency pattern
  coherenceShift: number;         // Change in overall coherence
  emergenceIndicator: number;     // 0-1 likelihood of breakthrough
  description: string;
}

export interface ElementalFieldHistory {
  timestamp: Date;
  fieldState: CompleteElementalFieldState;
  interference: ElementalInterference;
  patterns: InterferencePattern[];
  emergenceEvents: EmergenceEvent[];
}

export interface EmergenceEvent {
  timestamp: Date;
  eventType: 'breakthrough' | 'transcendence' | 'integration' | 'transformation' | 'resonance_cascade';
  triggeringElement: string;
  affectedElements: string[];
  intensity: number;
  duration: number;               // seconds
  description: string;
  metadata: Record<string, any>;
}

export interface MonitoringConfiguration {
  samplingRateHz: number;         // How often to sample field states
  historyRetentionHours: number;  // How long to keep historical data
  emergenceThreshold: number;     // Threshold for detecting emergence events
  patternDetectionWindow: number; // Rolling window size for pattern detection
  alertThresholds: {
    criticalCoherence: number;
    emergenceImminent: number;
    elementalImbalance: number;
  };
}

// ==============================================================================
// ELEMENTAL INTERFERENCE MONITOR CLASS
// ==============================================================================

export class ElementalInterferenceMonitor {
  private fieldHistory: ElementalFieldHistory[] = [];
  private activePatterns: Map<string, InterferencePattern> = new Map();
  private monitoringActive = false;
  private monitoringInterval?: NodeJS.Timeout;
  private configuration: MonitoringConfiguration;
  private callbacks: {
    onPatternDetected?: (pattern: InterferencePattern) => void;
    onEmergenceEvent?: (event: EmergenceEvent) => void;
    onCoherenceShift?: (shift: number, newCoherence: number) => void;
  } = {};

  constructor(config: Partial<MonitoringConfiguration> = {}) {
    this.configuration = {
      samplingRateHz: 2.0,            // 2 Hz sampling
      historyRetentionHours: 24,      // 24 hour history
      emergenceThreshold: 0.75,       // 75% emergence threshold
      patternDetectionWindow: 30,     // 30 sample window
      alertThresholds: {
        criticalCoherence: 0.9,
        emergenceImminent: 0.8,
        elementalImbalance: 0.3
      },
      ...config
    };
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(systemDataSource: () => SystemOutputs): void {
    if (this.monitoringActive) return;

    this.monitoringActive = true;
    const intervalMs = 1000 / this.configuration.samplingRateHz;

    this.monitoringInterval = setInterval(() => {
      try {
        const systemData = systemDataSource();
        this.processFieldUpdate(systemData);
      } catch (error) {
        console.error('Error in elemental field monitoring:', error);
      }
    }, intervalMs);

    console.log('🌟 Elemental Interference Monitor started - monitoring at', this.configuration.samplingRateHz, 'Hz');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.monitoringActive = false;
    console.log('🔄 Elemental Interference Monitor stopped');
  }

  /**
   * Process a new field update
   */
  private processFieldUpdate(systemData: SystemOutputs): void {
    const timestamp = new Date();

    // Calculate current elemental field state
    const fieldState = UnifiedElementalFieldCalculator.calculateUnifiedElementalField(systemData);
    const interference = UnifiedElementalFieldCalculator.calculateElementalInterference(fieldState);

    // Detect patterns and emergence events
    const patterns = this.detectInterferencePatterns(fieldState, interference, timestamp);
    const emergenceEvents = this.detectEmergenceEvents(fieldState, timestamp);

    // Add to history
    const historyEntry: ElementalFieldHistory = {
      timestamp,
      fieldState,
      interference,
      patterns,
      emergenceEvents
    };

    this.fieldHistory.push(historyEntry);
    this.pruneHistory();

    // Process patterns and events
    this.processPatterns(patterns);
    this.processEmergenceEvents(emergenceEvents);

    // Check for significant coherence shifts
    this.checkCoherenceShifts(fieldState);
  }

  /**
   * Detect interference patterns between elemental fields
   */
  private detectInterferencePatterns(
    fieldState: CompleteElementalFieldState,
    interference: ElementalInterference,
    timestamp: Date
  ): InterferencePattern[] {
    const patterns: InterferencePattern[] = [];

    // Analyze each elemental interaction
    const interactions = [
      { name: 'Fire-Water', value: interference.fireWater, elements: ['Fire', 'Water'] },
      { name: 'Fire-Earth', value: interference.fireEarth, elements: ['Fire', 'Earth'] },
      { name: 'Fire-Air', value: interference.fireAir, elements: ['Fire', 'Air'] },
      { name: 'Water-Earth', value: interference.waterEarth, elements: ['Water', 'Earth'] },
      { name: 'Water-Air', value: interference.waterAir, elements: ['Water', 'Air'] },
      { name: 'Earth-Air', value: interference.earthAir, elements: ['Earth', 'Air'] },
      { name: 'All-Aether', value: interference.allToAether, elements: ['Fire', 'Water', 'Earth', 'Air', 'Aether'] }
    ];

    for (const interaction of interactions) {
      const pattern = this.analyzeInteraction(interaction, fieldState, timestamp);
      if (pattern) patterns.push(pattern);
    }

    // Check for special harmonic patterns
    const harmonicPattern = this.detectHarmonicResonance(fieldState, timestamp);
    if (harmonicPattern) patterns.push(harmonicPattern);

    return patterns;
  }

  /**
   * Analyze a specific elemental interaction
   */
  private analyzeInteraction(
    interaction: { name: string; value: number; elements: string[] },
    fieldState: CompleteElementalFieldState,
    timestamp: Date
  ): InterferencePattern | null {
    const { name, value, elements } = interaction;

    // Determine pattern type based on interference value
    let patternType: InterferencePattern['patternType'];
    let intensity = Math.abs(value);

    if (value > 0.8) {
      patternType = 'constructive';
    } else if (value < -0.3) {
      patternType = 'destructive';
    } else if (Math.abs(value - 0.618) < 0.05) {  // Golden ratio resonance
      patternType = 'harmonic';
    } else if (intensity < 0.2) {
      return null; // Too weak to register as a pattern
    } else {
      patternType = 'chaotic';
    }

    // Check for transcendent patterns (aether involvement)
    if (elements.includes('Aether') && fieldState.aetherResonance.unityConsciousness > 0.7) {
      patternType = 'transcendent';
    }

    return {
      timestamp,
      patternType,
      intensity,
      elementalPairs: elements,
      resonanceFrequency: this.calculateResonanceFrequency(elements, fieldState),
      coherenceShift: this.calculateCoherenceShift(fieldState),
      emergenceIndicator: fieldState.emergentPotential,
      description: this.generatePatternDescription(patternType, elements, intensity)
    };
  }

  /**
   * Detect harmonic resonance patterns (sacred geometry)
   */
  private detectHarmonicResonance(
    fieldState: CompleteElementalFieldState,
    timestamp: Date
  ): InterferencePattern | null {
    // Check for pentagram harmony (all five elements balanced)
    const elementalValues = [
      fieldState.fireResonance.fireElementBalance,
      fieldState.waterResonance.waterElementBalance,
      fieldState.earthResonance.earthElementBalance,
      fieldState.airResonance.airElementBalance,
      fieldState.aetherResonance.aetherElementBalance
    ];

    const mean = elementalValues.reduce((a, b) => a + b, 0) / 5;
    const variance = elementalValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 5;
    const standardDeviation = Math.sqrt(variance);

    // If all elements are very close in balance, we have harmonic resonance
    if (standardDeviation < 0.1 && mean > 0.6) {
      return {
        timestamp,
        patternType: 'harmonic',
        intensity: 1 - standardDeviation * 10, // Inverse of deviation
        elementalPairs: ['Fire', 'Water', 'Earth', 'Air', 'Aether'],
        resonanceFrequency: mean * 432, // Sacred frequency modulation
        coherenceShift: this.calculateCoherenceShift(fieldState),
        emergenceIndicator: 0.9, // High emergence probability with pentagram harmony
        description: `Sacred pentagram harmony detected - all elemental fields resonating at ${mean.toFixed(3)}`
      };
    }

    return null;
  }

  /**
   * Detect emergence events
   */
  private detectEmergenceEvents(
    fieldState: CompleteElementalFieldState,
    timestamp: Date
  ): EmergenceEvent[] {
    const events: EmergenceEvent[] = [];

    // Breakthrough detection
    if (fieldState.emergentPotential > this.configuration.emergenceThreshold) {
      const triggeringElement = this.identifyTriggeringElement(fieldState);
      events.push({
        timestamp,
        eventType: 'breakthrough',
        triggeringElement,
        affectedElements: this.getAffectedElements(fieldState, triggeringElement),
        intensity: fieldState.emergentPotential,
        duration: 0, // Will be calculated as event progresses
        description: `Consciousness breakthrough initiated via ${triggeringElement} domain`,
        metadata: { emergentPotential: fieldState.emergentPotential }
      });
    }

    // Transcendence detection (aether dominance)
    if (fieldState.aetherResonance.unityConsciousness > 0.8) {
      events.push({
        timestamp,
        eventType: 'transcendence',
        triggeringElement: 'Aether',
        affectedElements: ['Fire', 'Water', 'Earth', 'Air'],
        intensity: fieldState.aetherResonance.unityConsciousness,
        duration: 0,
        description: 'Unity consciousness transcendence event',
        metadata: {
          unityLevel: fieldState.aetherResonance.unityConsciousness,
          transcendentIntegration: fieldState.transcendentIntegration
        }
      });
    }

    // Integration events (high elemental balance)
    if (fieldState.elementalBalance > 0.85) {
      events.push({
        timestamp,
        eventType: 'integration',
        triggeringElement: 'All',
        affectedElements: ['Fire', 'Water', 'Earth', 'Air', 'Aether'],
        intensity: fieldState.elementalBalance,
        duration: 0,
        description: 'Complete elemental integration achieved',
        metadata: { elementalBalance: fieldState.elementalBalance }
      });
    }

    return events;
  }

  /**
   * Identify which element is triggering an emergence event
   */
  private identifyTriggeringElement(fieldState: CompleteElementalFieldState): string {
    const elements = {
      'Fire': fieldState.fireResonance.emergenceProbability,
      'Water': fieldState.waterResonance.shadowIntegration,
      'Earth': fieldState.earthResonance.manifestationPower,
      'Air': fieldState.airResonance.wisdomIntegration,
      'Aether': fieldState.aetherResonance.transcendentCoherence
    };

    return Object.keys(elements).reduce((a, b) =>
      elements[a as keyof typeof elements] > elements[b as keyof typeof elements] ? a : b
    );
  }

  /**
   * Get elements affected by a triggering event
   */
  private getAffectedElements(fieldState: CompleteElementalFieldState, triggeringElement: string): string[] {
    const threshold = 0.5;
    const affected: string[] = [];

    if (fieldState.fireResonance.fireElementBalance > threshold) affected.push('Fire');
    if (fieldState.waterResonance.waterElementBalance > threshold) affected.push('Water');
    if (fieldState.earthResonance.earthElementBalance > threshold) affected.push('Earth');
    if (fieldState.airResonance.airElementBalance > threshold) affected.push('Air');
    if (fieldState.aetherResonance.aetherElementBalance > threshold) affected.push('Aether');

    return affected.filter(el => el !== triggeringElement);
  }

  /**
   * Calculate resonance frequency for elemental interaction
   */
  private calculateResonanceFrequency(elements: string[], fieldState: CompleteElementalFieldState): number {
    const baseFrequencies = {
      'Fire': 528,    // Love frequency
      'Water': 396,   // Liberation frequency
      'Earth': 174,   // Foundation frequency
      'Air': 741,     // Awakening frequency
      'Aether': 963   // Divine frequency
    };

    let totalFreq = 0;
    let count = 0;

    for (const element of elements) {
      if (element in baseFrequencies) {
        totalFreq += baseFrequencies[element as keyof typeof baseFrequencies];
        count++;
      }
    }

    const meanFrequency = count > 0 ? totalFreq / count : 432;

    // Modulate by field strength
    const modulation = fieldState.overallCoherence * 0.1;
    return meanFrequency * (1 + modulation);
  }

  /**
   * Calculate coherence shift from previous state
   */
  private calculateCoherenceShift(fieldState: CompleteElementalFieldState): number {
    if (this.fieldHistory.length === 0) return 0;

    const previousState = this.fieldHistory[this.fieldHistory.length - 1].fieldState;
    return fieldState.overallCoherence - previousState.overallCoherence;
  }

  /**
   * Generate human-readable pattern description
   */
  private generatePatternDescription(
    patternType: InterferencePattern['patternType'],
    elements: string[],
    intensity: number
  ): string {
    const elementStr = elements.join(' ↔ ');
    const intensityDesc = intensity > 0.8 ? 'strong' : intensity > 0.5 ? 'moderate' : 'subtle';

    const descriptions = {
      constructive: `${intensityDesc} constructive resonance between ${elementStr} - mutual amplification`,
      destructive: `${intensityDesc} creative tension between ${elementStr} - transformative friction`,
      harmonic: `${intensityDesc} harmonic resonance in ${elementStr} - sacred geometry activation`,
      chaotic: `${intensityDesc} chaotic interference in ${elementStr} - pattern exploration`,
      transcendent: `${intensityDesc} transcendent union through ${elementStr} - unity emergence`
    };

    return descriptions[patternType];
  }

  /**
   * Process detected patterns
   */
  private processPatterns(patterns: InterferencePattern[]): void {
    for (const pattern of patterns) {
      const patternKey = `${pattern.elementalPairs.join('-')}-${pattern.patternType}`;
      this.activePatterns.set(patternKey, pattern);

      // Trigger callback if registered
      if (this.callbacks.onPatternDetected) {
        this.callbacks.onPatternDetected(pattern);
      }
    }
  }

  /**
   * Process emergence events
   */
  private processEmergenceEvents(events: EmergenceEvent[]): void {
    for (const event of events) {
      // Trigger callback if registered
      if (this.callbacks.onEmergenceEvent) {
        this.callbacks.onEmergenceEvent(event);
      }
    }
  }

  /**
   * Check for significant coherence shifts
   */
  private checkCoherenceShifts(fieldState: CompleteElementalFieldState): void {
    if (this.fieldHistory.length === 0) return;

    const coherenceShift = this.calculateCoherenceShift(fieldState);
    const currentCoherence = fieldState.overallCoherence;

    // Alert on significant shifts
    if (Math.abs(coherenceShift) > 0.1) {
      if (this.callbacks.onCoherenceShift) {
        this.callbacks.onCoherenceShift(coherenceShift, currentCoherence);
      }
    }
  }

  /**
   * Prune old history entries
   */
  private pruneHistory(): void {
    const cutoffTime = new Date(Date.now() - (this.configuration.historyRetentionHours * 60 * 60 * 1000));
    this.fieldHistory = this.fieldHistory.filter(entry => entry.timestamp > cutoffTime);
  }

  // ==============================================================================
  // PUBLIC API METHODS
  // ==============================================================================

  /**
   * Register callback functions
   */
  onPatternDetected(callback: (pattern: InterferencePattern) => void): void {
    this.callbacks.onPatternDetected = callback;
  }

  onEmergenceEvent(callback: (event: EmergenceEvent) => void): void {
    this.callbacks.onEmergenceEvent = callback;
  }

  onCoherenceShift(callback: (shift: number, newCoherence: number) => void): void {
    this.callbacks.onCoherenceShift = callback;
  }

  /**
   * Get current active patterns
   */
  getActivePatterns(): InterferencePattern[] {
    return Array.from(this.activePatterns.values());
  }

  /**
   * Get field history
   */
  getFieldHistory(hours?: number): ElementalFieldHistory[] {
    if (!hours) return this.fieldHistory;

    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    return this.fieldHistory.filter(entry => entry.timestamp > cutoffTime);
  }

  /**
   * Get current monitoring statistics
   */
  getMonitoringStats(): {
    isActive: boolean;
    samplingRate: number;
    historySize: number;
    activePatterns: number;
    totalEmergenceEvents: number;
  } {
    const totalEvents = this.fieldHistory.reduce(
      (sum, entry) => sum + entry.emergenceEvents.length, 0
    );

    return {
      isActive: this.monitoringActive,
      samplingRate: this.configuration.samplingRateHz,
      historySize: this.fieldHistory.length,
      activePatterns: this.activePatterns.size,
      totalEmergenceEvents: totalEvents
    };
  }

  /**
   * Update monitoring configuration
   */
  updateConfiguration(newConfig: Partial<MonitoringConfiguration>): void {
    this.configuration = { ...this.configuration, ...newConfig };

    // Restart monitoring if active to apply new sampling rate
    if (this.monitoringActive) {
      const wasActive = this.monitoringActive;
      this.stopMonitoring();
      if (wasActive) {
        // Note: would need system data source to restart
        console.log('Monitor configuration updated - manual restart required');
      }
    }
  }

  /**
   * Get real-time field status summary
   */
  getCurrentFieldSummary(): {
    timestamp: Date;
    overallCoherence: number;
    dominantPattern: string | null;
    emergenceStatus: string;
    elementalBalance: number;
    activeInterferences: number;
  } | null {
    if (this.fieldHistory.length === 0) return null;

    const latest = this.fieldHistory[this.fieldHistory.length - 1];
    const activePatterns = this.getActivePatterns();
    const dominantPattern = activePatterns.length > 0 ?
      activePatterns.reduce((a, b) => a.intensity > b.intensity ? a : b).description : null;

    let emergenceStatus = 'Stable';
    if (latest.fieldState.emergentPotential > 0.8) emergenceStatus = 'Breakthrough Imminent';
    else if (latest.fieldState.emergentPotential > 0.6) emergenceStatus = 'Emergence Building';
    else if (latest.fieldState.overallCoherence > 0.8) emergenceStatus = 'High Coherence';

    return {
      timestamp: latest.timestamp,
      overallCoherence: latest.fieldState.overallCoherence,
      dominantPattern,
      emergenceStatus,
      elementalBalance: latest.fieldState.elementalBalance,
      activeInterferences: activePatterns.length
    };
  }
}

export default ElementalInterferenceMonitor;