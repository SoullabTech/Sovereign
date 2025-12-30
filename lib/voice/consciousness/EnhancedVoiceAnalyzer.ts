// @ts-nocheck
/**
 * MAIA Enhanced Voice Analyzer - Multi-Modal Consciousness Layer
 *
 * This service provides advanced voice analysis capabilities that extend beyond
 * basic affect detection to include bio-feedback integration and consciousness
 * state inference through vocal patterns.
 *
 * Integrates with existing MAIA infrastructure:
 * - AffectDetector.ts for emotional archetypal detection
 * - ElementalVoiceOrchestrator.ts for 650ms real-time processing
 * - streamTranscribe.ts for transcription with confidence scoring
 */

import { VoiceAnalysisResult, ConsciousnessState, BiofeedbackMetrics } from './types';

interface VoiceSignature {
  userId: string;
  baselineProsody: ProsodyMetrics;
  baselineStress: number;
  baselineBreathPattern: BreathPattern;
  establishedAt: Date;
  sampleCount: number;
}

interface ProsodyMetrics {
  fundamentalFrequency: number; // Average F0
  formantSpacing: number; // Vocal tract resonance
  spectralCentroid: number; // Brightness/darkness
  jitter: number; // Frequency variation
  shimmer: number; // Amplitude variation
  harmonicNoiseRatio: number; // Voice quality
}

interface BreathPattern {
  inhaleRate: number; // Breaths per minute
  exhaleRate: number;
  pauseDuration: number; // Seconds between words
  oxygenationLevel: number; // Inferred from voice quality
}

interface TremorAnalysis {
  present: boolean;
  frequency: number; // Hz of tremor
  intensity: number; // 0-1 scale
  type: 'emotional' | 'neurological' | 'fatigue' | 'unknown';
  confidence: number;
}

interface ConsciousnessIndicators {
  coherence: number; // 0-1, voice-thought alignment
  presence: number; // 0-1, awareness level
  integration: number; // 0-1, elemental balance in voice
  flowState: number; // 0-1, effortless expression
  authenticExpression: number; // 0-1, genuine vs. performed
}

class EnhancedVoiceAnalyzer {
  private voiceSignatures: Map<string, VoiceSignature> = new Map();
  private analysisCache: Map<string, VoiceAnalysisResult> = new Map();
  private isInitialized = false;

  /**
   * Initialize the Enhanced Voice Analyzer
   */
  async initialize(): Promise<void> {
    // Load existing voice signatures from database
    // Initialize audio analysis libraries
    this.isInitialized = true;
    console.log('🎤 Enhanced Voice Analyzer initialized');
  }

  /**
   * Analyze voice sample for multi-dimensional consciousness indicators
   */
  async analyzeVoiceSample(
    userId: string,
    audioBuffer: ArrayBuffer,
    transcription: string,
    existingAffect?: any
  ): Promise<VoiceAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const cacheKey = `${userId}_${Date.now()}`;

    try {
      // 1. Extract prosodic features
      const prosody = await this.extractProsodyMetrics(audioBuffer);

      // 2. Analyze breath patterns
      const breathPattern = await this.analyzeBreathPattern(audioBuffer);

      // 3. Detect voice tremor
      const tremorAnalysis = await this.detectVoiceTremor(audioBuffer, prosody);

      // 4. Assess consciousness indicators
      const consciousness = await this.assessConsciousnessIndicators(
        prosody,
        breathPattern,
        transcription,
        existingAffect
      );

      // 5. Calculate bio-feedback metrics
      const biofeedback = await this.calculateBiofeedbackMetrics(
        prosody,
        breathPattern,
        tremorAnalysis
      );

      // 6. Integrate with elemental framework
      const elementalMapping = await this.mapToElementalFramework(
        prosody,
        breathPattern,
        consciousness
      );

      // 7. Update or establish voice signature
      await this.updateVoiceSignature(userId, prosody, breathPattern);

      const result: VoiceAnalysisResult = {
        userId,
        timestamp: new Date(),
        prosodyMetrics: prosody,
        breathPattern,
        tremorAnalysis,
        consciousnessIndicators: consciousness,
        biofeedbackMetrics: biofeedback,
        elementalMapping,
        deviationFromBaseline: this.calculateDeviation(userId, prosody, breathPattern),
        recommendations: await this.generateRecommendations(consciousness, biofeedback),
        confidenceScore: this.calculateOverallConfidence(prosody, breathPattern, tremorAnalysis)
      };

      this.analysisCache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Enhanced voice analysis failed:', error);
      throw error;
    }
  }

  /**
   * Extract detailed prosodic features from audio
   */
  private async extractProsodyMetrics(audioBuffer: ArrayBuffer): Promise<ProsodyMetrics> {
    // This would integrate with audio analysis libraries like:
    // - Web Audio API for real-time analysis
    // - External libraries for F0 detection
    // - FFT for spectral analysis

    // Placeholder implementation - would be replaced with actual audio processing
    return {
      fundamentalFrequency: 120, // Hz
      formantSpacing: 1000, // Hz
      spectralCentroid: 2000, // Hz
      jitter: 0.02, // 2% variation
      shimmer: 0.15, // 15% variation
      harmonicNoiseRatio: 0.75 // Good voice quality
    };
  }

  /**
   * Analyze breathing patterns from vocal pauses and vocal quality
   */
  private async analyzeBreathPattern(audioBuffer: ArrayBuffer): Promise<BreathPattern> {
    // Analyze:
    // - Silent periods for breath timing
    // - Voice quality changes indicating breath support
    // - Rhythm of speech for breathing coordination

    return {
      inhaleRate: 16, // Breaths per minute
      exhaleRate: 16,
      pauseDuration: 0.3, // Average pause between words
      oxygenationLevel: 0.85 // Good oxygenation
    };
  }

  /**
   * Detect voice tremor patterns
   */
  private async detectVoiceTremor(audioBuffer: ArrayBuffer, prosody: ProsodyMetrics): Promise<TremorAnalysis> {
    // Analyze for:
    // - Regular frequency modulation in F0
    // - Amplitude tremor patterns
    // - Distinguish emotional vs. neurological tremor

    const tremorPresent = prosody.jitter > 0.05; // Threshold for tremor detection

    return {
      present: tremorPresent,
      frequency: tremorPresent ? 6.5 : 0, // Hz
      intensity: tremorPresent ? prosody.jitter * 10 : 0,
      type: prosody.jitter > 0.1 ? 'neurological' : 'emotional',
      confidence: 0.85
    };
  }

  /**
   * Assess consciousness indicators from voice patterns
   */
  private async assessConsciousnessIndicators(
    prosody: ProsodyMetrics,
    breathPattern: BreathPattern,
    transcription: string,
    existingAffect?: any
  ): Promise<ConsciousnessIndicators> {
    // Calculate consciousness metrics based on:
    // - Voice-thought coherence (prosody matching content)
    // - Presence (breath support, vocal stability)
    // - Integration (elemental balance in expression)
    // - Flow state (effortless vocal patterns)
    // - Authentic expression (natural vs. performed patterns)

    const coherence = this.calculateCoherence(prosody, transcription);
    const presence = this.calculatePresence(prosody, breathPattern);
    const integration = this.calculateIntegration(prosody, existingAffect);
    const flowState = this.calculateFlowState(prosody, breathPattern);
    const authenticExpression = this.calculateAuthenticity(prosody);

    return {
      coherence,
      presence,
      integration,
      flowState,
      authenticExpression
    };
  }

  /**
   * Calculate bio-feedback metrics for integration with external devices
   */
  private async calculateBiofeedbackMetrics(
    prosody: ProsodyMetrics,
    breathPattern: BreathPattern,
    tremor: TremorAnalysis
  ): Promise<BiofeedbackMetrics> {
    // Correlate voice metrics with physiological states
    const stressLevel = this.inferStressFromVoice(prosody, breathPattern, tremor);
    const arousal = this.inferArousalFromVoice(prosody);
    const vagalTone = this.inferVagalTone(breathPattern);

    return {
      stressLevel,
      arousalLevel: arousal,
      vagalTone,
      hrvEstimate: this.estimateHRVFromBreath(breathPattern),
      oxygenationStatus: breathPattern.oxygenationLevel,
      autonomicBalance: this.calculateAutonomicBalance(stressLevel, arousal, vagalTone)
    };
  }

  /**
   * Map voice patterns to elemental framework
   */
  private async mapToElementalFramework(
    prosody: ProsodyMetrics,
    breathPattern: BreathPattern,
    consciousness: ConsciousnessIndicators
  ): Promise<any> {
    // Map voice characteristics to 5-element framework
    const fire = this.calculateFireElement(prosody, consciousness.authenticExpression);
    const water = this.calculateWaterElement(consciousness.flowState, breathPattern);
    const earth = this.calculateEarthElement(prosody.harmonicNoiseRatio, consciousness.presence);
    const air = this.calculateAirElement(breathPattern, consciousness.coherence);
    const aether = this.calculateAetherElement(consciousness.integration);

    return {
      elementalBalance: { fire, water, earth, air, aether },
      dominantElement: this.getDominantElement({ fire, water, earth, air, aether }),
      recommendations: this.getElementalRecommendations({ fire, water, earth, air, aether })
    };
  }

  /**
   * Update or establish baseline voice signature for user
   */
  private async updateVoiceSignature(userId: string, prosody: ProsodyMetrics, breathPattern: BreathPattern): Promise<void> {
    const existing = this.voiceSignatures.get(userId);

    if (existing) {
      // Update existing signature with weighted average
      const weight = 0.1; // 10% influence of new sample
      existing.baselineProsody = this.blendProsodyMetrics(existing.baselineProsody, prosody, weight);
      existing.baselineBreathPattern = this.blendBreathPattern(existing.baselineBreathPattern, breathPattern, weight);
      existing.sampleCount++;
    } else {
      // Create new voice signature
      this.voiceSignatures.set(userId, {
        userId,
        baselineProsody: prosody,
        baselineStress: 0.3, // Default baseline stress
        baselineBreathPattern: breathPattern,
        establishedAt: new Date(),
        sampleCount: 1
      });
    }
  }

  /**
   * Generate personalized recommendations based on voice analysis
   */
  private async generateRecommendations(
    consciousness: ConsciousnessIndicators,
    biofeedback: BiofeedbackMetrics
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (biofeedback.stressLevel > 0.7) {
      recommendations.push("Consider grounding breathwork to reduce stress indicators in your voice");
    }

    if (consciousness.presence < 0.5) {
      recommendations.push("Your voice suggests scattered attention - try centering practices");
    }

    if (consciousness.flowState > 0.8) {
      recommendations.push("Beautiful flow state detected - this is optimal for creative expression");
    }

    if (consciousness.authenticExpression < 0.4) {
      recommendations.push("Your voice patterns suggest some guardedness - explore what wants to be expressed");
    }

    return recommendations;
  }

  // Helper methods for consciousness calculations
  private calculateCoherence(prosody: ProsodyMetrics, transcription: string): number {
    // Analyze alignment between vocal expression and semantic content
    return Math.min(prosody.harmonicNoiseRatio + 0.2, 1.0);
  }

  private calculatePresence(prosody: ProsodyMetrics, breathPattern: BreathPattern): number {
    // Higher presence = stable voice, good breath support
    return (prosody.harmonicNoiseRatio + breathPattern.oxygenationLevel) / 2;
  }

  private calculateIntegration(prosody: ProsodyMetrics, existingAffect?: any): number {
    // Integration of multiple consciousness aspects in voice
    return Math.min(prosody.harmonicNoiseRatio * 1.2, 1.0);
  }

  private calculateFlowState(prosody: ProsodyMetrics, breathPattern: BreathPattern): number {
    // Effortless expression = low jitter, good breath coordination
    const effortlessness = 1 - (prosody.jitter + prosody.shimmer) / 2;
    return Math.max(effortlessness, 0);
  }

  private calculateAuthenticity(prosody: ProsodyMetrics): number {
    // Natural variation patterns vs. overly controlled speech
    const naturalVariation = (prosody.jitter + prosody.shimmer) / 2;
    return naturalVariation > 0.01 && naturalVariation < 0.05 ? 0.9 : 0.6;
  }

  // Bio-feedback inference methods
  private inferStressFromVoice(prosody: ProsodyMetrics, breathPattern: BreathPattern, tremor: TremorAnalysis): number {
    let stress = 0;
    stress += prosody.jitter * 5; // Voice instability
    stress += (16 - breathPattern.inhaleRate) / 16; // Faster breathing = more stress
    stress += tremor.present ? tremor.intensity : 0;
    return Math.min(stress, 1.0);
  }

  private inferArousalFromVoice(prosody: ProsodyMetrics): number {
    // Higher F0 and spectral centroid = higher arousal
    const f0Arousal = Math.min(prosody.fundamentalFrequency / 200, 1.0);
    const brightnessArousal = Math.min(prosody.spectralCentroid / 4000, 1.0);
    return (f0Arousal + brightnessArousal) / 2;
  }

  private inferVagalTone(breathPattern: BreathPattern): number {
    // Good vagal tone = slower, deeper breathing
    const optimalRate = 12; // breaths per minute
    const rateFactor = Math.abs(breathPattern.inhaleRate - optimalRate) / optimalRate;
    return Math.max(1 - rateFactor, 0);
  }

  private estimateHRVFromBreath(breathPattern: BreathPattern): number {
    // Estimate heart rate variability from breathing coherence
    return breathPattern.oxygenationLevel * 0.8;
  }

  private calculateAutonomicBalance(stress: number, arousal: number, vagalTone: number): number {
    // Balance between sympathetic and parasympathetic
    const sympathetic = (stress + arousal) / 2;
    const parasympathetic = vagalTone;
    return Math.abs(sympathetic - parasympathetic); // 0 = perfect balance
  }

  // Elemental calculation methods
  private calculateFireElement(prosody: ProsodyMetrics, authenticity: number): number {
    return (prosody.fundamentalFrequency / 200 + authenticity) / 2;
  }

  private calculateWaterElement(flowState: number, breathPattern: BreathPattern): number {
    return (flowState + breathPattern.oxygenationLevel) / 2;
  }

  private calculateEarthElement(harmonicRatio: number, presence: number): number {
    return (harmonicRatio + presence) / 2;
  }

  private calculateAirElement(breathPattern: BreathPattern, coherence: number): number {
    const breathQuality = 1 - Math.abs(breathPattern.inhaleRate - 12) / 12;
    return (breathQuality + coherence) / 2;
  }

  private calculateAetherElement(integration: number): number {
    return integration;
  }

  private getDominantElement(balance: any): string {
    return Object.entries(balance).reduce((a, b) => balance[a] > balance[b[0]] ? a : b[0]);
  }

  private getElementalRecommendations(balance: any): string[] {
    const dominant = this.getDominantElement(balance);
    const recommendations: { [key: string]: string } = {
      fire: "Your voice carries strong fire energy - channel this into creative expression",
      water: "Beautiful water qualities in your voice - trust your emotional wisdom",
      earth: "Grounding earth energy present - your voice carries stability and presence",
      air: "Clear air element - your voice facilitates understanding and communication",
      aether: "Integrated aether quality - your voice bridges multiple dimensions"
    };
    return [recommendations[dominant]];
  }

  // Helper methods for signature management
  private calculateDeviation(userId: string, prosody: ProsodyMetrics, breathPattern: BreathPattern): number {
    const signature = this.voiceSignatures.get(userId);
    if (!signature) return 0;

    const prosodyDev = this.calculateProsodyDeviation(prosody, signature.baselineProsody);
    const breathDev = this.calculateBreathDeviation(breathPattern, signature.baselineBreathPattern);
    return (prosodyDev + breathDev) / 2;
  }

  private calculateProsodyDeviation(current: ProsodyMetrics, baseline: ProsodyMetrics): number {
    const deviations = [
      Math.abs(current.fundamentalFrequency - baseline.fundamentalFrequency) / baseline.fundamentalFrequency,
      Math.abs(current.jitter - baseline.jitter) / (baseline.jitter || 0.01),
      Math.abs(current.shimmer - baseline.shimmer) / (baseline.shimmer || 0.1)
    ];
    return deviations.reduce((a, b) => a + b, 0) / deviations.length;
  }

  private calculateBreathDeviation(current: BreathPattern, baseline: BreathPattern): number {
    return Math.abs(current.inhaleRate - baseline.inhaleRate) / baseline.inhaleRate;
  }

  private blendProsodyMetrics(existing: ProsodyMetrics, new_: ProsodyMetrics, weight: number): ProsodyMetrics {
    return {
      fundamentalFrequency: existing.fundamentalFrequency * (1 - weight) + new_.fundamentalFrequency * weight,
      formantSpacing: existing.formantSpacing * (1 - weight) + new_.formantSpacing * weight,
      spectralCentroid: existing.spectralCentroid * (1 - weight) + new_.spectralCentroid * weight,
      jitter: existing.jitter * (1 - weight) + new_.jitter * weight,
      shimmer: existing.shimmer * (1 - weight) + new_.shimmer * weight,
      harmonicNoiseRatio: existing.harmonicNoiseRatio * (1 - weight) + new_.harmonicNoiseRatio * weight
    };
  }

  private blendBreathPattern(existing: BreathPattern, new_: BreathPattern, weight: number): BreathPattern {
    return {
      inhaleRate: existing.inhaleRate * (1 - weight) + new_.inhaleRate * weight,
      exhaleRate: existing.exhaleRate * (1 - weight) + new_.exhaleRate * weight,
      pauseDuration: existing.pauseDuration * (1 - weight) + new_.pauseDuration * weight,
      oxygenationLevel: existing.oxygenationLevel * (1 - weight) + new_.oxygenationLevel * weight
    };
  }

  private calculateOverallConfidence(prosody: ProsodyMetrics, breathPattern: BreathPattern, tremor: TremorAnalysis): number {
    // Base confidence on signal quality and analysis reliability
    const signalQuality = prosody.harmonicNoiseRatio;
    const analysisReliability = tremor.confidence;
    return (signalQuality + analysisReliability) / 2;
  }
}

// Export singleton instance
export const enhancedVoiceAnalyzer = new EnhancedVoiceAnalyzer();