// UX Consistency Manager - Smooth Transitions & Predictable Experience
// Ensures features feel natural rather than arbitrary

interface ProcessingIndicator {
  show: boolean;
  message: string;
  estimatedTime: number; // seconds
  type: 'thinking' | 'processing' | 'reflecting' | 'connecting';
}

interface TransitionGuide {
  fromState: 'instant' | 'processing' | 'deep_processing';
  toState: 'instant' | 'processing' | 'deep_processing';
  transitionMessage?: string;
  showProgressIndicator: boolean;
  gracefulDelay: number; // ms to make transition feel natural
}

interface UserExpectation {
  typicalResponseTime: number;    // What they're used to
  lastResponseTime: number;       // Previous response time
  processingToleranceLevel: number; // 0-1 how much delay they accept
  preferredIndicatorStyle: 'minimal' | 'informative' | 'detailed';
}

export class UXConsistencyManager {
  private userExpectations = new Map<string, UserExpectation>();

  // === RESPONSE TIME PREDICTION & MANAGEMENT ===
  predictResponseTime(
    activatedFeatures: string[],
    inputComplexity: number,
    userHistory: any[]
  ): {
    estimated: number;
    confidence: number;
    showIndicator: boolean;
    indicatorMessage: string;
  } {

    let baseTime = 800; // Base elegant oracle time
    let featureTime = 0;

    // Calculate additional time for features
    const featureTimes = {
      'looping_protocol': 1200,        // Additional 1.2s
      'contemplative_space': 400,      // Additional 0.4s
      'consciousness_profiling': 600,   // Additional 0.6s
      'morphic_resonance': 300,        // Additional 0.3s
      'neurodivergent_support': 200    // Additional 0.2s
    };

    activatedFeatures.forEach(feature => {
      featureTime += featureTimes[feature] || 0;
    });

    // Complexity modifier
    const complexityMultiplier = 1 + (inputComplexity * 0.5);
    const estimatedTime = (baseTime + featureTime) * complexityMultiplier;

    // Determine if indicator is needed
    const showIndicator = estimatedTime > 1500; // Show for >1.5s
    const confidence = activatedFeatures.length > 0 ? 0.85 : 0.95;

    return {
      estimated: estimatedTime,
      confidence,
      showIndicator,
      indicatorMessage: this.generateProcessingMessage(activatedFeatures, estimatedTime)
    };
  }

  private generateProcessingMessage(features: string[], estimatedTime: number): string {
    const timeRange = estimatedTime < 2000 ? 'a moment' :
                     estimatedTime < 4000 ? 'a few moments' : 'a bit longer';

    if (features.includes('looping_protocol')) {
      return `Taking ${timeRange} to really understand what you're sharing...`;
    }

    if (features.includes('contemplative_space')) {
      return `Creating space for reflection, just ${timeRange}...`;
    }

    if (features.includes('consciousness_profiling')) {
      return `Attuning to your energy, ${timeRange} please...`;
    }

    if (features.length > 2) {
      return `Drawing on deeper wisdom, ${timeRange}...`;
    }

    return `Thoughtfully considering, ${timeRange}...`;
  }

  // === GRACEFUL FEATURE TRANSITIONS ===
  planFeatureTransition(
    previousFeatures: string[],
    currentFeatures: string[],
    userId: string
  ): TransitionGuide {

    const expectation = this.getUserExpectation(userId);
    const featureChange = this.analyzeFeatureChange(previousFeatures, currentFeatures);

    if (featureChange === 'major_increase') {
      // Going from simple to complex - prepare user
      return {
        fromState: 'instant',
        toState: 'deep_processing',
        transitionMessage: "I sense this calls for deeper exploration...",
        showProgressIndicator: true,
        gracefulDelay: 500 // Half second to set expectation
      };
    }

    if (featureChange === 'major_decrease') {
      // Going from complex to simple - signal efficiency
      return {
        fromState: 'deep_processing',
        toState: 'instant',
        transitionMessage: undefined, // Just be fast
        showProgressIndicator: false,
        gracefulDelay: 0
      };
    }

    // Gradual change - smooth transition
    return {
      fromState: 'processing',
      toState: 'processing',
      transitionMessage: undefined,
      showProgressIndicator: false,
      gracefulDelay: 200 // Small delay for naturalness
    };
  }

  private analyzeFeatureChange(previous: string[], current: string[]):
    'major_increase' | 'major_decrease' | 'gradual' | 'stable' {

    const previousComplexity = this.calculateFeatureComplexity(previous);
    const currentComplexity = this.calculateFeatureComplexity(current);
    const change = currentComplexity - previousComplexity;

    if (change > 2) return 'major_increase';
    if (change < -2) return 'major_decrease';
    if (Math.abs(change) > 0.5) return 'gradual';
    return 'stable';
  }

  private calculateFeatureComplexity(features: string[]): number {
    const complexityWeights = {
      'elemental_attunement': 0.5,      // Always active, low complexity
      'contemplative_space': 1.0,       // Adds pauses, moderate
      'consciousness_profiling': 1.5,   // Background analysis, moderate
      'looping_protocol': 3.0,          // Interactive, high complexity
      'morphic_resonance': 2.0,         // Cross-user analysis, high
      'neurodivergent_support': 2.5     // Adaptive processing, high
    };

    return features.reduce((sum, feature) =>
      sum + (complexityWeights[feature] || 0), 0);
  }

  // === CONSISTENCY ENFORCEMENT ===
  ensureConsistency(
    userId: string,
    currentActivation: string[],
    conversationContext: any
  ): {
    adjustedFeatures: string[];
    consistencyReason: string;
  } {

    const expectation = this.getUserExpectation(userId);
    const sessionFeatureHistory = this.getSessionFeatureHistory(userId);

    // Prevent jarring inconsistencies
    if (this.wouldCreateJarringChange(sessionFeatureHistory, currentActivation)) {
      // Smooth out the change
      const smoothed = this.smoothFeatureTransition(sessionFeatureHistory, currentActivation);
      return {
        adjustedFeatures: smoothed,
        consistencyReason: 'Smoothed feature transition for natural flow'
      };
    }

    // Check for user fatigue with complex features
    if (this.detectProcessingFatigue(userId, currentActivation)) {
      // Scale back complexity
      const simplified = currentActivation.filter(f =>
        !['looping_protocol', 'consciousness_profiling'].includes(f));
      return {
        adjustedFeatures: simplified,
        consistencyReason: 'Reduced complexity to prevent user fatigue'
      };
    }

    return {
      adjustedFeatures: currentActivation,
      consistencyReason: 'No consistency adjustments needed'
    };
  }

  private wouldCreateJarringChange(history: string[][], current: string[]): boolean {
    if (history.length < 2) return false;

    const recentAverage = this.calculateAverageComplexity(history.slice(-3));
    const currentComplexity = this.calculateFeatureComplexity(current);

    // Jarring if complexity changes by more than 50% suddenly
    return Math.abs(currentComplexity - recentAverage) > recentAverage * 0.5;
  }

  private calculateAverageComplexity(featureHistory: string[][]): number {
    return featureHistory.reduce((sum, features) =>
      sum + this.calculateFeatureComplexity(features), 0) / featureHistory.length;
  }

  private smoothFeatureTransition(history: string[][], target: string[]): string[] {
    const recentFeatures = history.slice(-1)[0] || [];
    const targetComplexity = this.calculateFeatureComplexity(target);
    const currentComplexity = this.calculateFeatureComplexity(recentFeatures);

    if (targetComplexity > currentComplexity * 1.5) {
      // Add features gradually
      const sortedByComplexity = target.sort((a, b) =>
        (this.calculateFeatureComplexity([a]) - this.calculateFeatureComplexity([b])));

      // Add only the least complex new features
      return [...recentFeatures, ...sortedByComplexity.slice(0, 1)];
    }

    return target; // Use as-is if not too jarring
  }

  private detectProcessingFatigue(userId: string, features: string[]): boolean {
    const sessionHistory = this.getSessionFeatureHistory(userId);

    // User fatigue if they've had complex processing for 3+ exchanges
    const recentComplexity = sessionHistory.slice(-3).map(f =>
      this.calculateFeatureComplexity(f));

    const highComplexityCount = recentComplexity.filter(c => c > 2.5).length;
    return highComplexityCount >= 3 && this.calculateFeatureComplexity(features) > 2.5;
  }

  // === FEATURE DISCOVERY ASSISTANCE ===
  generateDiscoveryPrompts(
    userId: string,
    availableFeatures: string[],
    currentConversation: any
  ): {
    showDiscovery: boolean;
    discoveryMessage: string;
    featuresIntroduced: string[];
  } {

    const expectation = this.getUserExpectation(userId);
    const unusedFeatures = this.getUnusedBeneficialFeatures(userId, availableFeatures);

    if (unusedFeatures.length === 0 || expectation.processingToleranceLevel < 0.4) {
      return {
        showDiscovery: false,
        discoveryMessage: '',
        featuresIntroduced: []
      };
    }

    // Gentle introduction to one feature at a time
    const nextFeature = unusedFeatures[0];
    const discoveryMessages = {
      'contemplative_space': "Would gentle pauses for reflection help you process this?",
      'looping_protocol': "I can help clarify the deeper meaning if you'd like to explore further.",
      'consciousness_profiling': "I'm noticing themes in our conversation - shall I share what I'm sensing?",
      'morphic_resonance': "Others have explored similar questions - would collective insights help?"
    };

    return {
      showDiscovery: true,
      discoveryMessage: discoveryMessages[nextFeature] || "I have tools that might help if you're interested.",
      featuresIntroduced: [nextFeature]
    };
  }

  // === USER EXPECTATION MANAGEMENT ===
  updateExpectation(
    userId: string,
    actualResponseTime: number,
    userSatisfaction: number,
    featuresUsed: string[]
  ): void {
    let expectation = this.userExpectations.get(userId);

    if (!expectation) {
      expectation = {
        typicalResponseTime: actualResponseTime,
        lastResponseTime: actualResponseTime,
        processingToleranceLevel: 0.6,
        preferredIndicatorStyle: 'informative'
      };
      this.userExpectations.set(userId, expectation);
      return;
    }

    // Adjust typical response time (weighted average)
    expectation.typicalResponseTime =
      (expectation.typicalResponseTime * 0.8) + (actualResponseTime * 0.2);

    // Adjust tolerance based on satisfaction
    if (userSatisfaction > 0.8 && actualResponseTime > 2000) {
      expectation.processingToleranceLevel = Math.min(0.9, expectation.processingToleranceLevel + 0.05);
    } else if (userSatisfaction < 0.6 && actualResponseTime > 1500) {
      expectation.processingToleranceLevel = Math.max(0.3, expectation.processingToleranceLevel - 0.1);
    }

    expectation.lastResponseTime = actualResponseTime;
  }

  private getUserExpectation(userId: string): UserExpectation {
    return this.userExpectations.get(userId) || {
      typicalResponseTime: 1000,
      lastResponseTime: 1000,
      processingToleranceLevel: 0.6,
      preferredIndicatorStyle: 'informative'
    };
  }

  private getSessionFeatureHistory(userId: string): string[][] {
    // Would store session feature history - simplified for now
    return [];
  }

  private getUnusedBeneficialFeatures(userId: string, available: string[]): string[] {
    // Would analyze which features user hasn't tried but might benefit from
    return available.filter(f => ['contemplative_space', 'looping_protocol'].includes(f));
  }

  // === PUBLIC API FOR COMPONENTS ===
  shouldShowProcessingIndicator(estimatedTime: number, userId: string): ProcessingIndicator {
    const expectation = this.getUserExpectation(userId);

    if (estimatedTime < 1200) {
      return { show: false, message: '', estimatedTime: 0, type: 'thinking' };
    }

    const message = estimatedTime < 2500 ?
      "Thoughtfully considering..." :
      estimatedTime < 4000 ?
      "Drawing on deeper wisdom..." :
      "Connecting with profound insights...";

    return {
      show: true,
      message,
      estimatedTime: Math.round(estimatedTime / 1000),
      type: estimatedTime < 2500 ? 'thinking' :
            estimatedTime < 4000 ? 'processing' : 'connecting'
    };
  }
}

let _uxConsistencyManager: UXConsistencyManager | null = null;
export const getUxConsistencyManager = (): UXConsistencyManager => {
  if (!_uxConsistencyManager) {
    _uxConsistencyManager = new UXConsistencyManager();
  }
  return _uxConsistencyManager;
};