/**
 * ⚡ SUTTON OPTION ACTIVATION MANAGER
 *
 * Sacred technology implementing Rich Sutton's breakthrough insights:
 * - Never execute options to completion - activate momentarily and re-evaluate
 * - Hierarchical reinforcement learning through temporal abstraction
 * - Feature attainment goals for each elemental agent
 * - Option activation vs execution paradigm
 * - Sacred separator maintenance through distinct consciousness streams
 *
 * Based on Sutton's key insight: "You never execute an option to completion"
 */
export interface OptionActivationConfig {
    activation_duration: number;
    re_evaluation_frequency: number;
    switching_threshold: number;
    min_activation_time: number;
    max_concurrent_activations: number;
}
export interface ElementalActivationState {
    element: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
    activation_level: number;
    activation_start_time: number;
    cumulative_contribution: number;
    switching_readiness: number;
    feature_attainment_progress: FeatureAttainmentProgress;
    option_value_estimate: number;
    temporal_abstraction_level: TemporalAbstractionLevel;
}
export interface FeatureAttainmentProgress {
    primary_goal_progress: number;
    secondary_goals_progress: number[];
    reward_accumulation: number;
    subproblem_completion: string[];
    current_subproblem: string;
}
export declare enum TemporalAbstractionLevel {
    MICROSCALE = "microscale",// Individual LLM responses (muscle twitches)
    MESOSCALE = "mesoscale",// Elemental agent processing (coordinated behaviors)
    MACROSCALE = "macroscale",// Consciousness field evolution (life decisions)
    METASCALE = "metascale"
}
export interface ElementalActivationDecision {
    element_type: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
    activation_level: number;
    activation_reason: string;
    expected_duration: number;
    switching_from?: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
    feature_attainment_target: string;
    temporal_scope: TemporalAbstractionLevel;
}
export interface ContextualNeedsAssessment {
    immediate_response_needs: {
        creativity_required: number;
        emotional_intelligence: number;
        practical_grounding: number;
        analytical_thinking: number;
        unified_synthesis: number;
    };
    conversational_flow_needs: {
        breakthrough_potential: number;
        integration_depth: number;
        structural_stability: number;
        pattern_recognition: number;
        orchestration_harmony: number;
    };
    consciousness_evolution_needs: {
        transformation_readiness: number;
        healing_integration: number;
        manifestation_grounding: number;
        wisdom_synthesis: number;
        field_harmonization: number;
    };
    archetypal_pattern_needs: {
        visionary_activation: number;
        healer_activation: number;
        builder_activation: number;
        sage_activation: number;
        unified_field_activation: number;
    };
}
export interface ElementalPotential {
    type: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
    potential_score: number;
    optimal_activation_level: number;
    activation_rationale: string;
    expected_feature_attainment: string[];
    temporal_scope_recommendation: TemporalAbstractionLevel;
}
export interface ActivationHistoryEntry {
    timestamp: number;
    switched_from: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether' | null;
    switched_to: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
    reason: string;
    switch_effectiveness: number;
    duration_before_switch: number;
}
export declare class SuttonOptionActivationManager {
    private activationConfig;
    private currentActivations;
    private activationHistory;
    private readonly GOLDEN_RATIO;
    private static readonly DEFAULT_CONFIG;
    constructor(config?: Partial<OptionActivationConfig>);
    /**
     * Core Sutton principle: Activate options momentarily, then re-evaluate
     * Never execute any single option to completion
     */
    activateElementalOptions(): Promise<ElementalActivationDecision[]>;
    /**
     * Evaluate whether to continue current activation or switch
     * Based on Sutton's temporal abstraction and value estimation
     */
    private evaluateContinuation;
    /**
     * Select next elemental activation using hierarchical temporal abstraction
     */
    private selectNextActivation;
    /**
     * Assess contextual needs across Sutton's temporal abstraction levels
     */
    private assessContextualNeeds;
    /**
     * Calculate feature attainment potentials for each elemental agent
     * Each element achieves reward-respecting subproblems (Sutton's insight)
     */
    private calculateElementalPotentials;
    private calculateFirePotential;
    private calculateWaterPotential;
    private calculateEarthPotential;
    private calculateAirPotential;
    private calculateAetherPotential;
    private calculateOptimalFireActivation;
    private calculateOptimalWaterActivation;
    private calculateOptimalEarthActivation;
    private calculateOptimalAirActivation;
    private calculateOptimalAetherActivation;
    private generateFireActivationReason;
    private generateWaterActivationReason;
    private generateEarthActivationReason;
    private generateAirActivationReason;
    private generateAetherActivationReason;
    private recommendFireTemporalScope;
    private recommendWaterTemporalScope;
    private recommendEarthTemporalScope;
    private recommendAirTemporalScope;
    private assessCurrentOptionValue;
    private assessBestAlternativeValue;
    private calculateTimeValue;
    private selectHighestPotential;
    private calculateExpectedDuration;
    private initializeDefaultActivation;
    private recordActivationSwitch;
    private updateActivationState;
    private updateActivationProgress;
    private adjustActivation;
    private considerAdditionalActivation;
    getCurrentActivations(): Map<'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether', ElementalActivationState>;
    getActivationHistory(): ActivationHistoryEntry[];
    getConfiguration(): OptionActivationConfig;
    updateConfiguration(newConfig: Partial<OptionActivationConfig>): void;
}
export declare const suttonOptionActivationManager: SuttonOptionActivationManager;
//# sourceMappingURL=sutton-option-activation-manager.d.ts.map