// src/routes/profileSettings.routes.ts

import { Router } from "express";
import { z } from "zod";
import { authenticateToken } from "../middleware/authenticateToken";
import type { AuthenticatedRequest } from "../types";
import { supabase } from "../lib/supabaseClient";

const router = Router();

// Zod schema for settings
const settingsSchema = z.object({
  personal_guide_name: z.string().min(2).max(100),
  voice_id: z.string().min(10),
  guide_gender: z.enum(["male", "female", "nonbinary"]),
  guide_language: z.string().min(2).max(10),
});

// PUT /api/profile/settings
router.put("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const parseResult = settingsSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Invalid profile settings",
      details: parseResult.error.format(),
    });
  }

  const { personal_guide_name, voice_id, guide_gender, guide_language } =
    parseResult.data;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({
        personal_guide_name,
        voice_id,
        guide_gender,
        guide_language,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error || !data) {
      return res
        .status(500)
        .json({ error: "Failed to update profile settings" });
    }

    return res.status(200).json({ success: true, profile: data });
  } catch (err) {
    console.error("[Profile Settings] Update error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
