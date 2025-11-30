// Switzerland Retreat Onboarding Routes
import { Router, Request, Response } from "express";
import { retreatOnboardingService } from "../services/retreatOnboardingService";
import { z } from "zod";
import { logger } from "../utils/logger";

const router = Router();

// Validation schemas
const registrationSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  preferredName: z.string().optional(),
  retreatId: z.string().uuid(),
  arrivalDate: z.string().datetime(),
  departureDate: z.string().datetime(),
  dietaryRestrictions: z.array(z.string()).optional(),
  specialNeeds: z.array(z.string()).optional(),
});

const currentStateSchema = z.object({
  emotionalTone: z.string().min(1),
  energyLevel: z.number().min(1).max(10),
  primaryChallenge: z.string().optional(),
  seekingGuidanceOn: z.array(z.string()).optional(),
});

const intentionsSchema = z.object({
  primaryIntention: z.string().min(10),
  secondaryIntentions: z.array(z.string()).optional(),
  desiredOutcomes: z.array(z.string()).min(1),
  openToExploring: z.array(z.string()).optional(),
});

// Register for retreat
router.post("/register", async (req: Request, res: Response) => {
  try {
    const validation = registrationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid registration data",
        details: validation.error.format(),
      });
    }

    const data = validation.data;

    const participant = await retreatOnboardingService.initializeOnboarding(
      data.email,
      data.firstName,
      data.lastName,
      data.retreatId,
      new Date(data.arrivalDate),
      new Date(data.departureDate),
    );

    res.status(201).json({
      success: true,
      participant: {
        id: participant.id,
        firstName: participant.firstName,
        onboardingStatus: participant.onboardingStatus,
      },
      message:
        "Welcome to the sacred journey. Check your messages for a personal welcome from Kelly.",
      nextStep: "/api/retreat/overview",
    });
  } catch (error) {
    logger.error("Retreat registration failed", error);
    res.status(500).json({
      error: "Registration failed",
      message: "Please try again or contact support",
    });
  }
});

// Get retreat overview
router.get("/overview/:retreatId", async (req: Request, res: Response) => {
  try {
    const retreat = await retreatOnboardingService.getRetreatOverview(
      req.params.retreatId,
    );

    if (!retreat) {
      return res.status(404).json({ error: "Retreat not found" });
    }

    res.json({
      retreat,
      message: "Welcome to your transformational journey",
    });
  } catch (error) {
    logger.error("Failed to get retreat overview", error);
    res.status(500).json({ error: "Failed to load retreat details" });
  }
});

// Submit current state assessment
router.post(
  "/:participantId/current-state",
  async (req: Request, res: Response) => {
    try {
      const validation = currentStateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid state data",
          details: validation.error.format(),
        });
      }

      await retreatOnboardingService.captureCurrentState(
        req.params.participantId,
        validation.data,
      );

      res.json({
        success: true,
        message:
          "Thank you for sharing where you are. This helps us prepare the perfect container for your transformation.",
        nextStep: "/api/retreat/intentions",
      });
    } catch (error) {
      logger.error("Failed to capture current state", error);
      res.status(500).json({ error: "Failed to save your current state" });
    }
  },
);

// Submit retreat intentions
router.post(
  "/:participantId/intentions",
  async (req: Request, res: Response) => {
    try {
      const validation = intentionsSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Invalid intentions data",
          details: validation.error.format(),
        });
      }

      await retreatOnboardingService.captureIntentions(
        req.params.participantId,
        validation.data,
      );

      res.json({
        success: true,
        message:
          "Your intentions have been witnessed and woven into the retreat container. Kelly has a personal reflection waiting for you.",
        nextStep: "/api/retreat/oracle-assignment",
      });
    } catch (error) {
      logger.error("Failed to capture intentions", error);
      res.status(500).json({ error: "Failed to save your intentions" });
    }
  },
);

// Assign Personal Oracle
router.post(
  "/:participantId/assign-oracle",
  async (req: Request, res: Response) => {
    try {
      const assignment = await retreatOnboardingService.assignPersonalOracle(
        req.params.participantId,
      );

      res.json({
        success: true,
        oracle: assignment,
        message: `Your Personal Oracle has been assigned! Meet your ${assignment.element} guide: ${assignment.archetype}. Kelly has prepared a special introduction for you.`,
        nextStep: "/api/retreat/complete",
      });
    } catch (error) {
      logger.error("Failed to assign Personal Oracle", error);
      res.status(500).json({ error: "Failed to assign your Personal Oracle" });
    }
  },
);

// Complete onboarding
router.post("/:participantId/complete", async (req: Request, res: Response) => {
  try {
    await retreatOnboardingService.completeOnboarding(req.params.participantId);

    res.json({
      success: true,
      message:
        "Your preparation is complete! The mountains are calling, and we cannot wait to meet you in person.",
      resources: {
        oracleChat: "/api/oracle/personal",
        retreatInfo: "/api/retreat/info",
        communitySpace: "/api/community/retreat",
      },
    });
  } catch (error) {
    logger.error("Failed to complete onboarding", error);
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
});

// Get participant progress
router.get("/:participantId/progress", async (req: Request, res: Response) => {
  try {
    const progress = await retreatOnboardingService.getParticipantProgress(
      req.params.participantId,
    );

    res.json({
      participant: progress.participant,
      onboarding: progress.onboardingFlow,
      messages: progress.messages,
      percentComplete: calculateProgressPercentage(progress.onboardingFlow),
    });
  } catch (error) {
    logger.error("Failed to get participant progress", error);
    res.status(500).json({ error: "Failed to load progress" });
  }
});

// Daily guidance from Kelly
router.get(
  "/:participantId/daily-guidance/:day",
  async (req: Request, res: Response) => {
    try {
      const { participantId, day } = req.params;
      const dayNumber = parseInt(day);

      // Get participant
      const progress =
        await retreatOnboardingService.getParticipantProgress(participantId);

      if (!progress.participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      // Get daily theme (would come from retreat schedule in production)
      const dailyThemes = [
        "Arrival and Sacred Opening",
        "Elemental Assessment and Integration",
        "Shadow Work and Transformation",
        "Vision Quest and Future Self",
        "Integration and Sacred Closing",
      ];

      const theme = dailyThemes[dayNumber - 1] || "Deep Presence";

      // Get guidance from founder
      const { soullabFounderAgent } = await import(
        "../core/agents/soullabFounderAgent"
      );
      const guidance = await soullabFounderAgent.offerDailyGuidance(
        progress.participant,
        dayNumber,
        theme,
      );

      res.json({
        day: dayNumber,
        theme,
        guidance: guidance.content,
        participant: {
          name:
            progress.participant.preferredName ||
            progress.participant.firstName,
          element: progress.participant.oracleElement,
        },
      });
    } catch (error) {
      logger.error("Failed to get daily guidance", error);
      res.status(500).json({ error: "Failed to get daily guidance" });
    }
  },
);

// Helper function to calculate progress
function calculateProgressPercentage(flow: any): number {
  const totalSteps = 7;
  const completedSteps = flow?.completedSteps?.length || 0;
  return Math.round((completedSteps / totalSteps) * 100);
}

export default router;
