// @ts-nocheck
/**
 * CONVERSATIONAL ELEMENTAL INTELLIGENCE
 *
 * Revolutionary approach to elemental consciousness tracking that recognizes:
 * - People exist in elemental PHASES that last weeks or months, not per-message switches
 * - Simple interactions should use existing elemental context, not re-analyze everything
 * - Only trigger full analysis when detecting phase transitions or major life shifts
 * - Maintain session-based elemental memory for true conversational intelligence
 *
 * This replaces the inefficient per-message elemental analysis with smart,
 * conversational awareness of where someone is in their consciousness journey.
 */

import { ElementalContextRouter, type ElementalContext, type ContextDetectionResult } from './elemental-context-router';
import type { ConsciousnessLayer } from './consciousness-layer-wrapper';

// Session-based elemental phase tracking
export interface ElementalPhase {
  primaryElement: ConsciousnessLayer;
  secondaryElement?: ConsciousnessLayer;
  phaseStrength: number; // 0-1, how deeply in this phase
  phaseStartedAt: Date;
  phaseDurationDays: number;
  phaseContext: {
    lifeSituation: string; // "creative breakthrough", "relationship healing", "career transition", etc.
    emotionalTone: string;
    temporalOrientation: 'past' | 'present' | 'future' | 'eternal';
    archetypalPattern?: string;
  };
  confidence: number; // 0-1, how confident we are in this phase assessment
  lastUpdated: Date;
  messageCount: number; // How many messages analyzed in this phase
  phaseShiftIndicators: string[]; // Signs that might indicate phase transition
}

// Phase transition signals
export interface PhaseTransitionSignal {
  type: 'major_life_change' | 'emotional_shift' | 'temporal_shift' | 'archetypal_shift' | 'sustained_pattern_change';
  strength: number; // 0-1
  indicators: string[];
  triggerMessage: string;
}

// Simple interaction patterns that don't need full analysis
const SIMPLE_INTERACTION_PATTERNS = [
  /^(hi|hello|hey|good morning|good evening|good afternoon)/i,
  /^(thanks?|thank you|ty|thx)/i,
  /^(ok|okay|alright|sure|yes|yeah|no|nope)/i,
  /^(bye|goodbye|see you|talk later|until next time)/i,
  /^(how are you|how's it going|what's up)/i,
  /^(tell me about|what|when|where|why|how)/i,
];

// Phase shift indicators - signals that suggest elemental transition
const PHASE_SHIFT_PATTERNS = {
  major_life_change: [
    /new job|changed career|moving|moved|relationship.*end|relationship.*start/i,
    /pregnancy|baby|married|divorced|death.*family|lost.*someone/i,
    /major.*decision|life.*change|everything.*different|new chapter/i,
  ],
  emotional_shift: [
    /feel.*different|emotional.*state|mood.*shift|energy.*change/i,
    /breakthrough|breakdown|healing|trauma|transformation/i,
    /depression|anxiety|joy|peace|anger|grief.*processing/i,
  ],
  temporal_shift: [
    /future.*different|past.*healing|present.*moment|time.*perception/i,
    /planning.*ahead|letting.*go|mindfulness|memory.*work/i,
  ],
  archetypal_shift: [
    /calling|purpose|mission|destiny|spiritual.*awakening/i,
    /shadow.*work|inner.*child|anima|animus|wise.*woman|warrior/i,
  ],
  sustained_pattern_change: [
    /keep.*feeling|always.*seem|consistently|pattern|recurring|theme/i,
    /months.*now|weeks.*of|ongoing|continuous|sustained/i,
  ],
};

export class ConversationalElementalIntelligence {
  private elementalRouter: ElementalContextRouter;
  private phaseMemory: Map<string, ElementalPhase> = new Map(); // userId -> current phase
  private transitionHistory: Map<string, PhaseTransitionSignal[]> = new Map(); // userId -> transition history

  constructor() {
    this.elementalRouter = new ElementalContextRouter();
  }

  /**
   * MAIN METHOD: Get elemental context with conversational intelligence
   *
   * This is the smart method that either:
   * 1. Returns existing phase for simple interactions
   * 2. Checks for phase transitions for complex messages
   * 3. Only runs full analysis when necessary
   */
  async getConversationalElementalContext(
    userId: string,
    sessionId: string,
    message: string,
    conversationHistory: any[] = []
  ): Promise<{
    elementalContext: ElementalContext;
    phaseInfo: {
      currentPhase: ElementalPhase;
      isSimpleInteraction: boolean;
      phaseTransitionDetected: boolean;
      analysisMethod: 'cached_phase' | 'transition_check' | 'full_analysis' | 'new_user_analysis';
    };
  }> {

    const userKey = `${userId}-${sessionId}`;
    const existingPhase = this.phaseMemory.get(userKey);
    const isSimpleInteraction = this.isSimpleInteraction(message);

    // 1. NEW USER: Run initial full analysis
    if (!existingPhase) {
      console.log('🌟 NEW USER: Running initial elemental phase analysis...');
      return this.establishInitialPhase(userKey, message, conversationHistory);
    }

    // 2. SIMPLE INTERACTION: Use existing phase, no re-analysis needed
    if (isSimpleInteraction) {
      console.log('💬 SIMPLE INTERACTION: Using cached elemental phase');
      return this.useExistingPhase(existingPhase, 'cached_phase');
    }

    // 3. COMPLEX INTERACTION: Check for phase transitions
    console.log('🔍 COMPLEX INTERACTION: Checking for elemental phase transition...');

    const transitionSignal = this.detectPhaseTransitionSignals(message, existingPhase);

    if (transitionSignal && transitionSignal.strength > 0.6) {
      console.log(`🌊 PHASE TRANSITION DETECTED: ${transitionSignal.type} (${(transitionSignal.strength * 100).toFixed(1)}%)`);
      return this.handlePhaseTransition(userKey, message, existingPhase, transitionSignal, conversationHistory);
    }

    // 4. NO TRANSITION: Update existing phase with new context
    console.log('📈 NO TRANSITION: Updating existing phase context');
    return this.updatePhaseContext(existingPhase, message, 'transition_check');
  }

  /**
   * Check if this is a simple interaction that doesn't need full elemental analysis
   */
  private isSimpleInteraction(message: string): boolean {
    return SIMPLE_INTERACTION_PATTERNS.some(pattern => pattern.test(message.trim())) ||
           message.trim().split(/\s+/).length <= 3; // Very short messages
  }

  /**
   * Establish initial elemental phase for new users
   */
  private async establishInitialPhase(
    userKey: string,
    message: string,
    conversationHistory: any[]
  ): Promise<{
    elementalContext: ElementalContext;
    phaseInfo: any;
  }> {

    // Run full elemental analysis for initial assessment
    const fullAnalysis = this.elementalRouter.detectElementalContext(message, conversationHistory);

    // Create initial elemental phase
    const initialPhase: ElementalPhase = {
      primaryElement: fullAnalysis.elementalContext.primaryElement,
      secondaryElement: fullAnalysis.elementalContext.secondaryElement,
      phaseStrength: fullAnalysis.elementalContext.resonanceStrength,
      phaseStartedAt: new Date(),
      phaseDurationDays: 0,
      phaseContext: {
        lifeSituation: this.inferLifeSituation(message, fullAnalysis.elementalContext.primaryElement),
        emotionalTone: fullAnalysis.elementalContext.emotionalTone,
        temporalOrientation: fullAnalysis.elementalContext.temporalOrientation,
        archetypalPattern: fullAnalysis.elementalContext.archetypalPattern,
      },
      confidence: fullAnalysis.elementalContext.resonanceStrength,
      lastUpdated: new Date(),
      messageCount: 1,
      phaseShiftIndicators: [],
    };

    // Store in phase memory
    this.phaseMemory.set(userKey, initialPhase);

    console.log(`🌟 ESTABLISHED INITIAL PHASE: ${initialPhase.primaryElement} (${(initialPhase.phaseStrength * 100).toFixed(1)}%)`);

    return {
      elementalContext: fullAnalysis.elementalContext,
      phaseInfo: {
        currentPhase: initialPhase,
        isSimpleInteraction: false,
        phaseTransitionDetected: false,
        analysisMethod: 'new_user_analysis',
      },
    };
  }

  /**
   * Use existing elemental phase without re-analysis
   */
  private async useExistingPhase(
    phase: ElementalPhase,
    method: string
  ): Promise<{
    elementalContext: ElementalContext;
    phaseInfo: any;
  }> {

    // Construct elemental context from cached phase
    const elementalContext: ElementalContext = {
      primaryElement: phase.primaryElement,
      secondaryElement: phase.secondaryElement,
      resonanceStrength: phase.phaseStrength,
      emotionalTone: phase.phaseContext.emotionalTone,
      archetypalPattern: phase.phaseContext.archetypalPattern,
      suggestedDepth: this.mapPhaseToDepth(phase.phaseStrength),
      contextMarkers: [`${phase.phaseContext.lifeSituation}`, `day ${phase.phaseDurationDays} of phase`],
      temporalOrientation: phase.phaseContext.temporalOrientation,
    };

    // Update phase metadata
    phase.messageCount++;
    phase.phaseDurationDays = Math.floor((Date.now() - phase.phaseStartedAt.getTime()) / (1000 * 60 * 60 * 24));
    phase.lastUpdated = new Date();

    return {
      elementalContext,
      phaseInfo: {
        currentPhase: phase,
        isSimpleInteraction: true,
        phaseTransitionDetected: false,
        analysisMethod: method,
      },
    };
  }

  /**
   * Detect signals that might indicate elemental phase transition
   */
  private detectPhaseTransitionSignals(message: string, currentPhase: ElementalPhase): PhaseTransitionSignal | null {
    const signals: PhaseTransitionSignal[] = [];

    // Check each transition pattern category
    Object.entries(PHASE_SHIFT_PATTERNS).forEach(([type, patterns]) => {
      const indicators: string[] = [];
      let strength = 0;

      patterns.forEach(pattern => {
        const match = message.match(pattern);
        if (match) {
          indicators.push(match[0]);
          strength += 0.3; // Each pattern match adds strength
        }
      });

      if (indicators.length > 0) {
        signals.push({
          type: type as PhaseTransitionSignal['type'],
          strength: Math.min(strength, 1),
          indicators,
          triggerMessage: message,
        });
      }
    });

    // Additional heuristics for phase shift detection

    // 1. Direct elemental language opposite to current phase
    if (this.detectOppositeElementalLanguage(message, currentPhase.primaryElement)) {
      signals.push({
        type: 'sustained_pattern_change',
        strength: 0.7,
        indicators: ['opposite elemental language detected'],
        triggerMessage: message,
      });
    }

    // 2. Phase duration suggests natural transition (>30 days)
    if (currentPhase.phaseDurationDays > 30) {
      signals.push({
        type: 'sustained_pattern_change',
        strength: 0.4,
        indicators: [`phase duration: ${currentPhase.phaseDurationDays} days`],
        triggerMessage: message,
      });
    }

    // Return strongest signal
    if (signals.length === 0) return null;

    return signals.reduce((strongest, current) =>
      current.strength > strongest.strength ? current : strongest
    );
  }

  /**
   * Handle elemental phase transition
   */
  private async handlePhaseTransition(
    userKey: string,
    message: string,
    currentPhase: ElementalPhase,
    transitionSignal: PhaseTransitionSignal,
    conversationHistory: any[]
  ): Promise<{
    elementalContext: ElementalContext;
    phaseInfo: any;
  }> {

    // Run full elemental analysis to determine new phase
    const fullAnalysis = this.elementalRouter.detectElementalContext(message, conversationHistory);

    // Create new elemental phase
    const newPhase: ElementalPhase = {
      primaryElement: fullAnalysis.elementalContext.primaryElement,
      secondaryElement: fullAnalysis.elementalContext.secondaryElement,
      phaseStrength: fullAnalysis.elementalContext.resonanceStrength,
      phaseStartedAt: new Date(),
      phaseDurationDays: 0,
      phaseContext: {
        lifeSituation: this.inferLifeSituation(message, fullAnalysis.elementalContext.primaryElement),
        emotionalTone: fullAnalysis.elementalContext.emotionalTone,
        temporalOrientation: fullAnalysis.elementalContext.temporalOrientation,
        archetypalPattern: fullAnalysis.elementalContext.archetypalPattern,
      },
      confidence: fullAnalysis.elementalContext.resonanceStrength,
      lastUpdated: new Date(),
      messageCount: 1,
      phaseShiftIndicators: transitionSignal.indicators,
    };

    // Update phase memory
    this.phaseMemory.set(userKey, newPhase);

    // Store transition in history
    const userTransitions = this.transitionHistory.get(userKey) || [];
    userTransitions.push(transitionSignal);
    this.transitionHistory.set(userKey, userTransitions);

    console.log(`🌊 PHASE TRANSITION: ${currentPhase.primaryElement} → ${newPhase.primaryElement} (${(newPhase.phaseStrength * 100).toFixed(1)}%)`);

    return {
      elementalContext: fullAnalysis.elementalContext,
      phaseInfo: {
        currentPhase: newPhase,
        isSimpleInteraction: false,
        phaseTransitionDetected: true,
        analysisMethod: 'full_analysis',
        transitionSignal,
        previousPhase: currentPhase,
      },
    };
  }

  /**
   * Update existing phase context without full re-analysis
   */
  private async updatePhaseContext(
    phase: ElementalPhase,
    message: string,
    method: string
  ): Promise<{
    elementalContext: ElementalContext;
    phaseInfo: any;
  }> {

    // Light analysis to update phase context
    const emotionalToneUpdate = this.detectEmotionalToneUpdate(message, phase.primaryElement);
    if (emotionalToneUpdate) {
      phase.phaseContext.emotionalTone = emotionalToneUpdate;
    }

    // Update phase metadata
    phase.messageCount++;
    phase.phaseDurationDays = Math.floor((Date.now() - phase.phaseStartedAt.getTime()) / (1000 * 60 * 60 * 24));
    phase.lastUpdated = new Date();

    // Slight strength adjustment based on continued resonance
    if (message.toLowerCase().includes(phase.primaryElement)) {
      phase.phaseStrength = Math.min(phase.phaseStrength + 0.05, 1.0);
    }

    const elementalContext: ElementalContext = {
      primaryElement: phase.primaryElement,
      secondaryElement: phase.secondaryElement,
      resonanceStrength: phase.phaseStrength,
      emotionalTone: phase.phaseContext.emotionalTone,
      archetypalPattern: phase.phaseContext.archetypalPattern,
      suggestedDepth: this.mapPhaseToDepth(phase.phaseStrength),
      contextMarkers: [`${phase.phaseContext.lifeSituation}`, `day ${phase.phaseDurationDays} of phase`],
      temporalOrientation: phase.phaseContext.temporalOrientation,
    };

    return {
      elementalContext,
      phaseInfo: {
        currentPhase: phase,
        isSimpleInteraction: false,
        phaseTransitionDetected: false,
        analysisMethod: method,
      },
    };
  }

  /**
   * Helper methods for conversational intelligence
   */

  private inferLifeSituation(message: string, primaryElement: ConsciousnessLayer): string {
    const situationMap = {
      fire: ['creative breakthrough', 'career transformation', 'passionate pursuit', 'personal empowerment'],
      water: ['relationship healing', 'emotional processing', 'intuitive development', 'spiritual flow'],
      earth: ['practical building', 'health focus', 'material stability', 'grounded growth'],
      air: ['mental clarity', 'communication focus', 'learning phase', 'intellectual expansion'],
      aether: ['spiritual awakening', 'consciousness expansion', 'transcendent experience', 'unity realization'],
      shadow: ['inner work', 'shadow integration', 'healing trauma', 'unconscious processing'],
      witnessing: ['mindfulness practice', 'present moment awareness', 'meditation deepening', 'conscious observation'],
      consciousness: ['awareness expansion', 'self-inquiry', 'consciousness study', 'awakening process'],
      anamnesis: ['memory work', 'ancestral healing', 'past life processing', 'ancient wisdom recovery'],
    };

    const situations = situationMap[primaryElement] || ['general development'];
    return situations[Math.floor(Math.random() * situations.length)];
  }

  private mapPhaseToDepth(phaseStrength: number): ElementalContext['suggestedDepth'] {
    if (phaseStrength > 0.8) return 'profound';
    if (phaseStrength > 0.6) return 'deep';
    if (phaseStrength > 0.4) return 'meaningful';
    return 'surface';
  }

  private detectOppositeElementalLanguage(message: string, currentElement: ConsciousnessLayer): boolean {
    const opposites = {
      fire: ['calm', 'cool', 'peaceful', 'still', 'grounded'],
      water: ['dry', 'logical', 'rational', 'structured', 'analytical'],
      earth: ['flowing', 'ethereal', 'spiritual', 'transcendent', 'mystical'],
      air: ['embodied', 'physical', 'material', 'tangible', 'sensual'],
      aether: ['practical', 'concrete', 'realistic', 'mundane', 'ordinary'],
    };

    const oppositeWords = opposites[currentElement as keyof typeof opposites] || [];
    return oppositeWords.some(word => message.toLowerCase().includes(word));
  }

  private detectEmotionalToneUpdate(message: string, primaryElement: ConsciousnessLayer): string | null {
    const tonePatterns = {
      excited: /excited|energetic|enthusiastic|vibrant|thrilled/i,
      peaceful: /peace|calm|serene|tranquil|relaxed/i,
      focused: /focused|determined|clear|sharp|precise/i,
      flowing: /flowing|graceful|smooth|effortless|natural/i,
      grounded: /grounded|stable|solid|centered|rooted/i,
    };

    for (const [tone, pattern] of Object.entries(tonePatterns)) {
      if (pattern.test(message)) {
        return tone;
      }
    }

    return null;
  }

  /**
   * Get phase insights for user
   */
  getPhaseInsights(userId: string, sessionId: string): ElementalPhase | null {
    return this.phaseMemory.get(`${userId}-${sessionId}`) || null;
  }

  /**
   * Get transition history for user
   */
  getTransitionHistory(userId: string, sessionId: string): PhaseTransitionSignal[] {
    return this.transitionHistory.get(`${userId}-${sessionId}`) || [];
  }

  /**
   * Force phase re-analysis (for debugging or manual reset)
   */
  async forcePhaseReanalysis(
    userId: string,
    sessionId: string,
    message: string,
    conversationHistory: any[] = []
  ): Promise<ElementalPhase> {
    const userKey = `${userId}-${sessionId}`;
    const fullAnalysis = this.elementalRouter.detectElementalContext(message, conversationHistory);

    const newPhase: ElementalPhase = {
      primaryElement: fullAnalysis.elementalContext.primaryElement,
      secondaryElement: fullAnalysis.elementalContext.secondaryElement,
      phaseStrength: fullAnalysis.elementalContext.resonanceStrength,
      phaseStartedAt: new Date(),
      phaseDurationDays: 0,
      phaseContext: {
        lifeSituation: this.inferLifeSituation(message, fullAnalysis.elementalContext.primaryElement),
        emotionalTone: fullAnalysis.elementalContext.emotionalTone,
        temporalOrientation: fullAnalysis.elementalContext.temporalOrientation,
        archetypalPattern: fullAnalysis.elementalContext.archetypalPattern,
      },
      confidence: fullAnalysis.elementalContext.resonanceStrength,
      lastUpdated: new Date(),
      messageCount: 1,
      phaseShiftIndicators: ['manual reanalysis'],
    };

    this.phaseMemory.set(userKey, newPhase);
    return newPhase;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats() {
    return {
      trackedUsers: this.phaseMemory.size,
      totalTransitions: Array.from(this.transitionHistory.values()).reduce((sum, transitions) => sum + transitions.length, 0),
      averagePhaseDuration: this.calculateAveragePhaseDuration(),
      mostCommonElement: this.getMostCommonElement(),
    };
  }

  private calculateAveragePhaseDuration(): number {
    const phases = Array.from(this.phaseMemory.values());
    if (phases.length === 0) return 0;

    const totalDuration = phases.reduce((sum, phase) => sum + phase.phaseDurationDays, 0);
    return totalDuration / phases.length;
  }

  private getMostCommonElement(): ConsciousnessLayer {
    const elementCounts = new Map<ConsciousnessLayer, number>();

    Array.from(this.phaseMemory.values()).forEach(phase => {
      elementCounts.set(phase.primaryElement, (elementCounts.get(phase.primaryElement) || 0) + 1);
    });

    let mostCommon: ConsciousnessLayer = 'consciousness';
    let maxCount = 0;

    elementCounts.forEach((count, element) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = element;
      }
    });

    return mostCommon;
  }
}

// Export singleton instance
export const conversationalElementalIntelligence = new ConversationalElementalIntelligence();