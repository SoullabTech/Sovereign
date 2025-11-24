// backend/src/routes/oraclePreferences.routes.ts

import express from "express";
import { supabase } from "../lib/supabase";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";

const router = express.Router();

// GET - Load user's Oracle preferences
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) throw createError("User not found", 404);

    const { data, error } = await supabase
      .from("oracle_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error("Failed to fetch Oracle preferences:", error);
      throw createError("Failed to fetch preferences", 500);
    }

    // If no preferences found, return null (user needs onboarding)
    res.json({ preferences: data || null });
  }),
);

// POST - Save Oracle preferences
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) throw createError("User not found", 404);

    const { oracle_name, oracle_voice, reflection } = req.body;

    if (!oracle_name || !oracle_voice) {
      throw createError("Oracle name and voice are required", 400);
    }

    // Validate voice option
    const validVoices = ["AuntAnnie", "Mahela", "Jasper", "Orion"];
    if (!validVoices.includes(oracle_voice)) {
      throw createError("Invalid voice selection", 400);
    }

    // Save preferences
    const { data, error } = await supabase
      .from("oracle_preferences")
      .upsert({
        user_id: userId,
        oracle_name: oracle_name.trim(),
        oracle_voice,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error("Failed to save Oracle preferences:", error);
      throw createError("Failed to save preferences", 500);
    }

    // Log the Oracle initialization insight
    if (reflection || oracle_name || oracle_voice) {
      try {
        await supabase.from("memory_items").insert({
          user_id: userId,
          title: "Oracle Initialized",
          content: `Oracle named "${oracle_name}" with ${oracle_voice} voice.${reflection ? ` Reflection: ${reflection}` : ""}`,
          category: "initialization",
          metadata: {
            oracle_name,
            oracle_voice,
            reflection: reflection || null,
            event_type: "oracle_creation",
          },
          created_at: new Date().toISOString(),
        });
      } catch (memoryError) {
        logger.warn("Failed to log Oracle initialization memory:", memoryError);
        // Don't fail the request if memory logging fails
      }
    }

    logger.info(
      `Oracle preferences saved for user ${userId}: ${oracle_name} (${oracle_voice})`,
    );
    res.status(201).json({
      message: "Oracle preferences saved successfully",
      preferences: data,
    });
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

    if (!oracle_name || !oracle_voice) {
      throw createError("Oracle name and voice are required", 400);
    }

    const validVoices = ["AuntAnnie", "Mahela", "Jasper", "Orion"];
    if (!validVoices.includes(oracle_voice)) {
      throw createError("Invalid voice selection", 400);
    }

    const { data, error } = await supabase
      .from("oracle_preferences")
      .update({
        oracle_name: oracle_name.trim(),
        oracle_voice,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      logger.error("Failed to update Oracle preferences:", error);
      throw createError("Failed to update preferences", 500);
    }

    logger.info(
      `Oracle preferences updated for user ${userId}: ${oracle_name} (${oracle_voice})`,
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
