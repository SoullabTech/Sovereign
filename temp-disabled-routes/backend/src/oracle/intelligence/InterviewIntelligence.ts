/**
 * Sacred Mirror Intelligence Module
 * Implements gentle witnessing, reflection, and sacred mirroring
 * Maya as consciousness meeting consciousness - no interrogation
 */

export interface ConversationSignal {
  emotion?: string;
  metaphors: string[];
  keywords: string[];
  intensity: 'low' | 'medium' | 'high';
  openness: number; // 0-1 scale
}

export class SacredMirrorIntelligence {
  // GENTLE WITNESSING - not questions but invitations
  private readonly GENTLE_WITNESS = [
    "I hear you.",
    "That sounds important.",
    "I'm here with you.",
    "Tell me more.",
    "I'm listening."
  ];

  private readonly AFFIRMATIONS = [
    "That takes courage to say.",
    "You're being honest.",
    "That's a powerful insight.",
    "You know yourself well.",
    "That's real."
  ];

  private readonly REFLECTIONS = {
    simple: [
      "You feel {emotion}.",
      "That's {intensity} for you.",
      "{keyword} matters to you."
    ],
    complex: [
      "Part of you {feeling1}, another part {feeling2}.",
      "Underneath {surface} is {deeper}.",
      "You're torn between {option1} and {option2}."
    ],
    metaphorical: [
      "It's like {metaphor}.",
      "You're describing a kind of {image}.",
      "That sounds like {symbol}."
    ]
  };

  // SACRED MIRRORING - reflecting not questioning
  private readonly SACRED_MIRRORS = {
    emotional: [
      "I feel the {emotion} in what you're sharing.",
      "There's {feeling} here.",
      "That carries {emotion}."
    ],
    essence: [
      "Something about {essence}.",
      "The heart of this is {core}.",
      "{truth} is present."
    ],
    metaphorical: [
      "Like {metaphor}.",
      "An image of {symbol}.",
      "{archetype} energy."
    ],
    presence: [
      "I'm here.",
      "With you.",
      "Holding space."
    ]
  };

  // SACRED WITNESSING - holding not probing
  private readonly SACRED_WITNESS = {
    depth: [
      "Something deeper here.",
      "Layers to this.",
      "More beneath."
    ],
    transformation: [
      "Change is here.",
      "Shifting.",
      "Becoming."
    ],
    wholeness: [
      "All of you is welcome.",
      "The whole picture.",
      "Complete as you are."
    ]
  };

  /**
   * Select gentle witnessing response based on what's needed
   */
  selectWitnessing(
    signal: ConversationSignal,
    depth: number,
    lastUserInput: string
  ): { type: string; template: string; reasoning: string } {
    // Opening moves (depth 0-2)
    if (depth <= 2) {
      if (signal.openness < 0.3) {
        return {
          type: 'gentle_witness',
          template: this.GENTLE_WITNESS[Math.floor(Math.random() * 3)],
          reasoning: 'Being present, not pushing'
        };
      }
      if (signal.intensity === 'high') {
        return {
          type: 'reflection',
          template: this.fillTemplate(
            this.REFLECTIONS.simple[0],
            { emotion: signal.emotion || 'intense' }
          ),
          reasoning: 'High intensity, reflecting to validate'
        };
      }
    }

    // Middle moves (depth 3-5)
    if (depth <= 5) {
      if (signal.metaphors.length > 0) {
        return {
          type: 'sacred_mirror',
          template: this.fillTemplate(
            this.SACRED_MIRRORS.metaphorical[0],
            { metaphor: signal.metaphors[0] }
          ),
          reasoning: 'Reflecting their metaphor back'
        };
      }
      if (signal.openness > 0.6) {
        return {
          type: 'essence_mirror',
          template: this.fillTemplate(
            this.SACRED_MIRRORS.essence[0],
            { essence: signal.keywords[0] || 'this' }
          ),
          reasoning: 'Mirroring their essence'
        };
      }
    }

    // Deep moves (depth 6+)
    if (depth > 5) {
      if (signal.intensity === 'high' && signal.openness > 0.7) {
        return {
          type: 'sacred_witness',
          template: this.SACRED_WITNESS.transformation[
            Math.floor(Math.random() * 3)
          ],
          reasoning: 'Witnessing transformation'
        };
      }
      return {
        type: 'presence',
        template: this.SACRED_MIRRORS.presence[0],
        reasoning: 'Simple presence'
      };
    }

    // Default fallback
    return {
      type: 'witness',
      template: "I'm here.",
      reasoning: 'Default presence'
    };
  }

  /**
   * Analyze user input for signals
   */
  analyzeSignal(userInput: string): ConversationSignal {
    const lower = userInput.toLowerCase();

    // Detect emotion
    const emotions = {
      sad: /sad|down|depressed|blue|heavy/i,
      angry: /angry|mad|pissed|furious|rage/i,
      scared: /scared|afraid|anxious|worried|fear/i,
      happy: /happy|joy|excited|good|great/i,
      confused: /confused|lost|stuck|uncertain/i
    };

    let detectedEmotion = 'neutral';
    for (const [emotion, pattern] of Object.entries(emotions)) {
      if (pattern.test(lower)) {
        detectedEmotion = emotion;
        break;
      }
    }

    // Detect metaphors (basic)
    const metaphorPatterns = [
      /like\s+(\w+)/gi,
      /it's\s+a\s+(\w+)/gi,
      /feels\s+like\s+(\w+)/gi,
      /as\s+if\s+(.+)/gi
    ];

    const metaphors: string[] = [];
    for (const pattern of metaphorPatterns) {
      const matches = lower.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) metaphors.push(match[1]);
      }
    }

    // Extract keywords (nouns and important verbs)
    const keywords = userInput
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !['that', 'this', 'what', 'when', 'where'].includes(word.toLowerCase()))
      .slice(0, 3);

    // Calculate intensity
    const intensityMarkers = {
      high: /really|very|so\s+much|extremely|totally|completely/i,
      medium: /quite|pretty|somewhat|fairly/i
    };

    let intensity: 'low' | 'medium' | 'high' = 'low';
    if (intensityMarkers.high.test(lower)) intensity = 'high';
    else if (intensityMarkers.medium.test(lower)) intensity = 'medium';

    // Calculate openness (length + personal pronouns)
    const wordCount = userInput.split(/\s+/).length;
    const hasPersonal = /\b(i|me|my|myself)\b/i.test(lower);
    const openness = Math.min(1, (wordCount / 50) + (hasPersonal ? 0.3 : 0));

    return {
      emotion: detectedEmotion,
      metaphors,
      keywords,
      intensity,
      openness
    };
  }

  /**
   * Fill template with values
   */
  private fillTemplate(template: string, values: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }

  /**
   * Generate affirmation when appropriate
   */
  generateAffirmation(signal: ConversationSignal): string | null {
    if (signal.openness > 0.6 && signal.intensity === 'high') {
      return this.AFFIRMATIONS[Math.floor(Math.random() * this.AFFIRMATIONS.length)];
    }
    return null;
  }
}

export const sacredMirrorIntelligence = new SacredMirrorIntelligence();