// 📁 File: src/routes/fieldpulse.routes.ts

import express from "express";
import summarizeCollectiveField from "../services/summarizeCollectiveField";

const router = express.Router();

// Endpoint to get today's summary
router.get("/today", async (req, res) => {
  try {
    const summary = await summarizeCollectiveField();
    res.json(summary);
  } catch (error) {
    console.error("[FieldPulse] Error fetching field summary:", error);
    res.status(500).json({ error: "Failed to generate field summary" });
  }
});

export default router;
