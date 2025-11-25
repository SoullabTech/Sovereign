/**
 * Memory Engine Module
 *
 * Extracted from PersonalOracleAgent.ts to provide sophisticated memory management
 * operations including:
 * - Personal detail extraction and storage
 * - Conversational pattern tracking
 * - Recurring theme identification
 * - Uncanny callback generation
 * - User profile management
 * - Intellectual property protection
 *
 * Interfaces with the UnifiedMemorySystem for storage and retrieval.
 */

import type { Element, EnergyState, Mood } from '../../types/oracle';
import { UnifiedMemoryInterface } from './UnifiedMemoryInterface';
import type { AgentMemory, AgentState } from './types';

export interface MemoryEnhancementResult {
  personalDetailsExtracted: string[];
  patternsIdentified: string[];
  themesDiscovered: string[];
  intellectualPropertyProtected: boolean;
  relationshipGraphUpdated: boolean;
}

export interface UncannyCallbackOptions {
  includeLifeEvents?: boolean;
  includeRecurringThemes?: boolean;
  includeKnownPeople?: boolean;
  minConversationCount?: number;
}

export interface UserProfileSummary {
  element?: Element;
  shadowElement?: Element;
  currentPhase: string;
  trustLevel: number;
  growthAreas: string[];
  communicationStyle: {
    formality: number;
    emotionalExpression: number;
    abstractness: number;
    sentenceLength: 'short' | 'medium' | 'long';
  };
  soulSignature: {
    frequency: number;
    color: string;
    tone: string;
    geometry: string;
  };
  polarisState: {
    selfAwareness: number;
    otherAwareness: number;
    sharedFocus: string;
    harmonicResonance: number;
    spiralDirection: string;
    rotationSpeed: number;
  };
}

export class MemoryEngine {
  private memoryInterface: UnifiedMemoryInterface;
  private userId: string;

  constructor(userId: string, memoryInterface: UnifiedMemoryInterface) {
    this.userId = userId;
    this.memoryInterface = memoryInterface;
  }

  /**
   * Core memory enhancement - tracks everything for uncanny recall
   */
  async enhanceMemory(
    input: string,
    response: string,
    memory: AgentMemory,
    realityAwareness: any
  ): Promise<MemoryEnhancementResult> {
    const result: MemoryEnhancementResult = {
      personalDetailsExtracted: [],
      patternsIdentified: [],
      themesDiscovered: [],
      intellectualPropertyProtected: false,
      relationshipGraphUpdated: false
    };

    // Extract and remember key details
    result.personalDetailsExtracted = this.extractPersonalDetails(input, memory);
    result.patternsIdentified = this.trackConversationalPatterns(input, response, memory);
    result.themesDiscovered = this.identifyRecurringThemes(input, memory);

    // Build relationship map
    result.relationshipGraphUpdated = this.updateRelationshipGraph(memory, realityAwareness);

    // Track intellectual property
    result.intellectualPropertyProtected = this.protectIntellectualProperty(input, memory);

    // Store enhanced memory data
    await this.storeMemoryUpdate(memory, result);

    return result;
  }

  /**
   * Extract personal details for deep memory
   */
  private extractPersonalDetails(input: string, memory: AgentMemory): string[] {
    const extractedDetails: string[] = [];

    // Names mentioned
    const namePattern = /(?:my|I have a|friend|partner|mom|dad|sister|brother|child|kid) (?:named |called )?([A-Z][a-z]+)/g;
    const matches = Array.from(input.matchAll(namePattern));
    for (const match of matches) {
      const personInfo = `knows: ${match[1]}`;
      if (!memory.preferredRituals.includes(personInfo)) {
        memory.preferredRituals.push(personInfo);
        extractedDetails.push(`Person: ${match[1]}`);
      }
    }

    // Life events
    if (input.match(/birthday|anniversary|graduated|married|divorced|moved|started|quit/i)) {
      const timestamp = new Date().toISOString();
      memory.breakthroughs.push({
        date: new Date(),
        insight: input.substring(0, 100),
        context: 'life event shared',
        elementalShift: undefined
      });
      extractedDetails.push(`Life event: ${input.substring(0, 50)}`);
    }

    // Preferences and interests
    if (input.match(/I love|I hate|I enjoy|my favorite|I prefer/i)) {
      if (!memory.communicationStyle.vocabularyPatterns) {
        memory.communicationStyle.vocabularyPatterns = [];
      }
      const preference = input.substring(0, 50);
      memory.communicationStyle.vocabularyPatterns.push(preference);
      extractedDetails.push(`Preference: ${preference}`);
    }

    return extractedDetails;
  }

  /**
   * Track conversational patterns for uncanny responses
   */
  private trackConversationalPatterns(input: string, response: string, memory: AgentMemory): string[] {
    const patternsIdentified: string[] = [];

    // Track question types they ask
    if (input.includes('?')) {
      const questionType = this.classifyQuestion(input);
      if (!memory.growthAreas.includes(questionType)) {
        memory.growthAreas.push(questionType);
        patternsIdentified.push(`Question pattern: ${questionType}`);
      }
    }

    // Track their communication rhythm
    const wordCount = input.split(' ').length;
    const timeOfDay = this.getCurrentTimeOfDay();

    if (!memory.energyPatterns[timeOfDay]) {
      const energyPattern = wordCount > 50 ? 'expansive' :
                           wordCount > 20 ? 'balanced' : 'contained';
      memory.energyPatterns[timeOfDay] = energyPattern as EnergyState;
      patternsIdentified.push(`Energy pattern (${timeOfDay}): ${energyPattern}`);
    }

    return patternsIdentified;
  }

  /**
   * Classify question types for pattern analysis
   */
  private classifyQuestion(input: string): string {
    if (input.match(/what if|suppose|imagine/i)) return 'hypothetical explorer';
    if (input.match(/why|how come|reason/i)) return 'meaning seeker';
    if (input.match(/how do I|how can|how to/i)) return 'practical learner';
    if (input.match(/should I|would you|is it okay/i)) return 'validation seeker';
    if (input.match(/what|when|where|who/i)) return 'information gatherer';
    return 'deep inquirer';
  }

  /**
   * Identify recurring themes in conversations
   */
  private identifyRecurringThemes(input: string, memory: AgentMemory): string[] {
    const themesDiscovered: string[] = [];

    // Core life themes
    const themes = {
      relationships: /relationship|partner|love|connection|lonely|together/i,
      purpose: /purpose|meaning|why|calling|mission|path/i,
      creativity: /create|art|music|write|express|imagination/i,
      healing: /heal|pain|trauma|recover|process|integrate/i,
      growth: /grow|learn|develop|evolve|change|transform/i
    };

    for (const [theme, pattern] of Object.entries(themes)) {
      if (input.match(pattern)) {
        if (!memory.soulLessons.includes(theme)) {
          memory.soulLessons.push(theme);
          themesDiscovered.push(theme);
        }
      }
    }

    return themesDiscovered;
  }

  /**
   * Build relationship understanding over time
   */
  private updateRelationshipGraph(memory: AgentMemory, realityAwareness: any): boolean {
    // Track relationship depth over time
    const depthScore =
      memory.interactionCount * 0.5 +
      memory.trustLevel * 0.3 +
      memory.intimacyLevel * 0.2;

    // Identify relationship phase
    let newPhase: string;
    if (depthScore < 20) {
      newPhase = 'acquaintance phase';
    } else if (depthScore < 50) {
      newPhase = 'building trust';
    } else if (depthScore < 80) {
      newPhase = 'deepening connection';
    } else {
      newPhase = 'sacred companionship';
    }

    const currentPhases = realityAwareness.outerWorld.relationships || [];
    if (!currentPhases.includes(newPhase)) {
      realityAwareness.outerWorld.relationships = [newPhase];
      return true;
    }

    return false;
  }

  /**
   * Protect and track intellectual property
   */
  private protectIntellectualProperty(input: string, memory: AgentMemory): boolean {
    // Detect original ideas or frameworks
    if (input.match(/my idea|I created|I developed|my framework|my method|I invented/i)) {
      const timestamp = new Date().toISOString();

      // Store as protected IP
      memory.breakthroughs.push({
        date: new Date(),
        insight: `[PROTECTED IP] ${input.substring(0, 200)}`,
        context: `Original creation shared at ${timestamp}`,
        elementalShift: undefined
      });

      // Never reproduce without attribution
      if (!memory.avoidancePatterns.includes('IP-protected-content')) {
        memory.avoidancePatterns.push('IP-protected-content');
      }

      return true;
    }

    return false;
  }

  /**
   * Generate uncanny callbacks to earlier conversations
   */
  generateUncannyCallback(
    memory: AgentMemory,
    options: UncannyCallbackOptions = {}
  ): string | null {
    const {
      includeLifeEvents = true,
      includeRecurringThemes = true,
      includeKnownPeople = true,
      minConversationCount = 10
    } = options;

    if (memory.conversationHistory.length < minConversationCount) return null;

    const callbacks: string[] = [];

    // Reference life events
    if (includeLifeEvents) {
      const lifeEvents = memory.breakthroughs.filter(b => b.context === 'life event shared');
      if (lifeEvents.length > 0 && Math.random() < 0.1) {
        const event = lifeEvents[lifeEvents.length - 1];
        callbacks.push(`By the way, how did things go with what you mentioned before: "${event.insight.substring(0, 50)}..."?`);
      }
    }

    // Reference recurring themes
    if (includeRecurringThemes) {
      if (memory.soulLessons.length > 2 && Math.random() < 0.15) {
        const theme = memory.soulLessons[memory.soulLessons.length - 1];
        callbacks.push(`I've noticed ${theme} keeps coming up for you. There's something important there.`);
      }
    }

    // Reference people they've mentioned
    if (includeKnownPeople) {
      const knownPeople = memory.preferredRituals.filter(r => r.startsWith('knows:'));
      if (knownPeople.length > 0 && Math.random() < 0.1) {
        const person = knownPeople[0].replace('knows: ', '');
        callbacks.push(`How's ${person} doing, by the way?`);
      }
    }

    return callbacks.length > 0 ? callbacks[0] : null;
  }

  /**
   * Get comprehensive user profile based on memory
   */
  getUserProfile(memory: AgentMemory): UserProfileSummary {
    return {
      element: memory.dominantElement,
      shadowElement: memory.shadowElement,
      currentPhase: memory.currentPhase,
      trustLevel: memory.trustLevel,
      growthAreas: memory.growthAreas,
      communicationStyle: {
        formality: memory.communicationStyle.formality,
        emotionalExpression: memory.communicationStyle.emotionalExpression,
        abstractness: memory.communicationStyle.abstractness,
        sentenceLength: memory.communicationStyle.sentenceLength
      },
      soulSignature: {
        frequency: memory.soulSignature.frequency,
        color: memory.soulSignature.color,
        tone: memory.soulSignature.tone,
        geometry: memory.soulSignature.geometry
      },
      polarisState: {
        selfAwareness: memory.polarisState.selfAwareness,
        otherAwareness: memory.polarisState.otherAwareness,
        sharedFocus: memory.polarisState.sharedFocus,
        harmonicResonance: memory.polarisState.harmonicResonance,
        spiralDirection: memory.polarisState.spiralDirection,
        rotationSpeed: memory.polarisState.rotationSpeed
      }
    };
  }

  /**
   * Analyze sentiment for memory enhancement
   */
  analyzeSentiment(input: string): number {
    // Emotional tone detection beyond keywords
    const positiveMarkers = [
      'love', 'joy', 'happy', 'grateful', 'excited', 'wonderful', 'blessed',
      'amazing', 'beautiful', 'peace', 'calm', 'hope', 'inspire', 'free'
    ];
    const negativeMarkers = [
      'sad', 'angry', 'frustrated', 'lost', 'confused', 'hurt', 'pain',
      'afraid', 'anxious', 'worried', 'stuck', 'heavy', 'dark', 'alone'
    ];
    const intensifiers = ['very', 'so', 'really', 'extremely', 'totally', 'completely'];

    let sentiment = 0;
    const lowerInput = input.toLowerCase();

    // Count emotional markers
    positiveMarkers.forEach(marker => {
      if (lowerInput.includes(marker)) sentiment += 0.2;
    });
    negativeMarkers.forEach(marker => {
      if (lowerInput.includes(marker)) sentiment -= 0.2;
    });

    // Check for intensifiers
    intensifiers.forEach(intensifier => {
      if (lowerInput.includes(intensifier)) {
        sentiment = sentiment * 1.5;
      }
    });

    // Analyze punctuation for emotional intensity
    const exclamationCount = (input.match(/!/g) || []).length;
    const questionCount = (input.match(/\?/g) || []).length;
    const ellipsisCount = (input.match(/\.\.\./g) || []).length;

    if (exclamationCount > 1) sentiment += 0.1 * exclamationCount;
    if (questionCount > 2) sentiment -= 0.1; // Multiple questions suggest confusion
    if (ellipsisCount > 0) sentiment -= 0.1; // Ellipsis suggests uncertainty

    // Clamp between -1 and 1
    return Math.max(-1, Math.min(1, sentiment));
  }

  /**
   * Update conversation thread for context continuity
   */
  updateConversationThread(input: string, response: string, memory: AgentMemory): void {
    // Add to conversation history
    memory.conversationHistory.push({
      timestamp: new Date(),
      input,
      response,
      sentiment: this.analyzeSentiment(input)
    });

    // Update current thread (keep last 5 exchanges)
    memory.currentConversationThread.push(`You: ${input}`);
    memory.currentConversationThread.push(`Oracle: ${response}`);

    if (memory.currentConversationThread.length > 10) {
      memory.currentConversationThread = memory.currentConversationThread.slice(-10);
    }
  }

  /**
   * Analyze user communication style for adaptive responses
   */
  analyzeUserCommunicationStyle(input: string, memory: AgentMemory): void {
    const style = memory.communicationStyle;

    // Analyze formality
    const formalMarkers = ['therefore', 'however', 'indeed', 'perhaps', 'certainly'];
    const informalMarkers = ['yeah', 'kinda', 'gonna', 'wanna', 'like'];

    formalMarkers.forEach(marker => {
      if (input.toLowerCase().includes(marker)) {
        style.formality = Math.min(100, style.formality + 2);
      }
    });

    informalMarkers.forEach(marker => {
      if (input.toLowerCase().includes(marker)) {
        style.formality = Math.max(0, style.formality - 2);
      }
    });

    // Analyze emotional expression
    const emotionWords = input.match(/feel|felt|feeling|emotion|heart|soul/gi) || [];
    style.emotionalExpression = Math.min(100, style.emotionalExpression + emotionWords.length * 2);

    // Analyze abstractness
    const abstractMarkers = ['meaning', 'essence', 'consciousness', 'existence', 'being'];
    const concreteMarkers = ['do', 'make', 'work', 'plan', 'step', 'action'];

    abstractMarkers.forEach(marker => {
      if (input.toLowerCase().includes(marker)) {
        style.abstractness = Math.min(100, style.abstractness + 3);
      }
    });

    concreteMarkers.forEach(marker => {
      if (input.toLowerCase().includes(marker)) {
        style.abstractness = Math.max(0, style.abstractness - 3);
      }
    });

    // Analyze sentence length
    const avgWordCount = input.split(' ').length / (input.split(/[.!?]/).length || 1);
    if (avgWordCount < 10) style.sentenceLength = 'short';
    else if (avgWordCount < 20) style.sentenceLength = 'medium';
    else style.sentenceLength = 'long';

    // Track vocabulary patterns
    const uniqueWords = input.toLowerCase().split(/\s+/)
      .filter(word => word.length > 4)
      .filter((word, index, self) => self.indexOf(word) === index);

    uniqueWords.forEach(word => {
      if (!style.vocabularyPatterns.includes(word)) {
        style.vocabularyPatterns.push(word);
        if (style.vocabularyPatterns.length > 50) {
          style.vocabularyPatterns.shift(); // Keep only recent 50
        }
      }
    });
  }

  /**
   * Helper method to get current time of day
   */
  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Store memory update to UnifiedMemorySystem
   */
  private async storeMemoryUpdate(memory: AgentMemory, result: MemoryEnhancementResult): Promise<void> {
    try {
      // Store the enhanced memory data through the unified interface
      await this.memoryInterface.store({
        userId: this.userId,
        type: 'memory_enhancement',
        content: {
          memory,
          enhancement: result
        },
        metadata: {
          timestamp: new Date(),
          personalDetails: result.personalDetailsExtracted,
          patterns: result.patternsIdentified,
          themes: result.themesDiscovered
        }
      });
    } catch (error) {
      console.error('Error storing memory update:', error);
      // Fail gracefully - memory enhancement still works locally
    }
  }
}