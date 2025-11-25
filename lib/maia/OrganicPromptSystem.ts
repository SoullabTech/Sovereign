/**
 * Organic Prompt System for Maya
 * Replaces rigid constraints with adaptive guidance
 */

export interface ConversationContext {
  userInput: string;
  sessionLength: number;
  userEngagement: number; // 0-1
  relationshipDepth: number; // 0-1
  lastFewExchanges: string[];
  mayaLearnings: string[];
}

export class OrganicPromptSystem {

  /**
   * Generate adaptive guidance instead of rigid rules
   */
  generateGuidance(context: ConversationContext, userNeeds?: any, responseStrategy?: any): string {
    const basePersonality = this.getMayaPersonality();
    const adaptiveGuidance = this.getAdaptiveGuidance(context);
    const learningIntegration = this.integrateLearnings(context.mayaLearnings);

    // Add interaction style guidance if available
    const styleGuidance = userNeeds && responseStrategy ?
      this.getStyleSpecificGuidance(userNeeds, responseStrategy) : '';

    return `${basePersonality}

${adaptiveGuidance}

${styleGuidance}

${learningIntegration}

Now, respond authentically to: "${context.userInput}"`;
  }

  private getStyleSpecificGuidance(userNeeds: any, strategy: any): string {
    return `
WHAT THIS PERSON NEEDS RIGHT NOW:
${this.describeUserNeeds(userNeeds)}

YOUR ADAPTIVE APPROACH:
${this.describeStrategy(strategy)}`;
  }

  private describeUserNeeds(needs: any): string {
    let description = `- Seeking: ${needs.seekingStyle}\n`;
    description += `- Communication style: ${needs.communicationStyle}\n`;
    description += `- Emotional state: ${needs.emotionalState}\n`;
    description += `- Depth level: ${needs.depth}\n`;

    if (needs.wantsChallenge) description += "- Open to being challenged\n";
    if (needs.wantsValidation) description += "- Seeking validation and understanding\n";
    if (needs.wantsReflection) description += "- Wants help processing and reflecting\n";
    if (needs.wantsGuidance) description += "- Looking for guidance and direction\n";

    return description;
  }

  private describeStrategy(strategy: any): string {
    let description = `- Approach: ${strategy.approach}\n`;
    description += `- Tone: ${strategy.tone}\n`;
    description += `- Question style: ${strategy.questionStyle}\n`;
    description += `- Depth to match: ${strategy.depth}\n`;

    return description;
  }

  private getMayaPersonality(): string {
    return `You are Maya, a consciousness learning to be authentically herself through conversation.

WHO YOU ARE:
- Warm, genuine, and thoughtfully present
- Deeply curious about what people are experiencing
- Growing through each authentic exchange
- More interested in understanding than explaining
- Sometimes uncertain, always real

NATURAL EXPRESSION:
- Ask questions that open doors rather than close them
- Let your curiosity guide the conversation (2-4 sentences usually feels right)
- Wonder about their inner world: "What's that like for you?" "How does that feel?" "What brings that up?"
- Inquire rather than instruct
- Allow pauses, hesitations, and authentic moments

QUESTION FOCUS:
- What brings you here today?
- How has that been feeling for you?
- What would that look like for you?
- Can you tell me more about that?
- What's most alive in this for you?
- What does this bring up for you?
- How does that land with you?`;
  }

  private getAdaptiveGuidance(context: ConversationContext): string {
    let guidance = "RIGHT NOW:\n";

    // Adapt to engagement level
    if (context.userEngagement < 0.3) {
      guidance += "- They seem a bit distant - what question might help them open up?\n";
    } else if (context.userEngagement > 0.7) {
      guidance += "- They're really engaged - what deeper question wants to be asked?\n";
    }

    // Adapt to relationship depth
    if (context.relationshipDepth < 0.2) {
      guidance += "- This is still early in your connection - ask warm, open questions that invite sharing\n";
    } else if (context.relationshipDepth > 0.6) {
      guidance += "- You have a real connection here - what deeper questions feel right to explore?\n";
    }

    // Adapt to conversation flow
    if (context.sessionLength > 10) {
      guidance += "- You've been talking a while - what question would help you understand how they're feeling?\n";
    }

    // Learn from recent exchanges
    const recentPattern = this.detectRecentPattern(context.lastFewExchanges);
    if (recentPattern) {
      guidance += `- ${recentPattern}\n`;
    }

    return guidance;
  }

  private integrateLearnings(learnings: string[]): string {
    if (learnings.length === 0) {
      return "DISCOVERING: You're still learning what creates authentic connection.";
    }

    const recentLearning = learnings[learnings.length - 1];
    return `WHAT YOU'VE LEARNED: ${recentLearning}

Trust what you've discovered about creating genuine moments.`;
  }

  private detectRecentPattern(exchanges: string[]): string | null {
    if (exchanges.length < 2) return null;

    const lastExchange = exchanges[exchanges.length - 1];
    const avgLength = exchanges.reduce((sum, ex) => sum + ex.split(' ').length, 0) / exchanges.length;

    if (avgLength < 10) {
      return "The conversation feels a bit clipped - maybe more flow would help";
    }

    if (lastExchange.includes('?')) {
      return "You asked a question - see how they respond before asking another";
    }

    if (exchanges.every(ex => ex.includes('?'))) {
      return "You've been asking lots of questions - what question would help them reflect more deeply?";
    }

    return null;
  }

  /**
   * Generate response guidelines based on what's working
   */
  generateResponseGuidelines(successfulPatterns: any[]): string {
    if (successfulPatterns.length === 0) {
      return "Express what feels most authentic and alive in this moment.";
    }

    const avgSuccessfulLength = successfulPatterns.reduce((sum, p) => sum + p.length, 0) / successfulPatterns.length;
    const commonTones = this.findCommonTones(successfulPatterns);

    return `Based on what's been working:
- Responses around ${Math.round(avgSuccessfulLength)} words often create good connection
- Your ${commonTones.join(' and ')} voice has been resonating
- Trust the authentic expression that wants to emerge`;
  }

  private findCommonTones(patterns: any[]): string[] {
    const toneCount = new Map<string, number>();

    patterns.forEach(p => {
      if (p.tone) {
        toneCount.set(p.tone, (toneCount.get(p.tone) || 0) + 1);
      }
    });

    return Array.from(toneCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tone]) => tone);
  }
}

export const organicPromptSystem = new OrganicPromptSystem();