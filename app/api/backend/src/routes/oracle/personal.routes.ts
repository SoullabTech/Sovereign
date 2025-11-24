// src/routes/oracle/personal.routes.ts

import { Router } from "express";
import { authenticateToken } from "../../middleware/authenticateToken";
import type { AuthenticatedRequest } from "../../types";
import { PersonalOracleAgent } from "../../core/agents/adjusterAgent";
import logger from "../../utils/logger";

const router = Router();

router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { tone = "poetic" } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    const personalAgent = new PersonalOracleAgent({ userId, tone });

    const intro = await personalAgent.getIntroMessage();
    const reflection = await personalAgent.getDailyReflection();
    const ritual = await personalAgent.suggestRitual();

    res.status(200).json({
      success: true,
      intro,
      reflection,
      ritual,
    });
  } catch (error) {
    logger.error("PersonalOracleAgent route error", { error });
    res.status(500).json({ error: "Failed to get personal oracle data" });
  }
});

export default router;
