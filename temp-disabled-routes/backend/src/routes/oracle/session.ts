import express from "express";
import { supabase } from "../../lib/supabaseClient";
const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, tone, archetype } = req.body;

  const { error } = await supabase
    .from("oracle_sessions")
    .upsert([{ user_id: userId, tone, archetype }], {
      onConflict: ["user_id"],
    });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ status: "saved" });
});

export default router;
