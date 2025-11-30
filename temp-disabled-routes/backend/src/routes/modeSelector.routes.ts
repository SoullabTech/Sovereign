// ===============================================
// ORACLE MODE SELECTOR API ROUTES
// Frontend integration for mode switching and wisdom routing
// ===============================================

import { Router, Request, Response } from "express";
import { logger } from "../../utils/logger.js";
import { PersonalOracleAgent } from "../../core/agents/adjusterAgent";
import { authenticateToken } from "../../middleware/authenticateToken.js";

const router = Router();

// Store oracle instances per user (in production, use proper session management)
const oracleInstances = new Map<string, PersonalOracleAgent>();

// ===============================================
// HELPER FUNCTIONS
// ===============================================

function getOrCreateOracle(userId: string): PersonalOracleAgent {
  if (!oracleInstances.has(userId)) {
    const oracle = new PersonalOracleAgent({
      userId,
      oracleName: "Sacred Mirror",
      mode: "daily",
      elementalResonance: "aether",
    });
    oracleInstances.set(userId, oracle);
    logger.info(`Created new oracle instance for user: ${userId}`);
  }

  return oracleInstances.get(userId)!;
}

// ===============================================
// ROUTES
// ===============================================

// Switch Oracle Mode
router.post(
  "/switch-mode",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { modeId } = req.body;
      const userId = (req as any).user?.id || "demo-user";

      if (!modeId) {
        return res.status(400).json({
          success: false,
          message: "Mode ID is required",
        });
      }

      const oracle = getOrCreateOracle(userId);

      // Switch the mode
      const result = await oracle.switchMode(modeId);

      // Get updated status
      const status = oracle.getCurrentModeStatus();

      logger.info("Oracle mode switched via API:", {
        userId,
        newMode: modeId,
        success: result.success,
      });

      res.json({
        ...result,
        modeInfo: {
          ...result.modeInfo,
          status,
        },
      });
    } catch (error) {
      logger.error("Error in switch-mode route:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
);

// Get all available modes
router.get(
  "/available-modes",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || "demo-user";
      const oracle = getOrCreateOracle(userId);

      const modes = oracle.getAllAvailableModes();
      const currentStatus = oracle.getCurrentModeStatus();

      res.json({
        success: true,
        modes,
        currentStatus,
      });
    } catch (error) {
      logger.error("Error in available-modes route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch available modes",
      });
    }
  },
);

// Suggest mode based on user input
router.post(
  "/suggest-mode",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { userInput } = req.body;
      const userId = (req as any).user?.id || "demo-user";

      if (!userInput) {
        return res.status(400).json({
          success: false,
          message: "User input is required",
        });
      }

      const oracle = getOrCreateOracle(userId);

      // Get mode suggestion
      const suggestion = await oracle.suggestModeForInput(userInput);

      logger.info("Mode suggestion generated:", {
        userId,
        userInput: userInput.substring(0, 100),
        suggestion: suggestion.suggestedMode,
        confidence: suggestion.confidence,
      });

      res.json({
        success: true,
        ...suggestion,
      });
    } catch (error) {
      logger.error("Error in suggest-mode route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate mode suggestion",
      });
    }
  },
);

// Get current wisdom routing status
router.get(
  "/wisdom-status",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || "demo-user";
      const oracle = getOrCreateOracle(userId);

      const status = oracle.getCurrentModeStatus();
      const wisdomRouting = oracle.getWisdomRouting();
      const sacredMirrorStatus = oracle.getSacredMirrorStatus();

      res.json({
        success: true,
        currentOracleMode: status.currentOracleMode,
        currentWisdomMode: status.currentWisdomMode,
        sacredMirrorMode: status.sacredMirrorMode,
        wisdomRouting,
        sacredMirrorStatus,
        modeHistory: status.modeHistory,
        capabilities: status.capabilities,
      });
    } catch (error) {
      logger.error("Error in wisdom-status route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch wisdom status",
      });
    }
  },
);

// Manually set wisdom mode
router.post(
  "/set-wisdom-mode",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { wisdomMode } = req.body;
      const userId = (req as any).user?.id || "demo-user";

      if (!wisdomMode || !["jung", "buddha", "hybrid"].includes(wisdomMode)) {
        return res.status(400).json({
          success: false,
          message: "Valid wisdom mode is required (jung, buddha, or hybrid)",
        });
      }

      const oracle = getOrCreateOracle(userId);
      oracle.setWisdomMode(wisdomMode);

      const updatedStatus = oracle.getCurrentModeStatus();

      logger.info("Wisdom mode manually set:", {
        userId,
        wisdomMode,
        oracleMode: updatedStatus.currentOracleMode,
      });

      res.json({
        success: true,
        message: `Wisdom mode set to ${wisdomMode}`,
        status: updatedStatus,
      });
    } catch (error) {
      logger.error("Error in set-wisdom-mode route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set wisdom mode",
      });
    }
  },
);

// Set sacred mirror mode
router.post(
  "/set-sacred-mirror-mode",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { sacredMirrorMode } = req.body;
      const userId = (req as any).user?.id || "demo-user";

      if (
        !sacredMirrorMode ||
        !["jung", "buddha", "hybrid", "adaptive"].includes(sacredMirrorMode)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid sacred mirror mode is required (jung, buddha, hybrid, or adaptive)",
        });
      }

      const oracle = getOrCreateOracle(userId);
      const result = await oracle.setSacredMirrorMode(sacredMirrorMode);

      const updatedStatus = oracle.getCurrentModeStatus();

      logger.info("Sacred mirror mode set:", {
        userId,
        sacredMirrorMode,
        result,
      });

      res.json({
        success: true,
        message: result,
        status: updatedStatus,
      });
    } catch (error) {
      logger.error("Error in set-sacred-mirror-mode route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set sacred mirror mode",
      });
    }
  },
);

// Analyze user patterns
router.get(
  "/analyze-patterns",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || "demo-user";
      const oracle = getOrCreateOracle(userId);

      const analysis = await oracle.analyzeUserPatterns();
      const wisdomRouting = oracle.getWisdomRouting();

      res.json({
        success: true,
        patternAnalysis: analysis,
        currentWisdomRouting: wisdomRouting,
        recommendations: analysis.analysis?.recommendations || [],
      });
    } catch (error) {
      logger.error("Error in analyze-patterns route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to analyze patterns",
      });
    }
  },
);

// Get today's sacred practice
router.get(
  "/todays-sacred-practice",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || "demo-user";
      const oracle = getOrCreateOracle(userId);

      const practice = await oracle.getTodaysSacredPractice();
      const wisdomMode = oracle.getCurrentWisdomMode();

      res.json({
        success: true,
        practice,
        currentWisdomMode: wisdomMode,
        message: "Today's sacred practice retrieved",
      });
    } catch (error) {
      logger.error("Error in todays-sacred-practice route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get today's sacred practice",
      });
    }
  },
);

// Get weekly sacred overview
router.get(
  "/weekly-sacred-overview",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || "demo-user";
      const oracle = getOrCreateOracle(userId);

      const overview = await oracle.getWeeklySacredOverview();

      res.json({
        success: true,
        overview,
        message: "Weekly sacred overview retrieved",
      });
    } catch (error) {
      logger.error("Error in weekly-sacred-overview route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get weekly sacred overview",
      });
    }
  },
);

// Weekly reflection
router.get(
  "/weekly-reflection",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || "demo-user";
      const oracle = getOrCreateOracle(userId);

      const reflection = await oracle.reflectOnWeeklyCycle();

      res.json({
        success: true,
        reflection,
        message: "Weekly reflection generated",
      });
    } catch (error) {
      logger.error("Error in weekly-reflection route:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate weekly reflection",
      });
    }
  },
);

export default router;
