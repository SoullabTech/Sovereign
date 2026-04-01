/**
 * Sacred Texts — Barrel export
 *
 * Entry point for all sacred text modules.
 */

// Shared types
export type {
  SacredTradition,
  SacredMode,
  EngagementStyle,
  SacredPassageEntry,
  SacredPassage,
  TraditionDisclaimer,
  EncounterSessionContext,
} from './types';
export { toSacredPassage } from './types';

// Registry
export { SacredTextRegistry } from './SacredTextRegistry';

// Selection
export { selectSacredPassage } from './selectSacredPassage';

// Encounter service
export { evaluateEncounter } from './SacredEncounterService';
export type { EncounterInput, EncounterResult } from './SacredEncounterService';

// Tradition-specific
export { QURAN_ENTRIES, QURAN_DISCLAIMER } from './quran';
export { TAO_ENTRIES, TAO_DISCLAIMER } from './tao';
