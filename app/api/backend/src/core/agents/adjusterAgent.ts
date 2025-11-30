/**
 * Personal Oracle Agent - Bridge to main PersonalOracleAgent
 * Routes requests to the actual implementation
 */

import { personalOracleAgent } from '../../agents/PersonalOracleAgent';

export interface PersonalOracleConfig {
  userId: string;
  oracleName?: string;
  elementalResonance?: string;
}

export class PersonalOracleAgentBridge {
  /**
   * Process a personal oracle query
   * This method bridges to the actual PersonalOracleAgent implementation
   */
  async process({ userId, input }: { userId: string; input: string }): Promise<any> {
    try {
      // Call the actual PersonalOracleAgent's process method
      const result = await personalOracleAgent.process({
        input,
        userId,
      });

      // Extract the response data
      if (result.success && result.data) {
        return result.data;
      }

      // Fallback response if something goes wrong
      return {
        content: "I'm here with you. Let me listen more deeply to what you're sharing.",
        element: "aether",
        archetype: "oracle",
        confidence: 0.8,
        metadata: {
          error: "Failed to get proper response"
        }
      };
    } catch (error) {
      console.error('Error in PersonalOracleAgentBridge:', error);

      // Return a safe fallback response
      return {
        content: "I sense there's something important here. Could you share more about what's present for you?",
        element: "aether",
        archetype: "oracle",
        confidence: 0.7,
        metadata: {
          error: error.message || "Unknown error occurred"
        }
      };
    }
  }

  async processMessage(message: string): Promise<any> {
    return {
      content: "Oracle response placeholder",
      emotion: "neutral",
      transformationType: "none",
      timestamp: new Date().toISOString()
    };
  }

  getTransformationMetrics(): any {
    return {
      active: false,
      metrics: "Not implemented yet"
    };
  }

  async activateRetreatMode(phase: string): Promise<void> {
    console.log(`Retreat mode activated: ${phase}`);
  }

  async offerWeeklyReflection(): Promise<string> {
    return "Weekly reflection coming soon";
  }
}

// Export singleton instance as personalOracle for backward compatibility
export const personalOracle = new PersonalOracleAgentBridge();

// Export PersonalOracleAgent alias for routes that expect it
export const PersonalOracleAgent = PersonalOracleAgentBridge;