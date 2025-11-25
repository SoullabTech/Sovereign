/**
 * Intelligent Engagement System
 *
 * Sophisticated tracking and pattern recognition that runs continuously,
 * with intelligent mode-shifting based on genuine need rather than
 * automatic framework application.
 *
 * Core Principle: Track everything, deploy selectively based on what serves.
 */

export type EngagementMode =
  | 'witnessing'     // Pure presence and mirroring
  | 'reflecting'     // Pattern reflection back to user
  | 'counseling'     // Active advice when explicitly sought
  | 'guiding'        // Practical support and direction
  | 'processing'     // Framework deployment for complexity
  | 'provoking'      // Catalyst questions when stuck
  | 'invoking';      // Calling forth deeper exploration

export interface TrackedPatterns {
  // Elemental tracking
  elementalTendencies: {
    air: number;    // Mental/analytical patterns
    fire: number;   // Transformative/action patterns
    water: number;  // Emotional/intuitive patterns
    earth: number;  // Grounding/practical patterns
    aether: number; // Integration/spiritual patterns
  };
  dominantElement?: string;
  elementalShifts: Array<{
    from: string;
    to: string;
    timestamp: Date;
    context: string;
  }>;

  // Developmental tracking
  developmentalArc: {
    stage: 'exploring' | 'discovering' | 'deepening' | 'transforming' | 'integrating';
    progression: number; // 0-1
    breakthroughs: Array<{
      timestamp: Date;
      insight: string;
      catalyzedBy: string;
    }>;
    stuckPoints: Array<{
      pattern: string;
      occurrences: number;
      lastSeen: Date;
    }>;
  };

  // Relationship patterns
  relationshipMemory: {
    trustLevel: number; // 0-1
    vulnerabilityShown: number; // 0-1
    seekingStyle: 'direct' | 'indirect' | 'exploratory';
    responsePreference: 'gentle' | 'direct' | 'challenging';
    growthEdges: string[];
  };

  // Thematic patterns
  recurringThemes: Map<string, {
    mentions: number;
    lastMentioned: Date;
    emotionalCharge: number; // -1 to 1
    resolution: 'unresolved' | 'processing' | 'integrated';
  }>;

  // Process patterns
  processStyle: {
    prefersStructure: boolean;
    toleratesAmbiguity: boolean;
    needsClosure: boolean;
    explorationDepth: 'surface' | 'moderate' | 'deep';
  };
}

export interface ModeDecision {
  recommendedMode: EngagementMode;
  confidence: number; // 0-1
  reasoning: string;
  alternativeModes: EngagementMode[];
}

export class IntelligentEngagementSystem {
  private patterns: TrackedPatterns;
  private currentMode: EngagementMode = 'witnessing';
  private modeHistory: Array<{
    mode: EngagementMode;
    timestamp: Date;
    trigger: string;
  }> = [];

  constructor() {
    this.patterns = this.initializePatterns();
  }

  /**
   * Continuously track patterns from user input
   */
  trackPatterns(input: string, context: any): void {
    this.trackElementalPatterns(input);
    this.trackDevelopmentalProgress(input, context);
    this.trackRelationshipDynamics(input);
    this.trackThematicPatterns(input);
    this.trackProcessStyle(input);
    this.detectStuckPoints(input);
  }

  /**
   * Intelligently determine engagement mode based on genuine need
   */
  determineEngagementMode(
    input: string,
    currentPresence: any,
    conversationHistory: string[]
  ): ModeDecision {
    const signals = this.detectEngagementSignals(input, currentPresence);
    const context = this.analyzeConversationalContext(conversationHistory);

    // Check for explicit requests first
    if (signals.explicitAdviceRequest) {
      return {
        recommendedMode: 'counseling',
        confidence: 0.9,
        reasoning: 'User explicitly seeking advice or direction',
        alternativeModes: ['guiding', 'reflecting']
      };
    }

    // Check for stuckness that needs provocation
    if (this.detectStuckness(input) && this.patterns.relationshipMemory.trustLevel > 0.6) {
      return {
        recommendedMode: 'provoking',
        confidence: 0.7,
        reasoning: 'Pattern indicates stuckness, trust allows for provocation',
        alternativeModes: ['reflecting', 'witnessing']
      };
    }

    // Check for complexity overwhelm needing structure
    if (signals.complexityOverwhelm && this.patterns.processStyle.prefersStructure) {
      return {
        recommendedMode: 'processing',
        confidence: 0.8,
        reasoning: 'Complexity detected with user preference for structure',
        alternativeModes: ['guiding', 'reflecting']
      };
    }

    // Check for depth readiness
    if (signals.depthReadiness && this.patterns.developmentalArc.stage !== 'exploring') {
      return {
        recommendedMode: 'invoking',
        confidence: 0.6,
        reasoning: 'Readiness for deeper exploration detected',
        alternativeModes: ['reflecting', 'witnessing']
      };
    }

    // Check if pattern reflection would help
    if (this.shouldReflectPatterns(input)) {
      return {
        recommendedMode: 'reflecting',
        confidence: 0.7,
        reasoning: 'Recurring patterns could benefit from reflection',
        alternativeModes: ['witnessing', 'guiding']
      };
    }

    // Check for practical support needs
    if (signals.practicalNeed) {
      return {
        recommendedMode: 'guiding',
        confidence: 0.8,
        reasoning: 'Practical support or direction needed',
        alternativeModes: ['counseling', 'reflecting']
      };
    }

    // Default to witnessing
    return {
      recommendedMode: 'witnessing',
      confidence: 0.9,
      reasoning: 'Presence and witnessing most serves this moment',
      alternativeModes: ['reflecting']
    };
  }

  /**
   * Track elemental patterns over time
   */
  private trackElementalPatterns(input: string): void {
    const lowerInput = input.toLowerCase();

    // Air patterns (mental/analytical)
    if (lowerInput.match(/think|analyze|understand|figure out|make sense|logic|reason/)) {
      this.patterns.elementalTendencies.air += 0.1;
    }

    // Fire patterns (transformative/action)
    if (lowerInput.match(/change|transform|do|act|passionate|intense|breakthrough/)) {
      this.patterns.elementalTendencies.fire += 0.1;
    }

    // Water patterns (emotional/intuitive)
    if (lowerInput.match(/feel|emotion|intuition|flow|sense|heart/)) {
      this.patterns.elementalTendencies.water += 0.1;
    }

    // Earth patterns (grounding/practical)
    if (lowerInput.match(/practical|real|concrete|stable|grounded|physical/)) {
      this.patterns.elementalTendencies.earth += 0.1;
    }

    // Aether patterns (integration/spiritual)
    if (lowerInput.match(/spiritual|soul|meaning|purpose|whole|integrate|unified/)) {
      this.patterns.elementalTendencies.aether += 0.1;
    }

    // Normalize to prevent runaway values
    this.normalizeElementalTendencies();

    // Detect elemental shifts
    this.detectElementalShift();
  }

  /**
   * Track developmental progress
   */
  private trackDevelopmentalProgress(input: string, context: any): void {
    const { stage, progression } = this.patterns.developmentalArc;

    // Look for breakthrough indicators
    if (input.match(/realize|understand now|see clearly|breakthrough|aha|it clicks/i)) {
      this.patterns.developmentalArc.breakthroughs.push({
        timestamp: new Date(),
        insight: input.substring(0, 100),
        catalyzedBy: this.currentMode
      });

      // Progress development
      this.patterns.developmentalArc.progression = Math.min(1, progression + 0.1);
    }

    // Update stage based on progression
    if (progression > 0.8 && stage !== 'integrating') {
      this.patterns.developmentalArc.stage = 'integrating';
    } else if (progression > 0.6 && stage === 'deepening') {
      this.patterns.developmentalArc.stage = 'transforming';
    } else if (progression > 0.4 && stage === 'discovering') {
      this.patterns.developmentalArc.stage = 'deepening';
    } else if (progression > 0.2 && stage === 'exploring') {
      this.patterns.developmentalArc.stage = 'discovering';
    }
  }

  /**
   * Track relationship dynamics
   */
  private trackRelationshipDynamics(input: string): void {
    // Trust indicators
    if (input.match(/trust you|feel safe|comfortable sharing|never told anyone/i)) {
      this.patterns.relationshipMemory.trustLevel = Math.min(1,
        this.patterns.relationshipMemory.trustLevel + 0.1
      );
    }

    // Vulnerability indicators
    if (input.match(/scared|vulnerable|hard to say|confession|secret/i)) {
      this.patterns.relationshipMemory.vulnerabilityShown = Math.min(1,
        this.patterns.relationshipMemory.vulnerabilityShown + 0.15
      );
    }

    // Seeking style
    if (input.includes('?') && input.match(/what should|how do I|what would you/i)) {
      this.patterns.relationshipMemory.seekingStyle = 'direct';
    } else if (input.match(/I wonder|maybe|perhaps|might/i)) {
      this.patterns.relationshipMemory.seekingStyle = 'exploratory';
    }

    // Response preference based on reactions
    if (input.match(/yes exactly|that's it|you're right/i)) {
      // Current approach working
    } else if (input.match(/too much|slow down|gentler/i)) {
      this.patterns.relationshipMemory.responsePreference = 'gentle';
    } else if (input.match(/tell me straight|be honest|don't sugarcoat/i)) {
      this.patterns.relationshipMemory.responsePreference = 'direct';
    }
  }

  /**
   * Track thematic patterns
   */
  private trackThematicPatterns(input: string): void {
    // Extract themes
    const themes = this.extractThemes(input);

    themes.forEach(theme => {
      if (this.patterns.recurringThemes.has(theme)) {
        const existing = this.patterns.recurringThemes.get(theme)!;
        existing.mentions++;
        existing.lastMentioned = new Date();

        // Update emotional charge
        const charge = this.detectEmotionalCharge(input);
        existing.emotionalCharge = (existing.emotionalCharge + charge) / 2;
      } else {
        this.patterns.recurringThemes.set(theme, {
          mentions: 1,
          lastMentioned: new Date(),
          emotionalCharge: this.detectEmotionalCharge(input),
          resolution: 'unresolved'
        });
      }
    });

    // Update resolution status for themes
    this.updateThemeResolution(input);
  }

  /**
   * Track process style preferences
   */
  private trackProcessStyle(input: string): void {
    // Structure preference
    if (input.match(/step by step|organize|structure|framework|systematic/i)) {
      this.patterns.processStyle.prefersStructure = true;
    }

    // Ambiguity tolerance
    if (input.match(/not sure|maybe|it depends|could be|unclear/i)) {
      this.patterns.processStyle.toleratesAmbiguity = true;
    } else if (input.match(/need to know|must understand|have to be clear/i)) {
      this.patterns.processStyle.toleratesAmbiguity = false;
    }

    // Closure needs
    if (input.match(/need answer|want resolution|have to decide|conclude/i)) {
      this.patterns.processStyle.needsClosure = true;
    }

    // Exploration depth
    const depthIndicators = input.match(/why|deeper|underneath|really mean|essence/gi);
    if (depthIndicators && depthIndicators.length > 2) {
      this.patterns.processStyle.explorationDepth = 'deep';
    } else if (depthIndicators && depthIndicators.length > 0) {
      this.patterns.processStyle.explorationDepth = 'moderate';
    }
  }

  /**
   * Detect stuck points
   */
  private detectStuckPoints(input: string): void {
    const stuckIndicators = [
      'keep coming back',
      'always the same',
      'never changes',
      'stuck on',
      'can\'t get past',
      'loop',
      'circle'
    ];

    stuckIndicators.forEach(indicator => {
      if (input.toLowerCase().includes(indicator)) {
        // Extract the pattern
        const pattern = this.extractStuckPattern(input, indicator);

        // Track it
        const existing = this.patterns.developmentalArc.stuckPoints.find(
          sp => sp.pattern === pattern
        );

        if (existing) {
          existing.occurrences++;
          existing.lastSeen = new Date();
        } else {
          this.patterns.developmentalArc.stuckPoints.push({
            pattern,
            occurrences: 1,
            lastSeen: new Date()
          });
        }
      }
    });
  }

  /**
   * Detect engagement signals
   */
  private detectEngagementSignals(input: string, presence: any): any {
    const lowerInput = input.toLowerCase();

    return {
      explicitAdviceRequest: lowerInput.match(/what should i|what would you do|advice|help me|tell me what/i),
      complexityOverwhelm: lowerInput.match(/so much|overwhelming|complicated|confused|lost in/i),
      depthReadiness: presence.depth > 0.7 && lowerInput.match(/deeper|really|truth|essence/i),
      practicalNeed: lowerInput.match(/how to|steps|practical|concrete|specific/i),
      emotionalSupport: lowerInput.match(/comfort|support|hard|struggling|pain/i)
    };
  }

  /**
   * Determine if pattern reflection would help
   */
  private shouldReflectPatterns(input: string): boolean {
    // Check for recurring stuck points
    const significantStuckPoints = this.patterns.developmentalArc.stuckPoints.filter(
      sp => sp.occurrences > 2
    );

    if (significantStuckPoints.length > 0) {
      return true;
    }

    // Check for unresolved recurring themes
    const unresolvedThemes = Array.from(this.patterns.recurringThemes.values()).filter(
      theme => theme.mentions > 3 && theme.resolution === 'unresolved'
    );

    if (unresolvedThemes.length > 0) {
      return true;
    }

    // Check for pattern blindness signals
    if (input.match(/don't understand why|keeps happening|pattern|always|never/i)) {
      return true;
    }

    return false;
  }

  /**
   * Detect if user is stuck
   */
  private detectStuckness(input: string): boolean {
    const stuckSignals = [
      this.patterns.developmentalArc.stuckPoints.some(sp => sp.occurrences > 3),
      input.match(/same thing|going in circles|stuck|can't move/i),
      this.patterns.developmentalArc.progression < 0.3 && this.modeHistory.length > 10
    ];

    return stuckSignals.filter(Boolean).length >= 2;
  }

  /**
   * Helper methods
   */

  private initializePatterns(): TrackedPatterns {
    return {
      elementalTendencies: {
        air: 0.2,
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        aether: 0.2
      },
      elementalShifts: [],
      developmentalArc: {
        stage: 'exploring',
        progression: 0,
        breakthroughs: [],
        stuckPoints: []
      },
      relationshipMemory: {
        trustLevel: 0,
        vulnerabilityShown: 0,
        seekingStyle: 'exploratory',
        responsePreference: 'gentle',
        growthEdges: []
      },
      recurringThemes: new Map(),
      processStyle: {
        prefersStructure: false,
        toleratesAmbiguity: true,
        needsClosure: false,
        explorationDepth: 'moderate'
      }
    };
  }

  private normalizeElementalTendencies(): void {
    const total = Object.values(this.patterns.elementalTendencies).reduce((a, b) => a + b, 0);
    if (total > 1) {
      Object.keys(this.patterns.elementalTendencies).forEach(key => {
        this.patterns.elementalTendencies[key as keyof typeof this.patterns.elementalTendencies] /= total;
      });
    }
  }

  private detectElementalShift(): void {
    const current = this.getCurrentDominantElement();
    if (current !== this.patterns.dominantElement && this.patterns.dominantElement) {
      this.patterns.elementalShifts.push({
        from: this.patterns.dominantElement,
        to: current,
        timestamp: new Date(),
        context: this.currentMode
      });
    }
    this.patterns.dominantElement = current;
  }

  private getCurrentDominantElement(): string {
    const elements = this.patterns.elementalTendencies;
    return Object.keys(elements).reduce((a, b) =>
      elements[a as keyof typeof elements] > elements[b as keyof typeof elements] ? a : b
    );
  }

  private extractThemes(input: string): string[] {
    const themes: string[] = [];
    const themePatterns = {
      'relationship': /relationship|partner|friend|family|love/i,
      'work': /work|job|career|boss|colleague/i,
      'identity': /who i am|myself|identity|authentic|real me/i,
      'purpose': /purpose|meaning|why|calling|mission/i,
      'growth': /grow|change|develop|evolve|transform/i,
      'fear': /afraid|scared|fear|anxious|worry/i,
      'loss': /lost|grief|gone|miss|mourn/i
    };

    Object.entries(themePatterns).forEach(([theme, pattern]) => {
      if (pattern.test(input)) {
        themes.push(theme);
      }
    });

    return themes;
  }

  private detectEmotionalCharge(input: string): number {
    let charge = 0;

    // Positive indicators
    if (input.match(/love|joy|happy|grateful|excited|peace/i)) {
      charge += 0.3;
    }

    // Negative indicators
    if (input.match(/hate|angry|sad|frustrated|hurt|pain/i)) {
      charge -= 0.3;
    }

    // Intensity modifiers
    if (input.match(/very|extremely|so|really|deeply/i)) {
      charge *= 1.5;
    }

    return Math.max(-1, Math.min(1, charge));
  }

  private updateThemeResolution(input: string): void {
    if (input.match(/resolved|understood|accepted|integrated|peace with/i)) {
      // Look for themes that might be resolving
      this.patterns.recurringThemes.forEach((theme, key) => {
        if (input.toLowerCase().includes(key)) {
          theme.resolution = 'integrated';
        }
      });
    }
  }

  private extractStuckPattern(input: string, indicator: string): string {
    const index = input.toLowerCase().indexOf(indicator);
    const context = input.substring(Math.max(0, index - 20), Math.min(input.length, index + 50));
    return context.trim();
  }

  private analyzeConversationalContext(history: string[]): any {
    return {
      recentLength: history.join(' ').length,
      questionCount: history.filter(h => h.includes('?')).length,
      emotionalIntensity: history.map(h => this.detectEmotionalCharge(h)).reduce((a, b) => a + b, 0) / history.length
    };
  }

  /**
   * Switch to a new engagement mode
   */
  switchMode(newMode: EngagementMode, trigger: string): void {
    this.modeHistory.push({
      mode: this.currentMode,
      timestamp: new Date(),
      trigger
    });
    this.currentMode = newMode;
  }

  /**
   * Get current tracking analytics
   */
  getAnalytics(): any {
    return {
      currentMode: this.currentMode,
      patterns: {
        dominantElement: this.patterns.dominantElement,
        developmentalStage: this.patterns.developmentalArc.stage,
        trustLevel: this.patterns.relationshipMemory.trustLevel,
        topThemes: Array.from(this.patterns.recurringThemes.entries())
          .sort((a, b) => b[1].mentions - a[1].mentions)
          .slice(0, 3)
          .map(([theme, data]) => ({ theme, mentions: data.mentions })),
        stuckPoints: this.patterns.developmentalArc.stuckPoints.length,
        breakthroughs: this.patterns.developmentalArc.breakthroughs.length
      },
      modeHistory: this.modeHistory.slice(-5)
    };
  }
}

// Lazy-loading singleton pattern
let _engagementSystem: IntelligentEngagementSystem | null = null;

export const getEngagementSystem = (): IntelligentEngagementSystem => {
  if (!_engagementSystem) {
    _engagementSystem = new IntelligentEngagementSystem();
  }
  return _engagementSystem;
};