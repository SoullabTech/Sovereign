import { Router } from "express";
import memoryModule from "../core/utils/memoryModule";
import logger from "../utils/logger";

const router = Router();

/**
 * GET /api/symbolic-trends
 * Optional Query Params:
 *   - symbol (string): filter by symbol tag
 *   - agent (string): filter by agent source
 *   - since (ISO date string): filter by timestamp cutoff
 */
router.get("/", (req, res) => {
  try {
    const { symbol, agent, since } = req.query as Record<string, string>;

    let tags = memoryModule.getAllSymbolicTags();

    if (symbol) {
      tags = tags.filter((t) => t.symbol === symbol);
    }
    if (agent) {
      tags = tags.filter((t) => t.agent === agent);
    }
    if (since) {
      const cutoff = new Date(since).toISOString();
      tags = tags.filter((t) => (t.timestamp ?? "") >= cutoff);
    }

    // Aggregate by day
    const countsByDate: Record<string, number> = {};
    tags.forEach((tag) => {
      const day = tag.timestamp?.slice(0, 10) ?? "unknown";
      countsByDate[day] = (countsByDate[day] || 0) + 1;
    });

    res.json({
      meta: {
        totalTags: tags.length,
        days: Object.keys(countsByDate).length,
      },
      countsByDate,
      tags,
    });
  } catch (err) {
    logger.error("❌ Failed to fetch symbolic trends", { error: err });
    res.status(500).json({ error: "Failed to fetch symbolic trends" });
  }
});

export default router;
