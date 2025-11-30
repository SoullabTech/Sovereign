// src/routes/sessionRoutes.ts

import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { validate } from "../middleware/validate";
import { SessionService } from "../services/sessionService";
import {
  createSessionSchema,
  updateSessionSchema,
  getSessionStatsSchema,
} from "../schemas/session";
import type { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

const router = Router();
const sessionService = new SessionService();

/**
 * POST /api/session/start
 * Starts a new user session with optional metadata
 */
router.post(
  "/start",
  authenticateToken,
  validate(createSessionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { metadata } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
      }

      const session = await sessionService.createSession(userId, metadata);
      res.json(session);
    } catch (error) {
      logger.error("❌ Failed to start session", { error });
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to start session",
      });
    }
  },
);

/**
 * POST /api/session/end/:id
 * Ends a specific session by ID
 */
router.post(
  "/end/:id",
  authenticateToken,
  validate(updateSessionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
      }

      const success = await sessionService.endSession(id, userId);
      if (success) {
        res.json({ message: "Session ended successfully" });
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (error) {
      logger.error("❌ Failed to end session", { error });
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to end session",
      });
    }
  },
);

/**
 * GET /api/session/stats
 * Returns session usage statistics for the current user
 */
router.get(
  "/stats",
  authenticateToken,
  validate(getSessionStatsSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.id;
      const { startDate, endDate } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required." });
      }

      const stats = await sessionService.getSessionStats(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
      );

      res.json(stats);
    } catch (error) {
      logger.error("❌ Failed to get session stats", { error });
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to get session stats",
      });
    }
  },
);

export default router;
