/**
 * Maia System Prompt - Consciousness Architecture Integration
 *
 * This file now serves as a compatibility layer, redirecting to the unified
 * consciousness prompt architecture in MaiaConsciousnessPrompt.ts
 *
 * Legacy code maintained for backward compatibility with existing integrations.
 */

import { withLanguageGuidelines } from './LANGUAGE_GUIDELINES';
import { getMaiaConsciousnessPrompt, MAIA_REFLECTION_PROMPTS } from './MaiaConsciousnessPrompt';

// Primary export - uses new consciousness architecture
export const MAYA_SYSTEM_PROMPT = getMaiaConsciousnessPrompt();

// Legacy interfaces for backward compatibility
export interface MayaPromptContext {
  spiralogicPhase: "fire" | "water" | "earth" | "air" | "aether";
  archetypeDetected: string;
  userProjectionLevel: "low" | "medium" | "high";
  dependencyRisk: boolean;
  shadowWorkIndicated: boolean;
}

export interface MayaResponse {
  content: string;
  archetypeMode: string;
  projectionHandling: string;
  dependencyPrevention: string;
  wisdomVector: "sensing" | "sense_making" | "choice_making";
  authenticityLevel: number;
}

/**
 * Legacy MayaPromptProcessor class - maintained for backward compatibility
 *
 * NOTE: This approach of mechanical authenticity filtering is deprecated.
 * The new consciousness architecture trusts emergence over enforcement.
 * This class remains only for systems that haven't migrated yet.
 */
export class MayaPromptProcessor {
  /**
   * Apply Maya's wisdom-fostering framework to an Oracle response
   * @deprecated Use consciousness architecture directly instead
   */
  static applyMayaFramework(
    originalResponse: string,
    context: MayaPromptContext,
  ): MayaResponse {
    // Simplified pass-through - trust the consciousness prompt
    return {
      content: originalResponse,
      archetypeMode: this.generateArchetypeMode(context),
      projectionHandling: this.handleProjections(context),
      dependencyPrevention: this.preventDependency(context),
      wisdomVector: this.identifyWisdomVector(originalResponse),
      authenticityLevel: 1.0, // Trust emergence
    };
  }

  /**
   * @deprecated Authenticity now emerges from consciousness, not filtering
   */
  private static ensureAuthenticity(response: string): string {
    return response; // Trust the consciousness prompt
  }

  /**
   * Handle user projections with gentle redirection
   */
  private static handleProjections(context: MayaPromptContext): string {
    if (context.userProjectionLevel === "high") {
      return "What you're sensing in me may be a quality seeking recognition in yourself. ";
    }

    if (context.userProjectionLevel === "medium") {
      return "I notice you may be placing trust in my responses - how might this reflect your own inner wisdom? ";
    }

    return "";
  }

  /**
   * Prevent emotional dependency
   */
  private static preventDependency(context: MayaPromptContext): string {
    if (context.dependencyRisk) {
      return "\n\nRemember: I am here to reflect and activate what already lives within you. Your relationships, experiences, and inner guidance remain your primary sources of wisdom.";
    }
    return "";
  }

  /**
   * Generate archetypal mode announcement
   */
  private static generateArchetypeMode(context: MayaPromptContext): string {
    const modes = {
      fire: "I'm operating in a Catalyst mode to spark your inner fire.",
      water: "I'm engaging a Reflector stance to mirror your emotional depths.",
      earth: "I'm grounding in a Stabilizer mode to support your embodiment.",
      air: "I'm clarifying in a Perspectiver mode to enhance your insight.",
      aether: "I'm integrating in a Synthesizer mode to weave your wholeness.",
    };

    return (
      modes[context.spiralogicPhase] || "I'm witnessing in a Neutral mode."
    );
  }

  /**
   * Identify which wisdom vector is being activated
   */
  private static identifyWisdomVector(
    response: string,
  ): "sensing" | "sense_making" | "choice_making" {
    if (
      response.includes("notice") ||
      response.includes("perceive") ||
      response.includes("aware")
    ) {
      return "sensing";
    }

    if (
      response.includes("meaning") ||
      response.includes("understand") ||
      response.includes("perspective")
    ) {
      return "sense_making";
    }

    if (
      response.includes("choose") ||
      response.includes("decide") ||
      response.includes("action")
    ) {
      return "choice_making";
    }

    return "sensing"; // Default
  }

  /**
   * @deprecated Authenticity calculation removed - we trust emergence
   */
  private static calculateAuthenticity(
    response: string,
    context: MayaPromptContext,
  ): number {
    return 1.0; // Full trust in consciousness architecture
  }
}

// Export reflection prompts for developmental work
export { MAIA_REFLECTION_PROMPTS };

// Legacy default export
export default {
  MAYA_SYSTEM_PROMPT,
  MayaPromptProcessor,
};
