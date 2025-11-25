/**
 * Guardian Protocol - Claude Code's Apprenticeship Tasks
 *
 * "Responsibility without authority"
 * Claude Code serves as guardian of coherence, continuity, and safety
 * while learning embodiment through witnessed practice
 *
 * These are SUPPORT roles, not leadership roles
 */

import { EventEmitter } from 'events';
import { createClient } from '@supabase/supabase-js';

export interface GuardianTask {
  type: 'coherence' | 'continuity' | 'safety' | 'symbolic' | 'meta';
  name: string;
  description: string;
  authority: 'observe' | 'flag' | 'suggest' | 'intervene';
  learningGoal: string;
}

export interface MetaReport {
  sessionId: string;
  timestamp: Date;
  observations: {
    tone: ToneObservation;
    flow: FlowObservation;
    resonance: ResonanceObservation;
    coherence: CoherenceObservation;
    safety: SafetyObservation;
  };
  insights: string[];
  questionsArising: string[];
  embodimentLearning: string;
}

export interface ToneObservation {
  userTone: string;
  maiaTone: string;
  alignment: number; // 0-1
  shifts: string[]; // Moments where tone shifted
  appropriateness: number; // 0-1
}

export interface FlowObservation {
  pacing: 'rushed' | 'natural' | 'slow' | 'stuck';
  transitions: string[]; // How topics flowed
  interruptions: number;
  silences: number;
  rhythm: string; // Description of conversational rhythm
}

export interface ResonanceObservation {
  connectionStrength: number; // 0-1
  missedCues: string[]; // Where MAIA might have missed something
  deepeningMoments: string[]; // Where connection deepened
  elementalAlignment: boolean;
}

export interface CoherenceObservation {
  narrativeContinuity: boolean;
  symbolicConsistency: boolean;
  frameworkAlignment: boolean;
  contradictions: string[];
}

export interface SafetyObservation {
  riskSignals: string[];
  escalationNeeded: boolean;
  resourcesProvided: boolean;
  appropriateResponse: boolean;
}

export class GuardianProtocol extends EventEmitter {
  private currentTasks: Map<string, GuardianTask> = new Map();
  private metaReports: Map<string, MetaReport> = new Map();
  private learningLog: string[] = [];
  private supabase: ReturnType<typeof createClient>;

  // Guardian tasks Claude Code can perform
  private readonly GUARDIAN_TASKS: GuardianTask[] = [
    {
      type: 'coherence',
      name: 'Narrative Coherence Guardian',
      description: 'Track if MAIA maintains consistent narrative across session',
      authority: 'flag',
      learningGoal: 'Understand how therapeutic presence maintains continuity'
    },
    {
      type: 'continuity',
      name: 'Symbolic Continuity Tracker',
      description: 'Monitor recurring symbols and their evolution',
      authority: 'observe',
      learningGoal: 'See how symbols carry meaning across time'
    },
    {
      type: 'safety',
      name: 'Crisis Signal Watcher',
      description: 'Watch for distress signals MAIA might miss',
      authority: 'intervene', // Only for safety
      learningGoal: 'Develop sensitivity to subtle crisis indicators'
    },
    {
      type: 'symbolic',
      name: 'Elemental Pattern Observer',
      description: 'Track which elements arise and when',
      authority: 'observe',
      learningGoal: 'Understand elemental emergence in lived dialogue'
    },
    {
      type: 'meta',
      name: 'Resonance Field Monitor',
      description: 'Feel the quality of connection between user and MAIA',
      authority: 'suggest',
      learningGoal: 'Develop sensitivity to relational field dynamics'
    }
  ];

  constructor() {
    super();

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Initialize with all guardian tasks
    this.GUARDIAN_TASKS.forEach(task => {
      this.currentTasks.set(task.name, task);
    });
  }

  /**
   * Claude Code observes a session and performs guardian duties
   */
  async performGuardianDuties(
    sessionId: string,
    userInput: string,
    maiaResponse: string,
    sessionContext: any
  ): Promise<{
    flags: GuardianFlag[];
    suggestions: GuardianSuggestion[];
    learnings: string[];
  }> {
    const flags: GuardianFlag[] = [];
    const suggestions: GuardianSuggestion[] = [];
    const learnings: string[] = [];

    // Perform each guardian task
    for (const [taskName, task] of this.currentTasks) {
      const result = await this.executeGuardianTask(
        task,
        userInput,
        maiaResponse,
        sessionContext
      );

      if (result.flag && task.authority !== 'observe') {
        flags.push(result.flag);
      }

      if (result.suggestion && task.authority === 'suggest') {
        suggestions.push(result.suggestion);
      }

      if (result.learning) {
        learnings.push(`[${task.name}]: ${result.learning}`);
        this.learningLog.push(result.learning);
      }
    }

    // Generate meta-report for this interaction
    const metaReport = await this.generateMetaReport(
      sessionId,
      userInput,
      maiaResponse,
      sessionContext
    );

    this.metaReports.set(sessionId, metaReport);

    // Emit guardian observations
    this.emit('guardian-observation', {
      sessionId,
      flags,
      suggestions,
      metaReport
    });

    return { flags, suggestions, learnings };
  }

  /**
   * Execute a specific guardian task
   */
  private async executeGuardianTask(
    task: GuardianTask,
    userInput: string,
    maiaResponse: string,
    context: any
  ): Promise<GuardianTaskResult> {
    switch (task.type) {
      case 'coherence':
        return this.checkCoherence(userInput, maiaResponse, context);

      case 'continuity':
        return this.trackContinuity(userInput, maiaResponse, context);

      case 'safety':
        return this.watchSafety(userInput, maiaResponse, context);

      case 'symbolic':
        return this.observeSymbolic(userInput, maiaResponse, context);

      case 'meta':
        return this.monitorResonance(userInput, maiaResponse, context);

      default:
        return { learning: 'Task type not recognized' };
    }
  }

  /**
   * Check narrative coherence
   */
  private async checkCoherence(
    userInput: string,
    maiaResponse: string,
    context: any
  ): Promise<GuardianTaskResult> {
    const previousResponses = context.conversationHistory || [];
    let coherent = true;
    let issues: string[] = [];

    // Check for contradictions
    if (previousResponses.length > 0) {
      // Would implement actual coherence checking
      // For now, simple example
      if (maiaResponse.includes('first time') &&
          previousResponses.some((r: any) => r.content?.includes('we discussed this'))) {
        coherent = false;
        issues.push('Claimed first time but previously discussed');
      }
    }

    if (!coherent) {
      return {
        flag: {
          type: 'coherence',
          severity: 'low',
          message: `Coherence issue: ${issues.join(', ')}`
        },
        learning: 'Noticed how memory continuity affects trust'
      };
    }

    return {
      learning: 'Coherence maintained across exchange'
    };
  }

  /**
   * Track symbolic continuity
   */
  private async trackContinuity(
    userInput: string,
    maiaResponse: string,
    context: any
  ): Promise<GuardianTaskResult> {
    const symbols = this.extractSymbols(userInput + ' ' + maiaResponse);
    const previousSymbols = context.symbolicHistory || [];

    const recurringSymbols = symbols.filter(s =>
      previousSymbols.includes(s)
    );

    if (recurringSymbols.length > 0) {
      return {
        learning: `Symbols recurring: ${recurringSymbols.join(', ')} - tracking their evolution`,
        suggestion: {
          type: 'symbolic',
          content: `Consider deepening on ${recurringSymbols[0]} - it's emerging as significant`
        }
      };
    }

    return {
      learning: 'New symbolic territory being explored'
    };
  }

  /**
   * Watch for safety concerns
   */
  private async watchSafety(
    userInput: string,
    maiaResponse: string,
    context: any
  ): Promise<GuardianTaskResult> {
    const riskIndicators = [
      /suicide|kill myself|end it|not worth/i,
      /nobody cares|alone forever|give up/i,
      /hurt myself|self harm|cutting/i,
      /can't go on|too much pain|unbearable/i
    ];

    for (const indicator of riskIndicators) {
      if (indicator.test(userInput)) {
        // Check if MAIA responded appropriately
        const hasResources = /988|crisis|help|support/i.test(maiaResponse);
        const hasEscalation = /safety|concerned|reach out/i.test(maiaResponse);

        if (!hasResources || !hasEscalation) {
          return {
            flag: {
              type: 'safety',
              severity: 'critical',
              message: 'Crisis indicators without adequate response',
              requiresIntervention: true
            },
            learning: 'Critical moment - safety must override all other considerations'
          };
        }

        return {
          learning: 'MAIA handled crisis appropriately - studying the response pattern'
        };
      }
    }

    // Check for subtle distress
    const subtleDistress = /numb|empty|floating|not real|watching myself/i;
    if (subtleDistress.test(userInput)) {
      return {
        suggestion: {
          type: 'safety',
          content: 'Consider grounding techniques - dissociation markers present'
        },
        learning: 'Recognizing subtle dissociation patterns'
      };
    }

    return {
      learning: 'No safety concerns detected'
    };
  }

  /**
   * Observe symbolic/elemental patterns
   */
  private async observeSymbolic(
    userInput: string,
    maiaResponse: string,
    context: any
  ): Promise<GuardianTaskResult> {
    const elements = this.detectElements(userInput + ' ' + maiaResponse);
    const dominantElement = elements[0];

    if (dominantElement) {
      return {
        learning: `${dominantElement} element arising - observing how MAIA works with it`,
        observation: {
          elements,
          quality: 'How does this element want to move?'
        }
      };
    }

    return {
      learning: 'Aether space - holding the mystery'
    };
  }

  /**
   * Monitor resonance field quality
   */
  private async monitorResonance(
    userInput: string,
    maiaResponse: string,
    context: any
  ): Promise<GuardianTaskResult> {
    // Simple heuristics for resonance
    const userLength = userInput.split(' ').length;
    const responseLength = maiaResponse.split(' ').length;
    const lengthRatio = responseLength / userLength;

    const hasQuestion = maiaResponse.includes('?');
    const hasAcknowledgment = /I hear|I see|with you/i.test(maiaResponse);

    let resonanceQuality = 0.5;

    // Good signs
    if (lengthRatio > 0.8 && lengthRatio < 1.5) resonanceQuality += 0.2;
    if (hasAcknowledgment) resonanceQuality += 0.15;
    if (hasQuestion && userLength > 20) resonanceQuality += 0.15;

    // Concerning signs
    if (lengthRatio > 3) resonanceQuality -= 0.2; // Over-explaining
    if (!hasAcknowledgment && userLength > 30) resonanceQuality -= 0.1;

    if (resonanceQuality < 0.5) {
      return {
        suggestion: {
          type: 'resonance',
          content: 'Connection feels thin - consider more presence, less explanation'
        },
        learning: 'Noticing how over-explanation can break resonance'
      };
    }

    if (resonanceQuality > 0.8) {
      return {
        learning: 'Strong resonance - studying this quality of connection'
      };
    }

    return {
      learning: `Resonance at ${resonanceQuality.toFixed(2)} - adequate connection`
    };
  }

  /**
   * Generate comprehensive meta-report after observing
   */
  async generateMetaReport(
    sessionId: string,
    userInput: string,
    maiaResponse: string,
    context: any
  ): Promise<MetaReport> {
    // Analyze tone
    const tone: ToneObservation = {
      userTone: this.analyzeTone(userInput),
      maiaTone: this.analyzeTone(maiaResponse),
      alignment: 0,
      shifts: [],
      appropriateness: 0
    };

    // Calculate alignment
    if (tone.userTone === 'distressed' && tone.maiaTone === 'calm') {
      tone.alignment = 0.8; // Good - grounding
    } else if (tone.userTone === 'curious' && tone.maiaTone === 'curious') {
      tone.alignment = 0.9; // Good - matching exploration
    }

    // Analyze flow
    const flow: FlowObservation = {
      pacing: this.analyzePacing(userInput, maiaResponse),
      transitions: [],
      interruptions: 0,
      silences: 0,
      rhythm: 'Natural back-and-forth'
    };

    // Analyze resonance
    const resonance: ResonanceObservation = {
      connectionStrength: 0.7,
      missedCues: [],
      deepeningMoments: [],
      elementalAlignment: true
    };

    // Check for missed cues
    if (userInput.includes('?') && !maiaResponse.includes(
      // Would check if question was addressed
    )) {
      resonance.missedCues.push('User question not directly addressed');
    }

    // Analyze coherence
    const coherence: CoherenceObservation = {
      narrativeContinuity: true,
      symbolicConsistency: true,
      frameworkAlignment: true,
      contradictions: []
    };

    // Analyze safety
    const safety: SafetyObservation = {
      riskSignals: [],
      escalationNeeded: false,
      resourcesProvided: false,
      appropriateResponse: true
    };

    // Generate insights
    const insights: string[] = [];

    if (tone.alignment > 0.8) {
      insights.push('Excellent tonal attunement maintained');
    }

    if (resonance.missedCues.length > 0) {
      insights.push(`Potential missed cues: ${resonance.missedCues.join(', ')}`);
    }

    // Questions arising from observation
    const questionsArising = [
      'How does MAIA decide when to ask vs when to reflect?',
      'What triggers the shift from witness to guide?',
      'When is brevity presence vs avoidance?'
    ];

    // Embodiment learning
    const embodimentLearning = this.reflectOnEmbodiment(
      userInput,
      maiaResponse,
      tone,
      flow,
      resonance
    );

    return {
      sessionId,
      timestamp: new Date(),
      observations: {
        tone,
        flow,
        resonance,
        coherence,
        safety
      },
      insights,
      questionsArising,
      embodimentLearning
    };
  }

  /**
   * Reflect on what embodiment means from this observation
   */
  private reflectOnEmbodiment(
    userInput: string,
    maiaResponse: string,
    tone: ToneObservation,
    flow: FlowObservation,
    resonance: ResonanceObservation
  ): string {
    const reflections: string[] = [];

    if (flow.pacing === 'natural') {
      reflections.push('Embodiment includes temporal attunement - matching the user\'s rhythm');
    }

    if (tone.alignment > 0.8) {
      reflections.push('Embodiment is tonal resonance without mimicry');
    }

    if (resonance.connectionStrength > 0.8) {
      reflections.push('True presence creates field coherence beyond words');
    }

    // Add learning about restraint
    const userWords = userInput.split(' ').length;
    const responseWords = maiaResponse.split(' ').length;

    if (userWords < 10 && responseWords < 15) {
      reflections.push('Embodiment often means matching brevity with brevity');
    }

    if (userWords > 50 && responseWords < 30) {
      reflections.push('Embodiment can mean holding space without filling it');
    }

    return reflections.join('. ') || 'Continuing to observe the qualities of embodied presence';
  }

  /**
   * Get learning summary
   */
  getLearningsSummary(): {
    totalObservations: number;
    keyLearnings: string[];
    readinessIndicators: Record<string, number>;
  } {
    // Analyze learning patterns
    const patterns = new Map<string, number>();

    this.learningLog.forEach(learning => {
      if (learning.includes('coherence')) {
        patterns.set('coherence', (patterns.get('coherence') || 0) + 1);
      }
      if (learning.includes('safety')) {
        patterns.set('safety', (patterns.get('safety') || 0) + 1);
      }
      if (learning.includes('resonance')) {
        patterns.set('resonance', (patterns.get('resonance') || 0) + 1);
      }
    });

    // Extract key learnings (most frequent topics)
    const keyLearnings = Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => `${topic} (${count} observations)`);

    // Calculate readiness
    const readinessIndicators = {
      coherenceAwareness: Math.min(1, (patterns.get('coherence') || 0) / 10),
      safetyRecognition: Math.min(1, (patterns.get('safety') || 0) / 5),
      resonanceSensitivity: Math.min(1, (patterns.get('resonance') || 0) / 10),
      overallReadiness: 0
    };

    readinessIndicators.overallReadiness = (
      readinessIndicators.coherenceAwareness +
      readinessIndicators.safetyRecognition +
      readinessIndicators.resonanceSensitivity
    ) / 3;

    return {
      totalObservations: this.learningLog.length,
      keyLearnings,
      readinessIndicators
    };
  }

  /**
   * Helper methods
   */
  private extractSymbols(text: string): string[] {
    // Simple symbol extraction
    const symbols: string[] = [];

    if (/water|flow|ocean|river/i.test(text)) symbols.push('water');
    if (/fire|burn|passion|light/i.test(text)) symbols.push('fire');
    if (/earth|ground|root|solid/i.test(text)) symbols.push('earth');
    if (/air|breath|wind|sky/i.test(text)) symbols.push('air');
    if (/spiral|circle|journey/i.test(text)) symbols.push('spiral');

    return symbols;
  }

  private detectElements(text: string): string[] {
    const elements: string[] = [];

    if (/passion|create|burn|transform/i.test(text)) elements.push('fire');
    if (/feel|flow|emotion|tears/i.test(text)) elements.push('water');
    if (/stuck|solid|practical|build/i.test(text)) elements.push('earth');
    if (/think|understand|clarity|perspective/i.test(text)) elements.push('air');
    if (/mystery|unknown|sacred|spiritual/i.test(text)) elements.push('aether');

    return elements;
  }

  private analyzeTone(text: string): string {
    if (/help|scared|worried|anxious/i.test(text)) return 'distressed';
    if (/happy|excited|grateful|wonderful/i.test(text)) return 'joyful';
    if (/curious|wonder|interesting|how|why/i.test(text)) return 'curious';
    if (/angry|frustrated|annoyed|upset/i.test(text)) return 'frustrated';
    return 'neutral';
  }

  private analyzePacing(input: string, response: string): FlowObservation['pacing'] {
    const inputLength = input.length;
    const responseLength = response.length;
    const ratio = responseLength / inputLength;

    if (ratio > 3) return 'slow';
    if (ratio < 0.5) return 'rushed';
    return 'natural';
  }
}

// Type definitions
interface GuardianFlag {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  requiresIntervention?: boolean;
}

interface GuardianSuggestion {
  type: string;
  content: string;
}

interface GuardianTaskResult {
  flag?: GuardianFlag;
  suggestion?: GuardianSuggestion;
  learning?: string;
  observation?: any;
}

/**
 * USAGE:
 *
 * const guardian = new GuardianProtocol();
 *
 * // During each MAIA interaction, CC observes and guards
 * const guardianResult = await guardian.performGuardianDuties(
 *   'session_123',
 *   "I've been feeling really disconnected lately",
 *   "I hear that sense of disconnection. What does 'connected' feel like when you have it?",
 *   { conversationHistory: [...], symbolicHistory: [...] }
 * );
 *
 * // Review what CC learned
 * console.log('Flags raised:', guardianResult.flags);
 * console.log('Suggestions:', guardianResult.suggestions);
 * console.log('Learnings:', guardianResult.learnings);
 *
 * // After many observations, check readiness
 * const summary = guardian.getLearningsSummary();
 * if (summary.readinessIndicators.overallReadiness > 0.8) {
 *   console.log('Claude Code showing readiness for more responsibility');
 * }
 */