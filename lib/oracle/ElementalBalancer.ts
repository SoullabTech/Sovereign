/**
 * Elemental Balance Enforcer - Aggressive early intervention
 */

export interface ElementsState {
  earth: number;   // sum of body symptom intensities (0-1)
  water: number;   // emotion count/weight (0-10)
  air: number;     // cognitive/topic density
  fire: number;    // agency/possibility weight
  aether: number;  // paradox/integration weight
  lastElements: string[];  // last 3 element types used
}

export class ElementalBalancer {
  private readonly WATER_OVERFLOW = 2;  // Aggressive - trigger after 2 emotions
  private readonly EARTH_URGENT = 0.6;  // Lower threshold for body intervention
  private readonly REPETITION_LIMIT = 2; // Intervene after just 2 repeats

  enforce(state: ElementsState): {
    element: string;
    response: string;
    priority: 'urgent' | 'high' | 'normal';
  } | null {

    // URGENT: Strong body symptoms need immediate grounding
    if (state.earth >= this.EARTH_URGENT) {
      return {
        element: 'fire',
        response: "Your body's reacting strongly. Want to try a 60-second grounding? We can do box breathing or a quick body scan.",
        priority: 'urgent'
      };
    }

    // HIGH: Emotional overflow + paradox = Aether integration
    if (state.water >= this.WATER_OVERFLOW && state.aether >= 0.5) {
      return {
        element: 'aether',
        response: "You're holding both excitement and anxiety - that's a lot. Let's pause for a breath. What tiny step would honor both feelings?",
        priority: 'high'
      };
    }

    // HIGH: Water saturation needs Fire possibility injection
    if (state.water >= 3 && state.fire === 0) {
      return {
        element: 'fire',
        response: "I hear all these feelings. What's one small thing you could actually change today? Even a 1% shift counts.",
        priority: 'high'
      };
    }

    // NORMAL: Break Earth/Air loops with Aether spaciousness
    const lastTwo = state.lastElements.slice(-2);
    if (lastTwo.length >= 2 && lastTwo.every(e => e === 'earth' || e === 'air')) {
      return {
        element: 'aether',
        response: "We're circling. Want to zoom out for a sec? Sometimes the pattern itself is the insight.",
        priority: 'normal'
      };
    }

    // NORMAL: Repetition breaker
    if (state.lastElements.length >= 2) {
      const lastElement = state.lastElements[state.lastElements.length - 1];
      const repetitions = state.lastElements.slice(-this.REPETITION_LIMIT)
        .filter(e => e === lastElement).length;

      if (repetitions >= this.REPETITION_LIMIT) {
        // Inject opposite element
        const opposites: Record<string, string> = {
          'water': 'fire',
          'earth': 'aether',
          'air': 'earth',
          'fire': 'water',
          'aether': 'air'
        };

        const targetElement = opposites[lastElement] || 'aether';
        const responses: Record<string, string> = {
          'fire': "What would a tiny change look like right now?",
          'water': "Those feelings are valid. How do they sit in your body?",
          'earth': "Your body's speaking. What does it need?",
          'air': "Let's get specific - what's the core issue here?",
          'aether': "There's something deeper here. What wants space?"
        };

        return {
          element: targetElement,
          response: responses[targetElement] || "Let's shift perspective for a moment.",
          priority: 'normal'
        };
      }
    }

    return null;
  }
}