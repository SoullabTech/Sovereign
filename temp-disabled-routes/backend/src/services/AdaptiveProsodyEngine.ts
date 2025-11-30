/**
 * Adaptive Prosody Engine
 * Detects emotional tone from user input and generates balanced therapeutic response patterns
 * Implements the "mirror → guide to balance" therapeutic arc
 */

import { Logger } from '../types/core';
import { ElementalSignature } from '../ain/collective/CollectiveIntelligence';
import MultiModalEmotionalIntelligence, { VoiceMetrics, EmotionalState, SessionMemory } from './MultiModalEmotionalIntelligence';

type Element = "fire" | "water" | "earth" | "air" | "aether";

interface DetectionResult {
  elements: { element: Element; confidence: number }[];
  resistance: boolean;
}

export enum EnergyLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM_LOW = 'medium_low',
  MEDIUM = 'medium',
  MEDIUM_HIGH = 'medium_high',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export interface ToneAnalysis {
  dominantElement: keyof ElementalSignature;
  elementalBalance: ElementalSignature;
  energyLevel: EnergyLevel;
  emotionalQualities: string[];
  tempo: 'slow' | 'moderate' | 'fast';
  needsBalancing: boolean;
  suggestedBalance: keyof ElementalSignature;
  // Enhanced with multi-modal data
  voiceMetrics?: VoiceMetrics;
  emotionalState?: EmotionalState;
  confidenceScore: number;
  multiModalTags: string[];
  // Adaptive branching fields
  mixedTones?: {
    primary: keyof ElementalSignature;
    secondary: keyof ElementalSignature;
    ratio: number; // 0.5-1.0, where 1.0 = pure primary, 0.5 = equal mix
  };
  resistanceFlags?: {
    uncertainty: boolean;
    defensiveness: boolean;
    overwhelm: boolean;
    disconnection: boolean;
  };
}

export interface ContextFlags {
  overwhelmed: boolean;
  uncertain: boolean;
  stuck: boolean;
}

export interface ProsodyResponse {
  mirrorPhase: {
    element: keyof ElementalSignature;
    duration: 'brief' | 'moderate' | 'extended';
    text: string;
  };
  balancePhase: {
    element: keyof ElementalSignature;
    transition: 'gentle' | 'moderate' | 'decisive';
    text: string;
  };
  voiceParameters: {
    speed: number; // 0.5 - 2.0
    pitch: number; // -20 to 20
    emphasis: number; // 0 - 1
    warmth: number; // 0 - 1
  };
}

export class AdaptiveProsodyEngine {
  private readonly balancingRules: Map<string, string[]>;
  private readonly jungianOpposites: Map<string, string>;
  private readonly adjacentElements: Map<string, string[]>;
  private readonly multiModalEI: MultiModalEmotionalIntelligence;
  
  constructor(private logger: Logger) {
    this.multiModalEI = new MultiModalEmotionalIntelligence(logger);
    
    // Jungian Polarity Opposites
    this.jungianOpposites = new Map([
      ['fire', 'earth'],    // Fire ↔ Earth
      ['earth', 'fire'],    // Earth ↔ Fire
      ['air', 'water'],     // Air ↔ Water
      ['water', 'air'],     // Water ↔ Air
      ['aether', 'earth']   // Aether → Earth (grounding transcendence)
    ]);
    
    // Adjacent elements for softening
    this.adjacentElements = new Map([
      ['fire', ['air', 'aether']],     // Fire's adjacent: Air (thought), Aether (spirit)
      ['air', ['fire', 'water']],      // Air's adjacent: Fire (energy), Water (feeling)
      ['water', ['air', 'earth']],     // Water's adjacent: Air (mind), Earth (body)
      ['earth', ['water', 'fire']],    // Earth's adjacent: Water (emotion), Fire (action)
      ['aether', ['fire', 'air']]      // Aether's adjacent: Fire (action), Air (thought)
    ]);
    
    // Legacy balancing rules for fallback
    this.balancingRules = new Map([
      ['fire', ['earth', 'water']], // Fire needs grounding or cooling
      ['water', ['fire', 'earth']], // Water needs warmth or structure
      ['earth', ['air', 'fire']],   // Earth needs movement or inspiration
      ['air', ['earth', 'water']],  // Air needs grounding or feeling
      ['aether', ['earth', 'fire']] // Aether needs embodiment
    ]);
  }

  /**
   * Detect mixed elemental tones and their confidence levels
   */
  private detectMixedTones(
    input: string, 
    dominantElement: keyof ElementalSignature, 
    elementalBalance: ElementalSignature
  ): { primary: keyof ElementalSignature; secondary: keyof ElementalSignature; ratio: number } | undefined {
    const sortedElements = Object.entries(elementalBalance)
      .sort(([,a], [,b]) => b - a) as [keyof ElementalSignature, number][];

    const [primary, primaryScore] = sortedElements[0];
    const [secondary, secondaryScore] = sortedElements[1];

    // Only consider mixed if secondary has significant presence
    if (secondaryScore > 0.3 && primaryScore < 0.7) {
      const ratio = primaryScore / (primaryScore + secondaryScore);
      this.logger.info(`[PROSODY] Mixed tones detected: ${primary}(${primaryScore.toFixed(2)}) + ${secondary}(${secondaryScore.toFixed(2)}) ratio=${ratio.toFixed(2)}`);
      
      return {
        primary,
        secondary,
        ratio
      };
    }

    return undefined;
  }

  /**
   * Detect resistance patterns in user input
   */
  private detectResistanceFlags(input: string, emotionalState?: EmotionalState): {
    uncertainty: boolean;
    defensiveness: boolean;
    overwhelm: boolean;
    disconnection: boolean;
  } {
    const lower = input.toLowerCase();
    
    const uncertainty = /don['']?t know|not sure|confused|unclear|hard to say|maybe|i think|perhaps/i.test(input);
    const defensiveness = /but|however|actually|well|i mean|it['']?s just|whatever/i.test(input);
    const overwhelm = /can['']?t handle|too much|overwhelm|stressed|breaking down/i.test(input);
    const disconnection = /don['']?t care|doesn['']?t matter|fine|whatever|i guess/i.test(input);

    if (uncertainty || defensiveness || overwhelm || disconnection) {
      this.logger.info(`[PROSODY] Resistance detected - uncertainty:${uncertainty}, defensiveness:${defensiveness}, overwhelm:${overwhelm}, disconnection:${disconnection}`);
    }

    return {
      uncertainty,
      defensiveness, 
      overwhelm,
      disconnection
    };
  }

  /**
   * Detect mixed tone and resistance, then shape response accordingly
   */
  detectMixedToneAndShape(userTranscript: string, aiResponse: string): string {
    const analysis = this.analyzeTextPatterns(userTranscript);
    const elements: { element: Element; confidence: number }[] = [];

    // Very naive heuristics (can be replaced with ML)
    if (/stress|angry|fired|intense|overwhelmed/i.test(userTranscript)) {
      elements.push({ element: "fire", confidence: 0.8 });
    }
    if (/sad|emotional|cry|feeling down|overwhelmed/i.test(userTranscript)) {
      elements.push({ element: "water", confidence: 0.7 });
    }
    if (/stuck|heavy|blocked|tired|slow/i.test(userTranscript)) {
      elements.push({ element: "earth", confidence: 0.7 });
    }
    if (/scattered|thoughts|racing|ideas|mental/i.test(userTranscript)) {
      elements.push({ element: "air", confidence: 0.7 });
    }
    if (/spiritual|cosmic|higher|beyond|expansive/i.test(userTranscript)) {
      elements.push({ element: "aether", confidence: 0.7 });
    }

    // Fallback to aether if nothing detected
    if (elements.length === 0) {
      elements.push({ element: "aether", confidence: 0.5 });
    }

    const resistance = /don['']?t know|not sure|confused|unclear|hard to say/i.test(userTranscript);

    if (resistance) {
      this.logger.info("[PROSODY] User uncertain → reframing with metaphors");
      return `That's totally okay 🌱. Sometimes feelings aren't clear. Would you say your energy feels more like 🔥 fire blazing, or 🌊 water flowing?`;
    }

    const topElements = elements
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);

    if (topElements.length === 2 && topElements[0].confidence > 0.6 && topElements[1].confidence > 0.6) {
      this.logger.info(`[PROSODY] Detected mixed=${topElements[0].element}+${topElements[1].element}`);
      const balance = this.balanceTone([topElements[0].element as keyof ElementalSignature, topElements[1].element as keyof ElementalSignature]);
      return `I feel both ${topElements[0].element} and ${topElements[1].element} in your words — the intensity and the depth. Let's honor both, and then bring some ${balance} energy to balance.\n\n${aiResponse}`;
    }

    const primary = topElements[0].element as keyof ElementalSignature;
    const balance = this.balanceTone([primary]);

    this.logger.info(`[PROSODY] Detected=${primary} → Balancing=${balance}`);

    return `I feel your ${primary} energy. Let's honor it fully, and then I'll bring in some ${balance} to guide balance.\n\n${aiResponse}`;
  }

  /**
   * Choose balancing element(s) based on Jungian polarity + context
   */
  balanceTone(detected: (keyof ElementalSignature)[]): keyof ElementalSignature {
    if (detected.includes("fire") && detected.includes("water")) {
      this.logger.info("[PROSODY] Mixed fire+water → grounding with earth");
      return "earth";
    }

    switch (detected[0]) {
      case "fire":
        return "earth";
      case "earth":
        return "air";
      case "air":
        return "earth";
      case "water":
        return "fire";
      case "aether":
        return "earth";
      default:
        return "aether";
    }
  }

  /**
   * Analyze user input for emotional tone and energy with multi-modal intelligence
   */
  async analyzeUserTone(
    input: string, 
    audioBuffer?: ArrayBuffer,
    sessionMemory?: SessionMemory,
    voiceMetrics?: any
  ): Promise<ToneAnalysis> {
    // Enhanced multi-modal analysis
    let enhancedVoiceMetrics: VoiceMetrics | undefined;
    let emotionalState: EmotionalState | undefined;
    let confidenceScore = 0.5; // Base confidence for text-only
    let multiModalTags: string[] = ['TEXT_ANALYSIS'];
    
    // Analyze voice metrics if audio is available
    if (audioBuffer) {
      enhancedVoiceMetrics = await this.multiModalEI.analyzeVoiceMetrics(audioBuffer, voiceMetrics);
      emotionalState = await this.multiModalEI.mapEmotionalState(input, enhancedVoiceMetrics, sessionMemory);
      confidenceScore = 0.85; // Higher confidence with voice data
      multiModalTags.push('VOICE_METRICS', 'EMOTIONAL_STATE');
      
      if (sessionMemory) {
        multiModalTags.push('SESSION_CONTEXT');
        confidenceScore = 0.95; // Highest confidence with full context
      }
    }
    
    // Legacy text analysis (enhanced with emotional state)
    const textAnalysis = this.analyzeTextPatterns(input, emotionalState);
    
    // Legacy voice analysis (now enhanced)
    const voiceAnalysis = enhancedVoiceMetrics ? 
      this.analyzeAdvancedVoiceMetrics(enhancedVoiceMetrics) : 
      (voiceMetrics ? this.analyzeVoiceMetrics(voiceMetrics) : null);
    
    // Combine analyses with enhanced intelligence
    const dominantElement = this.detectDominantElement(input, textAnalysis, voiceAnalysis, emotionalState);
    const energyLevel = this.detectEnergyLevel(input, textAnalysis, voiceAnalysis, emotionalState);
    const elementalBalance = this.calculateElementalBalance(input, dominantElement, energyLevel, emotionalState);
    
    // Determine if balancing is needed
    const needsBalancing = this.assessNeedForBalance(elementalBalance, energyLevel);
    const suggestedBalance = this.selectBalancingElement(dominantElement, elementalBalance, energyLevel);
    
    // Detect mixed tones and resistance
    const mixedTones = this.detectMixedTones(input, dominantElement, elementalBalance);
    const resistanceFlags = this.detectResistanceFlags(input, emotionalState);

    return {
      dominantElement,
      elementalBalance,
      energyLevel,
      emotionalQualities: textAnalysis.qualities,
      tempo: textAnalysis.tempo,
      needsBalancing,
      suggestedBalance,
      // Enhanced fields
      voiceMetrics: enhancedVoiceMetrics,
      emotionalState,
      confidenceScore,
      multiModalTags,
      // Adaptive branching fields
      mixedTones,
      resistanceFlags
    };
  }

  /**
   * Generate adaptive prosody response pattern with multi-modal intelligence
   */
  async generateAdaptiveResponse(
    userTone: ToneAnalysis,
    aiResponse: string,
    therapeuticIntent?: string,
    sessionMemory?: SessionMemory
  ): Promise<ProsodyResponse> {
    // Enhanced prosody generation with multi-modal intelligence
    if (userTone.emotionalState && sessionMemory) {
      const recommendation = await this.multiModalEI.generateAdaptiveProsodyRecommendation(
        userTone.emotionalState,
        aiResponse,
        sessionMemory
      );
      
      this.logger.info(`[AdaptiveProsody] Using multi-modal recommendation: ${recommendation.approach}`);
      
      return this.createEnhancedProsodyResponse(userTone, aiResponse, recommendation, therapeuticIntent);
    }
    
    // Fallback to legacy approach
    const mirrorPhase = this.createMirrorPhase(userTone, aiResponse);
    const balancePhase = this.createBalancePhase(userTone, aiResponse, therapeuticIntent);
    const voiceParameters = this.calculateVoiceParameters(userTone, mirrorPhase.element, balancePhase.element);
    
    return {
      mirrorPhase,
      balancePhase,
      voiceParameters
    };
  }

  /**
   * Create enhanced prosody response with multi-modal intelligence
   */
  private createEnhancedProsodyResponse(
    userTone: ToneAnalysis,
    aiResponse: string,
    recommendation: any,
    therapeuticIntent?: string
  ): ProsodyResponse {
    // Phase 1: Enhanced mirroring with emotional resonance
    const mirrorPhase = {
      element: recommendation.primaryElement || userTone.dominantElement,
      duration: this.calculateOptimalMirrorDuration(userTone),
      text: this.extractMirrorText(aiResponse, userTone.emotionalState)
    };

    // Phase 2: Intelligent balance transition
    const balancePhase = {
      element: recommendation.balanceElement || userTone.suggestedBalance,
      transition: this.selectOptimalTransition(userTone, recommendation),
      text: this.extractBalanceText(aiResponse, userTone.emotionalState, therapeuticIntent)
    };

    // Phase 3: Multi-modal voice parameters
    const voiceParameters = this.calculateEnhancedVoiceParameters(
      userTone,
      mirrorPhase.element,
      balancePhase.element,
      recommendation
    );

    return {
      mirrorPhase,
      balancePhase,
      voiceParameters
    };
  }

  /**
   * Update session memory with prosody feedback
   */
  async updateSessionMemory(
    userId: string,
    sessionId: string,
    userTone: ToneAnalysis,
    agentResponse: string,
    prosodyApplied: any,
    userFeedback?: 'positive' | 'neutral' | 'negative'
  ): Promise<void> {
    if (userTone.emotionalState) {
      await this.multiModalEI.updateSessionMemory(
        userId,
        sessionId,
        userTone.emotionalState,
        agentResponse,
        agentResponse,
        prosodyApplied,
        userFeedback
      );
      
      this.logger.info(`[AdaptiveProsody] Session memory updated for user ${userId}`);
    }
  }

  /**
   * Analyze text patterns for emotional qualities (enhanced with emotional state)
   */
  private analyzeTextPatterns(input: string, emotionalState?: EmotionalState): any {
    const lower = input.toLowerCase();
    const qualities: string[] = [];
    let tempo: 'slow' | 'moderate' | 'fast' = 'moderate';
    
    // Fire patterns - passion, urgency, intensity
    if (lower.match(/can't believe|urgent|now|immediately|passionate|excited|angry|frustrated/)) {
      qualities.push('fiery', 'intense');
      tempo = 'fast';
    }
    
    // Water patterns - emotional, flowing, receptive
    if (lower.match(/feel|feeling|emotion|flow|gentle|soft|sad|tears|heart/)) {
      qualities.push('watery', 'emotional');
      tempo = 'slow';
    }
    
    // Earth patterns - practical, grounded, stable
    if (lower.match(/practical|plan|structure|stable|solid|routine|step by step|concrete/)) {
      qualities.push('earthy', 'grounded');
      tempo = 'moderate';
    }
    
    // Air patterns - intellectual, curious, analytical
    if (lower.match(/think|wonder|curious|analyze|understand|perspective|idea|concept/)) {
      qualities.push('airy', 'intellectual');
      tempo = 'moderate';
    }
    
    // Aether patterns - spiritual, transcendent, unified
    if (lower.match(/spiritual|divine|cosmic|universal|oneness|sacred|transcend|soul/)) {
      qualities.push('ethereal', 'transcendent');
      tempo = 'slow';
    }
    
    // Energy modifiers
    if (lower.match(/exhausted|tired|drained|low energy|depleted/)) {
      qualities.push('low-energy');
      tempo = 'slow';
    }
    
    if (lower.match(/energized|pumped|excited|high energy|motivated/)) {
      qualities.push('high-energy');
      tempo = 'fast';
    }
    
    return { qualities, tempo };
  }

  /**
   * Analyze voice metrics for prosodic features
   */
  private analyzeVoiceMetrics(metrics: any): any {
    // Placeholder for voice analysis
    // Would integrate with actual voice processing
    return {
      avgPitch: metrics.pitch || 0,
      avgVolume: metrics.volume || 0.5,
      speechRate: metrics.rate || 1.0,
      pauseFrequency: metrics.pauses || 0
    };
  }

  /**
   * Detect dominant elemental energy
   */
  private detectDominantElement(
    input: string,
    textAnalysis: any,
    voiceAnalysis: any
  ): keyof ElementalSignature {
    const scores: ElementalSignature = {
      fire: 0,
      water: 0,
      earth: 0,
      air: 0,
      aether: 0
    };
    
    const lower = input.toLowerCase();
    
    // Score based on keyword density
    scores.fire = (lower.match(/fire|passion|energy|action|transform|burn|drive|fight|power/g) || []).length;
    scores.water = (lower.match(/water|flow|feel|emotion|intuition|gentle|soft|fluid|receptive/g) || []).length;
    scores.earth = (lower.match(/earth|ground|stable|practical|solid|structure|body|physical|concrete/g) || []).length;
    scores.air = (lower.match(/air|think|mind|idea|concept|perspective|analyze|understand|clarity/g) || []).length;
    scores.aether = (lower.match(/spirit|divine|cosmic|soul|sacred|transcend|unity|consciousness/g) || []).length;
    
    // Boost based on text analysis qualities
    if (textAnalysis.qualities.includes('fiery')) scores.fire += 3;
    if (textAnalysis.qualities.includes('watery')) scores.water += 3;
    if (textAnalysis.qualities.includes('earthy')) scores.earth += 3;
    if (textAnalysis.qualities.includes('airy')) scores.air += 3;
    if (textAnalysis.qualities.includes('ethereal')) scores.aether += 3;
    
    // Adjust based on tempo
    if (textAnalysis.tempo === 'fast') {
      scores.fire += 1;
      scores.air += 1;
    }
    if (textAnalysis.tempo === 'slow') {
      scores.water += 1;
      scores.earth += 1;
    }
    
    // Find dominant element
    let maxScore = 0;
    let dominant: keyof ElementalSignature = 'air'; // Default
    
    for (const [element, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominant = element as keyof ElementalSignature;
      }
    }
    
    return dominant;
  }

  /**
   * Detect overall energy level
   */
  private detectEnergyLevel(
    input: string,
    textAnalysis: any,
    voiceAnalysis: any
  ): EnergyLevel {
    let energyScore = 50; // Start at medium
    
    // Text-based adjustments
    const lower = input.toLowerCase();
    
    // High energy indicators
    if (lower.match(/!+/g)) energyScore += 10;
    if (lower.match(/excited|energized|pumped|motivated|passionate/)) energyScore += 20;
    if (lower.match(/urgent|now|immediately|quickly|asap/)) energyScore += 15;
    if (textAnalysis.tempo === 'fast') energyScore += 10;
    
    // Low energy indicators
    if (lower.match(/tired|exhausted|drained|depleted|worn out/)) energyScore -= 30;
    if (lower.match(/slow|gentle|soft|quiet|calm/)) energyScore -= 15;
    if (lower.match(/\.\.\./g)) energyScore -= 5;
    if (textAnalysis.tempo === 'slow') energyScore -= 10;
    
    // Voice-based adjustments (if available)
    if (voiceAnalysis) {
      if (voiceAnalysis.speechRate > 1.2) energyScore += 15;
      if (voiceAnalysis.speechRate < 0.8) energyScore -= 15;
      if (voiceAnalysis.avgVolume > 0.7) energyScore += 10;
      if (voiceAnalysis.avgVolume < 0.3) energyScore -= 10;
    }
    
    // Map to energy level
    if (energyScore <= 15) return EnergyLevel.VERY_LOW;
    if (energyScore <= 30) return EnergyLevel.LOW;
    if (energyScore <= 45) return EnergyLevel.MEDIUM_LOW;
    if (energyScore <= 55) return EnergyLevel.MEDIUM;
    if (energyScore <= 70) return EnergyLevel.MEDIUM_HIGH;
    if (energyScore <= 85) return EnergyLevel.HIGH;
    return EnergyLevel.VERY_HIGH;
  }

  /**
   * Calculate elemental balance distribution
   */
  private calculateElementalBalance(
    input: string,
    dominant: keyof ElementalSignature,
    energy: EnergyLevel
  ): ElementalSignature {
    const balance: ElementalSignature = {
      fire: 0.2,
      water: 0.2,
      earth: 0.2,
      air: 0.2,
      aether: 0.2
    };
    
    // Boost dominant element
    balance[dominant] = 0.6;
    
    // Adjust based on energy level
    if (energy === EnergyLevel.HIGH || energy === EnergyLevel.VERY_HIGH) {
      balance.fire += 0.1;
      balance.air += 0.1;
    } else if (energy === EnergyLevel.LOW || energy === EnergyLevel.VERY_LOW) {
      balance.water += 0.1;
      balance.earth += 0.1;
    }
    
    // Normalize
    const total = Object.values(balance).reduce((sum, val) => sum + val, 0);
    Object.keys(balance).forEach(key => {
      balance[key as keyof ElementalSignature] /= total;
    });
    
    return balance;
  }

  /**
   * Assess if user needs balancing
   */
  private assessNeedForBalance(
    balance: ElementalSignature,
    energy: EnergyLevel
  ): boolean {
    // Check for elemental imbalance
    const maxElement = Math.max(...Object.values(balance));
    if (maxElement > 0.5) return true; // Too dominant in one element
    
    // Check for energy extremes
    if (energy === EnergyLevel.VERY_LOW || energy === EnergyLevel.VERY_HIGH) {
      return true;
    }
    
    return false;
  }

  /**
   * Intelligent contextual balancing - chooses the optimal counter-element based on context
   * Fire → Earth (grounding), Water (cooling), Air (clarity), or Aether (perspective)
   * Water → Fire (activation), Air (lightening), Earth (structure)
   * Earth → Air (expansion), Fire (activation)  
   * Air → Earth (grounding), Water (anchoring)
   * Aether → Earth (embodiment), Fire (activation)
   */
  private selectBalancingElement(
    dominant: keyof ElementalSignature,
    balance: ElementalSignature,
    energy: EnergyLevel,
    emotionalState?: EmotionalState,
    context?: { stressLevel?: string; needsFocus?: boolean; therapeuticIntent?: string }
  ): keyof ElementalSignature {
    // Context-aware balancing options (not fixed mappings)
    const balancingMap = {
      fire: {
        options: ['earth', 'water', 'air', 'aether'],
        contextRules: {
          high_stress: 'water',      // Cooling for stressed fire
          needs_focus: 'earth',      // Grounding for scattered fire
          overwhelmed: 'water',      // Emotional cooling
          anger: 'earth',           // Grounding anger
          burnout: 'water',         // Restorative water
          impatience: 'earth',      // Patience through grounding
          creative_block: 'air',    // Mental clarity
          spiritual_seeking: 'aether' // Transcendent perspective
        }
      },
      water: {
        options: ['fire', 'air', 'earth'],
        contextRules: {
          depression: 'fire',        // Activation for low water
          stagnation: 'fire',       // Movement and energy
          confusion: 'air',         // Mental clarity
          emotional_flooding: 'earth', // Grounding overwhelming emotions
          needs_structure: 'earth', // Containing flowing energy
          needs_activation: 'fire'  // Inspiring action
        }
      },
      earth: {
        options: ['air', 'fire'],
        contextRules: {
          stuck: 'air',            // Perspective for stuckness  
          heavy: 'air',            // Lightening density
          unmotivated: 'fire',     // Activation and inspiration
          rigid: 'air',            // Mental flexibility
          needs_expansion: 'air',   // Opening contracted energy
          creative_block: 'fire'    // Inspiring creativity
        }
      },
      air: {
        options: ['earth', 'water'],
        contextRules: {
          scattered: 'earth',       // Grounding scattered thoughts
          anxious: 'earth',        // Stability for anxiety
          overthinking: 'water',   // Emotional flow vs mental loops
          disconnected: 'water',   // Heart connection
          needs_grounding: 'earth', // Anchoring mental energy
          hyperactive: 'earth'     // Calming hyperactivity
        }
      },
      aether: {
        options: ['earth', 'fire'],
        contextRules: {
          ungrounded: 'earth',     // Embodying spiritual insights
          passive: 'fire',         // Activating transcendent wisdom
          disconnected: 'earth',   // Physical embodiment
          needs_action: 'fire'     // Manifesting vision
        }
      }
    };

    const elementConfig = balancingMap[dominant];
    if (!elementConfig) return 'earth'; // Fallback

    // Context-aware selection
    if (emotionalState) {
      const { stressLevel, primaryEmotion, therapeuticNeeds } = emotionalState;
      
      // Primary emotion-based context
      const emotionContext = this.mapEmotionToContext(primaryEmotion);
      if (emotionContext && elementConfig.contextRules[emotionContext]) {
        const selectedElement = elementConfig.contextRules[emotionContext];
        this.logger.info(`[ContextualBalance] ${dominant} → ${selectedElement} (emotion: ${primaryEmotion})`);
        return selectedElement as keyof ElementalSignature;
      }
      
      // Stress-based context
      if (stressLevel > 0.7) {
        const stressContext = this.getStressContext(dominant);
        if (elementConfig.contextRules[stressContext]) {
          const selectedElement = elementConfig.contextRules[stressContext];
          this.logger.info(`[ContextualBalance] ${dominant} → ${selectedElement} (high stress)`);
          return selectedElement as keyof ElementalSignature;
        }
      }
      
      // Therapeutic needs context
      for (const need of therapeuticNeeds) {
        if (elementConfig.contextRules[need]) {
          const selectedElement = elementConfig.contextRules[need];
          this.logger.info(`[ContextualBalance] ${dominant} → ${selectedElement} (therapeutic: ${need})`);
          return selectedElement as keyof ElementalSignature;
        }
      }
    }
    
    // Legacy energy-based fallback
    if (energy === EnergyLevel.HIGH || energy === EnergyLevel.VERY_HIGH) {
      // High energy needs grounding or cooling
      if (dominant === 'fire') return 'water'; // Cool the fire
      if (dominant === 'air') return 'earth';  // Ground the air
      return elementConfig.options.find(opt => ['earth', 'water'].includes(opt)) as keyof ElementalSignature || elementConfig.options[0] as keyof ElementalSignature;
    } else if (energy === EnergyLevel.LOW || energy === EnergyLevel.VERY_LOW) {
      // Low energy needs activation
      if (dominant === 'water') return 'fire';  // Activate the water
      if (dominant === 'earth') return 'fire';  // Energize the earth
      return elementConfig.options.find(opt => ['fire', 'air'].includes(opt)) as keyof ElementalSignature || elementConfig.options[0] as keyof ElementalSignature;
    }
    
    // Balanced energy - use first contextual option
    this.logger.info(`[ContextualBalance] ${dominant} → ${elementConfig.options[0]} (default)`);
    return elementConfig.options[0] as keyof ElementalSignature;
  }
  
  /**
   * Map primary emotion to contextual rule
   */
  private mapEmotionToContext(emotion: string): string | null {
    const emotionMap: Record<string, string> = {
      'anger': 'anger',
      'frustration': 'anger',
      'rage': 'anger',
      'sadness': 'depression',
      'melancholy': 'depression', 
      'depression': 'depression',
      'anxiety': 'anxious',
      'worry': 'anxious',
      'fear': 'anxious',
      'excitement': 'hyperactive',
      'overwhelm': 'overwhelmed',
      'confusion': 'confusion',
      'stagnation': 'stagnation',
      'burnout': 'burnout'
    };
    
    return emotionMap[emotion.toLowerCase()] || null;
  }
  
  /**
   * Get stress-specific context for element
   */
  private getStressContext(element: keyof ElementalSignature): string {
    const stressContextMap = {
      fire: 'high_stress',      // Fire under stress needs cooling
      water: 'emotional_flooding', // Water under stress gets overwhelming
      earth: 'stuck',           // Earth under stress gets rigid
      air: 'scattered',         // Air under stress gets chaotic
      aether: 'ungrounded'      // Aether under stress needs grounding
    };
    
    return stressContextMap[element] || 'high_stress';
  }
  
  /**
   * Get Mirror → Balance Arc with debug logging
   * Always start by mirroring user's element, then transition to balancing element
   */
  getMirrorBalanceArc(
    userElement: keyof ElementalSignature,
    context: {
      emotionalState?: EmotionalState;
      energyLevel: EnergyLevel;
      therapeuticIntent?: string;
      stressLevel?: string;
      needsFocus?: boolean;
    }
  ): {
    mirror: { element: keyof ElementalSignature; approach: string };
    balance: { element: keyof ElementalSignature; approach: string };
    debug: string;
  } {
    // Step 1: Mirror user's element (rapport building)
    const mirrorElement = userElement;
    const mirrorApproach = this.getMirrorApproach(userElement, context);
    
    // Step 2: Choose contextual balancing element  
    const balanceElement = this.selectBalancingElement(
      userElement,
      {} as ElementalSignature, // Not needed for new logic
      context.energyLevel,
      context.emotionalState,
      {
        stressLevel: context.stressLevel,
        needsFocus: context.needsFocus,
        therapeuticIntent: context.therapeuticIntent
      }
    );
    
    const balanceApproach = this.getBalanceApproach(balanceElement, context);
    
    const debugInfo = `[PROSODY] Detected=${userElement} | Mirror=${mirrorElement} | Balance=${balanceElement}`;
    
    this.logger.info(debugInfo);
    
    return {
      mirror: { element: mirrorElement, approach: mirrorApproach },
      balance: { element: balanceElement, approach: balanceApproach },
      debug: debugInfo
    };
  }
  
  /**
   * Get appropriate mirroring approach for element
   */
  private getMirrorApproach(
    element: keyof ElementalSignature,
    context: { emotionalState?: EmotionalState; energyLevel: EnergyLevel }
  ): string {
    const approaches = {
      fire: 'match_intensity',
      water: 'flow_with_emotion', 
      earth: 'steady_presence',
      air: 'mental_resonance',
      aether: 'spacious_acknowledgment'
    };
    
    return approaches[element] || 'empathetic_resonance';
  }
  
  /**
   * Get appropriate balancing approach for element
   */
  private getBalanceApproach(
    element: keyof ElementalSignature,
    context: { emotionalState?: EmotionalState; therapeuticIntent?: string }
  ): string {
    const approaches = {
      fire: 'gentle_activation',
      water: 'soothing_flow',
      earth: 'grounding_stability', 
      air: 'clarifying_perspective',
      aether: 'transcendent_integration'
    };
    
    return approaches[element] || 'balanced_guidance';
  }

  /**
   * Create mirroring phase response
   */
  private createMirrorPhase(
    userTone: ToneAnalysis,
    fullResponse: string
  ): ProsodyResponse['mirrorPhase'] {
    // Extract first 1-2 sentences for mirroring
    const sentences = fullResponse.split(/[.!?]+/);
    const mirrorText = sentences.slice(0, 2).join('. ') + '.';
    
    // Determine mirror duration based on user's need
    let duration: 'brief' | 'moderate' | 'extended' = 'moderate';
    if (userTone.energyLevel === EnergyLevel.VERY_HIGH || userTone.energyLevel === EnergyLevel.VERY_LOW) {
      duration = 'extended'; // Stay longer with extremes
    } else if (!userTone.needsBalancing) {
      duration = 'brief'; // Quick acknowledgment if already balanced
    }
    
    return {
      element: userTone.dominantElement,
      duration,
      text: mirrorText
    };
  }

  /**
   * Create balancing phase response
   */
  private createBalancePhase(
    userTone: ToneAnalysis,
    fullResponse: string,
    therapeuticIntent?: string
  ): ProsodyResponse['balancePhase'] {
    // Extract remaining text for balancing
    const sentences = fullResponse.split(/[.!?]+/);
    const balanceText = sentences.slice(2).join('. ') || sentences.join('. ');
    
    // Determine transition style
    let transition: 'gentle' | 'moderate' | 'decisive' = 'moderate';
    if (userTone.energyLevel === EnergyLevel.VERY_HIGH || userTone.energyLevel === EnergyLevel.VERY_LOW) {
      transition = 'gentle'; // Careful with extremes
    } else if (therapeuticIntent === 'activate' || therapeuticIntent === 'ground') {
      transition = 'decisive'; // Clear therapeutic direction
    }
    
    return {
      element: userTone.suggestedBalance,
      transition,
      text: balanceText
    };
  }

  /**
   * Calculate voice parameters for prosody
   */
  private calculateVoiceParameters(
    userTone: ToneAnalysis,
    mirrorElement: keyof ElementalSignature,
    balanceElement: keyof ElementalSignature
  ): ProsodyResponse['voiceParameters'] {
    // Base parameters
    let speed = 1.0;
    let pitch = 0;
    let emphasis = 0.5;
    let warmth = 0.5;
    
    // Adjust for mirror element
    switch (mirrorElement) {
      case 'fire':
        speed = 1.2;
        pitch = 5;
        emphasis = 0.8;
        warmth = 0.7;
        break;
      case 'water':
        speed = 0.9;
        pitch = -3;
        emphasis = 0.3;
        warmth = 0.8;
        break;
      case 'earth':
        speed = 0.85;
        pitch = -5;
        emphasis = 0.4;
        warmth = 0.6;
        break;
      case 'air':
        speed = 1.1;
        pitch = 3;
        emphasis = 0.6;
        warmth = 0.5;
        break;
      case 'aether':
        speed = 0.95;
        pitch = 0;
        emphasis = 0.3;
        warmth = 0.9;
        break;
    }
    
    // Adjust for energy level
    if (userTone.energyLevel === EnergyLevel.VERY_LOW) {
      speed *= 0.9;
      warmth += 0.1;
    } else if (userTone.energyLevel === EnergyLevel.VERY_HIGH) {
      speed *= 1.1;
      emphasis += 0.1;
    }
    
    return {
      speed: Math.max(0.5, Math.min(2.0, speed)),
      pitch: Math.max(-20, Math.min(20, pitch)),
      emphasis: Math.max(0, Math.min(1, emphasis)),
      warmth: Math.max(0, Math.min(1, warmth))
    };
  }

  /**
   * Generate CI shaping parameters from prosody response
   */
  generateCIShapingParams(prosodyResponse: ProsodyResponse): any {
    // Create a blended style for CI shaping
    const mirrorWeight = 0.6; // Start with more mirror
    const balanceWeight = 0.4; // Gradually shift to balance
    
    return {
      style: prosodyResponse.balancePhase.element, // Primary style
      secondaryStyle: prosodyResponse.mirrorPhase.element,
      transition: prosodyResponse.balancePhase.transition,
      voiceParameters: prosodyResponse.voiceParameters,
      mirrorText: prosodyResponse.mirrorPhase.text,
      balanceText: prosodyResponse.balancePhase.text
    };
  }

  /**
   * Get therapeutic guidance based on elemental shift
   */
  getTherapeuticGuidance(
    fromElement: keyof ElementalSignature,
    toElement: keyof ElementalSignature
  ): string {
    const transitions: Record<string, string> = {
      'fire-earth': 'Grounding passionate energy into practical action',
      'fire-water': 'Cooling intensity with emotional awareness',
      'water-fire': 'Activating emotional depth with purposeful action',
      'water-earth': 'Stabilizing emotions through embodied practice',
      'earth-air': 'Lifting density with mental clarity and perspective',
      'earth-fire': 'Energizing stability with passionate purpose',
      'air-earth': 'Grounding ideas into concrete reality',
      'air-water': 'Connecting intellect with feeling',
      'aether-earth': 'Embodying spiritual insights in daily life',
      'aether-fire': 'Activating transcendent wisdom into action'
    };
    
    const key = `${fromElement}-${toElement}`;
    return transitions[key] || `Transitioning from ${fromElement} to ${toElement} energy`;
  }

  // Enhanced Multi-Modal Helper Methods

  /**
   * Analyze advanced voice metrics from multi-modal intelligence
   */
  private analyzeAdvancedVoiceMetrics(voiceMetrics: VoiceMetrics): any {
    return {
      avgPitch: voiceMetrics.pitch.mean,
      avgVolume: voiceMetrics.volume.mean,
      speechRate: voiceMetrics.tempo.wordsPerMinute / 150, // Normalized to 1.0 baseline
      pauseFrequency: voiceMetrics.tempo.pauseDuration.length / 10,
      emotionalIntensity: voiceMetrics.emotional.arousal,
      emotionalValence: voiceMetrics.emotional.valence,
      voiceStrain: voiceMetrics.spectral.voiceStrain,
      authenticity: voiceMetrics.emotional.authenticity
    };
  }

  /**
   * Enhanced dominant element detection with emotional state
   */
  private detectDominantElement(
    input: string,
    textAnalysis: any,
    voiceAnalysis: any,
    emotionalState?: EmotionalState
  ): keyof ElementalSignature {
    const scores: ElementalSignature = {
      fire: 0, water: 0, earth: 0, air: 0, aether: 0
    };

    // Base text analysis (existing logic)
    const lower = input.toLowerCase();
    scores.fire = (lower.match(/fire|passion|energy|action|transform|burn|drive|fight|power/g) || []).length;
    scores.water = (lower.match(/water|flow|feel|emotion|intuition|gentle|soft|fluid|receptive/g) || []).length;
    scores.earth = (lower.match(/earth|ground|stable|practical|solid|structure|body|physical|concrete/g) || []).length;
    scores.air = (lower.match(/air|think|mind|idea|concept|perspective|analyze|understand|clarity/g) || []).length;
    scores.aether = (lower.match(/spirit|divine|cosmic|soul|sacred|transcend|unity|consciousness/g) || []).length;

    // Enhanced scoring with emotional state
    if (emotionalState) {
      // Map emotional state to elemental scores
      Object.entries(emotionalState.elementalResonance).forEach(([element, value]) => {
        scores[element as keyof ElementalSignature] += value * 5; // Weight emotional resonance highly
      });

      // Primary emotion mapping
      switch (emotionalState.primaryEmotion) {
        case 'excitement':
        case 'anger':
        case 'passion':
          scores.fire += 3;
          break;
        case 'sadness':
        case 'melancholy':
        case 'calm':
          scores.water += 3;
          break;
        case 'anxiety':
        case 'worry':
          scores.earth += 2; // Need grounding
          break;
        case 'curiosity':
        case 'analysis':
          scores.air += 3;
          break;
        case 'transcendent':
        case 'spiritual':
          scores.aether += 3;
          break;
      }
    }

    // Voice analysis enhancements
    if (voiceAnalysis) {
      if (voiceAnalysis.emotionalIntensity > 0.7) scores.fire += 2;
      if (voiceAnalysis.emotionalValence < -0.3) scores.water += 2;
      if (voiceAnalysis.speechRate < 0.8) scores.earth += 1;
      if (voiceAnalysis.voiceStrain > 0.6) scores.air += 1; // Need clarity
      if (voiceAnalysis.authenticity > 0.8) scores.aether += 1;
    }

    // Find dominant element
    let maxScore = 0;
    let dominant: keyof ElementalSignature = 'air';
    
    for (const [element, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominant = element as keyof ElementalSignature;
      }
    }

    return dominant;
  }

  /**
   * Enhanced energy level detection with emotional state
   */
  private detectEnergyLevel(
    input: string,
    textAnalysis: any,
    voiceAnalysis: any,
    emotionalState?: EmotionalState
  ): EnergyLevel {
    let energyScore = 50; // Base medium energy

    // Legacy text analysis
    const lower = input.toLowerCase();
    if (lower.match(/!+/g)) energyScore += 10;
    if (lower.match(/excited|energized|pumped|motivated|passionate/)) energyScore += 20;
    if (lower.match(/tired|exhausted|drained|depleted/)) energyScore -= 30;

    // Enhanced with emotional state
    if (emotionalState) {
      energyScore += emotionalState.emotionalIntensity * 40; // Scale to 0-40 range
      energyScore -= emotionalState.stressLevel * 20; // Stress reduces energy
      
      // Specific emotional adjustments
      if (emotionalState.primaryEmotion === 'excitement') energyScore += 25;
      if (emotionalState.primaryEmotion === 'melancholy') energyScore -= 25;
    }

    // Enhanced voice analysis
    if (voiceAnalysis && voiceAnalysis.emotionalIntensity !== undefined) {
      energyScore += voiceAnalysis.emotionalIntensity * 30;
      if (voiceAnalysis.speechRate > 1.2) energyScore += 15;
      if (voiceAnalysis.speechRate < 0.8) energyScore -= 15;
      if (voiceAnalysis.voiceStrain > 0.7) energyScore -= 10; // Strain indicates fatigue
    }

    // Map to energy levels with enhanced ranges
    if (energyScore <= 10) return EnergyLevel.VERY_LOW;
    if (energyScore <= 25) return EnergyLevel.LOW;
    if (energyScore <= 40) return EnergyLevel.MEDIUM_LOW;
    if (energyScore <= 60) return EnergyLevel.MEDIUM;
    if (energyScore <= 75) return EnergyLevel.MEDIUM_HIGH;
    if (energyScore <= 90) return EnergyLevel.HIGH;
    return EnergyLevel.VERY_HIGH;
  }

  /**
   * Enhanced elemental balance calculation
   */
  private calculateElementalBalance(
    input: string,
    dominant: keyof ElementalSignature,
    energy: EnergyLevel,
    emotionalState?: EmotionalState
  ): ElementalSignature {
    // Start with base distribution
    const balance: ElementalSignature = {
      fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2
    };

    // Use emotional state resonance if available (preferred)
    if (emotionalState?.elementalResonance) {
      return { ...emotionalState.elementalResonance };
    }

    // Fallback to legacy calculation
    balance[dominant] = 0.6;

    if (energy === EnergyLevel.HIGH || energy === EnergyLevel.VERY_HIGH) {
      balance.fire += 0.1;
      balance.air += 0.1;
    } else if (energy === EnergyLevel.LOW || energy === EnergyLevel.VERY_LOW) {
      balance.water += 0.1;
      balance.earth += 0.1;
    }

    // Normalize
    const total = Object.values(balance).reduce((sum, val) => sum + val, 0);
    Object.keys(balance).forEach(key => {
      balance[key as keyof ElementalSignature] /= total;
    });

    return balance;
  }

  /**
   * Calculate optimal mirror duration based on emotional needs
   */
  private calculateOptimalMirrorDuration(userTone: ToneAnalysis): 'brief' | 'moderate' | 'extended' {
    if (!userTone.emotionalState) {
      return userTone.energyLevel === EnergyLevel.VERY_HIGH || userTone.energyLevel === EnergyLevel.VERY_LOW 
        ? 'extended' : 'moderate';
    }

    const { emotionalIntensity, stressLevel, therapeuticNeeds } = userTone.emotionalState;

    // High intensity or stress needs longer mirroring
    if (emotionalIntensity > 0.8 || stressLevel > 0.7) return 'extended';
    
    // Specific therapeutic needs
    if (therapeuticNeeds.includes('comfort') || therapeuticNeeds.includes('grounding')) return 'extended';
    
    // Low engagement needs brief acknowledgment
    if (emotionalIntensity < 0.3 && stressLevel < 0.3) return 'brief';

    return 'moderate';
  }

  /**
   * Extract mirror text with emotional resonance
   */
  private extractMirrorText(fullResponse: string, emotionalState?: EmotionalState): string {
    const sentences = fullResponse.split(/[.!?]+/).filter(s => s.trim());
    
    if (!emotionalState) {
      return sentences.slice(0, 2).join('. ') + '.';
    }

    // Select sentences that match emotional resonance
    let mirrorSentences = sentences.slice(0, 1); // Always include first

    // Add emotional validation sentence if high intensity
    if (emotionalState.emotionalIntensity > 0.7) {
      mirrorSentences = sentences.slice(0, 2);
    }

    return mirrorSentences.join('. ') + '.';
  }

  /**
   * Extract balance text with therapeutic intent
   */
  private extractBalanceText(
    fullResponse: string, 
    emotionalState?: EmotionalState,
    therapeuticIntent?: string
  ): string {
    const sentences = fullResponse.split(/[.!?]+/).filter(s => s.trim());
    
    if (!emotionalState) {
      return sentences.slice(2).join('. ') || sentences.join('. ');
    }

    // Select balancing sentences based on therapeutic needs
    let balancingSentences = sentences.slice(2);
    
    if (balancingSentences.length === 0) {
      balancingSentences = sentences.slice(1);
    }

    return balancingSentences.join('. ') + (balancingSentences.length > 0 ? '.' : '');
  }

  /**
   * Select optimal transition style
   */
  private selectOptimalTransition(userTone: ToneAnalysis, recommendation: any): 'gentle' | 'moderate' | 'decisive' {
    if (!userTone.emotionalState) {
      return userTone.energyLevel === EnergyLevel.VERY_HIGH || userTone.energyLevel === EnergyLevel.VERY_LOW 
        ? 'gentle' : 'moderate';
    }

    const { emotionalIntensity, stressLevel, therapeuticNeeds } = userTone.emotionalState;

    // High stress or intensity needs gentle transitions
    if (emotionalIntensity > 0.8 || stressLevel > 0.7) return 'gentle';
    
    // Clear therapeutic direction can be more decisive
    if (therapeuticNeeds.includes('activation') || therapeuticNeeds.includes('grounding')) return 'decisive';
    
    return 'moderate';
  }

  /**
   * Calculate enhanced voice parameters with multi-modal data
   */
  private calculateEnhancedVoiceParameters(
    userTone: ToneAnalysis,
    mirrorElement: keyof ElementalSignature,
    balanceElement: keyof ElementalSignature,
    recommendation: any
  ): ProsodyResponse['voiceParameters'] {
    // Start with base parameters
    let params = this.calculateVoiceParameters(userTone, mirrorElement, balanceElement);

    // Enhance with voice metrics if available
    if (userTone.voiceMetrics) {
      const vm = userTone.voiceMetrics;
      
      // Adapt to user's voice characteristics
      if (vm.tempo.wordsPerMinute < 120) params.speed *= 0.9; // Match slower pace
      if (vm.tempo.wordsPerMinute > 180) params.speed *= 1.1; // Match faster pace
      
      // Respond to emotional valence
      if (vm.emotional.valence < -0.5) params.warmth += 0.2; // Extra warmth for negative emotions
      if (vm.spectral.voiceStrain > 0.6) params.pitch -= 2; // Lower pitch for strained voices
      
      // Adjust for authenticity
      params.emphasis *= vm.emotional.authenticity; // Match authentic emotional expression
    }

    // Apply recommendation confidence
    if (recommendation.confidence > 0.8) {
      // High confidence - be more expressive
      params.emphasis += 0.1;
    }

    // Ensure bounds
    return {
      speed: Math.max(0.5, Math.min(2.0, params.speed)),
      pitch: Math.max(-20, Math.min(20, params.pitch)),
      emphasis: Math.max(0, Math.min(1, params.emphasis)),
      warmth: Math.max(0, Math.min(1, params.warmth))
    };
  }

  /**
   * 🌀 JUNGIAN ADAPTIVE PROSODY METHODS
   */

  /**
   * Analyze context flags from user input
   */
  private analyzeContext(transcript: string): ContextFlags {
    const lower = transcript.toLowerCase();
    
    return {
      overwhelmed: !!(
        lower.match(/can't handle|overwhelm|too much|stressed out|breaking down|can't cope|drowning/) ||
        lower.match(/!!{2,}/) || // Multiple exclamation marks
        lower.split(/\s+/).length > 50 // Very long rambling input
      ),
      
      uncertain: !!(
        lower.match(/don't know|not sure|maybe|confused|unclear|can't decide|unsure|i think|perhaps/) ||
        lower.match(/\?\s*\?/) || // Multiple question marks
        lower.match(/um+|uh+|er+/) // Hesitation sounds
      ),
      
      stuck: !!(
        lower.match(/stuck|blocked|can't move|trapped|same place|going nowhere|spinning wheels/) ||
        lower.match(/\.{3,}/) || // Long ellipses indicating pauses
        transcript.split(/\s+/).filter(w => w.length < 3).length > transcript.split(/\s+/).length * 0.3 // Many short words = hesitation
      )
    };
  }

  /**
   * Determine Jungian balance element with contextual modulation
   */
  determineBalance(userElement: keyof ElementalSignature, context: ContextFlags): keyof ElementalSignature {
    // Get Jungian opposite
    const jungianOpposite = (this.jungianOpposites.get(userElement) || 'earth') as keyof ElementalSignature;
    
    this.logger.info(`[PROSODY] User=${userElement} → Balance=${jungianOpposite} (Jungian opposite)`);
    
    // Apply context modulation
    if (context.overwhelmed) {
      // Use adjacent element instead of strict opposite (softer)
      const adjacents = this.adjacentElements.get(userElement) || ['water'];
      const softenedBalance = adjacents[0] as keyof ElementalSignature;
      this.logger.info(`[PROSODY] Context=overwhelmed → Softening balance → ${softenedBalance}`);
      return softenedBalance;
    }
    
    if (context.uncertain) {
      // Inject Aether as intermediary before moving to balance
      if (userElement !== 'aether') {
        this.logger.info(`[PROSODY] Context=uncertain → Injecting Aether bridge`);
        return 'aether';
      }
      // If already Aether, proceed to Jungian opposite
      this.logger.info(`[PROSODY] Context=uncertain, already Aether → Proceeding to Jungian balance`);
      return jungianOpposite;
    }
    
    if (context.stuck) {
      // Enforce strong polarity to create movement
      this.logger.info(`[PROSODY] Context=stuck → Enforcing strong polarity → ${jungianOpposite}`);
      return jungianOpposite;
    }
    
    // Default: pure Jungian opposite
    return jungianOpposite;
  }

  /**
   * Enhanced shapeResponse with Jungian balancing
   */
  async shapeResponse(
    userTranscript: string, 
    aiResponse: string,
    audioBuffer?: ArrayBuffer,
    sessionMemory?: SessionMemory,
    voiceMetrics?: any
  ): Promise<ProsodyResponse> {
    try {
      // 1. Detect tone → element
      const userTone = await this.analyzeUserTone(userTranscript, audioBuffer, sessionMemory, voiceMetrics);
      
      // 2. Analyze context
      const context = this.analyzeContext(userTranscript);
      this.logger.info(`[PROSODY] Context flags: overwhelmed=${context.overwhelmed}, uncertain=${context.uncertain}, stuck=${context.stuck}`);
      
      // 3. Mirror → balance → shape
      const mirrorElement = userTone.dominantElement;
      const balanceElement = this.determineBalance(userTone.dominantElement, context);
      
      this.logger.info(`[PROSODY] Prosody Flow: User=${mirrorElement} → Mirror=${mirrorElement} → Balance=${balanceElement}`);
      
      // 4. Generate shaped response
      const mirrorPhase = this.createMirrorPhase(userTone, aiResponse);
      const balancePhase = this.createJungianBalancePhase(userTone, aiResponse, balanceElement, context);
      const voiceParameters = this.calculateVoiceParameters(userTone, mirrorElement, balanceElement);
      
      return {
        mirrorPhase: {
          ...mirrorPhase,
          element: mirrorElement
        },
        balancePhase: {
          ...balancePhase,
          element: balanceElement
        },
        voiceParameters
      };
      
    } catch (err) {
      this.logger.error(`[PROSODY] Shaping failed: ${err}`);
      // Fallback: use existing generateAdaptiveResponse
      const userTone = await this.analyzeUserTone(userTranscript, audioBuffer, sessionMemory, voiceMetrics);
      return this.generateAdaptiveResponse(userTone, aiResponse, 'balance', sessionMemory);
    }
  }

  /**
   * Create Jungian balance phase with contextual awareness
   */
  private createJungianBalancePhase(
    userTone: ToneAnalysis,
    fullResponse: string,
    _balanceElement: keyof ElementalSignature,
    context: ContextFlags
  ): Omit<ProsodyResponse['balancePhase'], 'element'> {
    // Extract text for balancing phase
    const sentences = fullResponse.split(/[.!?]+/).filter(s => s.trim());
    const balanceText = sentences.slice(2).join('. ') || sentences.slice(1).join('. ') || sentences.join('. ');
    
    // Determine transition style based on context
    let transition: 'gentle' | 'moderate' | 'decisive' = 'moderate';
    
    if (context.overwhelmed) {
      transition = 'gentle'; // Be extra careful with overwhelmed users
    } else if (context.uncertain) {
      transition = 'gentle'; // Ease them through uncertainty
    } else if (context.stuck) {
      transition = 'decisive'; // Strong push to break through stuckness
    } else if (userTone.energyLevel === EnergyLevel.VERY_HIGH || userTone.energyLevel === EnergyLevel.VERY_LOW) {
      transition = 'gentle'; // Handle energy extremes carefully
    }
    
    this.logger.info(`[PROSODY] Balance transition: ${transition} (context-adjusted)`);
    
    return {
      transition,
      text: balanceText + (balanceText && !balanceText.endsWith('.') ? '.' : '')
    };
  }

  /**
   * Generate adaptive response for mixed tones
   * Approach: Acknowledge both elements, then guide toward harmonious integration
   */
  generateMixedToneResponse(
    mixedTones: NonNullable<ToneAnalysis['mixedTones']>, 
    resistanceFlags: ToneAnalysis['resistanceFlags'],
    baseResponse: string
  ): {
    acknowledgment: string;
    integration: string;
    metaphor: string;
  } {
    const { primary, secondary, ratio } = mixedTones;
    
    // Element metaphor mappings
    const elementMetaphors = {
      fire: { name: 'flame', quality: 'passionate energy', action: 'burns bright' },
      water: { name: 'river', quality: 'flowing emotion', action: 'moves with grace' },
      earth: { name: 'mountain', quality: 'grounded strength', action: 'stands steady' },
      air: { name: 'wind', quality: 'clear thinking', action: 'dances freely' },
      aether: { name: 'starlight', quality: 'expansive wisdom', action: 'touches infinity' }
    };
    
    const primaryMeta = elementMetaphors[primary];
    const secondaryMeta = elementMetaphors[secondary];
    
    // Generate acknowledgment that honors both elements
    const acknowledgment = `I feel both the ${primaryMeta.name} of your ${primaryMeta.quality} and the ${secondaryMeta.name} of your ${secondaryMeta.quality}. This beautiful complexity is sacred - you're holding multiple truths at once.`;
    
    // Generate integration guidance
    const integration = this.generateElementIntegrationGuidance(primary, secondary, resistanceFlags);
    
    // Generate metaphor for the combination
    const metaphor = this.generateMixedElementMetaphor(primary, secondary, ratio);
    
    return {
      acknowledgment,
      integration,
      metaphor
    };
  }

  /**
   * Generate guidance for integrating two elements
   */
  private generateElementIntegrationGuidance(
    primary: keyof ElementalSignature,
    secondary: keyof ElementalSignature,
    resistanceFlags?: ToneAnalysis['resistanceFlags']
  ): string {
    // Integration patterns for element combinations
    const integrationMap: Record<string, string> = {
      'fire-water': 'Let your passion flow like warm water - purposeful but not burning. Your intensity can be both powerful and gentle.',
      'fire-earth': 'Channel your fire into practical action. Let your passion build something lasting and real in the world.',
      'fire-air': 'Let your excitement dance with your thoughts. Your enthusiasm can fuel clear insight and inspired action.',
      'fire-aether': 'Your passionate spirit touches something divine. Let this sacred fire illuminate higher purpose.',
      'water-earth': 'Let your emotions flow into form. Your feelings can create solid foundation and nurturing structure.',
      'water-air': 'Honor both your heart and mind. Let emotions inform thought and wisdom guide feeling.',
      'water-aether': 'Your deep feelings connect to universal compassion. This emotional wisdom is spiritually profound.',
      'earth-air': 'Ground your thoughts in practical reality while staying open to new perspectives. Wisdom meets action.',
      'earth-aether': 'Embody your spiritual insights in daily life. Let transcendent wisdom take practical form.',
      'air-aether': 'Your clear thinking touches infinite possibility. Let mental clarity open to cosmic perspective.'
    };
    
    // Create bidirectional key
    const key1 = `${primary}-${secondary}`;
    const key2 = `${secondary}-${primary}`;
    
    let guidance = integrationMap[key1] || integrationMap[key2] || 
      `Finding harmony between your ${primary} and ${secondary} energies creates beautiful wholeness.`;
    
    // Adjust for resistance flags
    if (resistanceFlags?.overwhelm) {
      guidance += ' Take this integration gently - one breath at a time.';
    } else if (resistanceFlags?.uncertainty) {
      guidance += ' Trust that this complexity is exactly where you need to be right now.';
    } else if (resistanceFlags?.defensiveness) {
      guidance += ' This isn\'t about fixing anything - it\'s about honoring all parts of yourself.';
    }
    
    return guidance;
  }

  /**
   * Generate poetic metaphor for mixed elements
   */
  private generateMixedElementMetaphor(
    primary: keyof ElementalSignature,
    secondary: keyof ElementalSignature,
    ratio: number
  ): string {
    const metaphors: Record<string, string> = {
      'fire-water': `Like steam rising from sacred springs - your passion meets your depth in beautiful transformation.`,
      'fire-earth': `Like lava cooling into new land - your intensity creates lasting foundation.`,
      'fire-air': `Like lightning illuminating the sky - your energy and insight spark together brilliantly.`,
      'fire-aether': `Like a candle flame reaching toward stars - your earthly passion touches divine mystery.`,
      'water-earth': `Like a river carving through stone - your flow creates gentle but persistent change.`,
      'water-air': `Like morning mist touched by breeze - your emotions and thoughts dance in delicate balance.`,
      'water-aether': `Like moonlight on sacred water - your feelings reflect infinite compassion.`,
      'earth-air': `Like ancient trees swaying in wind - rooted stability that moves with life's currents.`,
      'earth-aether': `Like crystals holding starlight - earthly form containing cosmic wisdom.`,
      'air-aether': `Like wind carrying prayers to heaven - your thoughts open to limitless possibility.`
    };
    
    const key1 = `${primary}-${secondary}`;
    const key2 = `${secondary}-${primary}`;
    
    return metaphors[key1] || metaphors[key2] || 
      `Like the dance between ${primary} and ${secondary} - finding unity in sacred diversity.`;
  }

  /**
   * Generate reframing questions for user resistance/uncertainty
   * Uses metaphors instead of direct elemental labels
   */
  generateResistanceReframing(
    resistanceFlags: ToneAnalysis['resistanceFlags']
  ): string {
    if (resistanceFlags?.uncertainty) {
      return "That's perfectly okay 🌱. Sometimes our inner landscape is complex. Would you say your energy right now feels more like 🔥 a warm flame (passionate, driven), or 🌊 flowing water (emotional, gentle)?";
    }
    
    if (resistanceFlags?.defensiveness) {
      return "I hear you, and there's no judgment here 🤲. Your experience is completely valid. I'm curious - if you had to pick a season that matches your inner weather right now, would it be more like fiery summer or grounding autumn?";
    }
    
    if (resistanceFlags?.overwhelm) {
      return "Take a breath 🌬️. You don't have to figure everything out right now. If you could imagine your feelings as weather, are they more like a intense thunderstorm or heavy fog?";
    }
    
    if (resistanceFlags?.disconnection) {
      return "I sense you might be feeling a bit distant from yourself right now, which is completely natural 🌙. If you had to choose, does your energy feel more like still water or quiet earth?";
    }
    
    return "Sometimes it helps to think in images rather than words 🎨. What comes to mind - fire, water, mountains, wind, or starlight?";
  }
}

// Export singleton instance
export default AdaptiveProsodyEngine;