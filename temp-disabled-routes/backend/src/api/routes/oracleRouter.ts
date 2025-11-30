import { Router } from "express";
import { AgentRegistry } from "../../core/factories/AgentRegistry";
import { getCachedPattern } from "../../services/CachedOracleService";

const router = Router();
const registry = new AgentRegistry();

interface OracleRequest {
  userId: string;
  query: string;
  targetElement: string;
}

interface OracleResponse {
  element: string;
  archetype: string;
  message: string;
  metadata: Record<string, any>;
}

router.post("/api/v1/oracle", async (req, res) => {
  try {
    const { userId, query, targetElement }: OracleRequest = req.body;

    if (!userId || !query || !targetElement) {
      return res.status(400).json({
        error: "Missing required fields: userId, query, targetElement",
      });
    }

    const result = await getCachedPattern(userId, targetElement, async () => {
      const agent = registry.createAgent(targetElement);
      return await agent.processQuery(query);
    });

    const response: OracleResponse = {
      element: targetElement,
      archetype: result.archetype || "unknown",
      message: result.response || result.message || result,
      metadata: {
        timestamp: new Date().toISOString(),
        cached: false,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Oracle API error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
