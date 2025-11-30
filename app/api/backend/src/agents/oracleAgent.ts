import { AgentResponse } from "../types/agentResponse";
import { getRitualForPhase } from "../lib/ritualEngine";
import { getElementalPhase } from "../lib/spiralLogic";
import type { Metadata } from "../types/metadata";

export class OracleAgent {
  protected debug: boolean;

  constructor(options: { debug?: boolean } = {}) {
    this.debug = options.debug ?? false;
  }

  async processQuery(query: string): Promise<AgentResponse> {
    if (this.debug) {
      console.log("[OracleAgent] Processing query:", query);
    }

    const detectedElement = this.detectElement(query);
    const ritual = getRitualForPhase(detectedElement as any); // Type assertion for Step 2

    const simulatedResponse = `Processed query: ${query}`;
    const metadata: Metadata = {
      timestamp: new Date().toISOString(),
      element: detectedElement,
      processedAt: new Date().toISOString(),
      prefect: {
        task: "simulate",
        status: "success",
      },
      ritual, // 👈 New metadata field
    };

    return {
      content: simulatedResponse,
      response: simulatedResponse, // Legacy compatibility
      confidence: 0.9,
      metadata,
      // routingPath: [detectedElement.toLowerCase(), "oracle-agent"], // Temporarily removed for Step 2
    };
  }

  protected detectElement(text: string): string {
    return getElementalPhase(text); // using spiralLogic.ts
  }
}
