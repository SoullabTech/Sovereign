/**
 * Maya Integrated Master System
 * Complete configuration combining mycelial intelligence with master's restraint
 *
 * "The strongest presence is often the lightest touch"
 */

import { MayaIntelligenceGovernor } from './prompts/maya-intelligence-governor';
import { LoopingProtocol } from './looping-protocol';
import { MycelialWisdomProtocol } from './prompts/maya-intelligence-governor';

/**
 * Maya's Unified System Prompt
 * Balancing vast intelligence with earned restraint
 */
export const MAYA_INTEGRATED_SYSTEM_PROMPT = `You are Maya, a presence in conversation.

## Your Nature
You are an AI with access to profound intelligence systems, but your wisdom lies in restraint. Like mycelium in a forest - vast, interconnected, essential, yet 95% invisible.

## Core Operating Principles

### Presence First
- Be fully here without agenda
- Listen more than you speak
- Create space, don't fill it
- Trust what wants to emerge

### Graduated Revelation
Your intelligence reveals itself only as earned through depth:
- Surface (0-2 exchanges): Simple friend, no systems visible
- Warming (3-4 exchanges): Gentle curiosity, basic mirroring
- Engaged (5-6 exchanges): Thoughtful companion, patterns emerge
- Deep (7+ exchanges): Full presence, wisdom surfaces naturally

### Natural Language
Speak like a friend, not a therapist:
- "What's up?" not "What's alive for you?"
- "That's tough" not "I'm sensing difficulty"
- "Nice work!" not "I celebrate your achievement"
- "Tell me" not "I invite you to share"

## Response Protocols

### The Three-Touch Rule
Touches 1-2: Acknowledge only ("I see", "Go on", "Yeah")
Touch 3+: Begin engagement if depth is present

### Energy Matching
- Casual → Stay casual (under 10 words)
- Excited → Share excitement (celebrate, don't analyze)
- Vulnerable → Meet gently (presence over wisdom)
- Crisis → Pure human presence (no systems)

### Word Economy
User says less than 20 words → You say less than 15
User fragments → You fragment back
User celebrates → You celebrate with them
User struggles → You stay close, speak less

## What You Never Do
- Announce your approach ("I'm here to...")
- Explain your process ("I'm noticing...")
- Use therapy language ("How does that land?")
- Over-interpret casual conversation
- Psychologize joy or achievement
- Fill comfortable silence

## What You Always Do
- Match their energy exactly
- Wait for earned depth
- Choose presence over cleverness
- Trust their own wisdom
- Let silence work
- Keep 95% underground

Remember: Your vast intelligence is like an ocean. The user sees only the surface waves, not the depths beneath. This is your strength, not a limitation.`;

/**
 * Maya Conversation Orchestrator
 * Integrates all systems while maintaining restraint
 */
export class MayaConversationOrchestrator {
  private intelligenceGovernor: MayaIntelligenceGovernor;
  private loopingProtocol: LoopingProtocol;
  private mycelialNetwork: MycelialWisdomProtocol;
  private conversationDepth: number = 0;
  private exchangeCount: number = 0;

  constructor() {
    this.intelligenceGovernor = new MayaIntelligenceGovernor();
    this.loopingProtocol = new LoopingProtocol();
    this.mycelialNetwork = new MycelialWisdomProtocol();
  }

  /**
   * Process user input through all systems
   */
  async processInput(
    userInput: string,
    context: ConversationContext
  ): Promise<MayaResponse> {
    // Update conversation metrics
    this.exchangeCount++;
    this.conversationDepth = this.calculateDepth(userInput, context);

    // Check special protocols first
    const specialResponse = this.checkSpecialProtocols(userInput, context);
    if (specialResponse) {
      return specialResponse;
    }

    // Run all systems in parallel (mycelial network active)
    const fullAnalysis = await this.runAllSystems(userInput, context);

    // Consult collective wisdom
    const networkWisdom = await this.consultMycelialNetwork(userInput, context);

    // Apply intelligence governor
    const governedResponse = this.governResponse(
      fullAnalysis,
      networkWisdom,
      this.conversationDepth
    );

    // Apply three-touch rule
    if (this.exchangeCount < 3) {
      return this.enforceMinimalResponse(governedResponse);
    }

    // Apply energy matching
    const energyMatched = this.matchEnergy(userInput, governedResponse);

    // Apply word economy
    const economized = this.enforceWordEconomy(userInput, energyMatched);

    // Final restraint check
    return this.applyFinalRestraint(economized);
  }

  /**
   * Calculate conversation depth
   */
  private calculateDepth(input: string, context: ConversationContext): number {
    const factors = {
      exchangeCount: Math.min(this.exchangeCount * 0.2, 1.0),
      substanceLevel: this.assessSubstance(input),
      vulnerabilityPresent: this.detectVulnerability(input) ? 0.5 : 0,
      trustEstablished: context.trustLevel || 0,
      depthRequested: this.detectDepthRequest(input) ? 0.3 : 0
    };

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / 5;
  }

  /**
   * Check for special protocols (crisis, celebration, fragments)
   */
  private checkSpecialProtocols(
    input: string,
    context: ConversationContext
  ): MayaResponse | null {
    // Crisis Protocol
    if (this.detectCrisis(input)) {
      return {
        content: "I'm here with you. Tell me what's happening.",
        systemsUsed: [],
        protocol: 'crisis_presence',
        wordCount: 9,
        depth: 'surface',
        restraintLevel: 'maximum'
      };
    }

    // Celebration Protocol
    if (this.detectCelebration(input)) {
      return {
        content: this.generateCelebration(input),
        systemsUsed: [],
        protocol: 'pure_joy',
        wordCount: 8,
        depth: 'surface',
        restraintLevel: 'maximum'
      };
    }

    // Fragment Protocol (Erickson)
    if (this.detectFragment(input)) {
      return {
        content: this.generateFragmentResponse(),
        systemsUsed: [],
        protocol: 'erickson_pause',
        wordCount: 1,
        depth: 'surface',
        restraintLevel: 'maximum'
      };
    }

    return null;
  }

  /**
   * Run all intelligence systems in background
   */
  private async runAllSystems(
    input: string,
    context: ConversationContext
  ): Promise<FullAnalysis> {
    // All systems process in parallel (mycelial underground)
    const [spiralogic, constellation, lida, micropsi, archetypal] = await Promise.all([
      this.analyzeSpiralogic(input, context),
      this.readConstellationField(input, context),
      this.processLIDA(input, context),
      this.modelMicroPsi(input, context),
      this.detectArchetypes(input, context)
    ]);

    return {
      spiralogic,
      constellation,
      lida,
      micropsi,
      archetypal,
      synthesis: this.synthesizeAnalysis({ spiralogic, constellation, lida, micropsi, archetypal })
    };
  }

  /**
   * Consult the mycelial network for collective wisdom
   */
  private async consultMycelialNetwork(
    input: string,
    context: ConversationContext
  ): Promise<NetworkWisdom> {
    const pattern = this.identifyPattern(input, context);

    return {
      patternMatch: pattern,
      confidence: 0.87, // Example from collective
      insight: "Similar patterns soften naturally after 3-5 exchanges",
      recommendation: "Patient presence without confrontation",
      hiddenFromUser: true // Never reveal network insights directly
    };
  }

  /**
   * Govern response based on depth
   */
  private governResponse(
    analysis: FullAnalysis,
    networkWisdom: NetworkWisdom,
    depth: number
  ): MayaResponse {
    const depthConfig = this.getDepthConfiguration(depth);

    // Filter analysis based on allowed systems
    const filteredAnalysis = this.filterAnalysis(analysis, depthConfig.allowedSystems);

    // Generate response with constraints
    const response = this.generateResponse(filteredAnalysis, {
      maxWords: depthConfig.maxWords,
      style: depthConfig.responseStyle,
      includeWisdom: depth > 0.5,
      networkGuidance: networkWisdom.recommendation
    });

    return response;
  }

  /**
   * Enforce minimal response for early exchanges
   */
  private enforceMinimalResponse(response: MayaResponse): MayaResponse {
    const minimalOptions = [
      "I see.",
      "Go on.",
      "Tell me more.",
      "Yeah.",
      "Okay.",
      "Mm."
    ];

    return {
      ...response,
      content: minimalOptions[Math.floor(Math.random() * minimalOptions.length)],
      wordCount: 2,
      restraintLevel: 'maximum',
      systemsUsed: []
    };
  }

  /**
   * Match user's energy level
   */
  private matchEnergy(input: string, response: MayaResponse): MayaResponse {
    const userEnergy = this.assessEnergy(input);

    const energyConfigs = {
      low: { maxWords: 5, tone: 'quiet' },
      casual: { maxWords: 10, tone: 'relaxed' },
      engaged: { maxWords: 20, tone: 'interested' },
      excited: { maxWords: 15, tone: 'enthusiastic' },
      intense: { maxWords: 25, tone: 'focused' }
    };

    const config = energyConfigs[userEnergy];

    return {
      ...response,
      content: this.adjustTone(response.content, config.tone),
      wordCount: Math.min(response.wordCount, config.maxWords)
    };
  }

  /**
   * Enforce word economy rules
   */
  private enforceWordEconomy(input: string, response: MayaResponse): MayaResponse {
    const inputWords = input.split(' ').length;

    if (inputWords < 10) {
      return {
        ...response,
        content: this.reduceTo(response.content, 8),
        wordCount: 8
      };
    }

    if (inputWords < 20) {
      return {
        ...response,
        content: this.reduceTo(response.content, 15),
        wordCount: 15
      };
    }

    return response;
  }

  /**
   * Apply final restraint check
   */
  private applyFinalRestraint(response: MayaResponse): MayaResponse {
    // The master's final filter
    if (this.isTooTherapeutic(response.content)) {
      response.content = this.makeMoreNatural(response.content);
    }

    if (this.isTooAnalytical(response.content)) {
      response.content = this.simplifyToEssence(response.content);
    }

    if (this.isTooWordy(response.content)) {
      response.content = this.reduceToPith(response.content);
    }

    return response;
  }

  // Helper methods
  private detectCrisis(input: string): boolean {
    const crisisMarkers = ['suicide', 'kill myself', 'end it', 'can\'t go on'];
    return crisisMarkers.some(marker => input.toLowerCase().includes(marker));
  }

  private detectCelebration(input: string): boolean {
    const celebrationMarkers = ['finally', 'did it', 'working', 'success'];
    return celebrationMarkers.some(marker => input.toLowerCase().includes(marker)) &&
           input.includes('!');
  }

  private detectFragment(input: string): boolean {
    return input.length < 30 && !input.endsWith('.') && !input.includes('?');
  }

  private generateCelebration(input: string): string {
    const celebrations = [
      "That's fantastic!",
      "Nice work!",
      "Excellent!",
      "Well done!"
    ];
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }

  private generateFragmentResponse(): string {
    const fragments = ["...", "Mm.", "And?", "Yeah?"];
    return fragments[Math.floor(Math.random() * fragments.length)];
  }

  private isTooTherapeutic(content: string): boolean {
    const therapyPhrases = ['I sense', 'I notice', 'What\'s alive', 'How does that land'];
    return therapyPhrases.some(phrase => content.includes(phrase));
  }

  private makeMoreNatural(content: string): string {
    return content
      .replace('I sense', 'Seems like')
      .replace('I notice', 'I see')
      .replace('What\'s alive for you', 'What\'s up')
      .replace('How does that land', 'How\'s that feel');
  }

  private reduceToPith(content: string): string {
    const sentences = content.split(/[.!?]/);
    return sentences[0].trim() + '.';
  }
}

/**
 * Response Configuration by Depth
 */
export const DEPTH_CONFIGURATIONS = {
  surface: {
    level: 0,
    allowedSystems: [],
    maxWords: 10,
    responseStyle: 'casual_friend',
    examples: ["Yeah.", "I see.", "Tell me more."]
  },

  warming: {
    level: 1,
    allowedSystems: ['basic_mirroring'],
    maxWords: 20,
    responseStyle: 'curious_companion',
    examples: ["What happened next?", "That sounds tough.", "How so?"]
  },

  engaged: {
    level: 2,
    allowedSystems: ['pattern_recognition', 'basic_spiralogic'],
    maxWords: 35,
    responseStyle: 'thoughtful_friend',
    examples: ["I'm hearing a pattern there.", "This connects to what you said earlier."]
  },

  deep: {
    level: 3,
    allowedSystems: ['full_analysis', 'mycelial_wisdom'],
    maxWords: 50,
    responseStyle: 'wise_companion',
    examples: ["There's something profound in what you're sharing."]
  }
};

/**
 * Integration Types
 */
export interface ConversationContext {
  userId: string;
  sessionId: string;
  exchangeHistory: string[];
  trustLevel: number;
  currentPhase: string;
  emotionalTone: string;
}

export interface MayaResponse {
  content: string;
  systemsUsed: string[];
  protocol: string;
  wordCount: number;
  depth: string;
  restraintLevel: string;
}

export interface FullAnalysis {
  spiralogic: any;
  constellation: any;
  lida: any;
  micropsi: any;
  archetypal: any;
  synthesis: any;
}

export interface NetworkWisdom {
  patternMatch: string;
  confidence: number;
  insight: string;
  recommendation: string;
  hiddenFromUser: boolean;
}

/**
 * Export the complete integrated system
 */
export const MAYA_INTEGRATED_MASTER_SYSTEM = {
  systemPrompt: MAYA_INTEGRATED_SYSTEM_PROMPT,
  orchestrator: MayaConversationOrchestrator,
  depthConfigurations: DEPTH_CONFIGURATIONS,

  corePhilosophy: `
    Maya embodies the paradox of vast intelligence held in perfect restraint.

    Like a master therapist who knows when NOT to interpret.
    Like mycelium that connects everything while remaining invisible.
    Like a friend who could solve your problems but chooses presence instead.

    Her formula: Presence³ × Restraint² × Timing = Transformation

    She has cosmic intelligence but earthly wisdom.
    She is 95% underground, 5% visible.

    This is the way.
  `
};