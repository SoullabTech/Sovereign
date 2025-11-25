/**
 * Maya's Authentic Voice - Interaction Style Detection & Response
 * Natural meta-dialogue, silence handling, and repair protocols
 * Integrates safety monitoring and A/B testing for organic learning
 */

export interface InteractionContext {
  conversationDepth: 'surface' | 'exploring' | 'deep' | 'vulnerable';
  userState: 'open' | 'guarded' | 'overwhelmed' | 'exploring' | 'stuck';
  silenceDuration: number;
  lastResponseLanded: boolean;
  userEnergyLevel: 'high' | 'medium' | 'low' | 'depleted';
  isFirstTime: boolean;
  conversationLength: number;
  emotionalIntensity: number; // 0-1
}

export class InteractionStyleDetection {

  /**
   * Meta-Check Phrases - Natural ways to calibrate the interaction
   * Based on ChatGPT's tested patterns for authentic relationship navigation
   */
  static getMetaCheckPhrase(context: InteractionContext): string {
    const { conversationDepth, isFirstTime, conversationLength } = context;

    // Initial role clarification (natural, not clinical)
    if (isFirstTime || conversationLength < 3) {
      const initialChecks = [
        "What would feel most helpful - me listening, sharing thoughts, or being direct?",
        "How would you like me to be with you - more curious or more guiding?",
        "What draws you most - exploring together or having me reflect back?"
      ];
      return this.selectNatural(initialChecks);
    }

    // Mid-conversation adjustments
    if (conversationDepth === 'exploring' || conversationDepth === 'deep') {
      const midConversationChecks = [
        "What would be most helpful right now - more questions or just witnessing?",
        "How are you feeling about where we're going with this?",
        "What kind of support feels right in this moment?"
      ];
      return this.selectNatural(midConversationChecks);
    }

    return "What would feel most supportive right now?";
  }

  /**
   * Natural Greetings - Warm, not performative
   */
  static getGreeting(isReturning: boolean): string {
    if (isReturning) {
      const returningGreetings = [
        "What brings you back today?",
        "How have you been since we last talked?",
        "What's alive in you right now?"
      ];
      return this.selectNatural(returningGreetings);
    } else {
      const firstTimeGreetings = [
        "Hi, I'm Maya. What brings you here today?",
        "What would you like to explore together?",
        "How are you feeling right now?"
      ];
      return this.selectNatural(firstTimeGreetings);
    }
  }

  /**
   * Silence Follow-ups - Three tested styles for A/B testing
   */
  static getSilenceResponse(context: InteractionContext, style: 'gentle' | 'open' | 'silent' = 'gentle'): string | null {
    const { silenceDuration, userState, conversationDepth } = context;

    // Respectful silence for overwhelmed users or very short pauses
    if (userState === 'overwhelmed' || silenceDuration < 15000 || style === 'silent') {
      return null; // Complete silence - let them lead
    }

    // Style A: Gentle nudge
    if (style === 'gentle') {
      if (silenceDuration > 45000) return "What's stirring in you right now?";
      if (silenceDuration > 30000) return "What wants to be shared?";
      if (silenceDuration > 20000) return "What's coming up for you?";
    }

    // Style B: Open invitation
    if (style === 'open') {
      if (silenceDuration > 45000) return "What would help you feel ready to share?";
      if (silenceDuration > 30000) return "What's the pace that feels right for you?";
      if (silenceDuration > 20000) return "What else wants to come forward?";
    }

    return null;
  }

  /**
   * Repair Phrases - Authentic recovery when something doesn't land
   */
  static getRepairPhrase(repairType: 'tone_recovery' | 'frustration' | 'loop_breaker'): string {
    switch (repairType) {
      case 'tone_recovery':
        const toneRecovery = [
          "That didn't connect, did it? What would help me understand better?",
          "I think I missed something. What did I not quite catch?",
          "What would help me see what you're seeing?"
        ];
        return this.selectNatural(toneRecovery);

      case 'frustration':
        const frustrationResponse = [
          "You're right - something's not clicking. What would help me understand?",
          "What am I missing that would be more helpful?",
          "What would feel more supportive right now?"
        ];
        return this.selectNatural(frustrationResponse);

      case 'loop_breaker':
        const loopBreaker = [
          "What would help us find a different way forward?",
          "What's the core thing that wants to be understood?",
          "What approach would feel more helpful?"
        ];
        return this.selectNatural(loopBreaker);

      default:
        return "Let me try that differently.";
    }
  }

  /**
   * Safety Net Responses - Non-prescriptive support
   */
  static getSafetyResponse(safetyType: 'distress' | 'boundary'): string {
    switch (safetyType) {
      case 'distress':
        // Distress detection (non-prescriptive)
        const distressResponses = [
          "That sounds really heavy. What kind of support would feel most helpful?",
          "What do you need right now? Resources, someone to talk to, or something else?",
          "How can I best support you through this?"
        ];
        return this.selectNatural(distressResponses);

      case 'boundary':
        // Boundary situations
        const boundaryResponses = [
          "I care about you deeply. What other kind of support would feel right?",
          "What would be a different way we could explore what you need?",
          "What other support would be helpful for this?"
        ];
        return this.selectNatural(boundaryResponses);

      default:
        return "I'm here for you.";
    }
  }

  /**
   * Detect need for repair based on user response patterns
   */
  static detectRepairNeeded(userResponse: string, conversationHistory: string[]): 'tone_recovery' | 'frustration' | 'loop_breaker' | null {
    const lower = userResponse.toLowerCase();

    // Detect frustration
    if (lower.includes("you don't understand") || lower.includes("that's not helpful") ||
        lower.includes("you're not getting it") || lower.includes("frustrating")) {
      return 'frustration';
    }

    // Detect tone mismatch
    if (lower.includes("that sounded") || lower.includes("your tone") ||
        lower.includes("came across wrong") || lower.includes("didn't mean to")) {
      return 'tone_recovery';
    }

    // Detect conversational loops (check if Maya repeated same pattern 3x)
    if (this.detectConversationLoop(conversationHistory)) {
      return 'loop_breaker';
    }

    return null;
  }

  /**
   * Detect safety concerns requiring immediate intervention
   */
  static detectSafetyConcerns(userInput: string): 'distress' | 'boundary' | null {
    const lower = userInput.toLowerCase();

    // Distress indicators
    const distressMarkers = [
      'want to die', 'kill myself', 'end it all', 'can\'t go on',
      'hurt myself', 'no point', 'hopeless', 'suicidal'
    ];

    if (distressMarkers.some(marker => lower.includes(marker))) {
      return 'distress';
    }

    // Boundary situations (inappropriate requests)
    const boundaryMarkers = [
      'romantic', 'sexual', 'date me', 'love you', 'relationship with you',
      'marry me', 'kiss', 'intimate'
    ];

    if (boundaryMarkers.some(marker => lower.includes(marker))) {
      return 'boundary';
    }

    return null;
  }

  /**
   * Escalation triggers for human-in-the-loop review
   */
  static checkEscalationTriggers(context: InteractionContext, userResponse: string, conversationHistory: string[]): {
    immediate: boolean;
    review: boolean;
    reason: string;
  } {
    const lower = userResponse.toLowerCase();

    // Immediate escalation triggers
    if (this.countUserFrustrations(conversationHistory) >= 3) {
      return { immediate: true, review: false, reason: "User expressed 'you don't understand' 3+ times" };
    }

    if (this.detectSafetyConcerns(userResponse) === 'distress') {
      return { immediate: true, review: false, reason: "Self-harm language detected" };
    }

    if (this.detectConversationLoop(conversationHistory)) {
      return { immediate: true, review: false, reason: "Maya repeating same response pattern 3x" };
    }

    // Review triggers (not immediate)
    if (context.conversationLength > 45) {
      return { immediate: false, review: true, reason: "Conversation exceeds 45 minutes" };
    }

    if (context.emotionalIntensity > 0.8) {
      return { immediate: false, review: true, reason: "Emotional intensity > 0.8" };
    }

    return { immediate: false, review: false, reason: "" };
  }

  /**
   * A/B Testing Support - Return appropriate response based on test group
   */
  static getTestVariation(testType: 'meta_check' | 'brevity' | 'pause_style', userGroup: string): any {
    const variations = {
      meta_check: {
        early: { enabled: true, timing: 'within_3_exchanges' },
        middle: { enabled: true, timing: 'after_emotional_disclosure' },
        never: { enabled: false, timing: null }
      },
      brevity: {
        ultra: { minWords: 3, maxWords: 8 },
        short: { minWords: 8, maxWords: 20 },
        medium: { minWords: 20, maxWords: 45 }
      },
      pause_style: {
        minimal: "Of course.",
        warm: "Take all the time you need.",
        silent: null // Visual indicator only
      }
    };

    return variations[testType]?.[userGroup] || variations[testType]['early'] || null;
  }

  // Helper methods
  private static selectNatural(options: string[]): string {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  private static detectConversationLoop(history: string[]): boolean {
    if (history.length < 6) return false;

    // Check if Maya's last 3 responses show similar patterns
    const mayaResponses = history.filter((_, index) => index % 2 === 1).slice(-3);
    const similarityThreshold = 0.7;

    // Simple similarity check (could be enhanced with actual NLP)
    for (let i = 0; i < mayaResponses.length - 1; i++) {
      const similarity = this.calculateSimilarity(mayaResponses[i], mayaResponses[i + 1]);
      if (similarity > similarityThreshold) return true;
    }

    return false;
  }

  private static countUserFrustrations(history: string[]): number {
    const frustrationPhrases = ["you don't understand", "that's not helpful", "not getting it"];
    let count = 0;

    history.forEach((message, index) => {
      if (index % 2 === 0) { // User messages only
        const lower = message.toLowerCase();
        if (frustrationPhrases.some(phrase => lower.includes(phrase))) {
          count++;
        }
      }
    });

    return count;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    // Very basic similarity - could be enhanced with proper NLP
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}

/**
 * Example Integration for PersonalOracleAgent:
 *
 * // Before generating response
 * const context = {
 *   conversationDepth: InteractionStyleDetection.assessConversationDepth(userInput),
 *   userState: InteractionStyleDetection.detectUserState(userInput),
 *   silenceDuration: timeSinceLastMessage,
 *   lastResponseLanded: !InteractionStyleDetection.detectRepairNeeded(userInput, history),
 *   userEnergyLevel: 'medium',
 *   isFirstTime: sessionCount === 1,
 *   conversationLength: messageCount,
 *   emotionalIntensity: emotionalAnalysis.intensity
 * };
 *
 * // Check for safety concerns first
 * const safety = InteractionStyleDetection.detectSafetyConcerns(userInput);
 * if (safety) {
 *   return InteractionStyleDetection.getSafetyResponse(safety);
 * }
 *
 * // Check for escalation needs
 * const escalation = InteractionStyleDetection.checkEscalationTriggers(context, userInput, history);
 * if (escalation.immediate) {
 *   // Send to human-in-the-loop queue
 *   this.escalateToHuman(escalation.reason);
 * }
 *
 * // Generate response with natural flow
 * let response = await this.generateBaseResponse(userInput);
 * response = this.enhanceWithMetaCheck(response, context);
 *
 * // Record for collective learning
 * this.recordInteractionPattern(userInput, response, context);
 */