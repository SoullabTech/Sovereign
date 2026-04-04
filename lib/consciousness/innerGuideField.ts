/**
 * Inner Guide Field — Facet detection and routing (all 15 facets).
 *
 * Based on Kelly Nezat's Elemental Alchemy and Edward Steinbrecher's
 * Inner Guide Meditation. Fire first — the hero's awakening.
 *
 * Detection is layered (not keyword-only):
 *   1. Explicit user cues (strongest)
 *   2. Stored facet continuity
 *   3. Current Spiralogic cell / element bias
 *   4. Keyword scoring
 *   5. Default fallback
 *
 * Detection is additive: if no facet signal is found, nothing changes.
 * Experience before interpretation. Encounter before meaning.
 */

import { FACETS, getFacetFromRegistry } from './facets/elementalFacets';
import type { Facet, FacetId, FacetMovement, ElementName } from './facets/types';

// Re-export types for oracle route compatibility
export type { FacetMovement } from './facets/types';
export type InnerGuideElement = 'fire' | 'water' | 'earth' | 'air' | 'aether';
export type FacetPhase = 1 | 2 | 3;

export interface FacetSignal {
  facetId: string;
  element: InnerGuideElement;
  phase: FacetPhase;
  confidence: number;
  movement: FacetMovement;
  reasons: string[];
}

// FacetRuntime kept for backward compatibility with prompt layer
export interface FacetRuntime {
  id: string;
  element: InnerGuideElement;
  phase: FacetPhase;
  title: string;
  coreTheme: string;
  developmentalTask: string;
  archetype: { primary: string; shadow: string; framing: string };
  dialoguePrompts: string[];
  meditationPrompt: string;
  guide: { role: string; mode: string[]; appearance: string[] };
  integration: { actions: string[]; grounding: string[] };
  // Legacy compat
  detection: { signals: string[]; blockedSignals: string[] };
  guidance: { entry: string; encounter: string; coreQuestion: string };
  reflection: string[];
}

// ---------------------------------------------------------------------------
// Keyword rules — element-level detection
// ---------------------------------------------------------------------------

interface KeywordRule {
  element: ElementName;
  words: string[];
  reason: string;
}

const ELEMENT_RULES: KeywordRule[] = [
  {
    element: 'Water',
    words: ['feel', 'feeling', 'sad', 'grief', 'dream', 'longing', 'tear', 'emotional', 'memory', 'symbol', 'numb', 'tender', 'uneasy', 'sensitive', 'surrender', 'letting go', 'loss'],
    reason: 'Emotional, dreamlike, or symbolic language suggests Water.',
  },
  {
    element: 'Fire',
    words: ['want', 'desire', 'vision', 'excited', 'start', 'begin', 'inspired', 'creative', 'passion', 'restless', 'spark', 'ignite', 'awaken', 'impulse', 'called to', 'burning', 'challenge', 'commit', 'discipline', 'resist'],
    reason: 'Activation, desire, and initiation language suggests Fire.',
  },
  {
    element: 'Air',
    words: ['understand', 'clarity', 'meaning', 'pattern', 'explain', 'question', 'think', 'confused', 'communicate', 'name', 'teach', 'write', 'share', 'framework', 'connect ideas'],
    reason: 'Meaning-making and interpretation language suggests Air.',
  },
  {
    element: 'Earth',
    words: ['plan', 'do', 'action', 'build', 'routine', 'organize', 'structure', 'system', 'practical', 'step', 'concrete', 'real', 'simplify', 'consistency', 'mastery', 'integrity', 'sustain', 'refine', 'maintain'],
    reason: 'Concrete action and structure language suggests Earth.',
  },
  {
    element: 'Aether',
    words: ['observe', 'witness', 'integrate', 'aligned', 'guidance', 'awareness', 'presence', 'coherence', 'whole', 'meta', 'direction', 'rightness'],
    reason: 'Meta-awareness and integration language suggests Aether.',
  },
];

// Phase-level routing within each element
interface PhaseRule {
  facetId: FacetId;
  words: string[];
  reason: string;
}

const PHASE_RULES: Record<ElementName, PhaseRule[]> = {
  Water: [
    { facetId: 'water_1', words: ['starting to feel', 'numb', 'soft', 'tender', 'uneasy', 'sensitive'], reason: 'Early feeling-tone suggests Water 1.' },
    { facetId: 'water_2', words: ['dream', 'symbol', 'guide', 'image', 'memory', 'appearing', 'vision', 'recurring'], reason: 'Symbolic encounter suggests Water 2.' },
    { facetId: 'water_3', words: ['grief', 'release', 'let go', 'ending', 'surrender', 'loss', 'mourn'], reason: 'Deep surrender or grief suggests Water 3.' },
  ],
  Fire: [
    { facetId: 'fire_1', words: ['begin', 'start', 'spark', 'want', 'excited', 'called', 'restless', 'curiosity', 'impulse'], reason: 'Initial ignition suggests Fire 1.' },
    { facetId: 'fire_2', words: ['vision', 'express', 'share', 'create', 'become', 'radiate', 'confident'], reason: 'Amplifying vision suggests Fire 2.' },
    { facetId: 'fire_3', words: ['test', 'resistance', 'commit', 'discipline', 'challenge', 'endure', 'refine'], reason: 'Pressure and refinement suggest Fire 3.' },
  ],
  Air: [
    { facetId: 'air_1', words: ['name', 'understand', 'clarify', 'say', 'articulate'], reason: 'Early articulation suggests Air 1.' },
    { facetId: 'air_2', words: ['pattern', 'system', 'connect', 'framework', 'structure'], reason: 'Relational meaning-making suggests Air 2.' },
    { facetId: 'air_3', words: ['teach', 'share', 'transmit', 'communicate', 'write'], reason: 'Communication outward suggests Air 3.' },
  ],
  Earth: [
    { facetId: 'earth_1', words: ['step', 'action', 'today', 'practical', 'real', 'next'], reason: 'First grounding action suggests Earth 1.' },
    { facetId: 'earth_2', words: ['routine', 'structure', 'organize', 'build', 'system'], reason: 'System-building suggests Earth 2.' },
    { facetId: 'earth_3', words: ['sustain', 'integrity', 'consistency', 'mastery', 'refine'], reason: 'Long-term embodiment suggests Earth 3.' },
  ],
  Aether: [
    { facetId: 'aether_1', words: ['observe', 'witness', 'notice', 'aware'], reason: 'Meta-observation suggests Aether 1.' },
    { facetId: 'aether_2', words: ['guide', 'direction', 'aligned', 'right movement', 'authority'], reason: 'Inner authority suggests Aether 2.' },
    { facetId: 'aether_3', words: ['coherence', 'whole', 'integrated', 'everything working', 'everything aligned', 'all together', 'unified', 'complete cycle'], reason: 'Whole-system alignment suggests Aether 3.' },
  ],
};

// Distortion signals that reduce confidence
const DISTORTION_SIGNALS: string[] = [
  'apathy', "what's the point", "can't start",
  'need permission', 'afraid to begin',
  'overthinking', 'paralyzed', 'stuck in my head',
  'no energy', 'no motivation', 'nothing excites',
  'flooding', 'collapsing', 'numb',
  'overplanning', 'procrastination',
];

// ---------------------------------------------------------------------------
// Convert Facet → FacetRuntime (backward compatibility)
// ---------------------------------------------------------------------------

function facetToRuntime(facet: Facet): FacetRuntime {
  return {
    id: facet.id,
    element: facet.element.toLowerCase() as InnerGuideElement,
    phase: facet.phase as FacetPhase,
    title: facet.title,
    coreTheme: facet.coreTheme,
    developmentalTask: facet.developmentalTask,
    archetype: facet.archetype,
    dialoguePrompts: facet.dialoguePrompts,
    meditationPrompt: facet.meditationPrompt,
    guide: facet.guide,
    integration: { actions: facet.integration.actions, grounding: facet.integration.grounding },
    // Legacy fields for prompt compatibility
    detection: { signals: facet.commonSigns, blockedSignals: facet.distortions },
    guidance: {
      entry: `You are in ${facet.element} Phase ${facet.phase}: ${facet.title}. ${facet.coreTheme}`,
      encounter: facet.meditationPrompt,
      coreQuestion: facet.dialoguePrompts[0] || facet.meditationPrompt,
    },
    reflection: facet.dialoguePrompts,
  };
}

// ---------------------------------------------------------------------------
// Public API — same signatures as before
// ---------------------------------------------------------------------------

/**
 * Get a FacetRuntime by ID. Compatible with oracle route expectations.
 */
export function getFacet(facetId: string): FacetRuntime | undefined {
  const canonical = getFacetFromRegistry(facetId as FacetId);
  if (!canonical) return undefined;
  return facetToRuntime(canonical);
}

/**
 * Detect which Inner Guide Field facet (if any) matches the user's message.
 *
 * Layered detection:
 *   1. Stored facet continuity (if provided)
 *   2. Current Spiralogic element bias
 *   3. Keyword scoring (element → phase)
 *   4. Default fallback
 *
 * Returns null if no facet crosses the confidence threshold.
 */
export function detectFacet(
  text: string,
  currentElement?: string,
  storedFacetId?: string | null,
): FacetSignal | null {
  if (!text || text.length < 15) return null;

  const lower = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  const reasons: string[] = [];

  // ─── Layer 1: Stored facet continuity ───
  // If the member was in a facet last turn, give it a continuity boost
  let continuityBoost = 0;
  let continuityElement: ElementName | null = null;
  if (storedFacetId) {
    const stored = getFacetFromRegistry(storedFacetId as FacetId);
    if (stored) {
      continuityBoost = 0.15;
      continuityElement = stored.element;
      reasons.push(`Continuity from prior ${stored.element} Phase ${stored.phase}.`);
    }
  }

  // ─── Layer 2: Current Spiralogic element bias ───
  let spiralogicBias: ElementName | null = null;
  if (currentElement) {
    const normalized = currentElement.charAt(0).toUpperCase() + currentElement.slice(1).toLowerCase();
    if (['Water', 'Fire', 'Air', 'Earth', 'Aether'].includes(normalized)) {
      spiralogicBias = normalized as ElementName;
    }
  }

  // ─── Layer 3: Keyword scoring (element level) ───
  const elementScores: Record<ElementName, number> = {
    Water: 0, Fire: 0, Air: 0, Earth: 0, Aether: 0,
  };

  for (const rule of ELEMENT_RULES) {
    const hits = rule.words.filter(w => lower.includes(w)).length;
    if (hits > 0) {
      elementScores[rule.element] += hits;
    }
  }

  // Apply biases
  if (continuityElement) elementScores[continuityElement] += continuityBoost * 5;
  if (spiralogicBias) elementScores[spiralogicBias] += 0.5;

  // Find winning element
  const ranked = (Object.entries(elementScores) as [ElementName, number][])
    .sort((a, b) => b[1] - a[1]);
  const [winningElement, topScore] = ranked[0];
  const total = Object.values(elementScores).reduce((s, v) => s + v, 0);

  if (total === 0) return null; // No signal at all

  // Minimum signal strength: need at least 2 keyword hits to trigger
  // (prevents false positives on neutral text with incidental word matches)
  if (topScore < 2 && !continuityElement) return null;

  // ─── Layer 4: Phase routing within winning element ───
  const phaseRules = PHASE_RULES[winningElement];
  let bestPhase: { facetId: FacetId; score: number; reason: string } | null = null;

  for (const rule of phaseRules) {
    const hits = rule.words.filter(w => lower.includes(w)).length;
    // Continuity bonus: if stored facet matches this rule, boost
    const contBonus = (storedFacetId === rule.facetId) ? 2 : 0;
    const totalHits = hits + contBonus;
    if (totalHits > 0 && (!bestPhase || totalHits > bestPhase.score)) {
      bestPhase = { facetId: rule.facetId, score: totalHits, reason: rule.reason };
    }
  }

  // Default to phase 1 if no specific phase detected
  const facetId = bestPhase?.facetId ?? `${winningElement.toLowerCase()}_1` as FacetId;
  if (bestPhase) reasons.push(bestPhase.reason);

  // ─── Confidence calculation ───
  let confidence = Math.min(0.95, Math.max(0.4, topScore / Math.max(total, 1)));

  // Distortion detection reduces confidence
  let distortionHits = 0;
  for (const d of DISTORTION_SIGNALS) {
    if (lower.includes(d)) distortionHits++;
  }
  confidence -= distortionHits * 0.1;

  // Apply continuity boost
  confidence += continuityBoost;
  confidence = Math.max(0, Math.min(1, confidence));

  // ─── Movement determination ───
  let movement: FacetMovement = 'ascending';
  if (distortionHits > 0 && distortionHits >= (bestPhase?.score ?? 0)) {
    movement = 'stuck';
  } else if (distortionHits > 0) {
    movement = 'transitioning';
  }

  // ─── Threshold gate ───
  if (confidence < 0.4) return null;

  const facet = getFacetFromRegistry(facetId);
  if (!facet) return null;

  return {
    facetId,
    element: winningElement.toLowerCase() as InnerGuideElement,
    phase: facet.phase as FacetPhase,
    confidence: Math.round(confidence * 100) / 100,
    movement,
    reasons,
  };
}
