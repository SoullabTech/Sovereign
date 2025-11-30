// routes/fire-agent.routes.ts - Fire Agent API Routes
import { Router } from "express";
import { fireAgent } from "../services/fireAgent";

const router = Router();

/**
 * @route POST /api/fire-agent/vision-prompt
 * @description Get a fire archetype vision prompt
 */
router.post("/vision-prompt", async (req, res) => {
  try {
    const { userContext } = req.body;
    const result = await fireAgent.getVisionPrompt(userContext);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Fire Agent vision prompt error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate vision prompt",
      message: error.message,
    });
  }
});

/**
 * @route POST /api/fire-agent/oracle-response
 * @description Get a fire archetype oracle response with Maya integration
 */
router.post("/oracle-response", async (req, res) => {
  try {
    const { input, userContext } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        error: "Input is required",
      });
    }

    const result = await fireAgent.getOracleResponse(input, userContext);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Fire Agent oracle response error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate oracle response",
      message: error.message,
    });
  }
});

/**
 * @route GET /api/fire-agent/health
 * @description Health check for Fire Agent
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    agent: "Fire",
    archetype: "Vision & Creative Transformation",
    status: "active",
    features: [
      "Maya Wisdom Framework Integration",
      "Projection Detection & Aikido",
      "Spiral Phase Recognition",
      "Voice Synthesis",
      "Authenticity Validation",
    ],
    timestamp: new Date().toISOString(),
  });
});

export default router;
