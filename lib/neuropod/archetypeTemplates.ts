// Archetypal Session Templates
// Multi-phase sessions that integrate Neuropod protocols with archetypal prompts
// Shadow Integration, Anima/Animus Dialogue, etc.

export interface ArchetypalSessionTemplate {
  archetypeId: string;
  name: string;
  durationMinutes: number;
  requiredTier: 'foundation' | 'explorer' | 'pioneer';
  requiredBloomLevel: number;
  requiredFieldStability: number;

  description: string;
  intention: string;

  phases: SessionPhase[];
  postSessionIntegration: PostSessionIntegration;
}

export interface SessionPhase {
  phase: 'grounding' | 'exploration' | 'deepening' | 'integration';
  durationMinutes: number;
  neuropodProtocol: string; // protocolId from protocolLibrary.ts

  maiaPrompts: PromptTiming[];
  guidanceNotes: string;
}

export interface PromptTiming {
  timing: 'start' | 'mid' | 'end';
  prompt: string;
  optional?: boolean;
}

export interface PostSessionIntegration {
  journalPrompts: string[];
  meaningDeferral: string;
  integrationPeriodHours: number;
  followUpRecommendations: string[];
}

// ============================================================================
// Shadow Integration Session
// ============================================================================

export const SHADOW_INTEGRATION_SESSION: ArchetypalSessionTemplate = {
  archetypeId: 'shadow-integration',
  name: 'Shadow Integration with Neuropod',
  durationMinutes: 30,
  requiredTier: 'pioneer',
  requiredBloomLevel: 4.0,
  requiredFieldStability: 0.7,

  description: `
Work with disowned parts of self (shadow material) using somatic awareness and archetypal prompts.
Combines grounding, theta entrainment, and integration phases.
  `,

  intention: `
To bring unconscious shadow material into conscious awareness, hold it with compassion,
and integrate the gifts it offers without identification or acting out.
  `,

  phases: [
    // Phase 1: Grounding (5 min)
    {
      phase: 'grounding',
      durationMinutes: 5,
      neuropodProtocol: 'breath-paced-vibroacoustic',

      maiaPrompts: [
        {
          timing: 'start',
          prompt: "Let's begin by grounding. Name three things you can feel in your body right now.",
        },
        {
          timing: 'mid',
          prompt: "Notice your breath. Follow three full cycles: inhale, hold, exhale, hold.",
        },
        {
          timing: 'end',
          prompt: "Sense the weight of your body. Feel yourself held by the surface beneath you.",
        },
      ],

      guidanceNotes: `
Establish safety container and somatic presence before shadow work.
The vibroacoustic stimulation supports embodied grounding.
      `,
    },

    // Phase 2: Exploration (15 min)
    {
      phase: 'exploration',
      durationMinutes: 15,
      neuropodProtocol: 'assr-contemplative-theta',

      maiaPrompts: [
        {
          timing: 'start',
          prompt: `
Bring to mind a quality in others that triggers you — something that annoys, repels, or makes you uncomfortable.

What is it? Name it clearly.
          `,
        },
        {
          timing: 'start',
          prompt: `
Now, ask: "Where in me does this quality live — hidden, disowned, or exiled?"

(You don't need to answer immediately. Let the question sit.)
          `,
        },
        {
          timing: 'mid',
          prompt: `
If that disowned quality could speak, what would it say?

What does it need? What is it protecting you from?
          `,
        },
        {
          timing: 'mid',
          prompt: `
Notice any resistance, tightness, or avoidance. Where in your body do you feel it?

Just notice. No need to change anything.
          `,
        },
        {
          timing: 'end',
          prompt: `
What gift does this shadow part offer you, if you could hold it without acting it out?

(Power, creativity, wildness, sensuality, anger, grief — shadow holds energy.)
          `,
        },
      ],

      guidanceNotes: `
Theta entrainment (6.5 Hz) supports contemplative depth and access to unconscious material.
This is NOT cathartic release — it's conscious witnessing and integration.
      `,
    },

    // Phase 3: Integration (10 min)
    {
      phase: 'integration',
      durationMinutes: 10,
      neuropodProtocol: 'annealing-pathway',

      maiaPrompts: [
        {
          timing: 'start',
          prompt: `
What would it look like to integrate this quality — not suppress it, not act it out,
but hold it consciously as part of your wholeness?
          `,
        },
        {
          timing: 'mid',
          prompt: `
Imagine the next 24 hours. What small action could honor this shadow part
without causing harm to yourself or others?
          `,
        },
        {
          timing: 'end',
          prompt: `
Reality check: Name three facts about your environment.

(Where are you? What time is it? What can you see/hear/feel?)
          `,
        },
      ],

      guidanceNotes: `
Annealing pathway brings user back to baseline coherence.
Integration phase is critical — prevents inflation, acting out, or spiritual bypassing.
      `,
    },
  ],

  postSessionIntegration: {
    journalPrompts: [
      "What shadow quality emerged in this session?",
      "What sensations in your body accompanied the exploration?",
      "What gift does this shadow part offer, if held consciously?",
      "What small action in the next 24 hours could honor this part?",
    ],

    meaningDeferral: `
Do not assign fixed meaning to shadow material yet. Let it settle for 48 hours.

Shadow integration is a process, not a one-time event. You may need to return to this material
multiple times before it integrates fully.
    `,

    integrationPeriodHours: 48,

    followUpRecommendations: [
      "Journal daily for 3 days post-session (track dreams, body sensations, synchronicities)",
      "Avoid making major decisions for 48 hours (shadow work can stir up reactive energy)",
      "If overwhelm arises, return to grounding protocols (breath-paced-vibroacoustic)",
      "Consider scheduling follow-up shadow session in 2-4 weeks (not sooner)",
    ],
  },
};

// ============================================================================
// Anima/Animus Dialogue Session
// ============================================================================

export const ANIMA_ANIMUS_DIALOGUE_SESSION: ArchetypalSessionTemplate = {
  archetypeId: 'anima-animus-dialogue',
  name: 'Anima/Animus Dialogue with Neuropod',
  durationMinutes: 35,
  requiredTier: 'pioneer',
  requiredBloomLevel: 4.5,
  requiredFieldStability: 0.75,

  description: `
Dialogue with the inner feminine (anima) or inner masculine (animus) using archetypal prompts
and theta/alpha entrainment. Advanced shadow work.
  `,

  intention: `
To develop conscious relationship with the contrasexual archetype (anima/animus),
integrate its wisdom, and heal unconscious projections onto external partners.
  `,

  phases: [
    // Phase 1: Grounding (5 min)
    {
      phase: 'grounding',
      durationMinutes: 5,
      neuropodProtocol: 'breath-paced-vibroacoustic',

      maiaPrompts: [
        {
          timing: 'start',
          prompt: "Let's ground. Name three physical sensations in your body right now.",
        },
        {
          timing: 'end',
          prompt: "Set an intention: What do you seek from your inner feminine/masculine today?",
        },
      ],

      guidanceNotes: `
Establish safety and intention before archetypal work.
      `,
    },

    // Phase 2: Invocation (10 min)
    {
      phase: 'exploration',
      durationMinutes: 10,
      neuropodProtocol: 'assr-receptive-absorption',

      maiaPrompts: [
        {
          timing: 'start',
          prompt: `
Bring to mind your inner feminine (anima) or inner masculine (animus).

This is not a literal person — it's the archetypal opposite within you.
What qualities does this figure hold? (Softness, strength, wildness, wisdom?)
          `,
        },
        {
          timing: 'mid',
          prompt: `
Imagine this figure standing before you. What does it look like? How does it carry itself?

(Trust the first image that arises. Don't edit.)
          `,
        },
        {
          timing: 'end',
          prompt: `
Ask: "What do you have to teach me?"

Listen. Don't answer with your thinking mind. Let the response arise.
          `,
        },
      ],

      guidanceNotes: `
10 Hz alpha entrainment supports receptive, imaginal awareness.
This is active imagination (Jungian technique), not passive fantasy.
      `,
    },

    // Phase 3: Deepening Dialogue (12 min)
    {
      phase: 'deepening',
      durationMinutes: 12,
      neuropodProtocol: 'assr-contemplative-theta',

      maiaPrompts: [
        {
          timing: 'start',
          prompt: `
Ask your anima/animus: "What part of me have you been trying to reach?
What have I been rejecting or projecting outward?"
          `,
        },
        {
          timing: 'mid',
          prompt: `
Notice any resistance, fear, or desire arising. Where in your body?

What does this resistance protect you from?
          `,
        },
        {
          timing: 'mid',
          prompt: `
Ask: "What would integration look like? How would I be different if I honored you?"
          `,
        },
        {
          timing: 'end',
          prompt: `
Final question: "What one thing can I do in the next week to honor this relationship?"

(Concrete, doable action — not abstract intention.)
          `,
        },
      ],

      guidanceNotes: `
Theta (6.5 Hz) supports depth work and access to unconscious material.
Dialogue should feel alive, surprising — not scripted by ego.
      `,
    },

    // Phase 4: Integration & Closure (8 min)
    {
      phase: 'integration',
      durationMinutes: 8,
      neuropodProtocol: 'annealing-pathway',

      maiaPrompts: [
        {
          timing: 'start',
          prompt: "Thank your anima/animus for this dialogue. Imagine them returning to the inner landscape.",
        },
        {
          timing: 'mid',
          prompt: "What are you taking with you from this session? Name one insight or feeling.",
        },
        {
          timing: 'end',
          prompt: "Reality check: Name three facts about your current environment.",
        },
      ],

      guidanceNotes: `
Critical to close the container and return to baseline coherence.
Reality-testing prevents inflation ("I am the animus!") or dissociation.
      `,
    },
  ],

  postSessionIntegration: {
    journalPrompts: [
      "What did your anima/animus look like? What qualities did it embody?",
      "What teaching or message emerged?",
      "What are you projecting onto external partners that belongs to your inner anima/animus?",
      "What one concrete action in the next week could honor this relationship?",
    ],

    meaningDeferral: `
Do not literalize the anima/animus as a "spirit guide" or external entity.
This is psychological work with archetypal energies, not supernatural contact.

Let insights settle for 48-72 hours before drawing conclusions.
    `,

    integrationPeriodHours: 72,

    followUpRecommendations: [
      "Journal for 7 days post-session (track dreams, relationship dynamics, projections)",
      "Notice projections onto partners/crushes/authority figures (what belongs to inner anima/animus?)",
      "Avoid new romantic entanglements for 1 week (anima/animus work stirs up projection dynamics)",
      "Schedule follow-up anima/animus dialogue in 4-6 weeks (relationship deepens over time)",
    ],
  },
};

// ============================================================================
// Session Template Registry
// ============================================================================

export const ARCHETYPAL_SESSION_TEMPLATES: Record<string, ArchetypalSessionTemplate> = {
  [SHADOW_INTEGRATION_SESSION.archetypeId]: SHADOW_INTEGRATION_SESSION,
  [ANIMA_ANIMUS_DIALOGUE_SESSION.archetypeId]: ANIMA_ANIMUS_DIALOGUE_SESSION,
};

// ============================================================================
// Session Orchestration Functions
// ============================================================================

/**
 * Get archetypal session by ID
 */
export function getArchetypalSession(archetypeId: string): ArchetypalSessionTemplate | null {
  return ARCHETYPAL_SESSION_TEMPLATES[archetypeId] || null;
}

/**
 * Check if user is eligible for archetypal session
 */
export function checkArchetypalSessionEligibility(
  archetypeId: string,
  userBloomLevel: number,
  userFieldStability: number,
  userMembershipTier: 'foundation' | 'explorer' | 'pioneer'
): {
  eligible: boolean;
  reason?: string;
} {
  const template = getArchetypalSession(archetypeId);

  if (!template) {
    return {
      eligible: false,
      reason: 'Session template not found',
    };
  }

  // Check membership tier
  const tierOrder = { foundation: 0, explorer: 1, pioneer: 2 };
  if (tierOrder[userMembershipTier] < tierOrder[template.requiredTier]) {
    return {
      eligible: false,
      reason: `This session requires ${template.requiredTier} tier (you're ${userMembershipTier})`,
    };
  }

  // Check Bloom level
  if (userBloomLevel < template.requiredBloomLevel) {
    return {
      eligible: false,
      reason: `This session requires Bloom level ${template.requiredBloomLevel}+ (you're at ${userBloomLevel.toFixed(1)})`,
    };
  }

  // Check field stability
  if (userFieldStability < template.requiredFieldStability) {
    return {
      eligible: false,
      reason: `This session requires field stability ${(template.requiredFieldStability * 100).toFixed(0)}%+ (you're at ${(userFieldStability * 100).toFixed(0)}%). Focus on grounding practices first.`,
    };
  }

  return {
    eligible: true,
  };
}

/**
 * Get next prompt for current phase
 */
export function getNextPrompt(
  archetypeId: string,
  phaseIndex: number,
  elapsedMinutes: number
): string | null {
  const template = getArchetypalSession(archetypeId);
  if (!template || phaseIndex >= template.phases.length) {
    return null;
  }

  const phase = template.phases[phaseIndex];
  const phaseElapsedMinutes = elapsedMinutes - template.phases.slice(0, phaseIndex).reduce((sum, p) => sum + p.durationMinutes, 0);

  // Determine timing
  let timing: 'start' | 'mid' | 'end';
  if (phaseElapsedMinutes < 1) {
    timing = 'start';
  } else if (phaseElapsedMinutes < phase.durationMinutes - 1) {
    timing = 'mid';
  } else {
    timing = 'end';
  }

  // Get matching prompts
  const prompts = phase.maiaPrompts.filter(p => p.timing === timing);

  // Return first unused prompt (would need state tracking in real implementation)
  return prompts.length > 0 ? prompts[0].prompt : null;
}

/**
 * Get all available archetypal sessions for user
 */
export function getAvailableArchetypalSessions(
  userBloomLevel: number,
  userFieldStability: number,
  userMembershipTier: 'foundation' | 'explorer' | 'pioneer'
): ArchetypalSessionTemplate[] {
  const available: ArchetypalSessionTemplate[] = [];

  for (const template of Object.values(ARCHETYPAL_SESSION_TEMPLATES)) {
    const eligibility = checkArchetypalSessionEligibility(
      template.archetypeId,
      userBloomLevel,
      userFieldStability,
      userMembershipTier
    );

    if (eligibility.eligible) {
      available.push(template);
    }
  }

  return available;
}
