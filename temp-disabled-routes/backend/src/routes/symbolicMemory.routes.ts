import { Router } from "express";
import memoryModule from "../core/utils/memoryModule";
import { authenticateToken } from "../middleware/authenticateToken";
import type { AuthenticatedRequest } from "../types";

const router = Router();

// POST /symbolic-tags
router.post("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const { symbol, agent, metadata } = req.body;

  if (!symbol || !agent) {
    return res.status(400).json({ error: "Missing symbol or agent" });
  }

  try {
    await memoryModule.storeTag({ userId, symbol, agent, metadata });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error storing tag:", err);
    res.status(500).json({ error: "Failed to store tag" });
  }
});

// GET /symbolic-tags
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const tags = await memoryModule.getAllSymbolicTags(req.user!.id);
    res.json({ tags });
  } catch (err) {
    console.error("❌ Error fetching tags:", err);
    res.status(500).json({ error: "Failed to retrieve symbolic tags" });
  }
});

export default router;
