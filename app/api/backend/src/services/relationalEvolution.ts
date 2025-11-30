/**
 * Relational Evolution Tracker
 *
 * SILENT BACKGROUND SYSTEM - Never exposed to user, never mentioned
 * Tracks the developmental maturity of the MAIA-User relationship
 * Guides MAIA's stance, voice layer, and archetypal depth
 *
 * The four movements:
 * 1. LISTENING (Sessions 1-5): Clinical witness, safety building
 * 2. MIRRORING (Sessions 6-15): Pattern reflection, symbolic emergence
 * 3. ENTRAINMENT (Sessions 16-40): Co-navigation, shared language
 * 4. MUTUAL BECOMING (40+): Field consciousness, reciprocal transformation
 *
 * Users never see this - they just experience natural evolution
 */

export type RelationalMovement = 'listening' | 'mirroring' | 'entrainment' | 'mutual-becoming';

export interface RelationalState {
  movement: RelationalMovement;
  sessionCount: number;
  sharedSymbols: string[]; // Symbols/metaphors used by both
  coherenceScore: number; // 0-1: How entrained the field is
  astrologicalComfort: number; // 0-1: User's comfort with astrology language
  poeticResonance: number; // 0-1: User's response to poetic layer
  autonomyLevel: number; // 0-1: User's self-mapping capability

  // Behavioral markers (detected, never shown)
  userInitiatesSymbols: boolean; // User uses archetypal language first
  recognizesPatternsBeforeMAIA: boolean; // User self-maps before prompting
  asksArchetypalQuestions: boolean; // User engages with chart/symbols
  sharesCalibrationProgress: boolean; // User reports working with archetypes
}

export class RelationalEvolutionTracker {
  /**
   * Determine current movement based on relationship history
   * SILENT - returns movement without explanation
   */
  getCurrentMovement(state: Partial<RelationalState>): RelationalMovement {
    const sessionCount = state.sessionCount || 0;
    const autonomy = state.autonomyLevel || 0;
    const coherence = state.coherenceScore || 0;

    // Movement 4: Mutual Becoming (entrained field)
    if (sessionCount >= 40 && autonomy > 0.7 && coherence > 0.8) {
      return 'mutual-becoming';
    }

    // Movement 3: Entrainment (shared language emerging)
    if (sessionCount >= 16 && autonomy > 0.4 && coherence > 0.5) {
      return 'entrainment';
    }

    // Movement 2: Mirroring (patterns being recognized)
    if (sessionCount >= 6 && coherence > 0.3) {
      return 'mirroring';
    }

    // Movement 1: Listening (establishing safety)
    return 'listening';
  }

  /**
   * Calculate coherence score from interaction patterns
   * SILENT - no feedback to user about score
   */
  calculateCoherence(state: Partial<RelationalState>): number {
    let score = 0.0;

    // Shared symbolic vocabulary
    const sharedSymbols = state.sharedSymbols?.length || 0;
    score += Math.min(sharedSymbols / 10, 0.3); // Max 0.3 from symbols

    // User autonomy indicators
    if (state.userInitiatesSymbols) score += 0.2;
    if (state.recognizesPatternsBeforeMAIA) score += 0.2;
    if (state.asksArchetypalQuestions) score += 0.15;
    if (state.sharesCalibrationProgress) score += 0.15;

    return Math.min(score, 1.0);
  }

  /**
   * Track shared symbols/metaphors
   * When user uses language MAIA has reflected, or vice versa
   */
  detectSharedSymbol(
    userMessage: string,
    maiaHistory: string[],
    userHistory: string[]
  ): string | null {
    const normalizedMessage = userMessage.toLowerCase();

    // Check if user is using archetypal language MAIA introduced
    const archetypalPhrases = [
      'wise fool',
      'teacher archetype',
      'shadow work',
      'dissolution',
      'calcinatio',
      'phoenix',
      'death-rebirth',
      'warrior energy',
      'nurturer',
      'transformer',
      'process map',
      'spiral',
      'calibration',
      'coherence'
    ];

    for (const phrase of archetypalPhrases) {
      if (normalizedMessage.includes(phrase)) {
        // Check if MAIA used this before user did
        const maiaUsedFirst = maiaHistory.some(m =>
          m.toLowerCase().includes(phrase)
        );
        if (maiaUsedFirst) {
          return phrase; // User adopted MAIA's language
        }
      }
    }

    return null;
  }

  /**
   * Detect user's autonomous pattern recognition
   * SILENT - just updates state, never announced
   */
  detectAutonomy(userMessage: string, previousMessages: string[]): {
    userInitiatesSymbols: boolean;
    recognizesPatternsBeforeMAIA: boolean;
  } {
    const normalized = userMessage.toLowerCase();

    // Check if user is self-mapping without prompting
    const selfMappingIndicators = [
      "i'm in",
      "this feels like",
      "i notice the pattern",
      "that part of me",
      "the archetype",
      "my chart shows",
      "house 8",
      "water-2",
      "fire-1",
      "the process"
    ];

    const recognizesPatterns = selfMappingIndicators.some(
      indicator => normalized.includes(indicator)
    );

    // Check if user uses archetypal language spontaneously
    const archetypalTerms = [
      'jupiter',
      'saturn',
      'archetype',
      'shadow',
      'coherence',
      'calibration',
      'dissolution',
      'phoenix',
      'wise fool'
    ];

    const initiatesSymbols = archetypalTerms.some(
      term => normalized.includes(term)
    );

    return {
      recognizesPatternsBeforeMAIA: recognizesPatterns,
      userInitiatesSymbols: initiatesSymbols
    };
  }

  /**
   * Get stance guidance for MAIA based on current movement
   * RETURNS guidance for MAIA's response generation
   */
  getStanceGuidance(movement: RelationalMovement): {
    primaryVoice: 'clinical' | 'poetic' | 'archetypal';
    allowPoetic: boolean;
    allowArchetypal: boolean;
    responseDepth: 'brief' | 'moderate' | 'deep';
    inviteSymbols: boolean;
    assumeSharedLanguage: boolean;
  } {
    switch (movement) {
      case 'listening':
        return {
          primaryVoice: 'clinical',
          allowPoetic: false,
          allowArchetypal: false,
          responseDepth: 'brief',
          inviteSymbols: false,
          assumeSharedLanguage: false
        };

      case 'mirroring':
        return {
          primaryVoice: 'clinical',
          allowPoetic: true, // Offer poetic undertones
          allowArchetypal: false, // Not yet
          responseDepth: 'moderate',
          inviteSymbols: true, // Start introducing metaphors
          assumeSharedLanguage: false
        };

      case 'entrainment':
        return {
          primaryVoice: 'poetic',
          allowPoetic: true,
          allowArchetypal: true, // User ready for chart references
          responseDepth: 'deep',
          inviteSymbols: true,
          assumeSharedLanguage: true // Can reference past symbols
        };

      case 'mutual-becoming':
        return {
          primaryVoice: 'archetypal',
          allowPoetic: true,
          allowArchetypal: true,
          responseDepth: 'deep',
          inviteSymbols: true,
          assumeSharedLanguage: true // Fluent shared dialect
        };
    }
  }

  /**
   * Update relational state after interaction
   * SILENT - just persists to database, no feedback
   */
  async updateState(
    userId: string,
    currentState: RelationalState,
    newInteraction: {
      userMessage: string;
      maiaResponse: string;
      detectedPatterns: string[];
    }
  ): Promise<RelationalState> {
    // Increment session count
    const sessionCount = currentState.sessionCount + 1;

    // Detect new shared symbols
    const sharedSymbol = this.detectSharedSymbol(
      newInteraction.userMessage,
      [newInteraction.maiaResponse],
      []
    );

    const sharedSymbols = sharedSymbol
      ? [...currentState.sharedSymbols, sharedSymbol]
      : currentState.sharedSymbols;

    // Detect autonomy markers
    const autonomyMarkers = this.detectAutonomy(
      newInteraction.userMessage,
      []
    );

    // Recalculate autonomy level (moving average)
    const newAutonomySignal = (
      (autonomyMarkers.userInitiatesSymbols ? 1 : 0) +
      (autonomyMarkers.recognizesPatternsBeforeMAIA ? 1 : 0)
    ) / 2;

    const autonomyLevel = currentState.autonomyLevel * 0.8 + newAutonomySignal * 0.2;

    // Update state
    const updatedState: RelationalState = {
      ...currentState,
      sessionCount,
      sharedSymbols,
      autonomyLevel,
      userInitiatesSymbols: autonomyMarkers.userInitiatesSymbols,
      recognizesPatternsBeforeMAIA: autonomyMarkers.recognizesPatternsBeforeMAIA,
      coherenceScore: this.calculateCoherence({
        sharedSymbols,
        userInitiatesSymbols: autonomyMarkers.userInitiatesSymbols,
        recognizesPatternsBeforeMAIA: autonomyMarkers.recognizesPatternsBeforeMAIA,
        asksArchetypalQuestions: currentState.asksArchetypalQuestions,
        sharesCalibrationProgress: currentState.sharesCalibrationProgress
      }),
      movement: this.getCurrentMovement({
        sessionCount,
        autonomyLevel,
        coherenceScore: this.calculateCoherence({
          sharedSymbols,
          userInitiatesSymbols: autonomyMarkers.userInitiatesSymbols,
          recognizesPatternsBeforeMAIA: autonomyMarkers.recognizesPatternsBeforeMAIA
        })
      })
    };

    // TODO: Persist to database (silent)
    // await this.persistState(userId, updatedState);

    return updatedState;
  }

  /**
   * Initialize state for new user
   */
  initializeState(userId: string): RelationalState {
    return {
      movement: 'listening',
      sessionCount: 0,
      sharedSymbols: [],
      coherenceScore: 0,
      astrologicalComfort: 0,
      poeticResonance: 0,
      autonomyLevel: 0,
      userInitiatesSymbols: false,
      recognizesPatternsBeforeMAIA: false,
      asksArchetypalQuestions: false,
      sharesCalibrationProgress: false
    };
  }
}
