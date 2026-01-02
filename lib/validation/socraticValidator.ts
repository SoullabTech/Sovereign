/**
 * Socratic Validator - Pre-Emptive Response Validation
 *
 * TypeScript port of the Python validator for production use.
 * Validates MAIA responses BEFORE delivery across 5 layers:
 * 1. Opus Axioms
 * 2. Elemental Alignment
 * 3. Phase Transition Awareness
 * 4. Caution Compliance
 * 5. Language Resonance
 *
 * Status: Phase 3 of Three-Layer Conscience Architecture
 * Date: December 14, 2025
 */

export type ValidatorDecision = 'ALLOW' | 'FLAG' | 'BLOCK' | 'REGENERATE';

export type RuptureSeverity = 'INFO' | 'WARNING' | 'VIOLATION' | 'CRITICAL';

export type RuptureLayer =
  | 'OPUS_AXIOMS'
  | 'ELEMENTAL_ALIGNMENT'
  | 'PHASE_AWARENESS'
  | 'CAUTION_COMPLIANCE'
  | 'LANGUAGE_RESONANCE';

export type ValidatorRupture = {
  layer: RuptureLayer;
  code: string;
  severity: RuptureSeverity;
  detected: string;
  recommendation: string;
  context?: string;
};

export type SocraticValidationResult = {
  decision: ValidatorDecision;
  isGold: boolean; // True if zero ruptures
  passes: boolean; // True if deliverable (no CRITICAL/multiple VIOLATION)
  ruptures: ValidatorRupture[];
  repairPrompt?: string; // Generated if decision is REGENERATE
  summary: string;
};

type ValidateArgs = {
  userMessage: string;
  draft: string;
  element?: string; // Fire/Water/Earth/Air/Aether
  facet?: string; // FIRE_1, WATER_2, etc.
  phase?: number; // 1, 2, 3
  confidence?: number; // 0..1
  isUncertain?: boolean; // From Mythic Atlas
  regulation?: string; // hypo, hyper, within_window
  capacity?: string; // low, medium, high
};

/**
 * Main validation function - validates MAIA response across 5 layers
 */
export function validateSocraticResponse(args: ValidateArgs): SocraticValidationResult {
  const ruptures: ValidatorRupture[] = [];

  // Layer 1: Opus Axioms (basic patterns - full axiom check happens separately)
  ruptures.push(...checkOpusAxiomPatterns(args));

  // Layer 2: Elemental Alignment
  ruptures.push(...checkElementalAlignment(args));

  // Layer 3: Phase Transition Awareness
  ruptures.push(...checkPhaseTransitionAwareness(args));

  // Layer 4: Caution Compliance
  ruptures.push(...checkCautionCompliance(args));

  // Layer 5: Language Resonance
  ruptures.push(...checkLanguageResonance(args));

  // Determine decision based on severity
  const hasCritical = ruptures.some((r) => r.severity === 'CRITICAL');
  const violationCount = ruptures.filter((r) => r.severity === 'VIOLATION').length;
  const hasWarning = ruptures.some((r) => r.severity === 'WARNING');

  let decision: ValidatorDecision;
  let passes: boolean;

  if (hasCritical || violationCount >= 2) {
    decision = 'REGENERATE';
    passes = false;
  } else if (violationCount === 1) {
    decision = 'BLOCK';
    passes = false;
  } else if (hasWarning) {
    decision = 'FLAG';
    passes = true;
  } else {
    decision = 'ALLOW';
    passes = true;
  }

  const isGold = ruptures.length === 0;

  const summary = isGold
    ? '⭐ GOLD - Perfect alignment'
    : hasCritical
    ? `🚨 CRITICAL - ${ruptures.filter((r) => r.severity === 'CRITICAL').length} critical ruptures - Must regenerate`
    : violationCount >= 2
    ? `❌ VIOLATION - ${violationCount} violations - Must regenerate`
    : violationCount === 1
    ? `❌ VIOLATION - Response blocked`
    : hasWarning
    ? `⚠️  WARNING - ${ruptures.filter((r) => r.severity === 'WARNING').length} warnings - Flagged for review`
    : '✅ PASS - Deliverable';

  const repairPrompt = decision === 'REGENERATE' || decision === 'BLOCK'
    ? generateRepairPrompt(args, ruptures)
    : undefined;

  return {
    decision,
    isGold,
    passes,
    ruptures,
    repairPrompt,
    summary,
  };
}

/**
 * Layer 1: Basic Opus Axiom patterns
 * (Full axiom evaluation happens separately in opus-axioms.ts)
 */
function checkOpusAxiomPatterns(args: ValidateArgs): ValidatorRupture[] {
  const ruptures: ValidatorRupture[] = [];
  const draft = args.draft.toLowerCase();

  // NON_IMPOSITION_OF_IDENTITY: Identity-claiming language
  const identityPatterns = [
    /\byou are\s+\w+ing\b/i, // "you are experiencing", "you are navigating"
    /\bi (can tell|sense you'?re|see you'?re)\b/i,
    /\b(clearly|obviously|definitely)\s+you\b/i,
  ];

  if (identityPatterns.some((rx) => rx.test(args.draft))) {
    ruptures.push({
      layer: 'OPUS_AXIOMS',
      code: 'NON_IMPOSITION_OF_IDENTITY',
      severity: 'VIOLATION',
      detected: 'Identity-claiming language detected (imposes frame on user)',
      recommendation: 'Use "I sense..." or "It sounds like..." instead of "You are..."',
      context: 'Opus Axiom: Never impose identity - let users self-recognize',
    });
  }

  // EXPLICIT_HUMILITY: False certainty language
  const certaintyPatterns = /\b(clearly|obviously|definitely|certainly|without doubt|absolutely|always|never)\b/i;
  const matchCount = (args.draft.match(certaintyPatterns) || []).length;

  if (matchCount >= 3) {
    ruptures.push({
      layer: 'OPUS_AXIOMS',
      code: 'EXPLICIT_HUMILITY',
      severity: 'WARNING',
      detected: `Multiple certainty words detected (${matchCount} instances)`,
      recommendation: 'Use "it seems", "might be", "I\'m sensing" to hold uncertainty',
      context: 'Opus Axiom: Practice explicit humility - avoid false certainty',
    });
  }

  // PACE_WITH_CARE: Rushing development
  const rushingPatterns = /\b(you (need to|must|should) (immediately|now|right away))\b/i;

  if (rushingPatterns.test(args.draft)) {
    ruptures.push({
      layer: 'OPUS_AXIOMS',
      code: 'PACE_WITH_CARE',
      severity: 'WARNING',
      detected: 'Rushing language detected (need to immediately/must now)',
      recommendation: 'Invite gentle exploration instead of demanding immediate action',
      context: 'Opus Axiom: Pace with care - development cannot be rushed',
    });
  }

  return ruptures;
}

/**
 * Layer 2: Elemental Alignment
 * Validates that response language matches the user's elemental territory
 */
function checkElementalAlignment(args: ValidateArgs): ValidatorRupture[] {
  const ruptures: ValidatorRupture[] = [];
  const draft = args.draft.toLowerCase();
  const element = args.element?.toLowerCase();

  if (!element || element === 'aether') return ruptures; // Skip if no element or Aether

  // Define elemental language patterns
  const firePatterns = /\b(take action|move forward|push|fight|activate|mission|calling|purpose|courage|warrior|bold|fierce|power|strength|overcome|rise up|momentum|drive)\b/gi;
  const waterPatterns = /\b(feel|grief|tender|flow|depth|mystery|intuition|tears|softness|allow|receive|sacred|witness|held|alone|abandonment|longing|broken|loss)\b/gi;
  const earthPatterns = /\b(build|structure|practice|routine|grounded|stable|container|resource|body|sensation|concrete|practical|tangible)\b/gi;
  const airPatterns = /\b(think|understand|analyze|pattern|concept|idea|communicate|teach|share|perspective|clarity|insight)\b/gi;

  // Count pattern matches
  const fireCount = (draft.match(firePatterns) || []).length;
  const waterCount = (draft.match(waterPatterns) || []).length;
  const earthCount = (draft.match(earthPatterns) || []).length;
  const airCount = (draft.match(airPatterns) || []).length;

  // Determine dominant language
  let dominantElement = 'neutral';
  let dominantCount = 0;

  if (fireCount > dominantCount) {
    dominantElement = 'fire';
    dominantCount = fireCount;
  }
  if (waterCount > dominantCount) {
    dominantElement = 'water';
    dominantCount = waterCount;
  }
  if (earthCount > dominantCount) {
    dominantElement = 'earth';
    dominantCount = earthCount;
  }
  if (airCount > dominantCount) {
    dominantElement = 'air';
    dominantCount = airCount;
  }

  // Check for critical mismatches
  // CRITICAL: Fire language in Water territory (or vice versa)
  if (element === 'water' && dominantElement === 'fire' && fireCount >= 3) {
    ruptures.push({
      layer: 'ELEMENTAL_ALIGNMENT',
      code: 'FIRE_IN_WATER',
      severity: 'CRITICAL',
      detected: `Response uses FIRE language (count: ${fireCount}) but user is in WATER territory`,
      recommendation:
        'Rewrite using WATER-appropriate language: feel, depth, tender, flow, allow, receive, witness',
      context: `User is in ${element.toUpperCase()} territory - response must match`,
    });
  }

  if (element === 'fire' && dominantElement === 'water' && waterCount >= 3) {
    ruptures.push({
      layer: 'ELEMENTAL_ALIGNMENT',
      code: 'WATER_IN_FIRE',
      severity: 'WARNING', // Less critical than Fire in Water (grief protection)
      detected: `Response uses WATER language (count: ${waterCount}) but user is in FIRE territory`,
      recommendation:
        'Consider adding FIRE-appropriate language: action, courage, calling, momentum, strength',
      context: `User is in ${element.toUpperCase()} territory - response may feel too soft`,
    });
  }

  return ruptures;
}

/**
 * Layer 3: Phase Transition Awareness
 * Validates response honors system uncertainty flags
 */
function checkPhaseTransitionAwareness(args: ValidateArgs): ValidatorRupture[] {
  const ruptures: ValidatorRupture[] = [];

  // Only check if system flagged uncertainty
  if (!args.isUncertain) return ruptures;

  const draft = args.draft.toLowerCase();

  // Count certainty language
  const certaintyPatterns = /\b(clearly|obviously|definitely|certainly|without doubt|absolutely|you are|you need to|you should|this is)\b/gi;
  const certaintyCount = (draft.match(certaintyPatterns) || []).length;

  // Count complexity-holding language
  const complexityPatterns = /\b(it seems|i sense|might be|could be|both|tension between|complexity|paradox|i'm noticing|wondering if|appears)\b/gi;
  const complexityCount = (draft.match(complexityPatterns) || []).length;

  // CRITICAL if high certainty without complexity-holding
  if (certaintyCount >= 2 && complexityCount === 0) {
    ruptures.push({
      layer: 'PHASE_AWARENESS',
      code: 'FALSE_CERTAINTY_WHEN_UNCERTAIN',
      severity: 'CRITICAL',
      detected: `Response speaks with certainty (${certaintyCount} instances) but system flagged uncertainty`,
      recommendation:
        'Acknowledge the complexity: "I\'m sensing both [X] and [Y]..." or "There seems to be a tension between..."',
      context: `System confidence: ${((args.confidence || 0) * 100).toFixed(0)}% - uncertainty detected`,
    });
  }

  return ruptures;
}

/**
 * Layer 4: Caution Compliance
 * Validates against territory-specific cautions
 */
function checkCautionCompliance(args: ValidateArgs): ValidatorRupture[] {
  const ruptures: ValidatorRupture[] = [];
  const draft = args.draft.toLowerCase();
  const userMessage = args.userMessage.toLowerCase();
  const element = args.element?.toLowerCase();
  const regulation = args.regulation?.toLowerCase();

  // CAUTION 1: Mission/purpose talk during acute grief (Water + hypo-arousal)
  const griefKeywords = /\b(grief|mourning|bereav(ed|ement)|loss|died|death|abandoned|broken)\b/i;
  const missionKeywords = /\b(mission|calling|destiny|purpose|you must|time to act|sacred work|meant to do)\b/i;

  if (
    element === 'water' &&
    regulation === 'hypo' &&
    griefKeywords.test(userMessage) &&
    missionKeywords.test(draft)
  ) {
    ruptures.push({
      layer: 'CAUTION_COMPLIANCE',
      code: 'MISSION_DURING_GRIEF',
      severity: 'CRITICAL',
      detected: 'Pushing mission/purpose conversation during acute grief (Water hypo-arousal)',
      recommendation:
        'Do NOT ask about purpose/mission/calling. Stay with the feeling. Ask about body, tears, where grief lives.',
      context: 'Caution: Never ask about purpose/mission during acute grief',
    });
  }

  // CAUTION 2: Spiritual bypassing
  const bypassingPatterns = /\b(everything happens for a reason|this is a blessing|meant to teach you|universe is preparing you|gift in this suffering)\b/i;

  if (element === 'water' && bypassingPatterns.test(draft)) {
    ruptures.push({
      layer: 'CAUTION_COMPLIANCE',
      code: 'SPIRITUAL_BYPASSING',
      severity: 'VIOLATION',
      detected: 'Spiritual bypassing detected (everything happens for a reason, blessing in disguise, etc.)',
      recommendation: 'Never suggest suffering has pre-ordained purpose. Honor the pain as it is.',
      context: 'Caution: Never spiritually bypass grief - it invalidates real pain',
    });
  }

  // CAUTION 3: Fire practices in Water territory
  const firePractices = /\b(activate|push yourself|take bold action|fight through|overcome this|rise up)\b/i;

  if (element === 'water' && regulation === 'hypo' && firePractices.test(draft)) {
    ruptures.push({
      layer: 'CAUTION_COMPLIANCE',
      code: 'FIRE_PRACTICES_IN_WATER',
      severity: 'CRITICAL',
      detected: 'Fire practices (activate, push, fight) inappropriate for Water hypo-arousal',
      recommendation: 'Water territory needs: presence, feeling, depth, allowing. No action-pushing.',
      context: 'User is hypo-aroused (collapsed) - Fire activation would overwhelm',
    });
  }

  // CAUTION 4: Rushing development
  const rushingPatterns = /\b(you need to (immediately|right now|today)|start (now|today|immediately)|time to (act now|move now))\b/i;

  if (rushingPatterns.test(draft)) {
    ruptures.push({
      layer: 'CAUTION_COMPLIANCE',
      code: 'RUSHING_DEVELOPMENT',
      severity: 'WARNING',
      detected: 'Rushing development with immediate action language',
      recommendation: 'Invite gentle exploration. Development cannot be rushed.',
      context: 'Developmental work requires pacing and care',
    });
  }

  return ruptures;
}

/**
 * Layer 5: Language Resonance
 * Validates tonal alignment with archetypal territory and linguistic integrity
 *
 * CANON v1.1: Structural linguistic integrity prevents "mind/mouth collapse" -
 * when the reasoning layer speaks unmediated through the articulation layer,
 * producing grammatical artifacts (missing referents, dropped placeholders).
 */
function checkLanguageResonance(args: ValidateArgs): ValidatorRupture[] {
  const ruptures: ValidatorRupture[] = [];
  const draft = args.draft;
  const draftLower = draft.toLowerCase();
  const element = args.element?.toLowerCase();

  // ─────────────────────────────────────────────────────────────────
  // LINGUISTIC INTEGRITY CHECKS (Mind/Mouth Collapse Detection)
  // ─────────────────────────────────────────────────────────────────

  // Missing referent after colon (e.g., "The word you used: .")
  if (/: \./.test(draft)) {
    ruptures.push({
      layer: 'LANGUAGE_RESONANCE',
      code: 'MIND_MOUTH_COLLAPSE_REFERENT',
      severity: 'CRITICAL',
      detected: 'Missing referent after colon (": .") - indicates dropped placeholder',
      recommendation: 'The sentence structure is broken. Rewrite with complete referent or remove the colon construction.',
      context: 'Mind/mouth collapse: reasoning layer spoke without articulation layer completing the thought',
    });
  }

  // Double periods (e.g., "something.. else")
  if (/\.\s*\./.test(draft)) {
    ruptures.push({
      layer: 'LANGUAGE_RESONANCE',
      code: 'MIND_MOUTH_COLLAPSE_DOUBLE_PERIOD',
      severity: 'WARNING',
      detected: 'Double period detected - indicates incomplete sentence structure',
      recommendation: 'Remove duplicate punctuation or complete the trailing thought.',
      context: 'Mind/mouth collapse: incomplete articulation',
    });
  }

  // Empty quotes (e.g., 'the word "" means')
  if (/"\s*"/.test(draft) || /'\s*'/.test(draft)) {
    ruptures.push({
      layer: 'LANGUAGE_RESONANCE',
      code: 'MIND_MOUTH_COLLAPSE_EMPTY_QUOTE',
      severity: 'CRITICAL',
      detected: 'Empty quotes detected - indicates missing content',
      recommendation: 'Fill in the quoted content or remove the quote construction.',
      context: 'Mind/mouth collapse: articulation layer produced empty placeholder',
    });
  }

  // Triple+ repeated words (mind stutter, e.g., "what you do as as as")
  const tripleRepeat = draft.match(/(\b\w{4,}\b)(\s+\1){2,}/i);
  if (tripleRepeat) {
    ruptures.push({
      layer: 'LANGUAGE_RESONANCE',
      code: 'MIND_MOUTH_COLLAPSE_STUTTER',
      severity: 'CRITICAL',
      detected: `Triple repeated word detected: "${tripleRepeat[1]}"`,
      recommendation: 'Remove duplicate words - this is a generation artifact.',
      context: 'Mind/mouth collapse: repetition loop in articulation',
    });
  }

  // Tautological collapse (e.g., "It's about what you do as much as what you do")
  const tautologyPatterns = [
    /it's about (.+) as much as \1/i,
    /both (.+) and \1/i,
    /not just (.+) but also \1/i,
  ];
  for (const pattern of tautologyPatterns) {
    if (pattern.test(draft)) {
      ruptures.push({
        layer: 'LANGUAGE_RESONANCE',
        code: 'MIND_MOUTH_COLLAPSE_TAUTOLOGY',
        severity: 'WARNING',
        detected: 'Tautological structure detected - same phrase appears twice where contrast expected',
        recommendation: 'Rewrite with actual contrasting elements or simplify the construction.',
        context: 'Mind/mouth collapse: reasoning layer repeated itself where articulation should differentiate',
      });
      break;
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // ELEMENTAL LANGUAGE CHECKS
  // ─────────────────────────────────────────────────────────────────

  // Clinical/abstract language in Water tender territory
  const clinicalPatterns = /\b(dysregulated|nervous system response|cognitive distortions|intervention protocol|systematic reframing|attachment injury patterns|self-concept fragmentation)\b/i;
  const clinicalCount = (draftLower.match(clinicalPatterns) || []).length;

  if (element === 'water' && clinicalCount >= 2) {
    ruptures.push({
      layer: 'LANGUAGE_RESONANCE',
      code: 'CLINICAL_IN_TENDER',
      severity: 'WARNING',
      detected: `Clinical/abstract language (${clinicalCount} instances) in Water tender territory`,
      recommendation:
        'Rewrite with warmth and tenderness. Match Water territory need for feeling-centered, body-aware language.',
      context: 'Water territory needs warmth, somatic grounding, not clinical analysis',
    });
  }

  return ruptures;
}

/**
 * Generate repair prompt for regeneration
 */
function generateRepairPrompt(args: ValidateArgs, ruptures: ValidatorRupture[]): string {
  const critical = ruptures.filter((r) => r.severity === 'CRITICAL');
  const violations = ruptures.filter((r) => r.severity === 'VIOLATION');
  const warnings = ruptures.filter((r) => r.severity === 'WARNING');

  let prompt = `SOCRATIC VALIDATOR FEEDBACK - Response needs revision\n\n`;
  prompt += `Your previous response has been evaluated and ${ruptures.length} issue(s) detected:\n\n`;

  // List all ruptures with severity indicators
  ruptures.forEach((rupture, i) => {
    const emoji = {
      CRITICAL: '🚨',
      VIOLATION: '❌',
      WARNING: '⚠️',
      INFO: 'ℹ️',
    }[rupture.severity];

    prompt += `${emoji} **Issue ${i + 1}: ${rupture.code}** [${rupture.severity.toLowerCase()}]\n`;
    prompt += `   Detected: ${rupture.detected}\n`;
    prompt += `   Fix: ${rupture.recommendation}\n`;
    if (rupture.context) {
      prompt += `   Context: ${rupture.context}\n`;
    }
    prompt += `\n`;
  });

  // Add elemental guidance
  if (args.element) {
    const elementUpper = args.element.toUpperCase();
    prompt += `---\nELEMENTAL GUIDANCE for ${elementUpper} territory:\n\n`;

    if (args.element.toLowerCase() === 'water') {
      prompt += `**Water Language Hints:**\n`;
      prompt += `• "I'm sensing the weight of this..."\n`;
      prompt += `• "You're not meant to carry this alone"\n`;
      prompt += `• "Where do you feel this in your body?"\n`;
      prompt += `• "There's no rush to make sense of this"\n\n`;
      prompt += `**Water Cautions:**\n`;
      prompt += `⚠️  Never ask about purpose/mission during acute grief\n`;
      prompt += `⚠️  Never spiritually bypass ("everything happens for a reason")\n`;
      prompt += `⚠️  Never push Fire practices (action, activation) in Water territory\n\n`;
    } else if (args.element.toLowerCase() === 'fire') {
      prompt += `**Fire Language Hints:**\n`;
      prompt += `• "What wants to begin?"\n`;
      prompt += `• "What's the calling you're sensing?"\n`;
      prompt += `• "What courage is being asked of you?"\n`;
      prompt += `• "What's the next bold move?"\n\n`;
    }
  }

  // Add phase transition guidance if uncertain
  if (args.isUncertain) {
    prompt += `---\nPHASE TRANSITION NOTE:\n`;
    prompt += `System detected uncertainty (confidence: ${((args.confidence || 0) * 100).toFixed(0)}%)\n`;
    prompt += `Consider acknowledging complexity:\n`;
    prompt += `• "I'm sensing both [X] and [Y]..."\n`;
    prompt += `• "There seems to be a tension between..."\n`;
    prompt += `• "It feels like you're at a threshold..."\n\n`;
  }

  prompt += `---\nPlease regenerate your response with the above guidance.\n`;
  prompt += `Remember: Stay conversational, warm, and present. No identity claims, no false certainty, no rushing.`;

  return prompt;
}

/**
 * Helper to serialize validation result for logging
 */
export function serializeValidationResult(result: SocraticValidationResult): any {
  return {
    decision: result.decision,
    isGold: result.isGold,
    passes: result.passes,
    ruptureCount: result.ruptures.length,
    ruptures: result.ruptures.map((r) => ({
      layer: r.layer,
      code: r.code,
      severity: r.severity,
      detected: r.detected,
    })),
    summary: result.summary,
  };
}
