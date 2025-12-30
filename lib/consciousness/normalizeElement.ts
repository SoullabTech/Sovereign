/**
 * Canonical Element Normalization
 *
 * Normalizes string inputs to the canonical Element type used by spiralogic-core.
 * Prevents case-mismatch errors ('fire' vs 'Fire') across the codebase.
 */

export type CanonicalElement = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

/**
 * Convert any string representation of an element to canonical form.
 * Returns null for invalid/unknown inputs.
 */
export function toCanonicalElement(e: unknown): CanonicalElement | null {
  if (typeof e !== 'string') return null;
  const v = e.trim().toLowerCase();
  if (v === 'fire') return 'Fire';
  if (v === 'water') return 'Water';
  if (v === 'earth') return 'Earth';
  if (v === 'air') return 'Air';
  if (v === 'aether' || v === 'ether') return 'Aether';
  return null;
}

/**
 * Check if an element matches a canonical value (case-insensitive).
 * Useful for comparisons without needing to normalize first.
 */
export function isElement(e: unknown, target: CanonicalElement): boolean {
  return toCanonicalElement(e) === target;
}

/**
 * Get numeric weight for an element based on dominance.
 * Returns high weight (0.8) if element matches, low (0.4) otherwise.
 */
export function getElementWeight(current: unknown, target: CanonicalElement): number {
  return toCanonicalElement(current) === target ? 0.8 : 0.4;
}
