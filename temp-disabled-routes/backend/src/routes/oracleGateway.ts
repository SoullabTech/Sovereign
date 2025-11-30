import { Router, Request, Response } from "express";
import { AgentRegistry } from "../core/factories/AgentRegistry";

const router = Router();
const registry = new AgentRegistry();

interface OracleRequest {
  userId: string;
  query: string;
  targetElement: string;
  context?: Record<string, any>;
}

interface OracleResponse {
  element: string;
  archetype: string;
  message: string;
  metadata: Record<string, any>;
}

router.post("/api/v1/oracle", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      query,
      targetElement,
      context = {},
    }: OracleRequest = req.body;

    // Validation
    if (!userId || !query || !targetElement) {
      return res.status(400).json({
        error: "Missing required fields: userId, query, and targetElement",
      });
    }

    // Validate targetElement
    const validElements = ["fire", "water", "earth", "air", "aether"];
    if (!validElements.includes(targetElement.toLowerCase())) {
      return res.status(400).json({
        error:
          "Invalid targetElement. Must be one of: fire, water, earth, air, aether",
      });
    }

    // Create agent using factory
    const agent = registry.createAgent(targetElement);

    // Process query (need to handle the method signature)
    let message: string;
    if (typeof agent.processQuery === "function") {
      const result = await agent.processQuery(query);
      message =
        typeof result === "string"
          ? result
          : (result as any).message || "No response";
    } else {
      message = `${targetElement} agent processing: ${query}`;
    }

    // Get archetype info
    const archetype = (agent as any).getArchetype
      ? (agent as any).getArchetype()
      : targetElement;

    const response: OracleResponse = {
      element: targetElement,
      archetype,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        context,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Oracle Gateway Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default router;
