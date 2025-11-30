/**
 * Claim Collector
 * Gathers signals from all subsystems before priority resolution
 * Each instrument reports what it wants to play
 */

import { OrchestrationClaim, OrchestrationDecision, resolvePriority } from './priorityResolver';
import { CatastrophicFailureGuard } from '../protocols/CatastrophicFailureGuard';
import { LoopingProtocolIntegration } from '../protocols/LoopingProtocolIntegration';
import { analyzeBoundaries } from '../protocols/BoundaryDetector';
import { analyzeUrgency } from '../protocols/UrgencyDetector';
import { analyzeContemplative } from '../protocols/ContemplativeSpace';
import { analyzeResonance } from '../protocols/ElementalResonance';
import { analyzeStory } from '../protocols/StoryWeaver';
import { ElementalArchetype } from '../../../web/lib/types/elemental';

export interface CollectionContext {
  userId: string;
  sessionId: string;
  exchangeCount: number;
  conversationHistory?: Array<{
    role: 'user' | 'oracle';
    content: string;
    timestamp: Date;
  }>;
  currentElement?: ElementalArchetype;
  emotionalIntensity?: number;
  depth?: 'surface' | 'moderate' | 'deep';
  userPreferences?: {
    loopingIntensity?: 'light' | 'full' | 'sacred';
    preferredElement?: ElementalArchetype;
    oracleName?: string;
  };
}

/**
 * Collect claims from all subsystems
 */
export async function collectClaims(
  userInput: string,
  context: CollectionContext
): Promise<OrchestrationDecision> {
  const claims: OrchestrationClaim[] = [];
  const startTime = Date.now();

  // 1. CATASTROPHIC GUARD (Priority 0 - Always runs first)
  try {
    const catastrophic = CatastrophicFailureGuard.detectCatastrophic(userInput);
    if (catastrophic.detected) {
      // Immediate short-circuit for safety
      claims.push({
        subsystem: 'catastrophicGuard',
        priority: 0,
        confidence: 1.0,
        response: catastrophic.response,
        reason: `${catastrophic.type} detected`
      });

      // Return immediately for catastrophic situations
      return resolvePriority(claims);
    }
  } catch (error) {
    console.error('Error in catastrophic detection:', error);
  }

  // 2. EXPLICIT BOUNDARIES (Priority 1)
  try {
    const boundary = analyzeBoundaries(userInput);
    if (boundary && boundary.detected) {
      claims.push({
        subsystem: 'explicitBoundary',
        priority: 1,
        confidence: boundary.confidence,
        response: boundary.response,
        reason: boundary.reason
      });
    }
  } catch (error) {
    console.error('Error in boundary detection:', error);
  }

  // 3. URGENCY DETECTION (Priority 2)
  try {
    const urgency = analyzeUrgency(userInput);
    if (urgency && urgency.detected) {
      claims.push({
        subsystem: 'urgency',
        priority: 2,
        confidence: urgency.level,
        response: urgency.response,
        reason: urgency.reason,
        metadata: {
          urgency: urgency.level,
          depth: urgency.suggestedDepth === 'brief' ? 'surface' :
                 urgency.suggestedDepth === 'full' ? 'deep' : 'moderate'
        }
      });
    }
  } catch (error) {
    console.error('Error in urgency detection:', error);
  }

  // 4. LOOPING PROTOCOL (Priority 3)
  try {
    const loopingContext = {
      input: userInput,
      history: context.conversationHistory || [],
      currentElement: context.currentElement || ElementalArchetype.WATER,
      depth: context.depth || 'moderate',
      exchangeCount: context.exchangeCount
    };

    const looping = await LoopingProtocolIntegration.evaluate(userInput, loopingContext);
    if (looping.shouldLoop) {
      claims.push({
        subsystem: 'loopingProtocol',
        priority: 3,
        confidence: looping.confidence || 0.7,
        response: looping.response,
        reason: looping.reason || 'Clarity needed'
      });
    }
  } catch (error) {
    console.error('Error in looping evaluation:', error);
  }

  // 5. CONTEMPLATIVE SPACE (Priority 4)
  try {
    const contemplativeContext = {
      exchangeCount: context.exchangeCount,
      emotionalIntensity: context.emotionalIntensity || 0.5,
      currentDepth: context.depth || 'moderate'
    };

    const contemplative = analyzeContemplative(userInput, contemplativeContext);
    if (contemplative && contemplative.shouldEnter) {
      claims.push({
        subsystem: 'contemplativeSpace',
        priority: 4,
        confidence: 0.8,
        response: contemplative.invitation,
        reason: contemplative.reason,
        metadata: {
          depth: contemplative.depth === 'deep_silence' ? 'deep' :
                 contemplative.depth === 'surface_pause' ? 'surface' : 'moderate'
        }
      });
    }
  } catch (error) {
    console.error('Error in contemplative analysis:', error);
  }

  // 6. ELEMENTAL RESONANCE (Priority 5 - Always provides tonal layer)
  try {
    const elementalContext = {
      previousElement: context.currentElement,
      userPreferredElement: context.userPreferences?.preferredElement
    };

    const resonance = analyzeResonance(userInput, elementalContext);
    if (resonance) {
      claims.push({
        subsystem: 'elementalResonance',
        priority: 5,
        confidence: resonance.stability,
        response: resonance.response,
        reason: resonance.reason,
        metadata: {
          elemental: resonance.dominant
        }
      });
    }
  } catch (error) {
    console.error('Error in elemental resonance:', error);
  }

  // 7. STORY WEAVER (Priority 6 - Optional narrative layer)
  try {
    const story = analyzeStory(userInput);
    if (story && story.requested) {
      claims.push({
        subsystem: 'storyWeaver',
        priority: 6,
        confidence: story.confidence,
        response: story.response || "Let me share a reflection that might resonate...",
        reason: story.reason
      });
    }
  } catch (error) {
    console.error('Error in story analysis:', error);
  }

  // 8. DEFAULT WITNESS (Fallback)
  if (claims.length === 0) {
    claims.push({
      subsystem: 'defaultWitness',
      priority: 99,
      confidence: 0.5,
      response: generateDefaultWitness(userInput, context),
      reason: 'No specific signals detected'
    });
  }

  // Log collection time for monitoring
  const collectionTime = Date.now() - startTime;
  if (collectionTime > 100) {
    console.warn(`Claim collection took ${collectionTime}ms - consider optimization`);
  }

  // Resolve priority and return decision
  const decision = resolvePriority(claims);

  // Add collection metadata
  decision.log.decisionPath.push(`Collected ${claims.length} claims in ${collectionTime}ms`);

  return decision;
}

/**
 * Generate default witness response
 */
function generateDefaultWitness(input: string, context: CollectionContext): string {
  const element = context.currentElement || ElementalArchetype.WATER;
  const name = context.userPreferences?.oracleName || 'Oracle';

  const witnesses = {
    [ElementalArchetype.FIRE]: "I witness the energy in what you're sharing.",
    [ElementalArchetype.WATER]: "I'm here with what you're feeling.",
    [ElementalArchetype.EARTH]: "I feel the weight of what you're carrying.",
    [ElementalArchetype.AIR]: "I see the thoughts taking shape.",
    [ElementalArchetype.AETHER]: "I'm present with all of this."
  };

  return witnesses[element] || "I'm here, witnessing this with you.";
}

/**
 * Validate context before collection
 */
export function validateContext(context: CollectionContext): boolean {
  if (!context.userId || !context.sessionId) {
    console.error('Missing required context fields: userId or sessionId');
    return false;
  }

  if (context.exchangeCount < 0) {
    console.warn('Invalid exchange count, resetting to 0');
    context.exchangeCount = 0;
  }

  return true;
}

/**
 * Enrich context with derived information
 */
export function enrichContext(
  context: CollectionContext,
  userInput: string
): CollectionContext {
  // Calculate emotional intensity if not provided
  if (context.emotionalIntensity === undefined) {
    context.emotionalIntensity = calculateEmotionalIntensity(userInput);
  }

  // Determine depth if not provided
  if (!context.depth) {
    if (context.exchangeCount < 2) {
      context.depth = 'surface';
    } else if (context.exchangeCount > 5) {
      context.depth = 'deep';
    } else {
      context.depth = 'moderate';
    }
  }

  // Set default element if not provided
  if (!context.currentElement) {
    context.currentElement = ElementalArchetype.WATER;
  }

  return context;
}

/**
 * Calculate emotional intensity from input
 */
function calculateEmotionalIntensity(input: string): number {
  const emotionalMarkers = [
    'feel', 'feeling', 'emotion', 'hurt', 'pain', 'joy', 'love',
    'angry', 'sad', 'happy', 'afraid', 'scared', 'anxious', 'worried',
    'excited', 'frustrated', 'confused', 'lost', 'overwhelmed'
  ];

  const lowerInput = input.toLowerCase();
  let intensity = 0;

  emotionalMarkers.forEach(marker => {
    if (lowerInput.includes(marker)) {
      intensity += 0.1;
    }
  });

  // Check for punctuation intensity
  if (input.includes('!')) intensity += 0.1;
  if (input.includes('...')) intensity += 0.05;
  if (input === input.toUpperCase() && input.length > 5) intensity += 0.2;

  return Math.min(intensity, 1.0);
}