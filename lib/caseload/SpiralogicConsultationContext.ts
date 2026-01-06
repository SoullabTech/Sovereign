/**
 * SPIRALOGIC CONSULTATION CONTEXT
 *
 * Builds deep Spiralogic context for case consultations.
 * Maps case data to the 12-phase elemental framework.
 *
 * Based on Kelly Nezat's "Elemental Alchemy: The Ancient Art of Living a Phenomenal Life"
 */

import { SPIRALOGIC_FACETS, type FacetCode, type SpiralogicFacet } from '@/lib/consciousness/spiralogicFacets';
import {
  CANONICAL_QUESTIONS,
  COMPLETE_ELEMENTAL_FACETS_REGISTRY,
  type ElementalFacetDescriptor,
} from '@/lib/consciousness/spiralogic-core';

// Element to facet prefix mapping
const ELEMENT_TO_PREFIX: Record<string, string> = {
  fire: 'F',
  water: 'W',
  earth: 'E',
  air: 'A',
};

// Phase name mapping for spiral stages
const PHASE_KEYWORDS: Record<string, number> = {
  // Fire phases
  call: 1, spark: 1, destiny: 1, beginning: 1,
  trial: 2, gauntlet: 2, action: 2, friction: 2,
  lived: 3, identity: 3, shift: 3, becoming: 3,
  // Water phases
  opening: 1, vulnerability: 1, deep: 1,
  underworld: 2, shadow: 2, descent: 2,
  gold: 3, integration: 3, wisdom: 3,
  // Earth phases
  design: 1, seed: 1, form: 1, container: 1,
  germination: 2, practice: 2, resourcing: 2,
  embodied: 3, stewardship: 3, stable: 3,
  // Air phases
  telling: 1, dialogue: 1, honest: 1, voice: 1,
  pattern: 2, teaching: 2, framework: 2,
  mythic: 3, cultural: 3, seeding: 3,
};

export interface SpiralogicContext {
  // Current facet info
  currentFacet: SpiralogicFacet | null;
  currentFacetDescriptor: ElementalFacetDescriptor | null;

  // Guidance for this facet
  coreMovement: string;
  coreQuestion: string;
  shadowPattern: string;
  goldMedicine: string;

  // Canonical questions for MAIA to consider
  canonicalQuestions: string[];

  // Transition info
  nextTransition: {
    toElement: string;
    toPhase: number;
    transitionPrompt: string;
  } | null;

  // Healthy vs shadow indicators
  healthyExperience: string[];
  shadowDistortions: string[];

  // Language cues MAIA should watch for
  typicalLanguageCues: string[];

  // What MAIA should focus on
  maiaMainJob: string[];

  // Formatted prompt section
  spiralogicPromptSection: string;
}

/**
 * Parse facet code from various formats
 * Accepts: "F1", "Fire-1", "FIRE-1", etc.
 */
export function parseFacetCode(input: string | null | undefined): FacetCode | null {
  if (!input) return null;

  const normalized = input.trim().toUpperCase();

  // Direct facet code: F1, W2, E3, A1, etc.
  if (/^[FWEA][123]$/.test(normalized)) {
    return normalized as FacetCode;
  }

  // Element-Phase format: Fire-1, Water-2, etc.
  const elementPhaseMatch = normalized.match(/^(FIRE|WATER|EARTH|AIR)-?(\d)$/);
  if (elementPhaseMatch) {
    const elementPrefix = elementPhaseMatch[1].charAt(0);
    const phase = elementPhaseMatch[2];
    return `${elementPrefix}${phase}` as FacetCode;
  }

  return null;
}

/**
 * Infer phase from spiral stage description
 */
export function inferPhaseFromSpiralStage(spiralStage: string | null | undefined): number | null {
  if (!spiralStage) return null;

  const normalized = spiralStage.toLowerCase();

  for (const [keyword, phase] of Object.entries(PHASE_KEYWORDS)) {
    if (normalized.includes(keyword)) {
      return phase;
    }
  }

  return null;
}

/**
 * Build facet code from element and phase
 */
export function buildFacetCode(element: string | null | undefined, phase: number | null): FacetCode | null {
  if (!element || !phase || phase < 1 || phase > 3) return null;

  const prefix = ELEMENT_TO_PREFIX[element.toLowerCase()];
  if (!prefix) return null;

  return `${prefix}${phase}` as FacetCode;
}

/**
 * Get full Spiralogic context for a case
 */
export function getSpiralogicContext(params: {
  facetCode?: string | null;
  primaryElement?: string | null;
  spiralStage?: string | null;
}): SpiralogicContext {
  const { facetCode, primaryElement, spiralStage } = params;

  // Try to determine the facet code
  let resolvedFacetCode = parseFacetCode(facetCode);

  if (!resolvedFacetCode && primaryElement) {
    // Try to infer phase from spiral stage
    const phase = inferPhaseFromSpiralStage(spiralStage) || 1;
    resolvedFacetCode = buildFacetCode(primaryElement, phase);
  }

  // Get facet info
  const currentFacet = resolvedFacetCode ? SPIRALOGIC_FACETS[resolvedFacetCode] || null : null;

  // Get detailed descriptor
  const facetId = currentFacet
    ? `${currentFacet.element}-${currentFacet.phase}`
    : null;

  const currentFacetDescriptor = facetId
    ? COMPLETE_ELEMENTAL_FACETS_REGISTRY.find(f => f.id === facetId) || null
    : null;

  // Get canonical questions
  const canonicalQuestions = facetId
    ? CANONICAL_QUESTIONS[facetId] || []
    : [];

  // Build transition info
  let nextTransition: { toElement: string; toPhase: number; transitionPrompt: string; } | null = null;
  if (currentFacetDescriptor?.nextElementalTransition) {
    const { to, phase, transitionPrompt } = currentFacetDescriptor.nextElementalTransition;
    nextTransition = {
      toElement: to,
      toPhase: phase,
      transitionPrompt,
    };
  }

  // Build the consultation prompt section
  const spiralogicPromptSection = buildSpiralogicPromptSection({
    facet: currentFacet,
    descriptor: currentFacetDescriptor,
    canonicalQuestions,
  });

  return {
    currentFacet,
    currentFacetDescriptor,
    coreMovement: currentFacet?.coreMovement || currentFacetDescriptor?.coreMovement || '',
    coreQuestion: currentFacet?.coreQuestion || currentFacetDescriptor?.coreQuestion || '',
    shadowPattern: currentFacet?.shadowPattern || currentFacetDescriptor?.shadowPattern || '',
    goldMedicine: currentFacet?.goldMedicine || currentFacetDescriptor?.goldMedicine || '',
    canonicalQuestions,
    nextTransition,
    healthyExperience: currentFacetDescriptor?.healthyExperience || [],
    shadowDistortions: currentFacetDescriptor?.shadowDistortions || [],
    typicalLanguageCues: currentFacetDescriptor?.typicalLanguageCues || [],
    maiaMainJob: currentFacetDescriptor?.maiaMainJob || [],
    spiralogicPromptSection,
  };
}

/**
 * Build the Spiralogic section for MAIA's consultation prompt
 */
function buildSpiralogicPromptSection(params: {
  facet: SpiralogicFacet | null;
  descriptor: ElementalFacetDescriptor | null;
  canonicalQuestions: string[];
}): string {
  const { facet, descriptor, canonicalQuestions } = params;

  if (!facet) {
    return `
SPIRALOGIC CONTEXT:
No specific facet code assigned. Use your knowledge of the 12-phase Spiralogic framework
to identify which phase the client may be in based on the session notes and patterns.

The four elements cycle: Fire (initiation/action) → Water (feeling/descent) → Earth (form/embodiment) → Air (meaning/transmission)
Each element has 3 phases: Cardinal (1 - opening), Fixed (2 - deepening), Mutable (3 - integration/transition)
`;
  }

  let section = `
SPIRALOGIC CONTEXT:
Current Facet: ${facet.code} - ${facet.name}
Element: ${facet.element} | Phase: ${facet.phase} (${['Cardinal', 'Fixed', 'Mutable'][facet.phase - 1]})

CORE MOVEMENT: ${facet.coreMovement}
CORE QUESTION: ${facet.coreQuestion}

SHADOW PATTERN (watch for): ${facet.shadowPattern}
GOLD MEDICINE (therapeutic direction): ${facet.goldMedicine}
`;

  if (descriptor) {
    if (descriptor.archetypalImage) {
      section += `\nARCHETYPAL IMAGE: ${descriptor.archetypalImage}`;
    }

    if (descriptor.healthyExperience?.length > 0) {
      section += `\n\nHEALTHY EXPRESSION:
${descriptor.healthyExperience.map(h => `- ${h}`).join('\n')}`;
    }

    if (descriptor.shadowDistortions?.length > 0) {
      section += `\n\nSHADOW DISTORTIONS (if present, address gently):
${descriptor.shadowDistortions.map(s => `- ${s}`).join('\n')}`;
    }

    if (descriptor.maiaMainJob?.length > 0) {
      section += `\n\nYOUR MAIN JOB IN THIS FACET:
${descriptor.maiaMainJob.map(j => `- ${j}`).join('\n')}`;
    }

    if (descriptor.nextElementalTransition) {
      section += `\n\nNEXT TRANSITION: When ready, this moves to ${descriptor.nextElementalTransition.to}-${descriptor.nextElementalTransition.phase}
Transition prompt: "${descriptor.nextElementalTransition.transitionPrompt}"`;
    }
  }

  if (canonicalQuestions.length > 0) {
    section += `\n\nCANONICAL QUESTIONS FOR THIS FACET:
${canonicalQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
  }

  return section;
}

/**
 * Analyze themes against Spiralogic framework
 */
export function analyzeThemesThroughSpiralogic(themes: string[]): {
  suggestedElement: string | null;
  suggestedPhase: number | null;
  reasoning: string;
} {
  if (!themes || themes.length === 0) {
    return { suggestedElement: null, suggestedPhase: null, reasoning: 'No themes to analyze' };
  }

  const normalizedThemes = themes.map(t => t.toLowerCase());

  // Element detection
  const elementScores: Record<string, number> = { fire: 0, water: 0, earth: 0, air: 0 };

  // Fire keywords
  const fireKeywords = ['motivation', 'action', 'energy', 'start', 'beginning', 'resistance', 'friction', 'identity', 'becoming', 'ambition', 'drive', 'initiative'];
  // Water keywords
  const waterKeywords = ['feeling', 'emotion', 'vulnerable', 'shadow', 'grief', 'loss', 'depth', 'wound', 'pain', 'relationship', 'attachment', 'intimacy', 'fear'];
  // Earth keywords
  const earthKeywords = ['structure', 'routine', 'habit', 'practice', 'boundary', 'form', 'stability', 'grounding', 'body', 'health', 'work', 'discipline'];
  // Air keywords
  const airKeywords = ['communication', 'clarity', 'understanding', 'meaning', 'pattern', 'insight', 'teaching', 'sharing', 'truth', 'voice', 'expression'];

  for (const theme of normalizedThemes) {
    if (fireKeywords.some(k => theme.includes(k))) elementScores.fire++;
    if (waterKeywords.some(k => theme.includes(k))) elementScores.water++;
    if (earthKeywords.some(k => theme.includes(k))) elementScores.earth++;
    if (airKeywords.some(k => theme.includes(k))) elementScores.air++;
  }

  const maxScore = Math.max(...Object.values(elementScores));
  const suggestedElement = maxScore > 0
    ? Object.entries(elementScores).find(([_, score]) => score === maxScore)?.[0] || null
    : null;

  // Phase detection (simplified)
  let suggestedPhase: number | null = null;
  const phaseIndicators = {
    1: ['new', 'beginning', 'start', 'emerging', 'opening', 'first'],
    2: ['struggle', 'conflict', 'deep', 'stuck', 'challenge', 'practice', 'building'],
    3: ['integration', 'completion', 'mastery', 'wisdom', 'transition', 'letting go'],
  };

  for (const theme of normalizedThemes) {
    for (const [phase, keywords] of Object.entries(phaseIndicators)) {
      if (keywords.some(k => theme.includes(k))) {
        suggestedPhase = parseInt(phase);
        break;
      }
    }
  }

  const reasoning = suggestedElement
    ? `Themes suggest ${suggestedElement.charAt(0).toUpperCase() + suggestedElement.slice(1)} element work${suggestedPhase ? ` in phase ${suggestedPhase}` : ''}`
    : 'Themes don\'t clearly indicate a specific elemental focus';

  return { suggestedElement, suggestedPhase, reasoning };
}

/**
 * Get all facets for reference
 */
export function getAllFacets(): SpiralogicFacet[] {
  return Object.values(SPIRALOGIC_FACETS);
}

/**
 * Get facet summary for quick reference
 */
export function getFacetSummary(facetCode: FacetCode): string {
  const facet = SPIRALOGIC_FACETS[facetCode];
  if (!facet) return '';

  return `${facet.code} (${facet.name}): ${facet.coreQuestion}`;
}
