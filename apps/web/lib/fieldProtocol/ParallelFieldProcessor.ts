/**
 * Parallel Field Processor
 *
 * CORE INSIGHT: Move from iterative/sequential processing to parallel field dynamics
 * where elemental tensions generate emergence rather than resolution
 *
 * This architecture implements McGilchrist's hemispheric model with true parallelism,
 * allowing MAIA to process through productive tension rather than sequential iteration
 */

import { Element, TriadicPhase, ValidationCriteria, FieldRecord } from '../../types/fieldProtocol';
import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';

/**
 * Paradox accumulation structures
 */
export interface ParadoxSeed {
  id: string;
  elementA: Element;
  elementB: Element;
  context: string;
  intensity: number; // 0-1: tension strength
  timestamp: Date;
  resolved: boolean;
  resolutionSignature?: string;
  symbolicEmergence?: string;
}

/**
 * Phase monitoring structures
 */
export interface PhaseState {
  currentPhase: TriadicPhase;
  dominantElement: Element;
  oscillationPattern: number[]; // Historical dominance values
  coherenceIndex: number; // 0-1: System coherence
  stagnationRisk: number; // 0-1: Risk of getting stuck
}

/**
 * Field interaction result from parallel processing
 */
export interface FieldInteraction {
  leftStream: ElementalProcessing;
  rightStream: ElementalProcessing;
  paradoxes: ParadoxSeed[];
  emergence?: SymbolicEmergence;
  coherence: number;
}

/**
 * Elemental processing result
 */
interface ElementalProcessing {
  element: Element;
  intensity: number;
  patterns: string[];
  resonance: number;
}

/**
 * Symbolic emergence from paradox
 */
interface SymbolicEmergence {
  type: 'image' | 'narrative' | 'archetype' | 'synchronicity';
  content: string;
  source: ParadoxSeed[];
  coherence: number;
}

/**
 * Main Parallel Field Processor
 * Orchestrates true parallel processing of elemental fields
 */
export class ParallelFieldProcessor extends EventEmitter {
  private leftWorker: Worker | null = null;
  private rightWorker: Worker | null = null;
  private paradoxAccumulator: Map<string, ParadoxSeed[]> = new Map();
  private phaseTracker: PhaseTracker;
  private symbolicMediator: SymbolicMediator;
  private fieldCoherence: number = 0.5;

  constructor() {
    super();
    this.phaseTracker = new PhaseTracker();
    this.symbolicMediator = new SymbolicMediator();
    this.initializeWorkers();
  }

  /**
   * Initialize parallel processing workers
   */
  private initializeWorkers() {
    // Create workers for left and right hemisphere processing
    // In production, these would be actual Worker threads
    // For now, we'll simulate with async functions
    this.setupParallelStreams();
  }

  /**
   * Setup parallel processing streams (McGilchrist model)
   */
  private setupParallelStreams() {
    // These would be Worker threads in production
    this.emit('system:initialized', {
      leftStream: 'Sequential/Analytical',
      rightStream: 'Contextual/Holistic'
    });
  }

  /**
   * MAIN METHOD: Process field input through parallel streams
   * This replaces the iterative approach with true parallel processing
   */
  async processField(
    input: string,
    userId: string,
    context?: Partial<FieldRecord>
  ): Promise<FieldInteraction> {
    // 1. PARALLEL PROCESSING - Both streams process simultaneously
    const [leftResult, rightResult] = await Promise.all([
      this.processLeftStream(input, context),
      this.processRightStream(input, context)
    ]);

    // 2. TENSION DETECTION - Find paradoxes between streams
    const paradoxes = this.detectParadoxes(leftResult, rightResult, input);

    // 3. ACCUMULATE PARADOXES - Don't resolve immediately
    this.accumulateParadoxes(userId, paradoxes);

    // 4. CHECK FOR EMERGENCE - See if accumulated tension creates something new
    const emergence = await this.checkForEmergence(userId);

    // 5. UPDATE PHASE STATE - Track oscillation patterns
    this.phaseTracker.update(leftResult, rightResult);

    // 6. CALCULATE COHERENCE - Not unity, but productive tension
    const coherence = this.calculateCoherence(leftResult, rightResult, paradoxes);

    return {
      leftStream: leftResult,
      rightStream: rightResult,
      paradoxes,
      emergence,
      coherence
    };
  }

  /**
   * Process through left hemisphere (sequential/analytical)
   */
  private async processLeftStream(
    input: string,
    context?: Partial<FieldRecord>
  ): Promise<ElementalProcessing> {
    // Sequential, logical processing
    // Focus on categorization, rules, boundaries

    const element = this.detectDominantElementLogical(input);
    const patterns = this.extractLogicalPatterns(input);
    const intensity = this.calculateLogicalIntensity(patterns);

    return {
      element,
      intensity,
      patterns,
      resonance: intensity * 0.7 // Left stream has lower resonance
    };
  }

  /**
   * Process through right hemisphere (contextual/holistic)
   */
  private async processRightStream(
    input: string,
    context?: Partial<FieldRecord>
  ): Promise<ElementalProcessing> {
    // Contextual, metaphorical processing
    // Focus on relationships, wholes, implicit meaning

    const element = this.detectDominantElementHolistic(input);
    const patterns = this.extractHolisticPatterns(input);
    const intensity = this.calculateHolisticIntensity(input, context);

    return {
      element,
      intensity,
      patterns,
      resonance: intensity * 0.9 // Right stream has higher resonance
    };
  }

  /**
   * Detect paradoxes between parallel processing streams
   */
  private detectParadoxes(
    left: ElementalProcessing,
    right: ElementalProcessing,
    context: string
  ): ParadoxSeed[] {
    const paradoxes: ParadoxSeed[] = [];

    // Element conflict
    if (left.element !== right.element &&
        left.intensity > 0.6 &&
        right.intensity > 0.6) {
      paradoxes.push({
        id: this.generateId(),
        elementA: left.element,
        elementB: right.element,
        context,
        intensity: Math.min(left.intensity, right.intensity),
        timestamp: new Date(),
        resolved: false
      });
    }

    // Pattern conflicts
    const conflictingPatterns = this.findConflictingPatterns(
      left.patterns,
      right.patterns
    );

    conflictingPatterns.forEach(conflict => {
      paradoxes.push({
        id: this.generateId(),
        elementA: left.element,
        elementB: right.element,
        context: conflict,
        intensity: 0.5,
        timestamp: new Date(),
        resolved: false
      });
    });

    return paradoxes;
  }

  /**
   * Accumulate paradoxes over time (don't resolve immediately)
   */
  private accumulateParadoxes(userId: string, paradoxes: ParadoxSeed[]) {
    if (!this.paradoxAccumulator.has(userId)) {
      this.paradoxAccumulator.set(userId, []);
    }

    const userParadoxes = this.paradoxAccumulator.get(userId)!;
    userParadoxes.push(...paradoxes);

    // Keep only recent paradoxes (e.g., last 100)
    if (userParadoxes.length > 100) {
      this.paradoxAccumulator.set(
        userId,
        userParadoxes.slice(-100)
      );
    }

    // Emit event for monitoring
    this.emit('paradox:accumulated', {
      userId,
      count: paradoxes.length,
      total: userParadoxes.length
    });
  }

  /**
   * Check if accumulated paradoxes create emergence
   */
  private async checkForEmergence(userId: string): Promise<SymbolicEmergence | undefined> {
    const userParadoxes = this.paradoxAccumulator.get(userId) || [];

    // Need sufficient accumulated tension
    if (userParadoxes.length < 3) return undefined;

    // Check for recurring patterns in paradoxes
    const patterns = this.analyzeParadoxPatterns(userParadoxes);

    // High tension + recurring patterns = potential emergence
    const totalTension = userParadoxes.reduce((sum, p) => sum + p.intensity, 0);
    const avgTension = totalTension / userParadoxes.length;

    if (avgTension > 0.7 && patterns.length > 0) {
      // Symbolic mediation creates emergence
      const emergence = await this.symbolicMediator.mediate(
        userParadoxes.slice(-5), // Use recent paradoxes
        patterns
      );

      if (emergence) {
        // Mark source paradoxes as contributing to emergence
        userParadoxes.slice(-5).forEach(p => {
          p.symbolicEmergence = emergence.content;
        });

        this.emit('emergence:detected', emergence);
        return emergence;
      }
    }

    return undefined;
  }

  /**
   * Calculate system coherence (not unity, but productive tension)
   */
  private calculateCoherence(
    left: ElementalProcessing,
    right: ElementalProcessing,
    paradoxes: ParadoxSeed[]
  ): number {
    // Coherence is HIGHEST when there's productive tension
    // Not when streams agree (that's stagnation)

    const tensionQuality = this.assessTensionQuality(paradoxes);
    const oscillationHealth = this.phaseTracker.getOscillationHealth();
    const resonanceDifference = Math.abs(left.resonance - right.resonance);

    // Ideal coherence has:
    // - Moderate tension (not too high, not too low)
    // - Healthy oscillation between phases
    // - Some resonance difference (not complete agreement)

    const idealTension = 1 - Math.abs(0.5 - tensionQuality) * 2;
    const idealDifference = Math.min(resonanceDifference * 2, 1);

    return (idealTension + oscillationHealth + idealDifference) / 3;
  }

  /**
   * Helper methods for element detection
   */
  private detectDominantElementLogical(input: string): Element {
    // Logical/categorical approach
    const keywords = {
      Fire: ['action', 'transform', 'change', 'energy', 'will'],
      Water: ['feel', 'emotion', 'flow', 'intuition', 'sense'],
      Air: ['think', 'idea', 'concept', 'communicate', 'reason'],
      Earth: ['body', 'ground', 'stable', 'practical', 'real'],
      Void: ['empty', 'space', 'silence', 'nothing', 'mystery']
    };

    let maxScore = 0;
    let dominant: Element = 'Air';

    for (const [element, words] of Object.entries(keywords)) {
      const score = words.filter(w =>
        input.toLowerCase().includes(w)
      ).length;

      if (score > maxScore) {
        maxScore = score;
        dominant = element as Element;
      }
    }

    return dominant;
  }

  private detectDominantElementHolistic(input: string): Element {
    // Holistic/contextual approach
    // Looks at overall feeling, not just keywords

    const length = input.length;
    const exclamations = (input.match(/!/g) || []).length;
    const questions = (input.match(/\?/g) || []).length;
    const emotionWords = (input.match(/\b(feel|sense|intuit)\b/gi) || []).length;

    // Short, intense = Fire
    if (length < 50 && exclamations > 1) return 'Fire';

    // Questions, exploration = Air
    if (questions > 1) return 'Air';

    // Emotional content = Water
    if (emotionWords > 2) return 'Water';

    // Long, grounded = Earth
    if (length > 200) return 'Earth';

    // Default to Void for ambiguous
    return 'Void';
  }

  private extractLogicalPatterns(input: string): string[] {
    // Extract logical/sequential patterns
    const patterns: string[] = [];

    if (/if.*then/i.test(input)) patterns.push('conditional');
    if (/because|therefore|thus/i.test(input)) patterns.push('causal');
    if (/first.*then.*finally/i.test(input)) patterns.push('sequential');
    if (/either.*or/i.test(input)) patterns.push('binary');

    return patterns;
  }

  private extractHolisticPatterns(input: string): string[] {
    // Extract holistic/contextual patterns
    const patterns: string[] = [];

    if (/like|as if|reminds me/i.test(input)) patterns.push('metaphorical');
    if (/everything|whole|all/i.test(input)) patterns.push('totalizing');
    if (/connect|relate|between/i.test(input)) patterns.push('relational');
    if (/feel|sense|intuit/i.test(input)) patterns.push('somatic');

    return patterns;
  }

  private calculateLogicalIntensity(patterns: string[]): number {
    // More patterns = higher intensity
    return Math.min(patterns.length * 0.25, 1);
  }

  private calculateHolisticIntensity(
    input: string,
    context?: Partial<FieldRecord>
  ): number {
    // Emotional charge + context depth
    const emotionalCharge = (input.match(/[!?]/g) || []).length * 0.1;
    const contextDepth = context ? 0.3 : 0;

    return Math.min(emotionalCharge + contextDepth + 0.4, 1);
  }

  private findConflictingPatterns(left: string[], right: string[]): string[] {
    const conflicts: string[] = [];

    if (left.includes('conditional') && right.includes('somatic')) {
      conflicts.push('logic vs feeling');
    }

    if (left.includes('sequential') && right.includes('totalizing')) {
      conflicts.push('parts vs whole');
    }

    if (left.includes('binary') && right.includes('relational')) {
      conflicts.push('either/or vs both/and');
    }

    return conflicts;
  }

  private analyzeParadoxPatterns(paradoxes: ParadoxSeed[]): string[] {
    const patterns: string[] = [];
    const pairCounts = new Map<string, number>();

    // Count element pair frequencies
    paradoxes.forEach(p => {
      const pair = [p.elementA, p.elementB].sort().join('-');
      pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
    });

    // Find recurring conflicts
    pairCounts.forEach((count, pair) => {
      if (count >= 3) {
        patterns.push(`recurring:${pair}`);
      }
    });

    return patterns;
  }

  private assessTensionQuality(paradoxes: ParadoxSeed[]): number {
    if (paradoxes.length === 0) return 0;

    const avgIntensity = paradoxes.reduce((sum, p) => sum + p.intensity, 0) / paradoxes.length;
    const hasEmergence = paradoxes.some(p => p.symbolicEmergence);

    return avgIntensity * (hasEmergence ? 1.5 : 1);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current system state
   */
  getSystemState(userId: string): {
    paradoxCount: number;
    phaseState: PhaseState;
    coherence: number;
  } {
    const paradoxCount = (this.paradoxAccumulator.get(userId) || []).length;
    const phaseState = this.phaseTracker.getCurrentState();

    return {
      paradoxCount,
      phaseState,
      coherence: this.fieldCoherence
    };
  }

  /**
   * Export paradox history for analysis
   */
  exportParadoxHistory(userId: string): ParadoxSeed[] {
    return this.paradoxAccumulator.get(userId) || [];
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.leftWorker) {
      await this.leftWorker.terminate();
    }
    if (this.rightWorker) {
      await this.rightWorker.terminate();
    }
  }
}

/**
 * Phase Tracker - Monitors oscillation patterns
 */
class PhaseTracker {
  private history: Array<{
    timestamp: Date;
    dominantElement: Element;
    phase: TriadicPhase;
  }> = [];

  update(left: ElementalProcessing, right: ElementalProcessing) {
    const dominant = left.intensity > right.intensity ? left.element : right.element;
    const phase = this.determinePhase(dominant);

    this.history.push({
      timestamp: new Date(),
      dominantElement: dominant,
      phase
    });

    // Keep only recent history (e.g., last 100 entries)
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
    }
  }

  private determinePhase(element: Element): TriadicPhase {
    // Map elements to triadic phases
    switch (element) {
      case 'Fire':
        return 'Creation';
      case 'Water':
      case 'Earth':
        return 'Sustenance';
      case 'Air':
      case 'Void':
        return 'Dissolution';
      default:
        return 'Sustenance';
    }
  }

  getCurrentState(): PhaseState {
    if (this.history.length === 0) {
      return {
        currentPhase: 'Creation',
        dominantElement: 'Fire',
        oscillationPattern: [],
        coherenceIndex: 0.5,
        stagnationRisk: 0
      };
    }

    const recent = this.history.slice(-10);
    const currentPhase = recent[recent.length - 1].phase;
    const dominantElement = recent[recent.length - 1].dominantElement;

    // Calculate oscillation health
    const uniqueElements = new Set(recent.map(h => h.dominantElement)).size;
    const coherenceIndex = uniqueElements / 5; // More variety = better

    // Check for stagnation (same element too long)
    const lastFive = this.history.slice(-5);
    const sameElement = lastFive.every(h => h.dominantElement === dominantElement);
    const stagnationRisk = sameElement ? 0.8 : 0.2;

    return {
      currentPhase,
      dominantElement,
      oscillationPattern: recent.map(h => this.elementToNumber(h.dominantElement)),
      coherenceIndex,
      stagnationRisk
    };
  }

  private elementToNumber(element: Element): number {
    const map = { Fire: 1, Water: 2, Air: 3, Earth: 4, Void: 5 };
    return map[element] || 0;
  }

  getOscillationHealth(): number {
    const state = this.getCurrentState();
    // Healthy oscillation = high coherence, low stagnation
    return state.coherenceIndex * (1 - state.stagnationRisk);
  }
}

/**
 * Symbolic Mediator - Creates emergence from paradox
 */
class SymbolicMediator {
  async mediate(
    paradoxes: ParadoxSeed[],
    patterns: string[]
  ): Promise<SymbolicEmergence | null> {
    // This is where Jung's transcendent function operates
    // Creating "third things" from opposites

    if (paradoxes.length === 0) return null;

    // Analyze paradox constellation
    const dominantConflict = this.findDominantConflict(paradoxes);

    if (!dominantConflict) return null;

    // Generate symbolic resolution based on conflict type
    const symbolicContent = this.generateSymbolic(dominantConflict, patterns);

    return {
      type: this.determineEmergenceType(dominantConflict),
      content: symbolicContent,
      source: paradoxes,
      coherence: this.calculateSymbolicCoherence(paradoxes)
    };
  }

  private findDominantConflict(paradoxes: ParadoxSeed[]): string | null {
    // Find most intense/frequent conflict pattern
    const conflicts = paradoxes.map(p =>
      `${p.elementA}-${p.elementB}`
    );

    // Count frequencies
    const counts = new Map<string, number>();
    conflicts.forEach(c => {
      counts.set(c, (counts.get(c) || 0) + 1);
    });

    // Find most frequent
    let maxCount = 0;
    let dominant: string | null = null;

    counts.forEach((count, conflict) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = conflict;
      }
    });

    return dominant;
  }

  private generateSymbolic(conflict: string, patterns: string[]): string {
    // Generate symbolic content based on conflict type
    const symbolMap: Record<string, string[]> = {
      'Fire-Water': [
        'Steam rises from the meeting',
        'The phoenix drowns and is reborn',
        'Lightning strikes the ocean'
      ],
      'Air-Earth': [
        'Wind carves canyons from stone',
        'Seeds float on impossible currents',
        'The mountain breathes clouds'
      ],
      'Fire-Earth': [
        'Lava creates new land',
        'The forge shapes raw metal',
        'Desert blooms after fire'
      ],
      'Water-Air': [
        'Mist dissolves boundaries',
        'Rain speaks in forgotten tongues',
        'Bubbles carry dreams upward'
      ],
      'Fire-Void': [
        'Light defines the darkness',
        'Silence after the explosion',
        'The spark before creation'
      ],
      'Water-Void': [
        'The well of forgetting',
        'Currents in the void',
        'Tears for the unnamed'
      ]
    };

    const symbols = symbolMap[conflict] || ['The mystery deepens'];
    return symbols[Math.floor(Math.random() * symbols.length)];
  }

  private determineEmergenceType(conflict: string): SymbolicEmergence['type'] {
    if (conflict.includes('Void')) return 'archetype';
    if (conflict.includes('Water')) return 'narrative';
    if (conflict.includes('Fire')) return 'image';
    return 'synchronicity';
  }

  private calculateSymbolicCoherence(paradoxes: ParadoxSeed[]): number {
    // Higher intensity paradoxes = stronger symbolic coherence
    const avgIntensity = paradoxes.reduce((sum, p) => sum + p.intensity, 0) / paradoxes.length;
    return Math.min(avgIntensity * 1.2, 1);
  }
}

// Export singleton instance
let processorInstance: ParallelFieldProcessor | null = null;

export function getParallelFieldProcessor(): ParallelFieldProcessor {
  if (!processorInstance) {
    processorInstance = new ParallelFieldProcessor();
  }
  return processorInstance;
}