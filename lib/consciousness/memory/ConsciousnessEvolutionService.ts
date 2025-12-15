/**
 * CONSCIOUSNESS EVOLUTION SERVICE
 *
 * Tracks 7-stage consciousness development journey
 * Part of MAIA's 5-Layer Memory Palace - Phase 3
 */

import { query, queryOne } from '../../database/postgres';

export interface StageProgress {
  stage: number;
  stageName: string;
  startDate: Date;
  masteryLevel: number; // 0-1
  stageQualities: string[];
}

export interface PresenceMetrics {
  bodyAwareness: number; // 0-1
  emotionalRange: number; // 0-1
  witnessCapacity: number; // 0-1
  presentMomentAccess: number; // 0-1
  depthOfListening: number; // 0-1
}

export interface SomaticAwarenessMetrics {
  bodyListening: number; // 0-1
  tensionRecognition: number; // 0-1
  somaticIntelligence: number; // 0-1
  embodiedPresence: number; // 0-1
}

export interface MorphicContributionMetrics {
  patternRecognition: number; // 0-1
  archetypeIntegration: number; // 0-1
  fieldContribution: number; // 0-1
  collectiveResonance: number; // 0-1
}

export interface WitnessCapacityMetrics {
  selfObservation: number; // 0-1
  nonReactivity: number; // 0-1
  metaCognition: number; // 0-1
  perspectiveTaking: number; // 0-1
}

export interface TrustEvolutionMetrics {
  bodyTrust: number; // 0-1
  processTrust: number; // 0-1
  fieldTrust: number; // 0-1
  selfTrust: number; // 0-1
}

export interface TransitionIndicator {
  type: string;
  description: string;
  readinessContribution: number;
}

export interface ConsciousnessEvolution {
  id?: number;
  userId: string;

  // Current stage (1-7)
  currentStage: number;
  currentStageName: string;

  // Stage progression
  stageProgression: StageProgress[];

  // Metrics
  presenceDepth: PresenceMetrics;
  somaticAwareness: SomaticAwarenessMetrics;
  morphicContribution: MorphicContributionMetrics;
  witnessCapacity: WitnessCapacityMetrics;
  trustEvolution: TrustEvolutionMetrics;

  // Development indicators
  breakthroughCount: number;
  integrationCyclesCompleted: number;
  wisdomEmbodimentLevel: number; // 0-1

  // Stage transition
  nextStageReadiness: number; // 0-1
  transitionBlockers: TransitionIndicator[];
  transitionOpportunities: TransitionIndicator[];

  createdAt?: Date;
  updatedAt?: Date;
}

const STAGE_NAMES = [
  'Awakening Awareness',           // Stage 1
  'Somatic Sensitivity',            // Stage 2
  'Pattern Recognition',            // Stage 3
  'Archetypal Integration',         // Stage 4
  'Morphic Participation',          // Stage 5
  'Wisdom Embodiment',              // Stage 6
  'Cosmic Consciousness'            // Stage 7
];

export class ConsciousnessEvolutionService {
  /**
   * Initialize consciousness evolution tracking for a user
   */
  async initializeEvolution(userId: string): Promise<ConsciousnessEvolution> {
    try {
      const result = await queryOne<any>(
        `INSERT INTO consciousness_evolution (
          user_id, current_stage, current_stage_name,
          presence_depth, somatic_awareness, morphic_contribution,
          witness_capacity, trust_evolution,
          breakthrough_count, integration_cycles_completed,
          wisdom_embodiment_level, next_stage_readiness
        ) VALUES (
          $1, 1, $2,
          $3, $4, $5, $6, $7,
          0, 0, 0.1, 0.0
        )
        ON CONFLICT (user_id) DO UPDATE SET
          updated_at = NOW()
        RETURNING *`,
        [
          userId,
          STAGE_NAMES[0],
          JSON.stringify(this.getDefaultPresenceMetrics()),
          JSON.stringify(this.getDefaultSomaticMetrics()),
          JSON.stringify(this.getDefaultMorphicMetrics()),
          JSON.stringify(this.getDefaultWitnessMetrics()),
          JSON.stringify(this.getDefaultTrustMetrics())
        ]
      );

      console.log('🌱 [Evolution] Initialized for user:', userId);
      return this.mapToEvolution(result);
    } catch (error) {
      console.error('Error initializing evolution:', error);
      throw error;
    }
  }

  /**
   * Get user's evolution status
   */
  async getEvolutionStatus(userId: string): Promise<ConsciousnessEvolution | null> {
    try {
      const result = await queryOne<any>(
        `SELECT * FROM consciousness_evolution WHERE user_id = $1`,
        [userId]
      );

      if (!result) {
        return await this.initializeEvolution(userId);
      }

      return this.mapToEvolution(result);
    } catch (error) {
      console.error('Error getting evolution status:', error);
      return null;
    }
  }

  /**
   * Update metrics based on session activity
   */
  async updateMetrics(params: {
    userId: string;
    presenceDepth?: Partial<PresenceMetrics>;
    somaticAwareness?: Partial<SomaticAwarenessMetrics>;
    morphicContribution?: Partial<MorphicContributionMetrics>;
    witnessCapacity?: Partial<WitnessCapacityMetrics>;
    trustEvolution?: Partial<TrustEvolutionMetrics>;
  }): Promise<void> {
    const updateFields: string[] = [];
    const updateValues: any[] = [params.userId];
    let paramIndex = 2;

    if (params.presenceDepth) {
      updateFields.push(`presence_depth = presence_depth || $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(params.presenceDepth));
      paramIndex++;
    }

    if (params.somaticAwareness) {
      updateFields.push(`somatic_awareness = somatic_awareness || $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(params.somaticAwareness));
      paramIndex++;
    }

    if (params.morphicContribution) {
      updateFields.push(`morphic_contribution = morphic_contribution || $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(params.morphicContribution));
      paramIndex++;
    }

    if (params.witnessCapacity) {
      updateFields.push(`witness_capacity = witness_capacity || $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(params.witnessCapacity));
      paramIndex++;
    }

    if (params.trustEvolution) {
      updateFields.push(`trust_evolution = trust_evolution || $${paramIndex}::jsonb`);
      updateValues.push(JSON.stringify(params.trustEvolution));
      paramIndex++;
    }

    if (updateFields.length === 0) return;

    try {
      await queryOne(
        `UPDATE consciousness_evolution
         SET ${updateFields.join(', ')}, updated_at = NOW()
         WHERE user_id = $1`,
        updateValues
      );

      console.log('📊 [Evolution] Metrics updated');
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  /**
   * Record a breakthrough
   */
  async recordBreakthrough(userId: string): Promise<void> {
    try {
      await queryOne(
        `UPDATE consciousness_evolution
         SET
           breakthrough_count = breakthrough_count + 1,
           wisdom_embodiment_level = LEAST(wisdom_embodiment_level + 0.05, 1.0),
           updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      console.log('💥 [Evolution] Breakthrough recorded');
    } catch (error) {
      console.error('Error recording breakthrough:', error);
    }
  }

  /**
   * Complete an integration cycle
   */
  async completeIntegrationCycle(userId: string): Promise<void> {
    try {
      await queryOne(
        `UPDATE consciousness_evolution
         SET
           integration_cycles_completed = integration_cycles_completed + 1,
           wisdom_embodiment_level = LEAST(wisdom_embodiment_level + 0.1, 1.0),
           updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      console.log('🔄 [Evolution] Integration cycle completed');
    } catch (error) {
      console.error('Error completing integration cycle:', error);
    }
  }

  /**
   * Advance to next stage
   */
  async advanceStage(userId: string): Promise<void> {
    try {
      const evolution = await this.getEvolutionStatus(userId);
      if (!evolution || evolution.currentStage >= 7) return;

      const nextStage = evolution.currentStage + 1;
      const nextStageName = STAGE_NAMES[nextStage - 1];

      const newStageProgress: StageProgress = {
        stage: nextStage,
        stageName: nextStageName,
        startDate: new Date(),
        masteryLevel: 0,
        stageQualities: []
      };

      await queryOne(
        `UPDATE consciousness_evolution
         SET
           current_stage = $2,
           current_stage_name = $3,
           stage_progression = stage_progression || $4::jsonb,
           next_stage_readiness = 0.0,
           updated_at = NOW()
         WHERE user_id = $1`,
        [userId, nextStage, nextStageName, JSON.stringify([newStageProgress])]
      );

      console.log(`🎯 [Evolution] Advanced to Stage ${nextStage}:`, nextStageName);
    } catch (error) {
      console.error('Error advancing stage:', error);
    }
  }

  /**
   * Calculate readiness for next stage
   */
  async calculateStageReadiness(userId: string): Promise<number> {
    const evolution = await this.getEvolutionStatus(userId);
    if (!evolution) return 0;

    const {
      presenceDepth,
      somaticAwareness,
      morphicContribution,
      witnessCapacity,
      trustEvolution,
      wisdomEmbodimentLevel
    } = evolution;

    // Average of all metrics
    const avgPresence = this.averageMetrics(presenceDepth);
    const avgSomatic = this.averageMetrics(somaticAwareness);
    const avgMorphic = this.averageMetrics(morphicContribution);
    const avgWitness = this.averageMetrics(witnessCapacity);
    const avgTrust = this.averageMetrics(trustEvolution);

    const overallReadiness = (
      avgPresence + avgSomatic + avgMorphic + avgWitness + avgTrust + wisdomEmbodimentLevel
    ) / 6;

    // Update database
    try {
      await queryOne(
        `UPDATE consciousness_evolution
         SET next_stage_readiness = $2, updated_at = NOW()
         WHERE user_id = $1`,
        [userId, overallReadiness]
      );
    } catch (error) {
      console.error('Error updating readiness:', error);
    }

    return overallReadiness;
  }

  /**
   * Helper: Average metrics object
   */
  private averageMetrics(metrics: any): number {
    const values = Object.values(metrics).filter(v => typeof v === 'number') as number[];
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Default metrics
   */
  private getDefaultPresenceMetrics(): PresenceMetrics {
    return {
      bodyAwareness: 0.1,
      emotionalRange: 0.1,
      witnessCapacity: 0.1,
      presentMomentAccess: 0.1,
      depthOfListening: 0.1
    };
  }

  private getDefaultSomaticMetrics(): SomaticAwarenessMetrics {
    return {
      bodyListening: 0.1,
      tensionRecognition: 0.1,
      somaticIntelligence: 0.1,
      embodiedPresence: 0.1
    };
  }

  private getDefaultMorphicMetrics(): MorphicContributionMetrics {
    return {
      patternRecognition: 0.1,
      archetypeIntegration: 0.1,
      fieldContribution: 0.1,
      collectiveResonance: 0.1
    };
  }

  private getDefaultWitnessMetrics(): WitnessCapacityMetrics {
    return {
      selfObservation: 0.1,
      nonReactivity: 0.1,
      metaCognition: 0.1,
      perspectiveTaking: 0.1
    };
  }

  private getDefaultTrustMetrics(): TrustEvolutionMetrics {
    return {
      bodyTrust: 0.1,
      processTrust: 0.1,
      fieldTrust: 0.1,
      selfTrust: 0.1
    };
  }

  /**
   * Map database row to ConsciousnessEvolution interface
   */
  private mapToEvolution(row: any): ConsciousnessEvolution {
    return {
      id: row.id,
      userId: row.user_id,
      currentStage: row.current_stage,
      currentStageName: row.current_stage_name,
      stageProgression: typeof row.stage_progression === 'string'
        ? JSON.parse(row.stage_progression)
        : row.stage_progression || [],
      presenceDepth: typeof row.presence_depth === 'string'
        ? JSON.parse(row.presence_depth)
        : row.presence_depth,
      somaticAwareness: typeof row.somatic_awareness === 'string'
        ? JSON.parse(row.somatic_awareness)
        : row.somatic_awareness,
      morphicContribution: typeof row.morphic_contribution === 'string'
        ? JSON.parse(row.morphic_contribution)
        : row.morphic_contribution,
      witnessCapacity: typeof row.witness_capacity === 'string'
        ? JSON.parse(row.witness_capacity)
        : row.witness_capacity,
      trustEvolution: typeof row.trust_evolution === 'string'
        ? JSON.parse(row.trust_evolution)
        : row.trust_evolution,
      breakthroughCount: row.breakthrough_count,
      integrationCyclesCompleted: row.integration_cycles_completed,
      wisdomEmbodimentLevel: parseFloat(row.wisdom_embodiment_level),
      nextStageReadiness: parseFloat(row.next_stage_readiness),
      transitionBlockers: typeof row.transition_blockers === 'string'
        ? JSON.parse(row.transition_blockers)
        : row.transition_blockers || [],
      transitionOpportunities: typeof row.transition_opportunities === 'string'
        ? JSON.parse(row.transition_opportunities)
        : row.transition_opportunities || [],
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    };
  }
}

// Singleton instance
export const consciousnessEvolutionService = new ConsciousnessEvolutionService();
export default consciousnessEvolutionService;
