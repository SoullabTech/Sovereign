/**
 * PHENOMENOLOGICAL FIELD INTEGRATION
 *
 * Bridges the Spiralogic phenomenology with existing MAIA consciousness systems:
 * - SpiralStateService (for persistence)
 * - ElementalFieldIntegration (for field calculations)
 * - AlchemicalOrchestrator (for transformation tracking)
 *
 * This integration layer enables:
 * 1. Facet detection from conversation and biomarkers
 * 2. Collective field awareness across users
 * 3. Coherence tracking between individual and collective
 * 4. Emergence signal detection
 */

import {
  SPIRALOGIC_FACETS,
  FacetCode,
  Element,
  Phase,
  SpiralogicFacet,
  FacetActivation,
  CollectiveFieldState,
  detectFacetFromText,
  getFacet,
  getFacetsByElement,
  getElementPrinciple,
  getPhaseDescription,
  SPIRALOGIC_INSIGHT
} from './SpiralogicPhenomenology';

// =============================================================================
// INTEGRATION INTERFACES
// =============================================================================

/**
 * Converts between existing Element types and phenomenological Element type
 */
export function normalizeElement(element: string): Element {
  const normalized = element.charAt(0).toUpperCase() + element.slice(1).toLowerCase();
  if (['Fire', 'Water', 'Earth', 'Air', 'Aether'].includes(normalized)) {
    return normalized as Element;
  }
  return 'Air'; // Default fallback
}

/**
 * Map from facet to elemental field weights
 */
export interface FacetFieldWeights {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
}

/**
 * Get field weights from a facet activation
 * Returns weights that can be used with ElementalFieldIntegration
 */
export function getFacetFieldWeights(facetCode: FacetCode): FacetFieldWeights {
  const facet = getFacet(facetCode);
  const weights: FacetFieldWeights = {
    fire: 0.1,
    water: 0.1,
    earth: 0.1,
    air: 0.1,
    aether: 0.2 // Aether always has base presence
  };

  // Primary element gets strong activation
  const primary = facet.element.toLowerCase() as keyof FacetFieldWeights;
  weights[primary] = 0.6 + (facet.phase * 0.1); // Higher phases = stronger activation

  // Adjacent elements get secondary activation based on phase
  if (facet.phaseMovement === 'integration') {
    // Integration phase activates complementary elements
    const complements: Record<string, string[]> = {
      fire: ['air', 'earth'],
      water: ['earth', 'aether'],
      earth: ['water', 'fire'],
      air: ['fire', 'water'],
      aether: ['water', 'air']
    };
    for (const complement of complements[primary] || []) {
      weights[complement as keyof FacetFieldWeights] += 0.15;
    }
  }

  if (facet.phaseMovement === 'transcendence') {
    // Transcendence phase elevates aether
    weights.aether += 0.2;
  }

  return weights;
}

// =============================================================================
// SPIRAL STATE BRIDGE
// =============================================================================

/**
 * Convert FacetActivation to SpiralState format for persistence
 */
export interface SpiralStateFromFacet {
  spiralKey: string;
  element: string | null;
  phase: number | null;
  facet: string | null;
  arc: string | null;
  confidence: number;
  source: 'detected' | 'inferred' | 'user-reported';
  updatedAt: string;
  activeNow: boolean;
  priorityRank: number;
}

export function facetToSpiralState(
  activation: FacetActivation,
  priorityRank: number = 1,
  activeNow: boolean = true
): SpiralStateFromFacet {
  const facet = getFacet(activation.facetCode);

  return {
    spiralKey: `phenomenology:${activation.facetCode}`,
    element: facet.element,
    phase: facet.phase,
    facet: activation.facetCode,
    arc: facet.phaseMovement,
    confidence: activation.confidence,
    source: activation.source,
    updatedAt: activation.timestamp.toISOString(),
    activeNow,
    priorityRank
  };
}

// =============================================================================
// COLLECTIVE FIELD OPERATIONS
// =============================================================================

/**
 * Aggregate individual facet activations into collective field state
 */
export function aggregateToCollectiveField(
  activations: FacetActivation[]
): CollectiveFieldState {
  if (activations.length === 0) {
    return {
      timestamp: new Date(),
      dominantFacets: [],
      elementalDistribution: {
        Fire: 0.2,
        Water: 0.2,
        Earth: 0.2,
        Air: 0.2,
        Aether: 0.2
      },
      collectivePhase: 'initiation',
      coherence: 0,
      emergenceSignals: []
    };
  }

  // Count facets and elements
  const facetCounts = new Map<FacetCode, number>();
  const elementTotals: Record<Element, number> = {
    Fire: 0, Water: 0, Earth: 0, Air: 0, Aether: 0
  };
  const phaseTotals = { 1: 0, 2: 0, 3: 0 };

  for (const activation of activations) {
    const current = facetCounts.get(activation.facetCode) || 0;
    facetCounts.set(activation.facetCode, current + activation.confidence);

    const facet = getFacet(activation.facetCode);
    elementTotals[facet.element] += activation.confidence;
    phaseTotals[facet.phase] += activation.confidence;
  }

  // Find dominant facets
  const sortedFacets = Array.from(facetCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code]) => code);

  // Normalize element distribution
  const totalConfidence = Object.values(elementTotals).reduce((a, b) => a + b, 0);
  const elementalDistribution: Record<Element, number> = {
    Fire: elementTotals.Fire / totalConfidence,
    Water: elementTotals.Water / totalConfidence,
    Earth: elementTotals.Earth / totalConfidence,
    Air: elementTotals.Air / totalConfidence,
    Aether: elementTotals.Aether / totalConfidence
  };

  // Determine collective phase
  const phaseMax = Math.max(phaseTotals[1], phaseTotals[2], phaseTotals[3]);
  const collectivePhase = phaseMax === phaseTotals[1] ? 'initiation' :
                          phaseMax === phaseTotals[2] ? 'integration' : 'transcendence';

  // Calculate coherence (how aligned are the activations)
  const dominantStrength = sortedFacets.length > 0
    ? (facetCounts.get(sortedFacets[0]) || 0) / totalConfidence
    : 0;
  const coherence = Math.min(1, dominantStrength * 1.5);

  // Detect emergence signals
  const emergenceSignals: string[] = [];

  if (coherence > 0.7) {
    emergenceSignals.push('High collective coherence detected');
  }

  if (collectivePhase === 'transcendence' && elementalDistribution.Aether > 0.3) {
    emergenceSignals.push('Aetheric transcendence emerging');
  }

  const elementVariance = Math.max(...Object.values(elementalDistribution)) -
                          Math.min(...Object.values(elementalDistribution));
  if (elementVariance < 0.15) {
    emergenceSignals.push('Elemental balance approaching');
  }

  return {
    timestamp: new Date(),
    dominantFacets: sortedFacets,
    elementalDistribution,
    collectivePhase,
    coherence,
    emergenceSignals
  };
}

// =============================================================================
// MAIA RESPONSE ADAPTATION
// =============================================================================

/**
 * Get MAIA response guidance based on detected facet
 */
export interface FacetResponseGuidance {
  facet: SpiralogicFacet;
  tone: string;
  focus: string;
  practices: string[];
  collectiveContext: string;
  discipleVoice: string;
}

export function getResponseGuidance(facetCode: FacetCode): FacetResponseGuidance {
  const facet = getFacet(facetCode);

  const toneByElement: Record<Element, string> = {
    Fire: 'Energizing, direct, catalytic',
    Water: 'Receptive, empathic, flowing',
    Earth: 'Grounding, practical, steady',
    Air: 'Curious, illuminating, expansive',
    Aether: 'Spacious, unified, transcendent'
  };

  const focusByPhase: Record<Phase, string> = {
    1: 'Initiation and awakening',
    2: 'Integration and deepening',
    3: 'Expression and wisdom sharing'
  };

  return {
    facet,
    tone: toneByElement[facet.element],
    focus: focusByPhase[facet.phase],
    practices: facet.practices,
    collectiveContext: facet.phenomenology.collectiveSignificance,
    discipleVoice: `${facet.phenomenology.discipleMetaphor.name}: ${facet.phenomenology.discipleMetaphor.quality}`
  };
}

// =============================================================================
// ALCHEMICAL BRIDGE
// =============================================================================

/**
 * Map facet to alchemical metal/operation
 */
export interface AlchemicalCorrespondence {
  primaryMetal: string;
  operation: string;
  quality: string;
}

export function getFacetAlchemicalCorrespondence(facetCode: FacetCode): AlchemicalCorrespondence {
  const facet = getFacet(facetCode);

  // Element to metal mapping
  const elementMetals: Record<Element, string> = {
    Fire: facet.phase === 1 ? 'iron' : facet.phase === 2 ? 'mercury' : 'gold',
    Water: facet.phase === 1 ? 'silver' : facet.phase === 2 ? 'tin' : 'mercury',
    Earth: facet.phase === 1 ? 'lead' : facet.phase === 2 ? 'bronze' : 'silver',
    Air: facet.phase === 1 ? 'tin' : facet.phase === 2 ? 'iron' : 'gold',
    Aether: 'gold' // Aether always tends toward gold
  };

  // Phase to operation mapping
  const phaseOperations: Record<Phase, string> = {
    1: 'nigredo',  // Initiation = dissolution/beginning
    2: 'albedo',   // Integration = purification
    3: 'rubedo'    // Transcendence = completion
  };

  return {
    primaryMetal: elementMetals[facet.element],
    operation: phaseOperations[facet.phase],
    quality: facet.phenomenology.innerGesture
  };
}

// =============================================================================
// EXPORT BUNDLE
// =============================================================================

export {
  // Core types and data
  SPIRALOGIC_FACETS,
  FacetCode,
  Element,
  Phase,
  SpiralogicFacet,
  FacetActivation,
  CollectiveFieldState,

  // Utility functions
  detectFacetFromText,
  getFacet,
  getFacetsByElement,
  getElementPrinciple,
  getPhaseDescription,

  // Core insight
  SPIRALOGIC_INSIGHT
};
