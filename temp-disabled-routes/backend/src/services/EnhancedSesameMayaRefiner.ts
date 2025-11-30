// Enhanced Sesame Maya Refiner with CSM Context Support
// Integrates conversational context, emotional resonance, and elemental voice modulation

import { SesameMayaRefiner, Element, RefinerOptions } from './SesameMayaRefiner';
import { EmotionalState } from '../types';

export interface Segment {
  speaker: number;
  text: string;
  audio?: Float32Array | Buffer;
}

export interface ConversationContext {
  segments: Segment[];
  emotional_state: EmotionalState;
  elemental_alignment: Element;
  relationship_depth: number;
  breakthrough_markers: string[];
  threadId: string;
  userId: string;
}

export interface CSMVoiceParams {
  temperature: number;
  topk: number;
  speed: number;
  modulation: string;
  warmth?: number;
  stability?: number;
}

export interface AudioChunk {
  audio: Buffer;
  phraseIndex: number;
  isComplete: boolean;
}

// Maya's CSM voice profile
const MAYA_CSM_PROFILE = {
  voice_id: "maya_oracle_v1",
  speaker_id: 15, // Reserved for Maya in 10-20 range
  characteristics: {
    pitch: 1.15,    // Slightly higher for ethereal quality
    rate: 0.85,     // Slower for mystical effect
    stability: 0.6, // Balance between consistency and variation
    warmth: 0.8     // Maternal, caring tone
  }
};

// Elemental voice parameter mapping for CSM
const ELEMENTAL_VOICE_PARAMS: Record<Element, CSMVoiceParams> = {
  air: {
    temperature: 0.7,   // More variation for intellectual exploration
    topk: 40,          // Wider selection for creativity
    speed: 1.0,        // Clear, articulate
    modulation: "bright"
  },
  fire: {
    temperature: 0.8,   // Higher energy, more dynamic
    topk: 35,          // Focused but energetic
    speed: 1.1,        // Slightly faster for passion
    modulation: "intense"
  },
  water: {
    temperature: 0.5,   // Stable, soothing
    topk: 25,          // Consistent flow
    speed: 0.9,        // Gentle pacing
    modulation: "flowing"
  },
  earth: {
    temperature: 0.4,   // Very stable, grounded
    topk: 20,          // Predictable, reliable
    speed: 0.85,       // Deliberate, measured
    modulation: "grounded"
  },
  aether: {
    temperature: 0.65,  // Balanced mystical quality
    topk: 30,          // Oracle-like wisdom
    speed: 0.9,        // Spacious delivery
    modulation: "ethereal"
  }
};

export class EnhancedSesameMayaRefiner extends SesameMayaRefiner {
  private conversationMemory: Map<string, Segment[]> = new Map();
  private emotionalHistory: Map<string, EmotionalState[]> = new Map();

  constructor(opts: RefinerOptions) {
    super(opts);
  }

  /** Generate speech with full conversational context */
  async generateWithContext(
    text: string,
    context: ConversationContext
  ): Promise<{ refinedText: string; voiceParams: CSMVoiceParams; contextSegments: Segment[] }> {
    // Apply text refinements
    const refinedText = this.refineText(text);
    
    // Get voice parameters based on element and emotion
    const voiceParams = this.getVoiceParams(context);
    
    // Build context segments for CSM
    const contextSegments = this.buildContextSegments(context);
    
    // Update conversation memory
    this.updateMemory(context.threadId, refinedText);
    
    return {
      refinedText,
      voiceParams,
      contextSegments
    };
  }

  /** Stream generation for real-time response */
  async *streamWithContext(
    text: string,
    context: ConversationContext
  ): AsyncGenerator<{ chunk: string; voiceParams: CSMVoiceParams }> {
    // Split into natural phrases for streaming
    const phrases = this.splitIntoPhrases(text);
    
    for (const phrase of phrases) {
      // Apply refinements to each phrase
      let refinedPhrase = phrase;
      if (this.opts.cringeFilter) {
        refinedPhrase = this.applyCringeFilter(refinedPhrase);
      }
      refinedPhrase = this.applyElementalTone(refinedPhrase);
      if (this.opts.styleTightening) refinedPhrase = this.tightenStyle(refinedPhrase);
      if (this.opts.safetySoften) refinedPhrase = this.softenEdges(refinedPhrase);
      if (this.opts.tts.breathMarks) refinedPhrase = this.addBreaths(refinedPhrase);
      
      // Get voice params for this phrase
      const voiceParams = this.getVoiceParams(context);
      
      yield {
        chunk: refinedPhrase,
        voiceParams
      };
    }
  }

  /** Get voice parameters based on context */
  private getVoiceParams(context: ConversationContext): CSMVoiceParams {
    // Start with elemental base
    const baseParams = { ...ELEMENTAL_VOICE_PARAMS[context.elemental_alignment] };
    
    // Apply emotional modulation
    const emotionalParams = this.getEmotionalVoiceParams(context.emotional_state);
    
    // Merge parameters
    return {
      ...baseParams,
      temperature: this.blendParam(baseParams.temperature, emotionalParams.temperature, 0.3),
      warmth: emotionalParams.warmth,
      stability: emotionalParams.stability,
      speed: this.blendParam(baseParams.speed, emotionalParams.speed, 0.4)
    };
  }

  /** Map emotional states to voice modulation */
  private getEmotionalVoiceParams(emotion: EmotionalState): Partial<CSMVoiceParams> {
    const { valence = 0.5, arousal = 0.5, dominance = 0.5 } = emotion;
    
    return {
      // High arousal = more variation
      temperature: 0.5 + (arousal * 0.3),
      
      // Positive valence = warmer tone
      warmth: 0.6 + (valence * 0.3),
      
      // High dominance = more confident delivery
      stability: 0.5 + (dominance * 0.2),
      
      // Emotional intensity affects pacing
      speed: arousal > 0.7 ? 1.05 : (arousal < 0.3 ? 0.85 : 0.95)
    };
  }

  /** Build context segments for CSM */
  private buildContextSegments(context: ConversationContext): Segment[] {
    // Get recent conversation history
    const history = this.conversationMemory.get(context.threadId) || [];
    
    // Combine with provided segments
    const allSegments = [...context.segments, ...history];
    
    // Keep most recent and relevant segments (max 5)
    const relevantSegments = this.selectRelevantSegments(allSegments, context);
    
    // Ensure Maya's speaker ID
    return relevantSegments.map(seg => ({
      ...seg,
      speaker: seg.speaker || MAYA_CSM_PROFILE.speaker_id
    }));
  }

  /** Select most relevant context segments */
  private selectRelevantSegments(
    segments: Segment[], 
    context: ConversationContext
  ): Segment[] {
    // Priority: breakthrough moments > emotional peaks > recent turns
    const prioritized = segments.sort((a, b) => {
      // Check for breakthrough markers
      const aBreakthrough = context.breakthrough_markers.some(marker => 
        a.text.toLowerCase().includes(marker.toLowerCase())
      );
      const bBreakthrough = context.breakthrough_markers.some(marker => 
        b.text.toLowerCase().includes(marker.toLowerCase())
      );
      
      if (aBreakthrough && !bBreakthrough) return -1;
      if (!aBreakthrough && bBreakthrough) return 1;
      
      // Otherwise, prefer recent segments
      return 0;
    });
    
    // Return top 5 segments
    return prioritized.slice(-5);
  }

  /** Update conversation memory */
  private updateMemory(threadId: string, text: string): void {
    const history = this.conversationMemory.get(threadId) || [];
    
    // Create new segment
    const segment: Segment = {
      speaker: MAYA_CSM_PROFILE.speaker_id,
      text: text
      // Audio will be added after generation
    };
    
    // Add to history
    history.push(segment);
    
    // Keep last 10 turns
    if (history.length > 10) {
      history.shift();
    }
    
    this.conversationMemory.set(threadId, history);
    
    // Clean up old threads (1 hour TTL)
    this.cleanupOldThreads();
  }

  /** Split text into natural phrases for streaming */
  private splitIntoPhrases(text: string): string[] {
    // Split on sentence boundaries
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Further split long sentences on natural breaks
    const phrases: string[] = [];
    for (const sentence of sentences) {
      if (sentence.length > 100) {
        // Split on commas, semicolons, or conjunctions
        const parts = sentence.split(/(?:[,;]|\s+(?:and|but|or|yet|so)\s+)/);
        phrases.push(...parts.filter(p => p.trim()));
      } else {
        phrases.push(sentence);
      }
    }
    
    return phrases;
  }

  /** Blend two parameter values */
  private blendParam(base: number, modifier: number, weight: number): number {
    return base * (1 - weight) + modifier * weight;
  }

  /** Clean up old conversation threads */
  private cleanupOldThreads(): void {
    const oneHourAgo = Date.now() - 3600000;
    
    // This is simplified - in production, you'd track last access time
    if (this.conversationMemory.size > 100) {
      // Remove oldest entries
      const entries = Array.from(this.conversationMemory.entries());
      const toRemove = entries.slice(0, entries.length - 100);
      toRemove.forEach(([threadId]) => {
        this.conversationMemory.delete(threadId);
        this.emotionalHistory.delete(threadId);
      });
    }
  }

  /** Apply cringe filter (stub - implement based on your needs) */
  private applyCringeFilter(text: string): string {
    // This would integrate with your cringeFilterService
    return text;
  }

  /** Get conversation insights for debugging/monitoring */
  getConversationInsights(threadId: string): {
    turnCount: number;
    emotionalArc: string;
    dominantElement: Element;
    breakthroughCount: number;
  } {
    const history = this.conversationMemory.get(threadId) || [];
    const emotions = this.emotionalHistory.get(threadId) || [];
    
    return {
      turnCount: history.length,
      emotionalArc: this.detectEmotionalArc(emotions),
      dominantElement: this.opts.element,
      breakthroughCount: 0 // Would track actual breakthroughs
    };
  }

  /** Detect emotional arc pattern */
  private detectEmotionalArc(emotions: EmotionalState[]): string {
    if (emotions.length < 2) return 'stable';
    
    const trend = emotions.reduce((acc, emotion, i) => {
      if (i === 0) return acc;
      const prev = emotions[i - 1];
      const valenceDiff = (emotion.valence || 0.5) - (prev.valence || 0.5);
      return acc + valenceDiff;
    }, 0);
    
    if (trend > 0.3) return 'ascending';
    if (trend < -0.3) return 'descending';
    return 'stable';
  }
}

// Export convenience function for creating enhanced refiner
export function createEnhancedMayaRefiner(element: Element, userId?: string): EnhancedSesameMayaRefiner {
  return new EnhancedSesameMayaRefiner({
    element,
    userId,
    tts: {
      breathMarks: true,
      phraseMinChars: 36,
      phraseMaxChars: 120
    },
    safetySoften: true,
    styleTightening: true,
    addClosers: true,
    cringeFilter: true,
    userStyle: 'spiritual'
  });
}