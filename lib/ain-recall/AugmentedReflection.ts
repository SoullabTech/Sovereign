/**
 * Augmented Reflection Engine
 *
 * Like Recall's "Augmented Browsing" but for consciousness:
 * - Detects recurring archetypes or elemental imbalances in real-time
 * - Surfaces old insights/dreams that echo the same pattern
 * - Creates spiritual déjà vu - recognizing your own evolution
 */

import { ElementalCard, Element, Archetype, Pattern } from './ElementalCard';
import { PatternResonanceGraph } from './PatternResonanceGraph';

export interface ReflectionContext {
  currentInput: string; // What the user just said/wrote
  recentCards: ElementalCard[]; // Recent memory context
  conversationPhase?: 'opening' | 'deepening' | 'integrating' | 'closing';
}

export interface SurfacedMemory {
  card: ElementalCard;
  resonanceScore: number; // 0-1, how strongly this resonates with current moment
  connectionType: 'symbolic' | 'elemental' | 'archetypal' | 'pattern' | 'transformation';
  explanation: string; // Why this is surfacing now
  quote?: string; // Relevant excerpt from the card
}

export interface ElementalImbalance {
  element: Element;
  currentLevel: number; // 0-1
  idealLevel: number; // 0-1
  variance: number; // How far from ideal
  recommendation: string;
}

export interface ArchetypalShift {
  archetype: Archetype;
  previousStrength: number;
  currentStrength: number;
  trend: 'emerging' | 'fading' | 'stable';
  significance: string;
}

export interface PatternRecurrence {
  pattern: Pattern;
  firstAppearance: Date;
  lastAppearance: Date;
  frequency: number;
  currentPhase: 'activation' | 'dissolution' | 'integration';
  insight: string;
}

export interface AugmentedReflectionResult {
  // Surfaced memories
  memories: SurfacedMemory[];

  // Current state analysis
  elementalBalance: {
    distribution: Record<Element, number>;
    imbalances: ElementalImbalance[];
    dominantElement: Element;
  };

  // Archetypal presence
  archetypalShifts: ArchetypalShift[];

  // Pattern detection
  recurringPatterns: PatternRecurrence[];

  // Transformation tracking
  evolutionObservations: string[];

  // Suggested reflections
  reflectionPrompts: string[];
}

/**
 * Augmented Reflection Engine
 */
export class AugmentedReflectionEngine {
  private graph: PatternResonanceGraph;
  private userId: string;
  private cardHistory: Map<string, ElementalCard> = new Map();

  // Thresholds
  private readonly RESONANCE_THRESHOLD = 0.4; // Min resonance to surface memory
  private readonly IMBALANCE_THRESHOLD = 0.3; // Variance from ideal to flag
  private readonly PATTERN_RECURRENCE_MIN = 3; // Min occurrences to be "recurring"

  constructor(userId: string, graph: PatternResonanceGraph) {
    this.userId = userId;
    this.graph = graph;
  }

  /**
   * Load card history for this user
   */
  async loadCardHistory(cards: ElementalCard[]): Promise<void> {
    for (const card of cards) {
      this.cardHistory.set(card.id, card);
    }
  }

  /**
   * Main method: Analyze current context and surface relevant memories
   */
  async reflect(context: ReflectionContext): Promise<AugmentedReflectionResult> {
    // Analyze current input
    const currentAnalysis = await this.analyzeCurrentInput(context.currentInput);

    // Find resonant memories
    const memories = await this.surfaceResonantMemories(currentAnalysis, context);

    // Detect elemental imbalances
    const elementalBalance = await this.analyzeElementalBalance(context.recentCards);

    // Track archetypal shifts
    const archetypalShifts = await this.trackArchetypalShifts(context.recentCards);

    // Identify recurring patterns
    const recurringPatterns = await this.identifyRecurringPatterns(context.recentCards);

    // Generate evolution observations
    const evolutionObservations = await this.observeEvolution(memories, context.recentCards);

    // Generate reflection prompts
    const reflectionPrompts = await this.generateReflectionPrompts({
      memories,
      elementalBalance,
      archetypalShifts,
      recurringPatterns
    });

    return {
      memories,
      elementalBalance,
      archetypalShifts,
      recurringPatterns,
      evolutionObservations,
      reflectionPrompts
    };
  }

  /**
   * Analyze current input to extract elemental/archetypal/symbolic content
   */
  private async analyzeCurrentInput(input: string): Promise<{
    elements: Record<Element, number>;
    archetypes: Array<{ archetype: Archetype; strength: number }>;
    symbols: string[];
    emotionalTone: string;
  }> {
    // TODO: Call AI to analyze current input
    // For now, return placeholder
    return {
      elements: {
        fire: 0.2,
        water: 0.3,
        earth: 0.2,
        air: 0.2,
        aether: 0.1
      },
      archetypes: [],
      symbols: [],
      emotionalTone: 'contemplative'
    };
  }

  /**
   * Surface memories that resonate with current moment
   */
  private async surfaceResonantMemories(
    currentAnalysis: Awaited<ReturnType<typeof this.analyzeCurrentInput>>,
    context: ReflectionContext
  ): Promise<SurfacedMemory[]> {
    const memories: SurfacedMemory[] = [];

    for (const card of this.cardHistory.values()) {
      // Skip very recent cards (already in consciousness)
      const daysSinceCreation = (Date.now() - card.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) continue;

      // Calculate resonance
      const resonance = await this.calculateResonance(card, currentAnalysis, context);

      if (resonance.score > this.RESONANCE_THRESHOLD) {
        memories.push({
          card,
          resonanceScore: resonance.score,
          connectionType: resonance.type,
          explanation: resonance.explanation,
          quote: this.extractRelevantQuote(card)
        });
      }
    }

    // Sort by resonance score, return top 5
    return memories
      .sort((a, b) => b.resonanceScore - a.resonanceScore)
      .slice(0, 5);
  }

  /**
   * Calculate resonance between a card and current moment
   */
  private async calculateResonance(
    card: ElementalCard,
    currentAnalysis: Awaited<ReturnType<typeof this.analyzeCurrentInput>>,
    context: ReflectionContext
  ): Promise<{ score: number; type: SurfacedMemory['connectionType']; explanation: string }> {
    let score = 0;
    let primaryType: SurfacedMemory['connectionType'] = 'symbolic';
    let explanation = '';

    // Elemental resonance
    const elementalResonance = this.calculateElementalResonance(
      card.elemental,
      currentAnalysis.elements
    );
    if (elementalResonance > score) {
      score = elementalResonance;
      primaryType = 'elemental';
      explanation = `Strong ${card.elemental.primary} resonance with current state`;
    }

    // Archetypal resonance
    const archetypeResonance = this.calculateArchetypalResonance(
      card.archetypes,
      currentAnalysis.archetypes
    );
    if (archetypeResonance > score) {
      score = archetypeResonance;
      primaryType = 'archetypal';
      explanation = `Archetypal echo from ${card.archetypes[0]?.archetype}`;
    }

    // Symbolic resonance
    const symbolResonance = this.calculateSymbolicResonance(
      card.symbols.map(s => s.name),
      currentAnalysis.symbols
    );
    if (symbolResonance > score) {
      score = symbolResonance;
      primaryType = 'symbolic';
      explanation = `Shared symbols: ${card.symbols.slice(0, 2).map(s => s.name).join(', ')}`;
    }

    // Pattern resonance (check if similar patterns are present)
    // TODO: Implement pattern matching

    // Transformation resonance (if this card represents a similar transformation)
    // TODO: Implement transformation matching

    return { score, type: primaryType, explanation };
  }

  /**
   * Calculate elemental resonance between two distributions
   */
  private calculateElementalResonance(
    dist1: Record<Element, number>,
    dist2: Record<Element, number>
  ): number {
    // Calculate cosine similarity
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    const elements: Element[] = ['fire', 'water', 'earth', 'air', 'aether'];
    for (const element of elements) {
      dotProduct += dist1[element] * dist2[element];
      mag1 += dist1[element] * dist1[element];
      mag2 += dist2[element] * dist2[element];
    }

    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  /**
   * Calculate archetypal resonance
   */
  private calculateArchetypalResonance(
    archetypes1: Array<{ archetype: Archetype; strength: number }>,
    archetypes2: Array<{ archetype: Archetype; strength: number }>
  ): number {
    // Find overlapping archetypes
    const overlap = archetypes1.filter(a1 =>
      archetypes2.some(a2 => a2.archetype === a1.archetype)
    );

    if (overlap.length === 0) return 0;

    // Average strength of overlapping archetypes
    return overlap.reduce((sum, a) => sum + a.strength, 0) / overlap.length;
  }

  /**
   * Calculate symbolic resonance
   */
  private calculateSymbolicResonance(symbols1: string[], symbols2: string[]): number {
    const overlap = symbols1.filter(s1 =>
      symbols2.some(s2 => s2.toLowerCase() === s1.toLowerCase())
    );

    if (overlap.length === 0) return 0;

    // Jaccard similarity
    const union = new Set([...symbols1, ...symbols2]);
    return overlap.length / union.size;
  }

  /**
   * Extract relevant quote from card
   */
  private extractRelevantQuote(card: ElementalCard): string {
    // Return first sentence of summary or content
    const text = card.summary || card.content;
    const firstSentence = text.split(/[.!?]/)[0];
    return firstSentence.trim() + '...';
  }

  /**
   * Analyze elemental balance over recent cards
   */
  private async analyzeElementalBalance(
    recentCards: ElementalCard[]
  ): Promise<AugmentedReflectionResult['elementalBalance']> {
    if (recentCards.length === 0) {
      return {
        distribution: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
        imbalances: [],
        dominantElement: 'aether'
      };
    }

    // Calculate average distribution
    const distribution: Record<Element, number> = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };

    for (const card of recentCards) {
      distribution.fire += card.elemental.fire;
      distribution.water += card.elemental.water;
      distribution.earth += card.elemental.earth;
      distribution.air += card.elemental.air;
      distribution.aether += card.elemental.aether;
    }

    for (const element in distribution) {
      distribution[element as Element] /= recentCards.length;
    }

    // Identify dominant element
    const dominantElement = (Object.entries(distribution) as Array<[Element, number]>)
      .reduce((max, [elem, val]) => val > max[1] ? [elem, val] : max)[0];

    // Detect imbalances (ideal is 0.2 for each)
    const ideal = 0.2;
    const imbalances: ElementalImbalance[] = [];

    for (const [element, level] of Object.entries(distribution) as Array<[Element, number]>) {
      const variance = Math.abs(level - ideal);
      if (variance > this.IMBALANCE_THRESHOLD) {
        imbalances.push({
          element,
          currentLevel: level,
          idealLevel: ideal,
          variance,
          recommendation: this.getBalancingRecommendation(element, level, ideal)
        });
      }
    }

    return {
      distribution,
      imbalances,
      dominantElement
    };
  }

  /**
   * Get balancing recommendation for an element
   */
  private getBalancingRecommendation(element: Element, current: number, ideal: number): string {
    const deficit = ideal - current;

    if (deficit > 0) {
      // Need more of this element
      const recommendations = {
        fire: 'Consider creative action, passion projects, or physical movement',
        water: 'Allow more emotional flow, dream work, or intuitive practices',
        earth: 'Ground through embodiment, nature connection, or routine',
        air: 'Cultivate clarity through reflection, learning, or perspective shifts',
        aether: 'Seek integration through meditation, synthesis, or wholeness practices'
      };
      return recommendations[element];
    } else {
      // Too much of this element
      const recommendations = {
        fire: 'Balance intensity with rest, cooling practices, or receptivity',
        water: 'Balance emotion with grounding, structure, or clarity',
        earth: 'Balance stability with flexibility, flow, or innovation',
        air: 'Balance thought with embodiment, feeling, or action',
        aether: 'Balance transcendence with grounding in the particular'
      };
      return recommendations[element];
    }
  }

  /**
   * Track archetypal shifts over time
   */
  private async trackArchetypalShifts(recentCards: ElementalCard[]): Promise<ArchetypalShift[]> {
    // TODO: Implement archetypal trend analysis
    return [];
  }

  /**
   * Identify recurring patterns
   */
  private async identifyRecurringPatterns(recentCards: ElementalCard[]): Promise<PatternRecurrence[]> {
    // TODO: Implement pattern recurrence detection
    return [];
  }

  /**
   * Observe evolution based on surfaced memories and current state
   */
  private async observeEvolution(
    memories: SurfacedMemory[],
    recentCards: ElementalCard[]
  ): Promise<string[]> {
    const observations: string[] = [];

    // Compare current state to past memories
    for (const memory of memories.slice(0, 2)) {
      const daysSince = (Date.now() - memory.card.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const timeframe = daysSince > 365 ? 'a year ago' :
                       daysSince > 30 ? `${Math.floor(daysSince / 30)} months ago` :
                       `${Math.floor(daysSince)} days ago`;

      observations.push(
        `${timeframe}, you explored ${memory.card.elemental.primary} through "${memory.card.title}"`
      );
    }

    return observations;
  }

  /**
   * Generate reflection prompts based on current state
   */
  private async generateReflectionPrompts(data: {
    memories: SurfacedMemory[];
    elementalBalance: AugmentedReflectionResult['elementalBalance'];
    archetypalShifts: ArchetypalShift[];
    recurringPatterns: PatternRecurrence[];
  }): Promise<string[]> {
    const prompts: string[] = [];

    // Prompts based on surfaced memories
    if (data.memories.length > 0) {
      const topMemory = data.memories[0];
      prompts.push(
        `Last time you explored this theme in "${topMemory.card.title}", what has shifted since then?`
      );
    }

    // Prompts based on elemental imbalances
    if (data.elementalBalance.imbalances.length > 0) {
      const topImbalance = data.elementalBalance.imbalances[0];
      prompts.push(
        `You're low in ${topImbalance.element}. What would it look like to bring more ${topImbalance.element} into this moment?`
      );
    }

    // Prompts based on dominant element
    prompts.push(
      `You're strongly in ${data.elementalBalance.dominantElement} right now. What is this element teaching you?`
    );

    return prompts;
  }
}
