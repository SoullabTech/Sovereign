// Post-Retreat Support Routes - Long-term transformation tracking
import { Router, Request, Response } from "express";
import { postRetreatService } from "../services/postRetreatService";
import { wisdomKeeperService } from "../services/wisdomKeeperService";
import { z } from "zod";
import { logger } from "../utils/logger";

const router = Router();

// Validation schemas
const transformationUpdateSchema = z.object({
  participantId: z.string().uuid(),
  retreatId: z.string().uuid(),

  currentState: z.object({
    overallWellbeing: z.number().min(1).max(10),
    emotionalClarity: z.number().min(1).max(10),
    spiritualConnection: z.number().min(1).max(10),
    lifeAlignment: z.number().min(1).max(10),
    shadowIntegration: z.number().min(1).max(10),
  }),

  transformations: z.object({
    implemented: z.array(
      z.object({
        area: z.string(),
        description: z.string(),
        impact: z.number().min(1).max(10),
        sustainabilityLevel: z.number().min(1).max(10),
      }),
    ),
    inProgress: z.array(
      z.object({
        area: z.string(),
        description: z.string(),
        challenges: z.array(z.string()).optional(),
        supportNeeded: z.string().optional(),
      }),
    ),
    emerging: z.array(
      z.object({
        area: z.string(),
        description: z.string(),
        readinessLevel: z.number().min(1).max(10),
      }),
    ),
  }),

  practices: z.object({
    dailyPractices: z.array(z.string()),
    weeklyPractices: z.array(z.string()),
    elementalWork: z.object({
      primaryElement: z.string(),
      practices: z.array(z.string()),
      balance: z.number().min(1).max(10),
    }),
  }),

  challenges: z
    .array(
      z.object({
        type: z.string(),
        description: z.string(),
        impactLevel: z.number().min(1).max(10),
        resourcesNeeded: z.array(z.string()).optional(),
      }),
    )
    .optional(),

  celebrations: z
    .array(
      z.object({
        achievement: z.string(),
        date: z.string().datetime(),
        significance: z.string(),
      }),
    )
    .optional(),

  oracleQuestions: z.array(z.string()).optional(),
});

const milestoneSchema = z.object({
  participantId: z.string().uuid(),
  type: z.enum([
    "breakthrough",
    "integration",
    "mastery",
    "service",
    "shadow_work",
    "celebration",
  ]),
  title: z.string(),
  description: z.string(),
  impact: z.object({
    personal: z.string(),
    relational: z.string().optional(),
    collective: z.string().optional(),
  }),
  wisdomGained: z.string(),
  shareWithCommunity: z.boolean().default(false),
});

const wisdomContributionSchema = z.object({
  participantId: z.string().uuid(),
  retreatId: z.string().uuid(),
  type: z.enum(["insight", "practice", "story", "guidance", "blessing"]),
  content: z.object({
    title: z.string(),
    body: z.string(),
    element: z.string(),
    tags: z.array(z.string()),
    context: z.string().optional(),
  }),
  accessibility: z
    .enum(["private", "retreat_alumni", "public"])
    .default("retreat_alumni"),
});

// 1. Transformation Tracking
router.post("/transformation/update", async (req: Request, res: Response) => {
  try {
    const validation = transformationUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid transformation data",
        details: validation.error.format(),
      });
    }

    const update = await postRetreatService.recordTransformationUpdate(
      validation.data,
    );

    // Analyze transformation patterns
    const analysis = await postRetreatService.analyzeTransformationJourney(
      validation.data.participantId,
    );

    // Get personalized guidance
    const guidance = await postRetreatService.generateIntegrationGuidance(
      validation.data.participantId,
      validation.data,
      analysis,
    );

    res.json({
      success: true,
      update,
      analysis,
      guidance,
      nextCheckIn: update.nextCheckInDate,
    });
  } catch (error) {
    logger.error("Failed to update transformation", error);
    res.status(500).json({ error: "Failed to record transformation update" });
  }
});

// Get transformation timeline
router.get(
  "/transformation/timeline/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;
      const { retreatId } = req.query;

      const timeline = await postRetreatService.getTransformationTimeline(
        participantId,
        retreatId as string,
      );

      res.json({
        participantId,
        timeline,
        metrics: timeline.metrics,
        visualizations: {
          growthChart: timeline.growthChart,
          elementalEvolution: timeline.elementalEvolution,
          practiceConsistency: timeline.practiceConsistency,
        },
      });
    } catch (error) {
      logger.error("Failed to get transformation timeline", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve transformation timeline" });
    }
  },
);

// 2. Ongoing Sacred Oracle Guidance
router.post("/oracle/guidance", async (req: Request, res: Response) => {
  try {
    const { participantId, context, question, lifeArea } = req.body;

    // Get participant's retreat data and current state
    const retreatContext =
      await postRetreatService.getParticipantRetreatContext(participantId);

    // Generate contextual guidance
    const guidance = await postRetreatService.generateSacredGuidance({
      participantId,
      context,
      question,
      lifeArea,
      retreatInsights: retreatContext.insights,
      currentTransformations: retreatContext.currentTransformations,
      element: retreatContext.element,
      archetype: retreatContext.archetype,
    });

    // Record the guidance session
    await postRetreatService.recordGuidanceSession(participantId, guidance);

    res.json({
      success: true,
      guidance: guidance.message,
      practices: guidance.practices,
      resources: guidance.resources,
      relatedWisdom: guidance.relatedWisdom,
      nextSteps: guidance.nextSteps,
    });
  } catch (error) {
    logger.error("Failed to generate sacred guidance", error);
    res.status(500).json({ error: "Failed to generate guidance" });
  }
});

// Schedule regular Oracle check-ins
router.post("/oracle/schedule-checkin", async (req: Request, res: Response) => {
  try {
    const { participantId, frequency, preferredTime, focusAreas } = req.body;

    const schedule = await postRetreatService.scheduleOracleCheckIns({
      participantId,
      frequency, // weekly, biweekly, monthly
      preferredTime,
      focusAreas,
    });

    res.json({
      success: true,
      schedule,
      message:
        "Your Oracle check-ins have been scheduled. You'll receive reminders.",
    });
  } catch (error) {
    logger.error("Failed to schedule check-ins", error);
    res.status(500).json({ error: "Failed to schedule Oracle check-ins" });
  }
});

// 3. Progress Celebration & Challenge Navigation
router.post("/milestone/record", async (req: Request, res: Response) => {
  try {
    const validation = milestoneSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid milestone data",
        details: validation.error.format(),
      });
    }

    const milestone = await postRetreatService.recordMilestone(validation.data);

    // Generate celebration message
    const celebration = await postRetreatService.generateCelebration(
      validation.data.participantId,
      milestone,
    );

    // Share with community if requested
    if (validation.data.shareWithCommunity) {
      await postRetreatService.shareWithAlumniCommunity(milestone);
    }

    res.json({
      success: true,
      milestone,
      celebration,
      communityShared: validation.data.shareWithCommunity,
    });
  } catch (error) {
    logger.error("Failed to record milestone", error);
    res.status(500).json({ error: "Failed to record milestone" });
  }
});

// Get milestones and celebrations
router.get(
  "/milestones/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;
      const { type, limit = 20 } = req.query;

      const milestones = await postRetreatService.getMilestones(participantId, {
        type: type as string,
        limit: parseInt(limit as string),
      });

      res.json({
        participantId,
        milestones,
        statistics: {
          totalMilestones: milestones.total,
          byType: milestones.byType,
          recentAchievements: milestones.recent,
        },
      });
    } catch (error) {
      logger.error("Failed to get milestones", error);
      res.status(500).json({ error: "Failed to retrieve milestones" });
    }
  },
);

// Challenge navigation support
router.post("/challenge/support", async (req: Request, res: Response) => {
  try {
    const {
      participantId,
      challengeType,
      description,
      currentApproaches,
      desiredOutcome,
    } = req.body;

    // Get tailored support based on retreat learnings
    const support = await postRetreatService.generateChallengeSupport({
      participantId,
      challengeType,
      description,
      currentApproaches,
      desiredOutcome,
    });

    // Connect with alumni facing similar challenges
    const connections = await postRetreatService.findSimilarJourneys(
      participantId,
      challengeType,
    );

    res.json({
      success: true,
      support,
      resources: support.resources,
      practices: support.practices,
      communityConnections: connections,
      followUpScheduled: support.followUpDate,
    });
  } catch (error) {
    logger.error("Failed to generate challenge support", error);
    res.status(500).json({ error: "Failed to generate support" });
  }
});

// 4. Permanent Wisdom Keeper
router.post("/wisdom/contribute", async (req: Request, res: Response) => {
  try {
    const validation = wisdomContributionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid wisdom contribution",
        details: validation.error.format(),
      });
    }

    const wisdom = await wisdomKeeperService.addWisdom(validation.data);

    // Index for searchability
    await wisdomKeeperService.indexWisdom(wisdom);

    // Notify relevant community members
    if (validation.data.accessibility !== "private") {
      await wisdomKeeperService.notifyRelevantMembers(wisdom);
    }

    res.json({
      success: true,
      wisdom,
      message: "Your wisdom has been preserved in the sacred archive.",
    });
  } catch (error) {
    logger.error("Failed to contribute wisdom", error);
    res.status(500).json({ error: "Failed to add wisdom contribution" });
  }
});

// Search wisdom archive
router.get("/wisdom/search", async (req: Request, res: Response) => {
  try {
    const { query, element, type, tags, participantId } = req.query;

    const results = await wisdomKeeperService.searchWisdom({
      query: query as string,
      element: element as string,
      type: type as string,
      tags: tags ? (tags as string).split(",") : undefined,
      requesterId: participantId as string,
    });

    res.json({
      query: query || "all",
      resultCount: results.length,
      wisdom: results,
      facets: {
        byElement: await wisdomKeeperService.getWisdomFacets("element"),
        byType: await wisdomKeeperService.getWisdomFacets("type"),
        popularTags: await wisdomKeeperService.getPopularTags(),
      },
    });
  } catch (error) {
    logger.error("Failed to search wisdom", error);
    res.status(500).json({ error: "Failed to search wisdom archive" });
  }
});

// Get personal wisdom collection
router.get(
  "/wisdom/personal/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;

      const collection =
        await wisdomKeeperService.getPersonalCollection(participantId);

      res.json({
        participantId,
        collection,
        statistics: {
          contributed: collection.contributed.length,
          bookmarked: collection.bookmarked.length,
          received: collection.received.length,
        },
      });
    } catch (error) {
      logger.error("Failed to get personal collection", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve personal wisdom collection" });
    }
  },
);

// Integration check-in reminders
router.get(
  "/integration/reminders/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;

      const reminders =
        await postRetreatService.getIntegrationReminders(participantId);

      res.json({
        participantId,
        reminders,
        upcomingCheckIns: reminders.scheduled,
        suggestedPractices: reminders.practices,
        communityEvents: reminders.events,
      });
    } catch (error) {
      logger.error("Failed to get reminders", error);
      res
        .status(500)
        .json({ error: "Failed to retrieve integration reminders" });
    }
  },
);

// Alumni community connection
router.get(
  "/community/alumni/:retreatId",
  async (req: Request, res: Response) => {
    try {
      const { retreatId } = req.params;
      const { element, interests } = req.query;

      const community = await postRetreatService.getAlumniCommunity(retreatId, {
        element: element as string,
        interests: interests ? (interests as string).split(",") : undefined,
      });

      res.json({
        retreatId,
        community,
        connections: community.members,
        sharedWisdom: community.recentWisdom,
        upcomingGatherings: community.gatherings,
      });
    } catch (error) {
      logger.error("Failed to get alumni community", error);
      res.status(500).json({ error: "Failed to retrieve alumni community" });
    }
  },
);

// Annual transformation review
router.get(
  "/transformation/annual-review/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;
      const { year } = req.query;

      const review = await postRetreatService.generateAnnualReview(
        participantId,
        parseInt(year as string) || new Date().getFullYear(),
      );

      res.json({
        participantId,
        year: review.year,
        review,
        visualizations: {
          transformationMap: review.transformationMap,
          growthSpiral: review.growthSpiral,
          elementalJourney: review.elementalJourney,
        },
        recommendations: review.recommendationsForNextYear,
      });
    } catch (error) {
      logger.error("Failed to generate annual review", error);
      res
        .status(500)
        .json({ error: "Failed to generate annual transformation review" });
    }
  },
);

// Sacred anniversary messages
router.get(
  "/anniversary/:participantId",
  async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;

      const anniversary =
        await postRetreatService.checkRetreatAnniversary(participantId);

      if (anniversary.isAnniversary) {
        const message = await postRetreatService.generateAnniversaryMessage(
          participantId,
          anniversary,
        );

        res.json({
          isAnniversary: true,
          yearsElapsed: anniversary.years,
          message,
          reflection: anniversary.reflection,
          invitation: anniversary.invitation,
        });
      } else {
        res.json({
          isAnniversary: false,
          nextAnniversary: anniversary.nextDate,
          daysUntil: anniversary.daysUntil,
        });
      }
    } catch (error) {
      logger.error("Failed to check anniversary", error);
      res.status(500).json({ error: "Failed to check retreat anniversary" });
    }
  },
);

export default router;
