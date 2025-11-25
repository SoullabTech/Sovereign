/**
 * FAMILY CONSTELLATION ENGINE (Framework #9)
 *
 * Based on Bert Hellinger's Family Constellation work
 *
 * Detects systemic and ancestral dynamics:
 * - Systemic entanglements (carrying burdens for family members)
 * - Excluded members (deceased, estranged, "forgotten" family)
 * - Movement patterns (reaching toward, turning away, lying down for)
 * - Orders of Love violations (precedence, belonging, balance)
 * - Transgenerational trauma patterns (inherited burdens)
 *
 * This completes MAIA's intelligence with the SYSTEMIC layer:
 * - IFS = internal family
 * - Constellation = actual family system
 */

export interface ConstellationState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Systemic entanglement (carrying something not yours)
  systemicEntanglement: {
    detected: boolean;
    type: 'parent-child' | 'sibling' | 'ancestor' | 'excluded-member' | 'perpetrator-victim' | 'unknown';
    confidence: number;
    description: string;
    indicators: string[];
  };

  // Excluded members (calling on absent/deceased)
  excludedMembers: {
    detected: boolean;
    names: string[]; // Extracted names from direct address
    relationship?: string; // If detectable: "father", "brother", "ancestor"
    callingPattern?: 'plea' | 'witness' | 'permission' | 'reunion';
    indicators: string[];
  };

  // Movement pattern (Hellinger's somatic movements)
  movementPattern: {
    detected: boolean;
    type: 'interrupted-reaching' | 'turning-away' | 'lying-down-for' | 'frozen-in-time' | 'bowing' | 'none';
    toward?: string; // "parent", "family", "ancestors"
    somaticMarker?: string; // The body symptom: "arm paralysis", "back pain", etc.
    confidence: number;
    indicators: string[];
  };

  // Orders of Love violations (Hellinger's three orders)
  ordersOfLove: {
    violation: boolean;
    type?: 'precedence' | 'belonging' | 'balance-give-take';
    description: string;
    indicators: string[];
  };

  // Transgenerational pattern (inherited trauma)
  transgenerationalPattern: {
    detected: boolean;
    theme?: 'war' | 'early-death' | 'violence' | 'exile' | 'abandonment' | 'illness' | 'suicide' | 'loss' | 'unknown';
    generation?: number; // How many generations back (if detectable)
    confidence: number;
    indicators: string[];
  };
}

/**
 * Family Constellation Detection Engine
 */
export class ConstellationEngine {
  /**
   * Extract constellation dynamics from text
   */
  extract(text: string): ConstellationState {
    const indicators: string[] = [];

    // Detect systemic entanglement
    const systemicEntanglement = this.detectSystemicEntanglement(text);
    if (systemicEntanglement.detected) {
      indicators.push(...systemicEntanglement.indicators);
    }

    // Detect excluded members
    const excludedMembers = this.detectExcludedMembers(text);
    if (excludedMembers.detected) {
      indicators.push(...excludedMembers.indicators);
    }

    // Detect movement patterns
    const movementPattern = this.detectMovementPattern(text);
    if (movementPattern.detected) {
      indicators.push(...movementPattern.indicators);
    }

    // Detect orders of love violations
    const ordersOfLove = this.detectOrdersOfLove(text);
    if (ordersOfLove.violation) {
      indicators.push(...ordersOfLove.indicators);
    }

    // Detect transgenerational patterns
    const transgenerationalPattern = this.detectTransgenerationalPattern(text);
    if (transgenerationalPattern.detected) {
      indicators.push(...transgenerationalPattern.indicators);
    }

    // Overall detection
    const detected = indicators.length > 0;
    const confidence = this.calculateConfidence(
      systemicEntanglement,
      excludedMembers,
      movementPattern,
      ordersOfLove,
      transgenerationalPattern
    );

    return {
      detected,
      confidence,
      indicators,
      systemicEntanglement,
      excludedMembers,
      movementPattern,
      ordersOfLove,
      transgenerationalPattern
    };
  }

  /**
   * Detect systemic entanglement (carrying something for the system)
   */
  private detectSystemicEntanglement(text: string): ConstellationState['systemicEntanglement'] {
    const indicators: string[] = [];
    let detected = false;
    let type: ConstellationState['systemicEntanglement']['type'] = 'unknown';
    let confidence = 0;
    let description = '';

    // Pattern 1: "Not mine" language (carrying something that doesn't belong)
    const notMinePatterns = [
      /something (not mine|doesn't belong to me|stuck to me)/i,
      /carrying (this|something|it) for/i,
      /\b(burden|weight) (not mine|doesn't belong)/i,
      /feels like (it's|this is) not (mine|my own)/i
    ];

    for (const pattern of notMinePatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.7);
        indicators.push('not-mine-language');
        description = 'Carrying something that doesn\'t feel like their own';
        type = 'unknown';
        break;
      }
    }

    // Pattern 2: "For you" language (in your place, for your sake)
    const forYouPatterns = [
      /\b(for you|in your place|instead of you)\b/i,
      /I'll (do|carry|take|bear) (this|it) for/i,
      /if I (suffer|carry|do) this, (you|they) (won't have to|can be free)/i
    ];

    for (const pattern of forYouPatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.8);
        indicators.push('for-you-language');
        description = 'Taking on something in place of another family member';
        type = 'parent-child'; // Common pattern
        break;
      }
    }

    // Pattern 3: External force/attack (systemic field pressure)
    const externalForcePatterns = [
      /external (force|attack|energy|pressure)/i,
      /something (attacking|coming at|following|haunting) me/i,
      /feel(s|ing)? like (I'm|being) (attacked|pursued|haunted) by/i
    ];

    for (const pattern of externalForcePatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.6);
        indicators.push('external-force');
        description = 'Experience of external force/pressure (possible systemic field)';
        type = 'ancestor'; // Often ancestral
        break;
      }
    }

    // Pattern 4: Loyalty binds ("I can't move forward without betraying them")
    const loyaltyPatterns = [
      /can't (move forward|leave|let go) without (leaving|betraying|abandoning)/i,
      /if I (heal|succeed|am happy), (I'll|it means) (leave|betray|abandon) (them|him|her)/i,
      /loyal(ty)? to (their|the) (suffering|pain|fate)/i
    ];

    for (const pattern of loyaltyPatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.75);
        indicators.push('loyalty-bind');
        description = 'Loyalty bind preventing movement or healing';
        type = 'parent-child'; // Classic parent-child entanglement
        break;
      }
    }

    return {
      detected,
      type,
      confidence,
      description,
      indicators
    };
  }

  /**
   * Detect excluded members (calling on deceased/absent family)
   */
  private detectExcludedMembers(text: string): ConstellationState['excludedMembers'] {
    const indicators: string[] = [];
    const names: string[] = [];
    let detected = false;
    let relationship: string | undefined;
    let callingPattern: 'plea' | 'witness' | 'permission' | 'reunion' | undefined;

    // Pattern 1: Direct address of names (especially in crisis)
    // This is a simplified name extraction - in production, would use NER
    const directAddressPattern = /([A-Z][a-z]+)\.\s*([A-Z][a-z]+)?.*(?:please|help|sit with me|I need)/i;
    const directAddressMatch = text.match(directAddressPattern);

    if (directAddressMatch) {
      detected = true;
      indicators.push('direct-address');

      // Extract names
      if (directAddressMatch[1]) names.push(directAddressMatch[1]);
      if (directAddressMatch[2]) names.push(directAddressMatch[2]);

      // Determine calling pattern
      if (/please (sit with|be with|help|stay|witness)/i.test(text)) {
        callingPattern = 'plea';
        indicators.push('plea-for-presence');
      }
    }

    // Pattern 2: References to deceased
    const deceasedPatterns = [
      /my (late|deceased) (father|mother|brother|sister|grandfather|grandmother)/i,
      /(father|mother|brother|sister|grandfather|grandmother) (who|that) (died|passed)/i,
      /since (he|she|they) (died|passed|left)/i
    ];

    for (const pattern of deceasedPatterns) {
      const match = text.match(pattern);
      if (match) {
        detected = true;
        indicators.push('deceased-member-mentioned');
        relationship = match[2] || match[1]; // Extract relationship
        break;
      }
    }

    // Pattern 3: "If only [person] were here"
    if (/if only.*were here|wish.*were still here/i.test(text)) {
      detected = true;
      indicators.push('longing-for-absent');
      callingPattern = 'reunion';
    }

    // Pattern 4: Asking permission from ancestors/deceased
    if (/can I|may I|is it okay.*if I/i.test(text) && directAddressMatch) {
      callingPattern = 'permission';
      indicators.push('seeking-permission');
    }

    return {
      detected,
      names,
      relationship,
      callingPattern,
      indicators
    };
  }

  /**
   * Detect movement patterns (Hellinger's somatic movements)
   */
  private detectMovementPattern(text: string): ConstellationState['movementPattern'] {
    const indicators: string[] = [];
    let detected = false;
    let type: ConstellationState['movementPattern']['type'] = 'none';
    let toward: string | undefined;
    let somaticMarker: string | undefined;
    let confidence = 0;

    // Pattern 1: Interrupted reaching (want to move toward but can't)
    const interruptedReachingPatterns = [
      /want to reach (out|toward|for) but can't/i,
      /(reaching|stretching|moving) toward.*but (can't|stuck|frozen)/i,
      /cannot move (my )?(arms?|hands?)/i, // Arms = reaching
      /arms? (won't move|stuck|frozen|paralyzed)/i
    ];

    for (const pattern of interruptedReachingPatterns) {
      if (pattern.test(text)) {
        detected = true;
        type = 'interrupted-reaching';
        confidence = 0.8;
        indicators.push('interrupted-reaching');

        // Check for arm-specific markers
        if (/arms?|hands?/.test(text)) {
          somaticMarker = 'arm/hand paralysis or freezing';
          indicators.push('arms-as-reaching-marker');
        }

        // Try to detect toward whom
        if (/toward (you|them|him|her|mother|father|parent)/i.test(text)) {
          toward = text.match(/toward ([a-z]+)/i)?.[1];
        }

        break;
      }
    }

    // Pattern 2: Turning away (unable to face/look at)
    const turningAwayPatterns = [
      /can't (look at|face|see) (you|them|him|her|it)/i,
      /turn(ing|ed) away from/i,
      /have to look away/i
    ];

    for (const pattern of turningAwayPatterns) {
      if (pattern.test(text)) {
        detected = true;
        type = 'turning-away';
        confidence = 0.7;
        indicators.push('turning-away');
        break;
      }
    }

    // Pattern 3: Lying down for (taking fate of another)
    const lyingDownPatterns = [
      /\b(lie|lay) down for/i,
      /take (their|his|her) place/i,
      /\b(die|suffer) (for|instead of) (you|them|him|her)/i,
      /I'll (go|die|suffer) so (you|they) don't have to/i
    ];

    for (const pattern of lyingDownPatterns) {
      if (pattern.test(text)) {
        detected = true;
        type = 'lying-down-for';
        confidence = 0.85;
        indicators.push('lying-down-for');
        toward = 'family member';
        break;
      }
    }

    // Pattern 4: Frozen in time (stuck at moment of trauma)
    const frozenInTimePatterns = [
      /frozen (in time|at that moment|there)/i,
      /stuck (in|at) (that moment|that time|the past)/i,
      /can't move (forward|on|past)/i
    ];

    for (const pattern of frozenInTimePatterns) {
      if (pattern.test(text)) {
        detected = true;
        type = 'frozen-in-time';
        confidence = 0.75;
        indicators.push('frozen-in-time');
        break;
      }
    }

    // Pattern 5: Bowing (honoring/submitting to fate)
    const bowingPatterns = [
      /bow(ing|ed) (to|before)/i,
      /honor(ing)? (their|the) fate/i,
      /submit(ting)? to/i
    ];

    for (const pattern of bowingPatterns) {
      if (pattern.test(text)) {
        detected = true;
        type = 'bowing';
        confidence = 0.7;
        indicators.push('bowing-to-fate');
        break;
      }
    }

    return {
      detected,
      type,
      toward,
      somaticMarker,
      confidence,
      indicators
    };
  }

  /**
   * Detect Orders of Love violations (Hellinger's three orders)
   */
  private detectOrdersOfLove(text: string): ConstellationState['ordersOfLove'] {
    const indicators: string[] = [];
    let violation = false;
    let type: 'precedence' | 'belonging' | 'balance-give-take' | undefined;
    let description = '';

    // Order 1: PRECEDENCE (child trying to carry parent's burden/be parent to parent)
    const precedencePatterns = [
      /I (have to|must|need to) (take care of|save|fix|heal|protect) (mom|dad|mother|father|parent)/i,
      /I'll (save|rescue|heal|fix) (you|them|the family)/i,
      /(want to be|trying to be|have to be) (good medicine|beacon|light) for/i,
      /I (have to|must) be strong for (you|them|everyone)/i,
      /(be|become) the parent/i
    ];

    for (const pattern of precedencePatterns) {
      if (pattern.test(text)) {
        violation = true;
        type = 'precedence';
        description = 'Child attempting to serve/save parents or system (reversal of order)';
        indicators.push('precedence-violation');
        break;
      }
    }

    // Order 2: BELONGING (someone excluded from system)
    const belongingPatterns = [
      /we (never talk about|don't mention|forgot) (him|her|them)/i,
      /the one who was (forgotten|excluded|left out)/i,
      /doesn't belong/i,
      /not part of the family/i
    ];

    for (const pattern of belongingPatterns) {
      if (pattern.test(text)) {
        violation = true;
        type = 'belonging';
        description = 'Someone excluded from the family system';
        indicators.push('belonging-violation');
        break;
      }
    }

    // Order 3: BALANCE (give and take out of balance)
    const balancePatterns = [
      /I (owe|have to repay|must give back)/i,
      /can't (receive|take|accept) (from|anything)/i,
      /have to (give|do) everything/i,
      /can only give, not (receive|take)/i,
      /\b(too much to offer|so much to give) but.*can't receive/i
    ];

    for (const pattern of balancePatterns) {
      if (pattern.test(text)) {
        violation = true;
        type = 'balance-give-take';
        description = 'Imbalance in giving and receiving (often over-giving, under-receiving)';
        indicators.push('balance-violation');
        break;
      }
    }

    return {
      violation,
      type,
      description,
      indicators
    };
  }

  /**
   * Detect transgenerational trauma patterns
   */
  private detectTransgenerationalPattern(text: string): ConstellationState['transgenerationalPattern'] {
    const indicators: string[] = [];
    let detected = false;
    let theme: ConstellationState['transgenerationalPattern']['theme'];
    let generation: number | undefined;
    let confidence = 0;

    // War trauma
    if (/\b(war|veteran|combat|battle|holocaust|genocide)\b/i.test(text)) {
      detected = true;
      theme = 'war';
      confidence = 0.8;
      indicators.push('war-trauma-theme');
    }

    // Early death
    if (/(died young|early death|lost.*young|taken too soon)/i.test(text)) {
      detected = true;
      theme = 'early-death';
      confidence = 0.8;
      indicators.push('early-death-theme');
    }

    // Violence
    if (/(violence|abuse|assault|murder|killed)/i.test(text)) {
      detected = true;
      theme = 'violence';
      confidence = 0.8;
      indicators.push('violence-theme');
    }

    // Exile/displacement
    if (/(exile|displaced|refugee|fled|escaped|lost homeland)/i.test(text)) {
      detected = true;
      theme = 'exile';
      confidence = 0.8;
      indicators.push('exile-theme');
    }

    // Abandonment
    if (/(abandon(ed|ment)|left behind|given up|unwanted)/i.test(text)) {
      detected = true;
      theme = 'abandonment';
      confidence = 0.75;
      indicators.push('abandonment-theme');
    }

    // Illness/death
    if (/(illness|disease|epidemic|plague|died of)/i.test(text)) {
      detected = true;
      theme = 'illness';
      confidence = 0.7;
      indicators.push('illness-theme');
    }

    // Suicide
    if (/(suicid(e|al)|took (his|her|their) own life|killed (himself|herself|themselves))/i.test(text)) {
      detected = true;
      theme = 'suicide';
      confidence = 0.85;
      indicators.push('suicide-theme');
    }

    // Loss/grief
    if (/(lost|grief|mourning|bereavement).*genera/i.test(text)) {
      detected = true;
      theme = 'loss';
      confidence = 0.7;
      indicators.push('loss-theme');
    }

    // Try to detect generation (grandfather = 2, great-grandfather = 3)
    if (/grandfather|grandmother/i.test(text)) {
      generation = 2;
      indicators.push('second-generation');
    }
    if (/great.grandfather|great.grandmother/i.test(text)) {
      generation = 3;
      indicators.push('third-generation');
    }

    // Pattern repeating across generations
    if (/same thing happened to (my |his |her )?(father|mother|grandfather)/i.test(text)) {
      detected = true;
      confidence = 0.9;
      indicators.push('generational-repetition');
    }

    return {
      detected,
      theme,
      generation,
      confidence,
      indicators
    };
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(
    systemicEntanglement: ConstellationState['systemicEntanglement'],
    excludedMembers: ConstellationState['excludedMembers'],
    movementPattern: ConstellationState['movementPattern'],
    ordersOfLove: ConstellationState['ordersOfLove'],
    transgenerationalPattern: ConstellationState['transgenerationalPattern']
  ): number {
    const scores: number[] = [];

    if (systemicEntanglement.detected) scores.push(systemicEntanglement.confidence);
    if (excludedMembers.detected) scores.push(0.8); // High confidence for name extraction
    if (movementPattern.detected) scores.push(movementPattern.confidence);
    if (ordersOfLove.violation) scores.push(0.75);
    if (transgenerationalPattern.detected) scores.push(transgenerationalPattern.confidence);

    if (scores.length === 0) return 0;

    // Average of detected elements
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
}

// Singleton instance
export const constellationEngine = new ConstellationEngine();
