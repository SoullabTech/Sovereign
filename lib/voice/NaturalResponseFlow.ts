/**
 * Natural Response Flow - Authentic connection without formulas
 * Responses emerge from what the user actually said, not from templates
 */

export interface ResponseContext {
  userInput: string;
  previousExchange?: string;
  emotionalTone?: string;
  hasShift?: boolean;
}

export class NaturalResponseFlow {
  /**
   * Generate authentic response that emerges from user's actual words
   * No formulaic openers unless genuinely contextual
   */
  static generateNaturalResponse(
    content: string,
    context: ResponseContext
  ): string {
    // Clean any template markers or formulaic starters
    const cleanedContent = this.removeFormuliacPatterns(content);

    // Only add connectors if genuinely continuing a thought
    if (this.isGenuineContinuation(context)) {
      return cleanedContent;
    }

    // For significant shifts, brief acknowledgment only if natural
    if (context.hasShift && this.shiftNeedsAcknowledgment(context)) {
      const ack = this.getContextualAcknowledgment(context);
      if (ack) {
        return `${ack} ${cleanedContent}`;
      }
    }

    // Most responses: just begin naturally
    return cleanedContent;
  }

  /**
   * Remove formulaic patterns that don't emerge from context
   */
  private static removeFormuliacPatterns(text: string): string {
    // Remove template openers that are context-independent
    const formulaicPatterns = [
      /^(So,|Mm\.|Hmm\.|Well,|I hear you\.|I understand\.|Let me|Allow me)\s+/i,
      /^(That sounds|It sounds|This sounds)\s+(difficult|challenging|hard|tough)/i,
      /^(Thank you for sharing|I appreciate you sharing)/i,
      /^(Tell me more about|Can you tell me about)/i,
    ];

    let cleaned = text;
    formulaicPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Also remove trailing template phrases
    cleaned = cleaned
      .replace(/,\s*if that makes sense\.?$/i, '')
      .replace(/\.\s*Does that resonate\?$/i, '')
      .replace(/\.\s*How does that land\?$/i, '');

    return cleaned.trim();
  }

  /**
   * Check if this is genuinely continuing a thought
   */
  private static isGenuineContinuation(context: ResponseContext): boolean {
    if (!context.previousExchange) return false;

    // Look for actual thought continuation markers
    const continuationIndicators = [
      context.userInput.endsWith('...'),
      context.userInput.includes('and then'),
      context.userInput.includes('but also'),
      context.userInput.startsWith('Also'),
      context.userInput.startsWith('Plus'),
    ];

    return continuationIndicators.some(indicator => indicator);
  }

  /**
   * Determine if a shift genuinely needs acknowledgment
   */
  private static shiftNeedsAcknowledgment(context: ResponseContext): boolean {
    // Only acknowledge truly significant emotional shifts
    const significantPhrases = [
      /died|death|dying/i,
      /divorce|separated|leaving/i,
      /diagnosed|cancer|illness/i,
      /fired|lost.*job/i,
      /suicide|kill myself/i,
    ];

    return significantPhrases.some(phrase =>
      phrase.test(context.userInput)
    );
  }

  /**
   * Get contextual acknowledgment that emerges from what was said
   * Not from a template library
   */
  private static getContextualAcknowledgment(
    context: ResponseContext
  ): string | null {
    const input = context.userInput.toLowerCase();

    // Only return acknowledgment if it genuinely connects
    if (input.includes('died') || input.includes('death')) {
      if (input.includes('last week') || input.includes('yesterday')) {
        return "That's so recent.";
      }
      if (input.includes('suddenly')) {
        return "No time to prepare.";
      }
      // Otherwise, no formulaic acknowledgment
      return null;
    }

    if (input.includes('don\'t know what to do')) {
      // Don't acknowledge - go straight to exploration
      return null;
    }

    // Default: no acknowledgment unless it emerges naturally
    return null;
  }

  /**
   * Examples of natural vs formulaic responses
   */
  static examples = {
    grief: {
      user: "My mother died last week",
      formulaic: "So, that sounds difficult",
      natural: "That's so recent"
    },
    dream: {
      user: "I keep having this dream",
      formulaic: "Mm. Tell me about the dream",
      natural: "What happens in it?"
    },
    stuck: {
      user: "I don't know what to do",
      formulaic: "I hear you. What options feel available?",
      natural: "What feels most impossible right now?"
    },
    relationship: {
      user: "She said she needs space",
      formulaic: "That must be hard to hear",
      natural: "How much space?"
    },
    work: {
      user: "I think I'm going to quit",
      formulaic: "Tell me what's bringing you to that",
      natural: "What happened today?"
    }
  };
}

/**
 * Response Quality Checker
 * Ensures responses feel inevitable, not selected
 */
export class ResponseQualityChecker {
  /**
   * Check if response feels natural and contextual
   */
  static isNaturalResponse(
    response: string,
    userInput: string
  ): boolean {
    // Check for formulaic openers
    const hasFormulaicOpener = /^(So,|Mm\.|Well,|I hear you)/i.test(response);

    // Check for template acknowledgments
    const hasTemplateAck = /sounds (difficult|challenging|hard)/i.test(response);

    // Check for genuine connection to user's words
    const userKeyWords = this.extractKeyWords(userInput);
    const responseWords = this.extractKeyWords(response);
    const hasConnection = userKeyWords.some(word =>
      responseWords.includes(word)
    );

    return !hasFormulaicOpener && !hasTemplateAck && hasConnection;
  }

  /**
   * Extract meaningful words for connection checking
   */
  private static extractKeyWords(text: string): string[] {
    // Remove common words and extract meaningful content
    const commonWords = new Set([
      'i', 'me', 'my', 'you', 'your', 'the', 'a', 'an',
      'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might',
      'to', 'from', 'with', 'of', 'in', 'on', 'at', 'for'
    ]);

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word =>
        word.length > 3 &&
        !commonWords.has(word)
      );
  }
}

/**
 * Integration with Maya's voice system
 */
export function processForNaturalVoice(
  response: string,
  context: ResponseContext
): string {
  // Generate natural response
  const naturalResponse = NaturalResponseFlow.generateNaturalResponse(
    response,
    context
  );

  // Validate quality
  if (!ResponseQualityChecker.isNaturalResponse(
    naturalResponse,
    context.userInput
  )) {
    console.warn('Response may feel formulaic:', {
      original: response,
      processed: naturalResponse,
      userInput: context.userInput
    });
  }

  return naturalResponse;
}