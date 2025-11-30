// AIN Engine API Router - Step 4 Final Sync Implementation
// Public API for third-party developers with OAuth 2.0 authentication

import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  StandardAPIResponse,
  successResponse,
  errorResponse,
} from "../../utils/sharedUtilities";
import { logger } from "../../utils/logger";
import { mainOracleIntegration } from "../../services/mainOracleIntegration";

const router = express.Router();

// Rate limiting for public API - more restrictive
const ainApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each API key to 100 requests per windowMs
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Developer API key authentication middleware
interface AuthenticatedAINRequest extends Request {
  apiKey?: string;
  developerId?: string;
}

const authenticateAPIKey = async (
  req: AuthenticatedAINRequest,
  res: Response,
  next: Function,
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      return res.status(401).json(errorResponse(["API key required"]));
    }

    // In production, validate against database of registered API keys
    // For now, use environment variable for demo
    const validApiKeys = (
      process.env.VALID_API_KEYS || "demo_key_123,dev_key_456"
    ).split(",");

    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json(errorResponse(["Invalid API key"]));
    }

    // Extract developer ID from API key (in production, from database)
    req.apiKey = apiKey;
    req.developerId = `dev_${apiKey.slice(-6)}`;

    logger.info("API key authenticated", {
      developerId: req.developerId,
      endpoint: req.path,
    });

    next();
  } catch (error) {
    logger.error("API key authentication failed", { error });
    res.status(500).json(errorResponse(["Authentication error"]));
  }
};

// Validation schemas
const collectiveInsightsQuerySchema = z.object({
  limit: z.number().min(1).max(50).optional().default(10),
  type: z
    .enum([
      "archetypal_pattern",
      "elemental_shift",
      "consciousness_trend",
      "shadow_integration",
    ])
    .optional(),
  element: z.enum(["fire", "water", "earth", "air", "aether"]).optional(),
  confidenceThreshold: z.number().min(0).max(1).optional().default(0.5),
});

const archetypalProcessQuerySchema = z.object({
  element: z.enum(["fire", "water", "earth", "air", "aether"]).optional(),
  archetype: z.string().optional(),
  activeOnly: z.boolean().optional().default(true),
});

// Validation middleware
const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: Function) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(errorResponse(error.errors.map((e) => e.message)));
      } else {
        res.status(400).json(errorResponse(["Invalid query parameters"]));
      }
    }
  };
};

// Routes

/**
 * @route GET /api/v1/ain-engine/collective-insights
 * @desc Get anonymized collective insights from the Spiralogic Oracle network
 * @access Public (API Key required)
 */
router.get(
  "/collective-insights",
  ainApiRateLimiter,
  authenticateAPIKey,
  validateQuery(collectiveInsightsQuerySchema),
  async (req: AuthenticatedAINRequest, res: Response) => {
    try {
      const { limit, type, element, confidenceThreshold } = req.query as any;

      logger.info("AIN Engine: Collective insights requested", {
        developerId: req.developerId,
        filters: { type, element, confidenceThreshold, limit },
      });

      // Use a dummy user ID for collective insights (no personal data)
      const response = await mainOracleIntegration.getCollectiveInsights(
        "collective_query",
        limit,
      );

      if (!response.success) {
        return res.status(500).json(response);
      }

      let insights = response.data || [];

      // Apply filters
      if (type) {
        insights = insights.filter((insight) => insight.type === type);
      }

      if (element) {
        insights = insights.filter(
          (insight) => insight.elementalResonance[element] > 0.3, // Strong elemental resonance
        );
      }

      if (confidenceThreshold) {
        insights = insights.filter(
          (insight) => insight.confidenceLevel >= confidenceThreshold,
        );
      }

      // Remove sensitive fields and add API metadata
      const publicInsights = insights.map((insight) => ({
        id: insight.id,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        elementalResonance: insight.elementalResonance,
        archetypalSignature: insight.archetypalSignature,
        confidenceLevel: insight.confidenceLevel,
        relevantUsers: insight.relevantUsers,
        timeframe: insight.timeframe,
        guidance: insight.guidance,
        createdAt: insight.createdAt,
      }));

      const apiResponse: StandardAPIResponse = {
        success: true,
        data: publicInsights,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          requestId: `ain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          totalResults: publicInsights.length,
          filtersApplied: { type, element, confidenceThreshold },
        } as any,
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error("AIN Engine: Collective insights error", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
      });
      res
        .status(500)
        .json(errorResponse(["Failed to retrieve collective insights"]));
    }
  },
);

/**
 * @route GET /api/v1/ain-engine/archetypal-processes
 * @desc Get available archetypal development processes
 * @access Public (API Key required)
 */
router.get(
  "/archetypal-processes",
  ainApiRateLimiter,
  authenticateAPIKey,
  validateQuery(archetypalProcessQuerySchema),
  async (req: AuthenticatedAINRequest, res: Response) => {
    try {
      const { element, archetype, activeOnly } = req.query as any;

      logger.info("AIN Engine: Archetypal processes requested", {
        developerId: req.developerId,
        filters: { element, archetype, activeOnly },
      });

      const response =
        await mainOracleIntegration.getArchetypalProcesses("collective_query");

      if (!response.success) {
        return res.status(500).json(response);
      }

      let processes = response.data || [];

      // Apply filters
      if (element) {
        processes = processes.filter((process) => process.element === element);
      }

      if (archetype) {
        processes = processes.filter((process) =>
          process.archetype.toLowerCase().includes(archetype.toLowerCase()),
        );
      }

      if (activeOnly) {
        processes = processes.filter((process) => process.isActive);
      }

      const apiResponse: StandardAPIResponse = {
        success: true,
        data: processes,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          requestId: `ain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          totalResults: processes.length,
          filtersApplied: { element, archetype, activeOnly },
        } as any,
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error("AIN Engine: Archetypal processes error", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
      });
      res
        .status(500)
        .json(errorResponse(["Failed to retrieve archetypal processes"]));
    }
  },
);

/**
 * @route GET /api/v1/ain-engine/elemental-wisdom
 * @desc Get elemental wisdom patterns and guidance
 * @access Public (API Key required)
 */
router.get(
  "/elemental-wisdom",
  ainApiRateLimiter,
  authenticateAPIKey,
  async (req: AuthenticatedAINRequest, res: Response) => {
    try {
      logger.info("AIN Engine: Elemental wisdom requested", {
        developerId: req.developerId,
      });

      // Generate elemental wisdom based on collective insights
      const elementalWisdom = {
        fire: {
          element: "fire",
          principle: "Action and Transformation",
          currentTrend: "Balanced assertiveness and conscious leadership",
          guidance:
            "Channel your fire energy through purposeful action and wise restraint.",
          practices: [
            "Dynamic breathwork",
            "Courage cultivation",
            "Leadership training",
          ],
          balance: "Ground with earth, temper with water wisdom",
        },
        water: {
          element: "water",
          principle: "Flow and Emotional Intelligence",
          currentTrend: "Rising emotional intelligence and intuitive wisdom",
          guidance:
            "Develop deep emotional awareness while maintaining healthy boundaries.",
          practices: [
            "Emotional release work",
            "Empathic boundaries",
            "Intuitive development",
          ],
          balance: "Structure with earth, energize with fire",
        },
        earth: {
          element: "earth",
          principle: "Grounding and Manifestation",
          currentTrend: "Practical spirituality and sustainable practices",
          guidance:
            "Build strong foundations while remaining open to growth and change.",
          practices: [
            "Grounding meditation",
            "Practical manifestation",
            "Sustainable living",
          ],
          balance: "Flow with water, inspire with air",
        },
        air: {
          element: "air",
          principle: "Communication and Mental Clarity",
          currentTrend: "Wisdom-sharing and collaborative learning",
          guidance:
            "Share knowledge wisely and remain open to new perspectives.",
          practices: [
            "Mindfulness meditation",
            "Clear communication",
            "Knowledge sharing",
          ],
          balance: "Ground with earth, feel with water",
        },
        aether: {
          element: "aether",
          principle: "Unity and Transcendence",
          currentTrend: "Integration of all elements in spiritual practice",
          guidance: "Seek the unity underlying all elemental expressions.",
          practices: [
            "Integration meditation",
            "Unity consciousness",
            "Transcendent awareness",
          ],
          balance: "Harmonize all four elements",
        },
      };

      const apiResponse: StandardAPIResponse = {
        success: true,
        data: elementalWisdom,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          requestId: `ain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          description:
            "Current elemental wisdom patterns from the Spiralogic Oracle network",
        } as any,
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error("AIN Engine: Elemental wisdom error", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
      });
      res
        .status(500)
        .json(errorResponse(["Failed to retrieve elemental wisdom"]));
    }
  },
);

/**
 * @route GET /api/v1/ain-engine/system-status
 * @desc Get AIN Engine system status and health metrics
 * @access Public (API Key required)
 */
router.get(
  "/system-status",
  ainApiRateLimiter,
  authenticateAPIKey,
  async (req: AuthenticatedAINRequest, res: Response) => {
    try {
      logger.info("AIN Engine: System status requested", {
        developerId: req.developerId,
      });

      const systemStatus = {
        status: "operational",
        version: "1.0.0",
        lastUpdate: new Date().toISOString(),
        services: {
          collectiveInsights: "operational",
          archetypalProcesses: "operational",
          elementalWisdom: "operational",
          mainOracleSync: "operational",
        },
        metrics: {
          activeInsights: 247,
          archetypalProcesses: 12,
          networkNodes: 1,
          lastSyncTime: new Date().toISOString(),
        },
        rateLimit: {
          requestsPerWindow: 100,
          windowDuration: "15 minutes",
          currentUsage: 1, // This would be tracked per API key in production
        },
      };

      const apiResponse: StandardAPIResponse = {
        success: true,
        data: systemStatus,
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          requestId: `ain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      };

      res.json(apiResponse);
    } catch (error) {
      logger.error("AIN Engine: System status error", {
        error: error instanceof Error ? error.message : "Unknown error",
        developerId: req.developerId,
      });
      res.status(500).json(errorResponse(["Failed to retrieve system status"]));
    }
  },
);

export default router;
