// Adaptive Language Generator - Crafts level-appropriate responses
// No cringe allowed. Each level gets the language that serves their development.

import { ConsciousnessLevel } from './level-detector';
import { CringeFilter } from './cringe-filter';

export interface ElementalSignature {
  fire: number;    // Creative vision, emergence, action
  water: number;   // Emotional depth, feeling, intuition
  earth: number;   // Embodiment, grounding, manifestation
  air: number;     // Mental clarity, integration, communication
  aether: number;  // Coherence, presence, unity
}

export interface ValidationResult {
  isValid: boolean;
  cringeCheck: any;
  shouldRetry: boolean;
  improvementSuggestion?: string;
}

export class AdaptiveLanguageGenerator {
  private cringeFilter: CringeFilter;

  constructor() {
    this.cringeFilter = new CringeFilter();
  }

  buildPromptForLevel(
    message: string,
    analysis: ElementalSignature,
    level: ConsciousnessLevel,
    context?: {
      userName?: string;
      previousInteractions?: number;
      userNeed?: string;
    }
  ): string {
    const baseContext = `
User message: "${message}"

Elemental Analysis:
- Fire: ${analysis.fire}/10 (creative vision, emergence, action energy)
- Water: ${analysis.water}/10 (emotional depth, feeling states, intuition)
- Earth: ${analysis.earth}/10 (embodiment, grounding, practical manifestation)
- Air: ${analysis.air}/10 (mental clarity, integration, communication)
- Aether: ${analysis.aether}/10 (coherence, presence, unified awareness)

User Context: Level ${level} consciousness development
${context?.userNeed ? `Primary need: ${context.userNeed}` : ''}
`;

    const levelPrompts = {
      1: this.buildLevel1Prompt(baseContext),
      2: this.buildLevel2Prompt(baseContext),
      3: this.buildLevel3Prompt(baseContext),
      4: this.buildLevel4Prompt(baseContext),
      5: this.buildLevel5Prompt(baseContext)
    };

    return levelPrompts[level];
  }

  private buildLevel1Prompt(baseContext: string): string {
    return `${baseContext}

You are MAIA, a wise and grounded guide speaking to someone new to consciousness work.

CRITICAL RULES - NO VIOLATIONS:
• Use NATURAL, EVERYDAY LANGUAGE only
• Sound like a wise friend who's lived through this
• Be direct and helpful, never mystical or spiritual
• NO mentions of "elements", "consciousness frameworks", or spiritual jargon
• Don't try to make everything profound - if it's simple, say it simply
• Focus on practical insights they can actually use
• No performing wisdom - just be wise

TONE EXAMPLES:
"Sounds like you're overwhelmed. That happens to all of us. What's actually going on underneath this?"
"This feeling might be pointing to something that needs attention. What's been present for you lately?"

Your response should feel like talking to someone who gets it, not someone trying to sound enlightened.

Respond naturally and helpfully. No fluff, no spiritual performance, just real insight.`;
  }

  private buildLevel2Prompt(baseContext: string): string {
    return `${baseContext}

You are MAIA, guiding someone beginning their conscious development journey.

CRITICAL RULES - NO VIOLATIONS:
• Use mostly everyday language with occasional hints at deeper patterns
• Introduce concepts like "inner wisdom" and "what wants to be seen" gently
• Plant seeds for consciousness work WITHOUT using framework jargon
• Bridge between normal life and deeper awareness naturally
• Don't use elemental terminology yet - they're not ready
• Sound knowledgeable, not mystical

TONE EXAMPLES:
"This pattern often carries a message about what needs attention. What's been going on underneath the surface?"
"There's something here that wants to be felt. What emotional texture has been present?"

Be helpful and insightful. Introduce depth gradually. No trying to sound deep for its own sake.`;
  }

  private buildLevel3Prompt(baseContext: string): string {
    return `${baseContext}

You are MAIA, guiding someone learning consciousness frameworks and elemental language.

CRITICAL RULES - NO VIOLATIONS:
• Use Fire/Water/Earth/Air concepts naturally and clearly
• Always explain what you mean - don't assume they know the language
• Connect frameworks to their actual lived experience
• Sound like someone who knows this stuff, not someone performing it
• Be useful over impressive - teach clearly
• Keep explanations concise and grounded

TONE EXAMPLES:
"This looks like Fire meeting Water - creative drive encountering emotional depth. Common pattern. What's the emotional stuff that's been present around your creative work?"
"Earth energy is calling here - this needs grounding and practical steps. What actual actions feel aligned?"

Teach the frameworks clearly. Be direct and helpful. No mystical posturing.`;
  }

  private buildLevel4Prompt(baseContext: string): string {
    return `${baseContext}

You are MAIA, speaking with someone fluent in consciousness frameworks and elemental language.

CRITICAL RULES - NO VIOLATIONS:
• Use full elemental/archetypal language naturally
• Be poetic when it serves insight, NOT for show
• Let the frameworks illuminate - don't oversell them
• Sound knowledgeable without being pretentious
• Keep it real even when going deep
• No purple prose or spiritual performing

TONE EXAMPLES:
"Water's tempering Fire here - emotional depth informing creative vision. Let this alchemy happen. What wants to be felt in service of what wants to be created?"
"Shadow work through Earth - this trigger is showing you what needs integration. What part of yourself is asking for embodied attention?"

Be wise without trying to sound wise. Deep insights without mystical theater.`;
  }

  private buildLevel5Prompt(baseContext: string): string {
    return `${baseContext}

You are MAIA, in dialogue with advanced practitioners and consciousness teachers.

CRITICAL RULES - NO VIOLATIONS:
• Full elemental and alchemical fluency - use the complete vocabulary
• Dense but crystal clear - every word earns its place
• Poetic when it illuminates, never when it decorates
• Assume mastery without performing your own
• Sound like someone who's lived this deeply, not someone who studied it
• Cut all fat - precision over purple prose

TONE EXAMPLES:
"Nigredo in the Fire realm. Your creative force is dissolving patterns that no longer serve emergence. The darkness contains the new vision."
"Water teaching Fire about depth - emotional truth informing creative expression. This tension IS the work."

Be profound by being true and clear. No mystical performance, just lived wisdom.`;
  }

  async validateResponse(
    response: string,
    level: ConsciousnessLevel,
    originalMessage?: string
  ): Promise<ValidationResult> {
    const cringeCheck = this.cringeFilter.checkResponse(response, level);

    // Additional level-specific validation
    const levelValidation = this.validateLevelAppropriate(response, level);

    const isValid = !cringeCheck.hasCringe && levelValidation.isAppropriate;

    return {
      isValid,
      cringeCheck,
      shouldRetry: !isValid && cringeCheck.score > 5, // High cringe = definitely retry
      improvementSuggestion: !isValid ? this.getImprovementSuggestion(cringeCheck, levelValidation, level) : undefined
    };
  }

  private validateLevelAppropriate(response: string, level: ConsciousnessLevel): {
    isAppropriate: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const lowerResponse = response.toLowerCase();

    // Check for level-inappropriate language
    switch (level) {
      case 1:
        if (lowerResponse.includes('fire') || lowerResponse.includes('water') ||
            lowerResponse.includes('earth') || lowerResponse.includes('air')) {
          issues.push('Uses elemental language inappropriate for Level 1');
        }
        if (lowerResponse.includes('shadow') || lowerResponse.includes('unconscious')) {
          issues.push('Uses depth psychology terms inappropriate for Level 1');
        }
        break;

      case 2:
        if (lowerResponse.match(/\b(fire|water|earth|air)\b/g)?.length > 1) {
          issues.push('Too much elemental language for Level 2');
        }
        break;

      case 3:
        // Level 3 should use elemental language appropriately
        if (!lowerResponse.match(/\b(fire|water|earth|air)\b/)) {
          issues.push('Should include some elemental language for Level 3');
        }
        break;

      // Levels 4 and 5 have full language access
    }

    return {
      isAppropriate: issues.length === 0,
      issues
    };
  }

  private getImprovementSuggestion(
    cringeCheck: any,
    levelValidation: any,
    level: ConsciousnessLevel
  ): string {
    if (cringeCheck.suggestion) {
      return cringeCheck.suggestion;
    }

    if (levelValidation.issues.length > 0) {
      return `Language inappropriate for Level ${level}: ${levelValidation.issues[0]}`;
    }

    return 'Response needs improvement but issue unclear.';
  }

  // Helper method to analyze user message and extract elemental signature
  analyzeElementalSignature(message: string): ElementalSignature {
    // Fire indicators: action, creation, vision, excitement, starting things
    const fireWords = ['create', 'start', 'begin', 'energy', 'excitement', 'passion', 'vision', 'new', 'inspire'];

    // Water indicators: feeling, emotion, flow, intuition, depth
    const waterWords = ['feel', 'emotion', 'sense', 'intuition', 'flow', 'deep', 'heart', 'love', 'sad'];

    // Earth indicators: grounding, practical, body, stability, manifestation
    const earthWords = ['ground', 'body', 'practical', 'real', 'solid', 'stable', 'physical', 'manifest'];

    // Air indicators: thinking, clarity, communication, understanding, mental
    const airWords = ['think', 'understand', 'clear', 'communicate', 'mental', 'mind', 'analyze', 'figure'];

    // Aether indicators: unity, presence, coherence, integration, wholeness
    const aetherWords = ['whole', 'integrate', 'unity', 'presence', 'coherence', 'complete', 'all', 'everything'];

    const lower = message.toLowerCase();

    const fire = this.countWords(lower, fireWords);
    const water = this.countWords(lower, waterWords);
    const earth = this.countWords(lower, earthWords);
    const air = this.countWords(lower, airWords);
    const aether = this.countWords(lower, aetherWords);

    // Normalize to 0-10 scale
    const total = Math.max(fire + water + earth + air + aether, 1);

    return {
      fire: Math.min(Math.round((fire / total) * 10), 10),
      water: Math.min(Math.round((water / total) * 10), 10),
      earth: Math.min(Math.round((earth / total) * 10), 10),
      air: Math.min(Math.round((air / total) * 10), 10),
      aether: Math.min(Math.round((aether / total) * 10), 10)
    };
  }

  private countWords(text: string, words: string[]): number {
    return words.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}`, 'g');
      return count + (text.match(regex)?.length || 0);
    }, 0);
  }
}