/**
 * Tool Surfacing — Contextual tool perception engine
 *
 * Tools don't appear as features. They appear as shifts in perception.
 * This module detects when a tool should become perceptible to a member,
 * based on language patterns, emotional state, and relational readiness.
 *
 * Extends the existing detection chain:
 *   detectInterventionTriggers() → FRAMEWORK_REGISTRY → detectToolSuggestions() → suggestedActions
 *
 * See: docs/framework/tool-surfacing-spec.md for full spec.
 */

import type { SpiralogicCell, MaiaSuggestedAction } from './spiralogic-core';

// =============================================================================
// TYPES
// =============================================================================

/** Conditions that suppress tool surfacing */
type SuppressCondition =
  | 'acute_emotional_flooding'
  | 'first_disclosure'
  | 'rupture_charge'
  | 'low_readiness'
  | 'dissociation_signals'
  | 'active_crisis'
  | 'grief_processing'
  | 'early_interaction'
  | 'recent_tool_surfaced'
  | 'cognitive_after_somatic';

/** Readiness signals derived from current-turn language analysis */
export interface ReadinessSignals {
  /** 0-1: fragmented (0) vs reflective (1) */
  languageCoherence: number;
  /** 0-1: regulated (0) vs flooding (1) */
  emotionalIntensity: number;
  /** 0-1: "they always" (0) vs "I notice" (1) */
  agencyMarkers: number;
}

/** A single tool surfacing spec */
interface ToolSurfacingSpec {
  toolId: string;
  purpose: string;
  entryPatterns: RegExp[];
  entryConditions: {
    minInteractions?: number;
    elementAffinity?: string[];
    phaseAffinity?: number[];
  };
  feltLanguage: string[];
  suppressWhen: SuppressCondition[];
  exitSignals: RegExp[];
  priority: number; // 1-5, lower = higher priority
  actionShape: {
    label: string;
    route: string;
    silent: boolean;
  };
}

/** Tool suggestions are just MaiaSuggestedAction with kind='tool' fields populated */
export type ToolSuggestedAction = MaiaSuggestedAction & {
  kind: 'tool';
  toolId: string;
  feltLanguage: string;
  route: string;
  silent: boolean;
};

// =============================================================================
// TOOL SURFACING REGISTRY
// =============================================================================

const TOOL_SURFACING_REGISTRY: ToolSurfacingSpec[] = [
  // ─────────────────────────────────────────────────────
  // BELIEF LENS
  // ─────────────────────────────────────────────────────
  {
    toolId: 'belief-lens',
    purpose: 'Surface the assumptions shaping perception. Not correction — inquiry.',

    entryPatterns: [
      /\b(always|never|everyone|no one|nobody)\b/i,
      /\b(obviously|clearly|of course)\b/i,
      /\b(they think|people think|everyone knows)\b/i,
      /\b(I keep thinking|I can't stop thinking|I always end up)\b/i,
      /\b(it's because|the reason is|that's just how)\b/i,
    ],

    entryConditions: {
      minInteractions: 3,
      elementAffinity: ['Air', 'Fire'],
      phaseAffinity: [1, 2],
    },

    feltLanguage: [
      'There may be a way you\'re seeing this that is shaping what happens next.',
      'Something in how this lands feels like it might be an old frame.',
      'What would shift if the story you\'re telling yourself here were only partly true?',
    ],

    suppressWhen: [
      'acute_emotional_flooding',
      'first_disclosure',
      'rupture_charge',
      'cognitive_after_somatic',
      'early_interaction',
    ],

    exitSignals: [
      /\b(I notice I'?m telling myself|I wonder if|maybe it'?s not)\b/i,
      /\b(that'?s a story|that'?s my interpretation|I'?m assuming)\b/i,
    ],

    priority: 2,

    actionShape: {
      label: 'belief-lens-surfacing',
      route: '/labtools/belief-lens',
      silent: true,
    },
  },

  // ─────────────────────────────────────────────────────
  // PARTS & SHADOW
  // ─────────────────────────────────────────────────────
  {
    toolId: 'parts-shadow',
    purpose: 'When more than one voice is speaking. Inner conflict, contradiction, projection.',

    entryPatterns: [
      /\b(part of me|another part|one side of me|but then I also)\b/i,
      /\b(they always|people like that|he's so|she's so)\b/i,
      /\b(I should be|why can't I just|what's wrong with me)\b/i,
      /\b(I hate that about|I can't stand when)\b/i,
      /\b(I don't know why I|I keep doing|something in me)\b/i,
    ],

    entryConditions: {
      minInteractions: 2,
      elementAffinity: ['Water', 'Air'],
      phaseAffinity: [2, 3],
    },

    feltLanguage: [
      'More than one thing in you may be speaking here.',
      'Something in you may be trying to protect something else.',
      'There might be a voice beneath this voice.',
    ],

    suppressWhen: [
      'dissociation_signals',
      'active_crisis',
      'acute_emotional_flooding',
      // Note: low_readiness NOT included — projection/parts language IS the readiness signal.
      // If someone says "they always do this" with zero agency markers, that's precisely
      // when parts work is most relevant. Suppress via dissociation/crisis instead.
    ],

    exitSignals: [
      /\b(I see that part|I can feel both|I'm noticing the conflict)\b/i,
      /\b(it makes sense that|of course that part|I understand why)\b/i,
    ],

    priority: 1,

    actionShape: {
      label: 'parts-shadow-surfacing',
      route: '/labtools/parts-shadow',
      silent: true,
    },
  },

  // ─────────────────────────────────────────────────────
  // BRAIN TRUST
  // ─────────────────────────────────────────────────────
  {
    toolId: 'brain-trust',
    purpose: 'When a question needs more than one angle. Decision paralysis, multi-option loops.',

    entryPatterns: [
      /\b(I can't decide|I keep going back and forth|I don't know which)\b/i,
      /\b(on one hand|on the other hand|pros and cons)\b/i,
      /\b(what would you do|what should I|I need advice)\b/i,
      /\b(I've been thinking about this for|I can't figure out)\b/i,
      /\b(option A|option B|either\b.*\bor)\b/i,
    ],

    entryConditions: {
      minInteractions: 4,
      elementAffinity: ['Air', 'Earth'],
      phaseAffinity: [1, 3],
    },

    feltLanguage: [
      'It may help to look at this from more than one angle.',
      'There are several ways to see what\'s in front of you.',
      'This question might open differently with different lenses on it.',
    ],

    suppressWhen: [
      'grief_processing',
      'acute_emotional_flooding',
    ],

    exitSignals: [
      /\b(I think I'll|I'm going to|I've decided|that's what I want)\b/i,
      /\b(what matters most is|the real question is)\b/i,
    ],

    priority: 3,

    actionShape: {
      label: 'brain-trust-surfacing',
      route: '/labtools/brain-trust',
      silent: false,
    },
  },
];

// =============================================================================
// READINESS DETECTION
// =============================================================================

/** High-intensity emotional markers (apostrophe-tolerant for mobile/STT input) */
const FLOODING_MARKERS = [
  /\b(I can'?t breathe|I'?m falling apart|everything is|I want to die)\b/i,
  /\b(I can'?t take|I'?m breaking|I'?m losing|I can'?t handle)\b/i,
  /\b(panic|terrified|overwhelmed|desperate|spiraling)\b/i,
];

/** Dissociation markers */
const DISSOCIATION_MARKERS = [
  /\b(I don'?t know where I am|nothing feels real|I feel numb)\b/i,
  /\b(I can'?t feel anything|everything is foggy|I'?m not here)\b/i,
  /\b(blacked out|lost time|can'?t remember)\b/i,
];

/** Grief markers */
const GRIEF_MARKERS = [
  /\b(they died|passed away|lost my|funeral|grieving)\b/i,
  /\b(I miss them|gone forever|can'?t believe they'?re)\b/i,
];

/** Agency markers (positive — "I notice" style) */
const AGENCY_PATTERNS = [
  /\b(I notice|I'?m aware|I wonder|I'?m curious)\b/i,
  /\b(I realize|I'?m starting to|I want to understand)\b/i,
  /\b(I choose|I'?m choosing|I decided)\b/i,
];

/** Low-agency markers (reactive — "they always" style) */
const LOW_AGENCY_PATTERNS = [
  /\b(they always|they never|people always|everyone does)\b/i,
  /\b(it'?s their fault|they made me|I had no choice)\b/i,
  /\b(nothing works|there'?s no point|I can'?t do anything)\b/i,
];

/**
 * Assess relational readiness from the current message.
 * Returns 0-1 scores for coherence, intensity, and agency.
 * This is a lightweight heuristic, not a clinical assessment.
 */
export function assessReadiness(message: string): ReadinessSignals {
  const text = message.toLowerCase();

  // Emotional intensity: single marker = moderate, multiple = high
  // Combined with low coherence to distinguish "I'm terrified" (describing a feeling)
  // from "I can't breathe, everything is falling apart" (acute flooding)
  const floodingHits = FLOODING_MARKERS.filter(p => p.test(text)).length;
  const emotionalIntensity = floodingHits === 0 ? 0 : Math.min(floodingHits * 0.5, 1); // 1 hit = 0.5, 2+ hits = 1.0

  // Agency: balance of "I notice" vs "they always"
  const agencyHits = AGENCY_PATTERNS.filter(p => p.test(text)).length;
  const lowAgencyHits = LOW_AGENCY_PATTERNS.filter(p => p.test(text)).length;
  const totalAgency = agencyHits + lowAgencyHits;
  const agencyMarkers = totalAgency === 0 ? 0.5 : agencyHits / totalAgency;

  // Language coherence: rough proxy via sentence structure
  // Short fragments + lots of ellipsis/dashes = lower coherence
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const avgLength = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length
    : 0;
  const hasFragmentation = (text.match(/\.\.\.|—|--/g) || []).length > 3;
  const languageCoherence = hasFragmentation ? 0.3 : Math.min(avgLength / 60, 1);

  return { languageCoherence, emotionalIntensity, agencyMarkers };
}

// =============================================================================
// SUPPRESSION DETECTION
// =============================================================================

/**
 * Determine which suppression conditions are active for this turn.
 */
function detectActiveSuppressions(
  message: string,
  readiness: ReadinessSignals,
  conversationDepth: number,
  recentToolSurfaced: boolean,
  recentSomaticWork: boolean
): Set<SuppressCondition> {
  const active = new Set<SuppressCondition>();
  const text = message.toLowerCase();

  // Acute flooding: either high intensity alone, or moderate intensity + low coherence
  // "I can't breathe, everything is falling apart" (intensity 0.5 + coherence 0.3) = flooding
  // "Part of me is terrified" (intensity 0.5 + coherence 0.7) = describing a feeling, not flooding
  if (readiness.emotionalIntensity > 0.7 ||
      (readiness.emotionalIntensity >= 0.5 && readiness.languageCoherence < 0.4)) {
    active.add('acute_emotional_flooding');
  }

  if (readiness.agencyMarkers < 0.3) {
    active.add('low_readiness');
  }

  if (readiness.languageCoherence < 0.3) {
    active.add('dissociation_signals');
  }

  if (DISSOCIATION_MARKERS.some(p => p.test(text))) {
    active.add('dissociation_signals');
  }

  if (GRIEF_MARKERS.some(p => p.test(text))) {
    active.add('grief_processing');
  }

  // First disclosure: conversation depth < 2 turns
  if (conversationDepth < 2) {
    active.add('first_disclosure');
  }

  if (conversationDepth < 3) {
    active.add('early_interaction');
  }

  if (recentToolSurfaced) {
    active.add('recent_tool_surfaced');
  }

  if (recentSomaticWork) {
    active.add('cognitive_after_somatic');
  }

  // Crisis detection (stronger than flooding)
  const crisisMarkers = [
    /\b(want to die|kill myself|end it all|suicide)\b/i,
    /\b(self.harm|hurt myself|cutting)\b/i,
  ];
  if (crisisMarkers.some(p => p.test(text))) {
    active.add('active_crisis');
  }

  // Rupture charge
  const ruptureMarkers = [
    /\b(betrayed|you don'?t understand|I trusted|how could they)\b/i,
    /\b(lied to me|broke my|abandoned)\b/i,
  ];
  if (ruptureMarkers.some(p => p.test(text))) {
    active.add('rupture_charge');
  }

  return active;
}

// =============================================================================
// MAIN DETECTION FUNCTION
// =============================================================================

export interface ToolSurfacingContext {
  /** Current user message */
  message: string;
  /** Current spiralogic cell */
  spiralogicCell: SpiralogicCell;
  /** Number of turns in this conversation */
  conversationDepth: number;
  /** Whether a tool was surfaced in the last 2 turns */
  recentToolSurfaced?: boolean;
  /** Whether somatic work (body scan, regulation) was active recently */
  recentSomaticWork?: boolean;
}

/**
 * Detect which tools should surface for this turn.
 *
 * Returns 0-2 tool suggestions, ordered by priority.
 * Each suggestion includes felt language for the oracle to weave in,
 * and an action for the suggestedActions array.
 *
 * Fire-and-forget safe — never throws, never blocks.
 */
export function detectToolSuggestions(
  ctx: ToolSurfacingContext
): ToolSuggestedAction[] {
  try {
    const { message, spiralogicCell, conversationDepth } = ctx;

    // Assess readiness
    const readiness = assessReadiness(message);

    // Hard gates: if readiness is very low, suppress everything
    if (readiness.emotionalIntensity > 0.7 && readiness.languageCoherence < 0.3) {
      return []; // member needs stabilization, not tools
    }

    // Detect active suppressions
    const suppressions = detectActiveSuppressions(
      message,
      readiness,
      conversationDepth,
      ctx.recentToolSurfaced ?? false,
      ctx.recentSomaticWork ?? false
    );

    const candidates: Array<{ spec: ToolSurfacingSpec; matchScore: number }> = [];

    for (const spec of TOOL_SURFACING_REGISTRY) {
      // Check suppression
      const isSuppressed = spec.suppressWhen.some(cond => suppressions.has(cond));
      if (isSuppressed) continue;

      // Check min interactions
      if (spec.entryConditions.minInteractions && conversationDepth < spec.entryConditions.minInteractions) {
        continue;
      }

      // Check exit signals (tool has already done its work)
      const isExited = spec.exitSignals.some(p => p.test(message));
      if (isExited) continue;

      // Check entry patterns — how many match?
      const patternMatches = spec.entryPatterns.filter(p => p.test(message)).length;
      if (patternMatches === 0) continue;

      // Check element affinity (bonus, not gate)
      const elementBonus = spec.entryConditions.elementAffinity?.includes(spiralogicCell.element) ? 0.2 : 0;

      // Check phase affinity (bonus, not gate)
      const phaseBonus = spec.entryConditions.phaseAffinity?.includes(spiralogicCell.phase) ? 0.1 : 0;

      // Match score: pattern matches + affinity bonuses
      const matchScore = (patternMatches / spec.entryPatterns.length) + elementBonus + phaseBonus;

      candidates.push({ spec, matchScore });
    }

    if (candidates.length === 0) return [];

    // Sort by priority (lower = higher priority), then by match score (higher = better)
    candidates.sort((a, b) => {
      if (a.spec.priority !== b.spec.priority) return a.spec.priority - b.spec.priority;
      return b.matchScore - a.matchScore;
    });

    // Return top 2 at most
    const maxTools = 2;
    const results: ToolSuggestedAction[] = [];

    for (let i = 0; i < Math.min(candidates.length, maxTools); i++) {
      const { spec, matchScore } = candidates[i];

      // Pick a felt language phrase (rotate based on conversation depth)
      const languageIndex = conversationDepth % spec.feltLanguage.length;
      const feltPhrase = spec.feltLanguage[languageIndex];

      results.push({
        // MaiaSuggestedAction base fields
        id: spec.actionShape.label,
        label: spec.actionShape.label,
        priority: matchScore,
        elementalResonance: spiralogicCell.element,

        // Tool surfacing fields
        kind: 'tool',
        toolId: spec.toolId,
        feltLanguage: feltPhrase,
        route: spec.actionShape.route,
        silent: spec.actionShape.silent,
      });
    }

    return results;
  } catch {
    // Fire-and-forget safe — never breaks the oracle
    return [];
  }
}

/**
 * Get the surfacing registry (for testing and inspection).
 */
export function getToolSurfacingRegistry(): ReadonlyArray<Readonly<ToolSurfacingSpec>> {
  return TOOL_SURFACING_REGISTRY;
}
