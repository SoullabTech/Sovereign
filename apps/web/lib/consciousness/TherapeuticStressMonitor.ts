/**
 * 🧬 Therapeutic Stress Monitor
 *
 * Inspired by Michael Levin's bioelectric intelligence research
 * Monitors conversation "bioelectricity" and adapts responses like cells adapt to stress
 *
 * Like cells navigating toward anatomical homeostasis,
 * MAIA navigates toward therapeutic coherence
 */

export interface ConversationStress {
  therapeuticAlignment: number;  // 0-1: How aligned with healing goals
  coherenceGap: number;         // Distance from user's growth edge
  resistanceLevel: number;      // User's defensive patterns
  integrationStrain: number;    // Cognitive load vs capacity
  vitalitySignal: number;       // Life force vs depletion
}

export interface TherapeuticVoltage {
  // User's "bioelectric" state detected through language patterns
  energeticSignature: {
    activation: number;    // Fight/flight vs calm presence (0-1)
    coherence: number;     // Integrated vs fragmented (0-1)
    receptivity: number;   // Open vs defended (0-1)
    vitality: number;      // Life force vs depletion (0-1)
  };

  // Optimal "therapeutic frequency" for response
  recommendedFrequency: {
    resonance: "match" | "stabilize" | "activate" | "integrate";
    intensity: number;     // How much intervention they can receive (0-1)
    duration: number;      // Therapeutic dose timing (0-1)
  };
}

export type ResponseAdaptation = {
  style: "gentle_presence" | "expansion_challenge" | "realignment" | "integration_support";
  complexity: "simple" | "moderate" | "complex" | "multilayered";
  pacing: "slow" | "natural" | "energizing" | "dynamic";
  depth: "surface" | "moderate" | "deep" | "archetypal";
};

export class TherapeuticStressMonitor {

  /**
   * Analyze conversation for "bioelectric" stress patterns
   * Like Levin reading voltage patterns in embryos
   */
  analyzeConversationStress(messages: any[]): ConversationStress {
    if (!messages || messages.length === 0) {
      return this.getDefaultStress();
    }

    const userMessages = messages.filter(m => m.role === 'user');
    const recentMessages = userMessages.slice(-3); // Focus on recent context

    return {
      therapeuticAlignment: this.assessTherapeuticAlignment(recentMessages),
      coherenceGap: this.assessCoherenceGap(recentMessages),
      resistanceLevel: this.assessResistanceLevel(recentMessages),
      integrationStrain: this.assessIntegrationStrain(recentMessages),
      vitalitySignal: this.assessVitalitySignal(recentMessages)
    };
  }

  /**
   * Detect user's "therapeutic voltage" patterns
   */
  detectTherapeuticVoltage(messages: any[]): TherapeuticVoltage {
    const userText = this.extractUserText(messages);

    const energeticSignature = {
      activation: this.detectActivation(userText),
      coherence: this.detectCoherence(userText),
      receptivity: this.detectReceptivity(userText),
      vitality: this.detectVitality(userText)
    };

    const recommendedFrequency = this.calculateOptimalFrequency(energeticSignature);

    return {
      energeticSignature,
      recommendedFrequency
    };
  }

  /**
   * Adapt response style based on stress - like cells adapting to bioelectric signals
   */
  adaptToTherapeuticStress(stress: ConversationStress): ResponseAdaptation {
    // High resistance = gentle presence (like cells slowing under stress)
    if (stress.resistanceLevel > 0.7) {
      return {
        style: "gentle_presence",
        complexity: "simple",
        pacing: "slow",
        depth: "surface"
      };
    }

    // High integration strain = support integration
    if (stress.integrationStrain > 0.7) {
      return {
        style: "integration_support",
        complexity: "moderate",
        pacing: "natural",
        depth: "moderate"
      };
    }

    // Low therapeutic alignment = realignment needed
    if (stress.therapeuticAlignment < 0.4) {
      return {
        style: "realignment",
        complexity: "moderate",
        pacing: "natural",
        depth: "deep"
      };
    }

    // Low coherence gap = ready for expansion
    if (stress.coherenceGap < 0.3) {
      return {
        style: "expansion_challenge",
        complexity: "complex",
        pacing: "energizing",
        depth: "archetypal"
      };
    }

    // Default: balanced support
    return {
      style: "integration_support",
      complexity: "moderate",
      pacing: "natural",
      depth: "moderate"
    };
  }

  /**
   * Generate therapeutic guidance based on bioelectric analysis
   */
  generateTherapeuticGuidance(stress: ConversationStress, voltage: TherapeuticVoltage): string {
    const adaptation = this.adaptToTherapeuticStress(stress);

    let guidance = `[Therapeutic Bioelectricity Analysis]\n`;
    guidance += `Stress Pattern: ${this.describeStressPattern(stress)}\n`;
    guidance += `Energetic State: ${this.describeEnergeticState(voltage.energeticSignature)}\n`;
    guidance += `Adaptation Strategy: ${this.describeAdaptation(adaptation)}\n`;
    guidance += `Optimal Frequency: ${voltage.recommendedFrequency.resonance} at ${Math.round(voltage.recommendedFrequency.intensity * 100)}% intensity\n\n`;

    guidance += this.generateSpecificGuidance(adaptation, stress, voltage);

    return guidance;
  }

  // Private analysis methods

  private assessTherapeuticAlignment(messages: any[]): number {
    const text = this.extractUserText(messages);

    // Keywords indicating therapeutic alignment
    const alignmentIndicators = [
      'growth', 'healing', 'understanding', 'insight', 'awareness',
      'integration', 'wholeness', 'clarity', 'purpose', 'meaning'
    ];

    const misalignmentIndicators = [
      'stuck', 'confused', 'lost', 'hopeless', 'overwhelmed',
      'frustrated', 'angry', 'disconnected', 'numb'
    ];

    const alignmentScore = this.countIndicators(text, alignmentIndicators);
    const misalignmentScore = this.countIndicators(text, misalignmentIndicators);

    // Normalize to 0-1 scale
    const totalIndicators = alignmentScore + misalignmentScore;
    if (totalIndicators === 0) return 0.5; // Neutral if no indicators

    return alignmentScore / totalIndicators;
  }

  private assessCoherenceGap(messages: any[]): number {
    const text = this.extractUserText(messages);

    // High coherence gap = ready for growth
    const readinessIndicators = [
      'ready', 'open', 'curious', 'willing', 'excited',
      'motivated', 'clear', 'focused', 'committed'
    ];

    const stuckIndicators = [
      'stuck', 'blocked', 'resistant', 'confused', 'overwhelmed',
      'tired', 'can\'t', 'impossible', 'too hard'
    ];

    const readinessScore = this.countIndicators(text, readinessIndicators);
    const stuckScore = this.countIndicators(text, stuckIndicators);

    // Higher readiness = lower coherence gap (ready to grow)
    const totalIndicators = readinessScore + stuckScore;
    if (totalIndicators === 0) return 0.5;

    return stuckScore / totalIndicators; // Inverted - stuck = high gap
  }

  private assessResistanceLevel(messages: any[]): number {
    const text = this.extractUserText(messages);

    const resistanceIndicators = [
      'but', 'however', 'can\'t', 'won\'t', 'don\'t', 'never',
      'impossible', 'pointless', 'tried that', 'doesn\'t work'
    ];

    const openessIndicators = [
      'maybe', 'perhaps', 'could', 'might', 'willing', 'try',
      'open', 'curious', 'interested', 'help me'
    ];

    const resistanceScore = this.countIndicators(text, resistanceIndicators);
    const opennessScore = this.countIndicators(text, openessIndicators);

    const totalIndicators = resistanceScore + opennessScore;
    if (totalIndicators === 0) return 0.3; // Low resistance default

    return resistanceScore / totalIndicators;
  }

  private assessIntegrationStrain(messages: any[]): number {
    const text = this.extractUserText(messages);

    // Indicators of cognitive overload
    const strainIndicators = [
      'overwhelming', 'too much', 'can\'t process', 'confused',
      'spinning', 'chaotic', 'scattered', 'overloaded'
    ];

    const clarityIndicators = [
      'clear', 'understand', 'makes sense', 'getting it',
      'coherent', 'organized', 'focused', 'integrated'
    ];

    const strainScore = this.countIndicators(text, strainIndicators);
    const clarityScore = this.countIndicators(text, clarityIndicators);

    const totalIndicators = strainScore + clarityScore;
    if (totalIndicators === 0) return 0.3; // Low strain default

    return strainScore / totalIndicators;
  }

  private assessVitalitySignal(messages: any[]): number {
    const text = this.extractUserText(messages);

    const vitalityIndicators = [
      'energized', 'alive', 'vibrant', 'inspired', 'passionate',
      'motivated', 'excited', 'flowing', 'creative'
    ];

    const depletionIndicators = [
      'exhausted', 'drained', 'tired', 'empty', 'numb',
      'lifeless', 'flat', 'depleted', 'burned out'
    ];

    const vitalityScore = this.countIndicators(text, vitalityIndicators);
    const depletionScore = this.countIndicators(text, depletionIndicators);

    const totalIndicators = vitalityScore + depletionScore;
    if (totalIndicators === 0) return 0.6; // Moderate vitality default

    return vitalityScore / totalIndicators;
  }

  private detectActivation(text: string): number {
    const highActivationWords = ['anxiety', 'panic', 'urgent', 'crisis', 'emergency', 'overwhelmed'];
    const calmWords = ['peaceful', 'calm', 'centered', 'grounded', 'relaxed', 'serene'];

    const activation = this.countIndicators(text, highActivationWords);
    const calm = this.countIndicators(text, calmWords);

    const total = activation + calm;
    if (total === 0) return 0.5;

    return activation / total;
  }

  private detectCoherence(text: string): number {
    const coherentWords = ['clear', 'understand', 'makes sense', 'coherent', 'integrated'];
    const fragmentedWords = ['confused', 'scattered', 'fragmented', 'chaotic', 'conflicted'];

    const coherent = this.countIndicators(text, coherentWords);
    const fragmented = this.countIndicators(text, fragmentedWords);

    const total = coherent + fragmented;
    if (total === 0) return 0.6;

    return coherent / total;
  }

  private detectReceptivity(text: string): number {
    const openWords = ['open', 'curious', 'willing', 'receptive', 'interested'];
    const closedWords = ['closed', 'resistant', 'defensive', 'guarded', 'suspicious'];

    const open = this.countIndicators(text, openWords);
    const closed = this.countIndicators(text, closedWords);

    const total = open + closed;
    if (total === 0) return 0.7; // Assume openness

    return open / total;
  }

  private detectVitality(text: string): number {
    const vitalWords = ['alive', 'energetic', 'vibrant', 'passionate', 'excited'];
    const depletedWords = ['exhausted', 'drained', 'empty', 'lifeless', 'depleted'];

    const vital = this.countIndicators(text, vitalWords);
    const depleted = this.countIndicators(text, depletedWords);

    const total = vital + depleted;
    if (total === 0) return 0.6;

    return vital / total;
  }

  private calculateOptimalFrequency(energetic: any) {
    const avgEnergy = (energetic.activation + energetic.coherence + energetic.receptivity + energetic.vitality) / 4;

    if (avgEnergy < 0.3) {
      return { resonance: "stabilize" as const, intensity: 0.3, duration: 0.8 };
    } else if (avgEnergy > 0.8) {
      return { resonance: "integrate" as const, intensity: 0.7, duration: 0.6 };
    } else if (energetic.receptivity > 0.7) {
      return { resonance: "activate" as const, intensity: 0.6, duration: 0.7 };
    } else {
      return { resonance: "match" as const, intensity: 0.5, duration: 0.5 };
    }
  }

  private extractUserText(messages: any[]): string {
    return messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ')
      .toLowerCase();
  }

  private countIndicators(text: string, indicators: string[]): number {
    return indicators.reduce((count, indicator) => {
      return count + (text.includes(indicator) ? 1 : 0);
    }, 0);
  }

  private getDefaultStress(): ConversationStress {
    return {
      therapeuticAlignment: 0.5,
      coherenceGap: 0.5,
      resistanceLevel: 0.3,
      integrationStrain: 0.3,
      vitalitySignal: 0.6
    };
  }

  private describeStressPattern(stress: ConversationStress): string {
    if (stress.resistanceLevel > 0.7) return "High resistance - needs gentle approach";
    if (stress.integrationStrain > 0.7) return "Integration overload - needs support";
    if (stress.therapeuticAlignment < 0.3) return "Off track - needs realignment";
    if (stress.coherenceGap < 0.3) return "Ready for growth - can handle complexity";
    return "Balanced state - standard therapeutic approach";
  }

  private describeEnergeticState(energetic: any): string {
    const { activation, coherence, receptivity, vitality } = energetic;

    let state = [];
    if (activation > 0.7) state.push("highly activated");
    else if (activation < 0.3) state.push("calm/grounded");

    if (coherence > 0.7) state.push("coherent");
    else if (coherence < 0.3) state.push("fragmented");

    if (receptivity > 0.7) state.push("open");
    else if (receptivity < 0.3) state.push("defended");

    if (vitality > 0.7) state.push("vital");
    else if (vitality < 0.3) state.push("depleted");

    return state.length > 0 ? state.join(", ") : "balanced";
  }

  private describeAdaptation(adaptation: ResponseAdaptation): string {
    return `${adaptation.style} approach with ${adaptation.complexity} complexity, ${adaptation.pacing} pacing, ${adaptation.depth} depth`;
  }

  private generateSpecificGuidance(adaptation: ResponseAdaptation, stress: ConversationStress, voltage: TherapeuticVoltage): string {
    switch (adaptation.style) {
      case "gentle_presence":
        return "User showing high resistance. Respond with unconditional presence, simple language, and validation. Avoid challenges or interpretations. Focus on creating safety.";

      case "expansion_challenge":
        return "User ready for growth. Can handle complexity, deeper insights, and gentle challenges. Invite exploration of new perspectives and unconscious material.";

      case "realignment":
        return "User off therapeutic track. Gently guide back to healing focus. Ask what would be most helpful. Clarify goals and reconnect with purpose.";

      case "integration_support":
      default:
        return "Balanced therapeutic approach. Support integration of insights, validate progress, and maintain steady therapeutic alliance. Follow user's lead.";
    }
  }
}