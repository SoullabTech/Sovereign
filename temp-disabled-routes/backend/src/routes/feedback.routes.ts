// src/routes/feedback.routes.ts

import { Router } from "express";
import * as memoryModule from "../core/utils/memoryModule";
import { storeMemoryItem } from "../services/memoryService";

const router = Router();

/**
 * POST /api/feedback
 * Body: { userId: string; messageId: string; rating: number; comments?: string }
 * Records user feedback and logs it into memory for adaptive routing.
 */
router.post("/", async (req, res) => {
  try {
    const { userId, messageId, rating, comments } = req.body as {
      userId: string;
      messageId: string;
      rating: number;
      comments?: string;
    };

    // Create a feedback memory item
    const feedbackItem = {
      id: `${userId}-${Date.now()}-feedback`,
      content: comments || `Rating: ${rating}`,
      timestamp: Date.now(),
      clientId: userId,
      metadata: {
        role: "feedback",
        originalMessageId: messageId,
        rating,
        comments,
      },
    };

    // Log in in-memory store
    memoryModule.addEntry(feedbackItem);

    // Persist via memoryService
    await storeMemoryItem({
      content: feedbackItem.content,
      element: "feedback",
      sourceAgent: "feedback-endpoint",
      clientId: userId,
      confidence: 1,
      metadata: feedbackItem.metadata,
    });

    res.json({ success: true });
  } catch (err: any) {
    console.error("❌ /api/feedback", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to record feedback" });
  }
});

export default router;
