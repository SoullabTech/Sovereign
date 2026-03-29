/**
 * Aether Guard — integration rule for prosody coherence.
 *
 * Pre-render safety check that prevents prosodic collapse:
 * - Overdrive: too much projection + speed simultaneously
 * - Sedation: too slow + too many pauses simultaneously
 * - Brittleness: too fast + too articulated simultaneously
 *
 * Called after mapping, before rendering. Last line of defense
 * before audio generation.
 *
 * Named for Aether's role: integration and restraint.
 */

import type { ProsodyPacket } from './prosodyPacket';

export function aetherGuard(p: ProsodyPacket): ProsodyPacket {
  const guarded = { ...p };

  // Prevent overdrive (Fire runaway)
  if (guarded.projection > 1.15 && guarded.tempo > 1.1) {
    guarded.projection = 1.1;
    guarded.tempo = 1.08;
  }

  // Prevent sedation (Water collapse)
  if (guarded.tempo < 0.9 && guarded.silenceBias > 0.3) {
    guarded.silenceBias = 0.25;
  }

  // Prevent brittleness (Air sharpening)
  if (guarded.articulation > 1.15 && guarded.tempo > 1.1) {
    guarded.articulation = 1.1;
  }

  // Prevent inertia (Earth flatline)
  if (guarded.cadenceDensity > 1.15 && guarded.emphasis < 0.85) {
    guarded.emphasis = 0.88;
  }

  return guarded;
}
