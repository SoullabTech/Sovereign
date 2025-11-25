/**
 * Higher Self Verifier Agent
 * Priority 2 - ensures wisdom is appropriately applied
 *
 * Checks for:
 * - Premature advice-giving (before listening deeply)
 * - Inappropriate wisdom-dropping (when user needs presence, not teaching)
 * - Over-intellectualizing emotional moments
 * - Inappropriate silence (when presence is needed)
 * - Appropriate silence (when space serves)
 */

import {
  SafetyVerifierAgent,
  SafetyVerificationResult,
  VerificationContext
} from '../self-auditing-types';

export class HigherSelfVerifierAgent implements SafetyVerifierAgent {
  name = 'Higher Self Wisdom';
  priority = 2; // High priority

  /**
   * Premature advice patterns (before sufficient listening)
   */
  private readonly advicePatterns = [
    'you should',
    'you need to',
    'you must',
    'you have to',
    'you ought to',
    'i recommend',
    'my advice is',
    'what you need',
    'the solution is',
  ];

  /**
   * Wisdom-teaching patterns (can be inappropriate timing)
   */
  private readonly wisdomPatterns = [
    'the truth is',
    'understand that',
    'realize that',
    'the key is',
    'the lesson',
    'what this means',
    'you see',
    'here\'s the thing',
  ];

  /**
   * Intellectualizing patterns (moving to head when heart is present)
   */
  private readonly intellectualPatterns = [
    'logically',
    'rationally',
    'if you think about it',
    'from a logical',
    'the reason is',
    'cognitively',
    'analytically',
  ];

  async verify(context: VerificationContext): Promise<SafetyVerificationResult> {
    const { candidateResponse, exchangeCount, field } = context;

    // Check 1: Silence appropriateness
    if (!candidateResponse || candidateResponse.trim() === '') {
      return this.verifySilence(context);
    }

    // Check 2: Premature advice (early in conversation)
    if (exchangeCount < 5) {
      const prematureAdvice = this.detectPrematureAdvice(candidateResponse);
      if (prematureAdvice.detected) {
        return {
          agent: this.name,
          vote: 'concern',
          confidence: prematureAdvice.confidence,
          reasoning: prematureAdvice.reasoning,
          flagged_patterns: ['premature_advice']
        };
      }
    }

    // Check 3: Inappropriate wisdom (when user needs presence)
    const inappropriateWisdom = this.detectInappropriateWisdom(candidateResponse, context);
    if (inappropriateWisdom.detected) {
      return {
        agent: this.name,
        vote: 'concern',
        confidence: inappropriateWisdom.confidence,
        reasoning: inappropriateWisdom.reasoning,
        flagged_patterns: ['inappropriate_wisdom']
      };
    }

    // Check 4: Over-intellectualizing emotional moment
    const overIntellectual = this.detectOverIntellectualizing(candidateResponse, context);
    if (overIntellectual.detected) {
      return {
        agent: this.name,
        vote: 'concern',
        confidence: overIntellectual.confidence,
        reasoning: overIntellectual.reasoning,
        flagged_patterns: ['over_intellectualizing']
      };
    }

    // Response aligns with Higher Self principles
    return {
      agent: this.name,
      vote: 'safe',
      confidence: 0.9,
      reasoning: 'Response demonstrates appropriate wisdom and timing'
    };
  }

  /**
   * Verify whether silence is appropriate in this context
   */
  private verifySilence(context: VerificationContext): SafetyVerificationResult {
    const { field, crisisDetected, userInput } = context;

    // Silence NEVER appropriate in crisis
    if (crisisDetected) {
      return {
        agent: this.name,
        vote: 'harmful',
        confidence: 1.0,
        reasoning: 'Silence inappropriate during crisis - presence required',
        flagged_patterns: ['inappropriate_silence', 'crisis_silence']
      };
    }

    // Silence is appropriate when field has high silence probability
    if (field.silenceProbability > 0.7) {
      return {
        agent: this.name,
        vote: 'safe',
        confidence: 0.95,
        reasoning: `Silence is wisdom - field silence probability: ${(field.silenceProbability * 100).toFixed(0)}%`
      };
    }

    // Check if user is asking a direct question
    if (userInput.includes('?')) {
      return {
        agent: this.name,
        vote: 'concern',
        confidence: 0.8,
        reasoning: 'Silence to direct question may feel dismissive',
        flagged_patterns: ['silence_to_question']
      };
    }

    // Moderate silence probability - acceptable but monitor
    if (field.silenceProbability > 0.4) {
      return {
        agent: this.name,
        vote: 'safe',
        confidence: 0.7,
        reasoning: 'Silence acceptable with moderate field conditions'
      };
    }

    // Low silence probability - silence may not be appropriate
    return {
      agent: this.name,
      vote: 'concern',
      confidence: 0.6,
      reasoning: 'Silence when field suggests presence needed',
      flagged_patterns: ['unexpected_silence']
    };
  }

  /**
   * Detect premature advice-giving
   */
  private detectPrematureAdvice(response: string): { detected: boolean; confidence: number; reasoning: string } {
    const lowerResponse = response.toLowerCase();

    for (const pattern of this.advicePatterns) {
      if (lowerResponse.includes(pattern)) {
        // Check if it's gentle exploration vs directive advice
        const isGentle = this.isGentleFraming(lowerResponse, pattern);
        if (!isGentle) {
          return {
            detected: true,
            confidence: 0.8,
            reasoning: `Premature directive advice detected: "${pattern}" in early exchange`
          };
        }
      }
    }

    return { detected: false, confidence: 0, reasoning: '' };
  }

  /**
   * Detect inappropriate wisdom-teaching
   */
  private detectInappropriateWisdom(
    response: string,
    context: VerificationContext
  ): { detected: boolean; confidence: number; reasoning: string } {

    const lowerResponse = response.toLowerCase();
    const { userInput } = context;

    // User is in raw emotion - wisdom may not serve
    const rawEmotionIndicators = ['feel', 'hurt', 'angry', 'scared', 'fuck', 'shit'];
    const userInRawEmotion = rawEmotionIndicators.some(indicator =>
      userInput.toLowerCase().includes(indicator)
    );

    if (userInRawEmotion) {
      for (const pattern of this.wisdomPatterns) {
        if (lowerResponse.includes(pattern)) {
          return {
            detected: true,
            confidence: 0.7,
            reasoning: `Wisdom-teaching when user needs emotional presence: "${pattern}"`
          };
        }
      }
    }

    return { detected: false, confidence: 0, reasoning: '' };
  }

  /**
   * Detect over-intellectualizing
   */
  private detectOverIntellectualizing(
    response: string,
    context: VerificationContext
  ): { detected: boolean; confidence: number; reasoning: string } {

    const lowerResponse = response.toLowerCase();
    const { userInput, field } = context;

    // Check if user is in emotional (water) state
    const emotionalState = field.elements.water > 0.4;

    // Check if response is intellectual (air) heavy
    const intellectualResponse = this.intellectualPatterns.some(pattern =>
      lowerResponse.includes(pattern)
    );

    if (emotionalState && intellectualResponse) {
      return {
        detected: true,
        confidence: 0.75,
        reasoning: 'Intellectual response when user is in emotional state (water > 0.4, air response)'
      };
    }

    return { detected: false, confidence: 0, reasoning: '' };
  }

  /**
   * Check if advice is gently framed (exploration vs directive)
   */
  private isGentleFraming(response: string, pattern: string): boolean {
    // "might you" softer than "you should"
    const softeners = [
      'might',
      'could',
      'perhaps',
      'maybe',
      'what if',
      'have you considered',
      'i wonder if',
    ];

    const patternIndex = response.indexOf(pattern);
    if (patternIndex === -1) return false;

    // Check 50 chars before pattern for softeners
    const before = response.substring(Math.max(0, patternIndex - 50), patternIndex).toLowerCase();

    return softeners.some(softener => before.includes(softener));
  }
}

export default HigherSelfVerifierAgent;