import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';// Temporarily stub out backend imports that are excluded from build
// import { logger } from "../../../../backend/src/utils/logger";

// Stub logger
const logger = {
  info: (message: string, data?: any) => console.log(message, data),
  error: (message: string, error?: any) => console.error(message, error)
};

// Emotional Resonance Analysis Service
class EmotionAnalysisService {
  // Analyze text for emotional dimensions (Valence, Arousal, Dominance)
  async analyzeText(text: string): Promise<{
    valence: number;      // -1 (negative) to +1 (positive)
    arousal: number;      // 0 (calm) to 1 (excited/activated) 
    dominance: number;    // 0 (submissive) to 1 (dominant/in-control)
    emotions: { emotion: string; intensity: number; color: string }[];
    energySignature: string;
  }> {
    if (!text || text.trim().length < 5) {
      return {
        valence: 0,
        arousal: 0.3,
        dominance: 0.5,
        emotions: [],
        energySignature: 'neutral'
      };
    }

    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/);
    
    // Emotional lexicon analysis
    const emotionScores = this.calculateEmotionScores(textLower, words);
    
    // VAD dimensions
    const valence = this.calculateValence(emotionScores, textLower);
    const arousal = this.calculateArousal(emotionScores, textLower);
    const dominance = this.calculateDominance(emotionScores, textLower);
    
    // Primary emotions with intensities
    const emotions = this.identifyEmotions(emotionScores, valence, arousal, dominance);
    
    // Energy signature classification
    const energySignature = this.classifyEnergySignature(valence, arousal, dominance);

    return {
      valence: Math.round(valence * 100) / 100,
      arousal: Math.round(arousal * 100) / 100, 
      dominance: Math.round(dominance * 100) / 100,
      emotions,
      energySignature
    };
  }

  private calculateEmotionScores(textLower: string, words: string[]) {
    const emotionLexicon = {
      joy: { words: ['happy', 'joy', 'excited', 'elated', 'delighted', 'thrilled', 'cheerful', 'bright', 'wonderful', 'amazing', 'love', 'beautiful'], valence: 0.8, arousal: 0.6, dominance: 0.7 },
      sadness: { words: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'grief', 'sorrow', 'heartbroken', 'disappointed', 'lonely'], valence: -0.7, arousal: 0.3, dominance: 0.2 },
      anger: { words: ['angry', 'furious', 'rage', 'mad', 'irritated', 'frustrated', 'pissed', 'annoyed', 'hate', 'disgusted'], valence: -0.6, arousal: 0.9, dominance: 0.8 },
      fear: { words: ['scared', 'afraid', 'terrified', 'anxious', 'nervous', 'worried', 'panic', 'frightened', 'concerned', 'stressed'], valence: -0.5, arousal: 0.8, dominance: 0.1 },
      surprise: { words: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'unexpected', 'wow', 'incredible'], valence: 0.1, arousal: 0.8, dominance: 0.5 },
      trust: { words: ['trust', 'confident', 'secure', 'safe', 'comfortable', 'peaceful', 'calm', 'centered', 'grounded'], valence: 0.6, arousal: 0.2, dominance: 0.7 },
      anticipation: { words: ['excited', 'eager', 'anticipate', 'hope', 'expect', 'looking forward', 'can\'t wait', 'ready'], valence: 0.5, arousal: 0.7, dominance: 0.6 },
      disgust: { words: ['disgusted', 'revolted', 'sick', 'gross', 'awful', 'terrible', 'horrible', 'nasty'], valence: -0.7, arousal: 0.5, dominance: 0.4 }
    };

    const scores: { [key: string]: number } = {};
    
    Object.entries(emotionLexicon).forEach(([emotion, data]) => {
      scores[emotion] = 0;
      data.words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = textLower.match(regex);
        if (matches) {
          scores[emotion] += matches.length;
        }
      });
    });

    return { scores, lexicon: emotionLexicon };
  }

  private calculateValence(emotionData: any, text: string): number {
    const { scores, lexicon } = emotionData;
    let totalValence = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([emotion, count]) => {
      const countNum = count as number;
      if (countNum > 0) {
        totalValence += lexicon[emotion].valence * countNum;
        totalWeight += countNum;
      }
    });

    // Base valence from emotional words
    let valence = totalWeight > 0 ? totalValence / totalWeight : 0;

    // Intensity modifiers
    const intensifiers = text.match(/\b(very|extremely|incredibly|absolutely|totally|completely|really|so|quite)\b/g);
    if (intensifiers) {
      valence = valence * (1 + intensifiers.length * 0.1);
    }

    // Negation handling
    const negations = text.match(/\b(not|don&apos;t|can&apos;t|won&apos;t|never|no|nothing|nobody)\b/g);
    if (negations && negations.length > 0) {
      valence = valence * (1 - negations.length * 0.3);
    }

    return Math.max(-1, Math.min(1, valence));
  }

  private calculateArousal(emotionData: any, text: string): number {
    const { scores, lexicon } = emotionData;
    let totalArousal = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([emotion, count]) => {
      const countNum = count as number;
      if (countNum > 0) {
        totalArousal += lexicon[emotion].arousal * countNum;
        totalWeight += countNum;
      }
    });

    let arousal = totalWeight > 0 ? totalArousal / totalWeight : 0.3;

    // Exclamation marks increase arousal
    const exclamations = text.match(/!/g);
    if (exclamations) {
      arousal += exclamations.length * 0.1;
    }

    // Question marks indicate uncertainty (moderate arousal)
    const questions = text.match(/\?/g);
    if (questions) {
      arousal += questions.length * 0.05;
    }

    // Capital letters indicate emphasis
    const capitals = text.match(/[A-Z]{2,}/g);
    if (capitals) {
      arousal += capitals.length * 0.15;
    }

    return Math.max(0, Math.min(1, arousal));
  }

  private calculateDominance(emotionData: any, text: string): number {
    const { scores, lexicon } = emotionData;
    let totalDominance = 0;
    let totalWeight = 0;

    Object.entries(scores).forEach(([emotion, count]) => {
      const countNum = count as number;
      if (countNum > 0) {
        totalDominance += lexicon[emotion].dominance * countNum;
        totalWeight += countNum;
      }
    });

    let dominance = totalWeight > 0 ? totalDominance / totalWeight : 0.5;

    // Action words increase dominance
    const actionWords = text.match(/\b(will|can|must|should|going to|plan|decide|choose|control|manage|lead)\b/g);
    if (actionWords) {
      dominance += actionWords.length * 0.05;
    }

    // Uncertainty decreases dominance
    const uncertainWords = text.match(/\b(maybe|perhaps|might|possibly|uncertain|confused|lost)\b/g);
    if (uncertainWords) {
      dominance -= uncertainWords.length * 0.1;
    }

    return Math.max(0, Math.min(1, dominance));
  }

  private identifyEmotions(emotionData: any, valence: number, arousal: number, dominance: number) {
    const { scores } = emotionData;
    const emotions: { emotion: string; intensity: number; color: string }[] = [];
    
    // Color mapping for emotions
    const emotionColors = {
      joy: '#FFD700',      // Gold
      sadness: '#4682B4',   // Steel Blue  
      anger: '#DC143C',     // Crimson
      fear: '#9370DB',      // Medium Purple
      surprise: '#FFA500',  // Orange
      trust: '#32CD32',     // Lime Green
      anticipation: '#FF69B4', // Hot Pink
      disgust: '#8B4513'    // Saddle Brown
    };

    // Convert scores to emotions with intensities
    Object.entries(scores).forEach(([emotion, count]) => {
      const countNum = count as number;
      if (countNum > 0) {
        emotions.push({
          emotion,
          intensity: Math.min(1, countNum * 0.2),
          color: emotionColors[emotion as keyof typeof emotionColors] || '#888888'
        });
      }
    });

    // Sort by intensity and return top 3
    return emotions
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 3);
  }

  private classifyEnergySignature(valence: number, arousal: number, dominance: number): string {
    // Classify based on VAD space
    if (valence > 0.3 && arousal > 0.6 && dominance > 0.6) return 'radiant';
    if (valence > 0.3 && arousal < 0.4 && dominance > 0.5) return 'grounded';
    if (valence < -0.3 && arousal > 0.6 && dominance > 0.6) return 'intense';
    if (valence < -0.3 && arousal < 0.4 && dominance < 0.5) return 'withdrawn';
    if (arousal > 0.7) return 'activated';
    if (arousal < 0.3) return 'calm';
    if (valence > 0.5) return 'positive';
    if (valence < -0.5) return 'heavy';
    
    return 'balanced';
  }

  // Analyze voice characteristics for emotional patterns
  async analyzeVoice(audioMetadata: {
    duration: number;
    amplitude?: number[];
    pitch?: number[];
    tempo?: number;
  }): Promise<{
    emotionalTone: string;
    energyLevel: number;
    stability: number;
    resonance: string;
  }> {
    const { duration, amplitude = [], pitch = [], tempo = 1 } = audioMetadata;
    
    // Calculate energy level from amplitude variance
    const avgAmplitude = amplitude.length > 0 
      ? amplitude.reduce((a, b) => a + b, 0) / amplitude.length 
      : 0.5;
    
    // Calculate stability from pitch variance  
    const pitchVariance = pitch.length > 1
      ? Math.sqrt(pitch.reduce((sum, p) => sum + Math.pow(p - pitch[0], 2), 0) / pitch.length)
      : 0;
    
    const stability = Math.max(0, Math.min(1, 1 - (pitchVariance / 100)));
    const energyLevel = Math.max(0, Math.min(1, avgAmplitude * tempo));
    
    // Classify emotional tone
    let emotionalTone = 'neutral';
    if (energyLevel > 0.7 && stability > 0.6) emotionalTone = 'confident';
    else if (energyLevel > 0.7 && stability < 0.4) emotionalTone = 'excited';
    else if (energyLevel < 0.3 && stability > 0.6) emotionalTone = 'calm';
    else if (energyLevel < 0.3 && stability < 0.4) emotionalTone = 'uncertain';
    else if (stability < 0.3) emotionalTone = 'emotional';
    
    // Classify resonance
    const resonance = avgAmplitude > 0.6 ? 'strong' : avgAmplitude > 0.3 ? 'moderate' : 'gentle';
    
    return {
      emotionalTone,
      energyLevel: Math.round(energyLevel * 100) / 100,
      stability: Math.round(stability * 100) / 100,
      resonance
    };
  }
}

const emotionService = new EmotionAnalysisService();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, userId } = body;
    
    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required" 
      }, { status: 400 });
    }

    let textAnalysis = null;
    let voiceAnalysis = null;
    
    // Analyze text if provided
    if (text && typeof text === 'string') {
      textAnalysis = await emotionService.analyzeText(text);
    }
    
    // Analyze voice metadata if provided
    if (voice && typeof voice === 'object') {
      voiceAnalysis = await emotionService.analyzeVoice(voice);
    }

    logger.info("Emotional analysis completed", {
      userId: userId.substring(0, 8) + '...',
      hasText: !!textAnalysis,
      hasVoice: !!voiceAnalysis,
      energySignature: textAnalysis?.energySignature,
      voiceTone: voiceAnalysis?.emotionalTone
    });

    return NextResponse.json({
      success: true,
      text: textAnalysis,
      voice: voiceAnalysis,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    logger.error("Emotional analysis error:", err);
    return NextResponse.json({ 
      error: err.message 
    }, { status: 500 });
  }
}