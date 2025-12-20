/**
 * Multi-Spiral State Utilities
 *
 * Provides normalization and validation functions to ensure spiral state integrity:
 * - Unique priority ranks for active spirals (1..N)
 * - Inactive spirals always at rank 999
 * - Deterministic tie-breaking via updatedAt
 * - Unique spiralKey enforcement (last-write-wins)
 */

export interface SpiralState {
  spiralKey: string; // "work", "relationship", "health", "money", "parenting", etc.
  element: "Water" | "Fire" | "Earth" | "Air" | null;
  phase: number | null; // 0-5
  facet: string | null; // "Water 2", "Fire 3", etc.
  arc: string | null; // "dissolution", "ignition", "stabilization", etc.
  confidence: number; // 0-1
  source: "user_checkin" | "soul_mirror" | "inferred" | "migration";
  updatedAt: string; // ISO timestamp
  activeNow: boolean; // true if this spiral is currently active
  priorityRank: number; // 1 = highest priority, 2 = second, etc.
}

/**
 * Normalizes priority ranks to ensure:
 * 1. Active spirals have unique, contiguous ranks (1, 2, 3, ...)
 * 2. Inactive spirals always have rank 999
 * 3. Deterministic ordering via updatedAt tie-breaker
 * 4. Unique spiralKey (last-write-wins if duplicates exist)
 *
 * This function is called on every write to prevent rank collapse.
 */
export function normalizeActiveRanks(states: SpiralState[]): SpiralState[] {
  // Create a copy to avoid mutating input
  const copy = [...states];

  // Get all active spirals and sort them
  const active = copy
    .filter(s => s.activeNow)
    .sort((a, b) => {
      // Primary sort: priorityRank ascending (1, 2, 3, ...)
      if (a.priorityRank !== b.priorityRank) {
        return a.priorityRank - b.priorityRank;
      }
      // Tie-breaker: most recently updated first
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  // Assign contiguous unique ranks: 1..N
  active.forEach((s, idx) => {
    s.priorityRank = idx + 1;
  });

  // Inactive spirals always get rank 999 (stable sentinel value)
  copy.filter(s => !s.activeNow).forEach(s => {
    s.priorityRank = 999;
  });

  // Ensure unique spiralKey (last-write-wins for duplicates)
  const byKey = new Map<string, SpiralState>();
  for (const s of copy) {
    byKey.set(s.spiralKey, s);
  }

  return Array.from(byKey.values());
}

/**
 * Validates that spiral states meet integrity constraints:
 * - No duplicate spiralKey
 * - Active spirals have unique priority ranks
 * - Active spirals have ranks >= 1
 *
 * Used for runtime validation and testing.
 */
export function validateSpiralStates(states: SpiralState[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for duplicate spiralKeys
  const keys = states.map(s => s.spiralKey);
  const uniqueKeys = new Set(keys);
  if (keys.length !== uniqueKeys.size) {
    errors.push("Duplicate spiralKey found");
  }

  // Check for duplicate ranks among active spirals
  const activeRanks = states
    .filter(s => s.activeNow)
    .map(s => s.priorityRank);

  const uniqueActiveRanks = new Set(activeRanks);
  if (activeRanks.length !== uniqueActiveRanks.size) {
    errors.push("Duplicate priorityRank found among active spirals");
  }

  // Check that active spirals have valid ranks (>= 1)
  const invalidRanks = states
    .filter(s => s.activeNow && s.priorityRank < 1);

  if (invalidRanks.length > 0) {
    errors.push(`Active spirals with invalid ranks (<1): ${invalidRanks.map(s => s.spiralKey).join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Merges updates into existing spiral states while preserving unlisted spirals.
 * This implements "preserve by default" semantics - only mentioned spirals are updated.
 *
 * @param current - Current spiral states
 * @param updates - Partial updates (spiralKey + optional activeNow/priorityRank)
 * @returns Merged and normalized spiral states
 */
export interface PriorityUpdate {
  spiralKey: string;
  activeNow?: boolean;
  priorityRank?: number;
}

export function mergePreservingSpiralUpdates(
  current: SpiralState[],
  updates: PriorityUpdate[]
): SpiralState[] {
  // Build map from current state
  const map = new Map(current.map(s => [s.spiralKey, { ...s }]));

  // Apply updates only to mentioned spirals
  for (const u of updates) {
    const existing = map.get(u.spiralKey) ?? {
      // Create minimal new spiral if not found
      spiralKey: u.spiralKey,
      element: null,
      phase: null,
      facet: null,
      arc: null,
      confidence: 0.5,
      source: "inferred" as const,
      updatedAt: new Date().toISOString(),
      activeNow: true,
      priorityRank: 999 // Will be normalized
    };

    // Apply updates
    if (typeof u.activeNow === "boolean") {
      existing.activeNow = u.activeNow;
    }
    if (typeof u.priorityRank === "number") {
      existing.priorityRank = u.priorityRank;
    }

    // Update timestamp
    existing.updatedAt = new Date().toISOString();

    map.set(u.spiralKey, existing);
  }

  // Return normalized array
  return normalizeActiveRanks(Array.from(map.values()));
}

/**
 * Replaces all active spiral priorities authoritatively.
 * Spirals not in the list are deactivated (activeNow=false, rank=999).
 *
 * Used by Soul Mirror and other systems that provide complete active spiral lists.
 */
export function replaceActiveSpiralSet(
  current: SpiralState[],
  newActiveKeys: string[]
): SpiralState[] {
  const map = new Map(current.map(s => [s.spiralKey, { ...s }]));
  const now = new Date().toISOString();

  // Deactivate all first
  for (const state of map.values()) {
    state.activeNow = false;
    state.priorityRank = 999;
  }

  // Activate only the new set
  newActiveKeys.forEach((key, idx) => {
    const existing = map.get(key) ?? {
      spiralKey: key,
      element: null,
      phase: null,
      facet: null,
      arc: null,
      confidence: 0.5,
      source: "inferred" as const,
      updatedAt: now,
      activeNow: true,
      priorityRank: idx + 1
    };

    existing.activeNow = true;
    existing.priorityRank = idx + 1;
    existing.updatedAt = now;

    map.set(key, existing);
  });

  // Normalize to ensure integrity
  return normalizeActiveRanks(Array.from(map.values()));
}
