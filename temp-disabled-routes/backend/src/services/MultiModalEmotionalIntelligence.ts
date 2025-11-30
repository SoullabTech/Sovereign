/**
 * Multi-Modal Emotional Intelligence Engine
 * Real-time voice metrics analysis + contextual memory + collective learning
 */

import { Logger } from '../types/core';
import { ElementalSignature } from '../ain/collective/CollectiveIntelligence';
import { ToneAnalysis, EnergyLevel } from './AdaptiveProsodyEngine';

export interface VoiceMetrics {
  // Real-time prosodic features
  pitch: {
    mean: number;
    variance: number;
    trend: 'rising' | 'falling' | 'stable';
    jitter: number; // voice instability indicator
  };
  tempo: {
    wordsPerMinute: number;
    pauseDuration: number[];
    speechRhythm: 'regular' | 'irregular' | 'rushed' | 'hesitant';
  };
  volume: {
    mean: number;
    variance: number;
    dynamicRange: number;
    breathiness: number; // 0-1 scale
  };
  spectral: {
    formantClarity: number; // emotional articulation quality
    harmonicRatio: number; // voice quality indicator
    spectralCentroid: number; // brightness/darkness
    voiceStrain: number; // stress indicator
  };
  emotional: {
    arousal: number; // 0-1 activation level
    valence: number; // -1 to 1 positive/negative
    dominance: number; // 0-1 control/submission
    authenticity: number; // 0-1 genuine/performative
  };
}

export interface EmotionalState {
  primaryEmotion: string;
  emotionalIntensity: number;
  stressLevel: number;
  cognitiveLoad: number;
  socialEngagement: number;
  elementalResonance: ElementalSignature;
  therapeuticNeeds: string[];
}

export interface SessionMemory {
  userId: string;
  sessionId: string;
  emotionalBaseline: EmotionalState;
  prosodyPreferences: {
    preferredElements: (keyof ElementalSignature)[];
    effectiveMirrorDuration: 'brief' | 'moderate' | 'extended';
    optimalBalancingElements: Record<string, keyof ElementalSignature>;
    responsiveness: number; // how quickly they adapt to prosody changes
  };
  conversationHistory: {
    timestamp: Date;
    userEmotion: EmotionalState;
    agentResponse: string;
    prosodyApplied: any;
    userFeedback?: 'positive' | 'neutral' | 'negative';
  }[];
  biometricContext?: {
    timeOfDay: string;
    stressIndicators: number[];
    energyLevel: number;
    lastUpdate: Date;
  };
}

export class MultiModalEmotionalIntelligence {
  private sessionMemories: Map<string, SessionMemory> = new Map();
  private collectiveLearningData: Map<string, any> = new Map();
  private emotionalModels: Map<string, any> = new Map();

  constructor(private logger: Logger) {
    this.initializeEmotionalModels();
  }

  /**
   * Real-time voice metrics analysis with emotional state inference
   */
  async analyzeVoiceMetrics(
    audioBuffer: ArrayBuffer,
    existingMetrics?: Partial<VoiceMetrics>
  ): Promise<VoiceMetrics> {
    // This would integrate with actual audio processing libraries
    // For now, we'll create a sophisticated mock that demonstrates the concept
    
    const mockMetrics = this.generateAdvancedVoiceAnalysis(audioBuffer, existingMetrics);
    
    this.logger.info(`[MultiModal] Voice analysis complete: arousal=${mockMetrics.emotional.arousal.toFixed(2)}, valence=${mockMetrics.emotional.valence.toFixed(2)}`);
    
    return mockMetrics;
  }

  /**
   * Comprehensive emotional state mapping from multi-modal inputs
   */
  async mapEmotionalState(
    textInput: string,
    voiceMetrics: VoiceMetrics,
    sessionContext?: SessionMemory
  ): Promise<EmotionalState> {
    // Combine text sentiment, voice prosody, and historical patterns
    const textEmotion = this.analyzeTextEmotionalContent(textInput);
    const voiceEmotion = this.extractVoiceEmotionalState(voiceMetrics);
    const contextualEmotion = sessionContext ? this.getContextualEmotionalState(sessionContext) : null;

    // Weighted fusion of emotional indicators
    const emotionalState: EmotionalState = {
      primaryEmotion: this.determinePrimaryEmotion(textEmotion, voiceEmotion, contextualEmotion),
      emotionalIntensity: this.calculateEmotionalIntensity(voiceMetrics, textEmotion),
      stressLevel: this.assessStressLevel(voiceMetrics, textInput),
      cognitiveLoad: this.estimateCognitiveLoad(voiceMetrics, textInput),
      socialEngagement: this.measureSocialEngagement(voiceMetrics, textInput),
      elementalResonance: this.mapToElementalSignature(voiceMetrics, textEmotion),
      therapeuticNeeds: this.identifyTherapeuticNeeds(voiceMetrics, textEmotion, contextualEmotion)
    };

    this.logger.info(`[MultiModal] Emotional state: ${emotionalState.primaryEmotion} (intensity: ${emotionalState.emotionalIntensity.toFixed(2)})`);
    
    return emotionalState;
  }

  /**
   * Contextual memory enhancement with adaptive learning
   */
  async updateSessionMemory(
    userId: string,
    sessionId: string,
    emotionalState: EmotionalState,
    userInput: string,
    agentResponse?: string,
    prosodyApplied?: any,
    userFeedback?: 'positive' | 'neutral' | 'negative'
  ): Promise<void> {
    let memory = this.sessionMemories.get(`${userId}-${sessionId}`);
    
    if (!memory) {
      memory = {
        userId,
        sessionId,
        emotionalBaseline: emotionalState,
        prosodyPreferences: {
          preferredElements: ['air'], // Default starting preference
          effectiveMirrorDuration: 'moderate',
          optimalBalancingElements: {},
          responsiveness: 0.5
        },
        conversationHistory: []
      };
    }

    // Add to conversation history
    memory.conversationHistory.push({
      timestamp: new Date(),
      userEmotion: emotionalState,
      agentResponse: agentResponse || '',
      prosodyApplied,
      userFeedback
    });

    // Update prosody preferences based on feedback and patterns
    if (userFeedback === 'positive' && prosodyApplied) {
      this.updateProsodyPreferences(memory, prosodyApplied, emotionalState);
    }

    // Adapt baseline if significant shift detected
    if (this.isSignificantEmotionalShift(memory.emotionalBaseline, emotionalState)) {
      memory.emotionalBaseline = this.blendEmotionalStates(memory.emotionalBaseline, emotionalState, 0.3);
    }

    this.sessionMemories.set(`${userId}-${sessionId}`, memory);
    
    // Contribute to collective learning
    await this.updateCollectiveLearning(emotionalState, prosodyApplied, userFeedback);
  }

  /**
   * Generate adaptive prosody recommendations with collective intelligence
   */
  async generateAdaptiveProsodyRecommendation(
    emotionalState: EmotionalState,
    textResponse: string,
    sessionMemory?: SessionMemory
  ): Promise<any> {
    // Get personalized recommendations from session memory
    const personalizedRec = sessionMemory ? 
      this.getPersonalizedProsodyRecommendation(emotionalState, sessionMemory) : null;

    // Get collective intelligence recommendations
    const collectiveRec = await this.getCollectiveProsodyRecommendation(emotionalState);

    // Blend recommendations with weighting based on confidence
    const recommendation = this.blendProsodyRecommendations(
      personalizedRec,
      collectiveRec,
      emotionalState
    );

    // Apply therapeutic arc optimization
    const therapeuticRec = this.optimizeTherapeuticArc(recommendation, emotionalState);

    this.logger.info(`[MultiModal] Prosody recommendation: ${therapeuticRec.primaryElement} → ${therapeuticRec.balanceElement} (confidence: ${therapeuticRec.confidence})`);

    return therapeuticRec;
  }

  /**
   * Biometric integration for enhanced context
   */
  async integrateBiometricData(
    userId: string,
    sessionId: string,
    biometrics: {
      heartRateVariability?: number;
      stressIndicators?: number[];
      circadianPhase?: 'morning' | 'afternoon' | 'evening' | 'night';
      energyLevel?: number;
    }
  ): Promise<void> {
    const memoryKey = `${userId}-${sessionId}`;
    const memory = this.sessionMemories.get(memoryKey);
    
    if (memory) {
      memory.biometricContext = {
        timeOfDay: biometrics.circadianPhase || 'unknown',
        stressIndicators: biometrics.stressIndicators || [],
        energyLevel: biometrics.energyLevel || 0.5,
        lastUpdate: new Date()
      };
      
      this.sessionMemories.set(memoryKey, memory);
      this.logger.info(`[MultiModal] Biometric data integrated for user ${userId}`);
    }
  }

  /**
   * Deep semantic analysis for intent-aware prosody
   */
  async analyzeSemanticIntent(
    text: string,
    emotionalState: EmotionalState
  ): Promise<{
    primaryIntent: string;
    metaphoricalContent: string[];
    culturalContext: string;
    therapeuticOpportunity: string;
    recommendedArchetype: string;
  }> {
    const semanticAnalysis = {
      primaryIntent: this.extractPrimaryIntent(text),
      metaphoricalContent: this.detectMetaphors(text),
      culturalContext: this.assessCulturalContext(text, emotionalState),
      therapeuticOpportunity: this.identifyTherapeuticOpportunity(text, emotionalState),
      recommendedArchetype: this.selectOptimalArchetype(text, emotionalState)
    };

    this.logger.info(`[MultiModal] Semantic analysis: intent=${semanticAnalysis.primaryIntent}, archetype=${semanticAnalysis.recommendedArchetype}`);

    return semanticAnalysis;
  }

  // Private helper methods

  private initializeEmotionalModels(): void {
    // Initialize various emotional recognition models
    this.emotionalModels.set('voice-emotion', {
      arousalThresholds: { low: 0.3, medium: 0.6, high: 0.8 },
      valenceMapping: { negative: -0.5, neutral: 0.1, positive: 0.5 },
      stressIndicators: ['jitter', 'voiceStrain', 'irregularRhythm']
    });
    
    this.emotionalModels.set('text-sentiment', {
      emotionKeywords: {
        joy: ['happy', 'excited', 'wonderful', 'amazing', 'love'],
        fear: ['worried', 'scared', 'anxious', 'nervous', 'afraid'],
        anger: ['frustrated', 'angry', 'mad', 'irritated', 'furious'],
        sadness: ['sad', 'depressed', 'down', 'upset', 'disappointed'],
        surprise: ['wow', 'unexpected', 'amazed', 'shocked', 'incredible']
      }
    });
  }

  private generateAdvancedVoiceAnalysis(
    audioBuffer: ArrayBuffer,
    existingMetrics?: Partial<VoiceMetrics>
  ): VoiceMetrics {
    // Sophisticated mock that would integrate with real audio processing
    // In production, this would use libraries like WebAudio API, TensorFlow.js, or specialized audio ML models
    
    const baseMetrics = existingMetrics || {};
    const bufferSize = audioBuffer.byteLength;
    
    // Simulate realistic voice analysis based on audio buffer characteristics
    return {
      pitch: {
        mean: baseMetrics.pitch?.mean || (120 + Math.random() * 80), // Hz
        variance: baseMetrics.pitch?.variance || (5 + Math.random() * 15),
        trend: baseMetrics.pitch?.trend || (['rising', 'falling', 'stable'] as const)[Math.floor(Math.random() * 3)],
        jitter: Math.random() * 0.02 // 0-2% jitter
      },
      tempo: {
        wordsPerMinute: 140 + Math.random() * 60,
        pauseDuration: Array.from({length: 5}, () => Math.random() * 2),
        speechRhythm: (['regular', 'irregular', 'rushed', 'hesitant'] as const)[Math.floor(Math.random() * 4)]
      },
      volume: {
        mean: 0.4 + Math.random() * 0.4,
        variance: Math.random() * 0.2,
        dynamicRange: 0.3 + Math.random() * 0.4,
        breathiness: Math.random() * 0.3
      },
      spectral: {
        formantClarity: 0.6 + Math.random() * 0.3,
        harmonicRatio: 0.7 + Math.random() * 0.2,
        spectralCentroid: 1000 + Math.random() * 2000,
        voiceStrain: Math.random() * 0.4
      },
      emotional: {
        arousal: Math.random(),
        valence: (Math.random() - 0.5) * 2,
        dominance: Math.random(),
        authenticity: 0.6 + Math.random() * 0.3
      }
    };
  }

  private analyzeTextEmotionalContent(text: string): any {
    const words = text.toLowerCase().split(/\s+/);
    const model = this.emotionalModels.get('text-sentiment');
    
    let emotionScores = {
      joy: 0, fear: 0, anger: 0, sadness: 0, surprise: 0
    };
    
    words.forEach(word => {
      Object.entries(model.emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.includes(word)) {
          emotionScores[emotion as keyof typeof emotionScores] += 1;
        }
      });
    });
    
    return emotionScores;
  }

  private extractVoiceEmotionalState(voiceMetrics: VoiceMetrics): any {
    return {
      arousal: voiceMetrics.emotional.arousal,
      valence: voiceMetrics.emotional.valence,
      stressLevel: voiceMetrics.spectral.voiceStrain + voiceMetrics.pitch.jitter,
      engagement: voiceMetrics.emotional.dominance * voiceMetrics.emotional.authenticity
    };
  }

  private getContextualEmotionalState(memory: SessionMemory): any {
    if (memory.conversationHistory.length === 0) return null;
    
    // Analyze recent emotional trajectory
    const recent = memory.conversationHistory.slice(-3);
    return {
      trajectory: this.calculateEmotionalTrajectory(recent),
      baseline: memory.emotionalBaseline,
      preferences: memory.prosodyPreferences
    };
  }

  private determinePrimaryEmotion(textEmotion: any, voiceEmotion: any, contextual: any): string {
    // Weight different inputs and determine primary emotion
    if (voiceEmotion.arousal > 0.7) {
      return voiceEmotion.valence > 0 ? 'excitement' : 'agitation';
    } else if (voiceEmotion.arousal < 0.3) {
      return voiceEmotion.valence > 0 ? 'calm' : 'melancholy';
    }
    
    // Find highest scoring text emotion
    const maxTextEmotion = Object.entries(textEmotion)
      .reduce((a, b) => textEmotion[a[0]] > textEmotion[b[0]] ? a : b)[0];
    
    return maxTextEmotion;
  }

  private calculateEmotionalIntensity(voiceMetrics: VoiceMetrics, textEmotion: any): number {
    const voiceIntensity = (voiceMetrics.emotional.arousal + voiceMetrics.volume.dynamicRange) / 2;
    const textIntensity = Math.max(...Object.values(textEmotion)) / 10; // Normalize
    
    return (voiceIntensity * 0.7 + textIntensity * 0.3); // Voice weighted higher
  }

  private assessStressLevel(voiceMetrics: VoiceMetrics, text: string): number {
    let stressScore = 0;
    
    // Voice indicators
    stressScore += voiceMetrics.spectral.voiceStrain * 0.3;
    stressScore += voiceMetrics.pitch.jitter * 10; // Normalize jitter
    stressScore += voiceMetrics.tempo.speechRhythm === 'rushed' ? 0.2 : 0;
    
    // Text indicators
    const stressWords = ['stressed', 'overwhelmed', 'pressure', 'urgent', 'can\'t'];
    const stressCount = stressWords.reduce((count, word) => 
      count + (text.toLowerCase().includes(word) ? 1 : 0), 0);
    stressScore += stressCount * 0.1;
    
    return Math.min(1.0, stressScore);
  }

  private estimateCognitiveLoad(voiceMetrics: VoiceMetrics, text: string): number {
    // Cognitive load indicators
    const pauseComplexity = voiceMetrics.tempo.pauseDuration.length / 10;
    const speechHesitation = voiceMetrics.tempo.speechRhythm === 'hesitant' ? 0.3 : 0;
    const textComplexity = text.split(' ').length > 50 ? 0.2 : 0;
    
    return Math.min(1.0, pauseComplexity + speechHesitation + textComplexity);
  }

  private measureSocialEngagement(voiceMetrics: VoiceMetrics, text: string): number {
    const authenticity = voiceMetrics.emotional.authenticity;
    const dominance = voiceMetrics.emotional.dominance;
    const textEngagement = text.includes('?') ? 0.2 : 0; // Questions indicate engagement
    
    return Math.min(1.0, (authenticity + dominance) / 2 + textEngagement);
  }

  private mapToElementalSignature(voiceMetrics: VoiceMetrics, textEmotion: any): ElementalSignature {
    const signature: ElementalSignature = {
      fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2
    };
    
    // Voice-based elemental mapping
    if (voiceMetrics.emotional.arousal > 0.6) signature.fire += 0.3;
    if (voiceMetrics.emotional.valence < -0.3) signature.water += 0.2;
    if (voiceMetrics.tempo.wordsPerMinute < 120) signature.earth += 0.2;
    if (voiceMetrics.spectral.formantClarity > 0.8) signature.air += 0.2;
    if (voiceMetrics.emotional.authenticity > 0.8) signature.aether += 0.2;
    
    // Normalize
    const total = Object.values(signature).reduce((sum, val) => sum + val, 0);
    Object.keys(signature).forEach(key => {
      signature[key as keyof ElementalSignature] /= total;
    });
    
    return signature;
  }

  private identifyTherapeuticNeeds(voiceMetrics: VoiceMetrics, textEmotion: any, contextual: any): string[] {
    const needs: string[] = [];
    
    if (voiceMetrics.spectral.voiceStrain > 0.6) needs.push('stress-relief');
    if (voiceMetrics.emotional.arousal > 0.8) needs.push('grounding');
    if (voiceMetrics.emotional.arousal < 0.2) needs.push('activation');
    if (voiceMetrics.emotional.valence < -0.5) needs.push('uplift');
    if (textEmotion.sadness > 2) needs.push('comfort');
    if (textEmotion.anger > 2) needs.push('cooling');
    
    return needs;
  }

  // Additional helper methods for advanced functionality...
  
  private updateProsodyPreferences(memory: SessionMemory, prosodyApplied: any, emotionalState: EmotionalState): void {
    // Learn from positive feedback to improve future recommendations
    if (prosodyApplied.element) {
      const element = prosodyApplied.element as keyof ElementalSignature;
      if (!memory.prosodyPreferences.preferredElements.includes(element)) {
        memory.prosodyPreferences.preferredElements.push(element);
      }
    }
  }

  private isSignificantEmotionalShift(baseline: EmotionalState, current: EmotionalState): boolean {
    return Math.abs(baseline.emotionalIntensity - current.emotionalIntensity) > 0.3 ||
           baseline.primaryEmotion !== current.primaryEmotion;
  }

  private blendEmotionalStates(state1: EmotionalState, state2: EmotionalState, weight: number): EmotionalState {
    return {
      ...state1,
      emotionalIntensity: state1.emotionalIntensity * (1 - weight) + state2.emotionalIntensity * weight,
      stressLevel: state1.stressLevel * (1 - weight) + state2.stressLevel * weight
    };
  }

  private async updateCollectiveLearning(emotionalState: EmotionalState, prosodyApplied: any, feedback?: string): Promise<void> {
    // Contribute to collective intelligence database
    const key = `${emotionalState.primaryEmotion}-${emotionalState.emotionalIntensity.toFixed(1)}`;
    
    if (!this.collectiveLearningData.has(key)) {
      this.collectiveLearningData.set(key, { successes: 0, attempts: 0, patterns: [] });
    }
    
    const data = this.collectiveLearningData.get(key);
    data.attempts += 1;
    if (feedback === 'positive') data.successes += 1;
    data.patterns.push(prosodyApplied);
    
    this.collectiveLearningData.set(key, data);
  }

  private getPersonalizedProsodyRecommendation(emotionalState: EmotionalState, memory: SessionMemory): any {
    // Use personal history to generate recommendations
    return {
      confidence: 0.8,
      element: memory.prosodyPreferences.preferredElements[0],
      mirrorDuration: memory.prosodyPreferences.effectiveMirrorDuration
    };
  }

  private async getCollectiveProsodyRecommendation(emotionalState: EmotionalState): Promise<any> {
    const key = `${emotionalState.primaryEmotion}-${emotionalState.emotionalIntensity.toFixed(1)}`;
    const data = this.collectiveLearningData.get(key);
    
    if (data && data.attempts > 10) {
      // Return most successful pattern
      return {
        confidence: data.successes / data.attempts,
        patterns: data.patterns
      };
    }
    
    return { confidence: 0.3, patterns: [] };
  }

  private blendProsodyRecommendations(personal: any, collective: any, emotionalState: EmotionalState): any {
    // Intelligent blending of recommendations
    const personalWeight = personal?.confidence || 0;
    const collectiveWeight = collective?.confidence || 0;
    
    return {
      primaryElement: personal?.element || 'air',
      balanceElement: this.selectBalancingElement(emotionalState),
      confidence: Math.max(personalWeight, collectiveWeight),
      approach: personalWeight > collectiveWeight ? 'personalized' : 'collective'
    };
  }

  private optimizeTherapeuticArc(recommendation: any, emotionalState: EmotionalState): any {
    // Apply therapeutic arc optimization based on emotional state
    if (emotionalState.therapeuticNeeds.includes('grounding')) {
      recommendation.balanceElement = 'earth';
    } else if (emotionalState.therapeuticNeeds.includes('activation')) {
      recommendation.balanceElement = 'fire';
    }
    
    return recommendation;
  }

  private selectBalancingElement(emotionalState: EmotionalState): keyof ElementalSignature {
    // Select appropriate balancing element based on therapeutic needs
    const needs = emotionalState.therapeuticNeeds;
    
    if (needs.includes('grounding')) return 'earth';
    if (needs.includes('cooling')) return 'water';
    if (needs.includes('activation')) return 'fire';
    if (needs.includes('clarity')) return 'air';
    
    return 'aether'; // Default to aether for balance
  }

  private calculateEmotionalTrajectory(history: any[]): string {
    if (history.length < 2) return 'stable';
    
    const intensities = history.map(h => h.userEmotion.emotionalIntensity);
    const trend = intensities[intensities.length - 1] - intensities[0];
    
    if (trend > 0.2) return 'escalating';
    if (trend < -0.2) return 'de-escalating';
    return 'stable';
  }

  private extractPrimaryIntent(text: string): string {
    // Semantic intent analysis
    if (text.includes('?')) return 'seeking';
    if (text.match(/help|support|need/i)) return 'assistance';
    if (text.match(/feel|emotion|heart/i)) return 'expression';
    if (text.match(/think|understand|know/i)) return 'comprehension';
    
    return 'conversation';
  }

  private detectMetaphors(text: string): string[] {
    // Simple metaphor detection - in production would use NLP models
    const metaphors: string[] = [];
    
    if (text.match(/like|as|seems|feels like/i)) metaphors.push('simile');
    if (text.match(/storm|fire|mountain|ocean|river/i)) metaphors.push('nature');
    if (text.match(/journey|path|bridge|door|wall/i)) metaphors.push('movement');
    
    return metaphors;
  }

  private assessCulturalContext(text: string, emotionalState: EmotionalState): string {
    // Cultural context assessment - placeholder for more sophisticated analysis
    return 'western-therapeutic';
  }

  private identifyTherapeuticOpportunity(text: string, emotionalState: EmotionalState): string {
    if (emotionalState.stressLevel > 0.7) return 'stress-reduction';
    if (emotionalState.emotionalIntensity < 0.3) return 'energy-activation';
    if (emotionalState.primaryEmotion === 'sadness') return 'emotional-support';
    
    return 'general-wellbeing';
  }

  private selectOptimalArchetype(text: string, emotionalState: EmotionalState): string {
    if (text.match(/wisdom|understand|learn/i)) return 'sage';
    if (text.match(/future|vision|see/i)) return 'oracle';
    if (emotionalState.therapeuticNeeds.includes('comfort')) return 'companion';
    
    return 'guide';
  }
}

export default MultiModalEmotionalIntelligence;