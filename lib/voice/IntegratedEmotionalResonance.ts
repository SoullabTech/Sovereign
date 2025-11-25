/**
 * Integrated Emotional Resonance System
 * Bridges ResonanceEngine with EmotionalVoiceModulation
 * Provides unified emotional-elemental awareness
 */

import { ResonanceEngine, Element, ResonanceState } from '../resonanceEngine';
import { SweetSpotCalibrator, ConversationFlow } from '../sweetSpotCalibration';
import { 
  EmotionalVoiceModulator, 
  EmotionalState, 
  EmotionType, 
  ConversationContext,
  VoiceModulation 
} from './EmotionalVoiceModulation';
import { VoiceSettings } from '../context/OraclePersonalizationContext';

export interface UnifiedEmotionalSignature {
  resonance: ResonanceState;
  emotion: EmotionalState;
  voiceModulation: VoiceModulation;
  presenceGuidance: string;
  elementalEmotionBlend: ElementalEmotionProfile;
}

export interface ElementalEmotionProfile {
  element: Element;
  emotionalQuality: EmotionType;
  intensity: number;
  depth: number;
  archetypalPattern: string;
}

export class IntegratedEmotionalResonance {
  private static instance: IntegratedEmotionalResonance;
  private resonanceEngine: ResonanceEngine;
  private sweetSpotCalibrator: SweetSpotCalibrator;
  private emotionalModulator: EmotionalVoiceModulator;
  private conversationHistory: UnifiedEmotionalSignature[] = [];
  
  // Elemental-Emotional Mappings
  private elementalEmotionMap: Record<Element, EmotionType[]> = {
    fire: ['excitement', 'encouragement', 'joy', 'playfulness'],
    water: ['compassion', 'serenity', 'contemplation', 'concern'],
    earth: ['wisdom', 'neutral', 'concern', 'encouragement'],
    air: ['playfulness', 'mystery', 'awe', 'contemplation'],
    aether: ['awe', 'mystery', 'wisdom', 'serenity']
  };
  
  // Archetypal patterns based on element + emotion combinations
  private archetypalPatterns: Record<string, string> = {
    'fire_excitement': 'The Ignitor - Sparking transformation',
    'fire_encouragement': 'The Champion - Fueling courage',
    'water_compassion': 'The Holder - Creating safe harbor',
    'water_serenity': 'The Still Pool - Reflecting clarity',
    'earth_wisdom': 'The Ancient Mountain - Grounded knowing',
    'earth_concern': 'The Guardian - Protective presence',
    'air_playfulness': 'The Dancing Wind - Lightness of being',
    'air_mystery': 'The Whisperer - Carrying secrets',
    'aether_awe': 'The Star Gazer - Witnessing infinity',
    'aether_wisdom': 'The Oracle - Channel of knowing'
  };

  private constructor() {
    this.resonanceEngine = new ResonanceEngine();
    this.sweetSpotCalibrator = new SweetSpotCalibrator();
    this.emotionalModulator = EmotionalVoiceModulator.getInstance();
  }

  public static getInstance(): IntegratedEmotionalResonance {
    if (!IntegratedEmotionalResonance.instance) {
      IntegratedEmotionalResonance.instance = new IntegratedEmotionalResonance();
    }
    return IntegratedEmotionalResonance.instance;
  }

  /**
   * Generate unified emotional signature from user input
   */
  public async generateSignature(
    userInput: string,
    voiceSettings: VoiceSettings,
    conversationFlow: ConversationFlow,
    userId: string
  ): Promise<UnifiedEmotionalSignature> {
    // 1. Detect elemental resonance
    const resonance = this.resonanceEngine.detect(userInput);
    
    // 2. Create conversation context from resonance
    const context = this.buildContext(resonance, conversationFlow);
    
    // 3. Analyze emotional state using both text and elemental state
    const emotion = this.analyzeIntegratedEmotion(userInput, resonance, context);
    
    // 4. Generate voice modulation
    const voiceModulation = this.emotionalModulator.modulateVoice(
      voiceSettings,
      emotion,
      context
    );
    
    // 5. Get presence guidance from sweet spot calibrator
    const presenceGuidance = this.sweetSpotCalibrator.calibratePresence(
      conversationFlow,
      resonance.dominant
    );
    
    // 6. Create elemental-emotion blend profile
    const elementalEmotionBlend = this.blendElementalEmotion(
      resonance,
      emotion,
      conversationFlow
    );
    
    // 7. Create unified signature
    const signature: UnifiedEmotionalSignature = {
      resonance,
      emotion,
      voiceModulation,
      presenceGuidance,
      elementalEmotionBlend
    };
    
    // 8. Store in history
    this.conversationHistory.push(signature);
    if (this.conversationHistory.length > 50) {
      this.conversationHistory.shift();
    }
    
    // 9. Sync to cloud for cross-device access
    await this.syncToCloud(userId, signature);
    
    return signature;
  }

  /**
   * Analyze emotion with elemental influence
   */
  private analyzeIntegratedEmotion(
    text: string,
    resonance: ResonanceState,
    context: ConversationContext
  ): EmotionalState {
    // Get base emotion from text
    let emotion = this.emotionalModulator.analyzeEmotion(text, context);
    
    // Influence emotion based on elemental state
    const elementalEmotions = this.elementalEmotionMap[resonance.dominant];
    
    // If the detected emotion aligns with element, strengthen it
    if (elementalEmotions.includes(emotion.primary)) {
      emotion.intensity = Math.min(emotion.intensity * 1.3, 1);
    }
    
    // Add elemental secondary emotion if not present
    if (!emotion.secondary && elementalEmotions.length > 0) {
      // Find an elemental emotion that's not the primary
      const secondaryOptions = elementalEmotions.filter(e => e !== emotion.primary);
      if (secondaryOptions.length > 0) {
        emotion.secondary = secondaryOptions[0];
        emotion.secondaryIntensity = resonance.intensity * 0.3;
      }
    }
    
    // Adjust arousal and valence based on element
    emotion = this.adjustForElement(emotion, resonance.dominant, resonance.intensity);
    
    return emotion;
  }

  /**
   * Adjust emotional state based on elemental influence
   */
  private adjustForElement(
    emotion: EmotionalState,
    element: Element,
    intensity: number
  ): EmotionalState {
    const elementalAdjustments = {
      fire: { arousalBoost: 0.3, valenceBoost: 0.2 },
      water: { arousalBoost: -0.2, valenceBoost: 0.1 },
      earth: { arousalBoost: -0.3, valenceBoost: 0 },
      air: { arousalBoost: 0.1, valenceBoost: 0.3 },
      aether: { arousalBoost: 0, valenceBoost: 0.2 }
    };
    
    const adjustment = elementalAdjustments[element];
    
    return {
      ...emotion,
      arousal: Math.max(-1, Math.min(1, 
        emotion.arousal + (adjustment.arousalBoost * intensity)
      )),
      valence: Math.max(-1, Math.min(1,
        emotion.valence + (adjustment.valenceBoost * intensity)
      ))
    };
  }

  /**
   * Build conversation context from resonance state
   */
  private buildContext(
    resonance: ResonanceState,
    flow: ConversationFlow
  ): ConversationContext {
    // Determine conversation depth from processing depth
    const depthMap = {
      'surface': 0.2,
      'exploring': 0.5,
      'deep': 0.8,
      'looping': 0.6 // Lower because it's stuck
    };
    
    // Estimate trust from exchange count and depth
    const trustLevel = Math.min(
      (flow.exchangeCount * 0.1) + (depthMap[flow.processingDepth] * 0.5),
      1
    );
    
    // Determine user mood from resonance
    const userMood = this.inferUserMood(resonance);
    
    return {
      topic: 'current_conversation', // Would be extracted from actual conversation
      userMood,
      conversationDepth: depthMap[flow.processingDepth],
      trustLevel,
      sessionDuration: flow.timeInMinutes,
      timeOfDay: this.getTimeOfDay(),
      recentTopics: [], // Would be populated from history
      elementalResonance: resonance.dominant
    };
  }

  /**
   * Infer user's emotional state from elemental resonance
   */
  private inferUserMood(resonance: ResonanceState): EmotionalState {
    // Map elemental states to emotional states
    const elementMoodMap: Record<Element, EmotionType> = {
      fire: 'excitement',
      water: 'contemplation',
      earth: 'concern',
      air: 'playfulness',
      aether: 'awe'
    };
    
    const primary = elementMoodMap[resonance.dominant];
    const secondary = resonance.secondary ? elementMoodMap[resonance.secondary] : undefined;
    
    // Calculate arousal/valence from elemental intensity
    const elementArousalMap: Record<Element, number> = {
      fire: 0.7,
      water: -0.3,
      earth: -0.4,
      air: 0.3,
      aether: 0
    };
    
    const elementValenceMap: Record<Element, number> = {
      fire: 0.5,
      water: 0,
      earth: 0.2,
      air: 0.6,
      aether: 0.4
    };
    
    return {
      primary,
      intensity: resonance.intensity,
      secondary,
      secondaryIntensity: resonance.secondary ? 0.3 : undefined,
      arousal: elementArousalMap[resonance.dominant] * resonance.intensity,
      valence: elementValenceMap[resonance.dominant] * resonance.intensity
    };
  }

  /**
   * Create blended elemental-emotional profile
   */
  private blendElementalEmotion(
    resonance: ResonanceState,
    emotion: EmotionalState,
    flow: ConversationFlow
  ): ElementalEmotionProfile {
    const patternKey = `${resonance.dominant}_${emotion.primary}`;
    const archetypalPattern = this.archetypalPatterns[patternKey] || 
      `The ${resonance.dominant} ${emotion.primary}`;
    
    return {
      element: resonance.dominant,
      emotionalQuality: emotion.primary,
      intensity: (resonance.intensity + emotion.intensity) / 2,
      depth: flow.processingDepth === 'deep' ? 0.8 : 
             flow.processingDepth === 'exploring' ? 0.5 : 0.2,
      archetypalPattern
    };
  }

  /**
   * Get time of day for context
   */
  private getTimeOfDay(): ConversationContext['timeOfDay'] {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Sync emotional signature to cloud for cross-device access
   */
  private async syncToCloud(
    userId: string,
    signature: UnifiedEmotionalSignature
  ): Promise<void> {
    try {
      // Store in Supabase for cross-device sync
      const response = await fetch('/api/sync/emotional-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          userId,
          signature: {
            timestamp: new Date().toISOString(),
            resonance: signature.resonance,
            emotion: signature.emotion,
            elementalBlend: signature.elementalEmotionBlend,
            deviceId: this.getDeviceId()
          }
        })
      });
      
      if (!response.ok) {
        console.error('Failed to sync emotional signature');
      }
    } catch (error) {
      console.error('Error syncing emotional signature:', error);
      // Continue working offline
    }
  }

  /**
   * Load emotional history from cloud
   */
  public async loadFromCloud(userId: string): Promise<UnifiedEmotionalSignature[]> {
    try {
      const response = await fetch(`/api/sync/emotional-signature?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.signatures || [];
      }
    } catch (error) {
      console.error('Error loading emotional signatures from cloud:', error);
    }
    
    return [];
  }

  /**
   * Get or generate device ID for cross-device tracking
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Generate voice response with full emotional-elemental awareness
   */
  public async generateVoiceResponse(
    responseText: string,
    signature: UnifiedEmotionalSignature,
    voiceSettings: VoiceSettings
  ): Promise<{
    ssml: string;
    modulation: VoiceModulation;
    audioUrl?: string;
  }> {
    // Apply elemental inflection to voice modulation
    const elementalInflection = this.getElementalInflection(signature.resonance.dominant);
    const adjustedModulation = {
      ...signature.voiceModulation,
      ...elementalInflection
    };
    
    // Generate SSML with emotional and elemental markup
    const ssml = this.generateEnhancedSSML(
      responseText,
      adjustedModulation,
      signature
    );
    
    return {
      ssml,
      modulation: adjustedModulation,
      audioUrl: undefined // Would be populated by TTS service
    };
  }

  /**
   * Get voice inflection adjustments for element
   */
  private getElementalInflection(element: Element): Partial<VoiceModulation> {
    const inflections: Record<Element, Partial<VoiceModulation>> = {
      fire: {
        speed: 1.1,
        emphasis: 0.6,
        clarity: 0.9,
        intonation: 'rising'
      },
      water: {
        speed: 0.9,
        breathiness: 0.35,
        warmth: 0.7,
        intonation: 'falling'
      },
      earth: {
        speed: 0.85,
        emphasis: 0.4,
        clarity: 0.85,
        intonation: 'neutral'
      },
      air: {
        pitch: 1.05,
        breathiness: 0.25,
        pauseDuration: 600,
        intonation: 'questioning'
      },
      aether: {
        breathiness: 0.4,
        warmth: 0.5,
        pauseDuration: 800,
        intonation: 'neutral'
      }
    };
    
    return inflections[element];
  }

  /**
   * Generate enhanced SSML with elemental awareness
   */
  private generateEnhancedSSML(
    text: string,
    modulation: VoiceModulation,
    signature: UnifiedEmotionalSignature
  ): string {
    // Get base emotional SSML
    let ssml = this.emotionalModulator.generateEmotionalSSML(
      text,
      modulation,
      signature.emotion
    );
    
    // Add elemental breathing patterns
    const breathingPattern = this.getElementalBreathingPattern(signature.resonance.dominant);
    ssml = ssml.replace('<speak', `<speak breathingPattern="${breathingPattern}"`);
    
    // Add archetypal voice coloring (for advanced TTS)
    const voiceColor = this.getArchetypalVoiceColor(signature.elementalEmotionBlend);
    ssml = ssml.replace('</speak>', `<meta name="voice-archetype" content="${voiceColor}"/></speak>`);
    
    return ssml;
  }

  /**
   * Get breathing pattern for element
   */
  private getElementalBreathingPattern(element: Element): string {
    const patterns: Record<Element, string> = {
      fire: 'quick-energetic',
      water: 'flowing-rhythmic',
      earth: 'deep-grounded',
      air: 'light-variable',
      aether: 'spacious-ethereal'
    };
    return patterns[element];
  }

  /**
   * Get archetypal voice coloring
   */
  private getArchetypalVoiceColor(blend: ElementalEmotionProfile): string {
    // Use the archetypal pattern as voice color hint
    return blend.archetypalPattern.split(' - ')[0].replace('The ', '').toLowerCase();
  }

  /**
   * Get conversation history with emotional signatures
   */
  public getEmotionalHistory(): UnifiedEmotionalSignature[] {
    return this.conversationHistory;
  }

  /**
   * Predict next emotional state based on patterns
   */
  public predictNextState(currentSignature: UnifiedEmotionalSignature): UnifiedEmotionalSignature {
    // Analyze patterns in conversation history
    const recentHistory = this.conversationHistory.slice(-5);
    
    // Look for elemental transitions
    const elementalPattern = recentHistory.map(s => s.resonance.dominant);
    const nextElement = this.predictElementalTransition(elementalPattern);
    
    // Look for emotional arcs
    const emotionalPattern = recentHistory.map(s => s.emotion.primary);
    const nextEmotion = this.predictEmotionalTransition(emotionalPattern);
    
    // Create predicted signature
    return {
      ...currentSignature,
      resonance: {
        ...currentSignature.resonance,
        dominant: nextElement
      },
      emotion: {
        ...currentSignature.emotion,
        primary: nextEmotion
      }
    };
  }

  /**
   * Predict next elemental state
   */
  private predictElementalTransition(pattern: Element[]): Element {
    if (pattern.length < 2) return pattern[0] || 'earth';
    
    // Natural elemental transitions
    const transitions: Record<Element, Element[]> = {
      fire: ['earth', 'air'], // Fire settles to earth or rises to air
      water: ['earth', 'air'], // Water grounds or evaporates
      earth: ['water', 'fire'], // Earth can flow or ignite
      air: ['aether', 'water'], // Air expands or condenses
      aether: ['earth', 'air'] // Aether grounds or moves
    };
    
    const current = pattern[pattern.length - 1];
    const options = transitions[current];
    
    // Check if there's a pattern emerging
    const recent = pattern[pattern.length - 2];
    if (options.includes(recent)) {
      // Oscillation detected, try something different
      return options.find(e => e !== recent) || 'earth';
    }
    
    return options[0];
  }

  /**
   * Predict next emotional state
   */
  private predictEmotionalTransition(pattern: EmotionType[]): EmotionType {
    if (pattern.length < 2) return pattern[0] || 'neutral';
    
    // Natural emotional progressions
    const progressions: Record<EmotionType, EmotionType[]> = {
      excitement: ['joy', 'contemplation'],
      joy: ['serenity', 'playfulness'],
      contemplation: ['wisdom', 'awe'],
      concern: ['compassion', 'encouragement'],
      compassion: ['serenity', 'wisdom'],
      wisdom: ['contemplation', 'serenity'],
      playfulness: ['joy', 'excitement'],
      serenity: ['contemplation', 'neutral'],
      awe: ['wisdom', 'serenity'],
      encouragement: ['excitement', 'joy'],
      mystery: ['awe', 'contemplation'],
      neutral: ['contemplation', 'compassion']
    };
    
    const current = pattern[pattern.length - 1];
    const options = progressions[current] || ['neutral'];
    
    return options[0];
  }
}