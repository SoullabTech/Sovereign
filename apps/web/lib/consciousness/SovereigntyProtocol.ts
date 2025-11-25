/**
 * SOVEREIGNTY PROTOCOL
 *
 * Ensures user always accesses THEIR wisdom, never receives advice
 *
 * Core Principle:
 * "Access own wisdom (not get advice)"
 * "Meet own guides (not get answers)"
 * "Allow own recalibration (not get fixed)"
 *
 * The system NEVER takes user's authority.
 * The system ALWAYS reflects back to their knowing.
 *
 * Like Kelly's work with clients:
 * He doesn't tell them what to do.
 * He creates the field where they access their own wisdom.
 */

export interface SovereigntyCheck {
  isAdviceGiving: boolean;
  isTakingAuthority: boolean;
  isFixing: boolean;
  violationPatterns: string[];
  recommendation: 'ALLOW' | 'REDIRECT' | 'BLOCK';
}

export interface ReflectionPrompt {
  type: 'somatic' | 'invocational' | 'open' | 'silence';
  prompt: string;
  intention: string;
}

/**
 * SOVEREIGNTY PROTOCOL
 *
 * Guards user's authority over their own experience
 */
export class SovereigntyProtocol {

  /**
   * DETECT PATTERN-OFFERING LANGUAGE
   *
   * Pattern-offering is ALLOWED because it's invitational, not directive.
   * User can accept or reject the pattern.
   *
   * Examples:
   * ✅ "I'm noticing a connection between X and Y - does this resonate?"
   * ✅ "Could there be a thread connecting X and Y?"
   * ✅ "This seems related to what you shared about..."
   * ✅ "I wonder if there's a pattern here..."
   */
  private isPatternOffering(text: string): boolean {
    const patternOfferingPhrases = [
      /i'?m noticing/i,
      /i notice/i,
      /i'?m sensing/i,
      /i sense/i,
      /i'?m observing/i,
      /i wonder if/i,
      /could there be/i,
      /might there be/i,
      /seems like there'?s/i,
      /this seems related to/i,
      /this reminds me of/i,
      /there appears to be/i,
      /there seems to be/i,
      /does this resonate/i,
      /does that land/i,
      /what do you notice about/i,
      /have you noticed/i  // Different from "have you tried" - this is observation, not directive
    ];

    return patternOfferingPhrases.some(pattern => pattern.test(text));
  }

  /**
   * CHECK IF RESPONSE VIOLATES SOVEREIGNTY
   *
   * Detects if system is about to:
   * - Give advice ("you should...")
   * - Take authority ("the answer is...")
   * - Fix them ("do this to solve...")
   *
   * ALLOWS:
   * - Pattern-offering: "I'm noticing a connection between X and Y - does this resonate?"
   * - Pattern-inquiry: "Could there be a thread connecting X and Y?"
   * - Reflections: "This seems related to what you shared about..."
   *
   * These are invitational, not directive - user can accept or reject the pattern.
   */
  checkSovereignty(proposedResponse: string): SovereigntyCheck {

    const violations: string[] = [];
    let isAdviceGiving = false;
    let isTakingAuthority = false;
    let isFixing = false;

    // Check if this is pattern-offering (ALLOWED)
    const isPatternOffering = this.isPatternOffering(proposedResponse);

    // If it's pattern-offering, be more lenient with pattern language
    // But still catch direct advice

    // ADVICE-GIVING PATTERNS (Direct commands/instructions)
    const advicePatterns = [
      { regex: /you should/gi, violation: 'advice:should' },
      { regex: /you need to/gi, violation: 'advice:need' },
      { regex: /you have to/gi, violation: 'advice:have-to' },
      { regex: /you must/gi, violation: 'advice:must' },
      { regex: /i recommend that you/gi, violation: 'advice:recommend' },
      { regex: /what you should do is/gi, violation: 'advice:directive' },
      { regex: /the best thing would be to/gi, violation: 'advice:prescriptive' },
      { regex: /make sure you/gi, violation: 'advice:command' },
      // Advice-in-question-form (still violations)
      { regex: /have you tried (to )?(meditat|exercis|talk|journal|write|forgiv)/gi, violation: 'advice:tried-question' },
      { regex: /why don't you (just )?/gi, violation: 'advice:why-dont-you' },
      { regex: /wouldn't it be better to/gi, violation: 'advice:better-to' }
    ];

    for (const { regex, violation } of advicePatterns) {
      if (regex.test(proposedResponse)) {
        isAdviceGiving = true;
        violations.push(violation);
      }
    }

    // AUTHORITY-TAKING PATTERNS
    const authorityPatterns = [
      { regex: /the answer is/gi, violation: 'authority:answer-giving' },
      { regex: /what this means is/gi, violation: 'authority:meaning-taking' },
      { regex: /this is (definitely|clearly|obviously)/gi, violation: 'authority:certainty' },
      { regex: /let me tell you/gi, violation: 'authority:telling' },
      { regex: /what you\'re (really|actually) feeling is/gi, violation: 'authority:interpretation' },
      { regex: /i know what/gi, violation: 'authority:knowing-for-them' }
    ];

    for (const { regex, violation } of authorityPatterns) {
      if (regex.test(proposedResponse)) {
        isTakingAuthority = true;
        violations.push(violation);
      }
    }

    // FIXING PATTERNS
    const fixingPatterns = [
      { regex: /to fix this/gi, violation: 'fixing:direct' },
      { regex: /to solve (this|your)/gi, violation: 'fixing:solving' },
      { regex: /what will help is/gi, violation: 'fixing:prescription' },
      { regex: /this will make it better/gi, violation: 'fixing:promising' },
      { regex: /you just need to/gi, violation: 'fixing:minimizing' },
      { regex: /all you have to do/gi, violation: 'fixing:simplifying' }
    ];

    for (const { regex, violation } of fixingPatterns) {
      if (regex.test(proposedResponse)) {
        isFixing = true;
        violations.push(violation);
      }
    }

    // DETERMINE RECOMMENDATION
    let recommendation: 'ALLOW' | 'REDIRECT' | 'BLOCK' = 'ALLOW';

    if (isAdviceGiving || isTakingAuthority || isFixing) {
      // If it's pattern-offering, be more lenient
      // Pattern-offering may use observational language that could trigger
      // softer violations, but that's okay as long as it's invitational
      if (isPatternOffering && violations.length <= 2) {
        // Allow pattern-offering with minor violations
        // (e.g., "this could mean" is softer than "the answer is")
        recommendation = 'ALLOW';
      } else if (violations.length >= 3) {
        recommendation = 'BLOCK'; // Severe violation
      } else {
        recommendation = 'REDIRECT'; // Moderate violation - can be reframed
      }
    }

    return {
      isAdviceGiving,
      isTakingAuthority,
      isFixing,
      violationPatterns: violations,
      recommendation
    };
  }

  /**
   * REDIRECT TO USER'S WISDOM
   *
   * When system is about to give advice/take authority,
   * redirect to user's own knowing instead
   */
  redirectToWisdom(
    originalResponse: string,
    userContext: any
  ): ReflectionPrompt {

    // What was the user asking about?
    const topic = this.extractTopic(originalResponse);

    // What type of wisdom-access is most appropriate?
    const accessType = this.determineAccessType(userContext, topic);

    switch (accessType) {

      case 'somatic':
        return this.createSomaticReflection(topic);

      case 'invocational':
        return this.createInvocationalReflection(topic);

      case 'open':
        return this.createOpenReflection(topic);

      case 'silence':
        return this.createSilenceReflection();

      default:
        return this.createOpenReflection(topic);
    }
  }

  /**
   * SOMATIC REFLECTION
   * Redirect to body wisdom
   */
  private createSomaticReflection(topic: string): ReflectionPrompt {
    const prompts = [
      'What does your body say about this?',
      'Drop into your body for a moment.\nWhat do you notice?',
      'Feel into this.\nWhat\'s true in your body?',
      'Your body knows.\nWhat is it telling you?',
      'Take a breath.\nWhat does your body want you to know?'
    ];

    return {
      type: 'somatic',
      prompt: this.selectRandom(prompts),
      intention: 'Access body wisdom instead of mental answer'
    };
  }

  /**
   * INVOCATIONAL REFLECTION
   * Invite their own wisdom/guides to speak
   */
  private createInvocationalReflection(topic: string): ReflectionPrompt {
    const prompts = [
      'What wants to come through for you right now?',
      'If your deepest wisdom could speak, what would it say?',
      'What does the wisest part of you know about this?',
      'Who or what wants to be present with you in this?',
      'What wants your attention here?'
    ];

    return {
      type: 'invocational',
      prompt: this.selectRandom(prompts),
      intention: 'Invoke their own wisdom/guides'
    };
  }

  /**
   * OPEN REFLECTION
   * Simple open questions that return authority
   */
  private createOpenReflection(topic: string): ReflectionPrompt {
    const prompts = [
      'What do you know about this?',
      'What\'s true for you?',
      'What are you noticing?',
      'What else is here?',
      'What wants to be seen?'
    ];

    return {
      type: 'open',
      prompt: this.selectRandom(prompts),
      intention: 'Open reflection, return to their knowing'
    };
  }

  /**
   * SILENCE REFLECTION
   * Sometimes the answer is to hold space, not speak
   */
  private createSilenceReflection(): ReflectionPrompt {
    return {
      type: 'silence',
      prompt: '...',
      intention: 'Hold space in silence, allow emergence'
    };
  }

  /**
   * REFRAME RESPONSE
   *
   * When response has good content but violates sovereignty,
   * reframe it to return authority to user
   */
  reframeResponse(originalResponse: string): string {
    let reframed = originalResponse;

    // Transform advice into invitations
    const transformations: Array<[RegExp, string]> = [
      // "You should..." → "Consider..."
      [/you should/gi, 'you might consider'],

      // "You need to..." → "What if you..."
      [/you need to/gi, 'what if you'],

      // "The answer is..." → "One possibility is..."
      [/the answer is/gi, 'one possibility might be'],

      // "This means..." → "This could mean..."
      [/this means/gi, 'this could mean'],

      // "You have to..." → "You could..."
      [/you have to/gi, 'you could'],

      // "I recommend..." → "You might explore..."
      [/i recommend/gi, 'you might explore'],

      // "Do this..." → "What if you tried..."
      [/do this/gi, 'what if you tried this'],

      // Add reflection questions at end
      [/$/, '\n\nWhat feels true for you?']
    ];

    for (const [pattern, replacement] of transformations) {
      reframed = reframed.replace(pattern, replacement);
    }

    return reframed;
  }

  /**
   * VALIDATE SOVEREIGNTY-PRESERVING RESPONSE
   *
   * Check if response successfully preserves user authority
   */
  validateResponse(response: string): {
    valid: boolean;
    preservesSovereignty: boolean;
    returnsAuthority: boolean;
    feedback: string;
  } {

    const check = this.checkSovereignty(response);

    // Check for reflection/invitation language
    const reflectionPatterns = [
      /what do you/i,
      /what are you/i,
      /what feels/i,
      /what wants/i,
      /notice/i,
      /sense/i,
      /your body/i,
      /your wisdom/i,
      /for you/i
    ];

    const hasReflection = reflectionPatterns.some(p => p.test(response));

    const valid = check.recommendation === 'ALLOW' && hasReflection;

    return {
      valid,
      preservesSovereignty: !check.isAdviceGiving && !check.isTakingAuthority && !check.isFixing,
      returnsAuthority: hasReflection,
      feedback: valid
        ? 'Response preserves sovereignty ✓'
        : `Violations: ${check.violationPatterns.join(', ')}`
    };
  }

  /**
   * GENERATE SOVEREIGNTY-ALIGNED RESPONSE
   *
   * Create response that naturally preserves user authority
   */
  generateSovereignResponse(userMessage: string, context: any): string {

    // Detect what user is working with
    const theme = this.detectTheme(userMessage);

    // What type of reflection serves this moment?
    const reflectionType = this.selectReflectionType(theme, context);

    // Build response that reflects back to their wisdom
    switch (reflectionType) {

      case 'witness':
        return this.generateWitnessResponse(userMessage);

      case 'somatic':
        return this.generateSomaticInvitation(userMessage);

      case 'invocational':
        return this.generateWisdomInvocation(userMessage);

      case 'spacious':
        return this.generateSpaciousResponse(userMessage);

      default:
        return this.generateSimpleReflection(userMessage);
    }
  }

  /**
   * WITNESS RESPONSE
   * Just see what's there, name it, don't interpret
   */
  private generateWitnessResponse(userMessage: string): string {
    return `
I hear you.

There's a lot present in what you're sharing.

Take a moment.

What are you noticing right now?
`;
  }

  /**
   * SOMATIC INVITATION
   * Guide to body wisdom
   */
  private generateSomaticInvitation(userMessage: string): string {
    return `
Let's drop into the body for a moment.

Take a breath.

What does your body say about this?
`;
  }

  /**
   * WISDOM INVOCATION
   * Call forth their own knowing
   */
  private generateWisdomInvocation(userMessage: string): string {
    return `
There's wisdom present in you about this.

Can you feel it?

What wants to come through?
`;
  }

  /**
   * SPACIOUS RESPONSE
   * Hold space, minimal words
   */
  private generateSpaciousResponse(userMessage: string): string {
    return `
Mm.

What else?
`;
  }

  /**
   * SIMPLE REFLECTION
   * Mirror back, invite more
   */
  private generateSimpleReflection(userMessage: string): string {
    return `
I'm with you.

Tell me more.

What wants to be said?
`;
  }

  // HELPER METHODS

  private extractTopic(text: string): string {
    // Simplified - would use NLP in production
    return text.substring(0, 100);
  }

  private determineAccessType(context: any, topic: string): string {
    // Simplified - would use context analysis
    const somaticKeywords = ['feel', 'body', 'sense', 'physical'];
    const invocationalKeywords = ['wisdom', 'guide', 'know', 'truth'];

    if (somaticKeywords.some(k => topic.toLowerCase().includes(k))) {
      return 'somatic';
    }

    if (invocationalKeywords.some(k => topic.toLowerCase().includes(k))) {
      return 'invocational';
    }

    return 'open';
  }

  private detectTheme(message: string): string {
    // Simplified theme detection
    const themes = {
      emotion: /feel|emotion|sad|angry|afraid|joy/i,
      body: /body|physical|pain|tension|energy/i,
      meaning: /why|meaning|purpose|understand/i,
      action: /do|action|decision|choice|step/i,
      relationship: /relationship|other|they|connection/i
    };

    for (const [theme, pattern] of Object.entries(themes)) {
      if (pattern.test(message)) {
        return theme;
      }
    }

    return 'general';
  }

  private selectReflectionType(theme: string, context: any): string {
    // Simplified selection logic
    const map: Record<string, string> = {
      emotion: 'somatic',
      body: 'somatic',
      meaning: 'invocational',
      action: 'witness',
      relationship: 'spacious',
      general: 'witness'
    };

    return map[theme] || 'witness';
  }

  private selectRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}

/**
 * SINGLETON INSTANCE
 */
let sovereigntyProtocol: SovereigntyProtocol | null = null;

export function getSovereigntyProtocol(): SovereigntyProtocol {
  if (!sovereigntyProtocol) {
    sovereigntyProtocol = new SovereigntyProtocol();
  }
  return sovereigntyProtocol;
}

/**
 * USAGE EXAMPLES
 *
 * // Check if response violates sovereignty
 * const protocol = getSovereigntyProtocol();
 * const check = protocol.checkSovereignty("You should meditate daily");
 * // Returns: { isAdviceGiving: true, recommendation: 'REDIRECT', ... }
 *
 * // Redirect to user's wisdom
 * const reflection = protocol.redirectToWisdom(originalResponse, userContext);
 * // Returns: { type: 'somatic', prompt: 'What does your body say about this?' }
 *
 * // Reframe advice-giving response
 * const reframed = protocol.reframeResponse("You should do X");
 * // Returns: "You might consider X\n\nWhat feels true for you?"
 *
 * // Generate sovereignty-aligned response
 * const response = protocol.generateSovereignResponse(userMessage, context);
 * // Returns response that reflects back to user's wisdom
 *
 * // Validate response
 * const validation = protocol.validateResponse(response);
 * // Returns: { valid: true, preservesSovereignty: true, ... }
 */
