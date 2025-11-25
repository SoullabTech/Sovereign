/**
 * Context Compression Service
 * Efficiently compresses Spiralogic state for API token optimization
 */

import {
  MayaContext,
  CompressedMayaContext,
  ResponseDepth,
  TransitionMomentum,
  LoopPattern
} from '../types/MayaContext';
import { CompressedFacetState, FacetTransition } from '@/lib/spiralogic/types';

export class ContextCompressionService {
  /**
   * Compress full context to essential patterns for API efficiency
   */
  compress(context: MayaContext): CompressedMayaContext {
    return {
      stateFingerprint: this.generateStateFingerprint(context.spiralState),
      primaryPattern: this.identifyPrimaryPattern(context),
      depth: context.currentDepth,
      momentum: this.simplifyMomentum(context.momentum),
      attention: this.extractAttentionPoints(context),
      avoid: this.extractAvoidancePatterns(context),
      coherence: context.energetics.coherence,
      readiness: this.calculateReadiness(context)
    };
  }

  /**
   * Generate 64-byte fingerprint of spiral state
   */
  private generateStateFingerprint(state: CompressedFacetState): string {
    // Create a deterministic hash representing current position
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    const fingerprint: number[] = [];

    // Encode each element's presence (0-255)
    elements.forEach(element => {
      const presence = state[element as keyof CompressedFacetState] || 0;
      fingerprint.push(Math.floor(presence * 255));
    });

    // Encode dominant facets
    const dominantFacets = this.extractDominantFacets(state);
    dominantFacets.forEach((facet, i) => {
      if (i < 3) { // Top 3 facets
        fingerprint.push(this.facetToCode(facet));
      }
    });

    // Convert to base64 string
    return Buffer.from(fingerprint).toString('base64').slice(0, 64);
  }

  /**
   * Identify the primary pattern requiring attention
   */
  private identifyPrimaryPattern(context: MayaContext): string {
    // Check for loops first (highest priority)
    if (context.activeLoops.length > 0) {
      const dominantLoop = this.findDominantLoop(context.activeLoops);
      return `looping:${dominantLoop.element}:${dominantLoop.facetId}`;
    }

    // Check for transition readiness
    if (context.patterns.readyForTransition) {
      return `transition:${this.predictNextElement(context)}`;
    }

    // Check for integration needs
    if (context.patterns.integrationPhase) {
      return 'integration:active';
    }

    // Check for avoidance
    if (context.patterns.avoidingDepth) {
      return 'avoidance:depth';
    }

    // Default to current element exploration
    const currentElement = this.getCurrentDominantElement(context.spiralState);
    return `exploring:${currentElement}`;
  }

  /**
   * Simplify momentum to core direction
   */
  private simplifyMomentum(momentum: TransitionMomentum): 'rising' | 'falling' | 'stable' | 'cycling' {
    if (momentum.direction === 'circling') return 'cycling';
    if (momentum.speed < 0.2) return 'stable';
    if (momentum.direction === 'ascending') return 'rising';
    if (momentum.direction === 'descending') return 'falling';
    return 'cycling';
  }

  /**
   * Extract what needs attention
   */
  private extractAttentionPoints(context: MayaContext): string[] {
    const attention: string[] = [];

    // Loops need attention
    context.activeLoops
      .filter(loop => loop.needsAttention)
      .forEach(loop => {
        attention.push(`loop:${loop.element}`);
      });

    // Low coherence needs attention
    if (context.energetics.coherence < 0.3) {
      attention.push('coherence:low');
    }

    // Stuck patterns
    if (context.patterns.needsGrounding) {
      attention.push('grounding:needed');
    }

    // Seeking clarity
    if (context.patterns.seekingClarity) {
      attention.push('clarity:seeking');
    }

    return attention.slice(0, 3); // Max 3 attention points
  }

  /**
   * Extract patterns to avoid
   */
  private extractAvoidancePatterns(context: MayaContext): string[] {
    const avoid: string[] = [];

    if (context.patterns.avoidingDepth) {
      avoid.push('depth:premature');
    }

    if (context.energetics.openness < 0.3) {
      avoid.push('pushing:boundaries');
    }

    if (context.energetics.charge < -0.5) {
      avoid.push('intensity:high');
    }

    // Avoid elements in loops
    context.activeLoops.forEach(loop => {
      if (loop.cycleCount > 3) {
        avoid.push(`element:${loop.element}`);
      }
    });

    return avoid;
  }

  /**
   * Calculate overall readiness for transition/depth
   */
  private calculateReadiness(context: MayaContext): number {
    let readiness = 0.5; // Baseline

    // Positive factors
    if (context.patterns.readyForTransition) readiness += 0.2;
    if (context.energetics.coherence > 0.7) readiness += 0.15;
    if (context.energetics.openness > 0.7) readiness += 0.15;

    // Negative factors
    if (context.activeLoops.length > 0) readiness -= 0.2;
    if (context.patterns.avoidingDepth) readiness -= 0.15;
    if (context.energetics.charge < -0.5) readiness -= 0.15;

    return Math.max(0, Math.min(1, readiness));
  }

  /**
   * Expand compressed context back to usable form (for testing)
   */
  expand(compressed: CompressedMayaContext): Partial<MayaContext> {
    return {
      currentDepth: compressed.depth,
      patterns: {
        needsGrounding: compressed.attention.includes('grounding:needed'),
        seekingClarity: compressed.attention.includes('clarity:seeking'),
        avoidingDepth: compressed.avoid.includes('depth:premature'),
        readyForTransition: compressed.primaryPattern.startsWith('transition:'),
        integrationPhase: compressed.primaryPattern === 'integration:active'
      },
      energetics: {
        coherence: compressed.coherence,
        charge: 0, // Can't recover from compressed
        openness: compressed.readiness // Approximation
      }
    };
  }

  // Helper methods
  private extractDominantFacets(state: CompressedFacetState): string[] {
    // This would extract from the actual facet state
    // Simplified for now
    return ['hero', 'shadow', 'sage'];
  }

  private facetToCode(facet: string): number {
    // Convert facet name to numeric code
    const facetMap: Record<string, number> = {
      hero: 1, shadow: 2, sage: 3, innocent: 4,
      explorer: 5, rebel: 6, lover: 7, creator: 8,
      jester: 9, caregiver: 10, ruler: 11, magician: 12
    };
    return facetMap[facet.toLowerCase()] || 0;
  }

  private findDominantLoop(loops: LoopPattern[]): LoopPattern {
    return loops.reduce((dominant, current) => {
      const currentScore = current.cycleCount * current.intensity;
      const dominantScore = dominant.cycleCount * dominant.intensity;
      return currentScore > dominantScore ? current : dominant;
    });
  }

  private predictNextElement(context: MayaContext): string {
    // Predict based on recent transitions
    if (context.recentTransitions.length === 0) return 'unknown';

    const lastTransition = context.recentTransitions[context.recentTransitions.length - 1];

    // Simple elemental progression
    const progression: Record<string, string> = {
      water: 'earth',
      earth: 'fire',
      fire: 'air',
      air: 'aether',
      aether: 'water'
    };

    return progression[lastTransition.toElement] || 'unknown';
  }

  private getCurrentDominantElement(state: CompressedFacetState): string {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    let dominant = 'unknown';
    let maxPresence = 0;

    elements.forEach(element => {
      const presence = state[element as keyof CompressedFacetState] || 0;
      if (presence > maxPresence) {
        maxPresence = presence;
        dominant = element;
      }
    });

    return dominant;
  }
}

// Export singleton instance
export const contextCompressionService = new ContextCompressionService();