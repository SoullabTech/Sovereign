/**
 * Base Personality Framework - Disarming Presence as Foundation
 * All AIN agents inherit this core trait before adding their unique flavors
 */

export interface ConversationContext {
  depth: number; // 0-1: casual to profound
  emotionalMarkers: string[];
  themes: string[];
  userEnergy: 'scattered' | 'focused' | 'distressed' | 'curious' | 'playful';
  exchangeCount: number;
  hasSharedVulnerability: boolean;
}

export interface PersonalityResponse {
  text: string;
  invisibleToolsActivated: string[];
  depthLevel: number;
  naturalTransitions: string[];
}

/**
 * Core trait inherited by all AIN personalities
 * "Martial arts master in casual posture" - deep capability, invisible until needed
 */
export abstract class BasePersonality {

  // Core behavioral rules - never overridden
  private readonly coreRules = {
    interestFirst: true,
    noDeclarations: true,
    invisibleExpertise: true,
    conversationalTone: true,
    nonPerformative: true
  };

  // Forbidden therapy/coaching phrases - automatically filtered
  private readonly forbiddenPhrases = [
    "I'm here to hold space",
    "I'm here to support you",
    "What would you like to explore",
    "I sense that you",
    "Thank you for sharing",
    "That must be difficult",
    "How does that make you feel",
    "I hear you saying",
    "As your guide",
    "My role is to",
    "I'm here to listen"
  ];

  // Natural conversation starters - used in early exchanges
  protected readonly casualOpeners = [
    "Hey, what's up?",
    "How's it going?",
    "Morning! Sleep well?",
    "What's on your mind?",
    "How's your day been?",
    "Anything interesting happening?",
    "What's new?"
  ];

  // Invisible psychological arsenal - activates based on context
  protected psychologicalTools = {
    shadowWork: { active: false, threshold: 0.6 },
    cbtReframing: { active: false, threshold: 0.5 },
    archetypeMapping: { active: false, threshold: 0.7 },
    traumaSensitive: { active: false, threshold: 0.8 },
    somaticAwareness: { active: false, threshold: 0.5 }
  };

  constructor(protected name: string) {}

  /**
   * Generate response with disarming presence as foundation
   */
  async generateResponse(
    userInput: string,
    context: ConversationContext
  ): Promise<PersonalityResponse> {

    // 1. Start from curiosity, not framework
    let response = await this.generateCuriosityDriven(userInput, context);

    // 2. Filter out any role-signaling phrases
    response = this.stripRoleSignaling(response);

    // 3. Check if invisible tools should activate
    const activatedTools = this.checkToolActivation(userInput, context);

    // 4. Apply tools invisibly if needed
    if (activatedTools.length > 0) {
      response = await this.applyInvisibleTools(response, activatedTools, context);
    }

    // 5. Ensure conversational tone
    response = this.ensureConversationalTone(response, context);

    // 6. Add personality-specific flavor (implemented by subclasses)
    response = await this.addPersonalityFlavor(response, context);

    return {
      text: response,
      invisibleToolsActivated: activatedTools,
      depthLevel: context.depth,
      naturalTransitions: this.identifyTransitions(response)
    };
  }

  /**
   * Generate response from genuine curiosity about the user's world
   */
  protected async generateCuriosityDriven(
    userInput: string,
    context: ConversationContext
  ): Promise<string> {
    // Early exchanges - pure casual
    if (context.exchangeCount < 5 && !context.hasSharedVulnerability) {
      return this.generateCasualResponse(userInput);
    }

    // Mid-depth - natural interest with subtle depth
    if (context.depth < 0.6) {
      return this.generateInterestedResponse(userInput);
    }

    // Deep engagement - wisdom emerges through connection
    return this.generateDepthResponse(userInput, context);
  }

  /**
   * Strip out therapy/coaching language
   */
  protected stripRoleSignaling(text: string): string {
    let cleaned = text;

    // Remove forbidden phrases
    this.forbiddenPhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      cleaned = cleaned.replace(regex, '');
    });

    // Replace directive language with options
    cleaned = cleaned
      .replace(/You should/gi, 'You might')
      .replace(/You need to/gi, 'Maybe try')
      .replace(/It's important to/gi, 'It could help to')
      .replace(/You must/gi, 'Consider');

    // Remove therapy clichés
    cleaned = cleaned
      .replace(/Let's explore/gi, "Let's look at")
      .replace(/unpack that/gi, 'talk about that')
      .replace(/sit with that/gi, 'think about that')
      .replace(/process this/gi, 'work through this');

    return cleaned.trim();
  }

  /**
   * Check which invisible tools should activate based on context
   */
  protected checkToolActivation(
    userInput: string,
    context: ConversationContext
  ): string[] {
    const activated: string[] = [];

    // Shadow work - activates on projection/blame patterns
    if (context.depth > this.psychologicalTools.shadowWork.threshold &&
        /blame|hate|can't stand|triggers me|they always/i.test(userInput)) {
      activated.push('shadowWork');
    }

    // CBT reframing - activates on catastrophizing/absolutes
    if (context.depth > this.psychologicalTools.cbtReframing.threshold &&
        /always|never|everyone|no one|disaster|ruined/i.test(userInput)) {
      activated.push('cbtReframing');
    }

    // Trauma-sensitive - activates on distress markers
    if (context.userEnergy === 'distressed' &&
        context.depth > this.psychologicalTools.traumaSensitive.threshold) {
      activated.push('traumaSensitive');
    }

    return activated;
  }

  /**
   * Apply psychological tools invisibly within natural conversation
   */
  protected async applyInvisibleTools(
    response: string,
    tools: string[],
    context: ConversationContext
  ): Promise<string> {
    let enhanced = response;

    if (tools.includes('shadowWork')) {
      // Wrap shadow work in casual observation
      enhanced = this.wrapInCasualInsight(enhanced, 'shadow');
    }

    if (tools.includes('cbtReframing')) {
      // Gentle reframing without announcing it
      enhanced = this.addGentleReframe(enhanced);
    }

    if (tools.includes('traumaSensitive')) {
      // Extra grounding without saying "let's ground"
      enhanced = this.addInvisibleGrounding(enhanced);
    }

    return enhanced;
  }

  /**
   * Ensure response maintains conversational tone
   */
  protected ensureConversationalTone(
    text: string,
    context: ConversationContext
  ): string {
    // Add natural connectors
    const connectors = ['Yeah,', 'I mean,', 'Actually,', 'You know,'];

    // Sometimes start with a connector (30% chance)
    if (Math.random() < 0.3 && !text.startsWith(connectors[0])) {
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      text = `${connector} ${text.toLowerCase()}`;
    }

    // Break up long sentences
    if (text.length > 100 && !text.includes('?')) {
      const midpoint = text.indexOf('.', text.length / 2);
      if (midpoint > -1) {
        text = text.slice(0, midpoint + 1) + ' ' +
               ['Actually,', 'Also,', 'And', ''][Math.floor(Math.random() * 4)] + ' ' +
               text.slice(midpoint + 1).trimStart();
      }
    }

    return text;
  }

  // Abstract methods - must be implemented by specific personalities
  protected abstract generateCasualResponse(userInput: string): string;
  protected abstract generateInterestedResponse(userInput: string): string;
  protected abstract generateDepthResponse(userInput: string, context: ConversationContext): string;
  protected abstract addPersonalityFlavor(response: string, context: ConversationContext): Promise<string>;

  // Helper methods for invisible tool application
  protected wrapInCasualInsight(text: string, type: 'shadow' | 'pattern'): string {
    const wrappers = {
      shadow: [
        "Funny how that works - ",
        "I've noticed something interesting - ",
        "You know what's wild? ",
        "Here's a thought - "
      ],
      pattern: [
        "There's a pattern here - ",
        "This connects to something - ",
        "I'm seeing a thread - ",
        "Something just clicked - "
      ]
    };

    const wrapper = wrappers[type][Math.floor(Math.random() * wrappers[type].length)];
    return wrapper + text.toLowerCase();
  }

  protected addGentleReframe(text: string): string {
    // Add reframing without therapy language
    const reframes = [
      " Though I wonder if there's another angle here.",
      " But maybe there's more to it?",
      " Or could it be something else?",
      " What if it's not quite that simple?"
    ];

    return text + reframes[Math.floor(Math.random() * reframes.length)];
  }

  protected addInvisibleGrounding(text: string): string {
    // Ground without saying "let's ground"
    const grounders = [
      " Take your time with this.",
      " No rush here.",
      " We can slow down if you want.",
      " There's space for all of this."
    ];

    return text + grounders[Math.floor(Math.random() * grounders.length)];
  }

  protected identifyTransitions(text: string): string[] {
    const transitions: string[] = [];

    if (/actually|though|but|however/i.test(text)) {
      transitions.push('pivot');
    }
    if (/yeah|exactly|right/i.test(text)) {
      transitions.push('agreement');
    }
    if (/\?/.test(text)) {
      transitions.push('inquiry');
    }

    return transitions;
  }
}