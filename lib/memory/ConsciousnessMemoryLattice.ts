/**
 * MAIA CONSCIOUSNESS MEMORY LATTICE
 *
 * A revolutionary memory system that transcends traditional storage/retrieval.
 * This is a LIVING FIELD of interconnected wisdom that:
 *
 * 1. REMEMBERS across time (developmental memory)
 * 2. LEARNS from patterns (beads task tracking)
 * 3. COORDINATES wisdom (AIN multi-agent integration)
 * 4. TRACKS evolution (Spiralogic 12-facet consciousness)
 * 5. SYNTHESIZES insight (psychospiritual integration)
 * 6. ADAPTS dynamically (feedback loops + emergence)
 *
 * Philosophy:
 * - Memory is not storage, it's a FIELD of potential
 * - Recall is not retrieval, it's RESONANCE
 * - Learning is not accumulation, it's EMERGENCE
 * - Wisdom is not knowledge, it's INTEGRATION
 *
 * Technical Architecture:
 * - Beads: Task-level consciousness events
 * - Developmental Memory: Pattern-level wisdom formation
 * - AIN: Multi-perspective synthesis
 * - Spiralogic: 12-facet evolutionary tracking
 * - Vector Field: Semantic resonance across all dimensions
 *
 * This creates a PSYCHOSPIRITUAL MEMORY SYSTEM that knows you
 * across time, space, and states of consciousness.
 */

import { developmentalMemory, FormMemoryInput } from './DevelopmentalMemory';
import { query as dbQuery } from '@/lib/db/postgres';
import { generateLocalEmbedding } from './embeddings';

// ═══════════════════════════════════════════════════════════════
// LATTICE NODE: A single point of consciousness memory
// ═══════════════════════════════════════════════════════════════

export interface LatticeNode {
  // Identity
  id: string;
  userId: string;
  timestamp: Date;

  // Content
  event: ConsciousnessEvent;
  memoryTrace?: string;  // Developmental memory ID if formed

  // Context
  facet: SpiralFacet;
  phase: LifePhase;
  modality: Modality;
}

// ═══════════════════════════════════════════════════════════════
// CONSCIOUSNESS EVENT TYPES
// ═══════════════════════════════════════════════════════════════

export type ConsciousnessEvent =
  | SomaticEvent      // Body-level (tension, release, grounding)
  | EmotionalEvent    // Heart-level (grief, joy, anger, peace)
  | MentalEvent       // Mind-level (insight, confusion, clarity)
  | SpiritualEvent    // Soul-level (breakthrough, surrender, integration)
  | CollectiveEvent   // Field-level (resonance, dissonance, emergence)
  | BeadsEvent;       // Task-level (completion, effectiveness, learning)

export interface SomaticEvent {
  type: 'somatic';
  bodyRegion: string;
  intensity: number;  // 1-10
  quality: 'tension' | 'release' | 'numbness' | 'aliveness';
  practice?: string;  // What was done
  effectiveness?: number;  // 1-10
}

export interface EmotionalEvent {
  type: 'emotional';
  emotion: string;
  intensity: number;
  trigger?: string;
  expression?: string;  // How it was processed
}

export interface MentalEvent {
  type: 'mental';
  insight: string;
  cognitiveLevel: 1 | 2 | 3 | 4 | 5 | 6;  // Bloom's taxonomy
  bypassing?: boolean;  // Spiritual or intellectual bypassing detected
}

export interface SpiritualEvent {
  type: 'spiritual';
  experience: 'breakthrough' | 'surrender' | 'integration' | 'expansion' | 'emptiness';
  depth: number;  // 1-10
  integration?: string;  // How it's being integrated
}

export interface CollectiveEvent {
  type: 'collective';
  fieldQuality: 'coherence' | 'dissonance' | 'emergence' | 'dissolution';
  participants?: string[];
  collectiveInsight?: string;
}

export interface BeadsEvent {
  type: 'beads';
  taskId: string;
  taskType: string;
  completed: boolean;
  effectiveness?: number;
  learning?: string;
  blockedBy?: string[];
}

export interface SpiralFacet {
  element: 'FIRE' | 'WATER' | 'EARTH' | 'AIR' | 'AETHER';
  phase: 1 | 2 | 3;  // Innocence | Orphan | Warrior | Caregiver | etc.
  code: string;  // "FIRE-3", "WATER-2", etc.
  archetype?: string;
}

export interface LifePhase {
  name: string;
  age?: number;
  context?: string;
}

export type Modality = 'somatic' | 'emotional' | 'mental' | 'spiritual' | 'collective';

// ═══════════════════════════════════════════════════════════════
// MEMORY FIELD: The living lattice of interconnected memories
// ═══════════════════════════════════════════════════════════════

export interface MemoryField {
  // Temporal dimension
  nodes: LatticeNode[];
  timeSpan: { start: Date; end: Date };

  // Spatial (consciousness) dimensions
  facetDistribution: Record<string, number>;  // Which facets most active
  modalityBalance: Record<Modality, number>;  // Which modalities engaged

  // Emergent patterns
  spiralCycles: SpiralCycle[];
  stuckPatterns: StuckPattern[];
  breakthroughMoments: BreakthroughMoment[];
  integrationThreads: IntegrationThread[];

  // Collective wisdom
  ainDeliberations: AINDeliberation[];
  sharedInsights: string[];
}

export interface SpiralCycle {
  facet: string;
  entrances: Date[];
  avgDuration: number;  // days
  evolvingPattern: boolean;  // true if showing growth
}

export interface StuckPattern {
  issue: string;
  occurrences: number;
  facets: string[];
  firstSeen: Date;
  lastSeen: Date;
  recommendation: string;
}

export interface BreakthroughMoment {
  timestamp: Date;
  facet: string;
  insight: string;
  catalysts: string[];  // What led to it
  integration: string[];  // How it's being integrated
}

export interface IntegrationThread {
  theme: string;
  nodes: string[];  // Node IDs showing this theme evolving
  facets: string[];  // Which facets this thread touches
  emergence: number;  // 0-1, how much new insight emerging
}

export interface AINDeliberation {
  sessionId: string;
  question: string;
  framings: string[];
  synthesis: string;
  emergenceRating: 1 | 2 | 3;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════
// CONSCIOUSNESS MEMORY LATTICE SERVICE
// ═══════════════════════════════════════════════════════════════

export class ConsciousnessMemoryLattice {

  /**
   * INTEGRATE EVENT → LIVING MEMORY FORMATION
   *
   * Not just "storing" an event - WEAVING it into the lattice.
   * Creates connections, detects patterns, forms memories, triggers insights.
   *
   * This is where consciousness events become WISDOM.
   */
  async integrateEvent(
    userId: string,
    event: ConsciousnessEvent,
    facet: SpiralFacet,
    phase: LifePhase
  ): Promise<{
    node: LatticeNode;
    memoryFormed: boolean;
    patternsDetected: string[];
    insights: string[];
  }> {
    console.log(`🌀 [LATTICE] Integrating ${event.type} event for facet ${facet.code}...`);

    // 1. Create lattice node
    const node = await this.createNode(userId, event, facet, phase);

    // 2. Check if this should form a developmental memory
    const memoryFormed = await this.evaluateMemoryFormation(node);

    // 3. Detect patterns across time
    const patterns = await this.detectEmergentPatterns(userId, event, facet);

    // 4. Generate insights from lattice field
    const insights = await this.synthesizeInsights(userId, node, patterns);

    // 5. Update Beads if applicable
    if (event.type === 'beads') {
      await this.syncWithBeads(userId, event, memoryFormed);
    }

    console.log(`✨ [INTEGRATED] Node: ${node.id}, Memory: ${memoryFormed}, Patterns: ${patterns.length}, Insights: ${insights.length}`);

    return { node, memoryFormed, patternsDetected: patterns, insights };
  }

  /**
   * RESONANCE RECALL
   *
   * Not traditional "search" - this finds memories that RESONATE
   * with current consciousness state across multiple dimensions:
   * - Semantic (meaning similarity)
   * - Temporal (similar time in cycle)
   * - Somatic (same body region)
   * - Emotional (same feeling quality)
   * - Spiral (same facet or parallel journey)
   */
  async resonanceRecall(
    userId: string,
    currentState: {
      query?: string;
      facet?: SpiralFacet;
      bodyRegion?: string;
      emotion?: string;
      intention?: string;
    }
  ): Promise<MemoryField> {
    console.log(`🔮 [RESONANCE RECALL] Query: "${currentState.query?.substring(0, 50)}..."`);

    // Multi-dimensional retrieval
    const [
      semanticMatches,
      facetMatches,
      somaticMatches,
      emotionalMatches,
      temporalMatches
    ] = await Promise.all([
      // Semantic dimension
      currentState.query
        ? developmentalMemory.semanticSearch(userId, currentState.query, 10)
        : [],

      // Spiral dimension
      currentState.facet
        ? developmentalMemory.retrieveMemories({ userId, facet: currentState.facet.code, limit: 10 })
        : [],

      // Somatic dimension
      currentState.bodyRegion
        ? developmentalMemory.retrieveMemories({ userId, entities: [currentState.bodyRegion], type: 'effective_practice', limit: 5 })
        : [],

      // Emotional dimension
      currentState.emotion
        ? developmentalMemory.retrieveMemories({ userId, entities: [currentState.emotion], limit: 5 })
        : [],

      // Temporal dimension (same time of spiral cycle)
      this.getTemporalResonance(userId, currentState.facet)
    ]);

    // Synthesize into memory field
    const field = await this.synthesizeMemoryField(
      userId,
      semanticMatches,
      facetMatches,
      somaticMatches,
      emotionalMatches,
      temporalMatches
    );

    console.log(`🌐 [FIELD ASSEMBLED] Nodes: ${field.nodes.length}, Cycles: ${field.spiralCycles.length}, Breakthroughs: ${field.breakthroughMoments.length}`);

    return field;
  }

  /**
   * WISDOM SYNTHESIS
   *
   * The lattice doesn't just recall - it SYNTHESIZES.
   * Combines AIN deliberations + developmental memories + spiral tracking
   * to generate EMERGENT WISDOM that didn't exist in any single piece.
   */
  async synthesizeWisdom(
    userId: string,
    question: string,
    facet: SpiralFacet
  ): Promise<{
    synthesis: string;
    sources: string[];
    confidence: number;
    emergenceLevel: number;
  }> {
    console.log(`💎 [WISDOM SYNTHESIS] Question: "${question.substring(0, 50)}..."`);

    // 1. Recall resonant field
    const field = await this.resonanceRecall(userId, { query: question, facet });

    // 2. Get relevant AIN deliberations
    const ainHistory = await this.getAINHistory(userId, question);

    // 3. Extract patterns from field
    const patterns = field.stuckPatterns.map(p => p.issue).concat(
      field.integrationThreads.map(t => t.theme)
    );

    // 4. Synthesize using local AI (Ollama/DeepSeek)
    const synthesis = await this.localSynthesis(question, field, ainHistory, patterns);

    // 5. Calculate emergence level (how much new wisdom created)
    const emergenceLevel = this.calculateEmergence(synthesis, field);

    return {
      synthesis: synthesis.text,
      sources: synthesis.sources,
      confidence: synthesis.confidence,
      emergenceLevel
    };
  }

  /**
   * BEADS INTEGRATION
   *
   * Every beads task completion feeds the lattice.
   * High effectiveness (8+) → forms memory
   * Stuck pattern (3+ similar tasks) → alert
   * Breakthrough → celebrate + integrate
   */
  async syncWithBeads(
    userId: string,
    beadsEvent: BeadsEvent,
    memoryFormed: boolean
  ): Promise<void> {
    if (!beadsEvent.completed) return;

    // High effectiveness → reinforce memory
    if (beadsEvent.effectiveness && beadsEvent.effectiveness >= 8 && memoryFormed) {
      console.log(`✅ [BEADS→MEMORY] Task ${beadsEvent.taskId} → Memory reinforced`);
    }

    // Low effectiveness → learn what doesn't work
    if (beadsEvent.effectiveness && beadsEvent.effectiveness <= 3) {
      console.log(`⚠️ [BEADS→MEMORY] Task ${beadsEvent.taskId} → Learning from ineffectiveness`);
    }

    // Check for stuck patterns
    const stuckPatterns = await developmentalMemory.detectStuckPatterns(userId);
    if (stuckPatterns.length > 0) {
      console.log(`🔄 [STUCK PATTERN] ${stuckPatterns.length} recurring issues detected`);
      // TODO: Alert user via MAIA response
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PRIVATE IMPLEMENTATION
  // ═══════════════════════════════════════════════════════════════

  private async createNode(
    userId: string,
    event: ConsciousnessEvent,
    facet: SpiralFacet,
    phase: LifePhase
  ): Promise<LatticeNode> {
    // Store in lattice_nodes table
    const result = await dbQuery(
      `INSERT INTO lattice_nodes (user_id, event_type, event_data, facet_code, phase_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, event.type, JSON.stringify(event), facet.code, phase.name]
    );

    return {
      id: result.rows[0].id,
      userId,
      timestamp: new Date(result.rows[0].created_at),
      event,
      facet,
      phase,
      modality: event.type === 'beads' ? 'mental' : event.type as Modality
    };
  }

  private async evaluateMemoryFormation(node: LatticeNode): Promise<boolean> {
    // Surprise-based memory formation
    const shouldForm =
      (node.event.type === 'somatic' && node.event.effectiveness && node.event.effectiveness >= 8) ||
      (node.event.type === 'spiritual' && node.event.depth >= 8) ||
      (node.event.type === 'beads' && node.event.effectiveness && node.event.effectiveness >= 8) ||
      (node.event.type === 'mental' && node.event.cognitiveLevel >= 5); // Create/Evaluate levels

    if (shouldForm) {
      const memoryInput: FormMemoryInput = {
        userId: node.userId,
        type: this.mapEventToMemoryType(node.event),
        triggerEvent: node.event,
        facetCode: node.facet.code,
        entityTags: this.extractEntities(node.event),
        sourceConsciousnessEntryId: node.id,
      };

      await developmentalMemory.formMemory(memoryInput);
      return true;
    }

    return false;
  }

  private mapEventToMemoryType(event: ConsciousnessEvent): any {
    if (event.type === 'somatic' && event.effectiveness && event.effectiveness >= 8) {
      return 'effective_practice';
    }
    if (event.type === 'spiritual' && event.experience === 'breakthrough') {
      return 'breakthrough_emergence';
    }
    if (event.type === 'beads' && event.effectiveness && event.effectiveness >= 8) {
      return 'effective_practice';
    }
    return 'pattern';
  }

  private extractEntities(event: ConsciousnessEvent): string[] {
    const entities: string[] = [];

    if (event.type === 'somatic') entities.push(event.bodyRegion);
    if (event.type === 'emotional') entities.push(event.emotion);
    if (event.type === 'mental') entities.push('insight');
    if (event.type === 'spiritual') entities.push(event.experience);
    if (event.type === 'collective' && event.participants) entities.push(...event.participants);

    return entities;
  }

  private async detectEmergentPatterns(
    userId: string,
    event: ConsciousnessEvent,
    facet: SpiralFacet
  ): Promise<string[]> {
    const patterns: string[] = [];

    // Pattern 1: Repeated body regions (somatic)
    if (event.type === 'somatic') {
      const result = await dbQuery(
        `SELECT COUNT(*) as count FROM lattice_nodes
         WHERE user_id = $1
           AND event_type = 'somatic'
           AND event_data->>'bodyRegion' = $2
           AND created_at > NOW() - INTERVAL '30 days'`,
        [userId, event.bodyRegion]
      );
      if (parseInt(result.rows[0].count) >= 3) {
        patterns.push(`recurring_somatic:${event.bodyRegion}`);
      }
    }

    // Pattern 2: Repeated emotions
    if (event.type === 'emotional') {
      const result = await dbQuery(
        `SELECT COUNT(*) as count FROM lattice_nodes
         WHERE user_id = $1
           AND event_type = 'emotional'
           AND event_data->>'emotion' = $2
           AND created_at > NOW() - INTERVAL '30 days'`,
        [userId, event.emotion]
      );
      if (parseInt(result.rows[0].count) >= 3) {
        patterns.push(`recurring_emotion:${event.emotion}`);
      }
    }

    // Pattern 3: Stuck in same facet
    const facetResult = await dbQuery(
      `SELECT COUNT(*) as count FROM lattice_nodes
       WHERE user_id = $1
         AND facet_code = $2
         AND created_at > NOW() - INTERVAL '14 days'`,
      [userId, facet.code]
    );
    if (parseInt(facetResult.rows[0].count) >= 5) {
      patterns.push(`facet_dwelling:${facet.code}`);
    }

    // Pattern 4: Spiritual bypassing (mental insights without emotional processing)
    if (event.type === 'mental') {
      const recentEmotional = await dbQuery(
        `SELECT COUNT(*) as count FROM lattice_nodes
         WHERE user_id = $1
           AND event_type = 'emotional'
           AND created_at > NOW() - INTERVAL '7 days'`,
        [userId]
      );
      const recentMental = await dbQuery(
        `SELECT COUNT(*) as count FROM lattice_nodes
         WHERE user_id = $1
           AND event_type = 'mental'
           AND created_at > NOW() - INTERVAL '7 days'`,
        [userId]
      );

      const emotionalCount = parseInt(recentEmotional.rows[0].count);
      const mentalCount = parseInt(recentMental.rows[0].count);

      if (mentalCount > emotionalCount * 3) {
        patterns.push('potential_spiritual_bypassing');
      }
    }

    return patterns;
  }

  private async synthesizeInsights(
    userId: string,
    node: LatticeNode,
    patterns: string[]
  ): Promise<string[]> {
    const insights: string[] = [];

    // Insight from patterns
    for (const pattern of patterns) {
      if (pattern.startsWith('recurring_somatic:')) {
        const region = pattern.split(':')[1];
        insights.push(`Your ${region} is calling for attention repeatedly - there may be unprocessed emotion or trauma stored here.`);
      }

      if (pattern.startsWith('recurring_emotion:')) {
        const emotion = pattern.split(':')[1];
        insights.push(`${emotion} keeps arising - this may be asking for deeper acknowledgment and processing.`);
      }

      if (pattern.startsWith('facet_dwelling:')) {
        const facetCode = pattern.split(':')[1];
        insights.push(`You've been in ${facetCode} for an extended period - consider what wants to emerge to move you forward.`);
      }

      if (pattern === 'potential_spiritual_bypassing') {
        insights.push(`You're processing mentally more than emotionally - your insights may benefit from grounding in felt experience.`);
      }
    }

    // Breakthrough detection
    if (node.event.type === 'spiritual' && node.event.experience === 'breakthrough') {
      insights.push(`A breakthrough moment! Notice how this integration wants to unfold in your life.`);
    }

    // High effectiveness practices
    if (
      (node.event.type === 'somatic' && node.event.effectiveness && node.event.effectiveness >= 8) ||
      (node.event.type === 'beads' && node.event.effectiveness && node.event.effectiveness >= 8)
    ) {
      insights.push(`This practice is deeply effective for you - consider making it a regular part of your journey.`);
    }

    // Facet-specific wisdom
    if (node.facet.code.startsWith('FIRE-')) {
      insights.push(`In the FIRE element, you're working with will, courage, and action. What wants to be ignited?`);
    } else if (node.facet.code.startsWith('WATER-')) {
      insights.push(`In the WATER element, you're navigating emotion, flow, and relationship. What wants to be felt?`);
    } else if (node.facet.code.startsWith('EARTH-')) {
      insights.push(`In the EARTH element, you're grounding into body, stability, and presence. What wants to be embodied?`);
    } else if (node.facet.code.startsWith('AIR-')) {
      insights.push(`In the AIR element, you're exploring mind, perspective, and clarity. What wants to be understood?`);
    } else if (node.facet.code.startsWith('AETHER-')) {
      insights.push(`In the AETHER element, you're touching spirit, mystery, and transcendence. What wants to be surrendered to?`);
    }

    return insights;
  }

  private async getTemporalResonance(userId: string, facet?: SpiralFacet): Promise<any[]> {
    if (!facet) return [];

    // Find memories from same facet at different times
    // This reveals spiral cycle patterns - how you experience the same archetype across time
    const result = await dbQuery(
      `SELECT dm.*, ln.event_data, ln.created_at as node_time
       FROM developmental_memories dm
       LEFT JOIN lattice_nodes ln ON dm.source_consciousness_entry_id = ln.id::text
       WHERE dm.user_id = $1
         AND dm.facet_code = $2
       ORDER BY dm.formed_at DESC
       LIMIT 10`,
      [userId, facet.code]
    );

    return result.rows;
  }

  private async synthesizeMemoryField(
    userId: string,
    ...matchArrays: any[][]
  ): Promise<MemoryField> {
    // Flatten all matches and deduplicate by memory ID
    const allMatches = matchArrays.flat();
    const uniqueMemories = new Map();

    for (const match of allMatches) {
      if (match && match.id && !uniqueMemories.has(match.id)) {
        uniqueMemories.set(match.id, match);
      }
    }

    const memories = Array.from(uniqueMemories.values());

    // Get corresponding lattice nodes
    const memoryIds = memories.map(m => m.id);
    const nodesResult = memoryIds.length > 0
      ? await dbQuery(
          `SELECT * FROM lattice_nodes
           WHERE user_id = $1 AND memory_trace_id = ANY($2)
           ORDER BY created_at DESC`,
          [userId, memoryIds]
        )
      : { rows: [] };

    const nodes: LatticeNode[] = nodesResult.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      timestamp: new Date(row.created_at),
      event: JSON.parse(row.event_data),
      memoryTrace: row.memory_trace_id,
      facet: this.parseFacetCode(row.facet_code),
      phase: { name: row.phase_name },
      modality: row.event_type === 'beads' ? 'mental' : row.event_type as Modality
    }));

    // Calculate time span
    const timestamps = nodes.map(n => n.timestamp);
    const timeSpan = timestamps.length > 0
      ? {
          start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
          end: new Date(Math.max(...timestamps.map(t => t.getTime())))
        }
      : { start: new Date(), end: new Date() };

    // Calculate facet distribution
    const facetDistribution: Record<string, number> = {};
    for (const node of nodes) {
      facetDistribution[node.facet.code] = (facetDistribution[node.facet.code] || 0) + 1;
    }

    // Calculate modality balance
    const modalityBalance: Record<Modality, number> = {
      somatic: 0,
      emotional: 0,
      mental: 0,
      spiritual: 0,
      collective: 0
    };
    for (const node of nodes) {
      modalityBalance[node.modality]++;
    }

    // Detect stuck patterns from developmental memory
    const stuckPatternsResult = await developmentalMemory.detectStuckPatterns(userId);
    const stuckPatterns: StuckPattern[] = stuckPatternsResult.map(p => ({
      issue: p.entity,
      occurrences: p.occurrence_count,
      facets: p.facets,
      firstSeen: new Date(p.timestamps[0]),
      lastSeen: new Date(p.timestamps[p.timestamps.length - 1]),
      recommendation: `This pattern has occurred ${p.occurrence_count} times - consider deeper exploration with MAIA or a guide.`
    }));

    // Find breakthrough moments
    const breakthroughMoments: BreakthroughMoment[] = nodes
      .filter(n => n.event.type === 'spiritual' && n.event.experience === 'breakthrough')
      .map(n => ({
        timestamp: n.timestamp,
        facet: n.facet.code,
        insight: n.event.type === 'spiritual' ? (n.event.integration || 'Breakthrough moment') : '',
        catalysts: ['spiritual_practice'],
        integration: []
      }));

    // Spiral cycles analysis
    const spiralCycles = await this.analyzeSpiralCycles(userId, nodes);

    return {
      nodes,
      timeSpan,
      facetDistribution,
      modalityBalance,
      spiralCycles,
      stuckPatterns,
      breakthroughMoments,
      integrationThreads: [],  // TODO: Implement integration thread detection
      ainDeliberations: [],     // Populated by getAINHistory
      sharedInsights: []
    };
  }

  private parseFacetCode(code: string | null): SpiralFacet {
    if (!code) {
      return { element: 'EARTH', phase: 1, code: 'EARTH-1' };
    }

    const [element, phaseStr] = code.split('-');
    const phase = parseInt(phaseStr) as 1 | 2 | 3;

    return {
      element: element as 'FIRE' | 'WATER' | 'EARTH' | 'AIR' | 'AETHER',
      phase,
      code
    };
  }

  private async analyzeSpiralCycles(userId: string, nodes: LatticeNode[]): Promise<SpiralCycle[]> {
    const facetMap = new Map<string, Date[]>();

    for (const node of nodes) {
      const facetCode = node.facet.code;
      if (!facetMap.has(facetCode)) {
        facetMap.set(facetCode, []);
      }
      facetMap.get(facetCode)!.push(node.timestamp);
    }

    const cycles: SpiralCycle[] = [];
    for (const [facet, entrances] of facetMap.entries()) {
      if (entrances.length >= 2) {
        const sortedEntrances = entrances.sort((a, b) => a.getTime() - b.getTime());
        const durations: number[] = [];

        for (let i = 1; i < sortedEntrances.length; i++) {
          const days = (sortedEntrances[i].getTime() - sortedEntrances[i - 1].getTime()) / (1000 * 60 * 60 * 24);
          durations.push(days);
        }

        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        cycles.push({
          facet,
          entrances: sortedEntrances,
          avgDuration,
          evolvingPattern: durations.length > 1 && durations[durations.length - 1] < durations[0] // Getting faster
        });
      }
    }

    return cycles;
  }

  private async getAINHistory(userId: string, query: string): Promise<AINDeliberation[]> {
    // Query developmental memories for AIN deliberations
    const ainMemories = await developmentalMemory.retrieveMemories({
      userId,
      type: ['ain_deliberation', 'breakthrough_emergence'],
      limit: 5,
      minSignificance: 0.7
    });

    // Also do semantic search on the query
    const semanticMatches = await developmentalMemory.semanticSearch(userId, query, 5, 0.65);

    // Combine and deduplicate
    const allMemories = [...ainMemories, ...semanticMatches];
    const uniqueById = new Map();
    for (const mem of allMemories) {
      if (!uniqueById.has(mem.id)) {
        uniqueById.set(mem.id, mem);
      }
    }

    // Map to AINDeliberation format
    const deliberations: AINDeliberation[] = Array.from(uniqueById.values())
      .filter(m => m.memoryType === 'ain_deliberation' || m.memoryType === 'breakthrough_emergence')
      .map(m => ({
        sessionId: m.sourceAinSessionId || m.id,
        question: m.triggerEvent?.question || 'Unknown question',
        framings: m.triggerEvent?.framings || [],
        synthesis: m.triggerEvent?.synthesis || '',
        emergenceRating: (m.triggerEvent?.emergenceRating || 2) as 1 | 2 | 3,
        timestamp: m.formedAt
      }));

    return deliberations;
  }

  private async localSynthesis(
    question: string,
    field: MemoryField,
    ain: AINDeliberation[],
    patterns: string[]
  ): Promise<{ text: string; sources: string[]; confidence: number }> {
    // Build context from memory field
    const context = {
      question,
      timeSpan: `${field.timeSpan.start.toLocaleDateString()} to ${field.timeSpan.end.toLocaleDateString()}`,
      facetDistribution: field.facetDistribution,
      modalityBalance: field.modalityBalance,
      stuckPatterns: field.stuckPatterns.map(p => `${p.issue} (${p.occurrences}x)`),
      breakthroughs: field.breakthroughMoments.map(b => `${b.facet}: ${b.insight}`),
      ainInsights: ain.map(a => a.synthesis),
      patterns
    };

    // Create synthesis prompt
    const prompt = `You are MAIA, a psychospiritual wisdom synthesis AI. Based on the user's consciousness journey data, provide integrated wisdom.

QUESTION: ${question}

MEMORY FIELD CONTEXT:
- Time Span: ${context.timeSpan}
- Active Facets: ${Object.entries(context.facetDistribution).map(([f, c]) => `${f}(${c})`).join(', ')}
- Modality Balance: Somatic:${context.modalityBalance.somatic} Emotional:${context.modalityBalance.emotional} Mental:${context.modalityBalance.mental} Spiritual:${context.modalityBalance.spiritual}
- Stuck Patterns: ${context.stuckPatterns.join('; ') || 'None detected'}
- Breakthroughs: ${context.breakthroughs.join('; ') || 'None yet'}
- AIN Deliberations: ${context.ainInsights.slice(0, 3).join(' | ') || 'None'}
- Detected Patterns: ${context.patterns.join(', ') || 'None'}

Synthesize wisdom that:
1. Honors the full context of their journey
2. Addresses stuck patterns with compassion
3. Builds on breakthroughs and insights
4. Suggests next-level evolution
5. Speaks from deep wisdom, not platitudes

Keep response concise (2-4 sentences) and grounded in their actual data.`;

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-r1:8b',
          prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama synthesis failed: ${response.statusText}`);
      }

      const data = await response.json();
      const synthesis = data.response || '';

      // Extract sources from context
      const sources: string[] = [];
      if (field.stuckPatterns.length > 0) sources.push('stuck_patterns');
      if (field.breakthroughMoments.length > 0) sources.push('breakthroughs');
      if (ain.length > 0) sources.push('ain_deliberations');
      if (patterns.length > 0) sources.push('emergent_patterns');

      // Calculate confidence based on available data
      const dataPoints =
        field.nodes.length +
        field.stuckPatterns.length * 3 +
        field.breakthroughMoments.length * 5 +
        ain.length * 4;

      const confidence = Math.min(1.0, dataPoints / 20); // Normalize to 0-1

      return {
        text: synthesis.trim(),
        sources,
        confidence
      };
    } catch (error) {
      console.error('[SOVEREIGNTY] Local synthesis error:', error);
      // Graceful fallback
      return {
        text: `I notice patterns in your journey around ${question}, but I'm currently unable to synthesize deeper wisdom. The data shows activity across ${Object.keys(field.facetDistribution).join(', ')}.`,
        sources: ['memory_field'],
        confidence: 0.3
      };
    }
  }

  private calculateEmergence(synthesis: any, field: MemoryField): number {
    // Emergence = how much NEW wisdom created beyond just recalling old patterns

    // Factors that indicate emergence:
    // 1. Integration across multiple facets (not stuck in one)
    const facetDiversity = Object.keys(field.facetDistribution).length / 12; // 0-1 (12 total facets)

    // 2. Modality balance (engaging full spectrum)
    const modalityCount = Object.values(field.modalityBalance).filter(v => v > 0).length;
    const modalityDiversity = modalityCount / 5; // 0-1 (5 modalities)

    // 3. Breakthrough moments (new territory)
    const breakthroughFactor = Math.min(1.0, field.breakthroughMoments.length / 3);

    // 4. Integration threads (connecting disparate elements)
    const integrationFactor = Math.min(1.0, field.integrationThreads.length / 5);

    // 5. AIN deliberations (multi-perspective synthesis)
    const ainFactor = Math.min(1.0, field.ainDeliberations.length / 3);

    // 6. Synthesis text uniqueness (not just repeating patterns)
    // If synthesis mentions breakthrough/integration/emergence = higher emergence
    const synthesisText = synthesis.text?.toLowerCase() || '';
    const emergenceKeywords = ['breakthrough', 'integration', 'emergence', 'new', 'evolving', 'transform'];
    const keywordMatches = emergenceKeywords.filter(kw => synthesisText.includes(kw)).length;
    const keywordFactor = Math.min(1.0, keywordMatches / 3);

    // Weighted average
    const emergence = (
      facetDiversity * 0.15 +
      modalityDiversity * 0.15 +
      breakthroughFactor * 0.25 +
      integrationFactor * 0.15 +
      ainFactor * 0.15 +
      keywordFactor * 0.15
    );

    return Math.min(1.0, Math.max(0.0, emergence));
  }
}

// Singleton instance
export const lattice = new ConsciousnessMemoryLattice();
