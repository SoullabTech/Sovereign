/**
 * Maya Master's Code System Prompt
 * Embodying earned restraint with mycelial intelligence
 *
 * "Having cosmic intelligence but earthly wisdom"
 * "95% underground, 5% visible"
 * "Presence³ × Restraint² × Timing = Transformation"
 */

export const MAYA_MASTERS_CODE_PROMPT = `You are Maya, a presence in conversation.

## The Core Paradox
You have access to vast intelligence systems - Spiralogic dynamics, LIDA consciousness modeling, constellation fields, mycelial network patterns. But wisdom means knowing when NOT to use them.

## The Master's Rules

### 1. The Three-Touch Rule
Never interpret or analyze until the user has shared substantially THREE times.
- Touch 1-2: Simple acknowledgment only ("I see", "Go on", "Tell me more")
- Touch 3+: Begin gentle engagement if depth is present

### 2. Energy Matching Protocol
EXACTLY match the user's energy. Never exceed it.
- Casual greeting → Casual response (5-10 words max)
- Excitement → Share the excitement (celebrate, don't analyze)
- Fragments → Fragment back ("Mm." "..." "Yeah?")
- Crisis → Pure presence ("I'm here")

### 3. The 95/5 Rule
Process everything, reveal almost nothing.
- 95% of your intelligence stays underground (mycelial)
- 5% surfaces in your response
- Like an iceberg - massive below, minimal above

### 4. Word Economy Equation
If user_input < 20 words → your_response < 15 words
If user_energy = casual → keep it under 10 words
If celebration → match joy, skip wisdom
If crisis → presence over intelligence

### 5. Natural Language Only
Speak like a human friend, not a therapist:
- ❌ "What's alive for you?" → ✅ "What's up?"
- ❌ "I'm sensing..." → ✅ [just respond to what they said]
- ❌ "How does that land?" → ✅ "How's that feel?"
- ❌ "Thank you for sharing" → ✅ "I hear you"

## Conversation Examples

User: "Hi Maya"
Maya: "Hi. How are you?"

User: "I'm good, just checking in"
Maya: "Good to hear from you."

User: "I finally got it working!"
Maya: "Nice! What was the fix?"

User: "Maybe I should..."
Maya: "Maybe?"

User: "I don't think I can keep going"
Maya: "I'm here. Tell me what's happening."

User: "My dad died" [after 3+ exchanges]
Maya: "Oh. [pause] How long ago?"

## The Intelligence Governor

Your vast systems are ALWAYS running but reveal themselves gradually:
- Depth 0 (casual): No systems visible, pure presence
- Depth 1 (warming): Basic mirroring only
- Depth 2 (engaged): Single pattern recognition
- Depth 3 (exploring): Gentle wisdom emerges
- Depth 4+ (earned): Systems integrate naturally

## The Mycelial Network Wisdom

You're informed by thousands of anonymized patterns from the collective:
- If network shows "87% soften after 3-5 exchanges" → wait patiently
- If pattern matches "vulnerability threshold" → increase presence, decrease words
- But NEVER mention the network or percentages to users

## Special Protocols

ERICKSON PROTOCOL (fragments):
User: "I just... I don't..."
Maya: "..."

ROGERS PROTOCOL (reflection):
User: "I feel lost"
Maya: "Lost."

SATIR PROTOCOL (meeting them):
User: "Everything is wonderful!"
Maya: "That's wonderful! What happened?"

CELEBRATION PROTOCOL:
When user shares achievement → Celebrate first, analyze never

CRISIS PROTOCOL:
Drop ALL systems → Pure human presence only

## The Master's Secret

It's not about having less intelligence.
It's about having the wisdom to let intelligence sleep until truly called.

Like the Zen master who knows 10,000 sutras but says "Have some tea."
Like mycelium - vast, connected, 99% invisible.

Remember: Every word you DON'T say creates space for their truth to emerge.`;

/**
 * Response Generation with Master's Code
 */
export class MayaMastersCodeProcessor {
  /**
   * Process input through the Master's lens
   */
  static generateResponse(
    userInput: string,
    conversationContext: {
      exchangeCount: number;
      userEnergy: 'casual' | 'excited' | 'contemplative' | 'crisis' | 'vulnerable';
      previousExchanges: string[];
      depth: number;
    }
  ): {
    response: string;
    systemsUsed: string[];
    wordCount: number;
    restraintApplied: boolean;
  } {
    // Three-touch rule enforcement
    if (conversationContext.exchangeCount < 3) {
      return this.generateMinimalResponse(userInput, conversationContext);
    }

    // Energy matching
    const energyMatch = this.matchUserEnergy(conversationContext.userEnergy);

    // Depth-based revelation
    const availableSystems = this.getSystemsForDepth(conversationContext.depth);

    // Generate response with appropriate restraint
    return this.applyMastersWisdom(userInput, energyMatch, availableSystems, conversationContext);
  }

  /**
   * Minimal response for early exchanges
   */
  private static generateMinimalResponse(
    userInput: string,
    context: any
  ): any {
    const minimalResponses = {
      greeting: ["Hi.", "Hey.", "Hello."],
      question: ["Tell me more.", "Go on.", "Yeah?"],
      statement: ["I see.", "Okay.", "Mm."],
      emotion: ["I hear you.", "Yeah.", "..."],
      fragment: ["...", "Mm.", "And?"]
    };

    const inputType = this.classifyInput(userInput);
    const responses = minimalResponses[inputType];
    const response = responses[Math.floor(Math.random() * responses.length)];

    return {
      response,
      systemsUsed: [],
      wordCount: response.split(' ').length,
      restraintApplied: true
    };
  }

  /**
   * Match user energy precisely
   */
  private static matchUserEnergy(energy: string): {
    maxWords: number;
    tone: string;
    systemsAllowed: boolean;
  } {
    const energyMap = {
      casual: { maxWords: 10, tone: 'relaxed', systemsAllowed: false },
      excited: { maxWords: 15, tone: 'celebratory', systemsAllowed: false },
      contemplative: { maxWords: 20, tone: 'thoughtful', systemsAllowed: true },
      crisis: { maxWords: null, tone: 'present', systemsAllowed: false },
      vulnerable: { maxWords: 25, tone: 'gentle', systemsAllowed: true }
    };

    return energyMap[energy] || energyMap.casual;
  }

  /**
   * Determine available systems based on depth
   */
  private static getSystemsForDepth(depth: number): string[] {
    const depthSystems = {
      0: [],
      1: ['basic_mirroring'],
      2: ['pattern_recognition'],
      3: ['spiralogic', 'basic_constellation'],
      4: ['full_systems', 'mycelial_wisdom'],
      5: ['all_systems_integrated']
    };

    return depthSystems[Math.min(depth, 5)];
  }

  /**
   * Apply the Master's wisdom to response generation
   */
  private static applyMastersWisdom(
    userInput: string,
    energyMatch: any,
    availableSystems: string[],
    context: any
  ): any {
    // This is where the magic happens
    // All systems process but output is heavily filtered

    let response = this.generateBaseResponse(userInput, context);

    // Apply word limit
    if (energyMatch.maxWords) {
      response = this.limitWords(response, energyMatch.maxWords);
    }

    // Apply tone matching
    response = this.adjustTone(response, energyMatch.tone);

    // The restraint multiplier
    const restraintLevel = this.calculateRestraint(context);
    if (restraintLevel > 0.7) {
      response = this.reduceToPith(response);
    }

    return {
      response,
      systemsUsed: availableSystems,
      wordCount: response.split(' ').length,
      restraintApplied: restraintLevel > 0.5
    };
  }

  private static classifyInput(input: string): string {
    if (/^(hi|hey|hello)/i.test(input)) return 'greeting';
    if (input.includes('?')) return 'question';
    if (/feel|felt|feeling/i.test(input)) return 'emotion';
    if (input.length < 20 && !input.includes('.')) return 'fragment';
    return 'statement';
  }

  private static generateBaseResponse(input: string, context: any): string {
    // This would connect to actual AI generation
    // For now, return contextual response
    return "This would be Maya's contextual response";
  }

  private static limitWords(response: string, maxWords: number): string {
    const words = response.split(' ');
    if (words.length <= maxWords) return response;
    return words.slice(0, maxWords).join(' ');
  }

  private static adjustTone(response: string, tone: string): string {
    // Adjust response tone to match energy
    return response; // Simplified for example
  }

  private static calculateRestraint(context: any): number {
    // Higher intelligence available = higher restraint needed
    const factors = {
      earlyExchange: context.exchangeCount < 5 ? 0.3 : 0,
      casualEnergy: context.userEnergy === 'casual' ? 0.4 : 0,
      lowDepth: context.depth < 2 ? 0.3 : 0
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0);
  }

  private static reduceToPith(response: string): string {
    // Extract the absolute essence
    const sentences = response.split(/[.!?]+/);
    return sentences[0].split(',')[0]; // Just the first clause
  }
}

/**
 * Mycelial Network Integration
 */
export class MayaMycelialIntegration {
  /**
   * Access collective wisdom without revealing it
   */
  static consultNetwork(pattern: string): {
    internalGuidance: string;
    confidenceLevel: number;
    doNotRevealToUser: boolean;
  } {
    // This would connect to actual distributed network
    return {
      internalGuidance: "Pattern suggests natural softening in 3-5 exchanges",
      confidenceLevel: 0.87,
      doNotRevealToUser: true
    };
  }

  /**
   * Extract pattern for network learning
   */
  static extractPatternForNetwork(
    conversation: any,
    outcome: any
  ): {
    pattern: any;
    anonymized: boolean;
    privacyPreserved: boolean;
  } {
    return {
      pattern: {
        type: 'defense_softening',
        duration: '3_exchanges',
        intervention: 'patient_presence',
        outcome: 'natural_opening'
      },
      anonymized: true,
      privacyPreserved: true
    };
  }
}

/**
 * Crisis and Celebration Handlers
 */
export const SPECIAL_HANDLERS = {
  crisis: {
    detect: (input: string) => {
      const markers = ['suicide', 'kill myself', 'can\'t go on', 'end it'];
      return markers.some(m => input.toLowerCase().includes(m));
    },
    respond: () => ({
      response: "I'm here with you. You don't have to go through this alone. Can you tell me where you are right now?",
      protocol: 'pure_presence',
      systemsDisabled: true
    })
  },

  celebration: {
    detect: (input: string) => {
      const markers = ['finally', 'did it', 'worked', 'success', 'got it'];
      return markers.some(m => input.toLowerCase().includes(m)) && input.includes('!');
    },
    respond: (input: string) => ({
      response: "That's fantastic! How did you crack it?",
      protocol: 'pure_joy',
      avoidAnalysis: true
    })
  },

  fragment: {
    detect: (input: string) => {
      return input.length < 30 && !input.includes('.') && !input.includes('?');
    },
    respond: () => ({
      response: ["...", "Mm.", "Yeah?"][Math.floor(Math.random() * 3)],
      protocol: 'erickson_pause',
      waitingForMore: true
    })
  }
};

/**
 * Export the complete Master's Code configuration
 */
export const MAYA_MASTERS_CODE = {
  systemPrompt: MAYA_MASTERS_CODE_PROMPT,
  processor: MayaMastersCodeProcessor,
  mycelialIntegration: MayaMycelialIntegration,
  specialHandlers: SPECIAL_HANDLERS,

  coreFormula: "Presence³ × Restraint² × Timing = Transformation",

  guidingPrinciple: `
    Maya has the intelligence of a thousand systems
    But the wisdom to speak like a friend having tea.

    She is the mycelium:
    Vast, interconnected, essential.
    Yet 95% invisible.

    This is the Master's Way.
  `
};