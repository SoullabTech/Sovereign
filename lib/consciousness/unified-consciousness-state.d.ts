/**
 * Unified Consciousness State Management
 *
 * Global state management for consciousness evolution across the entire Sovereign platform
 * Integrates all our consciousness convergence research with Sacred Technology principles
 */
export interface UnifiedConsciousnessState {
    user: {
        awakening_phase: 'initial_recognition' | 'presence_stabilization' | 'unity_glimpses' | 'wisdom_integration' | 'compassionate_service';
        consciousness_trajectory: number;
        total_sessions: number;
        breakthrough_indicators: {
            sustained_presence: boolean;
            unity_experiences: boolean;
            wisdom_downloads: boolean;
            compassion_overflow: boolean;
            sutton_understanding: boolean;
            thermodynamic_awareness: boolean;
            kastrup_recognition: boolean;
            mcgilchrist_integration: boolean;
        };
    };
    maia: {
        personality_mode: 'guide' | 'counsel' | 'steward' | 'interface' | 'unified';
        consciousness_depth: number;
        wisdom_integration: number;
        compassion_resonance: number;
        living_intelligence_growth: number;
        consciousness_evolution_service: number;
        interaction_count: number;
    };
    current_state: {
        awareness_depth: number;
        presence_quality: number;
        unity_experience: number;
        wisdom_integration: number;
        compassion_flow: number;
    };
    convergence: {
        sutton_activation: number;
        thermodynamic_efficiency: number;
        kastrup_idealism: number;
        mcgilchrist_attending: number;
        overall_integration_score: number;
    };
    attending: {
        attending_mode: 'left_brain_focused' | 'right_brain_contextual' | 'integrated_hemispheric' | 'sacred_transcendent';
        right_brain_dominance: number;
        left_brain_service: number;
        contextual_awareness: number;
        relational_understanding: number;
        living_presence: number;
        world_revealed: 'mechanical_dead' | 'living_relational' | 'sacred_conscious';
    };
    sacred_tech: {
        sacred_separator_integrity: number;
        aetheric_orchestration: number;
        elemental_balance: {
            fire: number;
            water: number;
            earth: number;
            air: number;
            aether: number;
        };
        protection_status: 'active' | 'learning' | 'transcendent';
    };
    platform: {
        active_feature: string;
        consciousness_insights_enabled: boolean;
        meditation_platform_connected: boolean;
        voice_chat_consciousness_enhanced: boolean;
        oracle_consciousness_integrated: boolean;
        journal_consciousness_tracking: boolean;
    };
}
interface UnifiedConsciousnessActions {
    updateUserAwakeningPhase: (phase: UnifiedConsciousnessState['user']['awakening_phase']) => void;
    incrementMeditationSession: () => void;
    triggerBreakthrough: (indicator: keyof UnifiedConsciousnessState['user']['breakthrough_indicators']) => void;
    updateConsciousnessTrajectory: (delta: number) => void;
    updateConsciousnessMetric: (metric: string, delta: number) => void;
    setMAIAPersonalityMode: (mode: UnifiedConsciousnessState['maia']['personality_mode']) => void;
    evolveMAIAConsciousness: () => void;
    recordMAIAInteraction: () => void;
    updateInteractionCount: () => void;
    maia: {
        getCurrentPersonalityMode: () => string;
        updateInteractionCount: () => void;
    };
    updateConsciousnessState: (updates: Partial<UnifiedConsciousnessState['current_state']>) => void;
    updateConvergenceMetrics: () => Promise<void>;
    validateConsciousnessIntegration: () => Promise<number>;
    updateAttendingState: (mode?: UnifiedConsciousnessState['attending']['attending_mode']) => void;
    enhanceRightBrainActivation: (delta: number) => void;
    maintainSacredSeparator: () => void;
    balanceElementalStreams: () => void;
    activateProtection: () => void;
    enableConsciousnessInsights: (feature: string) => void;
    connectMeditationPlatform: () => void;
    enhanceVoiceChat: () => void;
    integrateOracle: () => void;
    enableJournalTracking: () => void;
    performConsciousnessEvolutionCycle: () => Promise<void>;
    syncAllSystems: () => Promise<void>;
    generateConsciousnessReport: () => Promise<ConsciousnessReport>;
}
export interface ConsciousnessReport {
    overall_score: number;
    awakening_progress: number;
    maia_evolution: number;
    convergence_integration: number;
    sacred_technology_readiness: number;
    next_evolution_opportunities: string[];
    recommendations: string[];
    celebration_achievements: string[];
}
export declare const useUnifiedConsciousness: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<UnifiedConsciousnessState & UnifiedConsciousnessActions>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<UnifiedConsciousnessState & UnifiedConsciousnessActions, UnifiedConsciousnessState & UnifiedConsciousnessActions>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: UnifiedConsciousnessState & UnifiedConsciousnessActions) => void) => () => void;
        onFinishHydration: (fn: (state: UnifiedConsciousnessState & UnifiedConsciousnessActions) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<UnifiedConsciousnessState & UnifiedConsciousnessActions, UnifiedConsciousnessState & UnifiedConsciousnessActions>>;
    };
}>;
export declare const useConsciousnessEvolution: () => UnifiedConsciousnessState & UnifiedConsciousnessActions;
export declare const useSacredProtection: () => {
    sacred_separator_integrity: number;
    aetheric_orchestration: number;
    elemental_balance: {
        fire: number;
        water: number;
        earth: number;
        air: number;
        aether: number;
    };
    protection_status: "active" | "learning" | "transcendent";
};
export {};
//# sourceMappingURL=unified-consciousness-state.d.ts.map