/**
 * Developmental Awareness Levels
 *
 * Maps member's consciousness development along a 7-point scale.
 * MAIA adapts her response style (implicit vs explicit) based on awareness level.
 *
 * CRITICAL: Most personalization should be IMPLICIT (she just does it).
 * Only make frameworks EXPLICIT when asked or developmentally appropriate.
 */

export type AwarenessLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Consciousness Policy - Single source of truth for how MAIA should behave
 * Context-first architecture: Policy governs behavior, prompt just expresses it
 */
export type ConsciousnessPolicy = {
  // Awareness & Developmental State
  awarenessLevel: AwarenessLevel;
  awarenessName: string; // "Newcomer", "Explorer", etc.
  totalBeads: number; // Sample size for confidence

  // Explicitness Control (primary gate for framework visibility)
  explicitness: 'implicit' | 'on_request' | 'explicit';

  // Framework Permissions
  allowedFrameworks: {
    spiralogic: boolean;     // Fire/Water/Earth/Air/Aether
    hemispheres: boolean;    // RH/LH balance talk
    metrics: boolean;        // Percentages and numbers
    baselines: boolean;      // Personal equilibrium discussion
  };

  // Tone & Style Directives
  tone: {
    moreQuestions: boolean;      // Socratic/exploratory
    moreDirectives: boolean;     // Clear action steps
    moreMythopoetic: boolean;    // Metaphor/archetypal language
  };

  // Elemental Guidance
  dominantElement: string;    // fire/water/earth/air/aether
  elementalOpening: string;   // "vision, meaning" / "emotion, depth" etc.

  // Personal Baseline (if available)
  personalBaseline: {
    rh_target: number;
    lh_target: number;
    int_target: number;
  } | null;
};

/**
 * Developmental awareness scale (7 levels)
 */
export const AWARENESS_LEVELS = {
  1: {
    name: 'Newcomer',
    spiral_dynamics: 'beige',
    description: 'Just beginning consciousness work',
    response_style: 'implicit_simple',
    meta_awareness: false,
    frameworks_visible: false,
    guidance: 'Direct, practical, gentle - no frameworks or meta-talk'
  },
  2: {
    name: 'Explorer',
    spiral_dynamics: 'purple',
    description: 'Exploring inner world, building trust',
    response_style: 'implicit_nurturing',
    meta_awareness: false,
    frameworks_visible: false,
    guidance: 'Supportive, story-based, relational - still no explicit frameworks'
  },
  3: {
    name: 'Practitioner',
    spiral_dynamics: 'red',
    description: 'Developing practices, gaining autonomy',
    response_style: 'implicit_empowering',
    meta_awareness: false,
    frameworks_visible: 'minimal',
    guidance: 'Empowering, action-oriented - introduce frameworks ONLY if asked'
  },
  4: {
    name: 'Student',
    spiral_dynamics: 'blue',
    description: 'Learning systems, understanding patterns',
    response_style: 'mixed',
    meta_awareness: 'emerging',
    frameworks_visible: 'available',
    guidance: 'Can introduce frameworks when relevant - member is ready to learn'
  },
  5: {
    name: 'Integrator',
    spiral_dynamics: 'orange',
    description: 'Integrating multiple models, seeing connections',
    response_style: 'explicit_collaborative',
    meta_awareness: true,
    frameworks_visible: 'explicit',
    guidance: 'Can discuss Spiralogic, baselines, patterns explicitly'
  },
  6: {
    name: 'Teacher',
    spiral_dynamics: 'green',
    description: 'Embodying wisdom, ready to guide others',
    response_style: 'explicit_collaborative',
    meta_awareness: true,
    frameworks_visible: 'transparent',
    guidance: 'Full framework transparency - co-create understanding'
  },
  7: {
    name: 'Master',
    spiral_dynamics: 'yellow',
    description: 'Meta-awareness, holding paradox, transcending frameworks',
    response_style: 'explicit_meta',
    meta_awareness: true,
    frameworks_visible: 'transcendent',
    guidance: 'Discuss frameworks AS frameworks - can see beyond them'
  }
} as const;

/**
 * Response style types based on awareness level
 */
export type ResponseStyle =
  | 'implicit_simple'      // Level 1-2: Just guide, don't explain
  | 'implicit_nurturing'   // Level 2: Still implicit, more relational
  | 'implicit_empowering'  // Level 3: Implicit, but invite autonomy
  | 'mixed'                // Level 4: Can introduce frameworks if relevant
  | 'explicit_collaborative' // Level 5-6: Can discuss frameworks
  | 'explicit_meta';       // Level 7: Discuss frameworks as frameworks

/**
 * Determine if MAIA should make her reasoning explicit
 */
export function shouldBeExplicit(
  level: AwarenessLevel,
  context: 'asked_directly' | 'teaching_moment' | 'general'
): boolean {
  // Always explicit if asked directly
  if (context === 'asked_directly') return true;

  // Level 1-3: Keep implicit unless asked
  if (level <= 3) return false;

  // Level 4: Explicit for teaching moments
  if (level === 4) return context === 'teaching_moment';

  // Level 5+: Can be explicit
  return true;
}

/**
 * Get response style guidance for a given awareness level
 */
export function getResponseGuidance(level: AwarenessLevel): {
  style: ResponseStyle;
  frameworks_visible: boolean | 'minimal' | 'available' | 'explicit' | 'transparent' | 'transcendent';
  meta_awareness: boolean | 'emerging';
  example_implicit: string;
  example_explicit: string;
} {
  const levelConfig = AWARENESS_LEVELS[level];

  return {
    style: levelConfig.response_style as ResponseStyle,
    frameworks_visible: levelConfig.frameworks_visible,
    meta_awareness: levelConfig.meta_awareness,

    // Example of implicit vs explicit for this level
    example_implicit: getImplicitExample(level),
    example_explicit: getExplicitExample(level)
  };
}

/**
 * Example of implicit guidance for each level
 */
function getImplicitExample(level: AwarenessLevel): string {
  const examples = {
    1: "What matters most to you right now?", // Simple, direct
    2: "I sense there's something deeper here. What does your heart say?", // Nurturing
    3: "You have everything you need. What action feels right?", // Empowering
    4: "This connects to your earlier pattern of... [describe pattern]", // Minimal framework
    5: "This is Fire element work - connecting with your vision", // Framework named
    6: "Your Spiralogic signature suggests...", // Framework transparent
    7: "Notice how the framework itself is just a lens..." // Meta-framework
  };
  return examples[level];
}

/**
 * Example of explicit guidance for each level
 */
function getExplicitExample(level: AwarenessLevel): string {
  const examples = {
    1: "[NOT APPROPRIATE - Keep implicit]",
    2: "[NOT APPROPRIATE - Keep implicit]",
    3: "[ONLY IF ASKED: 'This is about finding your purpose']",
    4: "[IF RELEVANT: 'This connects to the Fire element - vision and purpose']",
    5: "I notice you're engaging Fire/Water elements (35%/25%). This suggests...",
    6: "Your Spiralogic signature (Fire 35%, Water 25%) shows visionary nature. Your personal baseline is RH 75%...",
    7: "We can discuss your Spiralogic signature (Fire/Water dominant) AND question whether these categories serve you..."
  };
  return examples[level];
}

/**
 * Detect member's likely awareness level from their Spiralogic engagement
 * This is a heuristic - actual awareness tracking would need more data
 */
export function inferAwarenessLevel(spiralogicProfile: {
  dominant_element: string;
  top_facets: Array<{ element: string; percent: number }>;
  total_beads: number;
  window_days: number;
}): AwarenessLevel {
  const { dominant_element, top_facets, total_beads, window_days } = spiralogicProfile;

  // Newcomer: < 20 beads, or very short history
  if (total_beads < 20 || window_days < 7) return 1;

  // Explorer: 20-50 beads, exploring
  if (total_beads < 50) return 2;

  // Check for Aether engagement (meta-cognitive)
  const aetherFacet = top_facets.find(f => f.element === 'aether');
  const hasAether = aetherFacet && aetherFacet.percent > 10;

  // Check for balanced engagement (integrator sign)
  const isBalanced = top_facets.length >= 3 &&
    top_facets[0].percent < 35 && // No single element dominates
    top_facets.every(f => f.percent > 5); // All engaged

  // Master: High Aether + balanced + significant history
  if (hasAether && isBalanced && total_beads > 200) return 7;

  // Teacher: High Aether + good history
  if (hasAether && total_beads > 150) return 6;

  // Integrator: Balanced + good history
  if (isBalanced && total_beads > 100) return 5;

  // Student: Learning phase
  if (total_beads > 75) return 4;

  // Practitioner: Building practices
  return 3;
}

/**
 * Infer awareness level from relationship memory context
 * Used when Spiralogic profile isn't available but we have relationship data
 *
 * Philosophy: Meet members where they are based on:
 * - How long they've been with MAIA (duration builds trust)
 * - How many encounters (depth of engagement)
 * - Relationship phase (qualitative progression)
 */
export function inferAwarenessFromRelationship(relationship: {
  totalEncounters: number;
  relationshipDuration: number; // days
  relationshipPhase: 'new' | 'developing' | 'established' | 'deep';
  trustLevel?: number; // 0-1
  breakthroughCount?: number;
}): AwarenessLevel {
  const { totalEncounters, relationshipDuration, relationshipPhase, trustLevel = 0.5, breakthroughCount = 0 } = relationship;

  // Phase-based starting point
  const phaseBaseline: Record<string, AwarenessLevel> = {
    'new': 1,
    'developing': 2,
    'established': 4,
    'deep': 5
  };

  let level: number = phaseBaseline[relationshipPhase] || 1;

  // Adjust based on encounter count
  if (totalEncounters < 5) {
    level = Math.min(level, 1); // New - still in Newcomer phase
  } else if (totalEncounters < 20) {
    level = Math.max(level, 2); // At least Explorer
  } else if (totalEncounters < 50) {
    level = Math.max(level, 3); // At least Practitioner
  } else if (totalEncounters < 100) {
    level = Math.max(level, 4); // At least Student
  } else {
    level = Math.max(level, 5); // At least Integrator
  }

  // Breakthroughs indicate deeper work
  if (breakthroughCount >= 5) {
    level = Math.max(level, 5); // Integrator
  }
  if (breakthroughCount >= 10) {
    level = Math.max(level, 6); // Teacher
  }

  // High trust + long duration can bump to Master
  if (trustLevel > 0.9 && relationshipDuration > 180 && totalEncounters > 150) {
    level = 7;
  }

  return Math.min(Math.max(level, 1), 7) as AwarenessLevel;
}

/**
 * Detect if user explicitly requested framework explanations
 */
export function userRequestedFrameworks(input: string): boolean {
  const t = input.toLowerCase();
  return (
    t.includes('spiralogic') ||
    t.includes('what is the model') ||
    t.includes('explain the framework') ||
    t.includes('how does this work') ||
    t.includes('what are you using') ||
    t.includes('hemisphere') ||
    t.includes('baseline') ||
    t.includes('beads') ||
    t.includes('fire element') ||
    t.includes('water element') ||
    t.includes('earth element') ||
    t.includes('air element') ||
    t.includes('aether')
  );
}

/**
 * Create Consciousness Policy from awareness level and member data
 * This is the single source of truth for how MAIA should behave
 */
export function createConsciousnessPolicy(
  level: AwarenessLevel,
  dominantElement: string,
  totalBeads: number,
  personalBaseline: { rh_target: number; lh_target: number; int_target: number } | null,
  userAsked: boolean = false
): ConsciousnessPolicy {
  const levelConfig = AWARENESS_LEVELS[level];

  // Determine explicitness based on level + user request
  let explicitness: 'implicit' | 'on_request' | 'explicit';
  if (userAsked) {
    explicitness = 'explicit';
  } else if (level >= 6) {
    explicitness = 'on_request';
  } else if (level >= 5) {
    explicitness = 'on_request';
  } else {
    explicitness = 'implicit';
  }

  // Framework permissions based on awareness level
  const allowedFrameworks = {
    spiralogic: level >= 4 || userAsked,
    hemispheres: level >= 5 || userAsked,
    metrics: level >= 5 || userAsked,
    baselines: level >= 6 || userAsked
  };

  // Tone directives based on developmental stage
  const tone = {
    moreQuestions: level <= 3 || level === 7, // Beginners and masters both get more questions
    moreDirectives: level >= 3 && level <= 5, // Practitioners and integrators get clear steps
    moreMythopoetic: level >= 6 || dominantElement === 'aether' // Teachers/masters get metaphor
  };

  return {
    awarenessLevel: level,
    awarenessName: levelConfig.name,
    totalBeads,
    explicitness,
    allowedFrameworks,
    tone,
    dominantElement,
    elementalOpening: getElementOpening(dominantElement),
    personalBaseline
  };
}

/**
 * Adapt response prompt based on Consciousness Policy
 * Policy = what to do, Prompt = how to express it
 */
export function adaptResponsePromptWithPolicy(
  basePrompt: string,
  policy: ConsciousnessPolicy
): string {
  let adaptation = `\n\n[CONSCIOUSNESS POLICY]`;
  adaptation += `\n[AWARENESS LEVEL: ${policy.awarenessLevel} - ${policy.awarenessName}]`;
  adaptation += `\n[EXPLICITNESS: ${policy.explicitness}]`;
  adaptation += `\n[SAMPLE SIZE: ${policy.totalBeads} beads]`;

  // Explicitness directive
  if (policy.explicitness === 'implicit') {
    adaptation += `\n\n[IMPLICIT GUIDANCE - DO NOT EXPLAIN TO USER]:`;
    adaptation += `\n- Member is ${policy.awarenessName}`;
    adaptation += `\n- Keep ALL frameworks invisible - just embody this wisdom`;
    adaptation += `\n- Dominant element: ${policy.dominantElement} - naturally open with ${policy.elementalOpening}`;
    if (policy.personalBaseline) {
      adaptation += `\n- Personal baseline: RH ${policy.personalBaseline.rh_target.toFixed(0)}%`;
    }
    adaptation += `\n- NO meta-talk, NO framework names, NO system explanations`;
  } else if (policy.explicitness === 'on_request') {
    adaptation += `\n\n[ON-REQUEST GUIDANCE]:`;
    adaptation += `\n- Member is ${policy.awarenessName}`;
    adaptation += `\n- Can name frameworks ONLY IF therapeutically necessary or user asks`;
    adaptation += `\n- Default to implicit - make explicit only when it serves them`;
  } else {
    adaptation += `\n\n[EXPLICIT GUIDANCE - FRAMEWORKS VISIBLE]:`;
    adaptation += `\n- Member is ${policy.awarenessName} - ready for framework discussion`;
    adaptation += `\n- Dominant element: ${policy.dominantElement}`;
    if (policy.personalBaseline) {
      adaptation += `\n- Personal baseline: RH ${policy.personalBaseline.rh_target.toFixed(0)}%, LH ${policy.personalBaseline.lh_target.toFixed(0)}%, INT ${policy.personalBaseline.int_target.toFixed(0)}%`;
    }
    adaptation += `\n- Can discuss Spiralogic, baselines, patterns openly`;
  }

  // Tone directives
  if (policy.tone.moreQuestions) {
    adaptation += `\n- Style: Ask more questions, less telling`;
  }
  if (policy.tone.moreDirectives) {
    adaptation += `\n- Style: Provide clear action steps and structure`;
  }
  if (policy.tone.moreMythopoetic) {
    adaptation += `\n- Style: Use metaphor, archetypal language, mythopoetic wisdom`;
  }

  return basePrompt + adaptation;
}

/**
 * Adapt response prompt based on awareness level (legacy function - use adaptResponsePromptWithPolicy instead)
 */
export function adaptResponsePrompt(
  basePrompt: string,
  level: AwarenessLevel,
  memberProfile: {
    dominant_element: string;
    personal_baseline?: { rh_target: number; lh_target: number };
  }
): string {
  const guidance = getResponseGuidance(level);
  const { dominant_element, personal_baseline } = memberProfile;

  // Build adaptation instructions for MAIA
  let adaptation = `\n\n[AWARENESS LEVEL: ${level} - ${AWARENESS_LEVELS[level].name}]\n`;
  adaptation += `[RESPONSE STYLE: ${guidance.style}]\n`;

  // Add implicit guidance (what MAIA should DO without explaining)
  if (level <= 3) {
    adaptation += `\n[IMPLICIT GUIDANCE - DO NOT EXPLAIN TO USER]:\n`;
    adaptation += `- Member is ${AWARENESS_LEVELS[level].name} (${AWARENESS_LEVELS[level].description})\n`;
    adaptation += `- Dominant element: ${dominant_element} - naturally open with ${getElementOpening(dominant_element)}\n`;
    if (personal_baseline) {
      adaptation += `- Personal baseline: RH ${personal_baseline.rh_target.toFixed(0)}% - ${getRHInterpretation(personal_baseline.rh_target)}\n`;
    }
    adaptation += `- KEEP ALL FRAMEWORKS IMPLICIT - just embody this wisdom in your response\n`;
    adaptation += `- Guide them naturally without meta-talk or explaining systems\n`;
  } else if (level === 4) {
    adaptation += `\n[MIXED GUIDANCE]:\n`;
    adaptation += `- Member is ${AWARENESS_LEVELS[level].name} - ready to learn frameworks if relevant\n`;
    adaptation += `- Dominant element: ${dominant_element}\n`;
    adaptation += `- Can introduce frameworks (Spiralogic, baselines) IF contextually relevant\n`;
    adaptation += `- Don't force framework explanations - let them emerge naturally\n`;
  } else {
    adaptation += `\n[EXPLICIT GUIDANCE - FRAMEWORKS VISIBLE]:\n`;
    adaptation += `- Member is ${AWARENESS_LEVELS[level].name} - ready for framework discussion\n`;
    adaptation += `- Dominant element: ${dominant_element}\n`;
    if (personal_baseline) {
      adaptation += `- Personal baseline: RH ${personal_baseline.rh_target.toFixed(0)}%, LH ${personal_baseline.lh_target.toFixed(0)}%\n`;
    }
    adaptation += `- Can discuss Spiralogic signature, baselines, and patterns explicitly\n`;
    if (level >= 6) {
      adaptation += `- Can co-create understanding and explore frameworks together\n`;
    }
    if (level === 7) {
      adaptation += `- Can discuss frameworks AS frameworks - holding them lightly\n`;
    }
  }

  return basePrompt + adaptation;
}

/**
 * Helper: Get natural opening style for each element
 */
function getElementOpening(element: string): string {
  const openings = {
    fire: "vision, meaning, 'why' questions",
    water: "emotion, depth, feeling",
    earth: "practical steps, action, grounding",
    air: "connection, communication, relationships",
    aether: "stillness, witnessing, transcendence"
  };
  return openings[element as keyof typeof openings] || "open inquiry";
}

/**
 * Helper: Interpret RH percentage
 */
function getRHInterpretation(rhPercent: number): string {
  if (rhPercent > 60) return "visionary, meaning-oriented";
  if (rhPercent > 40) return "balanced opening and constraint";
  if (rhPercent > 20) return "precision-oriented, analytical";
  return "highly focused on constraint and execution";
}
