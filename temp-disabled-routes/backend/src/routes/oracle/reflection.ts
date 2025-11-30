// oracle-backend/routes/oracle/reflection.ts
import express from "express";
import { supabase } from "../../lib/supabaseClient";

const router = express.Router();

router.post("/reflection", async (req, res) => {
  const {
    userId,
    content,
    element = "aether",
    source = "Oralia",
    tags = [],
  } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { error } = await supabase.from("oracle_memories").insert([
    {
      user_id: userId,
      type: "reflection",
      content,
      element,
      source,
      tags,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ status: "reflection saved" });
});

router.post("/ritual", async (req, res) => {
  const {
    userId,
    content,
    element = "fire",
    source = "Oralia",
    tags = [],
  } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { error } = await supabase.from("oracle_memories").insert([
    {
      user_id: userId,
      type: "ritual",
      content,
      element,
      source,
      tags,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ status: "ritual saved" });
});

router.post("/recommendation", async (req, res) => {
  const {
    userId,
    content,
    element = "air",
    source = "Oralia",
    tags = [],
  } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { error } = await supabase.from("oracle_memories").insert([
    {
      user_id: userId,
      type: "recommendation",
      content,
      element,
      source,
      tags,
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ status: "recommendation saved" });
});

router.post("/memory-import", async (req, res) => {
  const { userId, memories } = req.body;

  if (!userId || !Array.isArray(memories)) {
    return res.status(400).json({ error: "Missing userId or memories array" });
  }

  const payload = memories.map((m) => ({
    user_id: userId,
    type: m.type,
    content: m.content,
    element: m.element || null,
    source: m.source || "Oralia",
    tags: m.tags || [],
  }));

  const { error } = await supabase.from("oracle_memories").insert(payload);

  if (error) return res.status(500).json({ error: error.message });
  return res
    .status(200)
    .json({ status: "memories imported", count: payload.length });
});

router.get("/timeline/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  const { data, error } = await supabase
    .from("oracle_memories")
    .select("id, user_id, type, content, element, source, tags, timestamp")
    .eq("user_id", userId)
    .order("timestamp", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ memories: data });
});

router.get("/timeline-tags/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" });
  }

  const { data, error } = await supabase
    .from("oracle_memories")
    .select("tags")
    .eq("user_id", userId);

  if (error) return res.status(500).json({ error: error.message });

  const allTags = data.flatMap((row) => row.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});

  return res.status(200).json({ tags: tagCounts });
});

export default router;
