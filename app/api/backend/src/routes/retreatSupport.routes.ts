// Retreat Support Routes - Real-time participant management
import { Router, Request, Response } from "express";
import { retreatSupportService } from "../services/retreatSupportService";
import { groupDynamicsService } from "../services/groupDynamicsService";
import { z } from "zod";
import { logger } from "../utils/logger";
import { supabase } from "../lib/supabaseClient";

const router = Router();

// Validation schemas
const dailyCheckInSchema = z.object({
  participantId: z.string().uuid(),
  retreatId: z.string().uuid(),
  dayNumber: z.number().min(1).max(7),

  morningState: z.object({
    energyLevel: z.number().min(1).max(10),
    emotionalTone: z.string(),
    bodyAwareness: z.number().min(1).max(10),
    sleepQuality: z.number().min(1).max(10),
    dreams: z.string().optional(),
    intentions: z.string(),
  }),

  elementalBalance: z.object({
    fire: z.number().min(1).max(10),
    water: z.number().min(1).max(10),
    earth: z.number().min(1).max(10),
    air: z.number().min(1).max(10),
    aether: z.number().min(1).max(10),
  }),

  shadowWork: z
    .object({
      patternsNoticed: z.array(z.string()).optional(),
      triggersExperienced: z.array(z.string()).optional(),
      breakthroughMoments: z.string().optional(),
      resistanceAreas: z.array(z.string()).optional(),
    })
    .optional(),

  oracleInsights: z.string().optional(),
  gratitudes: z.array(z.string()).min(1),
  supportNeeded: z.string().optional(),
});

const sessionParticipationSchema = z.object({
  sessionId: z.string().uuid(),
  participantId: z.string().uuid(),
  sessionType: z.enum([
    "opening_circle",
    "elemental_journey",
    "shadow_work",
    "oracle_session",
    "integration",
    "closing_circle",
  ]),

  engagement: z.object({
    presenceLevel: z.number().min(1).max(10),
    shareDepth: z.number().min(1).max(10),
    energyContribution: z.enum([
      "grounding",
      "catalyzing",
      "holding",
      "flowing",
      "integrating",
    ]),
    breakthroughs: z.array(z.string()).optional(),
  }),

  groupResonance: z.object({
    feltSupported: z.number().min(1).max(10),
    supportedOthers: z.number().min(1).max(10),
    groupCoherence: z.number().min(1).max(10),
    conflictsNoticed: z.array(z.string()).optional(),
  }),
});

const collectiveWisdomSchema = z.object({
  retreatId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  type: z.enum(["insight", "revelation", "pattern", "teaching", "vision"]),

  content: z.object({
    essence: z.string().min(10),
    elaboration: z.string().optional(),
    contributors: z.array(z.string().uuid()),
    element: z.enum(["fire", "water", "earth", "air", "aether", "all"]),
    tags: z.array(z.string()),
  }),

  resonance: z.object({
    immediateImpact: z.number().min(1).max(10),
    depthLevel: z.number().min(1).max(10),
    shareability: z.boolean(),
  }),
});

// 1. Daily Check-in Endpoint
router.post("/daily-checkin", async (req: Request, res: Response) => {
  try {
    const validation = dailyCheckInSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid check-in data",
        details: validation.error.format(),
      });
    }

    const checkIn = await retreatSupportService.recordDailyCheckIn(
      validation.data,
    );

    // Get personalized guidance based on check-in
    const guidance = await retreatSupportService.generateDailyGuidance(
      validation.data.participantId,
      validation.data,
    );

    // Update group dynamics
    await groupDynamicsService.updateParticipantState(
      validation.data.retreatId,
      validation.data.participantId,
      validation.data,
    );

    res.json({
      success: true,
      checkIn,
      guidance,
      message: "Check-in received. Your Oracle has guidance for today.",
    });
  } catch (error) {
    logger.error("Daily check-in failed", error);
    res.status(500).json({ error: "Failed to process check-in" });
  }
});

// 2. Get Group Dynamics
router.get(
  "/group-dynamics/:retreatId",
  async (req: Request, res: Response) => {
    try {
      const { retreatId } = req.params;
      const includeIndividual = req.query.includeIndividual === "true";

      const dynamics = await groupDynamicsService.getCurrentDynamics(
        retreatId,
        includeIndividual,
      );

      res.json({
        retreatId,
        timestamp: new Date(),
        dynamics,
        recommendations: dynamics.recommendations,
        visualizations: {
          elementalBalance: dynamics.elementalBalance,
          energyField: dynamics.energyField,
          coherenceMap: dynamics.coherenceMap,
        },
      });
    } catch (error) {
      logger.error("Failed to get group dynamics", error);
      res.status(500).json({ error: "Failed to retrieve group dynamics" });
    }
  },
);

// 3. Live Session Support
router.post("/session/start", async (req: Request, res: Response) => {
  try {
    const { retreatId, sessionType, facilitatorId, intention } = req.body;

    const session = await retreatSupportService.startLiveSession({
      retreatId,
      sessionType,
      facilitatorId,
      intention,
      startTime: new Date(),
    });

    // Initialize real-time tracking
    await retreatSupportService.initializeSessionTracking(session.id);

    res.json({
      success: true,
      session,
      trackingUrl: `/api/retreat/support/session/${session.id}/track`,
      wisdomGatheringUrl: `/api/retreat/support/session/${session.id}/wisdom`,
    });
  } catch (error) {
    logger.error("Failed to start session", error);
    res.status(500).json({ error: "Failed to start live session" });
  }
});

router.post(
  "/session/:sessionId/participation",
  async (req: Request, res: Response) => {
    try {
      const validation = sessionParticipationSchema.safeParse({
        ...req.body,
        sessionId: req.params.sessionId,
      });

      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid participation data",
          details: validation.error.format(),
        });
      }

      const participation = await retreatSupportService.recordParticipation(
        validation.data,
      );

      // Update real-time group field
      await groupDynamicsService.updateSessionDynamics(
        validation.data.sessionId,
        validation.data,
      );

      res.json({
        success: true,
        participation,
        groupField: await groupDynamicsService.getSessionField(
          validation.data.sessionId,
        ),
      });
    } catch (error) {
      logger.error("Failed to record participation", error);
      res.status(500).json({ error: "Failed to record session participation" });
    }
  },
);

router.post("/session/:sessionId/end", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { closingInsights, nextSteps } = req.body;

    const summary = await retreatSupportService.endLiveSession(sessionId, {
      closingInsights,
      nextSteps,
    });

    res.json({
      success: true,
      summary,
      message: "Session closed. Wisdom has been integrated.",
    });
  } catch (error) {
    logger.error("Failed to end session", error);
    res.status(500).json({ error: "Failed to close session" });
  }
});

// 4. Collective Wisdom Gathering
router.post("/wisdom/capture", async (req: Request, res: Response) => {
  try {
    const validation = collectiveWisdomSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid wisdom data",
        details: validation.error.format(),
      });
    }

    const wisdom = await retreatSupportService.captureCollectiveWisdom(
      validation.data,
    );

    // Notify participants of new wisdom
    await retreatSupportService.broadcastWisdom(
      validation.data.retreatId,
      wisdom,
    );

    res.json({
      success: true,
      wisdom,
      message: "Collective wisdom captured and shared with the group.",
    });
  } catch (error) {
    logger.error("Failed to capture wisdom", error);
    res.status(500).json({ error: "Failed to capture collective wisdom" });
  }
});

router.get("/wisdom/:retreatId", async (req: Request, res: Response) => {
  try {
    const { retreatId } = req.params;
    const { element, type, limit = 20 } = req.query;

    const wisdomStream = await retreatSupportService.getCollectiveWisdom(
      retreatId,
      {
        element: element as string,
        type: type as string,
        limit: parseInt(limit as string),
      },
    );

    res.json({
      retreatId,
      wisdomCount: wisdomStream.length,
      wisdom: wisdomStream,
      elements: await retreatSupportService.getWisdomByElement(retreatId),
    });
  } catch (error) {
    logger.error("Failed to retrieve wisdom", error);
    res.status(500).json({ error: "Failed to retrieve collective wisdom" });
  }
});

// 5. Real-time Participant Insights
router.get("/insights/:participantId", async (req: Request, res: Response) => {
  try {
    const { participantId } = req.params;
    const { retreatId } = req.query;

    const insights = await retreatSupportService.getParticipantInsights(
      participantId,
      retreatId as string,
    );

    res.json({
      participantId,
      insights,
      recommendations: insights.recommendations,
      oracleGuidance: insights.oracleGuidance,
    });
  } catch (error) {
    logger.error("Failed to get participant insights", error);
    res.status(500).json({ error: "Failed to retrieve participant insights" });
  }
});

router.get(
  "/insights/facilitator/:retreatId",
  async (req: Request, res: Response) => {
    try {
      const { retreatId } = req.params;

      const dashboard =
        await retreatSupportService.getFacilitatorDashboard(retreatId);

      res.json({
        retreatId,
        timestamp: new Date(),
        dashboard,
        alerts: dashboard.alerts,
        supportNeeded: dashboard.supportNeeded,
        groupHealth: dashboard.groupHealth,
      });
    } catch (error) {
      logger.error("Failed to get facilitator dashboard", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve facilitator insights" });
    }
  },
);

// WebSocket endpoint for real-time updates
router.get("/realtime/:retreatId", async (req: Request, res: Response) => {
  const { retreatId } = req.params;

  res.json({
    message: "WebSocket connection info",
    wsUrl: `wss://${req.hostname}/ws/retreat/${retreatId}`,
    channels: [
      "group-field",
      "participant-updates",
      "wisdom-stream",
      "facilitator-alerts",
    ],
  });
});

// Elemental field tracking
router.get(
  "/field/:retreatId/elemental",
  async (req: Request, res: Response) => {
    try {
      const { retreatId } = req.params;

      const field = await groupDynamicsService.getElementalField(retreatId);

      res.json({
        retreatId,
        timestamp: new Date(),
        field,
        dominantElement: field.dominant,
        missingElements: field.missing,
        recommendations: field.balancingRecommendations,
      });
    } catch (error) {
      logger.error("Failed to get elemental field", error);
      res.status(500).json({ error: "Failed to retrieve elemental field" });
    }
  },
);

// Emergency support
router.post("/support/urgent", async (req: Request, res: Response) => {
  try {
    const { participantId, retreatId, issue, urgencyLevel } = req.body;

    const support = await retreatSupportService.requestUrgentSupport({
      participantId,
      retreatId,
      issue,
      urgencyLevel,
      timestamp: new Date(),
    });

    // Alert facilitators
    await retreatSupportService.alertFacilitators(retreatId, support);

    res.json({
      success: true,
      support,
      message:
        "Support request received. A facilitator will connect with you shortly.",
    });
  } catch (error) {
    logger.error("Failed to request urgent support", error);
    res.status(500).json({ error: "Failed to process support request" });
  }
});

// Integration tracking
router.post(
  "/integration/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;
      const { retreatId, insights, commitments, practicesAdopted } = req.body;

      const integration = await retreatSupportService.trackIntegration({
        participantId,
        retreatId,
        insights,
        commitments,
        practicesAdopted,
        recordedAt: new Date(),
      });

      res.json({
        success: true,
        integration,
        followUpScheduled: integration.followUpDate,
        oracleSupport: "Your Oracle remains available for integration support",
      });
    } catch (error) {
      logger.error("Failed to track integration", error);
      res.status(500).json({ error: "Failed to record integration" });
    }
  },
);

export default router;
