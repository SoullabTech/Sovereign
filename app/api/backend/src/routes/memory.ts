// oracle-backend/src/routes/memory.ts

import express from "express";
import { supabase } from "../server";
import { logger } from "../utils/logger";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { authMiddleware } from "../middleware/auth";
import { AuthenticatedRequest, MemoryItem } from "../types";

const router = express.Router();

// Save a new memory
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    const { content, timestamp, metadata } = req.body;

    if (!userId || !content)
      throw createError("Missing user ID or content", 400);

    const { data, error } = await supabase
      .from("oracle_memories")
      .insert([
        {
          client_id: userId,
          content,
          timestamp,
          metadata,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("Failed to save memory:", error);
      throw createError("Error saving memory", 500);
    }

    res.status(201).json({ message: "Memory saved", memory: data });
  }),
);

// Get all memories for the user
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from("oracle_memories")
      .select("*")
      .eq("client_id", userId)
      .order("timestamp", { ascending: false });

    if (error) {
      logger.error("Error fetching memories:", error);
      throw createError("Failed to fetch memories", 500);
    }

    res.json({ memories: data });
  }),
);

// Get a specific memory by ID
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const memoryId = req.params.id;
    const userId = req.user?.id;

    const { data, error } = await supabase
      .from("oracle_memories")
      .select("*")
      .eq("id", memoryId)
      .eq("client_id", userId)
      .single();

    if (error) {
      logger.error("Error fetching memory:", error);
      throw createError("Memory not found", 404);
    }

    res.json({ memory: data });
  }),
);

// Delete a memory
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const memoryId = req.params.id;
    const userId = req.user?.id;

    const { error } = await supabase
      .from("oracle_memories")
      .delete()
      .eq("id", memoryId)
      .eq("client_id", userId);

    if (error) {
      logger.error("Error deleting memory:", error);
      throw createError("Failed to delete memory", 500);
    }

    res.json({ message: "Memory deleted" });
  }),
);

export default router;
