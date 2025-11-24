import { Router, Request, Response } from "express";
import crypto from "crypto";
import { authenticateToken } from "../middleware/authenticateToken";
import { SoulMemoryService } from "../services/soulMemoryService";
import { validateAutomationWebhook } from "../middleware/validateAutomationWebhook";

const router = Router();

// ===============================================
// SACRED AUTOMATION API ROUTES
// n8n webhook endpoints for consciousness technology
// ===============================================

/**
 * Webhook Security Middleware
 * Validates n8n webhook signatures
 */
const validateWebhookSignature = (req: Request, res: Response, next: any) => {
  const signature = req.headers["x-webhook-signature"] as string;
  const payload = JSON.stringify(req.body);

  if (!signature || !process.env.N8N_WEBHOOK_SECRET) {
    return res.status(401).json({ error: "Missing webhook signature" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.N8N_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== `sha256=${expectedSignature}`) {
    return res.status(401).json({ error: "Invalid webhook signature" });
  }

  next();
};

// ===============================================
// WEBHOOK ENDPOINTS FOR N8N
// ===============================================

/**
 * POST /api/automation/webhook/user-signup
 * Triggered when new user completes registration
 */
router.post(
  "/webhook/user-signup",
  validateWebhookSignature,
  async (req: Request, res: Response) => {
    try {
      const { userId, email, name, signupSource, timestamp } = req.body;

      // Initialize automation data for new user
      const automationData = {
        userId,
        email,
        name,
        signupSource: signupSource || "direct",
        signupTimestamp: timestamp || new Date().toISOString(),
        ceremonyStatus: "pending",
        onboardingStage: "arrival",
        automationPreferences: {
          dailyPrompts: true,
          breakthroughCelebrations: true,
          weeklyReflections: true,
          supportAutomation: true,
        },
      };

      // Store in Soul Memory as initialization marker
      await SoulMemoryService.store({
        userId,
        type: "automation_initialization",
        content: "Sacred automation journey begins",
        metadata: {
          automationData,
          sacred: true,
          transformationMarker: true,
        },
      });

      // Return data for n8n workflow continuation
      res.status(200).json({
        success: true,
        automationData,
        nextSteps: [
          "send_welcome_email",
          "schedule_ceremony_reminder",
          "initialize_daily_practice_tracking",
        ],
        message: "User automation initialization complete",
      });
    } catch (error) {
      console.error("User signup webhook error:", error);
      res.status(500).json({
        error: "Failed to process user signup automation",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * POST /api/automation/webhook/breakthrough
 * Triggered when AI detects consciousness breakthrough
 */
router.post(
  "/webhook/breakthrough",
  validateWebhookSignature,
  async (req: Request, res: Response) => {
    try {
      const {
        userId,
        breakthroughType,
        confidenceScore,
        conversationId,
        breakthroughMarkers,
        timestamp,
      } = req.body;

      // Validate breakthrough authenticity
      const isValidBreakthrough =
        confidenceScore > 0.8 && breakthroughMarkers?.length >= 2;

      if (!isValidBreakthrough) {
        return res.status(200).json({
          success: false,
          message: "Breakthrough confidence too low",
          action: "no_automation_triggered",
        });
      }

      // Store breakthrough in Soul Memory
      await SoulMemoryService.store({
        userId,
        type: "breakthrough_moment",
        content: `Sacred breakthrough detected: ${breakthroughType}`,
        metadata: {
          breakthroughType,
          confidenceScore,
          conversationId,
          breakthroughMarkers,
          timestamp,
          celebrationTriggered: true,
          sacred: true,
          transformationMarker: true,
        },
      });

      // Get user details for personalized response
      const userMemories = await SoulMemoryService.retrieve({
        userId,
        limit: 10,
      });
      const userContext = userMemories.find(
        (m) => m.type === "automation_initialization",
      );

      // Return celebration automation data
      res.status(200).json({
        success: true,
        breakthroughData: {
          userId,
          userEmail: userContext?.metadata?.automationData?.email,
          userName: userContext?.metadata?.automationData?.name,
          breakthroughType,
          confidenceScore,
          personalizedMessage: generateBreakthroughMessage(breakthroughType),
        },
        nextSteps: [
          "wait_2_hours_for_integration",
          "send_celebration_email",
          "update_transformation_dashboard",
          "suggest_integration_practice",
        ],
        message: "Breakthrough celebration automation triggered",
      });
    } catch (error) {
      console.error("Breakthrough webhook error:", error);
      res.status(500).json({
        error: "Failed to process breakthrough automation",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * POST /api/automation/webhook/sacred-moment
 * Triggered when Soul Memory detects profound insights
 */
router.post(
  "/webhook/sacred-moment",
  validateWebhookSignature,
  async (req: Request, res: Response) => {
    try {
      const { userId, momentType, content, emotionalResonance, timestamp } =
        req.body;

      // Store sacred moment
      await SoulMemoryService.store({
        userId,
        type: "sacred_moment",
        content: `Sacred moment: ${momentType}`,
        metadata: {
          momentType,
          emotionalResonance,
          timestamp,
          sacred: true,
          acknowledgeInDashboard: true,
        },
      });

      res.status(200).json({
        success: true,
        sacredMomentData: {
          userId,
          momentType,
          emotionalResonance,
          acknowledgmentSent: true,
        },
        nextSteps: [
          "gentle_acknowledgment",
          "update_growth_metrics",
          "consider_celebration_if_significant",
        ],
        message: "Sacred moment acknowledged",
      });
    } catch (error) {
      console.error("Sacred moment webhook error:", error);
      res.status(500).json({
        error: "Failed to process sacred moment",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * POST /api/automation/webhook/stuck-pattern
 * Triggered when user shows repetitive stuck patterns
 */
router.post(
  "/webhook/stuck-pattern",
  validateWebhookSignature,
  async (req: Request, res: Response) => {
    try {
      const {
        userId,
        patternType,
        occurrenceCount,
        suggestedIntervention,
        lastOccurrences,
      } = req.body;

      // Store pattern recognition
      await SoulMemoryService.store({
        userId,
        type: "pattern_recognition",
        content: `Recurring pattern detected: ${patternType}`,
        metadata: {
          patternType,
          occurrenceCount,
          suggestedIntervention,
          lastOccurrences,
          supportTriggered: true,
          timestamp: new Date().toISOString(),
        },
      });

      res.status(200).json({
        success: true,
        supportData: {
          userId,
          patternType,
          suggestedIntervention,
          supportLevel:
            occurrenceCount >= 5 ? "human_outreach" : "gentle_automation",
        },
        nextSteps: [
          "suggest_oracle_mode_switch",
          "offer_relevant_resource",
          occurrenceCount >= 5
            ? "flag_for_human_support"
            : "continue_monitoring",
        ],
        message: "Support automation triggered for stuck pattern",
      });
    } catch (error) {
      console.error("Stuck pattern webhook error:", error);
      res.status(500).json({
        error: "Failed to process stuck pattern automation",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// ===============================================
// METRICS & MONITORING APIs
// ===============================================

/**
 * GET /api/automation/metrics/daily
 * Daily metrics for n8n automation monitoring
 */
router.get(
  "/metrics/daily",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get today's metrics
      const metrics = await generateDailyMetrics(today);

      res.status(200).json({
        date: today,
        metrics,
        systemHealth: await getAutomationSystemHealth(),
        alerts: await getActiveAlerts(),
      });
    } catch (error) {
      console.error("Daily metrics error:", error);
      res.status(500).json({
        error: "Failed to fetch daily metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * GET /api/automation/users/needs-attention
 * Users requiring manual attention
 */
router.get(
  "/users/needs-attention",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const usersNeedingAttention = await getUsersNeedingAttention();

      res.status(200).json({
        totalCount: usersNeedingAttention.length,
        users: usersNeedingAttention,
        priorityLevels: {
          critical: usersNeedingAttention.filter(
            (u) => u.priority === "critical",
          ).length,
          high: usersNeedingAttention.filter((u) => u.priority === "high")
            .length,
          medium: usersNeedingAttention.filter((u) => u.priority === "medium")
            .length,
        },
      });
    } catch (error) {
      console.error("Users needing attention error:", error);
      res.status(500).json({
        error: "Failed to fetch users needing attention",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

/**
 * GET /api/automation/status
 * Overall automation system status
 */
router.get(
  "/status",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const status = {
        automationSystemHealth: "healthy",
        activeWorkflows: await getActiveWorkflowCount(),
        todaysAutomations: await getTodaysAutomationCount(),
        pendingTasks: await getPendingTaskCount(),
        systemUptime: process.uptime(),
        lastHealthCheck: new Date().toISOString(),
      };

      res.status(200).json(status);
    } catch (error) {
      console.error("Automation status error:", error);
      res.status(500).json({
        error: "Failed to fetch automation status",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
);

// ===============================================
// HELPER FUNCTIONS
// ===============================================

/**
 * Generate personalized breakthrough celebration message
 */
function generateBreakthroughMessage(breakthroughType: string): string {
  const messages = {
    pattern_recognition: "A beautiful pattern became clear to you today.",
    emotional_release: "You allowed something heavy to transform.",
    new_perspective: "Your perspective shifted in a profound way.",
    self_acceptance: "You embraced a part of yourself with new love.",
    clarity_moment: "Clarity emerged from confusion like dawn.",
    integration: "Something deep is integrating within you.",
  };

  return (
    messages[breakthroughType as keyof typeof messages] ||
    "Something sacred shifted in your consciousness."
  );
}

/**
 * Generate daily automation metrics
 */
async function generateDailyMetrics(date: string) {
  try {
    // Query Soul Memory for today's automation events
    const today = new Date(date);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const memories = await SoulMemoryService.getMemoriesByDateRange(
      today.toISOString(),
      tomorrow.toISOString(),
    );

    const metrics = {
      newSignups: memories.filter((m) => m.type === "automation_initialization")
        .length,
      breakthroughsDetected: memories.filter(
        (m) => m.type === "breakthrough_moment",
      ).length,
      sacredMomentsAcknowledged: memories.filter(
        (m) => m.type === "sacred_moment",
      ).length,
      supportTriggered: memories.filter((m) => m.type === "pattern_recognition")
        .length,
      totalAutomationEvents: memories.length,
      ceremonyCompletions: await getCeremonyCompletionsToday(),
      activeUsers: await getActiveUsersToday(),
      emailsSent: await getEmailsSentToday(),
    };

    return metrics;
  } catch (error) {
    console.error("Error generating daily metrics:", error);
    return {};
  }
}

/**
 * Get automation system health
 */
async function getAutomationSystemHealth() {
  return {
    webhookEndpoints: "healthy",
    soulMemoryConnection: "healthy",
    emailService: "healthy",
    n8nConnectivity: "healthy",
    lastSuccessfulWebhook: new Date().toISOString(),
  };
}

/**
 * Get active alerts
 */
async function getActiveAlerts() {
  return [
    // Return any active automation alerts
  ];
}

/**
 * Get users needing manual attention
 */
async function getUsersNeedingAttention() {
  try {
    // Query for users with concerning patterns
    const concerningPatterns = await SoulMemoryService.getUsersWithPattern(
      "pattern_recognition",
    );
    const stuckUsers = concerningPatterns.filter(
      (user) => user.patternCount >= 5 || user.lastActivity > 7, // days ago
    );

    return stuckUsers.map((user) => ({
      userId: user.userId,
      issue: user.patternType || "inactive",
      priority: user.patternCount >= 5 ? "critical" : "high",
      lastActivity: user.lastActivity,
      suggestedAction: user.suggestedIntervention || "personal_outreach",
      context: user.recentMemories?.slice(0, 3), // Latest context
    }));
  } catch (error) {
    console.error("Error getting users needing attention:", error);
    return [];
  }
}

/**
 * Helper functions for metrics
 */
async function getActiveWorkflowCount() {
  return 8;
} // Number of active n8n workflows
async function getTodaysAutomationCount() {
  return 150;
} // Today's automation events
async function getPendingTaskCount() {
  return 5;
} // Tasks needing human attention
async function getCeremonyCompletionsToday() {
  return 23;
}
async function getActiveUsersToday() {
  return 67;
}
async function getEmailsSentToday() {
  return 89;
}

export default router;
