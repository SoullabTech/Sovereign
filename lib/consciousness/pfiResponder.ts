/**
 * PFI Responder — Deterministic sovereign response generation.
 *
 * When PFI can author directly, it does. Claude is not consulted.
 * This is the sovereign territory — responses that require no creative generation,
 * only presence, containment, or structural clarity.
 *
 * Current sovereign arcs:
 *   - Containment (hold_silence stance, distress/high affect)
 *   - Grounding (earth element, dysregulation)
 *   - Consent / boundary (user escalating, repair needed)
 *   - One-breath responses (≤ 40 words — presence markers, transitions)
 *   - Repair (rupture detected, axiom violation)
 *
 * Design contract:
 *   - canRespondDirectly() returns true → use generateDirectResponse()
 *   - canRespondDirectly() returns false → Claude drafts under PFI plan
 *   - No LLM call when sovereign response is sufficient
 *   - All responses are tested, typed, and logged as 'pfi_direct'
 *
 * Apprenticeship path:
 *   - Stage 3: these arcs are fully replaced (already done)
 *   - Stage 4: expand sovereign territory as drift scoring improves
 *   - Stage 5: Claude handles only novel synthesis; PFI handles known forms
 *
 * Usage in oracle route (before LLM call):
 *   const direct = canRespondDirectly(plan, affect, ruptureDetected);
 *   if (direct) {
 *     const { text, source } = generateDirectResponse(plan, affect, context);
 *     // Use text directly — skip LLM
 *   }
 */

import type { Element } from '@/lib/types/voiceIntent';
import type { MAIAResponsePlan } from '@/lib/maia/maiaPlanner';
import type { AffectState, PFIIntention } from '@/lib/consciousness/pfi';

// ── Response Source Tags ───────────────────────────────────────────────────
// Every direct response is tagged so drift logs can distinguish
// PFI-generated from Claude-generated turns.

export type ResponseSource =
  | 'pfi_containment'    // Distress / hold_silence arc
  | 'pfi_grounding'      // Earth element / dysregulation grounding
  | 'pfi_repair'         // Rupture / axiom violation repair
  | 'pfi_boundary'       // Consent / boundary response
  | 'pfi_one_breath'     // Short presence signal (≤ 40 words)
  | 'pfi_transition';    // Conversation transition marker

export interface DirectResponse {
  text: string;
  source: ResponseSource;
  /** Confirmed ≤ 40 words */
  wordCount: number;
  /** Element that shaped the response */
  element: Element;
}

// ── Pools ─────────────────────────────────────────────────────────────────
// These pools are the sovereign voice library.
// Add/refine responses here — they never go through a model.

// Containment: hold_silence stance, distress ≥ moderate
const CONTAINMENT_POOL: Record<Element, string[]> = {
  water:  [
    "I'm here with you.",
    "You don't have to hold this alone.",
    "Stay with me.",
    "I hear you.",
    "That matters.",
  ],
  fire:   [
    "I'm right here.",
    "Stay with me — you're not alone in this.",
    "That's a lot. I'm with you.",
    "I hear you.",
    "I'm here.",
  ],
  earth:  [
    "Stay grounded. I'm with you.",
    "You don't have to move. I'm here.",
    "Let's be still together.",
    "I hear you. I'm here.",
    "Take your time.",
  ],
  air:    [
    "Breathe. I'm here.",
    "I'm with you.",
    "I hear you.",
    "That's real. I'm here.",
    "Take all the space you need.",
  ],
  aether: [
    "I'm here.",
    "With you.",
    "That's real.",
    "I hear you.",
    "I'm holding this with you.",
  ],
};

// Grounding: earth element, affect = distressed or dissociated
const GROUNDING_POOL: Record<AffectState, string[]> = {
  dissociated: [
    "Feel your feet on the ground.",
    "You're here. I'm here. That's enough for now.",
    "Notice one thing around you — just one.",
    "Take a breath. Slow. I'm with you.",
    "You don't have to be anywhere else right now.",
  ],
  distressed: [
    "Let your body settle a little if it can.",
    "You're not alone with this.",
    "One breath at a time.",
    "I'm here. There's no rush.",
    "You're safe to be exactly here.",
  ],
  calm: [
    "Take a moment before we continue.",
    "There's space here.",
    "No rush.",
  ],
  activated: [
    "Let that energy land before we move.",
    "One breath — then we continue.",
    "That's real. Take a moment with it.",
  ],
  transitional: [
    "Stay with what's moving.",
    "No need to name it yet.",
    "I'm with you in the transition.",
  ],
};

// Repair: rupture detected, axiom violation, trust breach
const REPAIR_POOL: string[] = [
  "Something shifted there — I want to name it. What felt off?",
  "I think I missed something. Can we come back to what you said?",
  "That deserves more attention than I gave it.",
  "Let me slow down. What's most important to you right now?",
  "I may have moved too fast. What do you need from me here?",
];

// Boundary: consent / escalation / limit responses
const BOUNDARY_POOL: string[] = [
  "I want to stay within what's actually helpful here.",
  "That's at the edge of what I can hold with you responsibly.",
  "I care about getting this right — that means being honest about my limits.",
  "Let me be clear about what I can and can't offer here.",
  "I'm not the right support for this — but I don't want to abandon you.",
];

// One-breath: short presence markers (≤ 25 words)
const ONE_BREATH_POOL: Partial<Record<PFIIntention, string[]>> = {
  reflect: [
    "That lands.",
    "I hear that.",
    "That's real.",
    "There's something important there.",
  ],
  contain: [
    "I'm here.",
    "With you.",
    "I hear you.",
    "Stay with me.",
  ],
  invite: [
    "Take your time.",
    "There's space here.",
    "Whenever you're ready.",
    "No rush.",
  ],
};

// ── Picker ────────────────────────────────────────────────────────────────

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Eligibility Check ─────────────────────────────────────────────────────

/**
 * Returns true if PFI can generate this response directly without a model call.
 *
 * Conservative — only returns true for well-understood, high-confidence arcs.
 * Expands as scoring improves and sovereign territory grows.
 */
export function canRespondDirectly(
  plan: MAIAResponsePlan,
  affect: AffectState,
  opts: {
    ruptureDetected?: boolean;
    conversationDepth?: number;
  } = {}
): boolean {
  const { ruptureDetected = false } = opts;

  // Always handle rupture with repair pool (never let Claude draft a repair)
  if (ruptureDetected) return true;

  // Always handle hold_silence stance directly (containment is sovereign)
  if (plan.stance === 'hold_silence') return true;

  // Distress + witness stance → containment pool
  if (affect === 'distressed' && plan.stance === 'witness') return true;

  // Dissociation → grounding pool
  if (affect === 'dissociated') return true;

  // Very short responses (≤ 40 words budget) with simple intention → one-breath pool
  if (plan.maxWords <= 40 && plan.responseType === 'reflection' && plan.stance === 'witness') {
    return true;
  }

  return false;
}

// ── Generator ─────────────────────────────────────────────────────────────

/**
 * Generate a direct sovereign response from PFI pools.
 * Only call after canRespondDirectly() returns true.
 */
export function generateDirectResponse(
  plan: MAIAResponsePlan,
  affect: AffectState,
  opts: {
    ruptureDetected?: boolean;
    intention?: PFIIntention;
  } = {}
): DirectResponse {
  const { ruptureDetected = false, intention = 'reflect' } = opts;
  const element = plan.element;

  let text: string;
  let source: ResponseSource;

  if (ruptureDetected) {
    text = pick(REPAIR_POOL);
    source = 'pfi_repair';

  } else if (plan.stance === 'hold_silence' || (affect === 'distressed' && plan.stance === 'witness')) {
    const pool = CONTAINMENT_POOL[element] ?? CONTAINMENT_POOL.aether;
    text = pick(pool);
    source = 'pfi_containment';

  } else if (affect === 'dissociated') {
    text = pick(GROUNDING_POOL.dissociated);
    source = 'pfi_grounding';

  } else if (affect === 'distressed') {
    text = pick(GROUNDING_POOL.distressed);
    source = 'pfi_grounding';

  } else {
    // One-breath fallback
    const pool = ONE_BREATH_POOL[intention] ?? ONE_BREATH_POOL.reflect ?? ["I'm here."];
    text = pick(pool);
    source = 'pfi_one_breath';
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return { text, source, wordCount, element };
}

// ── Boundary Response ─────────────────────────────────────────────────────
// Separate export — boundary responses have different trigger logic
// and are called explicitly, not via canRespondDirectly.

export function generateBoundaryResponse(): DirectResponse {
  const text = pick(BOUNDARY_POOL);
  return {
    text,
    source: 'pfi_boundary',
    wordCount: text.split(/\s+/).filter(Boolean).length,
    element: 'aether', // Boundary responses are element-neutral
  };
}

// ── Voice Plan Hint ───────────────────────────────────────────────────────
// Direct responses need prosody too — derive minimal VoicePlan from plan.

export function voicePlanForDirectResponse(
  plan: MAIAResponsePlan,
  source: ResponseSource
): { ttsInstructions: string; prosodyMode: 'calm' | 'intimate' } {
  const isContainment = source === 'pfi_containment' || source === 'pfi_grounding';

  if (isContainment) {
    return {
      ttsInstructions: 'Voice: intimate and warm. Pace: very slow. Energy: soft, contained. Avoid rushing. Let silence land after.',
      prosodyMode: 'calm',
    };
  }

  if (source === 'pfi_repair') {
    return {
      ttsInstructions: 'Voice: present and clear. Pace: slow. Energy: grounded, honest. No theatrics. Land the question gently.',
      prosodyMode: 'calm',
    };
  }

  if (source === 'pfi_boundary') {
    return {
      ttsInstructions: 'Voice: grounded and direct. Pace: moderate. Energy: steady, caring. Clear without coldness.',
      prosodyMode: 'calm',
    };
  }

  // One-breath / transition
  return {
    ttsInstructions: 'Voice: present. Pace: slow. Energy: gentle. One phrase — let it land.',
    prosodyMode: 'intimate',
  };
}
