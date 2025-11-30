// 🌀 SOULLAB FOUNDER ROUTES - Organizational Wisdom Access
import { Router } from "express";
import { SoullabFounderAgent } from "../core/agents/soullabFounderAgent";
import { authenticate } from "../middleware/authenticate";
import { logger } from "../utils/logger";
import multer from "multer";

const router = Router();
const founderAgent = new SoullabFounderAgent();

// Configure file upload for knowledge documents
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/json",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, TXT, MD, and JSON files are allowed.",
        ),
      );
    }
  },
});

// Query founder wisdom
router.post("/query", authenticate, async (req, res) => {
  try {
    const { query, context } = req.body;
    const userId = req.user?.id || "anonymous";

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    logger.info("Founder query received", {
      userId,
      query: query.substring(0, 100),
    });

    const response = await founderAgent.processQuery({
      input: query,
      userId,
      context,
    });

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    logger.error("Founder query error:", error);
    res.status(500).json({
      error: "Failed to process founder query",
      message: error.message,
    });
  }
});

// Check vision coherence for new initiatives
router.post("/vision-check", authenticate, async (req, res) => {
  try {
    const { name, description, alignment } = req.body;
    const userId = req.user?.id;

    // Check if user has appropriate permissions (team member or higher)
    if (!userId || !req.user?.metadata?.isTeamMember) {
      return res.status(403).json({
        error: "Vision coherence check requires team member access",
      });
    }

    const coherenceCheck = await founderAgent.checkVisionCoherence({
      name,
      description,
      alignment: alignment || [],
    });

    res.json({
      success: true,
      coherenceCheck,
    });
  } catch (error) {
    logger.error("Vision coherence check error:", error);
    res.status(500).json({
      error: "Failed to check vision coherence",
      message: error.message,
    });
  }
});

// Upload knowledge document (restricted to founders/admins)
router.post(
  "/knowledge/upload",
  authenticate,
  upload.single("document"),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { type, title, accessibility, author } = req.body;

      // Check founder/admin permissions
      if (!userId || !req.user?.metadata?.isFounder) {
        return res.status(403).json({
          error: "Knowledge upload requires founder access",
        });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Document file is required" });
      }

      await founderAgent.uploadKnowledgeDocument(req.file.buffer, {
        type: type as any,
        title,
        accessibility: accessibility || "internal",
        author,
      });

      res.json({
        success: true,
        message: "Knowledge document uploaded successfully",
        document: {
          title,
          type,
          size: req.file.size,
          uploadedBy: userId,
        },
      });
    } catch (error) {
      logger.error("Knowledge upload error:", error);
      res.status(500).json({
        error: "Failed to upload knowledge document",
        message: error.message,
      });
    }
  },
);

// Get onboarding guidance
router.get("/onboarding/:role", authenticate, async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user?.id || "anonymous";

    const validRoles = ["team", "facilitator", "developer", "partner"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role. Valid roles: " + validRoles.join(", "),
      });
    }

    const onboardingQuery = `I'm joining Soullab as a ${role}. What should I know to begin my journey?`;

    const response = await founderAgent.processQuery({
      input: onboardingQuery,
      userId,
      context: { onboardingRole: role },
    });

    res.json({
      success: true,
      role,
      guidance: response,
    });
  } catch (error) {
    logger.error("Onboarding guidance error:", error);
    res.status(500).json({
      error: "Failed to get onboarding guidance",
      message: error.message,
    });
  }
});

// Get philosophical foundations
router.get("/philosophy/:topic", async (req, res) => {
  try {
    const { topic } = req.params;
    const userId = req.user?.id || "public-visitor";

    const validTopics = [
      "sacred-techno-interface",
      "spiralogic",
      "synergetics",
      "codex-universalis",
      "overview",
    ];
    if (!validTopics.includes(topic)) {
      return res.status(400).json({
        error: "Invalid topic. Valid topics: " + validTopics.join(", "),
      });
    }

    const topicQuery =
      topic === "overview"
        ? "What is the philosophical foundation of Soullab?"
        : `Explain the ${topic.replace("-", " ")} in detail.`;

    const response = await founderAgent.processQuery({
      input: topicQuery,
      userId,
      context: { philosophicalInquiry: true, topic },
    });

    res.json({
      success: true,
      topic,
      philosophy: response,
    });
  } catch (error) {
    logger.error("Philosophy query error:", error);
    res.status(500).json({
      error: "Failed to get philosophical foundations",
      message: error.message,
    });
  }
});

export default router;

/**
 * 🌀 FOUNDER ROUTES API
 *
 * PUBLIC ENDPOINTS:
 * - GET /philosophy/:topic - Access philosophical foundations
 *
 * AUTHENTICATED ENDPOINTS:
 * - POST /query - General founder wisdom queries
 * - GET /onboarding/:role - Role-specific onboarding guidance
 *
 * TEAM MEMBER ENDPOINTS:
 * - POST /vision-check - Check initiative alignment with vision
 *
 * FOUNDER/ADMIN ENDPOINTS:
 * - POST /knowledge/upload - Upload knowledge documents
 *
 * The Founder Agent maintains organizational coherence while
 * sharing wisdom at appropriate levels of depth and protection.
 */
