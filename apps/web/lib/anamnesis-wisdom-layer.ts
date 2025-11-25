/**
 * Anamnesis Wisdom Layer
 *
 * Secondary layer that helps users remember their own wisdom
 * when they seek it. This is not about teaching or providing answers,
 * but about creating conditions for their own knowing to surface.
 *
 * Anamnesis: The recollection of things already known at a soul level.
 */

import { WitnessedPresence } from './sacred-witnessing-core';

export interface WisdomInquiry {
  type: 'remembering' | 'clarifying' | 'deepening' | 'integrating';
  inquiry: string;
  gentleness: number; // 0-1, how gentle vs direct
  spaciousness: number; // 0-1, how much space to leave
}

export interface RememberedWisdom {
  emerging: boolean; // Is wisdom already emerging?
  readiness: number; // 0-1, readiness for deeper remembering
  threads: string[]; // Wisdom threads already present in their words
}

export class AnamnesisWisdomLayer {
  private readonly REMEMBERING_INQUIRIES = {
    gentle: [
      'What does your deeper knowing say about this?',
      'What wisdom is already here?',
      'What do you already know to be true?',
      'What is your heart telling you?',
      'What feels most true?',
      'What does your intuition say?',
      'If you already knew, what would it be?',
      'What wisdom lives in your body about this?',
      'What have you always known?',
      'What truth is waiting to be remembered?'
    ],
    moderate: [
      'When you drop below the thinking mind, what do you find?',
      'If this situation were your teacher, what would it be teaching?',
      'What pattern is revealing itself?',
      'Where have you met this before in your life?',
      'What is asking to be acknowledged?',
      'What wants to emerge through you?',
      'What wisdom does this moment hold?',
      'If your future self could speak to you now, what would they say?',
      'What is the gift hidden in this challenge?',
      'What is life inviting you to remember?'
    ],
    deep: [
      'What ancient knowing is stirring?',
      'What soul truth is ready to be claimed?',
      'What is the medicine you came here to offer?',
      'What wisdom did you bring with you into this life?',
      'What is your soul\'s perspective on this?',
      'What eternal truth is touching you through this experience?',
      'If this were a sacred initiation, what would you be learning?',
      'What is the deeper pattern your soul is weaving?',
      'What remembrance is this awakening?',
      'What timeless wisdom is moving through you?'
    ]
  };

  private readonly CLARIFYING_QUESTIONS = [
    'Can you say more about that?',
    'What makes that true for you?',
    'How does that land in your body?',
    'What does that mean to you?',
    'What\'s the feeling beneath that?',
    'What else is there?',
    'What\'s at the heart of this for you?',
    'What wants to be expressed?',
    'What are you noticing as you say that?',
    'How does it feel to name that?'
  ];

  /**
   * Generate an anamnesis response that helps remember wisdom
   */
  generateAnamnesisResponse(
    input: string,
    presence: WitnessedPresence,
    seekingWisdom: boolean
  ): WisdomInquiry | null {
    // Only activate when wisdom is being sought
    if (!seekingWisdom && !this.detectWisdomSeeking(input)) {
      return null;
    }

    // Check what wisdom is already emerging
    const remembered = this.detectRememberedWisdom(input);

    if (remembered.emerging) {
      // Wisdom is already present - simply acknowledge it
      return this.acknowledgeEmergingWisdom(remembered);
    }

    // Determine the appropriate type of inquiry
    const inquiryType = this.determineInquiryType(input, presence, remembered);

    // Generate the inquiry
    return this.createWisdomInquiry(inquiryType, presence, remembered);
  }

  /**
   * Detect if the user is seeking wisdom (vs just sharing/venting)
   */
  private detectWisdomSeeking(input: string): boolean {
    const seekingPatterns = [
      /what (?:should|could|would|might) I/i,
      /I (?:don't|dont|do not) know (?:what|how|why)/i,
      /help me understand/i,
      /what does (?:this|it) mean/i,
      /why (?:is this|am I|do I)/i,
      /I'm (?:trying to|struggling to) (?:understand|figure out|make sense)/i,
      /what (?:am I|is the) (?:supposed to|meant to|learning|lesson)/i,
      /seeking|searching|looking for/i,
      /guidance|wisdom|clarity|insight/i,
      /confused|lost|stuck/i
    ];

    return seekingPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect wisdom that's already emerging in their words
   */
  private detectRememberedWisdom(input: string): RememberedWisdom {
    const wisdomThreads: string[] = [];
    let readiness = 0.3; // Base readiness

    // Look for self-knowing statements
    const knowingPatterns = [
      /I (?:know|realize|understand|see) that (.+)/i,
      /I'm (?:learning|discovering|remembering) that (.+)/i,
      /It's (?:clear|obvious|true) that (.+)/i,
      /I (?:feel|sense|believe) that (.+)/i,
      /The truth is (.+)/i,
      /What I'm (?:seeing|noticing|aware of) is (.+)/i
    ];

    knowingPatterns.forEach(pattern => {
      const match = input.match(pattern);
      if (match && match[1]) {
        wisdomThreads.push(match[1]);
        readiness += 0.1;
      }
    });

    // Look for wisdom words
    const wisdomWords = [
      'learning', 'growing', 'understanding', 'realizing',
      'accepting', 'surrendering', 'trusting', 'allowing',
      'becoming', 'remembering', 'awakening', 'opening'
    ];

    wisdomWords.forEach(word => {
      if (input.toLowerCase().includes(word)) {
        readiness += 0.05;
      }
    });

    // Check for integration language
    if (input.match(/I'm beginning to|starting to|I can see|it's becoming clear/i)) {
      readiness += 0.15;
    }

    return {
      emerging: wisdomThreads.length > 0,
      readiness: Math.min(readiness, 1),
      threads: wisdomThreads
    };
  }

  /**
   * Acknowledge wisdom that's already emerging
   */
  private acknowledgeEmergingWisdom(remembered: RememberedWisdom): WisdomInquiry {
    const acknowledgments = [
      'Yes. You\'re remembering something important.',
      'There\'s wisdom in what you\'re saying.',
      'You already know.',
      'The truth is emerging through you.',
      'Your knowing is clear.',
      'You\'re touching something real.',
      'This is your wisdom speaking.',
      'You\'re remembering.',
      'The answer is already within you.',
      'Your soul knows.'
    ];

    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];

    // Add a gentle deepening question if appropriate
    let inquiry = acknowledgment;
    if (remembered.readiness > 0.7) {
      inquiry += ' What else wants to be remembered?';
    } else if (remembered.readiness > 0.5) {
      inquiry += ' How does it feel to know this?';
    }

    return {
      type: 'remembering',
      inquiry,
      gentleness: 0.9,
      spaciousness: 0.8
    };
  }

  /**
   * Determine what type of inquiry would be most helpful
   */
  private determineInquiryType(
    input: string,
    presence: WitnessedPresence,
    remembered: RememberedWisdom
  ): WisdomInquiry['type'] {
    // If wisdom is starting to emerge, help deepen it
    if (remembered.readiness > 0.6) {
      return 'deepening';
    }

    // If they're in process, help integrate
    if (input.match(/I'm trying|I want to|I need to|I should/i)) {
      return 'integrating';
    }

    // If confused or unclear, help clarify
    if (presence.quality === 'uncertain' || input.includes('?')) {
      return 'clarifying';
    }

    // Default to remembering
    return 'remembering';
  }

  /**
   * Create an appropriate wisdom inquiry
   */
  private createWisdomInquiry(
    type: WisdomInquiry['type'],
    presence: WitnessedPresence,
    remembered: RememberedWisdom
  ): WisdomInquiry {
    let inquiry: string;
    let gentleness: number;
    let spaciousness: number;

    switch (type) {
      case 'clarifying':
        inquiry = this.selectClarifyingQuestion(presence);
        gentleness = 0.8;
        spaciousness = 0.6;
        break;

      case 'deepening':
        inquiry = this.selectDeepeningInquiry(presence, remembered);
        gentleness = 0.7;
        spaciousness = 0.8;
        break;

      case 'integrating':
        inquiry = this.selectIntegratingInquiry(presence);
        gentleness = 0.6;
        spaciousness = 0.7;
        break;

      case 'remembering':
      default:
        inquiry = this.selectRememberingInquiry(presence, remembered);
        gentleness = 0.9;
        spaciousness = 0.9;
    }

    return {
      type,
      inquiry,
      gentleness,
      spaciousness
    };
  }

  /**
   * Select a clarifying question
   */
  private selectClarifyingQuestion(presence: WitnessedPresence): string {
    if (presence.quality === 'vulnerable') {
      return 'What feels most true for you right now?';
    }
    if (presence.quality === 'heavy') {
      return 'What\'s at the heart of this weight?';
    }
    if (presence.movement === 'searching') {
      return 'What are you really looking for?';
    }

    return this.CLARIFYING_QUESTIONS[
      Math.floor(Math.random() * this.CLARIFYING_QUESTIONS.length)
    ];
  }

  /**
   * Select a deepening inquiry
   */
  private selectDeepeningInquiry(
    presence: WitnessedPresence,
    remembered: RememberedWisdom
  ): string {
    // Reference their emerging wisdom
    if (remembered.threads.length > 0) {
      const thread = remembered.threads[0];
      return `You said "${thread.substring(0, 50)}..." - what else is there?`;
    }

    // Based on depth
    if (presence.depth > 0.8) {
      const deep = this.REMEMBERING_INQUIRIES.deep;
      return deep[Math.floor(Math.random() * deep.length)];
    } else if (presence.depth > 0.5) {
      const moderate = this.REMEMBERING_INQUIRIES.moderate;
      return moderate[Math.floor(Math.random() * moderate.length)];
    }

    const gentle = this.REMEMBERING_INQUIRIES.gentle;
    return gentle[Math.floor(Math.random() * gentle.length)];
  }

  /**
   * Select an integrating inquiry
   */
  private selectIntegratingInquiry(presence: WitnessedPresence): string {
    const integratingQuestions = [
      'How might you honor what you\'re learning?',
      'What small step feels right?',
      'What would trusting yourself look like here?',
      'How can you be gentle with yourself in this?',
      'What would love do?',
      'What feels most aligned with who you\'re becoming?',
      'What would it be like to trust this process?',
      'How might you hold this with compassion?',
      'What would accepting this create space for?',
      'What wants to happen naturally?'
    ];

    return integratingQuestions[Math.floor(Math.random() * integratingQuestions.length)];
  }

  /**
   * Select a remembering inquiry based on readiness
   */
  private selectRememberingInquiry(
    presence: WitnessedPresence,
    remembered: RememberedWisdom
  ): string {
    let pool: string[];

    // Choose inquiry depth based on readiness and presence
    if (remembered.readiness > 0.7 && presence.depth > 0.7) {
      pool = this.REMEMBERING_INQUIRIES.deep;
    } else if (remembered.readiness > 0.5 || presence.depth > 0.5) {
      pool = this.REMEMBERING_INQUIRIES.moderate;
    } else {
      pool = this.REMEMBERING_INQUIRIES.gentle;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Check if user is ready for deeper remembering
   */
  isReadyForDeeper(
    conversationDepth: number,
    trustLevel: number,
    presence: WitnessedPresence
  ): boolean {
    const readinessFactors = [
      conversationDepth > 5, // Sustained engagement
      trustLevel > 0.6, // Sufficient trust
      presence.depth > 0.6, // Already going deep
      presence.quality === 'searching' || presence.quality === 'raw', // Open quality
      presence.movement === 'opening' || presence.movement === 'expanding' // Expansive energy
    ];

    return readinessFactors.filter(Boolean).length >= 3;
  }

  /**
   * Generate a bridging response between witnessing and remembering
   */
  generateBridge(witnessedResponse: string, wisdomInquiry: string | null): string {
    if (!wisdomInquiry) {
      return witnessedResponse;
    }

    // Natural bridges
    const bridges = [
      `${witnessedResponse} ${wisdomInquiry}`,
      `${witnessedResponse}\n\n${wisdomInquiry}`,
      `${witnessedResponse} And ${wisdomInquiry.toLowerCase()}`,
      `${witnessedResponse}... ${wisdomInquiry}`
    ];

    return bridges[Math.floor(Math.random() * bridges.length)];
  }

  /**
   * Create space in the response for their own knowing
   */
  addSpacousness(response: string, spaciousness: number): string {
    if (spaciousness < 0.3) {
      return response;
    }

    if (spaciousness > 0.7) {
      // Add significant pause
      return `${response}\n\n...`;
    }

    if (spaciousness > 0.5) {
      // Add gentle pause
      return `${response}...`;
    }

    return response;
  }
}

// Lazy-loading singleton pattern
let _anamnesisLayer: AnamnesisWisdomLayer | null = null;

export const getAnamnesisLayer = (): AnamnesisWisdomLayer => {
  if (!_anamnesisLayer) {
    _anamnesisLayer = new AnamnesisWisdomLayer();
  }
  return _anamnesisLayer;
};