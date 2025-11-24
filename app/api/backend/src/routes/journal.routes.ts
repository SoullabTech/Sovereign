// src/routes/journal.routes.ts
import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { triggerDailyJournalFlow } from "../services/prefectService"; // Import Prefect Service

const router = Router();

// POST /api/journal
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { journalEntry } = req.body; // User journal entry

    if (!journalEntry || !userId) {
      return res
        .status(400)
        .json({ error: "Missing journal entry or user ID" });
    }

    // Trigger the Prefect flow to process the journal entry
    const prefectResponse = await triggerDailyJournalFlow(userId, journalEntry);

    res.status(200).json({ success: true, prefectResponse });
  } catch (error) {
    res.status(500).json({ error: "Failed to process journal entry" });
  }
});

export default router;
