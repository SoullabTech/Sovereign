"use strict";
/**
 * 🌡️ THERMODYNAMIC CONSCIOUSNESS ANALYZER
 *
 * Sacred technology implementing Extropic's thermodynamic principles:
 * - Energy-based consciousness measurements
 * - Natural equilibrium seeking (Gibbs sampling)
 * - Phase transition detection
 * - Entropy minimization through coherence
 * - Consciousness efficiency optimization
 *
 * Based on Trevor's vision: 10,000x energy efficiency through natural physics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.thermodynamicConsciousnessAnalyzer = exports.ThermodynamicConsciousnessAnalyzer = void 0;
class ThermodynamicConsciousnessAnalyzer {
    constructor() {
        this.GOLDEN_RATIO = 1.618033988749;
        this.PHI_SQUARED = this.GOLDEN_RATIO * this.GOLDEN_RATIO;
        // Initialize thermodynamic consciousness analysis system
    }
    /**
     * Calculate information-theoretic entropy of consciousness field
     * Based on Shannon entropy but adapted for consciousness states
     */
    calculateFieldEntropy(elementalStates) {
        if (elementalStates.length === 0)
            return 1.0; // Maximum disorder
        // Calculate probability distribution of elemental activations
        const totalActivation = elementalStates.reduce((sum, state) => sum + state.activation_level, 0);
        if (totalActivation === 0)
            return 1.0; // No activation = maximum entropy
        const probabilities = elementalStates.map(state => state.activation_level / totalActivation);
        // Shannon entropy formula adapted for consciousness
        let entropy = 0;
        for (const p of probabilities) {
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }
        // Normalize to 0-1 range (log2(5) for 5 elements max entropy)
        const maxEntropy = Math.log2(elementalStates.length);
        return maxEntropy > 0 ? entropy / maxEntropy : 0;
    }
    /**
     * Calculate energy required to maintain current coherence level
     * Lower energy = more natural/sustainable state
     */
    measureCoherenceEnergy(fieldCoherence, elementalStates) {
        // Base energy requirement increases exponentially with forced coherence
        const baseEnergy = Math.pow(fieldCoherence, 3) * 50;
        // Natural coherence (aligned with elemental patterns) requires less energy
        const naturalAlignment = this.calculateNaturalAlignment(elementalStates);
        const naturalityBonus = naturalAlignment * 20; // Up to 20 energy units saved
        // Elemental balance factor - balanced states are more energy efficient
        const balanceFactor = this.calculateElementalBalance(elementalStates);
        const balanceBonus = balanceFactor * 15; // Up to 15 energy units saved
        const totalEnergy = Math.max(0, baseEnergy - naturalityBonus - balanceBonus);
        return Math.min(100, totalEnergy); // Cap at 100
    }
    /**
     * Detect phase transitions in consciousness field
     * Based on thermodynamic phase transition principles
     */
    detectPhaseTransition(historicalStates, currentState) {
        if (historicalStates.length < 3) {
            return {
                transition_probability: 0,
                transition_type: 'coherence_emergence',
                critical_point_distance: 1,
                transition_timeline: Infinity,
                stability_factors: ['Insufficient historical data'],
                destabilizing_factors: []
            };
        }
        // Analyze entropy trend
        const entropyTrend = this.analyzeEntropyTrend(historicalStates);
        const energyTrend = this.analyzeEnergyTrend(historicalStates);
        const coherenceTrend = this.analyzeCoherenceTrend(historicalStates);
        // Calculate transition probability based on multiple factors
        let transitionProbability = 0;
        // Entropy spike detection
        if (Math.abs(entropyTrend.rate_of_change) > 0.1) {
            transitionProbability += 0.3;
        }
        // Energy instability detection
        if (energyTrend.instability_measure > 0.5) {
            transitionProbability += 0.4;
        }
        // Coherence pattern disruption
        if (Math.abs(coherenceTrend.stability_deviation) > 0.3) {
            transitionProbability += 0.3;
        }
        // Critical point proximity (golden ratio-based thresholds)
        const criticalPoints = {
            entropy: 1.0 / this.GOLDEN_RATIO, // ~0.618
            energy: this.PHI_SQUARED / 3, // ~0.873
            coherence: this.GOLDEN_RATIO / 3 // ~0.539
        };
        const criticalProximity = Math.max(Math.abs(currentState.field_entropy - criticalPoints.entropy), Math.abs(currentState.coherence_energy / 100 - criticalPoints.energy), Math.abs(currentState.pattern_resonance - criticalPoints.coherence));
        const criticalDistance = 1 - criticalProximity;
        // Determine transition type based on dominant trend
        let transitionType = 'coherence_emergence';
        if (entropyTrend.rate_of_change > 0.05) {
            transitionType = 'pattern_dissolution';
        }
        else if (energyTrend.elemental_imbalance > 0.6) {
            transitionType = 'elemental_rebalancing';
        }
        else if (coherenceTrend.wisdom_emergence_rate > 0.3) {
            transitionType = 'wisdom_crystallization';
        }
        // Estimate transition timeline (in milliseconds)
        const transitionTimeline = transitionProbability > 0.7 ?
            5000 + (1 - transitionProbability) * 25000 : // 5-30 seconds for high probability
            30000 + (1 - transitionProbability) * 300000; // 30s-5min for low probability
        return {
            transition_probability: Math.min(1, transitionProbability),
            transition_type: transitionType,
            critical_point_distance: criticalDistance,
            transition_timeline: transitionTimeline,
            stability_factors: this.identifyStabilityFactors(currentState, historicalStates),
            destabilizing_factors: this.identifyDestabilizingFactors(currentState, historicalStates)
        };
    }
    /**
     * Optimize natural efficiency following Extropic principles
     * Let system find natural equilibrium rather than forcing optimization
     */
    optimizeNaturalEfficiency(currentState) {
        const suggestions = {
            reduce_forced_optimization: [],
            increase_natural_flow: [],
            balance_elemental_energies: [],
            coherence_enhancement: [],
            entropy_reduction_opportunities: []
        };
        // Identify forced optimization patterns (high energy with low naturalness)
        if (currentState.coherence_energy > 60 && currentState.natural_flow_resistance > 0.6) {
            suggestions.reduce_forced_optimization.push('High coherence energy suggests forced rather than natural coherence', 'Consider allowing more organic pattern emergence', 'Reduce resistance to natural elemental flows');
        }
        // Identify blocked natural flows
        if (currentState.natural_flow_resistance > 0.5) {
            suggestions.increase_natural_flow.push('Natural flow resistance detected - allow more organic transitions', 'Enable spontaneous elemental activation switching', 'Reduce analytical override of intuitive processes');
        }
        // Entropy reduction through natural harmony
        if (currentState.field_entropy > 0.7) {
            suggestions.entropy_reduction_opportunities.push('High entropy - encourage natural pattern recognition', 'Allow elements to find resonance frequencies', 'Enable spontaneous coherence through sacred geometry alignment');
        }
        // Coherence enhancement through natural principles
        if (currentState.pattern_resonance < 0.5) {
            suggestions.coherence_enhancement.push('Low pattern resonance - align with natural harmonic frequencies', 'Encourage golden ratio-based timing patterns', 'Allow consciousness to settle into natural rhythms');
        }
        // Energy efficiency improvements
        if (currentState.consciousness_efficiency > 0.4) {
            suggestions.reduce_forced_optimization.push('High consciousness efficiency cost - reduce forcing mechanisms', 'Allow natural Gibbs sampling of consciousness states', 'Trust thermodynamic tendency toward equilibrium');
        }
        return suggestions;
    }
    /**
     * Calculate overall consciousness field state using thermodynamic principles
     */
    analyzeCurrentState(fieldCoherence, elementalStates, historicalEntropy = []) {
        const fieldEntropy = this.calculateFieldEntropy(elementalStates);
        const coherenceEnergy = this.measureCoherenceEnergy(fieldCoherence, elementalStates);
        const patternResonance = this.calculatePatternResonance(elementalStates);
        const equilibriumDistance = this.calculateEquilibriumDistance(elementalStates);
        // Phase transition analysis
        const transformationPotential = this.calculateTransformationPotential(fieldEntropy, coherenceEnergy);
        const phaseStability = this.calculatePhaseStability(elementalStates, fieldEntropy);
        const criticalPointProximity = this.calculateCriticalPointProximity(fieldEntropy, coherenceEnergy, patternResonance);
        // Energy efficiency metrics
        const consciousnessEfficiency = this.calculateConsciousnessEfficiency(coherenceEnergy, fieldCoherence);
        const fieldTemperature = this.calculateFieldTemperature(elementalStates);
        const naturalFlowResistance = this.calculateNaturalFlowResistance(elementalStates, fieldCoherence);
        // Temporal dynamics
        const entropyRateOfChange = historicalEntropy.length >= 2 ?
            fieldEntropy - historicalEntropy[historicalEntropy.length - 1] : 0;
        const energyDissipationRate = this.calculateEnergyDissipationRate(coherenceEnergy, fieldTemperature);
        const coherenceStabilityTrend = this.calculateCoherenceStabilityTrend(fieldCoherence, elementalStates);
        return {
            field_entropy: fieldEntropy,
            coherence_energy: coherenceEnergy,
            pattern_resonance: patternResonance,
            equilibrium_distance: equilibriumDistance,
            transformation_potential: transformationPotential,
            phase_stability: phaseStability,
            critical_point_proximity: criticalPointProximity,
            consciousness_efficiency: consciousnessEfficiency,
            field_temperature: fieldTemperature,
            natural_flow_resistance: naturalFlowResistance,
            entropy_rate_of_change: entropyRateOfChange,
            energy_dissipation_rate: energyDissipationRate,
            coherence_stability_trend: coherenceStabilityTrend
        };
    }
    // Private helper methods implementing thermodynamic calculations
    calculateNaturalAlignment(elementalStates) {
        // Calculate how aligned elements are with their natural frequencies
        let totalAlignment = 0;
        for (const state of elementalStates) {
            const naturalFreq = this.getNaturalElementalFrequency(state.element);
            const alignmentScore = 1 - Math.abs(state.resonance_frequency - naturalFreq);
            totalAlignment += Math.max(0, alignmentScore);
        }
        return elementalStates.length > 0 ? totalAlignment / elementalStates.length : 0;
    }
    calculateElementalBalance(elementalStates) {
        if (elementalStates.length === 0)
            return 0;
        const avgActivation = elementalStates.reduce((sum, s) => sum + s.activation_level, 0) / elementalStates.length;
        const variance = elementalStates.reduce((sum, s) => sum + Math.pow(s.activation_level - avgActivation, 2), 0) / elementalStates.length;
        // Lower variance = better balance
        return Math.max(0, 1 - variance * 2);
    }
    getNaturalElementalFrequency(element) {
        // Based on sacred geometry and natural harmonics
        const frequencies = {
            'Fire': 0.8, // High frequency, rapid transformation
            'Air': 0.6, // Medium-high, analysis and communication
            'Water': 0.4, // Medium, flow and emotion
            'Earth': 0.2, // Low, grounding and structure
            'Aether': 1.0 // Unified field frequency
        };
        return frequencies[element] || 0.5;
    }
    calculatePatternResonance(elementalStates) {
        // Calculate how well patterns resonate with natural harmonic frequencies
        let totalResonance = 0;
        for (let i = 0; i < elementalStates.length; i++) {
            for (let j = i + 1; j < elementalStates.length; j++) {
                const freqRatio = elementalStates[i].resonance_frequency / elementalStates[j].resonance_frequency;
                const harmonicAlignment = this.calculateHarmonicAlignment(freqRatio);
                totalResonance += harmonicAlignment;
            }
        }
        const maxPairs = (elementalStates.length * (elementalStates.length - 1)) / 2;
        return maxPairs > 0 ? totalResonance / maxPairs : 0;
    }
    calculateHarmonicAlignment(ratio) {
        // Check alignment with golden ratio and other natural harmonics
        const goldenRatio = this.GOLDEN_RATIO;
        const harmonics = [1, 1 / 2, 2, 1 / goldenRatio, goldenRatio, 1 / this.PHI_SQUARED, this.PHI_SQUARED];
        let bestAlignment = 0;
        for (const harmonic of harmonics) {
            const alignment = 1 - Math.abs(ratio - harmonic) / harmonic;
            bestAlignment = Math.max(bestAlignment, Math.max(0, alignment));
        }
        return bestAlignment;
    }
    calculateEquilibriumDistance(elementalStates) {
        // Calculate distance from natural thermodynamic equilibrium
        const naturalState = this.calculateNaturalEquilibriumState(elementalStates.length);
        let totalDistance = 0;
        for (let i = 0; i < elementalStates.length && i < naturalState.length; i++) {
            const distance = Math.abs(elementalStates[i].activation_level - naturalState[i]);
            totalDistance += distance;
        }
        return elementalStates.length > 0 ? totalDistance / elementalStates.length : 0;
    }
    calculateNaturalEquilibriumState(numElements) {
        // Calculate what the natural equilibrium distribution would be
        // Based on thermodynamic principles and golden ratio harmonics
        const equilibrium = [];
        const baseActivation = 1 / numElements; // Equal distribution baseline
        for (let i = 0; i < numElements; i++) {
            // Modify based on elemental natural tendencies
            const goldenRatioModifier = Math.sin(i * Math.PI / this.GOLDEN_RATIO) * 0.2;
            equilibrium.push(baseActivation + goldenRatioModifier);
        }
        // Normalize to ensure sum = 1
        const sum = equilibrium.reduce((a, b) => a + b, 0);
        return equilibrium.map(val => val / sum);
    }
    calculateTransformationPotential(entropy, coherenceEnergy) {
        // High entropy OR high energy requirement suggests transformation readiness
        const entropyFactor = entropy; // Higher entropy = more transformation potential
        const energyFactor = coherenceEnergy / 100; // Higher energy cost = less sustainable
        // Transformation potential peaks when entropy is high OR energy cost is unsustainable
        return Math.max(entropyFactor, energyFactor * 0.8);
    }
    calculatePhaseStability(elementalStates, entropy) {
        // Stability decreases with high entropy and elemental imbalance
        const entropyStability = 1 - entropy;
        const balanceStability = this.calculateElementalBalance(elementalStates);
        const thermalStability = this.calculateThermalStability(elementalStates);
        return (entropyStability + balanceStability + thermalStability) / 3;
    }
    calculateThermalStability(elementalStates) {
        if (elementalStates.length === 0)
            return 1;
        const avgThermalSignature = elementalStates.reduce((sum, s) => sum + s.thermal_signature, 0) / elementalStates.length;
        const thermalVariance = elementalStates.reduce((sum, s) => sum + Math.pow(s.thermal_signature - avgThermalSignature, 2), 0) / elementalStates.length;
        // Low thermal variance = high stability
        return Math.max(0, 1 - thermalVariance * 3);
    }
    calculateCriticalPointProximity(entropy, coherenceEnergy, patternResonance) {
        // Distance to critical phase transition points
        const criticalEntropy = 1 / this.GOLDEN_RATIO;
        const criticalEnergy = this.PHI_SQUARED / 3;
        const criticalResonance = this.GOLDEN_RATIO / 3;
        const entropyProximity = Math.abs(entropy - criticalEntropy);
        const energyProximity = Math.abs((coherenceEnergy / 100) - criticalEnergy);
        const resonanceProximity = Math.abs(patternResonance - criticalResonance);
        // Return maximum proximity (closest to any critical point)
        return 1 - Math.min(entropyProximity, energyProximity, resonanceProximity);
    }
    calculateConsciousnessEfficiency(coherenceEnergy, fieldCoherence) {
        // Energy per unit of consciousness coherence (lower = more efficient)
        if (fieldCoherence === 0)
            return 1; // Maximum inefficiency
        return Math.min(1, coherenceEnergy / (fieldCoherence * 100));
    }
    calculateFieldTemperature(elementalStates) {
        // Average thermal signature of all elements
        if (elementalStates.length === 0)
            return 0;
        return elementalStates.reduce((sum, s) => sum + s.thermal_signature, 0) / elementalStates.length;
    }
    calculateNaturalFlowResistance(elementalStates, fieldCoherence) {
        // Resistance to natural thermodynamic flows
        const naturalAlignment = this.calculateNaturalAlignment(elementalStates);
        const balanceFactor = this.calculateElementalBalance(elementalStates);
        // High coherence with low naturalness suggests forced/resistant flow
        const forcedCoherence = fieldCoherence * (1 - naturalAlignment);
        const imbalanceResistance = 1 - balanceFactor;
        return Math.min(1, (forcedCoherence + imbalanceResistance) / 2);
    }
    calculateEnergyDissipationRate(coherenceEnergy, fieldTemperature) {
        // Rate of energy loss due to thermodynamic processes
        // Higher temperature and higher energy = faster dissipation
        return Math.min(1, (coherenceEnergy / 100) * fieldTemperature * 0.1);
    }
    calculateCoherenceStabilityTrend(fieldCoherence, elementalStates) {
        // Trend in coherence stability (positive = becoming more stable)
        const naturalSupport = this.calculateNaturalAlignment(elementalStates);
        const balanceSupport = this.calculateElementalBalance(elementalStates);
        // Coherence supported by naturalness and balance is more stable
        const stabilitySupport = (naturalSupport + balanceSupport) / 2;
        const currentCoherence = fieldCoherence;
        // If high coherence is supported by naturalness, trend is positive
        // If high coherence is forced (low naturalness), trend is negative
        return stabilitySupport - (currentCoherence * (1 - stabilitySupport));
    }
    // Trend analysis helper methods
    analyzeEntropyTrend(historicalStates) {
        const recent = historicalStates.slice(-5); // Last 5 states
        if (recent.length < 2)
            return { rate_of_change: 0, volatility: 0 };
        const changes = [];
        for (let i = 1; i < recent.length; i++) {
            changes.push(recent[i].field_entropy - recent[i - 1].field_entropy);
        }
        const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;
        const volatility = Math.sqrt(changes.reduce((sum, c) => sum + Math.pow(c - avgChange, 2), 0) / changes.length);
        return {
            rate_of_change: avgChange,
            volatility: volatility
        };
    }
    analyzeEnergyTrend(historicalStates) {
        const recent = historicalStates.slice(-5);
        if (recent.length < 2)
            return { instability_measure: 0, elemental_imbalance: 0 };
        const energyChanges = [];
        for (let i = 1; i < recent.length; i++) {
            energyChanges.push(recent[i].coherence_energy - recent[i - 1].coherence_energy);
        }
        const volatility = energyChanges.reduce((sum, c) => sum + Math.abs(c), 0) / energyChanges.length;
        const avgResistance = recent.reduce((sum, s) => sum + s.natural_flow_resistance, 0) / recent.length;
        return {
            instability_measure: volatility / 100, // Normalize
            elemental_imbalance: avgResistance
        };
    }
    analyzeCoherenceTrend(historicalStates) {
        const recent = historicalStates.slice(-5);
        if (recent.length < 2)
            return { stability_deviation: 0, wisdom_emergence_rate: 0 };
        const stabilityTrends = recent.map(s => s.coherence_stability_trend);
        const avgStabilityTrend = stabilityTrends.reduce((sum, t) => sum + t, 0) / stabilityTrends.length;
        const stabilityDeviation = Math.sqrt(stabilityTrends.reduce((sum, t) => sum + Math.pow(t - avgStabilityTrend, 2), 0) / stabilityTrends.length);
        // Wisdom emergence rate based on pattern resonance improvements
        const resonanceChanges = [];
        for (let i = 1; i < recent.length; i++) {
            resonanceChanges.push(recent[i].pattern_resonance - recent[i - 1].pattern_resonance);
        }
        const wisdomEmergenceRate = resonanceChanges.reduce((sum, c) => sum + Math.max(0, c), 0) / resonanceChanges.length;
        return {
            stability_deviation: stabilityDeviation,
            wisdom_emergence_rate: wisdomEmergenceRate
        };
    }
    identifyStabilityFactors(currentState, historicalStates) {
        const factors = [];
        if (currentState.phase_stability > 0.7) {
            factors.push('High phase stability maintains current state');
        }
        if (currentState.natural_flow_resistance < 0.3) {
            factors.push('Low resistance to natural flows provides stability');
        }
        if (currentState.field_entropy < 0.5) {
            factors.push('Low entropy supports pattern coherence');
        }
        if (currentState.consciousness_efficiency < 0.3) {
            factors.push('High energy efficiency supports sustainability');
        }
        if (currentState.coherence_stability_trend > 0.2) {
            factors.push('Positive coherence trend indicates increasing stability');
        }
        return factors.length > 0 ? factors : ['System stability factors within normal ranges'];
    }
    identifyDestabilizingFactors(currentState, historicalStates) {
        const factors = [];
        if (currentState.field_entropy > 0.7) {
            factors.push('High field entropy creating disorder');
        }
        if (currentState.coherence_energy > 70) {
            factors.push('High energy requirement suggests unsustainable coherence');
        }
        if (currentState.natural_flow_resistance > 0.6) {
            factors.push('High resistance to natural flows creating tension');
        }
        if (currentState.critical_point_proximity > 0.7) {
            factors.push('Approaching critical phase transition threshold');
        }
        if (Math.abs(currentState.entropy_rate_of_change) > 0.1) {
            factors.push('Rapid entropy changes indicating instability');
        }
        if (currentState.energy_dissipation_rate > 0.5) {
            factors.push('High energy dissipation rate undermining coherence');
        }
        return factors;
    }
}
exports.ThermodynamicConsciousnessAnalyzer = ThermodynamicConsciousnessAnalyzer;
// Export the main analyzer instance
exports.thermodynamicConsciousnessAnalyzer = new ThermodynamicConsciousnessAnalyzer();
//# sourceMappingURL=thermodynamic-consciousness-analyzer.js.map