// narration.routes.ts - Routes for static narration content

import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import type { AuthenticatedRequest } from "../types";
import { synthesizeVoice } from "../utils/voiceService";
import { DEFAULT_VOICE_ID, ORALIA_VOICE_ID } from "../config/voices";
import logger from "../utils/logger";

const router = Router();

interface NarrationRequest {
  text: string;
  type: "meditation" | "teaching" | "ceremony" | "introduction" | "general";
  voiceProfile?: "emily" | "oralia" | "default";
}

// POST /api/narration/synthesize
router.post(
  "/synthesize",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const {
        text,
        type = "general",
        voiceProfile = "default",
      } = req.body as NarrationRequest;

      if (!text) {
        return res.status(400).json({ error: "Missing narration text" });
      }

      // Select voice ID based on profile
      let voiceId = DEFAULT_VOICE_ID;
      if (voiceProfile === "oralia") {
        voiceId = ORALIA_VOICE_ID;
      }

      // Log narration request
      logger.info("Narration synthesis requested", {
        userId: req.user?.id,
        type,
        voiceProfile,
        textLength: text.length,
      });

      // Use ElevenLabs directly for narration (always)
      const audioUrl = await synthesizeVoice({
        text,
        voiceId,
      });

      return res.status(200).json({
        success: true,
        audioUrl,
        metadata: {
          type,
          voiceProfile,
          synthesizedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("Narration synthesis error", { error });
      return res.status(500).json({ error: "Failed to synthesize narration" });
    }
  },
);

// GET /api/narration/meditations
router.get(
  "/meditations",
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    // This could be expanded to return a list of available meditation scripts
    const meditations = [
      {
        id: "elemental-balance",
        title: "Elemental Balance Meditation",
        duration: "15 minutes",
        description:
          "A guided journey through the five elements to restore inner balance",
      },
      {
        id: "shadow-integration",
        title: "Shadow Integration Journey",
        duration: "20 minutes",
        description:
          "A safe exploration of shadow aspects for healing and wholeness",
      },
    ];

    return res.json({ meditations });
  },
);

export default router;
