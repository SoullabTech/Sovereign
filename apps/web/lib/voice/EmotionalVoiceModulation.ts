/**
 * Emotional Voice Modulation System
 * Dynamically adjusts voice parameters based on conversation context and emotional state
 */

import { VoiceSettings } from '../context/OraclePersonalizationContext';

export interface EmotionalState {
  primary: EmotionType;
  intensity: number; // 0-1
  secondary?: EmotionType;
  secondaryIntensity?: number;
  arousal: number; // -1 (calm) to 1 (excited)
  valence: number; // -1 (negative) to 1 (positive)
}

export type EmotionType = 
  | 'neutral'
  | 'joy'
  | 'excitement'
  | 'contemplation'
  | 'mystery'
  | 'compassion'
  | 'wisdom'
  | 'playfulness'
  | 'serenity'
  | 'awe'
  | 'concern'
  | 'encouragement';

export interface VoiceModulation {
  pitch: number;          // Multiplier: 0.5-2.0
  speed: number;          // Multiplier: 0.5-2.0
  volume: number;         // 0-1
  emphasis: number;       // 0-1
  breathiness: number;    // 0-1
  warmth: number;         // 0-1
  clarity: number;        // 0-1
  pauseDuration: number;  // Milliseconds between phrases
  intonation: 'rising' | 'falling' | 'neutral' | 'questioning';
}

export interface ConversationContext {
  topic: string;
  userMood: EmotionalState;
  conversationDepth: number; // 0-1 (surface to deep)
  trustLevel: number;        // 0-1
  sessionDuration: number;    // Minutes
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  recentTopics: string[];
  elementalResonance: 'fire' | 'water' | 'earth' | 'air' | 'aether';
}

export class EmotionalVoiceModulator {
  private static instance: EmotionalVoiceModulator;
  private emotionalMemory: Map<string, EmotionalState[]> = new Map();
  private contextHistory: ConversationContext[] = [];
  
  // Emotion-to-voice mappings
  private emotionProfiles: Record<EmotionType, Partial<VoiceModulation>> = {
    neutral: {
      pitch: 1.0,
      speed: 1.0,
      volume: 0.7,
      emphasis: 0.3,
      breathiness: 0.2,
      warmth: 0.5,
      clarity: 0.8,
      pauseDuration: 500,
      intonation: 'neutral'
    },
    joy: {
      pitch: 1.15,
      speed: 1.1,
      volume: 0.8,
      emphasis: 0.5,
      breathiness: 0.1,
      warmth: 0.8,
      clarity: 0.9,
      pauseDuration: 400,
      intonation: 'rising'
    },
    excitement: {
      pitch: 1.2,
      speed: 1.2,
      volume: 0.85,
      emphasis: 0.7,
      breathiness: 0.05,
      warmth: 0.7,
      clarity: 0.95,
      pauseDuration: 300,
      intonation: 'rising'
    },
    contemplation: {
      pitch: 0.95,
      speed: 0.85,
      volume: 0.65,
      emphasis: 0.4,
      breathiness: 0.3,
      warmth: 0.6,
      clarity: 0.75,
      pauseDuration: 800,
      intonation: 'neutral'
    },
    mystery: {
      pitch: 0.9,
      speed: 0.8,
      volume: 0.6,
      emphasis: 0.5,
      breathiness: 0.4,
      warmth: 0.3,
      clarity: 0.7,
      pauseDuration: 1000,
      intonation: 'questioning'
    },
    compassion: {
      pitch: 0.95,
      speed: 0.9,
      volume: 0.7,
      emphasis: 0.3,
      breathiness: 0.25,
      warmth: 0.9,
      clarity: 0.8,
      pauseDuration: 600,
      intonation: 'falling'
    },
    wisdom: {
      pitch: 0.92,
      speed: 0.85,
      volume: 0.72,
      emphasis: 0.45,
      breathiness: 0.2,
      warmth: 0.65,
      clarity: 0.85,
      pauseDuration: 700,
      intonation: 'neutral'
    },
    playfulness: {
      pitch: 1.1,
      speed: 1.05,
      volume: 0.75,
      emphasis: 0.6,
      breathiness: 0.15,
      warmth: 0.75,
      clarity: 0.85,
      pauseDuration: 450,
      intonation: 'rising'
    },
    serenity: {
      pitch: 0.98,
      speed: 0.88,
      volume: 0.65,
      emphasis: 0.2,
      breathiness: 0.35,
      warmth: 0.7,
      clarity: 0.75,
      pauseDuration: 900,
      intonation: 'neutral'
    },
    awe: {
      pitch: 1.05,
      speed: 0.92,
      volume: 0.68,
      emphasis: 0.55,
      breathiness: 0.3,
      warmth: 0.55,
      clarity: 0.8,
      pauseDuration: 850,
      intonation: 'rising'
    },
    concern: {
      pitch: 0.97,
      speed: 0.95,
      volume: 0.72,
      emphasis: 0.4,
      breathiness: 0.22,
      warmth: 0.75,
      clarity: 0.82,
      pauseDuration: 550,
      intonation: 'questioning'
    },
    encouragement: {
      pitch: 1.08,
      speed: 1.02,
      volume: 0.78,
      emphasis: 0.5,
      breathiness: 0.12,
      warmth: 0.85,
      clarity: 0.88,
      pauseDuration: 500,
      intonation: 'rising'
    }
  };

  private constructor() {}

  public static getInstance(): EmotionalVoiceModulator {
    if (!EmotionalVoiceModulator.instance) {
      EmotionalVoiceModulator.instance = new EmotionalVoiceModulator();
    }
    return EmotionalVoiceModulator.instance;
  }

  /**
   * Analyze text and context to determine emotional state
   */
  public analyzeEmotion(
    text: string, 
    context: ConversationContext
  ): EmotionalState {
    // Keyword-based emotion detection
    const emotionKeywords: Record<EmotionType, string[]> = {
      joy: ['happy', 'wonderful', 'amazing', 'delighted', 'celebrate', 'beautiful'],
      excitement: ['excited', 'thrilled', 'energized', 'passionate', 'eager'],
      contemplation: ['think', 'wonder', 'consider', 'reflect', 'ponder', 'perhaps'],
      mystery: ['unknown', 'hidden', 'secret', 'enigma', 'puzzle', 'curious'],
      compassion: ['care', 'understand', 'feel', 'support', 'here for you', 'gentle'],
      wisdom: ['know', 'learned', 'experience', 'ancient', 'truth', 'understand deeply'],
      playfulness: ['play', 'fun', 'laugh', 'silly', 'dance', 'sparkle'],
      serenity: ['peace', 'calm', 'still', 'quiet', 'rest', 'breathe'],
      awe: ['magnificent', 'cosmic', 'infinite', 'divine', 'sacred', 'profound'],
      concern: ['worry', 'concern', 'careful', 'mindful', 'attention'],
      encouragement: ['you can', 'believe', 'strength', 'capable', 'proud'],
      neutral: []
    };

    // Calculate emotion scores
    const scores: Record<EmotionType, number> = {} as any;
    const lowerText = text.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      scores[emotion as EmotionType] = keywords.reduce((score, keyword) => 
        score + (lowerText.includes(keyword) ? 1 : 0), 0
      );
    }

    // Context-based adjustments
    this.applyContextualAdjustments(scores, context);
    
    // Time-of-day adjustments
    this.applyTemporalAdjustments(scores, context.timeOfDay);
    
    // Elemental resonance adjustments
    this.applyElementalAdjustments(scores, context.elementalResonance);
    
    // Find primary emotion
    const primary = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as EmotionType) || 'neutral';
    const intensity = Math.min(scores[primary] / 5, 1); // Normalize intensity
    
    // Find secondary emotion if present
    const sortedEmotions = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const secondary = sortedEmotions[1] && sortedEmotions[1][1] > 0 
      ? sortedEmotions[1][0] as EmotionType 
      : undefined;
    const secondaryIntensity = secondary ? Math.min(scores[secondary] / 5, 0.5) : undefined;
    
    // Calculate arousal and valence
    const arousal = this.calculateArousal(primary, intensity);
    const valence = this.calculateValence(primary, context.userMood);
    
    const emotionalState: EmotionalState = {
      primary,
      intensity,
      secondary,
      secondaryIntensity,
      arousal,
      valence
    };
    
    // Store in emotional memory
    this.storeEmotionalMemory(context.topic, emotionalState);
    
    return emotionalState;
  }

  /**
   * Generate voice modulation parameters based on emotional state
   */
  public modulateVoice(
    baseSettings: VoiceSettings,
    emotionalState: EmotionalState,
    context: ConversationContext
  ): VoiceModulation {
    // Get base modulation for primary emotion
    const primaryModulation = this.emotionProfiles[emotionalState.primary] || this.emotionProfiles.neutral;
    
    // Blend with secondary emotion if present
    let modulation = { ...primaryModulation } as VoiceModulation;
    
    if (emotionalState.secondary && emotionalState.secondaryIntensity) {
      const secondaryModulation = this.emotionProfiles[emotionalState.secondary];
      modulation = this.blendModulations(
        modulation, 
        secondaryModulation as VoiceModulation,
        emotionalState.secondaryIntensity
      );
    }
    
    // Apply intensity scaling
    modulation = this.applyIntensity(modulation, emotionalState.intensity);
    
    // Apply trust-based adjustments
    modulation = this.applyTrustAdjustments(modulation, context.trustLevel);
    
    // Apply conversation depth adjustments
    modulation = this.applyDepthAdjustments(modulation, context.conversationDepth);
    
    // Apply user mood mirroring (subtle)
    modulation = this.mirrorUserMood(modulation, context.userMood);
    
    // Apply base settings
    modulation.pitch *= baseSettings.pitch;
    modulation.speed *= baseSettings.speed;
    modulation.volume *= baseSettings.volume;
    
    // Ensure values are within valid ranges
    modulation = this.clampModulation(modulation);
    
    return modulation;
  }

  /**
   * Generate SSML with emotional markup
   */
  public generateEmotionalSSML(
    text: string,
    modulation: VoiceModulation,
    emotionalState: EmotionalState
  ): string {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const ssmlParts: string[] = [];
    
    for (const sentence of sentences) {
      // Determine emphasis points
      const emphasisWords = this.identifyEmphasisWords(sentence, emotionalState);
      
      let processedSentence = sentence;
      
      // Apply emphasis markup
      emphasisWords.forEach(word => {
        const emphasisLevel = modulation.emphasis > 0.6 ? 'strong' : 
                             modulation.emphasis > 0.3 ? 'moderate' : 'reduced';
        processedSentence = processedSentence.replace(
          word,
          `<emphasis level="${emphasisLevel}">${word}</emphasis>`
        );
      });
      
      // Add prosody wrapper
      const prosodyTag = `
        <prosody 
          rate="${Math.round(modulation.speed * 100)}%" 
          pitch="${modulation.pitch > 1 ? '+' : ''}${Math.round((modulation.pitch - 1) * 50)}%"
          volume="${Math.round(modulation.volume * 100)}%">
          ${processedSentence}
        </prosody>
      `;
      
      ssmlParts.push(prosodyTag);
      
      // Add pause between sentences
      if (modulation.pauseDuration > 0) {
        ssmlParts.push(`<break time="${modulation.pauseDuration}ms"/>`);
      }
    }
    
    // Add emotional expression hints (for advanced TTS engines)
    const emotionTag = this.getEmotionSSMLTag(emotionalState);
    
    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        ${emotionTag}
        ${ssmlParts.join('\n')}
      </speak>
    `;
  }

  private applyContextualAdjustments(
    scores: Record<EmotionType, number>,
    context: ConversationContext
  ): void {
    // Deep conversations favor contemplation and wisdom
    if (context.conversationDepth > 0.7) {
      scores.contemplation = (scores.contemplation || 0) + 2;
      scores.wisdom = (scores.wisdom || 0) + 2;
    }
    
    // High trust enables more playfulness and warmth
    if (context.trustLevel > 0.7) {
      scores.playfulness = (scores.playfulness || 0) + 1;
      scores.compassion = (scores.compassion || 0) + 1;
    }
    
    // Long sessions may need encouragement
    if (context.sessionDuration > 30) {
      scores.encouragement = (scores.encouragement || 0) + 1;
      scores.compassion = (scores.compassion || 0) + 1;
    }
  }

  private applyTemporalAdjustments(
    scores: Record<EmotionType, number>,
    timeOfDay: ConversationContext['timeOfDay']
  ): void {
    switch (timeOfDay) {
      case 'morning':
        scores.encouragement = (scores.encouragement || 0) + 1;
        scores.joy = (scores.joy || 0) + 1;
        break;
      case 'evening':
        scores.serenity = (scores.serenity || 0) + 1;
        scores.contemplation = (scores.contemplation || 0) + 1;
        break;
      case 'night':
        scores.mystery = (scores.mystery || 0) + 1;
        scores.wisdom = (scores.wisdom || 0) + 1;
        break;
    }
  }

  private applyElementalAdjustments(
    scores: Record<EmotionType, number>,
    element: ConversationContext['elementalResonance']
  ): void {
    const elementalEmotions = {
      fire: ['excitement', 'encouragement', 'joy'],
      water: ['compassion', 'serenity', 'contemplation'],
      earth: ['wisdom', 'concern', 'neutral'],
      air: ['playfulness', 'mystery', 'awe'],
      aether: ['awe', 'mystery', 'wisdom']
    };
    
    const emotions = elementalEmotions[element];
    emotions.forEach(emotion => {
      scores[emotion as EmotionType] = (scores[emotion as EmotionType] || 0) + 1;
    });
  }

  private calculateArousal(emotion: EmotionType, intensity: number): number {
    const arousalMap: Record<EmotionType, number> = {
      excitement: 0.9,
      joy: 0.7,
      playfulness: 0.6,
      encouragement: 0.5,
      awe: 0.3,
      neutral: 0,
      concern: -0.1,
      compassion: -0.2,
      wisdom: -0.3,
      contemplation: -0.4,
      mystery: -0.5,
      serenity: -0.7
    };
    
    return (arousalMap[emotion] || 0) * intensity;
  }

  private calculateValence(
    emotion: EmotionType,
    userMood: EmotionalState
  ): number {
    const valenceMap: Record<EmotionType, number> = {
      joy: 0.9,
      encouragement: 0.8,
      playfulness: 0.7,
      excitement: 0.6,
      compassion: 0.5,
      awe: 0.4,
      serenity: 0.3,
      wisdom: 0.2,
      neutral: 0,
      contemplation: -0.1,
      mystery: -0.2,
      concern: -0.4
    };
    
    // Slightly mirror user's valence for rapport
    const baseValence = valenceMap[emotion] || 0;
    const userInfluence = userMood.valence * 0.2; // 20% influence
    
    return baseValence + userInfluence;
  }

  private blendModulations(
    primary: VoiceModulation,
    secondary: VoiceModulation,
    secondaryWeight: number
  ): VoiceModulation {
    const primaryWeight = 1 - secondaryWeight;
    
    return {
      pitch: primary.pitch * primaryWeight + secondary.pitch * secondaryWeight,
      speed: primary.speed * primaryWeight + secondary.speed * secondaryWeight,
      volume: primary.volume * primaryWeight + secondary.volume * secondaryWeight,
      emphasis: primary.emphasis * primaryWeight + secondary.emphasis * secondaryWeight,
      breathiness: primary.breathiness * primaryWeight + secondary.breathiness * secondaryWeight,
      warmth: primary.warmth * primaryWeight + secondary.warmth * secondaryWeight,
      clarity: primary.clarity * primaryWeight + secondary.clarity * secondaryWeight,
      pauseDuration: Math.round(primary.pauseDuration * primaryWeight + secondary.pauseDuration * secondaryWeight),
      intonation: primaryWeight > 0.7 ? primary.intonation : secondary.intonation
    };
  }

  private applyIntensity(
    modulation: VoiceModulation,
    intensity: number
  ): VoiceModulation {
    // Scale deviations from neutral based on intensity
    const neutral = this.emotionProfiles.neutral as VoiceModulation;
    
    return {
      pitch: neutral.pitch + (modulation.pitch - neutral.pitch) * intensity,
      speed: neutral.speed + (modulation.speed - neutral.speed) * intensity,
      volume: neutral.volume + (modulation.volume - neutral.volume) * intensity,
      emphasis: modulation.emphasis * intensity,
      breathiness: modulation.breathiness,
      warmth: modulation.warmth,
      clarity: modulation.clarity,
      pauseDuration: modulation.pauseDuration,
      intonation: intensity > 0.5 ? modulation.intonation : 'neutral'
    };
  }

  private applyTrustAdjustments(
    modulation: VoiceModulation,
    trustLevel: number
  ): VoiceModulation {
    // Higher trust = more natural, relaxed delivery
    return {
      ...modulation,
      breathiness: modulation.breathiness + (trustLevel * 0.1),
      warmth: modulation.warmth + (trustLevel * 0.15),
      pauseDuration: modulation.pauseDuration * (1 - trustLevel * 0.2) // Shorter pauses with trust
    };
  }

  private applyDepthAdjustments(
    modulation: VoiceModulation,
    depth: number
  ): VoiceModulation {
    // Deeper conversations = slower, more thoughtful delivery
    return {
      ...modulation,
      speed: modulation.speed * (1 - depth * 0.15),
      pauseDuration: modulation.pauseDuration * (1 + depth * 0.3),
      emphasis: modulation.emphasis * (1 + depth * 0.2)
    };
  }

  private mirrorUserMood(
    modulation: VoiceModulation,
    userMood: EmotionalState
  ): VoiceModulation {
    // Subtle mirroring for rapport (10-20% influence)
    const mirrorFactor = 0.15;
    
    return {
      ...modulation,
      pitch: modulation.pitch + (userMood.arousal * 0.1 * mirrorFactor),
      speed: modulation.speed + (userMood.arousal * 0.1 * mirrorFactor),
      warmth: modulation.warmth + (userMood.valence * 0.2 * mirrorFactor)
    };
  }

  private clampModulation(modulation: VoiceModulation): VoiceModulation {
    return {
      pitch: Math.max(0.5, Math.min(2.0, modulation.pitch)),
      speed: Math.max(0.5, Math.min(2.0, modulation.speed)),
      volume: Math.max(0, Math.min(1, modulation.volume)),
      emphasis: Math.max(0, Math.min(1, modulation.emphasis)),
      breathiness: Math.max(0, Math.min(1, modulation.breathiness)),
      warmth: Math.max(0, Math.min(1, modulation.warmth)),
      clarity: Math.max(0, Math.min(1, modulation.clarity)),
      pauseDuration: Math.max(100, Math.min(2000, modulation.pauseDuration)),
      intonation: modulation.intonation
    };
  }

  private identifyEmphasisWords(
    sentence: string,
    emotionalState: EmotionalState
  ): string[] {
    const words = sentence.split(/\s+/);
    const emphasisWords: string[] = [];
    
    // Emotion-specific emphasis patterns
    const emphasisPatterns: Record<EmotionType, string[]> = {
      excitement: ['amazing', 'incredible', 'wow', 'fantastic'],
      compassion: ['feel', 'understand', 'care', 'here'],
      wisdom: ['know', 'truth', 'learn', 'remember'],
      encouragement: ['can', 'will', 'strong', 'capable'],
      mystery: ['perhaps', 'hidden', 'secret', 'unknown'],
      neutral: [],
      joy: ['happy', 'wonderful', 'beautiful'],
      contemplation: ['think', 'consider', 'wonder'],
      playfulness: ['fun', 'play', 'dance'],
      serenity: ['peace', 'calm', 'still'],
      awe: ['magnificent', 'infinite', 'sacred'],
      concern: ['careful', 'mindful', 'attention']
    };
    
    const patterns = emphasisPatterns[emotionalState.primary] || [];
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
      if (patterns.some(pattern => cleanWord.includes(pattern))) {
        emphasisWords.push(word);
      }
    });
    
    return emphasisWords;
  }

  private getEmotionSSMLTag(emotionalState: EmotionalState): string {
    // For engines that support emotion tags (like Azure Neural)
    const emotionStyles: Record<EmotionType, string> = {
      joy: 'cheerful',
      excitement: 'excited',
      compassion: 'empathetic',
      concern: 'concerned',
      contemplation: 'thoughtful',
      mystery: 'whispering',
      wisdom: 'calm',
      playfulness: 'friendly',
      serenity: 'calm',
      awe: 'hopeful',
      encouragement: 'hopeful',
      neutral: 'neutral'
    };
    
    const style = emotionStyles[emotionalState.primary] || 'neutral';
    return `<mstts:express-as style="${style}" styledegree="${emotionalState.intensity}">`;
  }

  private storeEmotionalMemory(topic: string, state: EmotionalState): void {
    if (!this.emotionalMemory.has(topic)) {
      this.emotionalMemory.set(topic, []);
    }
    
    const memory = this.emotionalMemory.get(topic)!;
    memory.push(state);
    
    // Keep only last 10 emotional states per topic
    if (memory.length > 10) {
      memory.shift();
    }
  }

  public getEmotionalHistory(topic: string): EmotionalState[] {
    return this.emotionalMemory.get(topic) || [];
  }

  public clearEmotionalMemory(): void {
    this.emotionalMemory.clear();
    this.contextHistory = [];
  }
}