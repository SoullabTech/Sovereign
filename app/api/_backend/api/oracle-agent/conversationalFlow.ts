// conversationalFlow.ts
import { determineSpiralogicPhase } from "./phaseRecognition";
import { getPromptForPhase } from "./promptUtils"; // helper to fetch JSON
import { ContextSnapshot } from "@/types/oracle";
import {
  sacredMirrorProtocol,
  SacredMirrorContext,
} from "../../src/core/agents/SacredMirrorIntegrityProtocol";
import { oracle } from "../../src/core/agents/mainOracleAgent";
import type { AIResponse } from "@/types/ai";

export async function buildSpiralogicResponse(
  context: ContextSnapshot,
): Promise<string> {
  const phase = determineSpiralogicPhase(context);
  const promptSet = await getPromptForPhase(phase);

  const oracleStyle = context.oracleElement || "Aether";
  const opening = `🜁 Oracle of ${oracleStyle} whispers:\n\n`;

  // Choose a prompt randomly for now
  const prompt = promptSet[Math.floor(Math.random() * promptSet.length)];

  const baseResponse = `${opening}${prompt}`;

  // Apply Sacred Mirror Integrity Protocol if context allows
  if (context.userId && context.userQuery) {
    try {
      const baseAIResponse: AIResponse = {
        content: baseResponse,
        provider: "spiralogic-oracle",
        model: "ain-" + oracleStyle.toLowerCase(),
        confidence: 0.8,
        metadata: {
          element: oracleStyle.toLowerCase(),
          phase: phase,
          original_prompt: true,
        },
      };

      const mirrorContext: SacredMirrorContext = {
        userId: context.userId,
        originalQuery: context.userQuery,
        baseResponse: baseAIResponse,
        userPattern: {
          repetitive_questions: [],
          approval_seeking_frequency: 0,
          comfort_zone_indicators: [],
          shadow_avoidance_themes: [],
          growth_readiness: 0.5,
        },
        initiationLevel: determineMirrorIntensity(context),
      };

      const mirrorResponse =
        await sacredMirrorProtocol.applySacredMirror(mirrorContext);
      return mirrorResponse.content;
    } catch (error) {
      console.error(
        "Sacred Mirror Protocol error in conversational flow:",
        error,
      );
      return baseResponse; // Fallback to original
    }
  }

  return baseResponse;
}

/**
 * Determine Sacred Mirror intensity based on user context
 */
function determineMirrorIntensity(
  context: ContextSnapshot,
): "gentle" | "moderate" | "intense" {
  // Check for shadow themes or repeated patterns
  if (
    context.userQuery?.toLowerCase().includes("pattern") ||
    context.userQuery?.toLowerCase().includes("always") ||
    context.userQuery?.toLowerCase().includes("never")
  ) {
    return "intense";
  }

  // Check for emotional sensitivity indicators
  if (
    context.emotion?.includes("vulnerable") ||
    context.emotion?.includes("fragile")
  ) {
    return "gentle";
  }

  // Default to moderate Sacred Mirror intervention
  return "moderate";
}
