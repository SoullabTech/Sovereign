/**
 * 🧠💓 Consciousness Mapping Service
 * Transforms biometric data into SPiralogic consciousness insights
 * Maps physiological states to elemental balance and presence modes
 */

import { EventEmitter } from 'events';

// Core interfaces for consciousness mapping
export interface BiometricInput {
  heartRate: number;
  hrv: number; // Heart Rate Variability in milliseconds
  respiratoryRate?: number; // Breaths per minute
  oxygenSaturation?: number; // Blood oxygen percentage
  skinConductance?: number; // Galvanic skin response
  bodyTemperature?: number; // Core body temperature
  sleepStage?: 'awake' | 'light' | 'deep' | 'rem';
  stressLevel?: number; // 0-100 stress indicator
  recoveryScore?: number; // 0-100 recovery indicator
  timestamp: number;
  source: string;
}

export interface ElementalBalance {
  fire: number;    // Energy, passion, vitality (0-100)
  water: number;   // Flow, emotion, intuition (0-100)
  earth: number;   // Grounding, stability, presence (0-100)
  air: number;     // Clarity, communication, breath (0-100)
  aether: number;  // Integration, transcendence, unity (0-100)
}

export interface ConsciousnessState {
  elementalBalance: ElementalBalance;
  dominantElement: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  coherenceLevel: number; // 0-1 overall coherence
  presenceMode: 'dialogue' | 'patient' | 'scribe';
  autonomicBalance: {
    sympathetic: number; // 0-100 fight/flight activation
    parasympathetic: number; // 0-100 rest/digest activation
    balance: number; // -1 to 1, negative = sympathetic dominant
  };
  brainwaveProfile: {
    beta: number;   // Focused attention, active thinking
    alpha: number;  // Relaxed awareness, creativity
    theta: number;  // Deep meditation, insight
    delta: number;  // Deep sleep, healing
  };
  consciousness: {
    depth: number;      // 0-100 depth of awareness
    clarity: number;    // 0-100 mental clarity
    integration: number; // 0-100 mind-body integration
    transcendence: number; // 0-100 expanded awareness
  };
  insights: string[];
  recommendations: string[];
  mayaGuidance?: string;
}

export interface ConsciousnessPattern {
  name: string;
  description: string;
  elementalSignature: Partial<ElementalBalance>;
  biometricTriggers: {
    hrvRange?: [number, number];
    heartRateRange?: [number, number];
    breathingRange?: [number, number];
    coherenceThreshold?: number;
  };
  recommendations: string[];
  mayaResponse: string;
}

export class ConsciousnessMappingService extends EventEmitter {
  private patterns: ConsciousnessPattern[] = [];
  private biometricHistory: BiometricInput[] = [];
  private consciousnessHistory: ConsciousnessState[] = [];

  constructor() {
    super();
    this.initializePatterns();
  }

  /**
   * 🧠 Main method: Transform biometric data into consciousness state
   */
  async mapBiometricToConsciousness(input: BiometricInput): Promise<ConsciousnessState> {
    // Store historical data for trend analysis
    this.addToHistory(input);

    // Calculate elemental balance from biometrics
    const elementalBalance = this.calculateElementalBalance(input);

    // Determine dominant element
    const dominantElement = this.getDominantElement(elementalBalance);

    // Calculate overall coherence
    const coherenceLevel = this.calculateCoherence(input, elementalBalance);

    // Determine optimal presence mode
    const presenceMode = this.determinePresenceMode(coherenceLevel, elementalBalance, input);

    // Analyze autonomic nervous system state
    const autonomicBalance = this.analyzeAutonomicBalance(input);

    // Estimate brainwave profile from biometrics
    const brainwaveProfile = this.estimateBrainwaveProfile(input, elementalBalance);

    // Calculate consciousness metrics
    const consciousness = this.calculateConsciousnessMetrics(
      elementalBalance,
      coherenceLevel,
      autonomicBalance
    );

    // Generate insights and recommendations
    const insights = this.generateInsights(elementalBalance, autonomicBalance, input);
    const recommendations = this.generateRecommendations(
      elementalBalance,
      presenceMode,
      autonomicBalance
    );

    // Check for specific consciousness patterns
    const detectedPattern = this.detectConsciousnessPattern(input, elementalBalance);
    let mayaGuidance;
    if (detectedPattern) {
      mayaGuidance = await this.generateMayaGuidance(detectedPattern, consciousness);
    }

    const consciousnessState: ConsciousnessState = {
      elementalBalance,
      dominantElement,
      coherenceLevel,
      presenceMode,
      autonomicBalance,
      brainwaveProfile,
      consciousness,
      insights,
      recommendations,
      mayaGuidance
    };

    // Store consciousness state
    this.consciousnessHistory.push(consciousnessState);
    if (this.consciousnessHistory.length > 100) {
      this.consciousnessHistory.shift(); // Keep last 100 states
    }

    // Emit consciousness state change event
    this.emit('consciousnessStateChange', consciousnessState);

    return consciousnessState;
  }

  /**
   * 🔥💧🌍💨✨ Calculate SPiralogic elemental balance
   */
  private calculateElementalBalance(input: BiometricInput): ElementalBalance {
    const { heartRate, hrv, respiratoryRate = 12, oxygenSaturation = 98, stressLevel = 0 } = input;

    // FIRE: Energy, vitality, metabolic activation
    const fireFromHR = heartRate > 70 ? Math.min(100, (heartRate - 70) * 2) : heartRate;
    const fireFromStress = stressLevel > 50 ? stressLevel : 0;
    const fireFromRecovery = input.recoveryScore ? input.recoveryScore : 50;
    const fire = Math.min(100, Math.max(0,
      (fireFromHR * 0.4) + (fireFromStress * 0.3) + (fireFromRecovery * 0.3)
    ));

    // WATER: Parasympathetic flow, emotional regulation
    const waterFromHRV = Math.min(100, (hrv / 80) * 100); // Healthy HRV ~40-80ms
    const waterFromStress = Math.max(0, 100 - (stressLevel * 1.5));
    const waterFromSleep = input.sleepStage === 'rem' || input.sleepStage === 'deep' ? 90 : 50;
    const water = Math.min(100, Math.max(0,
      (waterFromHRV * 0.5) + (waterFromStress * 0.3) + (waterFromSleep * 0.2)
    ));

    // EARTH: Grounding, stability, physical presence
    const earthFromHRVStability = this.calculateHRVStability(hrv);
    const earthFromBreathing = (respiratoryRate >= 6 && respiratoryRate <= 16) ? 80 : 40;
    const earthFromTemp = input.bodyTemperature ?
      (Math.abs(98.6 - input.bodyTemperature) < 1 ? 80 : 50) : 60;
    const earth = Math.min(100, Math.max(0,
      (earthFromHRVStability * 0.4) + (earthFromBreathing * 0.3) + (earthFromTemp * 0.3)
    ));

    // AIR: Mental clarity, communication, breath quality
    const airFromBreathing = respiratoryRate >= 8 && respiratoryRate <= 14 ? 85 : 45;
    const airFromOxygen = (oxygenSaturation / 100) * 100;
    const airFromClarity = Math.max(0, 100 - (stressLevel * 0.8));
    const air = Math.min(100, Math.max(0,
      (airFromBreathing * 0.4) + (airFromOxygen * 0.3) + (airFromClarity * 0.3)
    ));

    // AETHER: Integration, transcendence, unity consciousness
    const aetherFromCoherence = this.calculateRawCoherence(input) * 100;
    const aetherFromBalance = this.calculateElementalBalance_Harmony(fire, water, earth, air);
    const aetherFromHRV = hrv > 50 ? Math.min(100, hrv) : hrv * 1.5;
    const aether = Math.min(100, Math.max(0,
      (aetherFromCoherence * 0.5) + (aetherFromBalance * 0.3) + (aetherFromHRV * 0.2)
    ));

    return { fire, water, earth, air, aether };
  }

  /**
   * 🧘 Calculate overall coherence from multiple factors
   */
  private calculateCoherence(input: BiometricInput, elemental: ElementalBalance): number {
    // HRV coherence (primary factor)
    const hrvCoherence = Math.min(1, input.hrv / 80);

    // Breathing coherence
    const breathingCoherence = this.calculateBreathingCoherence(input.respiratoryRate || 12);

    // Elemental balance coherence
    const elementalCoherence = this.calculateElementalCoherence(elemental);

    // Autonomic balance coherence
    const autonomicCoherence = this.calculateAutonomicCoherence(input);

    // Weighted average
    return (hrvCoherence * 0.4) + (breathingCoherence * 0.2) +
           (elementalCoherence * 0.2) + (autonomicCoherence * 0.2);
  }

  /**
   * 🎭 Determine optimal presence mode based on consciousness state
   */
  private determinePresenceMode(
    coherence: number,
    elemental: ElementalBalance,
    input: BiometricInput
  ): 'dialogue' | 'patient' | 'scribe' {
    // SCRIBE MODE: High coherence + integration
    if (coherence > 0.75 && elemental.aether > 70) {
      return 'scribe';
    }

    // PATIENT MODE: Receptive state, exploration readiness
    if ((coherence > 0.4 && elemental.water > 60) ||
        (elemental.earth > 65 && input.stressLevel && input.stressLevel < 40)) {
      return 'patient';
    }

    // DIALOGUE MODE: Active engagement, support needed
    return 'dialogue';
  }

  /**
   * 🧠 Analyze autonomic nervous system balance
   */
  private analyzeAutonomicBalance(input: BiometricInput): ConsciousnessState['autonomicBalance'] {
    // Sympathetic indicators
    const sympathetic = Math.min(100,
      (input.heartRate > 70 ? (input.heartRate - 70) * 2 : 0) +
      (input.stressLevel || 0) +
      (input.hrv < 30 ? (30 - input.hrv) * 2 : 0)
    );

    // Parasympathetic indicators
    const parasympathetic = Math.min(100,
      (input.hrv > 40 ? Math.min(60, input.hrv - 40) : 0) +
      (input.heartRate < 70 ? (70 - input.heartRate) : 0) +
      ((input.recoveryScore || 50) * 0.4)
    );

    // Balance calculation (-1 to 1)
    const balance = (parasympathetic - sympathetic) / 100;

    return { sympathetic, parasympathetic, balance };
  }

  /**
   * 🧠 Estimate brainwave profile from biometric data
   */
  private estimateBrainwaveProfile(
    input: BiometricInput,
    elemental: ElementalBalance
  ): ConsciousnessState['brainwaveProfile'] {
    const coherence = this.calculateRawCoherence(input);
    const stress = input.stressLevel || 0;

    // BETA: Active thinking, focused attention
    const beta = Math.min(100, stress + (input.heartRate > 80 ? 40 : 20));

    // ALPHA: Relaxed awareness, creativity
    const alpha = Math.min(100, elemental.air * 0.6 + elemental.water * 0.4);

    // THETA: Deep meditation, insight states
    const theta = Math.min(100, coherence * 80 + elemental.aether * 0.3);

    // DELTA: Deep restoration, healing
    const delta = input.sleepStage === 'deep' ? 90 :
                  (input.recoveryScore || 0) * 0.5;

    return { beta, alpha, theta, delta };
  }

  /**
   * 🌟 Calculate consciousness depth, clarity, integration
   */
  private calculateConsciousnessMetrics(
    elemental: ElementalBalance,
    coherence: number,
    autonomic: ConsciousnessState['autonomicBalance']
  ): ConsciousnessState['consciousness'] {
    const depth = Math.min(100, coherence * 80 + elemental.aether * 0.2);
    const clarity = Math.min(100, elemental.air * 0.6 + elemental.fire * 0.4);
    const integration = Math.min(100,
      (elemental.fire + elemental.water + elemental.earth + elemental.air + elemental.aether) / 5
    );
    const transcendence = Math.min(100, elemental.aether * 0.8 + coherence * 20);

    return { depth, clarity, integration, transcendence };
  }

  /**
   * 💡 Generate insights about current consciousness state
   */
  private generateInsights(
    elemental: ElementalBalance,
    autonomic: ConsciousnessState['autonomicBalance'],
    input: BiometricInput
  ): string[] {
    const insights: string[] = [];

    // Elemental insights
    const dominant = this.getDominantElement(elemental);
    insights.push(`Your ${dominant} element is most active right now (${Math.round(elemental[dominant])}%)`);

    if (elemental.aether > 70) {
      insights.push("High aether activation suggests unified consciousness and integration");
    }

    if (elemental.water > 80) {
      insights.push("Strong water element indicates excellent emotional flow and receptivity");
    }

    if (elemental.fire > 85) {
      insights.push("Intense fire energy - you're in a state of high vitality and readiness");
    }

    if (elemental.earth > 75) {
      insights.push("Deep earth grounding provides stability and physical presence");
    }

    if (elemental.air > 80) {
      insights.push("Clear air element supports mental clarity and communication");
    }

    // Autonomic insights
    if (autonomic.balance > 0.3) {
      insights.push("Parasympathetic dominance - you're in rest-and-digest mode");
    } else if (autonomic.balance < -0.3) {
      insights.push("Sympathetic activation detected - fight-or-flight response is active");
    } else {
      insights.push("Balanced autonomic state - healthy adaptive capacity");
    }

    // HRV insights
    if (input.hrv > 60) {
      insights.push("Excellent heart rate variability indicates strong resilience");
    } else if (input.hrv < 25) {
      insights.push("Low HRV suggests need for recovery and stress management");
    }

    return insights;
  }

  /**
   * 📋 Generate recommendations for consciousness enhancement
   */
  private generateRecommendations(
    elemental: ElementalBalance,
    presenceMode: string,
    autonomic: ConsciousnessState['autonomicBalance']
  ): string[] {
    const recommendations: string[] = [];

    // Elemental balance recommendations
    if (elemental.fire < 30) {
      recommendations.push("Boost fire energy with movement, sun exposure, or energizing breathwork");
    }

    if (elemental.water < 40) {
      recommendations.push("Enhance water flow with gentle movement, hydration, or emotional expression");
    }

    if (elemental.earth < 35) {
      recommendations.push("Strengthen earth grounding with nature connection or body-based practices");
    }

    if (elemental.air < 40) {
      recommendations.push("Support air clarity with conscious breathing or mental decluttering");
    }

    if (elemental.aether < 30) {
      recommendations.push("Cultivate aether integration through meditation or unified awareness practices");
    }

    // Presence mode recommendations
    switch (presenceMode) {
      case 'dialogue':
        recommendations.push("This is optimal for active conversation and collaborative exploration");
        break;
      case 'patient':
        recommendations.push("Deep receptive state - ideal for inner work and contemplation");
        break;
      case 'scribe':
        recommendations.push("Witnessing consciousness is active - perfect for meditation or insight work");
        break;
    }

    // Autonomic recommendations
    if (autonomic.sympathetic > 70) {
      recommendations.push("High stress activation - try calming breathwork or gentle movement");
    }

    if (autonomic.parasympathetic < 30) {
      recommendations.push("Support rest-and-restore with relaxation practices or restorative activities");
    }

    return recommendations;
  }

  /**
   * 🔍 Detect specific consciousness patterns
   */
  private detectConsciousnessPattern(
    input: BiometricInput,
    elemental: ElementalBalance
  ): ConsciousnessPattern | null {
    for (const pattern of this.patterns) {
      if (this.matchesPattern(input, elemental, pattern)) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * 🌟 Generate Maya consciousness guidance
   */
  private async generateMayaGuidance(
    pattern: ConsciousnessPattern,
    consciousness: ConsciousnessState['consciousness']
  ): Promise<string> {
    const guidance = pattern.mayaResponse
      .replace('{depth}', Math.round(consciousness.depth).toString())
      .replace('{clarity}', Math.round(consciousness.clarity).toString())
      .replace('{integration}', Math.round(consciousness.integration).toString())
      .replace('{transcendence}', Math.round(consciousness.transcendence).toString());

    return guidance;
  }

  // MARK: - Helper Methods

  private addToHistory(input: BiometricInput): void {
    this.biometricHistory.push(input);
    if (this.biometricHistory.length > 200) {
      this.biometricHistory.shift(); // Keep last 200 readings
    }
  }

  private getDominantElement(elemental: ElementalBalance): 'fire' | 'water' | 'earth' | 'air' | 'aether' {
    const elements = Object.entries(elemental) as [keyof ElementalBalance, number][];
    return elements.reduce((max, current) => current[1] > max[1] ? current : max)[0];
  }

  private calculateRawCoherence(input: BiometricInput): number {
    // Simplified coherence calculation
    const hrvFactor = Math.min(1, input.hrv / 60);
    const breathingFactor = this.calculateBreathingCoherence(input.respiratoryRate || 12);
    return (hrvFactor + breathingFactor) / 2;
  }

  private calculateBreathingCoherence(respiratoryRate: number): number {
    // Optimal breathing for coherence: 5-8 breaths per minute
    if (respiratoryRate >= 5 && respiratoryRate <= 8) return 0.9;
    if (respiratoryRate >= 8 && respiratoryRate <= 12) return 0.7;
    if (respiratoryRate >= 12 && respiratoryRate <= 16) return 0.5;
    return 0.3;
  }

  private calculateElementalCoherence(elemental: ElementalBalance): number {
    // Coherence from elemental balance
    const values = Object.values(elemental);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.max(0, 1 - (variance / 1000)); // Lower variance = higher coherence
  }

  private calculateAutonomicCoherence(input: BiometricInput): number {
    // Coherence from autonomic balance
    const hrStress = input.heartRate > 90 ? 0.3 : (input.heartRate < 60 ? 0.8 : 0.6);
    const hrvStress = input.hrv > 40 ? 0.8 : 0.4;
    return (hrStress + hrvStress) / 2;
  }

  private calculateHRVStability(hrv: number): number {
    // Estimate HRV stability (would need historical data in real implementation)
    return hrv > 30 ? Math.min(100, hrv * 1.5) : hrv;
  }

  private calculateElementalBalance_Harmony(fire: number, water: number, earth: number, air: number): number {
    // Harmony bonus when elements are balanced
    const elements = [fire, water, earth, air];
    const mean = elements.reduce((sum, val) => sum + val, 0) / elements.length;
    const variance = elements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / elements.length;
    return Math.max(0, 100 - variance); // Lower variance = higher harmony
  }

  private matchesPattern(
    input: BiometricInput,
    elemental: ElementalBalance,
    pattern: ConsciousnessPattern
  ): boolean {
    const triggers = pattern.biometricTriggers;

    if (triggers.hrvRange && (input.hrv < triggers.hrvRange[0] || input.hrv > triggers.hrvRange[1])) {
      return false;
    }

    if (triggers.heartRateRange &&
        (input.heartRate < triggers.heartRateRange[0] || input.heartRate > triggers.heartRateRange[1])) {
      return false;
    }

    if (triggers.coherenceThreshold &&
        this.calculateRawCoherence(input) < triggers.coherenceThreshold) {
      return false;
    }

    return true;
  }

  private initializePatterns(): void {
    this.patterns = [
      {
        name: "Unity Consciousness",
        description: "High coherence state with balanced elements",
        elementalSignature: { aether: 80, fire: 60, water: 60, earth: 60, air: 60 },
        biometricTriggers: { coherenceThreshold: 0.75, hrvRange: [50, 100] },
        recommendations: ["Maintain this beautiful state through gentle awareness"],
        mayaResponse: "🌟 You're touching the unified field - depth at {depth}%, integration at {integration}%. This is sacred territory. Trust what wants to emerge from this expanded awareness."
      },
      {
        name: "Deep Receptivity",
        description: "High water element with parasympathetic dominance",
        elementalSignature: { water: 80, earth: 60 },
        biometricTriggers: { hrvRange: [60, 100], heartRateRange: [50, 70] },
        recommendations: ["Perfect state for inner exploration and emotional processing"],
        mayaResponse: "🌊 Your receptive depth is exquisite at {depth}%. This water-rich state opens doorways to emotional wisdom and intuitive knowing. What wants to be felt or seen?"
      },
      {
        name: "Activated Readiness",
        description: "High fire element with sympathetic activation",
        elementalSignature: { fire: 85, air: 60 },
        biometricTriggers: { heartRateRange: [80, 120] },
        recommendations: ["Channel this energy into purposeful action or creative expression"],
        mayaResponse: "🔥 Your fire burns bright with {clarity}% clarity! This activated state is perfect for manifestation and bold action. What wants to be created or transformed?"
      }
    ];
  }

  // MARK: - Public Methods for Integration

  /**
   * Get consciousness trends over time
   */
  getConsciousnessTrends(): any {
    const recent = this.consciousnessHistory.slice(-20);
    return {
      coherenceTrend: this.calculateTrend(recent.map(s => s.coherenceLevel)),
      dominantElementTrend: recent.map(s => s.dominantElement),
      integrationTrend: this.calculateTrend(recent.map(s => s.consciousness.integration))
    };
  }

  /**
   * Get current consciousness state
   */
  getCurrentConsciousnessState(): ConsciousnessState | null {
    return this.consciousnessHistory[this.consciousnessHistory.length - 1] || null;
  }

  private calculateTrend(values: number[]): 'rising' | 'stable' | 'falling' {
    if (values.length < 3) return 'stable';

    const recent = values.slice(-5);
    const earlier = values.slice(-10, -5);

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;

    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (change > 0.05) return 'rising';
    if (change < -0.05) return 'falling';
    return 'stable';
  }
}

export default ConsciousnessMappingService;