/**
 * Pattern Awareness Module
 * Detects loops, trajectories, and energetic patterns in real-time
 */

import { CompressedFacetState, FacetTransition } from '@/lib/spiralogic/types';
import { LoopPattern } from '../types/MayaContext';

interface PatternFlags {
  needsGrounding: boolean;
  seekingClarity: boolean;
  avoidingDepth: boolean;
  readyForTransition: boolean;
  integrationPhase: boolean;
}

interface PatternDetectionResult {
  loops: LoopPattern[];
  flags: PatternFlags;
  coherence: number;
  trajectory: string;
  dominantPattern: string;
}

export class PatternAwarenessModule {
  private readonly LOOP_THRESHOLD = 3; // Cycles before considered a loop
  private readonly COHERENCE_WINDOW = 5; // Transitions to analyze for coherence

  /**
   * Detect all active patterns from state and transitions
   */
  async detectPatterns(
    state: CompressedFacetState,
    transitions: FacetTransition[]
  ): Promise<PatternDetectionResult> {
    const loops = this.detectLoops(transitions);
    const coherence = this.calculateCoherence(transitions);
    const flags = this.analyzePatternFlags(state, transitions, loops, coherence);
    const trajectory = this.determineTrajectory(transitions);
    const dominantPattern = this.identifyDominantPattern(loops, flags, trajectory);

    return {
      loops,
      flags,
      coherence,
      trajectory,
      dominantPattern
    };
  }

  /**
   * Detect looping patterns in transitions
   */
  private detectLoops(transitions: FacetTransition[]): LoopPattern[] {
    const loops: LoopPattern[] = [];
    const facetCycles = new Map<string, number>();
    const elementCycles = new Map<string, number>();

    // Track repeated visits to facets and elements
    for (let i = 0; i < transitions.length; i++) {
      const transition = transitions[i];

      // Count facet visits
      const facetKey = `${transition.fromFacet}-${transition.toFacet}`;
      facetCycles.set(facetKey, (facetCycles.get(facetKey) || 0) + 1);

      // Count element visits
      const elementKey = `${transition.fromElement}-${transition.toElement}`;
      elementCycles.set(elementKey, (elementCycles.get(elementKey) || 0) + 1);
    }

    // Identify loops exceeding threshold
    facetCycles.forEach((count, key) => {
      if (count >= this.LOOP_THRESHOLD) {
        const [from, to] = key.split('-');
        loops.push({
          facetId: to,
          element: this.getElementForFacet(to),
          cycleCount: count,
          duration: this.calculateLoopDuration(transitions, key),
          intensity: count / transitions.length,
          needsAttention: count > this.LOOP_THRESHOLD + 2
        });
      }
    });

    return loops;
  }

  /**
   * Calculate coherence of transitions
   */
  private calculateCoherence(transitions: FacetTransition[]): number {
    if (transitions.length < 2) return 0.5;

    let coherenceScore = 0;
    const recentTransitions = transitions.slice(-this.COHERENCE_WINDOW);

    // Check for elemental progression coherence
    const elementFlow = recentTransitions.map(t => t.toElement);
    const uniqueElements = new Set(elementFlow).size;
    const elementCoherence = 1 - (uniqueElements / elementFlow.length);
    coherenceScore += elementCoherence * 0.4;

    // Check for intensity stability
    const intensities = recentTransitions.map(t => t.intensity || 0.5);
    const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance = intensities.reduce((sum, i) => sum + Math.pow(i - avgIntensity, 2), 0) / intensities.length;
    const intensityCoherence = 1 - Math.min(1, variance * 2);
    coherenceScore += intensityCoherence * 0.3;

    // Check for directional consistency
    const directions = this.analyzeDirections(recentTransitions);
    const directionCoherence = directions.consistency;
    coherenceScore += directionCoherence * 0.3;

    return Math.min(1, Math.max(0, coherenceScore));
  }

  /**
   * Analyze pattern flags
   */
  private analyzePatternFlags(
    state: CompressedFacetState,
    transitions: FacetTransition[],
    loops: LoopPattern[],
    coherence: number
  ): PatternFlags {
    const recentTransitions = transitions.slice(-3);
    const currentElement = this.getCurrentElement(state);

    return {
      needsGrounding: this.detectNeedsGrounding(currentElement, coherence),
      seekingClarity: this.detectSeekingClarity(recentTransitions, coherence),
      avoidingDepth: this.detectAvoidingDepth(transitions, loops),
      readyForTransition: this.detectReadyForTransition(state, transitions, coherence),
      integrationPhase: this.detectIntegrationPhase(state, transitions)
    };
  }

  /**
   * Determine trajectory from transitions
   */
  private determineTrajectory(transitions: FacetTransition[]): string {
    if (transitions.length < 2) return 'stable';

    const elements = transitions.map(t => t.toElement);
    const elementProgression = this.analyzeElementProgression(elements);

    if (elementProgression.ascending) return 'ascending';
    if (elementProgression.descending) return 'descending';
    if (elementProgression.cycling) return 'cycling';
    if (elementProgression.deepening) return 'deepening';

    return 'exploring';
  }

  /**
   * Identify dominant pattern
   */
  private identifyDominantPattern(
    loops: LoopPattern[],
    flags: PatternFlags,
    trajectory: string
  ): string {
    // Priority order for patterns
    if (loops.length > 0 && loops[0].needsAttention) {
      return `loop:${loops[0].element}`;
    }

    if (flags.integrationPhase) return 'integration';
    if (flags.readyForTransition) return 'transition-ready';
    if (flags.avoidingDepth) return 'surface-dancing';
    if (flags.seekingClarity) return 'clarity-seeking';
    if (flags.needsGrounding) return 'grounding-needed';

    return `trajectory:${trajectory}`;
  }

  /**
   * Record pattern shift for learning
   */
  async recordPatternShift(userId: string, pattern: string): Promise<void> {
    // Store pattern shift for future analysis
    console.log(`Pattern shift recorded for ${userId}: ${pattern}`);
    // This would store in database for pattern learning
  }

  // Helper methods
  private getElementForFacet(facet: string): string {
    // Map facets to elements (simplified)
    const facetElements: Record<string, string> = {
      hero: 'fire',
      shadow: 'water',
      sage: 'air',
      innocent: 'earth',
      explorer: 'air',
      rebel: 'fire',
      lover: 'water',
      creator: 'fire',
      jester: 'air',
      caregiver: 'earth',
      ruler: 'earth',
      magician: 'aether'
    };
    return facetElements[facet.toLowerCase()] || 'aether';
  }

  private calculateLoopDuration(transitions: FacetTransition[], pattern: string): number {
    // Calculate time spent in loop pattern
    let duration = 0;
    transitions.forEach(t => {
      const key = `${t.fromFacet}-${t.toFacet}`;
      if (key === pattern) {
        duration += t.duration || 5; // Default 5 minutes
      }
    });
    return duration;
  }

  private analyzeDirections(transitions: FacetTransition[]): { consistency: number } {
    if (transitions.length < 2) return { consistency: 0.5 };

    const directions = transitions.map(t => t.direction || 'neutral');
    const primaryDirection = this.mostFrequent(directions);
    const consistency = directions.filter(d => d === primaryDirection).length / directions.length;

    return { consistency };
  }

  private getCurrentElement(state: CompressedFacetState): string {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    let maxPresence = 0;
    let currentElement = 'aether';

    elements.forEach(element => {
      const presence = state[element as keyof CompressedFacetState] || 0;
      if (presence > maxPresence) {
        maxPresence = presence;
        currentElement = element;
      }
    });

    return currentElement;
  }

  private detectNeedsGrounding(element: string, coherence: number): boolean {
    // Air and Fire with low coherence need grounding
    return (element === 'air' || element === 'fire') && coherence < 0.4;
  }

  private detectSeekingClarity(transitions: FacetTransition[], coherence: number): boolean {
    if (transitions.length < 2) return false;

    // Many transitions with low coherence indicates seeking
    const transitionRate = transitions.length / 10; // Assuming 10 min window
    return transitionRate > 0.5 && coherence < 0.5;
  }

  private detectAvoidingDepth(transitions: FacetTransition[], loops: LoopPattern[]): boolean {
    // Surface loops or rapid transitions indicate avoidance
    const hasSuperficialLoops = loops.some(l => l.element === 'air' && l.cycleCount > 2);
    const rapidTransitions = transitions.length > 5 &&
      transitions.every(t => (t.intensity || 0.5) < 0.3);

    return hasSuperficialLoops || rapidTransitions;
  }

  private detectReadyForTransition(
    state: CompressedFacetState,
    transitions: FacetTransition[],
    coherence: number
  ): boolean {
    if (transitions.length < 3) return false;

    // High coherence with stable intensity indicates readiness
    const recentIntensities = transitions.slice(-3).map(t => t.intensity || 0.5);
    const avgIntensity = recentIntensities.reduce((a, b) => a + b, 0) / recentIntensities.length;

    return coherence > 0.7 && avgIntensity > 0.6;
  }

  private detectIntegrationPhase(
    state: CompressedFacetState,
    transitions: FacetTransition[]
  ): boolean {
    if (transitions.length < 4) return false;

    // Integration shows as visiting multiple elements with decreasing intensity
    const recentElements = transitions.slice(-4).map(t => t.toElement);
    const uniqueElements = new Set(recentElements).size;
    const decreasingIntensity = this.checkDecreasingIntensity(transitions.slice(-4));

    return uniqueElements >= 3 && decreasingIntensity;
  }

  private analyzeElementProgression(elements: string[]): any {
    const naturalOrder = ['water', 'earth', 'fire', 'air', 'aether'];
    let ascending = 0, descending = 0, same = 0;

    for (let i = 1; i < elements.length; i++) {
      const prev = naturalOrder.indexOf(elements[i - 1]);
      const curr = naturalOrder.indexOf(elements[i]);

      if (curr > prev) ascending++;
      else if (curr < prev) descending++;
      else same++;
    }

    return {
      ascending: ascending > descending && ascending > same,
      descending: descending > ascending && descending > same,
      cycling: same > ascending && same > descending,
      deepening: Math.abs(ascending - descending) < 2
    };
  }

  private mostFrequent<T>(arr: T[]): T {
    const frequency = new Map<T, number>();
    arr.forEach(item => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });

    let maxFreq = 0;
    let mostFrequent = arr[0];
    frequency.forEach((freq, item) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        mostFrequent = item;
      }
    });

    return mostFrequent;
  }

  private checkDecreasingIntensity(transitions: FacetTransition[]): boolean {
    const intensities = transitions.map(t => t.intensity || 0.5);
    let decreasing = 0;

    for (let i = 1; i < intensities.length; i++) {
      if (intensities[i] < intensities[i - 1]) decreasing++;
    }

    return decreasing > intensities.length / 2;
  }
}

// Export singleton instance
export const patternAwarenessModule = new PatternAwarenessModule();