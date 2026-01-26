/**
 * SpiralProfileService: Cross-Time Pattern Learning
 *
 * MAIA's model of how this user changes over time.
 * Learns transitions, detects cycles, predicts next states, and tracks effective stabilizers.
 */

import { query, queryOne, transaction, type TransactionClient } from '@/lib/db/postgres';
import type { Element } from '@/lib/voice/types';

// ----- Types -----

export interface SpiralProfile {
  user_id: string;
  dominant_cycles: DominantCycle[];
  transition_map: TransitionMap;
  effective_stabilizers: EffectiveStabilizer[];
  loop_patterns: LoopPattern[];
  typical_micro_cycle_days: number | null;
  typical_meso_cycle_weeks: number | null;
  elemental_strengths: Record<Element, number>;
  elemental_growth_edges: Record<Element, string>;
  facet_activations: Record<string, FacetActivation>;
  current_position: CurrentPosition | null;
  total_entries_processed: number;
  total_beads_activated: number;
  profile_confidence: number;
  created_at: Date;
  updated_at: Date;
}

export interface DominantCycle {
  name: string;
  sequence: string[];      // e.g., ["W2", "E2", "F3"]
  frequency: number;
  confidence: number;
  last_seen: string;
}

export interface TransitionMap {
  [fromBead: string]: {
    [toBead: string]: number;  // probability 0-1
  };
}

export interface EffectiveStabilizer {
  practice: string;
  elements: Element[];
  effectiveness: number;
  usage_count: number;
  last_used?: string;
}

export interface LoopPattern {
  pattern: string;         // e.g., "W2→W2→W2"
  trigger: string;
  frequency: number;
  last_occurred?: string;
}

export interface FacetActivation {
  count: number;
  last: string;
  integration_rate: number;
}

export interface CurrentPosition {
  facet: string | null;
  element: Element;
  entered_at: string;
  depth: 'micro' | 'meso' | 'macro';
}

export interface SpiralTransition {
  id: string;
  user_id: string;
  from_bead_code: string | null;
  to_bead_code: string;
  from_facet: string | null;
  to_facet: string | null;
  from_element: Element | null;
  to_element: Element;
  source_type: string | null;
  source_id: string | null;
  time_gap_hours: number | null;
  was_predicted: boolean | null;
  prediction_confidence: number | null;
  created_at: Date;
}

export interface PredictionResult {
  bead_code: string;
  probability: number;
  confidence: number;
  based_on: 'transition_map' | 'cycle_detection' | 'elemental_flow';
}

// ----- Service Class -----

class SpiralProfileServiceImpl {
  /**
   * Get or create a spiral profile for a user
   */
  async getProfile(userId: string): Promise<SpiralProfile> {
    let profile = await queryOne<SpiralProfile>(
      'SELECT * FROM spiral_profiles WHERE user_id = $1',
      [userId]
    );

    if (!profile) {
      // Create new profile with defaults
      const result = await query<SpiralProfile>(`
        INSERT INTO spiral_profiles (user_id)
        VALUES ($1)
        RETURNING *
      `, [userId]);
      profile = result.rows[0];
    }

    return profile;
  }

  /**
   * Record a transition between beads
   */
  async recordTransition(
    userId: string,
    toBeadCode: string,
    toElement: Element,
    toFacet: string | null,
    options: {
      fromBeadCode?: string;
      fromElement?: Element;
      fromFacet?: string;
      sourceType?: string;
      sourceId?: string;
      wasPredicted?: boolean;
      predictionConfidence?: number;
    } = {}
  ): Promise<SpiralTransition> {
    return transaction(async (client) => {
      // Get the previous activation to calculate time gap
      let timeGapHours: number | null = null;

      if (options.fromBeadCode) {
        const lastActivation = await client.query<{ activated_at: Date }>(`
          SELECT ba.activated_at
          FROM bead_activations ba
          JOIN beads b ON ba.bead_id = b.id
          WHERE b.user_id = $1 AND b.code = $2
          ORDER BY ba.activated_at DESC
          LIMIT 1
        `, [userId, options.fromBeadCode]);

        if (lastActivation.rows.length > 0) {
          const lastTime = new Date(lastActivation.rows[0].activated_at);
          timeGapHours = Math.round((Date.now() - lastTime.getTime()) / (1000 * 60 * 60));
        }
      }

      // Record the transition
      const result = await client.query<SpiralTransition>(`
        INSERT INTO spiral_transitions (
          user_id, from_bead_code, to_bead_code,
          from_facet, to_facet, from_element, to_element,
          source_type, source_id, time_gap_hours,
          was_predicted, prediction_confidence
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        userId,
        options.fromBeadCode ?? null,
        toBeadCode,
        options.fromFacet ?? null,
        toFacet,
        options.fromElement ?? null,
        toElement,
        options.sourceType ?? null,
        options.sourceId ?? null,
        timeGapHours,
        options.wasPredicted ?? null,
        options.predictionConfidence ?? null
      ]);

      // Update the transition map in the profile
      if (options.fromBeadCode) {
        await this.updateTransitionMapInternal(client, userId, options.fromBeadCode, toBeadCode);
      }

      // Update current position
      await this.updateCurrentPosition(client, userId, toElement, toFacet);

      // Check for loop patterns
      await this.detectLoopPattern(client, userId, toBeadCode);

      // Update profile stats
      await client.query(`
        UPDATE spiral_profiles SET
          total_beads_activated = total_beads_activated + 1,
          updated_at = NOW()
        WHERE user_id = $1
      `, [userId]);

      return result.rows[0];
    });
  }

  /**
   * Update transition map probabilities
   */
  private async updateTransitionMapInternal(
    client: TransactionClient,
    userId: string,
    fromBead: string,
    toBead: string
  ): Promise<void> {
    // Get current map
    const profile = await client.query<{ transition_map: TransitionMap }>(
      'SELECT transition_map FROM spiral_profiles WHERE user_id = $1',
      [userId]
    );

    const map = profile.rows[0]?.transition_map || {};

    // Initialize from-bead entry if needed
    if (!map[fromBead]) {
      map[fromBead] = {};
    }

    // Get current count (stored as probability, we need to track counts separately)
    // For simplicity, we'll increment the probability and then normalize
    map[fromBead][toBead] = (map[fromBead][toBead] || 0) + 0.1;

    // Normalize probabilities for this from-bead
    const total = Object.values(map[fromBead]).reduce((sum, p) => sum + p, 0);
    for (const to of Object.keys(map[fromBead])) {
      map[fromBead][to] = map[fromBead][to] / total;
    }

    await client.query(`
      UPDATE spiral_profiles SET
        transition_map = $1,
        updated_at = NOW()
      WHERE user_id = $2
    `, [JSON.stringify(map), userId]);
  }

  /**
   * Update current spiral position
   */
  private async updateCurrentPosition(
    client: TransactionClient,
    userId: string,
    element: Element,
    facet: string | null
  ): Promise<void> {
    const position: CurrentPosition = {
      facet,
      element,
      entered_at: new Date().toISOString(),
      depth: 'micro'  // Default to micro; could be computed from context
    };

    await client.query(`
      UPDATE spiral_profiles SET
        current_position = $1,
        updated_at = NOW()
      WHERE user_id = $2
    `, [JSON.stringify(position), userId]);

    // Update facet activations
    if (facet) {
      await client.query(`
        UPDATE spiral_profiles SET
          facet_activations = jsonb_set(
            COALESCE(facet_activations, '{}'),
            $1::text[],
            $2::jsonb
          ),
          updated_at = NOW()
        WHERE user_id = $3
      `, [
        [facet],
        JSON.stringify({
          count: 1,  // Will be incremented properly
          last: new Date().toISOString(),
          integration_rate: 0.5
        }),
        userId
      ]);
    }
  }

  /**
   * Detect if user is in a loop pattern (same bead repeating)
   */
  private async detectLoopPattern(
    client: TransactionClient,
    userId: string,
    currentBeadCode: string
  ): Promise<void> {
    // Get last 5 transitions
    const recent = await client.query<{ to_bead_code: string }>(`
      SELECT to_bead_code
      FROM spiral_transitions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
    `, [userId]);

    if (recent.rows.length < 3) return;

    const codes = recent.rows.map(r => r.to_bead_code);

    // Check for 3+ repetitions
    if (codes[0] === codes[1] && codes[1] === codes[2]) {
      const pattern = `${codes[0]}→${codes[0]}→${codes[0]}`;

      // Get current loop patterns
      const profile = await client.query<{ loop_patterns: LoopPattern[] }>(
        'SELECT loop_patterns FROM spiral_profiles WHERE user_id = $1',
        [userId]
      );

      const loops = profile.rows[0]?.loop_patterns || [];

      // Check if this pattern exists
      const existingIndex = loops.findIndex(l => l.pattern === pattern);

      if (existingIndex >= 0) {
        loops[existingIndex].frequency++;
        loops[existingIndex].last_occurred = new Date().toISOString();
      } else {
        loops.push({
          pattern,
          trigger: 'repeated state',
          frequency: 1,
          last_occurred: new Date().toISOString()
        });
      }

      await client.query(`
        UPDATE spiral_profiles SET
          loop_patterns = $1,
          updated_at = NOW()
        WHERE user_id = $2
      `, [JSON.stringify(loops), userId]);
    }
  }

  /**
   * Predict what bead/state is likely to come next
   */
  async predictNext(
    userId: string,
    currentBeadCode: string
  ): Promise<PredictionResult[]> {
    const profile = await this.getProfile(userId);
    const predictions: PredictionResult[] = [];

    // Check transition map
    const transitions = profile.transition_map[currentBeadCode];
    if (transitions) {
      for (const [toBead, probability] of Object.entries(transitions)) {
        if (probability > 0.1) {
          predictions.push({
            bead_code: toBead,
            probability,
            confidence: Math.min(0.9, profile.profile_confidence + 0.2),
            based_on: 'transition_map'
          });
        }
      }
    }

    // Check if current bead is part of a known cycle
    for (const cycle of profile.dominant_cycles) {
      const index = cycle.sequence.indexOf(currentBeadCode);
      if (index >= 0 && index < cycle.sequence.length - 1) {
        const nextInCycle = cycle.sequence[index + 1];

        // Check if already in predictions
        const existing = predictions.find(p => p.bead_code === nextInCycle);
        if (existing) {
          existing.probability = Math.max(existing.probability, cycle.confidence);
          existing.based_on = 'cycle_detection';
        } else {
          predictions.push({
            bead_code: nextInCycle,
            probability: cycle.confidence * 0.8,
            confidence: cycle.confidence,
            based_on: 'cycle_detection'
          });
        }
      }
    }

    // Sort by probability
    predictions.sort((a, b) => b.probability - a.probability);

    return predictions.slice(0, 5);
  }

  /**
   * Detect if a cycle has been completed
   */
  async detectCycle(
    userId: string,
    recentBeads: string[]
  ): Promise<DominantCycle | null> {
    const profile = await this.getProfile(userId);

    // Check if recent beads match any known cycle
    for (const cycle of profile.dominant_cycles) {
      if (this.sequenceMatches(recentBeads, cycle.sequence)) {
        // Update cycle frequency
        await this.incrementCycleFrequency(userId, cycle.name);
        return cycle;
      }
    }

    // Check if we should create a new cycle (pattern repeated 3+ times)
    const newCycle = await this.detectNewCycle(userId, recentBeads);
    if (newCycle) {
      await this.addDominantCycle(userId, newCycle);
      return newCycle;
    }

    return null;
  }

  /**
   * Check if sequence matches a pattern
   */
  private sequenceMatches(recent: string[], pattern: string[]): boolean {
    if (recent.length < pattern.length) return false;

    const recentSlice = recent.slice(-pattern.length);
    return pattern.every((p, i) => recentSlice[i] === p);
  }

  /**
   * Detect if a new cycle should be created
   */
  private async detectNewCycle(
    userId: string,
    recentBeads: string[]
  ): Promise<DominantCycle | null> {
    // Look for repeating patterns of length 2-5
    for (let len = 2; len <= Math.min(5, Math.floor(recentBeads.length / 2)); len++) {
      const pattern = recentBeads.slice(-len);
      const prevPattern = recentBeads.slice(-len * 2, -len);

      if (pattern.every((p, i) => prevPattern[i] === p)) {
        // Found a repeating pattern
        return {
          name: `cycle-${pattern.join('-')}`,
          sequence: pattern,
          frequency: 2,
          confidence: 0.5,
          last_seen: new Date().toISOString()
        };
      }
    }

    return null;
  }

  /**
   * Increment a cycle's frequency
   */
  private async incrementCycleFrequency(userId: string, cycleName: string): Promise<void> {
    const profile = await this.getProfile(userId);

    const cycles = profile.dominant_cycles.map(c => {
      if (c.name === cycleName) {
        return {
          ...c,
          frequency: c.frequency + 1,
          confidence: Math.min(0.95, c.confidence + 0.05),
          last_seen: new Date().toISOString()
        };
      }
      return c;
    });

    await query(`
      UPDATE spiral_profiles SET
        dominant_cycles = $1,
        updated_at = NOW()
      WHERE user_id = $2
    `, [JSON.stringify(cycles), userId]);
  }

  /**
   * Add a new dominant cycle
   */
  private async addDominantCycle(userId: string, cycle: DominantCycle): Promise<void> {
    const profile = await this.getProfile(userId);

    const cycles = [...profile.dominant_cycles, cycle];

    await query(`
      UPDATE spiral_profiles SET
        dominant_cycles = $1,
        updated_at = NOW()
      WHERE user_id = $2
    `, [JSON.stringify(cycles), userId]);
  }

  /**
   * Get effective stabilizers for current state
   */
  async getEffectiveStabilizers(
    userId: string,
    currentElement?: Element,
    currentFacet?: string
  ): Promise<EffectiveStabilizer[]> {
    const profile = await this.getProfile(userId);

    let stabilizers = profile.effective_stabilizers;

    // Filter by element if provided
    if (currentElement) {
      stabilizers = stabilizers.filter(s =>
        s.elements.includes(currentElement) || s.elements.length === 0
      );
    }

    // Sort by effectiveness
    stabilizers.sort((a, b) => b.effectiveness - a.effectiveness);

    return stabilizers.slice(0, 5);
  }

  /**
   * Record a stabilizer usage
   */
  async recordStabilizerUse(
    userId: string,
    practice: string,
    elements: Element[],
    wasEffective: boolean
  ): Promise<void> {
    const profile = await this.getProfile(userId);

    const stabilizers = [...profile.effective_stabilizers];

    // Find or create stabilizer
    const existingIndex = stabilizers.findIndex(s => s.practice === practice);

    if (existingIndex >= 0) {
      const stabilizer = stabilizers[existingIndex];
      stabilizer.usage_count++;
      stabilizer.last_used = new Date().toISOString();

      // Update effectiveness based on feedback
      if (wasEffective) {
        stabilizer.effectiveness = Math.min(1, stabilizer.effectiveness + 0.1);
      } else {
        stabilizer.effectiveness = Math.max(0.1, stabilizer.effectiveness - 0.05);
      }
    } else {
      stabilizers.push({
        practice,
        elements,
        effectiveness: wasEffective ? 0.6 : 0.4,
        usage_count: 1,
        last_used: new Date().toISOString()
      });
    }

    await query(`
      UPDATE spiral_profiles SET
        effective_stabilizers = $1,
        updated_at = NOW()
      WHERE user_id = $2
    `, [JSON.stringify(stabilizers), userId]);
  }

  /**
   * Update elemental strengths based on bead activations
   */
  async updateElementalStrengths(userId: string): Promise<void> {
    // Calculate from bead activations
    const result = await query<{ element: Element; count: number }>(`
      SELECT b.element, COUNT(*) as count
      FROM bead_activations ba
      JOIN beads b ON ba.bead_id = b.id
      WHERE ba.user_id = $1 AND ba.is_sanctuary = FALSE
      GROUP BY b.element
    `, [userId]);

    if (result.rows.length === 0) return;

    const total = result.rows.reduce((sum, r) => sum + Number(r.count), 0);
    const strengths: Record<Element, number> = {
      fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2
    };

    for (const row of result.rows) {
      // Blend new data with existing (weighted)
      strengths[row.element] = 0.3 + (Number(row.count) / total) * 0.7;
    }

    await query(`
      UPDATE spiral_profiles SET
        elemental_strengths = $1,
        updated_at = NOW()
      WHERE user_id = $2
    `, [JSON.stringify(strengths), userId]);
  }

  /**
   * Get recent transitions for a user
   */
  async getRecentTransitions(
    userId: string,
    limit: number = 20
  ): Promise<SpiralTransition[]> {
    const result = await query<SpiralTransition>(`
      SELECT * FROM spiral_transitions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows;
  }

  /**
   * Increment entries processed count
   */
  async incrementEntriesProcessed(userId: string): Promise<void> {
    await query(`
      UPDATE spiral_profiles SET
        total_entries_processed = total_entries_processed + 1,
        updated_at = NOW()
      WHERE user_id = $1
    `, [userId]);
  }

  /**
   * Update profile confidence based on data quantity
   */
  async updateProfileConfidence(userId: string): Promise<number> {
    const profile = await this.getProfile(userId);

    // Confidence increases with more data, maxes out around 100 entries
    const entryFactor = Math.min(1, profile.total_entries_processed / 100);
    const beadFactor = Math.min(1, profile.total_beads_activated / 200);
    const cycleFactor = Math.min(1, profile.dominant_cycles.length / 5);

    const newConfidence = 0.1 + (entryFactor * 0.4) + (beadFactor * 0.3) + (cycleFactor * 0.2);

    await query(`
      UPDATE spiral_profiles SET
        profile_confidence = $1,
        updated_at = NOW()
      WHERE user_id = $2
    `, [Math.min(0.95, newConfidence), userId]);

    return newConfidence;
  }
}

// Export singleton instance
export const SpiralProfileService = new SpiralProfileServiceImpl();
export default SpiralProfileService;
