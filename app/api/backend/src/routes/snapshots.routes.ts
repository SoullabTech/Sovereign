import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

// POST /api/snapshots - Save user state snapshot
router.post("/", async (req, res) => {
  try {
    const { userId, timestamp, elemental, holoflowerState } = req.body;

    if (!userId || !timestamp) {
      return res
        .status(400)
        .json({ error: "Missing required fields: userId, timestamp" });
    }

    const { data, error } = await supabase
      .from("user_snapshots")
      .insert([
        {
          user_id: userId,
          timestamp,
          elemental_state: elemental,
          holoflower_state: holoflowerState,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error saving snapshot:", error);
      return res.status(500).json({ error: "Failed to save snapshot" });
    }

    res.json({ message: "Snapshot saved successfully", data });
  } catch (error) {
    console.error("Snapshot route error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/snapshots/:userId - Get user snapshots
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from("user_snapshots")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error("Error fetching snapshots:", error);
      return res.status(500).json({ error: "Failed to fetch snapshots" });
    }

    res.json({ snapshots: data });
  } catch (error) {
    console.error("Snapshot fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
