// backend/src/routes/voice/list.routes.ts

import express from "express";
import { asyncHandler } from "../../middleware/errorHandler";

const router = express.Router();

// Available voice configurations
const VOICE_OPTIONS = [
  {
    id: "aunt-annie",
    name: "Aunt Annie",
    description: "Warm & Wise",
    details: "Nurturing guidance with deep knowing",
    provider: "elevenlabs",
    sample_available: true,
  },
  {
    id: "deep-sage",
    name: "Deep Sage",
    description: "Contemplative & Grounded",
    details: "Thoughtful presence with ancient wisdom",
    provider: "elevenlabs",
    sample_available: true,
  },
  {
    id: "matrix-oracle",
    name: "Matrix Oracle",
    description: "Integrated & Transcendent",
    details: "Multi-dimensional perspective synthesis",
    provider: "sesame",
    sample_available: true,
  },
  {
    id: "fire-essence",
    name: "Fire Essence",
    description: "Passionate & Catalytic",
    details: "Dynamic energy for transformation",
    provider: "sesame",
    sample_available: true,
  },
  {
    id: "water-flow",
    name: "Water Flow",
    description: "Intuitive & Flowing",
    details: "Emotional depth and adaptive wisdom",
    provider: "sesame",
    sample_available: false,
  },
  {
    id: "earth-steady",
    name: "Earth Steady",
    description: "Grounded & Stable",
    details: "Practical wisdom with steady presence",
    provider: "sesame",
    sample_available: false,
  },
];

// GET - List all available voices
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const includeUnavailable = req.query.include_unavailable === "true";

    let voices = VOICE_OPTIONS;

    // Filter out voices without samples unless specifically requested
    if (!includeUnavailable) {
      voices = voices.filter((voice) => voice.sample_available);
    }

    // Add preview URLs for voices with samples
    const voicesWithUrls = voices.map((voice) => ({
      ...voice,
      preview_url: voice.sample_available
        ? `/api/voice/preview?voiceId=${voice.id}`
        : null,
    }));

    res.json({
      voices: voicesWithUrls,
      total: voicesWithUrls.length,
      providers: [...new Set(voices.map((v) => v.provider))],
    });
  }),
);

// GET - Get specific voice details
router.get(
  "/:voiceId",
  asyncHandler(async (req, res) => {
    const { voiceId } = req.params;

    const voice = VOICE_OPTIONS.find((v) => v.id === voiceId);

    if (!voice) {
      return res.status(404).json({ error: "Voice not found" });
    }

    const voiceWithUrl = {
      ...voice,
      preview_url: voice.sample_available
        ? `/api/voice/preview?voiceId=${voice.id}`
        : null,
    };

    res.json({ voice: voiceWithUrl });
  }),
);

// GET - Get voices by provider
router.get(
  "/provider/:provider",
  asyncHandler(async (req, res) => {
    const { provider } = req.params;

    const voices = VOICE_OPTIONS.filter((v) => v.provider === provider);

    const voicesWithUrls = voices.map((voice) => ({
      ...voice,
      preview_url: voice.sample_available
        ? `/api/voice/preview?voiceId=${voice.id}`
        : null,
    }));

    res.json({
      voices: voicesWithUrls,
      provider,
      total: voicesWithUrls.length,
    });
  }),
);

export default router;
