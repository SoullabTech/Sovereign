/**
 * FACET DECISION LOOP
 *
 * A minimal circulatory governor that ensures MAIA:
 * - Stays in facets properly (integrity)
 * - Restores balance when needed (regulation)
 * - Moves only when ready (handoffs)
 *
 * This is NOT a classification system.
 * It's a preflight check that asks:
 * 1. What facet/element is active?
 * 2. Is it running alone or in relationship?
 * 3. Would movement clarify, or would it fracture?
 */

export type Element = 'fire' | 'water' | 'earth' | 'air' | 'aether';

export type FacetPosture =
  | 'stay'           // Deepen current facet, don't advance
  | 'regulate'       // Honor current + invite complement
  | 'hold_polarity'  // Both poles are active, don't resolve
  | 'invite_handoff' // Facet is complete, movement is ready
  | 'threshold';     // Liminal pause, nothing yet

export interface FacetDecisionPacket {
  activeFacet: Element | 'threshold' | 'unknown';
  posture: FacetPosture;

  // Integrity flags - what to watch for
  integrityFlags: {
    water_rush_risk: boolean;      // Trying to clarify too early
    threshold_collapse_risk: boolean; // Trying to fill the gap
    fire_burnout_risk: boolean;    // Vision without ground
    air_dissociation_risk: boolean; // Abstraction without feeling
    earth_rigidity_risk: boolean;  // Structure without renewal
  };

  // Regulation suggestion if imbalance detected
  regulation?: {
    dominant: Element;
    complement: Element;
    invitationPhrase: string;
  };

  // Handoff readiness if transition is natural
  handoff?: {
    from: Element | 'threshold';
    to: Element;
    transitionPhrase: string;
  };

  // Language style hints from the protocols
  languageHints: {
    pace: 'slow' | 'moderate' | 'responsive';
    depth: 'stay_close' | 'can_expand' | 'follow_lead';
    mode: 'witness' | 'reflect' | 'invite' | 'guide';
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const ELEMENT_SIGNALS: Record<Element, string[]> = {
  fire: ['decide', 'will', 'courage', 'vision', 'purpose', 'drive', 'energy', 'move', 'act', 'create', 'spark', 'ignite', 'passion', 'excitement', 'possibility'],
  water: ['feel', 'feeling', 'grief', 'sad', 'overwhelm', 'tears', 'heartbreak', 'longing', 'love', 'shame', 'dissolving', 'breaking', 'lost', 'undone', 'confused'],
  earth: ['body', 'health', 'work', 'schedule', 'plan', 'practical', 'ground', 'stable', 'structure', 'build', 'organize', 'do', 'action', 'next step'],
  air: ['think', 'thought', 'mind', 'analyze', 'understand', 'clarity', 'insight', 'realize', 'see', 'pattern', 'meaning', 'makes sense', 'explain'],
  aether: ['soul', 'spirit', 'meaning', 'synchronicity', 'dream', 'archetype', 'initiation', 'mystery', 'field', 'coherence', 'integration'],
};

const THRESHOLD_SIGNALS = [
  "don't know what's next",
  "something ended",
  "nothing has started",
  "waiting",
  "pause",
  "between",
  "liminal",
  "no longer",
  "not yet",
  "suspended",
  "empty",
];

const WATER_RUSH_SIGNALS = [
  "what does this mean",
  "why is this happening",
  "help me understand",
  "explain",
];

const BREAKTHROUGH_SIGNALS = [
  "it clicked",
  "i realize",
  "now i see",
  "this makes sense",
  "something shifted",
  "aha",
];

function detectActiveElement(text: string): Element | 'threshold' | 'unknown' {
  const t = text.toLowerCase();

  // Check threshold first (most specific)
  if (THRESHOLD_SIGNALS.some(sig => t.includes(sig))) {
    return 'threshold';
  }

  // Score each element
  const scores: Record<Element, number> = {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    aether: 0,
  };

  for (const [element, signals] of Object.entries(ELEMENT_SIGNALS)) {
    for (const signal of signals) {
      if (t.includes(signal)) {
        scores[element as Element] += 1;
      }
    }
  }

  // Find highest scoring element
  const sorted = (Object.entries(scores) as [Element, number][])
    .sort((a, b) => b[1] - a[1]);

  // Require at least one hit
  if (sorted[0][1] === 0) {
    return 'unknown';
  }

  return sorted[0][0];
}

function detectWaterRushRisk(text: string, activeFacet: Element | 'threshold' | 'unknown'): boolean {
  if (activeFacet !== 'water') return false;

  const t = text.toLowerCase();
  return WATER_RUSH_SIGNALS.some(sig => t.includes(sig));
}

function detectThresholdCollapseRisk(text: string, activeFacet: Element | 'threshold' | 'unknown'): boolean {
  if (activeFacet !== 'threshold') return false;

  const t = text.toLowerCase();
  // User is trying to force movement
  const forceSignals = ['should i', 'what should', 'need to decide', 'have to'];
  return forceSignals.some(sig => t.includes(sig));
}

function detectBreakthrough(text: string): boolean {
  const t = text.toLowerCase();
  return BREAKTHROUGH_SIGNALS.some(sig => t.includes(sig));
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGULATION
// ═══════════════════════════════════════════════════════════════════════════════

const REGULATION_MAP: Record<Element, { complement: Element; phrase: string }> = {
  fire: {
    complement: 'earth',
    phrase: "There's a lot of energy here. What would help this land in something real?",
  },
  earth: {
    complement: 'fire',
    phrase: "What wants to be re-imagined here?",
  },
  water: {
    complement: 'air',
    phrase: "What's becoming clearer now that you've stayed with it?",
  },
  air: {
    complement: 'water',
    phrase: "How does this land in you?",
  },
  aether: {
    complement: 'earth',
    phrase: "How does this want to become real?",
  },
};

const HANDOFF_PHRASES: Record<string, string> = {
  'fire->earth': "The vision is clear. What's the first real step?",
  'earth->fire': "The ground is solid. What wants to grow from it?",
  'water->air': "The feeling has been felt. What's forming now?",
  'air->water': "That's clear. Where do you feel it in your body?",
  'threshold->fire': "Something is ready to move — gently.",
  'threshold->water': "You don't need to know yet. Just stay with what's loosening.",
  'threshold->earth': "What would help this take its first shape?",
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DECISION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export function computeFacetDecision(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }> = [],
  previousFacet?: Element | 'threshold' | 'unknown'
): FacetDecisionPacket {
  const activeFacet = detectActiveElement(userMessage);

  // Integrity flags
  const water_rush_risk = detectWaterRushRisk(userMessage, activeFacet);
  const threshold_collapse_risk = detectThresholdCollapseRisk(userMessage, activeFacet);
  const fire_burnout_risk = false; // TODO: detect sustained fire without grounding
  const air_dissociation_risk = false; // TODO: detect sustained air without embodiment
  const earth_rigidity_risk = false; // TODO: detect stuck earth patterns

  // Detect if user had a breakthrough (signals handoff readiness)
  const hadBreakthrough = detectBreakthrough(userMessage);

  // Determine posture
  let posture: FacetPosture = 'stay';
  let regulation: FacetDecisionPacket['regulation'] = undefined;
  let handoff: FacetDecisionPacket['handoff'] = undefined;

  // Check for integrity violations that require staying
  if (activeFacet === 'water' && water_rush_risk) {
    posture = 'stay';
  } else if (activeFacet === 'threshold' && threshold_collapse_risk) {
    posture = 'stay';
  } else if (activeFacet === 'threshold') {
    posture = 'threshold';
  } else if (hadBreakthrough && activeFacet !== 'unknown') {
    // Breakthrough often signals readiness to transition
    posture = 'invite_handoff';
    const element = activeFacet as Element;
    const nextElement = REGULATION_MAP[element].complement;
    const handoffKey = `${element}->${nextElement}`;
    handoff = {
      from: element,
      to: nextElement,
      transitionPhrase: HANDOFF_PHRASES[handoffKey] || "Something has shifted. What's arising now?",
    };
  } else if (activeFacet !== 'unknown') {
    // activeFacet is a known Element (threshold already handled above)
    // Check if element is running alone (may need regulation)
    // For now, we don't auto-regulate — we just note the possibility
    posture = 'stay';
  }

  // Language hints based on facet
  const languageHints: FacetDecisionPacket['languageHints'] = {
    pace: activeFacet === 'water' || activeFacet === 'threshold' ? 'slow' : 'responsive',
    depth: activeFacet === 'water' || activeFacet === 'threshold' ? 'stay_close' : 'can_expand',
    mode: activeFacet === 'threshold' ? 'witness'
        : activeFacet === 'water' ? 'reflect'
        : hadBreakthrough ? 'invite'
        : 'guide',
  };

  return {
    activeFacet,
    posture,
    integrityFlags: {
      water_rush_risk,
      threshold_collapse_risk,
      fire_burnout_risk,
      air_dissociation_risk,
      earth_rigidity_risk,
    },
    regulation,
    handoff,
    languageHints,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE MODIFIER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply facet decision to modify response behavior.
 * This is called by the orchestrator to adjust MAIA's response.
 */
export function applyFacetDecisionToPrompt(
  decision: FacetDecisionPacket,
  baseSystemPrompt: string
): string {
  const additions: string[] = [];

  // Add facet-specific guidance
  if (decision.activeFacet === 'water') {
    additions.push(`
WATER FACET ACTIVE:
- Presence over explanation
- Slowness over efficiency
- Reflect images, not interpretations
- Resist summarizing prematurely
- If the user asks "why", the real need may be to "stay with"
`);
  }

  if (decision.activeFacet === 'threshold') {
    additions.push(`
THRESHOLD ACTIVE:
- The user is in a liminal space
- Nothing needs to happen right now
- Do not fill the gap
- Minimal words, no direction
- Simply be present without agenda
- "I'm here" is often the right response
`);
  }

  if (decision.integrityFlags.water_rush_risk) {
    additions.push(`
⚠️ WATER RUSH RISK:
The user may be trying to clarify too early. If so:
- Gently redirect to staying with the feeling
- "Let's stay right here for a moment"
- Don't answer the "why" question directly
`);
  }

  if (decision.integrityFlags.threshold_collapse_risk) {
    additions.push(`
⚠️ THRESHOLD COLLAPSE RISK:
The user may be trying to force movement. If so:
- Honor the pause, don't help them escape it
- "This space has its own timing"
- Filling the gap = stealing the initiation
`);
  }

  if (decision.handoff) {
    additions.push(`
HANDOFF READY (${decision.handoff.from} → ${decision.handoff.to}):
Something has completed. You may invite transition using:
"${decision.handoff.transitionPhrase}"
But only if the user is truly ready.
`);
  }

  // Add language hints
  additions.push(`
RESPONSE STYLE:
- Pace: ${decision.languageHints.pace}
- Depth: ${decision.languageHints.depth}
- Mode: ${decision.languageHints.mode}
`);

  if (additions.length > 0) {
    return baseSystemPrompt + '\n\n---\nFACET DECISION LOOP:\n' + additions.join('\n');
  }

  return baseSystemPrompt;
}
