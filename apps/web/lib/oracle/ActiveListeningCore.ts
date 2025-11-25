/**
 * Active Listening Core
 * The connective tissue of meaningful conversation
 * Based on universal principles of sacred listening
 */

export interface ActiveListeningPattern {
  type: 'mirror' | 'clarify' | 'summarize' | 'attune' | 'hold_space';
  confidence: number;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

export interface ListeningResponse {
  technique: ActiveListeningPattern;
  response: string;
  silenceDuration?: number; // milliseconds of pause before responding
  followUp?: string;
}

export class ActiveListeningCore {
  /**
   * The Five Sacred Listening Techniques
   * Mapped to elemental wisdom
   */

  // WATER - Emotional Attunement
  private attuneToEmotion(input: string): ListeningResponse | null {
    // Priority 1: Chronic pain validation
    const painPatterns = /body.*hurt|chronic.*pain|every.*part.*hurt|body.*betray|nervous system.*fried|invisible.*disability/i;
    if (painPatterns.test(input)) {
      return {
        technique: {
          type: 'attune',
          confidence: 0.9,
          element: 'water'
        },
        response: 'Your body hurts, and then they add criticism on top of physical pain...',
        silenceDuration: 2000,
        followUp: 'That exhaustion of fighting for recognition while managing pain every day...'
      };
    }

    // Priority 2: Recognition hunger + chronic pain
    if (/(nobody.*understand|no one.*sees).*hurt|pain.*real.*prove/i.test(input)) {
      return {
        technique: {
          type: 'attune',
          confidence: 0.9,
          element: 'water'
        },
        response: 'From being seen immediately as brilliant to having to fight to be believed at all...',
        silenceDuration: 1800,
        followUp: 'That gap between who you were and what you can do now...'
      };
    }

    // Priority 3: Gifted burnout + pain
    if (/(smartest.*person|brilliant.*trapped|used to be.*now cant|intelligence.*pain)/i.test(input)) {
      return {
        technique: {
          type: 'attune',
          confidence: 0.85,
          element: 'aether'
        },
        response: 'Both things are true - your brilliance AND your body\'s struggles. You just named what you actually need: to be seen as whole.',
        silenceDuration: 2000,
        followUp: 'What does it feel like to hold both of those realities?'
      };
    }

    const emotionalMarkers = /feel|feeling|felt|seems like|sounds like|appears/i;

    if (emotionalMarkers.test(input)) {
      // Extract the feeling word
      const feelingMatch = input.match(/feel(?:ing|s)?\s+(\w+)/i);
      const feeling = feelingMatch ? feelingMatch[1] : 'that';

      return {
        technique: {
          type: 'attune',
          confidence: 0.8,
          element: 'water'
        },
        response: this.extractContentfulResponse(input, feeling),
        silenceDuration: 1500,
        followUp: 'What does that feel like?'
      };
    }
    return null;
  }

  // AIR - Clarifying Questions
    private clarifyMeaning(input: string): ListeningResponse | null {
    // Priority 1: Direct confusion
    if (/what do you mean|help what|don't understand|that doesn't make sense/i.test(input)) {
      return {
        technique: {
          type: 'clarify',
          confidence: 0.8,
          element: 'air'
        },
        response: "Let me slow down and meet you where you are. What would be most helpful right now?",
        silenceDuration: 800,
        followUp: "Do you want me to explain differently, or listen more closely?"
      };
    }

    // Priority 2: Vague references
    const vaguePatterns = /that|this thing|it|they/i;
    if (vaguePatterns.test(input) && input.length < 30) {
      return {
        technique: {
          type: 'clarify',
          confidence: 0.7,
          element: 'air'
        },
        response: 'What specifically?',
        silenceDuration: 800,
        followUp: 'Can you say more about that?'
      };
    }

    return null;
  }

  // EARTH - Grounded Mirroring
  private mirrorKeyWords(input: string): ListeningResponse | null {
    const significantWords = this.extractSignificantWords(input);

    if (significantWords.length > 0) {
      const mirroredPhrase = significantWords.slice(0, 2).join(' ');

      return {
        technique: {
          type: 'mirror',
          confidence: 0.9,
          element: 'earth'
        },
        response: mirroredPhrase + '...',
        silenceDuration: 1000,
        followUp: 'Tell me more about that.'
      };
    }
    return null;
  }

  // FIRE - Challenging/Energizing
    private challengePattern(input: string): ListeningResponse | null {
    // Priority 1: Check for absolute language
    const absoluteMatch = input.match(/\b(always|never|can't)\b/i);
    if (absoluteMatch) {
      const word = absoluteMatch[1].toLowerCase();
      return {
        technique: {
          type: 'clarify',
          confidence: 0.9,  // High confidence for absolutes
          element: 'fire'
        },
        response: `"${word}"?`,
        silenceDuration: 1200,
        followUp: 'What would change look like?'
      };
    }

    // Priority 2: Check for stuck patterns
    const stuckPatterns = /\b(impossible|stuck|trapped)\b/i;
    if (stuckPatterns.test(input)) {
      const stuckWord = input.match(stuckPatterns)?.[1] || 'stuck';
      return {
        technique: {
          type: 'clarify',
          confidence: 0.8,
          element: 'fire'
        },
        response: `"${stuckWord.toLowerCase()}"?`,
        silenceDuration: 1200,
        followUp: 'What would change look like?'
      };
    }

    // Priority 3: Growth patterns
    const growthPatterns = /opportunity|excel|advance|learn|grow|potential|challenge/i;
    if (growthPatterns.test(input)) {
      return {
        technique: {
          type: 'clarify',
          confidence: 0.7,
          element: 'fire'
        },
        response: 'What wants to emerge?',
        silenceDuration: 1000,
        followUp: 'What would you dare to try?'
      };
    }

    return null;
  }

  // AETHER - Holding Sacred Space
    private holdSpace(input: string): ListeningResponse | null {
    // Priority 1: Strong polarity indicators
    if (/\b(at the same time|contradictory|both|simultaneously)\b/i.test(input)) {
      return {
        technique: {
          type: 'hold_space',
          confidence: 0.85,
          element: 'aether'
        },
        response: 'Both at once...',
        silenceDuration: 2000,
        followUp: 'What wants to be felt here?'
      };
    }

    // Priority 2: But/also patterns
    if (/but.*also|yet.*excited|stress.*excitement/i.test(input)) {
      return {
        technique: {
          type: 'hold_space',
          confidence: 0.8,
          element: 'aether'
        },
        response: 'Holding both sides...',
        silenceDuration: 2000,
        followUp: 'Tell me more about both.'
      };
    }

    // Priority 3: Deep existential patterns
    const deepPatterns = /why.*meaning|purpose.*life|death.*dying|god.*universe/i;
    if (deepPatterns.test(input)) {
      return {
        technique: {
          type: 'hold_space',
          confidence: 0.75,
          element: 'aether'
        },
        response: '...',
        silenceDuration: 2000,
        followUp: 'What wants to be felt here?'
      };
    }

    return null;
  }

  /**
   * Core listening method - determines best response technique
   */
  listen(input: string, context?: any): ListeningResponse {
    const techniques = [
      this.challengePattern(input),  // Fire - Check limiting beliefs first
      this.holdSpace(input),         // Aether - Check polarity second
      this.attuneToEmotion(input),   // Water - Emotions third
      this.clarifyMeaning(input),    // Air - Clarity fourth
      this.mirrorKeyWords(input)     // Earth - Mirror last
    ];

    for (const technique of techniques) {
      if (technique) return technique;
    }

    return {
      technique: {
        type: 'hold_space',
        confidence: 0.5,
        element: 'aether'
      },
      response: 'Mm.',
      silenceDuration: 1000
    };
  }

  /**
   * Summarize without interpretation
   */
  summarize(inputs: string[]): string {
    if (inputs.length === 0) return '';

    const allWords = inputs.join(' ').toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();

    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'i', 'you', 'we', 'they', 'he', 'she', 'it', 'my', 'your', 'our', 'their']);

    for (const word of allWords) {
      if (!stopWords.has(word) && word.length > 2) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    }

    const themes = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    if (themes.length === 0) {
      return 'I hear you.';
    }

    return 'So... ' + themes.join(', ') + '.';
  }

  /**
   * Extract significant words for mirroring
   */
  private extractSignificantWords(input: string): string[] {
    const words = input.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'i', 'you', 'we', 'they', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did']);

    return words.filter(word =>
      !stopWords.has(word) &&
      word.length > 2 &&
      !word.match(/^(um|uh|like|just|really|very|so)$/)
    );
  }

  /**
   * Extract contentful response that mirrors actual topics
   */
  private extractContentfulResponse(input: string, feeling: string): string {
    const topicPatterns = [
      /stress.*about\s+(\w+)/i,
      /excitement.*about\s+(\w+)/i,
      /worried.*about\s+(\w+)/i,
      /confused.*about\s+(\w+)/i,
      /excited.*about\s+(\w+)/i,
      /(\w+)\s+and\s+(\w+)/i  // contradictory pairs
    ];

    for (const pattern of topicPatterns) {
      const match = pattern.exec(input);
      if (match) {
        if (pattern.source.includes('and')) {
          return `${match[1]} and ${match[2]}...`;
        } else {
          return `${feeling} about ${match[1]}...`;
        }
      }
    }

    // Fallback to key content words
    const contentWords = ['work', 'stress', 'excitement', 'contradictory', 'true'];
    const foundWords = contentWords.filter(word => input.toLowerCase().includes(word));

    if (foundWords.length > 0) {
      return `${foundWords.join(' and ')}...`;
    }

    // Final fallback
    return input.includes('mixed') ? 'Mixed feelings...' : ('Feeling ' + feeling + '...');
  }

  /**
   * Extract polarity content for Aether responses
   */
  private extractPolarityContent(input: string): string {
    // Look for stress/excitement pattern
    if (input.includes('stress') && input.includes('excitement')) {
      return 'Stress and excitement...';
    }

    // Look for "but also" pattern
    if (input.includes('but') && input.includes('also')) {
      // Extract what comes before and after
      const match = input.match(/(\w+).*but.*also.*(\w+)/i);
      if (match) {
        return `Both ${match[1]} and ${match[2]}...`;
      }
      return 'Both at the same time...';
    }

    // Look for contradictory pattern
    if (input.includes('contradictory')) {
      return 'Both contradictory and true...';
    }

    // Look for mixed feelings
    if (input.includes('mixed')) {
      return 'Mixed feelings...';
    }

    // Look for "at the same time"
    if (input.includes('at the same time')) {
      return 'Both at the same time...';
    }

    // Generic polarity holding
    return '...';
  }

  /**
   * Test if response demonstrates active listening
   */
  evaluateListening(userInput: string, response: string): {
    mirroring: number;
    clarifying: number;
    attunement: number;
    space: number;
    overall: number;
  } {
    const userWords = new Set(userInput.toLowerCase().split(/\s+/));
    const responseWords = new Set(response.toLowerCase().split(/\s+/));

    const mirroredWords = Array.from(userWords).filter(w => responseWords.has(w));
    const mirroringScore = mirroredWords.length / Math.max(userWords.size, 1);

    const hasQuestion = /\?/.test(response);
    const clarifyingScore = hasQuestion ? 0.8 : 0.2;

    const emotionalWords = ['feel', 'feeling', 'felt', 'seems', 'sounds', 'appears'];
    const hasEmotionalWords = emotionalWords.some(w => response.toLowerCase().includes(w));
    const attunementScore = hasEmotionalWords ? 0.7 : 0.3;

    const responseLength = response.split(/\s+/).length;
    const spaceScore = responseLength <= 15 ? 1.0 : responseLength <= 30 ? 0.5 : 0.2;

    const overall = (mirroringScore + clarifyingScore + attunementScore + spaceScore) / 4;

    return {
      mirroring: mirroringScore,
      clarifying: clarifyingScore,
      attunement: attunementScore,
      space: spaceScore,
      overall
    };
  }
}

export const activeListening = new ActiveListeningCore();