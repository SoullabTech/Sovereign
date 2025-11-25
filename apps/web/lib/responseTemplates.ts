/**
 * 🌟 Sacred Oracle Response Templates v2
 *
 * Natural, mature, intelligent responses that subtly resonate
 * with elemental energy without scripts or therapy-speak.
 * 
 * Core: Sacred mirror reflection
 * Modulation: Tone shifts based on elemental resonance
 * Voice: Everyday, conversational, thoughtful
 */

import { ResonanceState } from "./resonanceEngine";
import { ToneModulator } from "./toneModulator";

export type Archetype =
  | "sage"
  | "seeker"
  | "healer"
  | "teacher"
  | "mystic"
  | "lover"
  | "warrior"
  | "creator"
  | "sacred_mirror";

export interface ResponseContext {
  input: string;
  state: ResonanceState;
  archetype?: Archetype;
}

export class ResponseTemplates {
  private toneModulator: ToneModulator;
  
  constructor() {
    this.toneModulator = new ToneModulator();
  }
  
  /**
   * Generate a natural, intelligent response
   */
  generate(context: ResponseContext): string {
    const { input, state, archetype = "sacred_mirror" } = context;
    const { dominant, intensity, responseMode } = state;
    
    // Start with sacred mirror base
    let response = this.generateSacredMirror(input);
    
    // Apply tone modulation based on elemental resonance
    if (intensity > 0.3) {
      response = this.toneModulator.modulate(response, {
        element: dominant,
        intensity
      });
    }
    
    // For very high intensity, use natural elemental response
    if (intensity > 0.8 && responseMode !== "balance") {
      response = this.toneModulator.generateNatural(input, dominant, intensity);
    }
    
    // Add grounding if needed
    if (responseMode === "balance" && intensity >= 0.9) {
      response = this.addGrounding(response);
    }
    
    // Apply subtle archetypal presence (if not sacred_mirror)
    if (archetype !== "sacred_mirror") {
      response = this.addArchetypalPresence(response, archetype);
    }
    
    return response;
  }
  
  /**
   * Generate base sacred mirror response
   * Natural, curious, reflective - no therapy speak
   */
  private generateSacredMirror(input: string): string {
    // Clean input for natural insertion
    const topic = this.extractCoreTopic(input);
    
    // Natural mirror reflections
    const mirrors = [
      `I hear you. What feels most alive about ${topic} right now?`,
      `That's interesting. What stands out to you most about ${topic}?`,
      `I'm noticing ${topic}. What's drawing your attention there?`,
      `That sounds significant. What part of ${topic} feels most important?`,
      `I'm curious about ${topic}. What's becoming clearer as you share it?`
    ];
    
    // Pick based on input length/complexity
    const complexity = this.assessComplexity(input);
    return mirrors[Math.min(complexity, mirrors.length - 1)];
  }
  
  /**
   * Add grounding for high-intensity states
   */
  private addGrounding(response: string): string {
    const groundingAdditions = [
      " Let's take a breath together.",
      " Sometimes pausing helps things settle.",
      " There's wisdom in slowing down here.",
      " What would feel most supportive right now?"
    ];
    
    // Only add if response doesn't already have grounding
    if (!response.includes("breath") && !response.includes("pause") && !response.includes("slow")) {
      return response + groundingAdditions[Math.floor(Math.random() * groundingAdditions.length)];
    }
    
    return response;
  }
  
  /**
   * Add subtle archetypal presence without being obvious
   */
  private addArchetypalPresence(response: string, archetype: Archetype): string {
    // Subtle presence, not performance
    const presenceMap: Record<Archetype, string> = {
      sage: " There might be something timeless here.",
      seeker: " I wonder what new territory this opens.",
      healer: " What needs the most care?",
      teacher: " What insight wants to be shared?",
      mystic: " There's mystery in this.",
      lover: " What does your heart know?",
      warrior: " Where's your strength here?",
      creator: " What wants to come into form?",
      sacred_mirror: ""
    };
    
    // Only add if response doesn't already have archetypal flavor
    const addition = presenceMap[archetype];
    if (addition && !response.includes("timeless") && !response.includes("mystery") && !response.includes("heart")) {
      return response + addition;
    }
    
    return response;
  }
  
  /**
   * Extract core topic for natural language insertion
   */
  private extractCoreTopic(input: string): string {
    // Remove common filler words
    const cleaned = input
      .toLowerCase()
      .replace(/\b(i|me|my|just|really|very|so|like|feel|think|been|have|had)\b/g, "")
      .trim();
    
    // If very short, return generic
    if (cleaned.length < 10) {
      return "this";
    }
    
    // If medium length, return truncated
    if (cleaned.length < 50) {
      return "what you're sharing";
    }
    
    // For long input, extract key phrase
    const words = cleaned.split(" ").filter(w => w.length > 3);
    if (words.length > 3) {
      return words.slice(0, 3).join(" ");
    }
    
    return "that";
  }
  
  /**
   * Assess input complexity for response selection
   */
  private assessComplexity(input: string): number {
    let complexity = 0;
    
    // Length factor
    if (input.length > 100) complexity++;
    if (input.length > 200) complexity++;
    
    // Emotional markers
    if (/\b(feel|felt|feeling|emotion|heart|soul)\b/i.test(input)) complexity++;
    
    // Question marks
    if (input.includes("?")) complexity++;
    
    // Multiple sentences
    if (input.split(/[.!?]/).length > 2) complexity++;
    
    return Math.min(complexity, 4);
  }
  
  /**
   * Generate response for transitions between elements
   */
  generateTransition(previousElement: string, currentElement: string): string {
    // Natural acknowledgment of energy shift
    const transitions: Record<string, string> = {
      "fire-water": "I notice the energy shifting to something softer. What's present now?",
      "water-fire": "There's new energy emerging. What wants to move?",
      "earth-air": "I sense a shift toward clarity. What's becoming visible?",
      "air-earth": "Feels like things are landing. What's taking shape?",
      "any-aether": "Something deeper is opening. What do you sense?"
    };
    
    const key = `${previousElement}-${currentElement}`;
    return transitions[key] || "I notice the energy shifting. What's here now?";
  }
}