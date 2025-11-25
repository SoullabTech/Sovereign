/**
 * AWARENESS LEVEL DETECTOR
 *
 * Detects user's familiarity with transformation frameworks
 * (Alchemy, Spiralogic, Jung, IFS, Polyvagal, McGilchrist, Levin)
 *
 * Enables MAIA to speak at appropriate sophistication level:
 * - Beginner: Everyday language, metaphors, no jargon
 * - Familiar: Some framework language with explanations
 * - Intermediate: Framework concepts, technical terms explained
 * - Advanced: Full framework language, precision
 * - Master: Spiralogic alchemist - complete technical precision
 */

export type AwarenessLevel = 'beginner' | 'familiar' | 'intermediate' | 'advanced' | 'master';

export interface AwarenessProfile {
  level: AwarenessLevel;
  score: number; // 0-100
  frameworkFamiliarity: {
    alchemy: number; // 0-1
    spiralogic: number; // 0-1
    jung: number; // 0-1
    ifs: number; // 0-1
    polyvagal: number; // 0-1
    mcgilchrist: number; // 0-1
    levin: number; // 0-1
  };
  indicators: string[];
  suggestedLanguageStyle: string;
}

export class AwarenessLevelDetector {

  /**
   * Detect user's awareness level from conversation history
   */
  detect(conversationHistory: string[], userProfile?: any): AwarenessProfile {
    const fullText = conversationHistory.join(' ').toLowerCase();

    // Calculate familiarity with each framework
    const frameworkFamiliarity = {
      alchemy: this.detectAlchemyFamiliarity(fullText),
      spiralogic: this.detectSpiralogicFamiliarity(fullText),
      jung: this.detectJungFamiliarity(fullText),
      ifs: this.detectIFSFamiliarity(fullText),
      polyvagal: this.detectPolyvagalFamiliarity(fullText),
      mcgilchrist: this.detectMcGilchristFamiliarity(fullText),
      levin: this.detectLevinFamiliarity(fullText)
    };

    // Calculate overall awareness score (0-100)
    const frameworkScores = Object.values(frameworkFamiliarity);
    const averageScore = frameworkScores.reduce((sum, score) => sum + score, 0) / frameworkScores.length;
    const awarenessScore = Math.round(averageScore * 100);

    // Detect indicators of awareness
    const indicators = this.detectIndicators(fullText, frameworkFamiliarity);

    // Determine level
    const level = this.determineLevel(awarenessScore);

    // Suggest language style
    const suggestedLanguageStyle = this.suggestLanguageStyle(level, frameworkFamiliarity);

    return {
      level,
      score: awarenessScore,
      frameworkFamiliarity,
      indicators,
      suggestedLanguageStyle
    };
  }

  /**
   * Detect alchemy familiarity
   */
  private detectAlchemyFamiliarity(text: string): number {
    let score = 0;

    // Basic alchemical terms (0.2 each, max 0.4)
    const basicTerms = ['nigredo', 'albedo', 'citrinitas', 'rubedo', 'shadow', 'integration', 'transformation'];
    const basicCount = basicTerms.filter(term => text.includes(term)).length;
    score += Math.min(basicCount * 0.2, 0.4);

    // Intermediate terms (0.3 each, max 0.6)
    const intermediateTerms = ['calcinatio', 'solutio', 'coagulatio', 'sublimatio', 'coniunctio', 'mortificatio', 'separatio'];
    const intermediateCount = intermediateTerms.filter(term => text.includes(term)).length;
    score += Math.min(intermediateCount * 0.3, 0.6);

    // Advanced terms (0.4 each, max 0.8)
    const advancedTerms = ['mercurius', 'prima materia', 'philosophers stone', 'opus', 'vas hermetis', 'rebis'];
    const advancedCount = advancedTerms.filter(term => text.includes(term)).length;
    score += Math.min(advancedCount * 0.4, 0.8);

    // Master level: correct usage of operations + coherence concepts
    if (text.includes('coherence') && (text.includes('operation') || text.includes('stage'))) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Detect Spiralogic familiarity
   */
  private detectSpiralogicFamiliarity(text: string): number {
    let score = 0;

    // Basic: elemental language
    if (/\b(fire|water|earth|air|aether)\b/.test(text) && /element/i.test(text)) {
      score += 0.3;
    }

    // Intermediate: spiral concepts
    if (/spiral|cycle|phase|descent|ascent/i.test(text)) {
      score += 0.3;
    }

    // Advanced: spiralogic-specific language
    if (/spiralogic|werner|genetic principle/i.test(text)) {
      score += 0.4;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Detect Jung familiarity
   */
  private detectJungFamiliarity(text: string): number {
    let score = 0;

    // Basic Jungian terms
    const basicTerms = ['shadow', 'archetype', 'unconscious', 'individuation'];
    const basicCount = basicTerms.filter(term => text.includes(term)).length;
    score += Math.min(basicCount * 0.25, 0.5);

    // Advanced Jungian terms
    const advancedTerms = ['anima', 'animus', 'self', 'projection', 'active imagination', 'synchronicity'];
    const advancedCount = advancedTerms.filter(term => text.includes(term)).length;
    score += Math.min(advancedCount * 0.3, 0.6);

    return Math.min(score, 1.0);
  }

  /**
   * Detect IFS familiarity
   */
  private detectIFSFamiliarity(text: string): number {
    let score = 0;

    // Basic IFS language
    if (/parts?|manager|firefighter|exile/i.test(text)) {
      score += 0.4;
    }

    // Advanced: Self energy, unblending
    if (/self.?energy|unblend|unburdening/i.test(text)) {
      score += 0.4;
    }

    // Expert: IFS process language
    if (/internal.*family.*system|schwartz/i.test(text)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Detect Polyvagal familiarity
   */
  private detectPolyvagalFamiliarity(text: string): number {
    let score = 0;

    // Basic: nervous system awareness
    if (/nervous.*system|regulate|dysregulate/i.test(text)) {
      score += 0.3;
    }

    // Intermediate: vagal states
    if (/ventral|dorsal|sympathetic|vagal/i.test(text)) {
      score += 0.4;
    }

    // Advanced: Porges, polyvagal theory
    if (/polyvagal|porges|neuroception/i.test(text)) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Detect McGilchrist familiarity
   */
  private detectMcGilchristFamiliarity(text: string): number {
    let score = 0;

    // Basic: hemispheric language
    if (/left.*brain|right.*brain|hemisphere/i.test(text)) {
      score += 0.3;
    }

    // Advanced: McGilchrist concepts
    if (/master.*emissary|mcgilchrist|divided.*brain/i.test(text)) {
      score += 0.4;
    }

    // Expert: attention modes
    if (/right.*hemisphere.*attend|sustained.*attention/i.test(text)) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Detect Levin familiarity
   */
  private detectLevinFamiliarity(text: string): number {
    let score = 0;

    // Basic: field language
    if (/field|morphogenetic|pattern|bioelectric/i.test(text)) {
      score += 0.4;
    }

    // Advanced: Levin concepts
    if (/levin|basal.*cognition|collective.*intelligence|regenerative/i.test(text)) {
      score += 0.4;
    }

    // Expert: specific Levin language
    if (/computational.*boundary|anatomical.*compiler/i.test(text)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Detect specific indicators of awareness
   */
  private detectIndicators(text: string, frameworkFamiliarity: any): string[] {
    const indicators: string[] = [];

    // High familiarity with specific frameworks
    if (frameworkFamiliarity.alchemy > 0.7) {
      indicators.push('Advanced alchemical knowledge');
    }
    if (frameworkFamiliarity.spiralogic > 0.5) {
      indicators.push('Familiar with Spiralogic');
    }
    if (frameworkFamiliarity.jung > 0.7) {
      indicators.push('Deep Jungian knowledge');
    }
    if (frameworkFamiliarity.ifs > 0.6) {
      indicators.push('IFS-informed');
    }
    if (frameworkFamiliarity.polyvagal > 0.6) {
      indicators.push('Polyvagal-aware');
    }

    // Meta-awareness: talks ABOUT the frameworks
    if (/framework|model|theory|system/i.test(text)) {
      indicators.push('Meta-aware of frameworks');
    }

    // Technical precision
    if (/coherence.*score|operation.*stage|cycle.*phase/i.test(text)) {
      indicators.push('Uses technical precision');
    }

    // Practitioner language
    if (/in.*my.*practice|working.*with|clients|facilitate/i.test(text)) {
      indicators.push('Practitioner perspective');
    }

    return indicators;
  }

  /**
   * Determine awareness level from score
   */
  private determineLevel(score: number): AwarenessLevel {
    if (score >= 91) return 'master';
    if (score >= 76) return 'advanced';
    if (score >= 51) return 'intermediate';
    if (score >= 26) return 'familiar';
    return 'beginner';
  }

  /**
   * Suggest language style based on level
   */
  private suggestLanguageStyle(level: AwarenessLevel, familiarity: any): string {
    switch (level) {
      case 'beginner':
        return 'Everyday language, metaphors, no jargon. Explain transformation through lived experience: "You\'re going through a necessary dissolution process" not "You\'re in Nigredo."';

      case 'familiar':
        return 'Simple framework language with context. "This feels like what Jung called shadow work - the parts of yourself you haven\'t owned yet." Introduce concepts gently.';

      case 'intermediate':
        return 'Framework concepts with brief explanations. "You\'re in Nigredo (the dissolution phase) where old structures break down before new ones can emerge." Technical terms with meaning.';

      case 'advanced':
        return 'Full framework language, assume understanding. "Nigredo at 0.20 coherence. Solutio operation active. Support nervous system regulation before pushing processing." Precise but not overwhelming.';

      case 'master':
        return 'Complete technical precision. "Coherence 0.20, Nigredo primary stage, Solutio + Mortificatio operations, Polyvagal dorsal (0.00 safety), IFS parts-led (no Self energy), McGilchrist left-brain control attempt failing. Response protocol: CO-REGULATE." Full spiralogic alchemist language.';
    }
  }
}

export const awarenessLevelDetector = new AwarenessLevelDetector();
