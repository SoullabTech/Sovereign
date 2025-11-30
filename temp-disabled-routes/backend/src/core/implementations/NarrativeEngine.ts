/**
 * NarrativeEngine - Delegated response shaping and narrative generation
 * 
 * Centralizes all response transformation logic that was previously embedded
 * in PersonalOracleAgent. Provides clean separation of concerns and makes
 * narrative strategies plug-and-play.
 * 
 * Key Features:
 * - Stage-aware tone adjustments (formality, directness, metaphysical openness)
 * - Disclosure level management (uncertainty admission, multiple perspectives)
 * - Complexity level adaptation (sentence simplification, concept reduction)
 * - Interaction mode shaping (socratic, cocreative, facilitative)
 */

import type { OracleStageConfig } from "../types/oracleStateMachine";
import type { PersonaPrefs } from "../../personas/prefs";
import { shapeMayaResponse } from "../../personas/shaper";
import type { Intent } from "../../personas/intent";

export class NarrativeEngine {
  /**
   * Generate a shaped narrative response based on stage configuration and persona preferences
   */
  public static generate(
    rawResponse: string,
    context: {
      intent: Intent;
      prefs: PersonaPrefs;
      emotions: string[];
      stageConfig: OracleStageConfig;
      stageSummary: any;
    }
  ): string {
    const { intent, prefs, emotions, stageConfig } = context;

    // Start with basic Maya shaping
    let shapedResponse = shapeMayaResponse(rawResponse, {
      intent,
      prefs,
      emotions
    });

    // Apply stage-specific transformations
    shapedResponse = this.applyToneAdjustments(shapedResponse, stageConfig);
    shapedResponse = this.applyDisclosureLevel(shapedResponse, stageConfig);
    shapedResponse = this.applyComplexityLevel(shapedResponse, stageConfig);
    shapedResponse = this.applyInteractionMode(shapedResponse, stageConfig, intent);

    return shapedResponse;
  }

  /**
   * Apply tone adjustments based on stage configuration
   */
  private static applyToneAdjustments(response: string, config: OracleStageConfig): string {
    let adjusted = response;

    // Safety check for config structure
    if (!config.tone || typeof config.tone !== 'object') {
      return response;
    }

    // Adjust formality
    const formality = config.tone.formality ?? 0.5; // Default to 0.5
    if (formality > 0.7) {
      adjusted = adjusted.replace(/\byou're\b/g, 'you are');
      adjusted = adjusted.replace(/\bcan't\b/g, 'cannot');
      adjusted = adjusted.replace(/\bwon't\b/g, 'will not');
    } else if (formality < 0.3) {
      adjusted = adjusted.replace(/\byou are\b/g, "you're");
      adjusted = adjusted.replace(/\bcannot\b/g, "can't");
    }

    // Adjust directness
    const directness = config.tone.directness ?? 0.5; // Default to 0.5
    if (directness < 0.4) {
      // Make less direct by adding softening language
      adjusted = adjusted.replace(/^You should/, 'You might consider');
      adjusted = adjusted.replace(/^You need to/, 'Perhaps you could');
      adjusted = adjusted.replace(/^This is/, 'This seems to be');
    }

    // Adjust metaphysical openness
    const metaphysicalOpenness = config.tone.metaphysical_openness ?? 0.5; // Default to 0.5
    if (metaphysicalOpenness < 0.4) {
      // Reduce mystical language
      adjusted = adjusted.replace(/universe|cosmic|divine|sacred/gi, match => {
        const replacements: Record<string, string> = {
          'universe': 'life', 
          'cosmic': 'broader', 
          'divine': 'meaningful', 
          'sacred': 'important'
        };
        return replacements[match.toLowerCase()] || match;
      });
    }

    return adjusted;
  }

  /**
   * Apply disclosure level adjustments
   */
  private static applyDisclosureLevel(response: string, config: OracleStageConfig): string {
    let adjusted = response;

    // Safety check for disclosure config
    if (!config.disclosure || typeof config.disclosure !== 'object') {
      return response;
    }

    // Add uncertainty admission if configured
    const uncertaintyAdmission = config.disclosure.uncertainty_admission ?? 0.5;
    if (uncertaintyAdmission > 0.6 && Math.random() < 0.3) {
      const uncertaintyPhrases = [
        "I'm not entirely sure, but ",
        "This is just one perspective, ",
        "I could be wrong here, but "
      ];
      const phrase = uncertaintyPhrases[Math.floor(Math.random() * uncertaintyPhrases.length)];
      adjusted = phrase + adjusted.charAt(0).toLowerCase() + adjusted.slice(1);
    }

    // Add multiple perspectives if enabled
    if (config.disclosure.multiple_perspectives && response.length > 100) {
      adjusted += "\n\nOf course, there's another way to see this...";
    }

    return adjusted;
  }

  /**
   * Apply complexity level simplification
   */
  private static applyComplexityLevel(response: string, config: OracleStageConfig): string {
    // Safety check for orchestration config
    if (!config.orchestration || typeof config.orchestration !== 'object') {
      return response;
    }
    
    const complexityLevel = config.orchestration.complexity_level ?? 0.5;
    if (complexityLevel < 0.5) {
      // Simplify by splitting long sentences and removing complex concepts
      const sentences = response.split('. ');
      const simplified = sentences.map(sentence => {
        if (sentence.length > 100) {
          // Split long sentences
          const midpoint = sentence.indexOf(',', sentence.length / 2);
          if (midpoint > 0) {
            return sentence.substring(0, midpoint) + '. ' + sentence.substring(midpoint + 1).trim();
          }
        }
        return sentence;
      }).join('. ');
      
      return simplified;
    }

    return response;
  }

  /**
   * Apply interaction mode specific adjustments
   */
  private static applyInteractionMode(
    response: string, 
    config: OracleStageConfig, 
    intent: Intent
  ): string {
    // Safety check for orchestration config
    if (!config.orchestration || !config.orchestration.interaction_mode) {
      return response;
    }
    
    switch (config.orchestration.interaction_mode) {
      case 'socratic':
        // Add questions to encourage reflection
        if (!response.includes('?') && Math.random() < 0.4) {
          response += " What do you think about that?";
        }
        break;
        
      case 'cocreative':
        // Invite collaboration
        if (intent === 'exploration' && Math.random() < 0.3) {
          response += " I'd love to explore this together with you.";
        }
        break;
        
      case 'facilitative':
        // Focus on user's own wisdom
        response = response.replace(/^I think|^I believe/, 'You might find');
        break;
    }

    return response;
  }

  /**
   * Apply narrative polishing for specific contexts
   */
  public static polish(
    response: string,
    context: {
      polishType: 'mastery' | 'crisis' | 'standard';
      stageConfig?: OracleStageConfig;
      userMetrics?: {
        trustLevel: number;
        engagementScore: number;
      };
    }
  ): string {
    switch (context.polishType) {
      case 'mastery':
        return this.applyMasteryPolish(response, context);
      case 'crisis':
        return this.applyCrisisPolish(response);
      default:
        return response;
    }
  }

  /**
   * Apply mastery-level polish for transparent_prism stage
   */
  private static applyMasteryPolish(
    response: string,
    context: {
      stageConfig?: OracleStageConfig;
      userMetrics?: { trustLevel: number; engagementScore: number };
    }
  ): string {
    // Only apply mastery polish in appropriate conditions
    if (!context.stageConfig || 
        context.stageConfig.stage !== "transparent_prism" || 
        !context.userMetrics ||
        context.userMetrics.trustLevel < 0.75) {
      return response;
    }

    let polished = response;

    // Strip jargon
    const jargonReplacements: Record<string, string> = {
      ontology: "pattern",
      consciousness: "awareness",
      archetypal: "symbolic",
      synchronicity: "timing",
      transcendent: "beyond",
      embodied: "felt",
      emergence: "arising",
      phenomenology: "experience",
      liminal: "threshold",
      initiation: "beginning"
    };

    for (const [jargon, simple] of Object.entries(jargonReplacements)) {
      const regex = new RegExp(`\\b${jargon}\\b`, "gi");
      polished = polished.replace(regex, simple);
    }

    // Cap sentence length (≤ 12 words)
    const sentences = polished.split(". ");
    polished = sentences.map(sentence => {
      const words = sentence.split(" ");
      if (words.length > 12) {
        return words.slice(0, 12).join(" ") + "...";
      }
      return sentence;
    }).join(". ");

    // Add micro-pauses every 2 sentences
    const finalSentences = polished.split(". ");
    polished = finalSentences.map((sentence, index) => {
      if ((index + 1) % 2 === 0 && index < finalSentences.length - 1) {
        return sentence + " ...";
      }
      return sentence;
    }).join(". ");

    // Add everyday metaphors to prevent terseness
    polished = this.addEverydayMetaphors(polished);

    // Add gentle open ending
    if (!polished.endsWith("?") && !polished.includes("What")) {
      const openEndings = [
        " What feels true right now?",
        " What draws your attention?", 
        " What wants your care right now?",
        " What's stirring for you?",
        " Where does your attention naturally go?"
      ];
      polished += openEndings[Math.floor(Math.random() * openEndings.length)];
    }

    return polished;
  }

  /**
   * Add everyday metaphors to make responses more natural and relatable
   */
  private static addEverydayMetaphors(response: string): string {
    // Only add metaphors if response seems dry or overly clinical
    if (response.length < 50 || this.hasEverydayLanguage(response)) {
      return response;
    }

    const metaphorMappings: Array<{pattern: RegExp, replacement: string}> = [
      {
        pattern: /\bpattern\b/gi,
        replacement: Math.random() < 0.3 ? 'rhythm' : 'pattern'
      },
      {
        pattern: /\bprocess\b/gi, 
        replacement: Math.random() < 0.3 ? 'journey' : 'process'
      },
      {
        pattern: /\bchange\b/gi,
        replacement: Math.random() < 0.3 ? 'shift like morning light' : 'change'
      },
      {
        pattern: /\bgrowth\b/gi,
        replacement: Math.random() < 0.3 ? 'blossoming' : 'growth'
      },
      {
        pattern: /\bunderstanding\b/gi,
        replacement: Math.random() < 0.3 ? 'seeing clearly' : 'understanding'
      }
    ];

    let enhanced = response;
    metaphorMappings.forEach(({pattern, replacement}) => {
      enhanced = enhanced.replace(pattern, replacement);
    });

    // Add occasional grounding metaphors if response is abstract
    if (this.isAbstract(response) && Math.random() < 0.4) {
      const groundingPhrases = [
        " Like water finding its way around stones",
        " The way morning light gradually fills a room", 
        " Like a garden that grows season by season",
        " The way paths become clear as you walk them",
        " Like seeds that know when to sprout"
      ];
      const phrase = groundingPhrases[Math.floor(Math.random() * groundingPhrases.length)];
      enhanced = enhanced.replace(/\.\s*$/, `. ${phrase}.`);
    }

    return enhanced;
  }

  /**
   * Check if response already has everyday, relatable language
   */
  private static hasEverydayLanguage(response: string): boolean {
    const everydayWords = [
      'like', 'feels', 'notice', 'see', 'walk', 'path', 'home', 'garden', 
      'tree', 'water', 'light', 'morning', 'evening', 'breath', 'heart',
      'kitchen', 'bridge', 'door', 'window', 'mirror', 'river', 'mountain'
    ];
    
    const lowerResponse = response.toLowerCase();
    return everydayWords.some(word => lowerResponse.includes(word));
  }

  /**
   * Check if response is overly abstract
   */
  private static isAbstract(response: string): boolean {
    const abstractWords = [
      'consciousness', 'awareness', 'transcendent', 'ontological', 
      'phenomenological', 'archetypal', 'emergence', 'integration',
      'transformation', 'actualization'
    ];
    
    const lowerResponse = response.toLowerCase();
    const abstractCount = abstractWords.filter(word => 
      lowerResponse.includes(word)
    ).length;
    
    return abstractCount > 2;
  }

  /**
   * Apply crisis-specific polish for safety responses
   */
  private static applyCrisisPolish(response: string): string {
    // Ensure crisis responses are grounding and brief
    if (response.length > 150) {
      response = response.substring(0, 147) + "...";
    }
    
    // Add grounding cue if not present
    if (!response.includes("breathe") && !response.includes("ground")) {
      response += " Take a breath.";
    }

    return response;
  }
}