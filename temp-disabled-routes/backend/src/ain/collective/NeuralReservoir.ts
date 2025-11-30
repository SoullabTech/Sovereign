/**
 * Neural Reservoir for Collective Intelligence Processing
 * Central pattern aggregation and field state computation for the AIN system
 */

import { Logger } from '../../types/core';
import { 
  AfferentStream, 
  CollectiveFieldState,
  ElementalSignature,
  ArchetypeMap,
  EmergentPattern
} from './CollectiveIntelligence';
import { PatternRecognitionEngine, PatternCandidate } from './PatternRecognitionEngine';
import { EvolutionTracker } from './EvolutionTracker';

export interface ReservoirConfig {
  windowSize: number; // Time window for pattern detection (ms)
  minParticipants: number; // Minimum users for pattern emergence
  coherenceThreshold: number; // Field coherence threshold
  updateInterval: number; // Field state update interval (ms)
}

export interface StreamBuffer {
  streams: AfferentStream[];
  windowStart: Date;
  windowEnd: Date;
}

export interface FieldMetrics {
  coherence: number;
  complexity: number;
  resonance: number;
  evolution: number;
  healing: number;
}

export interface CollectiveInsight {
  insight: string;
  confidence: number;
  relevantPatterns: EmergentPattern[];
  supportingData: FieldMetrics;
  timingGuidance: string;
}

export class NeuralReservoir {
  private fieldState: CollectiveFieldState;
  private streamBuffer: StreamBuffer;
  private patternEngine: PatternRecognitionEngine;
  private evolutionTracker: EvolutionTracker;
  private updateTimer?: NodeJS.Timeout;
  
  private readonly defaultConfig: ReservoirConfig = {
    windowSize: 5 * 60 * 1000, // 5 minutes
    minParticipants: 3,
    coherenceThreshold: 0.7,
    updateInterval: 10 * 1000 // 10 seconds
  };

  constructor(
    private logger: Logger,
    private config: Partial<ReservoirConfig> = {}
  ) {
    this.config = { ...this.defaultConfig, ...config };
    this.fieldState = this.initializeFieldState();
    this.streamBuffer = this.initializeStreamBuffer();
    this.patternEngine = new PatternRecognitionEngine(logger);
    this.evolutionTracker = new EvolutionTracker(logger);
    
    // Start periodic field state updates
    this.startFieldStateUpdates();
  }

  /**
   * Process incoming afferent stream
   */
  async processAfferentStream(stream: AfferentStream): Promise<void> {
    // Add to buffer
    this.streamBuffer.streams.push(stream);
    
    // Update user evolution
    await this.evolutionTracker.recordEvolution(stream);
    
    // Clean old streams
    this.cleanStreamBuffer();
    
    // Update field state incrementally
    this.updateFieldStateIncremental(stream);
    
    // Check for immediate pattern detection if significant event
    if (stream.consciousnessLevel > 0.8 || stream.evolutionVelocity > 0.8) {
      await this.detectPatternsImmediate();
    }
  }

  /**
   * Get current collective field state
   */
  getFieldState(): CollectiveFieldState {
    return { ...this.fieldState };
  }

  /**
   * Generate collective insight for a query
   */
  async generateCollectiveInsight(
    userId: string,
    intent: string,
    element: keyof ElementalSignature
  ): Promise<CollectiveInsight> {
    // Get user's evolution context
    const userGuidance = await this.evolutionTracker.generateGuidance(userId);
    
    // Find relevant patterns
    const relevantPatterns = await this.findRelevantPatterns(intent, element);
    
    // Calculate field metrics
    const metrics = this.calculateFieldMetrics();
    
    // Generate insight based on field state and patterns
    const insight = this.synthesizeInsight(
      this.fieldState,
      relevantPatterns,
      metrics,
      userGuidance
    );
    
    return insight;
  }

  /**
   * Get evolution statistics from the collective
   */
  async getEvolutionStats() {
    return this.evolutionTracker.getCollectiveEvolutionStats();
  }

  /**
   * Get active patterns in the field
   */
  async getActivePatterns(timeframe?: string): Promise<EmergentPattern[]> {
    const candidates = this.extractPatternCandidates();
    return this.patternEngine.detectPatterns(candidates, this.fieldState);
  }

  /**
   * Shutdown and cleanup
   */
  shutdown(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
  }

  // Private initialization methods

  private initializeFieldState(): CollectiveFieldState {
    return {
      timestamp: new Date(),
      totalParticipants: 0,
      activeUsers: 0,
      collectiveElementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2
      },
      averageAwareness: 0.3,
      fieldCoherence: 0.5,
      emergentComplexity: 0.4,
      healingCapacity: 0.5,
      dominantArchetypes: {},
      emergingArchetypes: {},
      shadowArchetypes: {},
      collectiveGrowthRate: 0.5,
      breakthroughPotential: 0.3,
      integrationNeed: 0.5
    };
  }

  private initializeStreamBuffer(): StreamBuffer {
    const now = new Date();
    return {
      streams: [],
      windowStart: now,
      windowEnd: new Date(now.getTime() + this.config.windowSize!)
    };
  }

  // Field state update methods

  private startFieldStateUpdates(): void {
    this.updateTimer = setInterval(async () => {
      await this.updateFieldState();
    }, this.config.updateInterval!);
  }

  private async updateFieldState(): Promise<void> {
    if (this.streamBuffer.streams.length === 0) return;
    
    // Get evolution stats
    const evolutionStats = await this.evolutionTracker.getCollectiveEvolutionStats();
    
    // Update basic metrics
    this.fieldState.totalParticipants = new Set(
      this.streamBuffer.streams.map(s => s.userId)
    ).size;
    this.fieldState.activeUsers = this.streamBuffer.streams.length;
    this.fieldState.averageAwareness = evolutionStats.averageAwareness;
    
    // Update elemental balance
    this.updateCollectiveElementalBalance();
    
    // Update field metrics
    this.fieldState.fieldCoherence = this.calculateFieldCoherence();
    this.fieldState.emergentComplexity = this.calculateEmergentComplexity();
    this.fieldState.healingCapacity = this.calculateHealingCapacity();
    
    // Update archetypal patterns
    this.updateArchetypalPatterns();
    
    // Update evolution metrics
    this.fieldState.collectiveGrowthRate = evolutionStats.evolutionVelocity;
    this.fieldState.breakthroughPotential = this.calculateBreakthroughPotential();
    this.fieldState.integrationNeed = this.calculateIntegrationNeed();
    
    this.fieldState.timestamp = new Date();
    
    // Detect patterns
    await this.detectPatterns();
  }

  private updateFieldStateIncremental(stream: AfferentStream): void {
    // Quick incremental updates for real-time responsiveness
    const alpha = 0.1; // Smoothing factor
    
    // Update average awareness
    this.fieldState.averageAwareness = 
      this.fieldState.averageAwareness * (1 - alpha) + 
      stream.consciousnessLevel * alpha;
    
    // Update elemental balance incrementally
    Object.entries(stream.elementalResonance).forEach(([element, value]) => {
      const key = element as keyof ElementalSignature;
      this.fieldState.collectiveElementalBalance[key] = 
        this.fieldState.collectiveElementalBalance[key] * (1 - alpha) + 
        value * alpha;
    });
  }

  private updateCollectiveElementalBalance(): void {
    const balances: ElementalSignature = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };
    
    this.streamBuffer.streams.forEach(stream => {
      Object.entries(stream.elementalResonance).forEach(([element, value]) => {
        balances[element as keyof ElementalSignature] += value;
      });
    });
    
    // Normalize
    const total = this.streamBuffer.streams.length || 1;
    Object.keys(balances).forEach(element => {
      balances[element as keyof ElementalSignature] /= total;
    });
    
    this.fieldState.collectiveElementalBalance = balances;
  }

  private updateArchetypalPatterns(): void {
    const archetypeCounts: Record<string, number> = {};
    const archetypeShadows: Record<string, number> = {};
    
    this.streamBuffer.streams.forEach(stream => {
      Object.entries(stream.archetypeActivation).forEach(([archetype, activation]) => {
        archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + activation;
        
        // Track shadow aspects
        if (stream.shadowWorkEngagement.length > 0) {
          archetypeShadows[archetype] = (archetypeShadows[archetype] || 0) + activation * 0.5;
        }
      });
    });
    
    // Normalize and separate into dominant/emerging
    const total = this.streamBuffer.streams.length || 1;
    const dominant: ArchetypeMap = {};
    const emerging: ArchetypeMap = {};
    const shadow: ArchetypeMap = {};
    
    Object.entries(archetypeCounts).forEach(([archetype, count]) => {
      const normalized = count / total;
      if (normalized > 0.5) {
        dominant[archetype] = normalized;
      } else if (normalized > 0.3) {
        emerging[archetype] = normalized;
      }
      
      if (archetypeShadows[archetype]) {
        shadow[archetype] = archetypeShadows[archetype] / total;
      }
    });
    
    this.fieldState.dominantArchetypes = dominant;
    this.fieldState.emergingArchetypes = emerging;
    this.fieldState.shadowArchetypes = shadow;
  }

  // Field metrics calculation

  private calculateFieldCoherence(): number {
    if (this.streamBuffer.streams.length < 2) return 0.5;
    
    // Calculate variance in consciousness levels
    const consciousnessLevels = this.streamBuffer.streams.map(s => s.consciousnessLevel);
    const mean = consciousnessLevels.reduce((sum, v) => sum + v, 0) / consciousnessLevels.length;
    const variance = consciousnessLevels.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / consciousnessLevels.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower variance = higher coherence
    const varianceCoherence = Math.max(0, 1 - stdDev);
    
    // Calculate elemental harmony
    const elementalHarmony = this.calculateElementalHarmony();
    
    // Calculate phase alignment
    const phaseAlignment = this.calculatePhaseAlignment();
    
    return (varianceCoherence + elementalHarmony + phaseAlignment) / 3;
  }

  private calculateElementalHarmony(): number {
    const balance = this.fieldState.collectiveElementalBalance;
    const values = Object.values(balance);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    // Perfect balance would have variance = 0
    return Math.max(0, 1 - Math.sqrt(variance) * 2);
  }

  private calculatePhaseAlignment(): number {
    const phaseCounts: Record<string, number> = {};
    let total = 0;
    
    this.streamBuffer.streams.forEach(stream => {
      phaseCounts[stream.spiralPhase] = (phaseCounts[stream.spiralPhase] || 0) + 1;
      total++;
    });
    
    if (total === 0) return 0.5;
    
    // Higher concentration in fewer phases = higher alignment
    const maxCount = Math.max(...Object.values(phaseCounts));
    return maxCount / total;
  }

  private calculateEmergentComplexity(): number {
    // Based on diversity of patterns and interactions
    const uniqueUsers = new Set(this.streamBuffer.streams.map(s => s.userId)).size;
    const uniqueArchetypes = Object.keys(this.fieldState.dominantArchetypes).length + 
                           Object.keys(this.fieldState.emergingArchetypes).length;
    const averageEvolution = this.streamBuffer.streams.reduce((sum, s) => 
      sum + s.evolutionVelocity, 0) / (this.streamBuffer.streams.length || 1);
    
    // Normalize factors
    const userDiversity = Math.min(1, uniqueUsers / 20);
    const archetypeDiversity = Math.min(1, uniqueArchetypes / 10);
    
    return (userDiversity + archetypeDiversity + averageEvolution) / 3;
  }

  private calculateHealingCapacity(): number {
    const shadowWork = this.streamBuffer.streams.filter(s => 
      s.shadowWorkEngagement.length > 0
    ).length;
    const totalStreams = this.streamBuffer.streams.length || 1;
    const shadowEngagement = shadowWork / totalStreams;
    
    const averageAuthenticity = this.streamBuffer.streams.reduce((sum, s) => 
      sum + s.authenticityLevel, 0) / totalStreams;
    
    const fieldCoherence = this.fieldState.fieldCoherence;
    
    return (shadowEngagement + averageAuthenticity + fieldCoherence) / 3;
  }

  private calculateBreakthroughPotential(): number {
    const highConsciousness = this.streamBuffer.streams.filter(s => 
      s.consciousnessLevel > 0.7
    ).length;
    const highVelocity = this.streamBuffer.streams.filter(s => 
      s.evolutionVelocity > 0.7
    ).length;
    const totalStreams = this.streamBuffer.streams.length || 1;
    
    const potential = ((highConsciousness + highVelocity) / (totalStreams * 2)) * 
                     this.fieldState.fieldCoherence;
    
    return Math.min(1, potential * 1.5); // Amplify slightly
  }

  private calculateIntegrationNeed(): number {
    const recentBreakthroughs = this.streamBuffer.streams.filter(s => 
      s.evolutionVelocity > 0.8
    ).length;
    const totalStreams = this.streamBuffer.streams.length || 1;
    const breakthroughRate = recentBreakthroughs / totalStreams;
    
    const averageIntegration = this.streamBuffer.streams.reduce((sum, s) => 
      sum + s.integrationDepth, 0) / totalStreams;
    
    // High breakthrough rate + low integration = high need
    const need = breakthroughRate * (1 - averageIntegration);
    
    return Math.min(1, need * 2); // Amplify the signal
  }

  private calculateFieldMetrics(): FieldMetrics {
    return {
      coherence: this.fieldState.fieldCoherence,
      complexity: this.fieldState.emergentComplexity,
      resonance: this.calculateResonance(),
      evolution: this.fieldState.collectiveGrowthRate,
      healing: this.fieldState.healingCapacity
    };
  }

  private calculateResonance(): number {
    // How well individual streams resonate with collective field
    const resonances = this.streamBuffer.streams.map(stream => {
      let resonance = 0;
      
      // Elemental resonance
      Object.entries(stream.elementalResonance).forEach(([element, value]) => {
        const fieldValue = this.fieldState.collectiveElementalBalance[element as keyof ElementalSignature];
        resonance += 1 - Math.abs(value - fieldValue);
      });
      resonance /= 5; // Normalize by number of elements
      
      // Consciousness resonance
      const consciousnessResonance = 1 - Math.abs(
        stream.consciousnessLevel - this.fieldState.averageAwareness
      );
      
      return (resonance + consciousnessResonance) / 2;
    });
    
    return resonances.reduce((sum, r) => sum + r, 0) / (resonances.length || 1);
  }

  // Pattern detection methods

  private async detectPatterns(): Promise<void> {
    const candidates = this.extractPatternCandidates();
    const patterns = await this.patternEngine.detectPatterns(candidates, this.fieldState);
    
    // Process detected patterns
    patterns.forEach(pattern => {
      this.logger.info(`Detected pattern: ${pattern.type}`, {
        strength: pattern.strength,
        participants: pattern.participants.length
      });
    });
  }

  private async detectPatternsImmediate(): Promise<void> {
    // Immediate pattern detection for significant events
    const recentStreams = this.streamBuffer.streams.slice(-10);
    const candidates = this.extractPatternCandidatesFromStreams(recentStreams);
    
    if (candidates.length > 0) {
      const patterns = await this.patternEngine.detectPatterns(candidates, this.fieldState);
      if (patterns.length > 0) {
        this.logger.info('Immediate pattern detection triggered', {
          patterns: patterns.map(p => p.type)
        });
      }
    }
  }

  private extractPatternCandidates(): PatternCandidate[] {
    return this.extractPatternCandidatesFromStreams(this.streamBuffer.streams);
  }

  private extractPatternCandidatesFromStreams(streams: AfferentStream[]): PatternCandidate[] {
    const candidates: PatternCandidate[] = [];
    
    // Group by similar characteristics
    const groups = this.groupStreamsBySimilarity(streams);
    
    groups.forEach(group => {
      if (group.length >= this.config.minParticipants!) {
        const candidate: PatternCandidate = {
          type: this.inferPatternType(group),
          streams: group,
          strength: this.calculatePatternStrength(group),
          elementalSignature: this.averageElementalSignatures(group),
          archetypalInvolvement: this.mergeArchetypes(group)
        };
        
        candidates.push(candidate);
      }
    });
    
    return candidates;
  }

  private groupStreamsBySimilarity(streams: AfferentStream[]): AfferentStream[][] {
    const groups: AfferentStream[][] = [];
    const used = new Set<number>();
    
    streams.forEach((stream, i) => {
      if (used.has(i)) return;
      
      const group = [stream];
      used.add(i);
      
      streams.forEach((other, j) => {
        if (i !== j && !used.has(j)) {
          const similarity = this.calculateStreamSimilarity(stream, other);
          if (similarity > 0.7) {
            group.push(other);
            used.add(j);
          }
        }
      });
      
      if (group.length > 1) {
        groups.push(group);
      }
    });
    
    return groups;
  }

  private calculateStreamSimilarity(a: AfferentStream, b: AfferentStream): number {
    let similarity = 0;
    let factors = 0;
    
    // Phase similarity
    if (a.spiralPhase === b.spiralPhase) {
      similarity += 1;
    }
    factors++;
    
    // Consciousness level similarity
    similarity += 1 - Math.abs(a.consciousnessLevel - b.consciousnessLevel);
    factors++;
    
    // Elemental similarity
    let elementalSim = 0;
    Object.keys(a.elementalResonance).forEach(element => {
      const key = element as keyof ElementalSignature;
      elementalSim += 1 - Math.abs(a.elementalResonance[key] - b.elementalResonance[key]);
    });
    similarity += elementalSim / 5;
    factors++;
    
    // Shadow work similarity
    if (a.shadowWorkEngagement.length > 0 && b.shadowWorkEngagement.length > 0) {
      similarity += 0.5;
    }
    factors += 0.5;
    
    return similarity / factors;
  }

  private inferPatternType(streams: AfferentStream[]): string {
    // Analyze dominant characteristics
    const avgConsciousness = streams.reduce((sum, s) => sum + s.consciousnessLevel, 0) / streams.length;
    const avgVelocity = streams.reduce((sum, s) => sum + s.evolutionVelocity, 0) / streams.length;
    const shadowWork = streams.filter(s => s.shadowWorkEngagement.length > 0).length / streams.length;
    
    if (shadowWork > 0.7) return 'shadow_integration';
    if (avgVelocity > 0.8) return 'rapid_evolution';
    if (avgConsciousness > 0.8) return 'consciousness_elevation';
    
    return 'coherence_building';
  }

  private calculatePatternStrength(streams: AfferentStream[]): number {
    const coherence = this.calculateGroupCoherence(streams);
    const intensity = streams.reduce((sum, s) => 
      sum + s.consciousnessLevel * s.evolutionVelocity, 0
    ) / streams.length;
    
    return Math.min(1, (coherence + intensity) / 2 * 1.2);
  }

  private calculateGroupCoherence(streams: AfferentStream[]): number {
    if (streams.length < 2) return 0.5;
    
    // Calculate variance in key metrics
    const metrics = ['consciousnessLevel', 'evolutionVelocity', 'integrationDepth'];
    let totalCoherence = 0;
    
    metrics.forEach(metric => {
      const values = streams.map(s => s[metric as keyof AfferentStream] as number);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const coherence = Math.max(0, 1 - Math.sqrt(variance));
      totalCoherence += coherence;
    });
    
    return totalCoherence / metrics.length;
  }

  private averageElementalSignatures(streams: AfferentStream[]): ElementalSignature {
    const avg: ElementalSignature = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    const count = streams.length || 1;
    
    streams.forEach(stream => {
      Object.entries(stream.elementalResonance).forEach(([element, value]) => {
        avg[element as keyof ElementalSignature] += value / count;
      });
    });
    
    return avg;
  }

  private mergeArchetypes(streams: AfferentStream[]): ArchetypeMap {
    const merged: ArchetypeMap = {};
    
    streams.forEach(stream => {
      Object.entries(stream.archetypeActivation).forEach(([archetype, activation]) => {
        merged[archetype] = Math.max(merged[archetype] || 0, activation);
      });
    });
    
    return merged;
  }

  // Pattern finding and insight generation

  private async findRelevantPatterns(
    intent: string,
    element: keyof ElementalSignature
  ): Promise<EmergentPattern[]> {
    const allPatterns = await this.getActivePatterns();
    
    return allPatterns.filter(pattern => {
      // Element relevance
      if (pattern.elementalSignature[element] > 0.5) return true;
      
      // Intent relevance (simplified - in production would use NLP)
      if (intent.toLowerCase().includes('shadow') && pattern.type === 'shadow_surfacing') return true;
      if (intent.toLowerCase().includes('growth') && pattern.type === 'consciousness_leap') return true;
      if (intent.toLowerCase().includes('balance') && pattern.type === 'integration_phase') return true;
      
      return false;
    });
  }

  private synthesizeInsight(
    fieldState: CollectiveFieldState,
    patterns: EmergentPattern[],
    metrics: FieldMetrics,
    userGuidance: any
  ): CollectiveInsight {
    let insight = '';
    let confidence = 0.5;
    
    // Field coherence insight
    if (metrics.coherence > 0.8) {
      insight += 'The collective field is highly coherent right now. ';
      confidence += 0.1;
    } else if (metrics.coherence < 0.4) {
      insight += 'The field is in a state of creative chaos. ';
    }
    
    // Pattern insights
    if (patterns.length > 0) {
      const dominantPattern = patterns[0];
      insight += `A ${dominantPattern.type.replace('_', ' ')} pattern is active. `;
      insight += dominantPattern.likelyProgression + ' ';
      confidence += 0.2;
    }
    
    // Evolution insights
    if (metrics.evolution > 0.7) {
      insight += 'Rapid collective evolution is underway. ';
      confidence += 0.1;
    }
    
    // Timing guidance
    let timingGuidance = '';
    if (fieldState.breakthroughPotential > 0.7) {
      timingGuidance = 'The field is primed for breakthrough. Act with clarity and trust.';
    } else if (fieldState.integrationNeed > 0.7) {
      timingGuidance = 'Integration is needed. Move slowly and ground your insights.';
    } else {
      timingGuidance = 'The timing supports steady progress. Trust your natural rhythm.';
    }
    
    return {
      insight: insight.trim(),
      confidence: Math.min(1, confidence),
      relevantPatterns: patterns,
      supportingData: metrics,
      timingGuidance
    };
  }

  // Buffer management

  private cleanStreamBuffer(): void {
    const cutoff = new Date(Date.now() - this.config.windowSize!);
    this.streamBuffer.streams = this.streamBuffer.streams.filter(s => 
      s.timestamp > cutoff
    );
    this.streamBuffer.windowStart = cutoff;
    this.streamBuffer.windowEnd = new Date();
  }
}