import { Router } from "express";
import { IntegrationOrchestrator } from "../core/integration/IntegrationOrchestrator";
import { CodeAuditor } from "../core/integration/CodeAuditor";
import {
  IntegrationArchitecture,
  IntegrationStage,
  BypassingDetection,
  SpiralProgressPoint,
} from "../core/integration/types";

const router = Router();

// In-memory storage for demo purposes
const integrationArchitectures: Map<string, IntegrationArchitecture> =
  new Map();

// Initialize services
const integrationOrchestrator = new IntegrationOrchestrator();
const codeAuditor = new CodeAuditor();

// Initialize user integration architecture
router.post("/initialize/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const architecture =
      integrationOrchestrator.initializeIntegrationArchitecture(userId);
    integrationArchitectures.set(userId, architecture);

    res.json({
      message: "Integration-centered architecture initialized",
      architecture: {
        userId: architecture.userId,
        currentStage: architecture.currentStage,
        safeguards: architecture.safeguards,
        groundedContext: architecture.groundedContext,
      },
    });
  } catch (error) {
    console.error("Integration initialization error:", error);
    res
      .status(500)
      .json({ error: "Failed to initialize integration architecture" });
  }
});

// Process content request with integration checking
router.post("/content-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { requestedContent, userBehavior } = req.body;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    const result = integrationOrchestrator.processContentRequest(
      architecture,
      requestedContent,
      userBehavior,
    );

    // Update stored architecture
    integrationArchitectures.set(userId, architecture);

    res.json(result);
  } catch (error) {
    console.error("Content request processing error:", error);
    res.status(500).json({ error: "Failed to process content request" });
  }
});

// Submit integration evidence
router.post("/integration-submission/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { submissionType, submission } = req.body;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    const result = integrationOrchestrator.processIntegrationSubmission(
      architecture,
      submissionType,
      submission,
    );

    // Update stored architecture
    integrationArchitectures.set(userId, architecture);

    res.json(result);
  } catch (error) {
    console.error("Integration submission error:", error);
    res.status(500).json({ error: "Failed to process integration submission" });
  }
});

// Update spiral progress
router.post("/spiral-progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { theme, insight, realWorldApplication, struggles } = req.body;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    const spiralUpdate = integrationOrchestrator.updateSpiralProgress(
      architecture,
      theme,
      insight,
      realWorldApplication,
      struggles,
    );

    // Update stored architecture
    integrationArchitectures.set(userId, architecture);

    res.json(spiralUpdate);
  } catch (error) {
    console.error("Spiral progress error:", error);
    res.status(500).json({ error: "Failed to update spiral progress" });
  }
});

// Check integration gate readiness
router.get("/gate-check/:userId/:gateId", async (req, res) => {
  try {
    const { userId, gateId } = req.params;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    const gateStatus = integrationOrchestrator.checkGateReadiness(
      architecture,
      gateId,
    );

    res.json(gateStatus);
  } catch (error) {
    console.error("Gate check error:", error);
    res.status(500).json({ error: "Failed to check gate readiness" });
  }
});

// Get integration dashboard data
router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    const dashboardData =
      integrationOrchestrator.generateDashboardData(architecture);

    res.json(dashboardData);
  } catch (error) {
    console.error("Dashboard generation error:", error);
    res.status(500).json({ error: "Failed to generate dashboard data" });
  }
});

// Audit file for magical thinking
router.post("/audit-file", async (req, res) => {
  try {
    const { filePath, content } = req.body;

    const auditResults = codeAuditor.auditFile(filePath, content);

    res.json(auditResults);
  } catch (error) {
    console.error("File audit error:", error);
    res.status(500).json({ error: "Failed to audit file" });
  }
});

// Generate integration-centered replacement
router.post("/generate-replacement", async (req, res) => {
  try {
    const { originalContent, auditResults } = req.body;

    const replacementContent = codeAuditor.generateReplacementFile(
      originalContent,
      auditResults,
    );

    res.json({ replacementContent });
  } catch (error) {
    console.error("Replacement generation error:", error);
    res.status(500).json({ error: "Failed to generate replacement content" });
  }
});

// System-wide audit
router.get("/audit-system", async (req, res) => {
  try {
    const systemAudit = codeAuditor.auditSystemWide();

    res.json(systemAudit);
  } catch (error) {
    console.error("System audit error:", error);
    res.status(500).json({ error: "Failed to perform system audit" });
  }
});

// Generate integration-centered prompt
router.post("/transform-prompt", async (req, res) => {
  try {
    const { originalPrompt } = req.body;

    const integrationPrompt =
      codeAuditor.generateIntegrationCenteredPrompt(originalPrompt);

    res.json({ integrationPrompt });
  } catch (error) {
    console.error("Prompt transformation error:", error);
    res.status(500).json({ error: "Failed to transform prompt" });
  }
});

// Get user's integration architecture
router.get("/architecture/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    res.json(architecture);
  } catch (error) {
    console.error("Architecture retrieval error:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve integration architecture" });
  }
});

// Update integration stage
router.put("/stage/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { newStage } = req.body;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    architecture.currentStage = newStage as IntegrationStage;
    architecture.lastIntegrationCheck = new Date();

    integrationArchitectures.set(userId, architecture);

    res.json({
      message: "Integration stage updated",
      currentStage: architecture.currentStage,
    });
  } catch (error) {
    console.error("Stage update error:", error);
    res.status(500).json({ error: "Failed to update integration stage" });
  }
});

// Address bypassing detection
router.post("/address-bypassing/:userId/:detectionId", async (req, res) => {
  try {
    const { userId, detectionId } = req.params;
    const { addressed, notes } = req.body;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    const detection = architecture.bypassingHistory.find(
      (b) => b.id === detectionId,
    );
    if (detection) {
      detection.addressed = addressed;
      // In a real implementation, you'd add notes and timestamp
    }

    integrationArchitectures.set(userId, architecture);

    res.json({ message: "Bypassing detection updated" });
  } catch (error) {
    console.error("Bypassing address error:", error);
    res.status(500).json({ error: "Failed to address bypassing detection" });
  }
});

// Get integration statistics
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const architecture = integrationArchitectures.get(userId);
    if (!architecture) {
      return res
        .status(404)
        .json({ error: "Integration architecture not found" });
    }

    const stats = {
      totalSpiralPoints: architecture.spiralProgress.length,
      averageSpiralDepth:
        architecture.spiralProgress.length > 0
          ? architecture.spiralProgress.reduce((sum, p) => sum + p.depth, 0) /
            architecture.spiralProgress.length
          : 0,
      livedExperiences: architecture.embodiedWisdom.livedExperiences.length,
      consistencyMetrics: architecture.embodiedWisdom.consistencyMetrics.length,
      ordinaryMoments:
        architecture.embodiedWisdom.ordinaryMomentAwareness.length,
      activeBypassingPatterns: architecture.bypassingHistory.filter(
        (b) => !b.addressed,
      ).length,
      integrationQuality:
        architecture.spiralProgress.length > 0
          ? architecture.spiralProgress.reduce(
              (sum, p) => sum + p.integrationQuality,
              0,
            ) / architecture.spiralProgress.length
          : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Stats retrieval error:", error);
    res
      .status(500)
      .json({ error: "Failed to retrieve integration statistics" });
  }
});

export default router;
