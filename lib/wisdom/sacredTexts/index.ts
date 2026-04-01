/**
 * Sacred Texts — Barrel export
 *
 * Entry point for all sacred text modules.
 * Each tradition gets its own file; this index re-exports the public API.
 */

// Qur'an
export { QuranService } from './QuranService';
export type { SacredPassage } from './QuranService';
export { QURAN_DISCLAIMER } from './quran';
export type { QuranEntry } from './quran';

// Encounter layer
export { evaluateEncounter } from './SacredEncounterService';
export type { EncounterInput, EncounterResult, SacredPassagePayload } from './SacredEncounterService';
