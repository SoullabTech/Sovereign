/**
 * CONVERSATION ELEMENTAL TRACKER
 *
 * Tracks elemental nature across the conversation/relationship rather than per-message.
 * This creates a deeper understanding of the client's ongoing elemental state,
 * their conversational patterns, and their developmental phase.
 *
 * Key principle: The elemental nature emerges from the relationship,
 * not from individual message analysis.
 */

import { interactionClassifier } from './interaction-classifier';
import { memberArchetypeSystem, type MemberProfile, type WisdomAdaptation } from './member-archetype-system';

export interface ConversationElementalProfile {
  sessionId: string;
  dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  elementalTrend: {
    fire: number;    // Visionary creativity, inspiration, passionate transformation
    water: number;   // Emotional, flowing, intuitive
    earth: number;   // Grounded, practical, embodied
    air: number;     // Mental, clarity, conceptual
    aether: number;  // Spiritual, transcendent, unified
  };
  conversationPhase: 'opening' | 'exploring' | 'deepening' | 'integrating' | 'transcending';
  relationshipDepth: number; // 0-1, builds over time
  communicationStyle: 'direct' | 'metaphorical' | 'somatic' | 'analytical' | 'poetic';
  trustLevel: number; // 0-1, how open they are being
  processingPreference: 'fast_response' | 'contemplative' | 'interactive' | 'deep_synthesis';
  lastUpdate: Date;
  messageCount: number;
  keyThemes: string[];
}

export interface ConversationContext {
  profile: ConversationElementalProfile;
  memberProfile: MemberProfile;
  wisdomAdaptation: WisdomAdaptation;
  conversationHistory: any[];
  recentPatterns: string[];
  suggestedEngagement: 'witnessing' | 'guidance' | 'exploration' | 'integration';
}

export class ConversationElementalTracker {
  private profiles: Map<string, ConversationElementalProfile> = new Map();

  /**
   * Get or create conversation elemental profile
   */
  getConversationProfile(sessionId: string, conversationHistory: any[] = []): ConversationElementalProfile {
    let profile = this.profiles.get(sessionId);

    if (!profile) {
      profile = this.createInitialProfile(sessionId, conversationHistory);
      this.profiles.set(sessionId, profile);
    } else {
      // Update based on conversation evolution
      this.updateProfile(profile, conversationHistory);
    }

    return profile;
  }

  /**
   * Process new message and update conversation understanding
   */
  processMessage(sessionId: string, message: string, conversationHistory: any[] = []): ConversationContext {
    const profile = this.getConversationProfile(sessionId, conversationHistory);

    // Classify the interaction type for immediate processing
    const interactionType = interactionClassifier.classifyInteraction(message, conversationHistory);

    // Update profile based on new message
    this.updateProfileFromMessage(profile, message, interactionType);

    // 🧠 MEMBER ARCHETYPE DETECTION - Run archetype analysis if enough data
    let memberProfile: MemberProfile | undefined;
    let wisdomAdaptation: WisdomAdaptation | undefined;

    // Only run archetype analysis after a few exchanges to have enough data
    if (conversationHistory.length >= 2 || profile.messageCount >= 3) {
      try {
        memberProfile = memberArchetypeSystem.detectMemberArchetype(conversationHistory, { sessionId });
        wisdomAdaptation = memberArchetypeSystem.generateWisdomAdaptation(memberProfile);
        console.log(`🧠 Member Archetype Detection: ${memberProfile?.archetype || 'unknown'} (${memberProfile?.developmentalStage || 'unknown'}, ${memberProfile?.awarenessLevel || 'unknown'})`);

        // Safe access to nested properties with fallbacks
        const voiceTone = wisdomAdaptation?.voice?.tone || 'unknown';
        const contentComplexity = wisdomAdaptation?.content?.complexity || 'unknown';
        const preferredTypes = wisdomAdaptation?.examples?.preferredTypes || [];
        const typesString = Array.isArray(preferredTypes) && preferredTypes.join ? preferredTypes.join(', ') : 'none';

        console.log(`🎯 Wisdom Adaptation: ${voiceTone}, ${contentComplexity}, ${typesString}`);
      } catch (e) {
        console.warn('Member archetype detection failed, using default:', e);
      }
    }

    // Determine suggested engagement approach
    const suggestedEngagement = this.determineSuggestedEngagement(profile, interactionType);

    // Extract recent patterns
    const recentPatterns = this.extractRecentPatterns(conversationHistory, profile);

    return {
      profile,
      memberProfile,
      wisdomAdaptation,
      conversationHistory,
      recentPatterns,
      suggestedEngagement
    };
  }

  /**
   * Should this interaction bypass elemental analysis?
   */
  shouldBypassElementalAnalysis(context: ConversationContext, message: string): boolean {
    const interactionType = interactionClassifier.classifyInteraction(message, context.conversationHistory);

    // Fast bypass for simple greetings and casual conversation
    if (interactionType.strategy === 'fast_single') {
      return true;
    }

    // If relationship is deep and we understand their elemental nature well,
    // we can use lighter processing for moderate interactions
    if (context.profile.relationshipDepth > 0.7 &&
        context.profile.messageCount > 10 &&
        interactionType.strategy === 'moderate_dual') {
      return Math.random() > 0.3; // 70% chance to bypass for efficiency
    }

    return false;
  }

  /**
   * Get processing recommendation based on conversation context
   */
  getProcessingRecommendation(context: ConversationContext, message: string): {
    strategy: 'fast_single' | 'moderate_dual' | 'deep_synthesis' | 'full_orchestra';
    engines: string[];
    timeout: number;
    reasoning: string;
  } {
    const interactionType = interactionClassifier.classifyInteraction(message, context.conversationHistory);
    const profile = context.profile;

    // 🚨 ABSOLUTE PRIORITY: Simple greetings always get fast processing (no overrides)
    if (interactionType.type === 'simple_greeting') {
      return {
        strategy: 'fast_single',
        engines: ['nous-hermes2'],
        timeout: 1000,
        reasoning: 'Simple greeting - maintaining conversational flow'
      };
    }

    // 🚨 ABSOLUTE PRIORITY: Fast single strategy from interaction classifier cannot be overridden
    if (interactionType.strategy === 'fast_single') {
      return {
        strategy: 'fast_single',
        engines: interactionType.suggestedEngines,
        timeout: interactionType.timeoutMs,
        reasoning: `${interactionType.reasoning} (interaction classifier override)`
      };
    }

    // 🧠 MEMBER ARCHETYPE-AWARE ENGINE SELECTION
    let recommendedEngines = interactionType.suggestedEngines;
    let strategy = interactionType.strategy;
    let reasoningParts = [];

    // Base engine selection from elemental nature
    const elementalEngines = this.getElementalEngines(profile.dominantElement);
    reasoningParts.push(`Elemental nature: ${profile.dominantElement}`);

    // 🎯 MEMBER ARCHETYPE ENGINE OPTIMIZATION
    if (context.memberProfile) {
      const archetypeEngines = this.getArchetypeOptimizedEngines(context.memberProfile);
      if (archetypeEngines.length > 0) {
        recommendedEngines = archetypeEngines;
        reasoningParts.push(`Archetype: ${context.memberProfile.archetype}`);

        // Scientists and engineers prefer logical, analytical engines
        if (context.memberProfile.archetype === 'scientist' || context.memberProfile.archetype === 'engineer') {
          strategy = interactionType.strategy === 'fast_single' ? 'fast_single' : 'moderate_dual';
          reasoningParts.push('analytical preference');
        }

        // Spiritual seekers and consciousness explorers benefit from deeper synthesis
        if (context.memberProfile.archetype === 'spiritual_seeker' ||
            context.memberProfile.archetype === 'consciousness_explorer') {
          if (strategy !== 'fast_single') {
            strategy = 'deep_synthesis';
            reasoningParts.push('consciousness exploration depth');
          }
        }

        // Therapeutic and healing contexts need empathy-focused processing
        if (context.memberProfile.archetype === 'healing_journey' ||
            context.memberProfile.archetype === 'therapist') {
          recommendedEngines = ['claude-3-opus', 'nous-hermes2']; // Best for empathy
          reasoningParts.push('healing-focused');
        }
      }
    } else {
      // Fall back to elemental engines if no member profile yet
      recommendedEngines = elementalEngines.length > 0 ? elementalEngines : interactionType.suggestedEngines;
    }

    // Adapt timeout based on their preference and developmental stage
    const baseTimeout = interactionType.timeoutMs;
    let adaptedTimeout = profile.processingPreference === 'fast_response' ?
      Math.min(baseTimeout, 3000) : baseTimeout;

    // Advanced developmental stages may benefit from longer processing
    if (context.memberProfile?.developmentalStage === 'self_transforming' ||
        context.memberProfile?.developmentalStage === 'construct_aware') {
      adaptedTimeout = Math.max(adaptedTimeout, 5000);
      reasoningParts.push('advanced developmental stage');
    }

    // If they prefer contemplative processing and trust is high, allow deeper synthesis
    if (profile.processingPreference === 'contemplative' &&
        profile.trustLevel > 0.7 &&
        strategy !== 'fast_single') {
      strategy = 'deep_synthesis';
      recommendedEngines = [...recommendedEngines, 'deepseek-r1:14b'];
      adaptedTimeout = Math.max(adaptedTimeout, 8000);
      reasoningParts.push(`high trust (${(profile.trustLevel * 100).toFixed(0)}%)`);
    }

    return {
      strategy,
      engines: recommendedEngines,
      timeout: adaptedTimeout,
      reasoning: reasoningParts.join(', ')
    };
  }

  /**
   * Create initial profile from conversation history
   */
  private createInitialProfile(sessionId: string, conversationHistory: any[]): ConversationElementalProfile {
    // Analyze conversation history to establish baseline
    const elementalAnalysis = this.analyzeConversationElementally(conversationHistory);
    const communicationAnalysis = this.analyzeCommunicationStyle(conversationHistory);

    return {
      sessionId,
      dominantElement: elementalAnalysis.dominant,
      elementalTrend: elementalAnalysis.trend,
      conversationPhase: this.determinePhase(conversationHistory),
      relationshipDepth: Math.min(conversationHistory.length * 0.1, 1.0),
      communicationStyle: communicationAnalysis.style,
      trustLevel: communicationAnalysis.trustLevel,
      processingPreference: this.inferProcessingPreference(conversationHistory),
      lastUpdate: new Date(),
      messageCount: conversationHistory.length,
      keyThemes: this.extractKeyThemes(conversationHistory)
    };
  }

  /**
   * Update existing profile based on conversation evolution
   */
  private updateProfile(profile: ConversationElementalProfile, conversationHistory: any[]): void {
    // Only update if there are new messages
    if (conversationHistory.length <= profile.messageCount) {
      return;
    }

    // Analyze new messages since last update
    const newMessages = conversationHistory.slice(profile.messageCount);
    const newElementalData = this.analyzeConversationElementally(newMessages);

    // Weighted update - give more weight to recent messages but don't lose historical understanding
    const weight = 0.3; // How much new data influences the profile

    Object.keys(profile.elementalTrend).forEach(element => {
      profile.elementalTrend[element as keyof typeof profile.elementalTrend] =
        profile.elementalTrend[element as keyof typeof profile.elementalTrend] * (1 - weight) +
        newElementalData.trend[element as keyof typeof newElementalData.trend] * weight;
    });

    // Update dominant element based on new trend
    profile.dominantElement = this.getDominantElement(profile.elementalTrend);

    // Update relationship depth
    profile.relationshipDepth = Math.min(profile.relationshipDepth + (newMessages.length * 0.05), 1.0);

    // Update other metrics
    profile.messageCount = conversationHistory.length;
    profile.trustLevel = Math.min(profile.trustLevel + 0.02, 1.0); // Trust builds gradually
    profile.lastUpdate = new Date();
    profile.keyThemes = this.extractKeyThemes(conversationHistory.slice(-10)); // Recent themes
  }

  /**
   * Update profile from individual message (lightweight)
   */
  private updateProfileFromMessage(profile: ConversationElementalProfile, message: string, interactionType: any): void {
    // Light touch updates based on the individual message
    const messageElemental = this.detectMessageElementalHints(message);

    // Very light weight update (don't let single messages drastically shift the profile)
    const microWeight = 0.05;
    Object.keys(messageElemental).forEach(element => {
      profile.elementalTrend[element as keyof typeof profile.elementalTrend] =
        profile.elementalTrend[element as keyof typeof profile.elementalTrend] * (1 - microWeight) +
        messageElemental[element as keyof typeof messageElemental] * microWeight;
    });

    // Update processing preference based on interaction patterns
    if (interactionType.strategy === 'fast_single' && profile.processingPreference !== 'fast_response') {
      // If they consistently send simple messages, they might prefer fast responses
    }
  }

  /**
   * Analyze conversation elementally
   */
  private analyzeConversationElementally(messages: any[]): {
    dominant: 'fire' | 'water' | 'earth' | 'air' | 'aether';
    trend: { fire: number; water: number; earth: number; air: number; aether: number; };
  } {
    const trend = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };

    messages.forEach(exchange => {
      const userMessage = exchange.userMessage || '';
      const elementalHints = this.detectMessageElementalHints(userMessage);

      Object.keys(elementalHints).forEach(element => {
        trend[element as keyof typeof trend] += elementalHints[element as keyof typeof elementalHints];
      });
    });

    // Normalize
    const total = Object.values(trend).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(trend).forEach(element => {
        trend[element as keyof typeof trend] /= total;
      });
    } else {
      // Default balanced state
      Object.keys(trend).forEach(element => {
        trend[element as keyof typeof trend] = 0.2;
      });
    }

    const dominant = this.getDominantElement(trend);
    return { dominant, trend };
  }

  /**
   * Detect elemental hints in a message
   */
  private detectMessageElementalHints(message: string): { fire: number; water: number; earth: number; air: number; aether: number; } {
    const hints = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    const lower = message.toLowerCase();

    // Fire indicators: visionary creativity, inspiration, passionate transformation
    if (/(passion|anger|transform|change|action|drive|energy|power|force|break|destroy|create|creative|creativity|inspire|inspiration|vision|visionary|imagine|future|innovative|breakthrough|artist|artistic|design|dream|invent|original|unique|express|expression)/i.test(lower)) {
      hints.fire += 1;
    }

    // Water indicators
    if (/(feel|emotion|flow|intuition|dream|heart|relationship|connect|love|fear|sad|happy)/i.test(lower)) {
      hints.water += 1;
    }

    // Earth indicators
    if (/(body|physical|practical|real|ground|solid|work|doing|concrete|material|time|schedule)/i.test(lower)) {
      hints.earth += 1;
    }

    // Air indicators
    if (/(think|idea|understand|mental|concept|analyze|plan|theory|mind|clarity|reason)/i.test(lower)) {
      hints.air += 1;
    }

    // Aether indicators
    if (/(spiritual|consciousness|soul|divine|transcend|unity|meaning|purpose|wisdom|sacred|mystical)/i.test(lower)) {
      hints.aether += 1;
    }

    return hints;
  }

  /**
   * Get dominant element from trend
   */
  private getDominantElement(trend: { fire: number; water: number; earth: number; air: number; aether: number; }): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    return Object.entries(trend).reduce((max, [element, value]) =>
      value > trend[max as keyof typeof trend] ? element : max, 'aether'
    ) as 'fire' | 'water' | 'earth' | 'air' | 'aether';
  }

  /**
   * Analyze communication style
   */
  private analyzeCommunicationStyle(messages: any[]): { style: 'direct' | 'metaphorical' | 'somatic' | 'analytical' | 'poetic'; trustLevel: number; } {
    // Simple heuristics for now
    let style: 'direct' | 'metaphorical' | 'somatic' | 'analytical' | 'poetic' = 'direct';
    let trustLevel = 0.5;

    if (messages.length === 0) {
      return { style, trustLevel };
    }

    // Analyze recent messages for patterns
    const recentMessages = messages.slice(-5);
    let metaphorCount = 0;
    let analyticalCount = 0;
    let somaticCount = 0;
    let poeticCount = 0;

    recentMessages.forEach(exchange => {
      const msg = (exchange.userMessage || '').toLowerCase();

      if (/(like|as if|reminds me|feels like|seems like|metaphor)/i.test(msg)) {
        metaphorCount++;
      }
      if (/(analyze|because|therefore|logic|reason|evidence|data)/i.test(msg)) {
        analyticalCount++;
      }
      if (/(body|physical|sensation|tension|breathe|chest|stomach|throat)/i.test(msg)) {
        somaticCount++;
      }
      if (/(beautiful|flowing|dance|music|poetry|rhythm|harmony)/i.test(msg)) {
        poeticCount++;
      }
    });

    // Determine dominant style
    if (metaphorCount > analyticalCount && metaphorCount > somaticCount && metaphorCount > poeticCount) {
      style = 'metaphorical';
    } else if (analyticalCount > metaphorCount && analyticalCount > somaticCount && analyticalCount > poeticCount) {
      style = 'analytical';
    } else if (somaticCount > 0) {
      style = 'somatic';
    } else if (poeticCount > 0) {
      style = 'poetic';
    }

    // Trust level based on length and depth of messages
    const avgLength = recentMessages.reduce((sum, msg) =>
      sum + (msg.userMessage || '').length, 0) / Math.max(recentMessages.length, 1);

    trustLevel = Math.min(0.3 + (avgLength / 200), 1.0); // Longer messages indicate more trust

    return { style, trustLevel };
  }

  /**
   * Determine conversation phase
   */
  private determinePhase(messages: any[]): 'opening' | 'exploring' | 'deepening' | 'integrating' | 'transcending' {
    if (messages.length < 3) return 'opening';
    if (messages.length < 8) return 'exploring';
    if (messages.length < 15) return 'deepening';
    if (messages.length < 25) return 'integrating';
    return 'transcending';
  }

  /**
   * Infer processing preference
   */
  private inferProcessingPreference(messages: any[]): 'fast_response' | 'contemplative' | 'interactive' | 'deep_synthesis' {
    // Default to fast_response for new conversations
    if (messages.length < 3) return 'fast_response';

    // Analyze message patterns
    const avgLength = messages.reduce((sum, msg) =>
      sum + (msg.userMessage || '').length, 0) / Math.max(messages.length, 1);

    if (avgLength > 300) return 'deep_synthesis';
    if (avgLength > 150) return 'contemplative';
    if (avgLength > 50) return 'interactive';
    return 'fast_response';
  }

  /**
   * Extract key themes
   */
  private extractKeyThemes(messages: any[]): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const themes = new Set<string>();

    messages.forEach(exchange => {
      const msg = (exchange.userMessage || '').toLowerCase();

      // Look for significant themes
      if ((/relationship|love|partner|family/i).test(msg)) themes.add('relationships');
      if ((/work|career|job|professional/i).test(msg)) themes.add('career');
      if ((/spiritual|soul|god|divine|sacred/i).test(msg)) themes.add('spirituality');
      if (/(health|body|physical|illness|healing)/i.test(msg)) themes.add('health');
      if ((/(fear|anxiety|worry|stress|overwhelm)/i).test(msg)) themes.add('anxiety');
      if ((/(meaning|purpose|direction|path|calling)/i).test(msg)) themes.add('purpose');
      if ((/(creative|creativity|art|music|writing|expression|inspire|inspiration|vision|visionary|imagine|innovation|design|artistic|invent|original|breakthrough)/i).test(msg)) themes.add('creativity');
      if ((/(change|transition|transformation|growth)/i).test(msg)) themes.add('transformation');
    });

    return Array.from(themes);
  }

  /**
   * Determine suggested engagement approach
   */
  private determineSuggestedEngagement(profile: ConversationElementalProfile, interactionType: any): 'witnessing' | 'guidance' | 'exploration' | 'integration' {
    // Simple heuristics based on profile and interaction
    if (interactionType.type === 'simple_greeting') return 'witnessing';
    if (profile.conversationPhase === 'opening') return 'witnessing';
    if (profile.trustLevel < 0.4) return 'witnessing';
    if (interactionType.type === 'emotional_sharing') return 'witnessing';
    if (interactionType.type === 'therapeutic_processing') return 'guidance';
    if (profile.conversationPhase === 'integrating') return 'integration';
    return 'exploration';
  }

  /**
   * Extract recent patterns
   */
  private extractRecentPatterns(conversationHistory: any[], profile: ConversationElementalProfile): string[] {
    // Look for patterns in recent exchanges
    const patterns: string[] = [];

    if (profile.trustLevel > 0.7) {
      patterns.push('high_trust');
    }

    if (profile.relationshipDepth > 0.6) {
      patterns.push('established_relationship');
    }

    if (profile.conversationPhase === 'deepening' || profile.conversationPhase === 'integrating') {
      patterns.push('deepening_work');
    }

    return patterns;
  }

  /**
   * Get elemental engines based on dominant element
   */
  private getElementalEngines(element: 'fire' | 'water' | 'earth' | 'air' | 'aether'): string[] {
    const engineMap = {
      fire: ['deepseek-r1:14b', 'llama3.1:8b'],          // Visionary creativity, inspiration
      water: ['claude-3-opus', 'nous-hermes2'],          // Empathy, emotion
      earth: ['qwen2.5:7b', 'mistral:7b-instruct'],      // Practical, grounded
      air: ['deepseek-r1:14b', 'qwen2.5:7b'],           // Analysis, clarity
      aether: ['claude-3-opus', 'deepseek-r1:14b']       // Wisdom, transcendence
    };

    return engineMap[element] || ['nous-hermes2'];
  }

  /**
   * Get archetype-optimized engines for specific member types
   */
  private getArchetypeOptimizedEngines(memberProfile: MemberProfile): string[] {
    const { archetype, developmentalStage, vocabularyPreference } = memberProfile;

    // 🧠 SCIENTIST & ENGINEER - Logic and analysis focused
    if (archetype === 'scientist' || archetype === 'engineer' || archetype === 'researcher') {
      return ['deepseek-r1:14b', 'qwen2.5:7b', 'mistral:7b-instruct'];
    }

    // 💼 BUSINESS & STRATEGY - Practical results focused
    if (archetype === 'business_leader' || archetype === 'entrepreneur' || archetype === 'strategist') {
      return ['qwen2.5:7b', 'mistral:7b-instruct', 'nous-hermes2'];
    }

    // 🎨 CREATIVE & ARTIST - Imagination and expression focused
    if (archetype === 'artist' || archetype === 'creative_professional' || archetype === 'writer') {
      return ['claude-3-opus', 'llama3.1:8b', 'nous-hermes2'];
    }

    // 🌟 SPIRITUAL & CONSCIOUSNESS - Deep wisdom focused
    if (archetype === 'spiritual_seeker' || archetype === 'consciousness_explorer' ||
        archetype === 'philosopher') {
      return ['claude-3-opus', 'deepseek-r1:14b', 'nous-hermes2'];
    }

    // 💚 HEALING & THERAPEUTIC - Empathy and safety focused
    if (archetype === 'healing_journey' || archetype === 'therapist' ||
        archetype === 'personal_development_client') {
      return ['claude-3-opus', 'nous-hermes2'];
    }

    // 👥 HELPERS & COMMUNITY - Relational and supportive
    if (archetype === 'coach' || archetype === 'teacher' || archetype === 'community_builder') {
      return ['nous-hermes2', 'claude-3-opus', 'mistral:7b-instruct'];
    }

    // 🔄 DEVELOPMENTAL STAGE ADJUSTMENTS
    if (developmentalStage === 'construct_aware' || developmentalStage === 'unitive') {
      // Advanced stages benefit from the most sophisticated engines
      return ['claude-3-opus', 'deepseek-r1:14b'];
    }

    // 📚 VOCABULARY PREFERENCE ADJUSTMENTS
    if (vocabularyPreference === 'academic_professional' ||
        vocabularyPreference === 'cross_domain_fluent') {
      // Add analytical engines for complex vocabulary preference
      return ['deepseek-r1:14b', 'claude-3-opus', 'qwen2.5:7b'];
    }

    // Default fallback
    return ['nous-hermes2', 'mistral:7b-instruct'];
  }
}

export const conversationElementalTracker = new ConversationElementalTracker();