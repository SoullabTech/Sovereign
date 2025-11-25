// Natural Timing and Rhythm System for Sesame-level Conversations
// Adds strategic pauses, emphasis, interruption handling, and conversation flow

export interface TimingCues {
  pauses: PauseInstruction[];
  emphasis: EmphasisInstruction[];
  rhythm: RhythmPattern;
  interruption_points: number[]; // Character positions where interruption is natural
}

export interface PauseInstruction {
  position: number; // Character position in text
  type: 'breath' | 'thought' | 'transition' | 'emphasis' | 'dramatic';
  duration_ms: number;
  context: string; // Why this pause is needed
}

export interface EmphasisInstruction {
  start: number;
  end: number;
  type: 'stress' | 'tone_shift' | 'volume' | 'pace_change';
  intensity: number; // 0-1
  reason: string;
}

export interface RhythmPattern {
  overall_pace: 'slow' | 'moderate' | 'fast' | 'variable';
  cadence: 'steady' | 'building' | 'flowing' | 'staccato';
  energy_arc: 'flat' | 'rising' | 'falling' | 'wave';
  natural_breaks: number[]; // Character positions for natural sentence breaks
}

export class ConversationalTimingEngine {

  // Analyze text and add timing cues for natural delivery
  generateTimingCues(text: string, context?: {
    emotional_state?: string;
    conversation_energy?: number;
    user_engagement?: number;
    response_intent?: string;
  }): TimingCues {

    const sentences = this.splitIntoSentences(text);
    // Disabled pauses per user request - Maya is expressive enough without them
    const pauses: PauseInstruction[] = []; // this.generatePauses(text, sentences, context);
    const emphasis = this.generateEmphasis(text, context);
    const rhythm = this.generateRhythm(text, sentences, context);
    const interruption_points = this.findInterruptionPoints(text);

    return {
      pauses,
      emphasis,
      rhythm,
      interruption_points
    };
  }

  // Convert timing cues to SSML for better voice synthesis
  applyTimingToSSML(text: string, timingCues: TimingCues): string {
    let ssml = text;

    // Apply pauses in reverse order to maintain positions
    const sortedPauses = timingCues.pauses.sort((a, b) => b.position - a.position);

    for (const pause of sortedPauses) {
      const pauseTag = this.createPauseTag(pause);
      ssml = ssml.slice(0, pause.position) + pauseTag + ssml.slice(pause.position);
    }

    // Apply emphasis
    for (const emph of timingCues.emphasis.reverse()) {
      const emphasisTag = this.createEmphasisTag(emph);
      ssml = ssml.slice(0, emph.start) + `<emphasis level="${emphasisTag}">` +
             ssml.slice(emph.start, emph.end) + '</emphasis>' + ssml.slice(emph.end);
    }

    // Wrap in SSML tags
    ssml = `<speak>${ssml}</speak>`;

    return ssml;
  }

  // Add strategic pauses for natural conversation flow
  private generatePauses(text: string, sentences: string[], context?: any): PauseInstruction[] {
    const pauses: PauseInstruction[] = [];
    let position = 0;

    // Emotional state affects pause timing
    const baseMultiplier = context?.emotional_state === 'contemplative' ? 1.5 :
                          context?.emotional_state === 'excited' ? 0.7 : 1.0;

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const nextSentence = sentences[i + 1];

      // Add pauses within sentences
      this.addIntraSentencePauses(sentence, position, pauses, baseMultiplier);

      position += sentence.length;

      // Add pauses between sentences
      if (nextSentence) {
        const pauseType = this.determinePauseType(sentence, nextSentence);
        const duration = this.calculatePauseDuration(pauseType, baseMultiplier);

        pauses.push({
          position,
          type: pauseType,
          duration_ms: duration,
          context: `Transition from "${sentence.slice(-20)}" to "${nextSentence.slice(0, 20)}"`
        });
      }
    }

    return pauses;
  }

  private addIntraSentencePauses(sentence: string, startPos: number, pauses: PauseInstruction[], multiplier: number) {
    // Natural pause points within sentences
    const pausePatterns = [
      { pattern: /,\s+/g, type: 'breath' as const, base_duration: 300 },
      { pattern: /;\s+/g, type: 'thought' as const, base_duration: 400 },
      { pattern: /\.\.\.\s*/g, type: 'dramatic' as const, base_duration: 800 },
      { pattern: /\s+--\s+/g, type: 'transition' as const, base_duration: 500 },
      { pattern: /\?\s+/g, type: 'thought' as const, base_duration: 600 }
    ];

    for (const pattern of pausePatterns) {
      let match;
      while ((match = pattern.pattern.exec(sentence)) !== null) {
        pauses.push({
          position: startPos + match.index + match[0].length,
          type: pattern.type,
          duration_ms: pattern.base_duration * multiplier,
          context: `Natural ${pattern.type} pause after "${sentence.slice(Math.max(0, match.index - 10), match.index + match[0].length)}"`
        });
      }
    }
  }

  private generateEmphasis(text: string, context?: any): EmphasisInstruction[] {
    const emphasis: EmphasisInstruction[] = [];

    // Words that typically need emphasis
    const emphasisPatterns = [
      { pattern: /\b(absolutely|definitely|certainly|exactly|precisely)\b/gi, type: 'stress' as const, intensity: 0.8 },
      { pattern: /\b(never|always|everything|nothing|everyone|no one)\b/gi, type: 'stress' as const, intensity: 0.9 },
      { pattern: /\b(beautiful|amazing|incredible|wonderful|terrible|awful)\b/gi, type: 'tone_shift' as const, intensity: 0.7 },
      { pattern: /\b(wait|hold on|listen|look|see|think about this)\b/gi, type: 'pace_change' as const, intensity: 0.6 },
      { pattern: /\b(you|your|yours)\b/gi, type: 'stress' as const, intensity: 0.4 }, // Gentle emphasis on personal references
    ];

    for (const pattern of emphasisPatterns) {
      let match;
      while ((match = pattern.pattern.exec(text)) !== null) {
        emphasis.push({
          start: match.index,
          end: match.index + match[0].length,
          type: pattern.type,
          intensity: pattern.intensity,
          reason: `${pattern.type} emphasis on "${match[0]}"`
        });
      }
    }

    return emphasis;
  }

  private generateRhythm(text: string, sentences: string[], context?: any): RhythmPattern {
    const averageLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    const hasQuestions = sentences.some(s => s.includes('?'));
    const hasExclamations = sentences.some(s => s.includes('!'));

    // Determine overall pace based on content and context
    let overall_pace: RhythmPattern['overall_pace'] = 'moderate';
    if (context?.emotional_state === 'excited' || hasExclamations) {
      overall_pace = 'fast';
    } else if (context?.emotional_state === 'contemplative' || averageLength > 100) {
      overall_pace = 'slow';
    } else if (sentences.length > 5 && hasQuestions) {
      overall_pace = 'variable';
    }

    // Determine cadence
    let cadence: RhythmPattern['cadence'] = 'steady';
    if (sentences.length > 3) {
      const lengths = sentences.map(s => s.length);
      const variation = this.calculateVariation(lengths);
      if (variation > 50) cadence = 'flowing';
      if (hasQuestions && hasExclamations) cadence = 'staccato';
    }

    // Energy arc based on sentence progression
    let energy_arc: RhythmPattern['energy_arc'] = 'flat';
    if (sentences.length > 2) {
      const firstHalf = sentences.slice(0, Math.floor(sentences.length / 2));
      const secondHalf = sentences.slice(Math.floor(sentences.length / 2));

      const firstHalfEnergy = this.calculateEnergyLevel(firstHalf.join(' '));
      const secondHalfEnergy = this.calculateEnergyLevel(secondHalf.join(' '));

      if (secondHalfEnergy > firstHalfEnergy + 0.2) energy_arc = 'rising';
      else if (firstHalfEnergy > secondHalfEnergy + 0.2) energy_arc = 'falling';
      else if (sentences.length > 4) energy_arc = 'wave';
    }

    return {
      overall_pace,
      cadence,
      energy_arc,
      natural_breaks: this.findNaturalBreaks(text)
    };
  }

  private findInterruptionPoints(text: string): number[] {
    const points: number[] = [];

    // Natural places where someone could interrupt
    const interruptionPatterns = [
      /,\s+/g,           // After commas
      /\.\s+/g,          // Between sentences
      /\?\s+/g,          // After questions
      /\s+and\s+/gi,     // Before "and"
      /\s+but\s+/gi,     // Before "but"
      /\s+so\s+/gi,      // Before "so"
      /\s+because\s+/gi, // Before "because"
    ];

    for (const pattern of interruptionPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        points.push(match.index + match[0].length);
      }
    }

    return points.sort((a, b) => a - b);
  }

  // Helper methods
  private splitIntoSentences(text: string): string[] {
    return text.split(/(?<=[.!?])\s+/).filter(s => s.length > 0);
  }

  private determinePauseType(sentence: string, nextSentence: string): PauseInstruction['type'] {
    if (sentence.endsWith('?')) return 'thought';
    if (sentence.endsWith('!')) return 'emphasis';
    if (nextSentence.toLowerCase().startsWith('but') ||
        nextSentence.toLowerCase().startsWith('however')) return 'transition';
    if (sentence.length > 100 || nextSentence.length > 100) return 'breath';
    return 'breath';
  }

  private calculatePauseDuration(type: PauseInstruction['type'], multiplier: number): number {
    const baseDurations = {
      breath: 400,
      thought: 600,
      transition: 500,
      emphasis: 300,
      dramatic: 1000
    };
    return baseDurations[type] * multiplier;
  }

  private createPauseTag(pause: PauseInstruction): string {
    return `<break time="${pause.duration_ms}ms"/>`;
  }

  private createEmphasisTag(emphasis: EmphasisInstruction): string {
    if (emphasis.intensity > 0.8) return 'strong';
    if (emphasis.intensity > 0.6) return 'moderate';
    return 'reduced';
  }

  private calculateVariation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateEnergyLevel(text: string): number {
    const energyWords = ['exciting', 'amazing', 'incredible', 'fantastic', 'wonderful', '!'];
    const calmWords = ['peaceful', 'calm', 'gentle', 'soft', 'quiet', '...'];

    let energy = 0.5; // baseline
    const lowerText = text.toLowerCase();

    energyWords.forEach(word => {
      if (lowerText.includes(word)) energy += 0.1;
    });

    calmWords.forEach(word => {
      if (lowerText.includes(word)) energy -= 0.1;
    });

    return Math.max(0, Math.min(1, energy));
  }

  private findNaturalBreaks(text: string): number[] {
    const breaks: number[] = [];

    // Find natural breaking points for conversation flow
    const breakPatterns = [
      /\.\s+/g,        // End of sentences
      /\?\s+/g,        // End of questions
      /!\s+/g,         // End of exclamations
      /;\s+/g,         // Semicolons
    ];

    for (const pattern of breakPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        breaks.push(match.index + match[0].length);
      }
    }

    return breaks.sort((a, b) => a - b);
  }
}

// Export singleton instance - Lazy-loading pattern
let _conversationalTiming: ConversationalTimingEngine | null = null;
export const getConversationalTiming = (): ConversationalTimingEngine => {
  if (!_conversationalTiming) {
    _conversationalTiming = new ConversationalTimingEngine();
  }
  return _conversationalTiming;
};