/**
 * SELFLET BOUNDARY DETECTOR
 *
 * Detects when a new selflet should be created - the moments of
 * significant transition in a user's temporal identity.
 *
 * Boundary Types:
 * 1. Micro - within session emotional/pattern shifts (silent)
 * 2. Breakthrough - significant insight or realization (silent → confirmed)
 * 3. Evolution - consciousness level increase (MAIA prompts)
 * 4. Transformation - identity-level shift (MAIA asks user)
 * 5. Collective - field/group emergence (MAIA prompts)
 *
 * Design Decision: Hybrid approach
 * - Auto-detect boundaries silently for micro/breakthrough
 * - For evolution/transformation: MAIA prompts "I sense a shift..."
 * - User confirms before major selflet transitions are recorded
 */

import { selfletChain } from './SelfletChain';
import {
  SelfletNode,
  BoundarySignal,
  BoundaryDetectionInput,
  BoundaryType,
  Element,
} from './types';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const THRESHOLDS = {
  // Emotional shift intensity to trigger boundary
  emotionalShiftIntensity: 0.7,

  // Consciousness level change to trigger evolution boundary
  consciousnessLevelDelta: 0.15,

  // Session duration (minutes) for deep engagement
  deepEngagementMinutes: 15,

  // Breakthroughs per session to suggest transformation
  breakthroughsForTransformation: 3,

  // Continuity drop to trigger transformation
  continuityDropThreshold: 0.3,
};

// ═══════════════════════════════════════════════════════════════
// BOUNDARY DETECTOR SERVICE
// ═══════════════════════════════════════════════════════════════

export class SelfletBoundaryDetector {

  /**
   * Main detection entry point
   * Analyzes current interaction context to detect boundary signals
   */
  async detectBoundary(input: BoundaryDetectionInput): Promise<BoundarySignal | null> {
    const signals: BoundarySignal[] = [];

    // Check each boundary type
    const microSignal = this.detectMicroBoundary(input);
    if (microSignal) signals.push(microSignal);

    const breakthroughSignal = this.detectBreakthroughBoundary(input);
    if (breakthroughSignal) signals.push(breakthroughSignal);

    const evolutionSignal = await this.detectEvolutionBoundary(input);
    if (evolutionSignal) signals.push(evolutionSignal);

    const transformationSignal = await this.detectTransformationBoundary(input);
    if (transformationSignal) signals.push(transformationSignal);

    // Return the strongest signal
    if (signals.length === 0) return null;

    signals.sort((a, b) => b.strength - a.strength);
    return signals[0];
  }

  /**
   * Detect micro-boundary (within-session shift)
   * These are silent - recorded without user confirmation
   */
  private detectMicroBoundary(input: BoundaryDetectionInput): BoundarySignal | null {
    // Emotional shift detection
    if (input.emotionalShift && input.emotionalShift.intensity >= THRESHOLDS.emotionalShiftIntensity) {
      return {
        type: 'micro',
        strength: input.emotionalShift.intensity * 0.5,  // Cap at 0.5 for micro
        trigger: `Emotional shift: ${input.emotionalShift.from || 'unknown'} → ${input.emotionalShift.to}`,
        requiresConfirmation: false,
      };
    }

    return null;
  }

  /**
   * Detect breakthrough boundary (significant insight)
   * Strength depends on session engagement
   */
  private detectBreakthroughBoundary(input: BoundaryDetectionInput): BoundarySignal | null {
    if (!input.breakthroughDetected) return null;

    // Calculate strength based on context
    let strength = 0.6;

    // Boost if deep engagement
    if ((input.sessionDurationMinutes ?? 0) >= THRESHOLDS.deepEngagementMinutes) {
      strength += 0.1;
    }

    // Boost if multiple breakthroughs this session
    if ((input.breakthroughCountThisSession ?? 0) >= 2) {
      strength += 0.1;
    }

    return {
      type: 'breakthrough',
      strength: Math.min(0.8, strength),
      trigger: 'Breakthrough moment detected',
      requiresConfirmation: strength >= 0.7,  // Confirm if significant
    };
  }

  /**
   * Detect evolution boundary (consciousness level increase)
   * MAIA prompts user for confirmation
   */
  private async detectEvolutionBoundary(input: BoundaryDetectionInput): Promise<BoundarySignal | null> {
    // Check consciousness level change
    if ((input.consciousnessLevelDelta ?? 0) < THRESHOLDS.consciousnessLevelDelta) {
      return null;
    }

    let strength = 0.7 + (input.consciousnessLevelDelta ?? 0);

    // Build suggested attributes
    let suggestedElement: Element | undefined;
    let suggestedArchetypes: string[] | undefined;

    if (input.elementalShift?.to) {
      suggestedElement = input.elementalShift.to;
    }

    if (input.archetypalShift?.to) {
      suggestedArchetypes = input.archetypalShift.to;
    }

    return {
      type: 'evolution',
      strength: Math.min(0.9, strength),
      trigger: `Consciousness level increase: +${((input.consciousnessLevelDelta ?? 0) * 100).toFixed(0)}%`,
      suggestedElement,
      suggestedArchetypes,
      requiresConfirmation: true,
    };
  }

  /**
   * Detect transformation boundary (identity-level shift)
   * Most significant - MAIA explicitly asks user
   */
  private async detectTransformationBoundary(input: BoundaryDetectionInput): Promise<BoundarySignal | null> {
    // Check for elemental shift
    const hasElementalShift = input.elementalShift && input.elementalShift.from !== input.elementalShift.to;

    // Check for archetypal reconfiguration
    const hasArchetypalShift = input.archetypalShift &&
      JSON.stringify(input.archetypalShift.from?.sort()) !== JSON.stringify(input.archetypalShift.to?.sort());

    // Check for multiple breakthroughs (accumulating transformation)
    const multipleBreakthroughs = (input.breakthroughCountThisSession ?? 0) >= THRESHOLDS.breakthroughsForTransformation;

    // Need at least two indicators for transformation
    const indicators = [hasElementalShift, hasArchetypalShift, multipleBreakthroughs].filter(Boolean).length;
    if (indicators < 2) return null;

    // Calculate strength
    let strength = 0.8;
    if (hasElementalShift) strength += 0.1;
    if (hasArchetypalShift) strength += 0.05;
    if (multipleBreakthroughs) strength += 0.05;

    // Build suggested attributes
    const triggerParts: string[] = [];
    if (hasElementalShift) {
      triggerParts.push(`elemental shift (${input.elementalShift?.from} → ${input.elementalShift?.to})`);
    }
    if (hasArchetypalShift) {
      triggerParts.push('archetypal reconfiguration');
    }
    if (multipleBreakthroughs) {
      triggerParts.push(`${input.breakthroughCountThisSession} breakthroughs this session`);
    }

    return {
      type: 'transformation',
      strength: Math.min(0.95, strength),
      trigger: `Identity transformation: ${triggerParts.join(', ')}`,
      suggestedElement: input.elementalShift?.to,
      suggestedArchetypes: input.archetypalShift?.to,
      suggestedPhase: this.suggestPhase(input.elementalShift?.to, input.currentSelflet),
      requiresConfirmation: true,
    };
  }

  /**
   * Detect if elemental shift has occurred since last selflet
   */
  async detectElementalShift(
    userId: string,
    currentElement: Element
  ): Promise<{ shifted: boolean; from?: Element }> {
    const currentSelflet = await selfletChain.getCurrentSelflet(userId);

    if (!currentSelflet) {
      return { shifted: false };
    }

    if (currentSelflet.element !== currentElement) {
      return { shifted: true, from: currentSelflet.element };
    }

    return { shifted: false };
  }

  /**
   * Detect if archetypal configuration has shifted
   */
  async detectArchetypalShift(
    userId: string,
    currentArchetypes: string[]
  ): Promise<{ shifted: boolean; from?: string[] }> {
    const currentSelflet = await selfletChain.getCurrentSelflet(userId);

    if (!currentSelflet) {
      return { shifted: false };
    }

    // Check if archetypes have significantly changed
    const previousSet = new Set(currentSelflet.archetypes);
    const currentSet = new Set(currentArchetypes);

    const overlap = currentArchetypes.filter(a => previousSet.has(a)).length;
    const overlapRatio = overlap / Math.max(currentArchetypes.length, 1);

    // Less than 50% overlap = significant shift
    if (overlapRatio < 0.5) {
      return { shifted: true, from: currentSelflet.archetypes };
    }

    return { shifted: false };
  }

  /**
   * Generate MAIA's prompt for boundary confirmation
   * This is what MAIA says to the user when a significant boundary is detected
   */
  generateConfirmationPrompt(signal: BoundarySignal): string {
    switch (signal.type) {
      case 'breakthrough':
        return "I sense something significant shifting in you. Would you like to mark this moment?";

      case 'evolution':
        return "I notice your awareness deepening. It feels like you're moving into a new phase. Would you like to acknowledge this transition?";

      case 'transformation':
        if (signal.suggestedElement) {
          return `I sense a transformation occurring - a shift from ${signal.suggestedElement} energy emerging. Would you like to pause and honor this threshold moment?`;
        }
        return "I sense a transformation occurring. Would you like to pause and mark this threshold?";

      case 'collective':
        return "Something is shifting not just in you, but in the field around you. Would you like to acknowledge this collective emergence?";

      default:
        return "I sense a shift. Would you like to mark this moment?";
    }
  }

  /**
   * Generate MAIA's metamorphosis prompt
   * Called when a radical transformation is detected
   */
  generateMetamorphosisPrompt(from: Element, to: Element, symbol: string): string {
    const prompts: Record<string, string> = {
      steam: "Your fire has met the waters of emotion, rising as steam. This transformation carries the heat of creation into the flow of feeling.",
      ash: "From the fire, you return to earth as ash - not destruction, but the fertile ground from which new growth emerges.",
      smoke: "Your fire rises into air, becoming smoke that carries prayers upward. What once burned now seeks the heights of thought.",
      mist: "Water meets air, becoming mist - neither fully liquid nor vapor, but the threshold between worlds.",
      mud: "Water and earth blend into mud - the prima materia from which form emerges. What will you shape from this mixture?",
      light: "Fire transcends into aether, becoming light itself. What was once consuming warmth is now illumination.",
    };

    return prompts[symbol] ||
      `You are moving from ${from} to ${to}. This is a metamorphosis - the old form dissolving into something new.`;
  }

  // ─────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────

  private suggestPhase(
    element: Element | undefined,
    currentSelflet: SelfletNode | undefined
  ): string {
    if (!element) return 'New Phase';

    // Extract cycle number from current phase if available
    const cycleMatch = currentSelflet?.phase.match(/(\d+)/);
    const cycle = cycleMatch ? parseInt(cycleMatch[1]) : 1;

    // Element progression within a cycle
    const elementOrder = ['fire', 'earth', 'water', 'air', 'aether'];
    const currentIndex = currentSelflet ? elementOrder.indexOf(currentSelflet.element) : -1;
    const newIndex = elementOrder.indexOf(element);

    // If moving forward in cycle or wrapping around
    if (newIndex > currentIndex || (currentIndex === 4 && newIndex === 0)) {
      return `${element.charAt(0).toUpperCase() + element.slice(1)} ${cycle}`;
    }

    // If moving backward, might be new cycle
    const newCycle = newIndex < currentIndex ? cycle + 1 : cycle;
    return `${element.charAt(0).toUpperCase() + element.slice(1)} ${newCycle}`;
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const selfletBoundaryDetector = new SelfletBoundaryDetector();
