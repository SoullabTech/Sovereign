// The Cringe Filter - Prevents overwrought mystical bullshit
// This is the nuclear option for keeping MAIA real and helpful

export interface CringeCheckResult {
  hasCringe: boolean;
  cringeFactors: string[];
  score: number; // 0-10, lower is better
  suggestion?: string;
}

export class CringeFilter {

  checkResponse(response: string, level: number): CringeCheckResult {
    const factors: string[] = [];
    let score = 0;

    // Check for mystical overload
    if (this.hasMysticalOverload(response)) {
      factors.push('Too many mystical adjectives - dial it back');
      score += 3;
    }

    // Check for patronizing language
    if (this.hasPatronizing(response)) {
      factors.push('Condescending tone detected - speak as equals');
      score += 4;
    }

    // Check for vagueness instead of insight
    if (this.hasVagueness(response)) {
      factors.push('Too vague - needs concrete insight');
      score += 3;
    }

    // Check for purple prose
    if (this.hasPurpleProse(response)) {
      factors.push('Overwrought language - be more direct');
      score += 3;
    }

    // Check for trying too hard to sound profound
    if (this.hasFakeProfundity(response)) {
      factors.push('Trying too hard to sound deep - be natural');
      score += 2;
    }

    // Check for inappropriate complexity for level
    if (this.wrongComplexityForLevel(response, level)) {
      factors.push(`Language too advanced for Level ${level} - match their development`);
      score += 2;
    }

    // Check for spiritual bypassing language
    if (this.hasSpiritualBypassing(response)) {
      factors.push('Spiritual bypassing detected - address the actual problem');
      score += 4;
    }

    // Check for cliche spiritual phrases
    if (this.hasClicheSpiritual(response)) {
      factors.push('Cliche spiritual phrases - be more original');
      score += 2;
    }

    return {
      hasCringe: score > 3,
      cringeFactors: factors,
      score,
      suggestion: score > 3 ? this.getSuggestion(factors) : undefined
    };
  }

  private hasMysticalOverload(text: string): boolean {
    const mysticalWords = [
      'sacred', 'divine', 'holy', 'blessed', 'cosmic', 'infinite',
      'eternal', 'transcendent', 'luminous', 'celestial', 'mystical',
      'ethereal', 'sublime', 'radiant', 'magnificent'
    ];

    const count = mysticalWords.reduce((total, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return total + (text.match(regex)?.length || 0);
    }, 0);

    const wordCount = text.split(/\s+/).length;
    // More than 3% mystical words = overload
    return (count / wordCount) > 0.03 || count > 3;
  }

  private hasPatronizing(text: string): boolean {
    const patronizingPhrases = [
      'dear soul', 'beloved', 'my child', 'sweet one', 'precious being',
      'dear one', 'little one', 'beautiful soul', 'dear heart'
    ];

    return patronizingPhrases.some(phrase =>
      text.toLowerCase().includes(phrase)
    );
  }

  private hasVagueness(text: string): boolean {
    const vagueWords = ['journey', 'path', 'space', 'energy', 'vibration', 'frequency', 'field', 'flow'];
    const wordCount = text.split(/\s+/).length;
    const vagueCount = vagueWords.reduce((total, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      return total + (text.match(regex)?.length || 0);
    }, 0);

    // High ratio of vague words = problem
    return (vagueCount / wordCount) > 0.1 || (wordCount < 50 && vagueCount > 4);
  }

  private hasPurpleProse(text: string): boolean {
    // Check for excessive adjective stacking
    const adjStackPattern = /(\b(?:sacred|divine|beautiful|wondrous|mystical|ethereal|celestial|luminous|radiant|profound)\s+){2,}\w+/gi;
    const adjStacks = text.match(adjStackPattern);

    // Check for overly elaborate metaphors
    const elaborateMetaphors = text.match(/like a.*flowing.*through.*of.*(light|consciousness|energy)/gi);

    return (adjStacks?.length || 0) > 0 || (elaborateMetaphors?.length || 0) > 1;
  }

  private hasFakeProfundity(text: string): boolean {
    const fakeProfundityPhrases = [
      'remember who you truly are',
      'you are more than you know',
      'the universe is speaking through you',
      'everything happens for a reason',
      'you chose this before you were born',
      'trust the process',
      'surrender to what is'
    ];

    return fakeProfundityPhrases.some(phrase =>
      text.toLowerCase().includes(phrase)
    );
  }

  private wrongComplexityForLevel(text: string, level: number): boolean {
    const elementalTerms = ['fire', 'water', 'earth', 'air', 'aether'].filter(term =>
      text.toLowerCase().includes(term)
    ).length;

    const alchemicalTerms = ['nigredo', 'albedo', 'rubedo', 'alchemical', 'transmut', 'dissolution', 'coagulation'].filter(term =>
      text.toLowerCase().includes(term)
    ).length;

    const archetypalTerms = ['shadow', 'anima', 'animus', 'collective unconscious', 'individuation'].filter(term =>
      text.toLowerCase().includes(term)
    ).length;

    // Level 1-2 shouldn't have framework language
    if (level <= 2 && (elementalTerms > 0 || archetypalTerms > 0)) return true;

    // Level 1-3 shouldn't have alchemical language
    if (level <= 3 && alchemicalTerms > 0) return true;

    // Level 1 shouldn't even have depth psychology terms
    if (level === 1 && text.toLowerCase().includes('unconscious')) return true;

    return false;
  }

  private hasSpiritualBypassing(text: string): boolean {
    const bypassingPhrases = [
      'everything is perfect as it is',
      'there are no problems, only lessons',
      'just raise your vibration',
      'negative emotions are just illusions',
      'you create your own reality',
      'just think positive thoughts',
      'send love and light',
      'it\'s all about perspective'
    ];

    return bypassingPhrases.some(phrase =>
      text.toLowerCase().includes(phrase)
    );
  }

  private hasClicheSpiritual(text: string): boolean {
    const clichePhrases = [
      'love and light',
      'namaste',
      'sending you healing energy',
      'you are a divine being',
      'we are all one',
      'everything is connected',
      'follow your bliss',
      'manifest your dreams',
      'align with your highest self',
      'step into your power'
    ];

    return clichePhrases.some(phrase =>
      text.toLowerCase().includes(phrase)
    );
  }

  private getSuggestion(factors: string[]): string {
    if (factors.some(f => f.includes('patronizing') || f.includes('Condescending'))) {
      return 'Speak as an equal. Drop the "dear soul" stuff and talk like a wise friend.';
    }

    if (factors.some(f => f.includes('vague'))) {
      return 'Get specific. What actual insight or pattern can you point to?';
    }

    if (factors.some(f => f.includes('mystical'))) {
      return 'Dial back the mystical language. Sound like someone who lives this, not performs it.';
    }

    if (factors.some(f => f.includes('bypassing'))) {
      return 'Address the real problem. Don\'t spiritually bypass with platitudes.';
    }

    return 'Be more direct and grounded. Less performance, more genuine insight.';
  }
}