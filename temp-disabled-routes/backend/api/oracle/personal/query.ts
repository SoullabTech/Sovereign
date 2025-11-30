// src/api/oracle/personal/query.ts

import express from "express";
import { personalOracle } from "@/agents/personalOracleAgent";

const router = express.Router();

// POST /api/oracle/personal/query
router.post("/", async (req, res) => {
  const { userId, input, context } = req.body;

  if (!userId || !input) {
    return res
      .status(400)
      .json({ error: "Missing userId or input in request body" });
  }

  try {
    const response = await personalOracle.process({ userId, input, context });
    return res.json(response);
  } catch (err) {
    console.error("[Query Route Error]", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
