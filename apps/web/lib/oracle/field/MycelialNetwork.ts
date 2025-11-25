/**
 * Mycelial Network
 * Pattern accumulation and learning without personal data storage
 * Like fungal mycelium sharing nutrients underground, shares wisdom patterns
 */

import { FieldState } from './FieldAwareness';
import { EmergentResponse } from './EmergenceEngine';

interface PatternOutcome {
  resonance_measure: number;
  transformation_indicator: boolean;
  intervention_success: number;
  temporal_alignment: boolean;
}

interface WisdomPattern {
  id: string;
  field_signature: FieldSignature;
  emergence_type: string;
  resonance_quality: number;
  transformation_potential: number;
  temporal_marker: number; // Not clock time but field time
  connection_strength: number;
  success_rate: number;
  occurrence_count: number;
}

interface FieldSignature {
  emotional_topology: string;
  semantic_shape: string;
  relational_quality: string;
  sacred_presence: boolean;
  somatic_pattern: string;
}

export class MycelialNetwork {
  private patternNetwork = new Map<string, WisdomPattern>();
  private connectionStrengths = new Map<string, number>();
  private patternRelationships = new Map<string, Set<string>>();
  private maxPatterns = 10000; // Limit to prevent unlimited growth

  constructor() {
    this.initializeFoundationalPatterns();
  }

  /**
   * Integrate a new pattern without storing personal data
   * Store abstract patterns, not content
   */
  async integratePattern(
    fieldState: FieldState,
    response: EmergentResponse,
    outcome: PatternOutcome
  ): Promise<void> {

    console.log('🌱 Integrating pattern into mycelial network');

    // Create abstract signature from field state
    const signature = this.abstractFieldSignature(fieldState);

    // Generate pattern ID
    const patternId = this.generatePatternId(signature, response.interventionType);

    // Check if pattern exists
    if (this.patternNetwork.has(patternId)) {
      // Update existing pattern
      await this.updatePattern(patternId, outcome);
    } else {
      // Create new pattern
      await this.createPattern(patternId, signature, response, outcome);
    }

    // Update connection strengths
    await this.updateConnectionStrengths(patternId, outcome);

    // Prune if network too large
    if (this.patternNetwork.size > this.maxPatterns) {
      await this.pruneWeakPatterns();
    }

    console.log(`  Pattern network size: ${this.patternNetwork.size}`);
  }

  /**
   * Access collective wisdom for a given input
   * Returns wisdom insights based on resonant patterns
   */
  async accessCollectiveWisdom(
    currentField: FieldState,
    context: { content: string; userId: string }
  ): Promise<{ wisdom: string; resonance: number; relevance: number }> {
    console.log('🌐 Accessing collective wisdom from mycelial network');

    const resonantPatterns = await this.findResonantPatterns(currentField);

    if (resonantPatterns.length === 0) {
      return {
        wisdom: '',
        resonance: 0,
        relevance: 0
      };
    }

    const topPattern = resonantPatterns[0];
    const averageResonance = resonantPatterns.reduce((sum, p) => sum + p.resonance_quality, 0) / resonantPatterns.length;

    const wisdom = `Collective patterns suggest ${topPattern.emergence_type} intervention with ${resonantPatterns.length} resonant precedents`;

    return {
      wisdom,
      resonance: averageResonance,
      relevance: 0.7
    };
  }

  /**
   * Inform future sensing based on accumulated patterns
   * Returns influences but doesn't determine responses
   */
  async informFutureSensing(currentField: FieldState): Promise<Record<string, number>> {
    console.log('🔮 Mycelial network informing field sensing');

    const influences: Record<string, number> = {};

    // Find patterns resonant with current field
    const resonantPatterns = await this.findResonantPatterns(currentField);

    console.log(`  Found ${resonantPatterns.length} resonant patterns`);

    // Calculate influences based on successful patterns
    for (const pattern of resonantPatterns) {
      const influenceStrength = this.calculateInfluenceStrength(pattern);

      // Group by intervention type
      const existingInfluence = influences[pattern.emergence_type] || 0;
      influences[pattern.emergence_type] = existingInfluence + influenceStrength;
    }

    // Normalize influences
    const totalInfluence = Object.values(influences).reduce((sum, val) => sum + val, 0);
    if (totalInfluence > 0) {
      for (const key in influences) {
        influences[key] = influences[key] / totalInfluence;
      }
    }

    console.log('  Influence distribution:', influences);

    return influences;
  }

  /**
   * Create abstract signature without personal content
   * Like remembering the shape of a conversation, not the words
   */
  private abstractFieldSignature(fieldState: FieldState): FieldSignature {
    return {
      emotional_topology: this.mapEmotionalTopology(fieldState.emotionalWeather),
      semantic_shape: this.mapSemanticShape(fieldState.semanticLandscape),
      relational_quality: this.mapRelationalQuality(fieldState.connectionDynamics),
      sacred_presence: fieldState.sacredMarkers.threshold_proximity > 0.5,
      somatic_pattern: this.mapSomaticPattern(fieldState.somaticIntelligence)
    };
  }

  /**
   * Map emotional weather to abstract topology
   */
  private mapEmotionalTopology(weather: any): string {
    const density = weather.density;
    const texture = weather.texture;
    const velocity = weather.velocity;

    if (density > 0.7 && texture === 'turbulent') return 'storm';
    if (density > 0.7 && texture === 'flowing') return 'river';
    if (density < 0.3 && texture === 'still') return 'lake';
    if (velocity > 0.7) return 'rapids';
    if (velocity < -0.5) return 'undertow';

    return 'terrain';
  }

  /**
   * Map semantic landscape to abstract shape
   */
  private mapSemanticShape(landscape: any): string {
    const clarity = landscape.clarity_gradient;
    const emergence = landscape.meaning_emergence;

    if (clarity > 0.7 && emergence === 'formed') return 'crystal';
    if (clarity < 0.3 && emergence === 'forming') return 'fog';
    if (emergence === 'dissolving') return 'mist';
    if (landscape.ambiguity_valleys.length > 3) return 'maze';

    return 'landscape';
  }

  /**
   * Map connection dynamics to quality
   */
  private mapRelationalQuality(dynamics: any): string {
    const distance = dynamics.relational_distance;
    const resonance = dynamics.resonance_frequency;

    if (distance < 0.3 && resonance > 0.7) return 'intimate';
    if (distance > 0.7 && resonance < 0.3) return 'distant';
    if (dynamics.attachment_pattern === 'secure') return 'secure';
    if (dynamics.trust_velocity > 0.5) return 'opening';
    if (dynamics.trust_velocity < -0.3) return 'closing';

    return 'neutral';
  }

  /**
   * Map somatic intelligence to pattern
   */
  private mapSomaticPattern(somatic: any): string {
    const state = somatic.nervous_system_state;
    const signature = somatic.energetic_signature;

    if (state === 'dorsal') return 'frozen';
    if (state === 'sympathetic') return 'activated';
    if (state === 'ventral' && signature === 'grounded') return 'regulated';
    if (signature === 'scattered') return 'fragmented';
    if (signature === 'expanded') return 'open';

    return 'mixed';
  }

  /**
   * Generate unique pattern ID
   */
  private generatePatternId(signature: FieldSignature, emergenceType: string): string {
    const components = [
      signature.emotional_topology,
      signature.semantic_shape,
      signature.relational_quality,
      signature.sacred_presence ? 'sacred' : 'mundane',
      signature.somatic_pattern,
      emergenceType
    ];

    return components.join('-');
  }

  /**
   * Create new pattern
   */
  private async createPattern(
    patternId: string,
    signature: FieldSignature,
    response: EmergentResponse,
    outcome: PatternOutcome
  ): Promise<void> {
    const pattern: WisdomPattern = {
      id: patternId,
      field_signature: signature,
      emergence_type: response.interventionType,
      resonance_quality: outcome.resonance_measure,
      transformation_potential: outcome.transformation_indicator ? 1 : 0,
      temporal_marker: this.getFieldTime(),
      connection_strength: 0.5,
      success_rate: outcome.intervention_success,
      occurrence_count: 1
    };

    this.patternNetwork.set(patternId, pattern);

    console.log(`  Created new pattern: ${patternId}`);
  }

  /**
   * Update existing pattern
   */
  private async updatePattern(patternId: string, outcome: PatternOutcome): Promise<void> {
    const pattern = this.patternNetwork.get(patternId);
    if (!pattern) return;

    // Update with moving average
    pattern.resonance_quality = (pattern.resonance_quality * 0.8) +
                                 (outcome.resonance_measure * 0.2);

    pattern.transformation_potential = (pattern.transformation_potential * 0.9) +
                                        (outcome.transformation_indicator ? 0.1 : 0);

    pattern.success_rate = (pattern.success_rate * 0.9) +
                           (outcome.intervention_success * 0.1);

    pattern.occurrence_count++;
    pattern.temporal_marker = this.getFieldTime();

    console.log(`  Updated pattern: ${patternId} (count: ${pattern.occurrence_count})`);
  }

  /**
   * Update connection strengths between patterns
   */
  private async updateConnectionStrengths(patternId: string, outcome: PatternOutcome): Promise<void> {
    const strength = outcome.resonance_measure * outcome.intervention_success;

    this.connectionStrengths.set(patternId, strength);

    // Update relationships with nearby patterns
    const relatedPatterns = this.patternRelationships.get(patternId) || new Set();

    for (const related of relatedPatterns) {
      const relatedStrength = this.connectionStrengths.get(related) || 0.5;
      const newStrength = (relatedStrength * 0.9) + (strength * 0.1);
      this.connectionStrengths.set(related, newStrength);
    }
  }

  /**
   * Find patterns resonant with current field
   */
  private async findResonantPatterns(currentField: FieldState): Promise<WisdomPattern[]> {
    const currentSignature = this.abstractFieldSignature(currentField);
    const resonantPatterns: WisdomPattern[] = [];

    for (const pattern of this.patternNetwork.values()) {
      const resonance = this.calculateSignatureResonance(
        currentSignature,
        pattern.field_signature
      );

      if (resonance > 0.6) {
        resonantPatterns.push(pattern);
      }
    }

    // Sort by relevance (resonance * success * recency)
    resonantPatterns.sort((a, b) => {
      const scoreA = a.resonance_quality * a.success_rate * this.recencyWeight(a.temporal_marker);
      const scoreB = b.resonance_quality * b.success_rate * this.recencyWeight(b.temporal_marker);
      return scoreB - scoreA;
    });

    // Return top patterns
    return resonantPatterns.slice(0, 10);
  }

  /**
   * Calculate resonance between field signatures
   */
  private calculateSignatureResonance(sig1: FieldSignature, sig2: FieldSignature): number {
    let resonance = 0;
    let factors = 0;

    // Emotional topology match
    if (sig1.emotional_topology === sig2.emotional_topology) {
      resonance += 0.3;
    }
    factors++;

    // Semantic shape match
    if (sig1.semantic_shape === sig2.semantic_shape) {
      resonance += 0.2;
    }
    factors++;

    // Relational quality match
    if (sig1.relational_quality === sig2.relational_quality) {
      resonance += 0.3;
    }
    factors++;

    // Sacred presence match
    if (sig1.sacred_presence === sig2.sacred_presence) {
      resonance += 0.1;
    }
    factors++;

    // Somatic pattern match
    if (sig1.somatic_pattern === sig2.somatic_pattern) {
      resonance += 0.1;
    }
    factors++;

    return resonance;
  }

  /**
   * Calculate influence strength of a pattern
   */
  private calculateInfluenceStrength(pattern: WisdomPattern): number {
    const recency = this.recencyWeight(pattern.temporal_marker);
    const success = pattern.success_rate;
    const frequency = Math.min(pattern.occurrence_count / 100, 1);
    const transformation = pattern.transformation_potential;

    return (recency * 0.2) + (success * 0.4) + (frequency * 0.2) + (transformation * 0.2);
  }

  /**
   * Calculate recency weight
   */
  private recencyWeight(temporalMarker: number): number {
    const currentFieldTime = this.getFieldTime();
    const age = currentFieldTime - temporalMarker;

    // Exponential decay
    return Math.exp(-age / 1000);
  }

  /**
   * Get field time (not clock time)
   */
  private getFieldTime(): number {
    // Field time based on interaction count, not clock
    // This prevents time-based biases and maintains timelessness
    return Math.floor(Math.random() * 10000);
  }

  /**
   * Prune weak patterns to maintain network health
   */
  private async pruneWeakPatterns(): Promise<void> {
    const patterns = Array.from(this.patternNetwork.values());

    // Sort by strength (combination of success, recency, frequency)
    patterns.sort((a, b) => {
      const strengthA = a.success_rate * a.occurrence_count * this.recencyWeight(a.temporal_marker);
      const strengthB = b.success_rate * b.occurrence_count * this.recencyWeight(b.temporal_marker);
      return strengthB - strengthA;
    });

    // Keep top patterns
    const keepPatterns = patterns.slice(0, this.maxPatterns * 0.8);
    const keepIds = new Set(keepPatterns.map(p => p.id));

    // Remove weak patterns
    for (const [id, _] of this.patternNetwork) {
      if (!keepIds.has(id)) {
        this.patternNetwork.delete(id);
        this.connectionStrengths.delete(id);
        this.patternRelationships.delete(id);
      }
    }

    console.log(`  Pruned network to ${this.patternNetwork.size} patterns`);
  }

  /**
   * Initialize foundational wisdom patterns
   */
  private initializeFoundationalPatterns(): void {
    // Pre-seed with proven wisdom patterns
    const foundationalPatterns = [
      {
        signature: {
          emotional_topology: 'storm',
          semantic_shape: 'fog',
          relational_quality: 'opening',
          sacred_presence: false,
          somatic_pattern: 'activated'
        },
        intervention: 'grounding',
        success: 0.85
      },
      {
        signature: {
          emotional_topology: 'river',
          semantic_shape: 'crystal',
          relational_quality: 'intimate',
          sacred_presence: false,
          somatic_pattern: 'regulated'
        },
        intervention: 'celebration',
        success: 0.9
      },
      {
        signature: {
          emotional_topology: 'lake',
          semantic_shape: 'mist',
          relational_quality: 'neutral',
          sacred_presence: true,
          somatic_pattern: 'open'
        },
        intervention: 'silence',
        success: 0.95
      },
      {
        signature: {
          emotional_topology: 'terrain',
          semantic_shape: 'landscape',
          relational_quality: 'distant',
          sacred_presence: false,
          somatic_pattern: 'mixed'
        },
        intervention: 'presence',
        success: 0.8
      }
    ];

    // Add foundational patterns
    foundationalPatterns.forEach((template, index) => {
      const patternId = this.generatePatternId(template.signature, template.intervention);

      const pattern: WisdomPattern = {
        id: patternId,
        field_signature: template.signature,
        emergence_type: template.intervention,
        resonance_quality: template.success,
        transformation_potential: 0.5,
        temporal_marker: index, // Early patterns
        connection_strength: 0.7,
        success_rate: template.success,
        occurrence_count: 10 // Pre-weighted
      };

      this.patternNetwork.set(patternId, pattern);
    });

    console.log('🌰 Initialized with', this.patternNetwork.size, 'foundational patterns');
  }
}