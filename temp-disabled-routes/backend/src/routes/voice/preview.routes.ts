// backend/src/routes/voice/preview.routes.ts

import express from "express";
import { asyncHandler, createError } from "../../middleware/errorHandler";
import { logger } from "../../utils/logger";
import path from "path";
import fs from "fs";

const router = express.Router();

// Voice preview samples mapping
const VOICE_SAMPLES = {
  "aunt-annie": "aunt-annie-sample.mp3",
  "deep-sage": "deep-sage-sample.mp3",
  "matrix-oracle": "matrix-oracle-sample.mp3",
  "fire-essence": "fire-essence-sample.mp3",
};

// GET - Serve voice preview sample
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { voiceId } = req.query;

    if (!voiceId || typeof voiceId !== "string") {
      throw createError("Voice ID is required", 400);
    }

    const sampleFile = VOICE_SAMPLES[voiceId as keyof typeof VOICE_SAMPLES];
    if (!sampleFile) {
      throw createError("Invalid voice ID", 400);
    }

    // Path to voice samples directory
    const samplesDir = path.join(process.cwd(), "assets", "voice-samples");
    const filePath = path.join(samplesDir, sampleFile);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.warn(`Voice sample not found: ${filePath}`);

      // For development: return a mock audio response
      if (process.env.NODE_ENV === "development") {
        // Generate a simple beep tone or return demo audio
        res.status(200).json({
          message: "Demo mode: Voice sample would play here",
          voice_id: voiceId,
          duration: 5000,
        });
        return;
      }

      throw createError("Voice sample not available", 404);
    }

    // Set appropriate headers for audio streaming
    res.set({
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600", // Cache for 1 hour
    });

    // Stream the audio file
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for audio scrubbing
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      const stream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": chunksize,
      });
      stream.pipe(res);
    } else {
      // Serve entire file
      res.writeHead(200, {
        "Content-Length": fileSize,
      });
      fs.createReadStream(filePath).pipe(res);
    }
  }),
);

// GET - List available voice previews
router.get(
  "/list",
  asyncHandler(async (req, res) => {
    const voices = Object.keys(VOICE_SAMPLES).map((voiceId) => ({
      id: voiceId,
      name: voiceId,
      previewUrl: `/api/voice/preview?voiceId=${voiceId}`,
      description: getVoiceDescription(voiceId),
    }));

    res.json({ voices });
  }),
);

// Helper function to get voice descriptions
function getVoiceDescription(voiceId: string): string {
  const descriptions = {
    AuntAnnie: "Warm & Wise - Nurturing guidance with deep knowing",
    Mahela: "Deep & Contemplative - Thoughtful presence with ancient wisdom",
    Jasper: "Clear & Grounded - Practical wisdom with steady presence",
    Orion: "Cosmic & Transcendent - Ethereal guidance from stellar depths",
  };

  return (
    descriptions[voiceId as keyof typeof descriptions] ||
    "Voice description not available"
  );
}

export default router;
