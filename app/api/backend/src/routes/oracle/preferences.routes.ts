// backend/src/routes/oracle/preferences.routes.ts

import express from "express";
import { supabase } from "../../lib/supabase";
import { authMiddleware, AuthenticatedRequest } from "../../middleware/auth";
import { asyncHandler, createError } from "../../middleware/errorHandler";
import { logger } from "../../utils/logger";

const router = express.Router();

// Available voice options
const AVAILABLE_VOICES = [
  { id: "aunt-annie", name: "Aunt Annie", description: "Warm & Wise" },
  {
    id: "deep-sage",
    name: "Deep Sage",
    description: "Contemplative & Grounded",
  },
  {
    id: "matrix-oracle",
    name: "Matrix Oracle",
    description: "Integrated & Transcendent",
  },
  {
    id: "fire-essence",
    name: "Fire Essence",
    description: "Passionate & Catalytic",
  },
];

// GET - Load user's Oracle preferences
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) throw createError("User not found", 404);

    const { data, error } = await supabase
      .from("oracle_preferences")
      .select("oracle_name, oracle_voice, updated_at")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Failed to fetch Oracle preferences:", error);
      throw createError("Failed to fetch preferences", 500);
    }

    // Return null if no preferences found (user needs onboarding)
    res.json({ preferences: data || null });
  }),
);

// POST - Save Oracle preferences (create or update)
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) throw createError("User not found", 404);

    const { oracle_name, oracle_voice, insight } = req.body;

    // Validation
    if (!oracle_name || typeof oracle_name !== "string") {
      throw createError("Oracle name is required and must be a string", 400);
    }

    if (oracle_name.length > 40) {
      throw createError("Oracle name must be 40 characters or less", 400);
    }

    if (!oracle_voice || typeof oracle_voice !== "string") {
      throw createError("Oracle voice is required", 400);
    }

    // Validate voice option
    const validVoiceIds = AVAILABLE_VOICES.map((v) => v.id);
    if (!validVoiceIds.includes(oracle_voice)) {
      throw createError("Invalid voice selection", 400);
    }

    const trimmedName = oracle_name.trim();
    if (!trimmedName) {
      throw createError("Oracle name cannot be empty", 400);
    }

    try {
      // Upsert Oracle preferences
      const { data, error } = await supabase
        .from("oracle_preferences")
        .upsert({
          user_id: userId,
          oracle_name: trimmedName,
          oracle_voice,
          updated_at: new Date().toISOString(),
        })
        .select("oracle_name, oracle_voice, updated_at")
        .single();

      if (error) {
        logger.error("Failed to save Oracle preferences:", error);
        throw createError("Failed to save preferences", 500);
      }

      // Log Oracle initialization insight if provided
      if (insight && typeof insight === "string" && insight.trim()) {
        try {
          await supabase.from("memory_items").insert({
            user_id: userId,
            title: "Oracle Configuration",
            content: `Named Oracle "${trimmedName}" with ${oracle_voice} voice. Insight: ${insight.trim()}`,
            category: "oracle_setup",
            metadata: {
              oracle_name: trimmedName,
              oracle_voice,
              insight: insight.trim(),
              event_type: "oracle_configured",
            },
            created_at: new Date().toISOString(),
          });
        } catch (memoryError) {
          logger.warn("Failed to save Oracle insight to memory:", memoryError);
          // Don't fail the request if memory logging fails
        }
      }

      logger.info(
        `Oracle preferences saved for user ${userId}: "${trimmedName}" (${oracle_voice})`,
      );

      res.status(201).json({
        message: "Oracle preferences saved successfully",
        preferences: data,
      });
    } catch (error) {
      logger.error("Error in Oracle preferences POST:", error);
      throw error;
    }
  }),
);

// PUT - Update existing Oracle preferences
router.put(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) throw createError("User not found", 404);

    const { oracle_name, oracle_voice } = req.body;

    // Validation (same as POST)
    if (
      !oracle_name ||
      typeof oracle_name !== "string" ||
      oracle_name.length > 40
    ) {
      throw createError("Invalid Oracle name", 400);
    }

    if (!oracle_voice || !AVAILABLE_VOICES.some((v) => v.id === oracle_voice)) {
      throw createError("Invalid voice selection", 400);
    }

    const trimmedName = oracle_name.trim();
    if (!trimmedName) {
      throw createError("Oracle name cannot be empty", 400);
    }

    const { data, error } = await supabase
      .from("oracle_preferences")
      .update({
        oracle_name: trimmedName,
        oracle_voice,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select("oracle_name, oracle_voice, updated_at")
      .single();

    if (error) {
      logger.error("Failed to update Oracle preferences:", error);
      throw createError("Failed to update preferences", 500);
    }

    logger.info(
      `Oracle preferences updated for user ${userId}: "${trimmedName}" (${oracle_voice})`,
    );

    res.json({
      message: "Oracle preferences updated successfully",
      preferences: data,
    });
  }),
);

// DELETE - Reset Oracle preferences
router.delete(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) throw createError("User not found", 404);

    const { error } = await supabase
      .from("oracle_preferences")
      .delete()
      .eq("user_id", userId);

    if (error) {
      logger.error("Failed to delete Oracle preferences:", error);
      throw createError("Failed to reset preferences", 500);
    }

    logger.info(`Oracle preferences reset for user ${userId}`);

    res.json({ message: "Oracle preferences reset successfully" });
  }),
);

export default router;
