/**
 * Elemental Card - The core memory unit for AIN Human Remembering
 *
 * Like Recall's "Recall Card" but for consciousness instead of information.
 * Each card represents a moment of awareness, reflection, or transformation.
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type Archetype = 'creator' | 'healer' | 'shadow' | 'sage' | 'warrior' | 'lover' | 'magician' | 'innocent';
export type Phase = 'activation' | 'dissolution' | 'integration' | 'nigredo' | 'albedo' | 'rubedo';
export type EmotionalTone = 'joy' | 'sorrow' | 'anger' | 'fear' | 'peace' | 'longing' | 'wonder' | 'confusion';

export interface Symbol {
  name: string;
  frequency: number; // How often this symbol appears in the card
  resonance: number; // 0-1, how strongly it carries meaning
  firstAppeared?: Date;
  lastAppeared?: Date;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  element: Element;
  strength: number; // 0-1, how strongly this pattern is present
  recurrence: number; // How many times this pattern has appeared across cards
}

export interface ElementalMetadata {
  // Elemental distribution (should sum to ~1.0)
  fire: number;    // Action, passion, transformation
  water: number;   // Emotion, flow, depth
  earth: number;   // Embodiment, grounding, stability
  air: number;     // Clarity, thought, perspective
  aether: number;  // Integration, transcendence, wholeness

  // Dominant element
  primary: Element;
  secondary?: Element;
}

export interface ArchetypalPresence {
  archetype: Archetype;
  strength: number; // 0-1
  notes?: string;
}

export interface ConnectionMetadata {
  targetCardId: string;
  connectionType: 'symbolic' | 'elemental' | 'archetypal' | 'temporal' | 'thematic';
  strength: number; // 0-1, how strong is this connection
  description?: string;
  discoveredAt: Date;
}

export interface ElementalCard {
  // Identity
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Source
  sourceType: 'journal' | 'dream' | 'conversation' | 'reflection' | 'ritual' | 'meditation';
  sourceId?: string; // Reference to original journal entry, conversation, etc.

  // Content
  title: string;
  content: string; // Full original content
  summary: string; // AI-generated essence
  userNotes?: string; // User's own reflections on this card

  // Elemental Analysis
  elemental: ElementalMetadata;

  // Archetypal Presence
  archetypes: ArchetypalPresence[];

  // Alchemical Phase
  phase: Phase;
  phaseConfidence: number; // 0-1

  // Emotional Resonance
  emotionalTone: EmotionalTone[];
  emotionalIntensity: number; // 0-1

  // Symbolic Content
  symbols: Symbol[];

  // Patterns Detected
  patterns: Pattern[];

  // Connections to other cards
  connections: ConnectionMetadata[];

  // Temporal Context
  moonPhase?: 'new' | 'waxing' | 'full' | 'waning';
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';

  // Energetic State
  energyLevel: number; // 0-1, how much charge this memory carries
  lastActivated?: Date; // Last time this card was recalled/reviewed
  activationCount: number; // How many times this has been surfaced

  // Review & Integration
  reviewSchedule?: {
    nextReview: Date;
    interval: number; // Days until next review
    ease: number; // How easily this integrates (affects interval)
  };

  // Tags & Categories (user-defined)
  tags: string[];
  categories: string[];

  // Transformation Tracking
  transformationNotes?: Array<{
    date: Date;
    observation: string;
    previousPhase?: Phase;
    newPhase?: Phase;
  }>;
}

/**
 * Create an Elemental Card from raw content
 */
export interface CreateElementalCardInput {
  userId: string;
  sourceType: ElementalCard['sourceType'];
  sourceId?: string;
  title: string;
  content: string;
  userNotes?: string;
  tags?: string[];
  categories?: string[];
}

/**
 * Card Factory - Creates elemental cards with AI analysis
 */
export class ElementalCardFactory {
  /**
   * Generate elemental metadata from content
   * This would call AI to analyze elemental distribution
   */
  static async analyzeElementalDistribution(content: string): Promise<ElementalMetadata> {
    // TODO: Implement AI-based elemental analysis
    // For now, return placeholder
    return {
      fire: 0.2,
      water: 0.3,
      earth: 0.2,
      air: 0.2,
      aether: 0.1,
      primary: 'water',
      secondary: 'air'
    };
  }

  /**
   * Detect archetypes present in content
   */
  static async detectArchetypes(content: string): Promise<ArchetypalPresence[]> {
    // TODO: Implement AI-based archetype detection
    return [];
  }

  /**
   * Extract symbols from content
   */
  static async extractSymbols(content: string): Promise<Symbol[]> {
    // TODO: Implement symbol extraction
    return [];
  }

  /**
   * Detect patterns in content
   */
  static async detectPatterns(content: string, userId: string): Promise<Pattern[]> {
    // TODO: Cross-reference with user's pattern history
    return [];
  }

  /**
   * Determine alchemical phase
   */
  static async determinePhase(content: string, elemental: ElementalMetadata): Promise<{ phase: Phase; confidence: number }> {
    // TODO: Implement phase detection
    return {
      phase: 'integration',
      confidence: 0.7
    };
  }

  /**
   * Analyze emotional tone
   */
  static async analyzeEmotionalTone(content: string): Promise<{ tones: EmotionalTone[]; intensity: number }> {
    // TODO: Implement emotional analysis
    return {
      tones: ['peace'],
      intensity: 0.5
    };
  }

  /**
   * Generate AI summary
   */
  static async generateSummary(content: string): Promise<string> {
    // TODO: Call AI to generate essence/summary
    return content.slice(0, 200) + '...';
  }

  /**
   * Create a complete Elemental Card with full analysis
   */
  static async create(input: CreateElementalCardInput): Promise<ElementalCard> {
    const now = new Date();

    // Run all analyses in parallel
    const [
      elemental,
      archetypes,
      symbols,
      patterns,
      phaseResult,
      emotionalResult,
      summary
    ] = await Promise.all([
      this.analyzeElementalDistribution(input.content),
      this.detectArchetypes(input.content),
      this.extractSymbols(input.content),
      this.detectPatterns(input.content, input.userId),
      this.determinePhase(input.content, await this.analyzeElementalDistribution(input.content)),
      this.analyzeEmotionalTone(input.content),
      this.generateSummary(input.content)
    ]);

    // Determine temporal context
    const moonPhase = this.getMoonPhase(now);
    const season = this.getSeason(now);
    const timeOfDay = this.getTimeOfDay(now);

    const card: ElementalCard = {
      id: `card_${now.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: input.userId,
      createdAt: now,
      updatedAt: now,

      sourceType: input.sourceType,
      sourceId: input.sourceId,

      title: input.title,
      content: input.content,
      summary,
      userNotes: input.userNotes,

      elemental,
      archetypes,
      phase: phaseResult.phase,
      phaseConfidence: phaseResult.confidence,

      emotionalTone: emotionalResult.tones,
      emotionalIntensity: emotionalResult.intensity,

      symbols,
      patterns,
      connections: [],

      moonPhase,
      season,
      timeOfDay,

      energyLevel: 1.0, // New cards start with full energy
      activationCount: 0,

      tags: input.tags || [],
      categories: input.categories || [],
    };

    return card;
  }

  /**
   * Helper: Get current moon phase
   */
  private static getMoonPhase(date: Date): ElementalCard['moonPhase'] {
    // Simplified moon phase calculation
    const day = date.getDate();
    if (day < 7) return 'new';
    if (day < 14) return 'waxing';
    if (day < 21) return 'full';
    return 'waning';
  }

  /**
   * Helper: Get current season
   */
  private static getSeason(date: Date): ElementalCard['season'] {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  /**
   * Helper: Get time of day
   */
  private static getTimeOfDay(date: Date): ElementalCard['timeOfDay'] {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'dawn';
    if (hour >= 12 && hour < 17) return 'day';
    if (hour >= 17 && hour < 21) return 'dusk';
    return 'night';
  }
}
