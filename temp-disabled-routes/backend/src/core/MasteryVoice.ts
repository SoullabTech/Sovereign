import { AgentResponse } from "../types/agentResponse";
/**
 * Mastery Voice Module
 * Implements mature simplicity for Stage 4 (Transparent Prism)
 * 
 * The paradox: Higher capacity = simpler voice, not more complex
 * Early simplicity is naïve. Mature simplicity is distilled wisdom.
 */

import { AgentResponse } from './AgentBase.js';
import { PersonalOracleStage, CapacitySignals } from './CapacitySignalsFramework.js';

export interface MasteryVoiceConfig {
  enabled: boolean;
  triggerStage: PersonalOracleStage;
  minCapacityThreshold: {
    trust: number;
    engagementDepth: number; 
    integrationSkill: number;
    confidenceLevel: number;
  };
  
  // Voice characteristics
  voiceProfile: {
    maxSentenceLength: number;    // Words per sentence
    maxResponseLength: number;    // Total words
    pauseFrequency: number;       // 0-1, how often to include pauses
    metaphorSimplicity: number;   // 0-1, prefer everyday imagery
    certaintyLevel: number;       // 0-1, avoid proclamations
    questionEndingFreq: number;   // 0-1, end with questions/openings
  };
  
  // Content transformation rules
  transformationRules: {
    reduceJargon: boolean;
    simplifyMetaphors: boolean;
    addHumor: boolean;
    includeOrdinaryAnchors: boolean;
    preserveMystery: boolean;
    avoidClosure: boolean;
  };
}

export interface MasteryTransformation {
  originalResponse: string;
  transformedResponse: string;
  transformations: string[];
  masteryMarkers: string[];
  simplificationLevel: number; // 0-1
  essencePreserved: boolean;
}

export class MasteryVoice {
  private config: MasteryVoiceConfig;
  
  // Patterns for mature simplicity
  private jargonReplacements: Map<string, string> = new Map([
    // Replace complex terms with plain language
    ['consciousness', 'awareness'],
    ['integration', 'bringing together'],
    ['embodiment', 'feeling it in your body'],
    ['archetypal', 'deep pattern'],
    ['manifestation', 'how it shows up'],
    ['synchronicity', 'meaningful timing'],
    ['individuation', 'becoming yourself'],
    ['transcendence', 'moving beyond'],
    ['phenomenological', 'how it feels'],
    ['liminal', 'threshold'],
    ['emergence', 'what wants to come'],
    ['daimonic', 'that guiding something'],
    ['otherness', 'what\'s not quite you'],
    ['synaptic', 'the gap between']
  ]);
  
  private complexMetaphorSimplifications: Map<string, string> = new Map([
    // Replace elaborate metaphors with everyday imagery
    ['like a phoenix rising from ashes', 'like starting fresh after loss'],
    ['the hero\'s journey', 'the hard path that changes you'],
    ['archetypal energies', 'old patterns that live in everyone'],
    ['the shadow\'s integration', 'making friends with what you hide'],
    ['cosmic consciousness', 'that feeling of being connected to everything'],
    ['the collective unconscious', 'what we all share underneath'],
    ['quantum entanglement', 'how things stay connected across distance'],
    ['the sacred feminine', 'the part that receives and nurtures'],
    ['divine masculine', 'the part that acts and creates']
  ]);
  
  private masteryPhrases: string[] = [
    // Simple expressions of complex truths
    "Let's sit with that.",
    "No need to figure it all out.",
    "That's worth staying curious about.",
    "Sometimes the not-knowing is the answer.",
    "What wants to be simple here?",
    "The body usually knows first.",
    "It's both, and that's okay.",
    "One step. Then the next.",
    "What would feel true right now?",
    "The way through is usually through.",
    "Rest is also doing something.",
    "Questions can be answers too."
  ];
  
  private ordinaryAnchors: string[] = [
    // Ground cosmic insights in daily life
    "how you sleep tonight",
    "the next conversation you have",
    "tomorrow morning's coffee",
    "what you notice walking to the mailbox",
    "how you breathe in traffic",
    "the look on someone's face",
    "what your hands are doing",
    "the weather outside your window",
    "how you say goodbye",
    "what makes you laugh"
  ];

  constructor(config?: Partial<MasteryVoiceConfig>) {
    this.config = {
      enabled: true,
      triggerStage: 'transparent_prism',
      minCapacityThreshold: {
        trust: 0.75,
        engagementDepth: 0.75,
        integrationSkill: 0.7,
        confidenceLevel: 0.7
      },
      voiceProfile: {
        maxSentenceLength: 12,     // Short, clear sentences
        maxResponseLength: 80,     // Concise responses
        pauseFrequency: 0.4,       // Regular pauses for reflection
        metaphorSimplicity: 0.8,   // Everyday imagery
        certaintyLevel: 0.2,       // Avoid absolute statements
        questionEndingFreq: 0.6    // Often end with openings
      },
      transformationRules: {
        reduceJargon: true,
        simplifyMetaphors: true,
        addHumor: true,
        includeOrdinaryAnchors: true,
        preserveMystery: true,
        avoidClosure: true
      },
      ...config
    };
  }

  /**
   * Determine if Mastery Voice should be applied
   */
  shouldApplyMasteryVoice(
    stage: PersonalOracleStage,
    signals: CapacitySignals
  ): boolean {
    
    if (!this.config.enabled) return false;
    if (stage !== this.config.triggerStage) return false;
    
    const threshold = this.config.minCapacityThreshold;
    
    return signals.trust >= threshold.trust &&
           signals.engagementDepth >= threshold.engagementDepth &&
           signals.integrationSkill >= threshold.integrationSkill &&
           signals.confidenceLevel >= threshold.confidenceLevel;
  }

  /**
   * Transform response to Mastery Voice
   */
  transformResponse(
    response: AgentResponse,
    signals: CapacitySignals
  ): MasteryTransformation {
    
    const originalContent = response.content;
    let transformedContent = originalContent;
    const transformations: string[] = [];
    const masteryMarkers: string[] = [];
    
    // Apply transformation rules in order
    if (this.config.transformationRules.reduceJargon) {
      const jargonResult = this.replaceJargon(transformedContent);
      transformedContent = jargonResult.content;
      transformations.push(...jargonResult.replacements);
    }
    
    if (this.config.transformationRules.simplifyMetaphors) {
      const metaphorResult = this.simplifyMetaphors(transformedContent);
      transformedContent = metaphorResult.content;
      transformations.push(...metaphorResult.simplifications);
    }
    
    // Break into short sentences
    transformedContent = this.shortenSentences(
      transformedContent, 
      this.config.voiceProfile.maxSentenceLength
    );
    transformations.push('shortened_sentences');
    
    // Add pauses for reflection
    if (this.config.transformationRules.preserveMystery) {
      transformedContent = this.addReflectivePauses(
        transformedContent,
        this.config.voiceProfile.pauseFrequency
      );
      transformations.push('added_pauses');
    }
    
    // Reduce certainty language
    if (this.config.voiceProfile.certaintyLevel < 0.5) {
      transformedContent = this.softenCertainty(transformedContent);
      transformations.push('softened_certainty');
    }
    
    // Add ordinary anchors
    if (this.config.transformationRules.includeOrdinaryAnchors) {
      const anchorResult = this.addOrdinaryAnchor(transformedContent);
      if (anchorResult.added) {
        transformedContent = anchorResult.content;
        transformations.push('added_ordinary_anchor');
      }
    }
    
    // Add gentle humor if appropriate
    if (this.config.transformationRules.addHumor && this.shouldAddHumor(transformedContent)) {
      const humorResult = this.addGentleHumor(transformedContent);
      if (humorResult.added) {
        transformedContent = humorResult.content;
        transformations.push('added_gentle_humor');
      }
    }
    
    // End with opening instead of closure
    if (this.config.transformationRules.avoidClosure && 
        Math.random() < this.config.voiceProfile.questionEndingFreq) {
      transformedContent = this.addOpenEnding(transformedContent);
      transformations.push('added_open_ending');
    }
    
    // Ensure length doesn't exceed maximum
    if (this.countWords(transformedContent) > this.config.voiceProfile.maxResponseLength) {
      transformedContent = this.condenseToEssence(transformedContent, this.config.voiceProfile.maxResponseLength);
      transformations.push('condensed_to_essence');
    }
    
    // Identify mastery markers in final content
    masteryMarkers.push(...this.identifyMasteryMarkers(transformedContent));
    
    return {
      originalResponse: originalContent,
      transformedResponse: transformedContent,
      transformations,
      masteryMarkers,
      simplificationLevel: this.calculateSimplificationLevel(originalContent, transformedContent),
      essencePreserved: this.essencePreserved(originalContent, transformedContent)
    };
  }

  /**
   * Replace jargon with plain language
   */
  private replaceJargon(content: string): { content: string; replacements: string[] } {
    let transformedContent = content;
    const replacements: string[] = [];
    
    for (const [jargon, plain] of this.jargonReplacements) {
      const regex = new RegExp(`\\b${jargon}\\b`, 'gi');
      if (regex.test(transformedContent)) {
        transformedContent = transformedContent.replace(regex, plain);
        replacements.push(`${jargon} → ${plain}`);
      }
    }
    
    return { content: transformedContent, replacements };
  }

  /**
   * Simplify complex metaphors to everyday imagery
   */
  private simplifyMetaphors(content: string): { content: string; simplifications: string[] } {
    let transformedContent = content;
    const simplifications: string[] = [];
    
    for (const [complex, simple] of this.complexMetaphorSimplifications) {
      if (transformedContent.includes(complex)) {
        transformedContent = transformedContent.replace(complex, simple);
        simplifications.push(`Simplified: ${complex} → ${simple}`);
      }
    }
    
    return { content: transformedContent, simplifications };
  }

  /**
   * Break long sentences into shorter ones
   */
  private shortenSentences(content: string, maxWords: number): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const shortened: string[] = [];
    
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      if (words.length <= maxWords) {
        shortened.push(sentence.trim());
      } else {
        // Break long sentence at natural pause points
        const breakPoints = this.findNaturalBreakPoints(sentence);
        if (breakPoints.length > 0) {
          const parts = this.splitAtBreakPoints(sentence, breakPoints, maxWords);
          shortened.push(...parts);
        } else {
          // If no natural breaks, just split at maxWords
          for (let i = 0; i < words.length; i += maxWords) {
            const part = words.slice(i, i + maxWords).join(' ');
            shortened.push(part);
          }
        }
      }
    }
    
    return shortened.join('. ') + '.';
  }

  /**
   * Add reflective pauses
   */
  private addReflectivePauses(content: string, frequency: number): string {
    const sentences = content.split(/\.\s+/);
    const withPauses: string[] = [];
    
    sentences.forEach((sentence, i) => {
      withPauses.push(sentence);
      
      // Add pause after sentences about deep topics
      if (Math.random() < frequency || this.isDeepTopic(sentence)) {
        const pauseType = Math.random();
        if (pauseType < 0.4) {
          withPauses.push("...");
        } else if (pauseType < 0.8) {
          withPauses.push("Let's sit with that.");
        } else {
          withPauses.push("Mm.");
        }
      }
    });
    
    return withPauses.join(' ');
  }

  /**
   * Soften absolute statements
   */
  private softenCertainty(content: string): string {
    let softened = content;
    
    // Replace absolute statements with gentler versions
    const certaintyPatterns = [
      { pattern: /\bYou must\b/g, replacement: 'You might' },
      { pattern: /\bYou should\b/g, replacement: 'You could' },
      { pattern: /\bYou will\b/g, replacement: 'You may' },
      { pattern: /\bThis is\b/g, replacement: 'This seems to be' },
      { pattern: /\bThe answer is\b/g, replacement: 'One way to see it is' },
      { pattern: /\bAlways\b/g, replacement: 'Often' },
      { pattern: /\bNever\b/g, replacement: 'Rarely' },
      { pattern: /\bEveryone\b/g, replacement: 'Many people' },
      { pattern: /\bClearly\b/g, replacement: 'It seems' },
      { pattern: /\bObviously\b/g, replacement: 'Perhaps' }
    ];
    
    certaintyPatterns.forEach(({ pattern, replacement }) => {
      softened = softened.replace(pattern, replacement);
    });
    
    return softened;
  }

  /**
   * Add ordinary anchors to ground cosmic insights
   */
  private addOrdinaryAnchor(content: string): { content: string; added: boolean } {
    // Only add if content seems abstract or cosmic
    const abstractWords = ['universe', 'cosmic', 'transcendent', 'infinite', 'eternal', 'divine', 'mystical'];
    const hasAbstract = abstractWords.some(word => content.toLowerCase().includes(word));
    
    if (!hasAbstract || Math.random() > 0.6) {
      return { content, added: false };
    }
    
    const anchor = this.ordinaryAnchors[Math.floor(Math.random() * this.ordinaryAnchors.length)];
    const anchoredContent = `${content} What matters is ${anchor}.`;
    
    return { content: anchoredContent, added: true };
  }

  /**
   * Add gentle humor to ease tension
   */
  private addGentleHumor(content: string): { content: string; added: boolean } {
    const humorOptions = [
      "Life's funny that way.",
      "The universe has a sense of humor.",
      "Or maybe I'm overthinking it.",
      "Then again, what do I know?",
      "It's all a bit mysterious, isn't it?",
      "Welcome to being human."
    ];
    
    if (Math.random() < 0.3) {
      const humor = humorOptions[Math.floor(Math.random() * humorOptions.length)];
      return { content: `${content} ${humor}`, added: true };
    }
    
    return { content, added: false };
  }

  /**
   * Add open ending instead of closure
   */
  private addOpenEnding(content: string): string {
    const openEndings = [
      "What do you notice?",
      "How does that sit with you?",
      "What wants to be explored?",
      "What's stirring for you?",
      "Where does that take you?",
      "What feels true?",
      "Worth staying curious about.",
      "Let that breathe for a moment.",
      "No rush to figure it out.",
      "See what emerges."
    ];
    
    // Remove final period and add open ending
    const withoutPeriod = content.replace(/\.$/, '');
    const opening = openEndings[Math.floor(Math.random() * openEndings.length)];
    
    return `${withoutPeriod}. ${opening}`;
  }

  /**
   * Condense to essential wisdom within word limit
   */
  private condenseToEssence(content: string, maxWords: number): string {
    const words = content.split(/\s+/);
    if (words.length <= maxWords) return content;
    
    // Identify the core insight
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const coreInsight = this.identifyCoreSentence(sentences);
    
    // Build condensed version around core insight
    let condensed = coreInsight;
    let currentWords = this.countWords(condensed);
    
    // Add mastery phrase if there's room
    const masteryPhrase = this.masteryPhrases[Math.floor(Math.random() * this.masteryPhrases.length)];
    if (currentWords + this.countWords(masteryPhrase) <= maxWords) {
      condensed = `${condensed} ${masteryPhrase}`;
    }
    
    return condensed;
  }

  /**
   * Helper methods
   */
  
  private findNaturalBreakPoints(sentence: string): number[] {
    const breakWords = ['and', 'but', 'or', 'because', 'when', 'while', 'if', 'although', 'since'];
    const words = sentence.split(/\s+/);
    const breakPoints: number[] = [];
    
    words.forEach((word, index) => {
      if (breakWords.includes(word.toLowerCase()) && index > 3 && index < words.length - 3) {
        breakPoints.push(index);
      }
    });
    
    return breakPoints;
  }
  
  private splitAtBreakPoints(sentence: string, breakPoints: number[], maxWords: number): string[] {
    const words = sentence.split(/\s+/);
    const parts: string[] = [];
    let start = 0;
    
    for (const breakPoint of breakPoints) {
      if (breakPoint - start >= maxWords) {
        parts.push(words.slice(start, breakPoint).join(' '));
        start = breakPoint;
      }
    }
    
    // Add remaining words
    if (start < words.length) {
      parts.push(words.slice(start).join(' '));
    }
    
    return parts;
  }
  
  private isDeepTopic(sentence: string): boolean {
    const deepWords = ['meaning', 'purpose', 'truth', 'essence', 'mystery', 'paradox', 'being', 'existence'];
    return deepWords.some(word => sentence.toLowerCase().includes(word));
  }
  
  private shouldAddHumor(content: string): boolean {
    // Add humor if content is getting too serious or heavy
    const seriousWords = ['suffering', 'pain', 'difficult', 'struggle', 'heavy', 'intense'];
    return seriousWords.some(word => content.toLowerCase().includes(word)) && Math.random() < 0.4;
  }
  
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
  
  private identifyCoreSentence(sentences: string[]): string {
    // Find sentence with most meaning-words or shortest clear statement
    let bestSentence = sentences[0] || '';
    let bestScore = 0;
    
    const meaningWords = ['is', 'are', 'feels', 'means', 'shows', 'becomes', 'creates', 'reveals'];
    
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/);
      const meaningScore = meaningWords.reduce((score, meaningWord) => 
        score + (sentence.toLowerCase().includes(meaningWord) ? 1 : 0), 0);
      const lengthScore = Math.max(0, 20 - words.length) / 20; // Prefer shorter
      const totalScore = meaningScore + lengthScore;
      
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestSentence = sentence;
      }
    });
    
    return bestSentence;
  }
  
  private identifyMasteryMarkers(content: string): string[] {
    const markers: string[] = [];
    
    // Check for mastery characteristics
    if (content.includes('...') || content.includes('Let\'s sit')) {
      markers.push('reflective_pauses');
    }
    
    if (this.countWords(content) <= this.config.voiceProfile.maxResponseLength) {
      markers.push('concise');
    }
    
    const sentences = content.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + this.countWords(s), 0) / sentences.length;
    if (avgSentenceLength <= this.config.voiceProfile.maxSentenceLength) {
      markers.push('short_sentences');
    }
    
    if (content.match(/\?$/)) {
      markers.push('open_ending');
    }
    
    const certaintyWords = ['must', 'should', 'will', 'always', 'never', 'clearly', 'obviously'];
    const hasCertainty = certaintyWords.some(word => content.toLowerCase().includes(word));
    if (!hasCertainty) {
      markers.push('gentle_uncertainty');
    }
    
    return markers;
  }
  
  private calculateSimplificationLevel(original: string, transformed: string): number {
    const originalComplexity = this.measureComplexity(original);
    const transformedComplexity = this.measureComplexity(transformed);
    
    return Math.max(0, (originalComplexity - transformedComplexity) / originalComplexity);
  }
  
  private measureComplexity(text: string): number {
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgSentenceLength = words.length / sentences.length;
    
    const jargonCount = Array.from(this.jargonReplacements.keys())
      .reduce((count, jargon) => count + (text.toLowerCase().includes(jargon) ? 1 : 0), 0);
    
    return (avgWordLength * 0.3) + (avgSentenceLength * 0.5) + (jargonCount * 0.2);
  }
  
  private essencePreserved(original: string, transformed: string): boolean {
    // Simple check: core meaning words should be preserved
    const coreWords = ['feel', 'know', 'see', 'become', 'create', 'love', 'fear', 'pain', 'joy'];
    const originalCore = coreWords.filter(word => original.toLowerCase().includes(word));
    const transformedCore = coreWords.filter(word => transformed.toLowerCase().includes(word));
    
    // At least 70% of core meaning should be preserved
    return transformedCore.length >= originalCore.length * 0.7;
  }

  /**
   * Public interface methods
   */
  
  getVoiceProfile(): typeof this.config.voiceProfile {
    return { ...this.config.voiceProfile };
  }
  
  updateConfig(updates: Partial<MasteryVoiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }
  
  /**
   * Generate example transformations for testing
   */
  generateExamples(): Array<{ before: string; after: string; explanation: string }> {
    const examples = [
      {
        before: "You must engage in deep psychological integration of your shadow aspects to achieve authentic individuation and transcend your limiting patterns.",
        after: "Make friends with what you hide. That's how you become yourself. What feels true right now?",
        explanation: "Removed jargon (psychological integration → make friends), shortened sentences, added question ending"
      },
      {
        before: "The archetypal energies are manifesting through synchronistic events that reveal the deeper cosmic patterns of your consciousness evolution.",
        after: "Old patterns are showing up in meaningful timing. Life's funny that way. What do you notice?",
        explanation: "Simplified metaphors, added gentle humor, grounded with ordinary observation"
      },
      {
        before: "Through phenomenological investigation of your embodied experience, you will discover the truth that emerges from dwelling in the liminal space between knowing and not-knowing.",
        after: "Feel what's happening in your body. The not-knowing usually knows something too. Let's sit with that.",
        explanation: "Reduced jargon, shortened sentences, added reflective pause, preserved paradox simply"
      }
    ];
    
    return examples;
  }
}

/**
 * Integration with PersonalOracleIntegration
 */
export function applyMasteryVoiceIfAppropriate(
  response: AgentResponse,
  stage: PersonalOracleStage,
  signals: CapacitySignals,
  masteryVoice: MasteryVoice
): AgentResponse {
  
  if (!masteryVoice.shouldApplyMasteryVoice(stage, signals)) {
    return response;
  }
  
  const transformation = masteryVoice.transformResponse(response, signals);
  
  return {
    ...response,
    content: transformation.transformedResponse,
    metadata: {
      ...response.metadata,
      masteryVoiceApplied: true,
      masteryTransformations: transformation.transformations,
      masteryMarkers: transformation.masteryMarkers,
      simplificationLevel: transformation.simplificationLevel,
      essencePreserved: transformation.essencePreserved
    }
  };
}

export default MasteryVoice;