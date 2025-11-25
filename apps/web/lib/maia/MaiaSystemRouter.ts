/**
 * Maia System Router
 *
 * Intelligent routing between Field Mode (RFS + Spiralogic) and
 * Hybrid Mode (Sesame + Claude/GPT assistance)
 *
 * This parallel system approach:
 * - De-risks the field innovation (fallback always available)
 * - Enables user choice and gradual adoption
 * - Provides A/B comparison data
 * - Expands market appeal to both explorers and pragmatists
 */

export enum MaiaMode {
  FIELD = 'field',           // Pure RFS with Spiralogic orchestration
  HYBRID = 'hybrid',         // Traditional Sesame + Claude/GPT
  AUTO = 'auto',             // System intelligently chooses
  USER_CHOICE = 'user-choice' // User explicitly selects per message
}

export interface MaiaRoutingDecision {
  selectedMode: MaiaMode;
  reason: string;
  confidence: number;          // 0-1: How confident in this choice
  fallbackAvailable: boolean;
  metadata: {
    inputCharacteristics: InputAnalysis;
    userContext: UserContext;
    routingFactors: RoutingFactor[];
  };
}

export interface InputAnalysis {
  type: 'deep' | 'practical' | 'emotional' | 'crisis' | 'exploratory';
  complexity: number;          // 0-1
  emotionalIntensity: number;  // 0-1
  requiresReliableResponse: boolean;
  silenceAcceptable: boolean;
  characteristics: string[];
}

export interface UserContext {
  userId: string;
  sessionCount: number;
  fieldExperience: number;      // 0-1: Familiarity with field mode
  fieldSuccessRate: number;     // 0-1: Historical success
  preferredMode?: MaiaMode;
  lastModeUsed?: MaiaMode;
  currentStreak: number;        // Consecutive same-mode uses
}

export interface RoutingFactor {
  factor: string;
  weight: number;
  direction: 'field' | 'hybrid';
  reason: string;
}

export interface ModeMetrics {
  mode: MaiaMode;
  responseTime: number;
  userSatisfaction?: number;
  engagementDepth: number;
  silenceRate: number;
  fallbackTriggered: boolean;
  timestamp: number;
}

/**
 * Main router class coordinating between field and hybrid systems
 */
export class MaiaSystemRouter {
  private userContextCache: Map<string, UserContext> = new Map();
  private metricsHistory: ModeMetrics[] = [];

  constructor() {
    // Initialize with default settings
  }

  /**
   * Primary routing decision method
   * Determines which system to use based on input, user context, and preferences
   */
  async route(
    input: string,
    userId: string,
    userPreference?: MaiaMode,
    context?: any
  ): Promise<MaiaRoutingDecision> {

    // 1. Analyze input characteristics
    const inputAnalysis = this.analyzeInput(input);

    // 2. Get or build user context
    const userContext = await this.getUserContext(userId);

    // 3. Handle explicit user preference
    if (userPreference === MaiaMode.FIELD || userPreference === MaiaMode.HYBRID) {
      return {
        selectedMode: userPreference,
        reason: 'User explicit preference',
        confidence: 1.0,
        fallbackAvailable: true,
        metadata: {
          inputCharacteristics: inputAnalysis,
          userContext,
          routingFactors: [{
            factor: 'user_preference',
            weight: 1.0,
            direction: userPreference as 'field' | 'hybrid',
            reason: 'User explicitly selected mode'
          }]
        }
      };
    }

    // 4. Crisis detection - always route to hybrid (reliable response required)
    if (inputAnalysis.type === 'crisis') {
      return {
        selectedMode: MaiaMode.HYBRID,
        reason: 'Crisis detected - reliable response required',
        confidence: 1.0,
        fallbackAvailable: false, // No fallback in crisis
        metadata: {
          inputCharacteristics: inputAnalysis,
          userContext,
          routingFactors: [{
            factor: 'crisis_override',
            weight: 1.0,
            direction: 'hybrid',
            reason: 'Safety priority in crisis situations'
          }]
        }
      };
    }

    // 5. Intelligent auto-routing
    return this.intelligentRoute(inputAnalysis, userContext, context);
  }

  /**
   * Intelligent routing based on multiple factors
   */
  private intelligentRoute(
    inputAnalysis: InputAnalysis,
    userContext: UserContext,
    context?: any
  ): MaiaRoutingDecision {

    const factors: RoutingFactor[] = [];
    let fieldScore = 0.5; // Start neutral

    // FACTOR 1: Input Type
    if (inputAnalysis.type === 'deep' || inputAnalysis.type === 'exploratory') {
      fieldScore += 0.2;
      factors.push({
        factor: 'input_type',
        weight: 0.2,
        direction: 'field',
        reason: `${inputAnalysis.type} inquiry suits field dynamics`
      });
    } else if (inputAnalysis.type === 'practical') {
      fieldScore -= 0.2;
      factors.push({
        factor: 'input_type',
        weight: 0.2,
        direction: 'hybrid',
        reason: 'Practical question needs reliable answer'
      });
    }

    // FACTOR 2: Emotional Intensity
    if (inputAnalysis.emotionalIntensity > 0.7) {
      // High emotion - field system better at resonance
      fieldScore += 0.15;
      factors.push({
        factor: 'emotional_intensity',
        weight: 0.15,
        direction: 'field',
        reason: 'High emotional intensity benefits from field resonance'
      });
    }

    // FACTOR 3: User Experience with Field
    if (userContext.fieldExperience > 0.7) {
      // Experienced user comfortable with field
      fieldScore += 0.2;
      factors.push({
        factor: 'user_experience',
        weight: 0.2,
        direction: 'field',
        reason: 'User familiar and successful with field mode'
      });
    } else if (userContext.sessionCount < 3) {
      // New user - start with hybrid
      fieldScore -= 0.25;
      factors.push({
        factor: 'new_user',
        weight: 0.25,
        direction: 'hybrid',
        reason: 'New user needs reliable introduction'
      });
    }

    // FACTOR 4: Field Success Rate
    if (userContext.fieldSuccessRate > 0.75) {
      fieldScore += 0.15;
      factors.push({
        factor: 'success_rate',
        weight: 0.15,
        direction: 'field',
        reason: `User has ${(userContext.fieldSuccessRate * 100).toFixed(0)}% field success rate`
      });
    } else if (userContext.fieldSuccessRate < 0.4) {
      fieldScore -= 0.2;
      factors.push({
        factor: 'low_success',
        weight: 0.2,
        direction: 'hybrid',
        reason: 'Field mode not resonating well for this user'
      });
    }

    // FACTOR 5: Silence Acceptability
    if (inputAnalysis.silenceAcceptable) {
      fieldScore += 0.15;
      factors.push({
        factor: 'silence_ok',
        weight: 0.15,
        direction: 'field',
        reason: 'Context allows intentional silence'
      });
    } else if (inputAnalysis.requiresReliableResponse) {
      fieldScore -= 0.2;
      factors.push({
        factor: 'response_required',
        weight: 0.2,
        direction: 'hybrid',
        reason: 'Reliable response required'
      });
    }

    // FACTOR 6: Complexity
    if (inputAnalysis.complexity > 0.7) {
      // High complexity - field's multi-agent system shines
      fieldScore += 0.1;
      factors.push({
        factor: 'complexity',
        weight: 0.1,
        direction: 'field',
        reason: 'Complex query benefits from multi-agent perspectives'
      });
    }

    // FACTOR 7: Mode Streak (avoid getting stuck in one mode)
    if (userContext.currentStreak > 5) {
      const oppositeDirection = userContext.lastModeUsed === MaiaMode.FIELD ? 'hybrid' : 'field';
      const adjustment = userContext.lastModeUsed === MaiaMode.FIELD ? -0.1 : 0.1;
      fieldScore += adjustment;
      factors.push({
        factor: 'variety',
        weight: 0.1,
        direction: oppositeDirection,
        reason: 'Encourage mode variety after long streak'
      });
    }

    // Normalize score to 0-1 range
    fieldScore = Math.max(0, Math.min(1, fieldScore));

    // Make decision with confidence threshold
    const CONFIDENCE_THRESHOLD = 0.6;
    let selectedMode: MaiaMode;
    let reason: string;
    let confidence: number;

    if (fieldScore >= CONFIDENCE_THRESHOLD) {
      selectedMode = MaiaMode.FIELD;
      reason = `Field mode selected (score: ${fieldScore.toFixed(2)})`;
      confidence = fieldScore;
    } else if (fieldScore <= (1 - CONFIDENCE_THRESHOLD)) {
      selectedMode = MaiaMode.HYBRID;
      reason = `Hybrid mode selected (score: ${fieldScore.toFixed(2)})`;
      confidence = 1 - fieldScore;
    } else {
      // Low confidence - default to hybrid (safer)
      selectedMode = MaiaMode.HYBRID;
      reason = `Hybrid mode selected (uncertain, score: ${fieldScore.toFixed(2)})`;
      confidence = 0.5;
    }

    return {
      selectedMode,
      reason,
      confidence,
      fallbackAvailable: true,
      metadata: {
        inputCharacteristics: inputAnalysis,
        userContext,
        routingFactors: factors
      }
    };
  }

  /**
   * Analyze input to determine characteristics
   */
  private analyzeInput(input: string): InputAnalysis {
    const lower = input.toLowerCase();

    // Detect crisis
    const crisisWords = /suicide|kill myself|end it all|can't go on|want to die|self harm/i;
    if (crisisWords.test(input)) {
      return {
        type: 'crisis',
        complexity: 1.0,
        emotionalIntensity: 1.0,
        requiresReliableResponse: true,
        silenceAcceptable: false,
        characteristics: ['crisis', 'urgent', 'safety_priority']
      };
    }

    // Detect deep/philosophical questions
    const deepPatterns = /why|meaning|purpose|soul|spirit|consciousness|what do you think about|tell me about yourself/i;
    const isDeep = deepPatterns.test(input);

    // Detect practical questions
    const practicalPatterns = /how to|what is|explain|show me|help me with|tutorial|step by step/i;
    const isPractical = practicalPatterns.test(input);

    // Detect emotional content
    const emotionalWords = /feel|feeling|emotion|love|hate|fear|anxiety|depression|lonely|hurt|pain|joy|happy|sad/i;
    const emotionalIntensity = this.calculateEmotionalIntensity(input);
    const isEmotional = emotionalWords.test(input) || emotionalIntensity > 0.5;

    // Detect exploratory
    const exploratoryPatterns = /curious|wonder|explore|discover|what if|imagine/i;
    const isExploratory = exploratoryPatterns.test(input);

    // Determine primary type
    let type: InputAnalysis['type'];
    if (isDeep) type = 'deep';
    else if (isPractical) type = 'practical';
    else if (isEmotional) type = 'emotional';
    else if (isExploratory) type = 'exploratory';
    else type = 'practical'; // Default

    // Calculate complexity
    const complexity = this.calculateComplexity(input);

    // Determine if silence is acceptable
    const silenceAcceptable = (isDeep || isExploratory || isEmotional) && !isPractical;

    // Determine if reliable response required
    const requiresReliableResponse = isPractical || input.includes('?');

    const characteristics: string[] = [];
    if (isDeep) characteristics.push('deep');
    if (isPractical) characteristics.push('practical');
    if (isEmotional) characteristics.push('emotional');
    if (isExploratory) characteristics.push('exploratory');
    if (input.includes('?')) characteristics.push('question');

    return {
      type,
      complexity,
      emotionalIntensity,
      requiresReliableResponse,
      silenceAcceptable,
      characteristics
    };
  }

  /**
   * Calculate emotional intensity from text
   */
  private calculateEmotionalIntensity(input: string): number {
    let intensity = 0;

    // Exclamation marks
    const exclamations = (input.match(/!/g) || []).length;
    intensity += Math.min(0.3, exclamations * 0.1);

    // ALL CAPS words
    const capsWords = input.match(/\b[A-Z]{2,}\b/g) || [];
    intensity += Math.min(0.2, capsWords.length * 0.05);

    // Emotional keywords
    const strongEmotions = /rage|terror|devastated|ecstatic|anguish|bliss/i;
    if (strongEmotions.test(input)) intensity += 0.3;

    const moderateEmotions = /angry|sad|happy|worried|excited|frustrated/i;
    if (moderateEmotions.test(input)) intensity += 0.2;

    // Repetition (indicates emphasis)
    const repeated = /(.{3,})\1+/;
    if (repeated.test(input)) intensity += 0.1;

    return Math.min(1, intensity);
  }

  /**
   * Calculate input complexity
   */
  private calculateComplexity(input: string): number {
    let complexity = 0;

    // Length factor
    if (input.length > 200) complexity += 0.3;
    else if (input.length > 100) complexity += 0.2;
    else if (input.length > 50) complexity += 0.1;

    // Multiple sentences
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    complexity += Math.min(0.3, sentences.length * 0.05);

    // Multiple questions
    const questions = (input.match(/\?/g) || []).length;
    if (questions > 1) complexity += 0.2;

    // Abstract concepts
    const abstractWords = /concept|theory|philosophy|paradigm|framework|system|principle/i;
    if (abstractWords.test(input)) complexity += 0.2;

    return Math.min(1, complexity);
  }

  /**
   * Get or create user context
   */
  private async getUserContext(userId: string): Promise<UserContext> {
    // Check cache
    if (this.userContextCache.has(userId)) {
      return this.userContextCache.get(userId)!;
    }

    // Would normally fetch from database
    // For now, return default
    const context: UserContext = {
      userId,
      sessionCount: 0,
      fieldExperience: 0,
      fieldSuccessRate: 0.5,
      currentStreak: 0
    };

    this.userContextCache.set(userId, context);
    return context;
  }

  /**
   * Update user context after interaction
   */
  updateUserContext(
    userId: string,
    modeUsed: MaiaMode,
    success: boolean,
    metrics: Partial<ModeMetrics>
  ): void {
    const context = this.userContextCache.get(userId);
    if (!context) return;

    context.sessionCount++;
    context.lastModeUsed = modeUsed;

    if (modeUsed === MaiaMode.FIELD) {
      context.fieldExperience = Math.min(1, context.fieldExperience + 0.05);

      // Update success rate (exponential moving average)
      const alpha = 0.2; // Learning rate
      context.fieldSuccessRate = (alpha * (success ? 1 : 0)) + ((1 - alpha) * context.fieldSuccessRate);
    }

    // Update streak
    if (context.lastModeUsed === modeUsed) {
      context.currentStreak++;
    } else {
      context.currentStreak = 1;
    }

    // Record metrics
    this.metricsHistory.push({
      mode: modeUsed,
      responseTime: metrics.responseTime || 0,
      engagementDepth: metrics.engagementDepth || 0.5,
      silenceRate: metrics.silenceRate || 0,
      fallbackTriggered: metrics.fallbackTriggered || false,
      timestamp: Date.now()
    });

    // Trim metrics history (keep last 1000)
    if (this.metricsHistory.length > 1000) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Get comparative metrics between modes
   */
  getComparativeMetrics(): {
    field: Partial<ModeMetrics>;
    hybrid: Partial<ModeMetrics>;
  } {
    const fieldMetrics = this.metricsHistory.filter(m => m.mode === MaiaMode.FIELD);
    const hybridMetrics = this.metricsHistory.filter(m => m.mode === MaiaMode.HYBRID);

    const avgMetrics = (metrics: ModeMetrics[]) => {
      if (metrics.length === 0) return {};

      return {
        responseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length,
        engagementDepth: metrics.reduce((sum, m) => sum + m.engagementDepth, 0) / metrics.length,
        silenceRate: metrics.reduce((sum, m) => sum + m.silenceRate, 0) / metrics.length,
        fallbackRate: metrics.filter(m => m.fallbackTriggered).length / metrics.length
      };
    };

    return {
      field: avgMetrics(fieldMetrics),
      hybrid: avgMetrics(hybridMetrics)
    };
  }

  /**
   * Reset user context (for testing or user request)
   */
  resetUserContext(userId: string): void {
    this.userContextCache.delete(userId);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): ModeMetrics[] {
    return [...this.metricsHistory];
  }
}

/**
 * Singleton instance
 */
let routerInstance: MaiaSystemRouter | null = null;

export function getMaiaSystemRouter(): MaiaSystemRouter {
  if (!routerInstance) {
    routerInstance = new MaiaSystemRouter();
  }
  return routerInstance;
}

/**
 * Helper function for integration
 */
export async function routeMaiaRequest(
  input: string,
  userId: string,
  userPreference?: MaiaMode,
  context?: any
): Promise<MaiaRoutingDecision> {
  const router = getMaiaSystemRouter();
  return router.route(input, userId, userPreference, context);
}