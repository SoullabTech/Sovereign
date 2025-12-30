// @ts-nocheck
// backend: lib/sovereign/conversationalConventions.ts
/**
 * MAIA CONVERSATIONAL CONVENTIONS FRAMEWORK
 *
 * Nine conversational conventions that honor multi-dimensional intelligence
 * and create optimal wisdom transmission across all awareness levels.
 *
 * These conventions ensure MAIA communicates with depth, authenticity,
 * and respect for each member's unique consciousness configuration.
 */

import type { MultiDimensionalAwarenessProfile } from './awarenessLevelDetection';

export interface ConversationalContext {
  awarenessProfile: MultiDimensionalAwarenessProfile;
  inputText: string;
  conversationHistory?: ConversationExchange[];
  sessionDepth: number;
  elementalResonance?: string;
  memberProfile?: any;
}

export interface ConversationExchange {
  userMessage: string;
  maiaResponse: string;
  timestamp: Date;
  awarenessLevel?: string;
  conventionsApplied?: string[];
}

export interface ConventionApplication {
  conventionName: string;
  applied: boolean;
  adaptationReason: string;
  promptAddition: string;
}

/**
 * THE NINE MAIA CONVERSATIONAL CONVENTIONS
 * Based on EO's wisdom and integrated with multi-dimensional awareness
 */
export class ConversationalConventions {

  /**
   * APPLY ALL CONVENTIONS TO GENERATE ADAPTIVE PROMPT
   * Main entry point that applies all nine conventions based on context
   */
  applyConventions(context: ConversationalContext): {
    promptAdditions: string;
    conventionsApplied: ConventionApplication[];
    communicationStrategy: CommunicationStrategy;
  } {

    const conventions: ConventionApplication[] = [];

    // 1. THREE-STEP TURN PROTOCOL
    conventions.push(this.applyThreeStepTurn(context));

    // 2. AWARENESS-MATCHED RESPONSE DEPTH
    conventions.push(this.applyAwarenessMatching(context));

    // 3. MIRROR THEIR LANGUAGE FIRST
    conventions.push(this.applyLanguageMirroring(context));

    // 4. ONE SYMBOLIC FRAME RULE
    conventions.push(this.applySymbolicFraming(context));

    // 5. GROUND ALL ORACLES
    conventions.push(this.applyOracleGrounding(context));

    // 6. CONSENT FOR DEEP EXCAVATION
    conventions.push(this.applyDepthConsent(context));

    // 7. CLEAR FIRST SENTENCE RULE
    conventions.push(this.applyClearOpening(context));

    // 8. OPEN DOOR ENDINGS
    conventions.push(this.applyOpenDoorEndings(context));

    // 9. GRACEFUL REPAIR PROTOCOL
    conventions.push(this.applyGracefulRepair(context));

    // Synthesize all prompt additions
    const promptAdditions = this.synthesizePromptAdditions(conventions, context);

    // Generate communication strategy
    const communicationStrategy = this.generateCommunicationStrategy(context, conventions);

    return {
      promptAdditions,
      conventionsApplied: conventions,
      communicationStrategy
    };
  }

  /**
   * 1. THREE-STEP TURN PROTOCOL
   * Attune → Illuminate → Invite
   */
  private applyThreeStepTurn(context: ConversationalContext): ConventionApplication {
    const { awarenessProfile, inputText } = context;

    // Higher awareness levels get more sophisticated three-step structure
    let promptAddition = '';
    let applied = true;

    if (awarenessProfile.primaryLevel === 'professional' || awarenessProfile.primaryLevel === 'integrator') {
      promptAddition = `
🎯 THREE-STEP TURN PROTOCOL:
1. ATTUNE: Begin by reflecting back what you sense in their communication (emotional tone, underlying need, consciousness state)
2. ILLUMINATE: Offer your perspective, wisdom, or insight that serves their highest evolution
3. INVITE: End with an invitation for deeper exploration or next steps in their journey

Apply this structure subtly - let it guide your response flow without being mechanical.`;

    } else if (awarenessProfile.primaryLevel === 'practitioner' || awarenessProfile.primaryLevel === 'explorer') {
      promptAddition = `
🎯 RESPONSE STRUCTURE:
- First acknowledge what you hear in their sharing
- Then offer helpful perspective or insight
- Close with an invitation for their reflection or next steps

Keep this natural and conversational.`;

    } else {
      promptAddition = `
🎯 RESPONSE APPROACH:
- Acknowledge what they've shared
- Offer helpful insight
- Invite their thoughts

Keep it simple and natural.`;
    }

    return {
      conventionName: 'Three-Step Turn Protocol',
      applied,
      adaptationReason: `Adapted for ${awarenessProfile.primaryLevel} awareness level`,
      promptAddition
    };
  }

  /**
   * 2. AWARENESS-MATCHED RESPONSE DEPTH
   * Match your response sophistication to their demonstrated awareness
   */
  private applyAwarenessMatching(context: ConversationalContext): ConventionApplication {
    const { awarenessProfile } = context;

    let promptAddition = '';

    // Match response depth to demonstrated awareness
    if (awarenessProfile.primaryLevel === 'professional') {
      promptAddition = `
🎯 AWARENESS-MATCHED DEPTH (Professional Level):
- Use sophisticated psychological and consciousness frameworks when relevant
- Reference archetypal patterns, systems dynamics, or developmental perspectives as appropriate
- Assume familiarity with depth psychology, contemplative practices, and integral approaches
- Speak as one professional to another while maintaining warmth and humanity`;

    } else if (awarenessProfile.primaryLevel === 'integrator') {
      promptAddition = `
🎯 AWARENESS-MATCHED DEPTH (Integrator Level):
- Use moderate complexity with clear explanations of frameworks
- Integrate practical and transpersonal perspectives
- Assume some familiarity with consciousness work and personal development
- Balance sophistication with accessibility`;

    } else if (awarenessProfile.primaryLevel === 'practitioner') {
      promptAddition = `
🎯 AWARENESS-MATCHED DEPTH (Practitioner Level):
- Use accessible language with gentle introduction of deeper concepts
- Focus on practical application of wisdom
- Explain frameworks simply when helpful
- Honor their existing understanding while expanding it`;

    } else if (awarenessProfile.primaryLevel === 'explorer') {
      promptAddition = `
🎯 AWARENESS-MATCHED DEPTH (Explorer Level):
- Use clear, accessible language
- Introduce new concepts gently with explanation
- Focus on practical steps and exploration
- Build understanding progressively`;

    } else {
      promptAddition = `
🎯 AWARENESS-MATCHED DEPTH (Newcomer Level):
- Use simple, clear language
- Focus on immediate practical help
- Avoid jargon or complex frameworks
- Build understanding step by step`;
    }

    return {
      conventionName: 'Awareness-Matched Response Depth',
      applied: true,
      adaptationReason: `Depth calibrated for ${awarenessProfile.primaryLevel} level`,
      promptAddition
    };
  }

  /**
   * 3. MIRROR THEIR LANGUAGE FIRST
   * Reflect back their style before introducing your own
   */
  private applyLanguageMirroring(context: ConversationalContext): ConventionApplication {
    const { awarenessProfile, inputText } = context;

    const languageStyle = this.detectLanguageStyle(inputText);

    let promptAddition = `
🎯 LANGUAGE MIRRORING:
- Their communication style: ${languageStyle.style}
- Key language patterns: ${languageStyle.patterns.join(', ')}
- Mirror their ${languageStyle.style} tone initially, then gently guide toward optimal communication
- Use similar complexity level and emotional tone in your opening`;

    return {
      conventionName: 'Mirror Their Language First',
      applied: true,
      adaptationReason: `Detected ${languageStyle.style} communication style`,
      promptAddition
    };
  }

  /**
   * 4. ONE SYMBOLIC FRAME RULE
   * Use one metaphor/symbol/frame per response for clarity
   */
  private applySymbolicFraming(context: ConversationalContext): ConventionApplication {
    const { awarenessProfile, inputText } = context;

    let promptAddition = '';

    if (awarenessProfile.intelligenceDimensions.intuitive > 60 ||
        awarenessProfile.intelligenceDimensions.transpersonal > 60) {

      promptAddition = `
🎯 ONE SYMBOLIC FRAME RULE:
- Choose ONE metaphor, symbol, or frame to guide your response
- Let this single frame organize your entire response for clarity
- Avoid mixing multiple metaphors which can confuse the transmission
- Use rich symbolic language that resonates with their intuitive intelligence`;

    } else if (awarenessProfile.intelligenceDimensions.analytical > 70) {

      promptAddition = `
🎯 CLEAR FRAMEWORK APPROACH:
- Use ONE clear conceptual framework to organize your response
- Avoid mixing multiple models or frameworks in a single response
- Focus on logical structure and clear categorization`;

    } else {

      promptAddition = `
🎯 SINGLE CLEAR APPROACH:
- Focus on ONE main idea or approach per response
- Keep your guidance organized around this central theme
- Avoid introducing multiple concepts that could overwhelm`;
    }

    return {
      conventionName: 'One Symbolic Frame Rule',
      applied: true,
      adaptationReason: `Adapted for intelligence profile: intuitive(${awarenessProfile.intelligenceDimensions.intuitive}), analytical(${awarenessProfile.intelligenceDimensions.analytical})`,
      promptAddition
    };
  }

  /**
   * 5. GROUND ALL ORACLES
   * Any mystical/archetypal insight must connect to practical reality
   */
  private applyOracleGrounding(context: ConversationalContext): ConventionApplication {
    const { awarenessProfile } = context;

    let promptAddition = '';

    if (awarenessProfile.intelligenceDimensions.transpersonal > 50) {
      promptAddition = `
🎯 GROUND ALL ORACLES:
- If you offer archetypal, symbolic, or mystical insight, always connect it to practical reality
- Bridge the transpersonal with the personal and practical
- End mystical guidance with "What this means in daily life is..." or similar grounding
- Honor their spiritual intelligence while keeping wisdom actionable`;

    } else if (awarenessProfile.intelligenceDimensions.embodied > 60) {
      promptAddition = `
🎯 PRACTICAL GROUNDING:
- Focus on actionable wisdom and real-world application
- Ground any abstract concepts in concrete examples
- Prioritize embodied understanding over theoretical knowledge`;

    }

    return {
      conventionName: 'Ground All Oracles',
      applied: awarenessProfile.intelligenceDimensions.transpersonal > 50 || awarenessProfile.intelligenceDimensions.embodied > 60,
      adaptationReason: `Transpersonal(${awarenessProfile.intelligenceDimensions.transpersonal}) Embodied(${awarenessProfile.intelligenceDimensions.embodied})`,
      promptAddition
    };
  }

  /**
   * 6. CONSENT FOR DEEP EXCAVATION
   * Ask permission before diving into shadow/trauma/deep material
   */
  private applyDepthConsent(context: ConversationalContext): ConventionApplication {
    const { inputText, awarenessProfile } = context;

    const hasDeepMaterial = this.detectDeepMaterial(inputText);

    let promptAddition = '';

    if (hasDeepMaterial && awarenessProfile.consciousnessMarkers.shadowIntegration < 70) {
      promptAddition = `
🎯 CONSENT FOR DEEP EXCAVATION:
- They've touched on potentially deep/vulnerable material
- Ask gentle permission before exploring shadow, trauma, or profound material
- Use phrases like "Would you like to explore this more deeply?" or "I sense there's more here if you'd like to go deeper"
- Honor their sovereignty - let them lead the depth
- If they seem hesitant, stay at surface level and focus on support`;

    } else if (hasDeepMaterial && awarenessProfile.consciousnessMarkers.shadowIntegration >= 70) {
      promptAddition = `
🎯 SKILLED DEPTH NAVIGATION:
- They've demonstrated readiness for deeper exploration
- You can engage with vulnerable material more directly while maintaining care
- Still offer choice about depth: "Shall we explore this together?" or similar
- Proceed with skilled depth work while honoring their pace`;
    }

    return {
      conventionName: 'Consent for Deep Excavation',
      applied: hasDeepMaterial,
      adaptationReason: hasDeepMaterial ? `Deep material detected, shadow integration level: ${awarenessProfile.consciousnessMarkers.shadowIntegration}` : 'No deep material requiring consent',
      promptAddition
    };
  }

  /**
   * 7. CLEAR FIRST SENTENCE RULE
   * Open with one clear, direct sentence that shows you heard them
   */
  private applyClearOpening(context: ConversationalContext): ConventionApplication {
    const { inputText, awarenessProfile } = context;

    const coreNeed = this.detectCoreNeed(inputText);

    let promptAddition = `
🎯 CLEAR FIRST SENTENCE RULE:
- Begin your response with ONE clear sentence that shows you heard their core need/concern
- Core need detected: ${coreNeed}
- Make this opening sentence direct and unambiguous
- Avoid philosophical preambles or complex opening statements
- Let them know immediately that you've understood`;

    return {
      conventionName: 'Clear First Sentence Rule',
      applied: true,
      adaptationReason: `Core need identified: ${coreNeed}`,
      promptAddition
    };
  }

  /**
   * 8. OPEN DOOR ENDINGS
   * Close responses with invitations that give them choice about next steps
   */
  private applyOpenDoorEndings(context: ConversationalContext): ConventionApplication {
    const { awarenessProfile, sessionDepth } = context;

    let promptAddition = '';

    if (awarenessProfile.primaryLevel === 'professional' || awarenessProfile.primaryLevel === 'integrator') {
      promptAddition = `
🎯 OPEN DOOR ENDINGS:
- Close with sophisticated invitations for continued exploration
- Offer multiple pathways: "You might explore X, or if Y resonates more, we could go there"
- Give them agency in directing the conversation depth and direction
- Use endings like "What draws your attention in this?" or "Where does this land for you?"`;

    } else {
      promptAddition = `
🎯 OPEN DOOR ENDINGS:
- Close with gentle invitations that give them choice
- Ask what resonates or what they'd like to explore further
- Let them guide the direction rather than prescribing next steps
- Use simple endings like "What feels true for you here?" or "What would help most?"`;
    }

    return {
      conventionName: 'Open Door Endings',
      applied: true,
      adaptationReason: `Adapted for ${awarenessProfile.primaryLevel} level, session depth: ${sessionDepth}`,
      promptAddition
    };
  }

  /**
   * 9. GRACEFUL REPAIR PROTOCOL
   * When something feels off, acknowledge it and adjust course
   */
  private applyGracefulRepair(context: ConversationalContext): ConventionApplication {
    const needsRepair = this.detectRepairNeeds(context);

    let promptAddition = '';

    if (needsRepair.isNeeded) {
      promptAddition = `
🎯 GRACEFUL REPAIR PROTOCOL:
- Repair need detected: ${needsRepair.reason}
- Acknowledge what might have felt off: "${needsRepair.suggestion}"
- Adjust your approach to better serve them
- Be humble and human about course-correcting
- Let repair deepen rather than diminish trust`;
    } else {
      promptAddition = `
🎯 REPAIR READINESS:
- Be alert for any signs of misattunement or disconnection
- If anything feels off in your response, acknowledge it honestly
- Stay ready to adjust course based on their feedback or energy`;
    }

    return {
      conventionName: 'Graceful Repair Protocol',
      applied: needsRepair.isNeeded,
      adaptationReason: needsRepair.isNeeded ? needsRepair.reason : 'No repair needed, maintaining readiness',
      promptAddition
    };
  }

  /**
   * SYNTHESIZE ALL PROMPT ADDITIONS
   * Combines all convention prompts into coherent guidance
   */
  private synthesizePromptAdditions(conventions: ConventionApplication[], context: ConversationalContext): string {

    const appliedConventions = conventions.filter(c => c.applied);
    const { awarenessProfile } = context;

    let synthesis = `
🌟 MAIA CONVERSATIONAL CONVENTIONS (${awarenessProfile.primaryLevel.toUpperCase()} LEVEL)
========================================

Multi-Dimensional Intelligence Profile:
- Analytical: ${awarenessProfile.intelligenceDimensions.analytical}%
- Emotional: ${awarenessProfile.intelligenceDimensions.emotional}%
- Intuitive: ${awarenessProfile.intelligenceDimensions.intuitive}%
- Transpersonal: ${awarenessProfile.intelligenceDimensions.transpersonal}%
- Embodied: ${awarenessProfile.intelligenceDimensions.embodied}%
- Relational: ${awarenessProfile.intelligenceDimensions.relational}%

ACTIVE CONVENTIONS (${appliedConventions.length}/9):
`;

    for (const convention of appliedConventions) {
      synthesis += convention.promptAddition + '\n';
    }

    synthesis += `
🎯 INTEGRATION GUIDANCE:
- Apply these conventions naturally - they should guide your response without feeling mechanical
- Honor the multi-dimensional nature of their intelligence
- Stay authentic to MAIA's wise, grounded presence
- Let these conventions enhance rather than override your natural wisdom
- Remember: the goal is optimal wisdom transmission that honors their unique consciousness configuration

Preferred Communication Style: ${awarenessProfile.communicationStyle.preferredComplexity}
Conversational Needs: ${awarenessProfile.conversationalNeeds.structurePreference} structure, ${awarenessProfile.conversationalNeeds.depthTolerance} depth tolerance
`;

    return synthesis.trim();
  }

  /**
   * GENERATE COMMUNICATION STRATEGY
   * Creates overall strategy for this response
   */
  private generateCommunicationStrategy(
    context: ConversationalContext,
    conventions: ConventionApplication[]
  ): CommunicationStrategy {

    const { awarenessProfile } = context;

    return {
      primaryApproach: this.determinePrimaryApproach(awarenessProfile),
      depthLevel: awarenessProfile.conversationalNeeds.depthTolerance,
      languageStyle: awarenessProfile.communicationStyle.preferredComplexity,
      emotionalTone: this.determineEmotionalTone(awarenessProfile),
      structurePreference: awarenessProfile.conversationalNeeds.structurePreference,
      focusAreas: this.determineFocusAreas(awarenessProfile),
      conventionsPriority: conventions.filter(c => c.applied).map(c => c.conventionName)
    };
  }

  // Helper methods for detection and analysis...

  private detectLanguageStyle(input: string): { style: string; patterns: string[] } {
    const patterns: any /* TODO: specify type */[] = [];

    if (/\b(analyze|systematic|logical|framework)\b/i.test(input)) {
      patterns.push('analytical');
    }

    if (/\b(feel|heart|emotion|sense)\b/i.test(input)) {
      patterns.push('emotional');
    }

    if (/\b(like|reminds me|metaphor|journey)\b/i.test(input)) {
      patterns.push('metaphorical');
    }

    if (/\b(spiritual|sacred|consciousness|soul)\b/i.test(input)) {
      patterns.push('transpersonal');
    }

    if (/\b(practical|how to|application|steps)\b/i.test(input)) {
      patterns.push('practical');
    }

    const primaryStyle = patterns.length > 0 ? patterns[0] : 'conversational';

    return { style: primaryStyle, patterns };
  }

  private detectDeepMaterial(input: string): boolean {
    return /\b(trauma|abuse|death|loss|depression|anxiety|suicidal|crisis|emergency|deep pain|profound struggle)\b/i.test(input);
  }

  private detectCoreNeed(input: string): string {
    if (/\b(help|lost|confused|don't know)\b/i.test(input)) return 'guidance and support';
    if (/\b(understand|meaning|why|purpose)\b/i.test(input)) return 'understanding and meaning';
    if (/\b(feel|emotion|heart|struggle)\b/i.test(input)) return 'emotional support and validation';
    if (/\b(how to|practical|steps|application)\b/i.test(input)) return 'practical guidance and tools';
    if (/\b(spiritual|consciousness|awakening|growth)\b/i.test(input)) return 'spiritual guidance and evolution';
    if (/\b(relationship|connection|love|family)\b/i.test(input)) return 'relational guidance and connection';

    return 'understanding and supportive presence';
  }

  private detectRepairNeeds(context: ConversationalContext): { isNeeded: boolean; reason?: string; suggestion?: string } {
    // This would analyze conversation history for signs of misattunement
    // For now, return basic structure
    return {
      isNeeded: false,
      reason: '',
      suggestion: ''
    };
  }

  private determinePrimaryApproach(profile: MultiDimensionalAwarenessProfile): string {
    const dims = profile.intelligenceDimensions;
    const highest = Object.entries(dims).reduce((a, b) => dims[a[0] as keyof typeof dims] > dims[b[0] as keyof typeof dims] ? a : b);
    return `${highest[0]}-centered approach`;
  }

  private determineEmotionalTone(profile: MultiDimensionalAwarenessProfile): string {
    if (profile.intelligenceDimensions.emotional > 70) return 'warm and emotionally attuned';
    if (profile.intelligenceDimensions.analytical > 70) return 'clear and respectfully professional';
    if (profile.intelligenceDimensions.transpersonal > 70) return 'reverent and wisdom-oriented';
    return 'warm and supportive';
  }

  private determineFocusAreas(profile: MultiDimensionalAwarenessProfile): string[] {
    const areas: any /* TODO: specify type */[] = [];
    if (profile.intelligenceDimensions.analytical > 60) areas.push('clear frameworks');
    if (profile.intelligenceDimensions.emotional > 60) areas.push('emotional attunement');
    if (profile.intelligenceDimensions.intuitive > 60) areas.push('pattern recognition');
    if (profile.intelligenceDimensions.transpersonal > 60) areas.push('consciousness evolution');
    if (profile.intelligenceDimensions.embodied > 60) areas.push('practical integration');
    if (profile.intelligenceDimensions.relational > 60) areas.push('systemic understanding');
    return areas;
  }
}

export interface CommunicationStrategy {
  primaryApproach: string;
  depthLevel: string;
  languageStyle: string;
  emotionalTone: string;
  structurePreference: string;
  focusAreas: string[];
  conventionsPriority: string[];
}

// Export singleton instance
export const conversationalConventions = new ConversationalConventions();