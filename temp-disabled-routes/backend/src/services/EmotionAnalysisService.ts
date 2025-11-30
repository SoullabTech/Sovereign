/**
 * Emotion Analysis Service
 * Analyzes text and voice content for emotional resonance using multiple approaches:
 * - Lexical analysis (word-based emotion detection)
 * - Sentiment analysis 
 * - Energy signature mapping
 * - Trust-aware emotional profiling
 */

export interface EmotionVector {
  valence: number;      // -1 (negative) to +1 (positive)
  arousal: number;      // 0 (calm) to 1 (excited) 
  dominance: number;    // 0 (submissive) to 1 (dominant)
  energySignature: string;
  primaryEmotion?: {
    emotion: string;
    intensity: number;
    color: string;
  };
}

export interface EmotionAnalysisResult extends EmotionVector {
  confidence: number;
  keywords: string[];
  resonancePattern: 'stable' | 'fluctuating' | 'intense' | 'subtle';
}

class EmotionAnalysisService {
  private emotionLexicon: Map<string, EmotionVector> = new Map();
  private energySignatures: Map<string, string> = new Map();
  
  constructor() {
    this.initializeLexicon();
    this.initializeEnergySignatures();
  }

  private initializeLexicon() {
    // Positive high-arousal emotions
    this.emotionLexicon.set('excited', { valence: 0.8, arousal: 0.9, dominance: 0.7, energySignature: 'fire' });
    this.emotionLexicon.set('joy', { valence: 0.9, arousal: 0.6, dominance: 0.6, energySignature: 'light' });
    this.emotionLexicon.set('love', { valence: 0.9, arousal: 0.5, dominance: 0.4, energySignature: 'heart' });
    this.emotionLexicon.set('passionate', { valence: 0.8, arousal: 0.9, dominance: 0.8, energySignature: 'fire' });
    this.emotionLexicon.set('enthusiastic', { valence: 0.8, arousal: 0.8, dominance: 0.7, energySignature: 'air' });
    
    // Positive low-arousal emotions
    this.emotionLexicon.set('calm', { valence: 0.6, arousal: 0.1, dominance: 0.5, energySignature: 'water' });
    this.emotionLexicon.set('peaceful', { valence: 0.7, arousal: 0.1, dominance: 0.4, energySignature: 'earth' });
    this.emotionLexicon.set('content', { valence: 0.6, arousal: 0.2, dominance: 0.5, energySignature: 'earth' });
    this.emotionLexicon.set('grateful', { valence: 0.8, arousal: 0.3, dominance: 0.3, energySignature: 'light' });
    this.emotionLexicon.set('serene', { valence: 0.7, arousal: 0.1, dominance: 0.3, energySignature: 'water' });
    
    // Negative high-arousal emotions
    this.emotionLexicon.set('angry', { valence: -0.8, arousal: 0.9, dominance: 0.8, energySignature: 'fire' });
    this.emotionLexicon.set('furious', { valence: -0.9, arousal: 0.9, dominance: 0.9, energySignature: 'storm' });
    this.emotionLexicon.set('anxious', { valence: -0.6, arousal: 0.8, dominance: 0.2, energySignature: 'air' });
    this.emotionLexicon.set('stressed', { valence: -0.7, arousal: 0.8, dominance: 0.3, energySignature: 'storm' });
    this.emotionLexicon.set('frustrated', { valence: -0.6, arousal: 0.7, dominance: 0.6, energySignature: 'fire' });
    
    // Negative low-arousal emotions
    this.emotionLexicon.set('sad', { valence: -0.7, arousal: 0.3, dominance: 0.2, energySignature: 'water' });
    this.emotionLexicon.set('depressed', { valence: -0.8, arousal: 0.2, dominance: 0.1, energySignature: 'void' });
    this.emotionLexicon.set('lonely', { valence: -0.6, arousal: 0.3, dominance: 0.2, energySignature: 'shadow' });
    this.emotionLexicon.set('tired', { valence: -0.3, arousal: 0.1, dominance: 0.2, energySignature: 'earth' });
    this.emotionLexicon.set('hopeless', { valence: -0.9, arousal: 0.2, dominance: 0.1, energySignature: 'void' });

    // Neutral emotions
    this.emotionLexicon.set('confused', { valence: -0.2, arousal: 0.5, dominance: 0.3, energySignature: 'mist' });
    this.emotionLexicon.set('curious', { valence: 0.4, arousal: 0.6, dominance: 0.5, energySignature: 'air' });
    this.emotionLexicon.set('thoughtful', { valence: 0.2, arousal: 0.3, dominance: 0.4, energySignature: 'earth' });
  }

  private initializeEnergySignatures() {
    this.energySignatures.set('fire', '🔥 Intense, transformative energy');
    this.energySignatures.set('water', '🌊 Flowing, adaptive energy');  
    this.energySignatures.set('air', '💨 Light, mental energy');
    this.energySignatures.set('earth', '🌍 Grounded, stable energy');
    this.energySignatures.set('light', '✨ Radiant, joyful energy');
    this.energySignatures.set('shadow', '🌑 Deep, introspective energy');
    this.energySignatures.set('storm', '⛈️ Turbulent, chaotic energy');
    this.energySignatures.set('void', '⚫ Empty, depleted energy');
    this.energySignatures.set('heart', '💖 Loving, connective energy');
    this.energySignatures.set('mist', '🌫️ Unclear, transitional energy');
  }

  public async analyzeText(text: string, trustLevel: number = 0): Promise<EmotionAnalysisResult> {
    if (!text || text.trim().length < 3) {
      return this.getNeutralEmotion();
    }

    const words = text.toLowerCase().split(/\s+/);
    const emotionScores: EmotionVector[] = [];
    const matchedKeywords: string[] = [];

    // Find emotion words in text
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:"'()]/g, '');
      
      // Direct lexicon matches
      if (this.emotionLexicon.has(cleanWord)) {
        emotionScores.push(this.emotionLexicon.get(cleanWord)!);
        matchedKeywords.push(cleanWord);
        continue;
      }

      // Partial matches and variations
      for (const [lexWord, emotion] of this.emotionLexicon.entries()) {
        if (cleanWord.includes(lexWord) || lexWord.includes(cleanWord)) {
          emotionScores.push({...emotion, valence: emotion.valence * 0.7}); // Reduce confidence for partial matches
          matchedKeywords.push(cleanWord);
          break;
        }
      }
    }

    if (emotionScores.length === 0) {
      return this.getNeutralEmotion();
    }

    // Calculate weighted averages
    const avgValence = emotionScores.reduce((sum, e) => sum + e.valence, 0) / emotionScores.length;
    const avgArousal = emotionScores.reduce((sum, e) => sum + e.arousal, 0) / emotionScores.length;
    const avgDominance = emotionScores.reduce((sum, e) => sum + e.dominance, 0) / emotionScores.length;

    // Determine primary energy signature
    const signatureCounts = new Map<string, number>();
    emotionScores.forEach(e => {
      signatureCounts.set(e.energySignature, (signatureCounts.get(e.energySignature) || 0) + 1);
    });
    
    const primarySignature = [...signatureCounts.entries()]
      .sort((a, b) => b[1] - a[1])[0][0];

    // Determine primary emotion
    const primaryEmotion = this.determinePrimaryEmotion(avgValence, avgArousal, avgDominance);

    // Calculate confidence based on keyword matches and text length
    const confidence = Math.min(
      (matchedKeywords.length / Math.max(words.length * 0.1, 1)) + 
      (trustLevel * 0.3), // Higher trust = more confident analysis
      1.0
    );

    // Determine resonance pattern
    const resonancePattern = this.determineResonancePattern(emotionScores);

    return {
      valence: avgValence,
      arousal: avgArousal,
      dominance: avgDominance,
      energySignature: primarySignature,
      primaryEmotion,
      confidence,
      keywords: matchedKeywords,
      resonancePattern
    };
  }

  public async analyzeVoice(audioBuffer: ArrayBuffer, transcript: string, trustLevel: number = 0): Promise<EmotionAnalysisResult> {
    // For now, analyze the transcript and adjust based on voice characteristics
    // In a full implementation, this would include prosodic analysis
    const textAnalysis = await this.analyzeText(transcript, trustLevel);
    
    // Voice analysis would typically look at:
    // - Pitch variations (arousal)
    // - Speaking rate (arousal/dominance)
    // - Voice quality (valence)
    // - Pauses and hesitations (confidence)
    
    // Mock voice-based adjustments
    const voiceAdjustment = {
      valence: textAnalysis.valence * 1.1, // Voice often conveys more nuanced emotion
      arousal: Math.min(textAnalysis.arousal * 1.2, 1.0), // Voice captures excitement better
      dominance: textAnalysis.dominance,
      confidence: Math.min(textAnalysis.confidence * 1.3, 1.0) // Voice adds confidence
    };

    return {
      ...textAnalysis,
      ...voiceAdjustment,
      resonancePattern: 'voice-enhanced' as any
    };
  }

  public generateEmotionalInsight(emotion: EmotionAnalysisResult, trustLevel: number): string {
    const { valence, arousal, dominance, energySignature } = emotion;
    
    // Trust-aware insights
    const trustModifier = trustLevel > 0.7 ? "deeply" : trustLevel > 0.4 ? "gently" : "softly";
    
    if (valence > 0.6 && arousal > 0.6) {
      return `I sense ${trustModifier} that you're experiencing vibrant, uplifting energy. This ${energySignature} quality suggests you're in a space of creative expansion.`;
    } else if (valence > 0.4 && arousal < 0.3) {
      return `There's a ${trustModifier} peaceful quality to your emotional state. This ${energySignature} energy feels like a place of integration and rest.`;
    } else if (valence < -0.4 && arousal > 0.6) {
      return `I ${trustModifier} notice some intense emotional energy here. This ${energySignature} quality often signals important internal processing.`;
    } else if (valence < -0.4 && arousal < 0.3) {
      return `I sense ${trustModifier} a quieter, more introspective emotional tone. This ${energySignature} energy can be a space for deep wisdom.`;
    } else {
      return `I notice ${trustModifier} a complex emotional landscape with ${energySignature} undertones. There seems to be a rich inner dialogue happening.`;
    }
  }

  private getNeutralEmotion(): EmotionAnalysisResult {
    return {
      valence: 0,
      arousal: 0.3,
      dominance: 0.5,
      energySignature: 'mist',
      confidence: 0.1,
      keywords: [],
      resonancePattern: 'subtle'
    };
  }

  private determinePrimaryEmotion(valence: number, arousal: number, dominance: number) {
    // Map VAD space to basic emotions with colors
    if (valence > 0.5 && arousal > 0.5) {
      return { emotion: 'Joy', intensity: (valence + arousal) / 2, color: '#FFD700' };
    } else if (valence < -0.5 && arousal > 0.5 && dominance > 0.5) {
      return { emotion: 'Anger', intensity: Math.abs(valence) + arousal / 2, color: '#FF4444' };
    } else if (valence < -0.5 && arousal > 0.5 && dominance < 0.5) {
      return { emotion: 'Fear', intensity: Math.abs(valence) + arousal / 2, color: '#9966CC' };
    } else if (valence < -0.5 && arousal < 0.5) {
      return { emotion: 'Sadness', intensity: Math.abs(valence), color: '#4169E1' };
    } else if (valence > 0.3 && arousal < 0.3) {
      return { emotion: 'Peace', intensity: valence, color: '#40E0D0' };
    } else {
      return { emotion: 'Reflection', intensity: 0.5, color: '#708090' };
    }
  }

  private determineResonancePattern(emotions: EmotionVector[]): 'stable' | 'fluctuating' | 'intense' | 'subtle' {
    if (emotions.length < 2) return 'subtle';
    
    const arousalVariance = this.calculateVariance(emotions.map(e => e.arousal));
    const valenceVariance = this.calculateVariance(emotions.map(e => e.valence));
    
    const avgArousal = emotions.reduce((sum, e) => sum + e.arousal, 0) / emotions.length;
    
    if (arousalVariance > 0.3 || valenceVariance > 0.4) return 'fluctuating';
    if (avgArousal > 0.7) return 'intense';
    if (avgArousal < 0.3) return 'subtle';
    return 'stable';
  }

  private calculateVariance(values: number[]): number {
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    return variance;
  }
}

export const emotionAnalysisService = new EmotionAnalysisService();