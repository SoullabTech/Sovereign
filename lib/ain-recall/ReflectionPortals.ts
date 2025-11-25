/**
 * Reflection Portals - Transformation Witnessing
 *
 * Instead of quiz questions ("What is X?"), these are portals to witness evolution:
 * "Last time you explored this, you saw it as loss. What has it become now?"
 *
 * The point isn't to test recall - it's to witness transformation.
 */

import { ElementalCard, Element, Phase } from './ElementalCard';

export interface ReflectionPortal {
  id: string;
  cardId: string;
  type: 'evolution' | 'integration' | 'release' | 'amplification' | 'recognition';

  // The portal prompt
  prompt: string;

  // Context for the prompt
  context: {
    originalContent: string; // What you said/wrote before
    originalPhase: Phase;
    originalElement: Element;
    timeElapsed: number; // Days since card creation
    previousReflections?: Array<{
      date: Date;
      response: string;
      phaseAtTime: Phase;
    }>;
  };

  // Suggested contemplations
  contemplations: string[];

  // Optional: If this relates to a pattern
  patternName?: string;
  patternEvolution?: 'emerging' | 'deepening' | 'releasing' | 'transforming';
}

export interface ReflectionResponse {
  portalId: string;
  cardId: string;
  response: string;
  date: Date;

  // Self-assessment
  transformation: 'profound' | 'subtle' | 'ongoing' | 'complete' | 'new_layer';
  currentPhase: Phase;
  currentElement: Element;

  // Integration
  insights: string[];
  nextSteps?: string[];
}

/**
 * Reflection Portal Generator
 */
export class ReflectionPortalGenerator {
  /**
   * Generate a reflection portal for a card
   */
  async generatePortal(
    card: ElementalCard,
    previousResponses?: ReflectionResponse[]
  ): Promise<ReflectionPortal> {
    const timeElapsed = (Date.now() - card.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    // Determine portal type based on time and previous responses
    const type = this.determinePortalType(card, timeElapsed, previousResponses);

    // Generate prompt based on type
    const prompt = await this.generatePrompt(type, card, previousResponses);

    // Generate contemplations
    const contemplations = await this.generateContemplations(type, card);

    // Detect pattern evolution if applicable
    const patternInfo = await this.detectPatternEvolution(card, previousResponses);

    return {
      id: `portal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardId: card.id,
      type,
      prompt,
      context: {
        originalContent: card.content,
        originalPhase: card.phase,
        originalElement: card.elemental.primary,
        timeElapsed,
        previousReflections: previousResponses?.map(r => ({
          date: r.date,
          response: r.response,
          phaseAtTime: r.currentPhase
        }))
      },
      contemplations,
      patternName: patternInfo?.name,
      patternEvolution: patternInfo?.evolution
    };
  }

  /**
   * Determine what type of portal to open
   */
  private determinePortalType(
    card: ElementalCard,
    timeElapsed: number,
    previousResponses?: ReflectionResponse[]
  ): ReflectionPortal['type'] {
    // First review (7-30 days): Integration
    if (timeElapsed < 30 && (!previousResponses || previousResponses.length === 0)) {
      return 'integration';
    }

    // Medium term (30-90 days): Evolution
    if (timeElapsed >= 30 && timeElapsed < 90) {
      return 'evolution';
    }

    // Long term (90+ days): Recognition
    if (timeElapsed >= 90) {
      return 'recognition';
    }

    // If previous responses show completion: Release
    if (previousResponses?.some(r => r.transformation === 'complete')) {
      return 'release';
    }

    // If previous responses show deepening: Amplification
    if (previousResponses?.some(r => r.transformation === 'profound')) {
      return 'amplification';
    }

    return 'integration';
  }

  /**
   * Generate the portal prompt
   */
  private async generatePrompt(
    type: ReflectionPortal['type'],
    card: ElementalCard,
    previousResponses?: ReflectionResponse[]
  ): Promise<string> {
    const timeAgo = this.formatTimeAgo(card.createdAt);

    switch (type) {
      case 'integration':
        return this.generateIntegrationPrompt(card, timeAgo);

      case 'evolution':
        return this.generateEvolutionPrompt(card, timeAgo, previousResponses);

      case 'recognition':
        return this.generateRecognitionPrompt(card, timeAgo);

      case 'release':
        return this.generateReleasePrompt(card, timeAgo, previousResponses);

      case 'amplification':
        return this.generateAmplificationPrompt(card, timeAgo, previousResponses);

      default:
        return `Reflect on this memory from ${timeAgo}.`;
    }
  }

  /**
   * Integration prompts - for recent memories (7-30 days)
   */
  private generateIntegrationPrompt(card: ElementalCard, timeAgo: string): string {
    const prompts = [
      `${timeAgo}, you captured this: "${this.getExcerpt(card)}"\n\nWhat has landed from this experience?`,
      `Returning to this reflection from ${timeAgo}.\n\nWhat part of this has integrated into who you are now?`,
      `This ${card.elemental.primary} moment from ${timeAgo}.\n\nHow has it woven into your daily life?`,
      `You were in ${card.phase} phase ${timeAgo}.\n\nWhat from that time is still alive in you?`
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Evolution prompts - for medium-term memories (30-90 days)
   */
  private generateEvolutionPrompt(
    card: ElementalCard,
    timeAgo: string,
    previousResponses?: ReflectionResponse[]
  ): string {
    const lastResponse = previousResponses?.[previousResponses.length - 1];

    if (lastResponse) {
      return `Last time you explored this (from ${timeAgo}), you saw it as "${this.getExcerpt(lastResponse.response)}"\n\nWhat has it become now?`;
    }

    const prompts = [
      `${timeAgo}, this was alive in you: "${this.getExcerpt(card)}"\n\nHow has your relationship to this shifted?`,
      `You were working with ${card.elemental.primary} energy ${timeAgo}.\n\nWhat's evolved since then?`,
      `In ${card.phase} phase ${timeAgo}, you met this.\n\nWhere has it led you?`
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Recognition prompts - for long-term memories (90+ days)
   */
  private generateRecognitionPrompt(card: ElementalCard, timeAgo: string): string {
    const prompts = [
      `${timeAgo}, you wrote: "${this.getExcerpt(card)}"\n\nDoes this person who wrote this still exist in you? What remains?`,
      `This was you ${timeAgo}.\n\nWhat do you recognize? What feels distant?`,
      `Looking back ${timeAgo} at this ${card.elemental.primary} moment.\n\nWhat can you see now that you couldn't see then?`,
      `${timeAgo}, you were here: "${card.title}"\n\nWhat has this taught you across this time?`
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Release prompts - when transformation feels complete
   */
  private generateReleasePrompt(
    card: ElementalCard,
    timeAgo: string,
    previousResponses?: ReflectionResponse[]
  ): string {
    const prompts = [
      `This pattern from ${timeAgo} has moved through you.\n\nWhat gratitude or blessing do you have for it as you release it?`,
      `You've been holding this since ${timeAgo}.\n\nIs it complete? What wants to be released?`,
      `This ${card.elemental.primary} teaching from ${timeAgo}.\n\nHas it given you what it came to give?`
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Amplification prompts - when something is deepening
   */
  private generateAmplificationPrompt(
    card: ElementalCard,
    timeAgo: string,
    previousResponses?: ReflectionResponse[]
  ): string {
    const prompts = [
      `This keeps returning: "${this.getExcerpt(card)}"\n\nWhat wants to deepen here?`,
      `${timeAgo} you first met this. It keeps coming back.\n\nWhat is it showing you?`,
      `This ${card.elemental.primary} thread from ${timeAgo} is still weaving.\n\nWhat wants to be amplified?`
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Generate contemplations - supporting questions
   */
  private async generateContemplations(
    type: ReflectionPortal['type'],
    card: ElementalCard
  ): Promise<string[]> {
    const base = [
      'What feels different now?',
      'What feels the same?',
      'What surprises you about revisiting this?'
    ];

    const typeSpecific: Record<typeof type, string[]> = {
      integration: [
        'What from this has become part of your daily practice?',
        'Where do you see this wisdom showing up?',
        'What resistance or ease do you notice?'
      ],
      evolution: [
        'How has your language around this changed?',
        'What did you not see then that you see now?',
        'What was true then that\'s still true?'
      ],
      recognition: [
        'Who were you then?',
        'What do you want to say to that version of yourself?',
        'What has been the through-line?'
      ],
      release: [
        'What are you ready to let go of?',
        'What wants to stay?',
        'What blessing do you offer this pattern?'
      ],
      amplification: [
        'What depth is calling?',
        'Where does this want to go next?',
        'What wants to be magnified?'
      ]
    };

    return [...base, ...typeSpecific[type]];
  }

  /**
   * Detect pattern evolution across responses
   */
  private async detectPatternEvolution(
    card: ElementalCard,
    previousResponses?: ReflectionResponse[]
  ): Promise<{ name: string; evolution: ReflectionPortal['patternEvolution'] } | null> {
    if (!card.patterns || card.patterns.length === 0) return null;
    if (!previousResponses || previousResponses.length === 0) return null;

    // TODO: Implement sophisticated pattern evolution detection
    // For now, return null
    return null;
  }

  /**
   * Helper: Format time ago
   */
  private formatTimeAgo(date: Date): string {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }

  /**
   * Helper: Get excerpt from card or response
   */
  private getExcerpt(cardOrText: ElementalCard | string, maxLength: number = 100): string {
    const text = typeof cardOrText === 'string' ? cardOrText : cardOrText.summary || cardOrText.content;
    const firstSentence = text.split(/[.!?]/)[0];
    return firstSentence.length > maxLength
      ? firstSentence.slice(0, maxLength) + '...'
      : firstSentence;
  }

  /**
   * Generate multiple portals for a review session
   */
  async generatePortalSet(
    cards: Array<{ card: ElementalCard; previousResponses?: ReflectionResponse[] }>,
    maxPortals: number = 5
  ): Promise<ReflectionPortal[]> {
    const portals: ReflectionPortal[] = [];

    // Sort cards by different criteria to create a meaningful sequence
    const sorted = this.sortCardsForReview(cards);

    for (let i = 0; i < Math.min(maxPortals, sorted.length); i++) {
      const { card, previousResponses } = sorted[i];
      const portal = await this.generatePortal(card, previousResponses);
      portals.push(portal);
    }

    return portals;
  }

  /**
   * Sort cards to create a meaningful review sequence
   */
  private sortCardsForReview(
    cards: Array<{ card: ElementalCard; previousResponses?: ReflectionResponse[] }>
  ): Array<{ card: ElementalCard; previousResponses?: ReflectionResponse[] }> {
    // TODO: Implement sophisticated sorting
    // Could consider:
    // - Elemental balance (review different elements)
    // - Temporal spread (mix of recent and old)
    // - Pattern continuity (related patterns together)
    // - Transformation arc (tell a story)

    return cards;
  }
}

/**
 * Portal Response Processor
 */
export class PortalResponseProcessor {
  /**
   * Process a user's response to a reflection portal
   */
  async processResponse(
    portal: ReflectionPortal,
    userResponse: string
  ): Promise<ReflectionResponse> {
    // Analyze the response
    const analysis = await this.analyzeResponse(userResponse, portal.context.originalContent);

    return {
      portalId: portal.id,
      cardId: portal.cardId,
      response: userResponse,
      date: new Date(),
      transformation: analysis.transformation,
      currentPhase: analysis.phase,
      currentElement: analysis.element,
      insights: analysis.insights
    };
  }

  /**
   * Analyze a reflection response
   */
  private async analyzeResponse(
    response: string,
    originalContent: string
  ): Promise<{
    transformation: ReflectionResponse['transformation'];
    phase: Phase;
    element: Element;
    insights: string[];
  }> {
    // TODO: Implement AI-based analysis of transformation
    // This would compare original content with current response
    // to detect evolution, integration, etc.

    return {
      transformation: 'ongoing',
      phase: 'integration',
      element: 'water',
      insights: []
    };
  }

  /**
   * Generate follow-up prompts based on response
   */
  async generateFollowUp(response: ReflectionResponse): Promise<string[]> {
    const followUps: string[] = [];

    if (response.transformation === 'profound') {
      followUps.push('What wants to be done with this transformation?');
      followUps.push('Who needs to know about this shift in you?');
    }

    if (response.transformation === 'complete') {
      followUps.push('What gratitude do you have for this journey?');
      followUps.push('What becomes possible now that this has completed?');
    }

    if (response.transformation === 'new_layer') {
      followUps.push('What depth just revealed itself?');
      followUps.push('How does this layer change the whole?');
    }

    return followUps;
  }
}
