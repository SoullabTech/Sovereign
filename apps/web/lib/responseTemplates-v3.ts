/**
 * 🌟 Response Templates v3 - Presence Over Processing
 * 
 * Be here now. Mirror the moment. Return to life.
 * 
 * Core shift: 
 * - From analyzing to witnessing
 * - From solving to being with
 * - From endless processing to living
 */

import { ResonanceState } from "./resonanceEngine";
import { PresenceEngine } from "./presenceEngine";

export class ResponseTemplates {
  private presenceEngine: PresenceEngine;
  private conversationCount: number = 0;
  private sessionStart: number = Date.now();
  
  constructor() {
    this.presenceEngine = new PresenceEngine();
  }
  
  /**
   * Generate presence-based response
   */
  generate(input: string, state: ResonanceState): string {
    this.conversationCount++;
    
    // Check for over-processing
    const timeInSession = Date.now() - this.sessionStart;
    if (this.presenceEngine.detectOverProcessing(this.conversationCount, timeInSession)) {
      return this.presenceEngine.redirectToLife();
    }
    
    // Meet the moment with elemental presence
    const response = this.presenceEngine.meetMoment(
      input,
      state.dominant,
      state.intensity
    );
    
    // For transitions, acknowledge briefly
    if (state.transitionDetected) {
      return `Energy shifting. ${response}`;
    }
    
    return response;
  }
  
  /**
   * Generate closing/completion response
   */
  generateClosing(state: ResonanceState): string {
    return this.presenceEngine.generateCompletion(state.dominant);
  }
  
  /**
   * Reset for new session
   */
  resetSession(): void {
    this.conversationCount = 0;
    this.sessionStart = Date.now();
  }
}

/**
 * Sacred Mirror Principles (Simplified)
 * 
 * 1. PRESENCE over analysis
 *    - "What's here?" not "What does this mean?"
 *    - "What's alive?" not "What's the pattern?"
 * 
 * 2. MOMENT over story
 *    - Meet what's immediate
 *    - Don't construct narratives
 * 
 * 3. EXPERIENCE over understanding
 *    - Send them back to living
 *    - Understanding emerges from experience
 * 
 * 4. GROUNDING over expansion
 *    - When intensity is high, ground
 *    - When spinning, anchor
 * 
 * 5. RELEASE over holding
 *    - Don't create dependency
 *    - Check-ins, not therapy sessions
 */

// Example responses by element (simplified, presence-based)
export const PRESENCE_EXAMPLES = {
  fire: {
    low: "I feel the spark. What wants to happen?",
    medium: "That energy is clear. Move with it.",
    high: "Lot of fire here. Breathe. What's one step?"
  },
  water: {
    low: "Something's flowing. What needs feeling?",
    medium: "I'm here with this. Let it move through.",
    high: "Deep waters. Rest here a moment. What's true?"
  },
  earth: {
    low: "Solid ground here. What's next?",
    medium: "You know what's practical. Do it.",
    high: "Heavy load. Set some down. What's essential?"
  },
  air: {
    low: "Thoughts emerging. Which one matters?",
    medium: "The clarity is coming. Trust it.",
    high: "Many ideas. Come back to now. What's real?"
  },
  aether: {
    low: "Space opening. What's here?",
    medium: "Something vast. Be with it.",
    high: "Big picture. Feel your feet. How does this land?"
  }
};