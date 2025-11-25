/**
 * Individual Field Memory - The "Memory Foam" Model
 *
 * Like memory foam - holds shape temporarily, returns patterns not content.
 * Implements privacy-first pattern storage that remembers the healing pattern,
 * not the wound.
 *
 * Privacy Guarantees:
 * - No raw text stored
 * - Patterns are abstract field signatures
 * - Automatic pruning maintains ephemeral nature
 * - One-way transformation prevents reconstruction
 */

import crypto from 'crypto';
import { FieldState, EmotionalWeather, SacredMarkers } from '../field/FieldAwareness';

export interface FieldSignature {
  emotional_topology: string;
  semantic_shape: string;
  relational_quality: string;
  sacred_presence: boolean;
  somatic_pattern: string;
  coherence_level: number;
  timestamp: number; // Unix timestamp for pattern age
}

export interface ResonanceRecord {
  pattern_hash: string;
  resonance_strength: number;
  transformation_occurred: boolean;
  intervention_type: string;
  outcome_quality: number; // 0-1 scale
}

export interface GrowthVector {
  direction: 'expanding' | 'contracting' | 'integrating' | 'stabilizing';
  magnitude: number;
  domain: 'emotional' | 'cognitive' | 'relational' | 'spiritual';
  resistance_points: string[];
}

interface StoredPattern {
  field_state: FieldSignature;
  coherence_signature: string;
  transformation_vector: GrowthVector;
  temporal_marker: 'morning' | 'afternoon' | 'evening' | 'night' | 'crisis';
  pattern_hash: string;
  created_at: number;
}

export class IndividualFieldMemory {
  private field_signatures: StoredPattern[] = [];
  private resonance_history: ResonanceRecord[] = [];
  private growth_vectors: GrowthVector[] = [];
  private readonly max_signatures = 100; // Memory foam limit
  private readonly max_resonance_records = 50;
  private readonly pattern_ttl = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  constructor(private userId: string) {
    console.log(`🧠 Initializing Individual Field Memory for user: ${userId.substring(0, 8)}...`);
  }

  /**
   * Store an interaction as abstract patterns only
   * Converts specific content to field signatures
   */
  async store_interaction(
    fieldState: FieldState,
    intervention: string,
    outcome: { success: boolean; coherence: number }
  ): Promise<void> {
    console.log('💾 Storing interaction pattern (content abstracted)');

    // Extract pattern without storing content
    const pattern: StoredPattern = {
      field_state: this.abstract_field(fieldState),
      coherence_signature: this.extract_coherence(fieldState),
      transformation_vector: this.calculate_growth(fieldState, outcome),
      temporal_marker: this.get_temporal_context(),
      pattern_hash: this.generate_pattern_hash(fieldState),
      created_at: Date.now()
    };

    // Store pattern
    this.field_signatures.push(pattern);

    // Record resonance
    const resonance: ResonanceRecord = {
      pattern_hash: pattern.pattern_hash,
      resonance_strength: fieldState.connectionDynamics.resonance_frequency,
      transformation_occurred: outcome.success,
      intervention_type: intervention,
      outcome_quality: outcome.coherence
    };
    this.resonance_history.push(resonance);

    // Maintain memory foam effect
    await this.prune_old_patterns();

    console.log(`  Patterns stored: ${this.field_signatures.length}/${this.max_signatures}`);
  }

  /**
   * Retrieve patterns that resonate with current state
   * Not searching keywords but matching field signatures
   */
  async retrieve_relevant_patterns(
    currentField: FieldState,
    limit: number = 5
  ): Promise<{
    patterns: StoredPattern[];
    learned_wisdom: string[];
    avoid_zones: string[];
  }> {
    console.log('🔍 Retrieving resonant patterns');

    const current_signature = this.abstract_field(currentField);
    const relevant_patterns: Array<{ pattern: StoredPattern; resonance: number }> = [];

    // Calculate resonance with stored patterns
    for (const past_pattern of this.field_signatures) {
      const resonance = this.calculate_field_resonance(current_signature, past_pattern.field_state);

      if (resonance > 0.6) { // Resonance threshold
        relevant_patterns.push({ pattern: past_pattern, resonance });
      }
    }

    // Sort by resonance strength
    relevant_patterns.sort((a, b) => b.resonance - a.resonance);
    const top_patterns = relevant_patterns.slice(0, limit).map(r => r.pattern);

    // Extract wisdom from successful patterns
    const learned_wisdom = await this.synthesize_wisdom(top_patterns, true);
    const avoid_zones = await this.synthesize_wisdom(top_patterns, false);

    console.log(`  Found ${top_patterns.length} resonant patterns`);

    return {
      patterns: top_patterns,
      learned_wisdom,
      avoid_zones
    };
  }

  /**
   * Convert field state to abstract signature
   * This is one-way transformation - cannot reconstruct original
   */
  private abstract_field(fieldState: FieldState): FieldSignature {
    return {
      emotional_topology: this.map_emotional_topology(fieldState.emotionalWeather),
      semantic_shape: this.map_semantic_shape(fieldState.semanticLandscape),
      relational_quality: this.map_relational_quality(fieldState.connectionDynamics),
      sacred_presence: fieldState.sacredMarkers.threshold_proximity > 0.5,
      somatic_pattern: this.map_somatic_pattern(fieldState.somaticIntelligence),
      coherence_level: fieldState.connectionDynamics.coherence,
      timestamp: Date.now()
    };
  }

  /**
   * Map emotional weather to abstract topology
   * Converts specific emotions to landscape patterns
   */
  private map_emotional_topology(weather: EmotionalWeather): string {
    const { density, texture, velocity } = weather;

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
  private map_semantic_shape(landscape: any): string {
    const depth = landscape.depth_measure || 0;
    const complexity = landscape.complexity || 0;

    if (depth > 0.7 && complexity > 0.7) return 'cathedral';
    if (depth > 0.7 && complexity < 0.3) return 'well';
    if (depth < 0.3 && complexity > 0.7) return 'maze';
    if (depth < 0.3 && complexity < 0.3) return 'plain';

    return 'forest';
  }

  /**
   * Map relational quality from connection dynamics
   */
  private map_relational_quality(dynamics: any): string {
    const trust = dynamics.trust_coefficient || 0;
    const openness = dynamics.openness || 0;

    if (trust > 0.7 && openness > 0.7) return 'sanctuary';
    if (trust > 0.7 && openness < 0.3) return 'fortress';
    if (trust < 0.3 && openness > 0.7) return 'marketplace';
    if (trust < 0.3 && openness < 0.3) return 'wasteland';

    return 'crossroads';
  }

  /**
   * Map somatic intelligence to body patterns
   */
  private map_somatic_pattern(somatic: any): string {
    const activation = somatic.activation_level || 0;
    const groundedness = somatic.groundedness || 0;

    if (activation > 0.7 && groundedness > 0.7) return 'rooted-fire';
    if (activation > 0.7 && groundedness < 0.3) return 'scattered-energy';
    if (activation < 0.3 && groundedness > 0.7) return 'deep-rest';
    if (activation < 0.3 && groundedness < 0.3) return 'floating';

    return 'balanced';
  }

  /**
   * Extract coherence signature without storing details
   */
  private extract_coherence(fieldState: FieldState): string {
    const coherence = fieldState.connectionDynamics.coherence;
    const sacred = fieldState.sacredMarkers.threshold_proximity;

    // Create abstract coherence signature
    if (coherence > 0.8 && sacred > 0.7) return 'sacred-coherence';
    if (coherence > 0.8) return 'high-coherence';
    if (coherence > 0.5) return 'emerging-coherence';
    if (coherence > 0.3) return 'seeking-coherence';

    return 'dispersed';
  }

  /**
   * Calculate growth vector from field evolution
   */
  private calculate_growth(fieldState: FieldState, outcome: any): GrowthVector {
    const coherence_delta = outcome.coherence - fieldState.connectionDynamics.coherence;

    let direction: GrowthVector['direction'] = 'stabilizing';
    if (coherence_delta > 0.2) direction = 'expanding';
    else if (coherence_delta < -0.2) direction = 'contracting';
    else if (Math.abs(coherence_delta) < 0.1) direction = 'integrating';

    return {
      direction,
      magnitude: Math.abs(coherence_delta),
      domain: this.identify_growth_domain(fieldState),
      resistance_points: this.identify_resistance(fieldState)
    };
  }

  /**
   * Identify primary growth domain
   */
  private identify_growth_domain(fieldState: FieldState): GrowthVector['domain'] {
    const emotional = fieldState.emotionalWeather.density;
    const cognitive = fieldState.semanticLandscape.complexity;
    const relational = fieldState.connectionDynamics.resonance_frequency;
    const spiritual = fieldState.sacredMarkers.threshold_proximity;

    const max = Math.max(emotional, cognitive, relational, spiritual);

    if (max === emotional) return 'emotional';
    if (max === cognitive) return 'cognitive';
    if (max === relational) return 'relational';
    return 'spiritual';
  }

  /**
   * Identify resistance patterns
   */
  private identify_resistance(fieldState: FieldState): string[] {
    const resistances: string[] = [];

    if (fieldState.emotionalWeather.velocity < -0.5) {
      resistances.push('emotional-undertow');
    }
    if (fieldState.connectionDynamics.trust_coefficient < 0.3) {
      resistances.push('trust-barrier');
    }
    if (fieldState.sacredMarkers.sacred_geometries.length === 0) {
      resistances.push('meaning-absence');
    }

    return resistances;
  }

  /**
   * Get temporal context for pattern
   */
  private get_temporal_context(): StoredPattern['temporal_marker'] {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    if (hour >= 21 || hour < 5) return 'night';

    // Could also check for crisis markers in field state
    return 'crisis';
  }

  /**
   * Generate one-way hash for pattern
   */
  private generate_pattern_hash(fieldState: FieldState): string {
    const signature = this.abstract_field(fieldState);
    const data = JSON.stringify(signature);

    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 16); // Use first 16 chars for brevity
  }

  /**
   * Calculate resonance between field signatures
   */
  private calculate_field_resonance(
    current: FieldSignature,
    past: FieldSignature
  ): number {
    let resonance = 0;
    let factors = 0;

    // Compare topologies
    if (current.emotional_topology === past.emotional_topology) {
      resonance += 0.3;
    }
    factors++;

    // Compare shapes
    if (current.semantic_shape === past.semantic_shape) {
      resonance += 0.2;
    }
    factors++;

    // Compare qualities
    if (current.relational_quality === past.relational_quality) {
      resonance += 0.2;
    }
    factors++;

    // Sacred presence alignment
    if (current.sacred_presence === past.sacred_presence) {
      resonance += 0.2;
    }
    factors++;

    // Coherence similarity
    const coherence_diff = Math.abs(current.coherence_level - past.coherence_level);
    resonance += (1 - coherence_diff) * 0.1;
    factors++;

    return resonance;
  }

  /**
   * Synthesize wisdom from patterns
   */
  private async synthesize_wisdom(
    patterns: StoredPattern[],
    successful: boolean
  ): Promise<string[]> {
    const wisdom: string[] = [];

    for (const pattern of patterns) {
      // Find resonance records for this pattern
      const records = this.resonance_history.filter(
        r => r.pattern_hash === pattern.pattern_hash
      );

      // Filter by success/failure
      const relevant_records = records.filter(
        r => r.transformation_occurred === successful
      );

      if (relevant_records.length > 0) {
        // Extract wisdom based on patterns
        if (successful) {
          wisdom.push(`${pattern.transformation_vector.direction} in ${pattern.transformation_vector.domain} domain often helps`);
        } else {
          pattern.transformation_vector.resistance_points.forEach(resistance => {
            wisdom.push(`Watch for ${resistance}`);
          });
        }
      }
    }

    return [...new Set(wisdom)]; // Remove duplicates
  }

  /**
   * Prune old patterns - memory foam effect
   */
  private async prune_old_patterns(): Promise<void> {
    const now = Date.now();

    // Remove patterns older than TTL
    this.field_signatures = this.field_signatures.filter(
      pattern => (now - pattern.created_at) < this.pattern_ttl
    );

    // If still over limit, remove oldest
    if (this.field_signatures.length > this.max_signatures) {
      this.field_signatures.sort((a, b) => b.created_at - a.created_at);
      this.field_signatures = this.field_signatures.slice(0, this.max_signatures);
    }

    // Prune resonance history
    if (this.resonance_history.length > this.max_resonance_records) {
      this.resonance_history = this.resonance_history.slice(-this.max_resonance_records);
    }
  }

  /**
   * Get anonymous patterns for collective learning
   * Strips all user-identifying information
   */
  async get_anonymous_patterns(): Promise<Array<{
    pattern_hash: string;
    field_signature: Partial<FieldSignature>;
    success_rate: number;
  }>> {
    console.log('🎭 Preparing anonymous patterns for collective');

    const anonymous_patterns = this.field_signatures.map(pattern => {
      // Find success rate for this pattern
      const records = this.resonance_history.filter(
        r => r.pattern_hash === pattern.pattern_hash
      );
      const success_rate = records.length > 0
        ? records.filter(r => r.transformation_occurred).length / records.length
        : 0;

      // Return anonymized version
      return {
        pattern_hash: pattern.pattern_hash,
        field_signature: {
          emotional_topology: pattern.field_state.emotional_topology,
          semantic_shape: pattern.field_state.semantic_shape,
          sacred_presence: pattern.field_state.sacred_presence,
          // Deliberately omit user-specific fields
        },
        success_rate
      };
    });

    console.log(`  Prepared ${anonymous_patterns.length} anonymous patterns`);

    return anonymous_patterns;
  }

  /**
   * Clear all patterns - user initiated
   */
  async clear_memory(): Promise<void> {
    console.log('🧹 Clearing individual field memory');
    this.field_signatures = [];
    this.resonance_history = [];
    this.growth_vectors = [];
  }
}