/**
 * Spiral State Service
 *
 * Manages multi-spiral state persistence with automatic normalization.
 * Ensures data integrity by calling normalizeActiveRanks() on every write.
 *
 * Key guarantees:
 * - Active spirals have unique, contiguous priority ranks (1, 2, 3, ...)
 * - Inactive spirals always at rank 999
 * - No duplicate spiralKeys
 * - Deterministic sorting via updatedAt tie-breaker
 */

import { query } from "@/lib/db";
import {
  SpiralState,
  normalizeActiveRanks,
  validateSpiralStates,
  mergePreservingSpiralUpdates,
  replaceActiveSpiralSet,
  PriorityUpdate,
} from "./spiralStateUtils";

export interface SpiralStatesResponse {
  spirals: SpiralState[];
  updatedAt: string | null;
}

export class SpiralStateService {
  /**
   * Get all spiral states for a user
   */
  static async getSpiralStates(userId: string): Promise<SpiralStatesResponse> {
    const result = await query<{
      spiral_states: SpiralState[];
      spiral_states_updated_at: string | null;
    }>(
      `SELECT spiral_states, spiral_states_updated_at
       FROM user_relationship_context
       WHERE user_id = $1`,
      [userId]
    );

    if (!result.rows[0]) {
      return {
        spirals: [],
        updatedAt: null,
      };
    }

    const raw = result.rows[0].spiral_states;

    // Defensive: Handle both string (edge case) and object (normal pg driver behavior)
    const spirals = typeof raw === "string" ? JSON.parse(raw) : (raw ?? []);

    // Defensive: Normalize on read to handle any legacy data
    const normalized = normalizeActiveRanks(spirals);

    return {
      spirals: normalized,
      updatedAt: result.rows[0].spiral_states_updated_at,
    };
  }

  /**
   * Get only active spirals, sorted by priority
   * Returns top N active spirals (default 3 for prompt injection)
   */
  static async getActiveSpiralsForInjection(
    userId: string,
    limit: number = 3
  ): Promise<SpiralState[]> {
    const state = await this.getSpiralStates(userId);

    return state.spirals
      .filter(s => s.activeNow)
      .sort((a, b) => {
        // Primary sort: priorityRank ascending (1, 2, 3, ...)
        if (a.priorityRank !== b.priorityRank) {
          return a.priorityRank - b.priorityRank;
        }
        // Tie-breaker: most recently updated first
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
      .slice(0, limit);
  }

  /**
   * Set spiral states with automatic normalization.
   * This is the raw "replace everything" method.
   */
  static async updateSpiralStates(
    userId: string,
    spirals: SpiralState[]
  ): Promise<void> {
    // Normalize before writing
    const normalized = normalizeActiveRanks(spirals);

    // Validate
    const validation = validateSpiralStates(normalized);
    if (!validation.valid) {
      throw new Error(`Spiral state validation failed: ${validation.errors.join(", ")}`);
    }

    const now = new Date().toISOString();

    await query(
      `INSERT INTO user_relationship_context (user_id, spiral_states, spiral_states_updated_at, created_at, updated_at)
       VALUES ($1, $2::jsonb, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         spiral_states = $2::jsonb,
         spiral_states_updated_at = $3,
         updated_at = $5`,
      [userId, JSON.stringify(normalized), now, now, now]
    );
  }

  /**
   * Update spiral priorities while preserving unlisted spirals.
   * This implements "preserve by default" semantics.
   *
   * Use this when UI sends partial updates (e.g., user reorders top 3).
   */
  static async setActiveSpiralPrioritiesPreserve(
    userId: string,
    updates: PriorityUpdate[]
  ): Promise<void> {
    const current = await this.getSpiralStates(userId);
    const merged = mergePreservingSpiralUpdates(current.spirals, updates);
    await this.updateSpiralStates(userId, merged);
  }

  /**
   * Replace active spiral set authoritatively.
   * Spirals not in the list are deactivated (activeNow=false, rank=999).
   *
   * Use this for Soul Mirror or other systems that provide complete active spiral lists.
   */
  static async replaceActiveSpirals(
    userId: string,
    newActiveKeys: string[]
  ): Promise<void> {
    const current = await this.getSpiralStates(userId);
    const replaced = replaceActiveSpiralSet(current.spirals, newActiveKeys);
    await this.updateSpiralStates(userId, replaced);
  }

  /**
   * Upsert a single spiral state (merge into existing).
   * Preserves other spirals, normalizes ranks.
   */
  static async upsertSpiral(
    userId: string,
    spiral: Partial<SpiralState> & { spiralKey: string }
  ): Promise<void> {
    const current = await this.getSpiralStates(userId);
    const map = new Map(current.spirals.map(s => [s.spiralKey, s]));

    const existing = map.get(spiral.spiralKey) ?? {
      spiralKey: spiral.spiralKey,
      element: null,
      phase: null,
      facet: null,
      arc: null,
      confidence: 0.5,
      source: "inferred" as const,
      updatedAt: new Date().toISOString(),
      activeNow: false,
      priorityRank: 999,
    };

    // Merge updates
    const updated: SpiralState = {
      ...existing,
      ...spiral,
      updatedAt: new Date().toISOString(),
    };

    map.set(spiral.spiralKey, updated);

    const normalized = normalizeActiveRanks(Array.from(map.values()));
    await this.updateSpiralStates(userId, normalized);
  }

  /**
   * Deactivate a spiral (set activeNow=false, rank=999)
   */
  static async deactivateSpiral(
    userId: string,
    spiralKey: string
  ): Promise<void> {
    await this.upsertSpiral(userId, {
      spiralKey,
      activeNow: false,
      priorityRank: 999,
    });
  }

  /**
   * Activate a spiral (set activeNow=true, assign next available rank)
   */
  static async activateSpiral(
    userId: string,
    spiralKey: string
  ): Promise<void> {
    const current = await this.getSpiralStates(userId);
    const activeCount = current.spirals.filter(s => s.activeNow).length;

    await this.upsertSpiral(userId, {
      spiralKey,
      activeNow: true,
      priorityRank: activeCount + 1, // Will be normalized
    });
  }

  /**
   * Get count of active spirals
   */
  static async getActiveCount(userId: string): Promise<number> {
    const state = await this.getSpiralStates(userId);
    return state.spirals.filter(s => s.activeNow).length;
  }

  /**
   * Get specific spiral by key
   */
  static async getSpiral(
    userId: string,
    spiralKey: string
  ): Promise<SpiralState | null> {
    const state = await this.getSpiralStates(userId);
    return state.spirals.find(s => s.spiralKey === spiralKey) || null;
  }
}
