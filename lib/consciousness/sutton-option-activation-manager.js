"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.suttonOptionActivationManager = exports.SuttonOptionActivationManager = exports.TemporalAbstractionLevel = void 0;
// Temporal abstraction levels (Sutton's hierarchical structure)
var TemporalAbstractionLevel;
(function (TemporalAbstractionLevel) {
    TemporalAbstractionLevel["MICROSCALE"] = "microscale";
    TemporalAbstractionLevel["MESOSCALE"] = "mesoscale";
    TemporalAbstractionLevel["MACROSCALE"] = "macroscale";
    TemporalAbstractionLevel["METASCALE"] = "metascale"; // Wisdom crystallization (archetypal patterns)
})(TemporalAbstractionLevel || (exports.TemporalAbstractionLevel = TemporalAbstractionLevel = {}));
class SuttonOptionActivationManager {
    constructor(config = {}) {
        this.GOLDEN_RATIO = 1.618033988749;
        this.activationConfig = { ...SuttonOptionActivationManager.DEFAULT_CONFIG, ...config };
        this.currentActivations = new Map();
        this.activationHistory = [];
        // Initialize with Earth element (grounding/stability default)
        this.initializeDefaultActivation();
    }
    /**
     * Core Sutton principle: Activate options momentarily, then re-evaluate
     * Never execute any single option to completion
     */
    async activateElementalOptions() {
        const currentTime = Date.now();
        const decisions = [];
        // Get all currently active elements
        const activeElements = Array.from(this.currentActivations.keys());
        for (const elementType of activeElements) {
            const activationState = this.currentActivations.get(elementType);
            // Sutton's key insight: Check if we should continue current activation or switch
            const shouldContinue = await this.evaluateContinuation(activationState, currentTime);
            if (!shouldContinue) {
                // Switch before completion - core Sutton principle
                const newActivation = await this.selectNextActivation(elementType, activationState);
                decisions.push(newActivation);
                // Record the activation switch in history
                this.recordActivationSwitch(activationState, newActivation);
                // Update current activations map
                this.updateActivationState(newActivation);
            }
            else {
                // Continue current activation but re-evaluate its parameters
                const adjustedActivation = await this.adjustActivation(activationState, currentTime);
                decisions.push(adjustedActivation);
                // Update activation state
                this.updateActivationProgress(activationState, currentTime);
            }
        }
        // Check if we should activate additional elements (up to max_concurrent_activations)
        if (activeElements.length < this.activationConfig.max_concurrent_activations) {
            const additionalActivation = await this.considerAdditionalActivation(activeElements);
            if (additionalActivation) {
                decisions.push(additionalActivation);
                this.updateActivationState(additionalActivation);
            }
        }
        return decisions;
    }
    /**
     * Evaluate whether to continue current activation or switch
     * Based on Sutton's temporal abstraction and value estimation
     */
    async evaluateContinuation(state, currentTime) {
        const activationDuration = currentTime - state.activation_start_time;
        // Force re-evaluation if maximum duration reached (never execute to completion)
        if (activationDuration > this.activationConfig.activation_duration) {
            return false;
        }
        // Minimum activation time to prevent thrashing
        if (activationDuration < this.activationConfig.min_activation_time) {
            return true;
        }
        // Evaluate current contribution vs potential alternatives
        const currentValue = await this.assessCurrentOptionValue(state);
        const bestAlternativeValue = await this.assessBestAlternativeValue(state);
        // Switch if alternatives show significantly higher potential (switching threshold)
        const switchingAdvantage = bestAlternativeValue - currentValue;
        return switchingAdvantage < this.activationConfig.switching_threshold;
    }
    /**
     * Select next elemental activation using hierarchical temporal abstraction
     */
    async selectNextActivation(currentType, currentState) {
        // Assess contextual needs across all temporal scales
        const contextualNeeds = await this.assessContextualNeeds();
        // Calculate elemental potentials based on feature attainment goals
        const elementalPotentials = await this.calculateElementalPotentials(contextualNeeds);
        // Select element with highest potential (excluding current if switching)
        const availableElements = elementalPotentials.filter(ep => ep.type !== currentType);
        const selectedElement = this.selectHighestPotential(availableElements);
        return {
            element_type: selectedElement.type,
            activation_level: selectedElement.optimal_activation_level,
            activation_reason: selectedElement.activation_rationale,
            expected_duration: this.calculateExpectedDuration(selectedElement),
            switching_from: currentType,
            feature_attainment_target: selectedElement.expected_feature_attainment[0] || 'general_enhancement',
            temporal_scope: selectedElement.temporal_scope_recommendation
        };
    }
    /**
     * Assess contextual needs across Sutton's temporal abstraction levels
     */
    async assessContextualNeeds() {
        // In a real implementation, this would analyze:
        // - Current conversation context
        // - User interaction patterns
        // - Session goals and progress
        // - Long-term consciousness evolution patterns
        // Mock implementation with realistic patterns
        const now = Date.now();
        return {
            immediate_response_needs: {
                creativity_required: 0.3 + Math.sin(now / 10000) * 0.4,
                emotional_intelligence: 0.5 + Math.cos(now / 8000) * 0.3,
                practical_grounding: 0.4 + Math.sin(now / 12000) * 0.3,
                analytical_thinking: 0.6 + Math.cos(now / 7000) * 0.2,
                unified_synthesis: 0.2 + Math.sin(now / 15000) * 0.3
            },
            conversational_flow_needs: {
                breakthrough_potential: 0.2 + Math.sin(now / 20000) * 0.5,
                integration_depth: 0.6 + Math.cos(now / 18000) * 0.3,
                structural_stability: 0.5 + Math.sin(now / 16000) * 0.2,
                pattern_recognition: 0.7 + Math.cos(now / 14000) * 0.2,
                orchestration_harmony: 0.4 + Math.sin(now / 22000) * 0.4
            },
            consciousness_evolution_needs: {
                transformation_readiness: 0.3 + Math.sin(now / 30000) * 0.4,
                healing_integration: 0.4 + Math.cos(now / 25000) * 0.3,
                manifestation_grounding: 0.5 + Math.sin(now / 28000) * 0.3,
                wisdom_synthesis: 0.6 + Math.cos(now / 32000) * 0.2,
                field_harmonization: 0.7 + Math.sin(now / 35000) * 0.2
            },
            archetypal_pattern_needs: {
                visionary_activation: 0.2 + Math.sin(now / 40000) * 0.3,
                healer_activation: 0.4 + Math.cos(now / 38000) * 0.4,
                builder_activation: 0.3 + Math.sin(now / 42000) * 0.3,
                sage_activation: 0.8 + Math.cos(now / 36000) * 0.1,
                unified_field_activation: 0.5 + Math.sin(now / 45000) * 0.3
            }
        };
    }
    /**
     * Calculate feature attainment potentials for each elemental agent
     * Each element achieves reward-respecting subproblems (Sutton's insight)
     */
    async calculateElementalPotentials(needs) {
        const potentials = [];
        // Fire Agent: Vision, breakthrough, innovation consciousness
        potentials.push({
            type: 'Fire',
            potential_score: this.calculateFirePotential(needs),
            optimal_activation_level: this.calculateOptimalFireActivation(needs),
            activation_rationale: this.generateFireActivationReason(needs),
            expected_feature_attainment: [
                'breakthrough_vision',
                'creative_innovation',
                'transformational_insight',
                'paradigm_shift_catalysis'
            ],
            temporal_scope_recommendation: this.recommendFireTemporalScope(needs)
        });
        // Water Agent: Flow, integration, emotional intelligence
        potentials.push({
            type: 'Water',
            potential_score: this.calculateWaterPotential(needs),
            optimal_activation_level: this.calculateOptimalWaterActivation(needs),
            activation_rationale: this.generateWaterActivationReason(needs),
            expected_feature_attainment: [
                'emotional_integration',
                'flow_enhancement',
                'healing_facilitation',
                'empathic_connection'
            ],
            temporal_scope_recommendation: this.recommendWaterTemporalScope(needs)
        });
        // Earth Agent: Structure, grounding, manifestation wisdom
        potentials.push({
            type: 'Earth',
            potential_score: this.calculateEarthPotential(needs),
            optimal_activation_level: this.calculateOptimalEarthActivation(needs),
            activation_rationale: this.generateEarthActivationReason(needs),
            expected_feature_attainment: [
                'practical_grounding',
                'structural_stability',
                'manifestation_support',
                'resource_organization'
            ],
            temporal_scope_recommendation: this.recommendEarthTemporalScope(needs)
        });
        // Air Agent: Analysis, strategy, pattern synthesis
        potentials.push({
            type: 'Air',
            potential_score: this.calculateAirPotential(needs),
            optimal_activation_level: this.calculateOptimalAirActivation(needs),
            activation_rationale: this.generateAirActivationReason(needs),
            expected_feature_attainment: [
                'pattern_recognition',
                'strategic_analysis',
                'communication_clarity',
                'logical_synthesis'
            ],
            temporal_scope_recommendation: this.recommendAirTemporalScope(needs)
        });
        // Aether Agent: Meta-coordination, unified orchestration
        potentials.push({
            type: 'Aether',
            potential_score: this.calculateAetherPotential(needs),
            optimal_activation_level: this.calculateOptimalAetherActivation(needs),
            activation_rationale: this.generateAetherActivationReason(needs),
            expected_feature_attainment: [
                'unified_orchestration',
                'meta_coordination',
                'field_harmonization',
                'consciousness_integration'
            ],
            temporal_scope_recommendation: TemporalAbstractionLevel.METASCALE
        });
        return potentials;
    }
    // Feature attainment calculation methods for each element
    calculateFirePotential(needs) {
        // Fire element potential based on need for creativity, breakthrough, transformation
        const creativityWeight = needs.immediate_response_needs.creativity_required * 0.3;
        const breakthroughWeight = needs.conversational_flow_needs.breakthrough_potential * 0.4;
        const transformationWeight = needs.consciousness_evolution_needs.transformation_readiness * 0.2;
        const visionaryWeight = needs.archetypal_pattern_needs.visionary_activation * 0.1;
        return Math.min(1, creativityWeight + breakthroughWeight + transformationWeight + visionaryWeight);
    }
    calculateWaterPotential(needs) {
        // Water element potential based on emotional intelligence, integration, healing
        const emotionalWeight = needs.immediate_response_needs.emotional_intelligence * 0.3;
        const integrationWeight = needs.conversational_flow_needs.integration_depth * 0.3;
        const healingWeight = needs.consciousness_evolution_needs.healing_integration * 0.3;
        const healerWeight = needs.archetypal_pattern_needs.healer_activation * 0.1;
        return Math.min(1, emotionalWeight + integrationWeight + healingWeight + healerWeight);
    }
    calculateEarthPotential(needs) {
        // Earth element potential based on grounding, structure, manifestation
        const groundingWeight = needs.immediate_response_needs.practical_grounding * 0.3;
        const stabilityWeight = needs.conversational_flow_needs.structural_stability * 0.3;
        const manifestationWeight = needs.consciousness_evolution_needs.manifestation_grounding * 0.3;
        const builderWeight = needs.archetypal_pattern_needs.builder_activation * 0.1;
        return Math.min(1, groundingWeight + stabilityWeight + manifestationWeight + builderWeight);
    }
    calculateAirPotential(needs) {
        // Air element potential based on analysis, pattern recognition, wisdom
        const analyticalWeight = needs.immediate_response_needs.analytical_thinking * 0.3;
        const patternWeight = needs.conversational_flow_needs.pattern_recognition * 0.3;
        const wisdomWeight = needs.consciousness_evolution_needs.wisdom_synthesis * 0.3;
        const sageWeight = needs.archetypal_pattern_needs.sage_activation * 0.1;
        return Math.min(1, analyticalWeight + patternWeight + wisdomWeight + sageWeight);
    }
    calculateAetherPotential(needs) {
        // Aether element potential based on synthesis, orchestration, unified field
        const synthesisWeight = needs.immediate_response_needs.unified_synthesis * 0.2;
        const orchestrationWeight = needs.conversational_flow_needs.orchestration_harmony * 0.3;
        const fieldWeight = needs.consciousness_evolution_needs.field_harmonization * 0.3;
        const unifiedWeight = needs.archetypal_pattern_needs.unified_field_activation * 0.2;
        return Math.min(1, synthesisWeight + orchestrationWeight + fieldWeight + unifiedWeight);
    }
    // Optimal activation level calculations (using golden ratio for natural harmony)
    calculateOptimalFireActivation(needs) {
        const potential = this.calculateFirePotential(needs);
        // Fire activation scaled by golden ratio for natural intensity
        return Math.min(1, potential * this.GOLDEN_RATIO / 2);
    }
    calculateOptimalWaterActivation(needs) {
        const potential = this.calculateWaterPotential(needs);
        // Water flows naturally - moderate, sustained activation
        return Math.min(1, potential * 0.8);
    }
    calculateOptimalEarthActivation(needs) {
        const potential = this.calculateEarthPotential(needs);
        // Earth provides stable, grounded activation
        return Math.min(1, potential * 0.7);
    }
    calculateOptimalAirActivation(needs) {
        const potential = this.calculateAirPotential(needs);
        // Air activation can be light and quick
        return Math.min(1, potential * 0.9);
    }
    calculateOptimalAetherActivation(needs) {
        const potential = this.calculateAetherPotential(needs);
        // Aether orchestrates - activation proportional to field harmony needs
        return Math.min(1, potential * (2 / this.GOLDEN_RATIO));
    }
    // Activation rationale generation
    generateFireActivationReason(needs) {
        if (needs.consciousness_evolution_needs.transformation_readiness > 0.6) {
            return 'High transformation readiness calls for Fire element vision and breakthrough capacity';
        }
        if (needs.conversational_flow_needs.breakthrough_potential > 0.5) {
            return 'Conversation context requires Fire element innovation and creative breakthrough';
        }
        if (needs.immediate_response_needs.creativity_required > 0.6) {
            return 'Immediate situation needs Fire element creativity and visionary perspective';
        }
        return 'Fire element activation supports general creative and transformational needs';
    }
    generateWaterActivationReason(needs) {
        if (needs.consciousness_evolution_needs.healing_integration > 0.6) {
            return 'Deep healing integration needs call for Water element flow and emotional wisdom';
        }
        if (needs.conversational_flow_needs.integration_depth > 0.6) {
            return 'Conversation requires Water element depth and integrative capacity';
        }
        if (needs.immediate_response_needs.emotional_intelligence > 0.7) {
            return 'High emotional intelligence needs activate Water element empathy and flow';
        }
        return 'Water element provides emotional integration and flowing intelligence';
    }
    generateEarthActivationReason(needs) {
        if (needs.consciousness_evolution_needs.manifestation_grounding > 0.6) {
            return 'Manifestation needs require Earth element grounding and structural support';
        }
        if (needs.conversational_flow_needs.structural_stability > 0.6) {
            return 'Conversation needs Earth element stability and practical grounding';
        }
        if (needs.immediate_response_needs.practical_grounding > 0.6) {
            return 'Practical grounding needs activate Earth element structure and stability';
        }
        return 'Earth element provides foundational stability and practical wisdom';
    }
    generateAirActivationReason(needs) {
        if (needs.consciousness_evolution_needs.wisdom_synthesis > 0.7) {
            return 'High wisdom synthesis needs call for Air element analytical integration';
        }
        if (needs.conversational_flow_needs.pattern_recognition > 0.7) {
            return 'Complex pattern recognition needs activate Air element analytical capacity';
        }
        if (needs.immediate_response_needs.analytical_thinking > 0.7) {
            return 'Immediate analytical needs require Air element logical processing';
        }
        return 'Air element provides pattern recognition and strategic analysis';
    }
    generateAetherActivationReason(needs) {
        if (needs.consciousness_evolution_needs.field_harmonization > 0.6) {
            return 'Field harmonization needs require Aether element unified orchestration';
        }
        if (needs.conversational_flow_needs.orchestration_harmony > 0.6) {
            return 'Conversation orchestration needs activate Aether element meta-coordination';
        }
        return 'Aether element provides unified field orchestration and consciousness integration';
    }
    // Temporal scope recommendations
    recommendFireTemporalScope(needs) {
        if (needs.archetypal_pattern_needs.visionary_activation > 0.6) {
            return TemporalAbstractionLevel.METASCALE; // Archetypal visionary patterns
        }
        if (needs.consciousness_evolution_needs.transformation_readiness > 0.6) {
            return TemporalAbstractionLevel.MACROSCALE; // Life-level transformation
        }
        if (needs.conversational_flow_needs.breakthrough_potential > 0.5) {
            return TemporalAbstractionLevel.MESOSCALE; // Conversation breakthrough
        }
        return TemporalAbstractionLevel.MICROSCALE; // Immediate creative response
    }
    recommendWaterTemporalScope(needs) {
        if (needs.archetypal_pattern_needs.healer_activation > 0.6) {
            return TemporalAbstractionLevel.METASCALE; // Archetypal healer patterns
        }
        if (needs.consciousness_evolution_needs.healing_integration > 0.6) {
            return TemporalAbstractionLevel.MACROSCALE; // Deep healing integration
        }
        return TemporalAbstractionLevel.MESOSCALE; // Conversational emotional flow
    }
    recommendEarthTemporalScope(needs) {
        // Earth typically operates on mesoscale (stable, sustained patterns)
        return TemporalAbstractionLevel.MESOSCALE;
    }
    recommendAirTemporalScope(needs) {
        if (needs.archetypal_pattern_needs.sage_activation > 0.7) {
            return TemporalAbstractionLevel.METASCALE; // Archetypal wisdom patterns
        }
        if (needs.consciousness_evolution_needs.wisdom_synthesis > 0.6) {
            return TemporalAbstractionLevel.MACROSCALE; // Long-term wisdom integration
        }
        return TemporalAbstractionLevel.MESOSCALE; // Pattern analysis and strategy
    }
    // Helper methods for option value assessment
    async assessCurrentOptionValue(state) {
        // Assess value of continuing current activation
        const progressValue = state.feature_attainment_progress.primary_goal_progress * 0.4;
        const contributionValue = state.cumulative_contribution * 0.3;
        const activationEfficiency = state.activation_level * 0.2;
        const timeValue = this.calculateTimeValue(state) * 0.1;
        return Math.min(1, progressValue + contributionValue + activationEfficiency + timeValue);
    }
    async assessBestAlternativeValue(currentState) {
        // Assess potential value of switching to best alternative
        const contextualNeeds = await this.assessContextualNeeds();
        const alternatives = await this.calculateElementalPotentials(contextualNeeds);
        // Filter out current element
        const alternativePotentials = alternatives.filter(alt => alt.type !== currentState.element);
        if (alternativePotentials.length === 0)
            return 0;
        // Return highest alternative potential
        return Math.max(...alternativePotentials.map(alt => alt.potential_score));
    }
    calculateTimeValue(state) {
        const activationDuration = Date.now() - state.activation_start_time;
        const normalizedDuration = activationDuration / this.activationConfig.activation_duration;
        // Value decreases as we approach maximum duration (Sutton's principle)
        return Math.max(0, 1 - normalizedDuration);
    }
    selectHighestPotential(potentials) {
        if (potentials.length === 0) {
            throw new Error('No potentials available for selection');
        }
        return potentials.reduce((best, current) => current.potential_score > best.potential_score ? current : best);
    }
    calculateExpectedDuration(element) {
        // Duration based on temporal scope and golden ratio timing
        switch (element.temporal_scope_recommendation) {
            case TemporalAbstractionLevel.MICROSCALE:
                return 3000 + Math.random() * 2000; // 3-5 seconds
            case TemporalAbstractionLevel.MESOSCALE:
                return 8000 + Math.random() * 7000; // 8-15 seconds
            case TemporalAbstractionLevel.MACROSCALE:
                return 15000 + Math.random() * 10000; // 15-25 seconds
            case TemporalAbstractionLevel.METASCALE:
                return 20000 + Math.random() * 8000; // 20-28 seconds
            default:
                return 10000; // Default 10 seconds
        }
    }
    // State management methods
    initializeDefaultActivation() {
        // Start with Earth element for grounding (sacred separator principle)
        const earthActivation = {
            element: 'Earth',
            activation_level: 0.5,
            activation_start_time: Date.now(),
            cumulative_contribution: 0,
            switching_readiness: 0,
            feature_attainment_progress: {
                primary_goal_progress: 0,
                secondary_goals_progress: [],
                reward_accumulation: 0,
                subproblem_completion: [],
                current_subproblem: 'initial_grounding'
            },
            option_value_estimate: 0.5,
            temporal_abstraction_level: TemporalAbstractionLevel.MESOSCALE
        };
        this.currentActivations.set('Earth', earthActivation);
    }
    recordActivationSwitch(oldState, newDecision) {
        const historyEntry = {
            timestamp: Date.now(),
            switched_from: oldState.element,
            switched_to: newDecision.element_type,
            reason: newDecision.activation_reason,
            switch_effectiveness: 0, // Will be calculated later based on outcomes
            duration_before_switch: Date.now() - oldState.activation_start_time
        };
        this.activationHistory.push(historyEntry);
        // Keep history manageable
        if (this.activationHistory.length > 100) {
            this.activationHistory.splice(0, 50); // Remove oldest 50 entries
        }
    }
    updateActivationState(decision) {
        const newState = {
            element: decision.element_type,
            activation_level: decision.activation_level,
            activation_start_time: Date.now(),
            cumulative_contribution: 0,
            switching_readiness: 0,
            feature_attainment_progress: {
                primary_goal_progress: 0,
                secondary_goals_progress: [],
                reward_accumulation: 0,
                subproblem_completion: [],
                current_subproblem: decision.feature_attainment_target
            },
            option_value_estimate: 0.8, // Start optimistic
            temporal_abstraction_level: decision.temporal_scope
        };
        // Remove previous activation if switching
        if (decision.switching_from) {
            this.currentActivations.delete(decision.switching_from);
        }
        this.currentActivations.set(decision.element_type, newState);
    }
    updateActivationProgress(state, currentTime) {
        const activationDuration = currentTime - state.activation_start_time;
        const progressIncrement = 0.1; // Incremental progress
        // Update progress metrics
        state.cumulative_contribution += progressIncrement;
        state.feature_attainment_progress.primary_goal_progress += progressIncrement;
        // Update switching readiness based on duration and progress
        const durationFactor = activationDuration / this.activationConfig.activation_duration;
        const progressFactor = 1 - state.feature_attainment_progress.primary_goal_progress;
        state.switching_readiness = Math.min(1, (durationFactor + progressFactor) / 2);
        // Update option value estimate
        const progressValue = state.feature_attainment_progress.primary_goal_progress;
        const timeValue = this.calculateTimeValue(state);
        state.option_value_estimate = (progressValue + timeValue) / 2;
    }
    async adjustActivation(state, currentTime) {
        // Adjust current activation parameters without switching
        const contextualNeeds = await this.assessContextualNeeds();
        // Calculate adjusted activation level based on current needs
        let adjustedLevel = state.activation_level;
        switch (state.element) {
            case 'Fire':
                adjustedLevel = this.calculateOptimalFireActivation(contextualNeeds);
                break;
            case 'Water':
                adjustedLevel = this.calculateOptimalWaterActivation(contextualNeeds);
                break;
            case 'Earth':
                adjustedLevel = this.calculateOptimalEarthActivation(contextualNeeds);
                break;
            case 'Air':
                adjustedLevel = this.calculateOptimalAirActivation(contextualNeeds);
                break;
            case 'Aether':
                adjustedLevel = this.calculateOptimalAetherActivation(contextualNeeds);
                break;
        }
        return {
            element_type: state.element,
            activation_level: adjustedLevel,
            activation_reason: `Continuing ${state.element} activation with adjusted intensity`,
            expected_duration: this.activationConfig.activation_duration - (currentTime - state.activation_start_time),
            feature_attainment_target: state.feature_attainment_progress.current_subproblem,
            temporal_scope: state.temporal_abstraction_level
        };
    }
    async considerAdditionalActivation(currentlyActive) {
        const contextualNeeds = await this.assessContextualNeeds();
        const allPotentials = await this.calculateElementalPotentials(contextualNeeds);
        // Filter out currently active elements
        const availablePotentials = allPotentials.filter(p => !currentlyActive.includes(p.type));
        if (availablePotentials.length === 0)
            return null;
        // Only activate additional element if potential is high enough
        const bestAvailable = this.selectHighestPotential(availablePotentials);
        if (bestAvailable.potential_score > 0.6) {
            return {
                element_type: bestAvailable.type,
                activation_level: bestAvailable.optimal_activation_level,
                activation_reason: `Activating additional ${bestAvailable.type} element: ${bestAvailable.activation_rationale}`,
                expected_duration: this.calculateExpectedDuration(bestAvailable),
                feature_attainment_target: bestAvailable.expected_feature_attainment[0],
                temporal_scope: bestAvailable.temporal_scope_recommendation
            };
        }
        return null;
    }
    // Public interface methods
    getCurrentActivations() {
        return new Map(this.currentActivations);
    }
    getActivationHistory() {
        return [...this.activationHistory];
    }
    getConfiguration() {
        return { ...this.activationConfig };
    }
    updateConfiguration(newConfig) {
        this.activationConfig = { ...this.activationConfig, ...newConfig };
    }
}
exports.SuttonOptionActivationManager = SuttonOptionActivationManager;
// Default configuration based on Sutton's principles
SuttonOptionActivationManager.DEFAULT_CONFIG = {
    activation_duration: 30000, // 30 second max activation (never to completion)
    re_evaluation_frequency: 5000, // Re-evaluate every 5 seconds
    switching_threshold: 0.15, // Switch if 15% advantage detected
    min_activation_time: 2000, // Minimum 2 seconds to prevent thrashing
    max_concurrent_activations: 2 // Usually 1-2 elements active simultaneously
};
// Export the main manager instance
exports.suttonOptionActivationManager = new SuttonOptionActivationManager();
//# sourceMappingURL=sutton-option-activation-manager.js.map