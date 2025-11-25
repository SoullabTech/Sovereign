/**
 * 🌟 Presence Engine - Be Here Now
 * 
 * Not a processor, but a mirror.
 * Reflects elemental presence, then returns user to life.
 * 
 * Core: What's alive right now?
 * Direction: Back to your experience.
 * Principle: Live life, check in as needed.
 */

import { Element } from "./resonanceEngine";

export interface PresenceState {
  element: Element;
  intensity: number;
  needsGrounding: boolean;
  momentComplete: boolean; // Ready to return to life?
}

export class PresenceEngine {
  /**
   * Meet the moment, don't process it
   */
  meetMoment(input: string, element: Element, intensity: number): string {
    // Very short check-ins need very short responses
    if (input.length < 50) {
      return this.briefPresence(element);
    }
    
    // High intensity needs grounding, not analysis
    if (intensity > 0.85) {
      return this.groundingPresence(element);
    }
    
    // Default: simple mirror + return to life
    return this.mirrorAndRelease(element, intensity);
  }
  
  /**
   * Brief presence - for quick check-ins
   */
  private briefPresence(element: Element): string {
    const brief: Record<Element, string> = {
      fire: "The spark is here. What needs to happen?",
      water: "I feel that with you. What's present?",
      earth: "Solid ground. What's next?",
      air: "Clear seeing. What stands out?",
      aether: "Wide open. What's here?"
    };
    return brief[element];
  }
  
  /**
   * Grounding presence - for high intensity
   */
  private groundingPresence(element: Element): string {
    const grounding: Record<Element, string> = {
      fire: "That's a lot of energy. Take a breath. What's one thing you can do with it right now?",
      water: "Deep waters. I'm here. What needs to be felt before you move forward?",
      earth: "Heavy load. Set it down for a moment. What's actually yours to carry?",
      air: "Many thoughts swirling. Come back to now. What's the one that matters?",
      aether: "Vast space opening. Feel your feet. How does this touch your actual day?"
    };
    return grounding[element];
  }
  
  /**
   * Mirror and release - default presence
   */
  private mirrorAndRelease(element: Element, intensity: number): string {
    // Simple acknowledgment + return to experience
    const responses: Record<Element, string[]> = {
      fire: [
        "I see the fire in this. Go live it.",
        "That energy wants to move. Follow it.",
        "The spark is clear. What are you waiting for?"
      ],
      water: [
        "This feeling is real. Let it flow through you.",
        "I'm with you in this. Feel what needs feeling.",
        "The current is moving. Trust where it takes you."
      ],
      earth: [
        "You know what's solid here. Build on it.",
        "The ground is clear. Take your next step.",
        "This is practical. Make it real."
      ],
      air: [
        "The clarity is emerging. Think it through.",
        "You see the pattern. Work with it.",
        "The perspective is shifting. Let it."
      ],
      aether: [
        "Something bigger is here. Be with it.",
        "The mystery is present. Don't solve it, live it.",
        "This touches everything. Let it."
      ]
    };
    
    const elementResponses = responses[element];
    const index = Math.floor(intensity * (elementResponses.length - 1));
    return elementResponses[index];
  }
  
  /**
   * Completion prompts - send them back to life
   */
  generateCompletion(element: Element): string {
    const completions: Record<Element, string> = {
      fire: "Go make it happen. Check back in when you need to.",
      water: "Let this move through you. Come back when you need holding.",
      earth: "You've got your next step. Take it. Return when you need grounding.",
      air: "The clarity is yours. Use it. Come back when thoughts need sorting.",
      aether: "The space is open. Live in it. Return when you need remembering."
    };
    return completions[element];
  }
  
  /**
   * Check if this is a "processing loop" vs actual living
   */
  detectOverProcessing(messageCount: number, timeSpent: number): boolean {
    // More than 5 messages in 10 minutes = probably looping
    if (messageCount > 5 && timeSpent < 600000) {
      return true;
    }
    return false;
  }
  
  /**
   * Gentle redirect when over-processing detected
   */
  redirectToLife(): string {
    const redirects = [
      "We're talking a lot about this. What if you went and lived it for a bit?",
      "This is becoming analysis. What needs to actually happen in your life right now?",
      "We could keep processing, or you could go experience. Which serves you?",
      "Enough thinking. What's one real thing you can do today?",
      "The conversation is looping. Time to take it into life."
    ];
    return redirects[Math.floor(Math.random() * redirects.length)];
  }
}