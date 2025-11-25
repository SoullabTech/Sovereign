/**
 * State Injection Middleware
 * Injects compressed Spiralogic state into every Maya API call
 */

import { NextRequest, NextResponse } from 'next/server';
import { contextCompressionService } from '../services/ContextCompressionService';
import { patternAwarenessModule } from '../modules/PatternAwarenessModule';
import { responseConstraintsEngine } from '../engines/ResponseConstraintsEngine';
import { spiralogicService } from '@/lib/services/SpiralogicCoreService';
import {
  MayaContext,
  MayaRequestContext,
  ResponseDepth,
  CompressedMayaContext
} from '../types/MayaContext';

export class StateInjectionMiddleware {
  /**
   * Inject context into Maya API requests
   */
  async injectContext(
    request: NextRequest,
    userId: string,
    sessionId: string
  ): Promise<MayaRequestContext> {
    try {
      // Get current spiral state
      const spiralState = await spiralogicService.getCurrentState(userId);

      // Get recent transitions
      const recentTransitions = await spiralogicService.getRecentTransitions(userId, 5);

      // Detect active patterns
      const patterns = await patternAwarenessModule.detectPatterns(
        spiralState,
        recentTransitions
      );

      // Get field resonance if applicable
      const fieldResonance = await this.getFieldResonance(userId);

      // Build full context
      const fullContext: MayaContext = {
        spiralState,
        recentTransitions,
        momentum: this.calculateMomentum(recentTransitions),
        activeLoops: patterns.loops,
        fieldResonance,
        sessionDepth: await this.getSessionDepth(sessionId),
        currentDepth: await this.determineResponseDepth(patterns, spiralState),
        patterns: patterns.flags,
        energetics: await this.calculateEnergetics(spiralState, patterns)
      };

      // Compress for API efficiency
      const compressed = contextCompressionService.compress(fullContext);

      // Generate constraints
      const constraints = responseConstraintsEngine.generateConstraints(
        fullContext,
        patterns
      );

      // Check for framework activation
      const frameworks = this.checkFrameworkActivation(fullContext);

      // Parse user message
      const body = await request.json();

      return {
        message: body.message || '',
        context: compressed,
        constraints,
        frameworks,
        sessionId,
        turnCount: await this.getTurnCount(sessionId),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error injecting context:', error);

      // Return minimal context on error
      return this.getMinimalContext(request, sessionId);
    }
  }

  /**
   * Process Maya's response and update state
   */
  async processResponse(
    response: any,
    context: MayaRequestContext,
    userId: string
  ): Promise<void> {
    try {
      // Extract state updates from response
      const stateUpdates = this.extractStateUpdates(response, context);

      if (stateUpdates.suggestedTransition) {
        await spiralogicService.recordTransition(
          userId,
          stateUpdates.suggestedTransition
        );
      }

      // Update session depth
      if (stateUpdates.depthShift) {
        await this.updateSessionDepth(
          context.sessionId,
          stateUpdates.depthShift
        );
      }

      // Record pattern shifts
      if (stateUpdates.patternShift) {
        await patternAwarenessModule.recordPatternShift(
          userId,
          stateUpdates.patternShift
        );
      }

      // Update energetics based on response
      await this.updateEnergetics(userId, response);

    } catch (error) {
      console.error('Error processing response:', error);
    }
  }

  /**
   * Calculate momentum from recent transitions
   */
  private calculateMomentum(transitions: any[]): any {
    if (transitions.length < 2) {
      return {
        direction: 'stable' as const,
        speed: 0,
        stability: 1
      };
    }

    // Analyze transition patterns
    const elements = transitions.map(t => t.toElement);
    const uniqueElements = new Set(elements).size;

    // Cycling if visiting same elements
    if (uniqueElements < transitions.length / 2) {
      return {
        direction: 'circling' as const,
        speed: 0.5,
        stability: 0.3
      };
    }

    // Check for directional movement
    const elementOrder = ['water', 'earth', 'fire', 'air', 'aether'];
    let ascending = 0;
    let descending = 0;

    for (let i = 1; i < transitions.length; i++) {
      const prev = elementOrder.indexOf(transitions[i - 1].toElement);
      const curr = elementOrder.indexOf(transitions[i].toElement);

      if (curr > prev) ascending++;
      if (curr < prev) descending++;
    }

    if (ascending > descending) {
      return {
        direction: 'ascending' as const,
        speed: ascending / transitions.length,
        stability: 0.7
      };
    } else if (descending > ascending) {
      return {
        direction: 'descending' as const,
        speed: descending / transitions.length,
        stability: 0.7
      };
    }

    return {
      direction: 'spiraling' as const,
      speed: 0.6,
      stability: 0.5
    };
  }

  /**
   * Determine appropriate response depth
   */
  private async determineResponseDepth(
    patterns: any,
    spiralState: any
  ): Promise<ResponseDepth> {
    // Start with exploratory
    let depth = ResponseDepth.EXPLORATORY;

    // Surface if avoiding depth
    if (patterns.flags.avoidingDepth) {
      return ResponseDepth.SURFACE;
    }

    // Deep if ready and coherent
    if (patterns.flags.readyForTransition && patterns.coherence > 0.7) {
      depth = ResponseDepth.DEEP;
    }

    // Integrative if in integration phase
    if (patterns.flags.integrationPhase) {
      depth = ResponseDepth.INTEGRATIVE;
    }

    return depth;
  }

  /**
   * Calculate energetic qualities
   */
  private async calculateEnergetics(
    spiralState: any,
    patterns: any
  ): Promise<any> {
    // Simplified energetics calculation
    const coherence = patterns.coherence || 0.5;
    const charge = patterns.loops.length > 0 ? -0.3 : 0.3;
    const openness = patterns.flags.avoidingDepth ? 0.3 : 0.7;

    return { coherence, charge, openness };
  }

  /**
   * Get field resonance if applicable
   */
  private async getFieldResonance(userId: string): Promise<any | undefined> {
    // Check if collective patterns affect user
    // Simplified for now
    if (Math.random() > 0.8) { // 20% chance of field influence
      return {
        theme: 'collective-water-phase',
        resonanceStrength: 0.4,
        affectedElement: 'water',
        prevalence: 32
      };
    }
    return undefined;
  }

  /**
   * Check if frameworks should be activated
   */
  private checkFrameworkActivation(context: MayaContext): any | undefined {
    const activation = this.calculateActivation(context);

    if (activation > 0.7) {
      return {
        spiralPosition: {
          facet: 'current',
          element: 'current',
          intensity: 0.8
        },
        patternIndicators: Object.keys(context.patterns).filter(k => context.patterns[k as keyof typeof context.patterns]),
        activationThreshold: 0.7,
        currentActivation: activation,
        suggestedFrameworks: ['spiralogic-core', 'elemental-transitions']
      };
    }

    return undefined;
  }

  /**
   * Calculate framework activation level
   */
  private calculateActivation(context: MayaContext): number {
    let activation = 0;

    // Increase activation for certain conditions
    if (context.patterns.readyForTransition) activation += 0.3;
    if (context.patterns.integrationPhase) activation += 0.2;
    if (context.activeLoops.length > 0) activation += 0.2;
    if (context.sessionDepth > 5) activation += 0.1;
    if (context.energetics.coherence > 0.8) activation += 0.2;

    return Math.min(1, activation);
  }

  /**
   * Extract state updates from Maya's response
   */
  private extractStateUpdates(response: any, context: MayaRequestContext): any {
    // Parse response for state change indicators
    // This would use NLP or pattern matching
    // Simplified for now
    return {
      suggestedTransition: null,
      depthShift: null,
      patternShift: null
    };
  }

  /**
   * Get minimal context when full context fails
   */
  private async getMinimalContext(
    request: NextRequest,
    sessionId: string
  ): Promise<MayaRequestContext> {
    const body = await request.json();

    const minimal: CompressedMayaContext = {
      stateFingerprint: 'unknown',
      primaryPattern: 'exploring:unknown',
      depth: ResponseDepth.SURFACE,
      momentum: 'stable',
      attention: [],
      avoid: [],
      coherence: 0.5,
      readiness: 0.5
    };

    return {
      message: body.message || '',
      context: minimal,
      constraints: {
        holdSpace: true,
        mirrorOnly: false,
        offerDoorway: false,
        maintainPresence: true,
        maxDepth: ResponseDepth.EXPLORATORY,
        minDepth: ResponseDepth.SURFACE,
        avoidAnalysis: false,
        avoidAdvice: false,
        emphasizeFeeling: false,
        emphasizeBody: false,
        primaryElement: 'aether',
        responseLength: 'moderate'
      },
      sessionId,
      turnCount: 0,
      timestamp: new Date()
    };
  }

  // Session management helpers
  private async getSessionDepth(sessionId: string): Promise<number> {
    // Get from session store
    // Simplified: return moderate depth
    return 3;
  }

  private async getTurnCount(sessionId: string): Promise<number> {
    // Get from session store
    return 1;
  }

  private async updateSessionDepth(
    sessionId: string,
    depth: ResponseDepth
  ): Promise<void> {
    // Update session store
    console.log(`Session ${sessionId} depth updated to ${depth}`);
  }

  private async updateEnergetics(userId: string, response: any): Promise<void> {
    // Update user energetics based on response
    console.log(`Energetics updated for user ${userId}`);
  }
}

// Export singleton instance
export const stateInjectionMiddleware = new StateInjectionMiddleware();