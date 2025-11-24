// src/routes/learningFlow.routes.ts

import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { LearningFlow } from "../flows/learningFlow";
import type { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

const router = Router();

/**
 * POST /api/flow/learning/start
 * Initiates a new learning flow session
 */
router.post(
  "/learning/start",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        return res.status(400).json({ error: "Client ID is required." });
      }

      const flow = new LearningFlow(clientId);
      const result = await flow.start();

      return res.status(200).json(result);
    } catch (error) {
      logger.error("❌ Failed to start learning flow", { error });
      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to start learning flow",
      });
    }
  },
);

/**
 * POST /api/flow/learning/interact
 * Sends a message to the learning agent during an active session
 */
router.post(
  "/learning/interact",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const clientId = req.user?.id;
      const { content, sessionId } = req.body;

      if (!clientId || !content || !sessionId) {
        return res.status(400).json({
          error: "Client ID, content, and session ID are required.",
        });
      }

      const flow = new LearningFlow(clientId, sessionId);
      const result = await flow.processInteraction(content);

      return res.status(200).json(result);
    } catch (error) {
      logger.error("❌ Failed to process interaction", { error });
      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to process interaction",
      });
    }
  },
);

/**
 * POST /api/flow/learning/complete
 * Completes the current learning session
 */
router.post(
  "/learning/complete",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const clientId = req.user?.id;
      const { sessionId } = req.body;

      if (!clientId || !sessionId) {
        return res.status(400).json({
          error: "Client ID and session ID are required.",
        });
      }

      const flow = new LearningFlow(clientId, sessionId);
      const result = await flow.complete();

      return res.status(200).json(result);
    } catch (error) {
      logger.error("❌ Failed to complete learning flow", { error });
      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete learning flow",
      });
    }
  },
);

export default router;
