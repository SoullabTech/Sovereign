import { Router } from "express";
import { authenticateToken } from "../../middleware/authenticateToken";
import type { AuthenticatedRequest } from "../../types";
import { personalOracle } from "../../core/agents/personalOracleAgent";
import logger from "../../utils/logger";
import { speak } from "../../utils/voiceRouter";
import axios from "axios";

const router = Router();

// POST /api/oracle/personal
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id;
    const { input, voice = "default" } = req.body;

    if (!input || !userId) {
      return res.status(400).json({ error: "Missing input or user ID" });
    }

    // Process the personal oracle query
    const response = await personalOracle.process({ userId, input });

    // Resolve voice ID
    let voiceId = "LcfcDJNUP1GQjkzn1xUU"; // Default to Emily
    if (voice === "aunt-annie") voiceId = "y2TOWGCXSYEgBanvKsYJ";
    else if (voice !== "default") voiceId = voice;

    // Use universal speak function with Oracle agent type
    const audioUrl = await speak(
      response.content,
      "oracle",
      "PersonalOracleAgent",
    );

    // Trigger Prefect flow to process the journal entry (or any other task you want to automate)
    try {
      const prefectResponse = await axios.post(
        `${process.env.PREFECT_API_URL}/flows/daily_journal_processing/run`, // Replace with your actual Prefect flow endpoint
        { entry: input },
      );
      logger.info("Prefect Flow Triggered", {
        status: prefectResponse.status,
        data: prefectResponse.data,
      });
    } catch (prefectError) {
      logger.error("❌ Failed to trigger Prefect flow", {
        error: prefectError,
      });
    }

    // Return the response with synthesized audio URL
    res.status(200).json({ success: true, response, audioUrl });
  } catch (error) {
    logger.error("❌ Personal Oracle error", { error });
    res.status(500).json({ error: "Failed to process personal oracle query" });
  }
});

export default router;
