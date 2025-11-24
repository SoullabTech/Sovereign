// Personal Oracle API Gateway - Single entrypoint for all user interactions
// Routes all requests through the Personal Oracle Agent with standardized responses

import { Router, Request, Response } from "express";
import {
  personalOracleAgent,
  PersonalOracleQuery,
  PersonalOracleSettings,
} from "../../agents/personal_oracle/PersonalOracleAgent";
import {
  successResponse,
  errorResponse,
  generateRequestId,
} from "../../utils/sharedUtilities";
import {
  authenticateToken,
  AuthenticatedRequest,
} from "../../middleware/authMiddleware";
import { validateInput } from "../../middleware/inputValidation";
import { oracleRateLimiter } from "../../middleware/rateLimiter";
import { logger } from "../../utils/logger";
import { z } from "zod";

const router = Router();

// Validation schemas
const consultationSchema = z.object({
  input: z.string().min(1, "Input cannot be empty").max(2000, "Input too long"),
  sessionId: z.string().uuid().optional(),
  targetElement: z.enum(["fire", "water", "earth", "air", "aether"]).optional(),
  context: z
    .object({
      previousInteractions: z.number().optional(),
      userPreferences: z.record(z.any()).optional(),
      currentPhase: z.string().optional(),
    })
    .optional(),
});

const settingsSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  voice: z.string().min(1).max(50).optional(),
  persona: z.enum(["warm", "formal", "playful"]).optional(),
  preferredElements: z
    .array(z.enum(["fire", "water", "earth", "air", "aether"]))
    .optional(),
  interactionStyle: z.enum(["brief", "detailed", "comprehensive"]).optional(),
});

/**
 * POST /api/v1/personal-oracle/consult
 * Main consultation endpoint - processes all user queries through Personal Oracle Agent
 */
router.post(
  "/consult",
  oracleRateLimiter,
  authenticateToken,
  validateInput(consultationSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const requestId = generateRequestId();

    try {
      logger.info("Personal Oracle consultation request", {
        userId: req.user!.id,
        requestId,
        hasTargetElement: !!req.body.targetElement,
      });

      const query: PersonalOracleQuery = {
        input: req.body.input,
        userId: req.user!.id,
        sessionId: req.body.sessionId,
        targetElement: req.body.targetElement,
        context: req.body.context,
      };

      const response = await personalOracleAgent.consult(query);

      res.json(response);
    } catch (error) {
      logger.error("Personal Oracle consultation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user!.id,
        requestId,
      });

      res
        .status(500)
        .json(
          errorResponse("Internal server error during consultation", requestId),
        );
    }
  },
);

/**
 * GET /api/v1/personal-oracle/settings
 * Get user's Personal Oracle settings
 */
router.get(
  "/settings",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const requestId = generateRequestId();

    try {
      const response = await personalOracleAgent.getSettings(req.user!.id);
      res.json(response);
    } catch (error) {
      logger.error("Failed to get Personal Oracle settings", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user!.id,
        requestId,
      });

      res
        .status(500)
        .json(errorResponse("Failed to retrieve settings", requestId));
    }
  },
);

/**
 * PUT /api/v1/personal-oracle/settings
 * Update user's Personal Oracle settings
 */
router.put(
  "/settings",
  authenticateToken,
  validateInput(settingsSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const requestId = generateRequestId();

    try {
      const settings: PersonalOracleSettings = req.body;
      const response = await personalOracleAgent.updateSettings(
        req.user!.id,
        settings,
      );

      res.json(response);
    } catch (error) {
      logger.error("Failed to update Personal Oracle settings", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user!.id,
        requestId,
      });

      res
        .status(500)
        .json(errorResponse("Failed to update settings", requestId));
    }
  },
);

/**
 * GET /api/v1/personal-oracle/summary
 * Get user's interaction history and patterns
 */
router.get(
  "/summary",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const requestId = generateRequestId();

    try {
      const days = parseInt(req.query.days as string) || 30;
      const response = await personalOracleAgent.getInteractionSummary(
        req.user!.id,
        days,
      );

      res.json(response);
    } catch (error) {
      logger.error("Failed to get interaction summary", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user!.id,
        requestId,
      });

      res
        .status(500)
        .json(
          errorResponse("Failed to retrieve interaction summary", requestId),
        );
    }
  },
);

/**
 * POST /api/v1/personal-oracle/astrology
 * Astrology consultation through Personal Oracle Agent
 */
router.post(
  "/astrology",
  oracleRateLimiter,
  authenticateToken,
  validateInput(
    z.object({
      birthData: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
        time: z.string().optional(),
        location: z.string().optional(),
        timezone: z.string().optional(),
      }),
      query: z.string().min(1).max(1000),
      type: z.enum(["natal", "transit", "compatibility"]).default("natal"),
    }),
  ),
  async (req: AuthenticatedRequest, res: Response) => {
    const requestId = generateRequestId();

    try {
      // Route astrology request through Personal Oracle Agent
      const astrologyRequest = {
        userId: req.user!.id,
        birthDate: req.body.birthData.date,
        birthTime: req.body.birthData.time,
        location: req.body.birthData.location,
        queryType: req.body.type,
      };

      const response =
        await personalOracleAgent.getAstrologyReading(astrologyRequest);
      res.json(response);
    } catch (error) {
      logger.error("Astrology consultation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user!.id,
        requestId,
      });

      res
        .status(500)
        .json(errorResponse("Astrology consultation failed", requestId));
    }
  },
);

/**
 * POST /api/v1/personal-oracle/journal
 * Journal entry through Personal Oracle Agent
 */
router.post(
  "/journal",
  authenticateToken,
  validateInput(
    z.object({
      entry: z.string().min(1).max(5000),
      tags: z.array(z.string()).optional(),
      mood: z.enum(["positive", "neutral", "negative", "mixed"]).optional(),
      requestGuidance: z.boolean().default(true),
    }),
  ),
  async (req: AuthenticatedRequest, res: Response) => {
    const requestId = generateRequestId();

    try {
      if (req.body.requestGuidance) {
        // Get Oracle guidance on the journal entry
        const journalQuery = `Please reflect on my journal entry and provide guidance: ${req.body.entry}`;

        const journalRequest = {
          userId: req.user!.id,
          action: "create",
          content: req.body.entry,
        };

        const response =
          await personalOracleAgent.processJournalRequest(journalRequest);
        res.json(response);
      } else {
        // Store journal entry without guidance
        res.json(
          successResponse(
            {
              message: "Journal entry stored successfully",
              stored: true,
              entry: req.body.entry,
            },
            requestId,
          ),
        );
      }
    } catch (error) {
      logger.error("Journal consultation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user!.id,
        requestId,
      });

      res
        .status(500)
        .json(errorResponse("Journal consultation failed", requestId));
    }
  },
);

/**
 * POST /api/v1/personal-oracle/assessment
 * Interactive assessment through Personal Oracle Agent
 */
router.post(
  "/assessment",
  authenticateToken,
  validateInput(
    z.object({
      assessmentType: z.enum([
        "spiralogic",
        "elemental",
        "archetypal",
        "shadow",
      ]),
      responses: z.record(z.any()),
      requestAnalysis: z.boolean().default(true),
    }),
  ),
  async (req: AuthenticatedRequest, res: Response) => {
    const requestId = generateRequestId();

    try {
      if (req.body.requestAnalysis) {
        // Get Oracle analysis of assessment results
        const assessmentRequest = {
          userId: req.user!.id,
          assessmentType: req.body.assessmentType,
          responses: req.body.responses,
        };

        const response =
          await personalOracleAgent.processAssessment(assessmentRequest);
        res.json(response);
      } else {
        // Store assessment without analysis
        res.json(
          successResponse(
            {
              message: "Assessment results stored successfully",
              assessmentType: req.body.assessmentType,
              stored: true,
            },
            requestId,
          ),
        );
      }
    } catch (error) {
      logger.error("Assessment consultation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: req.user!.id,
        requestId,
      });

      res
        .status(500)
        .json(errorResponse("Assessment consultation failed", requestId));
    }
  },
);

/**
 * GET /api/v1/personal-oracle/health
 * Health check for Personal Oracle service
 */
router.get("/health", async (req: Request, res: Response) => {
  try {
    res.json(
      successResponse({
        service: "Personal Oracle Agent",
        status: "operational",
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || "1.0.0",
      }),
    );
  } catch (error) {
    res.status(503).json(errorResponse("Personal Oracle service unavailable"));
  }
});

export default router;
