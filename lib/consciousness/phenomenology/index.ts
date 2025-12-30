// @ts-nocheck - Prototype file, not type-checked
/**
 * Spiralogic Phenomenology Module
 *
 * The Twelve Facets as modes of participatory consciousness,
 * integrated with MAIA's consciousness field architecture.
 *
 * @module lib/consciousness/phenomenology
 */

// Core phenomenology
export {
  // Types
  Element,
  Phase,
  FacetCode,
  PhaseMovement,
  PhenomenologicalGesture,
  SpiralogicFacet,
  FacetActivation,
  CollectiveFieldState,

  // Constants
  SPIRALOGIC_FACETS,
  SPIRALOGIC_INSIGHT,

  // Core utilities
  getFacet,
  getFacetsByElement,
  getFacetsByPhase,
  getFacetFromElementPhase,
  detectFacetFromText,
  getElementPrinciple,
  getPhaseDescription
} from './SpiralogicPhenomenology';

// Integration layer
export {
  // Type conversions
  normalizeElement,
  FacetFieldWeights,
  getFacetFieldWeights,

  // Spiral state bridge
  SpiralStateFromFacet,
  facetToSpiralState,

  // Collective operations
  aggregateToCollectiveField,

  // Response guidance
  FacetResponseGuidance,
  getResponseGuidance,

  // Alchemical correspondence
  AlchemicalCorrespondence,
  getFacetAlchemicalCorrespondence
} from './PhenomenologicalFieldIntegration';
