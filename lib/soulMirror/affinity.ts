/**
 * Soul Mirror — Felt-State Affinity
 *
 * Each felt input maps to a shortlist of blocks whose felt-vector
 * aligns with the present moment of the user.
 *
 * Why this exists:
 *   The recognition line speaks to the user's present moment.
 *   The doorway must continue that moment, not redirect it.
 *
 *   Without affinity, routing was: input → element → random.
 *   That's emotionally intelligent at the front and mechanically
 *   indifferent at the back — which breaks trust.
 *
 *   With affinity, routing is: input → affinity → block.
 *   The doorway matches the moment, not just the category.
 *
 * Discipline:
 *   - Do NOT delete blocks
 *   - Do NOT reclassify their element
 *   - Only control WHEN they appear
 *
 *   Specific-situation blocks (e.g. WATER-07 "When Helpers Forget
 *   Themselves") remain in the index. They surface only when context
 *   indicates them — not as default first doorways.
 *
 * See: docs/book-studio/SOUL_MIRROR_ROUTING.md
 */

import type { FeltInput } from './routeSoulMirror';

/**
 * Affinity-aligned block IDs per felt input.
 * Iterated as feedback comes in from real use.
 */
export const FELT_AFFINITY: Record<FeltInput, readonly string[]> = {
  // kindling, calling, rekindling — fire that wants to move
  alive: ['FIRE-01', 'FIRE-06', 'FIRE-03'],

  // holding, returning, surrender, softening — water that holds
  overwhelmed: ['WATER-02', 'WATER-04', 'WATER-06', 'WATER-03'],

  // service, place, resilience — earth that anchors
  grounding: ['EARTH-01', 'EARTH-02', 'EARTH-04'],

  // friendship, repair, transmission — air that connects
  disconnected: ['AIR-01', 'AIR-03', 'AIR-02'],

  // center, stillness, communion — aether that rests
  still: ['AETHER-05', 'AETHER-03', 'AETHER-02'],

  // softest entries, no descent required
  unsure: ['WATER-06', 'AETHER-05'],
};
