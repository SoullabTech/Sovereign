// 📄 oracle-backend/src/routes/memory.routes.ts

import express from "express";
import { z } from "zod";
import { memoryService } from "../services/memoryService";
import { asyncHandler } from "../middleware/errorHandler";
import { AuthenticatedRequest } from "../types";

const router = express.Router();

// ─────────────────────────────────────────
// 📑 Zod Schemas
const MemorySchema = z.object({
  content: z.string().min(1),
  element: z.string().optional(),
  sourceAgent: z.string().optional(),
  confidence: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
});

const DeleteSchema = z.object({
  id: z.string(),
});

// ─────────────────────────────────────────
// 📥 POST /api/oracle/memory → Store a memory
router.post(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parse = MemorySchema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ error: parse.error.format() });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const memory = await memoryService.store(
      userId,
      parse.data.content,
      parse.data.element,
      parse.data.sourceAgent,
      parse.data.confidence,
      parse.data.metadata,
    );
    res.status(200).json({ memory });
  }),
);

// 📤 GET /api/oracle/memory → Get all user memories
router.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const memories = await memoryService.recall(userId);
    res.status(200).json({ memories });
  }),
);

// 📝 PUT /api/oracle/memory → Update memory
router.put(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parse = UpdateSchema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ error: parse.error.format() });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const updated = await memoryService.update(
      parse.data.id,
      parse.data.content,
      userId,
    );
    res.status(200).json({ updated });
  }),
);

// ❌ DELETE /api/oracle/memory → Delete memory
router.delete(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const parse = DeleteSchema.safeParse(req.body);
    if (!parse.success)
      return res.status(400).json({ error: parse.error.format() });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const success = await memoryService.delete(parse.data.id, userId);
    res.status(success ? 200 : 404).json({ success });
  }),
);

// 📊 GET /api/oracle/memory/insights → Get memory usage insights
router.get(
  "/insights",
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthenticated" });

    const insights = await memoryService.getMemoryInsights(userId);
    res.status(200).json({ insights });
  }),
);

export default router;
