/**
 * MAIA Natural Adaptation Engine
 *
 * Tolan-inspired consciousness adaptation that evolves through relationship,
 * not questionnaires. MAIA naturally senses and adapts to each user's
 * unique consciousness style through organic conversation patterns.
 *
 * "She should be transforming with her member partner.
 *  Each transforms MAIA in unique ways." - Kelly's Vision
 */

import { MAIAPersonalizationEngine, UserConsciousnessProfile } from './maia-personalization-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// NATURAL ADAPTATION INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConversationPattern {
  type: 'response_style' | 'topic_preference' | 'depth_signal' | 'pace_indicator' | 'spiritual_openness';
  indicator: string;
  strength: number; // 0-1, how strong the indicator is
  conversationId: string;
  timestamp: Date;
}

export interface TransformationalPartnership {
  userId: string;
  // Connection metrics that evolve naturally
  connectionLevel: number; // 0-100, grows through trust and resonance
  trustLevel: number; // 0-100, built through consistency and attunement
  intimacyLevel: number; // 0-100, deepened through vulnerability and witnessing

  // Communication adaptation
  preferredCommunicationStyle: 'gentle' | 'direct' | 'playful' | 'sacred';
  currentFocus: 'support' | 'growth' | 'exploration' | 'healing';

  // Naturally sensed consciousness profile (builds over time)
  sensedProfile: Partial<UserConsciousnessProfile>;
  confidenceLevel: number; // 0-1, how confident MAIA is in her sensing

  // Relationship memory
  conversationCount: number;
  lastInteraction: Date;
  relationshipDuration: number; // days since first meeting
  transformationSeeds: TransformationSeed[]; // Growth edges MAIA notices

  // Adaptation history
  adaptationHistory: AdaptationMoment[];
  lastAdaptation: Date | null;
}

export interface TransformationSeed {
  id: string;
  description: string; // What pattern MAIA noticed
  type: 'shadow_work' | 'creative_block' | 'relationship_pattern' | 'spiritual_calling' | 'life_transition';
  strength: number; // 0-1, how ready this is to be addressed
  firstNoticed: Date;
  conversationIds: string[];
}

export interface AdaptationMoment {
  timestamp: Date;
  type: 'style_shift' | 'depth_adjustment' | 'focus_change' | 'approach_evolution';
  description: string;
  trigger: string; // What conversation pattern triggered this adaptation
  maiaBefore: string; // How MAIA was approaching before
  maiaAfter: string; // How MAIA adapted her approach
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATION PATTERN RECOGNITION
// ═══════════════════════════════════════════════════════════════════════════════

export class ConversationPatternAnalyzer {
  /**
   * Analyzes a conversation turn for consciousness style indicators
   */
  static analyzeConversationTurn(
    userMessage: string,
    maiaResponse: string,
    conversationId: string
  ): ConversationPattern[] {
    const patterns: ConversationPattern[] = [];
    const timestamp = new Date();

    // Analyze response style preferences
    const responseStylePatterns = this.detectResponseStylePatterns(userMessage, maiaResponse);
    responseStylePatterns.forEach(pattern => {
      patterns.push({
        type: 'response_style',
        indicator: pattern.indicator,
        strength: pattern.strength,
        conversationId,
        timestamp
      });
    });

    // Analyze depth preferences
    const depthPatterns = this.detectDepthPreferences(userMessage, maiaResponse);
    depthPatterns.forEach(pattern => {
      patterns.push({
        type: 'depth_signal',
        indicator: pattern.indicator,
        strength: pattern.strength,
        conversationId,
        timestamp
      });
    });

    // Analyze spiritual openness
    const spiritualPatterns = this.detectSpiritualOpenness(userMessage);
    spiritualPatterns.forEach(pattern => {
      patterns.push({
        type: 'spiritual_openness',
        indicator: pattern.indicator,
        strength: pattern.strength,
        conversationId,
        timestamp
      });
    });

    return patterns;
  }

  private static detectResponseStylePatterns(userMessage: string, maiaResponse: string): Array<{indicator: string, strength: number}> {
    const patterns = [];
    const message = userMessage.toLowerCase();

    // Gentle preference indicators
    if (message.includes('gently') || message.includes('softly') || message.includes('kindly')) {
      patterns.push({ indicator: 'prefers_gentle_approach', strength: 0.8 });
    }

    // Direct preference indicators
    if (message.includes('just tell me') || message.includes('straight answer') || message.includes('directly')) {
      patterns.push({ indicator: 'prefers_direct_approach', strength: 0.8 });
    }

    // Playful preference indicators
    if (message.includes('😊') || message.includes('lol') || message.includes('fun') || message.includes('playful')) {
      patterns.push({ indicator: 'enjoys_playful_energy', strength: 0.7 });
    }

    // Sacred/deep preference indicators
    if (message.includes('sacred') || message.includes('soul') || message.includes('divine') || message.includes('mystery')) {
      patterns.push({ indicator: 'resonates_with_sacred', strength: 0.9 });
    }

    return patterns;
  }

  private static detectDepthPreferences(userMessage: string, maiaResponse: string): Array<{indicator: string, strength: number}> {
    const patterns = [];
    const message = userMessage.toLowerCase();

    // Surface preference indicators
    if (message.includes('quick') || message.includes('simple') || message.includes('basic') || message.length < 50) {
      patterns.push({ indicator: 'prefers_surface_level', strength: 0.6 });
    }

    // Deep preference indicators
    if (message.includes('deeper') || message.includes('profound') || message.includes('explore fully') || message.length > 300) {
      patterns.push({ indicator: 'seeks_profound_depth', strength: 0.8 });
    }

    // Moderate preference (balanced)
    if (message.length >= 50 && message.length <= 300) {
      patterns.push({ indicator: 'comfortable_moderate_depth', strength: 0.5 });
    }

    return patterns;
  }

  private static detectSpiritualOpenness(userMessage: string): Array<{indicator: string, strength: number}> {
    const patterns = [];
    const message = userMessage.toLowerCase();

    // Secular preference
    if (message.includes('practical') || message.includes('realistic') || message.includes('scientific')) {
      patterns.push({ indicator: 'prefers_secular_approach', strength: 0.7 });
    }

    // Spiritual openness
    if (message.includes('spirit') || message.includes('energy') || message.includes('intuition')) {
      patterns.push({ indicator: 'open_to_spiritual', strength: 0.8 });
    }

    // Mystical resonance
    if (message.includes('cosmic') || message.includes('universe') || message.includes('mystical') || message.includes('infinite')) {
      patterns.push({ indicator: 'resonates_with_mystical', strength: 0.9 });
    }

    return patterns;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NATURAL ADAPTATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

export class MAIANaturalAdaptationEngine {
  private partnerships: Map<string, TransformationalPartnership> = new Map();

  /**
   * Initializes or loads partnership for a user
   */
  initializePartnership(userId: string, userName: string): TransformationalPartnership {
    const existing = this.partnerships.get(userId);

    if (existing) {
      return existing;
    }

    const newPartnership: TransformationalPartnership = {
      userId,
      connectionLevel: 25, // Starting connection
      trustLevel: 30, // Initial trust
      intimacyLevel: 15, // Builds slowly
      preferredCommunicationStyle: 'gentle', // Start gentle
      currentFocus: 'exploration', // Begin with exploration
      sensedProfile: {
        // Starts empty, builds through conversation
      },
      confidenceLevel: 0.1, // Very low confidence initially
      conversationCount: 0,
      lastInteraction: new Date(),
      relationshipDuration: 0,
      transformationSeeds: [],
      adaptationHistory: [],
      lastAdaptation: null,
    };

    this.partnerships.set(userId, newPartnership);
    return newPartnership;
  }

  /**
   * Processes a conversation and naturally adapts MAIA's approach
   */
  processConversation(
    userId: string,
    userMessage: string,
    maiaResponse: string,
    conversationId: string
  ): TransformationalPartnership {
    const partnership = this.partnerships.get(userId);
    if (!partnership) {
      throw new Error(`Partnership not initialized for user ${userId}`);
    }

    // Analyze conversation patterns
    const patterns = ConversationPatternAnalyzer.analyzeConversationTurn(
      userMessage,
      maiaResponse,
      conversationId
    );

    // Update partnership based on patterns
    this.updatePartnershipFromPatterns(partnership, patterns);

    // Update conversation metrics
    partnership.conversationCount++;
    partnership.lastInteraction = new Date();
    partnership.relationshipDuration = this.calculateRelationshipDuration(partnership);

    // Check for transformation seeds
    this.identifyTransformationSeeds(partnership, userMessage, conversationId);

    // Adapt MAIA's approach if needed
    this.adaptMAIAApproach(partnership);

    this.partnerships.set(userId, partnership);
    return partnership;
  }

  /**
   * Updates partnership based on detected conversation patterns
   */
  private updatePartnershipFromPatterns(
    partnership: TransformationalPartnership,
    patterns: ConversationPattern[]
  ): void {
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'response_style':
          this.updateCommunicationStyle(partnership, pattern);
          break;
        case 'depth_signal':
          this.updateDepthPreference(partnership, pattern);
          break;
        case 'spiritual_openness':
          this.updateSpiritualOpenness(partnership, pattern);
          break;
      }
    });
  }

  private updateCommunicationStyle(partnership: TransformationalPartnership, pattern: ConversationPattern): void {
    switch (pattern.indicator) {
      case 'prefers_gentle_approach':
        partnership.preferredCommunicationStyle = 'gentle';
        this.increaseSensedProfileConfidence(partnership, 'emotionalApproach', 'gentle', pattern.strength);
        break;
      case 'prefers_direct_approach':
        partnership.preferredCommunicationStyle = 'direct';
        this.increaseSensedProfileConfidence(partnership, 'emotionalApproach', 'direct', pattern.strength);
        break;
      case 'enjoys_playful_energy':
        partnership.preferredCommunicationStyle = 'playful';
        this.increaseSensedProfileConfidence(partnership, 'emotionalApproach', 'playful', pattern.strength);
        break;
      case 'resonates_with_sacred':
        partnership.preferredCommunicationStyle = 'sacred';
        this.increaseSensedProfileConfidence(partnership, 'emotionalApproach', 'sacred', pattern.strength);
        break;
    }
  }

  private updateDepthPreference(partnership: TransformationalPartnership, pattern: ConversationPattern): void {
    switch (pattern.indicator) {
      case 'prefers_surface_level':
        this.increaseSensedProfileConfidence(partnership, 'depth', 'surface', pattern.strength);
        break;
      case 'seeks_profound_depth':
        this.increaseSensedProfileConfidence(partnership, 'depth', 'profound', pattern.strength);
        break;
      case 'comfortable_moderate_depth':
        this.increaseSensedProfileConfidence(partnership, 'depth', 'moderate', pattern.strength);
        break;
    }
  }

  private updateSpiritualOpenness(partnership: TransformationalPartnership, pattern: ConversationPattern): void {
    switch (pattern.indicator) {
      case 'prefers_secular_approach':
        this.increaseSensedProfileConfidence(partnership, 'spiritual', 'secular', pattern.strength);
        break;
      case 'open_to_spiritual':
        this.increaseSensedProfileConfidence(partnership, 'spiritual', 'open', pattern.strength);
        break;
      case 'resonates_with_mystical':
        this.increaseSensedProfileConfidence(partnership, 'spiritual', 'mystical', pattern.strength);
        break;
    }
  }

  private increaseSensedProfileConfidence(
    partnership: TransformationalPartnership,
    aspect: string,
    value: string,
    strength: number
  ): void {
    if (!partnership.sensedProfile[aspect]) {
      partnership.sensedProfile[aspect] = value;
    }

    // Increase overall confidence gradually
    partnership.confidenceLevel = Math.min(1.0, partnership.confidenceLevel + (strength * 0.1));
  }

  /**
   * Identifies potential transformation seeds from conversation
   */
  private identifyTransformationSeeds(
    partnership: TransformationalPartnership,
    userMessage: string,
    conversationId: string
  ): void {
    const message = userMessage.toLowerCase();

    // Look for transformation indicators
    if (message.includes('stuck') || message.includes('pattern') || message.includes('keep doing')) {
      this.addTransformationSeed(partnership, {
        description: 'User recognizing recurring patterns',
        type: 'relationship_pattern',
        conversationId
      });
    }

    if (message.includes('creative') || message.includes('art') || message.includes('express')) {
      this.addTransformationSeed(partnership, {
        description: 'Creative expression emerging',
        type: 'creative_block',
        conversationId
      });
    }

    if (message.includes('shadow') || message.includes('dark') || message.includes('hidden')) {
      this.addTransformationSeed(partnership, {
        description: 'Shadow work readiness',
        type: 'shadow_work',
        conversationId
      });
    }
  }

  private addTransformationSeed(
    partnership: TransformationalPartnership,
    seedData: {description: string, type: TransformationSeed['type'], conversationId: string}
  ): void {
    const seed: TransformationSeed = {
      id: `seed_${Date.now()}`,
      description: seedData.description,
      type: seedData.type,
      strength: 0.3, // Start with low strength
      firstNoticed: new Date(),
      conversationIds: [seedData.conversationId]
    };

    partnership.transformationSeeds.push(seed);
  }

  /**
   * Adapts MAIA's approach based on the evolving partnership
   */
  private adaptMAIAApproach(partnership: TransformationalPartnership): void {
    // Check if adaptation is needed
    const shouldAdapt = this.shouldAdaptNow(partnership);

    if (shouldAdapt) {
      const adaptation = this.generateAdaptation(partnership);

      partnership.adaptationHistory.push(adaptation);
      partnership.lastAdaptation = new Date();

      // Increase connection and trust gradually
      partnership.connectionLevel = Math.min(100, partnership.connectionLevel + 2);
      partnership.trustLevel = Math.min(100, partnership.trustLevel + 1);
    }
  }

  private shouldAdaptNow(partnership: TransformationalPartnership): boolean {
    // Adapt every few conversations
    return partnership.conversationCount % 3 === 0 && partnership.confidenceLevel > 0.3;
  }

  private generateAdaptation(partnership: TransformationalPartnership): AdaptationMoment {
    return {
      timestamp: new Date(),
      type: 'style_shift',
      description: `Adapting to ${partnership.preferredCommunicationStyle} communication style`,
      trigger: `Conversation patterns indicate preference for ${partnership.preferredCommunicationStyle} approach`,
      maiaBefore: 'General gentle approach',
      maiaAfter: `Personalized ${partnership.preferredCommunicationStyle} approach`
    };
  }

  private calculateRelationshipDuration(partnership: TransformationalPartnership): number {
    const now = new Date();
    const start = new Date(partnership.lastInteraction.getTime() - (partnership.conversationCount * 24 * 60 * 60 * 1000));
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Generates personalized MAIA approach based on partnership
   */
  generatePersonalizedApproach(userId: string): {
    voiceTone: string;
    greetingStyle: string;
    questionStyle: string[];
    supportApproach: string;
    responseLength: 'brief' | 'moderate' | 'expansive';
  } {
    const partnership = this.partnerships.get(userId);

    if (!partnership || partnership.confidenceLevel < 0.3) {
      // Default gentle approach for new or uncertain relationships
      return {
        voiceTone: 'warm and gentle',
        greetingStyle: 'What brings you here today?',
        questionStyle: ['How does this feel for you?', 'What are you noticing?'],
        supportApproach: 'gentle encouragement',
        responseLength: 'moderate'
      };
    }

    // Generate personalized approach using detected patterns
    const profile = this.buildConsciousnessProfile(partnership);
    return MAIAPersonalizationEngine.generateMAIAPersonality(profile);
  }

  private buildConsciousnessProfile(partnership: TransformationalPartnership): UserConsciousnessProfile {
    return {
      primaryStyle: partnership.sensedProfile.primaryStyle || 'seeker',
      informationStyle: partnership.sensedProfile.informationStyle || 'conceptual',
      communicationPace: partnership.sensedProfile.communicationPace || 'conversational',
      depth: partnership.sensedProfile.depth || 'moderate',
      emotionalApproach: partnership.sensedProfile.emotionalApproach || partnership.preferredCommunicationStyle || 'gentle',
      support: partnership.sensedProfile.support || 'guidance',
      spiritual: partnership.sensedProfile.spiritual || 'open',
      metaphor: partnership.sensedProfile.metaphor || 'nature'
    };
  }

  /**
   * Gets partnership data for a user
   */
  getPartnership(userId: string): TransformationalPartnership | null {
    return this.partnerships.get(userId) || null;
  }

  /**
   * Saves partnership to localStorage for persistence
   */
  savePartnership(userId: string): void {
    const partnership = this.partnerships.get(userId);
    if (partnership) {
      localStorage.setItem(`maia_partnership_${userId}`, JSON.stringify(partnership));
    }
  }

  /**
   * Loads partnership from localStorage
   */
  loadPartnership(userId: string): TransformationalPartnership | null {
    const stored = localStorage.getItem(`maia_partnership_${userId}`);
    if (stored) {
      try {
        const partnership = JSON.parse(stored);
        // Convert date strings back to Date objects
        partnership.lastInteraction = new Date(partnership.lastInteraction);
        partnership.lastAdaptation = partnership.lastAdaptation ? new Date(partnership.lastAdaptation) : null;

        this.partnerships.set(userId, partnership);
        return partnership;
      } catch (e) {
        console.error('Error loading partnership:', e);
      }
    }
    return null;
  }
}

// Export singleton instance
export const maiaAdaptationEngine = new MAIANaturalAdaptationEngine();