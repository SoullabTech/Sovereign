import { Router } from "express";
import { supabase } from "../lib/supabaseClient";

const router = Router();

router.get("/profile", async (req, res) => {
  const userId = req.headers["x-user-id"]; // you’ll adapt this per auth
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  const { data, error } = await supabase
    .from("profiles")
    .select("assignedGuide, spiralPhase, name")
    .eq("id", userId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

export default router;
