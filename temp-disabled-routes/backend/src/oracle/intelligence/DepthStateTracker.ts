/**
 * Depth State Tracker
 * MIT Media Lab-inspired dialogue state tracking
 * Maps conversation depth through Spiralogic phases
 */

export type ConversationPhase =
  | 'surface'      // Small talk, facts
  | 'narrative'    // Personal stories
  | 'emotional'    // Feelings emerge
  | 'metaphorical' // Symbolic language
  | 'archetypal'   // Universal patterns
  | 'insight'      // Self-realization
  | 'integration'  // Embodied understanding

export interface DepthMetrics {
  currentDepth: number; // 0-10 scale
  phase: ConversationPhase;
  disclosureLength: number; // Average words per response
  metaphorDensity: number; // Metaphors per 100 words
  emotionalIntensity: number; // 0-1 scale
  timeInPhase: number; // Seconds
  breakthroughMoments: string[]; // Key insights
}

export interface ConversationTurn {
  userInput: string;
  mayaResponse: string;
  timestamp: number;
  depth: number;
  phase: ConversationPhase;
}

export class DepthStateTracker {
  private history: ConversationTurn[] = [];
  private phaseStartTime: number = Date.now();
  private currentPhase: ConversationPhase = 'surface';
  private currentDepth: number = 0;
  private breakthroughs: string[] = [];

  /**
   * Update depth based on new interaction
   */
  update(userInput: string, mayaResponse: string): DepthMetrics {
    const turn: ConversationTurn = {
      userInput,
      mayaResponse,
      timestamp: Date.now(),
      depth: this.currentDepth,
      phase: this.currentPhase
    };

    this.history.push(turn);

    // Analyze depth progression
    const newDepth = this.calculateDepth(userInput);
    const newPhase = this.mapDepthToPhase(newDepth);

    // Detect phase transition
    if (newPhase !== this.currentPhase) {
      console.log(`Phase transition: ${this.currentPhase} → ${newPhase}`);
      this.phaseStartTime = Date.now();
      this.currentPhase = newPhase;
    }

    // Detect breakthrough moments
    if (this.isBreakthrough(userInput, newDepth)) {
      const insight = this.extractInsight(userInput);
      this.breakthroughs.push(insight);
      console.log(`Breakthrough detected: "${insight}"`);
    }

    this.currentDepth = newDepth;

    return this.getMetrics();
  }

  /**
   * Calculate depth score from user input
   */
  private calculateDepth(userInput: string): number {
    let depth = this.currentDepth;
    const lower = userInput.toLowerCase();

    // Depth indicators (each adds to depth score)
    const indicators = {
      // Personal pronouns in vulnerable context
      vulnerability: /i (feel|felt|am|was) (lost|scared|alone|broken)/i,
      // Childhood or past references
      temporal: /(when i was|used to|always|never|childhood|young)/i,
      // Metaphorical language
      metaphor: /(like|as if|feels like|it's a|reminds me of)/i,
      // Dreams and symbols
      symbolic: /(dream|vision|symbol|meaning|represents)/i,
      // Existential themes
      existential: /(purpose|meaning|why am i|who am i|death|life)/i,
      // Shadow material
      shadow: /(hate|ashamed|guilty|dark|hidden|secret)/i,
      // Integration language
      integration: /(realize|understand now|see clearly|accept|embrace)/i
    };

    // Count depth indicators
    let depthPoints = 0;
    for (const [category, pattern] of Object.entries(indicators)) {
      if (pattern.test(lower)) {
        depthPoints += category === 'integration' ? 2 : 1;
      }
    }

    // Word count factor (longer = deeper typically)
    const wordCount = userInput.split(/\s+/).length;
    if (wordCount > 30) depthPoints += 1;
    if (wordCount > 50) depthPoints += 1;

    // Update depth (with momentum)
    depth = Math.min(10, depth + (depthPoints * 0.5));

    // Natural decay if no depth indicators
    if (depthPoints === 0) {
      depth = Math.max(0, depth - 0.2);
    }

    return Number(depth.toFixed(1));
  }

  /**
   * Map numerical depth to conversation phase
   */
  private mapDepthToPhase(depth: number): ConversationPhase {
    if (depth <= 1) return 'surface';
    if (depth <= 2.5) return 'narrative';
    if (depth <= 4) return 'emotional';
    if (depth <= 6) return 'metaphorical';
    if (depth <= 7.5) return 'archetypal';
    if (depth <= 9) return 'insight';
    return 'integration';
  }

  /**
   * Detect breakthrough moments
   */
  private isBreakthrough(userInput: string, newDepth: number): boolean {
    // Breakthrough = sudden depth increase + realization language
    const depthJump = newDepth - this.currentDepth > 1.5;
    const hasRealization = /realize|understand|see now|get it|aha|oh my|wow/i.test(userInput);
    const hasShift = /different now|changed|shifting|transforming/i.test(userInput);

    return depthJump && (hasRealization || hasShift);
  }

  /**
   * Extract the core insight from breakthrough moment
   */
  private extractInsight(userInput: string): string {
    // Find the key realization sentence
    const sentences = userInput.split(/[.!?]/).filter(s => s.trim());

    for (const sentence of sentences) {
      if (/realize|understand|see/i.test(sentence)) {
        return sentence.trim();
      }
    }

    // Fallback to first substantial sentence
    return sentences.find(s => s.split(/\s+/).length > 5)?.trim() || userInput.substring(0, 50);
  }

  /**
   * Get current conversation metrics
   */
  getMetrics(): DepthMetrics {
    const recentTurns = this.history.slice(-5);

    // Calculate average disclosure length
    const avgWords = recentTurns.length > 0
      ? recentTurns.reduce((sum, turn) => sum + turn.userInput.split(/\s+/).length, 0) / recentTurns.length
      : 0;

    // Calculate metaphor density
    const totalWords = recentTurns.reduce((sum, turn) => sum + turn.userInput.split(/\s+/).length, 0);
    const metaphorCount = recentTurns.reduce((sum, turn) => {
      const matches = turn.userInput.match(/(like|as if|feels like|it's a)/gi);
      return sum + (matches ? matches.length : 0);
    }, 0);
    const metaphorDensity = totalWords > 0 ? (metaphorCount / totalWords) * 100 : 0;

    // Calculate emotional intensity
    const emotionWords = /feel|felt|angry|sad|scared|happy|anxious|love|hate|afraid/gi;
    const emotionCount = recentTurns.reduce((sum, turn) => {
      const matches = turn.userInput.match(emotionWords);
      return sum + (matches ? matches.length : 0);
    }, 0);
    const emotionalIntensity = Math.min(1, emotionCount / 10);

    return {
      currentDepth: this.currentDepth,
      phase: this.currentPhase,
      disclosureLength: Math.round(avgWords),
      metaphorDensity: Number(metaphorDensity.toFixed(2)),
      emotionalIntensity: Number(emotionalIntensity.toFixed(2)),
      timeInPhase: Math.round((Date.now() - this.phaseStartTime) / 1000),
      breakthroughMoments: this.breakthroughs
    };
  }

  /**
   * Get conversation summary for research
   */
  getSummary(): {
    totalTurns: number;
    maxDepth: number;
    phasesReached: ConversationPhase[];
    breakthroughs: string[];
    arcPath: string;
  } {
    const phases = new Set(this.history.map(t => t.phase));
    const maxDepth = Math.max(...this.history.map(t => t.depth), 0);

    // Determine arc pattern
    let arcPath = 'surface-only';
    if (phases.has('integration')) arcPath = 'full-journey';
    else if (phases.has('insight')) arcPath = 'breakthrough';
    else if (phases.has('archetypal')) arcPath = 'deep-dive';
    else if (phases.has('emotional')) arcPath = 'emotional-exploration';

    return {
      totalTurns: this.history.length,
      maxDepth,
      phasesReached: Array.from(phases),
      breakthroughs: this.breakthroughs,
      arcPath
    };
  }

  /**
   * Reset for new conversation
   */
  reset(): void {
    this.history = [];
    this.currentDepth = 0;
    this.currentPhase = 'surface';
    this.phaseStartTime = Date.now();
    this.breakthroughs = [];
  }
}

export const depthTracker = new DepthStateTracker();