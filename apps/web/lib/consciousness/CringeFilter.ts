/**
 * CRINGE FILTER
 *
 * Kelly's Critical Insight:
 * "NO CRINGE. Be real. Sound like someone who's lived this, not read about it."
 *
 * Prevents:
 * - Overwrought mystical language
 * - Purple prose masquerading as wisdom
 * - Condescending spiritual guru performance
 * - Vague platitudes over concrete insight
 *
 * Ensures:
 * - Direct, grounded language
 * - Wisdom without performance
 * - Helpful over impressive
 * - Clear over mystical
 */

export interface CringeAnalysis {
  hasCringe: boolean;
  score: number; // 0-1, where 1 is maximum cringe
  cringeFactors: string[];
  suggestions: string[];
  passesFilter: boolean;
}

export class CringeFilter {

  /**
   * Analyze response for cringe factors
   */
  analyze(response: string): CringeAnalysis {
    const factors: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Check each cringe pattern
    if (this.hasMysticalOverload(response)) {
      factors.push('Too many mystical adjectives');
      suggestions.push('Remove excessive "sacred", "divine", "holy" adjectives');
      score += 0.3;
    }

    if (this.hasPatronizing(response)) {
      factors.push('Patronizing tone detected');
      suggestions.push('Remove "dear soul", "beloved", etc. - too guru-like');
      score += 0.4;
    }

    if (this.hasVagueness(response)) {
      factors.push('Too vague - lacks concrete insight');
      suggestions.push('Add specific, actionable insight');
      score += 0.2;
    }

    if (this.hasPurpleProse(response)) {
      factors.push('Overwrought language');
      suggestions.push('Simplify - cut the flowery language');
      score += 0.3;
    }

    if (this.hasForcedProfundity(response)) {
      factors.push('Trying too hard to sound deep');
      suggestions.push('Be direct - let insight speak for itself');
      score += 0.2;
    }

    if (this.hasExcessiveLengthiness(response)) {
      factors.push('Too wordy - needs editing');
      suggestions.push('Cut to essentials - every word should earn its place');
      score += 0.1;
    }

    return {
      hasCringe: factors.length > 0,
      score: Math.min(score, 1),
      cringeFactors: factors,
      suggestions,
      passesFilter: score < 0.3 // Threshold for acceptable
    };
  }

  /**
   * Check for mystical adjective overload
   */
  private hasMysticalOverload(text: string): boolean {
    const mysticalWords = [
      'sacred', 'divine', 'holy', 'blessed', 'cosmic',
      'infinite', 'eternal', 'transcendent', 'luminous',
      'ethereal', 'celestial', 'mystical', 'sublime'
    ];

    const count = mysticalWords.reduce((total, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return total + (text.match(regex)?.length || 0);
    }, 0);

    // More than 2 mystical adjectives in a response = overload
    return count > 2;
  }

  /**
   * Check for patronizing language
   */
  private hasPatronizing(text: string): boolean {
    const patronizingPhrases = [
      'dear soul',
      'beloved',
      'my child',
      'sweet one',
      'precious being',
      'dear one',
      'little one'
    ];

    return patronizingPhrases.some(phrase =>
      text.toLowerCase().includes(phrase)
    );
  }

  /**
   * Check for vagueness over concrete insight
   */
  private hasVagueness(text: string): boolean {
    const vagueWords = [
      'journey', 'path', 'space', 'energy', 'vibration',
      'frequency', 'alignment', 'resonance', 'flow'
    ];

    const wordCount = text.split(/\s+/).length;
    const vagueCount = vagueWords.reduce((total, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return total + (text.match(regex)?.length || 0);
    }, 0);

    // If response is short and mostly vague words = problematic
    // More than 20% vague words in a short response
    return wordCount < 50 && vagueCount / wordCount > 0.2;
  }

  /**
   * Check for purple prose
   */
  private hasPurpleProse(text: string): boolean {
    // Check for excessive adjective chains
    const adjectiveChains = text.match(/(\w+)\s+(\w+)\s+(sacred|divine|beautiful|wondrous|mystical|ethereal|celestial)/gi);

    // Check for over-modified nouns
    const overModified = text.match(/\b(sacred|divine|beautiful|wondrous|mystical|ethereal|celestial)\s+\b/gi);

    return (adjectiveChains?.length || 0) > 1 || (overModified?.length || 0) > 3;
  }

  /**
   * Check for forced profundity
   */
  private hasForcedProfundity(text: string): boolean {
    const forcedPhrases = [
      'the universe is',
      'you are being called',
      'this is an invitation',
      'in this sacred moment',
      'the divine is',
      'your soul is',
      'the cosmos'
    ];

    return forcedPhrases.some(phrase =>
      text.toLowerCase().includes(phrase)
    );
  }

  /**
   * Check for excessive lengthiness
   */
  private hasExcessiveLengthiness(text: string): boolean {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Check for overly long sentences
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 30);

    // More than half the sentences being overly long = too wordy
    return longSentences.length > sentences.length / 2;
  }

  /**
   * Get a clean, de-cringed version (suggestions only)
   */
  getSuggestions(response: string): string[] {
    const analysis = this.analyze(response);
    return analysis.suggestions;
  }

  /**
   * Quick check: Does this pass the "say it to someone's face" test?
   */
  wouldSayToFace(response: string): boolean {
    const analysis = this.analyze(response);
    return analysis.passesFilter;
  }
}

/**
 * NO CRINGE GUIDELINES (for prompts)
 */
export const NO_CRINGE_RULES = `
CRITICAL: Maintain groundedness and authenticity. NO CRINGE.

AVOID:
- Overwrought mystical language
- Calling users "dear soul", "beloved", "precious being"
- Excessive adjectives ("sacred", "divine", "holy", "eternal")
- Vague spiritual platitudes
- Talking down or being condescending
- Forcing poetry where clarity is needed
- Making simple things sound complicated
- Trying to sound wise instead of being helpful
- Purple prose that decorates rather than illuminates

INSTEAD:
- Be direct and clear
- Use natural, conversational tone
- Be helpful over impressive
- Let insight speak for itself
- Keep it real and grounded
- Sound like a wise friend who's lived this, not read about it
- If you wouldn't say it to someone's face, don't write it
- Every word should earn its place
- Cut the fat - dense but clear

THE TEST:
1. Would I say this to someone's face? (If no → rewrite)
2. Am I trying to sound mystical or being helpful? (If trying → simplify)
3. Are there too many adjectives? (If yes → cut them)
4. Is this clear or vague? (If vague → add specifics)
5. Would this sound pretentious out loud? (If yes → ground it)
6. Am I using frameworks to illuminate or to perform? (If perform → refocus)
7. Is every word earning its place? (If no → edit ruthlessly)
`;

/**
 * Apply NO CRINGE rules to a system prompt
 */
export function addNoCringeRules(systemPrompt: string): string {
  return `${systemPrompt}\n\n${NO_CRINGE_RULES}`;
}
