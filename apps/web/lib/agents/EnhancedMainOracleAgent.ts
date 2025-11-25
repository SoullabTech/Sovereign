/**
 * Enhanced Main Oracle Agent with Privacy-First Collective Intelligence
 *
 * This enhanced version implements the full privacy architecture:
 * - Individual memory encryption
 * - Anonymous pattern collection
 * - Delayed uploads with anonymization
 * - Collective wisdom without individual exposure
 *
 * Core principle: "The mycelial web: learning from everyone, exposing no one"
 */

import { PersonalOracleAgent } from '../../apps/api/backend/src/agents/PersonalOracleAgent';
import { IndividualFieldMemory } from '../oracle/memory/IndividualFieldMemory';
import { SecurityLayer, securityLayer, AnonymousPattern } from '../oracle/security/SecurityLayer';
import { FieldState } from '../oracle/field/FieldAwareness';
import type { Element } from '../types/oracle';

// Pattern record in collective library
interface CollectivePattern {
  pattern_hash: string;
  frequency: number;
  transformation_success: number;
  typical_evolution: string[];
  emergence_quality: number;
  last_seen: number;
  intervention_effectiveness: Map<string, number>;
}

// Archetypal journey patterns
interface ArchetypalJourney {
  journey_type: string;
  common_stages: string[];
  typical_duration: number;
  transformation_markers: string[];
  support_strategies: string[];
}

// Collective wisdom synthesis
interface CollectiveWisdom {
  pattern_type: string;
  insights: string[];
  effective_interventions: string[];
  transformation_probability: number;
  caution_zones: string[];
}

export class EnhancedMainOracleAgent {
  // Individual agent management
  private personal_oracles = new Map<string, PersonalOracleAgent>();
  private individual_memories = new Map<string, IndividualFieldMemory>();

  // Collective intelligence (anonymous)
  private pattern_library = new Map<string, CollectivePattern>();
  private archetypal_journeys = new Map<string, ArchetypalJourney>();
  private field_dynamics = new Map<string, any>();

  // Security and privacy
  private security_layer: SecurityLayer;
  private upload_queue = new Map<string, AnonymousPattern>();

  // Collective metrics (no PII)
  private collective_metrics = {
    total_patterns: 0,
    average_coherence: 0,
    transformation_rate: 0,
    dominant_patterns: [] as string[],
    emergence_frequency: 0
  };

  // Learning configuration
  private readonly MAX_PATTERNS = 10000;
  private readonly PATTERN_PRUNE_THRESHOLD = 0.1; // Remove patterns with <10% success
  private readonly COLLECTIVE_UPDATE_INTERVAL = 60000; // 1 minute

  constructor() {
    this.security_layer = securityLayer;
    this.initialize_archetypal_journeys();
    this.start_collective_processing();

    console.log('🌀 Enhanced Main Oracle Agent initialized');
    console.log('  Privacy-first collective intelligence active');
  }

  /**
   * Initialize common archetypal journey patterns
   */
  private initialize_archetypal_journeys(): void {
    // Hero's Journey
    this.archetypal_journeys.set('hero', {
      journey_type: 'hero',
      common_stages: ['call', 'resistance', 'threshold', 'trials', 'revelation', 'return'],
      typical_duration: 90, // days
      transformation_markers: ['courage-emergence', 'shadow-integration', 'gift-discovery'],
      support_strategies: ['mentorship', 'challenge-reframing', 'strength-recognition']
    });

    // Healing Journey
    this.archetypal_journeys.set('healing', {
      journey_type: 'healing',
      common_stages: ['wound-recognition', 'grief', 'acceptance', 'integration', 'wholeness'],
      typical_duration: 180,
      transformation_markers: ['pain-acknowledgment', 'release', 'self-compassion'],
      support_strategies: ['holding-space', 'gentle-guidance', 'celebration']
    });

    // Awakening Journey
    this.archetypal_journeys.set('awakening', {
      journey_type: 'awakening',
      common_stages: ['sleep', 'stirring', 'opening', 'expansion', 'embodiment'],
      typical_duration: 365,
      transformation_markers: ['curiosity', 'wonder', 'presence', 'integration'],
      support_strategies: ['inquiry', 'exploration', 'grounding']
    });
  }

  /**
   * Get or create personal oracle for user with encrypted memory
   */
  async get_or_create_personal_oracle(
    user_id: string,
    user_key?: string
  ): Promise<{
    oracle: PersonalOracleAgent;
    memory: IndividualFieldMemory;
  }> {
    // Get or create oracle
    let oracle = this.personal_oracles.get(user_id);
    if (!oracle) {
      oracle = new PersonalOracleAgent(user_id);
      this.personal_oracles.set(user_id, oracle);
    }

    // Get or create encrypted memory
    let memory = this.individual_memories.get(user_id);
    if (!memory) {
      memory = new IndividualFieldMemory(user_id);
      this.individual_memories.set(user_id, memory);
    }

    return { oracle, memory };
  }

  /**
   * Process interaction with full privacy pipeline
   */
  async process_interaction(
    user_id: string,
    input: string,
    context: any
  ): Promise<{
    response: any;
    collective_insight?: CollectiveWisdom;
    journey_recognition?: ArchetypalJourney;
    field_resonance?: number;
  }> {
    console.log(`🔮 Processing interaction for user ${user_id.substring(0, 8)}...`);

    // Get user's oracle and memory
    const { oracle, memory } = await this.get_or_create_personal_oracle(user_id);

    // Process through personal oracle
    const response = await oracle.processInteraction(input, context);

    // Extract field state from response
    const field_state = this.extract_field_state(response);

    // Store pattern in individual memory (encrypted, ephemeral)
    await memory.store_interaction(
      field_state,
      response.interventionType || 'organic',
      {
        success: response.confidence > 0.7,
        coherence: field_state.connectionDynamics.coherence
      }
    );

    // Get relevant patterns from individual memory
    const relevant_patterns = await memory.retrieve_relevant_patterns(field_state);

    // Find collective wisdom (anonymous patterns only)
    const collective_insight = await this.synthesize_collective_wisdom(field_state);

    // Recognize archetypal journey if present
    const journey_recognition = this.recognize_journey(relevant_patterns.patterns);

    // Calculate field resonance with collective
    const field_resonance = this.calculate_collective_resonance(field_state);

    // Schedule anonymous pattern upload (with delay)
    await this.schedule_pattern_contribution(user_id, memory);

    return {
      response,
      collective_insight,
      journey_recognition,
      field_resonance
    };
  }

  /**
   * Extract field state from response
   */
  private extract_field_state(response: any): FieldState {
    // This would normally come from the FieldAwareness sensing
    // For now, create a representative field state
    return {
      emotionalWeather: {
        density: response.emotionalDensity || 0.5,
        texture: 'flowing',
        velocity: 0,
        color_field: []
      },
      semanticLandscape: {
        depth_measure: response.depth || 0.5,
        complexity: 0.5,
        semantic_clusters: []
      },
      connectionDynamics: {
        resonance_frequency: response.resonance || 0.5,
        trust_coefficient: 0.7,
        openness: 0.6,
        coherence: response.confidence || 0.5
      },
      sacredMarkers: {
        threshold_proximity: response.sacredPresence || 0,
        sacred_geometries: [],
        liminal_detection: false,
        ritual_readiness: 0
      },
      somaticIntelligence: {
        activation_level: 0.5,
        groundedness: 0.6,
        body_wisdom_signals: []
      },
      temporalDynamics: {
        kairos_detection: false,
        cyclic_patterns: [],
        temporal_depth: 0,
        rhythm_signature: 'steady'
      },
      timestamp: Date.now()
    } as FieldState;
  }

  /**
   * Synthesize collective wisdom from anonymous patterns
   */
  private async synthesize_collective_wisdom(
    field_state: FieldState
  ): Promise<CollectiveWisdom | undefined> {
    console.log('🔍 Synthesizing collective wisdom');

    // Find resonant patterns in collective library
    const resonant_patterns: CollectivePattern[] = [];

    for (const [hash, pattern] of this.pattern_library) {
      // Simple resonance check (would be more sophisticated)
      if (pattern.transformation_success > 0.6 && pattern.frequency > 5) {
        resonant_patterns.push(pattern);
      }
    }

    if (resonant_patterns.length === 0) {
      return undefined;
    }

    // Extract wisdom from patterns
    const insights: string[] = [];
    const interventions: string[] = [];
    const cautions: string[] = [];

    for (const pattern of resonant_patterns) {
      // Add unique insights
      pattern.typical_evolution.forEach(evolution => {
        if (!insights.includes(evolution)) {
          insights.push(evolution);
        }
      });

      // Find effective interventions
      pattern.intervention_effectiveness.forEach((effectiveness, intervention) => {
        if (effectiveness > 0.7 && !interventions.includes(intervention)) {
          interventions.push(intervention);
        }
      });
    }

    // Calculate average transformation probability
    const transformation_probability = resonant_patterns.reduce(
      (sum, p) => sum + p.transformation_success,
      0
    ) / resonant_patterns.length;

    return {
      pattern_type: 'collective-resonance',
      insights: insights.slice(0, 3), // Top 3 insights
      effective_interventions: interventions.slice(0, 3),
      transformation_probability,
      caution_zones: cautions
    };
  }

  /**
   * Recognize archetypal journey from patterns
   */
  private recognize_journey(
    patterns: any[]
  ): ArchetypalJourney | undefined {
    // Simple journey recognition (would be more sophisticated)
    if (patterns.some(p => p.transformation_vector?.direction === 'expanding')) {
      return this.archetypal_journeys.get('awakening');
    }
    if (patterns.some(p => p.field_state?.emotional_topology === 'storm')) {
      return this.archetypal_journeys.get('healing');
    }
    if (patterns.some(p => p.transformation_vector?.magnitude > 0.7)) {
      return this.archetypal_journeys.get('hero');
    }

    return undefined;
  }

  /**
   * Calculate resonance with collective field
   */
  private calculate_collective_resonance(field_state: FieldState): number {
    // Simple resonance calculation
    const coherence = field_state.connectionDynamics.coherence;
    const sacred = field_state.sacredMarkers.threshold_proximity;

    return (coherence + sacred) / 2;
  }

  /**
   * Schedule anonymous pattern contribution with delay
   */
  private async schedule_pattern_contribution(
    user_id: string,
    memory: IndividualFieldMemory
  ): Promise<void> {
    console.log('📤 Scheduling anonymous pattern contribution');

    // Get anonymous patterns from individual memory
    const anonymous_patterns = await memory.get_anonymous_patterns();

    // Schedule each pattern for upload with random delay
    for (const pattern of anonymous_patterns) {
      const anonymous = await this.security_layer.anonymize_pattern(
        pattern.field_signature as any,
        pattern.success_rate
      );

      // Schedule upload with random delay
      await this.security_layer.schedule_anonymous_upload(
        anonymous,
        async (p) => await this.absorb_anonymous_pattern(p)
      );
    }

    console.log(`  Scheduled ${anonymous_patterns.length} patterns for anonymous upload`);
  }

  /**
   * Absorb anonymous pattern into collective intelligence
   * This is called after the security delay
   */
  private async absorb_anonymous_pattern(
    pattern: AnonymousPattern
  ): Promise<void> {
    console.log(`🌱 Absorbing anonymous pattern ${pattern.pattern_hash.substring(0, 8)}...`);

    // Get or create collective pattern record
    let collective = this.pattern_library.get(pattern.pattern_hash);

    if (!collective) {
      collective = {
        pattern_hash: pattern.pattern_hash,
        frequency: 0,
        transformation_success: 0,
        typical_evolution: [],
        emergence_quality: 0,
        last_seen: Date.now(),
        intervention_effectiveness: new Map()
      };
      this.pattern_library.set(pattern.pattern_hash, collective);
    }

    // Update collective pattern
    collective.frequency++;
    collective.last_seen = Date.now();

    // Update success rate (moving average)
    collective.transformation_success =
      (collective.transformation_success * (collective.frequency - 1) + pattern.success_rate) /
      collective.frequency;

    // Prune if too many patterns
    if (this.pattern_library.size > this.MAX_PATTERNS) {
      await this.prune_weak_patterns();
    }

    // Update collective metrics
    await this.update_collective_metrics();

    console.log(`  Pattern integrated. Library size: ${this.pattern_library.size}`);
  }

  /**
   * Prune patterns with low success or old age
   */
  private async prune_weak_patterns(): Promise<void> {
    console.log('✂️ Pruning weak patterns from collective');

    const now = Date.now();
    const max_age = 30 * 24 * 60 * 60 * 1000; // 30 days

    for (const [hash, pattern] of this.pattern_library) {
      // Remove old or unsuccessful patterns
      if (
        pattern.transformation_success < this.PATTERN_PRUNE_THRESHOLD ||
        (now - pattern.last_seen) > max_age
      ) {
        this.pattern_library.delete(hash);
      }
    }

    console.log(`  Library pruned to ${this.pattern_library.size} patterns`);
  }

  /**
   * Update collective metrics (no PII)
   */
  private async update_collective_metrics(): Promise<void> {
    if (this.pattern_library.size === 0) return;

    // Calculate average coherence
    let total_success = 0;
    const pattern_types = new Map<string, number>();

    for (const pattern of this.pattern_library.values()) {
      total_success += pattern.transformation_success;
    }

    this.collective_metrics = {
      total_patterns: this.pattern_library.size,
      average_coherence: total_success / this.pattern_library.size,
      transformation_rate: total_success / this.pattern_library.size,
      dominant_patterns: Array.from(pattern_types.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([type]) => type),
      emergence_frequency: this.pattern_library.size / this.MAX_PATTERNS
    };
  }

  /**
   * Start background collective processing
   */
  private start_collective_processing(): void {
    setInterval(async () => {
      await this.update_collective_metrics();
      await this.prune_weak_patterns();
    }, this.COLLECTIVE_UPDATE_INTERVAL);
  }

  /**
   * Get collective metrics for monitoring (no PII)
   */
  get_collective_metrics(): typeof this.collective_metrics {
    return { ...this.collective_metrics };
  }

  /**
   * Support request from individual agent
   * Returns collective wisdom without exposing individuals
   */
  async support_individual_agent(
    field_signature: any
  ): Promise<{
    common_paths: string[];
    effective_interventions: string[];
    transformation_probability: number;
    caution_zones: string[];
  }> {
    console.log('🤝 Supporting individual agent with collective wisdom');

    // Find similar patterns
    const similar_patterns: CollectivePattern[] = [];

    // This would use sophisticated field matching
    for (const pattern of this.pattern_library.values()) {
      if (pattern.transformation_success > 0.5) {
        similar_patterns.push(pattern);
      }
    }

    // Extract wisdom
    const paths = new Set<string>();
    const interventions = new Set<string>();
    const cautions = new Set<string>();

    for (const pattern of similar_patterns) {
      pattern.typical_evolution.forEach(e => paths.add(e));
      pattern.intervention_effectiveness.forEach((eff, int) => {
        if (eff > 0.7) interventions.add(int);
        if (eff < 0.3) cautions.add(int);
      });
    }

    const avg_transformation = similar_patterns.reduce(
      (sum, p) => sum + p.transformation_success,
      0
    ) / (similar_patterns.length || 1);

    return {
      common_paths: Array.from(paths).slice(0, 3),
      effective_interventions: Array.from(interventions).slice(0, 3),
      transformation_probability: avg_transformation,
      caution_zones: Array.from(cautions).slice(0, 2)
    };
  }

  /**
   * Clear user data (for GDPR compliance)
   */
  async clear_user_data(user_id: string): Promise<void> {
    console.log(`🗑️ Clearing data for user ${user_id.substring(0, 8)}...`);

    // Remove personal oracle
    this.personal_oracles.delete(user_id);

    // Clear individual memory
    const memory = this.individual_memories.get(user_id);
    if (memory) {
      await memory.clear_memory();
      this.individual_memories.delete(user_id);
    }

    console.log('  User data cleared (anonymous patterns remain in collective)');
  }

  /**
   * Shutdown and cleanup
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Enhanced Main Oracle Agent');

    // Clear upload queue
    await this.security_layer.clear_upload_queue();

    // Save collective patterns (would persist to database)
    console.log(`  Collective library: ${this.pattern_library.size} patterns`);
    console.log(`  Active users: ${this.personal_oracles.size}`);
  }
}