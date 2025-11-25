/**
 * 🎨 Tone Modulator - Natural Language Filters
 * 
 * Applies subtle tonal shifts based on elemental resonance
 * without using scripts or therapy-speak.
 * 
 * Core principle: Maya sounds like a mature, intelligent conversationalist
 * who naturally resonates with the user's energy.
 */

import { Element } from "./resonanceEngine";

export interface ToneFilter {
  element: Element;
  intensity: number;
}

export class ToneModulator {
  /**
   * Apply elemental tone filter to a base response
   * Returns naturally modulated language without naming elements
   */
  modulate(baseResponse: string, filter: ToneFilter): string {
    const { element, intensity } = filter;
    
    // Only apply modulation if intensity is significant
    if (intensity < 0.3) {
      return baseResponse; // Stay neutral
    }
    
    switch (element) {
      case "fire":
        return this.applyFireTone(baseResponse, intensity);
      case "water":
        return this.applyWaterTone(baseResponse, intensity);
      case "earth":
        return this.applyEarthTone(baseResponse, intensity);
      case "air":
        return this.applyAirTone(baseResponse, intensity);
      case "aether":
        return this.applyAetherTone(baseResponse, intensity);
      default:
        return baseResponse;
    }
  }
  
  /**
   * 🔥 Fire tone: Active, energetic, forward-moving
   */
  private applyFireTone(base: string, intensity: number): string {
    // Replace passive constructions with active ones
    let modulated = base
      .replace(/What's present for you/gi, "What's ready to move")
      .replace(/What do you notice/gi, "What wants to happen next")
      .replace(/How does that feel/gi, "Where does that energy want to go")
      .replace(/What emerges/gi, "What's sparking")
      .replace(/sitting with/gi, "moving with")
      .replace(/resting in/gi, "stepping into");
    
    // Add momentum phrases for higher intensity
    if (intensity > 0.7) {
      if (!modulated.includes("?")) {
        modulated += " What's the very first thing you'd put in motion?";
      }
    }
    
    return modulated;
  }
  
  /**
   * 🌊 Water tone: Gentle, flowing, emotionally attuned
   */
  private applyWaterTone(base: string, intensity: number): string {
    let modulated = base
      .replace(/What do you think/gi, "What do you feel")
      .replace(/What's clear/gi, "What's moving through you")
      .replace(/What makes sense/gi, "What feels true")
      .replace(/What's the plan/gi, "What's calling to you")
      .replace(/figure out/gi, "feel into")
      .replace(/analyze/gi, "sense");
    
    // Add gentle holding for higher intensity
    if (intensity > 0.7) {
      if (modulated.includes("heavy") || modulated.includes("difficult")) {
        modulated += " I'm here with you in this.";
      }
    }
    
    return modulated;
  }
  
  /**
   * 🌍 Earth tone: Grounded, practical, concrete
   */
  private applyEarthTone(base: string, intensity: number): string {
    let modulated = base
      .replace(/What feels/gi, "What's solid")
      .replace(/What emerges/gi, "What can you build on")
      .replace(/What's possible/gi, "What's doable")
      .replace(/exploring/gi, "establishing")
      .replace(/flowing/gi, "grounding")
      .replace(/vision/gi, "foundation");
    
    // Add practical anchoring for higher intensity
    if (intensity > 0.7) {
      if (!modulated.includes("step") && !modulated.includes("foundation")) {
        modulated = modulated.replace(/\?$/, "? What's one concrete step you can take today?");
      }
    }
    
    return modulated;
  }
  
  /**
   * 🌬️ Air tone: Clear, thoughtful, perspective-oriented
   */
  private applyAirTone(base: string, intensity: number): string {
    let modulated = base
      .replace(/What do you feel/gi, "What do you see")
      .replace(/What's heavy/gi, "What patterns do you notice")
      .replace(/What's moving/gi, "What's becoming clear")
      .replace(/sensing/gi, "understanding")
      .replace(/feeling into/gi, "thinking through")
      .replace(/heart/gi, "mind");
    
    // Add perspective shift for higher intensity
    if (intensity > 0.7) {
      if (!modulated.includes("perspective") && !modulated.includes("picture")) {
        modulated += " What bigger picture is starting to come into focus?";
      }
    }
    
    return modulated;
  }
  
  /**
   * ✨ Aether tone: Spacious, wonder-filled, transcendent yet grounded
   */
  private applyAetherTone(base: string, intensity: number): string {
    let modulated = base
      .replace(/What do you/gi, "What part of you")
      .replace(/What's happening/gi, "What's unfolding")
      .replace(/What makes sense/gi, "What feels timeless")
      .replace(/right now/gi, "in this moment")
      .replace(/notice/gi, "witness")
      .replace(/see/gi, "sense");
    
    // Add spacious wonder for higher intensity
    if (intensity > 0.7) {
      if (!modulated.includes("mystery") && !modulated.includes("essence")) {
        modulated += " There's something profound here.";
      }
    }
    
    return modulated;
  }
  
  /**
   * Generate a completely natural response based on element
   * (No base template needed - pure generation)
   */
  generateNatural(userInput: string, element: Element, intensity: number): string {
    // Extract the core topic/feeling from user input
    const topic = this.extractTopic(userInput);
    
    switch (element) {
      case "fire":
        return this.generateFireResponse(topic, intensity);
      case "water":
        return this.generateWaterResponse(topic, intensity);
      case "earth":
        return this.generateEarthResponse(topic, intensity);
      case "air":
        return this.generateAirResponse(topic, intensity);
      case "aether":
        return this.generateAetherResponse(topic, intensity);
      default:
        return `I hear you. What feels most important about ${topic} right now?`;
    }
  }
  
  private extractTopic(input: string): string {
    // Simple topic extraction - can be enhanced with NLP
    if (input.length > 50) {
      return "what you're sharing";
    }
    return "that";
  }
  
  private generateFireResponse(topic: string, intensity: number): string {
    const responses = [
      `That sounds like it's ready to move. What's the first thing you want to put in motion?`,
      `There's real energy in ${topic}. Where does it want to take you?`,
      `I can feel the momentum building. What action feels most alive?`,
      `That's got spark. What wants to happen next?`
    ];
    return responses[Math.floor(intensity * responses.length)] || responses[0];
  }
  
  private generateWaterResponse(topic: string, intensity: number): string {
    const responses = [
      `That feels tender. What needs the most care right now?`,
      `There's a lot moving in ${topic}. What feels important to let yourself feel?`,
      `That sounds like it's touching something deep. What wants to be honored here?`,
      `I'm here with you in this. What feels most present?`
    ];
    return responses[Math.floor(intensity * responses.length)] || responses[0];
  }
  
  private generateEarthResponse(topic: string, intensity: number): string {
    const responses = [
      `Makes sense. What's the most solid next step?`,
      `That's clear. What foundation can you build on first?`,
      `I hear the practicality in ${topic}. What's one thing you can put in place today?`,
      `That's grounded. What structure would support this best?`
    ];
    return responses[Math.floor(intensity * responses.length)] || responses[0];
  }
  
  private generateAirResponse(topic: string, intensity: number): string {
    const responses = [
      `Interesting perspective. What pattern is becoming clearer?`,
      `That's a thoughtful angle on ${topic}. What insight stands out most?`,
      `I see the connections forming. What bigger picture is emerging?`,
      `That's illuminating. What understanding is crystallizing?`
    ];
    return responses[Math.floor(intensity * responses.length)] || responses[0];
  }
  
  private generateAetherResponse(topic: string, intensity: number): string {
    const responses = [
      `There's something timeless in ${topic}. What part of you recognizes it?`,
      `That touches something essential. What feels most true here?`,
      `I sense the depth of this. What wants to be witnessed?`,
      `There's a quality of presence here. What's asking for your attention?`
    ];
    return responses[Math.floor(intensity * responses.length)] || responses[0];
  }
}