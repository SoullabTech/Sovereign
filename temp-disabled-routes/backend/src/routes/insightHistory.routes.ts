import { Router } from "express";
import { oracleLogger } from "../core/utils/oracleLogger";
import { authenticate } from "../middleware/authenticate";
import type { AuthenticatedRequest } from "../types";

const router = Router();

// 🔒 All insight-history routes require authentication
router.use(authenticate);

/**
 * GET /api/oracle/insight-history
 * Optional query params: type, limit, offset
 */
router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user.id;
    const { type, limit = "50", offset = "0" } = req.query;

    const insights = await oracleLogger.getInsightHistory(userId, {
      type: type as string,
      limit: Number(limit),
      offset: Number(offset),
    });

    return res
      .status(200)
      .json({ success: true, count: insights.length, insights });
  } catch (err: any) {
    console.error("❌ Error retrieving insight history:", err.message || err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to retrieve insight history" });
  }
});

/**
 * GET /api/oracle/insight-history/stats
 * Returns aggregate stats for insights
 */
router.get("/stats", async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await oracleLogger.getInsightStats(req.user.id);
    return res.status(200).json({ success: true, stats });
  } catch (err: any) {
    console.error(
      "❌ Error retrieving insight statistics:",
      err.message || err,
    );
    return res
      .status(500)
      .json({ success: false, error: "Failed to retrieve insight statistics" });
  }
});

export default router;
