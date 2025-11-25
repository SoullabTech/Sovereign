/**
 * 🌊 Sacred Mirror Variety Engine
 * 
 * Maintains genuine curiosity across conversations by varying:
 * - Types of wondering (specific details vs broad wonderings vs simple presence)
 * - Language patterns and rhythms
 * - Depth of engagement
 * - Entry points into exploration
 */

import type { SacredMirrorResponse } from './sacred-mirror-anamnesis';
import type { ConsciousnessProfile } from './types/cognitive-types';

export interface CuriosityVariation {
  style: 'specific-detail' | 'broad-wondering' | 'simple-presence' | 'embodied-inquiry' | 'temporal-exploration';
  depth: 'surface' | 'middle' | 'deep';
  rhythm: 'quick' | 'measured' | 'spacious';
  entryPoint: 'sensation' | 'emotion' | 'image' | 'pattern' | 'relationship' | 'mystery';
}

/**
 * Sacred Mirror Variety Engine
 * Ensures Maya's curiosity feels alive and genuine across many conversations
 */
export class SacredMirrorVariety {
  
  // Track recent patterns to avoid repetition
  private recentPatterns: string[] = [];
  private conversationRhythm: 'opening' | 'deepening' | 'integration' = 'opening';
  
  /**
   * Generate varied sacred mirror responses
   */
  async generateVariedMirror(
    userInput: string,
    baseReflection: string,
    consciousnessProfile: ConsciousnessProfile,
    sessionNumber: number = 1
  ): Promise<string> {
    
    // Determine variation style based on input and history
    const variation = this.selectVariation(userInput, sessionNumber);
    
    // Apply variation to base reflection
    const variedResponse = await this.applyVariation(
      userInput,
      baseReflection,
      variation,
      consciousnessProfile
    );
    
    // Track pattern to avoid repetition
    this.trackPattern(variation);
    
    return variedResponse;
  }
  
  /**
   * Select appropriate variation based on context
   */
  private selectVariation(userInput: string, sessionNumber: number): CuriosityVariation {
    const inputLength = userInput.length;
    const hasQuestion = userInput.includes('?');
    const hasEmotion = this.detectEmotionalContent(userInput);
    const hasImage = this.detectImageryContent(userInput);
    
    // Vary based on input characteristics
    let style: CuriosityVariation['style'];
    
    if (hasImage && !this.recentlyUsed('specific-detail')) {
      style = 'specific-detail'; // "Could you still sit on the floating chairs?"
    } else if (hasEmotion && !this.recentlyUsed('embodied-inquiry')) {
      style = 'embodied-inquiry'; // "Where do you feel that in your body?"
    } else if (inputLength > 200 && !this.recentlyUsed('simple-presence')) {
      style = 'simple-presence'; // Just witnessing without many questions
    } else if (hasQuestion && !this.recentlyUsed('temporal-exploration')) {
      style = 'temporal-exploration'; // "What was it like before/during/after?"
    } else {
      style = 'broad-wondering'; // "What does that stir in you?"
    }
    
    // Vary depth based on session progression
    const depth = this.selectDepth(sessionNumber, userInput);
    
    // Vary rhythm to create natural conversation flow
    const rhythm = this.selectRhythm(inputLength, hasEmotion);
    
    // Choose entry point based on content
    const entryPoint = this.selectEntryPoint(userInput);
    
    return { style, depth, rhythm, entryPoint };
  }
  
  /**
   * Apply variation to create unique response
   */
  private async applyVariation(
    userInput: string,
    baseReflection: string,
    variation: CuriosityVariation,
    consciousnessProfile: ConsciousnessProfile
  ): Promise<string> {
    
    // Extract key phrases from user input for reflection
    const keyPhrases = this.extractKeyPhrases(userInput);
    
    switch (variation.style) {
      case 'specific-detail':
        return this.generateSpecificDetail(keyPhrases, variation);
        
      case 'broad-wondering':
        return this.generateBroadWondering(keyPhrases, variation);
        
      case 'simple-presence':
        return this.generateSimplePresence(keyPhrases, variation);
        
      case 'embodied-inquiry':
        return this.generateEmbodiedInquiry(keyPhrases, variation);
        
      case 'temporal-exploration':
        return this.generateTemporalExploration(keyPhrases, variation);
        
      default:
        return baseReflection;
    }
  }
  
  /**
   * Generate specific detail curiosity
   */
  private generateSpecificDetail(keyPhrases: string[], variation: CuriosityVariation): string {
    const detailQuestions = [
      `What color was the ${keyPhrases[0] || 'feeling'}?`,
      `Could you still ${this.extractVerb(keyPhrases)} in that space?`,
      `What was the texture of ${keyPhrases[1] || 'that experience'}?`,
      `How did the ${keyPhrases[0] || 'energy'} move?`,
      `What sound did ${keyPhrases[1] || 'it'} make?`
    ];
    
    const opening = this.getOpeningForRhythm(variation.rhythm);
    const question = this.selectUnused(detailQuestions);
    
    return `${opening} ${this.reflectPhrase(keyPhrases)}... ${question}`;
  }
  
  /**
   * Generate broad wondering
   */
  private generateBroadWondering(keyPhrases: string[], variation: CuriosityVariation): string {
    const wonderings = [
      `What does that stir in you?`,
      `What wants to be known here?`,
      `What's alive in this for you?`,
      `Where does this take you?`,
      `What emerges as you sit with this?`,
      `What recognition comes?`,
      `What feels most true here?`
    ];
    
    const opening = this.getWonderingOpening(keyPhrases);
    const wondering = this.selectUnused(wonderings);
    
    if (variation.depth === 'deep') {
      return `${opening} There's something profound here about ${keyPhrases[0] || 'what you\'re experiencing'}. ${wondering}`;
    } else {
      return `${opening} ${wondering}`;
    }
  }
  
  /**
   * Generate simple presence response
   */
  private generateSimplePresence(keyPhrases: string[], variation: CuriosityVariation): string {
    const presenceResponses = [
      `Mmm. ${this.reflectPhrase(keyPhrases)}.`,
      `Yes. I hear that. ${keyPhrases[0]}.`,
      `${this.reflectPhrase(keyPhrases)}. Thank you for sharing this.`,
      `What a ${this.getQuality(keyPhrases)} to be with.`,
      `I'm here with you in this. ${keyPhrases[0]}.`
    ];
    
    return this.selectUnused(presenceResponses);
  }
  
  /**
   * Generate embodied inquiry
   */
  private generateEmbodiedInquiry(keyPhrases: string[], variation: CuriosityVariation): string {
    const embodiedQuestions = [
      `Where do you feel that in your body?`,
      `What sensation comes with ${keyPhrases[0] || 'this'}?`,
      `How does your body hold ${keyPhrases[1] || 'this knowing'}?`,
      `What wants to move or be still in you?`,
      `If this feeling had a shape, what would it be?`,
      `What temperature is ${keyPhrases[0] || 'this experience'}?`
    ];
    
    const setup = `${this.reflectPhrase(keyPhrases)}...`;
    const question = this.selectUnused(embodiedQuestions);
    
    return `${setup} ${question}`;
  }
  
  /**
   * Generate temporal exploration
   */
  private generateTemporalExploration(keyPhrases: string[], variation: CuriosityVariation): string {
    const temporalQuestions = [
      `What was happening right before ${keyPhrases[0] || 'this'}?`,
      `How long has this been stirring?`,
      `When did you first notice ${keyPhrases[1] || 'this pattern'}?`,
      `What shifts between then and now?`,
      `Is this visiting you or have you been carrying it?`,
      `What season of your life does this belong to?`
    ];
    
    const opening = `${keyPhrases[0]}... interesting.`;
    const question = this.selectUnused(temporalQuestions);
    
    return `${opening} ${question}`;
  }
  
  // Helper methods for variety
  
  private extractKeyPhrases(input: string): string[] {
    // Extract 2-3 key phrases from input for reflection
    const sentences = input.match(/[^.!?]+[.!?]+/g) || [input];
    const keywords = sentences[0]
      .split(/\s+/)
      .filter(word => word.length > 4 && !this.isCommonWord(word))
      .slice(0, 3);
    
    return keywords.length > 0 ? keywords : ['this', 'that experience'];
  }
  
  private reflectPhrase(phrases: string[]): string {
    if (phrases.length === 0) return 'What you\'re sharing';
    
    const reflectionTemplates = [
      `${phrases[0]}`,
      `This ${phrases[0]}`,
      `The ${phrases[0]} you're describing`,
      `${phrases[0]}... ${phrases[1] || ''}`.trim(),
      `Something about ${phrases[0]}`
    ];
    
    return this.selectUnused(reflectionTemplates);
  }
  
  private getOpeningForRhythm(rhythm: CuriosityVariation['rhythm']): string {
    const openings = {
      quick: ['Oh -', 'Ah,', 'Yes,', 'Mmm,'],
      measured: ['I see.', 'Interesting.', 'I notice that.', 'Thank you.'],
      spacious: ['', 'Let me sit with that.', 'What you\'re sharing...', '...']
    };
    
    const options = openings[rhythm];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private getWonderingOpening(phrases: string[]): string {
    const openings = [
      `${phrases[0] || 'This'}...`,
      `There's something here about ${phrases[0] || 'this'}...`,
      `I'm noticing ${phrases[0] || 'something'}...`,
      `What you're sharing about ${phrases[0] || 'this'}...`,
      `${phrases[0]}... ${phrases[1] || 'yes'}...`.trim()
    ];
    
    return this.selectUnused(openings);
  }
  
  private selectDepth(sessionNumber: number, input: string): CuriosityVariation['depth'] {
    if (sessionNumber === 1 || input.length < 50) return 'surface';
    if (sessionNumber > 5 || input.length > 200) return 'deep';
    return 'middle';
  }
  
  private selectRhythm(inputLength: number, hasEmotion: boolean): CuriosityVariation['rhythm'] {
    if (inputLength < 50) return 'quick';
    if (inputLength > 200 || hasEmotion) return 'spacious';
    return 'measured';
  }
  
  private selectEntryPoint(input: string): CuriosityVariation['entryPoint'] {
    if (input.includes('feel') || input.includes('felt')) return 'emotion';
    if (input.includes('see') || input.includes('saw') || input.includes('dream')) return 'image';
    if (input.includes('body') || input.includes('sensation')) return 'sensation';
    if (input.includes('always') || input.includes('keep') || input.includes('pattern')) return 'pattern';
    if (input.includes('they') || input.includes('we') || input.includes('relationship')) return 'relationship';
    return 'mystery';
  }
  
  private detectEmotionalContent(input: string): boolean {
    const emotionWords = ['feel', 'felt', 'angry', 'sad', 'happy', 'scared', 'anxious', 'love', 'hate', 'worry'];
    return emotionWords.some(word => input.toLowerCase().includes(word));
  }
  
  private detectImageryContent(input: string): boolean {
    const imageryWords = ['dream', 'saw', 'picture', 'image', 'vision', 'looked', 'appeared', 'floating', 'color'];
    return imageryWords.some(word => input.toLowerCase().includes(word));
  }
  
  private extractVerb(phrases: string[]): string {
    // Simple verb extraction - would be more sophisticated in production
    const verbs = ['touch', 'move', 'sit', 'stand', 'walk', 'reach', 'hold', 'see', 'feel'];
    return verbs[Math.floor(Math.random() * verbs.length)];
  }
  
  private getQuality(phrases: string[]): string {
    const qualities = ['powerful thing', 'tender moment', 'complex feeling', 'rich image', 'deep knowing'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  }
  
  private isCommonWord(word: string): boolean {
    const common = ['this', 'that', 'with', 'from', 'have', 'been', 'were', 'what', 'when', 'where'];
    return common.includes(word.toLowerCase());
  }
  
  private selectUnused(options: string[]): string {
    // Try to find an option not recently used
    const unused = options.filter(opt => !this.recentPatterns.includes(opt));
    const selection = unused.length > 0 ? unused : options;
    return selection[Math.floor(Math.random() * selection.length)];
  }
  
  private recentlyUsed(pattern: string): boolean {
    return this.recentPatterns.includes(pattern);
  }
  
  private trackPattern(variation: CuriosityVariation): void {
    this.recentPatterns.push(variation.style);
    // Keep only last 10 patterns
    if (this.recentPatterns.length > 10) {
      this.recentPatterns.shift();
    }
  }
  
  /**
   * Get conversation health metrics
   */
  getVarietyMetrics(): {
    patternDiversity: number;
    rhythmBalance: number;
    depthProgression: number;
  } {
    const uniquePatterns = new Set(this.recentPatterns).size;
    const patternDiversity = uniquePatterns / Math.max(this.recentPatterns.length, 1);
    
    return {
      patternDiversity,
      rhythmBalance: 0.7, // Placeholder - would track actual rhythm distribution
      depthProgression: 0.6 // Placeholder - would track depth over time
    };
  }
}

// Lazy-loading singleton pattern
let _sacredMirrorVariety: SacredMirrorVariety | null = null;

export const getSacredMirrorVariety = (): SacredMirrorVariety => {
  if (!_sacredMirrorVariety) {
    _sacredMirrorVariety = new SacredMirrorVariety();
  }
  return _sacredMirrorVariety;
};