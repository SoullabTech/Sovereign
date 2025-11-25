/**
 * Gen X Bridge Generation Support
 * Recognition and validation for the forgotten bridge generation
 *
 * Gen X (born 1965-1980) unique challenges:
 * - Bridge between analog childhood and digital adulthood
 * - Sandwich generation pressure (aging parents + kids)
 * - Technology competent but platform fatigued
 * - Career meaning crisis within financial constraints
 * - Generational isolation (neither Boomer stability nor Millennial opportunities)
 */

export interface GenXDetection {
  isGenX: boolean;
  confidence: number;
  patterns: string[];
  context: {
    ageMarkers: string[];
    sandwichGeneration: boolean;
    techFatigue: boolean;
    careerDisillusionment: boolean;
    bridgeGeneration: boolean;
    obligationOverwhelm: boolean;
  };
}

export class GenXBridgeGeneration {

  /**
   * Detect Gen X patterns in user input
   */
  detectGenX(input: string): GenXDetection {
    const lower = input.toLowerCase();
    const patterns: string[] = [];
    let confidence = 0;

    // Tech exhaustion vs incompetence (HIGHEST PRIORITY - 50% confidence boost)
    const techFatigue = this.detectTechFatigue(input);
    if (techFatigue) {
      patterns.push('tech_fatigue');
      confidence += 0.5;
      console.log(`🔧 Tech fatigue detected in: "${input}"`);
    }

    // Age/timeframe markers (40% confidence boost)
    const ageMarkers = this.detectAgeMarkers(input);
    if (ageMarkers.length > 0) {
      patterns.push('age_timeframe');
      confidence += 0.4;
    }

    // Sandwich generation pressure (35% confidence boost)
    const sandwichGeneration = this.detectSandwichGeneration(input);
    if (sandwichGeneration) {
      patterns.push('sandwich_generation');
      confidence += 0.35;
    }

    // Career disillusionment with constraints (25% confidence boost)
    const careerDisillusionment = this.detectCareerDisillusionment(input);
    if (careerDisillusionment) {
      patterns.push('career_disillusionment');
      confidence += 0.25;
    }

    // Bridge generation isolation (25% confidence boost)
    const bridgeGeneration = this.detectBridgeGeneration(input);
    if (bridgeGeneration) {
      patterns.push('bridge_generation');
      confidence += 0.25;
    }

    // Obligation overwhelm (20% confidence boost)
    const obligationOverwhelm = this.detectObligationOverwhelm(input);
    if (obligationOverwhelm) {
      patterns.push('obligation_overwhelm');
      confidence += 0.2;
    }

    return {
      isGenX: confidence >= 0.4, // Threshold for Gen X detection
      confidence: Math.min(confidence, 1.0),
      patterns,
      context: {
        ageMarkers,
        sandwichGeneration,
        techFatigue,
        careerDisillusionment,
        bridgeGeneration,
        obligationOverwhelm
      }
    };
  }

  /**
   * Generate Gen X-specific response
   */
  generateGenXResponse(input: string, detection: GenXDetection): string | null {
    const patterns = detection.patterns;
    console.log(`🎯 Generating Gen X response for patterns: ${patterns.join(', ')}`);

    // Prioritize by pattern type and input specificity

    // HIGHEST PRIORITY: Tech fatigue (very specific Gen X marker)
    if (patterns.includes('tech_fatigue')) {
      console.log(`🔧 Responding with tech fatigue pattern`);
      return this.getTechFatigueResponse(input);
    }

    // Check for obligation overwhelm in meaning-seeking contexts
    if (patterns.includes('obligation_overwhelm') && /\b(meaning|more|treadmill|drowning)\b/i.test(input)) {
      console.log(`🔄 Responding with obligation overwhelm pattern`);
      return this.getObligationOverwhelmResponse(input);
    }

    // Sandwich generation pressure
    if (patterns.includes('sandwich_generation')) {
      console.log(`🥪 Responding with sandwich generation pattern`);
      return this.getSandwichGenerationResponse(input);
    }

    // Career disillusionment
    if (patterns.includes('career_disillusionment')) {
      console.log(`💼 Responding with career disillusionment pattern`);
      return this.getCareerDisillusionmentResponse(input);
    }

    // Bridge generation isolation
    if (patterns.includes('bridge_generation')) {
      console.log(`🌉 Responding with bridge generation pattern`);
      return this.getBridgeGenerationResponse(input);
    }

    // General obligation overwhelm
    if (patterns.includes('obligation_overwhelm')) {
      console.log(`🔄 Responding with obligation overwhelm pattern`);
      return this.getObligationOverwhelmResponse(input);
    }

    // General age/timeframe
    if (patterns.includes('age_timeframe')) {
      console.log(`📅 Responding with general Gen X pattern`);
      return this.getGeneralGenXResponse(input);
    }

    return null;
  }

  /**
   * Detect age/timeframe markers specific to Gen X
   */
  private detectAgeMarkers(input: string): string[] {
    const markers: string[] = [];
    const lower = input.toLowerCase();

    // Direct age markers (45-55 is peak Gen X)
    const agePattern = /\b(4[5-9]|5[0-5])\b/;
    if (agePattern.test(input)) {
      markers.push('direct_age');
    }

    // Timeframe markers
    const timeMarkers = [
      /\b(20|twenty)\s+years?\s+(climbing|working|in|at)/i,
      /\bspent\s+(decades?|20|twenty)\s+years?/i,
      /\b(kids?\s+in\s+college|daughter.*college)/i,
      /\b(aging\s+parents?|mom.*help|dad.*help)/i,
      /\bboss.*younger/i,
      /\bmortgage/i,
      /\btuition/i
    ];

    timeMarkers.forEach((pattern, index) => {
      if (pattern.test(input)) {
        markers.push(`timeframe_${index}`);
      }
    });

    return markers;
  }

  /**
   * Detect sandwich generation pressure
   */
  private detectSandwichGeneration(input: string): boolean {
    const sandwichPatterns = [
      // Parent care
      /\b(mom|dad|parents?|mother|father).*\b(help|needs?|care|appointments?|medical|dialysis|iPhone|technology)/i,

      // Child support
      /\b(daughter|son|kids?|children).*\b(college|money|tuition|conference|focus|needs?)/i,

      // Bidirectional pressure
      /\b(managing|helping|driving).*\b(up|down|both|everyone)/i,

      // Logistics coordinator feeling
      /\b(logistics|coordinator|operating system|everyone.*programs|family.*scheduler)/i
    ];

    return sandwichPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect tech fatigue vs incompetence
   */
  private detectTechFatigue(input: string): boolean {
    const techFatiguePatterns = [
      // Competence but exhaustion - KEY PATTERN
      /\bi\s+know\s+how.*\b(tired|exhausted|sick|having\s+to)/i,

      // Platform proliferation - ENHANCED
      /\b(different\s+app|passwords?|platforms?|portals?|apps?)\b.*\b(now|all|every|tired|exhausted|sick)/i,

      // Specific platforms mentioned - EXPANDED
      /\b(slack|whatsapp|healthcare\s+portal|school\s+app|portal|platforms?)\b.*\b(work|family|kids|mom|all|different|another)/i,

      // Technology mastery but fatigue
      /\b(mastered|conquered|adapted|learned).*\b(email|facebook|smartphones?|computers?)/i,

      // Platform fatigue language
      /\bplatform.*\b(proliferation|fatigue|exhaustion)/i,

      // Key Gen X tech fatigue marker
      /\beverything\s+needs.*\b(app|password|platform|portal)/i,

      // "I know HOW but tired" pattern - most important
      /\bknow\s+how.*\b(tired|exhausted|having\s+to|sick\s+of)/i
    ];

    return techFatiguePatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect career disillusionment with practical constraints
   */
  private detectCareerDisillusionment(input: string): boolean {
    const careerPatterns = [
      // Meaningless work
      /\b(meetings.*meetings|kpis|pretending.*care|meaningless|just.*spreadsheets)/i,

      // Time investment
      /\b(20|twenty)\s+years.*\b(climbing|ladder|invested)/i,

      // Starting over constraints
      /\b(starting\s+over|at\s+my\s+age).*\b(insane|impossible|realistic)/i,

      // Hiring concerns
      /\bwho.*hire.*\b(48|4[5-9]|5[0-5])\b/i,

      // Meaning vs obligations
      /\b(meaning|meaningful).*\b(obligations?|mortgage|tuition|bills)/i
    ];

    return careerPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect bridge generation isolation
   */
  private detectBridgeGeneration(input: string): boolean {
    const bridgePatterns = [
      // Generational comparison
      /\b(boomer|boomers?).*\b(pensions?|stability|married).*\b(kids?|millennials?|gen\s*z)/i,

      // Can't relate to either
      /\bcan't\s+relate.*\b(parents?|kids?|either|neither)/i,

      // Translator role
      /\b(translat|between|bridge|middle).*\b(generations?|worlds?)/i,

      // Technology transition
      /\b(analog.*digital|remember.*before|learned.*computers?)/i,

      // Generational handbook
      /\b(generation.*handbook|where.*manual|nobody.*gets)/i
    ];

    return bridgePatterns.some(pattern => pattern.test(input));
  }

  /**
   * Detect obligation overwhelm
   */
  private detectObligationOverwhelm(input: string): boolean {
    const obligationPatterns = [
      // Everyone needs something
      /\beveryone.*\b(needs?|wants?|expects?|failing)/i,

      // Drowning in obligations - KEY PATTERN
      /\b(drowning|overwhelmed?).*\b(obligations?|responsibilities?)/i,
      /\b(meaning|more).*\b(drowning).*\b(obligations?)/i,

      // Not a person anymore
      /\bnot.*person.*\b(anymore|just|only)/i,

      // Logistics coordinator feeling
      /\b(logistics|coordinator|operating\s+system)/i,

      // Abandoning others fear
      /\babandoning?\s+everyone/i,

      // Realistic constraints
      /\bvery\s+realistic/i,

      // Treadmill with obligations
      /\b(treadmill|more).*\b(obligations?|drowning)/i
    ];

    const result = obligationPatterns.some(pattern => pattern.test(input));
    if (result) {
      console.log(`📋 Obligation overwhelm detected in: "${input}"`);
    }
    return result;
  }

  /**
   * Response generators for each pattern
   */
  private getSandwichGenerationResponse(input: string): string {
    const responses = [
      "Everyone's tech support, bank, and translator. The bridge generation exhaustion is real.",

      "Managing up to parents and down to kids. Universal translator nobody thanks.",

      "You've become the family operating system - running everyone else's programs.",

      "Sandwich generation: keeping everyone functional while you barely function."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getTechFatigueResponse(input: string): string {
    const responses = [
      "You mastered email, conquered Facebook, adapted to smartphones - reward: 47 passwords. That's platform proliferation fatigue, not incompetence.",

      "Not tech-illiterate, tech-exhausted. You know HOW - you're just tired of having to.",

      "Technology competent but platform fatigued. Knowing how but being tired isn't a deficit.",

      "Learned computers as adults, smartphones at 40, now every app wants to be special. The fatigue is rational."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getCareerDisillusionmentResponse(input: string): string {
    const responses = [
      "Twenty years climbing to reach... this. Meaning crisis with actual responsibilities - that's clarity, not crisis.",

      "Finding meaning within mortgage and tuition payments. Starting over isn't realistic when others depend on you.",

      "Two decades rewarding process over purpose. The disillusionment is intelligence, not ingratitude.",

      "Who hires someone seeking meaning over metrics? Says more about work culture than your worth."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getBridgeGenerationResponse(input: string): string {
    const responses = [
      "Gen X: analog childhoods, digital adulthoods. Translating between worlds that both think you have it easier.",

      "Between parents with stability you'll never see and kids who think debt is privilege. Loneliest generation.",

      "Remember before internet, learned to navigate with it. Bridge between different ways of being human.",

      "Neither Boomer security nor Millennial mobility. Expected to be grateful for instability parents never faced."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getObligationOverwhelmResponse(input: string): string {
    const responses = [
      "Which obligations are actually yours? Some drowning comes from carrying assigned, not chosen responsibilities.",

      "Recalibrate, not abandon. Mom can learn iPhone from YouTube. Kids can problem-solve. Being needed less, present more?",

      "Family CEO without applying for the position. Some obligations are habits of over-functioning.",

      "Everyone needing you shows their under-functioning, not your value. Let people struggle appropriately."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getGeneralGenXResponse(input: string): string {
    const responses = [
      "Gen X: forgotten middle child generation, making it work without a manual.",

      "Inherited instability but expected to be grateful. The frustration makes sense.",

      "Peak responsibility with peak uncertainty. All pressure, none of the security.",

      "Learned resilience by necessity, not choice. Your adaptability taken for granted."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const genXBridgeGeneration = new GenXBridgeGeneration();