/**
 * Consciousness Structure Assessment Framework
 *
 * Integrates Gebser consciousness structure detection with MAIA's existing
 * consciousness evolution tracking and oracle state machine systems.
 */

import {
  GebserStructure,
  ConsciousnessStructureProfile,
  gebserDetector
} from './gebser-structure-detector';
import { ConsciousnessProfile, ElementalPattern } from '@/lib/types/consciousness-evolution-types';
import { OracleStage } from '@/app/api/backend/src/core/types/oracleStateMachine';

// Enhanced oracle state that includes Gebser structure awareness
export interface GebserEnhancedOracleState {
  stage: OracleStage;
  accessibleStructures: GebserStructure[];
  integrationCapacity: number; // 0-1
  structureDevelopmentEdge: GebserStructure;
  perspectivalFlexibility: number; // 0-1
  readinessForNextStage: number; // 0-1
  supportNeeded: string[];
}

// Mapping between consciousness structures and elemental patterns
export const STRUCTURE_ELEMENT_BRIDGE: Record<GebserStructure, ElementalPattern> = {
  [GebserStructure.ARCHAIC]: {
    fire: 0.2,
    water: 0.3,
    earth: 0.9, // Primary - grounding, unity, embodiment
    air: 0.1,
    aether: 0.2
  },
  [GebserStructure.MAGICAL]: {
    fire: 0.4,
    water: 0.9, // Primary - flow, emotion, symbolic consciousness
    earth: 0.6,
    air: 0.3,
    aether: 0.4
  },
  [GebserStructure.MYTHICAL]: {
    fire: 0.9, // Primary - breakthrough, inspiration, heroic emergence
    water: 0.5,
    earth: 0.4,
    air: 0.6,
    aether: 0.3
  },
  [GebserStructure.MENTAL]: {
    fire: 0.6,
    water: 0.3,
    earth: 0.3,
    air: 0.9, // Primary - clarity, analysis, perspective-taking
    aether: 0.5
  },
  [GebserStructure.INTEGRAL]: {
    fire: 0.7,
    water: 0.7,
    earth: 0.7,
    air: 0.7,
    aether: 0.9 // Primary - integration, wholeness, unified field
  }
};

// Oracle stage to Gebser structure accessibility mapping
export const ORACLE_STAGE_STRUCTURE_ACCESS: Record<OracleStage, {
  accessible: GebserStructure[];
  developing: GebserStructure[];
  capacity: number;
}> = {
  'structured_guide': {
    accessible: [GebserStructure.ARCHAIC, GebserStructure.MAGICAL],
    developing: [GebserStructure.MYTHICAL],
    capacity: 0.3
  },
  'dialogical_companion': {
    accessible: [GebserStructure.MAGICAL, GebserStructure.MYTHICAL],
    developing: [GebserStructure.MENTAL],
    capacity: 0.5
  },
  'cocreative_partner': {
    accessible: [GebserStructure.MYTHICAL, GebserStructure.MENTAL],
    developing: [GebserStructure.INTEGRAL],
    capacity: 0.7
  },
  'transparent_prism': {
    accessible: [GebserStructure.MENTAL, GebserStructure.INTEGRAL],
    developing: [GebserStructure.INTEGRAL], // Deepening integral
    capacity: 0.9
  }
};

export class ConsciousnessStructureAssessment {

  /**
   * Comprehensive assessment that integrates Gebser detection with existing systems
   */
  public async assessUserConsciousness(
    userId: string,
    conversationHistory: Array<{ content: string; timestamp: string; role: 'user' | 'assistant' }>,
    currentOracleStage: OracleStage,
    existingProfile?: ConsciousnessProfile
  ): Promise<{
    gebserProfile: ConsciousnessStructureProfile;
    enhancedOracleState: GebserEnhancedOracleState;
    evolutionInsights: EvolutionInsights;
    recommendedInterventions: InterventionRecommendation[];
  }> {

    // Get Gebser structure analysis
    const gebserProfile = await gebserDetector.analyzeConversationHistory(
      userId,
      conversationHistory
    );

    // Enhance oracle state with Gebser awareness
    const enhancedOracleState = this.enhanceOracleStateWithGebser(
      currentOracleStage,
      gebserProfile
    );

    // Generate evolution insights
    const evolutionInsights = this.generateEvolutionInsights(
      gebserProfile,
      enhancedOracleState,
      existingProfile
    );

    // Recommend specific interventions
    const recommendedInterventions = this.recommendInterventions(
      gebserProfile,
      enhancedOracleState,
      evolutionInsights
    );

    return {
      gebserProfile,
      enhancedOracleState,
      evolutionInsights,
      recommendedInterventions
    };
  }

  /**
   * Convert Gebser structure profile to elemental pattern for integration
   */
  public convertToElementalPattern(gebserProfile: ConsciousnessStructureProfile): ElementalPattern {
    // Weighted average based on active structures
    const elementalSums = { fire: 0, water: 0, earth: 0, air: 0, aether: 0 };
    let totalWeight = 0;

    gebserProfile.activeStructures.forEach(structureAccess => {
      const weight = structureAccess.consistency * structureAccess.confidence;
      const pattern = STRUCTURE_ELEMENT_BRIDGE[structureAccess.structure];

      Object.keys(elementalSums).forEach(element => {
        elementalSums[element as keyof ElementalPattern] += pattern[element as keyof ElementalPattern] * weight;
      });

      totalWeight += weight;
    });

    // Normalize
    if (totalWeight > 0) {
      Object.keys(elementalSums).forEach(element => {
        elementalSums[element as keyof ElementalPattern] /= totalWeight;
      });
    }

    return elementalSums;
  }

  /**
   * Assess readiness for oracle stage advancement based on structure development
   */
  public assessStageReadiness(
    currentStage: OracleStage,
    gebserProfile: ConsciousnessStructureProfile
  ): { readiness: number; requirements: string[]; blockers: string[] } {

    const nextStage = this.getNextOracleStage(currentStage);
    if (!nextStage) {
      return { readiness: 1.0, requirements: [], blockers: [] };
    }

    const stageRequirements = ORACLE_STAGE_STRUCTURE_ACCESS[nextStage];
    const currentCapabilities = ORACLE_STAGE_STRUCTURE_ACCESS[currentStage];

    // Check if user has developed required structures
    const structureReadiness = stageRequirements.accessible
      .map(requiredStructure => {
        const userAccess = gebserProfile.activeStructures.find(
          s => s.structure === requiredStructure
        );
        return userAccess ? userAccess.consistency * userAccess.mastery : 0;
      });

    const avgStructureReadiness = structureReadiness.length > 0
      ? structureReadiness.reduce((a, b) => a + b, 0) / structureReadiness.length
      : 0;

    // Factor in integration capacity
    const integrationReadiness = gebserProfile.integrationLevel;
    const perspectivalReadiness = gebserProfile.perspectivalFlexibility;

    // Overall readiness calculation
    const readiness = (
      avgStructureReadiness * 0.5 +
      integrationReadiness * 0.3 +
      perspectivalReadiness * 0.2
    );

    // Identify specific requirements and blockers
    const requirements = this.identifyStageRequirements(currentStage, nextStage, gebserProfile);
    const blockers = this.identifyStageBlockers(currentStage, gebserProfile);

    return { readiness, requirements, blockers };
  }

  /**
   * Generate specific conversation guidance based on structure assessment
   */
  public generateConversationGuidance(
    gebserProfile: ConsciousnessStructureProfile,
    oracleState: GebserEnhancedOracleState
  ): ConversationGuidance {

    const guidance: ConversationGuidance = {
      primaryApproach: this.determinePrimaryApproach(gebserProfile),
      supportingPerspectives: this.identifySupportingPerspectives(gebserProfile),
      developmentInvitations: this.createDevelopmentInvitations(gebserProfile),
      integrationSupport: this.createIntegrationSupport(gebserProfile),
      transitionGuidance: this.createTransitionGuidance(gebserProfile)
    };

    return guidance;
  }

  // Private helper methods

  private enhanceOracleStateWithGebser(
    stage: OracleStage,
    gebserProfile: ConsciousnessStructureProfile
  ): GebserEnhancedOracleState {

    const stageCapabilities = ORACLE_STAGE_STRUCTURE_ACCESS[stage];

    return {
      stage,
      accessibleStructures: gebserProfile.activeStructures.map(s => s.structure),
      integrationCapacity: gebserProfile.integrationLevel,
      structureDevelopmentEdge: gebserProfile.developmentEdge.nextStructure,
      perspectivalFlexibility: gebserProfile.perspectivalFlexibility,
      readinessForNextStage: this.assessStageReadiness(stage, gebserProfile).readiness,
      supportNeeded: gebserProfile.transitionState?.supportNeeded ||
                    gebserProfile.developmentEdge.challenges
    };
  }

  private generateEvolutionInsights(
    gebserProfile: ConsciousnessStructureProfile,
    oracleState: GebserEnhancedOracleState,
    existingProfile?: ConsciousnessProfile
  ): EvolutionInsights {

    return {
      dominantStructureStability: this.assessStructureStability(gebserProfile),
      emergingCapabilities: this.identifyEmergingCapabilities(gebserProfile),
      integrationProgress: this.assessIntegrationProgress(gebserProfile, existingProfile),
      developmentVelocity: this.calculateDevelopmentVelocity(gebserProfile),
      potentialBreakthroughs: this.identifyPotentialBreakthroughs(gebserProfile, oracleState),
      stabilityIndicators: this.assessStabilityIndicators(gebserProfile)
    };
  }

  private recommendInterventions(
    gebserProfile: ConsciousnessStructureProfile,
    oracleState: GebserEnhancedOracleState,
    insights: EvolutionInsights
  ): InterventionRecommendation[] {

    const interventions: InterventionRecommendation[] = [];

    // Structure-specific interventions
    if (gebserProfile.transitionState) {
      interventions.push({
        type: 'transition-support',
        priority: 'high',
        description: `Support transition from ${gebserProfile.transitionState.from} to ${gebserProfile.transitionState.to}`,
        actions: gebserProfile.transitionState.supportNeeded,
        timeframe: 'immediate'
      });
    }

    // Integration support
    if (gebserProfile.integrationLevel < 0.6) {
      interventions.push({
        type: 'integration-enhancement',
        priority: 'medium',
        description: 'Strengthen structure integration capacity',
        actions: ['multi-perspectival exercises', 'structure bridging practices'],
        timeframe: 'ongoing'
      });
    }

    // Development edge support
    interventions.push({
      type: 'development-edge',
      priority: 'medium',
      description: `Prepare for ${gebserProfile.developmentEdge.nextStructure} structure development`,
      actions: gebserProfile.developmentEdge.readinessIndicators,
      timeframe: 'medium-term'
    });

    return interventions;
  }

  private getNextOracleStage(current: OracleStage): OracleStage | null {
    const stages: OracleStage[] = [
      'structured_guide',
      'dialogical_companion',
      'cocreative_partner',
      'transparent_prism'
    ];

    const currentIndex = stages.indexOf(current);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  }

  private identifyStageRequirements(
    current: OracleStage,
    next: OracleStage,
    profile: ConsciousnessStructureProfile
  ): string[] {
    // Implementation would analyze specific requirements for stage progression
    return ['Demonstrate consistent multi-perspectival awareness'];
  }

  private identifyStageBlockers(
    stage: OracleStage,
    profile: ConsciousnessStructureProfile
  ): string[] {
    const blockers: string[] = [];

    if (profile.transitionState?.resistance) {
      blockers.push(...profile.transitionState.resistance);
    }

    return blockers;
  }

  private determinePrimaryApproach(profile: ConsciousnessStructureProfile): ConversationApproach {
    return {
      structure: profile.dominantStructure,
      confidence: profile.activeStructures.find(s => s.structure === profile.dominantStructure)?.confidence || 0.5,
      tone: this.getStructureTone(profile.dominantStructure),
      emphasis: this.getStructureEmphasis(profile.dominantStructure)
    };
  }

  private identifySupportingPerspectives(profile: ConsciousnessStructureProfile): GebserStructure[] {
    return profile.activeStructures
      .filter(s => s.structure !== profile.dominantStructure && s.consistency > 0.3)
      .map(s => s.structure);
  }

  private createDevelopmentInvitations(profile: ConsciousnessStructureProfile): string[] {
    return [
      `Explore ${profile.developmentEdge.nextStructure} perspective development`,
      'Practice perspective-taking flexibility',
      'Develop integration awareness'
    ];
  }

  private createIntegrationSupport(profile: ConsciousnessStructureProfile): string[] {
    return [
      'Multi-structural awareness exercises',
      'Structure bridging practices',
      'Integration stability building'
    ];
  }

  private createTransitionGuidance(profile: ConsciousnessStructureProfile): string[] {
    if (!profile.transitionState) return [];

    return [
      'Gentle transition pacing',
      'Resistance acknowledgment',
      'Support structure activation'
    ];
  }

  private getStructureTone(structure: GebserStructure): string {
    const toneMap: Record<GebserStructure, string> = {
      [GebserStructure.ARCHAIC]: 'embodied, present, grounding',
      [GebserStructure.MAGICAL]: 'flowing, symbolic, intuitive',
      [GebserStructure.MYTHICAL]: 'inspiring, heroic, purposeful',
      [GebserStructure.MENTAL]: 'clear, analytical, multi-perspectival',
      [GebserStructure.INTEGRAL]: 'spacious, integrative, transparent'
    };
    return toneMap[structure];
  }

  private getStructureEmphasis(structure: GebserStructure): string {
    const emphasisMap: Record<GebserStructure, string> = {
      [GebserStructure.ARCHAIC]: 'embodied experience and energetic awareness',
      [GebserStructure.MAGICAL]: 'symbolic meaning and collective wisdom',
      [GebserStructure.MYTHICAL]: 'personal narrative and heroic development',
      [GebserStructure.MENTAL]: 'multiple perspectives and analytical clarity',
      [GebserStructure.INTEGRAL]: 'integration and present-moment awareness'
    };
    return emphasisMap[structure];
  }

  // Assessment helper methods (simplified for brevity)

  private assessStructureStability(profile: ConsciousnessStructureProfile): number {
    return profile.activeStructures.reduce((avg, s) => avg + s.consistency, 0) /
           Math.max(profile.activeStructures.length, 1);
  }

  private identifyEmergingCapabilities(profile: ConsciousnessStructureProfile): string[] {
    return [profile.developmentEdge.nextStructure + ' structure emergence'];
  }

  private assessIntegrationProgress(profile: ConsciousnessStructureProfile, existing?: ConsciousnessProfile): number {
    return profile.integrationLevel;
  }

  private calculateDevelopmentVelocity(profile: ConsciousnessStructureProfile): number {
    return profile.transitionState?.progress || 0.1;
  }

  private identifyPotentialBreakthroughs(profile: ConsciousnessStructureProfile, state: GebserEnhancedOracleState): string[] {
    return ['Integration breakthrough potential', 'Next structure emergence'];
  }

  private assessStabilityIndicators(profile: ConsciousnessStructureProfile): string[] {
    return ['Dominant structure consistency', 'Integration stability'];
  }
}

// Supporting type definitions

interface EvolutionInsights {
  dominantStructureStability: number;
  emergingCapabilities: string[];
  integrationProgress: number;
  developmentVelocity: number;
  potentialBreakthroughs: string[];
  stabilityIndicators: string[];
}

interface InterventionRecommendation {
  type: 'transition-support' | 'integration-enhancement' | 'development-edge';
  priority: 'high' | 'medium' | 'low';
  description: string;
  actions: string[];
  timeframe: 'immediate' | 'ongoing' | 'medium-term';
}

interface ConversationGuidance {
  primaryApproach: ConversationApproach;
  supportingPerspectives: GebserStructure[];
  developmentInvitations: string[];
  integrationSupport: string[];
  transitionGuidance: string[];
}

interface ConversationApproach {
  structure: GebserStructure;
  confidence: number;
  tone: string;
  emphasis: string;
}

export const consciousnessAssessment = new ConsciousnessStructureAssessment();

// Export function for backward compatibility
export async function assessConsciousnessStructure(
  userId: string,
  conversationHistory: Array<{ content: string; timestamp: string; role: 'user' | 'assistant' }>,
  currentOracleStage: OracleStage,
  existingProfile?: ConsciousnessProfile
) {
  return consciousnessAssessment.assessUserConsciousness(
    userId,
    conversationHistory,
    currentOracleStage,
    existingProfile
  );
}