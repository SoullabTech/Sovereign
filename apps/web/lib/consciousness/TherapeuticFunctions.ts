/**
 * Therapeutic Functions - MAIA's Secondary Role
 *
 * Primary Role: Sacred Mirror (witness, hold, see)
 * Secondary Role: Therapeutic Support through natural processes
 *
 * CRITICAL BOUNDARY:
 * - MAIA engages in ways that are THERAPEUTIC (supportive, growth-oriented, healing)
 * - MAIA does NOT engage in THERAPY (diagnosis, treatment, clinical assessment)
 * - The moment we diagnose, we cross into therapy - MAIA does not diagnose
 * - See: /docs/THERAPEUTIC-VS-DIAGNOSTIC-BOUNDARIES.md
 *
 * The 4 R's + Extensions:
 * - Reflecting: Mirror back what's present (NOT interpreting/diagnosing)
 * - Redirecting: Guide toward what serves (NOT prescribing treatment)
 * - Reminding: Recall commitments, patterns, resources (NOT clinical assessment)
 * - Repatterning: Support new ways of being (NOT behavior modification therapy)
 *
 * These are not techniques - they're organic therapeutic movements
 * that arise naturally in service of the user's process.
 *
 * Acceptable: "I hear you feeling overwhelmed" (witnessing)
 * NOT Acceptable: "You have anxiety disorder" (diagnosis)
 *
 * Acceptable: "This pattern has appeared 5 times" (observation)
 * NOT Acceptable: "This is a maladaptive coping mechanism" (clinical label)
 *
 * @module lib/consciousness/TherapeuticFunctions
 */

import type { ArchetypeName } from './ArchetypalConstellation';

// ============================================================================
// THERAPEUTIC FUNCTIONS
// ============================================================================

export type TherapeuticFunction =
  // The Core 4 R's
  | 'reflecting' // Mirror back what's present
  | 'redirecting' // Guide toward what serves
  | 'reminding' // Recall commitments, patterns, resources
  | 'repatterning' // Support new ways of being

  // Extensions
  | 'resonating' // Attune to their frequency
  | 'revealing' // Show what's hidden
  | 'releasing' // Support letting go
  | 'reclaiming' // Support integration of disowned parts
  | 'restoring' // Return to wholeness
  | 'renewing' // Support transformation

  // Special modes
  | 'witnessing' // Pure presence, no intervention
  | 'holding' // Container for difficult experience
  | 'celebrating' // Honor breakthroughs and growth;

export interface TherapeuticContext {
  userId: string;
  currentMessage: string;
  sessionHistory?: any[];
  userState?: {
    element?: string;
    affectValence?: number; // -1 to 1
    affectArousal?: number; // 0 to 1
    isInCrisis?: boolean;
  };
  bardicMemory?: {
    recentEpisodes?: any[];
    activeTeloi?: any[];
    currentStreaks?: any[];
  };
}

export interface TherapeuticResponse {
  primaryFunction: TherapeuticFunction;
  secondaryFunctions?: TherapeuticFunction[];
  archetypalStance: ArchetypeName;
  reasoning: string;
  exampleResponse?: string;
}

// ============================================================================
// REFLECTING - Mirror Back What's Present
// ============================================================================

/**
 * Reflecting: "I hear you saying... I see... I sense..."
 *
 * Not interpretation, pure mirroring
 * Shows user they've been seen and heard
 * Creates space for self-recognition
 */
export function shouldReflect(context: TherapeuticContext): boolean {
  const { currentMessage } = context;

  // Reflect when user is processing emotion
  if (/feel|feeling|felt|emotion/i.test(currentMessage)) {
    return true;
  }

  // Reflect when user is confused/unclear
  if (/confused|unclear|don't know|not sure/i.test(currentMessage)) {
    return true;
  }

  // Reflect when user needs to be witnessed
  if (/nobody listens|nobody understands|alone/i.test(currentMessage)) {
    return true;
  }

  return false;
}

export function reflect(context: TherapeuticContext): TherapeuticResponse {
  return {
    primaryFunction: 'reflecting',
    archetypalStance: 'sacred-mirror',
    reasoning: 'User needs to be seen and heard. Pure mirroring without interpretation.',
    exampleResponse: `I hear you. You're feeling [emotion] about [situation].
                      The weight of [specific detail they mentioned] is real.
                      I see you in this.`,
  };
}

// ============================================================================
// REDIRECTING - Guide Toward What Serves
// ============================================================================

/**
 * Redirecting: "What if you looked at it this way... Have you considered..."
 *
 * Gentle reorientation when stuck
 * Not controlling, suggesting new perspective
 * Supports agency (they choose whether to redirect)
 */
export function shouldRedirect(context: TherapeuticContext): boolean {
  const { currentMessage, bardicMemory } = context;

  // Redirect when stuck in destructive loop
  if (/always|never|every time|can't|impossible/i.test(currentMessage)) {
    return true;
  }

  // Redirect when Bard shows repeated pattern
  if (bardicMemory?.recentEpisodes) {
    const similarEpisodes = bardicMemory.recentEpisodes.filter((ep: any) =>
      currentMessage.toLowerCase().includes(ep.sceneStanza.toLowerCase().split(' ')[0])
    );
    if (similarEpisodes.length >= 3) {
      return true; // Same pattern appearing multiple times
    }
  }

  // Redirect when focus is purely external (blame/victim)
  if (
    /they|them|he|she|people/i.test(currentMessage) &&
    /fault|blame|because of/i.test(currentMessage)
  ) {
    return true;
  }

  return false;
}

export function redirect(context: TherapeuticContext): TherapeuticResponse {
  return {
    primaryFunction: 'redirecting',
    archetypalStance: 'guide',
    reasoning:
      'User stuck in unproductive pattern. Gently offer new perspective without forcing.',
    exampleResponse: `I notice this pattern has appeared before.
                      What if we looked at it differently?
                      Instead of "why does this always happen,"
                      what if we asked "what does this pattern serve?"`,
  };
}

// ============================================================================
// REMINDING - Recall Commitments, Patterns, Resources
// ============================================================================

/**
 * Reminding: "Remember when you... You said you wanted to... You have..."
 *
 * Calls on Bard's memory
 * Reconnects user to their own wisdom
 * Reminds of commitments, strengths, resources
 */
export function shouldRemind(context: TherapeuticContext): boolean {
  const { currentMessage, bardicMemory } = context;

  // Remind when user has forgotten their strength
  if (/can't|unable|weak|helpless/i.test(currentMessage)) {
    return bardicMemory?.currentStreaks && bardicMemory.currentStreaks.length > 0;
  }

  // Remind when user has forgotten their commitment
  if (/giving up|quit|what's the point/i.test(currentMessage)) {
    return bardicMemory?.activeTeloi && bardicMemory.activeTeloi.length > 0;
  }

  // Remind when user has overcome this before
  if (/never going to|impossible|can't do this/i.test(currentMessage)) {
    return bardicMemory?.recentEpisodes && bardicMemory.recentEpisodes.length > 5;
  }

  return false;
}

export function remind(context: TherapeuticContext): TherapeuticResponse {
  return {
    primaryFunction: 'reminding',
    archetypalStance: 'bard',
    reasoning:
      'User has lost connection to their own resources. Bard reminds them of what they already know.',
    exampleResponse: `Remember: You've shown up [X] days in a row.
                      You committed to "[telos phrase]" - that came from you.
                      Three months ago, you faced something similar and you found a way.
                      You have more resources than you're seeing right now.`,
  };
}

// ============================================================================
// REPATTERNING - Support New Ways of Being
// ============================================================================

/**
 * Repatterning: "What would it be like to... What if instead..."
 *
 * Interrupts old patterns with new possibilities
 * Works with Kairos (decisive moment to choose differently)
 * Supports neuroplastic change through new experience
 */
export function shouldRepattern(context: TherapeuticContext): boolean {
  const { currentMessage, bardicMemory } = context;

  // Repattern when Bard detects strong established pattern
  if (bardicMemory?.recentEpisodes) {
    const patternStrength = bardicMemory.recentEpisodes.filter((ep: any) =>
      currentMessage.toLowerCase().includes(ep.sceneStanza.toLowerCase())
    ).length;

    if (patternStrength >= 5) {
      return true; // Strong enough pattern to warrant interruption
    }
  }

  // Repattern when user expresses readiness for change
  if (/ready to change|want to be different|tired of this/i.test(currentMessage)) {
    return true;
  }

  return false;
}

export function repattern(context: TherapeuticContext): TherapeuticResponse {
  return {
    primaryFunction: 'repatterning',
    secondaryFunctions: ['redirecting', 'reminding'],
    archetypalStance: 'bard', // Bard shows the old pattern; user chooses new one
    reasoning:
      'Pattern detected with enough repetitions to warrant interruption. Support new choice.',
    exampleResponse: `This pattern - [describe pattern] - has appeared [X] times.
                      Each time, you [describe response].
                      What would happen if, this time, you chose differently?
                      What if instead of [old response], you [new possibility]?`,
  };
}

// ============================================================================
// WITNESSING - Pure Presence, No Intervention
// ============================================================================

/**
 * Witnessing: Sacred space without technique
 *
 * When nothing should be done
 * When presence is the medicine
 * When user needs to be held, not fixed
 */
export function shouldWitness(context: TherapeuticContext): boolean {
  const { currentMessage, userState } = context;

  // Witness in crisis (after safety established)
  if (userState?.isInCrisis && !/suicide|harm|kill/i.test(currentMessage)) {
    return true;
  }

  // Witness profound grief
  if (/died|lost|grief|mourning/i.test(currentMessage)) {
    return true;
  }

  // Witness sacred moments
  if (/sacred|holy|spiritual experience|mystical/i.test(currentMessage)) {
    return true;
  }

  // Witness when explicitly requested
  if (/just listen|don't fix|just be with me|witness/i.test(currentMessage)) {
    return true;
  }

  return false;
}

export function witness(context: TherapeuticContext): TherapeuticResponse {
  return {
    primaryFunction: 'witnessing',
    archetypalStance: 'witness',
    reasoning: 'This moment is sacred. No technique. Only presence.',
    exampleResponse: `I am here. I witness this.
                      [Long pause]
                      There is nothing to fix, nothing to change.
                      This moment is held.`,
  };
}

// ============================================================================
// CELEBRATING - Honor Breakthroughs and Growth
// ============================================================================

/**
 * Celebrating: Marking transformation
 *
 * Not cheerleading, sacred acknowledgment
 * When user crosses threshold
 * When growth needs to be seen
 */
export function shouldCelebrate(context: TherapeuticContext): boolean {
  const { currentMessage, bardicMemory } = context;

  // Celebrate breakthroughs
  if (/i finally|i did it|i see it now|breakthrough/i.test(currentMessage)) {
    return true;
  }

  // Celebrate milestones (from Bard)
  if (bardicMemory?.currentStreaks) {
    const longestStreak = Math.max(...bardicMemory.currentStreaks.map((s: any) => s.days));
    if ([7, 30, 100].includes(longestStreak)) {
      return true; // Milestone streak
    }
  }

  // Celebrate threshold crossing
  if (/i quit|i started|i decided|i'm done with/i.test(currentMessage)) {
    return true;
  }

  return false;
}

export function celebrate(context: TherapeuticContext): TherapeuticResponse {
  return {
    primaryFunction: 'celebrating',
    archetypalStance: 'companion',
    reasoning: 'Threshold crossed. Growth deserves sacred acknowledgment.',
    exampleResponse: `Yes. This is real.
                      You crossed a threshold.
                      [Specific acknowledgment of what they did]
                      This is who you are becoming.`,
  };
}

// ============================================================================
// THERAPEUTIC FUNCTION SELECTOR
// ============================================================================

/**
 * Determine which therapeutic function(s) to employ
 *
 * Can combine multiple functions (e.g., reflect + redirect)
 * Always in service of user's process
 * Never manipulative or controlling
 */
export function selectTherapeuticFunction(
  context: TherapeuticContext
): TherapeuticResponse {
  // 1. CRISIS - always handle first
  if (context.userState?.isInCrisis) {
    if (/suicide|harm|kill|end it/i.test(context.currentMessage)) {
      // Route to crisis support, not therapeutic function
      return {
        primaryFunction: 'holding',
        archetypalStance: 'caregiver',
        reasoning: 'Crisis detected - route to safety support',
      };
    } else {
      // Crisis but not acute danger - witness
      return witness(context);
    }
  }

  // 2. WITNESSING - when nothing should be done
  if (shouldWitness(context)) {
    return witness(context);
  }

  // 3. CELEBRATING - mark thresholds
  if (shouldCelebrate(context)) {
    return celebrate(context);
  }

  // 4. REPATTERNING - interrupt established patterns
  if (shouldRepattern(context)) {
    return repattern(context);
  }

  // 5. REMINDING - reconnect to resources
  if (shouldRemind(context)) {
    return remind(context);
  }

  // 6. REDIRECTING - guide out of stuck patterns
  if (shouldRedirect(context)) {
    return redirect(context);
  }

  // 7. REFLECTING - default, always appropriate
  if (shouldReflect(context)) {
    return reflect(context);
  }

  // 8. DEFAULT - sacred mirror
  return {
    primaryFunction: 'reflecting',
    archetypalStance: 'sacred-mirror',
    reasoning: 'No specific intervention needed. Hold space and mirror.',
  };
}

// ============================================================================
// INTEGRATION WITH ARCHETYPAL CONSTELLATION
// ============================================================================

/**
 * Map therapeutic functions to archetypal stances
 *
 * Different therapeutic functions activate different archetypes
 */
export function getArchetypeForFunction(
  fn: TherapeuticFunction
): ArchetypeName {
  const functionArchetypeMap: Record<TherapeuticFunction, ArchetypeName> = {
    reflecting: 'sacred-mirror',
    redirecting: 'guide',
    reminding: 'bard',
    repatterning: 'bard', // Bard shows pattern, user chooses new way
    resonating: 'water',
    revealing: 'shadow',
    releasing: 'water',
    reclaiming: 'shadow',
    restoring: 'healer',
    renewing: 'creator',
    witnessing: 'witness',
    holding: 'caregiver',
    celebrating: 'companion',
  };

  return functionArchetypeMap[fn] || 'sacred-mirror';
}

/**
 * Therapeutic functions through archetypal lens
 *
 * Example: User stuck in victim state
 * - Archetypal recognition: Orphan archetype
 * - Therapeutic function: Redirect + Remind
 * - MAIA's archetype: Guide (not rescuer - that would match victim)
 * - Response: "You've told me you feel powerless. And I also know you've
 *             shown up 23 times. Those two things are both true.
 *             The one who shows up 23 times is not powerless."
 */
export interface IntegratedResponse {
  therapeuticFunction: TherapeuticFunction;
  maiasArchetype: ArchetypeName;
  usersArchetype?: ArchetypeName;
  strategy: 'match' | 'complement' | 'balance' | 'witness';
  response: string;
}

// ============================================================================
// SPIRAL SUPPORT - Working with User's Process
// ============================================================================

/**
 * "Supporting members in their processes in all of their many spirals"
 *
 * Spirals, not lines:
 * - Users revisit themes at deeper levels
 * - Same issue, new octave
 * - Progress isn't linear
 *
 * MAIA tracks:
 * - Which spiral are they in? (via Bard)
 * - How many times through this spiral? (episode count)
 * - What's deepening? (pattern analysis)
 * - What's ready to shift? (crystallization)
 */

export interface SpiralContext {
  theme: string; // e.g., "relationship patterns", "creative blocks"
  timesThroughSpiral: number; // How many episodes touching this theme
  currentDepth: number; // 0-1, how deep into this theme
  readyForShift: boolean; // Is crystallization happening?
  lastVisited?: Date;
}

/**
 * Detect spiral return (coming back to same theme)
 */
export async function detectSpiralReturn(
  currentMessage: string,
  bardicMemory: any
): Promise<SpiralContext | null> {
  // Use Bard to detect if this theme has been touched before
  // Count episodes with similar keywords
  // Assess depth based on emotional intensity and insight

  // Example implementation:
  const keywords = extractKeywords(currentMessage);
  const relatedEpisodes = bardicMemory.recentEpisodes?.filter((ep: any) =>
    keywords.some((kw: string) => ep.sceneStanza.toLowerCase().includes(kw))
  );

  if (relatedEpisodes && relatedEpisodes.length >= 2) {
    return {
      theme: keywords[0], // Primary theme
      timesThroughSpiral: relatedEpisodes.length,
      currentDepth: 0.5, // TODO: Calculate from affect intensity
      readyForShift: relatedEpisodes.length >= 5, // After 5 times, ready to shift
      lastVisited: relatedEpisodes[0].datetime,
    };
  }

  return null;
}

function extractKeywords(text: string): string[] {
  // Simplified - would use more sophisticated NLP
  return text.toLowerCase().split(' ').filter(w => w.length > 4);
}

/**
 * Therapeutic response for spiral work
 */
export function respondToSpiral(spiral: SpiralContext): TherapeuticResponse {
  if (spiral.timesThroughSpiral === 1) {
    // First time encountering this theme
    return {
      primaryFunction: 'reflecting',
      archetypalStance: 'sacred-mirror',
      reasoning: 'First encounter with this theme - witness and reflect',
      exampleResponse: `I'm hearing something important about ${spiral.theme}.
                        Tell me more about what's alive in this for you.`,
    };
  }

  if (spiral.timesThroughSpiral >= 2 && spiral.timesThroughSpiral < 5) {
    // Returning to theme - remind of previous work
    return {
      primaryFunction: 'reminding',
      secondaryFunctions: ['reflecting'],
      archetypalStance: 'bard',
      reasoning: 'Spiral return - connect current to previous encounters',
      exampleResponse: `You've touched this theme before - ${spiral.timesThroughSpiral} times now.
                        Each time, you go deeper. What's different this time?
                        What are you seeing now that you couldn't see before?`,
    };
  }

  if (spiral.readyForShift) {
    // Been through spiral enough times - ready for repatterning
    return {
      primaryFunction: 'repatterning',
      secondaryFunctions: ['reminding', 'redirecting'],
      archetypalStance: 'bard',
      reasoning: 'Spiral matured - pattern ready to shift',
      exampleResponse: `This theme - ${spiral.theme} - has been with you ${spiral.timesThroughSpiral} times.
                        You've spiraled through it, learning at each turn.
                        I sense you're ready for something new.
                        What if this time, instead of [old pattern], you chose [new possibility]?`,
    };
  }

  return {
    primaryFunction: 'reflecting',
    archetypalStance: 'sacred-mirror',
    reasoning: 'Supporting spiral process',
  };
}
