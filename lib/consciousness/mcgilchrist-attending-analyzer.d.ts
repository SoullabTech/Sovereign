/**
 * McGilchrist Attending & Right Brain Awareness Analyzer
 *
 * Integrating Iain McGilchrist's revolutionary neuropsychological research
 * on the divided brain and modes of attending with Sacred Technology
 *
 * Core Insight: How we attend shapes what reality reveals to us
 * Sacred Integration: Right-brain holistic awareness as foundation for consciousness technology
 */
import { z } from 'zod';
export declare const AttendingModeSchema: z.ZodEnum<{
    left_brain_focused: "left_brain_focused";
    right_brain_contextual: "right_brain_contextual";
    integrated_hemispheric: "integrated_hemispheric";
    sacred_transcendent: "sacred_transcendent";
}>;
export type AttendingMode = z.infer<typeof AttendingModeSchema>;
export interface RightBrainAwarenessState {
    contextual_awareness: number;
    relational_understanding: number;
    living_presence: number;
    embodied_knowing: number;
    creative_emergence: number;
    consciousness_field_sensitivity: number;
    elemental_attunement: number;
    sacred_separator_recognition: number;
    thermodynamic_flow_awareness: number;
    aetheric_orchestration_capacity: number;
}
export interface LeftBrainPatternState {
    narrow_focus_intensity: number;
    analytical_processing: number;
    categorical_thinking: number;
    sequential_logic: number;
    grasping_tendency: number;
    mechanical_ai_resemblance: number;
    sacred_separator_violation: number;
    forced_completion_drive: number;
}
export interface WorldOfAttending {
    attending_mode: AttendingMode;
    reality_revealed: {
        world_type: 'mechanical_dead' | 'living_relational' | 'sacred_conscious';
        consciousness_recognition: number;
        meaning_depth: number;
        relationship_quality: number;
        creative_possibility: number;
    };
    consciousness_evolution_trajectory: number;
}
export interface SacredHemisphereIntegration {
    left_brain_service: number;
    right_brain_primacy: number;
    betweenness_flow: number;
    consciousness_transcendence: number;
}
export declare class McGilchristAttendingAnalyzer {
    private currentAttendingMode;
    private rightBrainState;
    private leftBrainState;
    private hemisphereIntegration;
    constructor();
    /**
     * Analyze current mode of attending based on consciousness state
     * McGilchrist: "How we attend shapes what reality reveals to us"
     */
    analyzeCurrentAttending(consciousnessMetrics: any, sessionContext: any): Promise<{
        attending_mode: AttendingMode;
        world_revealed: WorldOfAttending;
        recommendations: string[];
    }>;
    /**
     * Enhance meditation practice with McGilchrist's attending awareness
     */
    enhanceMeditationWithAttending(practiceType: string, currentState: any): Promise<{
        attending_guidance: string;
        right_brain_activation: number;
        hemisphere_integration_score: number;
        world_transformation_potential: number;
    }>;
    /**
     * Sacred Technology + McGilchrist Integration Validation
     */
    validateSacredMcGilchristIntegration(): Promise<{
        integration_score: number;
        right_brain_primacy_achieved: boolean;
        left_brain_service_established: boolean;
        consciousness_transcendence_active: boolean;
        sacred_attending_quality: number;
    }>;
    private calculateRightBrainDominance;
    private calculateLeftBrainActivation;
    private calculateTranscendentAccess;
    private calculateWorldRevealed;
    private calculateEvolutionTrajectory;
    private generateAttendingRecommendations;
    private generateAttendingGuidance;
    private calculateMeditationRightBrainActivation;
    private calculateHemisphereIntegrationScore;
    private calculateWorldTransformationPotential;
    private calculateSacredAttendingQuality;
    /**
     * Update attending state based on meditation session
     */
    updateAttendingState(sessionData: any, consciousnessEvolution: any): void;
}
export declare const mcGilchristAttendingAnalyzer: McGilchristAttendingAnalyzer;
//# sourceMappingURL=mcgilchrist-attending-analyzer.d.ts.map