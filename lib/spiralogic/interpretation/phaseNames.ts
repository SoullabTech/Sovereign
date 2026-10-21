/**
 * Phase display vocabulary — RULED, not proposed.
 *
 * Finding 6 (Kelly, 2026-07-10; ruling recorded in commit 008a8a0a5 on the
 * conformance report + grammar spec): vector/circle/spiral survives as the
 * interpretive-layer DISPLAY vocabulary for phases 1/2/3, modality-keyed
 * per Kelly's Elemental Alchemy manuscript
 * (docs/book-studio/ELEMENTAL_ALCHEMY_MANUSCRIPT.md):
 *
 *   vector = cardinal = phase 1  (initiating — "arrow of volition")
 *   circle = fixed    = phase 2  (sustaining)
 *   spiral = mutable  = phase 3  (adapting)
 *
 * The grammar schema stays numeric {1,2,3}; these names never enter the
 * registration layer. The vocabulary is versioned under the
 * `interpretation_version` regime — re-keying or renaming it is a version
 * bump, not an edit.
 *
 * Correction clause (travels with the ruling): the house-keyed variant of
 * this vocabulary (the old `SPIRALOGIC_FACETS.stage` /
 * `SPIRALOGIC_HOUSE_MAPPING.phase` hardcoded literals) never survives as
 * phase vocabulary — it died at this refit by ruling, not omission. Any
 * surface that wants these words consumes THIS mapping; none defines its
 * own. A sentinel test enforces it.
 */

import type { Phase } from '../registration';

export type PhaseDisplayName = 'vector' | 'circle' | 'spiral';

/** The one place the phase display names are defined (modality-keyed). */
export const PHASE_DISPLAY_NAMES: Record<Phase, PhaseDisplayName> = {
  1: 'vector', // cardinal — initiating
  2: 'circle', // fixed — sustaining
  3: 'spiral', // mutable — adapting
} as const;

/** Display name for a grammar phase. */
export function phaseDisplayName(phase: Phase): PhaseDisplayName {
  return PHASE_DISPLAY_NAMES[phase];
}
