// routes/water-agent.routes.ts - Water Agent API Routes
import { Router } from "express";
import { waterAgent } from "../services/waterAgent";

const router = Router();

/**
 * @route POST /api/water-agent/emotional-prompt
 * @description Get a water archetype emotional prompt
 */
router.post("/emotional-prompt", async (req, res) => {
  try {
    const { userContext } = req.body;
    const result = await waterAgent.getEmotionalPrompt(userContext);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Water Agent emotional prompt error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate emotional prompt",
      message: error.message,
    });
  }
});

/**
 * @route POST /api/water-agent/oracle-response
 * @description Get a water archetype oracle response with emotional intelligence
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

    const result = await waterAgent.getOracleResponse(input, userContext);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Water Agent oracle response error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate oracle response",
      message: error.message,
    });
  }
});

/**
 * @route GET /api/water-agent/health
 * @description Health check for Water Agent
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    agent: "Water",
    archetype: "Emotional Intelligence & Flow State",
    status: "active",
    features: [
      "Emotional State Analysis",
      "Flow State Detection & Unblocking",
      "Trauma-Informed Response System",
      "Shadow Work Integration",
      "Maya Wisdom Framework Integration",
      "Voice Synthesis with Water Archetype",
    ],
    capabilities: {
      emotionalIntelligence: [
        "Emotion recognition and validation",
        "Shadow element detection",
        "Emotional complexity assessment",
      ],
      flowState: [
        "Flow blocker identification",
        "Natural activator recognition",
        "Depth assessment",
      ],
      traumaInformed: [
        "Trauma indicator detection",
        "Healing readiness assessment",
        "Integration suggestion generation",
      ],
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
