/**
 * MAIA STATE VECTOR
 *
 * The perceptual backbone of MAIA's consciousness companion architecture.
 * Captures, stores, routes, and reflects a member's inner state.
 *
 * Usage:
 *   import { parseStateVector, routePractice, storeStateVector } from '@/lib/maia/state-vector';
 *
 * Flow:
 *   1. User sends check-in or conversation message
 *   2. isLikelyCheckin() decides whether to inject the STATE_VECTOR contract
 *   3. LLM produces response with ```STATE_VECTOR block
 *   4. parseStateVector() extracts and validates the vector
 *   5. storeStateVector() persists to PostgreSQL
 *   6. routePractice() maps vector to a practice recommendation
 *   7. State Card UI renders the vector for the user
 */

// Types
export type {
  StateVector,
  StateVectorRow,
  StateVectorDelta,
  ElementalReading,
  StateMovement,
  Kairos,
  KairosAssessment,
  EvidenceModel,
  Evidence,
  EvidenceCategory,
  Element,
  BaseElement,
  FacetCode,
  AetherQuality,
  Facet,
  CyclePhase,
  Intensity,
  StateVectorSource,
} from './types';

// Constants and guards
export {
  ELEMENTS,
  BASE_ELEMENTS,
  FACET_CODES,
  AETHER_QUALITIES,
  FACET_TO_ELEMENT,
  FACET_POSITION,
  POLARITY_LABELS,
  STABILITY_LABELS,
  KAIROS_LABELS,
  isElement,
  isFacetCode,
  isKairosAssessment,
  isIntensity,
} from './types';

// Parser
export { parseStateVector, stripStateVectorBlocks } from './parser';
export type { ParseResult } from './parser';

// Prompt contract
export { STATE_VECTOR_OUTPUT_CONTRACT, isLikelyCheckin } from './prompt-contract';

// Practice routing
export { routePractice } from './practice-router';
export type { PracticeRecommendation, RecommendedDuration } from './practice-router';

// State defaults & inference
export {
  detectStateFromText,
  inferStateVector,
  getDefaultStateVector,
  getDefaultPracticeRecommendation,
} from './stateDefaults';
export type { LitePracticeRecommendation } from './stateDefaults';

// Storage
export {
  storeStateVector,
  getLatestVector,
  getRecentVectors,
  getSessionVectors,
  getElementDistribution,
  getElevatedKairosMembers,
  getDailyAverages,
} from './store';
