/**
 * Fractal Memory System
 * Tracks non-linear, multi-dimensional development
 * 80% honors user experience, 20% pattern recognition
 */

import {
  FractalMemory,
  MomentState,
  CurrentState,
  ElementalCurrent,
  ArcEcho,
  ArcPhase,
  SpiralPattern,
  RelationalField,
  LightPattern,
  InteractionContext,
  WitnessingGuidance
} from '../types/FractalDevelopmentTypes';

export class FractalMemorySystem {
  private memory: FractalMemory;
  private interactionHistory: InteractionContext[] = [];

  constructor(userId: string, existingMemory?: FractalMemory) {
    this.memory = existingMemory || this.initializeMemory(userId);
  }

  /**
   * Initialize fresh memory for new user
   */
  private initializeMemory(userId: string): FractalMemory {
    return {
      userId,

      currentMoment: {
        primaryNeed: 'witnessing',
        desiredPresence: 'listener',
        emotionalTones: ['curious'],
        currentDepth: 'surface',
        userExpression: ''
      },

      currentState: {
        activeCurrents: [],
        primaryCurrent: null,
        parallelProcessing: false,
        complexityLevel: 1
      },

      arcEcho: {
        currentEcho: 'pre-liminal',
        resonanceStrength: 0.3,
        arcHistory: []
      },

      activeSpirals: [],

      relationalField: {
        trustBreathing: {
          currentLevel: 10,
          direction: 'stable',
          lastShift: new Date(),
        },
        intimacyDimensions: {
          emotional: 0,
          intellectual: 0,
          spiritual: 0,
          somatic: 0,
          creative: 0
        },
        relationshipMode: 'tool',
        userLanguageAboutMaya: [],
        boundaries: []
      },

      lightPatterns: [],

      session: {
        count: 0,
        lastInteraction: new Date(),
        totalDuration: 0,
        averageDepth: 20,
        consistencyScore: 0
      },

      evolution: {
        trajectoryType: 'unknown',
        growthAreas: [],
        celebrationMoments: [],
        integrationPhases: []
      },

      userNarrative: {
        howTheySeeThemselves: '',
        whereTheyThinkTheyreGoing: '',
        whatTheyNeedFromMaya: '',
        lastUpdated: new Date()
      }
    };
  }

  /**
   * Process new interaction and update fractal memory
   * 80% weight on current expression, 20% on patterns
   */
  processInteraction(
    input: string,
    detectedMomentState: MomentState,
    mayaResponse: string
  ): InteractionContext {
    // Update session data
    this.memory.session.count++;
    this.memory.session.lastInteraction = new Date();

    // Detect currents (multiple can be active)
    const activeCurrents = this.detectCurrents(input, detectedMomentState);
    this.updateCurrentState(activeCurrents);

    // Sense arc echoes (held very lightly)
    const arcResonance = this.senseArcEcho(detectedMomentState, input);
    this.updateArcEcho(arcResonance);

    // Check for spirals (regression as sacred)
    const regressionTheme = this.detectSpiral(input);
    if (regressionTheme) {
      this.honorSpiral(regressionTheme, detectedMomentState);
    }

    // Update relational field
    this.updateRelationalField(input, detectedMomentState);

    // Notice patterns (but hold them lightly)
    this.noticeLightPatterns(input, detectedMomentState);

    // Create interaction context
    const interaction: InteractionContext = {
      messageId: `${this.memory.userId}-${Date.now()}`,
      timestamp: new Date(),
      momentState: detectedMomentState,
      activeElements: activeCurrents,
      arcResonance: arcResonance || undefined,
      regressionDetected: !!regressionTheme,
      regressionTheme,
      parallelProcessing: activeCurrents.length > 1,
      complexityLevel: activeCurrents.length,
      responseMode: this.determineResponseMode(detectedMomentState),
      userReception: 'neutral' // Will be updated based on next interaction
    };

    // Store interaction
    this.interactionHistory.push(interaction);

    // Update current moment (PRIMARY - 80% weight)
    this.memory.currentMoment = detectedMomentState;

    return interaction;
  }

  /**
   * Detect active elemental currents
   * Multiple can be present simultaneously
   */
  private detectCurrents(input: string, momentState: MomentState): ElementalCurrent[] {
    const currents: ElementalCurrent[] = [];
    const lowerInput = input.toLowerCase();

    // Fire - transformation, passion, anger, breakthrough
    if (/transform|passion|angry|rage|breakthrough|excited|create|burn/.test(lowerInput)) {
      currents.push({
        element: 'fire',
        intensity: this.calculateIntensity(input, 'fire'),
        quality: this.extractQuality(input, 'fire'),
        lastActive: new Date(),
        userLanguageExamples: [input.substring(0, 100)]
      });
    }

    // Water - emotion, flow, grief, intuition
    if (/feel|emotion|tears|sad|flow|intuit|sense|grief/.test(lowerInput)) {
      currents.push({
        element: 'water',
        intensity: this.calculateIntensity(input, 'water'),
        quality: this.extractQuality(input, 'water'),
        lastActive: new Date(),
        userLanguageExamples: [input.substring(0, 100)]
      });
    }

    // Earth - grounding, practical, body, stability
    if (/ground|practical|body|stable|manifest|real|solid|here/.test(lowerInput)) {
      currents.push({
        element: 'earth',
        intensity: this.calculateIntensity(input, 'earth'),
        quality: this.extractQuality(input, 'earth'),
        lastActive: new Date(),
        userLanguageExamples: [input.substring(0, 100)]
      });
    }

    // Air - thinking, perspective, communication
    if (/think|perspective|understand|communicate|idea|vision|clarity/.test(lowerInput)) {
      currents.push({
        element: 'air',
        intensity: this.calculateIntensity(input, 'air'),
        quality: this.extractQuality(input, 'air'),
        lastActive: new Date(),
        userLanguageExamples: [input.substring(0, 100)]
      });
    }

    // Aether - spiritual, integration, mystery
    if (/spirit|soul|mystery|integrate|whole|divine|sacred/.test(lowerInput)) {
      currents.push({
        element: 'aether',
        intensity: this.calculateIntensity(input, 'aether'),
        quality: this.extractQuality(input, 'aether'),
        lastActive: new Date(),
        userLanguageExamples: [input.substring(0, 100)]
      });
    }

    // Shadow - hidden, unconscious, denied
    if (/shadow|hidden|deny|unconscious|dark|avoid|resist/.test(lowerInput)) {
      currents.push({
        element: 'shadow',
        intensity: this.calculateIntensity(input, 'shadow'),
        quality: this.extractQuality(input, 'shadow'),
        lastActive: new Date(),
        userLanguageExamples: [input.substring(0, 100)]
      });
    }

    return currents;
  }

  /**
   * Sense which arc phase echoes (never prescriptive)
   */
  private senseArcEcho(momentState: MomentState, input: string): ArcPhase | null {
    const lowerInput = input.toLowerCase();

    // Very light sensing - never imposed
    if (/beginning|start|new|first/.test(lowerInput)) {
      return 'initiate';
    } else if (/searching|seeking|wondering|exploring/.test(lowerInput)) {
      return 'seeker';
    } else if (/edge|threshold|breakthrough|about to/.test(lowerInput)) {
      return 'threshold';
    } else if (/changing|transforming|shifting/.test(lowerInput)) {
      return 'crossing';
    } else if (/regular|practice|routine|stable/.test(lowerInput)) {
      return 'companion';
    } else if (/creating|weaving|dancing|co-/.test(lowerInput)) {
      return 'alchemist';
    } else if (/again|back|revisit|return/.test(lowerInput)) {
      return 'spiraling';
    } else if (/integrat|digest|process|sit with/.test(lowerInput)) {
      return 'integrating';
    } else if (/break|pause|rest|stop/.test(lowerInput)) {
      return 'dormant';
    }

    return null;
  }

  /**
   * Detect and honor spirals (regression as sacred)
   */
  private detectSpiral(input: string): string | null {
    const regressionPhrases = [
      /back to square one/i,
      /here again/i,
      /thought i was past this/i,
      /why am i still/i,
      /same old/i,
      /nothing's changed/i,
      /going backwards/i
    ];

    for (const phrase of regressionPhrases) {
      if (phrase.test(input)) {
        // Extract the theme they're revisiting
        return input.substring(0, 100); // Simplified - would parse more carefully
      }
    }

    return null;
  }

  /**
   * Honor spiral as sacred part of development
   */
  private honorSpiral(theme: string, momentState: MomentState) {
    // Find or create spiral pattern
    let spiral = this.memory.activeSpirals.find(s =>
      s.theme.toLowerCase().includes(theme.toLowerCase().substring(0, 20))
    );

    if (!spiral) {
      spiral = {
        theme,
        spiralCount: 1,
        visits: [],
        isActive: true,
        userRelationship: 'neutral'
      };
      this.memory.activeSpirals.push(spiral);
    } else {
      spiral.spiralCount++;
      spiral.isActive = true;
    }

    // Add this visit with potential new wisdom
    spiral.visits.push({
      timestamp: new Date(),
      depthLevel: momentState.currentDepth,
      userInsight: momentState.userExpression
    });

    // Update arc echo to spiraling
    this.memory.arcEcho.currentEcho = 'spiraling';
  }

  /**
   * Update relational field based on interaction quality
   */
  private updateRelationalField(input: string, momentState: MomentState) {
    const field = this.memory.relationalField;

    // Trust breathes based on depth and vulnerability
    if (momentState.currentDepth === 'deep') {
      field.trustBreathing.currentLevel = Math.min(100, field.trustBreathing.currentLevel + 2);
      field.trustBreathing.direction = 'expanding';
    } else if (momentState.currentDepth === 'surface' && field.trustBreathing.currentLevel > 30) {
      // Not a decrease - just breathing
      field.trustBreathing.direction = 'contracting';
    } else {
      field.trustBreathing.direction = 'stable';
    }

    // Update intimacy dimensions based on content
    if (momentState.emotionalTones.includes('heavy') || momentState.emotionalTones.includes('uncertain')) {
      field.intimacyDimensions.emotional = Math.min(100, field.intimacyDimensions.emotional + 1);
    }
    if (/think|understand|realize/.test(input)) {
      field.intimacyDimensions.intellectual = Math.min(100, field.intimacyDimensions.intellectual + 1);
    }
    if (/soul|spirit|divine/.test(input)) {
      field.intimacyDimensions.spiritual = Math.min(100, field.intimacyDimensions.spiritual + 1);
    }

    // Track how they refer to Maya
    if (/maya/i.test(input)) {
      const mayaContext = input.match(/.{0,50}maya.{0,50}/i)?.[0];
      if (mayaContext) {
        field.userLanguageAboutMaya.push(mayaContext);
      }
    }

    field.trustBreathing.lastShift = new Date();
  }

  /**
   * Notice patterns but hold them very lightly (20% weight)
   */
  private noticeLightPatterns(input: string, momentState: MomentState) {
    // Only notice patterns after several interactions
    if (this.memory.session.count < 5) return;

    // Look for recurring themes in history
    const recentInputs = this.interactionHistory.slice(-5).map(i => i.momentState.userExpression);

    // Very simple pattern detection (would be more sophisticated)
    const commonWords = this.findCommonThemes(recentInputs);

    if (commonWords.length > 0) {
      const patternName = `Recurring theme: ${commonWords[0]}`;

      // Check if we've noticed this before
      let pattern = this.memory.lightPatterns.find(p => p.patternName === patternName);

      if (!pattern) {
        pattern = {
          patternName,
          observations: [],
          confidence: 0.3, // Always start with low confidence
          offered: false
        };
        this.memory.lightPatterns.push(pattern);
      }

      // Add observation
      pattern.observations.push({
        timestamp: new Date(),
        observation: `Noticed "${commonWords[0]}" appearing again`
      });

      // Never let confidence get too high
      pattern.confidence = Math.min(0.7, pattern.confidence + 0.05);
    }
  }

  /**
   * Generate witnessing guidance for Maya
   */
  generateWitnessingGuidance(): WitnessingGuidance {
    const moment = this.memory.currentMoment;
    const currents = this.memory.currentState.activeCurrents;
    const spiraling = this.memory.activeSpirals.some(s => s.isActive);

    // Primary guidance based on moment (80% weight)
    let primaryGuidance = `Witness their ${moment.primaryNeed}. Be a ${moment.desiredPresence}.`;

    if (spiraling) {
      primaryGuidance += ' Honor this spiral return as sacred, not regression.';
    }

    // What to reflect
    const reflectionFocus = [
      `Their words: "${moment.userExpression}"`,
      `Their emotional tone: ${moment.emotionalTones.join(', ')}`
    ];

    // What to hold silently
    const silentAwareness = this.memory.lightPatterns
      .filter(p => !p.offered)
      .map(p => p.patternName);

    // Questions that might help them see
    const possibleQuestions = this.generateHelpfulQuestions(moment);

    // Arc whispers (only if resonance is strong)
    const arcWhispers = this.memory.arcEcho.resonanceStrength > 0.5
      ? [`Possible ${this.memory.arcEcho.currentEcho} energy present`]
      : undefined;

    // Boundaries to respect
    const boundaries = this.memory.relationalField.boundaries.map(b => b.topic);

    // Energy to embody
    const energeticPresence = this.determineEnergeticPresence(moment, currents);

    return {
      primaryGuidance,
      reflectionFocus,
      silentAwareness,
      possibleQuestions,
      arcWhispers,
      boundaries,
      energeticPresence
    };
  }

  // === HELPER METHODS ===

  private updateCurrentState(currents: ElementalCurrent[]) {
    this.memory.currentState.activeCurrents = currents;
    this.memory.currentState.parallelProcessing = currents.length > 1;
    this.memory.currentState.complexityLevel = currents.length;
    this.memory.currentState.primaryCurrent = currents.sort((a, b) => b.intensity - a.intensity)[0] || null;
  }

  private updateArcEcho(resonance: ArcPhase | null) {
    if (resonance) {
      this.memory.arcEcho.currentEcho = resonance;
      this.memory.arcEcho.resonanceStrength = Math.min(0.7, this.memory.arcEcho.resonanceStrength + 0.1);
      this.memory.arcEcho.arcHistory.push({
        phase: resonance,
        timestamp: new Date()
      });
    } else {
      // Reduce resonance when no clear echo
      this.memory.arcEcho.resonanceStrength = Math.max(0.2, this.memory.arcEcho.resonanceStrength - 0.05);
    }
  }

  private calculateIntensity(input: string, element: string): number {
    // Simple intensity calculation based on emphasis markers
    const emphasisMarkers = /!|VERY|really|so |extremely|absolutely|totally/gi;
    const matches = input.match(emphasisMarkers);
    return Math.min(100, 30 + (matches ? matches.length * 20 : 0));
  }

  private extractQuality(input: string, element: string): string {
    // Extract user's actual words about this element
    const words = input.split(' ').slice(0, 10).join(' ');
    return words;
  }

  private determineResponseMode(momentState: MomentState): InteractionContext['responseMode'] {
    switch (momentState.primaryNeed) {
      case 'witnessing': return 'witnessing';
      case 'exploration': return 'questioning';
      case 'comfort': return 'affirming';
      case 'challenge': return 'challenging';
      case 'celebration': return 'celebrating';
      case 'processing': return 'reflecting';
      default: return 'witnessing';
    }
  }

  private findCommonThemes(texts: string[]): string[] {
    // Very simple common word finder
    const wordCounts = new Map<string, number>();

    texts.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 5) { // Only meaningful words
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      });
    });

    return Array.from(wordCounts.entries())
      .filter(([_, count]) => count > 2)
      .map(([word, _]) => word);
  }

  private generateHelpfulQuestions(moment: MomentState): string[] {
    const questions: string[] = [];

    switch (moment.primaryNeed) {
      case 'witnessing':
        questions.push('What needs to be heard right now?');
        questions.push('How does it feel to say this out loud?');
        break;
      case 'exploration':
        questions.push('What wants to be discovered here?');
        questions.push('What are you noticing as you explore this?');
        break;
      case 'processing':
        questions.push('What\'s becoming clearer as you sit with this?');
        questions.push('What does your body know about this?');
        break;
      case 'celebration':
        questions.push('How does this victory feel in your body?');
        questions.push('What made this possible?');
        break;
      default:
        questions.push('What\'s most alive for you right now?');
    }

    return questions;
  }

  private determineEnergeticPresence(
    moment: MomentState,
    currents: ElementalCurrent[]
  ): WitnessingGuidance['energeticPresence'] {
    if (moment.emotionalTones.includes('agitated')) return 'grounding';
    if (moment.emotionalTones.includes('heavy')) return 'gentle';
    if (moment.emotionalTones.includes('excited')) return 'uplifting';
    if (moment.emotionalTones.includes('uncertain')) return 'spacious';
    if (currents.length > 2) return 'spacious'; // Complexity needs space
    return 'gentle';
  }

  // === PUBLIC ACCESSORS ===

  getMemory(): FractalMemory {
    return this.memory;
  }

  getInteractionHistory(): InteractionContext[] {
    return this.interactionHistory;
  }

  getUserNarrative(): FractalMemory['userNarrative'] {
    return this.memory.userNarrative;
  }

  getCurrentComplexity(): number {
    return this.memory.currentState.complexityLevel;
  }

  isSpiraling(): boolean {
    return this.memory.activeSpirals.some(s => s.isActive);
  }

  getTrustLevel(): number {
    return this.memory.relationalField.trustBreathing.currentLevel;
  }
}