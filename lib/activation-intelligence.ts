// Activation Intelligence - Smart Feature Triggering
// Ensures features enhance rather than disrupt conversation flow

interface ConversationSignals {
  // Explicit signals (clear user intent)
  explicitDepthRequest: boolean;        // "help me understand this deeper"
  clarificationNeeded: boolean;         // "I'm not sure what you mean"
  contemplativeRequest: boolean;        // "let me think about this"

  // Implicit signals (detected patterns)
  emotionalIntensity: number;           // 0-1 from language analysis
  conceptualComplexity: number;         // 0-1 from topic depth
  userEnergyLevel: number;              // 0-1 from pace/engagement
  conversationalPace: 'rushed' | 'natural' | 'contemplative';

  // Historical context
  userFamiliarity: 'new' | 'returning' | 'experienced';
  previousFeatureEngagement: string[]; // Which features worked well before
  sessionDepth: number;                // How deep this conversation has gone
}

export interface ActivationDecision {
  feature: string;
  confidence: number;               // 0-1 how sure we are this helps
  rationale: string;               // Why this feature was activated
  userVisible: boolean;            // Should user see this feature activating?
  gracefulEntry: boolean;          // Smooth transition vs obvious change
  overridesPrevious?: boolean;     // For crisis detection
  gracefulAbandonment?: boolean;   // For mid-process cancellation
  abandonmentReason?: string;      // Why feature was abandoned
  adjustmentReason?: string;       // For conflict resolution
}

interface UserFeatureProfile {
  preferredFeatures: string[];
  featureSuccessRates: Map<string, number>;
  optimalActivationThresholds: Map<string, number>;
  conversationStyle: 'direct' | 'exploratory' | 'contemplative' | 'playful';
  deepProcessingTolerance: number; // 0-1 how much complexity they handle well
}

export class ActivationIntelligence {
  private userProfiles = new Map<string, UserFeatureProfile>();

  // SMART ACTIVATION LOGIC
  analyzeActivationNeed(
    userId: string,
    input: string,
    conversationHistory: any[],
    currentResponse: string
  ): ActivationDecision[] {

    const signals = this.detectConversationSignals(input, conversationHistory);
    const userProfile = this.getUserProfile(userId);
    const decisions: ActivationDecision[] = [];

    // === LOOPING PROTOCOL ACTIVATION ===
    const loopingNeed = this.assessLoopingNeed(signals, userProfile);
    if (loopingNeed.confidence > 0.7) {
      decisions.push({
        feature: 'looping_protocol',
        confidence: loopingNeed.confidence,
        rationale: loopingNeed.reason,
        userVisible: loopingNeed.confidence > 0.85, // Only show if very confident
        gracefulEntry: true
      });
    }

    // === CONTEMPLATIVE SPACE ACTIVATION ===
    const contemplativeNeed = this.assessContemplativeNeed(signals, userProfile);
    if (contemplativeNeed.confidence > 0.6) {
      decisions.push({
        feature: 'contemplative_space',
        confidence: contemplativeNeed.confidence,
        rationale: contemplativeNeed.reason,
        userVisible: false, // Always invisible - just adds pauses
        gracefulEntry: true
      });
    }

    // === ELEMENTAL ATTUNEMENT (Always Active but Variable Intensity) ===
    decisions.push({
      feature: 'elemental_attunement',
      confidence: 1.0, // Always active
      rationale: 'Universal energy resonance matching',
      userVisible: false,
      gracefulEntry: true
    });

    return decisions;
  }

  private assessLoopingNeed(signals: ConversationSignals, profile: UserFeatureProfile): {
    confidence: number;
    reason: string;
  } {
    let confidence = 0;
    let reasons: string[] = [];

    // Explicit requests (high confidence)
    if (signals.explicitDepthRequest) {
      confidence += 0.4;
      reasons.push('explicit depth request');
    }

    if (signals.clarificationNeeded) {
      confidence += 0.35;
      reasons.push('clarification explicitly needed');
    }

    // Implicit signals (lower confidence, require multiple factors)
    if (signals.emotionalIntensity > 0.7 && signals.conceptualComplexity > 0.6) {
      confidence += 0.25;
      reasons.push('high emotional intensity + complex topic');
    }

    // User profile modifiers
    if (profile.conversationStyle === 'contemplative') {
      confidence += 0.1;
      reasons.push('user prefers contemplative style');
    } else if (profile.conversationStyle === 'direct') {
      confidence -= 0.15; // Direct users may find looping annoying
      reasons.push('adjusted down for direct communication style');
    }

    // Historical success modifier
    const loopingSuccess = profile.featureSuccessRates.get('looping_protocol') || 0.5;
    confidence = confidence * (0.5 + loopingSuccess * 0.5);

    return {
      confidence: Math.max(0, Math.min(1, confidence)),
      reason: reasons.join(', ')
    };
  }

  private assessContemplativeNeed(signals: ConversationSignals, profile: UserFeatureProfile): {
    confidence: number;
    reason: string;
  } {
    let confidence = 0;
    let reasons: string[] = [];

    // Natural pacing indicators
    if (signals.conversationalPace === 'contemplative') {
      confidence += 0.4;
      reasons.push('user setting contemplative pace');
    }

    if (signals.emotionalIntensity > 0.6) {
      confidence += 0.2;
      reasons.push('emotional processing benefits from pauses');
    }

    if (signals.conceptualComplexity > 0.7) {
      confidence += 0.25;
      reasons.push('complex concepts need processing time');
    }

    // Explicit requests
    if (signals.contemplativeRequest) {
      confidence += 0.5;
      reasons.push('explicit request for reflection time');
    }

    // User tolerance check
    if (profile.deepProcessingTolerance < 0.4) {
      confidence *= 0.6; // Reduce if user prefers faster interactions
      reasons.push('adjusted for user processing preferences');
    }

    return {
      confidence: Math.max(0, Math.min(1, confidence)),
      reason: reasons.join(', ')
    };
  }

  private detectConversationSignals(input: string, history: any[]): ConversationSignals {
    const lower = input.toLowerCase();

    return {
      explicitDepthRequest: [
        'help me understand', 'go deeper', 'what does this really mean',
        'why do I', 'explore this more', 'dive deeper'
      ].some(phrase => lower.includes(phrase)),

      clarificationNeeded: [
        'not sure what you mean', 'can you clarify', 'confused about',
        'don\'t understand', 'what do you mean by', 'unclear'
      ].some(phrase => lower.includes(phrase)),

      contemplativeRequest: [
        'let me think', 'need time to process', 'want to reflect',
        'pause for a moment', 'sit with this', 'take this in'
      ].some(phrase => lower.includes(phrase)),

      emotionalIntensity: this.calculateEmotionalIntensity(input),
      conceptualComplexity: this.calculateConceptualComplexity(input),
      userEnergyLevel: this.calculateUserEnergy(input),
      conversationalPace: this.detectConversationalPace(input, history),

      userFamiliarity: history.length > 20 ? 'experienced' :
                      history.length > 5 ? 'returning' : 'new',
      previousFeatureEngagement: [], // Would track from user profile
      sessionDepth: Math.min(1, history.length / 10) // Gets deeper with longer sessions
    };
  }

  // === USER PROFILE LEARNING ===
  updateUserProfile(
    userId: string,
    activatedFeatures: string[],
    userSatisfaction: number, // 0-1 derived from conversation flow
    conversationOutcome: 'helpful' | 'confusing' | 'neutral'
  ): void {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = this.createNewUserProfile();
      this.userProfiles.set(userId, profile);
    }

    // Update feature success rates
    activatedFeatures.forEach(feature => {
      const currentRate = profile!.featureSuccessRates.get(feature) || 0.5;
      const adjustment = conversationOutcome === 'helpful' ? 0.1 :
                        conversationOutcome === 'confusing' ? -0.15 : 0;

      const newRate = Math.max(0.1, Math.min(0.9, currentRate + adjustment));
      profile!.featureSuccessRates.set(feature, newRate);
    });

    // Adjust activation thresholds based on user response
    if (conversationOutcome === 'confusing' && activatedFeatures.length > 2) {
      // User was overwhelmed - raise thresholds
      activatedFeatures.forEach(feature => {
        const currentThreshold = profile!.optimalActivationThresholds.get(feature) || 0.7;
        profile!.optimalActivationThresholds.set(feature, Math.min(0.9, currentThreshold + 0.05));
      });
    } else if (conversationOutcome === 'helpful' && activatedFeatures.length === 0) {
      // User would have benefited from more features - lower thresholds
      ['looping_protocol', 'contemplative_space'].forEach(feature => {
        const currentThreshold = profile!.optimalActivationThresholds.get(feature) || 0.7;
        profile!.optimalActivationThresholds.set(feature, Math.max(0.5, currentThreshold - 0.05));
      });
    }
  }

  private createNewUserProfile(): UserFeatureProfile {
    return {
      preferredFeatures: [],
      featureSuccessRates: new Map([
        ['looping_protocol', 0.6],
        ['contemplative_space', 0.7],
        ['elemental_attunement', 0.8],
        ['consciousness_profiling', 0.6]
      ]),
      optimalActivationThresholds: new Map([
        ['looping_protocol', 0.75],
        ['contemplative_space', 0.65],
        ['consciousness_profiling', 0.7]
      ]),
      conversationStyle: 'exploratory', // Default
      deepProcessingTolerance: 0.6 // Default moderate
    };
  }

  // === UTILITY METHODS ===
  private calculateEmotionalIntensity(input: string): number {
    const intensityMarkers = ['overwhelmed', 'intense', 'deeply', 'powerful', 'extreme',
                             'incredible', 'amazing', 'terrible', 'devastating'];
    const matches = intensityMarkers.filter(marker =>
      input.toLowerCase().includes(marker)).length;
    return Math.min(1, matches / 3);
  }

  private calculateConceptualComplexity(input: string): number {
    const complexityMarkers = ['meaning', 'purpose', 'understand', 'philosophy',
                              'consciousness', 'spiritual', 'metaphysical', 'paradox'];
    const matches = complexityMarkers.filter(marker =>
      input.toLowerCase().includes(marker)).length;
    return Math.min(1, matches / 3);
  }

  private calculateUserEnergy(input: string): number {
    const highEnergyMarkers = ['!', 'excited', 'amazing', 'incredible'];
    const lowEnergyMarkers = ['tired', 'exhausted', '...', 'whatever'];

    const highCount = highEnergyMarkers.filter(marker =>
      input.toLowerCase().includes(marker)).length;
    const lowCount = lowEnergyMarkers.filter(marker =>
      input.toLowerCase().includes(marker)).length;

    return Math.max(0.1, Math.min(0.9, 0.5 + (highCount * 0.2) - (lowCount * 0.2)));
  }

  private detectConversationalPace(input: string, history: any[]): 'rushed' | 'natural' | 'contemplative' {
    const wordCount = input.split(' ').length;
    const avgLength = history.length > 0 ?
      history.slice(-3).reduce((sum, msg) => sum + msg.content.split(' ').length, 0) / 3 : 20;

    if (wordCount < avgLength * 0.5) return 'rushed';
    if (wordCount > avgLength * 2) return 'contemplative';
    return 'natural';
  }

  getUserProfile(userId: string): UserFeatureProfile {
    return this.userProfiles.get(userId) || this.createNewUserProfile();
  }

  // === FEATURE DISCOVERY ASSISTANCE ===
  suggestFeatureDiscovery(userId: string, unusedBeneficialFeatures: string[]): string[] {
    const profile = this.getUserProfile(userId);
    const suggestions: string[] = [];

    // Gentle introductions to beneficial features
    if (unusedBeneficialFeatures.includes('contemplative_space') &&
        profile.deepProcessingTolerance > 0.6) {
      suggestions.push('Would you like me to add some gentle pauses for reflection?');
    }

    if (unusedBeneficialFeatures.includes('looping_protocol') &&
        profile.conversationStyle === 'exploratory') {
      suggestions.push('I can help clarify the deeper meaning if you\'d like to explore this further.');
    }

    return suggestions;
  }
}

let _activationIntelligence: ActivationIntelligence | null = null;
export const getActivationIntelligence = (): ActivationIntelligence => {
  if (!_activationIntelligence) {
    _activationIntelligence = new ActivationIntelligence();
  }
  return _activationIntelligence;
};