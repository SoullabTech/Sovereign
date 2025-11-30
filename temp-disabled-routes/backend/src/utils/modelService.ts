// src/utils/modelService.ts

import { openai } from "../lib/openaiClient"; // adjust if using other clients
import logger from "./logger";
import type { AgentResponse } from "../types/agent";

class ModelService {
  /**
   * Get a response from the configured LLM model.
   * @param query - An object containing the user's input and optional context.
   */
  async getResponse(query: {
    input: string;
    userId?: string;
    context?: Record<string, any>;
  }): Promise<AgentResponse> {
    const { input, userId, context = {} } = query;

    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        logger.warn("⚠️ OpenAI API key not set, returning fallback response");
        return {
          content: "The oracle channels are realigning. Please ensure your configuration is complete.",
          response: "The oracle channels are realigning. Please ensure your configuration is complete.",
          confidence: 0.5,
          metadata: {
            timestamp: new Date().toISOString(),
            context,
            fallback: true,
          } as any,
        };
      }

      logger.info("🔮 Sending query to model", { userId, input });

      const completion = await openai.chat.completions.create({
        model: "gpt-4", // or 'gpt-3.5-turbo' / 'claude' depending on your setup
        messages: [
          {
            role: "system",
            content:
              "You are an insightful Oracle. Offer reflective and transformative guidance.",
          },
          {
            role: "user",
            content: input,
          },
        ],
        temperature: 0.8,
        max_tokens: 800,
      });

      const responseText =
        completion.choices[0]?.message?.content?.trim() ?? "";

      const response: AgentResponse = {
        content: responseText,
        response: responseText, // Legacy compatibility
        confidence: 0.9,
        metadata: {
          timestamp: new Date().toISOString(),
          context,
        } as any,
      };

      logger.info("✅ Model response received", {
        userId,
        model: "gpt-4",
      });

      return response;
    } catch (error) {
      logger.error("❌ ModelService failed to get a response", {
        error,
        userId,
        input,
      });
      
      // Return fallback response instead of throwing
      return {
        content: "The oracle channels are temporarily disrupted. Please try again.",
        response: "The oracle channels are temporarily disrupted. Please try again.",
        confidence: 0.3,
        metadata: {
          timestamp: new Date().toISOString(),
          context,
          error: error instanceof Error ? error.message : "Unknown error",
        } as any,
      };
    }
  }
}

export default new ModelService();
