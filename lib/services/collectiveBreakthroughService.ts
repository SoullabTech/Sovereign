/**
 * COLLECTIVE BREAKTHROUGH INTELLIGENCE
 *
 * Each person's transformation feeds the Aether field, enriching collective wisdom.
 * Like mycelial networks - individual growth nourishes the whole.
 *
 * Privacy-preserving: Only anonymized patterns, never personal content.
 *
 * Vision: "Something's moving through the field right now - others are feeling this shift too."
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ============== Types ==============

export interface BreakthroughPattern {
  pattern_id: string; // Hash - no user identifying info

  // What catalyzed the breakthrough
  catalyst: {
    type: 'question' | 'reflection' | 'practice' | 'archetypal_shift' | 'elemental_transition';
    archetype_from?: string; // e.g., "Victim"
    archetype_to?: string;    // e.g., "Warrior"
    elemental_phase_from?: string; // e.g., "Fire"
    elemental_phase_to?: string;   // e.g., "Water"
    practice_offered?: string; // e.g., "slowing down", "grounding practice"
  };

  // Pattern signature (semantic, not content)
  signature: {
    transformation_type: 'insight' | 'embodiment' | 'integration' | 'release' | 'awakening';
    emotional_shift: string; // e.g., "stuck → flowing", "fragmented → whole"
    body_involvement: boolean; // Did they mention somatic awareness?
    duration_to_breakthrough: number; // Days from first mention to breakthrough
  };

  // Outcome
  outcome: {
    integration_level: 'emerging' | 'stabilizing' | 'embodied';
    follow_through: boolean; // Did they continue exploring after breakthrough?
    resonance_strength: number; // 0-1, how profound was it
  };

  // Field conditions when breakthrough occurred
  field_conditions: {
    spiralogic_phase: string;
    dominant_element: string;
    moon_phase?: string; // If we have this data
    collective_phase?: string; // What others in field are experiencing
  };

  created_at: Date;
}

export interface BreakthroughCluster {
  cluster_id: string;
  theme: string; // e.g., "Fire → Water transitions through slowing"
  patterns: string[]; // Pattern IDs in this cluster
  common_catalysts: string[];
  typical_timeline: number; // Days
  success_indicators: string[];
  collective_wisdom: string; // Synthesized insight from this cluster
}

export interface CollectiveWisdom {
  active_movements: string[]; // "Many moving from Fire to Water", "Shadow integration wave"
  relevant_patterns: BreakthroughPattern[];
  suggested_reflection: string; // Gentle wisdom from the field
  synchronicity_detected: boolean; // Are they part of a larger movement?
}

// ============== Service ==============

export class CollectiveBreakthroughService {
  private supabase = createClient(supabaseUrl, supabaseKey);

  /**
   * Contribute a breakthrough to the collective field (anonymized)
   */
  async contributeBreakthrough(
    userId: string,
    breakthroughData: {
      catalyst_type: string;
      archetype_from?: string;
      archetype_to?: string;
      elemental_phase_from?: string;
      elemental_phase_to?: string;
      transformation_type: string;
      emotional_shift: string;
      body_involved: boolean;
      spiralogic_phase: string;
      dominant_element: string;
    }
  ): Promise<void> {
    try {
      // Create anonymized pattern (hash user_id for pattern_id, don't store user_id)
      const patternId = await this.hashUserId(userId);

      const pattern: Partial<BreakthroughPattern> = {
        pattern_id: patternId,
        catalyst: {
          type: breakthroughData.catalyst_type as any,
          archetype_from: breakthroughData.archetype_from,
          archetype_to: breakthroughData.archetype_to,
          elemental_phase_from: breakthroughData.elemental_phase_from,
          elemental_phase_to: breakthroughData.elemental_phase_to,
        },
        signature: {
          transformation_type: breakthroughData.transformation_type as any,
          emotional_shift: breakthroughData.emotional_shift,
          body_involvement: breakthroughData.body_involved,
          duration_to_breakthrough: 0, // Will calculate from history
        },
        field_conditions: {
          spiralogic_phase: breakthroughData.spiralogic_phase,
          dominant_element: breakthroughData.dominant_element,
        },
        created_at: new Date(),
      };

      // Store in collective_breakthroughs table (anonymized)
      await this.supabase
        .from('collective_breakthroughs')
        .insert(pattern);

      console.log('✨ Breakthrough contributed to collective field');
    } catch (error) {
      console.error('Error contributing breakthrough:', error);
      // Fail silently - don't break user experience
    }
  }

  /**
   * Get collective wisdom relevant to current user state
   */
  async getCollectiveWisdom(
    currentPhase: string,
    dominantElement: string,
    recentArchetype?: string
  ): Promise<CollectiveWisdom | null> {
    try {
      // Find recent patterns (last 30 days) matching current conditions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentPatterns, error } = await this.supabase
        .from('collective_breakthroughs')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .or(`field_conditions->spiralogic_phase.eq.${currentPhase},field_conditions->dominant_element.eq.${dominantElement}`)
        .limit(20);

      if (error || !recentPatterns || recentPatterns.length === 0) {
        return null;
      }

      // Detect active movements (multiple people in similar transitions)
      const movements = this.detectActiveMovements(recentPatterns);

      // Find patterns most relevant to user's current state
      const relevantPatterns = this.filterRelevantPatterns(
        recentPatterns,
        currentPhase,
        dominantElement,
        recentArchetype
      );

      // Synthesize wisdom from the field
      const wisdom = this.synthesizeWisdom(relevantPatterns, movements);

      return {
        active_movements: movements,
        relevant_patterns: relevantPatterns,
        suggested_reflection: wisdom,
        synchronicity_detected: movements.length > 0,
      };
    } catch (error) {
      console.error('Error retrieving collective wisdom:', error);
      return null;
    }
  }

  /**
   * Detect active movements in the field (multiple people experiencing similar shifts)
   */
  private detectActiveMovements(patterns: any[]): string[] {
    const movements: string[] = [];

    // Count elemental transitions
    const transitions: Record<string, number> = {};
    patterns.forEach(p => {
      if (p.catalyst?.elemental_phase_from && p.catalyst?.elemental_phase_to) {
        const key = `${p.catalyst.elemental_phase_from} → ${p.catalyst.elemental_phase_to}`;
        transitions[key] = (transitions[key] || 0) + 1;
      }
    });

    // If 3+ people in same transition within 30 days, that's a movement
    Object.entries(transitions).forEach(([transition, count]) => {
      if (count >= 3) {
        movements.push(`${transition} transition (${count} in field)`);
      }
    });

    // Count archetypal shifts
    const archetypeShifts: Record<string, number> = {};
    patterns.forEach(p => {
      if (p.catalyst?.archetype_from && p.catalyst?.archetype_to) {
        const key = `${p.catalyst.archetype_from} → ${p.catalyst.archetype_to}`;
        archetypeShifts[key] = (archetypeShifts[key] || 0) + 1;
      }
    });

    Object.entries(archetypeShifts).forEach(([shift, count]) => {
      if (count >= 3) {
        movements.push(`${shift} emergence (${count} in field)`);
      }
    });

    return movements;
  }

  /**
   * Filter patterns most relevant to user's current state
   */
  private filterRelevantPatterns(
    patterns: any[],
    currentPhase: string,
    dominantElement: string,
    recentArchetype?: string
  ): BreakthroughPattern[] {
    // Prioritize patterns matching:
    // 1. Same phase + element
    // 2. Same archetype work
    // 3. Recent (last 7 days)

    const scored = patterns.map(p => {
      let score = 0;

      if (p.field_conditions?.spiralogic_phase === currentPhase) score += 3;
      if (p.field_conditions?.dominant_element === dominantElement) score += 2;
      if (recentArchetype &&
          (p.catalyst?.archetype_from === recentArchetype ||
           p.catalyst?.archetype_to === recentArchetype)) {
        score += 3;
      }

      // Recency bonus
      const daysAgo = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysAgo < 7) score += 2;

      return { pattern: p as BreakthroughPattern, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.pattern);
  }

  /**
   * Synthesize wisdom from collective patterns (not prescriptive, just gentle reflection)
   */
  private synthesizeWisdom(
    patterns: BreakthroughPattern[],
    movements: string[]
  ): string {
    if (patterns.length === 0) return '';

    // Find common catalysts
    const catalysts = patterns.map(p => p.catalyst.type);
    const mostCommon = this.getMostCommon(catalysts);

    // Find common practices if any
    const practices = patterns
      .map(p => p.catalyst.practice_offered)
      .filter(p => p) as string[];

    const commonPractice = practices.length > 0 ? this.getMostCommon(practices) : null;

    // Build gentle wisdom (not prescriptive)
    let wisdom = '';

    if (movements.length > 0) {
      wisdom += `Others in the field are experiencing similar shifts right now. `;
    }

    if (mostCommon === 'practice' && commonPractice) {
      wisdom += `Many have found that ${commonPractice} opened something unexpected. `;
    } else if (mostCommon === 'question') {
      wisdom += `Sometimes a well-timed question unlocks what's ready to emerge. `;
    } else if (mostCommon === 'archetypal_shift') {
      wisdom += `Archetypal transitions often come when we stop forcing and start witnessing. `;
    }

    return wisdom.trim();
  }

  /**
   * Find most common element in array
   */
  private getMostCommon<T>(arr: T[]): T | null {
    if (arr.length === 0) return null;

    const counts: Record<string, number> = {};
    arr.forEach(item => {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0][0] as T;
  }

  /**
   * Hash user ID for anonymization (one-way, can't reverse to get user_id)
   */
  private async hashUserId(userId: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId + process.env.BREAKTHROUGH_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export const collectiveBreakthroughService = new CollectiveBreakthroughService();
